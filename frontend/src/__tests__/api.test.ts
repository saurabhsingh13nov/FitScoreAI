import { describe, it, expect, vi, beforeEach } from 'vitest'
import axios from 'axios'
import { analyzeResume } from '../api'
import type { AnalysisResponse } from '../types'

vi.mock('axios')
const mockedAxios = vi.mocked(axios, true)

const mockResponse: AnalysisResponse = {
  overall_score: 7.5,
  metrics: [
    {
      name: 'Skills',
      score: 8,
      weight: 0.5,
      summary: 'Good',
      details: 'Details here',
      improvements: ['Tip 1'],
    },
    {
      name: 'Experience',
      score: 7,
      weight: 0.5,
      summary: 'Decent',
      details: 'More details',
      improvements: ['Tip 2'],
    },
  ],
}

describe('analyzeResume', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('posts FormData to /api/analyze and returns data', async () => {
    mockedAxios.post.mockResolvedValueOnce({ data: mockResponse })

    const file = new File(['fake'], 'resume.pdf', { type: 'application/pdf' })
    const result = await analyzeResume(file, 'job description')

    expect(mockedAxios.post).toHaveBeenCalledWith('/api/analyze', expect.any(FormData))
    expect(result).toEqual(mockResponse)
  })

  it('returns correctly typed response', async () => {
    mockedAxios.post.mockResolvedValueOnce({ data: mockResponse })

    const file = new File(['fake'], 'resume.pdf', { type: 'application/pdf' })
    const result = await analyzeResume(file, 'job description')

    expect(result.overall_score).toBe(7.5)
    expect(result.metrics).toHaveLength(2)
    expect(result.metrics[0].name).toBe('Skills')
  })

  it('propagates network errors', async () => {
    mockedAxios.post.mockRejectedValueOnce(new Error('Network Error'))

    const file = new File(['fake'], 'resume.pdf', { type: 'application/pdf' })
    await expect(analyzeResume(file, 'job description')).rejects.toThrow('Network Error')
  })
})
