<template>
  <div class="schedule-table-wrapper">
    <el-table
      :data="tableData"
      border
      stripe
      style="width: 100%"
      :row-class-name="getRowClassName"
      :cell-class-name="getCellClassName"
      @cell-click="handleCellClick"
    >
      <el-table-column label="姓名" width="140" fixed="left">
        <template #default="{ row }">
          <div class="staff-cell">
            <span class="staff-name">{{ row.staff.name }}</span>
            <el-tag v-if="row.staff.is_night_team" type="warning" size="small" class="night-tag">夜</el-tag>
          </div>
        </template>
      </el-table-column>

      <el-table-column
        v-for="(date, index) in weekDates"
        :key="index"
        :label="`${weekDays[index]} ${date}`"
        min-width="100"
        align="center"
        :header-cell-class-name="() => index >= 5 ? 'weekend-header' : ''"
      >
        <template #default="{ row }">
          <div
            class="shift-cell"
            :class="{ 'fixed-shift': isFixedShift(row.staff.id, index + 1) }"
            draggable="true"
            @dragstart="handleDragStart($event, row.staff.id, index + 1)"
            @dragover.prevent
            @drop="handleDrop($event, row.staff.id, index + 1)"
          >
            <div
              class="shift-badge"
              :style="getShiftStyle(row.shifts[index]?.shift_type)"
            >
              <span class="shift-text">{{ row.shifts[index]?.shift_type || '/' }}</span>
              <span v-if="row.shifts[index]?.is_edited" class="edit-indicator">✎</span>
              <span v-if="isFixedShift(row.staff.id, index + 1)" class="fixed-indicator">📌</span>
            </div>
          </div>
        </template>
      </el-table-column>
    </el-table>

    <div class="shift-legend">
      <div class="legend-title">图例说明</div>
      <div class="legend-items">
        <div v-for="(color, shift) in activeShiftColors" :key="shift" class="legend-item">
          <span class="legend-dot" :style="{ backgroundColor: color.bg, borderColor: color.border }"></span>
          <span>{{ shift || '未排' }}</span>
        </div>
        <div class="legend-item">
          <span class="legend-dot" style="backgroundColor: #fff; border: 2px solid #409EFF; box-shadow: 0 0 4px rgba(64,158,255,0.4)"></span>
          <span>手动编辑</span>
        </div>
        <div class="legend-item">
          <span class="legend-dot" style="backgroundColor: #FFD700; border: 1px solid #FFD700"></span>
          <span>固定分配</span>
        </div>
        <div class="legend-item">
          <span class="legend-dot" style="backgroundColor: #fef0f0; border: 1px solid #f56c6c"></span>
          <span>周末</span>
        </div>
      </div>
    </div>

    <el-dialog
      v-model="dialogVisible"
      title="选择班次"
      width="600px"
      :close-on-click-modal="false"
    >
      <div v-if="selectedCellInfo" class="dialog-header-info">
        <el-tag size="small">{{ selectedCellInfo.staffName }}</el-tag>
        <span class="dialog-date">{{ selectedCellInfo.dateLabel }}</span>
      </div>
      <div class="shift-grid">
        <div
          v-for="shift in shiftTypes"
          :key="shift"
          class="shift-option"
          :class="{ active: selectedShift === shift }"
          @click="selectShift(shift)"
        >
          <div
            class="shift-preview"
            :style="getShiftStyle(shift)"
          >
            <span>{{ shift || '清空' }}</span>
          </div>
        </div>
      </div>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="confirmShift">确定</el-button>
      </template>
    </el-dialog>

    <el-dialog
      v-model="swapDialogVisible"
      title="交换班次"
      width="500px"
    >
      <div class="swap-info">
        <p>将 <strong>{{ swapSource?.staffName }}</strong> 在 <strong>{{ swapSource?.dateLabel }}</strong> 的班次</p>
        <p>与 <strong>{{ swapTarget?.staffName }}</strong> 在 <strong>{{ swapTarget?.dateLabel }}</strong> 的班次交换</p>
      </div>
      <template #footer>
        <el-button @click="swapDialogVisible = false">取消</el-button>
        <el-button type="warning" @click="confirmSwap">确认交换</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import type { Staff, StaffSchedule } from '../types'
import { SHIFT_TYPES, WEEK_DAYS, SHIFT_COLORS } from '../types'

