# ClaimClear AI Pro

A high-performance, AI-powered insurance claim explanation assistant that translates complex insurance decisions into clear, compassionate language.

## Architecture Overview

```
┌──────────────────────────────────────────────────────────────┐
│                        Browser                               │
│  ┌────────────────────────────────────────────────────────┐  │
│  │         React + TypeScript + Tailwind CSS              │  │
│  │         (Vite dev server on :5173)                     │  │
│  └───────────────────────┬────────────────────────────────┘  │
└──────────────────────────┼───────────────────────────────────┘
                           │ HTTP (JSON)
                           ▼
┌──────────────────────────────────────────────────────────────┐
│                   Rust / Axum Backend                         │
│                   (listening on :3001)                        │
│                                                              │
│  ┌─────────┐  ┌───────────┐  ┌──────────┐  ┌────────────┐  │
│  │ Handlers│──│  OpenAI   │──│  Models  │──│   Error    │  │
│  │ (routes)│  │ (reqwest) │  │  (serde) │  │ (AppError) │  │
│  └─────────┘  └─────┬─────┘  └──────────┘  └────────────┘  │
└──────────────────────┼───────────────────────────────────────┘
                       │ HTTPS
                       ▼
              ┌─────────────────┐
              │  OpenAI API     │
              │  (GPT-4o-mini)  │
              └─────────────────┘
```

## Tech Stack

| Layer    | Technology                 | Why                                                        |
|----------|----------------------------|------------------------------------------------------------|
| Backend  | Rust + Axum                | Memory-safe, zero-cost abstractions, async-first framework |
| Frontend | React + TypeScript + Vite  | Type-safe UI with instant HMR and fast builds              |
| Styling  | Tailwind CSS               | Utility-first CSS, no context switching, tiny bundle       |
| AI       | OpenAI GPT-4o-mini         | Fast, cost-effective model with strong instruction-following|
| HTTP     | reqwest (backend), axios (frontend) | Mature, ergonomic HTTP clients for each ecosystem |

## Setup Instructions

### Prerequisites

- Rust toolchain (1.75+): https://rustup.rs
- Node.js (18+) and npm
- An OpenAI API key

### Backend

```bash
cd backend

# Create your .env file
cp .env.example .env
# Edit .env and add your OPENAI_API_KEY

# Run the server
cargo run
```

The backend will start on `http://localhost:3001`.

### Frontend

```bash
cd frontend

# Install dependencies
npm install

# Start the dev server
npm run dev
```

The frontend will start on `http://localhost:5173`.

## API Documentation

### `GET /api/health`

Returns server health status.

**Response:**
```json
{
  "status": "ok",
  "version": "0.1.0",
  "timestamp": "2024-01-15T10:30:00Z"
}
```

### `GET /api/samples`

Returns pre-filled sample claims for quick testing.

**Response:**
```json
{
  "samples": [
    {
      "label": "Denied Auto Claim",
      "claim_id": "CLM-2024-78432",
      "customer_name": "Sarah Johnson",
      ...
    }
  ]
}
```

### `POST /api/explain`

Generates a plain-language explanation of an insurance claim decision.

**Request Body:**
```json
{
  "claim_id": "CLM-2024-78432",
  "customer_name": "Sarah Johnson",
  "policy_type": "Comprehensive Auto Insurance",
  "claim_amount": 4250.00,
  "decision": "Denied",
  "decision_reason": "Vehicle damage occurred during racing...",
  "policy_terms": "Section 4.2(b) - Motorsport Exclusion...",
  "tone": "empathetic",
  "reading_level": "8th grade"
}
```

**Response:**
```json
{
  "explanation": "Dear Sarah, ...",
  "glossary": [
    { "term": "Exclusion", "definition": "A specific situation..." }
  ],
  "comprehension_score": 82.5,
  "processing_time_ms": 2340,
  "request_id": "550e8400-e29b-41d4-a716-446655440000"
}
```

**Error Response:**
```json
{
  "error": {
    "type": "validation_error",
    "message": "claim_id is required"
  }
}
```

## Design Decisions

1. **Structured JSON prompting**: The OpenAI system prompt requires the model to return valid JSON, making parsing deterministic and enabling structured glossary extraction.

2. **Comprehension scoring**: A lightweight heuristic (inspired by Gunning Fog Index) runs server-side without an extra API call, providing instant readability feedback.

3. **Sample claims**: Pre-filled examples cover different policy types and decisions (approved, denied, partial), allowing instant exploration without filling forms.

4. **CORS configuration**: Restricted to `localhost:5173` to match the Vite dev server. Production deployments should update this to the actual frontend origin.
