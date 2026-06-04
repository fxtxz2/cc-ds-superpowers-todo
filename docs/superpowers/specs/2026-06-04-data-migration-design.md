# 数据迁移（跨电脑复制）设计文档

**日期**：2026-06-04
**状态**：已确认

---

## 背景

项目是一个 Vue 3 + Element Plus 的 Todo Kanban 单页应用，数据全部存储在浏览器 `localStorage` 中（key: `todo-items` 和 `todo-archived`）。用户希望当把项目复制到另一台电脑时，能通过简单复制 JSON 文件的方式迁移历史数据。

## 目标

- **开发模式**（`npm run dev`）和生产模式（`dist/index.html`）均支持
- 提供**手动导出**：点击按钮下载 JSON 备份文件
- 提供**手动导入**：选择 JSON 文件恢复数据

## 方案

选用**方案 B**：纯 localStorage + JSON 文件导入导出，不依赖任何服务端。两种运行模式行为完全一致，实现最简单。

---

## 架构

现有架构                          新增部分
─────────                        ─────────
useTodoStore.js                  useTodoStore.js (新增方法)
  ├── localStorage (todo-items)    ├── exportData()
  └── localStorage (todo-archived) ├── importData(jsonData)

TodoActions.vue                  TodoActions.vue (新增按钮)
  ├── 归档已完成按钮                ├── 导出备份按钮
  └── 查看已归档按钮(待加)          ├── 导入备份按钮（隐藏 file input）
                                   └── 导入确认对话框

核心思路：导出 = 读 localStorage → 序列化为 JSON → 浏览器下载；导入 = 选 JSON 文件 → 校验 → 确认覆盖 → 写 localStorage → 刷新。

---

## 数据格式

导出的 JSON 文件结构：

```json
{
  "version": 1,
  "exportedAt": "2026-06-04T10:30:00.000Z",
  "items": [
    {
      "id": "uuid-xxx",
      "text": "完成报告",
      "status": "todo",
      "createdAt": 1717500000000
    }
  ],
  "archivedItems": [
    {
      "id": "uuid-zzz",
      "text": "旧的待办",
      "status": "done",
      "createdAt": 1717300000000,
      "archivedAt": 1717500000000
    }
  ]
}
```

- `version`：为将来格式兼容预留
- `exportedAt`：方便用户识别备份时间

---

## 交互流程

**导出**：点击"导出备份"按钮 → 浏览器下载 `todo-backup-YYYY-MM-DD.json`

**导入**：点击"导入备份"按钮 → 弹出文件选择器 → 用户选择 `.json` 文件 → 前端校验格式 → 弹出确认对话框（显示数据摘要：N 条待办，M 条已归档，含覆盖警告）→ 用户确认 → 覆盖 localStorage → 页面刷新

---

## 错误处理

| 场景 | 处理 |
|---|---|
| 文件不是合法 JSON | toast 提示"文件格式错误，请选择 .json 文件" |
| JSON 字段缺失 | 容错处理，缺失字段用空数组兜底 |
| 文件过大（>10MB） | 前端校验，提示"文件过大" |
| 用户取消确认 | 不做任何操作 |

---

## UI 布局

`TodoActions.vue` 操作栏新增两个按钮，保持与现有 Element Plus `size="small" plain` 风格一致：

```
┌─────────────────────────────────────────────────────┐
│  📦 归档已完成    │    📥 导入备份    │  📤 导出备份  │
└─────────────────────────────────────────────────────┘
```

- **导出备份**：普通按钮，点击即下载（读操作，无副作用，无需确认）
- **导入备份**：绑定隐藏 `<input type="file" accept=".json">`，确认对话框会提示覆盖警告
- 导入过程中按钮显示 loading 态，防止重复点击

---

## 实现要点

### useTodoStore.js 新增方法

```js
function exportData() {
  return {
    version: 1,
    exportedAt: new Date().toISOString(),
    items: items.value,
    archivedItems: archivedItems.value,
  }
}

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

### TodoActions.vue 新增

- 导出按钮 + 文件下载逻辑（Blob + createObjectURL + 临时 `<a>` 元素）
- 导入按钮 + 隐藏 `<input type="file">` + FileReader + JSON.parse + ElMessageBox.confirm + importData

---

## 测试

- **单元测试**：`exportData()` 返回正确结构、`importData()` 正确覆盖数据、`importData()` 对畸形数据容错
- **组件测试**：导出按钮存在并触发下载、导入按钮触发 file input、确认对话框内容包含覆盖警告
