import request from './request'
import type { Schedule } from '@/types'

export const getSchedule = (week_start: string) => request.get('/schedule', { params: { week_start } })
export const saveSchedule = (schedules: Schedule[]) => request.post('/schedule/batch', { schedules })
export const getCurrentWeek = () => request.get('/schedule/current-week')
export const generateNightSchedule = (prev_week_start: string, next_week_start: string, randomize?: boolean) =>
  request.post('/schedule/generate-night', { prev_week_start, next_week_start, randomize })
export const copyWeekSchedule = (from_week_start: string, to_week_start: string) =>
  request.post('/schedule/copy', { from_week_start, to_week_start })
export const validateSchedule = (schedules: Schedule[], week_start?: string) =>
  request.post('/schedule/validate', { schedules, week_start })
