'use client'

import * as React from 'react'
import { WebSocketProvider } from '@/contexts/socket-context'
import { ThemeProvider as NextThemesProvider } from 'next-themes'

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
      enableColorScheme
    >
      <WebSocketProvider>{children}</WebSocketProvider>
    </NextThemesProvider>
  )
}
