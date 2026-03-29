'use client'

import { useState } from 'react'

export function GuidebookEmailCapture() {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setStatus('loading')

    try {
      const res = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, source: 'guidebook' }),
      })

      if (res.ok) {
        setStatus('success')
        setEmail('')
      } else {
        setStatus('error')
      }
    } catch {
      setStatus('error')
    }
  }

  if (status === 'success') {
    return (
      <div className="my-12 rounded-2xl bg-blue-50 border border-blue-200 p-8 text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">You&apos;re in!</h2>
        <p className="text-gray-600">
          We&apos;ll keep you in the loop with local events, seasonal discounts, and insider tips for your next New Braunfels getaway.
        </p>
      </div>
    )
  }

  return (
    <div className="my-12 rounded-2xl bg-blue-50 border border-blue-200 p-8 text-center">
      <h2 className="text-2xl font-bold text-gray-900 mb-2">
        Stay in the Loop
      </h2>
      <p className="text-gray-600 mb-6 max-w-lg mx-auto">
        Love New Braunfels? Sign up to get notified about local events, seasonal discounts, and special offers for your next stay.
      </p>
      <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 justify-center max-w-md mx-auto">
        <input
          type="email"
          required
          placeholder="your@email.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="flex-1 px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
        />
        <button
          type="submit"
          disabled={status === 'loading'}
          className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
        >
          {status === 'loading' ? 'Signing up...' : 'Sign Me Up'}
        </button>
      </form>
      {status === 'error' && (
        <p className="mt-3 text-sm text-red-600">Something went wrong. Please try again.</p>
      )}
    </div>
  )
}
