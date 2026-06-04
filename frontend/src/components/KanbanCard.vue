<template>
  <div
    class="kanban-card"
    :class="{ 'kanban-card--done': item.status === 'done' }"
    @mouseenter="hovered = true"
    @mouseleave="hovered = false"
  >
    <span
      class="kanban-card__text"
      :style="{ textDecoration: item.status === 'done' ? 'line-through' : 'none' }"
    >
      {{ item.text }}
    </span>
    <span v-if="hovered" class="kanban-card__delete" @click.stop="$emit('delete', item.id)">✕</span>
  </div>
</template>

<script setup>
import { ref } from 'vue'

defineProps({
  item: {
    type: Object,
    required: true,
  },
})

defineEmits(['delete'])

const hovered = ref(false)
</script>

<style scoped>
.kanban-card {
  background: #fff;
  border-radius: 4px;
  padding: 10px 12px;
  margin-bottom: 6px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  cursor: grab;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.06);
  transition: box-shadow 0.15s;
}
.kanban-card:hover {
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.12);
}
.kanban-card--done {
  opacity: 0.7;
}
.kanban-card__text {
  font-size: 14px;
  color: #303133;
  flex: 1;
  word-break: break-word;
}
.kanban-card__delete {
  color: #F56C6C;
  cursor: pointer;
  font-size: 14px;
  margin-left: 8px;
  flex-shrink: 0;
}
.kanban-card__delete:hover {
  color: #e04747;
}
</style>
