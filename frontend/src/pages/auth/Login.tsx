import { useState, type FormEvent } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'

export function Login() {
  const { userId, login, loginAsGuest } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  if (userId) return <Navigate to="/home" replace />

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await login(email, password)
      navigate('/home')
    } catch {
      setError('Invalid email or password')
    } finally {
      setLoading(false)
    }
  }

  function handleGuest() {
    loginAsGuest()
    navigate('/home')
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-950">
      <div className="w-full max-w-sm space-y-3">
        <form
          onSubmit={handleSubmit}
          className="space-y-4 rounded-xl bg-gray-900 p-8"
        >
          <h1 className="text-2xl font-bold text-white">Sign in</h1>

          {error && <p className="text-sm text-red-400">{error}</p>}

          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full rounded-lg bg-gray-800 px-4 py-2 text-white placeholder-gray-500 outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full rounded-lg bg-gray-800 px-4 py-2 text-white placeholder-gray-500 outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-indigo-600 py-2 font-medium text-white hover:bg-indigo-500 disabled:opacity-50"
          >
            {loading ? 'Signing in…' : 'Sign in'}
          </button>

          <p className="text-center text-sm text-gray-400">
            No account?{' '}
            <Link to="/register" className="text-indigo-400 hover:underline">
              Register
            </Link>
          </p>
        </form>

        <div className="flex items-center gap-3 px-1">
          <div className="h-px flex-1 bg-gray-800" />
          <span className="text-xs text-gray-600">or</span>
          <div className="h-px flex-1 bg-gray-800" />
        </div>

        <button
          onClick={handleGuest}
          className="w-full rounded-xl border border-gray-700 bg-gray-900 py-3 text-sm font-medium text-gray-300 transition-colors hover:border-gray-600 hover:text-white"
        >
          Continue as Guest
        </button>
        <p className="text-center text-xs text-gray-600">
          Progress is saved in your browser — no account needed.
        </p>
      </div>
    </div>
  )
}
