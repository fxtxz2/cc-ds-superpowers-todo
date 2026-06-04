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

  it('无数据时显示空列表提示', () => {
    const wrapper = mount(KanbanColumn, {
      props: { title: '待处理', status: 'todo', items: [] },
    })
    expect(wrapper.find('.kanban-column__empty').exists()).toBe(true)
  })
})
