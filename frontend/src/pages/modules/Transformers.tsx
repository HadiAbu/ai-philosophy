import { type ReactNode } from 'react'

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

// ─── 1. The sequence problem diagram ─────────────────────────────────────────

function SequenceDiagram() {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {/* RNN: sequential */}
      <div className="rounded-xl border border-gray-800 bg-gray-900/40 p-4">
        <p className="text-xs text-gray-500 font-mono mb-3">RNN (sequential)</p>
        <svg viewBox="0 0 260 90" className="w-full">
          {[0, 1, 2, 3].map((i) => {
            const x = 20 + i * 60
            return (
              <g key={i}>
                <rect x={x} y={30} width={40} height={30} rx={6}
                  fill="#1e1b4b" stroke="#4f46e5" strokeWidth={1.5} />
                <text x={x + 20} y={49} textAnchor="middle" fill="#a5b4fc" fontSize={11} fontFamily="monospace">
                  h{i + 1}
                </text>
                {i < 3 && (
                  <line x1={x + 40} y1={45} x2={x + 60} y2={45}
                    stroke="#374151" strokeWidth={1.5} markerEnd="url(#arr)" />
                )}
                <text x={x + 20} y={82} textAnchor="middle" fill="#4b5563" fontSize={10}>
                  x{i + 1}
                </text>
                <line x1={x + 20} y1={75} x2={x + 20} y2={60} stroke="#374151" strokeWidth={1} />
              </g>
            )
          })}
          <defs>
            <marker id="arr" markerWidth="6" markerHeight="6" refX="3" refY="3" orient="auto">
              <path d="M0,0 L0,6 L6,3 z" fill="#374151" />
            </marker>
          </defs>
          <text x={130} y={14} textAnchor="middle" fill="#ef4444" fontSize={10}>
            ⚠ must process left→right, one step at a time
          </text>
        </svg>
      </div>
      {/* Transformer: parallel */}
      <div className="rounded-xl border border-gray-800 bg-gray-900/40 p-4">
        <p className="text-xs text-gray-500 font-mono mb-3">Transformer (parallel)</p>
        <svg viewBox="0 0 260 90" className="w-full">
          {[0, 1, 2, 3].map((i) => {
            const x = 20 + i * 60
            return (
              <g key={i}>
                <rect x={x} y={30} width={40} height={30} rx={6}
                  fill="#1e1b4b" stroke="#4f46e5" strokeWidth={1.5} />
                <text x={x + 20} y={49} textAnchor="middle" fill="#a5b4fc" fontSize={11} fontFamily="monospace">
                  h{i + 1}
                </text>
                <text x={x + 20} y={82} textAnchor="middle" fill="#4b5563" fontSize={10}>
                  x{i + 1}
                </text>
                <line x1={x + 20} y1={75} x2={x + 20} y2={60} stroke="#374151" strokeWidth={1} />
              </g>
            )
          })}
          {/* Cross-connections showing all-to-all attention */}
          {[20, 80, 140, 200].flatMap((x1) =>
            [20, 80, 140, 200].filter((x2) => x2 !== x1).map((x2) => (
              <line key={`${x1}-${x2}`}
                x1={x1 + 20} y1={30} x2={x2 + 20} y2={30}
                stroke="#4f46e5" strokeWidth={0.5} strokeOpacity={0.4} />
            ))
          )}
          <text x={130} y={14} textAnchor="middle" fill="#34d399" fontSize={10}>
            ✓ all tokens processed simultaneously
          </text>
        </svg>
      </div>
    </div>
  )
}

// ─── 2. Mini word vector scatter ──────────────────────────────────────────────

