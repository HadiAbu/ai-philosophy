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
          Understanding the technology that's reshaping our world — from the basics
          to the big picture.
        </p>
      </section>

      {/* Section 1 — Definition */}
      <Section number={1} title="The Simple Definition">
        <p className="mb-6 text-gray-300 leading-relaxed">
          <span className="font-semibold text-white">Artificial Intelligence</span> is the ability
          of a computer to perform tasks that typically require human intelligence — things like
          understanding language, recognising images, making decisions, and learning from experience.
        </p>
        <p className="mb-8 text-gray-300 leading-relaxed">
          The key word is <em>learning</em>. Unlike traditional software that follows fixed rules
          you write by hand, an AI system discovers its own rules by studying enormous amounts of
          examples. Show it ten million cat photos and it learns what "cat" means — not because
          you told it, but because it found the pattern itself.
        </p>
        <div className="grid grid-cols-3 gap-4">
          <FactCard
            icon="📷"
            stat="~10M"
            desc="images an AI might train on to learn 'cat'"
          />
          <FactCard
            icon="📝"
            stat="~1T"
            desc="words a large language model reads during training"
          />
          <FactCard
            icon="♟️"
            stat="~29M"
            desc="games of chess AlphaZero played against itself"
          />
        </div>
      </Section>

      {/* Section 2 — AI Family */}
      <Section number={2} title="The AI Family Tree">
        <p className="mb-8 text-gray-300 leading-relaxed">
          "AI", "Machine Learning", and "Deep Learning" are often used interchangeably, but they
          describe different things. Think of them as nested circles — each one is a more
          specific subset of the one around it.
        </p>
        <AiFamilyDiagram />
        <div className="mt-8 space-y-3">
          <DefinitionRow
            term="Artificial Intelligence"
            color="text-indigo-300"
            def="Any technique that lets a machine mimic human-level behaviour — a broad umbrella term."
          />
          <DefinitionRow
            term="Machine Learning"
            color="text-violet-300"
            def="A subset of AI where the machine learns from data rather than explicit rules."
          />
          <DefinitionRow
            term="Deep Learning"
            color="text-purple-300"
            def="A subset of ML using layered neural networks — the engine behind ChatGPT and image models."
          />
        </div>
      </Section>

      {/* Section 3 — How AI learns */}
      <Section number={3} title="How AI Learns">
        <p className="mb-8 text-gray-300 leading-relaxed">
          Training an AI follows a loop. You give it labelled examples, it makes a guess,
          measures how wrong it was, then adjusts its internal parameters to do better next time.
          Repeat this millions of times and the AI gets very good.
        </p>
        <LearningLoop />
        <p className="mt-8 text-sm text-gray-500 leading-relaxed">
          Those internal parameters — called <span className="text-gray-400">weights</span> —
          are what we mean when we say a model has been "trained". A model like GPT-4 has
          hundreds of billions of them.
        </p>
      </Section>

      {/* Section 4 — AI today */}
      <Section number={4} title="AI in the Real World">
        <p className="mb-8 text-gray-300 leading-relaxed">
          AI is already embedded in tools billions of people use every day. The underlying
          techniques vary, but the core idea — machines learning patterns from data — is the same.
        </p>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
          <UseCaseCard icon="💬" title="Language Models" desc="ChatGPT, Claude, Gemini — predict the next word, trillions of times" />
          <UseCaseCard icon="🎨" title="Image Generation" desc="Midjourney, DALL·E — learned from billions of labelled images" />
          <UseCaseCard icon="🎵" title="Recommendations" desc="Spotify, Netflix, YouTube — pattern-match your taste" />
          <UseCaseCard icon="🚗" title="Self-driving" desc="Tesla FSD, Waymo — fusing cameras, radar, and learned rules" />
          <UseCaseCard icon="🔬" title="Medical imaging" desc="Cancer detection, retinal scans — often outperforming radiologists" />
          <UseCaseCard icon="🌐" title="Translation" desc="DeepL, Google Translate — trained on web-scale bilingual text" />
        </div>
      </Section>

      {/* Complete */}
      <section className="mt-20 rounded-2xl border border-indigo-900/60 bg-indigo-950/30 p-8 text-center">
        <div className="mb-2 text-2xl">
          {completed ? '✅' : '🎯'}
        </div>
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
      {/* AI — outer */}
      <ellipse cx="210" cy="135" rx="200" ry="120" fill="none" stroke="#6366f1" strokeWidth="1.5" opacity="0.6" />
      <text x="30" y="36" fill="#818cf8" fontSize="13" fontWeight="600" opacity="0.85">
        Artificial Intelligence
      </text>

      {/* ML — middle */}
      <ellipse cx="240" cy="155" rx="138" ry="84" fill="none" stroke="#7c3aed" strokeWidth="1.5" opacity="0.7" />
      <text x="125" y="92" fill="#a78bfa" fontSize="12" fontWeight="600" opacity="0.9">
        Machine Learning
      </text>

      {/* Deep Learning — inner */}
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

function LearningLoop() {
  const steps = [
    { icon: '📊', label: 'Data', sub: 'labelled examples' },
    { icon: '⚙️', label: 'Train', sub: 'adjust weights' },
    { icon: '🔮', label: 'Predict', sub: 'make a guess' },
    { icon: '📏', label: 'Measure', sub: 'how wrong?' },
  ]

  return (
    <div className="flex items-center justify-between gap-2">
      {steps.map((step, i) => (
        <div key={step.label} className="flex flex-1 items-center">
          <div className="flex-1 rounded-xl border border-indigo-900/60 bg-gray-900/60 p-3 text-center">
            <div className="mb-1 text-2xl">{step.icon}</div>
            <div className="text-sm font-semibold text-indigo-200">{step.label}</div>
            <div className="text-xs text-gray-500">{step.sub}</div>
          </div>
          {i < steps.length - 1 && (
            <div className="mx-1 text-gray-600 text-lg">→</div>
          )}
        </div>
      ))}
    </div>
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
      <span className={`mt-0.5 text-sm font-bold ${color} w-44 flex-shrink-0`}>{term}</span>
      <span className="text-sm text-gray-400 leading-relaxed">{def}</span>
    </div>
  )
}

function UseCaseCard({
  icon,
  title,
  desc,
}: {
  icon: string
  title: string
  desc: string
}) {
  return (
    <div className="rounded-xl border border-gray-800 bg-gray-900/40 p-4">
      <div className="mb-2 text-2xl">{icon}</div>
      <div className="mb-1 text-sm font-semibold text-white">{title}</div>
      <div className="text-xs text-gray-500 leading-snug">{desc}</div>
    </div>
  )
}
