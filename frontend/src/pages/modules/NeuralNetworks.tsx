import { Fragment, useState, type ReactNode } from 'react'

type ModuleProps = { onComplete: () => Promise<void>; completed: boolean }

// ─── Math ─────────────────────────────────────────────────────────────────────

const sigmoid = (z: number) => 1 / (1 + Math.exp(-z))
const relu = (z: number) => Math.max(0, z)
const tanh = (z: number) => Math.tanh(z)

// ─── Layout helpers ───────────────────────────────────────────────────────────

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

// ─── 1. Neuron diagram ────────────────────────────────────────────────────────

function NeuronDiagram() {
  return (
    <svg viewBox="0 0 480 200" className="mx-auto w-full max-w-lg" aria-label="Single neuron diagram">
      {/* Input nodes */}
      {([70, 130] as const).map((cy, i) => (
        <Fragment key={cy}>
          <circle cx={70} cy={cy} r={24} fill="#0d0d1f" stroke="#6366f1" strokeWidth={2} />
          <text x={70} y={cy} textAnchor="middle" dominantBaseline="central" fill="#a5b4fc" fontSize={13} fontFamily="monospace">
            x{i + 1}
          </text>
          <line x1={94} y1={cy} x2={200} y2={100} stroke="#374151" strokeWidth={1.5} />
          <text x={152} y={cy < 100 ? cy + 22 : cy - 10} textAnchor="middle" fill="#4b5563" fontSize={11} fontFamily="monospace">
            w{i + 1}
          </text>
        </Fragment>
      ))}
      {/* Bias arrow from below */}
      <line x1={200} y1={185} x2={215} y2={125} stroke="#374151" strokeWidth={1.5} strokeDasharray="4,3" />
      <text x={185} y={193} fill="#4b5563" fontSize={11} fontFamily="monospace">b</text>
      {/* Sum node */}
      <circle cx={230} cy={100} r={30} fill="#1e1b4b" stroke="#818cf8" strokeWidth={2} />
      <text x={230} y={100} textAnchor="middle" dominantBaseline="central" fill="#a5b4fc" fontSize={20} fontWeight="bold">Σ</text>
      {/* Arrow to activation */}
      <line x1={260} y1={100} x2={315} y2={100} stroke="#374151" strokeWidth={1.5} />
      <text x={288} y={92} textAnchor="middle" fill="#4b5563" fontSize={10}>z</text>
      {/* Activation box */}
      <rect x={315} y={72} width={64} height={56} rx={8} fill="#1e1b4b" stroke="#818cf8" strokeWidth={2} />
      <text x={347} y={98} textAnchor="middle" fill="#a5b4fc" fontSize={12} fontFamily="monospace">σ(z)</text>
      <text x={347} y={114} textAnchor="middle" fill="#6b7280" fontSize={10}>activate</text>
      {/* Arrow to output */}
      <line x1={379} y1={100} x2={430} y2={100} stroke="#374151" strokeWidth={1.5} />
      {/* Output node */}
      <circle cx={452} cy={100} r={24} fill="#0d0d1f" stroke="#6366f1" strokeWidth={2} />
      <text x={452} y={100} textAnchor="middle" dominantBaseline="central" fill="#a5b4fc" fontSize={11}>out</text>
    </svg>
  )
}

// ─── 2. Perceptron ────────────────────────────────────────────────────────────

function Slider({
  label, value, min, max, set,
}: { label: string; value: number; min: number; max: number; set: (v: number) => void }) {
  return (
    <div className="flex items-center gap-3">
      <span className="w-20 shrink-0 text-xs text-gray-400 font-mono">{label}</span>
      <input
        type="range" min={min} max={max} step={0.01} value={value}
        onChange={(e) => set(parseFloat(e.target.value))}
        className="flex-1 accent-indigo-500"
      />
      <span className="w-14 text-right text-sm font-mono text-indigo-300">{value.toFixed(2)}</span>
    </div>
  )
}

