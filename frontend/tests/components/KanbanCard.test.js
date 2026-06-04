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
    expect(wrapper.find('.kanban-card__delete').exists()).toBe(false)
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
    expect(textEl.attributes('style')).toContain('line-through')
  })
})
