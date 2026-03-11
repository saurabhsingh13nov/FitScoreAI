import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import JDInputStep from '../JDInputStep.vue'

describe('JDInputStep', () => {
  it('renders heading and textarea', () => {
    const wrapper = mount(JDInputStep)
    expect(wrapper.text()).toContain('Paste the Job Description')
    expect(wrapper.find('textarea').exists()).toBe(true)
  })

  it('Analyze button is disabled when textarea is empty', () => {
    const wrapper = mount(JDInputStep)
    const buttons = wrapper.findAll('button')
    const analyzeBtn = buttons.find((b) => b.text().includes('Analyze'))!
    expect(analyzeBtn.attributes('disabled')).toBeDefined()
  })

  it('enables button and emits analyze with text', async () => {
    const wrapper = mount(JDInputStep)
    const textarea = wrapper.find('textarea')
    await textarea.setValue('Senior Engineer role at Acme Corp')

    const analyzeBtn = wrapper.findAll('button').find((b) => b.text().includes('Analyze'))!
    expect(analyzeBtn.attributes('disabled')).toBeUndefined()

    await analyzeBtn.trigger('click')
    expect(wrapper.emitted('analyze')).toBeTruthy()
    expect(wrapper.emitted('analyze')![0][0]).toBe('Senior Engineer role at Acme Corp')
  })

  it('emits back on Back click', async () => {
    const wrapper = mount(JDInputStep)
    const backBtn = wrapper.findAll('button').find((b) => b.text().includes('Back'))!
    await backBtn.trigger('click')
    expect(wrapper.emitted('back')).toBeTruthy()
  })
})
