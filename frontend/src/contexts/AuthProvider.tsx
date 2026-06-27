import { useCallback, useEffect, useReducer, useRef, useState, type ReactNode } from 'react'

import { api, setAccessToken, setAnonId } from '../lib/api'
import { posthog } from '../lib/posthog'
import { AuthContext } from './AuthContext'

const ANON_ID_KEY = 'aiphilo_anon_id'

interface AuthState {
  userId: string | null
  loading: boolean
}

type AuthAction =
  | { type: 'SET_USER'; userId: string }
  | { type: 'CLEAR_USER' }

function reducer(_state: AuthState, action: AuthAction): AuthState {
  switch (action.type) {
    case 'SET_USER':
      return { userId: action.userId, loading: false }
    case 'CLEAR_USER':
      return { userId: null, loading: false }
  }
}

function parseUserIdFromToken(token: string): string {
  try {
    const base64Url = token.split('.')[1]
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/')
    const padded = base64 + '='.repeat((4 - (base64.length % 4)) % 4)
    const payload = JSON.parse(atob(padded))
    if (typeof payload.sub !== 'string') throw new Error('missing sub')
    return payload.sub
  } catch {
    throw new Error('Invalid token format')
  }
}

function getOrCreateAnonId(): string {
  let id = localStorage.getItem(ANON_ID_KEY)
  if (!id) {
    id = crypto.randomUUID()
    localStorage.setItem(ANON_ID_KEY, id)
  }
  return id
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, { userId: null, loading: true })
  const [requireAuth, setRequireAuth] = useState(true)
  const initialized = useRef(false)

  useEffect(() => {
    if (initialized.current) return
    initialized.current = true

    api
      .get('/config')
      .then((res) => {
        const flag = Boolean(res.data.require_auth)
        setRequireAuth(flag)

        if (!flag) {
          const anonId = getOrCreateAnonId()
          setAnonId(anonId)
          dispatch({ type: 'SET_USER', userId: anonId })
        } else {
          api
            .post('/auth/refresh')
            .then((res) => {
              const token = res.data.access_token
              setAccessToken(token)
              const userId = parseUserIdFromToken(token)
              dispatch({ type: 'SET_USER', userId })
              posthog.identify(userId)
            })
            .catch(() => dispatch({ type: 'CLEAR_USER' }))
        }
      })
      .catch(() => dispatch({ type: 'CLEAR_USER' }))

    const onExpired = () => dispatch({ type: 'CLEAR_USER' })
    window.addEventListener('auth:expired', onExpired)
    return () => window.removeEventListener('auth:expired', onExpired)
  }, [])

  const login = useCallback(async (email: string, password: string) => {
    const res = await api.post('/auth/login', { email, password })
    const token = res.data.access_token
    setAccessToken(token)
    const userId = parseUserIdFromToken(token)
    dispatch({ type: 'SET_USER', userId })
    posthog.identify(userId)
  }, [])

  const register = useCallback(async (email: string, password: string) => {
    const res = await api.post('/auth/register', { email, password })
    const token = res.data.access_token
    setAccessToken(token)
    const userId = parseUserIdFromToken(token)
    dispatch({ type: 'SET_USER', userId })
    posthog.identify(userId)
  }, [])

  const logout = useCallback(async () => {
    await api.post('/auth/logout').catch(() => null)
    setAccessToken(null)
    dispatch({ type: 'CLEAR_USER' })
    posthog.reset()
  }, [])

  return (
    <AuthContext.Provider value={{ ...state, requireAuth, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  )
}
