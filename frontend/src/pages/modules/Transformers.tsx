import { useEffect, useRef, useState, type ReactNode } from 'react'
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

// ─── 1. Animated sequence comparison ─────────────────────────────────────────

type AnimPhase = 'idle' | 'rnn' | 'transformer' | 'done'

function AnimatedSequenceDiagram() {
  const [phase, setPhase] = useState<AnimPhase>('idle')
  const [rnnStep, setRnnStep] = useState(-1)
  const timers = useRef<ReturnType<typeof setTimeout>[]>([])

  function clearTimers() {
    timers.current.forEach(clearTimeout)
    timers.current = []
  }

  function play() {
    clearTimers()
    setPhase('rnn')
    setRnnStep(-1)
    ;[0, 1, 2, 3].forEach((i) => {
      const t = setTimeout(() => setRnnStep(i), i * 550)
      timers.current.push(t)
    })
    const t1 = setTimeout(() => setPhase('transformer'), 4 * 550 + 300)
    const t2 = setTimeout(() => setPhase('done'), 4 * 550 + 1000)
    timers.current.push(t1, t2)
  }

  function reset() {
    clearTimers()
    setPhase('idle')
    setRnnStep(-1)
  }

  useEffect(() => () => clearTimers(), [])

  const transformerActive = phase === 'transformer' || phase === 'done'

  return (
    <div>
      <div className="grid gap-4 sm:grid-cols-2">
        {/* RNN */}
        <div className="rounded-xl border border-gray-800 bg-gray-900/40 p-4">
          <p className="font-mono text-xs text-gray-500 mb-1">RNN — sequential</p>
          <p className="text-xs text-red-400 mb-3">⚠ one token at a time</p>
          <svg viewBox="0 0 260 80" className="w-full">
            <defs>
              <marker id="arrowR" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
                <path d="M0,0 L0,6 L6,3 z" fill="#4f46e5" />
              </marker>
              <marker id="arrowRgray" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
                <path d="M0,0 L0,6 L6,3 z" fill="#374151" />
              </marker>
            </defs>
            {[0, 1, 2, 3].map((i) => {
              const x = 20 + i * 60
              const active = rnnStep >= i
              return (
                <g key={i}>
                  <rect
                    x={x} y={20} width={40} height={30} rx={6}
                    fill={active ? '#1e1b4b' : '#111827'}
                    stroke={active ? '#6366f1' : '#374151'}
                    strokeWidth={active ? 2 : 1.5}
                    style={{ transition: 'fill 0.35s, stroke 0.35s' }}
                  />
                  <text x={x + 20} y={39} textAnchor="middle"
                    fill={active ? '#a5b4fc' : '#4b5563'}
                    fontSize={11} fontFamily="monospace"
                    style={{ transition: 'fill 0.35s' }}>
                    h{i + 1}
                  </text>
                  {i < 3 && (
                    <line
                      x1={x + 40} y1={35} x2={x + 58} y2={35}
                      stroke={rnnStep > i ? '#4f46e5' : '#374151'}
                      strokeWidth={1.5}
                      markerEnd={rnnStep > i ? 'url(#arrowR)' : 'url(#arrowRgray)'}
                      style={{ transition: 'stroke 0.35s' }}
                    />
                  )}
                  <text x={x + 20} y={72} textAnchor="middle" fill="#4b5563" fontSize={10}>
                    x{i + 1}
                  </text>
                  <line x1={x + 20} y1={66} x2={x + 20} y2={51} stroke="#374151" strokeWidth={1} />
                </g>
              )
            })}
          </svg>
        </div>

        {/* Transformer */}
        <div className="rounded-xl border border-gray-800 bg-gray-900/40 p-4">
          <p className="font-mono text-xs text-gray-500 mb-1">Transformer — parallel</p>
          <p className="text-xs text-green-400 mb-3">✓ all tokens at once</p>
          <svg viewBox="0 0 260 80" className="w-full">
            {[0, 1, 2, 3].map((i) => {
              const x = 20 + i * 60
              return (
                <g key={i}>
                  <rect
                    x={x} y={20} width={40} height={30} rx={6}
                    fill={transformerActive ? '#1e1b4b' : '#111827'}
                    stroke={transformerActive ? '#6366f1' : '#374151'}
                    strokeWidth={transformerActive ? 2 : 1.5}
                    style={{ transition: 'fill 0.4s, stroke 0.4s' }}
                  />
                  <text x={x + 20} y={39} textAnchor="middle"
                    fill={transformerActive ? '#a5b4fc' : '#4b5563'}
                    fontSize={11} fontFamily="monospace"
                    style={{ transition: 'fill 0.4s' }}>
                    h{i + 1}
                  </text>
                  <text x={x + 20} y={72} textAnchor="middle" fill="#4b5563" fontSize={10}>
                    x{i + 1}
                  </text>
                  <line x1={x + 20} y1={66} x2={x + 20} y2={51} stroke="#374151" strokeWidth={1} />
                </g>
              )
            })}
            {transformerActive &&
              [20, 80, 140, 200].flatMap((x1) =>
                [20, 80, 140, 200]
                  .filter((x2) => x2 !== x1)
                  .map((x2) => (
                    <line
                      key={`${x1}-${x2}`}
                      x1={x1 + 20} y1={20} x2={x2 + 20} y2={20}
                      stroke="#4f46e5" strokeWidth={0.8} strokeOpacity={0.55}
                    />
                  )),
              )}
          </svg>
        </div>
      </div>

      <div className="mt-3 flex justify-center">
        {phase === 'idle' && (
          <button
            onClick={play}
            className="flex items-center gap-2 rounded-lg border border-indigo-700 bg-indigo-950/40 px-4 py-2 text-sm font-medium text-indigo-300 transition-colors hover:bg-indigo-900/40"
          >
            ▶ Animate the difference
          </button>
        )}
        {(phase === 'rnn' || phase === 'transformer') && (
          <span className="text-xs text-gray-500 animate-pulse">Animating…</span>
        )}
        {phase === 'done' && (
          <button
            onClick={reset}
            className="text-sm text-gray-500 transition-colors hover:text-gray-300"
          >
            ↩ Reset
          </button>
        )}
      </div>
    </div>
  )
}

