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
    when: "You have lots of data but no labels, or you want to discover groups and patterns you didn't know to look for.",
  },
  {
    key: 'reinforcement',
    label: 'Reinforcement',
    icon: '🎮',
    color: '#f59e0b',
    bg: 'bg-amber-950/40 border-amber-900/40',
    tagline: 'Learn by trying things and seeing what works.',
    definition:
      "An AI agent takes actions, sees what happens, and gets points for good outcomes. Over time, it learns which actions lead to better scores. It's how AI learns to play games, control robots, and make sequences of decisions.",
    training:
      "The AI tries random things at first, then gradually learns to do more of what earned rewards. It's slow — potentially needing millions of tries — but requires no pre-labelled data.",
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
      <div className="mb-4 flex gap-2">
        {PARADIGMS.map((x) => (
          <button
            key={x.key}
            onClick={() => setSel(x.key)}
            className={`flex-1 rounded-xl border py-2.5 text-xs font-semibold transition-colors ${
              sel === x.key
                ? 'text-white'
                : 'border-gray-800 bg-gray-900 text-gray-500 hover:text-gray-300'
            }`}
            style={
              sel === x.key
                ? { background: `${x.color}18`, borderColor: `${x.color}50`, color: x.color }
                : {}
            }
          >
            <span className="mb-0.5 block text-base">{x.icon}</span>
            {x.label}
          </button>
        ))}
      </div>

      <div className={`rounded-xl border p-5 space-y-4 ${p.bg}`}>
        <div>
          <p className="mb-1 text-base font-semibold text-white">{p.tagline}</p>
          <p className="text-sm leading-relaxed text-gray-400">{p.definition}</p>
        </div>

        <div>
          <p className="mb-2 font-mono text-[10px] font-bold tracking-widest text-gray-600">
            REAL EXAMPLES
          </p>
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
          <p className="mb-1 font-mono text-[10px] font-bold tracking-widest text-gray-600">
            HOW TRAINING WORKS
          </p>
          <p className="text-xs leading-relaxed text-gray-500">{p.training}</p>
        </div>

        <div className="border-t border-white/5 pt-3">
          <p className="mb-1 font-mono text-[10px] font-bold tracking-widest text-gray-600">
            USE WHEN
          </p>
          <p className="text-xs text-gray-500">{p.when}</p>
        </div>
      </div>
    </div>
  )
}

// ─── 2. Supervised demo ───────────────────────────────────────────────────────

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
  const bx = toSx(0.48)

  return (
    <div className="rounded-xl border border-gray-800 bg-gray-900/40 p-5">
      <p className="mb-3 text-xs text-gray-500">
        The model learned a decision boundary from 12 labelled training points.
        Click anywhere to classify a new point.
      </p>

      <svg
        viewBox={`0 0 ${SVG_W} ${SVG_H}`}
        className="w-full cursor-crosshair rounded-lg bg-gray-900"
        onClick={handleClick}
      >
        <rect x={PAD} y={PAD} width={bx - PAD} height={SVG_H - 2 * PAD} fill="#818cf8" fillOpacity={0.05} />
        <rect x={bx} y={PAD} width={SVG_W - PAD - bx} height={SVG_H - 2 * PAD} fill="#34d399" fillOpacity={0.05} />
        <line x1={bx} y1={PAD} x2={bx} y2={SVG_H - PAD} stroke="#6b7280" strokeWidth={1} strokeDasharray="4,3" />
        <text x={bx + 4} y={PAD + 10} fill="#4b5563" fontSize={9} fontFamily="monospace">boundary</text>
        <text x={SVG_W / 2} y={SVG_H - 4} textAnchor="middle" fill="#374151" fontSize={9}>Feature 1 (e.g. word count)</text>
        <text x={8} y={SVG_H / 2} textAnchor="middle" fill="#374151" fontSize={9} transform={`rotate(-90, 8, ${SVG_H / 2})`}>Feature 2</text>
        {TRAIN_POINTS.map((pt, i) => (
          <circle key={i} cx={toSx(pt.x)} cy={toSy(pt.y)} r={5} fill={CLASS_COLORS[pt.cls]} fillOpacity={0.85} />
        ))}
        {query && (
          <>
            <circle cx={toSx(query.x)} cy={toSy(query.y)} r={8} fill={CLASS_COLORS[pred!]} stroke="white" strokeWidth={1.5} fillOpacity={0.9} />
            <text x={toSx(query.x) + 12} y={toSy(query.y) + 4} fill={CLASS_COLORS[pred!]} fontSize={10} fontFamily="monospace" fontWeight="bold">
              {CLASS_LABELS[pred!]}
            </text>
          </>
        )}
        {!query && (
          <text x={SVG_W / 2} y={SVG_H / 2 + 4} textAnchor="middle" fill="#374151" fontSize={11}>Click to classify a point</text>
        )}
      </svg>

      <div className="mt-2 flex gap-4">
        {CLASS_LABELS.map((label, i) => (
          <div key={i} className="flex items-center gap-1.5 text-xs text-gray-500">
            <div className="h-2.5 w-2.5 rounded-full" style={{ background: CLASS_COLORS[i] }} />
            {label}
          </div>
        ))}
        <span className="ml-auto text-xs text-gray-700">training data</span>
      </div>
    </div>
  )
}

