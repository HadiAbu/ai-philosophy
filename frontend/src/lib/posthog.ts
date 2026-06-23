import posthog from 'posthog-js'

export function initPostHog() {
  const key = import.meta.env.VITE_POSTHOG_KEY
  if (!key) return
  posthog.init(key, {
    api_host: import.meta.env.VITE_POSTHOG_HOST || 'https://us.i.posthog.com',
    capture_pageview: false,
    capture_pageleave: true,
    session_recording: { maskAllInputs: true },
  })
}

export { posthog }
