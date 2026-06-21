# AI Philosophy

A visual, interactive website that teaches people how AI works — written for anyone, not just developers. Users navigate a concept map of 13 topics, click into nodes, and work through illustrated modules with live simulations at their own pace.

No prior technical knowledge required.

---

## What this teaches

The 13 modules form a dependency graph — each one unlocks the next. Start with "What is AI?" and follow the path through neural networks all the way to how to use AI responsibly.

| Module | What it covers | Interactive |
|---|---|---|
| What is AI? | The training loop, weights, supervised vs unsupervised at a high level | Diagram |
| Types of ML | Supervised, unsupervised, reinforcement learning — when to use each | Scatter plot with decision boundary |
| Neural Networks | Perceptrons, layers, the forward pass, XOR problem | Weight sliders, live network, TensorFlow.js XOR trainer |
| Activations | ReLU, Sigmoid, Tanh, GeLU — why non-linearity matters | Live curve explorer |
| Transformers | The architecture behind GPT, Claude, Gemini | Architecture diagram |
| Fine-Tuning | Adapting a pre-trained model to a specific task; LoRA, RLHF, instruction tuning | Approach explorer, fine-tuning vs RAG comparison |
| Attention | How models focus on context; Q/K/V; multi-head attention | Attention heatmap |
| Tokenization | BPE tokenization; why AI never reads full words | Live tokenizer |
| RAG | Retrieval-Augmented Generation pipeline end-to-end | Pipeline animation |
| Embeddings | Words as vectors; similarity; analogies as arithmetic | Interactive 2D word map |
| Retrieval | Cosine similarity; ANN search (HNSW, IVF) | Nearest-neighbour visualiser |
| Prompt Engineering | System prompts, few-shot, chain-of-thought, patterns | Prompt gallery |
| Hallucinations | Why models confabulate; types; mitigation strategies | Example gallery |
| Use Cases | Code, summarisation, classification | Live demos |

### Concept map unlock order

```
                    [What is AI?]
                         |
           ┌─────────────┴──────────────┐
      [Types of ML]            [Neural Networks]
                               /              \
                       [Activations]      [Transformers]
                                        /      |       \
                              [Attention] [Tokenization] [Fine-Tuning]
                                                       |
                                                     [RAG]
                                               /      |      \
                                    [Embeddings] [Retrieval] [Prompt Engineering]
                                                             /                  \
                                                   [Hallucinations]         [Use Cases]
```

---

## Tech stack

| Layer | Technology |
|---|---|
| Frontend | React 19 + Vite 8 + TypeScript 6 + Tailwind CSS 4 |
| Routing | React Router v7 |
| Visualisation | Native SVG + pointer/wheel events (concept map), D3 (data), TensorFlow.js (in-browser training) |
| Backend | FastAPI (Python 3.12) |
| Database | Turso (libSQL) — users, progress, refresh tokens |
| Vector search | Turso sqlite-vec — RAG simulation |
| Auth | JWT access tokens (15 min) + HttpOnly refresh cookies (7 days, rotated) |
| Deployment | AWS App Runner (backend) + S3 + CloudFront (frontend) |
| CI/CD | GitHub Actions → ECR → App Runner / S3 sync |

---

## Running locally

### Prerequisites

