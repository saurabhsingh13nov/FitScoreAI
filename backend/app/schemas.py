from pydantic import BaseModel


class Metric(BaseModel):
    name: str
    score: float
    weight: float
    summary: str
    details: str
    improvements: list[str]


class AnalysisResponse(BaseModel):
    overall_score: float
    metrics: list[Metric]
