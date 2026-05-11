import { WEEK_DAYS } from '@/types'

export function formatDate(date: Date | string) {
  const value = typeof date === 'string' ? new Date(date) : date
  const y = value.getFullYear()
  const m = String(value.getMonth() + 1).padStart(2, '0')
  const d = String(value.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

export function formatShortDate(date: Date | string) {
  const value = typeof date === 'string' ? new Date(date) : date
  return `${value.getMonth() + 1}.${value.getDate()}`
}

export function addDays(date: Date | string, days: number) {
  const value = typeof date === 'string' ? new Date(date) : new Date(date)
  value.setDate(value.getDate() + days)
  return value
}

export function getWeekDates(weekStart: string) {
  if (!weekStart) return []
  return Array.from({ length: 7 }, (_, index) => formatShortDate(addDays(weekStart, index)))
}

export function getWeekEnd(weekStart: string) {
  if (!weekStart) return ''
  return formatDate(addDays(weekStart, 6))
}

export function getCurrentTimeLabel() {
  return new Date().toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function weekDayLabel(day: number) {
  return WEEK_DAYS[Math.max(0, Math.min(6, day - 1))] ?? ''
}

export function getNextMonday() {
  const now = new Date()
  const day = now.getDay()
  const offset = day === 0 ? 1 : 8 - day
  const monday = new Date(now)
  monday.setDate(now.getDate() + offset)
  monday.setHours(0, 0, 0, 0)
  return monday
}