// ─── 2. Interactive word scatter ──────────────────────────────────────────────

const MINI_WORDS = [
  { word: 'neural', x: 225, y: 38,  cluster: 'AI / Tech',  c: '#818cf8' },
  { word: 'model',  x: 258, y: 55,  cluster: 'AI / Tech',  c: '#818cf8' },
  { word: 'data',   x: 242, y: 25,  cluster: 'AI / Tech',  c: '#818cf8' },
  { word: 'train',  x: 210, y: 58,  cluster: 'AI / Tech',  c: '#818cf8' },
  { word: 'cat',    x: 42,  y: 155, cluster: 'Animals',    c: '#34d399' },
  { word: 'dog',    x: 28,  y: 168, cluster: 'Animals',    c: '#34d399' },
  { word: 'bird',   x: 62,  y: 142, cluster: 'Animals',    c: '#34d399' },
  { word: 'fish',   x: 48,  y: 178, cluster: 'Animals',    c: '#34d399' },
  { word: 'man',    x: 122, y: 130, cluster: 'People',     c: '#f472b6' },
  { word: 'woman',  x: 155, y: 126, cluster: 'People',     c: '#f472b6' },
  { word: 'king',   x: 122, y: 72,  cluster: 'Royalty',    c: '#facc15' },
  { word: 'queen',  x: 155, y: 68,  cluster: 'Royalty',    c: '#facc15' },
  { word: 'bread',  x: 55,  y: 42,  cluster: 'Food',       c: '#fb923c' },
  { word: 'apple',  x: 38,  y: 58,  cluster: 'Food',       c: '#fb923c' },
]

const ANALOGY_WORDS = ['king', 'man', 'woman', 'queen']

