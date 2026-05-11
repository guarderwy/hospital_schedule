import pool from '../utils/db';
import type { FixedShiftAssignment, Schedule, StaffRequest } from '../types';

const SHIFT_P = 'P';
const SHIFT_N = 'N';
const SHIFT_REST = '休';
const SHIFT_PRN = '休prn';
const SHIFT_A1 = 'A1';
const SHIFT_A2 = 'A2';
const SHIFT_ASSIST = '助夜';
const SHIFT_EMPTY = '/';

interface RestRequestRange {
  staff_id: number;
  start_day: number;
  end_day: number;
  request_type: string;
}

interface FixedShiftMap {
  [day: number]: string;
}

interface StaffState {
  staff_id: number;
  currentShift: string;
  nextForcedShift: string | null;
  daysAfterN: number | null;
  fixedShifts: FixedShiftMap;
  restRanges: RestRequestRange[];
  generated: string[];
}

function canonicalShift(shift: string): string {
  const normalized = (shift || '').trim();

  if (
    normalized === '休（prn）' ||
    normalized === '休(prn)' ||
    normalized === '休prn'
  ) {
    return SHIFT_PRN;
  }

  if (normalized === '休') {
    return SHIFT_REST;
  }

  if (normalized === '助夜') {
    return SHIFT_ASSIST;
  }

  if (normalized === SHIFT_EMPTY || normalized === '' || normalized === '出科') {
    return SHIFT_EMPTY;
  }

  if (
    normalized === 'A1' ||
    normalized === 'A2' ||
    normalized === SHIFT_P ||
    normalized === SHIFT_N
  ) {
    return normalized;
  }

  if (
    normalized === '正1+2' ||
    normalized === '正(中)' ||
    normalized === '正(医)' ||
    normalized === '正(服)' ||
    normalized === '正(医+服)' ||
    normalized === '医嘱' ||
    normalized === '服药'
  ) {
    return 'DAY';
  }

  return normalized;
}

function isWeekend(day: number): boolean {
  return day === 6 || day === 7;
}

function getDayOfWeek(date: Date, weekStart: string): number {
  const weekStartDate = new Date(weekStart);
  weekStartDate.setHours(0, 0, 0, 0);
  const current = new Date(date);
  current.setHours(0, 0, 0, 0);
  const diffMs = current.getTime() - weekStartDate.getTime();
  return Math.floor(diffMs / (24 * 60 * 60 * 1000)) + 1;
}

function buildRestRanges(restRequests: StaffRequest[], nextWeekStart: string): RestRequestRange[] {
  const result: RestRequestRange[] = [];

  for (const request of restRequests) {
    if (request.end_date) {
      const endDay = getDayOfWeek(new Date(request.end_date), nextWeekStart);
      result.push({
        staff_id: request.staff_id,
        start_day: request.week_day,
        end_day: Math.max(request.week_day, Math.min(7, endDay)),
        request_type: request.request_type,
      });
      continue;
    }

    const totalDays = Math.max(request.total_days || 1, 1);
    result.push({
      staff_id: request.staff_id,
      start_day: request.week_day,
      end_day: Math.min(7, request.week_day + totalDays - 1),
      request_type: request.request_type,
    });
  }

  return result;
}

function buildFixedShiftMap(fixedShifts: FixedShiftAssignment[], nextWeekStart: string): Record<number, FixedShiftMap> {
  const result: Record<number, FixedShiftMap> = {};

  for (const fixed of fixedShifts) {
    const weekDay = getDayOfWeek(new Date(fixed.assign_date), nextWeekStart);
    if (weekDay < 1 || weekDay > 7) {
      continue;
    }

    if (!result[fixed.staff_id]) {
      result[fixed.staff_id] = {};
    }

    result[fixed.staff_id][weekDay] = canonicalShift(fixed.shift_type);
  }

  return result;
}

function inferInitialState(staffId: number, previousWeek: Schedule[], fixedShifts: FixedShiftMap, restRanges: RestRequestRange[]): StaffState {
  const sorted = [...previousWeek].sort((a, b) => a.week_day - b.week_day);
  const lastMeaningful = [...sorted]
    .reverse()
    .map((item) => canonicalShift(item.shift_type))
    .find((shift) => shift !== SHIFT_EMPTY);

  let nextForcedShift: string | null = null;
  let daysAfterN: number | null = null;

  if (lastMeaningful === SHIFT_P) {
    nextForcedShift = SHIFT_N;
  } else {
    const lastN = [...sorted].reverse().find((item) => canonicalShift(item.shift_type) === SHIFT_N);
    if (lastN) {
      daysAfterN = 7 - lastN.week_day + 1;
    }
  }

  return {
    staff_id: staffId,
    currentShift: lastMeaningful || SHIFT_EMPTY,
    nextForcedShift,
    daysAfterN,
    fixedShifts,
    restRanges,
    generated: [],
  };
}

function isRestRequested(state: StaffState, day: number): string | null {
  const request = state.restRanges.find((item) => day >= item.start_day && day <= item.end_day);
  if (!request) {
    return null;
  }

  return request.request_type === 'prn' ? SHIFT_PRN : SHIFT_REST;
}

