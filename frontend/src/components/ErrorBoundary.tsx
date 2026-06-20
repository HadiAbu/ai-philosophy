import { Component, type ErrorInfo, type ReactNode } from 'react'

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  error: Error | null
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null }

  static getDerivedStateFromError(error: Error): State {
    return { error }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('[ErrorBoundary]', error, info.componentStack)
  }

  reset = () => this.setState({ error: null })

  render() {
    if (this.state.error) {
      return (
        this.props.fallback ?? (
          <div className="flex min-h-screen flex-col items-center justify-center bg-gray-950 text-white">
            <p className="text-4xl">⚠</p>
            <h1 className="mt-4 text-xl font-semibold">Something went wrong</h1>
            <p className="mt-2 max-w-sm text-center text-sm text-gray-400">
              {this.state.error.message}
            </p>
            <button
              onClick={this.reset}
              className="mt-6 rounded-lg bg-indigo-600 px-4 py-2 text-sm hover:bg-indigo-500"
            >
              Try again
            </button>
          </div>
        )
      )
    }
    return this.props.children
  }
}