function InteractiveWordScatter() {
  const [hovered, setHovered] = useState<string | null>(null)
  const [showAnalogy, setShowAnalogy] = useState(false)

  const hoveredMeta = MINI_WORDS.find((w) => w.word === hovered)

  return (
    <div className="rounded-xl border border-gray-800 bg-gray-900/40 p-4">
      <svg
        viewBox="0 0 300 210"
        className="w-full"
        onMouseLeave={() => setHovered(null)}
      >
        {/* Cluster backgrounds */}
        <ellipse cx={234} cy={42} rx={48} ry={24} fill="#818cf8" fillOpacity={0.05} stroke="#818cf8" strokeOpacity={0.15} strokeWidth={1} />
        <ellipse cx={45}  cy={162} rx={36} ry={24} fill="#34d399" fillOpacity={0.05} stroke="#34d399" strokeOpacity={0.15} strokeWidth={1} />
        <ellipse cx={46}  cy={50}  rx={28} ry={16} fill="#fb923c" fillOpacity={0.05} stroke="#fb923c" strokeOpacity={0.15} strokeWidth={1} />

        {/* Analogy arrows — king−man+woman=queen */}
        {showAnalogy && (
          <>
            {/* man → king (royalty direction) */}
            <line x1={122} y1={124} x2={122} y2={80} stroke="#facc15" strokeWidth={1.5} strokeDasharray="4,3" strokeOpacity={0.8} />
            {/* woman → queen (same direction) */}
            <line x1={155} y1={120} x2={155} y2={76} stroke="#facc15" strokeWidth={1.5} strokeDasharray="4,3" strokeOpacity={0.8} />
            {/* man → woman (gender direction) */}
            <line x1={128} y1={128} x2={149} y2={127} stroke="#f472b6" strokeWidth={1} strokeDasharray="3,2" strokeOpacity={0.7} />
            {/* king → queen (same gender direction) */}
            <line x1={128} y1={72} x2={149} y2={70} stroke="#f472b6" strokeWidth={1} strokeDasharray="3,2" strokeOpacity={0.7} />
            <text x={174} y={99} fill="#facc15" fontSize={9} fillOpacity={0.9}>royalty</text>
            <text x={134} y={118} fill="#f472b6" fontSize={9} fillOpacity={0.85}>gender</text>
          </>
        )}

        {/* Word dots + labels */}
        {MINI_WORDS.map(({ word, x, y, c }) => {
          const isHov = hovered === word
          const inAnalogy = showAnalogy && ANALOGY_WORDS.includes(word)
          const dim = (showAnalogy && !inAnalogy) || (hovered !== null && !isHov && !inAnalogy)
          const r = isHov || inAnalogy ? 6 : 4

          return (
            <g
              key={word}
              style={{ cursor: 'pointer' }}
              onMouseEnter={() => setHovered(word)}
            >
              <circle
                cx={x} cy={y} r={r + 6}
                fill="transparent"
              />
              <circle
                cx={x} cy={y} r={r}
                fill={c}
                fillOpacity={dim ? 0.2 : 0.9}
                stroke={isHov || inAnalogy ? c : 'none'}
                strokeWidth={isHov ? 2 : 1}
                strokeOpacity={0.6}
                style={{ transition: 'r 0.15s, fill-opacity 0.2s' }}
              />
              <text
                x={x + 7} y={y + 4}
                fill={c}
                fontSize={isHov || inAnalogy ? 11 : 10}
                fontWeight={isHov || inAnalogy ? '700' : '400'}
                fillOpacity={dim ? 0.2 : 0.9}
                style={{ transition: 'fill-opacity 0.2s' }}
              >
                {word}
              </text>
            </g>
          )
        })}

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

      {/* Info strip */}
      <div className="flex min-h-[28px] items-center justify-between gap-4 border-t border-gray-800/60 pt-2">
        <p className="text-xs text-gray-500">
          {hoveredMeta ? (
            <>
              <span style={{ color: hoveredMeta.c }} className="font-semibold">
                {hoveredMeta.word}
              </span>{' '}
              — {hoveredMeta.cluster} cluster
            </>
          ) : (
            'Hover a word to inspect it'
          )}
        </p>
        <button
          onClick={() => setShowAnalogy(v => !v)}
          className={`flex-shrink-0 rounded-lg border px-3 py-1 text-xs font-medium transition-colors ${
            showAnalogy
              ? 'border-yellow-600 bg-yellow-950/30 text-yellow-300'
              : 'border-gray-700 text-gray-500 hover:border-gray-500 hover:text-gray-300'
          }`}
        >
          {showAnalogy ? 'Hide' : 'Show'} king − man + woman = queen
        </button>
      </div>
    </div>
  )
}

