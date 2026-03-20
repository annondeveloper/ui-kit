# ClaimClear AI Pro - Architecture Document

## System Architecture

ClaimClear AI Pro follows a clean client-server architecture with an external AI service integration.

### Component Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                        Frontend (React)                         │
│                                                                 │
│  ┌──────────┐  ┌─────────────┐  ┌────────────────────────────┐ │
│  │  Header   │  │  ClaimForm  │  │  ExplanationResult         │ │
│  │           │  │             │  │  ├── ComprehensionGauge    │ │
│  │           │  │  ├─ Fields  │  │  ├── GlossaryAccordion    │ │
│  │           │  │  ├─ Sample  │  │  ├── StatsBar             │ │
│  │           │  │  │  Buttons │  │  └── Copy / Download      │ │
│  │           │  │  └─ Submit  │  │                            │ │
│  └──────────┘  └──────┬──────┘  └─────────────▲──────────────┘ │
│                        │ ClaimRequest          │ ClaimResponse  │
│                        ▼                       │                │
│                ┌───────────────┐                │                │
│                │  api/client   │────────────────┘                │
│                │  (axios)      │                                 │
│                └───────┬───────┘                                 │
└────────────────────────┼────────────────────────────────────────┘
                         │ HTTP POST /api/explain
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│                     Backend (Rust / Axum)                        │
│                                                                 │
│  main.rs                                                        │
│  ├── Router setup (CORS, tracing, routes)                       │
│  ├── AppState (shared OpenAI key)                               │
│  │                                                              │
│  handlers.rs                                                    │
│  ├── explain_claim()  ──► openai::generate_explanation()        │
│  │                    ──► openai::compute_comprehension_score() │
│  ├── health_check()                                             │
│  └── get_samples()                                              │
│                                                                 │
│  openai.rs                                                      │
│  ├── build_system_prompt()                                      │
│  ├── build_user_prompt()                                        │
│  ├── generate_explanation()  ──► reqwest POST to OpenAI         │
│  └── compute_comprehension_score()                              │
│                                                                 │
│  models.rs                                                      │
│  ├── ClaimRequest / ClaimResponse / GlossaryTerm                │
│  ├── SampleClaim / SamplesResponse / HealthResponse             │
│  └── OpenAI DTOs (OpenAiRequest, OpenAiResponse, etc.)          │
│                                                                 │
│  error.rs                                                       │
│  └── AppError (OpenAi | Validation | Internal)                  │
└────────────────────────┼────────────────────────────────────────┘
                         │ HTTPS POST
                         ▼
                ┌─────────────────┐
                │   OpenAI API    │
                │ chat/completions│
                │  (gpt-4o-mini)  │
                └─────────────────┘