function Perceptron() {
  const [x1, setX1] = useState(0.8)
  const [x2, setX2] = useState(0.5)
  const [w1, setW1] = useState(0.6)
  const [w2, setW2] = useState(0.4)
  const [b, setB] = useState(-0.3)

  const z = w1 * x1 + w2 * x2 + b
  const out = sigmoid(z)
  const fires = out >= 0.5

  return (
    <div className="rounded-xl border border-gray-800 bg-gray-900/40 p-6">
      <div className="space-y-3 mb-6">
        <Slider label="Input x₁" value={x1} min={-1} max={1} set={setX1} />
        <Slider label="Input x₂" value={x2} min={-1} max={1} set={setX2} />
        <div className="my-2 border-t border-gray-800" />
        <Slider label="Weight w₁" value={w1} min={-2} max={2} set={setW1} />
        <Slider label="Weight w₂" value={w2} min={-2} max={2} set={setW2} />
        <Slider label="Bias b" value={b} min={-2} max={2} set={setB} />
      </div>
      <div className="grid grid-cols-3 gap-3 text-center">
        <div className="rounded-lg bg-gray-800/60 px-3 py-3">
          <p className="text-xs text-gray-500 mb-1 font-mono leading-tight">
            w₁x₁ + w₂x₂ + b
          </p>
          <p className="text-lg font-bold font-mono text-white">{z.toFixed(3)}</p>
          <p className="text-xs text-gray-600 mt-0.5">weighted sum</p>
        </div>
        <div className="rounded-lg bg-gray-800/60 px-3 py-3">
          <p className="text-xs text-gray-500 mb-1 font-mono">σ(z)</p>
          <p className="text-lg font-bold font-mono text-indigo-300">{out.toFixed(3)}</p>
          <p className="text-xs text-gray-600 mt-0.5">after sigmoid</p>
        </div>
        <div
          className={`rounded-lg px-3 py-3 transition-colors ${
            fires ? 'bg-indigo-900/50 border border-indigo-700/60' : 'bg-gray-800/60'
          }`}
        >
          <p className="text-xs text-gray-500 mb-1">decision</p>
          <p className={`text-lg font-bold ${fires ? 'text-indigo-300' : 'text-gray-500'}`}>
            {fires ? '1' : '0'}
          </p>
          <p className="text-xs text-gray-600 mt-0.5">{fires ? 'fires' : 'silent'}</p>
        </div>
      </div>
    </div>
  )
}

// ─── 3. Forward pass animation ────────────────────────────────────────────────

// Fixed weights for the demo — not interactive (the perceptron handles that)
const FP = {
  x: [0.6, 0.9],
  wh: [[0.8, -0.4], [0.5, 0.9]],
  bh: [0.1, -0.2],
  wo: [0.7, -0.6],
  bo: 0.15,
}

function calcForward() {
  const hz = FP.wh.map((row, i) => row[0] * FP.x[0] + row[1] * FP.x[1] + FP.bh[i])
  const h = hz.map(sigmoid)
  const oz = FP.wo[0] * h[0] + FP.wo[1] * h[1] + FP.bo
  return { h, out: sigmoid(oz) }
}

const { h: FP_H, out: FP_OUT } = calcForward()

