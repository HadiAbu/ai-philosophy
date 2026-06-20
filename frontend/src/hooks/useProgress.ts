import { useCallback, useEffect, useState } from 'react'

import { api } from '../lib/api'

export function useProgress() {
  const [completed, setCompleted] = useState<Set<string>>(new Set())
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api
      .get<{ completed: string[] }>('/progress')
      .then((res) => setCompleted(new Set(res.data.completed)))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const markComplete = useCallback(async (nodeId: string) => {
    await api.post(`/progress/${nodeId}`)
    setCompleted((prev) => new Set([...prev, nodeId]))
  }, [])

  return { completed, loading, markComplete }
}
