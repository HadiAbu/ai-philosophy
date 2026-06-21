import { useCallback, useEffect, useReducer, useRef, type ReactNode } from 'react'

import { api, setAccessToken } from '../lib/api'
import { AuthContext } from './AuthContext'

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

// JWT payloads are base64url-encoded (- and _ instead of + and /).
// atob() only handles standard base64, so normalise first.
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

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, { userId: null, loading: true })
  // Guard against React StrictMode double-invoking this effect in development.
  const initialized = useRef(false)

  useEffect(() => {
    if (initialized.current) return
    initialized.current = true

    api
      .post('/auth/refresh')
      .then((res) => {
        const token = res.data.access_token
        setAccessToken(token)
        dispatch({ type: 'SET_USER', userId: parseUserIdFromToken(token) })
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
    dispatch({ type: 'SET_USER', userId: parseUserIdFromToken(token) })
  }, [])

  const register = useCallback(async (email: string, password: string) => {
    const res = await api.post('/auth/register', { email, password })
    const token = res.data.access_token
    setAccessToken(token)
    dispatch({ type: 'SET_USER', userId: parseUserIdFromToken(token) })
  }, [])

  const logout = useCallback(async () => {
    await api.post('/auth/logout').catch(() => null)
    setAccessToken(null)
    dispatch({ type: 'CLEAR_USER' })
  }, [])

  return (
    <AuthContext.Provider value={{ ...state, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  )
}
