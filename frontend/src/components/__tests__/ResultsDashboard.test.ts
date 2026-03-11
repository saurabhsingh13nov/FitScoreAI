import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import ResultsDashboard from '../ResultsDashboard.vue'
import type { Metric } from '../../types'

const sampleMetrics: Metric[] = [
  {
    name: 'Skills Match',
    score: 8,
    weight: 0.5,
    summary: 'Strong',
    details: 'Good skills',
    improvements: ['Tip 1'],
  },
  {
    name: 'Experience',
    score: 6,
    weight: 0.5,
    summary: 'Moderate',
    details: 'Some experience',
    improvements: ['Tip 2'],
  },
]

describe('ResultsDashboard', () => {
  it('renders overall score and "out of 10"', () => {
    const wrapper = mount(ResultsDashboard, {
      props: { overallScore: 7.2, metrics: sampleMetrics },
    })
    expect(wrapper.text()).toContain('7.2')
    expect(wrapper.text()).toContain('out of 10')
  })

  it('uses green ring color for score >= 8', () => {
    const wrapper = mount(ResultsDashboard, {
      props: { overallScore: 8.5, metrics: sampleMetrics },
    })
    const scoreCircle = wrapper.findAll('circle')[1]
    expect(scoreCircle.attributes('stroke')).toBe('#22c55e')
  })

  it('uses red text for score < 5', () => {
    const wrapper = mount(ResultsDashboard, {
      props: { overallScore: 3.0, metrics: sampleMetrics },
    })
    const scoreText = wrapper.find('.text-4xl')
    expect(scoreText.classes()).toContain('text-red-600')
  })

  it('renders one MetricCard per metric', () => {
    const wrapper = mount(ResultsDashboard, {
      props: { overallScore: 7.0, metrics: sampleMetrics },
    })
    // Each MetricCard renders the metric name
    expect(wrapper.text()).toContain('Skills Match')
    expect(wrapper.text()).toContain('Experience')
  })

  it('emits reset on button click', async () => {
    const wrapper = mount(ResultsDashboard, {
      props: { overallScore: 7.0, metrics: sampleMetrics },
    })
    const resetBtn = wrapper.find('button')
    await resetBtn.trigger('click')
    expect(wrapper.emitted('reset')).toBeTruthy()
  })
})
