<template>
  <div class="matrix-card">
    <el-table
      :data="staffData"
      border
      stripe
      class="matrix-table"
      :row-class-name="({ row }: { row: StaffSchedule }) => (row.staff.is_night_team ? 'night-row' : '')"
      :cell-class-name="handleCellClass"
      @cell-click="onCellClick"
    >
      <el-table-column label="人员" fixed="left" width="168">
        <template #default="{ row }">
          <div class="staff-cell">
            <div>
              <strong>{{ row.staff.name }}</strong>
              <p>{{ row.staff.role || '未设置岗位' }}</p>
            </div>
            <el-tag v-if="row.staff.is_night_team" round type="warning" size="small">夜班组</el-tag>
          </div>
        </template>
      </el-table-column>

      <el-table-column
        v-for="(date, index) in weekDates"
        :key="date"
        :label="`${WEEK_DAYS[index]} ${date}`"
        min-width="110"
        align="center"
        :header-cell-class-name="() => (index >= 5 ? 'weekend-header' : '')"
      >
        <template #default="{ row }">
          <div
            class="shift-slot"
            :class="{ fixed: isFixedShift(row.staff.id, index + 1) }"
            draggable="true"
            @dragstart="onDragStart(row.staff.id, index + 1)"
            @dragover.prevent
            @drop="onDrop(row.staff.id, index + 1)"
          >
            <div class="shift-pill" :style="shiftStyle(row.shifts[index]?.shift_type)">
              <span>{{ displayShiftText(row.shifts[index]) }}</span>
              <i v-if="row.shifts[index]?.is_edited" class="dot edited"></i>
              <i v-if="isFixedShift(row.staff.id, index + 1)" class="dot fixed-dot"></i>
            </div>
          </div>
        </template>
      </el-table-column>
    </el-table>

    <div class="legend">
      <div v-for="(meta, key) in legendItems" :key="key" class="legend-item">
        <span class="legend-dot" :style="{ background: meta.bg, borderColor: meta.border }"></span>
        <span>{{ key || '清空' }}</span>
      </div>
      <div class="legend-item">
        <span class="legend-dot edited-outline"></span>
        <span>手动编辑</span>
      </div>
      <div class="legend-item">
        <span class="legend-dot fixed-outline"></span>
        <span>固定班次</span>
      </div>
    </div>

    <el-dialog v-model="pickerVisible" title="调整班次" width="660px" destroy-on-close>
      <div v-if="activeCell" class="picker-header">
        <el-tag type="info" round>{{ activeCell.staffName }}</el-tag>
        <span>{{ activeCell.dateLabel }}</span>
      </div>
      <div class="picker-grid">
        <button
          v-for="shift in SHIFT_TYPES"
          :key="shift"
          class="picker-item"
          :class="{ active: selectedShift === shift }"
          type="button"
          @click="selectedShift = shift"
        >
          <span class="picker-pill" :style="shiftStyle(shift)">{{ shift || '清空' }}</span>
        </button>
      </div>
      <div class="remark-section">
        <el-button size="small" @click="openRemarkDialog">添加备注</el-button>
        <span v-if="currentRemark" class="remark-preview">备注: ({{ currentRemark }})</span>
      </div>
      <template #footer>
        <el-button @click="pickerVisible = false">取消</el-button>
        <el-button type="primary" @click="confirmShift">保存</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="remarkDialogVisible" title="编辑备注" width="420px">
      <el-input
        v-model="remarkInput"
        type="textarea"
        :rows="3"
        placeholder="请输入备注信息，如: 代理、跟岗、入科等"
        maxlength="100"
        show-word-limit
      />
      <template #footer>
        <el-button @click="remarkDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="confirmRemark">确定</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="swapVisible" title="确认交换班次" width="460px">
      <div class="swap-box">
        <p>{{ swapSource?.staffName }} · {{ swapSource?.dateLabel }}</p>
        <p>{{ swapTarget?.staffName }} · {{ swapTarget?.dateLabel }}</p>
      </div>
      <template #footer>
        <el-button @click="swapVisible = false">取消</el-button>
        <el-button type="warning" @click="confirmSwap">确认交换</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { SHIFT_META, SHIFT_TYPES, WEEK_DAYS, type StaffSchedule } from '@/types'

