# FitScoreAI

AI-powered resume-to-job-description fit analysis. Upload your PDF resume, paste a job description, and get a detailed fit score (1-10) across dynamically-determined metrics with actionable improvement suggestions.

Built with **Vue 3** (frontend) and **FastAPI** (backend), powered by **Claude AI**.

<img width="1280" height="1327" alt="06-results-overview" src="https://github.com/user-attachments/assets/631c4ae0-abdc-49e4-8ba9-f9f110b090b8" />


---

## Prerequisites

- **Anthropic API key** — get one at https://console.anthropic.com
- For local dev: **Python 3.12+**, **uv**, **Node.js 20+**
- For Docker: **Docker Desktop**

---

## Quick Start: Docker Compose (Recommended)

```bash
cp .env.example .env
# Edit .env and add your ANTHROPIC_API_KEY

docker compose up --build
```

Open **http://localhost** — that's it.

To stop: `docker compose down`

---

## Option 1: Run Locally (for Development)

### Step 1: Clone and navigate to the project

```bash
cd /path/to/FitScoreAI
```

### Step 2: Set your Anthropic API key

```bash
export ANTHROPIC_API_KEY=sk-ant-your-key-here
```

To persist across terminal sessions, add it to your shell profile:

```bash
echo 'export ANTHROPIC_API_KEY=sk-ant-your-key-here' >> ~/.zshrc
source ~/.zshrc
```

### Step 3: Start the backend

```bash
cd backend
uv sync
uv run uvicorn app.main:app --reload --port 8000
```

You should see:

```
INFO:     Uvicorn running on http://127.0.0.1:8000
INFO:     Started reloader process
```

Verify it's working:

```bash
curl http://localhost:8000/api/health
# Expected: {"status":"ok"}
```

### Step 4: Start the frontend (in a new terminal)

```bash
cd frontend
npm install
npm run dev
```

You should see:

```
VITE ready in ~500ms
➜  Local:   http://localhost:5173/
```

### Step 5: Use the app

1. Open **http://localhost:5173** in your browser
2. Upload a PDF resume (drag-and-drop or click to browse)
3. Click **Continue**
4. Paste the full job description into the textarea
5. Click **Analyze Fit**
6. View your overall score and individual metrics
7. Click any metric card to see detailed explanation and improvement tips

---

## Option 2: Run with Docker Compose

### Step 1: Set up environment variables

```bash
cp .env.example .env
```

Edit `.env` and add your API key:

```
ANTHROPIC_API_KEY=sk-ant-your-key-here
```

### Step 2: Build and start

```bash
docker compose up --build
```

Wait for both services to start. You should see:

```
backend-1   | INFO:     Uvicorn running on http://0.0.0.0:8000
frontend-1  | /docker-entrypoint.sh: Configuration complete; ready for start up
```

### Step 3: Use the app

1. Open **http://localhost** in your browser
2. Follow the same upload → paste JD → analyze flow as above

### Stopping

```bash
docker compose down
```

---

## Running Unit Tests

### Backend (pytest)

No app running required — tests mock all external dependencies.

```bash
cd backend
uv sync
uv run pytest -v
```

Expected output: **18 tests passing** across schemas, analyzer, and API layers.

### Frontend (Vitest)

No app running required — components are tested in isolation with happy-dom.

```bash
cd frontend
npm install
npm run test
```

Expected output: **22 tests passing** across the API client and all Vue components.

To run in watch mode during development:

```bash
npm run test:watch
```

---

## Running E2E Tests (Playwright)

The project includes Playwright tests that exercise the full user flow and capture screenshots.

### Prerequisites

```bash
cd frontend
npm install
npx playwright install chromium
```

### Run tests

Make sure the app is running first (via Docker Compose or locally), then:

```bash
cd frontend
npx playwright test
```

Screenshots are saved to `frontend/e2e/screenshots/`.

To run in headed mode (see the browser):

```bash
npx playwright test --headed
```

---

## Project Structure

```
FitScoreAI/
├── backend/                  # FastAPI backend
│   ├── app/
│   │   ├── main.py           # API routes (/api/analyze, /api/health)
│   │   ├── analyzer.py       # PDF parsing + Claude API integration
│   │   └── schemas.py        # Pydantic models (Metric, AnalysisResponse)
│   ├── tests/                # pytest unit tests (18 tests)
│   │   ├── conftest.py       # Fixtures (TestClient, sample data)
│   │   ├── fixtures/         # Sample PDF for extraction tests
│   │   ├── test_schemas.py
│   │   ├── test_analyzer.py
│   │   └── test_api.py
│   ├── pyproject.toml        # Python dependencies (managed by uv)
│   └── Dockerfile
├── frontend/                 # Vue 3 frontend
│   ├── src/
│   │   ├── App.vue           # Root component (step flow)
│   │   ├── api.ts            # API service (axios calls)
│   │   ├── types.ts          # TypeScript interfaces
│   │   ├── __tests__/        # Vitest unit tests — API client
│   │   └── components/
│   │       ├── UploadStep.vue
│   │       ├── JDInputStep.vue
│   │       ├── ResultsDashboard.vue
│   │       ├── MetricCard.vue
│   │       └── __tests__/    # Vitest unit tests — components (22 tests)
│   ├── e2e/                  # Playwright E2E tests
│   │   ├── fitscore-demo.spec.ts
│   │   └── screenshots/      # Auto-captured screenshots
│   ├── playwright.config.ts  # Playwright config
│   ├── vite.config.ts        # Vite config + API proxy
│   ├── nginx.conf            # Production nginx config
│   └── Dockerfile
├── docker-compose.yml
├── .env.example              # Template for API key
└── docs/
    ├── vue-learning-guide.md # Vue.js guide with backend analogies
    └── plans/                # Design and implementation docs
```

---

## How It Works

1. User uploads a PDF resume and pastes a job description
2. Backend extracts text from the PDF using `pdfplumber`
3. Backend sends resume text + JD to Claude API with a structured output prompt
4. Claude identifies 5-10 relevant metrics for this specific role, scores each 1-10, and provides improvement suggestions
5. Backend computes the overall score (weighted average) and returns the results
6. Frontend displays the score dashboard with expandable metric cards

---

## Troubleshooting Steps

### "Could not extract text from the PDF"

The PDF might be a scanned image rather than text-based. Try a PDF that was exported from Word/Google Docs rather than scanned.

### Backend returns 500 error

Check that `ANTHROPIC_API_KEY` is set correctly:

```bash
echo $ANTHROPIC_API_KEY
# Should print your key, not empty
```

### Port already in use

Kill existing processes on the port:

```bash
# Backend (port 8000)
lsof -ti :8000 | xargs kill

# Frontend (port 5173)
lsof -ti :5173 | xargs kill
```

### Docker build fails with `lightningcss` or native module errors

This happens when Docker uses cached layers with macOS binaries. Rebuild without cache:

```bash
docker compose build --no-cache
```

### Frontend shows CORS error

Make sure the backend is running on port 8000 before starting the frontend. The Vite dev server proxies `/api` requests to `localhost:8000`.
