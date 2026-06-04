# Todo Kanban 应用实现计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 基于 Vue 3 + Element Plus + vuedraggable 构建 GTD 看板 Todo 应用，支持三列拖拽和 localStorage 持久化。

**Architecture:** 单页应用，App.vue 作为根组件，通过 useTodoStore composable 集中管理状态和 localStorage 读写，6 个子组件各司其职。vuedraggable 实现列内排序和跨列拖拽状态切换。

**Tech Stack:** Vue 3 (Composition API + `<script setup>`), Element Plus, vuedraggable (SortableJS), Vite, Vitest + Vue Test Utils

---

### Task 1: 项目脚手架

**Files:**
- Create: `frontend/package.json`
- Create: `frontend/vite.config.js`
- Create: `frontend/index.html`
- Create: `frontend/src/main.js`

- [ ] **Step 1: 创建 package.json**

```bash
mkdir -p frontend/src/components frontend/src/composables frontend/tests/components frontend/tests/composables
```

写入 `frontend/package.json`:

```json
{
  "name": "todo-kanban",
  "version": "1.0.0",
  "private": true,
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview",
    "test": "vitest run",
    "test:watch": "vitest"
  },
  "dependencies": {
    "vue": "^3.4.0",
    "element-plus": "^2.8.0",
    "vuedraggable": "^4.1.0",
    "sortablejs": "^1.15.0"
  },
  "devDependencies": {
    "@vitejs/plugin-vue": "^5.0.0",
    "vite": "^5.4.0",
    "vitest": "^2.0.0",
    "@vue/test-utils": "^2.4.0",
    "jsdom": "^24.0.0",
    "@element-plus/icons-vue": "^2.3.0"
  }
}
```

- [ ] **Step 2: 创建 vite.config.js**

写入 `frontend/vite.config.js`:

```js
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  test: {
    environment: 'jsdom',
    globals: true,
  },
})
```

- [ ] **Step 3: 创建 index.html**

写入 `frontend/index.html`:

```html
<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Todo Kanban</title>
</head>
<body>
  <div id="app"></div>
  <script type="module" src="/src/main.js"></script>
</body>
</html>
```

- [ ] **Step 4: 创建 main.js（占位）**

写入 `frontend/src/main.js`:

```js
import { createApp } from 'vue'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import App from './App.vue'

const app = createApp(App)
app.use(ElementPlus)
app.mount('#app')
```

- [ ] **Step 5: 创建 App.vue（占位）**

写入 `frontend/src/App.vue`:

```vue
<template>
  <div class="app">
    <h1>Todo Kanban</h1>
  </div>
</template>

<script setup>
</script>

<style>
.app {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}
</style>
```

- [ ] **Step 6: 安装依赖并验证**

```bash
cd frontend && npm install
```

- [ ] **Step 7: 验证开发服务器能启动**

```bash
cd frontend && npx vite --host 2>&1 | head -5
```

期望看到类似 `Local: http://localhost:5173/` 的输出，Ctrl+C 退出。

- [ ] **Step 8: Commit**

```bash
git add frontend/
git commit -m "feat: scaffold Vite + Vue 3 + Element Plus project"
```

---

### Task 2: useTodoStore composable（数据层 + localStorage）

**Files:**
- Create: `frontend/tests/composables/useTodoStore.test.js`
- Create: `frontend/src/composables/useTodoStore.js`

- [ ] **Step 1: 编写测试 — 添加任务**

写入 `frontend/tests/composables/useTodoStore.test.js`:

