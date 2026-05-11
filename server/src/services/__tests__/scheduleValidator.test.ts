import { describe, expect, it } from 'vitest';
import { validateSchedule, type ScheduleItem } from '../scheduleValidator';

describe('validateSchedule', () => {
  it('accepts a valid week with full required coverage', () => {
    const schedules: ScheduleItem[] = [
      { staff_id: 1, week_day: 1, shift_type: 'P', is_night_team: true, staff_name: 'A' },
      { staff_id: 1, week_day: 2, shift_type: 'N', is_night_team: true, staff_name: 'A' },
      { staff_id: 1, week_day: 3, shift_type: '休', is_night_team: true, staff_name: 'A' },
      { staff_id: 1, week_day: 4, shift_type: '休prn', is_night_team: true, staff_name: 'A' },
      { staff_id: 1, week_day: 5, shift_type: 'A1', is_night_team: true, staff_name: 'A' },
      { staff_id: 1, week_day: 6, shift_type: 'A2', is_night_team: true, staff_name: 'A' },
      { staff_id: 1, week_day: 7, shift_type: 'P', is_night_team: true, staff_name: 'A' },

      { staff_id: 2, week_day: 1, shift_type: 'N', is_night_team: true, staff_name: 'B' },
      { staff_id: 2, week_day: 2, shift_type: '休', is_night_team: true, staff_name: 'B' },
      { staff_id: 2, week_day: 3, shift_type: '休prn', is_night_team: true, staff_name: 'B' },
      { staff_id: 2, week_day: 4, shift_type: 'A1', is_night_team: true, staff_name: 'B' },
      { staff_id: 2, week_day: 5, shift_type: 'A2', is_night_team: true, staff_name: 'B' },
      { staff_id: 2, week_day: 6, shift_type: 'P', is_night_team: true, staff_name: 'B' },
      { staff_id: 2, week_day: 7, shift_type: 'N', is_night_team: true, staff_name: 'B' },

      { staff_id: 3, week_day: 1, shift_type: 'A1', is_night_team: true, staff_name: 'C' },
      { staff_id: 3, week_day: 2, shift_type: '休prn', is_night_team: true, staff_name: 'C' },
      { staff_id: 3, week_day: 3, shift_type: 'A1', is_night_team: true, staff_name: 'C' },
      { staff_id: 3, week_day: 4, shift_type: 'A2', is_night_team: true, staff_name: 'C' },
      { staff_id: 3, week_day: 5, shift_type: 'P', is_night_team: true, staff_name: 'C' },
      { staff_id: 3, week_day: 6, shift_type: 'N', is_night_team: true, staff_name: 'C' },
      { staff_id: 3, week_day: 7, shift_type: '休', is_night_team: true, staff_name: 'C' },

      { staff_id: 4, week_day: 1, shift_type: '休prn', is_night_team: true, staff_name: 'D' },
      { staff_id: 4, week_day: 2, shift_type: 'A1', is_night_team: true, staff_name: 'D' },
      { staff_id: 4, week_day: 3, shift_type: 'A2', is_night_team: true, staff_name: 'D' },
      { staff_id: 4, week_day: 4, shift_type: 'P', is_night_team: true, staff_name: 'D' },
      { staff_id: 4, week_day: 5, shift_type: 'N', is_night_team: true, staff_name: 'D' },
      { staff_id: 4, week_day: 6, shift_type: '休', is_night_team: true, staff_name: 'D' },
      { staff_id: 4, week_day: 7, shift_type: '休prn', is_night_team: true, staff_name: 'D' },

      { staff_id: 5, week_day: 1, shift_type: '助夜', is_night_team: true, staff_name: 'E' },
      { staff_id: 5, week_day: 2, shift_type: 'P', is_night_team: true, staff_name: 'E' },
      { staff_id: 5, week_day: 3, shift_type: 'N', is_night_team: true, staff_name: 'E' },
      { staff_id: 5, week_day: 4, shift_type: '休', is_night_team: true, staff_name: 'E' },
      { staff_id: 5, week_day: 5, shift_type: '休prn', is_night_team: true, staff_name: 'E' },
      { staff_id: 5, week_day: 6, shift_type: '休', is_night_team: true, staff_name: 'E' },
      { staff_id: 5, week_day: 7, shift_type: 'A1', is_night_team: true, staff_name: 'E' },

      { staff_id: 6, week_day: 1, shift_type: 'A2', is_night_team: true, staff_name: 'F' },
      { staff_id: 6, week_day: 2, shift_type: '助夜', is_night_team: true, staff_name: 'F' },
      { staff_id: 6, week_day: 3, shift_type: '助夜', is_night_team: true, staff_name: 'F' },
      { staff_id: 6, week_day: 4, shift_type: '助夜', is_night_team: true, staff_name: 'F' },
      { staff_id: 6, week_day: 5, shift_type: '助夜', is_night_team: true, staff_name: 'F' },
      { staff_id: 6, week_day: 6, shift_type: 'A2', is_night_team: true, staff_name: 'F' },
      { staff_id: 6, week_day: 7, shift_type: 'A2', is_night_team: true, staff_name: 'F' },

      { staff_id: 7, week_day: 1, shift_type: '休', is_night_team: true, staff_name: 'G' },
      { staff_id: 7, week_day: 2, shift_type: 'A2', is_night_team: true, staff_name: 'G' },
      { staff_id: 7, week_day: 3, shift_type: 'P', is_night_team: true, staff_name: 'G' },
      { staff_id: 7, week_day: 4, shift_type: 'N', is_night_team: true, staff_name: 'G' },
      { staff_id: 7, week_day: 5, shift_type: '休', is_night_team: true, staff_name: 'G' },
      { staff_id: 7, week_day: 6, shift_type: 'A1', is_night_team: true, staff_name: 'G' },
      { staff_id: 7, week_day: 7, shift_type: 'A2', is_night_team: true, staff_name: 'G' },
    ];

    expect(validateSchedule(schedules)).toHaveLength(0);
  });

  it('fails when P or N is missing or duplicated', () => {
    const schedules: ScheduleItem[] = [
      { staff_id: 1, week_day: 1, shift_type: 'P', is_night_team: true },
      { staff_id: 2, week_day: 1, shift_type: 'P', is_night_team: true },
      { staff_id: 3, week_day: 1, shift_type: 'A1', is_night_team: true },
      { staff_id: 4, week_day: 1, shift_type: 'A2', is_night_team: true },
      { staff_id: 5, week_day: 1, shift_type: '助夜', is_night_team: true },
    ];

    const errors = validateSchedule(schedules);
    expect(errors.some((error) => error.rule === 'RULE_1' && error.message.includes('缺少 N'))).toBe(true);
    expect(errors.some((error) => error.rule === 'RULE_1' && error.message.includes('存在 2 个 P'))).toBe(true);
  });

  it('fails when A1, A2 or weekday assist night is missing', () => {
    const schedules: ScheduleItem[] = [
      { staff_id: 1, week_day: 1, shift_type: 'P', is_night_team: true },
      { staff_id: 2, week_day: 1, shift_type: 'N', is_night_team: true },
      { staff_id: 3, week_day: 1, shift_type: '休', is_night_team: true },
      { staff_id: 4, week_day: 1, shift_type: '休prn', is_night_team: true },
    ];

    const errors = validateSchedule(schedules);
    expect(errors.some((error) => error.message.includes('缺少 A1'))).toBe(true);
    expect(errors.some((error) => error.message.includes('缺少 A2'))).toBe(true);
    expect(errors.some((error) => error.message.includes('缺少助夜'))).toBe(true);
  });

  it('rejects assist night on weekends', () => {
    const schedules: ScheduleItem[] = [
      { staff_id: 1, week_day: 6, shift_type: 'P', is_night_team: true },
      { staff_id: 2, week_day: 6, shift_type: 'N', is_night_team: true },
      { staff_id: 3, week_day: 6, shift_type: 'A1', is_night_team: true },
      { staff_id: 4, week_day: 6, shift_type: 'A2', is_night_team: true },
      { staff_id: 5, week_day: 6, shift_type: '助夜', is_night_team: true },
    ];

    const errors = validateSchedule(schedules);
    expect(errors.some((error) => error.rule === 'RULE_2')).toBe(true);
  });

  it('allows flexible transitions after rest and prn', () => {
    const schedules: ScheduleItem[] = [
      { staff_id: 1, week_day: 1, shift_type: 'P', is_night_team: true, staff_name: 'A' },
      { staff_id: 1, week_day: 2, shift_type: 'N', is_night_team: true, staff_name: 'A' },
      { staff_id: 1, week_day: 3, shift_type: '休', is_night_team: true, staff_name: 'A' },
      { staff_id: 1, week_day: 4, shift_type: '休', is_night_team: true, staff_name: 'A' },
      { staff_id: 1, week_day: 5, shift_type: 'A1', is_night_team: true, staff_name: 'A' },
      { staff_id: 1, week_day: 6, shift_type: 'P', is_night_team: true, staff_name: 'A' },
      { staff_id: 1, week_day: 7, shift_type: 'N', is_night_team: true, staff_name: 'A' },
    ];

    const filler: ScheduleItem[] = [];
    for (let day = 1; day <= 7; day++) {
      filler.push({ staff_id: 2, week_day: day, shift_type: day === 1 || day === 6 ? 'A2' : 'A1', is_night_team: true });
      filler.push({ staff_id: 3, week_day: day, shift_type: day <= 5 ? '助夜' : '休', is_night_team: true });
    }

    const errors = validateSchedule([...schedules, ...filler]);
    expect(errors.filter((error) => error.rule === 'RULE_3')).toHaveLength(0);
  });

  it('rejects impossible direct transition from P to rest', () => {
    const schedules: ScheduleItem[] = [
      { staff_id: 1, week_day: 1, shift_type: 'P', is_night_team: true, staff_name: 'A' },
      { staff_id: 1, week_day: 2, shift_type: '休', is_night_team: true, staff_name: 'A' },
      { staff_id: 2, week_day: 1, shift_type: 'N', is_night_team: true },
      { staff_id: 2, week_day: 2, shift_type: '休', is_night_team: true },
      { staff_id: 3, week_day: 1, shift_type: 'A1', is_night_team: true },
      { staff_id: 3, week_day: 2, shift_type: 'A1', is_night_team: true },
      { staff_id: 4, week_day: 1, shift_type: 'A2', is_night_team: true },
      { staff_id: 4, week_day: 2, shift_type: 'A2', is_night_team: true },
      { staff_id: 5, week_day: 1, shift_type: '助夜', is_night_team: true },
      { staff_id: 5, week_day: 2, shift_type: '助夜', is_night_team: true },
    ];

    const errors = validateSchedule(schedules);
    expect(errors.some((error) => error.rule === 'RULE_3')).toBe(true);
  });
});