const props = defineProps<{
  weekDates: string[]
  staffData: StaffSchedule[]
  readonly?: boolean
  fixedShifts?: Array<{ staff_id: number; week_day: number; shift_type: string }>
}>()

const emit = defineEmits<{
  (e: 'update-shift', staffId: number, weekDay: number, shiftType: string, remark?: string): void
  (e: 'swap-shifts', source: { staffId: number; weekDay: number }, target: { staffId: number; weekDay: number }): void
}>()

const pickerVisible = ref(false)
const selectedShift = ref('')
const currentRemark = ref('')
const activeCell = ref<{ staffId: number; weekDay: number; staffName: string; dateLabel: string } | null>(null)
const dragSource = ref<{ staffId: number; weekDay: number } | null>(null)
const swapVisible = ref(false)
const swapSource = ref<{ staffId: number; weekDay: number; staffName: string; dateLabel: string } | null>(null)
const swapTarget = ref<{ staffId: number; weekDay: number; staffName: string; dateLabel: string } | null>(null)
const remarkDialogVisible = ref(false)
const remarkInput = ref('')

const legendItems = computed(() => {
  const keys = new Set<string>()
  props.staffData.forEach((row) => {
    row.shifts.forEach((shift) => {
      keys.add(shift?.shift_type || '/')
    })
  })
  return [...keys].sort().reduce<Record<string, typeof SHIFT_META[string]>>((acc, key) => {
    acc[key] = SHIFT_META[key] || SHIFT_META['/']
    return acc
  }, {})
})

function displayShiftText(shift: any): string {
  const shiftType = shift?.shift_type || '/'
  const remark = shift?.remark
  if (remark) {
    return `${shiftType}(${remark})`
  }
  return shiftType
}

function shiftStyle(shift: string | undefined) {
  const meta = SHIFT_META[shift || '/'] || SHIFT_META['/']
  return {
    backgroundColor: meta.bg,
    color: meta.text,
    borderColor: meta.border,
  }
}

function isFixedShift(staffId: number, weekDay: number) {
  return props.fixedShifts?.some((item) => item.staff_id === staffId && item.week_day === weekDay) ?? false
}

function handleCellClass({ column }: { column: { label?: string } }) {
  return column.label?.includes('周六') || column.label?.includes('周日') ? 'weekend-cell' : ''
}

function onCellClick(row: StaffSchedule, column: { label?: string }) {
  if (props.readonly) return
  const index = WEEK_DAYS.findIndex((day) => column.label?.includes(day))
  if (index < 0) return

  activeCell.value = {
    staffId: row.staff.id,
    weekDay: index + 1,
    staffName: row.staff.name,
    dateLabel: `${WEEK_DAYS[index]} ${props.weekDates[index]}`,
  }
  selectedShift.value = row.shifts[index]?.shift_type || ''
  currentRemark.value = row.shifts[index]?.remark || ''
  pickerVisible.value = true
}

function confirmShift() {
  if (!activeCell.value) return
  emit('update-shift', activeCell.value.staffId, activeCell.value.weekDay, selectedShift.value, currentRemark.value || undefined)
  pickerVisible.value = false
}

function openRemarkDialog() {
  remarkInput.value = currentRemark.value
  remarkDialogVisible.value = true
}

function confirmRemark() {
  currentRemark.value = remarkInput.value.trim()
  remarkDialogVisible.value = false
}

function onDragStart(staffId: number, weekDay: number) {
  if (props.readonly) return
  dragSource.value = { staffId, weekDay }
}

