<template>
  <div class="schedule-view">
    <div class="toolbar">
      <el-button type="primary" @click="showRestDialog" :icon="Plus">添加休息请求</el-button>
      <el-button type="info" @click="restListVisible = true" :icon="List">休息请求列表</el-button>
      <el-button type="warning" @click="showFixedShiftDialog" :icon="Calendar">固定班次分配</el-button>
      <el-button type="success" @click="changeLogVisible = true" :icon="Document">修改历史</el-button>
    </div>

    <el-card class="week-card" shadow="hover" v-loading="loading.page">
      <template #header>
        <div class="card-header">
          <div class="header-left">
            <el-icon :size="20" color="#409EFF"><Calendar /></el-icon>
            <span class="title">本周排班</span>
            <el-tag type="warning" size="small" style="margin-left: 10px">可编辑</el-tag>
          </div>
          <div class="header-right">
            <span class="date-range">{{ currentWeekStart }} ~ {{ currentWeekEnd }}</span>
            <el-button type="primary" @click="saveCurrentWeek" :loading="loading.save" :icon="Check" style="margin-left: 15px">保存</el-button>
          </div>
        </div>
      </template>
      <ScheduleTable
        :week-dates="weekDates"
        :staff-data="currentWeekData"
        :readonly="false"
        @update-shift="handleUpdateCurrentShift"
      />
    </el-card>

    <el-card class="week-card" shadow="hover" v-loading="loading.page">
      <template #header>
        <div class="card-header">
          <div class="header-left">
            <el-icon :size="20" color="#67C23A"><Calendar /></el-icon>
            <span class="title">下周排班</span>
          </div>
          <div class="header-right">
            <span class="date-range">{{ nextWeekStart }} ~ {{ nextWeekEnd }}</span>
            <el-button-group style="margin-left: 15px">
              <el-button type="primary" @click="copyFromCurrent" :loading="loading.copy" :icon="CopyDocument">拷贝本周</el-button>
              <el-button type="success" @click="generateNextWeek" :loading="loading.generate" :icon="Lightning">生成下周</el-button>
              <el-button type="warning" @click="refreshNextWeek" :loading="loading.generate" :icon="Refresh">刷新</el-button>
              <el-button type="primary" @click="saveNextWeek" :loading="loading.save" :icon="Check">保存</el-button>
            </el-button-group>
          </div>
        </div>
      </template>
      <ScheduleTable
        :week-dates="nextWeekDates"
        :staff-data="nextWeekData"
        :readonly="false"
        :fixed-shifts="fixedShiftsForWeek"
        @update-shift="handleUpdateShift"
        @swap-shifts="handleSwapShifts"
      />
    </el-card>

    <el-dialog v-model="restDialogVisible" title="添加休息请求" width="600px">
      <el-form :model="restForm" label-width="100px">
        <el-form-item label="员工">
          <el-select v-model="restForm.staff_id" placeholder="选择员工" style="width: 100%">
            <el-option v-for="s in staffList" :key="s.id" :label="s.name" :value="s.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="休息范围">
          <el-date-picker
            v-model="restForm.dateRange"
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            style="width: 100%"
            :disabled-date="disabledRestDate"
            format="YYYY-MM-DD (周ddd)"
            @change="calculateRestDays"
          />
        </el-form-item>
        <el-form-item label="休息天数">
          <el-tag type="info" size="large">{{ restForm.totalDays }} 天</el-tag>
        </el-form-item>
        <el-form-item label="类型">
          <el-select v-model="restForm.request_type" style="width: 100%">
            <el-option label="休息" value="rest" />
            <el-option label="休息待命" value="prn" />
            <el-option label="其他" value="other" />
          </el-select>
        </el-form-item>
        <el-form-item label="原因">
          <el-input v-model="restForm.reason" type="textarea" :rows="2" placeholder="可选" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="restDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitRestRequest">确定</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="restListVisible" title="休息请求管理" width="1000px">
      <el-table :data="restRequests" stripe border>
        <el-table-column label="姓名" width="100">
          <template #default="{ row }">
            {{ staffMap[row.staff_id] || '' }}
          </template>
        </el-table-column>
        <el-table-column label="开始日期" width="120">
          <template #default="{ row }">
            {{ row.week_start }}
          </template>
        </el-table-column>
        <el-table-column label="结束日期" width="120">
          <template #default="{ row }">
            {{ row.end_date || row.week_start }}
          </template>
        </el-table-column>
        <el-table-column label="天数" width="80" align="center">
          <template #default="{ row }">
            <el-tag size="small">{{ row.total_days || 1 }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="类型" width="100">
          <template #default="{ row }">
            <el-tag :type="row.request_type === 'rest' ? 'info' : row.request_type === 'prn' ? 'warning' : ''" size="small">
              {{ row.request_type === 'rest' ? '休息' : row.request_type === 'prn' ? '待命' : '其他' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="reason" label="原因" min-width="150" />
        <el-table-column label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="row.status === 'approved' ? 'success' : row.status === 'rejected' ? 'danger' : 'warning'" size="small">
              {{ row.status === 'approved' ? '已批准' : row.status === 'rejected' ? '已拒绝' : '待审批' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="审批人" width="100">
          <template #default="{ row }">
            {{ row.approved_by || '-' }}
          </template>
        </el-table-column>
        <el-table-column label="审批时间" width="160">
          <template #default="{ row }">
            {{ row.approved_at ? new Date(row.approved_at).toLocaleString('zh-CN') : '-' }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="180">
          <template #default="{ row }">
            <el-button v-if="row.status === 'pending'" type="success" link size="small" @click="approveRequest(row.id, 'approved')">批准</el-button>
            <el-button v-if="row.status === 'pending'" type="danger" link size="small" @click="approveRequest(row.id, 'rejected')">拒绝</el-button>
            <el-button type="danger" link size="small" @click="deleteRestRequest(row.id)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-dialog>

    <el-dialog v-model="fixedShiftDialogVisible" title="固定班次分配" width="700px">
      <el-form :model="fixedShiftForm" label-width="100px">
        <el-form-item label="员工">
          <el-select v-model="fixedShiftForm.staff_id" placeholder="选择员工" style="width: 100%">
            <el-option v-for="s in staffList" :key="s.id" :label="s.name" :value="s.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="日期">
          <el-date-picker
            v-model="fixedShiftForm.date"
            type="date"
            placeholder="选择日期"
            style="width: 100%"
            format="YYYY-MM-DD (周ddd)"
          />
        </el-form-item>
        <el-form-item label="班次">
          <el-select v-model="fixedShiftForm.shift_type" style="width: 100%">
            <el-option v-for="s in shiftTypes" :key="s" :label="s || '清空'" :value="s" />
          </el-select>
        </el-form-item>
        <el-form-item label="备注">
          <el-input v-model="fixedShiftForm.note" placeholder="可选" />
        </el-form-item>
      </el-form>
      <el-divider>已分配的固定班次</el-divider>
      <el-table :data="fixedShifts" stripe border size="small" max-height="300">
        <el-table-column label="姓名" width="100">
          <template #default="{ row }">
            {{ row.staff_name || staffMap[row.staff_id] || '' }}
          </template>
        </el-table-column>
        <el-table-column label="日期" width="120">
          <template #default="{ row }">
            {{ row.assign_date }}
          </template>
        </el-table-column>
        <el-table-column label="班次" width="100" align="center">
          <template #default="{ row }">
            <el-tag size="small">{{ row.shift_type || '/' }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="note" label="备注" min-width="150" />
        <el-table-column label="操作" width="80">
          <template #default="{ row }">
            <el-button type="danger" link size="small" @click="deleteFixedShiftItem(row.id)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
      <template #footer>
        <el-button @click="fixedShiftDialogVisible = false">关闭</el-button>
        <el-button type="primary" @click="submitFixedShift">添加分配</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="changeLogVisible" title="修改历史" width="900px">
      <el-table :data="changeLogs" stripe border>
        <el-table-column label="姓名" width="100">
          <template #default="{ row }">
            {{ staffMap[row.staff_id] || '' }}
          </template>
        </el-table-column>
        <el-table-column label="日期" width="150">
          <template #default="{ row }">
            {{ row.week_start }} (周{{ ['', '一', '二', '三', '四', '五', '六', '日'][row.week_day] }})
          </template>
        </el-table-column>
        <el-table-column label="原班次" width="100" align="center">
          <template #default="{ row }">
            <el-tag size="small" type="info">{{ row.old_shift || '/' }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="新班次" width="100" align="center">
          <template #default="{ row }">
            <el-tag size="small" type="success">{{ row.new_shift || '/' }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="类型" width="100">
          <template #default="{ row }">
            <el-tag :type="row.change_type === 'generated' ? 'primary' : 'warning'" size="small">
              {{ row.change_type === 'manual_edit' ? '手动编辑' : row.change_type === 'swap' ? '交换' : row.change_type === 'drag_drop' ? '拖拽' : '自动生成' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="note" label="备注" min-width="150" />
        <el-table-column label="时间" width="160">
          <template #default="{ row }">
            {{ row.created_at ? new Date(row.created_at).toLocaleString('zh-CN') : '-' }}
          </template>
        </el-table-column>
      </el-table>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { onMounted, computed, ref, reactive, watch } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Calendar, CopyDocument, Lightning, Refresh, Check, Plus, List, Document } from '@element-plus/icons-vue'
import { useScheduleStore } from '../stores/schedule'
import { storeToRefs } from 'pinia'
import ScheduleTable from '../components/ScheduleTable.vue'
import { generateNightSchedule, copyWeekSchedule, validateSchedule, saveSchedule } from '../api/schedule'
import { getStaffRequests, createStaffRequest, approveStaffRequest, deleteStaffRequest, getFixedShifts, createFixedShift, deleteFixedShift, getScheduleChangeLogs } from '../api/staffRequest'
import { SHIFT_TYPES } from '../types'

const store = useScheduleStore()
const { currentWeekStart, nextWeekStart, weekDates, nextWeekDates, currentWeekData, nextWeekData, nextWeekSchedules, currentWeekSchedules, staffList } = storeToRefs(store)

const staffMap = computed(() => {
  const map: Record<number, string> = {}
  staffList.value.forEach(s => { map[s.id] = s.name })
  return map
})

const currentWeekEnd = computed(() => {
  if (!currentWeekStart.value) return ''
  const d = new Date(currentWeekStart.value)
  d.setDate(d.getDate() + 6)
  return formatDate(d)
})

const nextWeekEnd = computed(() => {
  if (!nextWeekStart.value) return ''
  const d = new Date(nextWeekStart.value)
  d.setDate(d.getDate() + 6)
  return formatDate(d)
})

function formatDate(d: Date) {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

const shiftTypes = SHIFT_TYPES

const restDialogVisible = ref(false)
const restListVisible = ref(false)
const restRequests = ref<any[]>([])
const fixedShiftDialogVisible = ref(false)
const fixedShifts = ref<any[]>([])
const changeLogVisible = ref(false)
const changeLogs = ref<any[]>([])

watch(changeLogVisible, async (visible) => {
  if (visible) {
    await loadChangeLogs()
  }
})

const loading = ref({
  page: false,
  generate: false,
  copy: false,
  save: false,
  rest: false,
  retryCount: 0,
})
const MAX_RETRIES = 2

const restForm = reactive({
  staff_id: null as number | null,
  dateRange: [] as Date[],
  totalDays: 1,
  request_type: 'rest',
  reason: '',
})

const fixedShiftForm = reactive({
  staff_id: null as number | null,
  date: null as Date | null,
  shift_type: '',
  note: '',
})

const fixedShiftsForWeek = computed(() => {
  if (!nextWeekStart.value || fixedShifts.value.length === 0) return []
  const weekStart = new Date(nextWeekStart.value)
  const weekEnd = new Date(weekStart)
  weekEnd.setDate(weekStart.getDate() + 6)

  return fixedShifts.value
    .filter(f => {
      const d = new Date(f.assign_date)
      return d >= weekStart && d <= weekEnd
    })
    .map(f => {
      const d = new Date(f.assign_date)
      const dayOfWeek = d.getDay()
      const weekDay = dayOfWeek === 0 ? 7 : dayOfWeek
      return {
        staff_id: f.staff_id,
        week_day: weekDay,
        shift_type: f.shift_type,
      }
    })
})

function disabledRestDate(time: Date) {
  const now = new Date()
  now.setHours(0, 0, 0, 0)
  return time.getTime() < now.getTime()
}

function getNextMonday(): Date {
  const now = new Date()
  const dayOfWeek = now.getDay()
  const daysUntilMonday = dayOfWeek === 0 ? 1 : 8 - dayOfWeek
  const nextMonday = new Date(now)
  nextMonday.setDate(now.getDate() + daysUntilMonday)
  return nextMonday
}

function calculateRestDays() {
  if (restForm.dateRange && restForm.dateRange.length === 2) {
    const start = restForm.dateRange[0]
    const end = restForm.dateRange[1]
    const diffTime = end.getTime() - start.getTime()
    restForm.totalDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1
  } else {
    restForm.totalDays = 1
  }
}

onMounted(async () => {
  loading.value.page = true
  let retries = 0
  while (retries <= MAX_RETRIES) {
    try {
      await store.loadStaffList()
      await store.loadWeekRange()
      await store.loadCurrentWeek()
      await store.loadNextWeek()
      await loadRestRequests()
      await loadFixedShifts()
      break
    } catch (e: any) {
      retries++
      if (retries > MAX_RETRIES) {
        ElMessage.error('加载失败，请检查网络连接')
      } else {
        await new Promise(resolve => setTimeout(resolve, 1000 * retries))
      }
    } finally {
      loading.value.page = false
    }
  }
})

async function loadRestRequests() {
  loading.value.rest = true
  try {
    const res: any = await getStaffRequests()
    if (res.code === 0) {
      restRequests.value = res.data
    }
  } finally {
    loading.value.rest = false
  }
}

async function loadFixedShifts() {
  try {
    const res: any = await getFixedShifts()
    if (res.code === 0) {
      fixedShifts.value = res.data
    }
  } catch (e: any) {
    console.error('Failed to load fixed shifts:', e)
  }
}

function handleUpdateShift(staffId: number, weekDay: number, shiftType: string) {
  store.updateNextWeekSchedule(staffId, weekDay, shiftType)
}

function handleUpdateCurrentShift(staffId: number, weekDay: number, shiftType: string) {
  store.updateCurrentWeekSchedule(staffId, weekDay, shiftType)
}

async function saveCurrentWeek() {
  if (!currentWeekSchedules.value || currentWeekSchedules.value.length === 0) {
    ElMessage.warning('没有可保存的排班数据')
    return
  }
  loading.value.save = true
  try {
    const saveRes: any = await saveSchedule(currentWeekSchedules.value)
    if (saveRes.code === 0) {
      ElMessage.success('保存成功')
      await store.loadCurrentWeek()
    } else {
      ElMessage.error('保存失败:' + (saveRes.message || '未知错误'))
    }
  } catch (e: any) {
    ElMessage.error('保存失败:' + e.message)
  } finally {
    loading.value.save = false
  }
}

function handleSwapShifts(source: { staffId: number; weekDay: number }, target: { staffId: number; weekDay: number }) {
  const sourceRow = nextWeekData.value.find(r => r.staff.id === source.staffId)
  const targetRow = nextWeekData.value.find(r => r.staff.id === target.staffId)
  const sourceShift = sourceRow?.shifts[source.weekDay - 1]?.shift_type || '/'
  const targetShift = targetRow?.shifts[target.weekDay - 1]?.shift_type || '/'

  store.updateNextWeekSchedule(source.staffId, source.weekDay, targetShift)
  store.updateNextWeekSchedule(target.staffId, target.weekDay, sourceShift)
  ElMessage.success('交换成功')
}

async function copyFromCurrent() {
  if (!currentWeekStart.value || !nextWeekStart.value) {
    ElMessage.warning('请先加载排班数据')
    return
  }
  if (nextWeekSchedules.value.length > 0) {
    try {
      await ElMessageBox.confirm(
        '下周已有排班数据，拷贝将覆盖所有数据。此操作不可恢复，是否继续？',
        '确认拷贝',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning',
          distinguishCancelAndClose: true,
        }
      )
    } catch {
      return
    }
  }
  loading.value.copy = true
  try {
    const res: any = await copyWeekSchedule(currentWeekStart.value, nextWeekStart.value)
    if (res.code === 0) {
      store.clearNextWeekSchedules()
      for (const item of res.data) {
        store.updateNextWeekSchedule(item.staff_id, item.week_day, item.shift_type)
      }
      ElMessage.success('拷贝成功')
    } else {
      ElMessage.error('拷贝失败:' + (res.message || '未知错误'))
    }
  } catch (e: any) {
    ElMessage.error('拷贝失败:' + e.message)
  } finally {
    loading.value.copy = false
  }
}

async function generateNextWeek() {
  if (!currentWeekStart.value || !nextWeekStart.value) {
    ElMessage.warning('请先加载排班数据')
    return
  }
  if (nextWeekSchedules.value.length > 0) {
    try {
      await ElMessageBox.confirm(
        '下周已有排班数据，重新生成将覆盖夜班组人员的排班。非夜班组数据将保留，是否继续？',
        '确认生成',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning',
          distinguishCancelAndClose: true,
        }
      )
    } catch {
      return
    }
  }
  loading.value.generate = true
  try {
    const res: any = await generateNightSchedule(currentWeekStart.value, nextWeekStart.value)
    if (res.code === 0 && res.data && res.data.length > 0) {
      store.clearNextWeekSchedules()
      for (const item of res.data) {
        const isNight = item.is_generated === true
        store.updateNextWeekSchedule(item.staff_id, item.week_day, item.shift_type, isNight)
      }
      ElMessage.success('生成成功，共 ' + res.data.length + ' 条排班')
    } else {
      ElMessage.error('生成失败:' + (res.message || '未知错误'))
    }
  } catch (e: any) {
    ElMessage.error('生成失败:' + e.message)
  } finally {
    loading.value.generate = false
  }
}

async function refreshNextWeek() {
  await generateNextWeek()
}

async function saveNextWeek() {
  if (!nextWeekSchedules.value || nextWeekSchedules.value.length === 0) {
    ElMessage.warning('没有可保存的排班数据')
    return
  }
  loading.value.save = true
  try {
    const res: any = await validateSchedule(nextWeekSchedules.value, nextWeekStart.value)
    if (res.code === 0 && !res.data.valid) {
      const msgs = res.data.errors.map((e: any) => e.message).join('；')
      await ElMessageBox.alert(msgs, '排班规则校验失败', { type: 'error', confirmButtonText: '确定' })
      return
    }
    const saveRes: any = await saveSchedule(nextWeekSchedules.value)
    if (saveRes.code === 0) {
      ElMessage.success('保存成功')
      await store.loadNextWeek()
    } else {
      ElMessage.error('保存失败:' + (saveRes.message || '未知错误'))
    }
  } catch (e: any) {
    ElMessage.error('保存失败:' + e.message)
  } finally {
    loading.value.save = false
  }
}

function showRestDialog() {
  restForm.staff_id = null
  const monday = getNextMonday()
  const friday = new Date(monday)
  friday.setDate(monday.getDate() + 4)
  restForm.dateRange = [monday, friday]
  restForm.totalDays = 5
  restForm.request_type = 'rest'
  restForm.reason = ''
  restDialogVisible.value = true
}

async function submitRestRequest() {
  if (!restForm.staff_id || !restForm.dateRange || restForm.dateRange.length < 1) {
    ElMessage.warning('请选择员工和日期')
    return
  }

  const startDate = restForm.dateRange[0]
  const endDate = restForm.dateRange.length === 2 ? restForm.dateRange[1] : startDate

  const dayOfWeek = startDate.getDay()
  const daysSinceMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1
  const monday = new Date(startDate)
  monday.setDate(startDate.getDate() - daysSinceMonday)
  monday.setHours(0, 0, 0, 0)
  const weekStart = formatDate(monday)
  const weekDay = dayOfWeek === 0 ? 7 : dayOfWeek

  loading.value.rest = true
  try {
    const res: any = await createStaffRequest({
      staff_id: restForm.staff_id,
      week_start: weekStart,
      week_day: weekDay,
      end_date: formatDate(endDate),
      request_type: restForm.request_type,
      reason: restForm.reason,
    })
    if (res.code === 0) {
      ElMessage.success('添加成功，共 ' + (res.data.total_days || 1) + ' 天')
      restDialogVisible.value = false
      await loadRestRequests()
    } else {
      ElMessage.error('添加失败: ' + (res.message || '未知错误'))
    }
  } catch (e: any) {
    ElMessage.error('添加失败: ' + e.message)
  } finally {
    loading.value.rest = false
  }
}

async function approveRequest(id: number, status: string) {
  const action = status === 'approved' ? '批准' : '拒绝'
  loading.value.rest = true
  try {
    await ElMessageBox.confirm(`确定要${action}此休息请求吗？`, '确认', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    })
    const res: any = await approveStaffRequest(id, { status })
    if (res.code === 0) {
      ElMessage.success(`${action}成功`)
      await loadRestRequests()
    } else {
      ElMessage.error(`${action}失败: ` + (res.message || '未知错误'))
    }
  } catch (e: any) {
    if (e !== 'cancel') {
      ElMessage.error(`${action}失败: ` + e.message)
    }
  } finally {
    loading.value.rest = false
  }
}

async function deleteRestRequest(id: number) {
  loading.value.rest = true
  try {
    await ElMessageBox.confirm('确定要删除此休息请求吗？', '确认', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    })
    const res: any = await deleteStaffRequest(id)
    if (res.code === 0) {
      ElMessage.success('删除成功')
      await loadRestRequests()
    } else {
      ElMessage.error('删除失败: ' + (res.message || '未知错误'))
    }
  } catch (e: any) {
    if (e !== 'cancel') {
      ElMessage.error('删除失败: ' + e.message)
    }
  } finally {
    loading.value.rest = false
  }
}

function showFixedShiftDialog() {
  fixedShiftForm.staff_id = null
  fixedShiftForm.date = getNextMonday()
  fixedShiftForm.shift_type = ''
  fixedShiftForm.note = ''
  fixedShiftDialogVisible.value = true
}

async function submitFixedShift() {
  if (!fixedShiftForm.staff_id || !fixedShiftForm.date) {
    ElMessage.warning('请选择员工和日期')
    return
  }
  loading.value.rest = true
  try {
    const res: any = await createFixedShift({
      staff_id: fixedShiftForm.staff_id,
      assign_date: formatDate(fixedShiftForm.date),
      shift_type: fixedShiftForm.shift_type,
      note: fixedShiftForm.note,
    })
    if (res.code === 0) {
      ElMessage.success('添加成功')
      await loadFixedShifts()
    } else {
      ElMessage.error('添加失败: ' + (res.message || '未知错误'))
    }
  } catch (e: any) {
    ElMessage.error('添加失败: ' + e.message)
  } finally {
    loading.value.rest = false
  }
}

async function deleteFixedShiftItem(id: number) {
  loading.value.rest = true
  try {
    await ElMessageBox.confirm('确定要删除此固定班次分配吗？', '确认', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    })
    const res: any = await deleteFixedShift(id)
    if (res.code === 0) {
      ElMessage.success('删除成功')
      await loadFixedShifts()
    } else {
      ElMessage.error('删除失败: ' + (res.message || '未知错误'))
    }
  } catch (e: any) {
    if (e !== 'cancel') {
      ElMessage.error('删除失败: ' + e.message)
    }
  } finally {
    loading.value.rest = false
  }
}

async function loadChangeLogs() {
  try {
    const res: any = await getScheduleChangeLogs()
    if (res.code === 0) {
      changeLogs.value = res.data
    }
  } catch (e: any) {
    console.error('Failed to load change logs:', e)
  }
}
</script>

<style scoped>
.schedule-view {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.toolbar {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.week-card {
  margin-bottom: 0;
}

.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 8px;
}

.header-left .title {
  font-size: 16px;
  font-weight: 600;
  color: #303133;
}

.header-right {
  display: flex;
  align-items: center;
}

.date-range {
  font-size: 14px;
  color: #606266;
  font-weight: 500;
}
</style>
