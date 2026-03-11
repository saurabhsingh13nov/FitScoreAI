import pathlib

import pytest
from httpx import ASGITransport, AsyncClient

from app.main import app
from app.schemas import Metric

FIXTURES_DIR = pathlib.Path(__file__).parent / "fixtures"


@pytest.fixture
def sample_pdf_bytes() -> bytes:
    return (FIXTURES_DIR / "sample.pdf").read_bytes()


@pytest.fixture
def sample_metrics_data() -> list[dict]:
    return [
        {
            "name": "Technical Skills",
            "score": 8.0,
            "weight": 0.4,
            "summary": "Strong match",
            "details": "Good Python and FastAPI skills.",
            "improvements": ["Add more cloud experience"],
        },
        {
            "name": "Experience Level",
            "score": 6.0,
            "weight": 0.6,
            "summary": "Moderate match",
            "details": "Needs more senior-level experience.",
            "improvements": ["Lead more projects", "Mentor juniors"],
        },
    ]


@pytest.fixture
def sample_metrics(sample_metrics_data: list[dict]) -> list[Metric]:
    return [Metric(**m) for m in sample_metrics_data]


@pytest.fixture
async def client():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        yield ac
