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

// ─── 1. Why non-linearity matters ─────────────────────────────────────────────

function LinearCollapseDemo() {
  const [showNonLinear, setShowNonLinear] = useState(false)

  return (
    <div className="rounded-xl border border-gray-800 bg-gray-900/40 p-5">
      <div className="flex rounded-lg overflow-hidden border border-gray-800 w-fit mb-4">
        <button onClick={() => setShowNonLinear(false)}
          className={`px-4 py-1.5 text-xs font-medium transition-colors ${
            !showNonLinear ? 'bg-red-950/80 text-red-300' : 'text-gray-500 hover:text-gray-300'
          }`}>
          Without activation
        </button>
        <button onClick={() => setShowNonLinear(true)}
          className={`px-4 py-1.5 text-xs font-medium transition-colors ${
            showNonLinear ? 'bg-emerald-950/80 text-emerald-300' : 'text-gray-500 hover:text-gray-300'
          }`}>
          With activation
        </button>
      </div>

      <svg viewBox="0 0 440 180" className="w-full">
        {/* Layer boxes */}
        {[60, 180, 300].map((x, i) => (
          <g key={i}>
            <rect x={x - 28} y={20} width={56} height={140} rx={8}
              fill="#111827" stroke="#1f2937" strokeWidth={1} />
            <text x={x} y={14} textAnchor="middle" fill="#374151" fontSize={9} fontFamily="monospace">
              {i === 0 ? 'Layer 1' : i === 1 ? 'Layer 2' : 'Layer 3'}
            </text>
            {[40, 70, 100, 130, 160].map((y) => (
              <circle key={y} cx={x} cy={y} r={6}
                fill={showNonLinear ? '#1e1b4b' : '#111827'} stroke="#374151" strokeWidth={1} />
            ))}
          </g>
        ))}

        {/* Arrows between layers */}
        {[120, 240].map((x) => (
          <g key={x}>
            <line x1={x + 8} y1={90} x2={x + 44} y2={90} stroke="#1f2937" strokeWidth={1} />
            <polygon points={`${x + 44},86 ${x + 52},90 ${x + 44},94`} fill="#374151" />
          </g>
        ))}

        {/* Activation symbols */}
        {showNonLinear && [120, 240].map((x) => (
          <g key={x}>
            <rect x={x + 8} y={76} width={36} height={28} rx={4}
              fill="#312e81" stroke="#818cf8" strokeWidth={1} />
            <text x={x + 26} y={94} textAnchor="middle" fill="#818cf8" fontSize={9} fontFamily="monospace">σ</text>
          </g>
        ))}

        {/* Result label */}
        <text x={220} y={175} textAnchor="middle" fontSize={10}
          fill={showNonLinear ? '#34d399' : '#f87171'}>
          {showNonLinear
            ? '✓ Layers express different features — can learn complex patterns'
            : '✗ 3 linear layers = 1 linear layer — no expressive power gained'}
        </text>
      </svg>

      <p className="mt-2 text-xs text-gray-500 leading-relaxed">
        {showNonLinear
          ? 'The non-linear activation (σ) between layers breaks the mathematical equivalence. Now each layer can represent a genuinely different transformation.'
          : 'Stacking linear layers (y = Wx + b) is algebraically equivalent to a single linear layer. Depth only helps with non-linearities between layers.'}
      </p>
    </div>
  )
}

// ─── 2. Function gallery ──────────────────────────────────────────────────────

type FnKey = 'relu' | 'sigmoid' | 'tanh' | 'gelu'

interface FnDef {
  label: string
  color: string
  formula: string
  f: (x: number) => number
  df: (x: number) => number
  pros: string[]
  cons: string[]
}

function geluApprox(x: number): number {
  return 0.5 * x * (1 + Math.tanh(Math.sqrt(2 / Math.PI) * (x + 0.044715 * x ** 3)))
}
function dGeluApprox(x: number): number {
  const dx = 0.001
  return (geluApprox(x + dx) - geluApprox(x - dx)) / (2 * dx)
}

