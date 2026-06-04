import { describe, it, expect, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import App from '../../src/App.vue'
import { useTodoStore } from '../../src/composables/useTodoStore'

describe('Todo App 集成测试', () => {
  beforeEach(() => {
    localStorage.clear()
    const store = useTodoStore()
    store.reorderItems([])
    if (store.archivedItems) {
      store.archivedItems.value = []
    }
  })

  it('完整流程：添加 → 删除', async () => {
    const wrapper = mount(App)

    // 1. 添加任务
    const input = wrapper.findComponent({ name: 'TodoInput' })
    await input.find('input').setValue('集成测试任务')
    await input.find('button').trigger('click')
    await wrapper.vm.$nextTick()

    // 2. 验证任务出现在待处理列
    expect(wrapper.findComponent({ name: 'KanbanBoard' }).exists()).toBe(true)
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
