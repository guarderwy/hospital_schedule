import request from './request'
import type { RequestStatus, RequestType } from '@/types'

export function getStaffRequests(params?: { staff_id?: number; week_start?: string; status?: RequestStatus }) {
  return request.get('/staff-request', { params })
}

export function createStaffRequest(data: {
  staff_id: number
  week_start: string
  week_day: number
  end_date?: string
  request_type: RequestType
  reason?: string
}) {
  return request.post('/staff-request', data)
}

export function approveStaffRequest(id: number, data: { status?: RequestStatus; approved_by?: string }) {
  return request.patch(`/staff-request/${id}/approve`, data)
}

export function deleteStaffRequest(id: number) {
  return request.delete(`/staff-request/${id}`)
}

export function getFixedShifts(params?: { staff_id?: number; week_start?: string; week_end?: string }) {
  return request.get('/fixed-shift', { params })
}

export function createFixedShift(data: {
  staff_id: number
  assign_date: string
  shift_type: string
  assigned_by?: string
  note?: string
}) {
  return request.post('/fixed-shift', data)
}

export function deleteFixedShift(id: number) {
  return request.delete(`/fixed-shift/${id}`)
}

export function getScheduleChangeLogs(params?: { staff_id?: number; week_start?: string }) {
  return request.get('/schedule-change-log', { params })
}
