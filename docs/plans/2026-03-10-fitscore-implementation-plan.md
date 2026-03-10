# FitScoreAI Implementation Plan

## Context

Building a new web app from scratch in an empty directory. Users upload a PDF resume + paste a job description, and Claude analyzes the match returning scored metrics with improvement suggestions. Monorepo with Vue 3 frontend and FastAPI backend, orchestrated by Docker Compose.

Design doc: `docs/plans/2026-03-10-fitscore-design.md`

**User note:** Strong BE engineer, learning Vue.js — teach Vue concepts incrementally as we build.

## Step 1: Project Scaffolding & Backend Setup

- Initialize git repo
- Create backend directory structure:
  - `backend/app/main.py` — FastAPI app with CORS, routes
  - `backend/app/schemas.py` — Pydantic models (AnalysisResponse, Metric)
  - `backend/app/analyzer.py` — PDF parsing + Claude API integration
  - `backend/requirements.txt` — fastapi, uvicorn, python-multipart, pdfplumber, anthropic, pydantic
- Implement `POST /api/analyze`:
  1. Accept multipart form (PDF file + JD text)
  2. Extract text from PDF with pdfplumber
  3. Call Claude API with structured output (tool use) for guaranteed JSON
  4. Parse response, compute weighted overall score, return
- Implement `GET /api/health`
- Test backend manually with curl

## Step 2: Frontend Scaffolding (Vue.js Lesson 1: Project Structure)

- Scaffold Vue 3 + Vite + TypeScript project in `frontend/`
- Install and configure Tailwind CSS
- Install axios
- Set up Vite proxy for `/api` -> `http://localhost:8000` (dev mode)
- **Teaching:** Explain Vue 3 project structure, single-file components (.vue files), Composition API basics, and how Vite hot-reloads during development

## Step 3: Frontend UI (Vue.js Lessons 2-5: Components, Reactivity, Events)

Build incrementally, teaching each concept as it's used:

- **App.vue** — step flow logic (upload -> JD -> results), loading state
  - **Lesson 2:** `ref()` for reactive state, `v-if`/`v-else` for conditional rendering, template syntax
- **UploadStep.vue** — drag-and-drop PDF upload zone + file picker
  - **Lesson 3:** Component props/events (`defineProps`, `defineEmits`), `@dragover`/`@drop` event handling
- **JDInputStep.vue** — textarea for job description + "Analyze" button
  - **Lesson 3 continued:** `v-model` for two-way binding, form handling
- **ResultsDashboard.vue** — overall score ring + metric cards grid
  - **Lesson 4:** `v-for` for list rendering, computed properties, passing data to child components
- **MetricCard.vue** — expandable card: name, score bar, summary; on click: details + improvements list
  - **Lesson 4 continued:** Component state toggle, transition/animation basics
- Wire up axios call to `POST /api/analyze`
  - **Lesson 5:** Async operations in Vue, `async/await` in Composition API, loading/error states

## Step 4: Docker & Compose

- `backend/Dockerfile` — Python 3.12, install deps, run uvicorn
- `frontend/Dockerfile` — Node 20 build stage, nginx serve stage
- `frontend/nginx.conf` — serve static files, proxy `/api` to backend
- `docker-compose.yml` — frontend (:80) + backend (:8000), env vars
- `.env.example` — ANTHROPIC_API_KEY template
- Test full flow with `docker compose up`

## Step 5: CLAUDE.md & Polish

- Create CLAUDE.md with build/run commands and architecture overview
- Add `.gitignore` for Python + Node artifacts

## Verification

1. `docker compose up --build`
2. Open http://localhost in browser
3. Upload a PDF resume, paste a job description
4. Verify: overall score displays, 5-10 metric cards render, clicking a card shows details + improvements
5. Test edge cases: non-PDF upload, empty JD, large resume
