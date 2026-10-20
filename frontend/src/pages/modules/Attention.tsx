import { useState, type ReactNode } from 'react'
import { Quiz, type QuizQuestion } from '../../components/Quiz'

import { ATTENTION_EXAMPLES } from '../../data/attentionData'

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

// ─── Q / K / V diagram ───────────────────────────────────────────────────────

function QKVDiagram() {
  return (
    <svg viewBox="0 0 420 180" className="mx-auto w-full max-w-lg">
      {/* Input token */}
      <rect x={10} y={70} width={60} height={40} rx={6} fill="#1e1b4b" stroke="#6366f1" strokeWidth={1.5} />
      <text x={40} y={94} textAnchor="middle" fill="#a5b4fc" fontSize={12} fontFamily="monospace">token</text>

      {/* Three projection arrows */}
      {[
        { label: 'Wq', yTarget: 30,  color: '#818cf8', desc: 'Query' },
        { label: 'Wk', yTarget: 90,  color: '#34d399', desc: 'Key' },
        { label: 'Wv', yTarget: 150, color: '#f472b6', desc: 'Value' },
      ].map(({ label, yTarget, color, desc }) => (
        <g key={label}>
          <line x1={70} y1={90} x2={160} y2={yTarget + 20}
            stroke={color} strokeWidth={1.5} strokeOpacity={0.6} />
          <rect x={160} y={yTarget} width={50} height={40} rx={6}
            fill="#111827" stroke={color} strokeWidth={1.5} />
          <text x={185} y={yTarget + 17} textAnchor="middle" fill={color} fontSize={10} fontFamily="monospace">{label}</text>
          <text x={185} y={yTarget + 30} textAnchor="middle" fill={color} fontSize={9}>{desc}</text>
        </g>
      ))}

      {/* Attention score computation */}
      <rect x={240} y={10} width={80} height={60} rx={6} fill="#1e1b4b" stroke="#818cf8" strokeWidth={1.5} />
      <text x={280} y={35} textAnchor="middle" fill="#a5b4fc" fontSize={10}>Q · Kᵀ</text>
      <text x={280} y={48} textAnchor="middle" fill="#6b7280" fontSize={9}>/ √d</text>
      <text x={280} y={61} textAnchor="middle" fill="#6b7280" fontSize={9}>softmax</text>
      <line x1={210} y1={50} x2={240} y2={40} stroke="#818cf8" strokeWidth={1} />
      <line x1={210} y1={110} x2={240} y2={50} stroke="#34d399" strokeWidth={1} />

      {/* Weighted sum with V */}
      <rect x={340} y={60} width={70} height={60} rx={6} fill="#1e1b4b" stroke="#f472b6" strokeWidth={1.5} />
      <text x={375} y={85} textAnchor="middle" fill="#f9a8d4" fontSize={10}>weights</text>
      <text x={375} y={98} textAnchor="middle" fill="#f9a8d4" fontSize={9}>× Value</text>
      <text x={375} y={111} textAnchor="middle" fill="#6b7280" fontSize={9}>= output</text>
      <line x1={320} y1={40} x2={340} y2={80} stroke="#818cf8" strokeWidth={1} />
      <line x1={210} y1={170} x2={340} y2={115} stroke="#f472b6" strokeWidth={1} />
    </svg>
  )
}

// ─── Attention heatmap ────────────────────────────────────────────────────────

