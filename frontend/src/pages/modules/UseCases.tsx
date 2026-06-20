import { useState, useRef, type ReactNode } from 'react'

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

// ─── 1. Code ──────────────────────────────────────────────────────────────────

const CODE_EXAMPLES = [
  {
    label: 'Generate',
    prompt: 'Write a Python function that takes a list of numbers and returns a dict with keys "min", "max", "mean", and "median". Use only the standard library.',
    response: `def stats(numbers: list[float]) -> dict:
    import statistics
    return {
        "min":    min(numbers),
        "max":    max(numbers),
        "mean":   statistics.mean(numbers),
        "median": statistics.median(numbers),
    }`,
  },
  {
    label: 'Debug',
    prompt: 'This function raises a ZeroDivisionError when items is empty. Fix it:\n\ndef average(items):\n    return sum(items) / len(items)',
    response: `def average(items: list[float]) -> float | None:
    if not items:
        return None
    return sum(items) / len(items)`,
  },
  {
    label: 'Explain',
    prompt: 'Explain this line of Python in plain English:\n\nresult = [x**2 for x in range(10) if x % 2 == 0]',
    response: `This is a list comprehension. It:
1. Iterates x over 0, 1, 2, … 9  (range(10))
2. Keeps only even numbers         (if x % 2 == 0 → 0,2,4,6,8)
3. Squares each kept number        (x**2)

Result: [0, 4, 16, 36, 64]`,
  },
  {
    label: 'Convert',
    prompt: 'Convert this JavaScript fetch call to Python using the requests library:\n\nconst res = await fetch(url, { method: "POST", body: JSON.stringify(data), headers: { "Content-Type": "application/json" } })',
    response: `import requests

response = requests.post(url, json=data)`,
  },
]

function CodeDemo() {
  const [sel, setSel] = useState(0)
  const [copied, setCopied] = useState(false)
  const ex = CODE_EXAMPLES[sel]
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  function copy() {
    navigator.clipboard.writeText(ex.response)
    setCopied(true)
    if (timerRef.current) clearTimeout(timerRef.current)
    timerRef.current = setTimeout(() => setCopied(false), 1500)
  }

  return (
    <div className="rounded-xl border border-gray-800 bg-gray-900/40 overflow-hidden">
      <div className="flex border-b border-gray-800 overflow-x-auto">
        {CODE_EXAMPLES.map((e, i) => (
          <button key={i} onClick={() => setSel(i)}
            className={`px-3 py-2.5 text-xs font-medium whitespace-nowrap transition-colors ${
              sel === i ? 'bg-gray-800 text-white' : 'text-gray-500 hover:text-gray-300'
            }`}>
            {e.label}
          </button>
        ))}
      </div>
      <div className="p-5 space-y-3">
        <div>
          <p className="text-[10px] font-mono font-bold tracking-widest text-gray-600 mb-1">PROMPT</p>
          <pre className="text-xs text-gray-400 font-mono leading-relaxed bg-gray-900 rounded-lg p-3 whitespace-pre-wrap">{ex.prompt}</pre>
        </div>
        <div className="border-t border-white/5 pt-3">
          <div className="flex items-center justify-between mb-1">
            <p className="text-[10px] font-mono font-bold tracking-widest text-gray-600">RESPONSE</p>
            <button onClick={copy}
              className="text-[10px] text-gray-600 hover:text-gray-400 transition-colors font-mono">
              {copied ? 'copied ✓' : 'copy'}
            </button>
          </div>
          <pre className="text-xs text-emerald-300 font-mono leading-relaxed bg-gray-900 rounded-lg p-3 whitespace-pre-wrap">{ex.response}</pre>
        </div>
      </div>
    </div>
  )
}

// ─── 2. Summarisation ─────────────────────────────────────────────────────────