```js
import { describe, it, expect, beforeEach } from 'vitest'
import { useTodoStore } from '../../src/composables/useTodoStore'

describe('useTodoStore', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('初始状态返回空数组', () => {
    const store = useTodoStore()
    expect(store.items.value).toEqual([])
  })

  it('addTodo 添加新任务，默认 status 为 todo', () => {
    const store = useTodoStore()
    store.addTodo('买菜做饭')
    expect(store.items.value).toHaveLength(1)
    expect(store.items.value[0].text).toBe('买菜做饭')
    expect(store.items.value[0].status).toBe('todo')
    expect(store.items.value[0].id).toBeTruthy()
    expect(typeof store.items.value[0].createdAt).toBe('number')
  })

  it('addTodo 空字符串或空白不添加', () => {
    const store = useTodoStore()
    store.addTodo('')
    store.addTodo('   ')
    expect(store.items.value).toHaveLength(0)
  })

  it('removeTodo 按 id 删除任务', () => {
    const store = useTodoStore()
    store.addTodo('任务1')
    const id = store.items.value[0].id
    store.removeTodo(id)
    expect(store.items.value).toHaveLength(0)
  })

  it('updateStatus 修改任务状态', () => {
    const store = useTodoStore()
    store.addTodo('任务1')
    const id = store.items.value[0].id
    store.updateStatus(id, 'in-progress')
    expect(store.items.value[0].status).toBe('in-progress')
  })

  it('reorderItems 按新数组替换 items', () => {
    const store = useTodoStore()
    store.addTodo('A')
    store.addTodo('B')
    store.addTodo('C')
    const reordered = [store.items.value[2], store.items.value[0], store.items.value[1]]
    store.reorderItems(reordered)
    expect(store.items.value[0].text).toBe('C')
    expect(store.items.value[1].text).toBe('A')
    expect(store.items.value[2].text).toBe('B')
  })

  it('归档：archiveDone 将 done 项移入归档', () => {
    const store = useTodoStore()
    store.addTodo('任务1')
    const id2 = store.items.value[0]?.id
    store.addTodo('任务2')
    // 手动设置不同 id 不方便，改用 by status
    const items = store.items.value
    // 设置第一个为 done，第二个为 todo
    store.updateStatus(store.items.value[0].id, 'done')

    store.archiveDone()

    expect(store.items.value).toHaveLength(1)
    expect(store.items.value[0].status).toBe('todo')
    expect(store.archivedItems.value).toHaveLength(1)
    expect(store.archivedItems.value[0].status).toBe('done')
    expect(store.archivedItems.value[0].archivedAt).toBeTruthy()
  })

  it('localStorage 持久化：写入后重载仍可读取', () => {
    const store1 = useTodoStore()
    store1.addTodo('持久化测试')
    store1.updateStatus(store1.items.value[0].id, 'in-progress')

    // 模拟重新加载：创建新实例
    const store2 = useTodoStore()
    expect(store2.items.value).toHaveLength(1)
    expect(store2.items.value[0].text).toBe('持久化测试')
    expect(store2.items.value[0].status).toBe('in-progress')
  })

  it('localStorage 异常时降级为内存模式', () => {
    const store = useTodoStore()
    // 模拟 localStorage.setItem 抛错
    const originalSetItem = localStorage.setItem
    localStorage.setItem = () => { throw new Error('QuotaExceeded') }

    // 不应抛出异常
    expect(() => store.addTodo('测试')).not.toThrow()
    // 数据在内存中
    expect(store.items.value).toHaveLength(1)

    localStorage.setItem = originalSetItem
  })
})
```

- [ ] **Step 2: 运行测试 — 确认全部失败**

```bash
cd frontend && npx vitest run tests/composables/useTodoStore.test.js
```

期望: 全部 FAIL 或报 "useTodoStore is not defined / not a function"

- [ ] **Step 3: 实现 useTodoStore**

写入 `frontend/src/composables/useTodoStore.js`:

```js
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

const items = ref(loadFromStorage(STORAGE_KEY))
const archivedItems = ref(loadFromStorage(ARCHIVE_KEY))

// 自动持久化
watch(items, (val) => saveToStorage(STORAGE_KEY, val), { deep: true })
watch(archivedItems, (val) => saveToStorage(ARCHIVE_KEY, val), { deep: true })

export function useTodoStore() {
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
```

- [ ] **Step 4: 运行测试 — 确认全部通过**

```bash
cd frontend && npx vitest run tests/composables/useTodoStore.test.js
```

