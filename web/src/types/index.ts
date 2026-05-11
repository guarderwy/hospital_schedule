export type StaffStatus = 'active' | 'leave' | 'transfer'

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
  | '/'

export type RequestType = 'rest' | 'prn' | 'other'
export type RequestStatus = 'pending' | 'approved' | 'rejected'
export type ChangeType = 'manual_edit' | 'swap' | 'drag_drop' | 'generated'

export interface Staff {
  id: number
  name: string
  level: string | null
  title: string | null
  role: string | null
  bed_range: string | null
  is_night_team: boolean
  night_team_order: number | null
  status: StaffStatus
  created_at: string
  updated_at: string
}

export interface Schedule {
  id: number
  staff_id: number
  staff_name?: string
  is_night_team?: boolean
  week_start: string
  week_day: number
  shift_type: ShiftType | string
  is_generated: boolean
  is_edited: boolean
  created_at: string
  updated_at: string
}

export interface WeekRange {
  current_week_start: string
  next_week_start: string
}

export interface StaffSchedule {
  staff: Staff
  shifts: (Schedule | null)[]
}

export interface StaffRequest {
  id: number
  staff_id: number
  week_start: string
  end_date: string | null
  week_day: number
  total_days: number
  request_type: RequestType
  status: RequestStatus
  approved_by: string | null
  approved_at: string | null
  reason: string | null
  created_at: string
}

export interface FixedShiftAssignment {
  id: number
  staff_id: number
  staff_name?: string
  assign_date: string
  shift_type: string
  assigned_by: string
  note: string
  created_at: string
  updated_at: string
}

export interface ScheduleChangeLog {
  id: number
  schedule_id: number | null
  staff_id: number
  week_start: string
  week_day: number
  old_shift: string
  new_shift: string
  change_type: ChangeType
  changed_by: string
  note: string
  created_at: string
}

export interface ApiResponse<T = unknown> {
  code: number
  message: string
  data: T
}

export interface ApiError {
  code: number
  message: string
  details?: Record<string, string[]>
}

export const SHIFT_TYPES: ShiftType[] = [
  'P', 'N', '休', '休prn', 'A1', 'A2', '助夜',
  '正1+2', '正(中)', '正(医)', '正(服)', '正(医+服)',
  '医嘱', '服药', '/', ''
] as const

export const WEEK_DAYS = ['周一', '周二', '周三', '周四', '周五', '周六', '周日']

export const SHIFT_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  'P': { bg: '#E8E8E8', text: '#666666', border: '#E8E8E8' },
  'N': { bg: '#E8E8E8', text: '#666666', border: '#E8E8E8' },
  '休': { bg: '#E8E8E8', text: '#666666', border: '#E8E8E8' },
  '休prn': { bg: '#E8E8E8', text: '#666666', border: '#E8E8E8' },
  'A1': { bg: '#E8E8E8', text: '#666666', border: '#E8E8E8' },
  'A2': { bg: '#E8E8E8', text: '#666666', border: '#E8E8E8' },
  '助夜': { bg: '#E8E8E8', text: '#666666', border: '#E8E8E8' },
  '正1+2': { bg: '#E8E8E8', text: '#666666', border: '#E8E8E8' },
  '正(中)': { bg: '#E8E8E8', text: '#666666', border: '#E8E8E8' },
  '正(医)': { bg: '#E8E8E8', text: '#666666', border: '#E8E8E8' },
  '正(服)': { bg: '#E8E8E8', text: '#666666', border: '#E8E8E8' },
  '正(医+服)': { bg: '#E8E8E8', text: '#666666', border: '#E8E8E8' },
  '医嘱': { bg: '#E8E8E8', text: '#666666', border: '#E8E8E8' },
  '服药': { bg: '#E8E8E8', text: '#666666', border: '#E8E8E8' },
  '/': { bg: '#E8E8E8', text: '#666666', border: '#E8E8E8' },
  '': { bg: '#E8E8E8', text: '#666666', border: '#E8E8E8' },
}
