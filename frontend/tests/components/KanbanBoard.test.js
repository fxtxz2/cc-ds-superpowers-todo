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