// ─── 3. Unsupervised: k-means clustering demo ────────────────────────────────

const CLUSTER_POINTS = [
  { x: 0.14, y: 0.76 }, { x: 0.22, y: 0.83 }, { x: 0.18, y: 0.64 },
  { x: 0.28, y: 0.79 }, { x: 0.11, y: 0.88 }, { x: 0.25, y: 0.70 },
  { x: 0.47, y: 0.20 }, { x: 0.55, y: 0.28 }, { x: 0.41, y: 0.14 },
  { x: 0.52, y: 0.11 }, { x: 0.61, y: 0.22 }, { x: 0.44, y: 0.31 },
  { x: 0.79, y: 0.72 }, { x: 0.86, y: 0.81 }, { x: 0.82, y: 0.64 },
  { x: 0.72, y: 0.86 }, { x: 0.88, y: 0.70 }, { x: 0.75, y: 0.79 },
]

const CENTROIDS = [
  { x: 0.20, y: 0.77 },
  { x: 0.50, y: 0.21 },
  { x: 0.80, y: 0.75 },
]

const CLUSTER_COLORS = ['#818cf8', '#34d399', '#f59e0b']
const CLUSTER_LABELS = ['Segment A', 'Segment B', 'Segment C']

function nearestCluster(pt: { x: number; y: number }): number {
  let best = 0, bestDist = Infinity
  CENTROIDS.forEach((c, i) => {
    const d = (pt.x - c.x) ** 2 + (pt.y - c.y) ** 2
    if (d < bestDist) { bestDist = d; best = i }
  })
  return best
}

function UnsupervisedDemo() {
  const [clustered, setClustered] = useState(false)

  return (
    <div className="rounded-xl border border-gray-800 bg-gray-900/40 p-5">
      <p className="mb-3 text-xs text-gray-500">
        18 unlabelled data points — the AI sees no categories, no correct answers.
        Click "Find clusters" to watch it group similar points together on its own.
      </p>

      <svg viewBox={`0 0 ${SVG_W} ${SVG_H}`} className="w-full rounded-lg bg-gray-900">
        {CLUSTER_POINTS.map((pt, i) => {
          const cluster = nearestCluster(pt)
          const fill = clustered ? CLUSTER_COLORS[cluster] : '#4b5563'
          return (
            <circle
              key={i}
              cx={toSx(pt.x)} cy={toSy(pt.y)} r={5}
              fill={fill} fillOpacity={0.85}
              style={{ transition: 'fill 0.5s ease' }}
            />
          )
        })}

        {clustered && CENTROIDS.map((c, i) => (
          <g key={i}>
            <circle
              cx={toSx(c.x)} cy={toSy(c.y)} r={11}
              fill={CLUSTER_COLORS[i]} fillOpacity={0.15}
              stroke={CLUSTER_COLORS[i]} strokeWidth={1.5} strokeDasharray="3,2"
            />
            <text
              x={toSx(c.x)} y={toSy(c.y) + 4}
              textAnchor="middle" fill={CLUSTER_COLORS[i]}
              fontSize={8} fontFamily="monospace" fontWeight="bold"
            >
              C{i + 1}
            </text>
          </g>
        ))}

        {!clustered && (
          <text x={SVG_W / 2} y={SVG_H / 2 + 4} textAnchor="middle" fill="#374151" fontSize={11}>
            18 unlabelled data points
          </text>
        )}
      </svg>

      <button
        onClick={() => setClustered((v) => !v)}
        className="mt-3 w-full rounded-lg border border-gray-700 py-2 text-xs font-semibold text-gray-300 transition-colors hover:text-white"
      >
        {clustered ? '↩ Reset to unlabelled' : 'Find clusters →'}
      </button>

      {clustered && (
        <div className="mt-3 space-y-1">
          <div className="flex gap-4">
            {CLUSTER_LABELS.map((label, i) => (
              <div key={i} className="flex items-center gap-1.5 text-xs text-gray-500">
                <div className="h-2 w-2 rounded-full" style={{ background: CLUSTER_COLORS[i] }} />
                {label}
              </div>
            ))}
          </div>
          <p className="text-xs text-gray-600">
            The AI discovered 3 natural groups with no guidance. Naming them ("budget shoppers",
            "loyalists", etc.) is still up to humans.
          </p>
        </div>
      )}
    </div>
  )
}

