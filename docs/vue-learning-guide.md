# Vue.js Learning Guide for Backend Engineers

A practical guide to Vue 3 concepts, taught through the FitScoreAI codebase. Each lesson maps to a component you can read alongside.

Every lesson includes a **microservice analogy** so you can map frontend concepts to patterns you already know from building backend services.

---

## The Big Picture: Vue App as a Microservice

Before diving in, here's how a Vue frontend maps to backend architecture you already understand:

```
Backend Microservice                    Vue Frontend
─────────────────────                   ──────────────────
Service (FastAPI app)          ←→       App.vue (root component)
Endpoint handlers              ←→       Child components (UploadStep, ResultsDashboard)
Request/Response DTOs          ←→       Props (input) / Events (output)
Database / Redis state         ←→       ref() reactive state
@cached_property / memoize     ←→       computed()
Service-to-service HTTP calls  ←→       axios API calls
Pydantic models                ←→       TypeScript interfaces
Docker Compose orchestration   ←→       Component tree (parent → children)
Message queues (Kafka/SQS)     ←→       Event emitters ($emit)
```

**Key mental model:** Think of each `.vue` component as a **microservice** with:
- A **contract** (props it accepts = API request schema, events it emits = API response schema)
- **Internal state** (ref = its own database)
- **Derived data** (computed = materialized views)
- **Communication protocol** (props down / events up = request/response between services)

---

## Lesson 1: Project Structure

**Reference:** `frontend/` directory

Vue uses a build tool called **Vite** (like webpack, but fast). Here's the layout mapped to Python equivalents:

| Frontend | Python Equivalent |
|---|---|
| `package.json` | `pyproject.toml` (deps) |
| `node_modules/` | `.venv/` |
| `vite.config.ts` | Build/dev config |
| `src/main.ts` | `if __name__ == "__main__"` |
| `src/App.vue` | Root component (entry point) |
| `src/components/` | Reusable modules |

### Single-File Components (`.vue` files)

Every `.vue` file has up to 3 sections:

```vue
<template>    <!-- HTML (what renders) — like a Jinja template -->
  <div>{{ message }}</div>
</template>

<script setup lang="ts">  <!-- Logic — like a Python class -->
import { ref } from 'vue'
const message = ref('Hello')
</script>

<style scoped>  <!-- CSS scoped to THIS component only -->
div { color: blue; }
</style>
```

### Microservice Analogy

Think of a `.vue` file as a **single microservice definition file** that bundles everything together:

```
.vue file                         Microservice
──────────                        ────────────
<template>                   ←→   API response format (what the service outputs/renders)
<script setup>               ←→   Business logic (handlers, state, computations)
<style scoped>               ←→   Service-specific config (doesn't leak to other services)
```

In backend world, you'd spread these across `routes.py`, `service.py`, `config.py`. Vue co-locates them because a component's template, logic, and styling are tightly coupled — they change together. This is the same reasoning behind putting a Dockerfile next to the service code: things that change together live together.

### Vite Dev Server

- `npm run dev` starts a dev server with **hot module replacement** (HMR)
- Edit a `.vue` file → browser updates instantly without full reload
- `vite.config.ts` can proxy API calls: `/api/*` → `http://localhost:8000`

**Analogy:** HMR is like `uvicorn --reload` but even faster — it swaps just the changed component without resetting the app state. Imagine if your FastAPI could hot-swap a single endpoint handler without restarting the server or losing in-memory state.

---

## Lesson 2: Reactive State & Conditional Rendering

**Reference:** `src/App.vue`

### `ref()` — Reactive Variables

```ts
import { ref } from 'vue'
const count = ref(0)       // create a reactive variable
count.value++              // in script: access via .value
```

In the template, `.value` is automatic:
```vue
<template>
  <p>{{ count }}</p>       <!-- no .value needed in templates -->
</template>
```

**Key insight:** When a `ref` changes, Vue automatically re-renders any part of the UI that uses it. No manual DOM manipulation needed.

### Microservice Analogy: ref() as a Database with Change-Data-Capture

