# 数据迁移（导入/导出）实现计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 为 Todo Kanban 应用添加 JSON 文件导入/导出功能，实现跨电脑数据迁移。

**Architecture:** 在 `useTodoStore` 中新增 `exportData()` 和 `importData()` 两个方法，在 `TodoActions.vue` 中新增"导出备份"和"导入备份"两个按钮。导出时读取 localStorage 数据并触发浏览器下载 JSON 文件；导入时读取用户选择的 JSON 文件，校验格式后覆盖 localStorage 数据。不引入任何服务端依赖。

**Tech Stack:** Vue 3 (Composition API), Element Plus, Vitest + @vue/test-utils

---

## File Structure

| 文件 | 操作 | 职责 |
|---|---|---|
| `frontend/src/composables/useTodoStore.js` | 修改 | 新增 `exportData()` 和 `importData()`，暴露到返回值 |
| `frontend/src/components/TodoActions.vue` | 修改 | 新增导出/导入按钮 + 文件处理 + 确认对话框 |
| `frontend/tests/composables/useTodoStore.test.js` | 修改 | 新增 `exportData` / `importData` 单元测试 |
| `frontend/tests/components/TodoActions.test.js` | 修改 | 新增导出/导入按钮的存在性测试 |

不创建新文件，不修改其他文件。

---

### Task 1: `exportData()` — 导出数据为 JSON 对象

**Files:**
- Modify: `frontend/src/composables/useTodoStore.js`
- Modify: `frontend/tests/composables/useTodoStore.test.js`

- [ ] **Step 1: 在测试文件中添加 exportData 测试**

在 `frontend/tests/composables/useTodoStore.test.js` 的 `describe('useTodoStore', () => {` 块末尾（最后一个 `it(...)` 之后，闭合 `});` 之前）添加以下测试：

```js
  describe('exportData', () => {
    it('返回包含 version、exportedAt、items、archivedItems 的对象', () => {
      const store = useTodoStore()
      store.addTodo('任务1')
      store.addTodo('任务2')

      const data = store.exportData()

      expect(data).toHaveProperty('version', 1)
      expect(data).toHaveProperty('exportedAt')
      expect(typeof data.exportedAt).toBe('string')
      expect(data).toHaveProperty('items')
      expect(data).toHaveProperty('archivedItems')
      expect(data.items).toHaveLength(2)
      expect(data.items[0].text).toBe('任务1')
      expect(data.items[1].text).toBe('任务2')
      expect(data.archivedItems).toEqual([])
    })

    it('导出数据包含归档项', () => {
      const store = useTodoStore()
      store.addTodo('待归档')
      store.updateStatus(store.items.value[0].id, 'done')
      store.archiveDone()

      const data = store.exportData()

      expect(data.items).toHaveLength(0)
      expect(data.archivedItems).toHaveLength(1)
      expect(data.archivedItems[0].text).toBe('待归档')
    })

    it('空数据时导出空数组', () => {
      const store = useTodoStore()

      const data = store.exportData()

      expect(data.items).toEqual([])
      expect(data.archivedItems).toEqual([])
    })
  })
```

- [ ] **Step 2: 运行测试确认失败**

```bash
cd frontend && npx vitest run tests/composables/useTodoStore.test.js
```

Expected: 3 个新测试 FAIL，报 `store.exportData is not a function`

- [ ] **Step 3: 实现 exportData()**

在 `frontend/src/composables/useTodoStore.js` 的 `useTodoStore()` 函数内，`removeArchived` 函数之后，`return` 语句之前，添加：

```js
  function exportData() {
    return {
      version: 1,
      exportedAt: new Date().toISOString(),
      items: items.value,
      archivedItems: archivedItems.value,
    }
  }
```

然后在 `return` 语句中添加 `exportData,`（插入到 `removeArchived,` 之后）：

```js
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
  }
```

- [ ] **Step 4: 运行测试确认通过**

```bash
cd frontend && npx vitest run tests/composables/useTodoStore.test.js
```

Expected: 18 个测试全部 PASS（15 个原有 + 3 个新增）

- [ ] **Step 5: Commit**

```bash
git add frontend/src/composables/useTodoStore.js frontend/tests/composables/useTodoStore.test.js
git commit -m "feat: add exportData() to useTodoStore"
```

---

### Task 2: `importData()` — 从 JSON 对象导入数据

**Files:**
- Modify: `frontend/src/composables/useTodoStore.js`
- Modify: `frontend/tests/composables/useTodoStore.test.js`

- [ ] **Step 1: 在测试文件中添加 importData 测试**

在 `frontend/tests/composables/useTodoStore.test.js` 的 `exportData` describe 块之后（闭合 `});` 之后，`useTodoStore` 最外层 describe 的闭合 `});` 之前）添加：