// ─── 4. Reinforcement learning: grid-world demo ───────────────────────────────

const GRID_COLS = 6
const GRID_ROWS = 4
const RL_GOAL = { r: 3, c: 5 }
const RL_WALLS = [{ r: 1, c: 2 }, { r: 2, c: 2 }, { r: 2, c: 3 }]

const TRAINED_PATH = [
  { r: 0, c: 0 }, { r: 0, c: 1 }, { r: 0, c: 2 }, { r: 0, c: 3 },
  { r: 0, c: 4 }, { r: 0, c: 5 }, { r: 1, c: 5 }, { r: 2, c: 5 }, { r: 3, c: 5 },
]

const EXPLORE_PATH = [
  { r: 0, c: 0 }, { r: 1, c: 0 }, { r: 0, c: 0 }, { r: 0, c: 1 },
  { r: 1, c: 1 }, { r: 0, c: 1 }, { r: 0, c: 2 }, { r: 0, c: 3 },
  { r: 1, c: 3 }, { r: 1, c: 4 }, { r: 2, c: 4 }, { r: 3, c: 4 }, { r: 3, c: 5 },
]

function RLDemo() {
  const [mode, setMode] = useState<'explore' | 'trained'>('explore')
  const [step, setStep] = useState(0)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    const path = mode === 'trained' ? TRAINED_PATH : EXPLORE_PATH
    setStep(0)
    if (timerRef.current) clearInterval(timerRef.current)
    timerRef.current = setInterval(() => {
      setStep((s) => {
        if (s >= path.length - 1) {
          if (timerRef.current) clearInterval(timerRef.current)
          return s
        }
        return s + 1
      })
    }, mode === 'trained' ? 380 : 520)
    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [mode])

  const path = mode === 'trained' ? TRAINED_PATH : EXPLORE_PATH
  const agentPos = path[Math.min(step, path.length - 1)]

  return (
    <div className="rounded-xl border border-gray-800 bg-gray-900/40 p-5">
      <p className="mb-3 text-xs text-gray-500">
        An AI agent must reach the goal (⭐) while avoiding walls. Compare how it
        moves before and after thousands of training attempts.
      </p>

      <div className="mb-4 flex gap-2">
        {(['explore', 'trained'] as const).map((m) => (
          <button
            key={m}
            onClick={() => setMode(m)}
            className={`flex-1 rounded-lg border py-2 text-xs font-semibold transition-colors ${
              mode === m
                ? m === 'trained'
                  ? 'border-emerald-700 bg-emerald-950/40 text-emerald-300'
                  : 'border-amber-700 bg-amber-950/40 text-amber-300'
                : 'border-gray-800 bg-gray-900 text-gray-500 hover:text-gray-300'
            }`}
          >
            {m === 'explore' ? '🎲 Exploring (untrained)' : '✅ After training'}
          </button>
        ))}
      </div>

      <div
        className="grid gap-1 mb-3"
        style={{ gridTemplateColumns: `repeat(${GRID_COLS}, 1fr)` }}
      >
        {Array.from({ length: GRID_ROWS * GRID_COLS }).map((_, idx) => {
          const r = Math.floor(idx / GRID_COLS)
          const c = idx % GRID_COLS
          const isWall = RL_WALLS.some((w) => w.r === r && w.c === c)
          const isGoal = RL_GOAL.r === r && RL_GOAL.c === c
          const isAgent = agentPos.r === r && agentPos.c === c
          const isVisited = path.slice(0, step + 1).some((p) => p.r === r && p.c === c)

          return (
            <div
              key={idx}
              className={`flex aspect-square items-center justify-center rounded text-sm ${
                isWall
                  ? 'bg-gray-800'
                  : isAgent && isGoal
                    ? 'bg-emerald-900/60'
                    : isGoal
                      ? 'border border-emerald-800 bg-emerald-950/50'
                      : isAgent
                        ? mode === 'trained'
                          ? 'bg-indigo-900/50'
                          : 'bg-amber-900/40'
                        : isVisited
                          ? mode === 'trained'
                            ? 'bg-indigo-950/25'
                            : 'bg-amber-950/20'
                          : 'bg-gray-900'
              }`}
            >
              {isAgent && isGoal ? '🎉' : isWall ? '' : isAgent ? '🤖' : isGoal ? '⭐' : ''}
            </div>
          )
        })}
      </div>

      <p className="text-xs text-gray-600">
        {mode === 'explore'
          ? 'The agent tries random moves, slowly learning which paths earn rewards.'
          : 'After training, the agent takes the optimal route every time — no hesitation.'}
      </p>
    </div>
  )
}