Think of `ref()` as a database table with a CDC (Change Data Capture) trigger:

```
Backend                                   Vue
──────                                    ───
db.insert(record)                    ←→   count.value = 5
CDC detects change                   ←→   Vue's reactivity system detects change
Downstream consumers get notified    ←→   All template expressions using `count` re-render
You don't manually notify consumers  ←→   You don't manually update the DOM
```

In a microservice, when you write to a database with CDC enabled (think Debezium/Kafka), downstream services automatically get the update. `ref()` works the same way — you just write to it, and every part of the UI that reads it automatically updates. You never call "re-render" manually, just like you never manually push CDC events.

### `v-if` / `v-else-if` / `v-else` — Conditional Rendering

```vue
<div v-if="step === 'upload'">Show upload form</div>
<div v-else-if="step === 'loading'">Loading...</div>
<div v-else>Show results</div>
```

Works exactly like Python's `if/elif/else`. Only the matching block is rendered.

### Microservice Analogy: API Gateway Routing

```
v-if="step === 'upload'"       ←→   if request.path == "/upload": route_to(upload_service)
v-else-if="step === 'loading'" ←→   elif request.path == "/status": route_to(status_service)
v-else                         ←→   else: route_to(default_service)
```

`App.vue` acts like an **API gateway** — it inspects the current state (`step`) and routes to the correct child component. Only one "service" handles the request at a time. The `step` ref is like the URL path that determines which handler runs.

### Type-safe refs

```ts
type Step = 'upload' | 'jd' | 'loading' | 'results' | 'error'
const step = ref<Step>('upload')  // TypeScript ensures only valid values
```

Like a Pydantic `Literal['upload', 'jd', 'loading', 'results', 'error']` — the compiler catches invalid states.

---

## Lesson 3: Props, Events & Two-Way Binding

**Reference:** `src/components/UploadStep.vue`, `src/components/JDInputStep.vue`

### Data Flow: Props Down, Events Up

```
Parent (App.vue)
  │
  ├── passes data DOWN via props (:metric="data")
  │
  └── listens for events UP via @ (@file-selected="handler")
        │
    Child (UploadStep.vue)
```

Think of it like function calls:
- **Props** = function parameters (data flows DOWN to child)
- **Events** = return values (data flows UP to parent)

### Microservice Analogy: Request/Response Between Services

This is the core analogy. Components communicate exactly like microservices:

```
Microservice Architecture                Vue Component Tree
──────────────────────                   ──────────────────

API Gateway (App.vue)                    App.vue
  │                                        │
  ├── POST /upload {file: pdf}    ←→       <UploadStep @file-selected="handler" />
  │   Response: {file: File}               UploadStep emits 'file-selected' with File
  │                                        │
  ├── POST /analyze {jd: text}    ←→       <JDInputStep @analyze="handler" />
  │   Response: {jd: string}               JDInputStep emits 'analyze' with string
  │                                        │
  └── GET /results                ←→       <ResultsDashboard :metrics="data" />
      Request includes metrics data        ResultsDashboard receives metrics as props
```

**Props = Request payload** the parent sends to the child.
**Events = Response payload** the child sends back to the parent.

Just like a microservice defines its API contract (request schema + response schema), a Vue component defines its contract with `defineProps` (what it receives) and `defineEmits` (what it sends back).

### `defineProps` — Receiving Data (= Request Schema)

```ts
// Child declares what it expects (like a Pydantic request model)
const props = defineProps<{
  metric: Metric    // TypeScript type
}>()
```

```python
# Backend equivalent
class AnalyzeRequest(BaseModel):
    metric: Metric

@app.post("/analyze")
def analyze(request: AnalyzeRequest):  # FastAPI validates the input
    ...
```

Parent passes it:
```vue
<MetricCard :metric="someData" />
```

The `:` prefix means "this is a JavaScript expression, not a string".

### `defineEmits` — Sending Data Up (= Response Schema)

```ts
// Child declares what events it can emit (like response models)
defineEmits<{
  'file-selected': [file: File]   // event name + payload type
  'back': []                       // no payload (like HTTP 204)
}>()
```

