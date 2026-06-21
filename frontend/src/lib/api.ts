import axios from 'axios'

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? 'http://localhost:8000/api',
  withCredentials: true,
})

let _accessToken: string | null = null

export function setAccessToken(token: string | null): void {
  _accessToken = token
}

api.interceptors.request.use((config) => {
  if (_accessToken) {
    config.headers.Authorization = `Bearer ${_accessToken}`
  }
  return config
})

// Single in-flight refresh promise shared across all concurrent 401 retries.
// Without this, two simultaneous 401s would each call /auth/refresh, the second
// would revoke the first's new token, and one request would fail unnecessarily.
let _refreshPromise: Promise<string> | null = null

api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config
    const isAuthRoute = original?.url?.includes('/auth/')

    if (error.response?.status === 401 && !original._retry && !isAuthRoute) {
      original._retry = true

      if (!_refreshPromise) {
        _refreshPromise = api
          .post('/auth/refresh')
          .then((res) => {
            setAccessToken(res.data.access_token)
            return res.data.access_token as string
          })
          .finally(() => {
            _refreshPromise = null
          })
      }

      try {
        const token = await _refreshPromise
        original.headers.Authorization = `Bearer ${token}`
        return api(original)
      } catch {
        setAccessToken(null)
        window.dispatchEvent(new CustomEvent('auth:expired'))
      }
    }
    return Promise.reject(error)
  }
)
