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

// ─── Before / after demo ─────────────────────────────────────────────────────

const DEMOS = [
  {
    scenario: 'Customer Support',
    icon: '🛍️',
    prompt: "My order hasn't arrived yet.",
    models: [
      {
        label: 'Base Model',
        tag: 'raw completion',
        color: '#6b7280',
        response:
          "...and it was supposed to arrive by Tuesday. I checked the tracking and it says \"in transit\" but that's been the status for four days now. The package contains a birthday gift and the birthday is tomorrow so I'm getting pretty worried about—",
        note: 'Continues the sentence as if writing a forum post. No awareness that a question was asked.',
      },
      {
        label: 'Instruction-Tuned',
        tag: 'chat assistant',
        color: '#818cf8',
        response:
          "I'm sorry to hear your order hasn't arrived yet. Could you please share your order number so I can look into this? In the meantime, you can check your status under 'My Orders' on your account page.",
        note: 'Reads as a helpful assistant — but generic. Has no access to real account data.',
      },
      {
        label: 'Domain Fine-Tuned',
        tag: 'support specialist',
        color: '#34d399',
        response:
          "I'm sorry about the delay, Sarah. Order #4821-JK (shipped June 18, FedEx 7489234782) is held at the Chicago facility — revised delivery: June 25. I've escalated to fulfilment and applied a $10 credit to your account. Anything else I can help with?",
        note: 'Trained on thousands of real support transcripts — references account data, takes action, matches brand tone.',
      },
    ],
  },
  {
    scenario: 'Medical Q&A',
    icon: '🏥',
    prompt: 'What should I do about a headache?',
    models: [
      {
        label: 'Base Model',
        tag: 'raw completion',
        color: '#6b7280',
        response:
          'A headache, also known as cephalalgia, is a condition of pain in the head. It is one of the most common forms of pain and a major reason for days off work. Headaches can occur as a result of many conditions whether serious or not. There are a number of different classification systems...',
        note: 'Wikipedia-style completion — informative, but not answering the question.',
      },
      {
        label: 'Instruction-Tuned',
        tag: 'chat assistant',
        color: '#818cf8',
        response:
          "For a mild headache: rest in a dark quiet room, drink water (dehydration is a common cause), and take ibuprofen or paracetamol if needed. If your headache is severe, sudden, or comes with a stiff neck, fever, or vision changes, seek medical attention promptly.",
        note: 'Directly answers the question with actionable advice and appropriate safety caveats.',
      },
      {
        label: 'Domain Fine-Tuned',
        tag: 'clinical assistant',
        color: '#34d399',
        response:
          "🟢 First steps: 16oz water now, rest in a dark room 20 min.\n🟡 No relief after 30 min: ibuprofen 400mg or paracetamol 500mg.\n\n⚠️ Seek immediate care if: sudden severe onset, stiff neck + fever, visual disturbances, or headache after head injury.\n\nShall I log this symptom or check for medication interactions?",
        note: 'Trained on clinical decision-support data — structured format, severity flags, follow-up workflow.',
      },
    ],
  },
  {
    scenario: 'Code Review',
    icon: '💻',
    prompt: 'def add(a, b):\n    return a + b',
    models: [
      {
        label: 'Base Model',
        tag: 'raw completion',
        color: '#6b7280',
        response:
          'def subtract(a, b):\n    return a - b\n\ndef multiply(a, b):\n    return a * b\n\ndef divide(a, b):\n    if b == 0:\n        raise ValueError("Cannot divide by zero")\n    return a / b',
        note: 'Autocomplete — adds more functions as if filling out a math utilities file.',
      },
      {
        label: 'Instruction-Tuned',
        tag: 'chat assistant',
        color: '#818cf8',
        response:
          "This function correctly adds two numbers. Suggestions:\n\n1. Add type hints for clarity\n2. Add a docstring\n3. Consider input validation\n\ndef add(a: float, b: float) -> float:\n    \"\"\"Return the sum of a and b.\"\"\"\n    return a + b",
        note: 'Follows instructions — gives a review, but the style and depth depend on the prompt.',
      },
      {
        label: 'Domain Fine-Tuned',
        tag: 'team code reviewer',
        color: '#34d399',
        response:
          "📋 Review: add()\n\n✅ Logic correct\n⚠️  No type hints → add(a: int | float, b: int | float) -> int | float\n⚠️  No docstring (Google-style required)\n⚠️  No input validation — raises TypeError on strings\n❌  No unit tests in context\n\nSeverity: LOW  |  Score: 5/10\nRun: ruff check && add to test suite",
        note: 'Trained on internal review history — enforces team standards, scores output, references tooling.',
      },
    ],
  },
]

