import { describe, it, expect, beforeEach } from 'vitest'
import { STATUSES, useTodoStore } from '../../src/composables/useTodoStore'

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
    store.addTodo('任务2')
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

  it('removeTodo 传入不存在的 id 不影响数组', () => {
    const store = useTodoStore()
    store.addTodo('任务1')
    store.removeTodo('nonexistent-id')
    expect(store.items.value).toHaveLength(1)
  })

  it('updateStatus 传入不存在的 id 不改变数组', () => {
    const store = useTodoStore()
    store.addTodo('任务1')
    store.updateStatus('nonexistent-id', 'done')
    expect(store.items.value[0].status).toBe('todo')
  })

  it('updateStatus 传入无效 status 不改变状态', () => {
    const store = useTodoStore()
    store.addTodo('任务1')
    store.updateStatus(store.items.value[0].id, 'invalid-status')
    expect(store.items.value[0].status).toBe('todo')
  })

  it('archiveDone 没有 done 项时不做任何操作', () => {
    const store = useTodoStore()
    store.addTodo('任务1')
    store.addTodo('任务2')
    store.archiveDone()
    expect(store.items.value).toHaveLength(2)
    expect(store.archivedItems.value).toHaveLength(0)
  })
})
