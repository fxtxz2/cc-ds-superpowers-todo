<template>
  <div class="todo-input">
    <el-input
      v-model="inputText"
      placeholder="添加新的待办事项..."
      clearable
      @keyup.enter="handleAdd"
      @clear="inputText = ''"
    />
    <el-button type="primary" @click="handleAdd">添加</el-button>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const emit = defineEmits(['add'])
const inputText = ref('')

function handleAdd() {
  const trimmed = inputText.value.trim()
  if (!trimmed) return
  emit('add', trimmed)
  inputText.value = ''
}
</script>

<style scoped>
.todo-input {
  display: flex;
  gap: 8px;
  margin-bottom: 16px;
}
.todo-input .el-input {
  flex: 1;
}
</style>
