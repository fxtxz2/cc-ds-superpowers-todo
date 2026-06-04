<template>
  <div class="app">
    <TodoHeader />
    <TodoInput @add="handleAdd" />
    <KanbanBoard
      :items="store.items.value"
      @update:items="handleReorder"
      @delete="handleDelete"
      @archive="handleArchive"
    />
  </div>
</template>

<script setup>
import TodoHeader from './components/TodoHeader.vue'
import TodoInput from './components/TodoInput.vue'
import KanbanBoard from './components/KanbanBoard.vue'
import { useTodoStore } from './composables/useTodoStore'

const store = useTodoStore()

function handleAdd(text) {
  store.addTodo(text)
}

function handleDelete(id) {
  store.removeTodo(id)
}

function handleReorder(newItems) {
  store.reorderItems(newItems)
}

function handleArchive() {
  store.archiveDone()
}
</script>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}
body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
  background: #F5F7FA;
  color: #303133;
}
.app {
  max-width: 1100px;
  margin: 0 auto;
  padding: 24px 20px;
}
</style>
