# AI Philosophy — CLAUDE.md

Developer context for anyone (human or AI) working in this codebase. Read this fully before making any changes.

---

## What this project is

**AI Philosophy** is a visual, interactive educational website that teaches how AI works — targeted at people with no technical background. It is not a video course or a textbook. It is an interactive knowledge map: users explore a graph of concept nodes, click into one, and work through an illustrated module with live simulations.

All 13 modules are complete. The project is production-ready and deployed on AWS.

Built solo with Claude Code as a collaborator (Claude Code wrote the majority of code, directed by the developer).

---

## Current state

All five build phases are complete. The site is fully functional end-to-end:

- Auth (register, login, logout, refresh) works
- Concept map renders, pan/zoom/hover works, tooltips work
- All 13 modules load and their interactive components work
- Progress persists per user in Turso
- CI/CD deploys backend to App Runner and frontend to S3/CloudFront

Active branch: `master`. One known ESLint error remains unfixed (see **Known issues** below).

---

## Tech stack (accurate versions)

### Frontend
- React **19** + Vite **8** + TypeScript **6**
- Tailwind CSS **4**
- React Router **v7**
- D3 v7 (word embedding data processing)
- Framer Motion (available but minimally used)
- TensorFlow.js (NeuralNetworks module — XOR demo trains in browser)
- Axios (API client with interceptors)

### Backend
- Python **3.12**
- FastAPI **0.115**
- `libsql-client` **0.3.1** — Turso HTTP client (note: `libsql` is the newer official SDK; migration deferred)
- `python-jose` — JWT encode/decode
- `bcrypt` — password hashing (direct, NOT via passlib — CLAUDE.md previously said passlib, that was wrong)
- `slowapi` — rate limiting
- `pydantic-settings` — environment config

### Infrastructure
- Backend: AWS App Runner (Docker image from ECR)
- Frontend: AWS S3 + CloudFront
- Database: Turso (libSQL) — relational + vector (sqlite-vec)
- CI/CD: GitHub Actions

---

## Security requirements (non-negotiable)

These must never be weakened. Every PR must preserve all of them.

| Requirement | Implementation |
|---|---|
| Passwords | `bcrypt.hashpw(pw.encode(), bcrypt.gensalt(rounds=12))` |
| Access tokens | HS256 JWT, 15-min expiry, `type: "access"` claim verified on decode |
| Refresh tokens | UUID v4 raw value in HttpOnly + SameSite=Strict cookie; SHA-256 hash in DB |
| Token rotation | Every `/refresh` call revokes old token hash and inserts a new one |
| Stale token cleanup | `_cleanup_tokens(user_id)` runs on every login and refresh, deletes that user's expired/revoked rows |
| SQL | Parameterised only — never f-strings or string concatenation in SQL |
| Input validation | Pydantic on all request bodies; email validated by `email-validator` |
| Rate limiting | `@limiter.limit(...)` on all four auth endpoints |
| CORS | `allow_origins=settings.cors_origins`, `allow_methods=["GET","POST","DELETE"]` — no PUT |
| Security headers | Pure ASGI middleware (`_SecurityHeadersMiddleware`) — CSP, X-Frame-Options, X-Content-Type-Options, Referrer-Policy, Permissions-Policy, HSTS (production only) |
| Cookie deletion | `_clear_refresh_cookie` passes `secure=settings.environment == "production"` to match how the cookie was set |
| Environment config | `environment: Literal["development", "production"]` — typo crashes at startup, not silently |
| `.env` | Never committed — gitignored. Use `.env.example` as template |

---

## The concept map

The landing page is a custom SVG pan/zoom graph (`ConceptMap.tsx`). Nodes have three states: **locked**, **available**, **completed**. Clicking an available or completed node navigates to `/learn/:nodeId`.

### Node unlock graph

```
what-is-ai (always available)
├── types-of-ml         (unlocks when: what-is-ai complete)
└── neural-networks     (unlocks when: what-is-ai complete)
    ├── activations     (unlocks when: neural-networks complete)
    └── transformers    (unlocks when: neural-networks complete)
        ├── attention       (unlocks when: transformers complete)
        └── tokenization    (unlocks when: transformers complete)
            └── rag         (unlocks when: tokenization complete)
                ├── embeddings          (unlocks when: rag complete)
                ├── retrieval           (unlocks when: rag complete)
                └── prompt-engineering  (unlocks when: rag complete)
                    ├── hallucinations  (unlocks when: prompt-engineering complete)
                    └── use-cases       (unlocks when: prompt-engineering complete)
```

This graph lives in `frontend/src/data/nodes.ts`. The `effectiveAvailable()` function checks if all `unlockedBy` deps are in the completed set. Backend validates node IDs against `_VALID_NODES` in `progress.py`.

### ConceptMap implementation details

- No D3 for the graph — pure SVG with manual coordinate layout
- Pan: pointer capture + delta tracking
- Zoom: `wheel` event with `preventDefault()` (must be non-passive)
- Hover state lifted to `ConceptMap` level (not local to `MapNode`) so edges can dim
- Tooltip positioned as an HTML `div` overlay, not inside SVG, to avoid clipping
- Click detection: `pointerUp` → `elementFromPoint` → `closest('[data-node-id]')` → `navigate()`