// ─── 3. Interactive transformer block ────────────────────────────────────────

const LAYERS = [
  {
    label: 'Input Tokens',
    sub: 'x₁  x₂  x₃  …',
    accent: 'border-gray-600',
    chip: 'bg-gray-800 text-gray-400',
    detail:
      'Raw text is broken into tokens — roughly one word or word-fragment each. "Transformers" might split into ["Transform", "##ers"]. The model never sees letters directly, only these token IDs looked up from a fixed vocabulary.',
    example: '"The cat sat" → [The] [cat] [sat] — 3 tokens, each assigned a unique integer ID.',
  },
  {
    label: 'Token + Positional Embedding',
    sub: 'meaning vector + position signal',
    accent: 'border-indigo-600',
    chip: 'bg-indigo-950 text-indigo-300',
    detail:
      'Each token ID maps to a list of ~1,000 numbers called an embedding, encoding its meaning. A second set of numbers is added to represent its position — otherwise the model can\'t tell "dog bites man" from "man bites dog".',
    example: '"cat" at position 2 → its meaning vector + a position-2 encoding, summed element-wise.',
  },
  {
    label: 'Multi-Head Self-Attention',
    sub: 'Attention(Q,K,V) = softmax(QKᵀ/√d)V',
    accent: 'border-violet-600',
    chip: 'bg-violet-950 text-violet-300',
    detail:
      'Every token asks "what should I attend to?" (query) and every token answers "here\'s what I represent" (key). Dot products between queries and keys produce attention scores. Multi-head means this runs 8–96 times in parallel, each head learning different relationship types: grammar, coreference, topic.',
    example: 'In "The bank by the river is flooded", "bank" attends to "river" → picks the geographic sense, not financial.',
  },
  {
    label: 'Add & Layer Norm',
    sub: 'residual + normalisation',
    accent: 'border-gray-600',
    chip: 'bg-gray-800 text-gray-500',
    detail:
      'The attention output is added back to the original embedding (a "residual connection"). This stops information being lost across many layers. Layer normalisation then rescales values to keep training numerically stable.',
    example: 'Without residual connections, gradients in a 96-layer model would vanish before reaching the first layer — training would fail.',
  },
  {
    label: 'Feed-Forward Network',
    sub: 'two linear layers + ReLU per token',
    accent: 'border-teal-600',
    chip: 'bg-teal-950 text-teal-300',
    detail:
      'After attention mixes information between tokens, each token is processed independently through a small two-layer network. This is where most learned "knowledge" lives — facts, grammar rules, reasoning patterns absorbed during training.',
    example: 'Researchers have probed individual neurons here and found cells that fire specifically for "cities in France" or "Python function names".',
  },
  {
    label: 'Add & Layer Norm',
    sub: 'residual connection again',
    accent: 'border-gray-600',
    chip: 'bg-gray-800 text-gray-500',
    detail:
      'Same stabilising step after the feed-forward layer. GPT-4 repeats the full block (Attention → Add&Norm → FFN → Add&Norm) roughly 96 times. Each repetition refines the representation further.',
    example: 'GPT-2 had 12 layers. GPT-3 had 96. Adding more layers — not just more data — was the biggest driver of capability improvements.',
  },
  {
    label: 'Output Representations',
    sub: 'h₁  h₂  h₃  …',
    accent: 'border-gray-600',
    chip: 'bg-gray-800 text-gray-400',
    detail:
      'Each token is now a rich context-aware vector. For a language model, these feed into a final linear layer that scores every word in the vocabulary, and softmax converts those scores into probabilities for the next token.',
    example: 'After "The Eiffel Tower is in", the output for "in" assigns very high probability to "Paris" — learned entirely from training data.',
  },
]

