import type { StaffRequest } from '../types';

export interface ValidationError {
  rule: string;
  message: string;
  staffId?: number;
  weekDay?: number;
}

export interface ScheduleItem {
  staff_id: number;
  week_day: number;
  shift_type: string;
  staff_name?: string;
  is_night_team?: boolean;
}

const SHIFT_P = 'P';
const SHIFT_N = 'N';
const SHIFT_REST = '休';
const SHIFT_PRN = '休prn';
const SHIFT_A1 = 'A1';
const SHIFT_A2 = 'A2';
const SHIFT_ASSIST = '助夜';

const FLEX_DAY_SHIFTS = new Set([SHIFT_A1, SHIFT_A2, SHIFT_ASSIST]);
const REST_LIKE_SHIFTS = new Set([SHIFT_REST, SHIFT_PRN]);

function normalizeShift(shift: string): string {
  return (shift || '').trim();
}

function isWeekend(day: number): boolean {
  return day === 6 || day === 7;
}

function hasShift(daySchedules: ScheduleItem[], shift: string): boolean {
  return daySchedules.some((item) => normalizeShift(item.shift_type) === shift);
}

function countShift(daySchedules: ScheduleItem[], shift: string): number {
  return daySchedules.filter((item) => normalizeShift(item.shift_type) === shift).length;
}

function isAllowedNightTransition(previous: string, current: string): boolean {
  if (previous === SHIFT_P) {
    return current === SHIFT_N;
  }

  if (previous === SHIFT_N) {
    return current === SHIFT_REST;
  }

  if (previous === SHIFT_REST) {
    return current === SHIFT_REST
      || current === SHIFT_PRN
      || current === SHIFT_A1
      || current === SHIFT_A2
      || current === SHIFT_P;
  }

  if (previous === SHIFT_PRN) {
    return current === SHIFT_PRN
      || current === SHIFT_REST
      || current === SHIFT_A1
      || current === SHIFT_A2
      || current === SHIFT_ASSIST
      || current === SHIFT_P;
  }

  if (FLEX_DAY_SHIFTS.has(previous)) {
    return current === SHIFT_A1
      || current === SHIFT_A2
      || current === SHIFT_ASSIST
      || current === SHIFT_REST
      || current === SHIFT_PRN
      || current === SHIFT_P;
  }

  return true;
}

function validateRestRequests(
  schedules: ScheduleItem[],
  restRequests: StaffRequest[],
  errors: ValidationError[],
): void {
  for (const request of restRequests) {
    const matched = schedules.filter((item) => item.staff_id === request.staff_id);
    if (matched.length === 0) {
      continue;
    }

    const startDay = request.week_day;
    const totalDays = Math.max(request.total_days || 1, 1);
    const endDay = Math.min(7, startDay + totalDays - 1);

    for (let day = startDay; day <= endDay; day++) {
      const scheduleItem = matched.find((item) => item.week_day === day);
      if (!scheduleItem) {
        continue;
      }

      const shift = normalizeShift(scheduleItem.shift_type);
      const expected = request.request_type === 'prn' ? SHIFT_PRN : SHIFT_REST;

      if (request.request_type === 'rest' && shift !== SHIFT_REST) {
        errors.push({
          rule: 'RULE_4',
          message: `员工 ${scheduleItem.staff_name || `ID ${request.staff_id}`} 在周${day}申请休息，但实际班次为 ${shift}`,
          staffId: request.staff_id,
          weekDay: day,
        });
      }

      if (request.request_type === 'prn' && shift !== SHIFT_PRN) {
        errors.push({
          rule: 'RULE_4',
          message: `员工 ${scheduleItem.staff_name || `ID ${request.staff_id}`} 在周${day}申请休prn，但实际班次为 ${shift}`,
          staffId: request.staff_id,
          weekDay: day,
        });
      }

      if (request.request_type === 'other' && shift !== expected && !REST_LIKE_SHIFTS.has(shift)) {
        errors.push({
          rule: 'RULE_4',
          message: `员工 ${scheduleItem.staff_name || `ID ${request.staff_id}`} 在周${day}有请假申请，但实际班次为 ${shift}`,
          staffId: request.staff_id,
          weekDay: day,
        });
      }
    }
  }
}

