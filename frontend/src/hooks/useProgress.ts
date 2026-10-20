import { useCallback, useEffect, useState } from 'react'

import { useAuth } from './useAuth'
import { api } from '../lib/api'

const GUEST_PROGRESS_KEY = 'aiphilo_guest_progress'

function loadGuestProgress(): Set<string> {
  try {
    const raw = localStorage.getItem(GUEST_PROGRESS_KEY)
    return new Set(raw ? (JSON.parse(raw) as string[]) : [])
  } catch {
    return new Set()
  }
}

function saveGuestProgress(completed: Set<string>): void {
  localStorage.setItem(GUEST_PROGRESS_KEY, JSON.stringify([...completed]))
}

export function useProgress() {
  const { isGuest } = useAuth()
  const [completed, setCompleted] = useState<Set<string>>(new Set())
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (isGuest) {
      setCompleted(loadGuestProgress())
      setLoading(false)
      return
    }
    api
      .get<{ completed: string[] }>('/progress')
      .then((res) => setCompleted(new Set(res.data.completed)))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [isGuest])

  const markComplete = useCallback(async (nodeId: string) => {
    if (isGuest) {
      setCompleted((prev) => {
        const next = new Set([...prev, nodeId])
        saveGuestProgress(next)
        return next
      })
      return
    }
    await api.post(`/progress/${nodeId}`)
    setCompleted((prev) => new Set([...prev, nodeId]))
  }, [isGuest])

  const markIncomplete = useCallback(async (nodeId: string) => {
    if (isGuest) {
      setCompleted((prev) => {
        const next = new Set(prev)
        next.delete(nodeId)
        saveGuestProgress(next)
        return next
      })
      return
    }
    await api.delete(`/progress/${nodeId}`)
    setCompleted((prev) => {
      const next = new Set(prev)
      next.delete(nodeId)
      return next
    })
  }, [isGuest])

  return { completed, loading, markComplete, markIncomplete }
}