function BeforeAfterDemo() {
  const [scenarioIdx, setScenarioIdx] = useState(0)
  const [modelIdx, setModelIdx] = useState(0)

  const demo = DEMOS[scenarioIdx]
  const model = demo.models[modelIdx]

  function selectScenario(i: number) {
    setScenarioIdx(i)
    setModelIdx(0)
  }

  return (
    <div className="space-y-4">
      {/* Scenario selector */}
      <div className="flex flex-wrap gap-2">
        {DEMOS.map((d, i) => (
          <button
            key={d.scenario}
            onClick={() => selectScenario(i)}
            className={`rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors ${
              scenarioIdx === i
                ? 'border-indigo-600 bg-indigo-950/40 text-indigo-300'
                : 'border-gray-800 text-gray-500 hover:border-gray-700 hover:text-gray-300'
            }`}
          >
            {d.icon} {d.scenario}
          </button>
        ))}
      </div>

      {/* Prompt */}
      <div className="rounded-lg border border-gray-800 bg-gray-950/60 px-4 py-3">
        <p className="mb-1 font-mono text-[10px] font-bold tracking-widest text-gray-600">PROMPT</p>
        <pre className="font-mono text-sm text-gray-300 whitespace-pre-wrap">{demo.prompt}</pre>
      </div>

      {/* Model tabs — show progression */}
      <div className="flex items-center gap-1">
        {demo.models.map((m, i) => (
          <div key={m.label} className="flex items-center gap-1">
            <button
              onClick={() => setModelIdx(i)}
              className={`rounded-lg border px-3 py-1.5 text-xs font-medium transition-all ${
                modelIdx === i
                  ? 'text-white'
                  : 'border-gray-800 text-gray-600 hover:border-gray-700 hover:text-gray-400'
              }`}
              style={
                modelIdx === i
                  ? { borderColor: `${m.color}60`, background: `${m.color}15`, color: m.color }
                  : {}
              }
            >
              {m.label}
            </button>
            {i < demo.models.length - 1 && (
              <span className="text-gray-700 text-xs">→</span>
            )}
          </div>
        ))}
      </div>

      {/* Response card */}
      <div
        className="rounded-xl border bg-gray-900/40 p-5 transition-all duration-200"
        style={{ borderColor: `${model.color}30` }}
      >
        <div className="mb-3 flex items-center gap-2">
          <span
            className="rounded-full border px-2.5 py-0.5 font-mono text-xs font-semibold"
            style={{ borderColor: `${model.color}50`, color: model.color, background: `${model.color}15` }}
          >
            {model.tag}
          </span>
        </div>
        <pre className="mb-4 whitespace-pre-wrap font-mono text-sm leading-relaxed text-gray-300">
          {model.response}
        </pre>
        <div className="border-t border-white/5 pt-3">
          <p className="text-xs text-gray-500 leading-relaxed">
            <span className="font-semibold text-gray-400">Why it looks like this: </span>
            {model.note}
          </p>
        </div>
      </div>
    </div>
  )
}

// ─── Approach cards ───────────────────────────────────────────────────────────

