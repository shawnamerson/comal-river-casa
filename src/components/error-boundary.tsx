'use client'

import React from 'react'
import { Card, CardContent } from '@/components/ui/card'

interface Props {
  children: React.ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
  errorInfo: React.ErrorInfo | null
}

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false, error: null, errorInfo: null }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo)
    this.setState({
      error,
      errorInfo,
    })
  }

  render() {
    if (this.state.hasError) {
      return (
        <Card className="border-red-500 border-2">
          <CardContent className="p-6">
            <div className="bg-red-100 border-2 border-red-600 text-red-900 p-6 rounded-lg">
              <p className="font-bold text-2xl mb-4">🔴 COMPONENT CRASHED</p>
              <p className="font-semibold mb-2">Error Message:</p>
              <p className="text-sm mb-4 bg-white p-3 rounded border border-red-300 break-words font-mono">
                {this.state.error?.message || 'Unknown error'}
              </p>

              <p className="font-semibold mb-2">Error Stack:</p>
              <pre className="text-xs mb-4 bg-white p-3 rounded border border-red-300 overflow-auto max-h-40 font-mono">
                {this.state.error?.stack || 'No stack trace'}
              </pre>

              {this.state.errorInfo && (
                <>
                  <p className="font-semibold mb-2">Component Stack:</p>
                  <pre className="text-xs bg-white p-3 rounded border border-red-300 overflow-auto max-h-40 font-mono">
                    {this.state.errorInfo.componentStack}
                  </pre>
                </>
              )}

              <button
                onClick={() => this.setState({ hasError: false, error: null, errorInfo: null })}
                className="mt-4 bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
              >
                Try Again
              </button>
            </div>
          </CardContent>
        </Card>
      )
    }

    return this.props.children
  }
}
