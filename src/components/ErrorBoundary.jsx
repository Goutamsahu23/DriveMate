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
        <div className="h-full flex items-center justify-center bg-gray-100">
          <div className="text-center p-4">
            <p className="text-red-600 mb-2">Something went wrong</p>
            <p className="text-sm text-gray-600">Please refresh the page</p>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

export default ErrorBoundary
