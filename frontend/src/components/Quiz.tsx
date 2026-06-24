import { useState } from 'react'

export type QuizQuestion = {
  q: string
  options: string[]
  answer: number
  explanation: string
}

type Props = {
  questions: QuizQuestion[]
  title?: string
}

export function Quiz({ questions, title = 'Quiz' }: Props) {
  const [idx, setIdx] = useState(0)
  const [selected, setSelected] = useState<number | null>(null)
  const [score, setScore] = useState(0)
  const [done, setDone] = useState(false)

  const q = questions[idx]
  const answered = selected !== null

  function pick(i: number) {
    if (answered) return
    setSelected(i)
    if (i === q.answer) setScore((s) => s + 1)
  }

  function next() {
    if (idx + 1 >= questions.length) {
      setDone(true)
    } else {
      setIdx((i) => i + 1)
      setSelected(null)
    }
  }

  function reset() {
    setIdx(0)
    setSelected(null)
    setScore(0)
    setDone(false)
  }

  if (done) {
    const pct = score / questions.length
    const emoji = pct === 1 ? '🏆' : pct >= 0.7 ? '👍' : pct >= 0.4 ? '🤔' : '📚'
    const msg =
      pct === 1
        ? 'Perfect score!'
        : pct >= 0.7
          ? 'Great work!'
          : pct >= 0.4
            ? 'Good effort — review the sections above.'
            : 'Try re-reading the sections above.'
    return (
      <div className="rounded-xl border border-gray-800 bg-gray-900/40 p-6 text-center">
        <div className="mb-3 text-4xl">{emoji}</div>
        <p className="mb-1 text-2xl font-bold text-white">
          {score} / {questions.length}
        </p>
        <p className="mb-6 text-sm text-gray-400">{msg}</p>
        <button
          onClick={reset}
          className="rounded-lg border border-gray-700 px-5 py-2 text-sm text-gray-300 transition-colors hover:text-white"
        >
          Try again
        </button>
      </div>
    )
  }

  return (
    <div className="rounded-xl border border-gray-800 bg-gray-900/40 p-5">
      <div className="mb-4 flex items-center justify-between">
        <p className="font-mono text-[10px] font-bold tracking-widest text-gray-600">
          {title.toUpperCase()} · {idx + 1} / {questions.length}
        </p>
        <div className="flex gap-1">
          {questions.map((_, i) => (
            <div
              key={i}
              className={`h-1.5 w-5 rounded-full transition-colors ${
                i < idx ? 'bg-indigo-500' : i === idx ? 'bg-indigo-400' : 'bg-gray-800'
              }`}
            />
          ))}
        </div>
      </div>

      <p className="mb-4 text-sm font-medium leading-relaxed text-white">{q.q}</p>

      <div className="mb-4 space-y-2">
        {q.options.map((opt, i) => {
          let cls =
            'border-gray-800 bg-gray-900/60 text-gray-300 hover:border-gray-600 hover:text-white'
          if (answered) {
            if (i === q.answer) cls = 'border-emerald-700 bg-emerald-950/40 text-emerald-300'
            else if (i === selected) cls = 'border-red-800 bg-red-950/30 text-red-400'
            else cls = 'border-gray-800 bg-gray-900/30 text-gray-600'
          }
          return (
            <button
              key={i}
              onClick={() => pick(i)}
              disabled={answered}
              className={`w-full rounded-lg border px-4 py-2.5 text-left text-xs transition-colors disabled:cursor-default ${cls}`}
            >
              <span className="mr-2 font-mono text-gray-500">
                {String.fromCharCode(65 + i)}.
              </span>
              {opt}
            </button>
          )
        })}
      </div>

      {answered && (
        <div className="mb-4 rounded-lg border-l-2 border-l-indigo-700 bg-gray-800/50 px-4 py-3 text-xs leading-relaxed text-gray-400">
          <span className="font-semibold text-white">
            {selected === q.answer ? '✓ Correct. ' : '✗ Not quite. '}
          </span>
          {q.explanation}
        </div>
      )}

      {answered && (
        <button
          onClick={next}
          className="w-full rounded-lg bg-indigo-600 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-indigo-500"
        >
          {idx + 1 >= questions.length ? 'See results →' : 'Next →'}
        </button>
      )}
    </div>
  )
}