```js
  describe('importData', () => {
    it('正确导入数据并覆盖 items 和 archivedItems', () => {
      const store = useTodoStore()
      store.addTodo('旧数据')
      expect(store.items.value).toHaveLength(1)

      const jsonData = {
        version: 1,
        exportedAt: '2026-06-04T10:00:00.000Z',
        items: [
          { id: 'a1', text: '导入任务1', status: 'todo', createdAt: 1000 },
          { id: 'a2', text: '导入任务2', status: 'in-progress', createdAt: 2000 },
        ],
        archivedItems: [
          { id: 'a3', text: '导入归档', status: 'done', createdAt: 500, archivedAt: 3000 },
        ],
      }

      store.importData(jsonData)

      expect(store.items.value).toHaveLength(2)
      expect(store.items.value[0].text).toBe('导入任务1')
      expect(store.items.value[1].text).toBe('导入任务2')
      expect(store.archivedItems.value).toHaveLength(1)
      expect(store.archivedItems.value[0].text).toBe('导入归档')
    })

    it('items 不是数组时使用空数组兜底', () => {
      const store = useTodoStore()
      store.addTodo('旧数据')

      store.importData({ version: 1, exportedAt: '', items: null, archivedItems: null })

      expect(store.items.value).toEqual([])
      expect(store.archivedItems.value).toEqual([])
    })

    it('导入空对象时使用空数组兜底', () => {
      const store = useTodoStore()
      store.addTodo('旧数据')

      store.importData({})

      expect(store.items.value).toEqual([])
      expect(store.archivedItems.value).toEqual([])
    })

    it('传入 null 时抛出错误', () => {
      const store = useTodoStore()

      expect(() => store.importData(null)).toThrow('无效的数据格式')
    })

    it('传入字符串时抛出错误', () => {
      const store = useTodoStore()

      expect(() => store.importData('not an object')).toThrow('无效的数据格式')
    })
  })
```

- [ ] **Step 2: 运行测试确认失败**

```bash
cd frontend && npx vitest run tests/composables/useTodoStore.test.js
```

Expected: 5 个新测试 FAIL，报 `store.importData is not a function`

- [ ] **Step 3: 实现 importData()**

在 `frontend/src/composables/useTodoStore.js` 的 `useTodoStore()` 函数内，`exportData` 函数之后，`return` 语句之前，添加：

```js
  function importData(jsonData) {
    if (!jsonData || typeof jsonData !== 'object') {
      throw new Error('无效的数据格式')
    }
    const newItems = Array.isArray(jsonData.items) ? jsonData.items : []
    const newArchived = Array.isArray(jsonData.archivedItems) ? jsonData.archivedItems : []
    items.value = newItems
    archivedItems.value = newArchived
  }
```

然后在 `return` 语句中添加 `importData,`（插入到 `exportData,` 之后）：

```js
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
```

- [ ] **Step 4: 运行测试确认通过**

```bash
cd frontend && npx vitest run tests/composables/useTodoStore.test.js
```

Expected: 23 个测试全部 PASS（18 个原有 + 5 个新增）

- [ ] **Step 5: Commit**

```bash
git add frontend/src/composables/useTodoStore.js frontend/tests/composables/useTodoStore.test.js
git commit -m "feat: add importData() to useTodoStore"
```

---

### Task 3: TodoActions — 添加导出/导入按钮

**Files:**
- Modify: `frontend/src/components/TodoActions.vue`
- Modify: `frontend/tests/components/TodoActions.test.js`

- [ ] **Step 1: 在测试文件中添加按钮存在性测试**

在 `frontend/tests/components/TodoActions.test.js` 的 `describe('TodoActions', () => {` 块末尾（最后一个 `it(...)` 之后，闭合 `});` 之前）添加：

```js
  it('渲染导出备份按钮', () => {
    const wrapper = mount(TodoActions)
    expect(wrapper.text()).toContain('导出备份')
  })

  it('渲染导入备份按钮', () => {
    const wrapper = mount(TodoActions)
    expect(wrapper.text()).toContain('导入备份')
  })

  it('导入按钮点击时触发隐藏的 file input', async () => {
    const wrapper = mount(TodoActions)
    const fileInput = wrapper.find('input[type="file"]')
    expect(fileInput.exists()).toBe(true)
    // file input 应该不可见
    expect(fileInput.isVisible()).toBe(false)
  })
```

- [ ] **Step 2: 运行测试确认失败**

```bash
cd frontend && npx vitest run tests/components/TodoActions.test.js
```

Expected: 3 个新测试 FAIL（找不到对应文本/元素）

- [ ] **Step 3: 实现 TodoActions 模板和逻辑**