const FUNCTIONS: Record<FnKey, FnDef> = {
  relu: {
    label: 'ReLU',
    color: '#818cf8',
    formula: 'f(x) = max(0, x)',
    f: (x) => Math.max(0, x),
    df: (x) => (x > 0 ? 1 : 0),
    pros: ['Very fast to compute', 'Keeps learning signals strong for positive values'],
    cons: ['Neurons can get "stuck at zero" and stop learning if their inputs stay negative', 'Has a sharp corner at x = 0 (technically not smooth there)'],
  },
  sigmoid: {
    label: 'Sigmoid',
    color: '#f59e0b',
    formula: 'f(x) = 1 / (1 + e⁻ˣ)',
    f: (x) => 1 / (1 + Math.exp(-x)),
    df: (x) => { const s = 1 / (1 + Math.exp(-x)); return s * (1 - s) },
    pros: ['Output is always between 0 and 1 — easy to interpret as a probability', 'Smooth and gentle curve'],
    cons: ['Becomes almost completely flat for large or small inputs, so learning stalls in deep networks', 'Tends to push outputs toward positive values, which can slow training'],
  },
  tanh: {
    label: 'Tanh',
    color: '#34d399',
    formula: 'f(x) = (eˣ − e⁻ˣ) / (eˣ + e⁻ˣ)',
    f: Math.tanh,
    df: (x) => 1 - Math.tanh(x) ** 2,
    pros: ['Output centres around zero, which trains more efficiently than Sigmoid', 'Has stronger learning signals near the centre'],
    cons: ['Still becomes flat for very large or very small inputs', 'Slightly slower to compute than ReLU'],
  },
  gelu: {
    label: 'GeLU',
    color: '#a78bfa',
    formula: 'f(x) ≈ 0.5x · (1 + tanh(√(2/π) · (x + 0.044715x³)))',
    f: geluApprox,
    df: dGeluApprox,
    pros: ['Gives small negative values some weight instead of zeroing them out — keeps more neurons active', 'Used in today\'s most powerful AI (GPT-2, BERT, GPT-4)'],
    cons: ['More expensive to compute than ReLU', 'The exact formula is complex (needs an approximation in practice)'],
  },
}

const PLOT_W = 340, PLOT_H = 160, P = 24
const X_MIN = -4, X_MAX = 4, Y_MIN = -1.1, Y_MAX = 1.1
const STEPS = 200

function toPlotX(x: number) { return P + ((x - X_MIN) / (X_MAX - X_MIN)) * (PLOT_W - 2 * P) }
function toPlotY(y: number) { return P + ((Y_MAX - y) / (Y_MAX - Y_MIN)) * (PLOT_H - 2 * P) }
function clampY(y: number) { return Math.max(Y_MIN, Math.min(Y_MAX, y)) }