function AttentionHeatmap() {
  const [exIdx, setExIdx] = useState(0)
  const [selected, setSelected] = useState<number | null>(null)

  const { tokens, attention } = ATTENTION_EXAMPLES[exIdx]

  function cellStyle(weight: number, rowIdx: number): React.CSSProperties {
    const isSelectedRow = selected === rowIdx
    const dimmed = selected !== null && selected !== rowIdx
    const alpha = dimmed ? weight * 0.25 : 0.08 + weight * 0.88
    return {
      background: `rgba(99,102,241,${alpha})`,
      outline: isSelectedRow ? '1px solid rgba(99,102,241,0.7)' : 'none',
      transition: 'background 0.2s',
    }
  }

  return (
    <div className="rounded-xl border border-gray-800 bg-gray-900/40 p-5">
      {/* Sentence selector */}
      <div className="flex flex-wrap gap-1.5 mb-4">
        {ATTENTION_EXAMPLES.map((ex, i) => (
          <button
            key={i}
            onClick={() => { setExIdx(i); setSelected(null) }}
            className={`px-2.5 py-1.5 rounded-lg text-xs transition-colors ${
              exIdx === i ? 'bg-indigo-600 text-white' : 'bg-gray-800 text-gray-400 hover:text-white'
            }`}
          >
            {ex.label}
          </button>
        ))}
      </div>

      {/* Clickable token row */}
      <div className="flex flex-wrap gap-1.5 mb-2">
        {tokens.map((tok, i) => (
          <button
            key={i}
            onClick={() => setSelected(selected === i ? null : i)}
            className={`px-3 py-1.5 rounded-lg text-sm font-mono transition-colors ${
              selected === i
                ? 'bg-indigo-600 text-white'
                : 'bg-gray-800 text-gray-300 hover:text-white'
            }`}
          >
            {tok}
          </button>
        ))}
      </div>
      <p className="text-xs text-gray-600 mb-4">
        {selected !== null
          ? `"${tokens[selected]}" attends to →`
          : 'Click a token to highlight its attention row'}
      </p>

      {/* N×N grid */}
      <div className="overflow-x-auto">
        <table className="border-collapse">
          <thead>
            <tr>
              <td className="w-14" />
              {tokens.map((tok, j) => (
                <th key={j} className="pb-1 px-0.5 text-xs text-gray-500 font-normal text-center w-12">
                  {tok}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {tokens.map((from, i) => (
              <tr key={i}>
                <td className={`pr-2 text-right text-xs font-mono whitespace-nowrap ${
                  selected === i ? 'text-indigo-300 font-bold' : 'text-gray-500'
                }`}>
                  {from}
                </td>
                {attention[i].map((weight, j) => (
                  <td key={j} className="p-0.5">
                    <div
                      className="w-10 h-9 rounded flex items-center justify-center text-xs font-mono cursor-default"
                      style={cellStyle(weight, i)}
                      title={`${from} → ${tokens[j]}: ${weight.toFixed(2)}`}
                    >
                      <span style={{ color: weight > 0.35 ? '#e5e7eb' : '#4b5563' }}>
                        {weight.toFixed(2).replace('0.', '.')}
                      </span>
                    </div>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="mt-3 text-xs text-gray-600">
        Cell (row i, col j) = how much token i attends to token j. Each row sums to 1.
      </p>
    </div>
  )
}

// ─── Multi-head diagram ───────────────────────────────────────────────────────

function MultiHeadDiagram() {
  const heads = [
    { label: 'Head 1', desc: 'syntax', example: 'subject → verb', color: '#818cf8' },
    { label: 'Head 2', desc: 'coreference', example: '"it" → antecedent', color: '#34d399' },
    { label: 'Head 3', desc: 'position', example: 'nearby words', color: '#f472b6' },
    { label: 'Head 4', desc: 'semantics', example: 'related meanings', color: '#fb923c' },
  ]
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {heads.map(({ label, desc, example, color }) => (
        <div key={label} className="rounded-xl border border-gray-800 bg-gray-900/40 p-3 text-center">
          <div className="w-8 h-8 rounded-lg mx-auto mb-2 flex items-center justify-center text-xs font-bold"
            style={{ background: `${color}20`, border: `1px solid ${color}60`, color }}>
            {label.split(' ')[1]}
          </div>
          <p className="text-xs font-medium mb-0.5" style={{ color }}>{desc}</p>
          <p className="text-xs text-gray-600">{example}</p>
        </div>
      ))}
    </div>
  )
}

// ─── Module export ────────────────────────────────────────────────────────────

const ATTN_QUIZ: QuizQuestion[] = [
  {
    q: 'What does self-attention compute for each token?',
    options: ['A fixed lookup from a dictionary', 'A weighted blend of all token representations, where weights reflect how relevant each other token is', 'The positional encoding of the token', 'The gradient of the embedding'],
    answer: 1,
    explanation: 'Attention scores how relevant every other token is, then produces a new representation that mixes in information from the most relevant ones.',
  },
  {
    q: 'In "I went to the river bank", which word should "bank" attend to most to resolve its meaning?',
    options: ['I', 'went', 'river', 'the'],
    answer: 2,
    explanation: '"river" disambiguates "bank" — without it, "bank" could mean a financial institution. Attention should give "river" high weight when processing "bank".',
  },
  {
    q: 'What does the Query vector represent?',
    options: ["The token's position in the sequence", '"What information am I looking for from other tokens?"', '"What information do I have that might be useful to others?"', '"How much should I contribute to the output?"'],
    answer: 1,
    explanation: 'The Query is the "search term" a token uses to find relevant information. Keys are what others offer; Values are what gets returned when selected.',
  },
  {
    q: 'Why does scaled dot-product attention divide scores by √d_k?',
    options: ['To normalise the output between 0 and 1', 'To prevent dot products from growing too large, which would saturate softmax and vanish gradients', 'To reduce the number of parameters', 'To speed up matrix multiplication'],
    answer: 1,
    explanation: 'In high dimensions, dot products grow large. Dividing by √d_k keeps values in a range where softmax has healthy, non-saturated gradients.',
  },
  {
    q: 'What is the main benefit of multi-head attention?',
    options: ['It is computationally cheaper', 'Each head specializes in a different type of linguistic relationship simultaneously', 'It eliminates the need for positional encoding', 'It allows longer context windows'],
    answer: 1,
    explanation: 'Different heads learn different patterns — one may track syntax, another coreference, another long-range semantics. Their outputs are concatenated for a richer representation.',
  },
]

export function Attention({ onComplete, completed }: ModuleProps) {
  return (
    <div className="mx-auto max-w-2xl px-6 py-12 text-white">
      {/* Hero */}
      <section className="mb-20 text-center">
        <div className="mb-6 inline-flex h-20 w-20 items-center justify-center rounded-2xl border border-indigo-800 bg-indigo-950/60">
          <span className="text-4xl">👁</span>
        </div>
        <h2 className="mb-4 text-4xl font-bold tracking-tight">Attention</h2>
        <p className="text-lg text-gray-400 leading-relaxed">
          The mechanism that lets every word in a sentence ask — and answer — "which other
          words should I pay attention to right now?"
        </p>
      </section>

      <Section number={1} title="Query, Key, Value">
        <p className="mb-4 text-gray-300 leading-relaxed">
          The word "bank" means completely different things in "river bank" and "savings
          bank." A transformer needs to figure out which meaning applies by looking at
          surrounding words. Attention is the mechanism that does this — it lets every
          word ask "which other words in this sentence should I focus on?" Here's how it works:
        </p>
        <div className="grid grid-cols-3 gap-3 mb-5 text-sm">
          {[
            { name: 'Query (Q)', color: 'text-indigo-300', def: '"What am I looking for?" — each word asks this', border: 'border-indigo-800' },
            { name: 'Key (K)',   color: 'text-emerald-300', def: '"What do I offer?" — each word advertises what it knows', border: 'border-emerald-800' },
            { name: 'Value (V)', color: 'text-pink-300',   def: '"What is my actual content?" — what gets shared when a match is found', border: 'border-pink-800' },
          ].map(({ name, color, def, border }) => (
            <div key={name} className={`rounded-xl border ${border} bg-gray-900/40 p-3 text-center`}>
              <p className={`font-mono font-bold mb-1 ${color}`}>{name}</p>
              <p className="text-xs text-gray-500">{def}</p>
            </div>
          ))}
        </div>
        <QKVDiagram />
        <p className="mt-4 text-sm text-gray-500 leading-relaxed">
          For each word, the model compares its Query to every other word's Key to get a
          relevance score. Higher scores mean "pay more attention here." Those scores get
          turned into percentages that add up to 100%. Finally, the model combines all the
          words' Values in proportion to those percentages. The result: each word's meaning
          gets enriched by the words that mattered most to it.
        </p>
      </Section>

      <Section number={2} title="Sentence Heatmaps">
        <p className="mb-4 text-gray-300 leading-relaxed">
          The grid below shows real attention scores for a sentence. Each row is a word,
          and each column is also a word. A dark cell means the row-word is paying a lot of
          attention to the column-word. Click any word (the buttons above the grid) to
          highlight where it focuses.
        </p>
        <AttentionHeatmap />
        <p className="mt-4 text-sm text-gray-500">
          Notice the patterns: "The" mostly attends to itself and the noun it introduces.
          Verbs look toward their subject. Adjectives strongly attend to the noun they
          describe. The model learned all these grammar patterns automatically, just by
          reading massive amounts of text — nobody programmed these rules in.
        </p>
      </Section>

      <Section number={3} title="Multi-Head Attention">
        <p className="mb-4 text-gray-300 leading-relaxed">
          One round of attention can only notice one type of relationship at a time —
          like someone who can either focus on grammar or meaning, but not both at once.
          So transformers run many attention "heads" in parallel, each specialising in
          something different. All their findings get combined at the end.
        </p>
        <MultiHeadDiagram />
        <p className="mt-4 text-sm text-gray-500 leading-relaxed">
          GPT-2 (a relatively small model) uses 12 heads per layer across 12 layers —
          that's 144 different angles of understanding applied to every single word.
          GPT-4 uses many more. Each head adds another dimension of context that helps
          the model understand subtle meaning.
        </p>
      </Section>

      <Section number={4} title="Quiz Yourself">
        <p className="mb-4 leading-relaxed text-gray-300">Check whether Query/Key/Value, scaling, and multi-head attention have clicked.</p>
        <Quiz questions={ATTN_QUIZ} title="Attention" />
      </Section>

      {/* Completion */}
      <section className="mt-4 rounded-2xl border border-indigo-900/60 bg-indigo-950/30 p-8 text-center">
        <div className="mb-2 text-2xl">{completed ? '✅' : '🎯'}</div>
        <h3 className="mb-2 text-xl font-bold">
          {completed ? 'Module Complete' : 'Ready to mark this done?'}
        </h3>
        <p className="mb-6 text-sm text-gray-400">
          {completed
            ? 'You understand the mechanism behind every modern language model.'
            : 'Mark this complete to track your progress through the concept map.'}
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
