import axios from 'axios'
import type { AnalysisResponse } from './types'

export async function analyzeResume(
  resumeFile: File,
  jobDescription: string,
): Promise<AnalysisResponse> {
  const formData = new FormData()
  formData.append('resume', resumeFile)
  formData.append('job_description', jobDescription)

  const response = await axios.post<AnalysisResponse>('/api/analyze', formData)
  return response.data
}
