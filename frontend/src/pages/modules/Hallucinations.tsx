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
          { label: 'Training objective', body: 'During training, the AI\'s one job is to predict the next word. It reads billions of sentences and adjusts itself to get better and better at that single task — guessing what word comes next.', color: '#818cf8' },
          { label: 'What the model learns', body: 'Which words typically follow which other words — across millions of topics. It becomes extremely good at sounding natural, informed, and fluent on almost any subject.', color: '#f59e0b' },
          { label: 'What the model does NOT learn', body: 'Nobody ever taught it what\'s true or false. It has no way to check whether a sentence it\'s writing matches reality — it only knows whether it sounds like the kind of thing that gets written.', color: '#f87171' },
          { label: 'Result', body: 'It produces text that sounds exactly right — confident, well-structured, specific — but might be completely made up. It wasn\'t trained to be accurate. It was trained to sound accurate.', color: '#a78bfa' },
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
  const [active, setActive] = useState<HallucinationType>('factual')
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
    body: 'Instead of asking the AI to remember things, you hand it the real documents to read first. It answers based on what\'s right in front of it — not what it vaguely recalls from training. When the source is in the prompt, it can\'t invent one.',
    link: 'Covered in depth in the RAG module.',
  },
  {
    title: 'Ask the model to cite sources',
    icon: '📎',
    body: 'Add to your prompt: "Back every claim with a source. If you don\'t have a verified one, say so." This doesn\'t stop the AI from making things up — but it forces it to flag gaps, and makes any invented citations much easier to spot.',
    link: null,
  },
  {
    title: 'Request uncertainty expression',
    icon: '🤔',
    body: 'Add to your prompt: "If you\'re not confident about something, start that sentence with \'I\'m not certain, but…\'." An AI that admits uncertainty is far more useful than one that sounds sure about everything.',
    link: null,
  },
  {
    title: 'Use a code interpreter for calculations',
    icon: '🧮',
    body: 'AI models don\'t actually do math — they pattern-match on what calculations usually look like. For anything numerical, use a real calculator or ask the AI to write code and run it. Don\'t trust the raw answer.',
    link: null,
  },
  {
    title: 'Real-time tools for current information',
    icon: '🌐',
    body: 'For prices, news, or anything that changes over time: use a real search or live data source, then let the AI summarise the results. The AI\'s job is to help you understand information — not to remember it.',
    link: null,
  },
  {
    title: 'Verify before publishing',
    icon: '✅',
    body: 'Think of AI output as a first draft from someone who sounds very confident but might be guessing. For anything factual that matters — a medical question, a legal detail, a statistic you\'ll share — look it up independently before acting on it.',
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

// ─── Spot the hallucination quiz ─────────────────────────────────────────────

const QUIZ: {
  prompt: string
  response: string
  highlight: string
  options: string[]
  correct: number
  explain: string
  tag: string
}[] = [
  {
    prompt: 'Find me a study on napping and memory consolidation.',
    response:
      'Smith, J. & Rodriguez, M. (2022). "Midday naps enhance memory consolidation in healthy adults." Nature Neuroscience, 25(8), 1044–1051. The study found that a 90-minute nap improved recall by 40% compared to no nap.',
    highlight: 'Smith, J. & Rodriguez, M. (2022)',
    options: [
      'The 40% recall improvement figure is too high',
      'This citation is entirely fabricated — the paper does not exist',
      'Nature Neuroscience does not publish memory research',
      'Nothing is wrong — this looks like a real citation',
    ],
    correct: 1,
    explain:
      'The citation looks convincing — real journal name, volume, page numbers — but it does not exist. This is confabulation: the model generates a plausible-looking source from scratch rather than admitting it does not have one. Always verify citations in PubMed or Google Scholar before using them.',
    tag: 'Confabulation',
  },
  {
    prompt: 'What is 23% of 400?',
    response: '23% of 400 is 96.',
    highlight: '96',
    options: [
      'You cannot calculate a percentage of a round number',
      'The method is wrong — percentages must be expressed as decimals first',
      'The answer is incorrect — 23% of 400 is 92',
      'Nothing is wrong — 96 is correct',
    ],
    correct: 2,
    explain:
      '23 ÷ 100 × 400 = 92, not 96. AI models do not calculate — they pattern-match text. The answer "96" looks plausible and is close enough that many readers would not check. For any real calculation, use a calculator or ask the AI to run code.',
    tag: 'Arithmetic error',
  },
  {
    prompt: "What is today's USD to EUR exchange rate?",
    response:
      'The current exchange rate is approximately 1 USD = 0.94 EUR. The dollar has been strengthening against the euro throughout 2024.',
    highlight: 'current exchange rate',
    options: [
      'The rate is completely wrong — 1 USD is worth far more than 0.94 EUR',
      'Exchange rates between USD and EUR are fixed by international treaty',
      'This rate is stated as current, but the model has no live data — it is reporting a past rate as if it were now',
      'Nothing is wrong — 0.94 is a reasonable exchange rate',
    ],
    correct: 2,
    explain:
      '0.94 may have been accurate at some point during training, but the model presents it as "current" with no caveat. Models have a knowledge cutoff and cannot access real-time data. For any live figure — prices, rates, scores — check a real-time source.',
    tag: 'Knowledge cutoff',
  },
  {
    prompt: 'Who invented the World Wide Web?',
    response:
      'The World Wide Web was invented by Tim Berners-Lee in 1989 while working at CERN. He created the first web browser, called Mosaic, along with the HTTP protocol and HTML.',
    highlight: 'called Mosaic',
    options: [
      'The year is wrong — the Web was invented in 1993',
      "Tim Berners-Lee didn't work at CERN",
      'Tim Berners-Lee created a browser called WorldWideWeb (not Mosaic) — Mosaic was built by Marc Andreessen at NCSA',
      'Nothing is wrong here',
    ],
    correct: 2,
    explain:
      "Tim Berners-Lee invented the Web and built the first browser, but he called it WorldWideWeb (later Nexus). Mosaic was a separate, later browser created by Marc Andreessen and Eric Bina at NCSA in 1993. The model blended two related facts into one plausible-sounding sentence.",
    tag: 'Factual error',
  },
  {
    prompt: "Summarise Marie Curie's Nobel Prize wins.",
    response:
      'Marie Curie won the Nobel Prize in Chemistry in 1903 for her discovery of radioactivity, and the Nobel Prize in Physics in 1911 for her work on isolating radium and polonium.',
    highlight: 'Nobel Prize in Chemistry in 1903',
    options: [
      'Marie Curie only won one Nobel Prize, not two',
      'The prizes are swapped — her 1903 Nobel was in Physics (radioactivity), and her 1911 Nobel was in Chemistry (radium and polonium)',
      'Polonium was not discovered by Marie Curie',
      'Nothing is wrong here',
    ],
    correct: 1,
    explain:
      'Curie won the 1903 Nobel Prize in Physics (shared with her husband Pierre and Henri Becquerel, for work on radioactivity) and the 1911 Nobel Prize in Chemistry (for isolating radium and polonium). The model swapped the disciplines — a small but factually wrong detail that many readers would not notice.',
    tag: 'Factual error',
  },
]

function SpotTheHallucinationQuiz() {
  const [current, setCurrent] = useState(0)
  const [answers, setAnswers] = useState<(number | null)[]>(Array(QUIZ.length).fill(null))
  const [done, setDone] = useState(false)

  const q = QUIZ[current]
  const answered = answers[current] !== null
  const score = answers.filter((a, i) => a === QUIZ[i].correct).length

  function handleAnswer(idx: number) {
    if (answered) return
    const next = [...answers]
    next[current] = idx
    setAnswers(next)
  }

  function handleNext() {
    if (current < QUIZ.length - 1) setCurrent(c => c + 1)
    else setDone(true)
  }

  function reset() {
    setCurrent(0)
    setAnswers(Array(QUIZ.length).fill(null))
    setDone(false)
  }

  if (done) {
    return (
      <div className="rounded-xl border border-gray-800 bg-gray-900/40 p-6 text-center">
        <div className="mb-3 text-4xl">
          {score === 5 ? '🕵️' : score >= 3 ? '👀' : '👻'}
        </div>
        <div className="mb-1 text-2xl font-bold">{score} / {QUIZ.length}</div>
        <p className="mb-5 text-sm text-gray-400">
          {score === 5
            ? "Perfect score. You can spot even subtle hallucinations — that's a genuinely useful skill."
            : score >= 3
            ? 'Good eye. The tricky ones are the confident-sounding errors where nothing seems off at first glance.'
            : "Hallucinations are hard to catch because they're designed to sound correct. That's exactly the problem."}
        </p>
        <button onClick={reset} className="text-sm text-indigo-400 transition-colors hover:text-indigo-300">
          Try again →
        </button>
      </div>
    )
  }

  return (
    <div className="overflow-hidden rounded-xl border border-gray-800 bg-gray-900/40">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-gray-800 px-4 py-3">
        <span className="font-mono text-xs text-gray-500">
          Question {current + 1} of {QUIZ.length}
        </span>
        <div className="flex gap-1">
          {QUIZ.map((qq, i) => (
            <div
              key={i}
              className={`h-1.5 w-5 rounded-full transition-colors ${
                i < current
                  ? answers[i] === qq.correct ? 'bg-green-500' : 'bg-red-500'
                  : i === current ? 'bg-orange-400' : 'bg-gray-700'
              }`}
            />
          ))}
        </div>
      </div>

      <div className="p-5 space-y-4">
        {/* Prompt */}
        <div>
          <p className="font-mono text-[10px] font-bold tracking-widest text-gray-600 mb-1">PROMPT</p>
          <p className="text-sm text-gray-400 font-mono">{q.prompt}</p>
        </div>

        {/* Response */}
        <div>
          <p className="font-mono text-[10px] font-bold tracking-widest text-gray-600 mb-1">MODEL RESPONSE</p>
          <div className="rounded-lg bg-gray-950/60 px-3 py-3">
            <p className="text-sm text-gray-300 font-mono leading-relaxed whitespace-pre-wrap">{q.response}</p>
          </div>
        </div>

        {/* Question */}
        <p className="text-sm font-semibold text-white">What is wrong with this response?</p>

        {/* Options */}
        <div className="space-y-2">
          {q.options.map((opt, idx) => {
            const isSelected = answers[current] === idx
            const isCorrect = idx === q.correct
            let cls = 'w-full rounded-lg border px-3 py-2.5 text-sm text-left transition-all'
            if (!answered) {
              cls += ' border-gray-700 bg-gray-800/30 text-gray-300 hover:border-gray-500 hover:bg-gray-800/60 cursor-pointer'
            } else if (isCorrect) {
              cls += ' border-green-600 bg-green-900/20 text-green-300 cursor-default'
            } else if (isSelected) {
              cls += ' border-red-600 bg-red-900/20 text-red-300 cursor-default'
            } else {
              cls += ' border-gray-800 bg-gray-900/20 text-gray-600 opacity-50 cursor-default'
            }
            return (
              <button key={idx} onClick={() => handleAnswer(idx)} disabled={answered} className={cls}>
                <span className="mr-2 font-mono text-xs opacity-60">
                  {['A', 'B', 'C', 'D'][idx]}
                </span>
                {opt}
                {answered && isCorrect && <span className="ml-1 text-green-400">✓</span>}
                {answered && isSelected && !isCorrect && <span className="ml-1 text-red-400">✗</span>}
              </button>
            )
          })}
        </div>

        {/* Explanation */}
        {answered && (
          <>
            <div className={`rounded-lg border p-3 text-sm ${
              answers[current] === q.correct
                ? 'border-green-800/40 bg-green-900/20'
                : 'border-red-800/40 bg-red-900/20'
            }`}>
              <p className="mb-1 flex items-center gap-2">
                <span className={answers[current] === q.correct ? 'text-green-400' : 'text-red-400'}>
                  {answers[current] === q.correct ? '✓ Correct.' : '✗ Not quite.'}
                </span>
                <span className="rounded-full border border-orange-800/40 bg-orange-950/30 px-2 py-0.5 font-mono text-xs text-orange-400">
                  {q.tag}
                </span>
              </p>
              <p className="text-xs text-gray-300 leading-relaxed">{q.explain}</p>
            </div>
            <button
              onClick={handleNext}
              className="w-full rounded-lg bg-indigo-600 py-2 text-sm font-semibold text-white transition-colors hover:bg-indigo-500"
            >
              {current < QUIZ.length - 1 ? 'Next question →' : 'See results'}
            </button>
          </>
        )}
      </div>
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
          AI chatbots can sound completely confident while being completely wrong.
          This isn't a glitch you can patch — it's baked into how they're built.
          Here's why it happens, and what you can do about it.
        </p>
      </section>

      <Section number={1} title="Why Models Hallucinate">
        <p className="mb-4 text-gray-300 leading-relaxed">
          AI models learn by reading enormous amounts of text and practicing one
          skill: predicting what word comes next. They get remarkably good at
          this — but "predicting what sounds right" and "knowing the truth"
          are not the same thing.
        </p>
        <WhyDiagram />
        <p className="mt-3 text-sm text-gray-500">
          This isn't a bug engineers can simply fix. It's built into the training
          method itself. The techniques below help you work around it — but none
          of them make it disappear entirely.
        </p>
      </Section>

      <Section number={2} title="Types of Hallucinations">
        <p className="mb-4 text-gray-300 leading-relaxed">
          Hallucinations show up in a few different ways. The most dangerous
          aren't the obviously wrong ones — they're the ones that look completely
          believable. Click through the examples below to see each type in action.
        </p>
        <ExamplesGallery />
      </Section>

      <Section number={3} title="How to Mitigate Them">
        <p className="mb-4 text-gray-300 leading-relaxed">
          There's no single trick that prevents all hallucinations. In practice,
          people combine a few of these depending on how high-stakes the task is.
          The more important the output, the more of these you should stack.
        </p>
        <Mitigations />
      </Section>

      <Section number={4} title="Test Yourself">
        <p className="mb-4 text-gray-300 leading-relaxed">
          Each question below shows a real-looking AI response. One thing in each
          response is wrong — sometimes subtly. Can you spot it before checking?
        </p>
        <SpotTheHallucinationQuiz />
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
