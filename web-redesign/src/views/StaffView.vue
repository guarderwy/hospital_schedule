<template>
  <div class="page">
    <section class="stats-grid">
      <article class="metric">
        <span>在岗人数</span>
        <strong>{{ staffList.length }}</strong>
      </article>
      <article class="metric">
        <span>夜班组人数</span>
        <strong>{{ nightTeamList.length }}</strong>
      </article>
      <article class="metric">
        <span>N2 及以上</span>
        <strong>{{ advancedCount }}</strong>
      </article>
    </section>

    <section class="layout">
      <el-card shadow="never" class="staff-card">
        <template #header>
          <div class="card-header">
            <div>
              <p class="card-kicker">Staff Roster</p>
              <h3>人员管理</h3>
            </div>
            <el-button type="primary" @click="openCreateDialog">新增人员</el-button>
          </div>
        </template>

        <el-table :data="staffList" border stripe>
          <el-table-column prop="name" label="姓名" width="110" />
          <el-table-column prop="level" label="能级" width="90">
            <template #default="{ row }">
              <el-tag round>{{ row.level || '-' }}</el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="title" label="职称" width="120" />
          <el-table-column prop="role" label="岗位" width="120" />
          <el-table-column prop="bed_range" label="管床范围" min-width="120" />
          <el-table-column label="夜班组" width="100">
            <template #default="{ row }">
              <el-tag v-if="row.is_night_team" type="warning" round>是</el-tag>
              <span v-else>否</span>
            </template>
          </el-table-column>
          <el-table-column prop="status" label="状态" width="100" />
          <el-table-column label="操作" width="150" fixed="right">
            <template #default="{ row }">
              <el-button type="primary" link @click="openEditDialog(row)">编辑</el-button>
              <el-button type="danger" link @click="removeStaff(row.id)">删除</el-button>
            </template>
          </el-table-column>
        </el-table>
      </el-card>

      <el-card shadow="never" class="night-card">
        <template #header>
          <div class="card-header">
            <div>
              <p class="card-kicker">Night Team Sequence</p>
              <h3>夜班组轮转顺序</h3>
            </div>
            <el-button type="success" :loading="savingOrder" @click="saveNightTeamOrder">保存排序</el-button>
          </div>
        </template>

        <p class="night-note">支持拖拽和上下移动，保存后将同步到现有后端接口。</p>

        <el-table ref="nightTableRef" :data="nightTeamList" border stripe>
          <el-table-column label="顺序" width="80">
            <template #default="{ $index }">
              <el-tag type="primary" round>{{ $index + 1 }}</el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="name" label="姓名" width="110" />
          <el-table-column prop="level" label="能级" width="90" />
          <el-table-column prop="title" label="职称" min-width="120" />
          <el-table-column label="操作" width="120">
            <template #default="{ $index }">
              <el-button link :disabled="$index === 0" @click="moveUp($index)">上移</el-button>
              <el-button link :disabled="$index === nightTeamList.length - 1" @click="moveDown($index)">下移</el-button>
            </template>
          </el-table-column>
        </el-table>
      </el-card>
    </section>

    <StaffEditorDialog v-model="dialogVisible" :staff="editingStaff" @submit="submitStaff" />
  </div>
</template>

<script setup lang="ts">
import { computed, nextTick, onMounted, ref, watch } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import Sortable from 'sortablejs'
import StaffEditorDialog from '@/components/staff/StaffEditorDialog.vue'
import { createStaff, deleteStaff, getStaffList, updateNightTeamOrder, updateStaff } from '@/api/staff'
import type { Staff } from '@/types'

const staffList = ref<Staff[]>([])
const nightTeamList = ref<Staff[]>([])
const dialogVisible = ref(false)
const editingStaff = ref<Partial<Staff> | null>(null)
const savingOrder = ref(false)
const nightTableRef = ref<any>(null)
let sortable: Sortable | null = null

const advancedCount = computed(() => staffList.value.filter((item) => ['N2', 'N3'].includes(item.level || '')).length)

