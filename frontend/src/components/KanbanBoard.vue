<template>
  <div class="kanban-board">
    <KanbanColumn
      title="待处理"
      status="todo"
      :items="todoItems"
      @update:items="handleColumnUpdate('todo', $event)"
      @delete="(id) => $emit('delete', id)"
    />
    <KanbanColumn
      title="进行中"
      status="in-progress"
      :items="inProgressItems"
      @update:items="handleColumnUpdate('in-progress', $event)"
      @delete="(id) => $emit('delete', id)"
    />
    <KanbanColumn
      title="已完成"
      status="done"
      :items="doneItems"
      @update:items="handleColumnUpdate('done', $event)"
      @delete="(id) => $emit('delete', id)"
    >
      <TodoActions :done-count="doneItems.length" @archive="$emit('archive')" />
    </KanbanColumn>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import KanbanColumn from './KanbanColumn.vue'
import TodoActions from './TodoActions.vue'

const props = defineProps({
  items: { type: Array, default: () => [] },
})

const emit = defineEmits(['delete', 'update:items', 'archive'])

const todoItems = computed(() => props.items.filter((i) => i.status === 'todo'))
const inProgressItems = computed(() => props.items.filter((i) => i.status === 'in-progress'))
const doneItems = computed(() => props.items.filter((i) => i.status === 'done'))

function handleColumnUpdate(targetStatus, updatedColumnItems) {
  // Merge: keep items from other columns, replace target column
  const otherItems = props.items.filter((i) => i.status !== targetStatus)
  const newItems = [...otherItems, ...updatedColumnItems]
  emit('update:items', newItems)
}
</script>

<style scoped>
.kanban-board {
  display: flex;
  gap: 12px;
  align-items: flex-start;
}
</style>