const props = defineProps<{
  weekDates: string[]
  staffData: StaffSchedule[]
  readonly: boolean
  fixedShifts?: Array<{ staff_id: number; week_day: number; shift_type: string }>
}>()

const emit = defineEmits<{
  (e: 'update-shift', staffId: number, weekDay: number, shiftType: string): void
  (e: 'swap-shifts', source: { staffId: number; weekDay: number }, target: { staffId: number; weekDay: number }): void
}>()

const weekDays = WEEK_DAYS
const shiftTypes = SHIFT_TYPES

const dialogVisible = ref(false)
const selectedStaff = ref<Staff | null>(null)
const selectedDay = ref(0)
const selectedShift = ref('')
const selectedCellInfo = ref<{ staffName: string; dateLabel: string } | null>(null)

const swapDialogVisible = ref(false)
const swapSource = ref<{ staffId: number; weekDay: number; staffName: string; dateLabel: string } | null>(null)
const swapTarget = ref<{ staffId: number; weekDay: number; staffName: string; dateLabel: string } | null>(null)
const dragSource = ref<{ staffId: number; weekDay: number } | null>(null)

const tableData = computed(() => props.staffData)

const activeShiftColors = computed(() => {
  const colors: Record<string, { bg: string; border: string }> = {}
  const shiftsInUse = new Set<string>()
  props.staffData.forEach(row => {
    row.shifts.forEach(s => {
      if (s?.shift_type) shiftsInUse.add(s.shift_type)
    })
  })
  shiftsInUse.forEach(shift => {
    if (SHIFT_COLORS[shift]) {
      colors[shift] = { bg: SHIFT_COLORS[shift].bg, border: SHIFT_COLORS[shift].border }
    }
  })
  return colors
})

function getShiftStyle(shift: string | undefined) {
  const color = SHIFT_COLORS[shift || '/'] || SHIFT_COLORS['/']
  return {
    backgroundColor: color.bg,
    color: color.text,
    borderColor: color.border,
  }
}

function isFixedShift(staffId: number, weekDay: number): boolean {
  if (!props.fixedShifts) return false
  return props.fixedShifts.some(f => f.staff_id === staffId && f.week_day === weekDay)
}

function getRowClassName({ row }: { row: StaffSchedule }) {
  return row.staff.is_night_team ? 'night-team-row' : ''
}

function getCellClassName({ column }: { column: any }) {
  if (column.label && (column.label.includes('周六') || column.label.includes('周日'))) {
    return 'weekend-cell'
  }
  return ''
}

function handleCellClick(row: StaffSchedule, column: any) {
  if (props.readonly) return
  const dayIndex = WEEK_DAYS.findIndex(day => column.label.includes(day))
  if (dayIndex >= 0) {
    selectedStaff.value = row.staff
    selectedDay.value = dayIndex + 1
    selectedShift.value = row.shifts[dayIndex]?.shift_type || ''
    const dateStr = props.weekDates[dayIndex] || ''
    selectedCellInfo.value = {
      staffName: row.staff.name,
      dateLabel: `${WEEK_DAYS[dayIndex]} ${dateStr}`,
    }
    dialogVisible.value = true
  }
}

function selectShift(shift: string) {
  selectedShift.value = shift
}

function confirmShift() {
  if (selectedStaff.value) {
    emit('update-shift', selectedStaff.value.id, selectedDay.value, selectedShift.value)
  }
  dialogVisible.value = false
}

function handleDragStart(event: DragEvent, staffId: number, weekDay: number) {
  if (props.readonly) return
  dragSource.value = { staffId, weekDay }
  const row = props.staffData.find(r => r.staff.id === staffId)
  const shift = row?.shifts[weekDay - 1]?.shift_type || '/'
  event.dataTransfer?.setData('text/plain', `${staffId}-${weekDay}`)
}