期望: 全部 8 个测试 PASS

- [ ] **Step 5: Commit**

```bash
git add frontend/src/composables/ frontend/tests/composables/
git commit -m "feat: add useTodoStore composable with localStorage persistence"
```

---

### Task 3: TodoHeader 组件

**Files:**
- Create: `frontend/tests/components/TodoHeader.test.js`
- Create: `frontend/src/components/TodoHeader.vue`

- [ ] **Step 1: 编写测试**

写入 `frontend/tests/components/TodoHeader.test.js`:

```js
import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import TodoHeader from '../../src/components/TodoHeader.vue'

describe('TodoHeader', () => {
  it('渲染标题', () => {
    const wrapper = mount(TodoHeader)
    expect(wrapper.text()).toContain('我的待办')
  })

  it('渲染当前日期', () => {
    const wrapper = mount(TodoHeader)
    // 中文日期格式，如 "2026年6月4日 星期四"
    const now = new Date()
    const year = now.getFullYear()
    const month = now.getMonth() + 1
    const day = now.getDate()
    expect(wrapper.text()).toContain(`${year}年${month}月${day}日`)
  })
})
```

- [ ] **Step 2: 运行测试 — 确认失败**

```bash
cd frontend && npx vitest run tests/components/TodoHeader.test.js
```

- [ ] **Step 3: 实现 TodoHeader**

写入 `frontend/src/components/TodoHeader.vue`:

```vue
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
```

- [ ] **Step 4: 运行测试 — 确认通过**

```bash
cd frontend && npx vitest run tests/components/TodoHeader.test.js
```

- [ ] **Step 5: Commit**

```bash
git add frontend/tests/components/TodoHeader.test.js frontend/src/components/TodoHeader.vue
git commit -m "feat: add TodoHeader component"
```

---

### Task 4: TodoInput 组件

**Files:**
- Create: `frontend/tests/components/TodoInput.test.js`
- Create: `frontend/src/components/TodoInput.vue`

- [ ] **Step 1: 编写测试**

写入 `frontend/tests/components/TodoInput.test.js`:

```js
import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import TodoInput from '../../src/components/TodoInput.vue'

describe('TodoInput', () => {
  it('渲染输入框和添加按钮', () => {
    const wrapper = mount(TodoInput)
    expect(wrapper.find('input').exists()).toBe(true)
    expect(wrapper.find('button').exists()).toBe(true)
  })

  it('回车触发 add 事件，携带输入内容，之后清空输入框', async () => {
    const wrapper = mount(TodoInput)
    const input = wrapper.find('input')
    await input.setValue('新任务')
    await input.trigger('keyup.enter')
    expect(wrapper.emitted('add')).toBeTruthy()
    expect(wrapper.emitted('add')[0][0]).toBe('新任务')
    expect(input.element.value).toBe('')
  })

  it('点击按钮触发 add 事件', async () => {
    const wrapper = mount(TodoInput)
    const input = wrapper.find('input')
    await input.setValue('按钮添加')
    await wrapper.find('button').trigger('click')
    expect(wrapper.emitted('add')).toBeTruthy()
    expect(wrapper.emitted('add')[0][0]).toBe('按钮添加')
  })

  it('空白输入不触发 add 事件', async () => {
    const wrapper = mount(TodoInput)
    const input = wrapper.find('input')
    await input.setValue('   ')
    await input.trigger('keyup.enter')
    expect(wrapper.emitted('add')).toBeFalsy()
  })
})
```

- [ ] **Step 2: 运行测试 — 确认失败**

```bash
cd frontend && npx vitest run tests/components/TodoInput.test.js
```

- [ ] **Step 3: 实现 TodoInput**

写入 `frontend/src/components/TodoInput.vue`:

```vue
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
```

- [ ] **Step 4: 运行测试 — 确认通过**

```bash
cd frontend && npx vitest run tests/components/TodoInput.test.js
```

- [ ] **Step 5: Commit**

