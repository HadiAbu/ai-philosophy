import { useState } from 'react'

interface Props {
  onComplete: () => Promise<void>
  completed: boolean
}

export function WhatIsAI({ onComplete, completed }: Props) {
  return (
    <div className="mx-auto max-w-2xl px-6 py-12 text-white">
      {/* Hero */}
      <section className="mb-20 text-center">
        <div className="mb-6 inline-flex h-20 w-20 items-center justify-center rounded-2xl border border-indigo-800 bg-indigo-950/60">
          <span className="text-4xl">🧠</span>
        </div>
        <h2 className="mb-4 text-4xl font-bold tracking-tight">
          What is Artificial Intelligence?
        </h2>
        <p className="text-lg text-gray-400 leading-relaxed">
          You've heard the term a thousand times. Here's what it actually means,
          how it works, and why it matters — explained simply.
        </p>
      </section>

      {/* Section 1 — Definition */}
      <Section number={1} title="The Simple Definition">
        <p className="mb-6 text-gray-300 leading-relaxed">
          <span className="font-semibold text-white">Artificial Intelligence</span> means a computer
          that can do things we used to think only humans could do — understand language, recognise
          faces, make decisions, and get better at tasks over time.
        </p>
        <p className="mb-8 text-gray-300 leading-relaxed">
          The key difference from normal software is <em>learning</em>. A regular program follows
          instructions a programmer typed in. An AI discovers its own instructions by studying
          massive amounts of examples. Show it ten million photos of cats with the label "cat,"
          and it figures out what makes a cat a cat — without anyone writing those rules by hand.
        </p>
        <div className="grid grid-cols-3 gap-4">
          <FactCard icon="📷" stat="~10M" desc="images an AI might train on to learn 'cat'" />
          <FactCard icon="📝" stat="~1T" desc="words a large language model reads during training" />
          <FactCard icon="♟️" stat="~29M" desc="games of chess AlphaZero played against itself" />
        </div>
      </Section>

      {/* Section 2 — AI Family */}
      <Section number={2} title="The AI Family Tree">
        <p className="mb-8 text-gray-300 leading-relaxed">
          "AI", "Machine Learning", and "Deep Learning" get thrown around like they all mean the
          same thing. They don't. Think of them as circles inside circles — each one is a specific
          type of the one outside it.
        </p>
        <AiFamilyDiagram />
        <div className="mt-8 space-y-3">
          <DefinitionRow
            term="Artificial Intelligence"
            color="text-indigo-300"
            def="The broad idea of machines doing things that normally require human smarts — recognising speech, making decisions, translating languages."
          />
          <DefinitionRow
            term="Machine Learning"
            color="text-violet-300"
            def="A way to build AI where the machine learns from examples instead of following hand-written rules. Most modern AI is machine learning."
          />
          <DefinitionRow
            term="Deep Learning"
            color="text-purple-300"
            def="A powerful type of machine learning that uses networks of artificial neurons stacked in layers. It's the engine behind ChatGPT, image generators, and voice assistants."
          />
        </div>
      </Section>

      {/* Section 3 — How AI learns */}
      <Section number={3} title="How AI Learns">
        <p className="mb-8 text-gray-300 leading-relaxed">
          Teaching an AI works a bit like training a dog. You show it a situation, it makes a
          guess, you reward it when it's right and correct it when it's wrong. Repeat this millions
          of times — automatically, without a person watching each step — and it gets very good.
          Click through the loop below to see each stage in detail.
        </p>
        <AnimatedLearningLoop />
        <p className="mt-8 text-sm text-gray-500 leading-relaxed">
          Each time the AI adjusts to do better, it tweaks millions of tiny numbers inside itself
          called <span className="text-gray-400">weights</span> — think of them as dials, each
          controlling how much the AI pays attention to one small piece of information. A model
          like GPT-4 has hundreds of billions of these dials. "Training" just means finding the
          right setting for all of them.
        </p>
      </Section>

      {/* Section 4 — AI today */}
      <Section number={4} title="AI in the Real World">
        <p className="mb-8 text-gray-300 leading-relaxed">
          AI is already woven into tools billions of people use every day — often without
          realising it. The technology behind each one is different in detail, but the core idea
          is always the same: a machine that learned patterns from enormous amounts of data.
        </p>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 mb-10">
          <UseCaseCard icon="💬" title="Language Models" desc="ChatGPT, Claude, Gemini — predict the next word, trillions of times" />
          <UseCaseCard icon="🎨" title="Image Generation" desc="Midjourney, DALL·E — learned from billions of labelled images" />
          <UseCaseCard icon="🎵" title="Recommendations" desc="Spotify, Netflix, YouTube — pattern-match your taste" />
          <UseCaseCard icon="🚗" title="Self-driving" desc="Tesla FSD, Waymo — fusing cameras, radar, and learned rules" />
          <UseCaseCard icon="🔬" title="Medical imaging" desc="Cancer detection, retinal scans — often outperforming radiologists" />
          <UseCaseCard icon="🌐" title="Translation" desc="DeepL, Google Translate — trained on web-scale bilingual text" />
        </div>
        <p className="mb-4 text-sm text-gray-400 leading-relaxed">
          Not every task needs AI, though. Some things are handled perfectly by traditional code.
          Can you tell the difference? Give it a try:
        </p>
        <AiOrCodeQuiz />
      </Section>

      {/* Complete */}
      <section className="mt-20 rounded-2xl border border-indigo-900/60 bg-indigo-950/30 p-8 text-center">
        <div className="mb-2 text-2xl">{completed ? '✅' : '🎯'}</div>
        <h3 className="mb-2 text-xl font-bold">
          {completed ? 'Module Complete' : 'Ready to mark this done?'}
        </h3>
        <p className="mb-6 text-sm text-gray-400">
          {completed
            ? "You've covered the foundations of AI. The next node unlocks when its module is built."
            : "You've covered the foundations of AI. Mark this complete to track your progress."}
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

// ─── Animated Learning Loop ───────────────────────────────────────────────────

const LOOP_STEPS = [
  {
    icon: '📊',
    label: 'Data',
    sub: 'labelled examples',
    detail:
      'Thousands of examples with correct answers — like photos labelled "cat" or "not cat". The more varied and accurate the data, the better the AI will learn.',
  },
  {
    icon: '🔮',
    label: 'Predict',
    sub: 'make a guess',
    detail:
      'The model looks at a new example and outputs a prediction based on its current internal settings. At first, these guesses are nearly random.',
  },
  {
    icon: '📏',
    label: 'Measure',
    sub: 'how wrong?',
    detail:
      'Compare the prediction to the correct answer. The difference is called the loss. The bigger the loss, the more wrong the model was — the goal is to shrink it toward zero.',
  },
  {
    icon: '⚙️',
    label: 'Adjust',
    sub: 'update weights',
    detail:
      'Tweak the model\'s internal numbers very slightly so that it would have predicted better this time. Repeat the whole loop millions of times and the model steadily improves.',
  },
]

function AnimatedLearningLoop() {
  const [step, setStep] = useState(0)

  const advance = () => setStep(s => (s + 1) % LOOP_STEPS.length)

  return (
    <div>
      <div className="flex items-start justify-between gap-2">
        {LOOP_STEPS.map((s, i) => {
          const isActive = i === step
          const isPast = i < step
          return (
            <div key={s.label} className="flex flex-1 items-start">
              <button
                onClick={() => setStep(i)}
                className={`flex-1 rounded-xl border p-3 text-center transition-all duration-300 ${
                  isActive
                    ? 'border-indigo-500 bg-indigo-950/60 shadow-lg shadow-indigo-500/10'
                    : isPast
                    ? 'border-indigo-900/60 bg-gray-900/40 opacity-70'
                    : 'border-gray-800 bg-gray-900/40 opacity-40'
                }`}
              >
                <div className="mb-1 text-2xl">{s.icon}</div>
                <div className={`text-sm font-semibold ${isActive ? 'text-indigo-200' : 'text-gray-500'}`}>
                  {s.label}
                </div>
                <div className="text-xs text-gray-600">{s.sub}</div>
              </button>
              {i < LOOP_STEPS.length - 1 && (
                <div
                  className={`mx-1 mt-6 text-lg transition-colors duration-300 ${
                    isPast || isActive ? 'text-indigo-400' : 'text-gray-700'
                  }`}
                >
                  →
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Detail panel */}
      <div className="mt-4 min-h-[64px] rounded-lg border border-indigo-900/40 bg-indigo-950/20 p-4">
        <p className="text-sm leading-relaxed text-gray-300">
          <span className="font-semibold text-indigo-300">
            Step {step + 1} — {LOOP_STEPS[step].label}:{' '}
          </span>
          {LOOP_STEPS[step].detail}
        </p>
      </div>

      <div className="mt-3 flex items-center justify-between">
        <div className="flex gap-1.5">
          {LOOP_STEPS.map((_, i) => (
            <div
              key={i}
              className={`h-1.5 w-6 rounded-full transition-colors duration-300 ${
                i === step ? 'bg-indigo-400' : i < step ? 'bg-indigo-800' : 'bg-gray-700'
              }`}
            />
          ))}
        </div>
        <button
          onClick={advance}
          className="flex items-center gap-1 text-sm text-indigo-400 transition-colors hover:text-indigo-300"
        >
          {step === LOOP_STEPS.length - 1 ? '↩ Loop back' : 'Next step →'}
        </button>
      </div>
    </div>
  )
}

// ─── AI or Traditional Code Quiz ─────────────────────────────────────────────

const QUIZ_QUESTIONS = [
  {
    task: 'Sort a list of numbers from smallest to largest',
    isAI: false,
    explain:
      'Sorting follows a fixed algorithm — the steps never change regardless of the data. Traditional code handles this perfectly.',
  },
  {
    task: 'Recognise whether a photo contains a dog',
    isAI: true,
    explain:
      "A programmer can't write rules for every breed, angle, and lighting condition. AI learns these patterns from millions of labelled photos.",
  },
  {
    task: 'Calculate the square root of a number',
    isAI: false,
    explain:
      'Square roots follow a precise mathematical formula. There\'s nothing to "learn" — the answer is always the same for the same input.',
  },
  {
    task: 'Transcribe someone\'s spoken words into text',
    isAI: true,
    explain:
      'Speech varies wildly by accent, pace, and background noise. AI learns from thousands of hours of human speech to handle this variety.',
  },
  {
    task: 'Check if a password is longer than 8 characters',
    isAI: false,
    explain:
      'Count the characters, compare the number — that\'s it. A single line of code handles this. No learning or patterns needed.',
  },
  {
    task: 'Detect spam email from its content',
    isAI: true,
    explain:
      'Spammers constantly evolve their language to evade filters. AI learns from millions of examples and keeps adapting to new tricks.',
  },
]

function AiOrCodeQuiz() {
  const [current, setCurrent] = useState(0)
  const [answers, setAnswers] = useState<(boolean | null)[]>(
    Array(QUIZ_QUESTIONS.length).fill(null),
  )
  const [done, setDone] = useState(false)

  const q = QUIZ_QUESTIONS[current]
  const answered = answers[current] !== null
  const userAnswer = answers[current]
  const score = answers.filter((a, i) => a === QUIZ_QUESTIONS[i].isAI).length

  function handleAnswer(isAI: boolean) {
    if (answered) return
    const next = [...answers]
    next[current] = isAI
    setAnswers(next)
  }

  function handleNext() {
    if (current < QUIZ_QUESTIONS.length - 1) {
      setCurrent(c => c + 1)
    } else {
      setDone(true)
    }
  }

  function reset() {
    setCurrent(0)
    setAnswers(Array(QUIZ_QUESTIONS.length).fill(null))
    setDone(false)
  }

  if (done) {
    return (
      <div className="rounded-xl border border-gray-800 bg-gray-900/40 p-6 text-center">
        <div className="mb-3 text-4xl">
          {score === 6 ? '🏆' : score >= 4 ? '👍' : '🤔'}
        </div>
        <div className="mb-1 text-2xl font-bold text-white">
          {score} / {QUIZ_QUESTIONS.length}
        </div>
        <p className="mb-5 text-sm text-gray-400">
          {score === 6
            ? 'Perfect! You have a sharp intuition for when AI is the right tool.'
            : score >= 4
            ? 'Good instincts. AI is best when the rules are too complex to write by hand.'
            : "The key insight: use AI when patterns matter more than fixed rules."}
        </p>
        <button
          onClick={reset}
          className="text-sm text-indigo-400 transition-colors hover:text-indigo-300"
        >
          Try again →
        </button>
      </div>
    )
  }

  return (
    <div className="overflow-hidden rounded-xl border border-gray-800 bg-gray-900/40">
      {/* Progress header */}
      <div className="flex items-center justify-between border-b border-gray-800 px-4 py-3">
        <span className="font-mono text-xs text-gray-500">
          Question {current + 1} of {QUIZ_QUESTIONS.length}
        </span>
        <div className="flex gap-1">
          {QUIZ_QUESTIONS.map((qq, i) => (
            <div
              key={i}
              className={`h-1.5 w-5 rounded-full transition-colors ${
                i < current
                  ? answers[i] === qq.isAI
                    ? 'bg-green-500'
                    : 'bg-red-500'
                  : i === current
                  ? 'bg-indigo-400'
                  : 'bg-gray-700'
              }`}
            />
          ))}
        </div>
      </div>

      <div className="p-5">
        <p className="mb-2 text-xs text-gray-500">
          Does this task need AI, or can traditional code handle it?
        </p>
        <p className="mb-6 text-base font-semibold text-white">"{q.task}"</p>

        <div className="mb-4 grid grid-cols-2 gap-3">
          {(
            [
              { label: '🤖 Needs AI', value: true },
              { label: '💻 Traditional code', value: false },
            ] as const
          ).map(({ label, value }) => {
            const isSelected = userAnswer === value
            const isCorrect = value === q.isAI
            let cls =
              'rounded-lg border p-3 text-sm font-medium transition-all text-left'
            if (!answered) {
              cls += ' border-gray-700 bg-gray-800/40 hover:border-gray-500 hover:bg-gray-800/60 cursor-pointer'
            } else if (isCorrect) {
              cls += ' border-green-600 bg-green-900/20 text-green-300 cursor-default'
            } else if (isSelected) {
              cls += ' border-red-600 bg-red-900/20 text-red-300 cursor-default'
            } else {
              cls += ' border-gray-800 bg-gray-900/20 opacity-40 cursor-default'
            }
            return (
              <button key={String(value)} onClick={() => handleAnswer(value)} disabled={answered} className={cls}>
                {label}
                {answered && isCorrect && <span className="ml-1">✓</span>}
                {answered && isSelected && !isCorrect && <span className="ml-1">✗</span>}
              </button>
            )
          })}
        </div>

        {answered && (
          <>
            <div
              className={`mb-4 rounded-lg border p-3 text-sm ${
                userAnswer === q.isAI
                  ? 'border-green-800/40 bg-green-900/20 text-green-300'
                  : 'border-red-800/40 bg-red-900/20 text-red-300'
              }`}
            >
              <span className="font-semibold">
                {userAnswer === q.isAI ? '✓ Correct. ' : '✗ Not quite. '}
              </span>
              <span className="text-gray-300">{q.explain}</span>
            </div>
            <button
              onClick={handleNext}
              className="w-full rounded-lg bg-indigo-600 py-2 text-sm font-semibold text-white transition-colors hover:bg-indigo-500"
            >
              {current < QUIZ_QUESTIONS.length - 1 ? 'Next question →' : 'See results'}
            </button>
          </>
        )}
      </div>
    </div>
  )
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function Section({
  number,
  title,
  children,
}: {
  number: number
  title: string
  children: React.ReactNode
}) {
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

function FactCard({ icon, stat, desc }: { icon: string; stat: string; desc: string }) {
  return (
    <div className="rounded-xl border border-gray-800 bg-gray-900/50 p-4 text-center">
      <div className="mb-1 text-2xl">{icon}</div>
      <div className="mb-1 text-xl font-bold text-indigo-300">{stat}</div>
      <div className="text-xs text-gray-500 leading-snug">{desc}</div>
    </div>
  )
}

function AiFamilyDiagram() {
  return (
    <svg
      viewBox="0 0 440 260"
      className="mx-auto w-full max-w-md"
      aria-label="Nested circles showing AI contains ML contains Deep Learning"
    >
      <ellipse cx="210" cy="135" rx="200" ry="120" fill="none" stroke="#6366f1" strokeWidth="1.5" opacity="0.6" />
      <text x="30" y="36" fill="#818cf8" fontSize="13" fontWeight="600" opacity="0.85">
        Artificial Intelligence
      </text>
      <ellipse cx="240" cy="155" rx="138" ry="84" fill="none" stroke="#7c3aed" strokeWidth="1.5" opacity="0.7" />
      <text x="125" y="92" fill="#a78bfa" fontSize="12" fontWeight="600" opacity="0.9">
        Machine Learning
      </text>
      <ellipse cx="265" cy="170" rx="78" ry="48" fill="#1e1b4b" stroke="#9333ea" strokeWidth="1.5" />
      <text x="265" y="166" textAnchor="middle" fill="#e9d5ff" fontSize="11" fontWeight="700">
        Deep
      </text>
      <text x="265" y="181" textAnchor="middle" fill="#e9d5ff" fontSize="11" fontWeight="700">
        Learning
      </text>
    </svg>
  )
}

function DefinitionRow({
  term,
  color,
  def,
}: {
  term: string
  color: string
  def: string
}) {
  return (
    <div className="flex gap-3 rounded-lg border border-gray-800/60 bg-gray-900/30 p-3">
      <span className={`mt-0.5 w-44 flex-shrink-0 text-sm font-bold ${color}`}>{term}</span>
      <span className="text-sm text-gray-400 leading-relaxed">{def}</span>
    </div>
  )
}

function UseCaseCard({ icon, title, desc }: { icon: string; title: string; desc: string }) {
  return (
    <div className="rounded-xl border border-gray-800 bg-gray-900/40 p-4">
      <div className="mb-2 text-2xl">{icon}</div>
      <div className="mb-1 text-sm font-semibold text-white">{title}</div>
      <div className="text-xs text-gray-500 leading-snug">{desc}</div>
    </div>
  )
}
