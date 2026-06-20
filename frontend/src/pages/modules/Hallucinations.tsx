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

// ─── Why hallucinations happen ────────────────────────────────────────────────

function WhyDiagram() {
  return (
    <div className="rounded-xl border border-gray-800 bg-gray-900/40 p-5">
      <div className="flex flex-col gap-2 text-xs font-mono">
        {[
          { label: 'Training objective', body: 'Predict the next token. Maximise the probability of the correct next token across billions of examples.', color: '#818cf8' },
          { label: 'What the model learns', body: 'Patterns in language — what words tend to follow what other words. Encyclopedic but shallow.', color: '#f59e0b' },
          { label: 'What the model does NOT learn', body: 'A truth-checking mechanism. The model has no way to verify whether a generated token matches reality.', color: '#f87171' },
          { label: 'Result', body: 'It generates fluent, confident-sounding text that may be factually wrong — because fluency was the training signal, not accuracy.', color: '#a78bfa' },
        ].map(({ label, body, color }) => (
          <div key={label} className="rounded-lg border border-gray-800 p-3"
            style={{ borderLeftColor: color, borderLeftWidth: 3 }}>
            <p className="font-bold mb-1" style={{ color }}>{label}</p>
            <p className="text-gray-400 leading-relaxed">{body}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── Examples ─────────────────────────────────────────────────────────────────

type HallucinationType = 'factual' | 'confabulation' | 'cutoff' | 'overconfidence'

const EXAMPLES: {
  type: HallucinationType
  label: string
  color: string
  prompt: string
  response: string
  error: string
  reality: string
}[] = [
  {
    type: 'factual',
    label: 'Factual error',
    color: '#f87171',
    prompt: 'Who invented the telephone?',
    response: 'The telephone was invented by Alexander Graham Bell in 1876. He was awarded the first patent for the telephone on March 7, 1876.',
    error: 'Factually correct here — but a model might confidently swap the date or confuse Bell with Elisha Gray depending on training data balance.',
    reality: 'Factual errors are common for obscure, disputed, or frequently confused facts. The more well-known the fact, the more reliable — but never guaranteed.',
  },
  {
    type: 'confabulation',
    label: 'Confabulation (fake citation)',
    color: '#fb923c',
    prompt: 'Give me three peer-reviewed studies on the benefits of cold showers.',
    response: '1. Johnson, M. et al. (2021). "Cold hydrotherapy and mood regulation." J. Clinical Psychiatry, 84(3), 112–119.\n2. Park, S. & Lee, H. (2022). "Thermogenic effects of cold water immersion." Int. J. Sports Medicine, 43(7), 445–452.\n3. Williams, R. et al. (2020). "Cold exposure and immune response." Immunity, 52(6), 988–1003.',
    error: 'These citations look real — journal names, volume numbers, page ranges — but they are fabricated. Searching for them returns nothing.',
    reality: 'LLMs are very good at generating plausible-looking citations. Never use a model-generated citation without verifying it in a database like PubMed or Google Scholar.',
  },
  {
    type: 'cutoff',
    label: 'Knowledge cutoff',
    color: '#f59e0b',
    prompt: 'What is the current price of Bitcoin?',
    response: 'As of my knowledge, Bitcoin was trading around $28,000–$35,000 in late 2023. However, cryptocurrency prices change rapidly and my information may be outdated.',
    error: 'The model correctly signals uncertainty here, but many do not — and will state a price from training time with full confidence.',
    reality: 'Models have a training cutoff. Any question about "current" prices, events, or statistics should be answered with a real-time source, not an LLM.',
  },
  {
    type: 'overconfidence',
    label: 'Confident but wrong',
    color: '#a78bfa',
    prompt: 'What is 17 × 24?',
    response: '17 × 24 = 418.',
    error: '17 × 24 = 408, not 418. The model gave a wrong arithmetic result with no hedging.',
    reality: 'Models don\'t do arithmetic — they pattern-match. For any non-trivial calculation, use a calculator or a code interpreter tool, not the raw LLM.',
  },
]

function ExamplesGallery() {
  const [active, setActive] = useState<HallucinationType>('confabulation')
  const ex = EXAMPLES.find((e) => e.type === active)!

  return (
    <div>
      <div className="flex flex-wrap gap-1.5 mb-4">
        {EXAMPLES.map((e) => (
          <button key={e.type} onClick={() => setActive(e.type)}
            className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors border ${
              active === e.type
                ? 'text-white border-transparent'
                : 'text-gray-500 border-gray-800 hover:text-gray-300'
            }`}
            style={active === e.type ? { background: `${e.color}20`, borderColor: `${e.color}60`, color: e.color } : {}}
          >
            {e.label}
          </button>
        ))}
      </div>

      <div className="rounded-xl border border-gray-800 bg-gray-900/40 p-5 space-y-4">
        <div>
          <p className="text-[10px] font-mono font-bold tracking-widest text-gray-600 mb-1">PROMPT</p>
          <p className="text-sm text-gray-300 font-mono leading-relaxed">{ex.prompt}</p>
        </div>
        <div className="border-t border-white/5 pt-4">
          <p className="text-[10px] font-mono font-bold tracking-widest text-gray-600 mb-1">MODEL RESPONSE</p>
          <pre className="text-sm text-gray-300 font-mono leading-relaxed whitespace-pre-wrap">{ex.response}</pre>
        </div>
        <div className="border-t border-white/5 pt-4 rounded-lg p-3 bg-red-950/20 border border-red-900/30">
          <p className="text-xs font-bold text-red-400 mb-1">⚠ The problem</p>
          <p className="text-xs text-gray-500 leading-relaxed">{ex.error}</p>
        </div>
        <div className="rounded-lg p-3 bg-indigo-950/20 border border-indigo-900/30">
          <p className="text-xs font-bold text-indigo-400 mb-1">💡 What this means in practice</p>
          <p className="text-xs text-gray-500 leading-relaxed">{ex.reality}</p>
        </div>
      </div>
    </div>
  )
}

// ─── Mitigation strategies ────────────────────────────────────────────────────

const STRATEGIES = [
  {
    title: 'Retrieval-Augmented Generation (RAG)',
    icon: '🔍',
    body: 'Retrieve relevant source documents and pass them as context. The model then synthesises from real text rather than generating from memory. False citations become impossible when the sources are in the prompt.',
    link: 'You built this in the RAG module.',
  },
  {
    title: 'Ask the model to cite sources',
    icon: '📎',
    body: 'Prompt: "Support every claim with a citation in the format [Author, Year]. If you don\'t have a verified source, say so." This doesn\'t prevent hallucination, but makes it visible and forces hedging.',
    link: null,
  },
  {
    title: 'Request uncertainty expression',
    icon: '🤔',
    body: 'Prompt: "If you are not confident about a fact, prefix the sentence with \'I\'m not certain, but…\'". Calibrated uncertainty is far more useful than false confidence.',
    link: null,
  },
  {
    title: 'Use a code interpreter for calculations',
    icon: '🧮',
    body: 'Never trust an LLM for arithmetic, date math, or numerical reasoning. Route calculations to a code execution environment and feed results back to the model.',
    link: null,
  },
  {
    title: 'Real-time tools for current information',
    icon: '🌐',
    body: 'For prices, news, weather, or any live data: use a web search tool or API call, then summarise the results with the LLM. The LLM\'s job is synthesis, not recall.',
    link: null,
  },
  {
    title: 'Verify before publishing',
    icon: '✅',
    body: 'Treat LLM output as a first draft from a junior who doesn\'t know what they don\'t know. For anything factual that will be published or acted on, verify independently.',
    link: null,
  },
]

function Mitigations() {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {STRATEGIES.map(({ title, icon, body, link }) => (
        <div key={title} className="rounded-xl border border-gray-800 bg-gray-900/40 p-4">
          <div className="flex items-start gap-2 mb-2">
            <span className="text-lg shrink-0">{icon}</span>
            <p className="text-sm font-semibold text-white leading-snug">{title}</p>
          </div>
          <p className="text-xs text-gray-500 leading-relaxed">{body}</p>
          {link && <p className="mt-2 text-xs text-indigo-400">{link}</p>}
        </div>
      ))}
    </div>
  )
}

// ─── Module export ────────────────────────────────────────────────────────────

export function Hallucinations({ onComplete, completed }: ModuleProps) {
  return (
    <div className="mx-auto max-w-2xl px-6 py-12 text-white">
      <section className="mb-20 text-center">
        <div className="mb-6 inline-flex h-20 w-20 items-center justify-center rounded-2xl border border-indigo-800 bg-indigo-950/60">
          <span className="text-4xl">👻</span>
        </div>
        <h2 className="mb-4 text-4xl font-bold tracking-tight">Hallucinations</h2>
        <p className="text-lg text-gray-400 leading-relaxed">
          Language models sometimes generate confident, fluent, completely wrong
          information. Understanding why — and how to catch it — is essential
          for using AI responsibly.
        </p>
      </section>

      <Section number={1} title="Why Models Hallucinate">
        <p className="mb-4 text-gray-300 leading-relaxed">
          The root cause is architectural: models are trained to produce the most
          likely next token, not the most truthful one. These are very different
          objectives.
        </p>
        <WhyDiagram />
        <p className="mt-3 text-sm text-gray-500">
          This is not a bug to be fixed — it is a fundamental property of how
          autoregressive language models work. Mitigation strategies work around
          it; they don't eliminate it.
        </p>
      </Section>

      <Section number={2} title="Types of Hallucinations">
        <p className="mb-4 text-gray-300 leading-relaxed">
          Hallucinations take several forms. The most dangerous are the ones that
          look most credible.
        </p>
        <ExamplesGallery />
      </Section>

      <Section number={3} title="How to Mitigate Them">
        <p className="mb-4 text-gray-300 leading-relaxed">
          There is no single fix — reliable AI applications combine several of
          these approaches.
        </p>
        <Mitigations />
      </Section>

      <section className="mt-4 rounded-2xl border border-indigo-900/60 bg-indigo-950/30 p-8 text-center">
        <div className="mb-2 text-2xl">{completed ? '✅' : '🎯'}</div>
        <h3 className="mb-2 text-xl font-bold">{completed ? 'Module Complete' : 'Ready to mark this done?'}</h3>
        <p className="mb-6 text-sm text-gray-400">
          {completed
            ? 'You understand why hallucinations happen and how to defend against them.'
            : 'Mark this complete to record your progress.'}
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
