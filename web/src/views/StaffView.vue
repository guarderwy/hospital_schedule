<template>
  <div class="staff-view">
    <el-card shadow="hover" v-loading="loading.page">
      <template #header>
        <div class="card-header">
          <div class="header-left">
            <el-icon :size="20" color="#409EFF"><User /></el-icon>
            <span class="title">人员管理</span>
            <el-tag type="info" size="small" style="margin-left: 10px">共 {{ staffList.length }} 人</el-tag>
          </div>
          <el-button type="primary" @click="showAddDialog" :icon="Plus">新增人员</el-button>
        </div>
      </template>

      <el-table :data="staffList" stripe style="width: 100%" border>
        <el-table-column prop="name" label="姓名" width="120" />
        <el-table-column prop="level" label="能级" width="80" align="center">
          <template #default="{ row }">
            <el-tag v-if="row.level" :type="getLevelType(row.level)" size="small">{{ row.level }}</el-tag>
            <span v-else>-</span>
          </template>
        </el-table-column>
        <el-table-column prop="title" label="职称" width="120" />
        <el-table-column prop="role" label="岗位" width="120" />
        <el-table-column prop="bed_range" label="管床范围" width="120" />
        <el-table-column label="夜班组" width="80" align="center">
          <template #default="{ row }">
            <el-tag v-if="row.is_night_team" type="warning" size="small">夜班组</el-tag>
            <span v-else>-</span>
          </template>
        </el-table-column>
        <el-table-column label="状态" width="100" align="center">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.status)" size="small">{{ statusText(row.status) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="150" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link @click="editStaff(row)">编辑</el-button>
            <el-button type="danger" link @click="deleteStaff(row.id)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <el-card shadow="hover" style="margin-top: 20px" v-loading="loading.page">
      <template #header>
        <div class="card-header">
          <div class="header-left">
            <el-icon :size="20" color="#67C23A"><Sort /></el-icon>
            <span class="title">夜班组配置</span>
            <el-tag type="info" size="small" style="margin-left: 10px">拖拽调整轮转顺序</el-tag>
          </div>
          <el-button type="success" @click="saveNightTeamOrder" :loading="loading.save" :icon="Check">保存顺序</el-button>
        </div>
      </template>

      <el-table ref="nightTableRef" :data="nightTeamList" stripe style="width: 100%" border>
        <el-table-column label="顺序" width="80" align="center">
          <template #default="{ $index }">
            <el-tag type="primary" size="small">{{ $index + 1 }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="name" label="姓名" width="120" />
        <el-table-column prop="level" label="能级" width="80" />
        <el-table-column prop="title" label="职称" width="120" />
        <el-table-column label="操作" width="150" align="center">
          <template #default="{ $index }">
            <el-button
              type="primary"
              link
              :icon="Top"
              :disabled="$index === 0"
              @click="moveUp($index)"
            >上移</el-button>
            <el-button
              type="primary"
              link
              :icon="Bottom"
              :disabled="$index === nightTeamList.length - 1"
              @click="moveDown($index)"
            >下移</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <el-dialog
      v-model="dialogVisible"
      :title="isEdit ? '编辑人员' : '新增人员'"
      width="500px"
    >
      <el-form :model="form" label-width="80px" class="staff-form">
        <el-form-item label="姓名" required>
          <el-input v-model="form.name" placeholder="请输入姓名" />
        </el-form-item>
        <el-form-item label="能级">
          <el-select v-model="form.level" placeholder="选择能级" style="width: 100%">
            <el-option label="N0" value="N0" />
            <el-option label="N1" value="N1" />
            <el-option label="N2" value="N2" />
            <el-option label="N3" value="N3" />
          </el-select>
        </el-form-item>
        <el-form-item label="职称">
          <el-input v-model="form.title" placeholder="请输入职称" />
        </el-form-item>
        <el-form-item label="岗位">
          <el-input v-model="form.role" placeholder="请输入岗位" />
        </el-form-item>
        <el-form-item label="管床范围">
          <el-input v-model="form.bed_range" placeholder="如: 1-10床" />
        </el-form-item>
        <el-form-item label="夜班组">
          <el-switch v-model="form.is_night_team" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSubmit">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, watch, nextTick } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { User, Plus, Sort, Check, Top, Bottom } from '@element-plus/icons-vue'
import Sortable from 'sortablejs'
import { getStaffList, createStaff, updateStaff, deleteStaff as apiDeleteStaff, updateNightTeamOrder } from '../api/staff'
import type { Staff } from '../types'

const staffList = ref<Staff[]>([])
const dialogVisible = ref(false)
const isEdit = ref(false)
const loading = ref({
  page: false,
  save: false,
  retryCount: 0,
})
const MAX_RETRIES = 2
const form = ref<Partial<Staff>>({
  name: '',
  level: 'N1',
  title: '',
  role: '',
  bed_range: '',
  is_night_team: false,
})

const nightTeamList = ref<Staff[]>([])
const nightTableRef = ref<HTMLElement | null>(null)
let sortableInstance: Sortable | null = null

watch(staffList, (list) => {
  nightTeamList.value = list
    .filter((s) => s.is_night_team)
    .sort((a, b) => (a.night_team_order || 0) - (b.night_team_order || 0))
}, { immediate: true, deep: true })

watch(nightTeamList, async () => {
  await nextTick()
  initSortable()
}, { deep: true })

function initSortable() {
  if (sortableInstance) {
    sortableInstance.destroy()
  }
  if (!nightTableRef.value) return
  
  const el = nightTableRef.value.querySelector('.el-table__body-wrapper tbody')
  if (!el) return
  
  sortableInstance = Sortable.create(el as HTMLElement, {
    animation: 150,
    onEnd: (evt) => {
      const list = [...nightTeamList.value]
      const [moved] = list.splice(evt.oldIndex, 1)
      list.splice(evt.newIndex, 0, moved)
      updateLocalOrder(list)
    },
  })
}

onMounted(() => {
  loadStaff()
})

async function loadStaff() {
  loading.value.page = true
  let retries = 0
  while (retries <= MAX_RETRIES) {
    try {
      const res: any = await getStaffList()
      if (res.code === 0) {
        staffList.value = res.data
        break
      }
    } catch (e: any) {
      retries++
      if (retries > MAX_RETRIES) {
        ElMessage.error('加载人员列表失败')
      } else {
        await new Promise(resolve => setTimeout(resolve, 1000 * retries))
      }
    } finally {
      loading.value.page = false
    }
  }
}

function statusText(status: string) {
  const map: Record<string, string> = {
    active: '在岗',
    leave: '请假',
    transfer: '调离',
  }
  return map[status] || status
}

function getStatusType(status: string) {
  const map: Record<string, any> = {
    active: 'success',
    leave: 'warning',
    transfer: 'danger',
  }
  return map[status] || 'info'
}

function getLevelType(level: string) {
  const map: Record<string, any> = {
    N0: 'info',
    N1: '',
    N2: 'success',
    N3: 'warning',
  }
  return map[level] || 'info'
}

function showAddDialog() {
  isEdit.value = false
  form.value = {
    name: '',
    level: 'N1',
    title: '',
    role: '',
    bed_range: '',
    is_night_team: false,
  }
  dialogVisible.value = true
}

function editStaff(staff: Staff) {
  isEdit.value = true
  form.value = { ...staff }
  dialogVisible.value = true
}

async function saveStaff() {
  
  if (!form.value.name) {
    ElMessage.warning('请输入姓名')
    return
  }
  loading.value.save = true
  try {
    const res: any = isEdit.value
      ? await updateStaff(form.value.id!, form.value)
      : await createStaff(form.value)
    if (res.code === 0) {
      ElMessage.success(isEdit.value ? '更新成功' : '新增成功')
      dialogVisible.value = false
      await loadStaff()
    }
  } catch (e: any) {
    ElMessage.error('操作失败：' + (e.message || '未知错误'))
  } finally {
    loading.value.save = false
  }
}

async function deleteStaff(id: number) {
  try {
    await ElMessageBox.confirm(
      '删除后该人员的排班记录将保留，但状态会变为"离职"。此操作不可恢复，是否继续？',
      '确认删除人员',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
        distinguishCancelAndClose: true,
      }
    )
    const res: any = await apiDeleteStaff(id)
    if (res.code === 0) {
      ElMessage.success('删除成功')
      await loadStaff()
    }
  } catch (e: any) {
    if (e !== 'cancel') {
      ElMessage.error('删除失败：' + (e.message || '未知错误'))
    }
  }
}