// 14 words with hand-crafted 2D positions showing semantic clusters
// and the king − man + woman ≈ queen analogy
const MINI_WORDS = [
  // AI / Tech  (top-right cluster)
  { word: 'neural', x: 225, y: 38, c: '#818cf8' },
  { word: 'model',  x: 258, y: 55, c: '#818cf8' },
  { word: 'data',   x: 242, y: 25, c: '#818cf8' },
  { word: 'train',  x: 210, y: 58, c: '#818cf8' },
  // Animals  (bottom-left cluster)
  { word: 'cat',    x: 42,  y: 155, c: '#34d399' },
  { word: 'dog',    x: 28,  y: 168, c: '#34d399' },
  { word: 'bird',   x: 62,  y: 142, c: '#34d399' },
  { word: 'fish',   x: 48,  y: 178, c: '#34d399' },
  // Royalty  (center — arranged for king−man+woman=queen)
  { word: 'man',    x: 122, y: 130, c: '#f472b6' },
  { word: 'woman',  x: 155, y: 126, c: '#f472b6' },
  { word: 'king',   x: 122, y: 72,  c: '#facc15' },
  { word: 'queen',  x: 155, y: 68,  c: '#facc15' },
  // Food  (top-left cluster)
  { word: 'bread',  x: 55,  y: 42,  c: '#fb923c' },
  { word: 'apple',  x: 38,  y: 58,  c: '#fb923c' },
]

function WordScatter() {
  return (
    <div className="rounded-xl border border-gray-800 bg-gray-900/40 p-4">
      <svg viewBox="0 0 300 210" className="w-full">
        {/* Cluster backgrounds */}
        <ellipse cx={234} cy={42} rx={48} ry={24} fill="#818cf8" fillOpacity={0.05} stroke="#818cf8" strokeOpacity={0.15} strokeWidth={1} />
        <ellipse cx={45}  cy={162} rx={36} ry={24} fill="#34d399" fillOpacity={0.05} stroke="#34d399" strokeOpacity={0.15} strokeWidth={1} />
        <ellipse cx={46}  cy={50}  rx={28} ry={16} fill="#fb923c" fillOpacity={0.05} stroke="#fb923c" strokeOpacity={0.15} strokeWidth={1} />

        {/* Analogy arrows: man→king and woman→queen (same direction vector) */}
        <line x1={122} y1={124} x2={122} y2={80} stroke="#facc15" strokeWidth={1} strokeDasharray="3,2" strokeOpacity={0.6} />
        <line x1={155} y1={120} x2={155} y2={76} stroke="#facc15" strokeWidth={1} strokeDasharray="3,2" strokeOpacity={0.6} />
        <text x={170} y={99} fill="#facc15" fontSize={9} fillOpacity={0.8}>royalty</text>

        {/* Word dots + labels */}
        {MINI_WORDS.map(({ word, x, y, c }) => (
          <g key={word}>
            <circle cx={x} cy={y} r={4} fill={c} fillOpacity={0.9} />
            <text x={x + 6} y={y + 4} fill={c} fontSize={10} fillOpacity={0.9}>{word}</text>
          </g>
        ))}

        {/* Legend */}
        {[
          { c: '#818cf8', label: 'AI / Tech' },
          { c: '#34d399', label: 'Animals' },
          { c: '#fb923c', label: 'Food' },
          { c: '#facc15', label: 'Royalty' },
          { c: '#f472b6', label: 'People' },
        ].map(({ c, label }, i) => (
          <g key={label}>
            <circle cx={8} cy={192 - i * 12} r={3} fill={c} />
            <text x={14} y={196 - i * 12} fill="#6b7280" fontSize={8}>{label}</text>
          </g>
        ))}
      </svg>
      <p className="text-xs text-gray-600 text-center mt-1">
        Dashed lines show the "royalty" vector: king − man ≈ queen − woman
      </p>
    </div>
  )
}

// ─── 3. Transformer block diagram ────────────────────────────────────────────

