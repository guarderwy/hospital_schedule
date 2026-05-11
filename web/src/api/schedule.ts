import request from './request'

export const getSchedule = (week_start: string) => request.get('/schedule', { params: { week_start } })
export const saveSchedule = (schedules: any[]) => request.post('/schedule/batch', { schedules })
export const getCurrentWeek = () => request.get('/schedule/current-week')
export const generateNightSchedule = (prev_week_start: string, next_week_start: string) =>
  request.post('/schedule/generate-night', { prev_week_start, next_week_start })
export const copyWeekSchedule = (from_week_start: string, to_week_start: string) =>
  request.post('/schedule/copy', { from_week_start, to_week_start })
export const validateSchedule = (schedules: any[], week_start?: string) => request.post('/schedule/validate', { schedules, week_start })