function canBeP(state: StaffState, day: number): boolean {
  if (state.nextForcedShift) {
    return false;
  }

  if (state.fixedShifts[day] && state.fixedShifts[day] !== SHIFT_P) {
    return false;
  }

  if (isRestRequested(state, day)) {
    return false;
  }

  if (state.daysAfterN !== null && state.daysAfterN < 4) {
    return false;
  }

  const tomorrowFixed = state.fixedShifts[day + 1];
  if (tomorrowFixed && tomorrowFixed !== SHIFT_N) {
    return false;
  }

  const tomorrowRest = isRestRequested(state, day + 1);
  if (tomorrowRest) {
    return false;
  }

  return true;
}

function canBeN(state: StaffState, day: number): boolean {
  if (state.fixedShifts[day] && state.fixedShifts[day] !== SHIFT_N) {
    return false;
  }

  if (isRestRequested(state, day)) {
    return false;
  }

  if (state.nextForcedShift && state.nextForcedShift !== SHIFT_N) {
    return false;
  }

  return state.nextForcedShift === SHIFT_N || canBeP(state, day - 1);
}

function canTakeSupportShift(state: StaffState, day: number, shift: string): boolean {
  const fixedShift = state.fixedShifts[day];
  if (fixedShift) {
    return fixedShift === shift;
  }

  const requested = isRestRequested(state, day);
  if (requested) {
    return requested === shift;
  }

  if (state.nextForcedShift === SHIFT_N) {
    return shift === SHIFT_N;
  }

  if (state.daysAfterN === 1) {
    return shift === SHIFT_REST;
  }

  if (state.daysAfterN === 2) {
    return shift === SHIFT_REST || shift === SHIFT_PRN;
  }

  if (state.daysAfterN === 3) {
    if (shift === SHIFT_ASSIST) {
      return !isWeekend(day);
    }
    return shift === SHIFT_REST || shift === SHIFT_PRN || shift === SHIFT_A1 || shift === SHIFT_A2;
  }

  if (shift === SHIFT_ASSIST) {
    return !isWeekend(day);
  }

  return shift === SHIFT_REST || shift === SHIFT_PRN || shift === SHIFT_A1 || shift === SHIFT_A2;
}

function defaultShiftForState(state: StaffState, day: number): string {
  if (state.nextForcedShift === SHIFT_N) {
    return SHIFT_N;
  }

  const fixedShift = state.fixedShifts[day];
  if (fixedShift) {
    return fixedShift;
  }

  const requested = isRestRequested(state, day);
  if (requested) {
    return requested;
  }

  if (state.daysAfterN === 1) {
    return SHIFT_REST;
  }

  if (state.daysAfterN === 2) {
    return SHIFT_PRN;
  }

  if (state.daysAfterN === 3) {
    return SHIFT_A1;
  }

  return SHIFT_A2;
}

function chooseSupportShift(state: StaffState, day: number, preferred: string[]): string {
  for (const shift of preferred) {
    if (canTakeSupportShift(state, day, shift)) {
      return shift;
    }
  }

  const fallbackOrder = [SHIFT_A1, SHIFT_A2, SHIFT_ASSIST, SHIFT_PRN, SHIFT_REST];
  for (const shift of fallbackOrder) {
    if (canTakeSupportShift(state, day, shift)) {
      return shift;
    }
  }

  return defaultShiftForState(state, day);
}

function updateStateAfterAssignment(state: StaffState, assignedShift: string): void {
  state.currentShift = assignedShift;
  state.generated.push(assignedShift);

  if (assignedShift === SHIFT_P) {
    state.nextForcedShift = SHIFT_N;
    state.daysAfterN = null;
    return;
  }

  if (assignedShift === SHIFT_N) {
    state.nextForcedShift = null;
    state.daysAfterN = 1;
    return;
  }

  state.nextForcedShift = null;

  if (state.daysAfterN !== null) {
    state.daysAfterN += 1;
    if (state.daysAfterN > 4) {
      state.daysAfterN = 4;
    }
  }
}

function pickPStaff(states: StaffState[], day: number): StaffState | undefined {
  const fixed = states.find((state) => state.fixedShifts[day] === SHIFT_P);
  if (fixed && canBeP(fixed, day)) {
    return fixed;
  }

  return states
    .filter((state) => canBeP(state, day))
    .sort((a, b) => {
      const aScore = a.daysAfterN ?? 99;
      const bScore = b.daysAfterN ?? 99;
      return bScore - aScore;
    })[0];
}

function pickNStaff(states: StaffState[], day: number, pStaffId: number | null): StaffState | undefined {
  const fixed = states.find((state) => state.staff_id !== pStaffId && state.fixedShifts[day] === SHIFT_N);
  if (fixed && canBeN(fixed, day)) {
    return fixed;
  }

  const forced = states.find((state) => state.staff_id !== pStaffId && state.nextForcedShift === SHIFT_N && canBeN(state, day));
  if (forced) {
    return forced;
  }

  return states.find((state) => state.staff_id !== pStaffId && canBeN(state, day));
}

