import { useEffect, useState, useRef, type ReactNode } from 'react'

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

// ─── Thinking animation ───────────────────────────────────────────────────────

function ThinkingDots() {
  const [frame, setFrame] = useState(0)
  useEffect(() => {
    const t = setInterval(() => setFrame(f => (f + 1) % 4), 380)
    return () => clearInterval(t)
  }, [])
  const dots = '.'.repeat(frame)
  return (
    <span className="font-mono text-xs text-gray-500">
      Thinking{dots.padEnd(3, ' ')}
    </span>
  )
}

// ─── Keyword-routed code responses ───────────────────────────────────────────

const CANNED: Record<string, string> = {
  sort: `def sort_items(items: list) -> dict:
    sorted_items = sorted(items)
    return {
        "sorted": sorted_items,
        "min":    sorted_items[0],
        "max":    sorted_items[-1],
        "count":  len(sorted_items),
    }`,
  file: `def read_lines(path: str) -> list[str]:
    try:
        with open(path, "r", encoding="utf-8") as f:
            return [line.rstrip("\\n") for line in f]
    except FileNotFoundError:
        return []`,
  api: `import requests

def fetch_json(url: str, params: dict | None = None) -> dict:
    response = requests.get(url, params=params, timeout=10)
    response.raise_for_status()
    return response.json()`,
  database: `import sqlite3
from contextlib import contextmanager

@contextmanager
def get_db(path: str):
    conn = sqlite3.connect(path)
    conn.row_factory = sqlite3.Row
    try:
        yield conn
        conn.commit()
    finally:
        conn.close()`,
  debug: `# Issue: unhandled empty / None input.
# Fixed version adds an early-return guard:

def process(data):
    if not data:
        return None          # handles None, [], ""
    if not isinstance(data, (list, str)):
        raise TypeError(
            f"Expected list or str, got {type(data).__name__}"
        )
    return data`,
  explain: `# A list comprehension builds a new list in one line.
#
# Pattern:  [transform(x) for x in source if condition(x)]
#
# It is equivalent to:
#   result = []
#   for x in source:
#       if condition(x):
#           result.append(transform(x))
#
# It's shorter and usually faster than the loop form.`,
  default: `def process(data: str) -> dict:
    """Process input and return a structured result."""
    if not data:
        raise ValueError("data cannot be empty")
    return {
        "input":  data,
        "length": len(data),
        "words":  len(data.split()),
    }`,
}