function moveUp(index: number) {
  if (index === 0) return
  const list = [...nightTeamList.value]
  const temp = list[index]
  list[index] = list[index - 1]
  list[index - 1] = temp
  updateLocalOrder(list)
}

function moveDown(index: number) {
  if (index === nightTeamList.value.length - 1) return
  const list = [...nightTeamList.value]
  const temp = list[index]
  list[index] = list[index + 1]
  list[index + 1] = temp
  updateLocalOrder(list)
}

function updateLocalOrder(list: Staff[]) {
  list.forEach((s, i) => {
    const found = staffList.value.find((x) => x.id === s.id)
    if (found) found.night_team_order = i + 1
  })
}

async function saveNightTeamOrder() {
  loading.value.save = true
  try {
    const orders = nightTeamList.value.map((s, i) => ({
      id: s.id,
      order: i + 1,
    }))
    const res: any = await updateNightTeamOrder(orders)
    if (res.code === 0) {
      ElMessage.success('保存成功')
      await loadStaff()
    } else {
      ElMessage.error('保存失败：' + (res.message || '未知错误'))
    }
  } catch (e: any) {
    ElMessage.error('保存失败：' + (e.message || '未知错误'))
  } finally {
    loading.value.save = false
  }
}
</script>

<style scoped>
.staff-view {
  padding: 0;
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

:deep(.sortable-ghost) {
  opacity: 0.4;
  background-color: #f5f7fa;
}

:deep(.sortable-chosen) {
  background-color: #ecf5ff;
}

:deep(.sortable-drag) {
  opacity: 0.8;
}
</style>