function TransformerBlock() {
  const blocks = [
    { label: 'Input Tokens', sub: 'x₁  x₂  x₃  …', fill: '#111827', stroke: '#374151', textColor: '#9ca3af' },
    { label: 'Token + Positional Embedding', sub: 'word meaning + position signal', fill: '#1e1b4b', stroke: '#4f46e5', textColor: '#a5b4fc' },
    { label: 'Multi-Head Self-Attention', sub: 'Attention(Q,K,V) = softmax(QKᵀ/√d)V', fill: '#1e1b4b', stroke: '#7c3aed', textColor: '#c4b5fd' },
    { label: 'Add & Layer Norm', sub: 'residual connection keeps gradients healthy', fill: '#111827', stroke: '#374151', textColor: '#6b7280' },
    { label: 'Feed-Forward Network', sub: 'two linear layers + ReLU per token', fill: '#1e1b4b', stroke: '#0f766e', textColor: '#5eead4' },
    { label: 'Add & Layer Norm', sub: 'residual connection again', fill: '#111827', stroke: '#374151', textColor: '#6b7280' },
    { label: 'Output Representations', sub: 'h₁  h₂  h₃  …', fill: '#111827', stroke: '#374151', textColor: '#9ca3af' },
  ]

  const H = 48, GAP = 16, W = 360, PAD = 20
  const totalH = blocks.length * H + (blocks.length - 1) * GAP + 2 * PAD
  const W_SVG = W + 2 * PAD

  return (
    <svg viewBox={`0 0 ${W_SVG} ${totalH}`} className="mx-auto w-full max-w-md">
      {blocks.map((b, i) => {
        const y = PAD + i * (H + GAP)
        const cy = y + H / 2
        return (
          <g key={i}>
            {/* Arrow from previous */}
            {i > 0 && (
              <line x1={W_SVG / 2} y1={y - GAP} x2={W_SVG / 2} y2={y}
                stroke="#374151" strokeWidth={1.5} />
            )}
            <rect x={PAD} y={y} width={W} height={H} rx={8}
              fill={b.fill} stroke={b.stroke} strokeWidth={1.5} />
            <text x={PAD + 12} y={cy - 4} fill={b.textColor} fontSize={12} fontWeight={600}>
              {b.label}
            </text>
            <text x={PAD + 12} y={cy + 11} fill="#4b5563" fontSize={10} fontFamily="monospace">
              {b.sub}
            </text>
          </g>
        )
      })}
      {/* "× N layers" annotation */}
      <rect x={W_SVG - 50} y={PAD + H + GAP} width={44} height={(H + GAP) * 4 - GAP}
        rx={4} fill="none" stroke="#4f46e5" strokeWidth={1} strokeDasharray="4,3" strokeOpacity={0.5} />
      <text x={W_SVG - 28} y={PAD + H + GAP + (H + GAP) * 2 - H / 2}
        textAnchor="middle" fill="#6366f1" fontSize={10} fontFamily="monospace">
        × N
      </text>
      <text x={W_SVG - 28} y={PAD + H + GAP + (H + GAP) * 2 - H / 2 + 12}
        textAnchor="middle" fill="#6366f1" fontSize={10}>
        layers
      </text>
    </svg>
  )
}

// ─── Module export ────────────────────────────────────────────────────────────

