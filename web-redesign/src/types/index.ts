export type StaffStatus = 'active' | 'leave' | 'transfer'
export type RequestType = 'rest' | 'prn' | 'other'
export type RequestStatus = 'pending' | 'approved' | 'rejected'
export type ChangeType = 'manual_edit' | 'swap' | 'drag_drop' | 'generated'

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
  | 'A(服)'
  | '正(医+服)'
  | '出科'
  | '/'
  | ''

export interface Shift {
  id: number
  code: string
  name: string
  category: string
  start_time: string | null
  end_time: string | null
  duration_hours: number | null
  applicable_days: string
  color: string | null
  sort_order: number
  is_active: boolean
  description: string | null
}

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
  shift_id?: number | null
  remark?: string | null
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

export interface ValidationErrorItem {
  message: string
  rule?: string
}

export const WEEK_DAYS = ['周一', '周二', '周三', '周四', '周五', '周六', '周日'] as const

export const SHIFT_TYPES: ShiftType[] = [
  'P',
  'N',
  '休',
  '休prn',
  'A1',
  'A2',
  '助夜',
  '正1+2',
  '正(中)',
  '正(医)',
  'A(服)',
  '正(医+服)',
  '出科',
  '/',
  '',
]

export const SHIFT_META: Record<string, { label: string; bg: string; text: string; border: string }> = {
  P: { label: 'P', bg: '#dbeafe', text: '#1d4ed8', border: '#93c5fd' },
  N: { label: 'N', bg: '#dcfce7', text: '#166534', border: '#86efac' },
  休: { label: '休', bg: '#f3f4f6', text: '#4b5563', border: '#d1d5db' },
  休prn: { label: '休prn', bg: '#fef3c7', text: '#92400e', border: '#fcd34d' },
  A1: { label: 'A1', bg: '#e0f2fe', text: '#0369a1', border: '#7dd3fc' },
  A2: { label: 'A2', bg: '#ecfeff', text: '#0f766e', border: '#99f6e4' },
  助夜: { label: '助夜', bg: '#ede9fe', text: '#5b21b6', border: '#c4b5fd' },
  '正1+2': { label: '正1+2', bg: '#ffe4e6', text: '#be123c', border: '#fda4af' },
  '正(中)': { label: '正(中)', bg: '#fce7f3', text: '#9d174d', border: '#f9a8d4' },
  '正(医)': { label: '正(医)', bg: '#ede9fe', text: '#6d28d9', border: '#c4b5fd' },
  'A(服)': { label: 'A(服)', bg: '#fae8ff', text: '#a21caf', border: '#f0abfc' },
  '正(医+服)': { label: '正(医+服)', bg: '#ecfccb', text: '#3f6212', border: '#bef264' },
  出科: { label: '出科', bg: '#f1f5f9', text: '#475569', border: '#cbd5e1' },
  '/': { label: '/', bg: '#f8fafc', text: '#64748b', border: '#cbd5e1' },
  '': { label: '清空', bg: '#f8fafc', text: '#64748b', border: '#cbd5e1' },
}

export const REQUEST_TYPE_LABEL: Record<RequestType, string> = {
  rest: '休息',
  prn: '休prn',
  other: '其他',
}

export const REQUEST_STATUS_LABEL: Record<RequestStatus, string> = {
  pending: '待审批',
  approved: '已批准',
  rejected: '已拒绝',
}