const APPROACHES = [
  {
    name: 'Full Fine-Tuning',
    icon: '🔄',
    color: '#818cf8',
    what: 'Every single weight in the model is updated on your new data — the same process used to train it originally, just on a much smaller, specific dataset.',
    analogy: 'Like a surgeon spending a year retraining as a cardiologist — they learn everything from scratch again, but focused on one specialty.',
    good: ['Maximum adaptation to your domain', 'Best possible performance on your specific task'],
    bad: ['Extremely expensive — needs many GPUs', 'Risk of "forgetting" general knowledge', 'Requires thousands of examples'],
    used: 'Large companies training domain-specific models (e.g. a legal AI, a medical AI)',
  },
  {
    name: 'LoRA / PEFT',
    icon: '🔌',
    color: '#34d399',
    what: 'Instead of changing the whole model, you attach small "adapter" layers and train only those. The original model stays frozen. The adapters are tiny — often less than 1% of the total size.',
    analogy: 'Like adding a plug-in to your brain instead of replacing it. The plug-in handles the new specialty; everything else stays the same.',
    good: ['Cheap enough to run on a single GPU', 'Swappable — one base model, many adapters', 'Preserves general knowledge'],
    bad: ['Slightly less adaptive than full fine-tuning', 'Still needs hundreds of quality examples'],
    used: 'Most practical fine-tuning today — open-source models like LLaMA, Mistral',
  },
  {
    name: 'Instruction Tuning',
    icon: '📋',
    color: '#f59e0b',
    what: 'Train the model specifically on examples of instructions and good responses. This is how a raw "predict the next word" model becomes a helpful assistant that actually follows directions.',
    analogy: 'Like teaching an expert to communicate. They already know the subject — you\'re training them to explain things clearly when asked.',
    good: ['Transforms a base model into a chat assistant', 'Requires relatively little data if quality is high', 'What made ChatGPT feel so usable'],
    bad: ['Doesn\'t add new knowledge — only improves how the model communicates it', 'Quality of instruction data matters enormously'],
    used: 'GPT-4, Claude, Gemini — every major chat AI went through instruction tuning',
  },
  {
    name: 'RLHF',
    icon: '👍',
    color: '#f87171',
    what: 'Reinforcement Learning from Human Feedback. Real humans rate model responses, and those ratings train a "reward model" that then guides further training — making the AI optimise for what humans actually prefer.',
    analogy: 'Like hiring a team of editors to rate thousands of drafts, then using their collective taste to automatically guide a writer toward better work.',
    good: ['Aligns the model with human values and preferences', 'Reduces harmful, biased, or unhelpful outputs'],
    bad: ['Very expensive — needs human raters at scale', 'Can cause "reward hacking" if the rating criteria are imprecise'],
    used: 'The technique behind the helpfulness and safety of ChatGPT, Claude, and similar assistants',
  },
]

function ApproachCards() {
  const [active, setActive] = useState(0)
  const a = APPROACHES[active]

  return (
    <div>
      <div className="flex flex-wrap gap-2 mb-5">
        {APPROACHES.map((ap, i) => (
          <button key={ap.name} onClick={() => setActive(i)}
            className="px-3 py-1.5 rounded-lg text-xs font-medium transition-colors border"
            style={active === i
              ? { background: `${ap.color}20`, borderColor: `${ap.color}60`, color: ap.color }
              : { background: 'transparent', borderColor: '#374151', color: '#6b7280' }
            }>
            {ap.icon} {ap.name}
          </button>
        ))}
      </div>

      <div className="rounded-xl border border-gray-800 bg-gray-900/40 p-5 space-y-4">
        <div>
          <p className="text-sm font-semibold mb-2" style={{ color: a.color }}>{a.icon} {a.name}</p>
          <p className="text-sm text-gray-300 leading-relaxed">{a.what}</p>
        </div>
        <div className="rounded-lg bg-gray-900 border border-gray-800 p-3">
          <p className="text-xs text-gray-500 mb-1 font-semibold uppercase tracking-wider">Analogy</p>
          <p className="text-xs text-gray-400 leading-relaxed italic">"{a.analogy}"</p>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <p className="text-xs font-semibold text-emerald-400 mb-1.5">Works well when…</p>
            <ul className="space-y-1">
              {a.good.map(g => (
                <li key={g} className="text-xs text-gray-500 flex gap-1.5 leading-snug">
                  <span className="text-emerald-700 shrink-0 mt-0.5">✓</span>{g}
                </li>
              ))}
            </ul>
          </div>
          <div>
            <p className="text-xs font-semibold text-red-400 mb-1.5">Watch out for…</p>
            <ul className="space-y-1">
              {a.bad.map(b => (
                <li key={b} className="text-xs text-gray-500 flex gap-1.5 leading-snug">
                  <span className="text-red-800 shrink-0 mt-0.5">✗</span>{b}
                </li>
              ))}
            </ul>
          </div>
        </div>
        <div className="border-t border-white/5 pt-3">
          <p className="text-xs text-gray-600"><span className="text-gray-500 font-medium">Used in practice: </span>{a.used}</p>
        </div>
      </div>
    </div>
  )
}

// ─── Fine-tuning vs RAG decision guide ───────────────────────────────────────

