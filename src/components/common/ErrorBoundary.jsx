import { Component } from 'react'

class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div className="h-full flex items-center justify-center bg-void-100">
          <div className="text-center p-4">
            <p className="text-coral mb-2">Something went wrong</p>
            <p className="text-sm text-mist-muted">Please refresh the page</p>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

export default ErrorBoundary
