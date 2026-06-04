<template>
  <div class="kanban-column" :class="`kanban-column--${status}`">
    <div class="kanban-column__header">
      <span class="kanban-column__title">{{ icon }} {{ title }}</span>
      <span class="kanban-column__count">{{ items.length }}</span>
    </div>
    <draggable
      :list="localItems"
      :group="{ name: 'tasks', pull: true, put: true }"
      item-key="id"
      class="kanban-column__list"
      @change="handleChange"
    >
      <template #item="{ element }">
        <KanbanCard :item="element" @delete="(id) => $emit('delete', id)" />
      </template>
    </draggable>
    <p v-if="items.length === 0" class="kanban-column__empty">暂无任务</p>
    <slot />
  </div>
</template>

<script setup>
import { computed } from 'vue'
import draggable from 'vuedraggable'
import KanbanCard from './KanbanCard.vue'

const props = defineProps({
  title: { type: String, required: true },
  icon: { type: String, default: '' },
  status: { type: String, required: true },
  items: { type: Array, default: () => [] },
})

const emit = defineEmits(['update:items', 'delete'])

const iconMap = {
  todo: '📥',
  'in-progress': '🔄',
  done: '✅',
}

const icon = computed(() => props.icon || iconMap[props.status] || '')

// vuedraggable needs two-way binding, use computed proxy
const localItems = computed({
  get: () => props.items,
  set: (val) => emit('update:items', val),
})

function handleChange(event) {
  if (event.added) {
    const item = event.added.element
    emit('update:items', [{ ...item, status: props.status }])
  }
}
</script>

<style scoped>
.kanban-column {
  flex: 1;
  min-width: 0;
  border-radius: 6px;
  padding: 10px;
  min-height: 200px;
  display: flex;
  flex-direction: column;
}
.kanban-column--todo { background: #F2F6FC; }
.kanban-column--in-progress { background: #FDF6EC; }
.kanban-column--done { background: #F0F9EB; }
.kanban-column__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}
.kanban-column__title {
  font-weight: 600;
  font-size: 14px;
  color: #606266;
}
.kanban-column__count {
  background: rgba(0, 0, 0, 0.08);
  border-radius: 10px;
  padding: 0 8px;
  font-size: 12px;
  color: #909399;
}
.kanban-column__list {
  flex: 1;
  min-height: 40px;
}
.kanban-column__empty {
  text-align: center;
  color: #C0C4CC;
  font-size: 13px;
  margin: 20px 0;
}
</style>
