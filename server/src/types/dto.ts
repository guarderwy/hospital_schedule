/**
 * Data Transfer Objects (DTO) - 前后端通信数据结构
 */

import type { ShiftType, RequestType, RequestStatus, ChangeType, StaffStatus } from './index'

// ========== Staff DTOs ==========
export interface CreateStaffDTO {
  name: string
  level?: string
  title?: string
  role?: string
  bed_range?: string
  is_night_team?: boolean
  night_team_order?: number
  status?: StaffStatus
}

export interface UpdateStaffDTO extends Partial<CreateStaffDTO> {}

export interface StaffResponseDTO {
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

// ========== Schedule DTOs ==========
export interface CreateScheduleDTO {
  staff_id: number
  week_start: string
  week_day: number
  shift_type: ShiftType | string
  shift_id?: number
  remark?: string
  is_generated?: boolean
  is_edited?: boolean
}

export interface ScheduleResponseDTO {
  id: number
  staff_id: number
  staff_name?: string
  is_night_team?: boolean
  week_start: string
  week_day: number
  shift_type: ShiftType | string
  shift_id: number | null
  remark: string | null
  is_generated: boolean
  is_edited: boolean
  created_at: string
  updated_at: string
}

export interface BatchScheduleDTO {
  schedules: CreateScheduleDTO[]
}

export interface GenerateScheduleDTO {
  prev_week_start: string
  next_week_start: string
  randomize?: boolean
}

export interface CopyScheduleDTO {
  from_week_start: string
  to_week_start: string
}

export interface ValidateScheduleDTO {
  schedules: CreateScheduleDTO[]
  week_start?: string
}

export interface ScheduleValidationError {
  day: number
  type: 'missing_p' | 'missing_n' | 'other'
  message: string
}

// ========== StaffRequest DTOs ==========
export interface CreateStaffRequestDTO {
  staff_id: number
  week_start: string
  end_date?: string
  week_day: number
  total_days?: number
  request_type: RequestType
  reason?: string
}

export interface ApproveStaffRequestDTO {
  approved_by: string
}

export interface StaffRequestResponseDTO {
  id: number
  staff_id: number
  staff_name?: string
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

// ========== FixedShift DTOs ==========
export interface CreateFixedShiftDTO {
  staff_id: number
  assign_date: string
  shift_type: string
  assigned_by: string
  note?: string
}

export interface FixedShiftResponseDTO {
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

// ========== Shift DTOs ==========
export interface CreateShiftDTO {
  code: string
  name: string
  category: string
  start_time?: string
  end_time?: string
  duration_hours?: number
  applicable_days?: string
  color?: string
  sort_order?: number
  is_active?: boolean
  description?: string
}

export interface UpdateShiftDTO extends Partial<CreateShiftDTO> {}

export interface ShiftResponseDTO {
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

// ========== ChangeLog DTOs ==========
export interface ChangeLogResponseDTO {
  id: number
  schedule_id: number | null
  staff_id: number
  staff_name?: string
  week_start: string
  week_day: number
  old_shift: string
  new_shift: string
  change_type: ChangeType
  changed_by: string
  note: string
  created_at: string
}

// ========== API Response Wrapper ==========
export interface ApiResponse<T = unknown> {
  code: number
  message: string
  data: T
}

export interface PaginatedResponse<T> {
  items: T[]
  total: number
  page: number
  pageSize: number
}