```python
# Backend equivalent — the response models
class FileSelectedResponse(BaseModel):
    file: File

# 'back' event is like returning 204 No Content
```

Child fires it:
```vue
<button @click="$emit('file-selected', file)">Upload</button>
```

Parent listens:
```vue
<UploadStep @file-selected="onFileSelected" />
```

**Analogy:** `@file-selected="onFileSelected"` is like registering a **webhook callback**. The parent says "when UploadStep produces a file-selected event, call my `onFileSelected` handler." Just like you'd register a webhook URL with a payment provider: "when payment completes, POST to my `/webhooks/payment` endpoint."

### `v-model` — Two-Way Binding

```vue
<textarea v-model="jdText" />
```

This is shorthand for:
```vue
<textarea :value="jdText" @input="jdText = $event.target.value" />
```

When the user types → `jdText` updates. When `jdText` changes in code → textarea updates. Like a Python property with both getter and setter.

**Analogy:** `v-model` is like a **bidirectional gRPC stream** — data flows both ways between the component and the DOM element. Compare this to props + events which are **unidirectional** (request then response), like standard HTTP.

### DOM Event Handling

```vue
<div
  @click="handleClick"           <!-- click event -->
  @dragover.prevent="onDrag"     <!-- .prevent = preventDefault() -->
  @drop.prevent="onDrop"
>
```

The `@` is shorthand for `v-on:`. Modifiers like `.prevent` save you from writing `event.preventDefault()`.

**Analogy:** Event modifiers are like **middleware**. `.prevent` is like a middleware that intercepts the request and stops default processing before your handler runs — similar to how a CORS middleware handles preflight requests before they reach your endpoint.

---

## Lesson 4: Lists, Computed Properties & Component State

**Reference:** `src/components/ResultsDashboard.vue`, `src/components/MetricCard.vue`

### `v-for` — Rendering Lists

```vue
<MetricCard
  v-for="m in metrics"   <!-- like Python: for m in metrics -->
  :key="m.name"          <!-- unique ID for efficient updates -->
  :metric="m"
/>
```

`:key` is required — it helps Vue track which items changed, were added, or removed (like a primary key in a database).

### Microservice Analogy: Service Instances

```
v-for="m in metrics"     ←→   Kubernetes spinning up one pod per item
:key="m.name"            ←→   Each pod has a unique identifier
:metric="m"              ←→   Each pod receives its own config/data
```

Think of `v-for` as a **Kubernetes Deployment with replicas**. You have a `MetricCard` template (= Docker image), and `v-for` creates one instance per metric (= one pod per replica). Each instance is independent with its own state. The `:key` is like the pod name — it lets the orchestrator (Vue) know which instance is which, so when the list changes, it can update/add/remove the right ones instead of recreating everything (like a rolling update vs. full redeployment).

### `computed()` — Derived Values

```ts
import { computed } from 'vue'

const scoreColor = computed(() => {
  if (props.metric.score >= 8) return 'text-green-600'
  if (props.metric.score >= 5) return 'text-yellow-600'
  return 'text-red-600'
})
```

Like a Python `@property` — it's derived from other reactive data and auto-updates when dependencies change. Vue caches the result until a dependency changes (unlike a method which re-runs every render).

### Microservice Analogy: Materialized Views / Redis Cache

```
computed()               ←→   Materialized view / Redis cache
───────────────────────────────────────────────
Source data changes      ←→   Database row updated
Computed auto-updates    ←→   Materialized view refreshes
Result is cached         ←→   Cache hit (no recomputation)
```

`computed()` is exactly like a **materialized view** in PostgreSQL or a **Redis cache with automatic invalidation**. The value is derived from source data (`props.metric.score`), cached, and only recomputed when the source changes. You never manually invalidate it — Vue tracks the dependencies automatically, like how a materialized view knows which tables it depends on.

Compare to a regular function which is like a **database query** — it runs every time you call it, even if the data hasn't changed.

### Dynamic Bindings

