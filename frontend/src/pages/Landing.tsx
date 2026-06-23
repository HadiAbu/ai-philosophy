import { Link, Navigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

const MODULES = [
  { label: 'What is AI',         icon: '🧠' },
  { label: 'Types of ML',        icon: '🗂️' },
  { label: 'Neural Networks',    icon: '🕸️' },
  { label: 'Activations',        icon: '⚡' },
  { label: 'Transformers',       icon: '🔀' },
  { label: 'Tokenization',       icon: '✂️' },
  { label: 'Attention',          icon: '👁️' },
  { label: 'RAG',                icon: '🔍' },
  { label: 'Embeddings',         icon: '🗺️' },
  { label: 'Retrieval',          icon: '📡' },
  { label: 'Prompt Engineering', icon: '✍️' },
  { label: 'Hallucinations',     icon: '👻' },
  { label: 'Fine-Tuning',        icon: '🎛️' },
  { label: 'Use Cases',          icon: '🛠️' },
]

const FEATURES = [
  {
    icon: '⚡',
    title: 'Hands-on simulations',
    desc: 'Train neurons. Animate attention. Drag weights. Real intuition — not slides.',
  },
  {
    icon: '🎯',
    title: 'No prerequisites',
    desc: 'Start from "what is AI" and go as deep as you like. No maths, no jargon.',
  },
  {
    icon: '🗺️',
    title: 'Your learning path',
    desc: 'A visual concept map that unlocks as you complete modules and progress.',
  },
]

export function Landing() {
  const { userId, loading } = useAuth()

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-950">
        <div className="h-7 w-7 animate-spin rounded-full border-2 border-indigo-500 border-t-transparent" />
      </div>
    )
  }

  if (userId) return <Navigate to="/home" replace />

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* Nav */}
      <nav className="absolute left-0 right-0 top-0 z-10 flex items-center justify-between px-6 py-4">
        <span className="text-base font-bold tracking-tight text-white">AI Philosophy</span>
        <div className="flex items-center gap-3">
          <Link
            to="/login"
            className="text-sm text-gray-400 transition-colors hover:text-white"
          >
            Sign in
          </Link>
          <Link
            to="/register"
            className="rounded-lg bg-indigo-600 px-4 py-1.5 text-sm font-semibold text-white transition-colors hover:bg-indigo-500"
          >
            Start free
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-6 text-center">
        {/* Subtle background glow */}
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              'radial-gradient(ellipse 80% 50% at 50% 40%, rgba(99,102,241,0.08) 0%, transparent 70%)',
          }}
        />

        <div className="relative">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-indigo-800/60 bg-indigo-950/40 px-4 py-1.5 text-xs text-indigo-300">
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-indigo-400" />
            14 interactive modules · completely free
          </div>

          <h1 className="mb-6 max-w-2xl text-5xl font-bold leading-tight tracking-tight sm:text-6xl">
            Learn how AI<br />
            <span className="text-indigo-400">actually works.</span>
          </h1>

          <p className="mx-auto mb-10 max-w-lg text-lg leading-relaxed text-gray-400">
            Interactive modules covering everything from neural networks to
            transformers. Built for curious minds, not engineers.
          </p>

          <div className="flex flex-wrap justify-center gap-4">
            <Link
              to="/register"
              className="rounded-lg bg-indigo-600 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-indigo-500"
            >
              Start learning — it's free →
            </Link>
            <Link
              to="/login"
              className="rounded-lg border border-gray-700 px-6 py-3 text-sm font-semibold text-gray-300 transition-colors hover:border-gray-500 hover:text-white"
            >
              Sign in
            </Link>
          </div>
        </div>

        {/* Scroll hint */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce text-gray-700 text-xs">
          ↓
        </div>
      </section>

      {/* Feature strip */}
      <section className="border-t border-gray-800/60 px-6 py-20">
        <div className="mx-auto grid max-w-3xl gap-6 sm:grid-cols-3">
          {FEATURES.map(({ icon, title, desc }) => (
            <div
              key={title}
              className="rounded-xl border border-gray-800 bg-gray-900/40 p-6"
            >
              <div className="mb-3 text-2xl">{icon}</div>
              <p className="mb-2 text-sm font-semibold text-white">{title}</p>
              <p className="text-xs leading-relaxed text-gray-500">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Module grid */}
      <section className="border-t border-gray-800/60 bg-gray-900/20 px-6 py-20">
        <div className="mx-auto max-w-3xl">
          <h2 className="mb-2 text-center text-2xl font-bold">
            What you'll learn
          </h2>
          <p className="mb-10 text-center text-sm text-gray-500">
            From first principles to production techniques — in the right order.
          </p>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {MODULES.map(({ icon, label }) => (
              <Link
                key={label}
                to="/register"
                className="group flex items-center gap-3 rounded-xl border border-gray-800 bg-gray-900/40 px-4 py-3 transition-all hover:border-indigo-800/60 hover:bg-indigo-950/20"
              >
                <span className="text-xl">{icon}</span>
                <span className="text-sm font-medium text-gray-300 group-hover:text-white transition-colors">
                  {label}
                </span>
              </Link>
            ))}
          </div>

          <p className="mt-6 text-center text-xs text-gray-600">
            Sign up to unlock the interactive concept map and track your progress.
          </p>
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="border-t border-gray-800/60 px-6 py-24 text-center">
        <h2 className="mb-3 text-3xl font-bold">Ready to start?</h2>
        <p className="mb-8 text-gray-400">It's free. No credit card required.</p>
        <Link
          to="/register"
          className="rounded-lg bg-indigo-600 px-8 py-3 text-sm font-semibold text-white transition-colors hover:bg-indigo-500"
        >
          Create account →
        </Link>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-800/60 px-6 py-6 text-center text-xs text-gray-700">
        © {new Date().getFullYear()} Hadi Abu Hamed
      </footer>
    </div>
  )
}