export function validateSchedule(
  schedules: ScheduleItem[],
  restRequests: StaffRequest[] = [],
): ValidationError[] {
  const errors: ValidationError[] = [];
  const byDay: Record<number, ScheduleItem[]> = {};
  const byStaff: Record<number, ScheduleItem[]> = {};

  for (const item of schedules) {
    if (!byDay[item.week_day]) {
      byDay[item.week_day] = [];
    }
    byDay[item.week_day].push(item);

    if (!byStaff[item.staff_id]) {
      byStaff[item.staff_id] = [];
    }
    byStaff[item.staff_id].push(item);
  }

  for (let day = 1; day <= 7; day++) {
    const daySchedules = byDay[day] || [];

    const pCount = countShift(daySchedules, SHIFT_P);
    const nCount = countShift(daySchedules, SHIFT_N);
    const a1Count = countShift(daySchedules, SHIFT_A1);
    const a2Count = countShift(daySchedules, SHIFT_A2);
    const assistCount = countShift(daySchedules, SHIFT_ASSIST);

    if (pCount === 0) {
      errors.push({ rule: 'RULE_1', message: `周${day}缺少 P 班`, weekDay: day });
    }
    if (nCount === 0) {
      errors.push({ rule: 'RULE_1', message: `周${day}缺少 N 班`, weekDay: day });
    }
    if (pCount > 1) {
      errors.push({ rule: 'RULE_1', message: `周${day}存在 ${pCount} 个 P 班，应只有 1 个`, weekDay: day });
    }
    if (nCount > 1) {
      errors.push({ rule: 'RULE_1', message: `周${day}存在 ${nCount} 个 N 班，应只有 1 个`, weekDay: day });
    }
    if (a1Count === 0) {
      errors.push({ rule: 'RULE_1', message: `周${day}缺少 A1 班`, weekDay: day });
    }
    if (a2Count === 0) {
      errors.push({ rule: 'RULE_1', message: `周${day}缺少 A2 班`, weekDay: day });
    }

    if (isWeekend(day)) {
      if (assistCount > 0) {
        errors.push({ rule: 'RULE_2', message: `周${day}不能安排助夜`, weekDay: day });
      }
    } else if (assistCount === 0) {
      errors.push({ rule: 'RULE_1', message: `周${day}缺少助夜`, weekDay: day });
    }
  }

  for (const [staffIdText, staffSchedules] of Object.entries(byStaff)) {
    const staffId = Number(staffIdText);
    const sorted = [...staffSchedules].sort((a, b) => a.week_day - b.week_day);

    const dayCount: Record<number, number> = {};
    for (const item of sorted) {
      dayCount[item.week_day] = (dayCount[item.week_day] || 0) + 1;
    }

    for (const [weekDayText, count] of Object.entries(dayCount)) {
      if (count > 1) {
        errors.push({
          rule: 'RULE_5',
          message: `员工 ID ${staffId} 在周${weekDayText} 存在 ${count} 个班次`,
          staffId,
          weekDay: Number(weekDayText),
        });
      }
    }

    if (!sorted[0]?.is_night_team) {
      continue;
    }

    for (let index = 1; index < sorted.length; index++) {
      const previous = normalizeShift(sorted[index - 1].shift_type);
      const current = normalizeShift(sorted[index].shift_type);

      if (sorted[index].week_day - sorted[index - 1].week_day !== 1) {
        continue;
      }

      if (!isAllowedNightTransition(previous, current)) {
        errors.push({
          rule: 'RULE_3',
          message: `员工 ${sorted[index].staff_name || `ID ${staffId}`} 在周${sorted[index - 1].week_day} 的 ${previous} 后，不应直接排 ${current}`,
          staffId,
          weekDay: sorted[index].week_day,
        });
      }
    }
  }

  validateRestRequests(schedules, restRequests, errors);

  return errors;
}