const TEXTS = [
  {
    label: 'News article',
    input: `Scientists at MIT have developed a new battery technology using sodium instead of lithium. The sodium-ion batteries achieve 80% of lithium-ion energy density at roughly 40% lower cost, primarily because sodium is far more abundant than lithium. The team demonstrated a prototype that retained 90% capacity after 1,000 charge cycles. Commercial viability is expected within 3–5 years, pending scale-up manufacturing challenges. The breakthrough could reduce dependence on lithium mining, which has faced criticism for environmental and human rights concerns in producing countries.`,
    summaries: {
      '1 sentence': 'MIT researchers have developed sodium-ion batteries with 80% of lithium-ion capacity at 40% lower cost, potentially available commercially in 3–5 years.',
      '3 bullet points': '• Sodium-ion batteries achieve 80% of lithium energy density at 40% lower cost.\n• Prototype retained 90% capacity after 1,000 cycles.\n• Commercial availability expected in 3–5 years, reducing reliance on lithium mining.',
      'ELI5': 'Scientists made a new kind of battery using sodium (like table salt) instead of lithium. It\'s almost as powerful, much cheaper, and could be in real products in a few years.',
    },
  },
  {
    label: 'Legal clause',
    input: `Notwithstanding any other provision of this Agreement, Licensor reserves the right, at its sole and absolute discretion, to modify, suspend, or terminate the Service, or any part thereof, with or without notice to Licensee, and Licensor shall not be liable to Licensee or to any third party for any modification, suspension, or termination of the Service or loss of related information.`,
    summaries: {
      '1 sentence': 'The licensor can change, pause, or shut down the service at any time without warning, and is not liable for any losses this causes.',
      '3 bullet points': '• Licensor can modify, suspend, or terminate the service at any time.\n• No notice is required before doing so.\n• Licensor is not liable for losses caused to the licensee or third parties.',
      'ELI5': 'They can turn off the service whenever they want, without telling you first, and they won\'t owe you anything if they do.',
    },
  },
]

function SummaryDemo() {
  const [textIdx, setTextIdx] = useState(0)
  const [format, setFormat] = useState<'1 sentence' | '3 bullet points' | 'ELI5'>('1 sentence')

  const t = TEXTS[textIdx]

  return (
    <div className="rounded-xl border border-gray-800 bg-gray-900/40 p-5 space-y-4">
      <div className="flex flex-wrap gap-2">
        {TEXTS.map((tx, i) => (
          <button key={i} onClick={() => setTextIdx(i)}
            className={`px-2.5 py-1 rounded-lg text-xs transition-colors ${
              textIdx === i ? 'bg-indigo-600 text-white' : 'bg-gray-800 text-gray-400 hover:text-white'
            }`}>
            {tx.label}
          </button>
        ))}
      </div>

      <div>
        <p className="text-[10px] font-mono font-bold tracking-widest text-gray-600 mb-1">SOURCE TEXT</p>
        <p className="text-xs text-gray-500 leading-relaxed bg-gray-900 rounded-lg p-3">{t.input}</p>
      </div>

      <div>
        <p className="text-[10px] font-mono font-bold tracking-widest text-gray-600 mb-2">SUMMARISE AS</p>
        <div className="flex flex-wrap gap-1.5 mb-3">
          {(['1 sentence', '3 bullet points', 'ELI5'] as const).map((f) => (
            <button key={f} onClick={() => setFormat(f)}
              className={`px-2.5 py-1 rounded-lg text-xs transition-colors ${
                format === f ? 'bg-emerald-700 text-white' : 'bg-gray-800 text-gray-400 hover:text-white'
              }`}>
              {f}
            </button>
          ))}
        </div>
        <pre className="text-sm text-emerald-300 font-mono leading-relaxed whitespace-pre-wrap bg-gray-900 rounded-lg p-3">
          {t.summaries[format]}
        </pre>
      </div>
    </div>
  )
}

// ─── 3. Classification ────────────────────────────────────────────────────────

