<template>
  <div class="todo-actions">
    <el-button
      type="info"
      plain
      size="small"
      :disabled="doneCount === 0"
      @click="handleArchive"
    >
      📦 归档已完成
    </el-button>
  </div>
</template>

<script setup>
import { ElMessageBox, ElMessage } from 'element-plus'

const props = defineProps({
  doneCount: { type: Number, default: 0 },
})

const emit = defineEmits(['archive'])

async function handleArchive() {
  try {
    await ElMessageBox.confirm(
      `确定要归档 ${props.doneCount} 条已完成的任务吗？归档后可在历史记录中查看。`,
      '确认归档',
      { confirmButtonText: '确定', cancelButtonText: '取消', type: 'info' }
    )
    emit('archive')
    ElMessage.success('归档完成')
  } catch {
    // 用户取消
  }
}
</script>

<style scoped>
.todo-actions {
  text-align: center;
  margin-top: 8px;
}
</style>
