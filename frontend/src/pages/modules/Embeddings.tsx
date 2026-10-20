import { useEffect, useRef, useState, type ReactNode } from 'react'
import { Quiz, type QuizQuestion } from '../../components/Quiz'

import { ANALOGY_WORDS, EMB_CATEGORIES, WORD_POINTS, type EmbCategory } from '../../data/wordEmbeddings'

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

// ─── Scatter ──────────────────────────────────────────────────────────────────

const SVG_W = 560, SVG_H = 440, PAD = 44

function toSvgX(x: number) { return PAD + ((x + 1) / 2) * (SVG_W - 2 * PAD) }
function toSvgY(y: number) { return PAD + ((1 - y) / 2) * (SVG_H - 2 * PAD) }

interface Transform { x: number; y: number; k: number }

function WordScatter({ activeCategories }: { activeCategories: Set<EmbCategory> }) {
  const svgRef = useRef<SVGSVGElement>(null)
  const [transform, setTransform] = useState<Transform>({ x: 0, y: 0, k: 1 })
  const drag = useRef<{ ox: number; oy: number; moved: boolean } | null>(null)
  const [cursor, setCursor] = useState<'grab' | 'grabbing'>('grab')
  const [hovered, setHovered] = useState<string | null>(null)

  useEffect(() => {
    const svg = svgRef.current
    if (!svg) return
    function onWheel(e: WheelEvent) {
      e.preventDefault()
      setTransform((t) => {
        const factor = e.deltaY < 0 ? 1.15 : 1 / 1.15
        const k = Math.max(0.5, Math.min(4, t.k * factor))
        const rect = svg!.getBoundingClientRect()
        const cx = e.clientX - rect.left
        const cy = e.clientY - rect.top
        return { x: cx - (cx - t.x) * (k / t.k), y: cy - (cy - t.y) * (k / t.k), k }
      })
    }
    svg.addEventListener('wheel', onWheel, { passive: false })
    return () => svg.removeEventListener('wheel', onWheel)
  }, [])

  // Analogy coordinates
  const man   = WORD_POINTS.find((w) => w.word === 'man')!
  const woman = WORD_POINTS.find((w) => w.word === 'woman')!
  const king  = WORD_POINTS.find((w) => w.word === 'king')!
  const queen = WORD_POINTS.find((w) => w.word === 'queen')!
  const showAnalogy = hovered ? ANALOGY_WORDS.has(hovered) : true

  return (
    <svg
      ref={svgRef}
      viewBox={`0 0 ${SVG_W} ${SVG_H}`}
      className="w-full rounded-xl border border-gray-800 bg-gray-900/30"
      style={{ cursor }}
      onPointerDown={(e) => {
        drag.current = { ox: e.clientX, oy: e.clientY, moved: false }
        e.currentTarget.setPointerCapture(e.pointerId)
      }}
      onPointerMove={(e) => {
        if (!drag.current) return
        const dx = e.clientX - drag.current.ox
        const dy = e.clientY - drag.current.oy
        if (!drag.current.moved && Math.hypot(dx, dy) > 4) {
          drag.current.moved = true
          setCursor('grabbing')
        }
        if (drag.current.moved) {
          setTransform((t) => ({ ...t, x: t.x + dx, y: t.y + dy }))
          drag.current = { ...drag.current, ox: e.clientX, oy: e.clientY }
        }
      }}
      onPointerUp={() => { drag.current = null; setCursor('grab') }}
    >
      <g transform={`translate(${transform.x},${transform.y}) scale(${transform.k})`}>
        {/* Axis labels */}
        <text x={SVG_W / 2} y={SVG_H - 6} textAnchor="middle" fill="#1f2937" fontSize={11}>semantic space (2D projection)</text>

        {/* Analogy arrows: man→king, woman→queen */}
        {showAnalogy && (
          <>
            <line x1={toSvgX(man.x)} y1={toSvgY(man.y)} x2={toSvgX(king.x)} y2={toSvgY(king.y)}
              stroke="#facc15" strokeWidth={1.5} strokeDasharray="5,3" markerEnd="url(#arr-analogy)" />
            <line x1={toSvgX(woman.x)} y1={toSvgY(woman.y)} x2={toSvgX(queen.x)} y2={toSvgY(queen.y)}
              stroke="#facc15" strokeWidth={1.5} strokeDasharray="5,3" markerEnd="url(#arr-analogy)" />
            <text
              x={(toSvgX(man.x) + toSvgX(king.x)) / 2 + 14}
              y={(toSvgY(man.y) + toSvgY(king.y)) / 2}
              fill="#facc15" fontSize={10} fillOpacity={0.8}>royalty</text>
          </>
        )}

        <defs>
          <marker id="arr-analogy" markerWidth="6" markerHeight="6" refX="3" refY="3" orient="auto">
            <path d="M0,0 L0,6 L6,3 z" fill="#facc15" />
          </marker>
        </defs>

        {/* Word dots */}
        {WORD_POINTS.map((pt) => {
          const active = activeCategories.has(pt.category)
          const color = EMB_CATEGORIES[pt.category].color
          const isHov = hovered === pt.word
          const sx = toSvgX(pt.x), sy = toSvgY(pt.y)
          return (
            <g key={pt.word}
              onMouseEnter={() => setHovered(pt.word)}
              onMouseLeave={() => setHovered(null)}
              style={{ cursor: 'default' }}
            >
              {isHov && (
                <circle cx={sx} cy={sy} r={12} fill={color} fillOpacity={0.15} />
              )}
              <circle
                cx={sx} cy={sy} r={isHov ? 5.5 : 4}
                fill={color} fillOpacity={active ? (isHov ? 1 : 0.85) : 0.15}
                stroke={isHov ? color : 'none'} strokeWidth={1}
                style={{ transition: 'r 0.15s, fill-opacity 0.2s' }}
              />
              {isHov && (
                <text x={sx + 8} y={sy + 4} fill={color} fontSize={12} fontWeight={600}
                  style={{ userSelect: 'none', pointerEvents: 'none' }}>
                  {pt.word}
                </text>
              )}
            </g>
          )
        })}
      </g>
    </svg>
  )
}

