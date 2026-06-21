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

// ─── 1. Three paradigms ───────────────────────────────────────────────────────

const PARADIGMS = [
  {
    key: 'supervised',
    label: 'Supervised',
    icon: '🏷',
    color: '#818cf8',
    bg: 'bg-indigo-950/50 border-indigo-800/60',
    tagline: 'Learn from examples that already have the right answers.',
    definition:
      'You give the AI thousands of examples that include both the input and the correct answer. It figures out the pattern connecting them. Once trained, it can predict the right answer for inputs it has never seen before.',
    training: 'The AI checks its guess against the correct answer, measures how wrong it was, and adjusts. This repeats millions of times until it gets consistently accurate.',
    examples: [
      { task: 'Spam detection', input: 'Email text', output: 'Spam / Not spam' },
      { task: 'Image classification', input: 'Photo', output: 'Cat / Dog / Car…' },
      { task: 'House price prediction', input: 'Size, location, rooms', output: 'Price (number)' },
    ],
    when: 'You have lots of examples with known correct answers, and you want to predict the same thing for new inputs.',
  },
  {
    key: 'unsupervised',
    label: 'Unsupervised',
    icon: '🔍',
    color: '#34d399',
    bg: 'bg-emerald-950/40 border-emerald-900/40',
    tagline: 'Find hidden patterns without telling it what to look for.',
    definition:
      'You give the AI raw data with no labels at all — no right answers. It explores on its own and discovers groups, similarities, and structure that you might not have known were there.',
    training: 'The AI figures out its own sense of "similar" and "different." It looks for things that naturally cluster together, or tries to compress the data into a simpler form.',
    examples: [
      { task: 'Customer segmentation', input: 'Purchase history', output: 'Cluster A / B / C' },
      { task: 'Anomaly detection', input: 'Server metrics', output: 'Normal / Anomalous' },
      { task: 'Topic modelling', input: 'News articles', output: 'Latent topics' },
    ],
    when: 'You have lots of data but no labels, or you want to discover groups and patterns you didn\'t know to look for.',
  },
  {
    key: 'reinforcement',
    label: 'Reinforcement',
    icon: '🎮',
    color: '#f59e0b',
    bg: 'bg-amber-950/40 border-amber-900/40',
    tagline: 'Learn by trying things and seeing what works.',
    definition:
      'An AI agent takes actions, sees what happens, and gets points for good outcomes. Over time, it learns which actions lead to better scores. It\'s how AI learns to play games, control robots, and make sequences of decisions.',
    training: 'The AI tries random things at first, then gradually learns to do more of what earned rewards. It\'s slow — potentially needing millions of tries — but requires no pre-labelled data.',
    examples: [
      { task: 'Game playing', input: 'Game state', output: 'Action (move, jump…)' },
      { task: 'Robot control', input: 'Sensor readings', output: 'Motor commands' },
      { task: 'LLM alignment (RLHF)', input: 'Model output', output: 'Human preference score' },
    ],
    when: 'The task involves making a series of decisions, and you can simulate the environment to let the AI practice.',
  },
]

