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

const severityRing: Record<string, string> = {
  critical: 'ring-[hsl(var(--status-critical))]/30',
  warning: 'ring-[hsl(var(--status-warning))]/30',
  info: 'ring-[hsl(var(--brand-primary))]/30',
  ok: 'ring-[hsl(var(--status-ok))]/30',
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
 * @description A horizontal scrollable timeline showing events with severity-colored
 * dots. Most recent events appear on the left. Click events for detail callbacks.
 * Designed for alert timelines and incident history strips.
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
      className={cn(
        'relative overflow-x-auto scrollbar-thin py-2',
        className,
      )}
    >
      <div className="flex items-start gap-0 min-w-max">
        <AnimatePresence initial={false}>
          {visible.map((ev, i) => (
            <motion.div
              key={`${ev.time}-${i}`}
              initial={reduced ? false : { opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.15, delay: reduced ? 0 : i * 0.03 }}
              className="flex flex-col items-center relative"
              style={{ minWidth: 64 }}
            >
              {/* Connector line */}
              {i < visible.length - 1 && (
                <div
                  className="absolute top-[11px] left-1/2 h-px bg-[hsl(var(--border-default))]"
                  style={{ width: 64 }}
                />
              )}

              {/* Dot */}
              <button
                type="button"
                onClick={() => onEventClick?.(ev)}
                className={cn(
                  'relative z-10 min-w-[44px] min-h-[44px] flex items-center justify-center',
                  'transition-transform hover:scale-125 cursor-pointer',
                )}
                title={ev.detail ?? ev.label}
                aria-label={`${ev.label} — ${ev.severity}`}
              >
                <span className={cn(
                  'size-[10px] rounded-full ring-4 shrink-0',
                  severityDot[ev.severity] ?? severityDot.info,
                  severityRing[ev.severity] ?? severityRing.info,
                )} />
              </button>

              {/* Label */}
              <span className="mt-1.5 text-[0.6875rem] font-medium text-[hsl(var(--text-primary))] text-center max-w-[56px] truncate">
                {ev.label}
              </span>

              {/* Timestamp */}
              <span className="text-[0.625rem] text-[hsl(var(--text-tertiary))] tabular-nums">
                {formatTime(ev.time)}
              </span>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  )
}