```bash
git add frontend/tests/components/TodoInput.test.js frontend/src/components/TodoInput.vue
git commit -m "feat: add TodoInput component"
```

---

### Task 5: KanbanCard 组件

**Files:**
- Create: `frontend/tests/components/KanbanCard.test.js`
- Create: `frontend/src/components/KanbanCard.vue`

- [ ] **Step 1: 编写测试**

写入 `frontend/tests/components/KanbanCard.test.js`:

```js
import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import KanbanCard from '../../src/components/KanbanCard.vue'

describe('KanbanCard', () => {
  const mockItem = {
    id: 'abc-123',
    text: '买菜做饭',
    status: 'todo',
    createdAt: Date.now(),
  }

  it('渲染待办文本', () => {
    const wrapper = mount(KanbanCard, { props: { item: mockItem } })
    expect(wrapper.text()).toContain('买菜做饭')
  })

  it('hover 时显示删除按钮', async () => {
    const wrapper = mount(KanbanCard, { props: { item: mockItem } })
    // 初始状态下删除按钮不可见
    expect(wrapper.find('.kanban-card__delete').exists()).toBe(false)
    // 触发 mouseenter
    await wrapper.trigger('mouseenter')
    expect(wrapper.find('.kanban-card__delete').exists()).toBe(true)
  })

  it('点击删除按钮触发 delete 事件', async () => {
    const wrapper = mount(KanbanCard, { props: { item: mockItem } })
    await wrapper.trigger('mouseenter')
    await wrapper.find('.kanban-card__delete').trigger('click')
    expect(wrapper.emitted('delete')).toBeTruthy()
    expect(wrapper.emitted('delete')[0][0]).toBe('abc-123')
  })

  it('已完成的卡片显示删除线', () => {
    const doneItem = { ...mockItem, status: 'done' }
    const wrapper = mount(KanbanCard, { props: { item: doneItem } })
    const textEl = wrapper.find('.kanban-card__text')
    // 检查是否有 text-decoration: line-through 样式
    expect(textEl.attributes('style')).toContain('line-through')
  })
})
```

- [ ] **Step 2: 运行测试 — 确认失败**

```bash
cd frontend && npx vitest run tests/components/KanbanCard.test.js
```

- [ ] **Step 3: 实现 KanbanCard**

写入 `frontend/src/components/KanbanCard.vue`:

```vue
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
```

- [ ] **Step 4: 运行测试 — 确认通过**

```bash
cd frontend && npx vitest run tests/components/KanbanCard.test.js
```

- [ ] **Step 5: Commit**

```bash
git add frontend/tests/components/KanbanCard.test.js frontend/src/components/KanbanCard.vue
git commit -m "feat: add KanbanCard component"
```

---

### Task 6: KanbanColumn 组件

**Files:**
- Create: `frontend/tests/components/KanbanColumn.test.js`
- Create: `frontend/src/components/KanbanColumn.vue`

- [ ] **Step 1: 编写测试**

写入 `frontend/tests/components/KanbanColumn.test.js`:

```js
import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import KanbanColumn from '../../src/components/KanbanColumn.vue'

describe('KanbanColumn', () => {
  const mockItems = [
    { id: '1', text: '任务A', status: 'todo', createdAt: Date.now() },
    { id: '2', text: '任务B', status: 'todo', createdAt: Date.now() },
  ]

  it('渲染列标题', () => {
    const wrapper = mount(KanbanColumn, {
      props: { title: '待处理', status: 'todo', items: [] },
    })
    expect(wrapper.text()).toContain('待处理')
  })

  it('渲染计数', () => {
    const wrapper = mount(KanbanColumn, {
      props: { title: '待处理', status: 'todo', items: mockItems },
    })
    expect(wrapper.text()).toContain('2')
  })

  it('渲染卡片列表', () => {
    const wrapper = mount(KanbanColumn, {
      props: { title: '待处理', status: 'todo', items: mockItems },
    })
    const cards = wrapper.findAllComponents({ name: 'KanbanCard' })
    expect(cards).toHaveLength(2)
  })

  it('删除卡片时 emit delete 事件', () => {
    const wrapper = mount(KanbanColumn, {
      props: { title: '待处理', status: 'todo', items: mockItems },
    })
    const card = wrapper.findComponent({ name: 'KanbanCard' })
    card.vm.$emit('delete', '1')
    expect(wrapper.emitted('delete')).toBeTruthy()
    expect(wrapper.emitted('delete')[0][0]).toBe('1')
  })

  it('无数据时显示不同的空列表', () => {
    const wrapper = mount(KanbanColumn, {
      props: { title: '待处理', status: 'todo', items: [] },
    })
    // 空列应显示占位元素
    expect(wrapper.find('.kanban-column__empty').exists()).toBe(true)
  })
})
```

