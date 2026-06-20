import { type ComponentType, useState } from 'react'
import { Link, Navigate, useParams } from 'react-router-dom'

import { NODES_BY_ID } from '../data/nodes'
import { useProgress } from '../hooks/useProgress'
import { WhatIsAI } from './modules/WhatIsAI'

type ModuleProps = {
  onComplete: () => Promise<void>
  completed: boolean
}

const MODULES: Record<string, ComponentType<ModuleProps>> = {
  'what-is-ai': WhatIsAI,
}

export function Learn() {
  const { nodeId } = useParams<{ nodeId: string }>()
  const { completed, markComplete } = useProgress()
  const [completing, setCompleting] = useState(false)

  if (!nodeId || !NODES_BY_ID[nodeId] || !MODULES[nodeId]) {
    return <Navigate to="/" replace />
  }

  const node = NODES_BY_ID[nodeId]
  const Module = MODULES[nodeId]
  const isCompleted = completed.has(nodeId)

  async function handleComplete() {
    if (completing || isCompleted) return
    setCompleting(true)
    try {
      await markComplete(nodeId!)
    } finally {
      setCompleting(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* Sticky header */}
      <div className="sticky top-0 z-10 border-b border-gray-800/60 bg-gray-950/90 backdrop-blur">
        <div className="mx-auto flex max-w-2xl items-center gap-3 px-6 py-4">
          <Link
            to="/"
            className="flex items-center gap-1.5 text-sm text-gray-400 transition-colors hover:text-white"
          >
            <span>←</span>
            <span>Map</span>
          </Link>
          <div className="h-4 w-px bg-gray-700" />
          <span className="text-sm font-semibold text-white">{node.label}</span>
          {isCompleted && (
            <span className="ml-auto rounded-full bg-indigo-900/60 px-3 py-1 text-xs font-medium text-indigo-300">
              Completed ✓
            </span>
          )}
        </div>
      </div>

      <Module
        onComplete={handleComplete}
        completed={isCompleted}
      />
    </div>
  )
}
