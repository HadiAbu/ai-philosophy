# AI Philosophy — CLAUDE.md

This file is the source of truth for the AI Philosophy project. Read it fully before working on any part of this codebase.

---

## Project overview

**AI Philosophy** is a visual, exploratory educational website that teaches people how AI works and how to use it. It is not a course — it is an interactive knowledge map where users explore AI concepts freely, click into nodes, and engage with simulations.

Built solo by the developer, with Claude Code as a collaborator.

---

## Tech stack

### Frontend
- React + Vite
- React Router
- Tailwind CSS
- D3.js (concept map, visualizations)
- Framer Motion (step-by-step animations)
- GSAP (map-level animations)

### Backend
- FastAPI (Python)
- Turso (libSQL) — relational data: users, progress, refresh tokens
- Turso sqlite-vec extension — vector search for RAG simulation (replaces Qdrant)
- Docker (containerized for deployment)

### Infrastructure
- Frontend: AWS S3 + CloudFront
- Backend: AWS App Runner (Docker image)
- DNS: AWS Route 53 (when domain is acquired — none yet)
- CI/CD: GitHub Actions (build, push to ECR, deploy to App Runner)

---

## Security requirements (non-negotiable)

Security is built in from Phase 0, not added later. Every feature inherits this foundation.

- Passwords hashed with `passlib[bcrypt]`
- JWT authentication via `python-jose`
  - Access tokens: 15 minute expiry
  - Refresh tokens: 7 day expiry, stored as HttpOnly + SameSite=Strict cookies
  - Refresh tokens hashed before storage in Turso
- Rate limiting on all auth endpoints via `slowapi`
- CORS locked to production domain only (env-configured)
- Content Security Policy headers
- HTTPS enforced (App Runner handles TLS)
- All input validated via Pydantic (FastAPI default)
- No sensitive data in JWT payload
- Parameterized queries only — no raw string SQL

---

## Site experience

The landing page is a **D3 interactive concept map** — a graph of AI concept nodes. Users explore freely:

- Nodes have three states: locked / available / completed
- Clicking a node opens a full-screen interactive module
- Connections between nodes show conceptual relationships
- Progress is saved per user in Turso

### Concept map structure

```
           [What is AI?]
               |
     ┌─────────┴──────────┐
  [Types of ML]     [Neural Networks]
                          |
                    [Activations]
                          |
                    [Transformers]
                    /           \
           [Attention]      [Tokenization]
                                 |
                              [RAG]
                            /       \
                    [Embeddings]  [Retrieval]
```

---

## Database schema (Turso)

```sql
CREATE TABLE users (
  id          TEXT PRIMARY KEY,
  email       TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  created_at  TEXT NOT NULL
);

CREATE TABLE progress (
  user_id     TEXT NOT NULL,
  node_id     TEXT NOT NULL,
  completed_at TEXT NOT NULL,
  PRIMARY KEY (user_id, node_id),
  FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE refresh_tokens (
  token_hash  TEXT PRIMARY KEY,
  user_id     TEXT NOT NULL,
  expires_at  TEXT NOT NULL,
  revoked     INTEGER NOT NULL DEFAULT 0,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Vector table for RAG simulation (sqlite-vec extension)
CREATE VIRTUAL TABLE vec_documents USING vec0(
  embedding float[384]
);

CREATE TABLE rag_documents (
  id      INTEGER PRIMARY KEY,
  title   TEXT NOT NULL,
  content TEXT NOT NULL,
  chunk   TEXT NOT NULL
);
```

---

## Lightweight data philosophy

All heavy data is precomputed offline and served as static JSON or stored in Turso. No live model inference in v1.

| Feature | Approach |
|---|---|
| Word embeddings | ~200 words, PCA to 2D, stored as JSON (~50KB) |
| Attention weights | Precomputed for 5-10 example sentences, JSON (~10KB) |
| RAG documents | ~20 docs with embeddings in Turso sqlite-vec |
| Neural net training | TensorFlow.js — runs entirely in the browser |
| LLM responses | Mocked in v1; optional live via user API key in v2 |

---

## Phased build plan

### Phase 0 — Infrastructure (Week 1)
- Monorepo structure: `frontend/`, `backend/`
- Vite React app scaffolded
- FastAPI project structure with Pydantic settings
- Turso connected, all tables migrated
- Auth endpoints: POST /auth/register, POST /auth/login, POST /auth/logout, POST /auth/refresh
- JWT + HttpOnly cookie flow end-to-end
- Rate limiting on auth routes
- CORS, CSP, security headers
- Protected route wrapper on frontend
- Dockerfile for backend
- GitHub Actions pipeline: lint → test → build → push to ECR → deploy to App Runner
- S3 bucket + CloudFront distribution for frontend

### Phase 1 — Site Shell + Concept Map (Week 2)
- D3 concept map on landing page
- Node states: locked / available / completed
- Click node → full-screen module shell
- User profile page (progress overview)
- Module: **What is AI?** (illustrated, mostly static)

### Phase 2 — Neural Networks (Week 3-5)
- Perceptron: sliders for inputs/weights, live output
- Activation functions: drag input, see curve respond
- Feedforward network: animated forward pass
- XOR demo: TensorFlow.js trains in browser, live loss curve

### Phase 3 — Transformers Lite (Week 6-9)
- Tokenization: user types → tokens appear (BPE vocab from backend)
- Embeddings: 2D scatter of ~200 precomputed word vectors
- Attention: heatmap for 5-6 preloaded sentences

### Phase 4 — RAG Pipeline (Week 10-12)
- Document chunking visualizer
- Chunk embeddings in Turso sqlite-vec (~20 preloaded docs)
- User query → vector search → nearest chunks highlight
- Animated prompt construction
- Mock LLM response (or live via user-provided API key)

### Phase 5 — How to Use AI (Week 13-14)
- Prompt engineering: bad vs. good comparisons
- Hallucinations: documented real examples
- Use cases: code, summarization, classification

---

## Folder structure (target)

```
aiphilosophy/
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── hooks/
│   │   └── lib/
│   ├── index.html
│   └── vite.config.ts
├── backend/
│   ├── app/
│   │   ├── api/
│   │   │   └── routes/
│   │   ├── core/       # config, security, middleware
│   │   ├── db/         # turso client, migrations
│   │   └── models/     # pydantic schemas
│   ├── Dockerfile
│   └── requirements.txt
├── .github/
│   └── workflows/
│       ├── backend.yml
│       └── frontend.yml
└── CLAUDE.md
```

---

## Developer profile

- React: experienced
- Python / FastAPI: experienced
- Docker: comfortable
- Turso: new (no account yet — open-source, needs setup)
- AWS: account exists

---

## Deferred to v2

- Mobile layout
- Real transformer inference
- Email verification
- Social / community features
- Fine-tuning demos
- User-provided API key for live LLM responses (designed for but not implemented)