---

## All 13 modules

Each module is a React component at `frontend/src/pages/modules/<Name>.tsx`. They accept `{ onComplete, completed }` props. All are lazy-loaded in `Learn.tsx`.

| ID | File | Key interactive components |
|---|---|---|
| `what-is-ai` | WhatIsAI.tsx | Static diagrams |
| `types-of-ml` | TypesOfML.tsx | Paradigm cards, scatter plot with click-to-classify |
| `neural-networks` | NeuralNetworks.tsx | Weight sliders, forward pass SVG, activation chart, XOR TF.js demo |
| `activations` | Activations.tsx | Function curve explorer with input scrubber |
| `transformers` | Transformers.tsx | Architecture diagram |
| `attention` | Attention.tsx | Precomputed attention heatmap, sentence selector |
| `tokenization` | Tokenization.tsx | Live BPE tokenizer (client-side) |
| `rag` | RAG.tsx | Pipeline animation, document retrieval demo |
| `embeddings` | Embeddings.tsx | Interactive 2D word map (pan/zoom/hover/filter) |
| `retrieval` | Retrieval.tsx | Nearest-neighbour visualiser |
| `prompt-engineering` | PromptEngineering.tsx | Pattern gallery, prompt builder |
| `hallucinations` | Hallucinations.tsx | Hallucination type gallery, strategy cards |
| `use-cases` | UseCases.tsx | Code demo, summarisation demo, classification demo |

The prose in all 13 modules was written for non-technical readers. When editing module content: use everyday analogies, explain the "why it matters", avoid assuming programming knowledge.

---

## Backend architecture

### `main.py`

Single FastAPI app. Middleware stack (order matters — last added, first executed):
1. `_SecurityHeadersMiddleware` (pure ASGI — survives exceptions without blocking CORS)
2. `CORSMiddleware`

Lifespan: runs `run_migrations()` on startup, `close_client()` on shutdown.

### `db/client.py` — `db_execute()`

All database calls go through `db_execute(statement, args)`, not directly through the client. It retries once on failure by tearing down and recreating the client — handles stale connections without process restarts.

```python
async def db_execute(statement: str, args: list | None = None):
    for attempt in range(2):
        if _client is None:
            _client = _make_client()
        try:
            return await _client.execute(statement, args or [])
        except Exception:
            if attempt == 0:
                await close_client()  # reset and retry
            else:
                raise
```

Never call `get_client().execute()` directly in route files — always use `db_execute()`.

### `db/migrations.py`

Runs `CREATE TABLE IF NOT EXISTS` for all three tables on startup. Schema changes must be additive (no `DROP` or `ALTER` without a migration strategy). The schema is the single source of truth for the DB structure.

### `core/security.py`

- `hash_password(pw)` → bcrypt string
- `verify_password(plain, hashed)` → bool (catches only `ValueError`, not bare `Exception`)
- `create_access_token(user_id)` → JWT string
- `decode_access_token(token)` → `user_id | None` (checks `type == "access"`)
- `create_refresh_token()` → `(raw_uuid, sha256_hash)` tuple
- `hash_token(token)` → sha256 hex

### `api/routes/auth.py`

Cookie constants (`_COOKIE_KEY`, `_COOKIE_PATH`) are defined at module level so `_set_refresh_cookie` and `_clear_refresh_cookie` always use the same path. `_clear_refresh_cookie` passes `secure=settings.environment == "production"` — this must match `_set_refresh_cookie` or browsers won't clear the cookie in production.

`_cleanup_tokens(user_id)` is called inside `login` (after verifying credentials) and `refresh` (after revoking the old token). It deletes all revoked or expired tokens for that user.

---

## Frontend architecture

### Auth context split

`AuthContext.tsx` — only exports `AuthContext` (the `createContext` result) and `AuthContextValue` interface. No JSX, no component. This is required for React Fast Refresh to work — files that export both plain values and components cause full page reloads on every save.

`AuthProvider.tsx` — exports only the `AuthProvider` component. Import this in `App.tsx`.

`useAuth.ts` — reads `AuthContext` from `AuthContext.tsx`. Throws if used outside the provider.

### API client (`lib/api.ts`)

Axios instance with two interceptors:
1. **Request**: attaches `Authorization: Bearer <token>` if a token is set
2. **Response error**: on 401, attempts silent refresh. Uses a module-level `_refreshPromise` lock — if two requests 401 simultaneously, they share the same refresh call rather than racing. Without this lock, two concurrent 401s would issue two refresh tokens, the second would revoke the first, and one request would fail permanently.

`_accessToken` lives in module scope (not React state) — it survives re-renders but is lost on hard page reload. The `AuthProvider` re-hydrates it from the refresh cookie on mount.

### Module loading (`Learn.tsx`)

All 13 modules are loaded with `React.lazy()` — each gets its own JS chunk. The main bundle is ~300 KB (97 KB gzipped); individual module chunks are 9–28 KB each.

