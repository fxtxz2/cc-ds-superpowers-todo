import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import TodoInput from '../../src/components/TodoInput.vue'

describe('TodoInput', () => {
  it('渲染输入框和添加按钮', () => {
    const wrapper = mount(TodoInput)
    expect(wrapper.find('input').exists()).toBe(true)
    expect(wrapper.find('button').exists()).toBe(true)
  })

  it('回车触发 add 事件，携带输入内容，之后清空输入框', async () => {
    const wrapper = mount(TodoInput)
    const input = wrapper.find('input')
    await input.setValue('新任务')
    await input.trigger('keyup.enter')
    expect(wrapper.emitted('add')).toBeTruthy()
    expect(wrapper.emitted('add')[0][0]).toBe('新任务')
    expect(input.element.value).toBe('')
  })

  it('点击按钮触发 add 事件', async () => {
    const wrapper = mount(TodoInput)
    const input = wrapper.find('input')
    await input.setValue('按钮添加')
    await wrapper.find('button').trigger('click')
    expect(wrapper.emitted('add')).toBeTruthy()
    expect(wrapper.emitted('add')[0][0]).toBe('按钮添加')
  })

  it('空白输入不触发 add 事件', async () => {
    const wrapper = mount(TodoInput)
    const input = wrapper.find('input')
    await input.setValue('   ')
    await input.trigger('keyup.enter')
    expect(wrapper.emitted('add')).toBeFalsy()
  })
})