function buildPath(fn: (x: number) => number): string {
  const pts = Array.from({ length: STEPS + 1 }, (_, i) => {
    const x = X_MIN + (i / STEPS) * (X_MAX - X_MIN)
    return [toPlotX(x), toPlotY(clampY(fn(x)))]
  })
  return pts.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p[0].toFixed(1)} ${p[1].toFixed(1)}`).join(' ')
}

function FunctionGallery() {
  const [sel, setSel] = useState<FnKey>('relu')
  const [sliderX, setSliderX] = useState(1)
  const fn = FUNCTIONS[sel]

  const fVal = fn.f(sliderX)
  const dfVal = fn.df(sliderX)
  const fPath = buildPath(fn.f)
  const dfPath = buildPath(fn.df)
  const dotX = toPlotX(sliderX)
  const dotY = toPlotY(clampY(fVal))

  return (
    <div className="rounded-xl border border-gray-800 bg-gray-900/40 overflow-hidden">
      {/* Tabs */}
      <div className="flex border-b border-gray-800">
        {(Object.keys(FUNCTIONS) as FnKey[]).map((k) => (
          <button key={k} onClick={() => setSel(k)}
            className={`flex-1 py-2.5 text-xs font-semibold transition-colors ${
              sel === k ? 'text-white bg-gray-800' : 'text-gray-500 hover:text-gray-300'
            }`}
            style={sel === k ? { color: FUNCTIONS[k].color } : {}}>
            {FUNCTIONS[k].label}
          </button>
        ))}
      </div>

      <div className="p-5">
        {/* Formula */}
        <p className="font-mono text-xs mb-3 text-center" style={{ color: fn.color }}>{fn.formula}</p>

        {/* Plot */}
        <svg viewBox={`0 0 ${PLOT_W} ${PLOT_H}`} className="w-full mb-3">
          {/* Axes */}
          <line x1={P} y1={toPlotY(0)} x2={PLOT_W - P} y2={toPlotY(0)} stroke="#1f2937" strokeWidth={1} />
          <line x1={toPlotX(0)} y1={P} x2={toPlotX(0)} y2={PLOT_H - P} stroke="#1f2937" strokeWidth={1} />
          {/* Axis ticks */}
          {[-3, -2, -1, 0, 1, 2, 3].map((v) => (
            <text key={v} x={toPlotX(v)} y={toPlotY(0) + 12} textAnchor="middle" fill="#374151" fontSize={8}>{v}</text>
          ))}
          {/* Gradient curve (dashed) */}
          <path d={dfPath} stroke={fn.color} strokeWidth={1.2} fill="none" strokeOpacity={0.35} strokeDasharray="3,2" />
          {/* Function curve */}
          <path d={fPath} stroke={fn.color} strokeWidth={2} fill="none" />
          {/* Slider dot */}
          <circle cx={dotX} cy={dotY} r={5} fill={fn.color} stroke="white" strokeWidth={1.5} />
          {/* Legend */}
          <line x1={PLOT_W - 80} y1={12} x2={PLOT_W - 60} y2={12} stroke={fn.color} strokeWidth={2} />
          <text x={PLOT_W - 56} y={16} fill={fn.color} fontSize={8}>f(x)</text>
          <line x1={PLOT_W - 80} y1={24} x2={PLOT_W - 60} y2={24} stroke={fn.color} strokeWidth={1.2} strokeOpacity={0.4} strokeDasharray="3,2" />
          <text x={PLOT_W - 56} y={28} fill={fn.color} fontSize={8} opacity={0.5}>f′(x)</text>
        </svg>

        {/* Slider */}
        <div className="flex items-center gap-3 mb-4">
          <span className="text-xs text-gray-600 font-mono w-8">x=</span>
          <input type="range" min={-4} max={4} step={0.1} value={sliderX}
            onChange={(e) => setSliderX(+e.target.value)}
            className="flex-1 accent-indigo-500" />
          <div className="text-xs font-mono text-right w-32 shrink-0 space-y-0.5">
            <div><span className="text-gray-600">x = </span><span style={{ color: fn.color }}>{sliderX.toFixed(2)}</span></div>
            <div><span className="text-gray-600">f(x) = </span><span className="text-white">{fVal.toFixed(3)}</span></div>
            <div><span className="text-gray-600">f′(x) = </span><span className="text-gray-400">{dfVal.toFixed(3)}</span></div>
          </div>
        </div>

        {/* Pros / Cons */}
        <div className="grid grid-cols-2 gap-3 text-xs">
          <div>
            <p className="text-emerald-500 font-semibold mb-1">Pros</p>
            {fn.pros.map((p) => <p key={p} className="text-gray-500 mb-0.5">✓ {p}</p>)}
          </div>
          <div>
            <p className="text-red-500 font-semibold mb-1">Cons</p>
            {fn.cons.map((c) => <p key={c} className="text-gray-500 mb-0.5">✗ {c}</p>)}
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── 3. Modern activations ────────────────────────────────────────────────────

const MODERN = [
  {
    name: 'GeLU',
    used: 'GPT-2, BERT, GPT-3, GPT-4',
    color: '#a78bfa',
    snippet: `import torch.nn.functional as F

# Exact GeLU
x = F.gelu(x)

# Approximate (faster, used in GPT-2)
x = 0.5 * x * (1 + torch.tanh(
    math.sqrt(2/math.pi) * (x + 0.044715 * x**3)
))`,
    why: 'GeLU gives negative inputs a small "partial credit" instead of cutting them to zero completely. This means more parts of the network stay active and learning. It consistently outperforms ReLU on transformer models, which is why OpenAI switched to it for GPT-2.',
  },
  {
    name: 'SiLU / Swish',
    used: 'LLaMA, PaLM, Mistral',
    color: '#f472b6',
    snippet: `import torch.nn.functional as F

# SiLU (equivalent to Swish with β=1)
x = F.silu(x)        # x * sigmoid(x)

