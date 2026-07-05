import { createContext } from 'react'

export interface AuthContextValue {
  userId: string | null
  loading: boolean
  requireAuth: boolean
  isGuest: boolean
  login: (email: string, password: string) => Promise<void>
  register: (email: string, password: string) => Promise<void>
  logout: () => Promise<void>
  loginAsGuest: () => void
}

export const AuthContext = createContext<AuthContextValue | null>(null)
