import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import TodoHeader from '../../src/components/TodoHeader.vue'

describe('TodoHeader', () => {
  it('渲染标题', () => {
    const wrapper = mount(TodoHeader)
    expect(wrapper.text()).toContain('我的待办')
  })

  it('渲染当前日期', () => {
    const wrapper = mount(TodoHeader)
    const now = new Date()
    const year = now.getFullYear()
    const month = now.getMonth() + 1
    const day = now.getDate()
    expect(wrapper.text()).toContain(`${year}年${month}月${day}日`)
  })
})
