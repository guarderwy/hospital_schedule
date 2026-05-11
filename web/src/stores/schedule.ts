import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Schedule, Staff, WeekRange, StaffSchedule } from '../types'
import { getSchedule, getCurrentWeek, saveSchedule } from '../api/schedule'
import { getStaffList } from '../api/staff'

export const useScheduleStore = defineStore('schedule', () => {
  const currentWeekStart = ref('')
  const nextWeekStart = ref('')
  const currentWeekSchedules = ref<Schedule[]>([])
  const nextWeekSchedules = ref<Schedule[]>([])
  const staffList = ref<Staff[]>([])

  const weekDates = computed(() => {
    const dates: string[] = []
    const start = new Date(currentWeekStart.value)
    for (let i = 0; i < 7; i++) {
      const d = new Date(start)
      d.setDate(start.getDate() + i)
      dates.push(`${d.getMonth() + 1}.${d.getDate()}`)
    }
    return dates
  })

  const nextWeekDates = computed(() => {
    const dates: string[] = []
    const start = new Date(nextWeekStart.value)
    for (let i = 0; i < 7; i++) {
      const d = new Date(start)
      d.setDate(start.getDate() + i)
      dates.push(`${d.getMonth() + 1}.${d.getDate()}`)
    }
    return dates
  })

  function getStaffShifts(staffId: number, weekStart: string, schedules: Schedule[]) {
    const shifts: (Schedule | null)[] = []
    for (let day = 1; day <= 7; day++) {
      const s = schedules.find(
        (x) => {
          const xDate = new Date(x.week_start)
          const targetDate = new Date(weekStart)
          return x.staff_id === staffId &&
            xDate.getFullYear() === targetDate.getFullYear() &&
            xDate.getMonth() === targetDate.getMonth() &&
            xDate.getDate() === targetDate.getDate() &&
            x.week_day === day
        }
      )
      shifts.push(s || null)
    }
    return shifts
  }

  const currentWeekData = computed<StaffSchedule[]>(() => {
    return staffList.value.map((staff) => ({
      staff,
      shifts: getStaffShifts(staff.id, currentWeekStart.value, currentWeekSchedules.value),
    }))
  })

  const nextWeekData = computed<StaffSchedule[]>(() => {
    return staffList.value.map((staff) => ({
      staff,
      shifts: getStaffShifts(staff.id, nextWeekStart.value, nextWeekSchedules.value),
    }))
  })

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

  async function saveNextWeek(schedules: Schedule[]) {
    const data = schedules.map((s) => ({
      staff_id: s.staff_id,
      week_start: s.week_start,
      week_day: s.week_day,
      shift_type: s.shift_type,
      is_generated: s.is_generated,
      is_edited: s.is_edited,
    }))
    return saveSchedule(data)
  }

  function updateNextWeekSchedule(staffId: number, weekDay: number, shiftType: string, isGenerated = false) {
    const existing = nextWeekSchedules.value.find(
      (s) => s.staff_id === staffId && s.week_day === weekDay
    )
    if (existing) {
      existing.shift_type = shiftType
      existing.is_edited = true
    } else {
      nextWeekSchedules.value.push({
        id: 0,
        staff_id: staffId,
        week_start: nextWeekStart.value,
        week_day: weekDay,
        shift_type: shiftType,
        is_generated: isGenerated,
        is_edited: !isGenerated,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
    }
  }

  function updateCurrentWeekSchedule(staffId: number, weekDay: number, shiftType: string) {
    const existing = currentWeekSchedules.value.find(
      (s) => s.staff_id === staffId && s.week_day === weekDay
    )
    if (existing) {
      existing.shift_type = shiftType
      existing.is_edited = true
    } else {
      currentWeekSchedules.value.push({
        id: 0,
        staff_id: staffId,
        week_start: currentWeekStart.value,
        week_day: weekDay,
        shift_type: shiftType,
        is_generated: false,
        is_edited: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
    }
  }

  async function saveCurrentWeek() {
    const data = currentWeekSchedules.value.map((s) => ({
      staff_id: s.staff_id,
      week_start: s.week_start,
      week_day: s.week_day,
      shift_type: s.shift_type,
      is_generated: s.is_generated,
      is_edited: s.is_edited,
    }))
    return saveSchedule(data)
  }

  function clearNextWeekSchedules() {
    nextWeekSchedules.value = []
  }

  return {
    currentWeekStart,
    nextWeekStart,
    currentWeekSchedules,
    nextWeekSchedules,
    staffList,
    weekDates,
    nextWeekDates,
    currentWeekData,
    nextWeekData,
    loadStaffList,
    loadWeekRange,
    loadCurrentWeek,
    loadNextWeek,
    saveNextWeek,
    saveCurrentWeek,
    updateNextWeekSchedule,
    updateCurrentWeekSchedule,
    clearNextWeekSchedules,
  }
})