将 `frontend/src/components/TodoActions.vue` 完整替换为以下内容：

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
    <el-tooltip content="从 JSON 文件恢复数据，将覆盖当前所有数据" placement="top">
      <el-button
        type="warning"
        plain
        size="small"
        :loading="importing"
        @click="triggerImport"
      >
        📥 导入备份
      </el-button>
    </el-tooltip>
    <el-tooltip content="将所有数据导出为 JSON 文件" placement="top">
      <el-button
        type="primary"
        plain
        size="small"
        @click="handleExport"
      >
        📤 导出备份
      </el-button>
    </el-tooltip>
    <input
      ref="fileInput"
      type="file"
      accept=".json"
      style="display: none"
      @change="handleFileSelected"
    />
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { ElMessageBox, ElMessage } from 'element-plus'
import { useTodoStore } from '../composables/useTodoStore'

const props = defineProps({
  doneCount: { type: Number, default: 0 },
})

const emit = defineEmits(['archive'])

const store = useTodoStore()
const fileInput = ref(null)
const importing = ref(false)

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

function handleExport() {
  try {
    const data = store.exportData()
    const json = JSON.stringify(data, null, 2)
    const blob = new Blob([json], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    const dateStr = new Date().toISOString().slice(0, 10)
    a.href = url
    a.download = `todo-backup-${dateStr}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    ElMessage.success('导出成功')
  } catch (e) {
    ElMessage.error(`导出失败：${e.message}`)
  }
}

function triggerImport() {
  if (fileInput.value) {
    fileInput.value.value = ''
    fileInput.value.click()
  }
}

async function handleFileSelected(event) {
  const file = event.target.files?.[0]
  if (!file) return

  if (file.size > 10 * 1024 * 1024) {
    ElMessage.error('文件过大，请选择小于 10MB 的文件')
    return
  }

  importing.value = true
  try {
    const text = await readFileAsText(file)
    let jsonData
    try {
      jsonData = JSON.parse(text)
    } catch {
      ElMessage.error('文件格式错误，请选择 .json 文件')
      return
    }

    const itemCount = Array.isArray(jsonData.items) ? jsonData.items.length : 0
    const archivedCount = Array.isArray(jsonData.archivedItems) ? jsonData.archivedItems.length : 0

    await ElMessageBox.confirm(
      `发现 ${itemCount} 条待办事项和 ${archivedCount} 条已归档任务。导入将覆盖当前所有数据，确定继续？`,
      '确认导入',
      { confirmButtonText: '确定导入', cancelButtonText: '取消', type: 'warning' }
    )

    store.importData(jsonData)
    ElMessage.success(`导入完成：${itemCount} 条待办，${archivedCount} 条归档`)
  } catch (e) {
    if (e === 'cancel' || e === 'close') {
      // 用户取消确认
    } else if (e.message) {
      ElMessage.error(`导入失败：${e.message}`)
    }
  } finally {
    importing.value = false
  }
}

function readFileAsText(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result)
    reader.onerror = () => reject(new Error('文件读取失败'))
    reader.readAsText(file)
  })
}
</script>

<style scoped>
.todo-actions {
  display: flex;
  gap: 8px;
  justify-content: center;
  margin-top: 8px;
}
</style>
```

- [ ] **Step 4: 运行测试确认通过**

```bash
cd frontend && npx vitest run tests/components/TodoActions.test.js
```

Expected: 6 个测试全部 PASS（3 个原有 + 3 个新增）

- [ ] **Step 5: 运行全部测试确认无回归**

```bash
cd frontend && npx vitest run
```

Expected: 全部 47 个测试 PASS（原有 44 个 + 新增 3 个）

- [ ] **Step 6: Commit**

```bash
git add frontend/src/components/TodoActions.vue frontend/tests/components/TodoActions.test.js
git commit -m "feat: add import/export buttons to TodoActions"
```

---

### Task 4: 端到端验证

**Files:** 无文件修改，仅验证。

- [ ] **Step 1: 启动开发服务器**

```bash
cd frontend && npm run dev
```

- [ ] **Step 2: 手动验证导出功能**
  - 在浏览器中打开应用
  - 添加几条待办事项
  - 点击"导出备份"按钮
  - 确认浏览器下载了一个 `todo-backup-YYYY-MM-DD.json` 文件
  - 用文本编辑器打开确认内容正确

- [ ] **Step 3: 手动验证导入功能**
  - 清空 localStorage（DevTools → Application → Local Storage → Clear）
  - 刷新页面，确认数据为空
  - 点击"导入备份"按钮
  - 选择步骤 2 中下载的 JSON 文件
  - 在确认对话框中确认
  - 确认数据恢复成功

- [ ] **Step 4: 验证边界情况**
  - 尝试导入一个非 JSON 文件（如 .txt），确认提示"文件格式错误"
  - 打开导出的 JSON 文件，删除 `items` 字段，导入后确认显示 0 条待办

- [ ] **Step 5: Commit（如有调整）**

```bash
git add -A
git commit -m "chore: final verification adjustments"
```