```

## Why Rust for the Backend

### Performance
- **Zero-cost abstractions**: Generics, traits, and iterators compile down to optimal machine code with no runtime overhead.
- **No garbage collector**: Deterministic memory management via ownership eliminates GC pauses, ensuring consistent low-latency responses.
- **Async I/O**: Tokio provides a work-stealing, multi-threaded async runtime. While waiting for OpenAI API responses, the server handles other requests efficiently.

### Safety
- **Memory safety**: The borrow checker prevents use-after-free, double-free, and data races at compile time.
- **Thread safety**: `Send` and `Sync` traits ensure data shared across threads is accessed safely. The `Arc<AppState>` pattern used here is checked at compile time.
- **Exhaustive matching**: The `AppError` enum with `match` ensures every error variant is handled, preventing unhandled exceptions.

### Concurrency
- **Axum + Tokio**: Each incoming request is an async task scheduled on the Tokio runtime. Thousands of concurrent requests can be served on a small number of OS threads.
- **No shared mutable state**: `AppState` is immutable and wrapped in `Arc`, so no locking overhead.

## Why React + Tailwind CSS

### React + TypeScript
- **Type safety end-to-end**: TypeScript interfaces mirror Rust structs (`ClaimRequest`, `ClaimResponse`), catching contract mismatches at compile time.
- **Component architecture**: Each UI concern (form, results, header, footer) is an isolated, testable component.
- **Hooks**: `useState` and `useEffect` provide clean state management without external libraries for this scale of app.

### Tailwind CSS
- **Utility-first**: Styles live alongside markup, eliminating CSS file management and reducing context switching.
- **Tiny production bundle**: PurgeCSS removes unused utilities. A typical Tailwind build is 5-10 KB gzipped.
- **Design consistency**: Spacing scale, color palette, and responsive breakpoints are standardised via the config.

### Vite
- **Sub-second HMR**: Module-level hot replacement makes development feedback nearly instant.
- **ESBuild-powered**: TypeScript and JSX are transpiled via ESBuild (written in Go), orders of magnitude faster than Webpack/Babel.

## Data Flow

```
1. User fills ClaimForm (or clicks a sample quick-fill button)
2. User clicks "Generate Explanation"
3. Frontend POSTs ClaimRequest to /api/explain
4. Backend validates the request (field presence, positive amount)
5. Backend constructs system + user prompts
6. Backend sends chat completions request to OpenAI API
7. OpenAI returns structured JSON (explanation + glossary)
8. Backend parses the JSON, computes comprehension score
9. Backend returns ClaimResponse (explanation, glossary, score, timing)
10. Frontend renders ExplanationResult with animated reveal
```

## API Contract

### Endpoint: `POST /api/explain`

| Field            | Type   | Required | Description                          |
|------------------|--------|----------|--------------------------------------|
| claim_id         | string | yes      | Unique claim identifier              |
| customer_name    | string | yes      | Policyholder's name                  |
| policy_type      | string | yes      | Insurance policy category            |
| claim_amount     | f64    | yes      | Dollar amount claimed (must be > 0)  |
| decision         | string | yes      | Approved / Denied / Partially Approved|
| decision_reason  | string | yes      | Insurer's reasoning                  |
| policy_terms     | string | no       | Relevant policy sections             |
| tone             | string | no       | empathetic / formal / simple         |
| reading_level    | string | no       | 5th grade / 8th grade / professional |

### Response (200)

| Field               | Type             | Description                        |
|----------------------|------------------|------------------------------------|
| explanation          | string           | Plain-language explanation         |
| glossary             | GlossaryTerm[]   | Insurance terms with definitions   |
| comprehension_score  | f64              | Readability score (0-100)          |
| processing_time_ms   | u64              | Server-side processing time        |
| request_id           | string (UUID v4) | Unique request identifier          |

### Error Response (4xx / 5xx)

```json
{ "error": { "type": "validation_error", "message": "claim_id is required" } }
```

## Scalability Analysis

### Current Architecture (Single Server)
- **Throughput**: Axum on Tokio can handle 10,000+ concurrent connections. The bottleneck is the OpenAI API latency (~1-3 seconds per request), not the server.
- **CPU**: Comprehension scoring is O(n) on text length, negligible compared to network I/O.

### Horizontal Scaling
- The backend is **stateless** (no sessions, no database). Any number of instances can sit behind a load balancer.
- Add Redis or a database only if you need request caching, rate limiting, or audit logging.

### Vertical Scaling
- Rust's low memory footprint (~10-20 MB resident) means a single server can run many instances.
- Tokio's work-stealing scheduler automatically utilises all CPU cores.

## Security Considerations

1. **API key management**: The OpenAI key is loaded from environment variables, never hardcoded or sent to the client. The `.env` file is gitignored via `.env.example`.

2. **Input validation**: All required fields are validated server-side before the OpenAI call. This prevents unnecessary API spend on malformed requests.

3. **CORS**: Restricted to `localhost:5173` in development. Production should restrict to the actual frontend domain.

4. **No PII storage**: The server processes claims in-flight but does not persist any personally identifiable information. Explanations exist only in the HTTP response.

5. **Error sanitisation**: Internal errors are logged server-side with tracing but the client receives only a generic message and error type, preventing information leakage.

6. **Dependency supply chain**: Cargo.lock pins exact dependency versions. `cargo audit` can scan for known vulnerabilities.

## Performance Benchmarks (Expected)

| Metric                        | Expected Value      |
|-------------------------------|---------------------|
| Server cold start             | < 100 ms            |
| Health check latency (p99)    | < 1 ms              |
| Explain endpoint (excl. AI)   | < 5 ms overhead     |
| OpenAI round-trip             | 1,000 - 3,000 ms    |
| Memory usage (idle)           | ~15 MB RSS          |
| Memory usage (100 concurrent) | ~30 MB RSS          |
| Frontend bundle (gzipped)     | < 80 KB             |
| Lighthouse Performance score  | 95+                 |