- Docker and Docker Compose
- A [Turso](https://turso.tech) account and database (free tier works)
- `openssl` (to generate a secret key)

### 1. Create a Turso database

```bash
turso db create ai-philosophy
turso db show ai-philosophy         # copy the URL
turso db tokens create ai-philosophy  # copy the token
```

### 2. Configure environment variables

```bash
cp backend/.env.example backend/.env
```

Edit `backend/.env`:

```env
TURSO_URL=libsql://<your-db>.turso.io
TURSO_AUTH_TOKEN=<your-token>
JWT_SECRET_KEY=<random-hex>          # openssl rand -hex 32
ENVIRONMENT=development
CORS_ORIGINS=["http://localhost:5173"]
```

### 3. Start everything

```bash
docker compose up --build
```

The backend runs migrations on startup — no manual SQL needed.

| Service | URL |
|---|---|
| Frontend | http://localhost:5173 |
| Backend API | http://localhost:8000 |
| API docs | http://localhost:8000/docs |

### Running without Docker

```bash
# Backend
cd backend
pip install -r requirements.txt
uvicorn app.main:app --reload

# Frontend (separate terminal)
cd frontend
npm install
npm run dev
```

---

## Project structure

```
aiphilosophy/
├── backend/
│   ├── app/
│   │   ├── api/
│   │   │   ├── deps.py              # get_current_user dependency
│   │   │   └── routes/
│   │   │       ├── auth.py          # register, login, logout, refresh
│   │   │       ├── progress.py      # get/mark/unmark node completion
│   │   │       └── users.py         # GET /users/me
│   │   ├── core/
│   │   │   ├── config.py            # Pydantic settings (env vars)
│   │   │   ├── limits.py            # slowapi limiter instance
│   │   │   └── security.py          # bcrypt, JWT, SHA-256 token hashing
│   │   ├── db/
│   │   │   ├── client.py            # Turso client + db_execute() with retry
│   │   │   └── migrations.py        # CREATE TABLE IF NOT EXISTS on startup
│   │   ├── models/
│   │   │   └── auth.py              # RegisterRequest, LoginRequest, TokenResponse
│   │   └── main.py                  # FastAPI app, middleware, router registration
│   ├── Dockerfile
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── ConceptMap.tsx       # SVG concept map with pan/zoom/hover
│   │   │   ├── ErrorBoundary.tsx    # Class-based error boundary
│   │   │   └── ProtectedRoute.tsx   # Redirects unauthenticated users
│   │   ├── contexts/
│   │   │   ├── AuthContext.tsx      # createContext only (no JSX — fast refresh safe)
│   │   │   └── AuthProvider.tsx     # Provider component + reducer
│   │   ├── data/
│   │   │   ├── nodes.ts             # 13 concept nodes + unlock graph
│   │   │   ├── attentionData.ts     # Precomputed attention weights
│   │   │   ├── wordEmbeddings.ts    # ~200 words PCA'd to 2D
│   │   │   └── ragDocuments.ts      # Precomputed RAG demo documents
│   │   ├── hooks/
│   │   │   ├── useAuth.ts           # Reads from AuthContext
│   │   │   └── useProgress.ts       # Fetches/updates node completion state
│   │   ├── lib/
│   │   │   └── api.ts               # Axios instance; silent refresh interceptor with lock
│   │   └── pages/
│   │       ├── auth/                # Login.tsx, Register.tsx
│   │       ├── modules/             # One .tsx per concept node (13 total)
│   │       ├── Home.tsx             # Concept map page
│   │       ├── Learn.tsx            # Module shell with lazy loading + ErrorBoundary
│   │       └── Profile.tsx          # Progress overview
│   ├── Dockerfile.dev
│   └── package.json
├── .github/
│   └── workflows/
│       ├── backend.yml              # test → build → push ECR → deploy App Runner
│       └── frontend.yml             # typecheck → build → sync S3 → invalidate CloudFront
├── docker-compose.yml
├── CLAUDE.md                        # Developer context for AI-assisted development
└── README.md
```

---

## API reference

All endpoints except `/health` require authentication unless noted.

### Auth

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/api/auth/register` | None | Create account. Returns access token + sets refresh cookie. |
| POST | `/api/auth/login` | None | Login. Returns access token + sets refresh cookie. |
| POST | `/api/auth/logout` | None | Revokes refresh token, clears cookie. |
| POST | `/api/auth/refresh` | Cookie | Rotates refresh token, returns new access token. |

Rate limits: register 5/min · login 10/min · logout 20/min · refresh 20/min.

### Users

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/api/users/me` | Bearer | Returns `{ id, email, created_at }` for the current user. |

### Progress

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/api/progress` | Bearer | Returns `{ completed: string[] }` — list of completed node IDs. |
| POST | `/api/progress/{node_id}` | Bearer | Mark a concept node as complete. |
| DELETE | `/api/progress/{node_id}` | Bearer | Mark a concept node as incomplete. |

### Misc

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/health` | None | Returns `{ status: "ok" }`. Used by Docker health check. |

---

## Authentication flow

```
Browser                          Backend
  │                                │
  ├─ POST /auth/login ────────────►│
  │◄─ { access_token } + cookie ───┤  (access: 15 min JWT, refresh: 7-day HttpOnly cookie)
  │                                │
  ├─ GET /api/progress ──────────►│  Authorization: Bearer <access_token>
  │◄─ { completed: [...] } ────────┤
  │                                │
  │  [access token expires]        │
  │                                │
  ├─ GET /api/progress ──────────►│  401 Unauthorized
  │  ↳ interceptor fires           │
  ├─ POST /auth/refresh ─────────►│  sends refresh cookie automatically
  │◄─ { access_token } ────────────┤  (old refresh token revoked, new one issued)
  ├─ retry original request ──────►│
  │◄─ { completed: [...] } ────────┤
```

Concurrent 401s share a single refresh call (the interceptor uses a lock) so two simultaneous token expiries don't race each other.

---

## Database schema

```sql
CREATE TABLE users (
  id            TEXT PRIMARY KEY,       -- UUID v4
  email         TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,          -- bcrypt, rounds=12
  created_at    TEXT NOT NULL           -- ISO 8601 UTC
);

CREATE TABLE progress (
  user_id      TEXT NOT NULL,
  node_id      TEXT NOT NULL,
  completed_at TEXT NOT NULL,
  PRIMARY KEY (user_id, node_id),
  FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE refresh_tokens (
  token_hash TEXT PRIMARY KEY,          -- SHA-256 of the raw token
  user_id    TEXT NOT NULL,
  expires_at TEXT NOT NULL,
  revoked    INTEGER NOT NULL DEFAULT 0,
  FOREIGN KEY (user_id) REFERENCES users(id)
);
```

Tables are created automatically on startup via `run_migrations()`. Expired and revoked refresh tokens are deleted on every login and token rotation to prevent table bloat.

---

## Security model

| Concern | Implementation |
|---|---|
| Passwords | bcrypt, rounds=12 |
| Access tokens | HS256 JWT, 15-minute expiry, type claim checked on decode |
| Refresh tokens | UUID v4 raw value stored only in HttpOnly + SameSite=Strict cookie; SHA-256 hash stored in DB |
| Token rotation | Every `/refresh` call revokes the old token and issues a new one |
| Input validation | Pydantic on all request bodies; parameterised SQL only |
| Rate limiting | slowapi on all auth endpoints |
| CORS | Locked to configured origins; no PUT in allowed methods |
| Security headers | CSP, X-Frame-Options, X-Content-Type-Options, Referrer-Policy, Permissions-Policy, HSTS (production) — applied via pure ASGI middleware |

---

## CI/CD

Both pipelines trigger only when files in their respective directories change.

**Backend** (`.github/workflows/backend.yml`):
1. Install dependencies + run 47 pytest tests (unit + integration, in-memory SQLite)
2. On push to `master`: build Docker image → push to ECR → trigger App Runner deployment

**Frontend** (`.github/workflows/frontend.yml`):
1. TypeScript type check + Vite production build
2. On push to `master`: build → sync to S3 → invalidate CloudFront distribution

### Required GitHub secrets

| Secret | Used by |
|---|---|
| `AWS_ACCESS_KEY_ID` | Both |
| `AWS_SECRET_ACCESS_KEY` | Both |
| `AWS_REGION` | Both |
| `ECR_REPOSITORY` | Backend |
| `APP_RUNNER_SERVICE_ARN` | Backend |
| `VITE_API_URL` | Frontend |
| `S3_BUCKET_NAME` | Frontend |
| `CLOUDFRONT_DISTRIBUTION_ID` | Frontend |


---

## Data approach

All heavy computation is done offline — no live model inference in v1.

| Feature | How it works |
|---|---|
| Word embeddings | ~200 words embedded offline, PCA'd to 2D, shipped as a TypeScript data file |
| Attention weights | Precomputed for several example sentences, stored as a TypeScript data file |
| RAG documents | ~20 documents pre-chunked and embedded, stored in Turso sqlite-vec |
| Neural net training | TensorFlow.js — the XOR demo trains entirely in the browser |
| LLM responses | Mocked in v1 |

---

## Build history

| Phase | Scope | Status |
|---|---|---|
| 0 — Infrastructure | Auth, Turso, Docker, CI/CD, security headers | ✅ |
| 1 — Concept map | Native SVG map, node states, module shell, profile page | ✅ |
| 2 — Neural Networks | Perceptron sliders, activation chart, feedforward animation, XOR demo | ✅ |
| 3 — Transformers Lite | Transformer architecture, BPE tokenizer demo, attention heatmap | ✅ |
| 4 — RAG Pipeline | Embeddings scatter, vector retrieval visualiser, RAG pipeline animation | ✅ |
| 5 — How to Use AI | Prompt engineering, hallucinations, use case demos | ✅ |
| Content pass | All 13 modules rewritten for non-technical readers | ✅ |

---

## Deferred to v2

- Mobile layout
- Real transformer inference
- Email verification
- User-provided API key for live LLM responses
- Social / community features
- Fine-tuning demos
