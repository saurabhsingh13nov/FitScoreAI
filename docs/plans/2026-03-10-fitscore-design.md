# FitScoreAI Design Document

## Overview

Web app where users upload a PDF resume and paste a job description. An LLM (Claude) analyzes the match and returns a score (1-10) across dynamically-determined metrics. Users can drill into each metric for detailed explanations and actionable improvement suggestions.

## Decisions

- **Stack:** Vue 3 + Vite + TypeScript (frontend), FastAPI + Python (backend)
- **LLM:** Claude API (Anthropic)
- **PDF parsing:** pdfplumber
- **Persistence:** None (stateless)
- **Metrics:** LLM-determined per resume/JD pair (5-10 metrics)
- **Deployment:** Local / Docker Compose
- **Styling:** Tailwind CSS

## Architecture

```
┌─────────────────────┐       ┌─────────────────────────┐
│   Vue 3 Frontend    │       │    FastAPI Backend       │
│                     │       │                          │
│  Upload PDF + JD ───┼──────>│  POST /api/analyze       │
│                     │       │    1. Extract PDF text    │
│  Display results  <─┼───────│    2. Call Claude API     │
│  (score + metrics)  │       │    3. Return JSON         │
│                     │       │                          │
│  Expand metric card │       │  GET /api/health          │
│  (details + tips)   │       │                          │
└─────────────────────┘       └─────────────────────────┘
         :80                           :8000
         └──── Docker Compose ──────────┘
```

## Backend

### API

**`POST /api/analyze`** — multipart form: `resume` (PDF file) + `job_description` (text)

Response:
```json
{
  "overall_score": 8.2,
  "metrics": [
    {
      "name": "Technical Skills Match",
      "score": 9,
      "weight": 0.2,
      "summary": "Strong alignment with required tech stack",
      "details": "Your experience with Python, FastAPI, and AWS maps well to...",
      "improvements": [
        "Add Kubernetes experience to strengthen cloud-native skills",
        "Highlight specific throughput metrics for API work"
      ]
    }
  ]
}
```

`overall_score` = weighted average of metric scores (weights sum to 1.0).

### PDF Parsing

Use `pdfplumber` to extract text. Handle multi-page resumes. Return error if extraction yields empty text.

### LLM Integration

Single Claude API call using structured output (tool use) to guarantee valid JSON response. The prompt instructs Claude to:
- Identify 5-10 metrics most relevant to the specific JD
- Score each 1-10 with a weight
- Provide summary, detailed explanation, and 2-4 actionable improvements per metric

## Frontend

### User Flow

1. **Upload** — drag-and-drop zone or file picker for PDF
2. **JD Input** — textarea for job description, "Analyze" button
3. **Results** — overall score as circular ring/gauge, grid of metric cards
4. **Drill-down** — click a metric card to expand: detailed explanation + improvement bullets

### Tech

- Vue 3 Composition API + TypeScript
- Tailwind CSS for styling
- Axios for API calls
- Loading state with skeleton/spinner during analysis

## Docker

- `frontend/Dockerfile` — build Vue, serve with nginx
- `backend/Dockerfile` — Python, run uvicorn
- `docker-compose.yml` — both services, nginx proxies `/api` to backend
- `.env.example` — `ANTHROPIC_API_KEY=your-key-here`

Run: `docker compose up`