// ─── Module export ────────────────────────────────────────────────────────────

const ALL_CATEGORIES = Object.keys(EMB_CATEGORIES) as EmbCategory[]

const EMB_QUIZ: QuizQuestion[] = [
  {
    q: 'What is a word embedding?',
    options: ['A compressed image of a word', 'A high-dimensional vector that represents a word based on the contexts it appears in during training', 'A dictionary definition stored as text', 'A one-hot encoded representation'],
    answer: 1,
    explanation: 'Embeddings are dense vectors learned from large text. Words that appear in similar contexts end up near each other in vector space.',
  },
  {
    q: 'king – man + woman ≈ queen. What does this demonstrate?',
    options: ['Language models can solve equations', 'Semantic relationships are encoded as directions in embedding space, so you can do arithmetic on meaning', 'The model memorized this specific example', 'Word vectors always sum to zero'],
    answer: 1,
    explanation: '"Royalty" and "gender" are actual geometric directions in the embedding space. Subtracting "man-ness" and adding "woman-ness" lands near "queen".',
  },
  {
    q: 'Why is cosine similarity used instead of Euclidean distance for comparing embeddings?',
    options: ['It is faster to compute', 'It measures the angle between vectors, so it captures semantic similarity regardless of vector magnitude', 'It always returns a value between 0 and 1', 'It works better for sparse vectors'],
    answer: 1,
    explanation: 'Two identical-meaning words with different frequencies might have vectors of different lengths. Cosine similarity normalizes for length, comparing direction (meaning) alone.',
  },
  {
    q: 'How are word embeddings typically learned?',
    options: ['By hand-labelling word meanings', 'By training a model to predict surrounding words (or vice versa) on massive text corpora', 'By counting word frequencies', 'By decomposing a thesaurus into vectors'],
    answer: 1,
    explanation: 'Models like Word2Vec or the embedding layers of LLMs learn vectors by predicting context. Words that appear together frequently end up with similar vectors.',
  },
  {
    q: "Why can't you just use one-hot encoding instead of embeddings?",
    options: ['One-hot vectors are too small', 'One-hot vectors are huge, sparse, and encode no similarity — "cat" and "dog" are as far apart as "cat" and "database"', 'One-hot encoding is too slow to compute', 'LLMs do not support integer inputs'],
    answer: 1,
    explanation: 'One-hot vectors have one 1 and all other values 0. Every word is orthogonal to every other — there is no notion of semantic closeness.',
  },
]