function fillSupportShifts(assignments: Map<number, string>, states: StaffState[], day: number): void {
  const unassigned = states.filter((state) => !assignments.has(state.staff_id));

  const needAssist = !isWeekend(day);
  let hasA1 = [...assignments.values()].includes(SHIFT_A1);
  let hasA2 = [...assignments.values()].includes(SHIFT_A2);
  let hasAssist = [...assignments.values()].includes(SHIFT_ASSIST);

  for (const state of unassigned) {
    if (state.fixedShifts[day]) {
      assignments.set(state.staff_id, state.fixedShifts[day]);
      hasA1 ||= state.fixedShifts[day] === SHIFT_A1;
      hasA2 ||= state.fixedShifts[day] === SHIFT_A2;
      hasAssist ||= state.fixedShifts[day] === SHIFT_ASSIST;
      continue;
    }

    const requested = isRestRequested(state, day);
    if (requested) {
      assignments.set(state.staff_id, requested);
      continue;
    }

    if (!hasA1 && canTakeSupportShift(state, day, SHIFT_A1)) {
      assignments.set(state.staff_id, SHIFT_A1);
      hasA1 = true;
      continue;
    }

    if (!hasA2 && canTakeSupportShift(state, day, SHIFT_A2)) {
      assignments.set(state.staff_id, SHIFT_A2);
      hasA2 = true;
      continue;
    }

    if (needAssist && !hasAssist && canTakeSupportShift(state, day, SHIFT_ASSIST)) {
      assignments.set(state.staff_id, SHIFT_ASSIST);
      hasAssist = true;
      continue;
    }

    assignments.set(
      state.staff_id,
      chooseSupportShift(
        state,
        day,
        isWeekend(day) ? [SHIFT_A2, SHIFT_A1, SHIFT_PRN, SHIFT_REST] : [SHIFT_ASSIST, SHIFT_A1, SHIFT_A2, SHIFT_PRN, SHIFT_REST],
      ),
    );
  }
}

export async function generateNightSchedule(
  prevWeekStart: string,
  nextWeekStart: string,
  nightTeamIds: number[],
): Promise<Partial<Schedule>[]> {
  if (!nightTeamIds.length) {
    return [];
  }

  const [prevRows] = await pool.query(
    'SELECT * FROM schedule WHERE week_start = ? AND staff_id IN (?) ORDER BY staff_id, week_day',
    [prevWeekStart, nightTeamIds],
  );

  const [requestRows] = await pool.query(
    'SELECT * FROM staff_request WHERE week_start = ? AND staff_id IN (?) AND status = ?',
    [nextWeekStart, nightTeamIds, 'approved'],
  );

  const [fixedRows] = await pool.query(
    'SELECT * FROM fixed_shift_assignment WHERE staff_id IN (?) AND assign_date >= ? AND assign_date < DATE_ADD(?, INTERVAL 7 DAY)',
    [nightTeamIds, nextWeekStart, nextWeekStart],
  );

  const previousSchedules = prevRows as Schedule[];
  const restRequests = requestRows as StaffRequest[];
  const fixedShifts = fixedRows as FixedShiftAssignment[];

  const restRanges = buildRestRanges(restRequests, nextWeekStart);
  const fixedShiftMap = buildFixedShiftMap(fixedShifts, nextWeekStart);

  const states = nightTeamIds.map((staffId) =>
    inferInitialState(
      staffId,
      previousSchedules.filter((item) => item.staff_id === staffId),
      fixedShiftMap[staffId] || {},
      restRanges.filter((item) => item.staff_id === staffId),
    ),
  );

  for (let day = 1; day <= 7; day++) {
    const assignments = new Map<number, string>();

    const pStaff = pickPStaff(states, day);
    if (pStaff) {
      assignments.set(pStaff.staff_id, SHIFT_P);
    }

    const nStaff = pickNStaff(states, day, pStaff?.staff_id ?? null);
    if (nStaff) {
      assignments.set(nStaff.staff_id, SHIFT_N);
    }

    fillSupportShifts(assignments, states, day);

    for (const state of states) {
      const assigned = assignments.get(state.staff_id) || defaultShiftForState(state, day);
      updateStateAfterAssignment(state, assigned);
    }
  }

  const result: Partial<Schedule>[] = [];
  for (const state of states) {
    for (let day = 1; day <= 7; day++) {
      result.push({
        staff_id: state.staff_id,
        week_start: nextWeekStart,
        week_day: day,
        shift_type: state.generated[day - 1],
        is_generated: true,
        is_edited: false,
      });
    }
  }

  return result;
}

export async function copyWeekSchedule(
  fromWeekStart: string,
  toWeekStart: string,
): Promise<Partial<Schedule>[]> {
  const [rows] = await pool.query(
    'SELECT staff_id, week_day, shift_type, is_generated FROM schedule WHERE week_start = ?',
    [fromWeekStart],
  );

  return (rows as Schedule[]).map((row) => ({
    staff_id: row.staff_id,
    week_start: toWeekStart,
    week_day: row.week_day,
    shift_type: row.shift_type,
    is_generated: row.is_generated,
    is_edited: false,
  }));
}
