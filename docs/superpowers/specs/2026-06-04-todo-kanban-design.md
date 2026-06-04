# Todo Kanban 应用设计文档

**日期:** 2026-06-04  
**状态:** 已确认

---

## 概述

一个基于 GTD 看板的网页端 Todo 管理应用。前端使用 Vue 3 + Element Plus + vuedraggable，数据持久化到 localStorage。支持三列拖拽看板（待处理 / 进行中 / 已完成），以及已完成任务的归档功能。

## 技术栈

| 层 | 选型 |
|---|------|
| 框架 | Vue 3 (Composition API + `<script setup>`) |
| UI 组件库 | Element Plus |
| 拖拽 | vuedraggable (基于 SortableJS) |
| 构建 | Vite |
| 测试 | Vitest + Vue Test Utils |
| 存储 | localStorage |

## 项目结构

```
hello-superpower/
├── frontend/                  # Vue 3 Todo 应用
│   ├── index.html
│   ├── package.json
│   ├── vite.config.js
│   ├── src/
│   │   ├── main.js
│   │   ├── App.vue
│   │   ├── components/
│   │   │   ├── TodoHeader.vue      # 标题 + 当前日期
│   │   │   ├── TodoInput.vue       # 输入框 + 添加按钮
│   │   │   ├── KanbanBoard.vue     # 三列看板容器
│   │   │   ├── KanbanColumn.vue    # 单列（标题/计数/卡片列表）
│   │   │   ├── KanbanCard.vue      # 单张卡片（内容/删除）
│   │   │   └── TodoActions.vue     # 归档按钮
│   │   └── composables/
│   │       └── useTodoStore.js     # localStorage 读写 + 状态管理
│   └── tests/
│       ├── components/
│       └── composables/
├── backend/                   # (预留) 后续后端扩展
└── docs/
    └── superpowers/
        └── specs/
```

## 数据模型

```typescript
interface TodoItem {
  id: string            // crypto.randomUUID()
  text: string          // 待办内容
  status: 'todo' | 'in-progress' | 'done'
  createdAt: number     // Date.now()
  archivedAt?: number   // 归档时间，仅归档后存在
}
```

## localStorage 存储

- `todo-items` → `TodoItem[]` — 活跃项（三列中的所有卡片）
- `todo-archived` → `TodoItem[]` — 已归档项

## 组件职责 & 数据流

| 组件 | 职责 | 数据交互 |
|------|------|---------|
| `TodoHeader` | 标题 + 当前日期 | 纯展示，无 props/emit |
| `TodoInput` | 输入框 + 添加按钮 | emit 新 `TodoItem` 给父组件，默认 `status: 'todo'` |
| `KanbanBoard` | 三列容器，分发数据 | 接收 `items`，通过 computed 按 status 分三组传给各列 |
| `KanbanColumn` | 单列标题/计数/卡片列表 | vuedraggable 包裹，group 配置实现跨列拖拽 |
| `KanbanCard` | 单张卡片展示 + 删除 | props 接收 item，emit 删除事件 |
| `TodoActions` | 归档按钮 | emit 归档事件，将 `done` 项移入 `todo-archived` |
| `useTodoStore` | composable：localStorage 读写、CRUD、归档 | 所有组件的数据源 |

## 交互行为

| 操作 | 触发方式 | 效果 |
|------|---------|------|
| 添加任务 | 输入 + 回车/按钮 | 新增 `status: 'todo'` 卡片，空输入校验不触发 |
| 列内排序 | 同列内拖拽 | 更新数组顺序，写入 localStorage |
| 状态切换 | 跨列拖拽 | 卡片 `status` 自动更新为目标列对应状态 |
| 删除卡片 | 卡片 hover 出现删除按钮 | 从数组中移除，更新 localStorage |
| 归档已完成 | 点击"已完成"列底部归档按钮 | `done` 项移入 `todo-archived`，二次确认弹窗 |

## 错误处理

| 场景 | 策略 |
|------|------|
| 空输入提交 | 前端校验，空字符串不触发添加 |
| localStorage 容量超限 | `try/catch` 写入操作，`ElMessage.warning()` 提示用户归档 |
| 拖拽到无效区域 | vuedraggable 自动回弹，卡片回到原位置 |
| 浏览器不支持 localStorage | 启动时检测，`ElMessage.error()` 提示并降级为纯内存模式 |

## 测试策略

| 层级 | 工具 | 覆盖 |
|------|------|------|
| Composables | Vitest | `useTodoStore` 的 localStorage 读写、CRUD、归档逻辑 |
| 组件 | Vitest + Vue Test Utils | 各组件渲染、事件 emit、边界情况 |
| 集成 | Vitest | 添加→拖拽状态切换→归档完整流程 |

## 约束

- 纯前端，无后端依赖
- localStorage 存储上限约 5-10MB，适合个人使用规模
- 仅支持现代浏览器（ES2020+）
- 拖拽通过 vuedraggable 实现，基于 HTML5 Drag API，不支持触屏设备原生拖拽体验