// ─── 5. Comparison table ──────────────────────────────────────────────────────

const TABLE_ROWS = [
  { aspect: 'Data needed', sup: 'Labelled — examples with correct answers', uns: 'Unlabelled — raw data, no answers needed', rl: 'No data upfront — AI generates its own through practice' },
  { aspect: 'Effort to prepare', sup: 'High — someone must label each example', uns: 'Low — just collect the raw data', rl: 'Medium — you must define what counts as a "reward"' },
  { aspect: 'Goal', sup: 'Predict the right answer for new inputs', uns: 'Discover groups and patterns in the data', rl: 'Learn the best sequence of actions to maximise a score' },
  { aspect: 'Output type', sup: 'A label (spam/not spam) or a number (price)', uns: 'Groups, summaries, or compressed representations', rl: 'A strategy: "in situation X, do action Y"' },
  { aspect: 'Real examples', sup: 'Spam filters, image recognition, ChatGPT fine-tuning', uns: 'Customer grouping, topic detection, anomaly alerts', rl: 'AlphaGo, robot control, RLHF alignment' },
]

function ComparisonTable() {
  return (
    <div className="rounded-xl border border-gray-800 overflow-hidden">
      <table className="w-full text-xs">
        <thead>
          <tr className="border-b border-gray-800 bg-gray-900">
            <th className="w-1/4 px-3 py-2 text-left font-normal text-gray-600"></th>
            <th className="px-3 py-2 text-left font-semibold" style={{ color: '#818cf8' }}>Supervised</th>
            <th className="px-3 py-2 text-left font-semibold" style={{ color: '#34d399' }}>Unsupervised</th>
            <th className="px-3 py-2 text-left font-semibold" style={{ color: '#f59e0b' }}>Reinforcement</th>
          </tr>
        </thead>
        <tbody>
          {TABLE_ROWS.map((row, i) => (
            <tr key={i} className={`border-b border-gray-800/60 ${i % 2 === 0 ? 'bg-gray-900/30' : ''}`}>
              <td className="px-3 py-2 font-medium text-gray-600">{row.aspect}</td>
              <td className="px-3 py-2 leading-snug text-gray-400">{row.sup}</td>
              <td className="px-3 py-2 leading-snug text-gray-400">{row.uns}</td>
              <td className="px-3 py-2 leading-snug text-gray-400">{row.rl}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

// ─── Quiz ─────────────────────────────────────────────────────────────────────

const TYPES_QUIZ: QuizQuestion[] = [
  {
    q: 'An email app learns which messages are spam by studying thousands of emails already labelled by humans. What type of ML is this?',
    options: ['Supervised learning', 'Unsupervised learning', 'Reinforcement learning', 'Rule-based AI'],
    answer: 0,
    explanation: 'The model trains on examples that already have the correct answer (spam / not spam). That is exactly supervised learning.',
  },
  {
    q: 'A streaming service groups its users by viewing habits — without anyone pre-defining what the groups should be. What type of ML is this?',
    options: ['Supervised learning', 'Unsupervised learning', 'Reinforcement learning', 'Deep learning'],
    answer: 1,
    explanation: 'There are no labels. The algorithm discovers natural groups on its own — classic unsupervised clustering.',
  },
  {
    q: 'AlphaGo learned to play Go by playing millions of games against itself, receiving +1 for wins and -1 for losses. What type of ML is this?',
    options: ['Supervised learning', 'Transfer learning', 'Reinforcement learning', 'Unsupervised learning'],
    answer: 2,
    explanation: 'The agent learns through trial-and-error guided by reward signals — that is reinforcement learning.',
  },
  {
    q: 'You have millions of medical images but none have been reviewed by a doctor yet. Which type of ML can still find patterns in this data?',
    options: ['Supervised learning', 'Unsupervised learning', 'Reinforcement learning', 'None — you must label first'],
    answer: 1,
    explanation: 'Without labels (doctor annotations) you cannot use supervised learning. Unsupervised clustering can still discover patterns in raw images.',
  },
  {
    q: 'Which type of ML is most commonly used in everyday business applications like fraud detection and customer churn prediction?',
    options: ['Reinforcement learning', 'Unsupervised learning', 'Supervised learning', 'Generative AI'],
    answer: 2,
    explanation: 'Supervised learning dominates business AI — fraud history, churn records, and outcome labels are usually available and make prediction straightforward.',
  },
]

// ─── Module export ────────────────────────────────────────────────────────────

export function TypesOfML({ onComplete, completed }: ModuleProps) {
  return (
    <div className="mx-auto max-w-2xl px-6 py-12 text-white">
      <section className="mb-20 text-center">
        <div className="mb-6 inline-flex h-20 w-20 items-center justify-center rounded-2xl border border-indigo-800 bg-indigo-950/60">
          <span className="text-4xl">🗂️</span>
        </div>
        <h2 className="mb-4 text-4xl font-bold tracking-tight">Types of ML</h2>
        <p className="text-lg leading-relaxed text-gray-400">
          Not all AI learns the same way. There are three main approaches — and
          knowing which one fits your situation changes everything about what data
          you need and what results you can expect.
        </p>
      </section>

      <Section number={1} title="The Three Paradigms">
        <p className="mb-4 leading-relaxed text-gray-300">
          Think of it like three different ways a student can learn. Click each
          approach to see how it works, what kind of examples it needs, and where
          it's used in the real world.
        </p>
        <ParadigmSwitcher />
      </Section>

      <Section number={2} title="Supervised Learning in Depth">
        <p className="mb-4 leading-relaxed text-gray-300">
          Supervised learning is the most widely used type of AI in business today.
          The scatter plot below shows a simple example: 12 labelled training
          points and the boundary the AI learned to separate them. Click anywhere
          on the chart to classify a new unseen point.
        </p>
        <SupervisedDemo />
        <p className="mt-3 text-sm text-gray-500">
          Real classifiers handle thousands of features and can learn curved,
          complex boundaries — but the core idea is identical.
        </p>
      </Section>

      <Section number={3} title="Unsupervised Learning in Depth">
        <p className="mb-4 leading-relaxed text-gray-300">
          Unsupervised learning starts with raw data that has no labels at all.
          The algorithm looks for natural structure — things that tend to appear
          together, or points that live close to each other. The most common
          technique is <span className="text-white font-medium">clustering</span>:
          grouping data points so that similar ones end up in the same bucket.
        </p>
        <UnsupervisedDemo />
        <p className="mt-3 text-sm text-gray-500">
          Notice that the algorithm found the groups — it did not name them.
          Deciding what "Segment A" actually represents is a human job.
        </p>
      </Section>

      <Section number={4} title="Reinforcement Learning in Depth">
        <p className="mb-4 leading-relaxed text-gray-300">
          Reinforcement learning trains an <span className="text-white font-medium">agent</span> that
          takes actions and receives rewards. There are no labelled examples — only
          outcomes. At first the agent wanders randomly, but over thousands of
          attempts it gradually learns which sequences of actions lead to better
          scores.
        </p>
        <RLDemo />
        <p className="mt-3 text-sm text-gray-500">
          Real RL systems (like AlphaGo or robotic arms) need millions of practice
          runs inside a simulator before they're ready for the real world.
        </p>
      </Section>

      <Section number={5} title="When to Use Which">
        <p className="mb-4 leading-relaxed text-gray-300">
          Choosing the right approach from the start saves enormous time and
          effort. The key question is:{' '}
          <span className="text-white">
            what information do I already have, and what do I want the AI to produce?
          </span>
        </p>
        <ComparisonTable />
      </Section>

      <Section number={6} title="Quiz Yourself">
        <p className="mb-4 leading-relaxed text-gray-300">
          Check whether the three paradigms have clicked.
        </p>
        <Quiz questions={TYPES_QUIZ} title="Types of ML" />
      </Section>

      <section className="mt-4 rounded-2xl border border-indigo-900/60 bg-indigo-950/30 p-8 text-center">
        <div className="mb-2 text-2xl">{completed ? '✅' : '🎯'}</div>
        <h3 className="mb-2 text-xl font-bold">
          {completed ? 'Module Complete' : 'Ready to mark this done?'}
        </h3>
        <p className="mb-6 text-sm text-gray-400">
          {completed
            ? 'You understand the three fundamental learning paradigms.'
            : 'Mark this complete to continue to Neural Networks.'}
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
