import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: '@annondeveloper/ui-kit — Component Showcase',
  description: 'The UI kit for monitoring dashboards and professional tools',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>{children}</body>
    </html>
  )
}
