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

// ─── 1. Anatomy ───────────────────────────────────────────────────────────────

function AnatomyDiagram() {
  const [hov, setHov] = useState<string | null>(null)

  const parts = [
    {
      key: 'system',
      label: 'System Prompt',
      color: '#818cf8',
      bg: 'bg-indigo-950/60 border-indigo-800/60',
      text: 'SYSTEM',
      body: 'You are a helpful assistant that explains technical concepts clearly and concisely. Always give concrete examples.',
      desc: 'Sets the model\'s persona, tone, and constraints. Applied before the user message. Often hidden from end users.',
    },
    {
      key: 'context',
      label: 'Context / Few-shot Examples',
      color: '#34d399',
      bg: 'bg-emerald-950/40 border-emerald-900/40',
      text: 'CONTEXT',
      body: 'User: What is a variable?\nAssistant: A variable is a named container for a value. Example: x = 5 stores the number 5 under the name x.',
      desc: 'Optional. Showing the model 1–5 worked examples (few-shot) dramatically improves output quality for structured tasks.',
    },
    {
      key: 'user',
      label: 'User Message',
      color: '#f59e0b',
      bg: 'bg-amber-950/40 border-amber-900/40',
      text: 'USER',
      body: 'Explain what a neural network is in one paragraph, suitable for a high-school student.',
      desc: 'The actual request. The more specific and constrained, the better the output.',
    },
    {
      key: 'assistant',
      label: 'Model Response',
      color: '#a78bfa',
      bg: 'bg-violet-950/40 border-violet-900/40',
      text: 'ASSISTANT',
      body: 'A neural network is a system of connected layers of numbers — called neurons — that transform an input step-by-step until it produces an output…',
      desc: 'The model generates tokens one by one, conditioned on everything above. Temperature controls how creative or deterministic the output is.',
    },
  ]

  return (
    <div className="space-y-2">
      {parts.map((p) => (
        <div key={p.key}
          className={`rounded-xl border p-4 cursor-pointer transition-all ${p.bg} ${hov === p.key ? 'ring-1 ring-white/10' : ''}`}
          onMouseEnter={() => setHov(p.key)}
          onMouseLeave={() => setHov(null)}
        >
          <div className="flex items-start gap-3">
            <span className="font-mono text-[10px] font-bold tracking-widest mt-0.5 shrink-0"
              style={{ color: p.color }}>
              {p.text}
            </span>
            <p className="font-mono text-xs text-gray-400 leading-relaxed flex-1">{p.body}</p>
          </div>
          {hov === p.key && (
            <p className="mt-3 text-xs text-gray-500 leading-relaxed border-t border-white/5 pt-3">{p.desc}</p>
          )}
        </div>
      ))}
      <p className="text-xs text-gray-600 text-center mt-1">Hover a block to learn what each part does</p>
    </div>
  )
}

// ─── 2. Bad vs Good ───────────────────────────────────────────────────────────

const PAIRS = [
  {
    topic: 'Vague vs Specific',
    bad: {
      prompt: 'Write about climate change.',
      response: 'Climate change is a major global issue. Temperatures are rising and this is causing many problems around the world…',
      issues: ['No format or length specified', 'No audience defined', 'No angle or focus'],
    },
    good: {
      prompt: 'Write a 3-bullet-point summary of the economic costs of climate change for a non-expert reader. Focus on concrete dollar figures.',
      response: '• Extreme weather events cost the US economy ~$150 billion/year on average (NOAA, 2022).\n• Rising seas threaten $1 trillion of US coastal property by 2100.\n• Crop yield losses could add $5/day to food costs for 500M people by 2050.',
      wins: ['Specific format (3 bullets)', 'Audience defined (non-expert)', 'Focus area (economic / dollar figures)'],
    },
  },
  {
    topic: 'No Context vs With Context',
    bad: {
      prompt: 'Fix this code.',
      response: 'I\'d need to see the code to fix it. Please share what you\'d like me to look at.',
      issues: ['No code included', 'No description of the bug', 'Model has nothing to work with'],
    },
    good: {
      prompt: 'This Python function raises a KeyError when the dict is empty. Here\'s the code:\n\ndef get_name(d): return d["name"]\n\nFix it to return None if the key is missing.',
      response: 'def get_name(d):\n    return d.get("name")',
      wins: ['Code included', 'Bug described precisely', 'Expected behaviour specified'],
    },
  },
  {
    topic: 'No Format vs Format Specified',
    bad: {
      prompt: 'Compare React and Vue.',
      response: 'React and Vue are both JavaScript frameworks used for building user interfaces. React was created by Facebook in 2013 while Vue was created by Evan You in 2014. React uses JSX whereas Vue uses single-file components…',
      issues: ['Unstructured wall of text', 'Hard to scan', 'No clear conclusion'],
    },
    good: {
      prompt: 'Compare React and Vue in a markdown table with columns: Feature, React, Vue. Include: learning curve, ecosystem size, data binding, and best for.',
      response: '| Feature | React | Vue |\n|---|---|---|\n| Learning curve | Steeper (JSX) | Gentle |\n| Ecosystem | Huge | Large |\n| Data binding | One-way | Two-way |\n| Best for | Large SPAs | Rapid prototyping |',
      wins: ['Specific format (table)', 'Exact columns defined', 'Easy to scan and compare'],
    },
  },
  {
    topic: 'No Role vs Role Assigned',
    bad: {
      prompt: 'Review my code.',
      response: 'Your code looks good! There are a few things you might want to consider improving, such as…',
      issues: ['Generic, non-committal feedback', 'No expertise signal', 'No focus area'],
    },
    good: {
      prompt: 'You are a senior Python engineer doing a code review. Focus on security and performance. Be direct and list issues as a numbered list with severity (Critical / Major / Minor).',
      response: '1. [Critical] SQL query built with string formatting — use parameterised queries.\n2. [Major] O(n²) nested loop in process_items() — replace with a dict lookup.\n3. [Minor] Missing type hints on public methods.',
      wins: ['Expert persona set (senior engineer)', 'Focus area defined (security + perf)', 'Output format specified (numbered + severity)'],
    },
  },
]