function ForwardPass() {
  const [step, setStep] = useState(0) // 0=idle 1=inputs 2=hidden 3=output

  function run() {
    setStep(1)
    setTimeout(() => setStep(2), 520)
    setTimeout(() => setStep(3), 1040)
  }

  const inputActive  = step >= 1
  const hiddenActive = step >= 2
  const outputActive = step >= 3

  const nodeStyle = (active: boolean) => ({
    fill:   active ? '#312e81' : '#111827',
    stroke: active ? '#818cf8' : '#374151',
    transition: 'fill 0.35s, stroke 0.35s',
  })
  const lineStyle = (active: boolean) => ({
    stroke: active ? '#6366f1' : '#1f2937',
    strokeWidth: active ? 2 : 1,
    transition: 'stroke 0.35s',
  })

  // Node positions
  const IN  = [{ cx: 80, cy: 70 }, { cx: 80, cy: 130 }]
  const HID = [{ cx: 220, cy: 70 }, { cx: 220, cy: 130 }]
  const OUT = { cx: 360, cy: 100 }
  const R = 25

  return (
    <div className="rounded-xl border border-gray-800 bg-gray-900/40 p-6">
      <svg viewBox="0 0 440 200" className="w-full mb-4">
        {/* input → hidden edges */}
        {IN.flatMap((src) =>
          HID.map((dst) => (
            <line key={`${src.cy}-${dst.cy}`}
              x1={src.cx + R} y1={src.cy} x2={dst.cx - R} y2={dst.cy}
              style={lineStyle(hiddenActive)}
            />
          ))
        )}
        {/* hidden → output edges */}
        {HID.map((src) => (
          <line key={src.cy}
            x1={src.cx + R} y1={src.cy} x2={OUT.cx - R} y2={OUT.cy}
            style={lineStyle(outputActive)}
          />
        ))}

        {/* Input nodes */}
        {IN.map(({ cx, cy }, i) => (
          <g key={cy}>
            <circle cx={cx} cy={cy} r={R} style={nodeStyle(inputActive)} strokeWidth={2} />
            <text x={cx} y={cy} textAnchor="middle" dominantBaseline="central"
              fill={inputActive ? '#c7d2fe' : '#4b5563'} fontSize={12} fontFamily="monospace"
              style={{ transition: 'fill 0.35s' }}>
              {FP.x[i].toFixed(1)}
            </text>
          </g>
        ))}

        {/* Hidden nodes */}
        {HID.map(({ cx, cy }, i) => (
          <g key={cy}>
            <circle cx={cx} cy={cy} r={R} style={nodeStyle(hiddenActive)} strokeWidth={2} />
            <text x={cx} y={cy} textAnchor="middle" dominantBaseline="central"
              fill={hiddenActive ? '#c7d2fe' : '#4b5563'} fontSize={11} fontFamily="monospace"
              style={{ transition: 'fill 0.35s' }}>
              {hiddenActive ? FP_H[i].toFixed(2) : '?'}
            </text>
          </g>
        ))}

        {/* Output node */}
        <circle cx={OUT.cx} cy={OUT.cy} r={R} style={nodeStyle(outputActive)} strokeWidth={2} />
        <text x={OUT.cx} y={OUT.cy} textAnchor="middle" dominantBaseline="central"
          fill={outputActive ? '#c7d2fe' : '#4b5563'} fontSize={11} fontFamily="monospace"
          style={{ transition: 'fill 0.35s' }}>
          {outputActive ? FP_OUT.toFixed(2) : '?'}
        </text>

        {/* Layer labels */}
        {[{ x: 80, label: 'Input' }, { x: 220, label: 'Hidden' }, { x: 360, label: 'Output' }].map(({ x, label }) => (
          <text key={label} x={x} y={185} textAnchor="middle" fill="#4b5563" fontSize={10}>{label}</text>
        ))}
      </svg>

      <div className="flex items-center gap-3">
        <button
          onClick={run}
          disabled={step > 0 && step < 3}
          className="px-4 py-2 rounded-lg bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-500 disabled:opacity-40 transition-colors"
        >
          Run forward pass →
        </button>
        {step === 3 && (
          <button
            onClick={() => setStep(0)}
            className="px-3 py-2 rounded-lg bg-gray-800 text-gray-400 text-sm hover:text-white transition-colors"
          >
            Reset
          </button>
        )}
      </div>
    </div>
  )
}

// ─── 4. Activation functions ──────────────────────────────────────────────────

type ActKey = 'sigmoid' | 'relu' | 'tanh'

const ACT: Record<ActKey, { fn: (z: number) => number; label: string; formula: string; color: string; yMin: number; yMax: number }> = {
  sigmoid: { fn: sigmoid, label: 'Sigmoid', formula: 'σ(z) = 1 / (1 + e⁻ᶻ)', color: '#818cf8', yMin: -0.1, yMax: 1.1 },
  relu:    { fn: relu,    label: 'ReLU',    formula: 'max(0, z)',              color: '#34d399', yMin: -0.1, yMax: 4.1 },
  tanh:    { fn: tanh,    label: 'Tanh',    formula: '(eᶻ − e⁻ᶻ) / (eᶻ + e⁻ᶻ)', color: '#f472b6', yMin: -1.1, yMax: 1.1 },
}

const SVG_W = 400, SVG_H = 180, PAD = 36
const X_MIN = -4, X_MAX = 4

function toSvgX(x: number) { return PAD + ((x - X_MIN) / (X_MAX - X_MIN)) * (SVG_W - 2 * PAD) }
function toSvgY(y: number, yMin: number, yMax: number) {
  return PAD + (1 - (y - yMin) / (yMax - yMin)) * (SVG_H - 2 * PAD)
}

