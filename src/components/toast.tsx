'use client'

import type React from 'react'
import { Toaster as SonnerToaster } from 'sonner'

export interface ToasterProps {
  /** Theme mode. Controls Sonner's internal theming. */
  theme?: 'dark' | 'light'
  /** Toast position on screen. */
  position?: 'top-left' | 'top-right' | 'top-center' | 'bottom-left' | 'bottom-right' | 'bottom-center'
  /** Auto-dismiss duration in milliseconds. */
  duration?: number
}

/**
 * @description A pre-themed Sonner toast container. Accepts theme as a prop
 * instead of reading from a hook, making it portable across applications.
 * Import this Toaster once in your app layout, then use `toast()` from sonner anywhere.
 */
export function Toaster({ theme = 'dark', position = 'bottom-right', duration = 4000 }: ToasterProps): React.JSX.Element {
  return (
    <SonnerToaster
      theme={theme}
      position={position}
      richColors
      duration={duration}
      gap={8}
      toastOptions={{
        style: {
          background:   'hsl(var(--bg-elevated))',
          color:        'hsl(var(--text-primary))',
          border:       '1px solid hsl(var(--border-default))',
          borderRadius: '0.75rem',
          boxShadow:    '0 8px 32px hsl(0 0% 0% / 0.25)',
          fontSize:     '0.875rem',
        },
        classNames: {
          success: 'toast-success',
          error:   'toast-error',
          warning: 'toast-warning',
          info:    'toast-info',
        },
      }}
    />
  )
}

// Re-export toast function for convenient imports
export { toast } from 'sonner'
