<template>
  <div class="page">
    <section class="hero">
      <div class="hero-copy">
        <p class="eyebrow">Completely rebuilt frontend</p>
        <h2>以不改变后端接口为前提，重构护士排班工作台。</h2>
        <p>保留排班、生成、校验、休息申请、固定班次和历史追踪的全部流程，同时提升层级、可读性和批量操作效率。</p>
      </div>
      <div class="hero-stats">
        <div class="stat-panel">
          <span>本周起始</span>
          <strong>{{ currentWeekStart || '--' }}</strong>
        </div>
        <div class="stat-panel">
          <span>下周起始</span>
          <strong>{{ nextWeekStart || '--' }}</strong>
        </div>
        <div class="stat-panel">
          <span>人员数量</span>
          <strong>{{ staffList.length }}</strong>
        </div>
      </div>
    </section>

    <section class="toolbar-panel">
      <div class="toolbar-actions">
        <el-button type="primary" @click="openRestDrawer">新增休息申请</el-button>
        <el-button @click="restDrawerVisible = true">休息申请列表</el-button>
        <el-button type="warning" @click="openFixedShiftDrawer">固定班次配置</el-button>
        <el-button type="success" @click="changeLogVisible = true">查看变更历史</el-button>
      </div>
      <p class="toolbar-note">当前周与下周都支持编辑；下周保存前会自动调用后端校验接口。</p>
    </section>

    <section class="week-grid">
      <el-card shadow="never" class="week-card">
        <template #header>
          <div class="card-header">
            <div>
              <p class="card-kicker">Editable Current Week</p>
              <h3>本周排班</h3>
              <span>{{ currentWeekStart }} 至 {{ currentWeekEnd }}</span>
            </div>
            <el-button type="primary" :loading="loading.saveCurrent" @click="saveCurrentWeek">保存本周</el-button>
          </div>
        </template>
        <ScheduleMatrix
          :week-dates="currentWeekDates"
          :staff-data="currentWeekData"
          @update-shift="(staffId, weekDay, shiftType) => updateSchedule('current', staffId, weekDay, shiftType)"
        />
      </el-card>

      <el-card shadow="never" class="week-card">
        <template #header>
          <div class="card-header">
            <div>
              <p class="card-kicker">Next Week Planning</p>
              <h3>下周排班</h3>
              <span>{{ nextWeekStart }} 至 {{ nextWeekEnd }}</span>
            </div>
            <div class="card-actions">
              <el-button :loading="loading.copy" @click="copyFromCurrent">复制本周</el-button>
              <el-button type="success" :loading="loading.generate" @click="generateNextWeek">生成下周</el-button>
              <el-button type="warning" :loading="loading.generate" @click="refreshNextWeek">刷新</el-button>
              <el-button type="primary" :loading="loading.saveNext" @click="saveNextWeek">保存下周</el-button>
            </div>
          </div>
        </template>
        <ScheduleMatrix
          :week-dates="nextWeekDates"
          :staff-data="nextWeekData"
          :fixed-shifts="fixedShiftsForNextWeek"
          @update-shift="(staffId, weekDay, shiftType) => updateSchedule('next', staffId, weekDay, shiftType)"
          @swap-shifts="swapShifts"
        />
      </el-card>
    </section>

    <el-drawer v-model="restDrawerVisible" size="720px" title="休息申请管理">
      <div class="drawer-stack">
        <el-card shadow="never">
          <template #header>新增申请</template>
          <el-form :model="restForm" label-width="96px">
            <el-form-item label="人员">
              <el-select v-model="restForm.staff_id" style="width: 100%" placeholder="请选择人员">
                <el-option v-for="staff in staffList" :key="staff.id" :label="staff.name" :value="staff.id" />
              </el-select>
            </el-form-item>
            <el-form-item label="休息范围">
              <el-date-picker
                v-model="restForm.dateRange"
                type="daterange"
                style="width: 100%"
                start-placeholder="开始日期"
                end-placeholder="结束日期"
                format="YYYY-MM-DD"
                @change="calculateRestDays"
              />
            </el-form-item>
            <el-form-item label="类型">
              <el-select v-model="restForm.request_type" style="width: 100%">
                <el-option label="休息" value="rest" />
                <el-option label="休prn" value="prn" />
                <el-option label="其他" value="other" />
              </el-select>
            </el-form-item>
            <el-form-item label="说明">
              <el-input v-model="restForm.reason" type="textarea" :rows="3" placeholder="可填写补充说明" />
            </el-form-item>
            <el-form-item label="天数">
              <el-tag round type="info">{{ restForm.totalDays }} 天</el-tag>
            </el-form-item>
          </el-form>
          <div class="drawer-actions">
            <el-button type="primary" :loading="loading.rest" @click="submitRestRequest">提交申请</el-button>
          </div>
        </el-card>

        <el-card shadow="never">
          <template #header>申请列表</template>
          <el-table :data="restRequests" border stripe>
            <el-table-column label="人员" width="100">
              <template #default="{ row }">{{ staffMap[row.staff_id] || '-' }}</template>
            </el-table-column>
            <el-table-column prop="week_start" label="开始日期" width="120" />
            <el-table-column label="结束日期" width="120">
              <template #default="{ row }">{{ row.end_date || row.week_start }}</template>
            </el-table-column>
            <el-table-column label="类型" width="110">
              <template #default="{ row }">
                <el-tag :type="row.request_type === 'rest' ? 'info' : row.request_type === 'prn' ? 'warning' : 'success'" round>
                  {{ REQUEST_TYPE_LABEL[row.request_type as keyof typeof REQUEST_TYPE_LABEL] || row.request_type }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column label="状态" width="110">
              <template #default="{ row }">
                <el-tag :type="row.status === 'approved' ? 'success' : row.status === 'rejected' ? 'danger' : 'warning'" round>
                  {{ REQUEST_STATUS_LABEL[row.status as keyof typeof REQUEST_STATUS_LABEL] || row.status }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="reason" label="说明" min-width="180" />
            <el-table-column label="操作" width="170">
              <template #default="{ row }">
                <el-button v-if="row.status === 'pending'" type="success" link @click="approveRequest(row.id, 'approved')">批准</el-button>
                <el-button v-if="row.status === 'pending'" type="danger" link @click="approveRequest(row.id, 'rejected')">拒绝</el-button>
                <el-button type="danger" link @click="deleteRestRequest(row.id)">删除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-card>
      </div>
    </el-drawer>

    <el-drawer v-model="fixedShiftDrawerVisible" size="720px" title="固定班次配置">
      <div class="drawer-stack">
        <el-card shadow="never">
          <template #header>新增固定班次</template>
          <el-form :model="fixedShiftForm" label-width="96px">
            <el-form-item label="人员">
              <el-select v-model="fixedShiftForm.staff_id" style="width: 100%" placeholder="请选择人员">
                <el-option v-for="staff in staffList" :key="staff.id" :label="staff.name" :value="staff.id" />
              </el-select>
            </el-form-item>
            <el-form-item label="日期">
              <el-date-picker v-model="fixedShiftForm.date" type="date" style="width: 100%" />
            </el-form-item>
            <el-form-item label="班次">
              <el-select v-model="fixedShiftForm.shift_type" style="width: 100%">
                <el-option v-for="shift in SHIFT_TYPES" :key="shift" :label="shift || '清空'" :value="shift" />
              </el-select>
            </el-form-item>
            <el-form-item label="备注">
              <el-input v-model="fixedShiftForm.note" placeholder="可填写补充说明" />
            </el-form-item>
          </el-form>
          <div class="drawer-actions">
            <el-button type="primary" :loading="loading.fixedShift" @click="submitFixedShift">保存配置</el-button>
          </div>
        </el-card>

        <el-card shadow="never">
          <template #header>已配置记录</template>
          <el-table :data="fixedShifts" border stripe>
            <el-table-column label="人员" width="100">
              <template #default="{ row }">{{ row.staff_name || staffMap[row.staff_id] || '-' }}</template>
            </el-table-column>
            <el-table-column prop="assign_date" label="日期" width="120" />
            <el-table-column prop="shift_type" label="班次" width="110" />
            <el-table-column prop="note" label="备注" min-width="160" />
            <el-table-column label="操作" width="90">
              <template #default="{ row }">
                <el-button type="danger" link @click="deleteFixedShiftItem(row.id)">删除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-card>
      </div>
    </el-drawer>

    <el-dialog v-model="changeLogVisible" title="排班变更历史" width="980px">
      <el-table :data="changeLogs" border stripe max-height="560">
        <el-table-column label="人员" width="100">
          <template #default="{ row }">{{ staffMap[row.staff_id] || '-' }}</template>
        </el-table-column>
        <el-table-column label="日期" width="150">
          <template #default="{ row }">{{ row.week_start }} {{ weekDayLabel(row.week_day) }}</template>
        </el-table-column>
        <el-table-column prop="old_shift" label="原班次" width="90" />
        <el-table-column prop="new_shift" label="新班次" width="90" />
        <el-table-column prop="change_type" label="类型" width="110" />
        <el-table-column prop="note" label="备注" min-width="180" />
        <el-table-column label="时间" width="180">
          <template #default="{ row }">{{ row.created_at ? new Date(row.created_at).toLocaleString('zh-CN') : '-' }}</template>
        </el-table-column>
      </el-table>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref, watch } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import ScheduleMatrix from '@/components/schedule/ScheduleMatrix.vue'
import { useScheduleStore } from '@/stores/schedule'
import { storeToRefs } from 'pinia'
import { copyWeekSchedule, generateNightSchedule, saveSchedule, validateSchedule } from '@/api/schedule'
import {
  approveStaffRequest,
  createFixedShift,
  createStaffRequest,
  deleteFixedShift,
  deleteStaffRequest,
  getFixedShifts,
  getScheduleChangeLogs,
  getStaffRequests,
} from '@/api/ops'
import { SHIFT_TYPES, REQUEST_STATUS_LABEL, REQUEST_TYPE_LABEL, type FixedShiftAssignment, type RequestStatus, type Schedule, type ScheduleChangeLog, type StaffRequest } from '@/types'
import { formatDate, getNextMonday, getWeekEnd, weekDayLabel } from '@/utils/date'

const scheduleStore = useScheduleStore()
const {
  currentWeekStart,
  nextWeekStart,
  currentWeekDates,
  nextWeekDates,
  currentWeekData,
  nextWeekData,
  currentWeekSchedules,
  nextWeekSchedules,
  staffList,
} = storeToRefs(scheduleStore)

const loading = reactive({
  page: false,
  copy: false,
  generate: false,
  saveCurrent: false,
  saveNext: false,
  rest: false,
  fixedShift: false,
})

const restDrawerVisible = ref(false)
const fixedShiftDrawerVisible = ref(false)
const changeLogVisible = ref(false)
const restRequests = ref<StaffRequest[]>([])
const fixedShifts = ref<FixedShiftAssignment[]>([])
const changeLogs = ref<ScheduleChangeLog[]>([])

const restForm = reactive({
  staff_id: null as number | null,
  dateRange: [] as Date[],
  totalDays: 5,
  request_type: 'rest' as 'rest' | 'prn' | 'other',
  reason: '',
})

const fixedShiftForm = reactive({
  staff_id: null as number | null,
  date: null as Date | null,
  shift_type: '',
  note: '',
})

const staffMap = computed(() =>
  staffList.value.reduce<Record<number, string>>((acc, item) => {
    acc[item.id] = item.name
    return acc
  }, {}),
)

const currentWeekEnd = computed(() => getWeekEnd(currentWeekStart.value))
const nextWeekEnd = computed(() => getWeekEnd(nextWeekStart.value))

const fixedShiftsForNextWeek = computed(() => {
  if (!nextWeekStart.value) return []
  const weekStart = new Date(nextWeekStart.value)
  const weekEnd = new Date(nextWeekStart.value)
  weekEnd.setDate(weekStart.getDate() + 6)

  return fixedShifts.value
    .filter((item) => {
      const date = new Date(item.assign_date)
      return date >= weekStart && date <= weekEnd
    })
    .map((item) => {
      const date = new Date(item.assign_date)
      const day = date.getDay()
      return {
        staff_id: item.staff_id,
        week_day: day === 0 ? 7 : day,
        shift_type: item.shift_type,
      }
    })
})

watch(changeLogVisible, async (visible) => {
  if (visible) {
    const res: any = await getScheduleChangeLogs()
    if (res.code === 0) changeLogs.value = res.data
  }
})

onMounted(async () => {
  loading.page = true
  try {
    await scheduleStore.loadStaffList()
    await scheduleStore.loadWeekRange()
    await Promise.all([
      scheduleStore.loadCurrentWeek(),
      scheduleStore.loadNextWeek(),
      loadRestRequests(),
      loadFixedShifts(),
    ])
  } finally {
    loading.page = false
  }
})

function updateSchedule(target: 'current' | 'next', staffId: number, weekDay: number, shiftType: string) {
  scheduleStore.updateSchedule(target, staffId, weekDay, shiftType, false)
}

function normalizeNextResult(items: any[]): Schedule[] {
  return items.map((item) => ({
    id: item.id || 0,
    staff_id: item.staff_id,
    week_start: item.week_start || nextWeekStart.value,
    week_day: item.week_day,
    shift_type: item.shift_type,
    is_generated: !!item.is_generated,
    is_edited: !!item.is_edited,
    created_at: item.created_at || new Date().toISOString(),
    updated_at: item.updated_at || new Date().toISOString(),
  }))
}

async function saveCurrentWeek() {
  if (!currentWeekSchedules.value.length) {
    ElMessage.warning('本周暂无可保存数据')
    return
  }

  loading.saveCurrent = true
  try {
    const res: any = await saveSchedule(currentWeekSchedules.value)
    if (res.code === 0) {
      ElMessage.success('本周排班保存成功')
      await scheduleStore.loadCurrentWeek()
    }
  } finally {
    loading.saveCurrent = false
  }
}

async function saveNextWeek() {
  if (!nextWeekSchedules.value.length) {
    ElMessage.warning('下周暂无可保存数据')
    return
  }

  loading.saveNext = true
  try {
    const validateRes: any = await validateSchedule(nextWeekSchedules.value, nextWeekStart.value)
    if (validateRes.code === 0 && !validateRes.data.valid) {
      await ElMessageBox.alert(validateRes.data.errors.map((item: { message: string }) => item.message).join('；'), '校验未通过', {
        type: 'error',
      })
      return
    }

    const res: any = await saveSchedule(nextWeekSchedules.value)
    if (res.code === 0) {
      ElMessage.success('下周排班保存成功')
      await scheduleStore.loadNextWeek()
    }
  } finally {
    loading.saveNext = false
  }
}

async function copyFromCurrent() {
  if (!currentWeekStart.value || !nextWeekStart.value) return
  loading.copy = true
  try {
    const res: any = await copyWeekSchedule(currentWeekStart.value, nextWeekStart.value)
    if (res.code === 0) {
      scheduleStore.replaceNextSchedules(normalizeNextResult(res.data))
      ElMessage.success('已复制本周排班到下周')
    }
  } finally {
    loading.copy = false
  }
}

async function generateNextWeek() {
  if (!currentWeekStart.value || !nextWeekStart.value) return
  loading.generate = true
  try {
    const res: any = await generateNightSchedule(currentWeekStart.value, nextWeekStart.value)
    if (res.code === 0) {
      scheduleStore.replaceNextSchedules(normalizeNextResult(res.data))
      ElMessage.success('下周排班生成完成')
    }
  } finally {
    loading.generate = false
  }
}

async function refreshNextWeek() {
  await generateNextWeek()
}

function swapShifts(source: { staffId: number; weekDay: number }, target: { staffId: number; weekDay: number }) {
  const sourceRow = nextWeekData.value.find((row) => row.staff.id === source.staffId)
  const targetRow = nextWeekData.value.find((row) => row.staff.id === target.staffId)
  const sourceShift = sourceRow?.shifts[source.weekDay - 1]?.shift_type || '/'
  const targetShift = targetRow?.shifts[target.weekDay - 1]?.shift_type || '/'

  scheduleStore.updateSchedule('next', source.staffId, source.weekDay, targetShift, false)
  scheduleStore.updateSchedule('next', target.staffId, target.weekDay, sourceShift, false)
  ElMessage.success('班次交换成功')
}

function calculateRestDays() {
  if (restForm.dateRange.length === 2) {
    const [start, end] = restForm.dateRange
    restForm.totalDays = Math.ceil((end.getTime() - start.getTime()) / 86400000) + 1
  }
}

function openRestDrawer() {
  const monday = getNextMonday()
  const friday = new Date(monday)
  friday.setDate(monday.getDate() + 4)
  restForm.staff_id = null
  restForm.dateRange = [monday, friday]
  restForm.totalDays = 5
  restForm.request_type = 'rest'
  restForm.reason = ''
  restDrawerVisible.value = true
}

async function loadRestRequests() {
  const res: any = await getStaffRequests()
  if (res.code === 0) {
    restRequests.value = res.data
  }
}

async function submitRestRequest() {
  if (!restForm.staff_id || restForm.dateRange.length === 0) {
    ElMessage.warning('请选择人员和日期')
    return
  }

  loading.rest = true
  try {
    const startDate = restForm.dateRange[0]
    const endDate = restForm.dateRange[1] || startDate
    const day = startDate.getDay()
    const monday = new Date(startDate)
    monday.setDate(startDate.getDate() - (day === 0 ? 6 : day - 1))

    const res: any = await createStaffRequest({
      staff_id: restForm.staff_id,
      week_start: formatDate(monday),
      week_day: day === 0 ? 7 : day,
      end_date: formatDate(endDate),
      request_type: restForm.request_type,
      reason: restForm.reason,
    })

    if (res.code === 0) {
      ElMessage.success('休息申请已提交')
      await loadRestRequests()
      restDrawerVisible.value = false
    }
  } finally {
    loading.rest = false
  }
}

async function approveRequest(id: number, status: RequestStatus) {
  loading.rest = true
  try {
    const res: any = await approveStaffRequest(id, { status })
    if (res.code === 0) {
      ElMessage.success(status === 'approved' ? '申请已批准' : '申请已拒绝')
      await loadRestRequests()
    }
  } finally {
    loading.rest = false
  }
}

async function deleteRestRequest(id: number) {
  await deleteStaffRequest(id)
  ElMessage.success('申请已删除')
  await loadRestRequests()
}

function openFixedShiftDrawer() {
  fixedShiftForm.staff_id = null
  fixedShiftForm.date = getNextMonday()
  fixedShiftForm.shift_type = ''
  fixedShiftForm.note = ''
  fixedShiftDrawerVisible.value = true
}

async function loadFixedShifts() {
  const res: any = await getFixedShifts()
  if (res.code === 0) {
    fixedShifts.value = res.data
  }
}

async function submitFixedShift() {
  if (!fixedShiftForm.staff_id || !fixedShiftForm.date) {
    ElMessage.warning('请选择人员和日期')
    return
  }

  loading.fixedShift = true
  try {
    const res: any = await createFixedShift({
      staff_id: fixedShiftForm.staff_id,
      assign_date: formatDate(fixedShiftForm.date),
      shift_type: fixedShiftForm.shift_type,
      note: fixedShiftForm.note,
    })
    if (res.code === 0) {
      ElMessage.success('固定班次已保存')
      await loadFixedShifts()
    }
  } finally {
    loading.fixedShift = false
  }
}

async function deleteFixedShiftItem(id: number) {
  await deleteFixedShift(id)
  ElMessage.success('固定班次已删除')
  await loadFixedShifts()
}
</script>

<style scoped>
.page {
  display: flex;
  flex-direction: column;
  gap: 22px;
}

.hero {
  display: grid;
  grid-template-columns: 1.7fr 1fr;
  gap: 22px;
  padding: 28px;
  border-radius: 28px;
  background:
    radial-gradient(circle at top right, rgba(103, 195, 212, 0.28), transparent 30%),
    linear-gradient(135deg, rgba(255, 255, 255, 0.95), rgba(239, 246, 255, 0.92));
  border: 1px solid rgba(148, 163, 184, 0.18);
  box-shadow: var(--soft-shadow);
}

.eyebrow {
  margin: 0 0 10px;
  color: var(--brand-600);
  text-transform: uppercase;
  letter-spacing: 0.08em;
  font-size: 12px;
  font-weight: 700;
}

.hero h2 {
  margin: 0;
  font-size: 34px;
  line-height: 1.18;
  color: var(--ink-900);
}

.hero p:last-child {
  margin: 16px 0 0;
  font-size: 15px;
  line-height: 1.8;
  color: var(--ink-600);
}

.hero-stats {
  display: grid;
  gap: 14px;
}

.stat-panel {
  padding: 18px 20px;
  border-radius: 22px;
  background: rgba(9, 26, 33, 0.94);
  color: #eff6ff;
}

.stat-panel span {
  display: block;
  font-size: 12px;
  color: rgba(226, 232, 240, 0.72);
}

.stat-panel strong {
  display: block;
  margin-top: 8px;
  font-size: 24px;
}

.toolbar-panel {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 18px;
  padding: 18px 22px;
  border-radius: 24px;
  background: rgba(255, 255, 255, 0.84);
  border: 1px solid rgba(148, 163, 184, 0.18);
}

.toolbar-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}

.toolbar-note {
  margin: 0;
  color: var(--ink-500);
  font-size: 13px;
}

.week-grid {
  display: grid;
  gap: 20px;
}

.week-card {
  border-radius: 28px;
  border: 1px solid rgba(148, 163, 184, 0.16);
  background: rgba(255, 255, 255, 0.84);
  box-shadow: var(--soft-shadow);
}

.card-header {
  display: flex;
  justify-content: space-between;
  gap: 18px;
  align-items: center;
}

.card-header h3 {
  margin: 4px 0 6px;
  font-size: 24px;
}

.card-header span {
  color: var(--ink-500);
}

.card-kicker {
  margin: 0;
  color: var(--brand-600);
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.card-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  justify-content: flex-end;
}

.drawer-stack {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.drawer-actions {
  display: flex;
  justify-content: flex-end;
}

@media (max-width: 1100px) {
  .hero,
  .toolbar-panel,
  .card-header {
    grid-template-columns: 1fr;
    flex-direction: column;
    align-items: flex-start;
  }

  .card-actions {
    justify-content: flex-start;
  }
}
</style>
