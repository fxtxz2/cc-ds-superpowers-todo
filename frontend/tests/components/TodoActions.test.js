import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import TodoActions from '../../src/components/TodoActions.vue'

describe('TodoActions', () => {
  it('渲染归档按钮', () => {
    const wrapper = mount(TodoActions)
    expect(wrapper.text()).toContain('归档已完成')
  })

  it('doneCount 为 0 时按钮禁用', () => {
    const wrapper = mount(TodoActions, { props: { doneCount: 0 } })
    const buttons = wrapper.findAll('button')
    const archiveBtn = buttons.find(b => b.text().includes('归档已完成'))
    expect(archiveBtn.attributes('disabled')).toBeDefined()
  })

  it('doneCount > 0 时按钮可用', () => {
    const wrapper = mount(TodoActions, { props: { doneCount: 3 } })
    const buttons = wrapper.findAll('button')
    const archiveBtn = buttons.find(b => b.text().includes('归档已完成'))
    expect(archiveBtn.attributes('disabled')).toBeUndefined()
  })

  // === Export ===
  it('点击导出按钮创建下载链接', async () => {
    // URL.createObjectURL may not exist in jsdom
    if (typeof URL.createObjectURL === 'undefined') {
      URL.createObjectURL = vi.fn()
      URL.revokeObjectURL = vi.fn()
    }
    const urlSpy = vi.spyOn(URL, 'createObjectURL').mockReturnValue('blob:fake')
    const revokeSpy = vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => {})
    const anchorSpy = vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => {})

    const wrapper = mount(TodoActions)
    const buttons = wrapper.findAll('button')
    const exportBtn = buttons.find(b => b.text().includes('导出备份'))
    await exportBtn.trigger('click')

    expect(urlSpy).toHaveBeenCalled()
    expect(anchorSpy).toHaveBeenCalled()
    expect(revokeSpy).toHaveBeenCalled()

    urlSpy.mockRestore()
    revokeSpy.mockRestore()
    anchorSpy.mockRestore()
  })

  // === Import ===
  it('隐藏的 file input 存在且不可见', () => {
    const wrapper = mount(TodoActions)
    const fileInput = wrapper.find('input[type="file"]')
    expect(fileInput.exists()).toBe(true)
    expect(fileInput.isVisible()).toBe(false)
  })

  it('导入按钮点击时触发 file input click', async () => {
    const wrapper = mount(TodoActions)
    const fileInput = wrapper.find('input[type="file"]')
    const inputClickSpy = vi.spyOn(fileInput.element, 'click')

    const buttons = wrapper.findAll('button')
    const importBtn = buttons.find(b => b.text().includes('导入备份'))
    await importBtn.trigger('click')

    expect(inputClickSpy).toHaveBeenCalled()
  })
})
