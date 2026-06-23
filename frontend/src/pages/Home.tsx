import { Link } from 'react-router-dom'

import { ConceptMap } from '../components/ConceptMap'
import { useAuth } from '../hooks/useAuth'
import { useProgress } from '../hooks/useProgress'

export function Home() {
  const { logout } = useAuth()
  const { completed, loading } = useProgress()

  return (
    <div className="relative h-screen w-screen overflow-hidden bg-gray-950">
      {/* Floating header */}
      <div className="absolute top-0 left-0 right-0 z-10 flex items-center justify-between px-6 py-4">
        <div>
          <h1 className="text-base font-bold tracking-tight text-white">AI Philosophy</h1>
          <p className="text-xs text-gray-500">Drag to explore — click a node to learn</p>
        </div>
        <div className="flex items-center gap-4">
          <Link
            to="/profile"
            className="text-sm text-gray-400 transition-colors hover:text-white"
          >
            Profile
          </Link>
          <button
            onClick={logout}
            className="text-sm text-gray-500 transition-colors hover:text-white"
          >
            Sign out
          </button>
        </div>
      </div>

      {/* Legend */}
      <div className="absolute bottom-5 left-6 z-10 flex items-center gap-5">
        <LegendItem color="bg-indigo-500" label="Available" />
        <LegendItem color="bg-indigo-800" label="Completed" />
        <LegendItem color="bg-gray-700" label="Locked" />
      </div>

      <div className="absolute bottom-5 left-1/2 -translate-x-1/2 z-10 text-xs text-gray-600">
        © {new Date().getFullYear()} Hadi Abu Hamed
      </div>

      <div className="absolute bottom-5 right-6 z-10 text-xs text-gray-600">
        Scroll to zoom
      </div>

      {loading ? (
        <div className="flex h-full items-center justify-center">
          <div className="h-7 w-7 animate-spin rounded-full border-2 border-indigo-500 border-t-transparent" />
        </div>
      ) : (
        <ConceptMap completed={completed} />
      )}
    </div>
  )
}

function LegendItem({ color, label }: { color: string; label: string }) {
  return (
    <div className="flex items-center gap-2">
      <div className={`h-2.5 w-2.5 rounded-full ${color}`} />
      <span className="text-xs text-gray-500">{label}</span>
    </div>
  )
}
