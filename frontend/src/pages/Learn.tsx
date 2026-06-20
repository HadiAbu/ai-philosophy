import { type ComponentType, useState } from 'react'
import { Link, Navigate, useNavigate, useParams } from 'react-router-dom'

import { NODES_BY_ID } from '../data/nodes'
import { useProgress } from '../hooks/useProgress'
import { Attention } from './modules/Attention'
import { NeuralNetworks } from './modules/NeuralNetworks'
import { Tokenization } from './modules/Tokenization'
import { Transformers } from './modules/Transformers'
import { WhatIsAI } from './modules/WhatIsAI'

type ModuleProps = {
  onComplete: () => Promise<void>
  completed: boolean
}

const MODULES: Record<string, ComponentType<ModuleProps>> = {
  'what-is-ai': WhatIsAI,
  'neural-networks': NeuralNetworks,
  'transformers': Transformers,
  'tokenization': Tokenization,
  'attention': Attention,
}

export function Learn() {
  const { nodeId } = useParams<{ nodeId: string }>()
  const navigate = useNavigate()
  const { completed, markComplete, markIncomplete } = useProgress()
  const [completing, setCompleting] = useState(false)
  const [unmarking, setUnmarking] = useState(false)

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
      navigate('/')
    } finally {
      setCompleting(false)
    }
  }

  async function handleMarkIncomplete() {
    if (unmarking || !isCompleted) return
    setUnmarking(true)
    try {
      await markIncomplete(nodeId!)
    } finally {
      setUnmarking(false)
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
            <div className="ml-auto flex items-center gap-2">
              <span className="rounded-full bg-indigo-900/60 px-3 py-1 text-xs font-medium text-indigo-300">
                Completed ✓
              </span>
              <button
                onClick={handleMarkIncomplete}
                disabled={unmarking}
                className="text-xs text-gray-600 transition-colors hover:text-gray-400 disabled:opacity-40"
              >
                {unmarking ? 'Removing…' : 'Mark incomplete'}
              </button>
            </div>
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
