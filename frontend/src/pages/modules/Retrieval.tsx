import { useState, type ReactNode } from 'react'
import { Quiz, type QuizQuestion } from '../../components/Quiz'

type ModuleProps = { onComplete: () => Promise<void>; completed: boolean }

function Section({ number, title, children }: { number: number; title: string; children: ReactNode }) {
  return (
    <section className="mb-16">
      <div className="mb-6 flex items-center gap-3">
        <span className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-indigo-900 text-xs font-bold text-indigo-300">
          {number}
        </span>
        <h3 className="text-xl font-bold">{title}</h3>
      </div>
      {children}
    </section>
  )
}

// ─── 1. Cosine similarity demo ────────────────────────────────────────────────

function CosinDemo() {
  const [angle, setAngle] = useState(40)

  const rad = (angle * Math.PI) / 180
  const sim = Math.cos(rad)

  const cx = 130, cy = 120, len = 90
  const ax = cx + len, ay = cy
  const bx = cx + len * Math.cos(rad), by = cy - len * Math.sin(rad)

  const simColor =
    sim > 0.6 ? '#34d399' :
    sim > 0.1 ? '#818cf8' :
    sim > -0.1 ? '#9ca3af' : '#f87171'

  return (
    <div className="rounded-xl border border-gray-800 bg-gray-900/40 p-6">
      <div className="grid gap-4 sm:grid-cols-2 items-center">
        <svg viewBox="0 0 260 240" className="w-full">
          {/* Origin */}
          <circle cx={cx} cy={cy} r={3} fill="#4b5563" />
          {/* Arc showing angle */}
          <path
            d={`M ${cx + 30} ${cy} A 30 30 0 0 0 ${cx + 30 * Math.cos(rad)} ${cy - 30 * Math.sin(rad)}`}
            fill="none" stroke="#4b5563" strokeWidth={1}
          />
          <text x={cx + 20} y={cy - 14} fill="#6b7280" fontSize={10}>{angle}°</text>

          {/* Vector A */}
          <line x1={cx} y1={cy} x2={ax} y2={ay} stroke="#818cf8" strokeWidth={2.5} />
          <circle cx={ax} cy={ay} r={5} fill="#818cf8" />
          <text x={ax + 7} y={ay + 4} fill="#818cf8" fontSize={12} fontWeight="bold">A</text>

          {/* Vector B */}
          <line x1={cx} y1={cy} x2={bx} y2={by} stroke="#34d399" strokeWidth={2.5} />
          <circle cx={bx} cy={by} r={5} fill="#34d399" />
          <text x={bx + 7} y={by + 4} fill="#34d399" fontSize={12} fontWeight="bold">B</text>

          {/* Formula */}
          <text x={130} y={175} textAnchor="middle" fill="#6b7280" fontSize={11} fontFamily="monospace">
            cos(θ) = A·B / (|A|·|B|)
          </text>
          <text x={130} y={195} textAnchor="middle" fill={simColor} fontSize={14} fontWeight="bold" fontFamily="monospace">
            = {sim.toFixed(3)}
          </text>
          <text x={130} y={215} textAnchor="middle" fill={simColor} fontSize={11}>
            {sim > 0.7 ? 'very similar' : sim > 0.3 ? 'somewhat similar' : sim > -0.1 ? 'unrelated' : 'opposite'}
          </text>
        </svg>

        <div>
          <label className="text-sm text-gray-400 mb-2 block">
            Angle between vectors: <span className="font-mono text-indigo-300">{angle}°</span>
          </label>
          <input type="range" min={0} max={180} step={1} value={angle}
            onChange={(e) => setAngle(+e.target.value)}
            className="w-full accent-indigo-500" />
          <div className="mt-4 space-y-2 text-xs text-gray-500">
            <div className="flex justify-between">
              <span>0° (identical direction)</span>
              <span className="text-emerald-400 font-mono">cos = 1.000</span>
            </div>
            <div className="flex justify-between">
              <span>90° (orthogonal)</span>
              <span className="text-gray-400 font-mono">cos = 0.000</span>
            </div>
            <div className="flex justify-between">
              <span>180° (opposite)</span>
              <span className="text-red-400 font-mono">cos = −1.000</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── 2. KNN visualisation ─────────────────────────────────────────────────────

// 16 fixed "document" points with labels
const KNN_DOCS = [
  { id: 'a',  label: 'transformers', x: 0.55, y: 0.60 },
  { id: 'b',  label: 'attention',    x: 0.62, y: 0.48 },
  { id: 'c',  label: 'bert',         x: 0.48, y: 0.68 },
  { id: 'd',  label: 'gpt',          x: 0.70, y: 0.60 },
  { id: 'e',  label: 'tokenize',     x: 0.38, y: 0.52 },
  { id: 'f',  label: 'cat',          x: -0.60, y: -0.45 },
  { id: 'g',  label: 'dog',          x: -0.52, y: -0.55 },
  { id: 'h',  label: 'lion',         x: -0.68, y: -0.38 },
  { id: 'i',  label: 'bread',        x: 0.10, y: 0.72 },
  { id: 'j',  label: 'apple',        x: 0.20, y: 0.78 },
  { id: 'k',  label: 'rice',         x: 0.02, y: 0.65 },
  { id: 'l',  label: 'gradient',     x: 0.78, y: 0.30 },
  { id: 'm',  label: 'neural',       x: 0.70, y: 0.22 },
  { id: 'n',  label: 'ocean',        x: 0.18, y: -0.68 },
  { id: 'o',  label: 'mountain',     x: 0.35, y: -0.58 },
  { id: 'p',  label: 'sad',          x: -0.78, y: 0.18 },
]

const SVG_W = 480, SVG_H = 340, PAD = 30

function toKx(x: number) { return PAD + ((x + 1) / 2) * (SVG_W - 2 * PAD) }
function toKy(y: number) { return PAD + ((1 - y) / 2) * (SVG_H - 2 * PAD) }

function dist(ax: number, ay: number, bx: number, by: number) {
  return Math.hypot(ax - bx, ay - by)
}

function KNNDemo() {
  const [k, setK] = useState(3)
  const [query, setQuery] = useState<{ x: number; y: number } | null>(null)
  const [hov, setHov] = useState<string | null>(null)

  function handleClick(e: React.MouseEvent<SVGSVGElement>) {
    const rect = e.currentTarget.getBoundingClientRect()
    const px = (e.clientX - rect.left) / rect.width
    const py = (e.clientY - rect.top) / rect.height
    // Convert pixel ratio to -1..1
    const x = (px * SVG_W - PAD) / (SVG_W - 2 * PAD) * 2 - 1
    const y = 1 - (py * SVG_H - PAD) / (SVG_H - 2 * PAD) * 2
    setQuery({ x, y })
  }

  const nearest = query
    ? [...KNN_DOCS]
        .sort((a, b) => dist(a.x, a.y, query.x, query.y) - dist(b.x, b.y, query.x, query.y))
        .slice(0, k)
    : []

  const nearestIds = new Set(nearest.map((d) => d.id))

  return (
    <div className="rounded-xl border border-gray-800 bg-gray-900/40 p-5">
      <div className="flex items-center gap-4 mb-3">
        <label className="text-xs text-gray-400 shrink-0">k =</label>
        {[1, 2, 3, 5].map((n) => (
          <button key={n} onClick={() => setK(n)}
            className={`w-8 h-8 rounded-lg text-sm font-mono transition-colors ${
              k === n ? 'bg-indigo-600 text-white' : 'bg-gray-800 text-gray-400 hover:text-white'
            }`}>
            {n}
          </button>
        ))}
        <span className="text-xs text-gray-600 ml-auto">Click SVG to place query point</span>
      </div>

      <svg viewBox={`0 0 ${SVG_W} ${SVG_H}`} className="w-full cursor-crosshair"
        onClick={handleClick}>
        {/* Grid lines */}
        <line x1={SVG_W / 2} y1={PAD} x2={SVG_W / 2} y2={SVG_H - PAD} stroke="#1f2937" strokeWidth={1} />
        <line x1={PAD} y1={SVG_H / 2} x2={SVG_W - PAD} y2={SVG_H / 2} stroke="#1f2937" strokeWidth={1} />

        {/* Lines query → nearest */}
        {query && nearest.map((doc) => (
          <line key={doc.id}
            x1={toKx(query.x)} y1={toKy(query.y)}
            x2={toKx(doc.x)} y2={toKy(doc.y)}
            stroke="#6366f1" strokeWidth={1.5} strokeDasharray="4,3" strokeOpacity={0.6} />
        ))}

        {/* Doc points */}
        {KNN_DOCS.map((doc) => {
          const isNearest = nearestIds.has(doc.id)
          const isHov = hov === doc.id
          return (
            <g key={doc.id}
              onMouseEnter={() => setHov(doc.id)}
              onMouseLeave={() => setHov(null)}
            >
              <circle cx={toKx(doc.x)} cy={toKy(doc.y)}
                r={isNearest ? 8 : 5}
                fill={isNearest ? '#4f46e5' : '#1e293b'}
                stroke={isNearest ? '#818cf8' : '#374151'}
                strokeWidth={isNearest ? 2 : 1}
                style={{ transition: 'r 0.2s, fill 0.2s' }}
              />
              {(isNearest || isHov) && (
                <text x={toKx(doc.x) + 10} y={toKy(doc.y) + 4}
                  fill={isNearest ? '#a5b4fc' : '#6b7280'}
                  fontSize={11} fontFamily="monospace">
                  {doc.label}
                </text>
              )}
            </g>
          )
        })}

        {/* Query point */}
        {query && (
          <g>
            <circle cx={toKx(query.x)} cy={toKy(query.y)} r={8}
              fill="#f59e0b" stroke="#fbbf24" strokeWidth={2} />
            <text x={toKx(query.x) + 12} y={toKy(query.y) + 4}
              fill="#fbbf24" fontSize={11} fontWeight="bold">query</text>
          </g>
        )}

        {!query && (
          <text x={SVG_W / 2} y={SVG_H / 2} textAnchor="middle"
            fill="#374151" fontSize={13}>Click anywhere to place your query</text>
        )}
      </svg>

      {query && nearest.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-2">
          <span className="text-xs text-gray-500">Nearest {k}:</span>
          {nearest.map((d) => (
            <span key={d.id} className="px-2 py-0.5 rounded bg-indigo-900/60 border border-indigo-700/50 text-xs font-mono text-indigo-300">
              {d.label}
            </span>
          ))}
        </div>
      )}
    </div>
  )
}

// ─── Module export ────────────────────────────────────────────────────────────

const RET_QUIZ: QuizQuestion[] = [
  {
    q: 'What does cosine similarity measure between two vectors?',
    options: ['The sum of their elements', 'The angle between them — capturing semantic similarity regardless of vector magnitude', 'The Euclidean distance between their endpoints', 'The number of shared non-zero elements'],
    answer: 1,
    explanation: 'Cosine similarity = (A · B) / (|A| × |B|). It measures direction alignment, so two semantically identical but differently-scaled vectors still score 1.0.',
  },
  {
    q: 'In k-NN retrieval, what does "k" mean?',
    options: ['The number of dimensions in the embedding', 'The number of nearest neighbors to return', 'The number of training steps', 'The length of the query'],
    answer: 1,
    explanation: 'k-NN returns the k vectors in the index most similar to the query. For RAG you might use k=3–10 document chunks.',
  },
  {
    q: 'Why is exact nearest-neighbor search impractical for millions of vectors?',
    options: ['Vectors are too large to store', 'It requires computing similarity against every vector in the index — O(n) — which is too slow at scale', 'Exact search requires floating-point operations', 'It only works in low dimensions'],
    answer: 1,
    explanation: 'With 100 million vectors, even a fast dot-product per pair takes seconds. Production systems need approximate search to return results in milliseconds.',
  },
  {
    q: 'What does ANN (Approximate Nearest Neighbor) search trade for speed?',
    options: ['Storage space', 'Exact correctness — it might miss the single closest match, but is orders of magnitude faster', 'Embedding quality', 'Query length'],
    answer: 1,
    explanation: 'ANN algorithms (HNSW, IVF, etc.) build index structures that let them skip most vectors. You get ~95–99% of the exact answers in milliseconds instead of seconds.',
  },
  {
    q: 'What is HNSW?',
    options: ['A tokenization algorithm', 'Hierarchical Navigable Small World — a graph-based ANN index that enables fast approximate nearest-neighbor search', 'A type of attention mechanism', 'A transformer architecture variant'],
    answer: 1,
    explanation: 'HNSW builds a multi-layer graph where each node links to its nearest neighbors. Search navigates from coarse upper layers to fine-grained lower layers for fast ANN retrieval.',
  },
]

export function Retrieval({ onComplete, completed }: ModuleProps) {
  return (
    <div className="mx-auto max-w-2xl px-6 py-12 text-white">
      <section className="mb-20 text-center">
        <div className="mb-6 inline-flex h-20 w-20 items-center justify-center rounded-2xl border border-indigo-800 bg-indigo-950/60">
          <span className="text-4xl">🎯</span>
        </div>
        <h2 className="mb-4 text-4xl font-bold tracking-tight">Retrieval</h2>
        <p className="text-lg text-gray-400 leading-relaxed">
          Old-fashioned search looks for exact words. Modern AI search is smarter — it finds
          documents that mean the same thing, even if they use completely different words.
        </p>
      </section>

      <Section number={1} title="Cosine Similarity">
        <p className="mb-4 text-gray-300 leading-relaxed">
          To measure how similar two words or documents are, we look at the angle between
          their number-lists (vectors). If two vectors point in the same direction, the
          things they represent have very similar meanings. If they point in completely
          different directions, the things are unrelated. The cosine of that angle gives a
          score from -1 to 1. Drag the slider below to see how the score changes.
        </p>
        <CosinDemo />
        <p className="mt-3 text-sm text-gray-500">
          We use the angle rather than straight-line distance because direction matters more
          than size. A short tweet and a long article on the same topic should be considered
          similar — they'd have very different sized vectors, but point in the same direction.
        </p>
      </Section>

      <Section number={2} title="k-Nearest Neighbours">
        <p className="mb-4 text-gray-300 leading-relaxed">
          Once your question is converted into a number-list, the system finds the k
          documents in the library whose number-lists are most similar — the k nearest
          neighbours. Click anywhere on the map below to drop your query and watch it
          connect to the closest documents. Change k to fetch more or fewer results.
        </p>
        <KNNDemo />
        <p className="mt-3 text-sm text-gray-500">
          For a small library, checking every single document is fine. But with millions of
          documents and thousands of searches per second, comparing every document to every
          query would be impossibly slow. That's where approximate search comes in.
        </p>
      </Section>

      <Section number={3} title="Approximate Search at Scale">
        <p className="mb-4 text-gray-300 leading-relaxed">
          Real search systems use clever shortcuts that skip most of the library and still
          find the right answer almost every time. They trade a tiny bit of accuracy for a
          dramatic speed improvement. Here are three common approaches:
        </p>
        <div className="grid gap-3 sm:grid-cols-3 text-xs">
          {[
            {
              name: 'HNSW',
              full: 'Hierarchical Navigable Small Worlds',
              body: 'Builds a layered map where similar documents link to each other. To find the best match, it starts at a rough overview layer and zooms in step by step — like finding an address using continent → country → city → street.',
              used: 'Qdrant, Weaviate, pgvector',
            },
            {
              name: 'IVF',
              full: 'Inverted File Index',
              body: 'Groups all documents into buckets of similar ones first. When you search, it only checks the most relevant buckets, skipping 90–99% of the library and getting the same result much faster.',
              used: 'FAISS (Meta\'s open source library)',
            },
            {
              name: 'sqlite-vec',
              full: 'SQLite vector extension',
              body: 'A lightweight plugin that adds similarity search to SQLite — a simple, widely-used database format. No separate specialized infrastructure needed, making it great for getting started quickly.',
              used: 'This project (Turso)',
            },
          ].map(({ name, full, body, used }) => (
            <div key={name} className="rounded-xl border border-gray-800 bg-gray-900/40 p-3">
              <p className="font-bold text-indigo-300 mb-0.5">{name}</p>
              <p className="text-gray-600 mb-2 italic">{full}</p>
              <p className="text-gray-500 mb-2 leading-snug">{body}</p>
              <p className="text-gray-700">Used by: <span className="text-gray-500">{used}</span></p>
            </div>
          ))}
        </div>
      </Section>

      <Section number={4} title="Quiz Yourself">
        <p className="mb-4 leading-relaxed text-gray-300">Check whether cosine similarity, k-NN, and approximate search have clicked.</p>
        <Quiz questions={RET_QUIZ} title="Retrieval" />
      </Section>

      <section className="mt-4 rounded-2xl border border-indigo-900/60 bg-indigo-950/30 p-8 text-center">
        <div className="mb-2 text-2xl">{completed ? '✅' : '🎯'}</div>
        <h3 className="mb-2 text-xl font-bold">{completed ? 'Module Complete' : 'Ready to mark this done?'}</h3>
        <p className="mb-6 text-sm text-gray-400">
          {completed
            ? "You've completed the full RAG pipeline — from chunking to retrieval to generation."
            : 'Mark this complete to record your progress.'}
        </p>
        {!completed && (
          <button onClick={onComplete}
            className="rounded-lg bg-indigo-600 px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:ring-offset-2 focus:ring-offset-gray-950">
            Mark as Complete
          </button>
        )}
      </section>
    </div>
  )
}