function BadGood() {
  const [idx, setIdx] = useState(0)
  const [side, setSide] = useState<'bad' | 'good'>('bad')

  const pair = PAIRS[idx]
  const isGood = side === 'good'

  return (
    <div>
      {/* Topic tabs */}
      <div className="flex flex-wrap gap-1.5 mb-4">
        {PAIRS.map((p, i) => (
          <button key={i} onClick={() => { setIdx(i); setSide('bad') }}
            className={`px-2.5 py-1 rounded-lg text-xs transition-colors ${
              idx === i ? 'bg-indigo-600 text-white' : 'bg-gray-800 text-gray-400 hover:text-white'
            }`}>
            {p.topic}
          </button>
        ))}
      </div>

      {/* Toggle */}
      <div className="flex rounded-lg overflow-hidden border border-gray-800 mb-4 w-fit">
        <button onClick={() => setSide('bad')}
          className={`px-4 py-1.5 text-sm font-medium transition-colors ${
            !isGood ? 'bg-red-950/80 text-red-300' : 'text-gray-500 hover:text-gray-300'
          }`}>
          Bad prompt
        </button>
        <button onClick={() => setSide('good')}
          className={`px-4 py-1.5 text-sm font-medium transition-colors ${
            isGood ? 'bg-emerald-950/80 text-emerald-300' : 'text-gray-500 hover:text-gray-300'
          }`}>
          Good prompt
        </button>
      </div>

      <div className={`rounded-xl border p-5 transition-colors ${
        isGood ? 'border-emerald-900/60 bg-emerald-950/20' : 'border-red-900/60 bg-red-950/20'
      }`}>
        <div className="mb-3">
          <p className="text-[10px] font-mono font-bold tracking-widest text-gray-600 mb-1">PROMPT</p>
          <pre className="text-sm text-gray-200 whitespace-pre-wrap font-mono leading-relaxed">
            {isGood ? pair.good.prompt : pair.bad.prompt}
          </pre>
        </div>
        <div className="border-t border-white/5 pt-3 mb-3">
          <p className="text-[10px] font-mono font-bold tracking-widest text-gray-600 mb-1">MODEL RESPONSE</p>
          <pre className="text-sm text-gray-400 whitespace-pre-wrap font-mono leading-relaxed">
            {isGood ? pair.good.response : pair.bad.response}
          </pre>
        </div>
        <div className="border-t border-white/5 pt-3">
          <p className="text-[10px] font-mono font-bold tracking-widest text-gray-600 mb-1.5">
            {isGood ? 'WHY IT WORKS' : 'WHAT\'S MISSING'}
          </p>
          <ul className="space-y-1">
            {(isGood ? pair.good.wins : pair.bad.issues).map((item, i) => (
              <li key={i} className={`text-xs flex items-start gap-1.5 ${isGood ? 'text-emerald-400' : 'text-red-400'}`}>
                <span className="mt-0.5 shrink-0">{isGood ? '✓' : '✗'}</span>
                {item}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  )
}

// ─── 3. Chain of Thought ──────────────────────────────────────────────────────

const COT_PROBLEM = 'A store sells apples for $0.40 each and oranges for $0.60 each. Alice buys 3 apples and 5 oranges. She pays with a $5 bill. How much change does she get?'

const DIRECT = {
  prompt: `${COT_PROBLEM}\n\nAnswer:`,
  response: '$2.80',
  correct: false,
}

const COT = {
  prompt: `${COT_PROBLEM}\n\nLet's think step by step.`,
  response: '1. Cost of apples: 3 × $0.40 = $1.20\n2. Cost of oranges: 5 × $0.60 = $3.00\n3. Total: $1.20 + $3.00 = $4.20\n4. Change from $5.00: $5.00 − $4.20 = $0.80\n\nAnswer: $0.80',
  correct: true,
}

function ChainOfThought() {
  const [mode, setMode] = useState<'direct' | 'cot'>('direct')
  const data = mode === 'cot' ? COT : DIRECT

  return (
    <div className="rounded-xl border border-gray-800 bg-gray-900/40 p-5">
      <div className="flex rounded-lg overflow-hidden border border-gray-800 mb-4 w-fit">
        <button onClick={() => setMode('direct')}
          className={`px-4 py-1.5 text-sm font-medium transition-colors ${
            mode === 'direct' ? 'bg-gray-700 text-white' : 'text-gray-500 hover:text-gray-300'
          }`}>
          Direct answer
        </button>
        <button onClick={() => setMode('cot')}
          className={`px-4 py-1.5 text-sm font-medium transition-colors ${
            mode === 'cot' ? 'bg-indigo-700 text-white' : 'text-gray-500 hover:text-gray-300'
          }`}>
          Chain of thought
        </button>
      </div>

      <div className="mb-3">
        <p className="text-[10px] font-mono font-bold tracking-widest text-gray-600 mb-1">PROMPT</p>
        <pre className="text-xs text-gray-400 whitespace-pre-wrap font-mono leading-relaxed bg-gray-900 rounded-lg p-3">{data.prompt}</pre>
      </div>
      <div className="border-t border-white/5 pt-3">
        <p className="text-[10px] font-mono font-bold tracking-widest text-gray-600 mb-1">RESPONSE</p>
        <pre className="text-sm whitespace-pre-wrap font-mono leading-relaxed text-gray-300">{data.response}</pre>
        <div className={`mt-3 flex items-center gap-2 text-xs font-medium ${data.correct ? 'text-emerald-400' : 'text-red-400'}`}>
          <span>{data.correct ? '✓ Correct ($0.80)' : '✗ Wrong — the correct answer is $0.80'}</span>
        </div>
      </div>
    </div>
  )
}

// ─── 4. Prompt patterns ───────────────────────────────────────────────────────

const PATTERNS = [
  {
    name: 'Role assignment',
    template: 'You are a [ROLE] with [X years] of experience in [DOMAIN]. [Task].',
    example: 'You are a senior data scientist with 10 years of experience in NLP. Review this text classification pipeline and identify bottlenecks.',
    when: 'When you want the AI to respond like an expert — code review, medical questions, legal analysis, financial advice.',
  },
  {
    name: 'Output format',
    template: 'Respond in [FORMAT]. Include: [FIELD 1], [FIELD 2], [FIELD 3].',
    example: 'Respond in JSON with keys: title (string), summary (1 sentence), sentiment (positive/negative/neutral), confidence (0-1).',
    when: 'When you need the output in a specific shape — to paste into a spreadsheet, load into an app, or display consistently.',
  },
  {
    name: 'Delimited input',
    template: 'Here is the [CONTENT TYPE] delimited by triple backticks:\n```\n[CONTENT]\n```\n[Task].',
    example: 'Here is the customer review delimited by triple backticks:\n```\nThe battery life is terrible.\n```\nIdentify the main complaint in one sentence.',
    when: 'When passing in content from elsewhere (a review, an article, some code) so the AI knows exactly where your input ends and your instructions begin.',
  },
  {
    name: 'Step-back prompting',
    template: 'Before answering, first state the general principle behind this problem. Then apply it.',
    example: 'Before answering, first state what type of algorithm would be optimal for this data size. Then recommend a specific one with justification.',
    when: 'When the answer depends on understanding a broader concept first — asking the AI to state the principle before applying it often leads to much better answers.',
  },
]

function PromptPatterns() {
  const [sel, setSel] = useState(0)
  const p = PATTERNS[sel]

  return (
    <div className="rounded-xl border border-gray-800 bg-gray-900/40 overflow-hidden">
      <div className="flex border-b border-gray-800 overflow-x-auto">
        {PATTERNS.map((pat, i) => (
          <button key={i} onClick={() => setSel(i)}
            className={`px-3 py-2.5 text-xs font-medium whitespace-nowrap transition-colors ${
              sel === i ? 'bg-gray-800 text-white' : 'text-gray-500 hover:text-gray-300'
            }`}>
            {pat.name}
          </button>
        ))}
      </div>
      <div className="p-5 space-y-4">
        <div>
          <p className="text-[10px] font-mono font-bold tracking-widest text-gray-600 mb-1.5">TEMPLATE</p>
          <p className="font-mono text-xs text-indigo-300 leading-relaxed bg-indigo-950/30 rounded-lg p-3 border border-indigo-900/40">{p.template}</p>
        </div>
        <div>
          <p className="text-[10px] font-mono font-bold tracking-widest text-gray-600 mb-1.5">EXAMPLE</p>
          <p className="font-mono text-xs text-gray-300 leading-relaxed bg-gray-900 rounded-lg p-3">{p.example}</p>
        </div>
        <div>
          <p className="text-[10px] font-mono font-bold tracking-widest text-gray-600 mb-1.5">USE WHEN</p>
          <p className="text-xs text-gray-500">{p.when}</p>
        </div>
      </div>
    </div>
  )
}

// ─── Module export ────────────────────────────────────────────────────────────

export function PromptEngineering({ onComplete, completed }: ModuleProps) {
  return (
    <div className="mx-auto max-w-2xl px-6 py-12 text-white">
      <section className="mb-20 text-center">
        <div className="mb-6 inline-flex h-20 w-20 items-center justify-center rounded-2xl border border-indigo-800 bg-indigo-950/60">
          <span className="text-4xl">✍️</span>
        </div>
        <h2 className="mb-4 text-4xl font-bold tracking-tight">Prompt Engineering</h2>
        <p className="text-lg text-gray-400 leading-relaxed">
          The way you ask a question completely changes the answer you get back.
          Prompt engineering is the skill of writing clear, specific instructions
          that reliably get great results from an AI.
        </p>
      </section>

      <Section number={1} title="Anatomy of a Prompt">
        <p className="mb-4 text-gray-300 leading-relaxed">
          When you type a message to an AI, your words aren't the only thing shaping
          the response. A full conversation has up to four distinct parts stacked on top
          of each other — and understanding what each one does gives you much more control
          over what you get back. Hover each block below to learn what it does.
        </p>
        <AnatomyDiagram />
      </Section>

      <Section number={2} title="Bad vs Good Prompts">
        <p className="mb-4 text-gray-300 leading-relaxed">
          Vague prompts get vague answers. Specific prompts get specific answers.
          The biggest improvements come from adding a format, defining who the
          audience is, and giving constraints. Toggle between "bad" and "good"
          below to see exactly what changes and why it matters.
        </p>
        <BadGood />
      </Section>

      <Section number={3} title="Chain-of-Thought Prompting">
        <p className="mb-4 text-gray-300 leading-relaxed">
          Here's a simple trick that dramatically improves accuracy on math and
          logic problems: ask the AI to show its work before giving the answer.
          Adding{' '}
          <span className="font-mono text-indigo-300">"Let's think step by step"</span>{' '}
          forces it to write out each step, which naturally catches mistakes it
          would otherwise skip over. Try switching between the two approaches below.
        </p>
        <ChainOfThought />
        <p className="mt-3 text-sm text-gray-500">
          This works because each step the AI writes down becomes context that
          helps it figure out the next step. It's essentially thinking out loud —
          and the act of writing the intermediate steps prevents it from jumping
          to a wrong conclusion.
        </p>
      </Section>

      <Section number={4} title="Reusable Prompt Patterns">
        <p className="mb-4 text-gray-300 leading-relaxed">
          Most of what makes prompts work comes down to a small set of reusable
          patterns. Once you learn these, you can apply them to almost any task
          — no technical knowledge required.
        </p>
        <PromptPatterns />
      </Section>

      <section className="mt-4 rounded-2xl border border-indigo-900/60 bg-indigo-950/30 p-8 text-center">
        <div className="mb-2 text-2xl">{completed ? '✅' : '🎯'}</div>
        <h3 className="mb-2 text-xl font-bold">{completed ? 'Module Complete' : 'Ready to mark this done?'}</h3>
        <p className="mb-6 text-sm text-gray-400">
          {completed
            ? 'You know how to write prompts that consistently get useful model output.'
            : 'Mark this complete to continue your learning path.'}
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