watch(
  staffList,
  async (value) => {
    nightTeamList.value = [...value]
      .filter((item) => item.is_night_team)
      .sort((a, b) => (a.night_team_order || 0) - (b.night_team_order || 0))
    await nextTick()
    initSortable()
  },
  { immediate: true, deep: true },
)

onMounted(loadStaff)

async function loadStaff() {
  const res: any = await getStaffList()
  if (res.code === 0) {
    staffList.value = res.data
  }
}

function openCreateDialog() {
  editingStaff.value = null
  dialogVisible.value = true
}

function openEditDialog(staff: Staff) {
  editingStaff.value = { ...staff }
  dialogVisible.value = true
}

async function submitStaff(value: Partial<Staff>) {
  if (!value.name) {
    ElMessage.warning('请输入姓名')
    return
  }

  if (value.id) {
    const res: any = await updateStaff(value.id, value)
    if (res.code === 0) ElMessage.success('人员已更新')
  } else {
    const res: any = await createStaff(value)
    if (res.code === 0) ElMessage.success('人员已新增')
  }

  dialogVisible.value = false
  await loadStaff()
}

async function removeStaff(id: number) {
  await ElMessageBox.confirm('删除后该人员会被标记为 leave，是否继续？', '确认删除', { type: 'warning' })
  const res: any = await deleteStaff(id)
  if (res.code === 0) {
    ElMessage.success('人员已删除')
    await loadStaff()
  }
}

function moveUp(index: number) {
  if (index === 0) return
  const list = [...nightTeamList.value]
  ;[list[index - 1], list[index]] = [list[index], list[index - 1]]
  updateLocalNightList(list)
}

function moveDown(index: number) {
  if (index === nightTeamList.value.length - 1) return
  const list = [...nightTeamList.value]
  ;[list[index + 1], list[index]] = [list[index], list[index + 1]]
  updateLocalNightList(list)
}

function updateLocalNightList(list: Staff[]) {
  nightTeamList.value = list.map((item, index) => ({ ...item, night_team_order: index + 1 }))
}

function initSortable() {
  sortable?.destroy()
  const target = nightTableRef.value?.$el?.querySelector('.el-table__body-wrapper tbody')
  if (!target) return

  sortable = Sortable.create(target, {
    animation: 180,
    onEnd(event) {
      const list = [...nightTeamList.value]
      const [moved] = list.splice(event.oldIndex || 0, 1)
      list.splice(event.newIndex || 0, 0, moved)
      updateLocalNightList(list)
    },
  })
}

async function saveNightTeamOrder() {
  savingOrder.value = true
  try {
    const orders = nightTeamList.value.map((item, index) => ({ id: item.id, order: index + 1 }))
    const res: any = await updateNightTeamOrder(orders)
    if (res.code === 0) {
      ElMessage.success('夜班组排序已保存')
      await loadStaff()
    }
  } finally {
    savingOrder.value = false
  }
}
</script>

<style scoped>
.page {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 16px;
}

.metric {
  padding: 22px;
  border-radius: 24px;
  background: rgba(255, 255, 255, 0.84);
  border: 1px solid rgba(148, 163, 184, 0.18);
  box-shadow: var(--soft-shadow);
}

.metric span {
  display: block;
  color: var(--ink-500);
  font-size: 12px;
  margin-bottom: 8px;
}

.metric strong {
  font-size: 28px;
  color: var(--ink-900);
}

.layout {
  display: grid;
  grid-template-columns: 1.4fr 1fr;
  gap: 20px;
}

.staff-card,
.night-card {
  border-radius: 28px;
  border: 1px solid rgba(148, 163, 184, 0.16);
  background: rgba(255, 255, 255, 0.84);
  box-shadow: var(--soft-shadow);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
}

.card-kicker {
  margin: 0;
  color: var(--brand-600);
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.card-header h3 {
  margin: 4px 0 0;
  font-size: 24px;
}

.night-note {
  margin: 0 0 16px;
  color: var(--ink-500);
}

@media (max-width: 1100px) {
  .layout,
  .stats-grid {
    grid-template-columns: 1fr;
  }

  .card-header {
    flex-direction: column;
    align-items: flex-start;
  }
}
</style>