```vue
<!-- Dynamic CSS class -->
<span :class="scoreColor">{{ metric.score }}</span>

<!-- Dynamic inline style -->
<div :style="{ width: (score / 10) * 100 + '%' }" />
```

`:class` and `:style` accept JS expressions. The `:` prefix always means "evaluate this as JavaScript".

### Component-Local State Toggle

```ts
const expanded = ref(false)  // local to this component instance
```

```vue
<div @click="expanded = !expanded">
  <div v-if="expanded">Details here...</div>
</div>
```

Each `MetricCard` instance has its OWN `expanded` state — clicking one doesn't affect others.

**Analogy:** This is like each **microservice instance having its own in-memory cache**. Pod A's cache is independent of Pod B's cache. When you toggle `expanded` on one MetricCard, it's like modifying one pod's local state — other pods are unaffected because they each have their own `ref(false)`.

---

## Lesson 5: Async Operations

**Reference:** `src/App.vue` (handleAnalyze function), `src/api.ts`

### Async in Composition API

```ts
async function handleAnalyze(jobDescription: string) {
  step.value = 'loading'          // show spinner
  try {
    result.value = await analyzeResume(file, jobDescription)
    step.value = 'results'        // show results
  } catch (err: any) {
    errorMessage.value = err.message
    step.value = 'error'          // show error
  }
}
```

**Pattern:** Set loading state → await API call → set result or error state. The template reacts to each `ref` change automatically.

### Microservice Analogy: Saga / Orchestration Pattern

This is the **saga orchestration pattern** you'd use for a multi-step backend workflow:

```python
# Backend saga orchestrator
async def process_order(order: Order):
    order.status = "processing"        # step.value = 'loading'
    await db.save(order)

    try:
        payment = await payment_service.charge(order)   # await analyzeResume(...)
        order.status = "completed"                       # step.value = 'results'
        order.result = payment
    except PaymentError as e:
        order.status = "failed"                          # step.value = 'error'
        order.error = str(e)

    await db.save(order)
```

The pattern is identical:
1. Set state to "processing" (loading spinner)
2. Call external service (API call)
3. On success: update state to "completed" (show results)
4. On failure: update state to "failed" (show error)

Vue's reactivity system is like CDC on the `order` table — when `status` changes, downstream consumers (the template) automatically get the update and render the right UI.

### API Service Layer

```ts
// src/api.ts — keep API calls in a separate file
import axios from 'axios'

export async function analyzeResume(file: File, jd: string) {
  const formData = new FormData()
  formData.append('resume', file)
  formData.append('job_description', jd)
  const response = await axios.post('/api/analyze', formData)
  return response.data
}
```

**Analogy:** `src/api.ts` is your **service client** — exactly like how you'd create a `PaymentServiceClient` class that wraps HTTP calls to another microservice. It encapsulates the URL, request format, and response parsing so your business logic (App.vue) doesn't deal with raw HTTP.

Vite's dev proxy forwards `/api/*` to your FastAPI backend, so no CORS issues during development. This is like **nginx/envoy sitting in front of your services** — the frontend thinks it's talking to itself, but the proxy routes to the backend.

---

## Quick Reference

| Vue | Python/Backend Equivalent |
|---|---|
| `ref(value)` | Database row with CDC — write to it, consumers auto-update |
| `computed(() => ...)` | Materialized view / cached `@property` |
| `v-if` / `v-else` | API gateway routing based on request path |
| `v-for="x in list"` | K8s Deployment creating one pod per replica |
| `v-model` | Bidirectional gRPC stream |
| `@click` | Webhook callback registration |
| `:prop="expr"` | Request payload sent to downstream service |
| `defineProps` | Pydantic request model (input contract) |
| `defineEmits` | Response model / webhook schema (output contract) |
| `<style scoped>` | Service-specific config (doesn't leak to other services) |
| `.vue` file | Self-contained microservice (routes + logic + config) |
| Component tree | Service dependency graph |
| Vite proxy | Nginx/Envoy reverse proxy |
| HMR (hot reload) | `uvicorn --reload` but per-component, preserving state |
