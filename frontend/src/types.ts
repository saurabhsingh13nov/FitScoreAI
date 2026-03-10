export interface Metric {
  name: string
  score: number
  weight: number
  summary: string
  details: string
  improvements: string[]
}

export interface AnalysisResponse {
  overall_score: number
  metrics: Metric[]
}
