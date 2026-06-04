import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import TodoActions from '../../src/components/TodoActions.vue'

describe('TodoActions', () => {
  it('渲染归档按钮', () => {
    const wrapper = mount(TodoActions)
    expect(wrapper.text()).toContain('归档已完成')
  })

  it('doneCount 为 0 时按钮禁用', () => {
    const wrapper = mount(TodoActions, { props: { doneCount: 0 } })
    const btn = wrapper.find('button')
    expect(btn.attributes('disabled')).toBeDefined()
  })

  it('doneCount > 0 时按钮可用', () => {
    const wrapper = mount(TodoActions, { props: { doneCount: 3 } })
    const btn = wrapper.find('button')
    expect(btn.attributes('disabled')).toBeUndefined()
  })
})