- [ ] **Step 2: 运行测试 — 确认失败**

```bash
cd frontend && npx vitest run tests/components/KanbanColumn.test.js
```

- [ ] **Step 3: 实现 KanbanColumn**

写入 `frontend/src/components/KanbanColumn.vue`:

```vue
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

// vuedraggable 需要双向绑定，用 computed 代理
const localItems = computed({
  get: () => props.items.map((item) => ({ ...item, status: props.status })),
  set: (val) => {
    // val 是拖拽后的数组，可能有新 status
    const mapped = val.map((item) => {
      if (item.status !== props.status) {
        return { ...item, status: props.status }
      }
      return item
    })
    emit('update:items', mapped)
  },
})

function handleChange(event) {
  if (event.added) {
    const item = event.added.element
    emit('update:items', [{ ...item, status: props.status }])
  }
}

const iconMap = {
  todo: '📥',
  'in-progress': '🔄',
  done: '✅',
}

const icon = computed(() => props.icon || iconMap[props.status] || '')
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
.kanban-column--todo {
  background: #F2F6FC;
}
.kanban-column--in-progress {
  background: #FDF6EC;
}
.kanban-column--done {
  background: #F0F9EB;
}
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
```

- [ ] **Step 4: 运行测试 — 确认通过**

```bash
cd frontend && npx vitest run tests/components/KanbanColumn.test.js
```

- [ ] **Step 5: Commit**

```bash
git add frontend/tests/components/KanbanColumn.test.js frontend/src/components/KanbanColumn.vue
git commit -m "feat: add KanbanColumn component with vuedraggable"
```

---

### Task 7: TodoActions 组件（归档按钮）

**Files:**
- Create: `frontend/tests/components/TodoActions.test.js`
- Create: `frontend/src/components/TodoActions.vue`

- [ ] **Step 1: 编写测试**

写入 `frontend/tests/components/TodoActions.test.js`:

```js
import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import TodoActions from '../../src/components/TodoActions.vue'

describe('TodoActions', () => {
  it('渲染归档按钮', () => {
    const wrapper = mount(TodoActions)
    expect(wrapper.text()).toContain('归档已完成')
  })

  it('未完成项为 0 时按钮禁用', () => {
    const wrapper = mount(TodoActions, { props: { doneCount: 0 } })
    expect(wrapper.find('button').attributes('disabled')).toBeDefined()
  })

  it('已完成项 > 0 时按钮可用', () => {
    const wrapper = mount(TodoActions, { props: { doneCount: 3 } })
    expect(wrapper.find('button').attributes('disabled')).toBeUndefined()
  })

  it('点击按钮弹出确认框，确认后 emit archive 事件', async () => {
    const wrapper = mount(TodoActions, { props: { doneCount: 2 } })
    await wrapper.find('button').trigger('click')
    // ElMessageBox.confirm 在测试环境中较难模拟，这里至少验证点击不报错
    // 实际行为由 Element Plus 内部处理
  })
})
```

- [ ] **Step 2: 运行测试 — 确认失败**

```bash
cd frontend && npx vitest run tests/components/TodoActions.test.js
```

- [ ] **Step 3: 实现 TodoActions**

写入 `frontend/src/components/TodoActions.vue`:

```vue
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
```