function onDrop(staffId: number, weekDay: number) {
  if (props.readonly || !dragSource.value) return
  if (dragSource.value.staffId === staffId && dragSource.value.weekDay === weekDay) {
    dragSource.value = null
    return
  }

  const sourceRow = props.staffData.find((row) => row.staff.id === dragSource.value?.staffId)
  const targetRow = props.staffData.find((row) => row.staff.id === staffId)

  swapSource.value = {
    staffId: dragSource.value.staffId,
    weekDay: dragSource.value.weekDay,
    staffName: sourceRow?.staff.name || '',
    dateLabel: `${WEEK_DAYS[dragSource.value.weekDay - 1]} ${props.weekDates[dragSource.value.weekDay - 1]}`,
  }
  swapTarget.value = {
    staffId,
    weekDay,
    staffName: targetRow?.staff.name || '',
    dateLabel: `${WEEK_DAYS[weekDay - 1]} ${props.weekDates[weekDay - 1]}`,
  }
  swapVisible.value = true
  dragSource.value = null
}

function confirmSwap() {
  if (!swapSource.value || !swapTarget.value) return
  emit('swap-shifts', { staffId: swapSource.value.staffId, weekDay: swapSource.value.weekDay }, { staffId: swapTarget.value.staffId, weekDay: swapTarget.value.weekDay })
  swapVisible.value = false
}
</script>

<style scoped>
.matrix-card {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.matrix-table :deep(.el-table__header th) {
  background: #eff6ff;
  color: #334155;
}

.staff-cell {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
}

.staff-cell p {
  margin: 4px 0 0;
  color: #64748b;
  font-size: 12px;
}

.shift-slot {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 42px;
  cursor: pointer;
  border-radius: 12px;
  transition: background 0.2s ease;
}

.shift-slot:hover {
  background: rgba(148, 163, 184, 0.12);
}

.shift-slot.fixed {
  background: rgba(254, 249, 195, 0.7);
}

.shift-pill {
  min-width: 56px;
  padding: 8px 10px;
  border-radius: 999px;
  border: 1px solid;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: 700;
  position: relative;
}

.dot {
  position: absolute;
  width: 9px;
  height: 9px;
  border-radius: 999px;
}

.dot.edited {
  top: -3px;
  right: -3px;
  background: #2563eb;
  border: 2px solid #fff;
}

.dot.fixed-dot {
  top: -3px;
  left: -3px;
  background: #f59e0b;
  border: 2px solid #fff;
}

.legend {
  display: flex;
  flex-wrap: wrap;
  gap: 14px;
  padding: 14px 16px;
  border-radius: 18px;
  background: rgba(255, 255, 255, 0.72);
  border: 1px solid rgba(148, 163, 184, 0.18);
}

.legend-item {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
  color: #475569;
}

.legend-dot {
  width: 12px;
  height: 12px;
  border-radius: 999px;
  border: 1px solid;
}

.edited-outline {
  background: #fff;
  border: 2px solid #2563eb;
}

.fixed-outline {
  background: #fef3c7;
  border-color: #f59e0b;
}

.picker-header {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 18px;
}

.picker-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 12px;
}

.picker-item {
  border: 1px solid rgba(148, 163, 184, 0.25);
  background: #fff;
  border-radius: 16px;
  padding: 12px;
  cursor: pointer;
}

.picker-item.active {
  border-color: #0f766e;
  box-shadow: 0 0 0 2px rgba(15, 118, 110, 0.12);
}

.picker-pill {
  display: inline-flex;
  width: 100%;
  justify-content: center;
  padding: 8px 10px;
  border-radius: 999px;
  border: 1px solid;
  font-weight: 700;
}

.remark-section {
  margin-top: 16px;
  display: flex;
  align-items: center;
  gap: 12px;
}

.remark-preview {
  font-size: 12px;
  color: #64748b;
}

.swap-box {
  padding: 16px;
  border-radius: 16px;
  background: #f8fafc;
}

:deep(.night-row) {
  --el-table-tr-bg-color: rgba(254, 252, 232, 0.75);
}

:deep(.weekend-header) {
  background: #fef2f2 !important;
}

:deep(.weekend-cell) {
  background: rgba(254, 242, 242, 0.5);
}

@media (max-width: 960px) {
  .picker-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}
</style>