Named exports (`export function WhatIsAI`) must be wrapped for `React.lazy`:
```typescript
const WhatIsAI = lazy(() => import('./modules/WhatIsAI').then(m => ({ default: m.WhatIsAI })))
```

Each module is wrapped in `<ErrorBoundary fallback={<ModuleErrorFallback />}><Suspense>` so a crash in one module doesn't kill the page.

`Learn.tsx` waits for `useProgress` to finish loading before rendering the module — this ensures the `completed` prop is accurate on first paint.

---

## File structure (as-built)

```
aiphilosophy/
├── backend/
│   ├── app/
│   │   ├── api/
│   │   │   ├── deps.py
│   │   │   └── routes/
│   │   │       ├── auth.py
│   │   │       ├── progress.py
│   │   │       └── users.py
│   │   ├── core/
│   │   │   ├── config.py
│   │   │   ├── limits.py
│   │   │   └── security.py
│   │   ├── db/
│   │   │   ├── client.py
│   │   │   └── migrations.py
│   │   ├── models/
│   │   │   └── auth.py
│   │   └── main.py
│   ├── Dockerfile
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── ConceptMap.tsx
│   │   │   ├── ErrorBoundary.tsx
│   │   │   └── ProtectedRoute.tsx
│   │   ├── contexts/
│   │   │   ├── AuthContext.tsx      ← context + interface only, no JSX
│   │   │   └── AuthProvider.tsx     ← provider component only
│   │   ├── data/
│   │   │   ├── nodes.ts
│   │   │   ├── attentionData.ts
│   │   │   ├── ragDocuments.ts
│   │   │   └── wordEmbeddings.ts
│   │   ├── hooks/
│   │   │   ├── useAuth.ts
│   │   │   └── useProgress.ts
│   │   ├── lib/
│   │   │   └── api.ts
│   │   ├── pages/
│   │   │   ├── auth/
│   │   │   │   ├── Login.tsx
│   │   │   │   └── Register.tsx
│   │   │   ├── modules/
│   │   │   │   ├── WhatIsAI.tsx
│   │   │   │   ├── TypesOfML.tsx
│   │   │   │   ├── NeuralNetworks.tsx
│   │   │   │   ├── Activations.tsx
│   │   │   │   ├── Transformers.tsx
│   │   │   │   ├── Attention.tsx
│   │   │   │   ├── Tokenization.tsx
│   │   │   │   ├── RAG.tsx
│   │   │   │   ├── Embeddings.tsx
│   │   │   │   ├── Retrieval.tsx
│   │   │   │   ├── PromptEngineering.tsx
│   │   │   │   ├── Hallucinations.tsx
│   │   │   │   └── UseCases.tsx
│   │   │   ├── Home.tsx
│   │   │   ├── Learn.tsx
│   │   │   └── Profile.tsx
│   │   ├── App.tsx
│   │   └── main.tsx
│   ├── Dockerfile.dev
│   └── package.json
├── .github/
│   └── workflows/
│       ├── backend.yml
│       └── frontend.yml
├── docker-compose.yml
├── CLAUDE.md
└── README.md
```

---

## Data philosophy

No live model inference in v1. All heavy data is precomputed.

| Feature | Source | Location |
|---|---|---|
| Word embeddings (2D) | ~200 words, embedded offline, PCA to 2D | `src/data/wordEmbeddings.ts` |
| Attention weights | Precomputed for example sentences | `src/data/attentionData.ts` |
| RAG documents | Pre-chunked, pre-embedded | `src/data/ragDocuments.ts` + Turso sqlite-vec |
| XOR neural net training | TensorFlow.js — runs in browser | NeuralNetworks.tsx |
| Concept node graph | Hand-authored coordinates and edges | `src/data/nodes.ts` |

Adding a new interactive to a module: prefer client-side computation or precomputed data files. Avoid adding backend endpoints for educational simulations.

---

## Known issues

**`ConceptMap.tsx:242` — ref read during render** (ESLint `react-hooks/refs`):

```typescript
const containerH = wrapRef.current?.clientHeight ?? window.innerHeight
```

This reads a ref in the render function to determine tooltip placement. ESLint correctly flags it: ref values aren't reactive, so the tooltip can misplace after a window resize. The fix is a `ResizeObserver` that writes to state. This was left unfixed intentionally — the tooltip placement works correctly on first hover, and resize-after-hover is an edge case. If you're in this file for another reason, this is worth fixing at the same time.

**No tests**: pytest is not installed and there are no test files. The CI workflow skips tests if `backend/tests/` doesn't exist. This is the biggest gap in the project's reliability.

**CI branch mismatch**: `.github/workflows/backend.yml` and `frontend.yml` target `main`, but the default branch is `master`. The CI deploy jobs will not trigger until these are aligned. Either rename the branch or update the workflow `branches:` keys.

---

## Deferred to v2

- Mobile layout
- Real transformer inference (instead of static diagrams)
- Email verification on register
- User-provided API key for live LLM responses in the prompt engineering module
- Social / community features
- Fine-tuning demos
- Tests (both backend pytest suite and frontend Vitest)
- Upgrade from `libsql-client` to the official `libsql` Python SDK