function ActivationChart() {
  const [active, setActive] = useState<ActKey>('sigmoid')
  const [z, setZ] = useState(0)

  const { fn, formula, color, yMin, yMax } = ACT[active]

  const pts = Array.from({ length: 81 }, (_, i) => {
    const x = X_MIN + (i / 80) * (X_MAX - X_MIN)
    const y = Math.max(yMin, Math.min(yMax, fn(x)))
    return `${toSvgX(x)},${toSvgY(y, yMin, yMax)}`
  }).join(' ')

  const dotX = toSvgX(z)
  const rawY = fn(z)
  const clampedY = Math.max(yMin, Math.min(yMax, rawY))
  const dotY = toSvgY(clampedY, yMin, yMax)

  return (
    <div className="rounded-xl border border-gray-800 bg-gray-900/40 p-6">
      <div className="flex gap-2 mb-3">
        {(Object.keys(ACT) as ActKey[]).map((k) => (
          <button
            key={k}
            onClick={() => setActive(k)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              active === k ? 'bg-indigo-600 text-white' : 'bg-gray-800 text-gray-400 hover:text-white'
            }`}
          >
            {ACT[k].label}
          </button>
        ))}
      </div>
      <p className="text-xs text-gray-500 font-mono mb-3">{formula}</p>

      <svg viewBox={`0 0 ${SVG_W} ${SVG_H}`} className="w-full">
        {/* Axes */}
        <line x1={PAD} y1={PAD} x2={PAD} y2={SVG_H - PAD} stroke="#374151" strokeWidth={1} />
        <line x1={PAD} y1={SVG_H - PAD} x2={SVG_W - PAD} y2={SVG_H - PAD} stroke="#374151" strokeWidth={1} />
        {/* Zero line */}
        {yMin < 0 && (
          <line x1={PAD} y1={toSvgY(0, yMin, yMax)} x2={SVG_W - PAD} y2={toSvgY(0, yMin, yMax)}
            stroke="#1f2937" strokeWidth={1} strokeDasharray="4,4" />
        )}
        {/* Curve */}
        <polyline points={pts} fill="none" stroke={color} strokeWidth={2.5} />
        {/* Vertical guide */}
        <line x1={dotX} y1={PAD} x2={dotX} y2={SVG_H - PAD} stroke={color} strokeWidth={1} strokeOpacity={0.25} />
        {/* Dot */}
        <circle cx={dotX} cy={dotY} r={5} fill={color} />
        {/* Output label */}
        <text x={dotX + 8} y={dotY - 6} fill={color} fontSize={12} fontFamily="monospace">
          {rawY.toFixed(3)}
        </text>
        {/* Axis labels */}
        <text x={PAD + 3} y={PAD - 4} fill="#4b5563" fontSize={10}>y</text>
        <text x={SVG_W - PAD + 4} y={SVG_H - PAD + 4} fill="#4b5563" fontSize={10} dominantBaseline="hanging">z</text>
      </svg>

      <div className="flex items-center gap-3 mt-2">
        <span className="text-sm text-gray-400 font-mono shrink-0">z =</span>
        <input
          type="range" min={X_MIN} max={X_MAX} step={0.05} value={z}
          onChange={(e) => setZ(parseFloat(e.target.value))}
          className="flex-1"
          style={{ accentColor: color }}
        />
        <span className="w-10 text-right text-sm font-mono" style={{ color }}>{z.toFixed(2)}</span>
      </div>
    </div>
  )
}

// ─── 5. XOR demo ─────────────────────────────────────────────────────────────

const XOR_DATA = [
  { x: [0, 0], y: 0 },
  { x: [0, 1], y: 1 },
  { x: [1, 0], y: 1 },
  { x: [1, 1], y: 0 },
]

interface Net { w1: number[][]; b1: number[]; w2: number[]; b2: number }

function initNet(): Net {
  const r = () => (Math.random() - 0.5) * 0.8
  return { w1: [[r(), r()], [r(), r()]], b1: [r(), r()], w2: [r(), r()], b2: r() }
}

function forward(net: Net, x: number[]) {
  const h = net.w1.map((row, i) => sigmoid(row[0] * x[0] + row[1] * x[1] + net.b1[i]))
  const out = sigmoid(net.w2[0] * h[0] + net.w2[1] * h[1] + net.b2)
  return { h, out }
}

function trainXOR(epochs = 3000) {
  const net = initNet()
  const lr = 2.5
  const losses: number[] = []

  for (let e = 0; e < epochs; e++) {
    let loss = 0
    for (const { x, y } of XOR_DATA) {
      const { h, out } = forward(net, x)
      loss += 0.5 * (y - out) ** 2
      const dOut = (out - y) * out * (1 - out)
      const dH = net.w2.map((w, i) => dOut * w * h[i] * (1 - h[i]))
      net.w2[0] -= lr * dOut * h[0]
      net.w2[1] -= lr * dOut * h[1]
      net.b2 -= lr * dOut
      net.w1.forEach((row, i) => {
        row[0] -= lr * dH[i] * x[0]
        row[1] -= lr * dH[i] * x[1]
        net.b1[i] -= lr * dH[i]
      })
    }
    if (e % 30 === 0) losses.push(loss / XOR_DATA.length)
  }
  return { net, losses }
}

function LossChart({ losses }: { losses: number[] }) {
  const W = 400, H = 120, px = 36, py = 16
  const maxL = Math.max(...losses, 0.001)
  const pts = losses.map((l, i) => {
    const x = px + (i / (losses.length - 1)) * (W - 2 * px)
    const y = py + (1 - l / maxL) * (H - 2 * py)
    return `${x},${y}`
  }).join(' ')

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full mt-4">
      <line x1={px} y1={py} x2={px} y2={H - py} stroke="#374151" strokeWidth={1} />
      <line x1={px} y1={H - py} x2={W - px} y2={H - py} stroke="#374151" strokeWidth={1} />
      <polyline points={pts} fill="none" stroke="#818cf8" strokeWidth={2} />
      <text x={px + 3} y={py + 8} fill="#4b5563" fontSize={10} fontFamily="monospace">{maxL.toFixed(3)}</text>
      <text x={px + 3} y={H - py - 3} fill="#4b5563" fontSize={10} fontFamily="monospace">0</text>
      <text x={px} y={py - 3} fill="#4b5563" fontSize={10}>Loss</text>
      <text x={W - px} y={H - py + 12} fill="#4b5563" fontSize={10} textAnchor="end">→ epochs</text>
    </svg>
  )
}

function XORDemo() {
  const [phase, setPhase] = useState<'idle' | 'training' | 'done'>('idle')
  const [losses, setLosses] = useState<number[]>([])
  const [preds, setPreds] = useState<number[]>([])

  function train() {
    setPhase('training')
    setTimeout(() => {
      const { net, losses } = trainXOR()
      setPreds(XOR_DATA.map(({ x }) => forward(net, x).out))
      setLosses(losses)
      setPhase('done')
    }, 40)
  }

  function reset() {
    setPhase('idle')
    setLosses([])
    setPreds([])
  }

  return (
    <div className="rounded-xl border border-gray-800 bg-gray-900/40 p-6">
      <p className="text-sm text-gray-400 mb-4">
        XOR is not linearly separable — a single neuron can never solve it. A 2-layer
        network with 2 hidden units learns it by dividing the space non-linearly.
      </p>

      <div className="mb-5">
        <p className="text-xs text-gray-500 font-mono mb-2">Truth table</p>
        <table className="text-sm font-mono w-auto border-collapse">
          <thead>
            <tr>
              <th className="text-left text-gray-500 font-normal pr-6 pb-1">x₁</th>
              <th className="text-left text-gray-500 font-normal pr-6 pb-1">x₂</th>
              <th className="text-left text-gray-500 font-normal pr-6 pb-1">XOR</th>
              {phase === 'done' && <th className="text-left text-gray-500 font-normal pb-1">pred</th>}
            </tr>
          </thead>
          <tbody>
            {XOR_DATA.map(({ x, y }, i) => (
              <tr key={i}>
                <td className="text-gray-300 pr-6">{x[0]}</td>
                <td className="text-gray-300 pr-6">{x[1]}</td>
                <td className="text-indigo-300 pr-6">{y}</td>
                {phase === 'done' && (
                  <td className={Math.abs(preds[i] - y) < 0.15 ? 'text-emerald-400' : 'text-red-400'}>
                    {preds[i].toFixed(3)}
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {phase !== 'done' ? (
        <button
          onClick={train}
          disabled={phase === 'training'}
          className="px-4 py-2 rounded-lg bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-wait transition-colors"
        >
          {phase === 'training' ? 'Training…' : 'Train network (3 000 steps)'}
        </button>
      ) : (
        <>
          <LossChart losses={losses} />
          <p className="mt-3 text-xs text-emerald-400 font-medium">
            Converged — all four XOR outputs within 0.15 of target.
          </p>
          <button
            onClick={reset}
            className="mt-3 px-3 py-1.5 rounded-lg bg-gray-800 text-gray-400 text-xs hover:text-white transition-colors"
          >
            Reset
          </button>
        </>
      )}
    </div>
  )
}

// ─── Module export ────────────────────────────────────────────────────────────

export function NeuralNetworks({ onComplete, completed }: ModuleProps) {
  return (
    <div className="mx-auto max-w-2xl px-6 py-12 text-white">
      {/* Hero */}
      <section className="mb-20 text-center">
        <div className="mb-6 inline-flex h-20 w-20 items-center justify-center rounded-2xl border border-indigo-800 bg-indigo-950/60">
          <span className="text-4xl">⚡</span>
        </div>
        <h2 className="mb-4 text-4xl font-bold tracking-tight">Neural Networks</h2>
        <p className="text-lg text-gray-400 leading-relaxed">
          How stacking simple math operations — learned from data — gives machines the ability to
          see, read, and reason.
        </p>
      </section>

      <Section number={1} title="The Artificial Neuron">
        <p className="mb-6 text-gray-300 leading-relaxed">
          A neuron is disarmingly simple: multiply each input by a learned weight, sum them up,
          add a bias, then squash the result through an activation function. That's it.
          Stacked in layers, millions of these tiny computations produce intelligence.
        </p>
        <NeuronDiagram />
        <p className="mt-3 text-center text-xs text-gray-500 font-mono">
          output = σ(w₁x₁ + w₂x₂ + b)
        </p>
        <div className="mt-6 grid grid-cols-3 gap-4 text-sm">
          {[
            { term: 'Weights (w)', def: 'How much each input matters. Learned during training.' },
            { term: 'Bias (b)', def: 'Shifts the threshold. Lets the neuron fire even when all inputs are zero.' },
            { term: 'Activation', def: 'Adds non-linearity. Without it, any depth collapses to one layer.' },
          ].map(({ term, def }) => (
            <div key={term} className="rounded-lg border border-gray-800 bg-gray-900/30 p-3">
              <p className="font-semibold text-indigo-300 mb-1">{term}</p>
              <p className="text-xs text-gray-500 leading-snug">{def}</p>
            </div>
          ))}
        </div>
      </Section>

      <Section number={2} title="Interactive Perceptron">
        <p className="mb-4 text-gray-300 leading-relaxed">
          Drag the sliders to adjust inputs, weights, and bias. Watch how the weighted sum
          and sigmoid output change instantly. The neuron fires (outputs 1) when{' '}
          <span className="font-mono text-indigo-300">σ(z) ≥ 0.5</span>.
        </p>
        <Perceptron />
      </Section>

      <Section number={3} title="The Forward Pass">
        <p className="mb-4 text-gray-300 leading-relaxed">
          When a network makes a prediction, data flows left to right — input layer to hidden
          layer to output. Each layer transforms the signal. Click below to step through it.
        </p>
        <ForwardPass />
        <p className="mt-3 text-xs text-gray-500">
          Values here are fixed for illustration. Each neuron in the hidden layer sees all
          inputs; each applies a sigmoid and passes its result forward.
        </p>
      </Section>

      <Section number={4} title="Activation Functions">
        <p className="mb-4 text-gray-300 leading-relaxed">
          The activation function is what gives networks their power. Without it, chaining
          layers together is mathematically equivalent to a single layer — no matter how deep.
          Move the slider to explore each function's shape.
        </p>
        <ActivationChart />
        <div className="mt-4 grid grid-cols-3 gap-3 text-xs text-gray-500">
          <p><span className="text-indigo-300 font-semibold">Sigmoid</span> — smooth, bounded 0→1. Classic but can cause vanishing gradients in deep nets.</p>
          <p><span className="text-emerald-400 font-semibold">ReLU</span> — dead simple: if negative, zero it. Dominates modern networks because gradients don't vanish.</p>
          <p><span className="text-pink-400 font-semibold">Tanh</span> — like sigmoid but centred at zero. Preferred in recurrent layers.</p>
        </div>
      </Section>

      <Section number={5} title="Teaching XOR">
        <p className="mb-4 text-gray-300 leading-relaxed">
          In 1969, Minsky and Papert proved a single neuron can't learn XOR — it requires a
          curved decision boundary. A two-layer network learns it in seconds using
          backpropagation: compute the error, then nudge every weight in the direction that
          reduces it.
        </p>
        <XORDemo />
      </Section>

      {/* Completion */}
      <section className="mt-4 rounded-2xl border border-indigo-900/60 bg-indigo-950/30 p-8 text-center">
        <div className="mb-2 text-2xl">{completed ? '✅' : '🎯'}</div>
        <h3 className="mb-2 text-xl font-bold">
          {completed ? 'Module Complete' : 'Ready to mark this done?'}
        </h3>
        <p className="mb-6 text-sm text-gray-400">
          {completed
            ? 'You understand how neurons, layers, and backprop fit together.'
            : 'You now know how individual neurons work and how networks learn. Mark this complete to unlock the next node.'}
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