export function Embeddings({ onComplete, completed }: ModuleProps) {
  const [active, setActive] = useState<Set<EmbCategory>>(new Set(ALL_CATEGORIES))

  function toggle(cat: EmbCategory) {
    setActive((prev) => {
      const next = new Set(prev)
      if (next.has(cat)) {
        if (next.size > 1) next.delete(cat)
      } else {
        next.add(cat)
      }
      return next
    })
  }

  return (
    <div className="mx-auto max-w-2xl px-6 py-12 text-white">
      <section className="mb-20 text-center">
        <div className="mb-6 inline-flex h-20 w-20 items-center justify-center rounded-2xl border border-indigo-800 bg-indigo-950/60">
          <span className="text-4xl">🗺</span>
        </div>
        <h2 className="mb-4 text-4xl font-bold tracking-tight">Embeddings</h2>
        <p className="text-lg text-gray-400 leading-relaxed">
          Before an AI can understand any word, it converts it into a list of numbers.
          But these aren't random numbers — words with similar meanings get similar numbers,
          and that lets the AI do something remarkable: reason about language using math.
        </p>
      </section>

      <Section number={1} title="Words as Coordinates">
        <p className="mb-4 text-gray-300 leading-relaxed">
          Think of embeddings as GPS coordinates for meaning. Each word gets a set of
          coordinates in a vast space — and words used in similar situations end up near
          each other. "Dog" and "cat" land close together. "Dog" and "algorithm" are far
          apart. The model never sees letters at all — only these number coordinates.
          And because meaning is now geometry, you can do math with it.
        </p>
        <div className="grid grid-cols-3 gap-3 text-xs mb-6">
          {[
            { title: 'Similarity', body: '"cat" and "dog" land close together; "cat" and "database" are far apart. Closeness = similar meaning.' },
            { title: 'Analogies',  body: 'king − man + woman ≈ queen. The "royalty" concept is literally a direction in this space.' },
            { title: 'Arithmetic', body: 'Paris − France + Germany ≈ Berlin. Geographic and cultural relationships show up as math.' },
          ].map(({ title, body }) => (
            <div key={title} className="rounded-xl border border-gray-800 bg-gray-900/40 p-3">
              <p className="font-semibold text-indigo-300 mb-1">{title}</p>
              <p className="text-gray-500 leading-snug">{body}</p>
            </div>
          ))}
        </div>
      </Section>

      <Section number={2} title="2D Word Map">
        <p className="mb-3 text-gray-300 leading-relaxed">
          Real word maps have hundreds of dimensions — impossible to draw. Below, we've
          compressed them into 2D so you can see the clusters and relationships. Hover any
          dot to see its word. Toggle categories to focus on a group. Scroll to zoom in.
        </p>

        {/* Category toggles */}
        <div className="flex flex-wrap gap-1.5 mb-3">
          <button
            onClick={() => setActive(new Set(ALL_CATEGORIES))}
            className="px-2.5 py-1 rounded-lg text-xs bg-gray-800 text-gray-400 hover:text-white transition-colors"
          >
            All
          </button>
          {ALL_CATEGORIES.map((cat) => {
            const { label, color } = EMB_CATEGORIES[cat]
            const on = active.has(cat)
            return (
              <button key={cat} onClick={() => toggle(cat)}
                className={`px-2.5 py-1 rounded-lg text-xs transition-colors border ${
                  on ? 'text-white border-transparent' : 'text-gray-600 border-gray-800 bg-gray-900'
                }`}
                style={on ? { background: `${color}30`, borderColor: `${color}60`, color } : {}}
              >
                {label}
              </button>
            )
          })}
        </div>

        <WordScatter activeCategories={active} />
        <p className="text-xs text-gray-600 mt-2 text-center">Drag to pan · Scroll to zoom · Hover a dot to label it</p>
      </Section>

      <Section number={3} title="How Embeddings Are Learned">
        <p className="mb-4 text-gray-300 leading-relaxed">
          Early embedding models (like Word2Vec, 2013) gave every word a single fixed
          address. Modern AI does something more sophisticated: the word "bank" gets a
          different embedding depending on what surrounds it — "river bank" ends up in a
          completely different location than "savings bank." These coordinates are learned
          automatically during training by reading enormous amounts of text. The model
          figures out the best location for each word without being told.
        </p>
        <div className="rounded-xl border border-gray-800 bg-gray-900/40 p-4 font-mono text-xs leading-relaxed">
          <p className="text-gray-500 mb-1">// Token → embedding lookup</p>
          <p className="text-gray-300">token_id = 3797  <span className="text-gray-600">// "cat"</span></p>
          <p className="text-gray-300">vector = E[token_id]  <span className="text-gray-600">// row 3797 of embedding matrix</span></p>
          <p className="text-gray-300">  <span className="text-indigo-300">= [0.23, −0.81, 0.55, 0.12, …]</span>  <span className="text-gray-600">// 768 floats for GPT-2</span></p>
        </div>
        <p className="mt-4 text-sm text-gray-500 leading-relaxed">
          GPT-2 gives each of its 50,257 possible tokens a list of 768 numbers. That's
          about 38 million numbers just to store the vocabulary — before the model has even
          started thinking. Those 768 numbers per word are what let the AI understand the
          rich, context-dependent meaning of language.
        </p>
      </Section>

      <Section number={4} title="Quiz Yourself">
        <p className="mb-4 leading-relaxed text-gray-300">Check whether vectors, similarity, and how embeddings are learned have clicked.</p>
        <Quiz questions={EMB_QUIZ} title="Embeddings" />
      </Section>

      <section className="mt-4 rounded-2xl border border-indigo-900/60 bg-indigo-950/30 p-8 text-center">
        <div className="mb-2 text-2xl">{completed ? '✅' : '🎯'}</div>
        <h3 className="mb-2 text-xl font-bold">{completed ? 'Module Complete' : 'Ready to mark this done?'}</h3>
        <p className="mb-6 text-sm text-gray-400">
          {completed
            ? 'You understand how meaning becomes geometry in neural networks.'
            : 'Mark this complete to track your progress through the concept map.'}
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
