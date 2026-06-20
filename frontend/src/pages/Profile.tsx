import { Link } from 'react-router-dom'

import { NODES } from '../data/nodes'
import { useAuth } from '../hooks/useAuth'
import { useProgress } from '../hooks/useProgress'

export function Profile() {
  const { logout } = useAuth()
  const { completed, loading } = useProgress()

  const total = NODES.length
  const done = completed.size
  const pct = total === 0 ? 0 : Math.round((done / total) * 100)

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* Header */}
      <div className="border-b border-gray-800/60">
        <div className="mx-auto flex max-w-2xl items-center gap-3 px-6 py-4">
          <Link
            to="/"
            className="flex items-center gap-1.5 text-sm text-gray-400 transition-colors hover:text-white"
          >
            <span>←</span>
            <span>Map</span>
          </Link>
          <div className="h-4 w-px bg-gray-700" />
          <span className="text-sm font-semibold">Profile</span>
          <button
            onClick={logout}
            className="ml-auto text-sm text-gray-500 transition-colors hover:text-white"
          >
            Sign out
          </button>
        </div>
      </div>

      <div className="mx-auto max-w-2xl px-6 py-10">
        {/* Progress summary */}
        <div className="mb-8 rounded-2xl border border-gray-800 bg-gray-900/40 p-6">
          <div className="mb-4 flex items-end justify-between">
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Overall progress</p>
              <p className="text-3xl font-bold">
                {loading ? '—' : `${done} / ${total}`}
              </p>
              <p className="text-sm text-gray-500">concepts completed</p>
            </div>
            <div className="text-right">
              <p className="text-4xl font-bold text-indigo-400">{loading ? '—' : `${pct}%`}</p>
            </div>
          </div>

          {/* Progress bar */}
          <div className="h-2 overflow-hidden rounded-full bg-gray-800">
            <div
              className="h-full rounded-full bg-indigo-500 transition-all duration-700"
              style={{ width: loading ? '0%' : `${pct}%` }}
            />
          </div>
        </div>

        {/* Node list */}
        <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-gray-500">
          Concept Map
        </h2>
        <div className="space-y-2">
          {NODES.map((node) => {
            const isCompleted = completed.has(node.id)
            const isAvailable = node.available

            return (
              <div
                key={node.id}
                className="flex items-center gap-4 rounded-xl border border-gray-800/60 bg-gray-900/30 px-4 py-3"
              >
                <StatusDot completed={isCompleted} available={isAvailable} />
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-medium ${isCompleted || isAvailable ? 'text-white' : 'text-gray-600'}`}>
                    {node.label}
                  </p>
                  <p className="text-xs text-gray-600 truncate">{node.description}</p>
                </div>
                {isCompleted && (
                  <span className="text-xs text-indigo-400 font-medium">✓</span>
                )}
                {isAvailable && !isCompleted && (
                  <Link
                    to={`/learn/${node.id}`}
                    className="text-xs font-medium text-indigo-400 transition-colors hover:text-indigo-300"
                  >
                    Start →
                  </Link>
                )}
                {!isAvailable && !isCompleted && (
                  <span className="text-xs text-gray-700">Locked</span>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

function StatusDot({
  completed,
  available,
}: {
  completed: boolean
  available: boolean
}) {
  if (completed) {
    return <div className="h-2.5 w-2.5 flex-shrink-0 rounded-full bg-indigo-500" />
  }
  if (available) {
    return (
      <div className="h-2.5 w-2.5 flex-shrink-0 rounded-full border-2 border-indigo-500 animate-pulse" />
    )
  }
  return <div className="h-2.5 w-2.5 flex-shrink-0 rounded-full bg-gray-700" />
}
