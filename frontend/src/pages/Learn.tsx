import { lazy, Suspense, useState } from 'react'
import { Link, Navigate, useNavigate, useParams } from 'react-router-dom'

import { ErrorBoundary } from '../components/ErrorBoundary'
import { NODES_BY_ID } from '../data/nodes'
import { useProgress } from '../hooks/useProgress'

// Lazy-load each module so only the requested module's chunk is fetched.
// Named exports need to be re-wrapped as default exports for React.lazy.
const MODULES = {
  'what-is-ai':         lazy(() => import('./modules/WhatIsAI').then(m => ({ default: m.WhatIsAI }))),
  'types-of-ml':        lazy(() => import('./modules/TypesOfML').then(m => ({ default: m.TypesOfML }))),
  'neural-networks':    lazy(() => import('./modules/NeuralNetworks').then(m => ({ default: m.NeuralNetworks }))),
  'activations':        lazy(() => import('./modules/Activations').then(m => ({ default: m.Activations }))),
  'transformers':       lazy(() => import('./modules/Transformers').then(m => ({ default: m.Transformers }))),
  'tokenization':       lazy(() => import('./modules/Tokenization').then(m => ({ default: m.Tokenization }))),
  'attention':          lazy(() => import('./modules/Attention').then(m => ({ default: m.Attention }))),
  'rag':                lazy(() => import('./modules/RAG').then(m => ({ default: m.RAG }))),
  'embeddings':         lazy(() => import('./modules/Embeddings').then(m => ({ default: m.Embeddings }))),
  'retrieval':          lazy(() => import('./modules/Retrieval').then(m => ({ default: m.Retrieval }))),
  'prompt-engineering': lazy(() => import('./modules/PromptEngineering').then(m => ({ default: m.PromptEngineering }))),
  'hallucinations':     lazy(() => import('./modules/Hallucinations').then(m => ({ default: m.Hallucinations }))),
  'use-cases':          lazy(() => import('./modules/UseCases').then(m => ({ default: m.UseCases }))),
  'fine-tuning':        lazy(() => import('./modules/FineTuning').then(m => ({ default: m.FineTuning }))),
} as const

type ModuleId = keyof typeof MODULES

function ModuleLoadingFallback() {
  return (
    <div className="flex h-64 items-center justify-center">
      <div className="h-7 w-7 animate-spin rounded-full border-2 border-indigo-500 border-t-transparent" />
    </div>
  )
}

function ModuleErrorFallback() {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-white">
      <p className="text-4xl">⚠</p>
      <h2 className="mt-4 text-lg font-semibold">This module failed to load</h2>
      <p className="mt-2 text-sm text-gray-400">Try refreshing the page.</p>
      <Link to="/" className="mt-6 text-sm text-indigo-400 transition-colors hover:text-indigo-300">
        ← Back to map
      </Link>
    </div>
  )
}

export function Learn() {
  const { nodeId } = useParams<{ nodeId: string }>()
  const navigate = useNavigate()
  const { completed, loading, markComplete, markIncomplete } = useProgress()
  const [completing, setCompleting] = useState(false)
  const [unmarking, setUnmarking] = useState(false)

  if (!nodeId || !NODES_BY_ID[nodeId] || !(nodeId in MODULES)) {
    return <Navigate to="/" replace />
  }

  const node = NODES_BY_ID[nodeId]
  const Module = MODULES[nodeId as ModuleId]
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
          {!loading && isCompleted && (
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

      <ErrorBoundary fallback={<ModuleErrorFallback />}>
        <Suspense fallback={<ModuleLoadingFallback />}>
          {loading ? (
            <ModuleLoadingFallback />
          ) : (
            <Module onComplete={handleComplete} completed={isCompleted} />
          )}
        </Suspense>
      </ErrorBoundary>
    </div>
  )
}
