'use client';

import { ThemeProvider } from 'next-themes'

export function ThemeProviders({ children }) {
  return <ThemeProvider >{children}</ThemeProvider>
}