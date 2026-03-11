import pytest
from pydantic import ValidationError

from app.schemas import AnalysisResponse, Metric


def test_valid_metric_construction():
    m = Metric(
        name="Skills",
        score=7.5,
        weight=0.3,
        summary="Good fit",
        details="Detailed explanation here.",
        improvements=["Improve X", "Add Y"],
    )
    assert m.name == "Skills"
    assert m.score == 7.5


def test_missing_field_raises_validation_error():
    with pytest.raises(ValidationError):
        Metric(name="Skills", score=7.5)  # type: ignore[call-arg]


def test_serialization_roundtrip():
    m = Metric(
        name="Skills",
        score=7.5,
        weight=0.3,
        summary="Good fit",
        details="Detailed explanation.",
        improvements=["Tip 1"],
    )
    data = m.model_dump()
    m2 = Metric(**data)
    assert m == m2


def test_valid_analysis_response(sample_metrics):
    resp = AnalysisResponse(overall_score=6.8, metrics=sample_metrics)
    assert resp.overall_score == 6.8
    assert len(resp.metrics) == 2


def test_empty_metrics_list_allowed():
    resp = AnalysisResponse(overall_score=0.0, metrics=[])
    assert resp.metrics == []