const CLASSIFY_EXAMPLES = [
  {
    text: 'The package arrived two days late and the box was completely crushed.',
    zeroShot: { label: 'Negative', confidence: 0.96, reasoning: 'Late delivery + damaged packaging are clear negative signals.' },
    fewShot: { label: 'Shipping complaint', confidence: 0.94, reasoning: 'Matches the few-shot examples for delivery/packaging issues.' },
  },
  {
    text: 'Works exactly as described. Would definitely order again.',
    zeroShot: { label: 'Positive', confidence: 0.98, reasoning: '"Exactly as described" and "order again" are strong positive phrases.' },
    fewShot: { label: 'Satisfied customer', confidence: 0.97, reasoning: 'Matches the few-shot pattern for positive repeat-purchase intent.' },
  },
  {
    text: 'Product is fine but I\'ve been waiting 3 weeks for a refund.',
    zeroShot: { label: 'Mixed', confidence: 0.82, reasoning: 'Positive product, negative service experience — genuinely mixed.' },
    fewShot: { label: 'Billing/refund issue', confidence: 0.91, reasoning: 'Few-shot examples taught the model to prioritise the main complaint.' },
  },
]

function ClassifyDemo() {
  const [idx, setIdx] = useState(0)
  const [mode, setMode] = useState<'zero' | 'few'>('zero')

  const ex = CLASSIFY_EXAMPLES[idx]
  const result = mode === 'zero' ? ex.zeroShot : ex.fewShot

  const barWidth = `${Math.round(result.confidence * 100)}%`

  return (
    <div className="rounded-xl border border-gray-800 bg-gray-900/40 p-5 space-y-4">
      <div className="flex flex-wrap gap-1.5">
        {CLASSIFY_EXAMPLES.map((e, i) => (
          <button key={i} onClick={() => setIdx(i)}
            className={`px-2.5 py-1 rounded-lg text-xs transition-colors ${
              idx === i ? 'bg-indigo-600 text-white' : 'bg-gray-800 text-gray-400 hover:text-white'
            }`}>
            Review {i + 1}
          </button>
        ))}
      </div>

      <div>
        <p className="text-[10px] font-mono font-bold tracking-widest text-gray-600 mb-1">INPUT</p>
        <p className="text-sm text-gray-300 italic">"{ex.text}"</p>
      </div>

      <div className="flex rounded-lg overflow-hidden border border-gray-800 w-fit">
        <button onClick={() => setMode('zero')}
          className={`px-3 py-1.5 text-xs font-medium transition-colors ${
            mode === 'zero' ? 'bg-gray-700 text-white' : 'text-gray-500 hover:text-gray-300'
          }`}>
          Zero-shot
        </button>
        <button onClick={() => setMode('few')}
          className={`px-3 py-1.5 text-xs font-medium transition-colors ${
            mode === 'few' ? 'bg-indigo-700 text-white' : 'text-gray-500 hover:text-gray-300'
          }`}>
          Few-shot
        </button>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-sm font-bold text-white">{result.label}</span>
          <span className="font-mono text-xs text-gray-500">{Math.round(result.confidence * 100)}% confidence</span>
        </div>
        <div className="h-1.5 rounded-full bg-gray-800 overflow-hidden">
          <div className="h-full rounded-full bg-indigo-500 transition-all duration-500"
            style={{ width: barWidth }} />
        </div>
        <p className="text-xs text-gray-500">{result.reasoning}</p>
      </div>

      <div className="border-t border-white/5 pt-3 text-xs text-gray-600">
        {mode === 'zero'
          ? 'Zero-shot: no examples given. The model uses its training to infer the category.'
          : 'Few-shot: 3 labelled examples prepended to the prompt. The model learns the specific taxonomy from context.'}
      </div>
    </div>
  )
}

// ─── Use case cards ───────────────────────────────────────────────────────────

const USE_CASE_SUMMARY = [
  { icon: '💻', name: 'Code', uses: ['Generate boilerplate', 'Debug errors', 'Explain unfamiliar code', 'Convert between languages'] },
  { icon: '📝', name: 'Summarisation', uses: ['TL;DR for long docs', 'Meeting notes → action items', 'Legal plain-English', 'Research synthesis'] },
  { icon: '🏷', name: 'Classification', uses: ['Sentiment analysis', 'Support ticket routing', 'Content moderation', 'Intent detection'] },
  { icon: '✍️', name: 'Drafting', uses: ['Email replies', 'Blog posts', 'Job descriptions', 'Product copy'] },
  { icon: '🔍', name: 'Extraction', uses: ['Dates, names, prices from text', 'Table from prose', 'JSON from free-form', 'Key facts from docs'] },
  { icon: '🌐', name: 'Translation', uses: ['Cross-language content', 'Tone shifting (formal ↔ casual)', 'Domain jargon → plain English', 'Code comments'] },
]