# Or manually:
x = x * torch.sigmoid(x)`,
    why: 'SiLU uses the value itself to decide how much of it passes through — larger positive values pass almost completely, while small or negative values are softly reduced. Meta switched LLaMA to SiLU and got better accuracy at no extra cost.',
  },
]

function ModernActivations() {
  const [sel, setSel] = useState(0)
  const m = MODERN[sel]

  return (
    <div className="rounded-xl border border-gray-800 bg-gray-900/40 overflow-hidden">
      <div className="flex border-b border-gray-800">
        {MODERN.map((x, i) => (
          <button key={i} onClick={() => setSel(i)}
            className={`flex-1 py-2.5 text-xs font-semibold transition-colors ${
              sel === i ? 'bg-gray-800' : 'text-gray-500 hover:text-gray-300'
            }`}
            style={sel === i ? { color: x.color } : {}}>
            {x.name}
          </button>
        ))}
      </div>
      <div className="p-5 space-y-4">
        <div className="flex items-center gap-2">
          <p className="text-xs text-gray-600">Used in:</p>
          <p className="text-xs font-mono" style={{ color: m.color }}>{m.used}</p>
        </div>
        <pre className="text-xs font-mono text-gray-300 bg-gray-900 rounded-lg p-3 leading-relaxed overflow-x-auto">{m.snippet}</pre>
        <div className="rounded-lg border border-gray-800 p-3">
          <p className="text-xs text-gray-500 leading-relaxed">{m.why}</p>
        </div>
      </div>
    </div>
  )
}

// ─── Module export ────────────────────────────────────────────────────────────

export function Activations({ onComplete, completed }: ModuleProps) {
  return (
    <div className="mx-auto max-w-2xl px-6 py-12 text-white">
      <section className="mb-20 text-center">
        <div className="mb-6 inline-flex h-20 w-20 items-center justify-center rounded-2xl border border-indigo-800 bg-indigo-950/60">
          <span className="text-4xl">⚡</span>
        </div>
        <h2 className="mb-4 text-4xl font-bold tracking-tight">Activations</h2>
        <p className="text-lg text-gray-400 leading-relaxed">
          There's one small ingredient in every neural network that makes deep
          learning possible. Without it, no matter how many layers you add, the
          AI can only learn straight-line patterns. That ingredient is the
          activation function.
        </p>
      </section>

      <Section number={1} title="Why Non-Linearity is Essential">
        <p className="mb-4 text-gray-300 leading-relaxed">
          Imagine folding a piece of paper. One fold makes a straight crease. But fold
          it multiple times at different angles and you can make almost any shape. Activation
          functions are like those folds. They let each layer bend what the previous layer
          learned in a new direction. Without them, adding more layers is pointless —
          mathematically, the whole stack collapses into one flat step and can only learn
          the simplest relationships. Toggle between the two views below to see the difference.
        </p>
        <LinearCollapseDemo />
      </Section>

      <Section number={2} title="Function Gallery">
        <p className="mb-4 text-gray-300 leading-relaxed">
          Each activation function has a different curve. The solid line is the
          function itself. The dashed line shows how steep that curve is at each point —
          when it's nearly flat (close to zero), the network struggles to learn in that
          region, because there's no clear signal to guide its adjustments. Drag the
          slider to see how each function responds to different inputs.
        </p>
        <FunctionGallery />
      </Section>

      <Section number={3} title="Modern Activations">
        <p className="mb-4 text-gray-300 leading-relaxed">
          The AI models powering today's chatbots — GPT-4, LLaMA, BERT — use
          newer activation functions that outperform ReLU. Both GeLU and SiLU
          allow small negative values to pass through instead of cutting them to
          zero, which keeps more of the network actively learning at once.
        </p>
        <ModernActivations />
        <p className="mt-3 text-sm text-gray-500">
          Which activation works best is discovered through experimentation rather
          than pure theory. GeLU became the go-to for models that process entire
          sentences at once (BERT family). SiLU works better for models that
          generate text one word at a time (LLaMA family). Researchers are still
          studying exactly why.
        </p>
      </Section>

      <section className="mt-4 rounded-2xl border border-indigo-900/60 bg-indigo-950/30 p-8 text-center">
        <div className="mb-2 text-2xl">{completed ? '✅' : '🎯'}</div>
        <h3 className="mb-2 text-xl font-bold">{completed ? 'Module Complete' : 'Ready to mark this done?'}</h3>
        <p className="mb-6 text-sm text-gray-400">
          {completed
            ? 'You understand how non-linearity enables deep networks to learn.'
            : 'Mark this complete to continue.'}
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
