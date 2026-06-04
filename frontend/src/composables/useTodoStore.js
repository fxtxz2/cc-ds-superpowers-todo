import { ref, watch } from 'vue'

const STORAGE_KEY = 'todo-items'
const ARCHIVE_KEY = 'todo-archived'

function loadFromStorage(key) {
  try {
    const raw = localStorage.getItem(key)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

function saveToStorage(key, data) {
  try {
    localStorage.setItem(key, JSON.stringify(data))
  } catch {
    // 静默失败，数据保持在内存中
  }
}

const items = ref([])
const archivedItems = ref([])

// 自动持久化
watch(items, (val) => saveToStorage(STORAGE_KEY, val), { deep: true, flush: 'sync' })
watch(archivedItems, (val) => saveToStorage(ARCHIVE_KEY, val), { deep: true, flush: 'sync' })

function reload() {
  items.value = loadFromStorage(STORAGE_KEY)
  archivedItems.value = loadFromStorage(ARCHIVE_KEY)
}

reload()

export function useTodoStore() {
  // 每次调用时从 localStorage 重新加载，确保测试隔离和状态一致性
  reload()

  function addTodo(text) {
    const trimmed = text.trim()
    if (!trimmed) return
    items.value.push({
      id: crypto.randomUUID(),
      text: trimmed,
      status: 'todo',
      createdAt: Date.now(),
    })
  }

  function removeTodo(id) {
    items.value = items.value.filter((item) => item.id !== id)
  }

  function updateStatus(id, newStatus) {
    const item = items.value.find((item) => item.id === id)
    if (item) {
      item.status = newStatus
    }
  }

  function reorderItems(newItems) {
    items.value = newItems
  }

  function archiveDone() {
    const doneItems = items.value.filter((item) => item.status === 'done')
    const now = Date.now()
    doneItems.forEach((item) => {
      item.archivedAt = now
    })
    archivedItems.value = [...doneItems, ...archivedItems.value]
    items.value = items.value.filter((item) => item.status !== 'done')
  }

  return {
    items,
    archivedItems,
    addTodo,
    removeTodo,
    updateStatus,
    reorderItems,
    archiveDone,
  }
}