function handleDrop(event: DragEvent, targetStaffId: number, targetWeekDay: number) {
  if (props.readonly || !dragSource.value) return
  event.preventDefault()

  const source = dragSource.value
  if (source.staffId === targetStaffId && source.weekDay === targetWeekDay) {
    dragSource.value = null
    return
  }

  const sourceRow = props.staffData.find(r => r.staff.id === source.staffId)
  const targetRow = props.staffData.find(r => r.staff.id === targetStaffId)
  const sourceShift = sourceRow?.shifts[source.weekDay - 1]?.shift_type || '/'
  const targetShift = targetRow?.shifts[targetWeekDay - 1]?.shift_type || '/'

  if (sourceShift === targetShift) {
    dragSource.value = null
    return
  }

  const sourceDate = props.weekDates[source.weekDay - 1] || ''
  const targetDate = props.weekDates[targetWeekDay - 1] || ''

  swapSource.value = {
    staffId: source.staffId,
    weekDay: source.weekDay,
    staffName: sourceRow?.staff.name || '',
    dateLabel: `${WEEK_DAYS[source.weekDay - 1]} ${sourceDate}`,
  }
  swapTarget.value = {
    staffId: targetStaffId,
    weekDay: targetWeekDay,
    staffName: targetRow?.staff.name || '',
    dateLabel: `${WEEK_DAYS[targetWeekDay - 1]} ${targetDate}`,
  }
  swapDialogVisible.value = true
  dragSource.value = null
}

function confirmSwap() {
  if (swapSource.value && swapTarget.value) {
    emit('swap-shifts',
      { staffId: swapSource.value.staffId, weekDay: swapSource.value.weekDay },
      { staffId: swapTarget.value.staffId, weekDay: swapTarget.value.weekDay }
    )
  }
  swapDialogVisible.value = false
  swapSource.value = null
  swapTarget.value = null
}
</script>

<style scoped>
.schedule-table-wrapper {
  width: 100%;
}

.staff-cell {
  display: flex;
  align-items: center;
  gap: 8px;
}

.staff-name {
  font-weight: 600;
  color: #303133;
}

.night-tag {
  font-size: 10px;
  padding: 0 4px;
}

.shift-cell {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 36px;
  cursor: pointer;
  transition: all 0.15s;
  border-radius: 4px;
}

.shift-cell:hover {
  background-color: #f0f0f0;
}

.shift-cell.fixed-shift {
  background-color: #FFF8E1;
}

.shift-badge {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 4px 10px;
  border-radius: 4px;
  border: 1px solid;
  font-size: 12px;
  font-weight: 500;
  min-width: 40px;
  justify-content: center;
  position: relative;
  transition: all 0.2s;
}

.shift-badge:hover {
  transform: scale(1.05);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
}

.shift-text {
  white-space: nowrap;
}

.edit-indicator {
  position: absolute;
  top: -6px;
  right: -6px;
  font-size: 10px;
  color: #409EFF;
  font-weight: bold;
  background: #fff;
  border-radius: 50%;
  width: 14px;
  height: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid #409EFF;
}

.fixed-indicator {
  font-size: 10px;
  position: absolute;
  top: -6px;
  left: -6px;
}

.shift-legend {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  margin-top: 12px;
  background: #f5f7fa;
  border-radius: 4px;
  font-size: 11px;
  color: #606266;
}

.legend-title {
  font-weight: 600;
  margin-right: 8px;
}

.legend-items {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 4px;
}

.legend-dot {
  width: 12px;
  height: 12px;
  border-radius: 3px;
  display: inline-block;
  border: 1px solid;
}

.dialog-header-info {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 0 12px;
  border-bottom: 1px solid #ebeef5;
  margin-bottom: 12px;
}

.dialog-date {
  font-size: 14px;
  font-weight: 500;
  color: #303133;
}

.shift-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 10px;
  padding: 10px 0;
}

.shift-option {
  display: flex;
  justify-content: center;
  padding: 8px;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s;
  border: 2px solid transparent;
}

.shift-option:hover {
  background-color: #f5f7fa;
  transform: scale(1.02);
}

.shift-option.active {
  border-color: #409EFF;
  background-color: #ecf5ff;
}

.shift-preview {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 6px 12px;
  border-radius: 4px;
  border: 1px solid;
  font-size: 13px;
  font-weight: 500;
  min-width: 50px;
}

.swap-info {
  padding: 16px;
  background: #FFF8E1;
  border-radius: 8px;
  border-left: 4px solid #FFD700;
}

.swap-info p {
  margin: 8px 0;
  font-size: 14px;
  color: #303133;
}

:deep(.night-team-row) {
  background-color: #fdf6ec !important;
}

:deep(.weekend-header) {
  background-color: #fef0f0 !important;
  color: #f56c6c !important;
}

:deep(.weekend-cell) {
  background-color: #fef0f0 !important;
}

:deep(.el-table__header th) {
  background-color: #f5f7fa !important;
  color: #606266 !important;
  font-weight: 600;
}

:deep(.el-table__row:hover) {
  background-color: #f5f7fa !important;
}
</style>
