import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import MetricCard from '../MetricCard.vue'
import type { Metric } from '../../types'

function makeMetric(overrides: Partial<Metric> = {}): Metric {
  return {
    name: 'Technical Skills',
    score: 8,
    weight: 0.5,
    summary: 'Strong match on technical requirements',
    details: 'Detailed explanation of the scoring.',
    improvements: ['Learn TypeScript', 'Get AWS cert'],
    ...overrides,
  }
}

describe('MetricCard', () => {
  it('renders name and score', () => {
    const wrapper = mount(MetricCard, { props: { metric: makeMetric() } })
    expect(wrapper.text()).toContain('Technical Skills')
    expect(wrapper.text()).toContain('8')
  })

  it('renders summary', () => {
    const wrapper = mount(MetricCard, { props: { metric: makeMetric() } })
    expect(wrapper.text()).toContain('Strong match on technical requirements')
  })

  it('uses green color for score >= 8', () => {
    const wrapper = mount(MetricCard, { props: { metric: makeMetric({ score: 9 }) } })
    const scoreEl = wrapper.find('.text-2xl')
    expect(scoreEl.classes()).toContain('text-green-600')
  })

  it('uses red color for score < 5', () => {
    const wrapper = mount(MetricCard, { props: { metric: makeMetric({ score: 3 }) } })
    const scoreEl = wrapper.find('.text-2xl')
    expect(scoreEl.classes()).toContain('text-red-600')
  })

  it('expands on click to show details and improvements', async () => {
    const wrapper = mount(MetricCard, { props: { metric: makeMetric() } })

    // Details not visible initially
    expect(wrapper.text()).not.toContain('Detailed explanation of the scoring.')

    // Click to expand
    await wrapper.trigger('click')

    expect(wrapper.text()).toContain('Detailed explanation of the scoring.')
    expect(wrapper.text()).toContain('Learn TypeScript')
    expect(wrapper.text()).toContain('Get AWS cert')
  })

  it('progress bar width matches score', () => {
    const wrapper = mount(MetricCard, { props: { metric: makeMetric({ score: 7 }) } })
    const bar = wrapper.find('.h-2.rounded-full.transition-all')
    expect(bar.attributes('style')).toContain('width: 70%')
  })
})
