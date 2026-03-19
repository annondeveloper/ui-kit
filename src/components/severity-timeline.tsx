'use client'

import type React from 'react'
import { useRef } from 'react'
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion'
import { cn } from '../utils'

export interface TimelineEvent {
  /** ISO 8601 timestamp. */
  time: string
  /** Short event label. */
  label: string
  /** Severity determines dot color. */
  severity: 'critical' | 'warning' | 'info' | 'ok'
  /** Optional detail text shown on click/hover. */
  detail?: string
}

export interface SeverityTimelineProps {
  /** Events to display (most recent should be first). */
  events: TimelineEvent[]
  /** Maximum number of visible events. */
  maxVisible?: number
  /** Callback when an event dot/label is clicked. */
  onEventClick?: (event: TimelineEvent) => void
  className?: string
}

const severityDot: Record<string, string> = {
  critical: 'bg-[hsl(var(--status-critical))]',
  warning: 'bg-[hsl(var(--status-warning))]',
  info: 'bg-[hsl(var(--brand-primary))]',
  ok: 'bg-[hsl(var(--status-ok))]',
}

const severityText: Record<string, string> = {
  critical: 'text-[hsl(var(--status-critical))]',
  warning: 'text-[hsl(var(--status-warning))]',
  info: 'text-[hsl(var(--brand-primary))]',
  ok: 'text-[hsl(var(--status-ok))]',
}

function formatTime(iso: string): string {
  try {
    const d = new Date(iso)
    return d.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })
  } catch {
    return iso
  }
}

/**
 * @description A vertical timeline showing events with severity-colored dots and
 * a connecting line. Most recent events appear at the top. Click events for detail
 * callbacks. Designed for alert timelines and incident history strips.
 */
export function SeverityTimeline({
  events,
  maxVisible = 20,
  onEventClick,
  className,
}: SeverityTimelineProps): React.JSX.Element | null {
  const reduced = useReducedMotion()
  const scrollRef = useRef<HTMLDivElement>(null)
  const visible = events.slice(0, maxVisible)

  if (visible.length === 0) return null

  return (
    <div
      ref={scrollRef}
      className={cn('relative overflow-y-auto max-h-[300px]', className)}
    >
      <div className="relative pl-6">
        {/* Vertical connecting line */}
        <div
          className="absolute left-[7px] top-2 bottom-2 w-px bg-[hsl(var(--border-default))]"
        />

        <AnimatePresence initial={false}>
          {visible.map((ev, i) => (
            <motion.div
              key={`${ev.time}-${i}`}
              initial={reduced ? false : { opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -8 }}
              transition={{ duration: 0.15, delay: reduced ? 0 : i * 0.03 }}
              className={cn(
                'relative flex items-start gap-3 py-2',
                onEventClick && 'cursor-pointer hover:bg-[hsl(var(--bg-elevated)/0.3)] rounded-lg -ml-1 pl-1',
              )}
              onClick={() => onEventClick?.(ev)}
            >
              {/* Dot */}
              <div className="absolute left-[-19px] top-[10px] flex items-center justify-center">
                <span className={cn(
                  'size-[10px] rounded-full ring-2 ring-[hsl(var(--bg-surface))] shrink-0',
                  severityDot[ev.severity] ?? severityDot.info,
                )} />
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-baseline gap-2">
                  <span className="text-sm font-medium text-[hsl(var(--text-primary))] truncate">
                    {ev.label}
                  </span>
                  <span className={cn(
                    'text-[0.625rem] font-semibold uppercase tracking-wider shrink-0',
                    severityText[ev.severity] ?? severityText.info,
                  )}>
                    {ev.severity}
                  </span>
                </div>
                <span className="text-[0.6875rem] text-[hsl(var(--text-tertiary))] tabular-nums">
                  {formatTime(ev.time)}
                </span>
                {ev.detail && (
                  <p className="mt-0.5 text-xs text-[hsl(var(--text-secondary))]">{ev.detail}</p>
                )}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  )
}