export function Transformers({ onComplete, completed }: ModuleProps) {
  return (
    <div className="mx-auto max-w-2xl px-6 py-12 text-white">
      {/* Hero */}
      <section className="mb-20 text-center">
        <div className="mb-6 inline-flex h-20 w-20 items-center justify-center rounded-2xl border border-indigo-800 bg-indigo-950/60">
          <span className="text-4xl">🔀</span>
        </div>
        <h2 className="mb-4 text-4xl font-bold tracking-tight">Transformers</h2>
        <p className="text-lg text-gray-400 leading-relaxed">
          The architecture that made GPT, BERT, and every modern language model possible —
          by replacing sequential processing with parallel attention.
        </p>
      </section>

      <Section number={1} title="The Problem with Sequences">
        <p className="mb-4 text-gray-300 leading-relaxed">
          Before transformers, language models used RNNs: they processed words one at a time,
          left to right, passing a hidden state forward. This made them slow to train (no
          parallelism) and terrible at relating words that were far apart — the gradient
          signal fades over distance.
        </p>
        <SequenceDiagram />
        <p className="mt-4 text-gray-300 leading-relaxed">
          Transformers (Vaswani et al., 2017) scrapped the sequential bottleneck entirely.
          Every token looks at every other token simultaneously — and the relationships are
          learned, not hard-coded.
        </p>
      </Section>

      <Section number={2} title="Words Live in Space">
        <p className="mb-4 text-gray-300 leading-relaxed">
          Before a transformer can process words, it turns them into vectors — lists of
          numbers that encode meaning. Semantically similar words end up near each other in
          this high-dimensional space. When we project down to 2D, structure emerges: animals
          cluster together, food clusters, and abstract relationships like{' '}
          <span className="font-mono text-indigo-300">king − man + woman ≈ queen</span>{' '}
          appear as consistent direction vectors.
        </p>
        <WordScatter />
        <p className="mt-4 text-sm text-gray-500 leading-relaxed">
          Real embedding spaces have hundreds or thousands of dimensions. The 2D view
          compresses that structure via PCA — some detail is lost, but the clusters and
          analogies survive. You'll explore this fully in the Embeddings node.
        </p>
      </Section>

      <Section number={3} title="Inside a Transformer Block">
        <p className="mb-4 text-gray-300 leading-relaxed">
          A transformer is built from identical blocks stacked N times (12 in GPT-2 small,
          96 in GPT-4). Each block has two parts: a self-attention layer (lets tokens
          communicate) and a feed-forward network (processes each token independently).
          Residual connections and layer norm keep training stable.
        </p>
        <TransformerBlock />
      </Section>

      <Section number={4} title="What Makes It Work">
        <div className="grid gap-4 sm:grid-cols-3">
          {[
            {
              title: 'Parallelism',
              icon: '⚡',
              body: 'All tokens attend to all others simultaneously, making full use of GPU parallelism during training.',
            },
            {
              title: 'Long-range deps',
              icon: '🔗',
              body: 'A token at position 1 and position 500 attend to each other with the same ease as adjacent tokens.',
            },
            {
              title: 'Scale',
              icon: '📈',
              body: 'More layers, more heads, more parameters → reliably better performance. No other architecture has scaled this cleanly.',
            },
          ].map(({ title, icon, body }) => (
            <div key={title} className="rounded-xl border border-gray-800 bg-gray-900/40 p-4">
              <div className="mb-2 text-2xl">{icon}</div>
              <p className="mb-1 text-sm font-semibold text-indigo-200">{title}</p>
              <p className="text-xs text-gray-500 leading-snug">{body}</p>
            </div>
          ))}
        </div>
        <p className="mt-6 text-sm text-gray-500 leading-relaxed">
          The two nodes that branch from here — <span className="text-gray-300">Tokenization</span>{' '}
          and <span className="text-gray-300">Attention</span> — each go deep on one half
          of how a transformer works. Complete this node to unlock both.
        </p>
      </Section>

      {/* Completion */}
      <section className="mt-4 rounded-2xl border border-indigo-900/60 bg-indigo-950/30 p-8 text-center">
        <div className="mb-2 text-2xl">{completed ? '✅' : '🎯'}</div>
        <h3 className="mb-2 text-xl font-bold">
          {completed ? 'Module Complete' : 'Ready to continue?'}
        </h3>
        <p className="mb-6 text-sm text-gray-400">
          {completed
            ? 'Tokenization and Attention are now unlocked on the map.'
            : 'Mark this complete to unlock Tokenization and Attention on the concept map.'}
        </p>
        {!completed && (
          <button
            onClick={onComplete}
            className="rounded-lg bg-indigo-600 px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:ring-offset-2 focus:ring-offset-gray-950"
          >
            Mark as Complete
          </button>
        )}
      </section>
    </div>
  )
}