const COMPARISON = [
  {
    question: 'Do you need the model to know facts it wasn\'t trained on?',
    rag: { answer: 'Yes — RAG retrieves up-to-date documents at query time', winner: 'rag' },
    ft: { answer: 'No — fine-tuning bakes knowledge in during training; it goes stale', winner: 'rag' },
  },
  {
    question: 'Do you need the model to respond in a specific style or format?',
    rag: { answer: 'Harder — you can prompt for style but results vary', winner: 'ft' },
    ft: { answer: 'Yes — fine-tuning is great for teaching consistent tone, structure, and format', winner: 'ft' },
  },
  {
    question: 'Do you have thousands of high-quality labelled examples?',
    rag: { answer: 'RAG doesn\'t need labelled examples — just source documents', winner: 'rag' },
    ft: { answer: 'You need them — fine-tuning quality depends entirely on training data quality', winner: 'rag' },
  },
  {
    question: 'Do you need to cite sources or show where answers came from?',
    rag: { answer: 'Yes — RAG knows exactly which documents it used', winner: 'rag' },
    ft: { answer: 'No — fine-tuned knowledge is baked in with no traceable source', winner: 'rag' },
  },
  {
    question: 'Is your task a specific skill rather than a knowledge question?',
    rag: { answer: 'RAG doesn\'t improve skills — it only adds context', winner: 'ft' },
    ft: { answer: 'Yes — e.g. "always respond as a JSON object" or "always use our brand voice"', winner: 'ft' },
  },
]

function ComparisonTable() {
  return (
    <div className="rounded-xl border border-gray-800 overflow-hidden">
      <div className="grid grid-cols-[1fr_1fr_1fr] text-xs font-semibold">
        <div className="p-3 bg-gray-900 text-gray-400 border-b border-gray-800">Question</div>
        <div className="p-3 bg-indigo-950/40 text-indigo-300 border-b border-gray-800 text-center">RAG</div>
        <div className="p-3 bg-emerald-950/40 text-emerald-300 border-b border-gray-800 text-center">Fine-Tuning</div>
      </div>
      {COMPARISON.map((row, i) => (
        <div key={i} className={`grid grid-cols-[1fr_1fr_1fr] text-xs ${i < COMPARISON.length - 1 ? 'border-b border-gray-800/60' : ''}`}>
          <div className="p-3 text-gray-400 leading-snug bg-gray-900/20">{row.question}</div>
          <div className={`p-3 leading-snug border-l border-gray-800/60 ${row.rag.winner === 'rag' ? 'bg-indigo-950/20 text-indigo-300' : 'text-gray-600'}`}>
            {row.rag.winner === 'rag' && <span className="mr-1">★</span>}
            {row.rag.answer}
          </div>
          <div className={`p-3 leading-snug border-l border-gray-800/60 ${row.ft.winner === 'ft' ? 'bg-emerald-950/20 text-emerald-300' : 'text-gray-600'}`}>
            {row.ft.winner === 'ft' && <span className="mr-1">★</span>}
            {row.ft.answer}
          </div>
        </div>
      ))}
    </div>
  )
}

// ─── Module export ────────────────────────────────────────────────────────────

