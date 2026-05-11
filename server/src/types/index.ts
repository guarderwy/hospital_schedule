export type StaffStatus = 'active' | 'leave' | 'transfer';

export type ShiftType =
  | 'P'
  | 'N'
  | '休'
  | '休prn'
  | 'A1'
  | 'A2'
  | '助夜'
  | '正1+2'
  | '正(中)'
  | '正(医)'
  | '正(服)'
  | '正(医+服)'
  | '医嘱'
  | '服药'
  | '/';

export type RequestType = 'rest' | 'prn' | 'other';
export type RequestStatus = 'pending' | 'approved' | 'rejected';
export type ChangeType = 'manual_edit' | 'swap' | 'drag_drop' | 'generated';

export interface Staff {
  id: number;
  name: string;
  level: string | null;
  title: string | null;
  role: string | null;
  bed_range: string | null;
  is_night_team: boolean;
  night_team_order: number | null;
  status: StaffStatus;
  created_at: Date;
  updated_at: Date;
}

export interface Schedule {
  id: number;
  staff_id: number;
  week_start: string;
  week_day: number;
  shift_type: ShiftType | string;
  is_generated: boolean;
  is_edited: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface StaffRequest {
  id: number;
  staff_id: number;
  week_start: string;
  end_date: string | null;
  week_day: number;
  total_days: number;
  request_type: RequestType;
  status: RequestStatus;
  approved_by: string | null;
  approved_at: Date | null;
  reason: string | null;
  created_at: Date;
}

export interface FixedShiftAssignment {
  id: number;
  staff_id: number;
  assign_date: string;
  shift_type: string;
  assigned_by: string;
  note: string;
  created_at: Date;
  updated_at: Date;
}

export interface ScheduleChangeLog {
  id: number;
  schedule_id: number | null;
  staff_id: number;
  week_start: string;
  week_day: number;
  old_shift: string;
  new_shift: string;
  change_type: ChangeType;
  changed_by: string;
  note: string;
  created_at: Date;
}

export interface ApiResponse<T = unknown> {
  code: number;
  message: string;
  data: T;
}

export interface ApiError {
  code: number;
  message: string;
  details?: Record<string, string[]>;
}