function generateCodeResponse(prompt: string): string {
  const p = prompt.toLowerCase()
  if (/sort|order|rank|arrange/.test(p))          return CANNED.sort
  if (/file|read|write|open|save|load/.test(p))   return CANNED.file
  if (/api|http|fetch|request|url|endpoint/.test(p)) return CANNED.api
  if (/database|sql|sqlite|query|table/.test(p))  return CANNED.database
  if (/fix|bug|error|crash|debug|broken/.test(p)) return CANNED.debug
  if (/explain|what|how does|describe/.test(p))   return CANNED.explain
  return CANNED.default
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
  const [userPrompt, setUserPrompt] = useState('')
  const [thinking, setThinking] = useState(false)
  const [aiResponse, setAiResponse] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const isCustom = sel === CODE_EXAMPLES.length
  const ex = isCustom ? null : CODE_EXAMPLES[sel]

  function copy() {
    const text = isCustom ? aiResponse! : ex!.response
    navigator.clipboard.writeText(text)
    setCopied(true)
    if (timerRef.current) clearTimeout(timerRef.current)
    timerRef.current = setTimeout(() => setCopied(false), 1500)
  }

  function handleAsk() {
    if (!userPrompt.trim() || thinking) return
    setThinking(true)
    setAiResponse(null)
    const delay = 900 + Math.random() * 700
    setTimeout(() => {
      setAiResponse(generateCodeResponse(userPrompt))
      setThinking(false)
    }, delay)
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
        <button
          onClick={() => { setSel(CODE_EXAMPLES.length); setAiResponse(null) }}
          className={`ml-auto border-l border-gray-800 px-3 py-2.5 text-xs font-medium whitespace-nowrap transition-colors ${
            isCustom ? 'bg-gray-800 text-indigo-300' : 'text-gray-600 hover:text-gray-400'
          }`}
        >
          Ask your own ✦
        </button>
      </div>

      {isCustom ? (
        <div className="p-5 space-y-3">
          <textarea
            value={userPrompt}
            onChange={(e) => { setUserPrompt(e.target.value); setAiResponse(null) }}
            onKeyDown={(e) => { if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) handleAsk() }}
            placeholder="Describe what you want the code to do…"
            rows={3}
            className="w-full resize-none rounded-lg border border-gray-800 bg-gray-900 p-3 font-mono text-sm text-gray-300 placeholder:text-gray-700 focus:border-indigo-700 focus:outline-none"
          />
          <div className="flex items-center justify-between">
            <span className="font-mono text-xs text-gray-700">⌘ Enter to submit</span>
            <button
              onClick={handleAsk}
              disabled={!userPrompt.trim() || thinking}
              className="rounded-lg bg-indigo-600 px-4 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-40"
            >
              {thinking ? 'Asking…' : 'Ask AI →'}
            </button>
          </div>

          {thinking && (
            <div className="rounded-lg border border-gray-800 bg-gray-900 p-3">
              <ThinkingDots />
            </div>
          )}

          {aiResponse && !thinking && (
            <div className="space-y-2 border-t border-white/5 pt-3">
              <div className="flex items-center justify-between">
                <p className="font-mono text-[10px] font-bold tracking-widest text-gray-600">RESPONSE</p>
                <button onClick={copy} className="font-mono text-[10px] text-gray-600 transition-colors hover:text-gray-400">
                  {copied ? 'copied ✓' : 'copy'}
                </button>
              </div>
              <pre className="whitespace-pre-wrap rounded-lg bg-gray-900 p-3 font-mono text-xs leading-relaxed text-emerald-300">
                {aiResponse}
              </pre>
              <p className="text-xs text-gray-700">
                Simulated — routed by keyword. A real model generates code specific to your exact request.
              </p>
            </div>
          )}
        </div>
      ) : (
        <div className="p-5 space-y-3">
          <div>
            <p className="text-[10px] font-mono font-bold tracking-widest text-gray-600 mb-1">PROMPT</p>
            <pre className="whitespace-pre-wrap rounded-lg bg-gray-900 p-3 font-mono text-xs leading-relaxed text-gray-400">{ex!.prompt}</pre>
          </div>
          <div className="border-t border-white/5 pt-3">
            <div className="flex items-center justify-between mb-1">
              <p className="font-mono text-[10px] font-bold tracking-widest text-gray-600">RESPONSE</p>
              <button onClick={copy} className="font-mono text-[10px] text-gray-600 transition-colors hover:text-gray-400">
                {copied ? 'copied ✓' : 'copy'}
              </button>
            </div>
            <pre className="whitespace-pre-wrap rounded-lg bg-gray-900 p-3 font-mono text-xs leading-relaxed text-emerald-300">{ex!.response}</pre>
          </div>
        </div>
      )}
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

// ─── Live keyword classifier ─────────────────────────────────────────────────

const POS_WORDS = new Set([
  'good','great','excellent','love','perfect','amazing','fantastic',
  'recommend','happy','best','wonderful','awesome','pleased','satisfied',
  'fast','quality','helpful','friendly','smooth','easy','beautiful','brilliant',
])
const NEG_WORDS = new Set([
  'bad','terrible','awful','broken','waste','disappointed','useless',
  'never','late','wrong','worst','horrible','poor','annoying','frustrating',
  'refund','damaged','slow','rude','expensive','faulty','missing','defective',
])

function classifyLive(text: string): { label: string; confidence: number; reasoning: string } | null {
  if (!text.trim()) return null
  const words = text.toLowerCase().replace(/[^\w\s]/g, '').split(/\s+/)
  const posHits = words.filter(w => POS_WORDS.has(w))
  const negHits = words.filter(w => NEG_WORDS.has(w))
  const total = posHits.length + negHits.length

  if (total === 0) return {
    label: 'Neutral',
    confidence: 0.62,
    reasoning: 'No strong positive or negative signals detected.',
  }

  const posRatio = posHits.length / total
  if (posRatio >= 0.7) return {
    label: 'Positive',
    confidence: Math.min(0.97, 0.70 + posRatio * 0.22),
    reasoning: `Positive signal${posHits.length > 1 ? 's' : ''}: ${posHits.join(', ')}.`,
  }
  if (posRatio <= 0.3) return {
    label: 'Negative',
    confidence: Math.min(0.97, 0.70 + (1 - posRatio) * 0.22),
    reasoning: `Negative signal${negHits.length > 1 ? 's' : ''}: ${negHits.join(', ')}.`,
  }
  return {
    label: 'Mixed',
    confidence: 0.74,
    reasoning: `Both positive (${posHits.join(', ')}) and negative (${negHits.join(', ')}) signals.`,
  }
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
  const [customText, setCustomText] = useState('')
  const liveResult = classifyLive(customText)

  const ex = CLASSIFY_EXAMPLES[idx]
  const result = mode === 'zero' ? ex.zeroShot : ex.fewShot

  const barWidth = `${Math.round(result.confidence * 100)}%`

  return (
    <div className="rounded-xl border border-gray-800 bg-gray-900/40 p-5 space-y-4">
      <div className="flex flex-wrap gap-1.5">
        {CLASSIFY_EXAMPLES.map((_e, i) => (
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
          className={`px-3 py-2 text-xs font-medium transition-colors leading-none text-left ${
            mode === 'zero' ? 'bg-gray-700 text-white' : 'text-gray-500 hover:text-gray-300'
          }`}>
          Zero-shot
          <span className="block text-[9px] font-normal opacity-60 mt-0.5">no examples given</span>
        </button>
        <button onClick={() => setMode('few')}
          className={`px-3 py-2 text-xs font-medium transition-colors leading-none text-left ${
            mode === 'few' ? 'bg-indigo-700 text-white' : 'text-gray-500 hover:text-gray-300'
          }`}>
          Few-shot
          <span className="block text-[9px] font-normal opacity-60 mt-0.5">with examples</span>
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
          ? 'No examples given — the AI uses everything it learned during training to decide the category.'
          : '3 labelled examples were added to the prompt before your input — the AI learns your specific categories from those.'}
      </div>

      {/* Live keyword classifier */}
      <div className="border-t border-white/5 pt-4 space-y-3">
        <p className="text-xs font-semibold text-gray-400">Try your own text</p>
        <textarea
          value={customText}
          onChange={(e) => setCustomText(e.target.value)}
          placeholder="Type any review or message to classify…"
          rows={2}
          className="w-full resize-none rounded-lg border border-gray-800 bg-gray-900 p-3 text-sm text-gray-300 placeholder:text-gray-700 focus:border-indigo-700 focus:outline-none"
        />

        {liveResult && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-bold text-white">{liveResult.label}</span>
              <span className="font-mono text-xs text-gray-500">
                {Math.round(liveResult.confidence * 100)}% confidence
              </span>
            </div>
            <div className="h-1.5 overflow-hidden rounded-full bg-gray-800">
              <div
                className={`h-full rounded-full transition-all duration-300 ${
                  liveResult.label === 'Positive' ? 'bg-emerald-500' :
                  liveResult.label === 'Negative' ? 'bg-red-500' : 'bg-yellow-500'
                }`}
                style={{ width: `${Math.round(liveResult.confidence * 100)}%` }}
              />
            </div>
            <p className="text-xs text-gray-500">{liveResult.reasoning}</p>
          </div>
        )}

        <p className="text-xs text-gray-700 leading-relaxed">
          This uses keyword counting — the same way early spam filters worked.
          Try <span className="text-gray-500 italic">"not bad at all"</span> or{' '}
          <span className="text-gray-500 italic">"I love how broken this is"</span> to see
          where it falls apart. A real language model reads the whole sentence in context.
        </p>
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
          Understanding how AI works is the foundation. But knowing where it's
          most useful — and where it falls short — is what turns that knowledge
          into a practical skill you can actually use every day.
        </p>
      </section>

      <Section number={1} title="Code Generation & Debugging">
        <p className="mb-4 text-gray-300 leading-relaxed">
          Writing code is one of the most useful things you can do with an AI.
          Unlike asking for facts (which you can't easily verify), code can be
          tested immediately — if it breaks, you'll know. The more specific you
          are — which programming language, any limitations, what should happen
          in edge cases — the better the result.
        </p>
        <CodeDemo />
        <p className="mt-3 text-sm text-gray-500">
          Always run AI-generated code before relying on it. It often looks
          correct but contains subtle mistakes that only show up when it actually
          runs. Think of it as a fast first draft that still needs your review.
        </p>
      </Section>

      <Section number={2} title="Summarisation">
        <p className="mb-4 text-gray-300 leading-relaxed">
          Summarising long documents is something AI does extremely well, and
          it's one of the safest uses — because you already have the original,
          you can check whether the summary got it right. The key is telling
          the AI exactly what format you want and who the summary is for.
        </p>
        <SummaryDemo />
        <p className="mt-3 text-sm text-gray-500">
          AI summaries tend to focus on what's mentioned most often in a text.
          They can miss nuance or flatten conditional statements — for example,
          "X is only true in certain cases" can become just "X is true." Always
          glance at the original before you share a summary.
        </p>
      </Section>

      <Section number={3} title="Classification">
        <p className="mb-4 text-gray-300 leading-relaxed">
          Classification means reading a piece of text and putting it in a
          bucket — positive or negative, complaint or compliment, urgent or not.
          AI is very good at this. You can ask it to classify without giving any
          examples first ("zero-shot"), or give it a few examples of what each
          category looks like ("few-shot") to get more precise results. Toggle
          between them below to see the difference.
        </p>
        <ClassifyDemo />
        <p className="mt-3 text-sm text-gray-500">
          For one-off or low-volume tasks, a general AI model works great for
          classification. If you need to classify millions of items automatically
          — like moderating social media posts — a model trained specifically for
          that one task will be faster and much cheaper.
        </p>
      </Section>

      <Section number={4} title="The Full Landscape">
        <p className="mb-4 text-gray-300 leading-relaxed">
          Code, summarisation, and classification are the most common starting
          points. But almost any task that involves reading, writing, or
          transforming text is something you can try with an AI. Here's a quick
          map of the most popular ones.
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
