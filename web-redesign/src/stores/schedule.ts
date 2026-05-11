import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import { getCurrentWeek, getSchedule } from '@/api/schedule'
import { getStaffList } from '@/api/staff'
import { getWeekDates } from '@/utils/date'
import type { Schedule, Staff, StaffSchedule } from '@/types'

function sameDay(a: string, b: string) {
  const left = new Date(a)
  const right = new Date(b)
  return left.getFullYear() === right.getFullYear()
    && left.getMonth() === right.getMonth()
    && left.getDate() === right.getDate()
}

export const useScheduleStore = defineStore('redesign-schedule', () => {
  const currentWeekStart = ref('')
  const nextWeekStart = ref('')
  const staffList = ref<Staff[]>([])
  const currentWeekSchedules = ref<Schedule[]>([])
  const nextWeekSchedules = ref<Schedule[]>([])

  const currentWeekDates = computed(() => getWeekDates(currentWeekStart.value))
  const nextWeekDates = computed(() => getWeekDates(nextWeekStart.value))

  function collectShifts(staffId: number, weekStart: string, schedules: Schedule[]) {
    return Array.from({ length: 7 }, (_, index) => {
      const weekDay = index + 1
      return schedules.find((item) => item.staff_id === staffId && item.week_day === weekDay && sameDay(item.week_start, weekStart)) ?? null
    })
  }

  const currentWeekData = computed<StaffSchedule[]>(() =>
    staffList.value.map((staff) => ({
      staff,
      shifts: collectShifts(staff.id, currentWeekStart.value, currentWeekSchedules.value),
    })),
  )

  const nextWeekData = computed<StaffSchedule[]>(() =>
    staffList.value.map((staff) => ({
      staff,
      shifts: collectShifts(staff.id, nextWeekStart.value, nextWeekSchedules.value),
    })),
  )

  async function loadStaffList() {
    const res: any = await getStaffList()
    if (res.code === 0) {
      staffList.value = res.data
    }
  }

  async function loadWeekRange() {
    const res: any = await getCurrentWeek()
    if (res.code === 0) {
      currentWeekStart.value = res.data.current_week_start
      nextWeekStart.value = res.data.next_week_start
    }
  }

  async function loadCurrentWeek() {
    if (!currentWeekStart.value) return
    const res: any = await getSchedule(currentWeekStart.value)
    if (res.code === 0) {
      currentWeekSchedules.value = res.data
    }
  }

  async function loadNextWeek() {
    if (!nextWeekStart.value) return
    const res: any = await getSchedule(nextWeekStart.value)
    if (res.code === 0) {
      nextWeekSchedules.value = res.data
    }
  }

  function updateSchedule(target: 'current' | 'next', staffId: number, weekDay: number, shiftType: string, isGenerated = false, remark?: string) {
    const list = target === 'current' ? currentWeekSchedules.value : nextWeekSchedules.value
    const weekStart = target === 'current' ? currentWeekStart.value : nextWeekStart.value
    const current = list.find((item) => item.staff_id === staffId && item.week_day === weekDay)

    if (current) {
      current.shift_type = shiftType
      current.shift_id = current.shift_id || null
      current.remark = remark || null
      current.is_generated = isGenerated
      current.is_edited = !isGenerated
      current.updated_at = new Date().toISOString()
      return
    }

    list.push({
      id: 0,
      staff_id: staffId,
      week_start: weekStart,
      week_day: weekDay,
      shift_type: shiftType,
      shift_id: null,
      remark: remark || null,
      is_generated: isGenerated,
      is_edited: !isGenerated,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
  }

  function replaceNextSchedules(schedules: Schedule[]) {
    nextWeekSchedules.value = schedules
  }

  return {
    currentWeekStart,
    nextWeekStart,
    staffList,
    currentWeekSchedules,
    nextWeekSchedules,
    currentWeekDates,
    nextWeekDates,
    currentWeekData,
    nextWeekData,
    loadStaffList,
    loadWeekRange,
    loadCurrentWeek,
    loadNextWeek,
    updateSchedule,
    replaceNextSchedules,
  }
})
