'use client'

import React from 'react'
import dynamic from 'next/dynamic'
import { WebSocketProvider } from '@/contexts/socket-context'
import { ThemeProvider as NextThemesProvider } from 'next-themes'

const PeerProvider = dynamic(
  () => import('@/contexts/peer-context').then((mod) => mod.PeerProvider),
  {
    ssr: false,
  },
)

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
      enableColorScheme
    >
      <WebSocketProvider>
        <PeerProvider>{children}</PeerProvider>
      </WebSocketProvider>
    </NextThemesProvider>
  )
}