export function FineTuning({ onComplete, completed }: ModuleProps) {
  return (
    <div className="mx-auto max-w-2xl px-6 py-12 text-white">
      <section className="mb-20 text-center">
        <div className="mb-6 inline-flex h-20 w-20 items-center justify-center rounded-2xl border border-indigo-800 bg-indigo-950/60">
          <span className="text-4xl">🎛️</span>
        </div>
        <h2 className="mb-4 text-4xl font-bold tracking-tight">Fine-Tuning</h2>
        <p className="text-lg text-gray-400 leading-relaxed">
          Pre-trained AI models are generalists — they know a little about everything.
          Fine-tuning is how you turn a generalist into a specialist, by continuing
          to train it on examples from your specific domain or task.
        </p>
      </section>

      <Section number={1} title="What Fine-Tuning Actually Is">
        <p className="mb-4 text-gray-300 leading-relaxed">
          When a model like GPT or LLaMA is first trained, it reads enormous amounts
          of text from across the internet. It learns language, reasoning, facts, and
          patterns — but broadly, not deeply. It's like someone who has read every
          book in a library but never specialised in anything.
        </p>
        <p className="mb-4 text-gray-300 leading-relaxed">
          Fine-tuning picks up where pre-training stopped. You take that general model
          and continue training it — but only on examples from your domain. Customer
          support conversations. Legal documents. Medical records. Code in your
          company's style. The model adjusts its weights to become better at exactly
          what you show it.
        </p>
        <div className="rounded-xl border border-gray-800 bg-gray-900/40 p-4 text-sm text-gray-400 leading-relaxed">
          <p className="font-semibold text-white mb-2">The doctor analogy</p>
          <p>
            A medical student spends years learning biology, chemistry, anatomy —
            general knowledge (pre-training). Then they do a residency in cardiology,
            seeing hundreds of heart cases (fine-tuning). They're still a doctor who
            knows general medicine, but now they're exceptional at one specialty.
            Fine-tuning works the same way.
          </p>
        </div>
        <p className="mt-4 text-sm text-gray-500 leading-relaxed">
          One important risk: <strong className="text-gray-400">catastrophic forgetting</strong>.
          If you train too hard on a narrow dataset, the model can start to lose its
          general abilities. It's like a doctor who studies cardiology so intensely
          they forget how to treat a broken arm. Techniques like LoRA (below) help
          prevent this.
        </p>
      </Section>

      <Section number={2} title="See the Difference">
        <p className="mb-4 text-gray-300 leading-relaxed">
          The same prompt sent to a base model, an instruction-tuned model, and a
          domain fine-tuned model produces three very different responses. Pick a
          scenario and click through the progression to see exactly what each
          stage of fine-tuning adds.
        </p>
        <BeforeAfterDemo />
      </Section>

      <Section number={3} title="Four Ways to Fine-Tune">
        <p className="mb-4 text-gray-300 leading-relaxed">
          "Fine-tuning" isn't one single thing — it's a family of techniques with
          very different costs, risks, and use cases. Click each one to understand
          what it does and when to reach for it.
        </p>
        <ApproachCards />
      </Section>

      <Section number={4} title="Fine-Tuning vs RAG — When to Use Which">
        <p className="mb-4 text-gray-300 leading-relaxed">
          Fine-tuning and RAG both solve a version of the same problem: "how do I
          make this AI more useful for my specific situation?" But they solve it
          very differently, and choosing the wrong one is expensive. Use the table
          below to guide the decision. Highlighted cells (★) show which approach
          wins for each question.
        </p>
        <ComparisonTable />
        <p className="mt-4 text-sm text-gray-500 leading-relaxed">
          In practice, many production systems use both together: RAG to inject
          up-to-date facts at query time, and fine-tuning to enforce a consistent
          response style and domain vocabulary. They're not mutually exclusive.
        </p>
      </Section>

      <Section number={5} title="What You Actually Need to Fine-Tune">
        <p className="mb-4 text-gray-300 leading-relaxed">
          The most common misconception: fine-tuning requires massive compute.
          With modern techniques like LoRA, you can fine-tune a capable model on
          a single consumer GPU in a few hours. What you actually can't shortcut
          is the data.
        </p>
        <div className="grid gap-3 sm:grid-cols-3">
          {[
            {
              title: 'Quality examples',
              icon: '📄',
              body: 'A few hundred excellent examples beats thousands of mediocre ones. Garbage in, garbage out — more so than in almost any other part of AI.',
            },
            {
              title: 'A clear task definition',
              icon: '🎯',
              body: 'Fine-tuning works best when the task is specific and consistent. "Be helpful" is too vague. "Always respond as structured JSON with these exact fields" is ideal.',
            },
            {
              title: 'Evaluation criteria',
              icon: '📏',
              body: 'You need a way to measure whether the fine-tuned model is actually better. Without this, you\'re flying blind and might be making things worse.',
            },
          ].map(({ title, icon, body }) => (
            <div key={title} className="rounded-xl border border-gray-800 bg-gray-900/40 p-4">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-lg">{icon}</span>
                <p className="text-sm font-semibold">{title}</p>
              </div>
              <p className="text-xs text-gray-500 leading-relaxed">{body}</p>
            </div>
          ))}
        </div>
        <p className="mt-4 text-sm text-gray-500 leading-relaxed">
          The open-source ecosystem makes this increasingly accessible. Models like
          LLaMA, Mistral, and Phi can be fine-tuned with tools like Hugging Face's
          PEFT library or Unsloth on hardware most developers already have access to.
        </p>
      </Section>

      <section className="mt-4 rounded-2xl border border-indigo-900/60 bg-indigo-950/30 p-8 text-center">
        <div className="mb-2 text-2xl">{completed ? '✅' : '🎯'}</div>
        <h3 className="mb-2 text-xl font-bold">{completed ? 'Module Complete' : 'Ready to mark this done?'}</h3>
        <p className="mb-6 text-sm text-gray-400">
          {completed
            ? 'You understand how pre-trained models are adapted to specific tasks.'
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
