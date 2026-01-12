'use client'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { httpLink } from '@trpc/client'
import { useState } from 'react'
import { trpc } from './client'

function getBaseUrl() {
  if (typeof window !== 'undefined') return '' // browser should use relative url
  if (process.env.NEXT_PUBLIC_APP_URL) return process.env.NEXT_PUBLIC_APP_URL
  return `http://localhost:3000` // dev SSR should use localhost
}

export function TRPCProvider({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient())
  const [trpcClient] = useState(() =>
    trpc.createClient({
      links: [
        httpLink({
          url: `${getBaseUrl()}/api/trpc`,
        }),
      ],
    })
  )

  return (
    <trpc.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </trpc.Provider>
  )
}
