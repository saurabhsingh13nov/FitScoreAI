from unittest.mock import AsyncMock, patch

import pytest

from app.schemas import AnalysisResponse, Metric

ANALYZE_URL = "/api/analyze"


async def test_health_endpoint(client):
    resp = await client.get("/api/health")
    assert resp.status_code == 200
    assert resp.json() == {"status": "ok"}


async def test_non_pdf_file_returns_400(client):
    resp = await client.post(
        ANALYZE_URL,
        files={"resume": ("resume.txt", b"not a pdf", "text/plain")},
        data={"job_description": "Some job"},
    )
    assert resp.status_code == 400
    assert "PDF" in resp.json()["detail"]


async def test_oversized_pdf_returns_400(client):
    big_bytes = b"%PDF-1.4" + b"\x00" * (10 * 1024 * 1024 + 1)
    resp = await client.post(
        ANALYZE_URL,
        files={"resume": ("big.pdf", big_bytes, "application/pdf")},
        data={"job_description": "Some job"},
    )
    assert resp.status_code == 400
    assert "10MB" in resp.json()["detail"]


async def test_unreadable_pdf_returns_422(client):
    with patch("app.main.extract_pdf_text", side_effect=ValueError("Could not extract text")):
        resp = await client.post(
            ANALYZE_URL,
            files={"resume": ("bad.pdf", b"fake pdf bytes", "application/pdf")},
            data={"job_description": "Some job"},
        )
    assert resp.status_code == 422
    assert "extract text" in resp.json()["detail"]


async def test_valid_request_returns_analysis(client, sample_metrics_data):
    mock_response = AnalysisResponse(
        overall_score=6.8,
        metrics=[Metric(**m) for m in sample_metrics_data],
    )

    with (
        patch("app.main.extract_pdf_text", return_value="Resume text here"),
        patch("app.main.analyze_resume", new_callable=AsyncMock, return_value=mock_response),
    ):
        resp = await client.post(
            ANALYZE_URL,
            files={"resume": ("resume.pdf", b"fake pdf", "application/pdf")},
            data={"job_description": "Some job description"},
        )

    assert resp.status_code == 200
    body = resp.json()
    assert body["overall_score"] == 6.8
    assert len(body["metrics"]) == 2


async def test_missing_job_description_returns_422(client):
    resp = await client.post(
        ANALYZE_URL,
        files={"resume": ("resume.pdf", b"fake pdf", "application/pdf")},
    )
    assert resp.status_code == 422


async def test_empty_filename_returns_error(client):
    resp = await client.post(
        ANALYZE_URL,
        files={"resume": ("", b"fake pdf", "application/pdf")},
        data={"job_description": "Some job"},
    )
    assert resp.status_code in (400, 422)
