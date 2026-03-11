# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

FitScoreAI is a web app that analyzes resume-to-job-description fit using Claude AI. Users upload a PDF resume and paste a job description; the app returns a 1-10 score across dynamically-determined metrics with detailed explanations and improvement suggestions.

## Architecture

Monorepo with two services orchestrated by Docker Compose:

- **`backend/`** — FastAPI (Python 3.12). Handles PDF parsing (`pdfplumber`), Claude API calls (structured output via `anthropic` SDK), and serves the analysis API.
- **`frontend/`** — Vue 3 + Vite + TypeScript + Tailwind CSS. Multi-step UI: upload resume → paste JD → view scored metrics with drill-down.

Key backend files:
- `backend/app/main.py` — FastAPI app, CORS config, route definitions
- `backend/app/analyzer.py` — PDF text extraction + Claude API integration
- `backend/app/schemas.py` — Pydantic models (Metric, AnalysisResponse)

API: `POST /api/analyze` (multipart: PDF file + JD text) → JSON with `overall_score` + `metrics[]`

## Development Commands

```bash
# Run everything (requires Docker)
docker compose up --build

# Backend only (dev)
cd backend && uv sync && uv run uvicorn app.main:app --reload --port 8000

# Frontend only (dev, proxies /api to localhost:8000)
cd frontend && npm install && npm run dev

# Frontend type-check
cd frontend && npx vue-tsc --noEmit

# Frontend production build
cd frontend && npm run build

# Backend tests
cd backend && uv run pytest -v

# Frontend unit tests
cd frontend && npm run test
```

Environment: copy `.env.example` to `.env` and set `ANTHROPIC_API_KEY`.

## Key Design Decisions

- **Stateless** — no database, no auth, no persistence
- **LLM-determined metrics** — Claude dynamically picks 5-10 relevant metrics per resume/JD pair (not a fixed set)
- **Structured output** — Claude API tool use guarantees valid JSON responses
- **Overall score** = weighted average of metric scores (weights sum to 1.0, set by Claude)

## Design Docs

- `docs/plans/2026-03-10-fitscore-design.md` — full architecture and API design
- `docs/plans/2026-03-10-fitscore-implementation-plan.md` — step-by-step build plan