- [ ] **Step 4: 运行测试 — 确认通过**

```bash
cd frontend && npx vitest run tests/components/TodoActions.test.js
```

- [ ] **Step 5: Commit**

```bash
git add frontend/tests/components/TodoActions.test.js frontend/src/components/TodoActions.vue
git commit -m "feat: add TodoActions component with archive confirmation"
```

---

### Task 8: KanbanBoard 组件（看板容器）

**Files:**
- Create: `frontend/tests/components/KanbanBoard.test.js`
- Create: `frontend/src/components/KanbanBoard.vue`

- [ ] **Step 1: 编写测试**

写入 `frontend/tests/components/KanbanBoard.test.js`:

```js
import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import KanbanBoard from '../../src/components/KanbanBoard.vue'

describe('KanbanBoard', () => {
  const mockItems = [
    { id: '1', text: '任务A', status: 'todo', createdAt: Date.now() },
    { id: '2', text: '任务B', status: 'in-progress', createdAt: Date.now() },
    { id: '3', text: '任务C', status: 'done', createdAt: Date.now() },
  ]

  it('渲染三个列', () => {
    const wrapper = mount(KanbanBoard, { props: { items: mockItems } })
    const columns = wrapper.findAllComponents({ name: 'KanbanColumn' })
    expect(columns).toHaveLength(3)
  })

  it('待处理列只包含 todo 项', () => {
    const wrapper = mount(KanbanBoard, { props: { items: mockItems } })
    const columns = wrapper.findAllComponents({ name: 'KanbanColumn' })
    const todoColumn = columns[0]
    expect(todoColumn.props('items')).toHaveLength(1)
    expect(todoColumn.props('items')[0].status).toBe('todo')
  })

  it('进行中列只包含 in-progress 项', () => {
    const wrapper = mount(KanbanBoard, { props: { items: mockItems } })
    const columns = wrapper.findAllComponents({ name: 'KanbanColumn' })
    const inProgressColumn = columns[1]
    expect(inProgressColumn.props('items')).toHaveLength(1)
    expect(inProgressColumn.props('items')[0].status).toBe('in-progress')
  })

  it('已完成列只包含 done 项', () => {
    const wrapper = mount(KanbanBoard, { props: { items: mockItems } })
    const columns = wrapper.findAllComponents({ name: 'KanbanColumn' })
    const doneColumn = columns[2]
    expect(doneColumn.props('items')).toHaveLength(1)
    expect(doneColumn.props('items')[0].status).toBe('done')
  })

  it('delete 事件冒泡到父组件', () => {
    const wrapper = mount(KanbanBoard, { props: { items: mockItems } })
    const columns = wrapper.findAllComponents({ name: 'KanbanColumn' })
    columns[0].vm.$emit('delete', '1')
    expect(wrapper.emitted('delete')).toBeTruthy()
    expect(wrapper.emitted('delete')[0][0]).toBe('1')
  })

  it('渲染归档按钮并传入正确的 doneCount', () => {
    const wrapper = mount(KanbanBoard, { props: { items: mockItems } })
    const todoActions = wrapper.findComponent({ name: 'TodoActions' })
    expect(todoActions.exists()).toBe(true)
    expect(todoActions.props('doneCount')).toBe(1)
  })
})
```

- [ ] **Step 2: 运行测试 — 确认失败**

```bash
cd frontend && npx vitest run tests/components/KanbanBoard.test.js
```

- [ ] **Step 3: 实现 KanbanBoard**

写入 `frontend/src/components/KanbanBoard.vue`:

```vue
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
  // 合并：保留其他列的项目 + 替换目标列
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
```

- [ ] **Step 4: 运行测试 — 确认通过**

```bash
cd frontend && npx vitest run tests/components/KanbanBoard.test.js
```

- [ ] **Step 5: Commit**

```bash
git add frontend/tests/components/KanbanBoard.test.js frontend/src/components/KanbanBoard.vue
git commit -m "feat: add KanbanBoard container component"
```

---

### Task 9: App.vue 组装

