<template>
  <div class="todo-header">
    <h1>📝 我的待办</h1>
    <p class="todo-header__date">{{ formattedDate }}</p>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const formattedDate = computed(() => {
  const now = new Date()
  const weekdays = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六']
  const year = now.getFullYear()
  const month = now.getMonth() + 1
  const day = now.getDate()
  const weekday = weekdays[now.getDay()]
  return `${year}年${month}月${day}日 ${weekday}`
})
</script>

<style scoped>
.todo-header {
  text-align: center;
  margin-bottom: 20px;
}
.todo-header h1 {
  font-size: 24px;
  color: #303133;
  margin: 0 0 4px 0;
}
.todo-header__date {
  font-size: 13px;
  color: #909399;
  margin: 0;
}
</style>