function ParadigmSwitcher() {
  const [sel, setSel] = useState<string>('supervised')
  const p = PARADIGMS.find((x) => x.key === sel)!

  return (
    <div>
      <div className="flex gap-2 mb-4">
        {PARADIGMS.map((x) => (
          <button key={x.key} onClick={() => setSel(x.key)}
            className={`flex-1 rounded-xl border py-2.5 text-xs font-semibold transition-colors ${
              sel === x.key
                ? 'text-white'
                : 'border-gray-800 bg-gray-900 text-gray-500 hover:text-gray-300'
            }`}
            style={sel === x.key ? { background: `${x.color}18`, borderColor: `${x.color}50`, color: x.color } : {}}
          >
            <span className="block text-base mb-0.5">{x.icon}</span>
            {x.label}
          </button>
        ))}
      </div>

      <div className={`rounded-xl border p-5 space-y-4 ${p.bg}`}>
        <div>
          <p className="text-base font-semibold text-white mb-1">{p.tagline}</p>
          <p className="text-sm text-gray-400 leading-relaxed">{p.definition}</p>
        </div>

        <div>
          <p className="text-[10px] font-mono font-bold tracking-widest text-gray-600 mb-2">REAL EXAMPLES</p>
          <div className="space-y-1.5">
            {p.examples.map((ex) => (
              <div key={ex.task} className="grid grid-cols-3 gap-2 text-xs">
                <span className="font-medium text-gray-300">{ex.task}</span>
                <span className="text-gray-500">← {ex.input}</span>
                <span style={{ color: p.color }}>→ {ex.output}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="border-t border-white/5 pt-3">
          <p className="text-[10px] font-mono font-bold tracking-widest text-gray-600 mb-1">HOW TRAINING WORKS</p>
          <p className="text-xs text-gray-500 leading-relaxed">{p.training}</p>
        </div>

        <div className="border-t border-white/5 pt-3">
          <p className="text-[10px] font-mono font-bold tracking-widest text-gray-600 mb-1">USE WHEN</p>
          <p className="text-xs text-gray-500">{p.when}</p>
        </div>
      </div>
    </div>
  )
}

// ─── 2. Supervised in depth — toy classifier ─────────────────────────────────

// 12 pre-placed training points, two classes
const TRAIN_POINTS = [
  { x: 0.20, y: 0.25, cls: 0 }, { x: 0.28, y: 0.40, cls: 0 },
  { x: 0.15, y: 0.50, cls: 0 }, { x: 0.35, y: 0.30, cls: 0 },
  { x: 0.22, y: 0.65, cls: 0 }, { x: 0.10, y: 0.35, cls: 0 },
  { x: 0.70, y: 0.60, cls: 1 }, { x: 0.80, y: 0.40, cls: 1 },
  { x: 0.65, y: 0.75, cls: 1 }, { x: 0.85, y: 0.70, cls: 1 },
  { x: 0.75, y: 0.30, cls: 1 }, { x: 0.60, y: 0.50, cls: 1 },
]

const CLASS_COLORS = ['#818cf8', '#34d399']
const CLASS_LABELS = ['Class A', 'Class B']

// Simple linear decision boundary: x > 0.48 → class 1
function classify(x: number): number {
  return x > 0.48 ? 1 : 0
}

const SVG_W = 360, SVG_H = 240, PAD = 24

function toSx(x: number) { return PAD + x * (SVG_W - 2 * PAD) }
function toSy(y: number) { return PAD + (1 - y) * (SVG_H - 2 * PAD) }

function SupervisedDemo() {
  const [query, setQuery] = useState<{ x: number; y: number } | null>(null)

  function handleClick(e: React.MouseEvent<SVGSVGElement>) {
    const rect = e.currentTarget.getBoundingClientRect()
    const px = (e.clientX - rect.left) / rect.width
    const py = (e.clientY - rect.top) / rect.height
    const x = (px * SVG_W - PAD) / (SVG_W - 2 * PAD)
    const y = 1 - (py * SVG_H - PAD) / (SVG_H - 2 * PAD)
    setQuery({ x: Math.max(0, Math.min(1, x)), y: Math.max(0, Math.min(1, y)) })
  }

  const pred = query ? classify(query.x) : null

  // Decision boundary x = 0.48
  const bx = toSx(0.48)

  return (
    <div className="rounded-xl border border-gray-800 bg-gray-900/40 p-5">
      <p className="text-xs text-gray-500 mb-3">
        The model learned a decision boundary from 12 labelled training points.
        Click anywhere to classify a new point.
      </p>

      <svg viewBox={`0 0 ${SVG_W} ${SVG_H}`} className="w-full cursor-crosshair rounded-lg bg-gray-900"
        onClick={handleClick}>
        {/* Background regions */}
        <rect x={PAD} y={PAD} width={bx - PAD} height={SVG_H - 2 * PAD}
          fill="#818cf8" fillOpacity={0.05} />
        <rect x={bx} y={PAD} width={SVG_W - PAD - bx} height={SVG_H - 2 * PAD}
          fill="#34d399" fillOpacity={0.05} />

        {/* Decision boundary */}
        <line x1={bx} y1={PAD} x2={bx} y2={SVG_H - PAD}
          stroke="#6b7280" strokeWidth={1} strokeDasharray="4,3" />
        <text x={bx + 4} y={PAD + 10} fill="#4b5563" fontSize={9} fontFamily="monospace">boundary</text>

        {/* Axis labels */}
        <text x={SVG_W / 2} y={SVG_H - 4} textAnchor="middle" fill="#374151" fontSize={9}>Feature 1 (e.g. word count)</text>
        <text x={8} y={SVG_H / 2} textAnchor="middle" fill="#374151" fontSize={9} transform={`rotate(-90, 8, ${SVG_H / 2})`}>Feature 2</text>

        {/* Training points */}
        {TRAIN_POINTS.map((pt, i) => (
          <circle key={i} cx={toSx(pt.x)} cy={toSy(pt.y)} r={5}
            fill={CLASS_COLORS[pt.cls]} stroke="none" fillOpacity={0.85} />
        ))}

        {/* Query point */}
        {query && (
          <>
            <circle cx={toSx(query.x)} cy={toSy(query.y)} r={8}
              fill={CLASS_COLORS[pred!]} stroke="white" strokeWidth={1.5} fillOpacity={0.9} />
            <text x={toSx(query.x) + 12} y={toSy(query.y) + 4}
              fill={CLASS_COLORS[pred!]} fontSize={10} fontFamily="monospace" fontWeight="bold">
              {CLASS_LABELS[pred!]}
            </text>
          </>
        )}

        {!query && (
          <text x={SVG_W / 2} y={SVG_H / 2 + 4} textAnchor="middle"
            fill="#374151" fontSize={11}>Click to classify a point</text>
        )}
      </svg>

      {/* Legend */}
      <div className="flex gap-4 mt-2">
        {CLASS_LABELS.map((label, i) => (
          <div key={i} className="flex items-center gap-1.5 text-xs text-gray-500">
            <div className="h-2.5 w-2.5 rounded-full" style={{ background: CLASS_COLORS[i] }} />
            {label}
          </div>
        ))}
        <span className="text-xs text-gray-700 ml-auto">training data</span>
      </div>
    </div>
  )
}

// ─── 3. Comparison table ──────────────────────────────────────────────────────

const TABLE_ROWS = [
  { aspect: 'Data needed', sup: 'Labelled — you need examples with correct answers', uns: 'Unlabelled — raw data, no answers needed', rl: 'No data upfront — AI generates its own through practice' },
  { aspect: 'Effort to prepare', sup: 'High — someone must label each example', uns: 'Low — just collect the raw data', rl: 'Medium — you must define what counts as a "reward"' },
  { aspect: 'Goal', sup: 'Predict the right answer for new inputs', uns: 'Discover groups and patterns in the data', rl: 'Learn the best sequence of actions to maximise a score' },
  { aspect: 'Output type', sup: 'A label (spam/not spam) or a number (price)', uns: 'Groups, summaries, or compressed representations', rl: 'A strategy: "in situation X, do action Y"' },
  { aspect: 'Real examples', sup: 'Spam filters, image recognition, ChatGPT fine-tuning', uns: 'Customer grouping, topic detection, anomaly alerts', rl: 'AlphaGo, robot control, AI alignment (RLHF)' },
]

function ComparisonTable() {
  return (
    <div className="rounded-xl border border-gray-800 overflow-hidden">
      <table className="w-full text-xs">
        <thead>
          <tr className="border-b border-gray-800 bg-gray-900">
            <th className="py-2 px-3 text-left text-gray-600 font-normal w-1/4"></th>
            <th className="py-2 px-3 text-left font-semibold" style={{ color: '#818cf8' }}>Supervised</th>
            <th className="py-2 px-3 text-left font-semibold" style={{ color: '#34d399' }}>Unsupervised</th>
            <th className="py-2 px-3 text-left font-semibold" style={{ color: '#f59e0b' }}>Reinforcement</th>
          </tr>
        </thead>
        <tbody>
          {TABLE_ROWS.map((row, i) => (
            <tr key={i} className={`border-b border-gray-800/60 ${i % 2 === 0 ? 'bg-gray-900/30' : ''}`}>
              <td className="py-2 px-3 text-gray-600 font-medium">{row.aspect}</td>
              <td className="py-2 px-3 text-gray-400 leading-snug">{row.sup}</td>
              <td className="py-2 px-3 text-gray-400 leading-snug">{row.uns}</td>
              <td className="py-2 px-3 text-gray-400 leading-snug">{row.rl}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

// ─── Module export ────────────────────────────────────────────────────────────

export function TypesOfML({ onComplete, completed }: ModuleProps) {
  return (
    <div className="mx-auto max-w-2xl px-6 py-12 text-white">
      <section className="mb-20 text-center">
        <div className="mb-6 inline-flex h-20 w-20 items-center justify-center rounded-2xl border border-indigo-800 bg-indigo-950/60">
          <span className="text-4xl">🧠</span>
        </div>
        <h2 className="mb-4 text-4xl font-bold tracking-tight">Types of ML</h2>
        <p className="text-lg text-gray-400 leading-relaxed">
          Not all AI learns the same way. There are three main approaches — and
          knowing which one fits your situation changes everything about what data
          you need and what results you can expect.
        </p>
      </section>

      <Section number={1} title="The Three Paradigms">
        <p className="mb-4 text-gray-300 leading-relaxed">
          Think of it like three different ways a student can learn. Click each approach
          to see how it works, what kind of examples it needs, and where it's used in
          the real world.
        </p>
        <ParadigmSwitcher />
      </Section>

      <Section number={2} title="Supervised Learning in Depth">
        <p className="mb-4 text-gray-300 leading-relaxed">
          Supervised learning is the most widely used type of AI in business today.
          The scatter plot below shows a simple example: 12 labeled training points
          (dots) and the line the AI learned to separate them. Click anywhere on
          the chart to see how the AI classifies a new point it has never seen.
        </p>
        <SupervisedDemo />
        <p className="mt-3 text-sm text-gray-500">
          This is a simplified example with just two features and a straight
          boundary. Real AI classifiers handle thousands of features at once and
          can learn curved, complex boundaries — but the core idea is the same.
        </p>
      </Section>

      <Section number={3} title="When to Use Which">
        <p className="mb-4 text-gray-300 leading-relaxed">
          Choosing the right approach from the start saves enormous amounts of time and
          effort. The key question to ask is: <span className="text-white">what information do I already have, and what do I want the AI to produce?</span>
        </p>
        <ComparisonTable />
      </Section>

      <section className="mt-4 rounded-2xl border border-indigo-900/60 bg-indigo-950/30 p-8 text-center">
        <div className="mb-2 text-2xl">{completed ? '✅' : '🎯'}</div>
        <h3 className="mb-2 text-xl font-bold">{completed ? 'Module Complete' : 'Ready to mark this done?'}</h3>
        <p className="mb-6 text-sm text-gray-400">
          {completed
            ? 'You understand the three fundamental learning paradigms.'
            : 'Mark this complete to continue to Neural Networks.'}
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
