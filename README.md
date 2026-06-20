# AI Philosophy

A visual, exploratory website that teaches people how AI works — from the basics of machine learning to transformers, RAG, and beyond. Users navigate an interactive concept map, click into nodes, and work through illustrated modules at their own pace.

---

## Tech stack

| Layer | Technology |
|---|---|
| Frontend | React 18 + Vite + TypeScript + Tailwind CSS |
| Visualisation | D3.js (concept map), Framer Motion |
| Backend | FastAPI (Python) |
| Database | Turso (libSQL) — user data, progress, refresh tokens |
| Vector search | Turso sqlite-vec (Phase 4 — RAG simulation) |
| Auth | JWT (15 min access tokens) + HttpOnly refresh cookies (7 days) |
| Deployment | AWS App Runner (backend) + S3 + CloudFront (frontend) |
| CI/CD | GitHub Actions → ECR → App Runner / S3 |

---

## Project structure

```
aiphilosophy/
├── backend/
│   ├── app/
│   │   ├── api/routes/     # auth, progress
│   │   ├── core/           # config, security, rate limiting
│   │   ├── db/             # Turso client, migrations
│   │   └── models/         # Pydantic schemas
│   ├── Dockerfile
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── components/     # ConceptMap, ErrorBoundary, ProtectedRoute
│   │   ├── contexts/       # AuthContext
│   │   ├── data/           # nodes.ts — concept map data
│   │   ├── hooks/          # useAuth, useProgress
│   │   ├── lib/            # Axios instance with silent refresh
│   │   └── pages/
│   │       ├── auth/       # Login, Register
│   │       ├── modules/    # WhatIsAI (more added each phase)
│   │       ├── Home.tsx    # Concept map
│   │       ├── Learn.tsx   # Module shell
│   │       └── Profile.tsx
│   └── Dockerfile.dev
├── .github/workflows/      # backend.yml, frontend.yml
├── docker-compose.yml
└── CLAUDE.md               # Full project spec and build plan
```

---

## Running locally

### Prerequisites

- Docker and Docker Compose
- A [Turso](https://turso.tech) database (free tier works)

### 1. Configure the backend

```bash
cp backend/.env.example backend/.env
```

Fill in `backend/.env`:

```env
TURSO_URL=libsql://<your-db>.turso.io
TURSO_AUTH_TOKEN=<your-token>
JWT_SECRET_KEY=<random-hex-string>   # openssl rand -hex 32
ENVIRONMENT=development
CORS_ORIGINS=["http://localhost:5173"]
```

### 2. Start everything

```bash
docker compose up --build
```

| Service | URL |
|---|---|
| Frontend | http://localhost:5173 |
| Backend API | http://localhost:8000 |
| API docs | http://localhost:8000/docs |

The backend runs database migrations on startup — no manual SQL needed.

---

## API overview

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/auth/register` | Create account |
| POST | `/api/auth/login` | Login, receive tokens |
| POST | `/api/auth/logout` | Revoke refresh token |
| POST | `/api/auth/refresh` | Rotate refresh token, get new access token |
| GET | `/api/progress` | Get completed node IDs for current user |
| POST | `/api/progress/{node_id}` | Mark a concept as complete |
| GET | `/health` | Health check |

---

## Build phases

| Phase | Scope | Status |
|---|---|---|
| 0 — Infrastructure | Auth, DB, Docker, CI/CD scaffolding | ✅ Done |
| 1 — Concept map | D3 map, module shell, "What is AI?" | ✅ Done |
| 2 — Neural Networks | Perceptron sliders, animated forward pass, TensorFlow.js XOR demo | Planned |
| 3 — Transformers Lite | Tokenisation, 2D embedding scatter, attention heatmap | Planned |
| 4 — RAG Pipeline | Vector search with Turso sqlite-vec, animated retrieval | Planned |
| 5 — How to Use AI | Prompt engineering, hallucinations, real use cases | Planned |

---

## Security notes

- Passwords hashed with bcrypt (rounds=12)
- Refresh tokens stored as SHA-256 hashes; rotated on every use
- HttpOnly + SameSite=Strict cookies; Secure flag in production
- Rate limiting on all auth endpoints (slowapi)
- CORS locked to configured origins
- Security headers on every response (X-Frame-Options, X-Content-Type-Options, Referrer-Policy, Permissions-Policy, HSTS in production)
- Parameterised queries only — no raw string SQL
