import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import UploadStep from '../UploadStep.vue'

describe('UploadStep', () => {
  it('renders upload prompt', () => {
    const wrapper = mount(UploadStep)
    expect(wrapper.text()).toContain('Upload Your Resume')
    expect(wrapper.text()).toContain('Drop a PDF file or click to browse')
  })

  it('does not show Continue button when no file selected', () => {
    const wrapper = mount(UploadStep)
    expect(wrapper.find('button').exists()).toBe(false)
  })

  it('shows filename after file input change', async () => {
    const wrapper = mount(UploadStep)
    const input = wrapper.find('input[type="file"]')

    // Simulate file selection
    const file = new File(['content'], 'my-resume.pdf', { type: 'application/pdf' })
    Object.defineProperty(input.element, 'files', { value: [file] })
    await input.trigger('change')

    expect(wrapper.text()).toContain('my-resume.pdf')
  })

  it('emits file-selected on Continue click', async () => {
    const wrapper = mount(UploadStep)
    const input = wrapper.find('input[type="file"]')

    const file = new File(['content'], 'resume.pdf', { type: 'application/pdf' })
    Object.defineProperty(input.element, 'files', { value: [file] })
    await input.trigger('change')

    const button = wrapper.find('button')
    await button.trigger('click')

    expect(wrapper.emitted('file-selected')).toBeTruthy()
    expect(wrapper.emitted('file-selected')![0][0]).toBeInstanceOf(File)
  })
})
