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

  it('removeArchived 按 id 删除归档任务', () => {
    const store = useTodoStore()
    store.addTodo('任务1')
    store.updateStatus(store.items.value[0].id, 'done')
    store.archiveDone()
    expect(store.archivedItems.value).toHaveLength(1)
    const archivedId = store.archivedItems.value[0].id
    store.removeArchived(archivedId)
    expect(store.archivedItems.value).toHaveLength(0)
  })

  it('removeArchived 传入不存在的 id 不影响归档', () => {
    const store = useTodoStore()
    store.addTodo('任务1')
    store.updateStatus(store.items.value[0].id, 'done')
    store.archiveDone()
    store.removeArchived('nonexistent-id')
    expect(store.archivedItems.value).toHaveLength(1)
  })

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

    it('返回的数据是快照副本，修改不影响 store', () => {
      const store = useTodoStore()
      store.addTodo('任务1')

      const data = store.exportData()
      data.items.push({ id: 'fake', text: '入侵', status: 'todo', createdAt: 0 })
      data.items[0].text = '被修改'

      // store 不受影响
      expect(store.items.value).toHaveLength(1)
      expect(store.items.value[0].text).toBe('任务1')
    })
  })

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

    it('传入数组时抛出错误', () => {
      const store = useTodoStore()

      expect(() => store.importData([])).toThrow('无效的数据格式')
    })

    it('导入的数据是独立副本，外部修改不影响 store', () => {
      const store = useTodoStore()
      const externalItems = [{ id: 'a1', text: '外部任务', status: 'todo', createdAt: 1000 }]
      store.importData({ version: 1, exportedAt: '', items: externalItems, archivedItems: [] })

      // 修改外部引用
      externalItems[0].text = '被篡改'
      externalItems.push({ id: 'a2', text: '注入', status: 'todo', createdAt: 2000 })

      // store 不受影响
      expect(store.items.value).toHaveLength(1)
      expect(store.items.value[0].text).toBe('外部任务')
    })
  })
})