// ─── Module export ────────────────────────────────────────────────────────────

export function UseCases({ onComplete, completed }: ModuleProps) {
  return (
    <div className="mx-auto max-w-2xl px-6 py-12 text-white">
      <section className="mb-20 text-center">
        <div className="mb-6 inline-flex h-20 w-20 items-center justify-center rounded-2xl border border-indigo-800 bg-indigo-950/60">
          <span className="text-4xl">🛠</span>
        </div>
        <h2 className="mb-4 text-4xl font-bold tracking-tight">Use Cases</h2>
        <p className="text-lg text-gray-400 leading-relaxed">
          Knowing how AI works is step one. Knowing when to reach for it — and
          what tasks it genuinely excels at — is what makes the difference in
          practice.
        </p>
      </section>

      <Section number={1} title="Code Generation & Debugging">
        <p className="mb-4 text-gray-300 leading-relaxed">
          Code is one of the highest-ROI uses of LLMs. The model's output is
          immediately testable, which limits the hallucination risk. Effective
          prompts specify the language, constraints, and edge cases upfront.
        </p>
        <CodeDemo />
        <p className="mt-3 text-sm text-gray-500">
          Best practice: always run generated code before using it. LLMs
          confidently produce code that compiles but has subtle logic errors.
          Treat it as a fast first draft.
        </p>
      </Section>

      <Section number={2} title="Summarisation">
        <p className="mb-4 text-gray-300 leading-relaxed">
          Summarisation is ideal for LLMs because it's verifiable — you have
          the source. Specify the format and audience to get output you can
          actually use without editing.
        </p>
        <SummaryDemo />
        <p className="mt-3 text-sm text-gray-500">
          LLMs summarise by weighting frequent and prominent concepts. They
          can miss nuance or misrepresent conditional statements ("X is true
          only if Y" can collapse to "X is true"). Always check the source
          before publishing a model summary.
        </p>
      </Section>

      <Section number={3} title="Classification">
        <p className="mb-4 text-gray-300 leading-relaxed">
          Classification tasks — assigning text to predefined categories — are
          a strong fit. Zero-shot works well for intuitive categories; few-shot
          examples let you define a custom taxonomy without fine-tuning.
        </p>
        <ClassifyDemo />
        <p className="mt-3 text-sm text-gray-500">
          For production classification at scale, a purpose-built fine-tuned
          model will outperform a prompted LLM and cost far less per call. Use
          LLM classification for prototyping or low-volume tasks.
        </p>
      </Section>

      <Section number={4} title="The Full Landscape">
        <p className="mb-4 text-gray-300 leading-relaxed">
          Code, summarisation, and classification are the most common starting
          points — but LLMs are broadly useful for any task involving text
          transformation.
        </p>
        <div className="grid gap-3 sm:grid-cols-2">
          {USE_CASE_SUMMARY.map(({ icon, name, uses }) => (
            <div key={name} className="rounded-xl border border-gray-800 bg-gray-900/40 p-4">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-lg">{icon}</span>
                <p className="text-sm font-semibold">{name}</p>
              </div>
              <ul className="space-y-0.5">
                {uses.map((u) => (
                  <li key={u} className="text-xs text-gray-500 flex gap-1.5">
                    <span className="text-gray-700 shrink-0">•</span>{u}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </Section>

      <section className="mt-4 rounded-2xl border border-indigo-900/60 bg-indigo-950/30 p-8 text-center">
        <div className="mb-2 text-2xl">{completed ? '✅' : '🎯'}</div>
        <h3 className="mb-2 text-xl font-bold">
          {completed ? 'Module Complete' : 'You\'ve reached the end of the map!'}
        </h3>
        <p className="mb-6 text-sm text-gray-400">
          {completed
            ? 'You\'ve completed the entire AI Philosophy knowledge map.'
            : 'Mark this complete to finish your journey through the concept map.'}
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
