import { useState, type ReactNode } from 'react'

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

export function Retrieval({ onComplete, completed }: ModuleProps) {
  return (
    <div className="mx-auto max-w-2xl px-6 py-12 text-white">
      <section className="mb-20 text-center">
        <div className="mb-6 inline-flex h-20 w-20 items-center justify-center rounded-2xl border border-indigo-800 bg-indigo-950/60">
          <span className="text-4xl">🎯</span>
        </div>
        <h2 className="mb-4 text-4xl font-bold tracking-tight">Retrieval</h2>
        <p className="text-lg text-gray-400 leading-relaxed">
          Finding relevant information isn't keyword matching anymore — it's geometry.
          Vector search locates the nearest points in embedding space.
        </p>
      </section>

      <Section number={1} title="Cosine Similarity">
        <p className="mb-4 text-gray-300 leading-relaxed">
          To compare two embeddings, we measure the angle between them.{' '}
          <span className="font-mono text-indigo-300">cos(θ) = 1</span> means identical
          direction (very similar meaning);{' '}
          <span className="font-mono text-indigo-300">cos(θ) = 0</span> means orthogonal
          (unrelated);{' '}
          <span className="font-mono text-indigo-300">cos(θ) = −1</span> means opposite.
          Drag the slider to see how the score changes with angle.
        </p>
        <CosinDemo />
        <p className="mt-3 text-sm text-gray-500">
          We use cosine rather than Euclidean distance because it ignores vector magnitude —
          a short document and a long document about the same topic should score highly even
          though their vectors differ in length.
        </p>
      </Section>

      <Section number={2} title="k-Nearest Neighbours">
        <p className="mb-4 text-gray-300 leading-relaxed">
          Given a query vector, k-NN search returns the k documents whose embeddings are
          closest. Click anywhere on the map below to place a query point and see which
          documents it retrieves. Adjust k to see more or fewer neighbours.
        </p>
        <KNNDemo />
        <p className="mt-3 text-sm text-gray-500">
          Exact k-NN requires computing the distance to every document — O(n) per query.
          With a million documents and a million queries per second, this is impractical.
        </p>
      </Section>

      <Section number={3} title="Approximate Search at Scale">
        <p className="mb-4 text-gray-300 leading-relaxed">
          Real-world vector stores use approximate nearest neighbour (ANN) algorithms that
          trade a small accuracy loss for orders-of-magnitude speed gains.
        </p>
        <div className="grid gap-3 sm:grid-cols-3 text-xs">
          {[
            {
              name: 'HNSW',
              full: 'Hierarchical Navigable Small Worlds',
              body: 'Builds a graph where each node connects to its nearest neighbours across multiple layers. Search navigates from a coarse entry layer down to fine-grained layers.',
              used: 'Qdrant, Weaviate, pgvector',
            },
            {
              name: 'IVF',
              full: 'Inverted File Index',
              body: 'Clusters vectors into Voronoi cells. A query searches only the nearest cells rather than the whole database, reducing computation by 10–100×.',
              used: 'FAISS',
            },
            {
              name: 'sqlite-vec',
              full: 'SQLite vector extension',
              body: 'Adds vector columns and KNN queries to SQLite using a compact shadow-table design. No separate vector database process required.',
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