const REPEATING_INDICES = [2, 3, 4, 5]

function InteractiveTransformerBlock() {
  const [open, setOpen] = useState<number | null>(null)

  return (
    <div className="mx-auto max-w-md space-y-1.5">
      {LAYERS.map((layer, i) => {
        const isOpen = open === i
        const isRepeating = REPEATING_INDICES.includes(i)

        return (
          <div key={i}>
            {/* "× N layers" bracket start */}
            {i === REPEATING_INDICES[0] && (
              <div className="mb-1 flex items-center gap-2">
                <div className="h-px flex-1 bg-indigo-900/40" />
                <span className="font-mono text-xs text-indigo-600">× N layers</span>
                <div className="h-px flex-1 bg-indigo-900/40" />
              </div>
            )}

            <button
              onClick={() => setOpen(isOpen ? null : i)}
              className={`w-full rounded-xl border px-4 py-3 text-left transition-all duration-200 ${
                isOpen
                  ? `${layer.accent} bg-gray-900/70`
                  : `border-gray-800 bg-gray-900/40 hover:border-gray-700`
              } ${isRepeating ? 'border-l-2' : ''} ${isRepeating ? layer.accent.replace('border-', 'border-l-') : ''}`}
            >
              <div className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <div className={`text-sm font-semibold ${isOpen ? 'text-white' : 'text-gray-300'}`}>
                    {layer.label}
                  </div>
                  <div className="mt-0.5 font-mono text-xs text-gray-600 truncate">{layer.sub}</div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <span className={`rounded-full px-2 py-0.5 text-xs ${layer.chip}`}>
                    {isOpen ? 'collapse' : 'expand'}
                  </span>
                  <span className={`text-gray-500 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}>
                    ▾
                  </span>
                </div>
              </div>

              {isOpen && (
                <div className="mt-3 space-y-2 border-t border-gray-800/60 pt-3 text-left">
                  <p className="text-sm text-gray-300 leading-relaxed">{layer.detail}</p>
                  <div className="rounded-lg bg-gray-950/60 px-3 py-2">
                    <p className="font-mono text-xs text-gray-500 leading-relaxed">
                      <span className="text-gray-600">e.g. </span>
                      {layer.example}
                    </p>
                  </div>
                </div>
              )}
            </button>

            {/* Connector arrow between layers */}
            {i < LAYERS.length - 1 && (
              <div className="flex justify-center py-0.5 text-gray-700 text-sm">↓</div>
            )}

            {/* "× N layers" bracket end */}
            {i === REPEATING_INDICES[REPEATING_INDICES.length - 1] && (
              <div className="mt-1 flex items-center gap-2">
                <div className="h-px flex-1 bg-indigo-900/40" />
                <span className="font-mono text-xs text-indigo-600">repeat</span>
                <div className="h-px flex-1 bg-indigo-900/40" />
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}

// ─── Module export ────────────────────────────────────────────────────────────

const TF_QUIZ: QuizQuestion[] = [
  {
    q: 'What key limitation of RNNs did Transformers solve?',
    options: ['Required too many GPU cores', 'Sequential processing — RNNs struggled to relate tokens far apart in a long sequence', 'Could only handle fixed-length inputs', 'Needed too much labelled data'],
    answer: 1,
    explanation: 'RNNs process tokens one by one; early-token information fades. Transformers attend to all tokens simultaneously, solving long-range dependencies.',
  },
  {
    q: 'In self-attention, each token generates three vectors. What are they?',
    options: ['Input, Hidden, Output', 'Encoder, Decoder, Memory', 'Query, Key, Value', 'Position, Weight, Gradient'],
    answer: 2,
    explanation: 'Query = "what am I looking for?", Key = "what do I contain?", Value = "what I pass if selected". Scores = Query · Key; output = weighted sum of Values.',
  },
  {
    q: 'Why do Transformers need positional encoding?',
    options: ['To make embeddings smaller', 'Self-attention is order-independent — without it, "dog bites man" and "man bites dog" look identical', 'To improve training speed', 'To handle punctuation correctly'],
    answer: 1,
    explanation: "Self-attention treats tokens as a bag. Positional encodings inject each token's position into its embedding to preserve word order.",
  },
  {
    q: 'A GPT-style "decoder-only" model uses masked attention. What does this mean?',
    options: ['It can only decode, not encode', 'Each token can only attend to previous tokens — making it naturally suited for text generation', 'It has no encoder stack', 'It cannot process sequences longer than 512 tokens'],
    answer: 1,
    explanation: 'Masked attention ensures each token only sees earlier tokens. This makes decoder-only models auto-regressive generators: predict the next token from all previous ones.',
  },
  {
    q: 'What is the main advantage of multi-head attention?',
    options: ['It is computationally cheaper', 'Each head can specialize in a different relationship (syntax, coreference, semantics) simultaneously', 'It eliminates positional encoding', 'It allows longer context windows'],
    answer: 1,
    explanation: 'Different heads learn different patterns — one may track syntax, another semantic similarity, another long-range coreference. Their outputs are concatenated for a richer representation.',
  },
]

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
          The design behind ChatGPT, Claude, Gemini, and every other modern AI chatbot.
          One key idea — looking at all words at once instead of one at a time —
          changed everything.
        </p>
      </section>

      <Section number={1} title="The Problem with Sequences">
        <p className="mb-4 text-gray-300 leading-relaxed">
          Before 2017, AI language models read sentences like someone scanning with a finger,
          covering everything except the current word. By the time they reached the end of a
          long sentence, they had mostly forgotten the beginning. Hit ▶ below to see the difference.
        </p>
        <AnimatedSequenceDiagram />
        <p className="mt-4 text-gray-300 leading-relaxed">
          In 2017, a paper called "Attention Is All You Need" introduced transformers. The
          key insight: instead of reading word by word, look at the entire sentence at once
          and immediately consider how every word relates to every other. This one change
          made modern AI chatbots possible.
        </p>
      </Section>

      <Section number={2} title="Words Live in Space">
        <p className="mb-4 text-gray-300 leading-relaxed">
          Before any processing, each word must become a list of numbers. Words with similar
          meanings end up with similar numbers — so related ideas cluster together in a mathematical
          space. Hover the words below to explore the clusters. Then toggle the analogy to see
          how vector arithmetic captures meaning.
        </p>
        <InteractiveWordScatter />
        <p className="mt-4 text-sm text-gray-500 leading-relaxed">
          In reality, words occupy a space with hundreds of dimensions — far too many to draw.
          The scatter above squishes all of that down to 2D so the clusters and relationships
          are visible.
        </p>
      </Section>

      <Section number={3} title="Inside a Transformer Block">
        <p className="mb-4 text-gray-300 leading-relaxed">
          A transformer stacks identical blocks on top of each other — 12 in GPT-2, around 96
          in GPT-4. Click any layer below to see what it does and why it matters.
        </p>
        <InteractiveTransformerBlock />
      </Section>

      <Section number={4} title="What Makes It Work">
        <div className="grid gap-4 sm:grid-cols-3">
          {[
            {
              title: 'Speed',
              icon: '⚡',
              body: 'All words are processed at the same time, not one by one. This makes training dramatically faster and lets us build much larger models.',
            },
            {
              title: 'Long-range understanding',
              icon: '🔗',
              body: "A word at the start of a long document can directly attend to a word near the end. Distance doesn't matter — every word can reach every other.",
            },
            {
              title: 'Scale',
              icon: '📈',
              body: 'The more layers, the smarter the model. Transformers keep getting better as you make them larger — no other AI design has scaled this reliably.',
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
          The two nodes that branch from here —{' '}
          <span className="text-gray-300">Tokenization</span> and{' '}
          <span className="text-gray-300">Attention</span> — each go deep on one half of
          how a transformer works. Complete this node to unlock both.
        </p>
      </Section>

      <Section number={5} title="Quiz Yourself">
        <p className="mb-4 leading-relaxed text-gray-300">Check whether attention, positional encoding, and the Transformer architecture have clicked.</p>
        <Quiz questions={TF_QUIZ} title="Transformers" />
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
