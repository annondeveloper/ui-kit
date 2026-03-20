'use client'

import { cloneElement, type ReactElement } from 'react'

// ─── Types ──────────────────────────────────────────────────────────────────

export interface NativeTooltipProps {
  content: string
  children: ReactElement
}

// ─── Component ──────────────────────────────────────────────────────────────

export function NativeTooltip({ content, children }: NativeTooltipProps) {
  return cloneElement(children, { title: content } as Record<string, unknown>)
}

NativeTooltip.displayName = 'NativeTooltip'
