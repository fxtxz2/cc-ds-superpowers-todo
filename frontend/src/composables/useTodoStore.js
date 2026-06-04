import { ref, watch } from 'vue'

export const STATUSES = { TODO: 'todo', IN_PROGRESS: 'in-progress', DONE: 'done' }

const STORAGE_KEY = 'todo-items'
const ARCHIVE_KEY = 'todo-archived'

function isLocalStorageAvailable() {
  try {
    const testKey = '__todo_test__'
    localStorage.setItem(testKey, '1')
    localStorage.removeItem(testKey)
    return true
  } catch {
    return false
  }
}

const storageAvailable = isLocalStorageAvailable()

function loadFromStorage(key) {
  if (!storageAvailable) return []
  try {
    const raw = localStorage.getItem(key)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

function saveToStorage(key, data) {
  if (!storageAvailable) {
    console.warn('[useTodoStore] localStorage unavailable, data not persisted')
    return
  }
  try {
    localStorage.setItem(key, JSON.stringify(data))
  } catch (e) {
    console.warn('[useTodoStore] Failed to save to localStorage:', e.message)
  }
}

function generateId() {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID()
  }
  // Fallback: timestamp + random string
  return `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`
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
      id: generateId(),
      text: trimmed,
      status: STATUSES.TODO,
      createdAt: Date.now(),
    })
  }

  function removeTodo(id) {
    items.value = items.value.filter((item) => item.id !== id)
  }

  function updateStatus(id, newStatus) {
    if (!Object.values(STATUSES).includes(newStatus)) return
    const item = items.value.find((item) => item.id === id)
    if (item) {
      item.status = newStatus
    }
  }

  function reorderItems(newItems) {
    items.value = newItems
  }

  function archiveDone() {
    const doneItems = items.value
      .filter((item) => item.status === STATUSES.DONE)
      .map((item) => ({ ...item, archivedAt: Date.now() }))
    if (doneItems.length === 0) return
    archivedItems.value = [...doneItems, ...archivedItems.value]
    items.value = items.value.filter((item) => item.status !== STATUSES.DONE)
  }

  function removeArchived(id) {
    archivedItems.value = archivedItems.value.filter((item) => item.id !== id)
  }

  function exportData() {
    return {
      version: 1,
      exportedAt: new Date().toISOString(),
      items: items.value.map((item) => ({ ...item })),
      archivedItems: archivedItems.value.map((item) => ({ ...item })),
    }
  }

  function importData(jsonData) {
    if (!jsonData || typeof jsonData !== 'object') {
      throw new Error('无效的数据格式')
    }
    const newItems = Array.isArray(jsonData.items) ? jsonData.items : []
    const newArchived = Array.isArray(jsonData.archivedItems) ? jsonData.archivedItems : []
    items.value = newItems.map((item) => ({ ...item }))
    archivedItems.value = newArchived.map((item) => ({ ...item }))
  }

  return {
    items,
    archivedItems,
    addTodo,
    removeTodo,
    updateStatus,
    reorderItems,
    archiveDone,
    removeArchived,
    exportData,
    importData,
  }
}
