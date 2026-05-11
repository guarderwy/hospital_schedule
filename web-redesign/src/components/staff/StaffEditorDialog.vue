<template>
  <el-dialog :model-value="modelValue" :title="staff?.id ? '编辑人员' : '新增人员'" width="560px" @close="$emit('update:modelValue', false)">
    <el-form :model="draft" label-width="90px">
      <el-form-item label="姓名" required>
        <el-input v-model="draft.name" placeholder="请输入姓名" />
      </el-form-item>
      <el-form-item label="能级">
        <el-select v-model="draft.level" placeholder="请选择能级" style="width: 100%">
          <el-option label="N0" value="N0" />
          <el-option label="N1" value="N1" />
          <el-option label="N2" value="N2" />
          <el-option label="N3" value="N3" />
        </el-select>
      </el-form-item>
      <el-form-item label="职称">
        <el-input v-model="draft.title" placeholder="请输入职称" />
      </el-form-item>
      <el-form-item label="岗位">
        <el-input v-model="draft.role" placeholder="请输入岗位" />
      </el-form-item>
      <el-form-item label="管床范围">
        <el-input v-model="draft.bed_range" placeholder="例如 1-10 床" />
      </el-form-item>
      <el-form-item v-if="staff?.id" label="状态">
        <el-select v-model="draft.status" style="width: 100%">
          <el-option label="在岗" value="active" />
          <el-option label="请假" value="leave" />
          <el-option label="调离" value="transfer" />
        </el-select>
      </el-form-item>
      <el-form-item label="夜班组">
        <el-switch v-model="draft.is_night_team" />
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="$emit('update:modelValue', false)">取消</el-button>
      <el-button type="primary" @click="submit">保存</el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { reactive, watch } from 'vue'
import type { Staff } from '@/types'

const props = defineProps<{
  modelValue: boolean
  staff: Partial<Staff> | null
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void
  (e: 'submit', value: Partial<Staff>): void
}>()

const draft = reactive<Partial<Staff>>({
  name: '',
  level: 'N1',
  title: '',
  role: '',
  bed_range: '',
  is_night_team: false,
  status: 'active',
})

watch(
  () => props.staff,
  (value) => {
    Object.assign(draft, {
      name: '',
      level: 'N1',
      title: '',
      role: '',
      bed_range: '',
      is_night_team: false,
      status: 'active',
      ...value,
    })
  },
  { immediate: true },
)

function submit() {
  emit('submit', { ...draft })
}
</script>