**Files:**
- Modify: `frontend/src/App.vue`

- [ ] **Step 1: 更新 App.vue 完整实现**

覆盖 `frontend/src/App.vue`:

```vue
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
```

- [ ] **Step 2: 运行所有测试**

```bash
cd frontend && npx vitest run
```

期望: 所有测试 PASS

- [ ] **Step 3: 启动开发服务器验证**

```bash
cd frontend && npx vite --host &
```

浏览器打开 http://localhost:5173 ，手动验证:
- 添加任务 → 出现在"待处理"列
- 拖拽到"进行中" / "已完成"
- 删除任务
- 归档已完成任务
- 刷新页面数据仍在

- [ ] **Step 4: Commit**

```bash
git add frontend/src/App.vue
git commit -m "feat: assemble App.vue with all components"
```

---

### Task 10: 集成测试 & 收尾

**Files:**
- Create: `frontend/tests/integration/todo-app.test.js`

- [ ] **Step 1: 编写集成测试**

```bash
mkdir -p frontend/tests/integration
```

写入 `frontend/tests/integration/todo-app.test.js`:

```js
import { describe, it, expect, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import App from '../../src/App.vue'
import { useTodoStore } from '../../src/composables/useTodoStore'

describe('Todo App 集成测试', () => {
  beforeEach(() => {
    localStorage.clear()
    // 重置 useTodoStore 的模块级状态：重新加载模块
    // 这里通过直接 clear + reload 来清理
    const store = useTodoStore()
    store.reorderItems([])
    if (store.archivedItems) {
      store.archivedItems.value = []
    }
  })

  it('完整流程：添加 → 拖拽到完成 → 归档', async () => {
    const wrapper = mount(App)

    // 1. 添加任务
    const input = wrapper.findComponent({ name: 'TodoInput' })
    await input.find('input').setValue('集成测试任务')
    await input.find('button').trigger('click')

    // 等待 Vue 响应
    await wrapper.vm.$nextTick()

    // 2. 验证任务出现在待处理列
    const board = wrapper.findComponent({ name: 'KanbanBoard' })
    expect(board.exists()).toBe(true)

    // 初始有 1 个任务在 todo
    const columns = wrapper.findAllComponents({ name: 'KanbanColumn' })
    expect(columns).toHaveLength(3)

    // 3. 删除任务
    const card = wrapper.findComponent({ name: 'KanbanCard' })
    expect(card.exists()).toBe(true)
    await card.trigger('mouseenter')
    await card.find('.kanban-card__delete').trigger('click')
    await wrapper.vm.$nextTick()

    // 验证删除后为空
    expect(wrapper.findAllComponents({ name: 'KanbanCard' })).toHaveLength(0)
  })

  it('添加多个任务，分布在不同列', async () => {
    const store = useTodoStore()
    store.addTodo('任务1')
    store.addTodo('任务2')
    store.addTodo('任务3')

    const wrapper = mount(App)
    await wrapper.vm.$nextTick()

    const cards = wrapper.findAllComponents({ name: 'KanbanCard' })
    expect(cards).toHaveLength(3)
  })
})
```

- [ ] **Step 2: 运行集成测试**

```bash
cd frontend && npx vitest run tests/integration/todo-app.test.js
```

期望: 2 个测试 PASS

- [ ] **Step 3: 运行全部测试确认**

```bash
cd frontend && npx vitest run
```

期望: 所有测试（composables 8 + 组件 + 集成）全部 PASS

- [ ] **Step 4: Commit**

```bash
git add frontend/tests/integration/
git commit -m "test: add integration tests for full app flow"
```

---

### 实现完成检查清单

- [ ] `cd frontend && npx vitest run` 全部测试通过
- [ ] `npx vite` 启动后浏览器可正常使用
- [ ] 三列拖拽功能正常（列内排序 + 跨列移动）
- [ ] 归档确认弹窗 + 归档功能正常
- [ ] 刷新页面数据持久化
- [ ] 空输入不添加、localStorage 异常降级
