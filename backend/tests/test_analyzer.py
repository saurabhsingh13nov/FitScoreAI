from unittest.mock import AsyncMock, MagicMock, patch

import pytest

from app.analyzer import analyze_resume, extract_pdf_text
from app.schemas import AnalysisResponse


def test_extract_pdf_text_valid(sample_pdf_bytes):
    text = extract_pdf_text(sample_pdf_bytes)
    assert "John Doe" in text


def test_extract_pdf_text_blank_pdf_raises():
    # Minimal valid PDF with no text content
    blank_pdf = (
        b"%PDF-1.4\n1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n"
        b"2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n"
        b"3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] >>\nendobj\n"
        b"xref\n0 4\n0000000000 65535 f \n0000000009 00000 n \n"
        b"0000000058 00000 n \n0000000115 00000 n \n"
        b"trailer\n<< /Size 4 /Root 1 0 R >>\nstartxref\n206\n%%EOF"
    )
    with pytest.raises(ValueError, match="Could not extract text"):
        extract_pdf_text(blank_pdf)


def test_extract_pdf_text_garbage_bytes_raises():
    with pytest.raises(Exception):
        extract_pdf_text(b"not a pdf at all")


async def test_analyze_resume_with_tool_use(sample_metrics_data):
    mock_block = MagicMock()
    mock_block.type = "tool_use"
    mock_block.name = "submit_analysis"
    mock_block.input = {"metrics": sample_metrics_data}

    mock_message = MagicMock()
    mock_message.content = [mock_block]

    mock_client = AsyncMock()
    mock_client.messages.create = AsyncMock(return_value=mock_message)

    with patch("app.analyzer.anthropic.AsyncAnthropic", return_value=mock_client):
        result = await analyze_resume("resume text", "job description")

    assert isinstance(result, AnalysisResponse)
    assert len(result.metrics) == 2
    # Weighted score: 8.0*0.4 + 6.0*0.6 = 3.2 + 3.6 = 6.8
    assert result.overall_score == 6.8


async def test_analyze_resume_no_tool_use_raises():
    mock_block = MagicMock()
    mock_block.type = "text"

    mock_message = MagicMock()
    mock_message.content = [mock_block]

    mock_client = AsyncMock()
    mock_client.messages.create = AsyncMock(return_value=mock_message)

    with patch("app.analyzer.anthropic.AsyncAnthropic", return_value=mock_client):
        with pytest.raises(RuntimeError, match="did not return the expected tool call"):
            await analyze_resume("resume text", "job description")


def test_weighted_score_calculation(sample_metrics):
    overall = round(sum(m.score * m.weight for m in sample_metrics), 1)
    # 8.0*0.4 + 6.0*0.6 = 3.2 + 3.6 = 6.8
    assert overall == 6.8
