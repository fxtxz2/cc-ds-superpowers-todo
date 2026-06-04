<template>
  <el-dialog v-model="visible" title="📦 已归档任务" width="500px">
    <div v-if="items.length === 0" class="archived-dialog__empty">
      暂无归档任务
    </div>
    <div v-else class="archived-dialog__list">
      <div v-for="item in items" :key="item.id" class="archived-dialog__item">
        <span class="archived-dialog__text">{{ item.text }}</span>
        <span class="archived-dialog__date">{{ formatDate(item.archivedAt) }}</span>
      </div>
    </div>
    <template #footer>
      <el-button @click="visible = false">关闭</el-button>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref } from 'vue'

defineProps({
  items: { type: Array, default: () => [] },
})

const visible = ref(false)

function formatDate(timestamp) {
  const d = new Date(timestamp)
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function open() {
  visible.value = true
}

defineExpose({ open })
</script>

<style scoped>
.archived-dialog__empty {
  text-align: center;
  color: #C0C4CC;
  padding: 40px 0;
  font-size: 14px;
}
.archived-dialog__list {
  max-height: 400px;
  overflow-y: auto;
}
.archived-dialog__item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 12px;
  border-bottom: 1px solid #EBEEF5;
}
.archived-dialog__item:last-child {
  border-bottom: none;
}
.archived-dialog__text {
  font-size: 14px;
  color: #303133;
  text-decoration: line-through;
}
.archived-dialog__date {
  font-size: 12px;
  color: #909399;
  flex-shrink: 0;
  margin-left: 12px;
}
</style>
