'use client'

import type React from 'react'
import { type ElementType } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { ChevronRight } from 'lucide-react'
import { cn } from '../utils'

export interface StageInfo {
  /** Stage display name. */
  name: string
  /** Current stage status. */
  status: 'active' | 'idle' | 'error' | 'disabled'
  /** Optional metric to display inside the stage box. */
  metric?: { label: string; value: string }
  /** Lucide icon component for the stage. */
  icon?: ElementType
}

export interface PipelineStageProps {
  /** Ordered array of processing stages. */
  stages: StageInfo[]
  /** Callback when a stage is clicked. */
  onStageClick?: (stage: StageInfo, index: number) => void
  className?: string
}

const statusDot: Record<string, string> = {
  active: 'bg-[hsl(var(--status-ok))]',
  idle: 'bg-[hsl(var(--text-tertiary))]',
  error: 'bg-[hsl(var(--status-critical))]',
  disabled: 'bg-[hsl(var(--text-disabled))]',
}

const statusBorder: Record<string, string> = {
  active: 'border-[hsl(var(--status-ok))]/30',
  idle: 'border-[hsl(var(--border-default))]',
  error: 'border-[hsl(var(--status-critical))]/30',
  disabled: 'border-[hsl(var(--border-subtle))]',
}

const statusBg: Record<string, string> = {
  active: 'bg-[hsl(var(--bg-surface))]',
  idle: 'bg-[hsl(var(--bg-surface))]',
  error: 'bg-[hsl(var(--status-critical))]/5',
  disabled: 'bg-[hsl(var(--bg-elevated))]',
}

/**
 * @description A horizontal data pipeline visualization showing processing stages
 * connected by animated chevron arrows. Each stage displays name, status dot,
 * optional icon, and optional metric. Designed for data pipeline monitoring views.
 */
export function PipelineStage({
  stages,
  onStageClick,
  className,
}: PipelineStageProps): React.JSX.Element {
  const reduced = useReducedMotion()

  return (
    <div className={cn('flex items-center gap-0 overflow-x-auto pb-1', className)}>
      {stages.map((stage, i) => {
        const Icon = stage.icon
        const isDisabled = stage.status === 'disabled'

        return (
          <div key={`${stage.name}-${i}`} className="flex items-center shrink-0">
            {/* Arrow connector */}
            {i > 0 && (
              <motion.div
                initial={reduced ? false : { opacity: 0, x: -4 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.15, delay: reduced ? 0 : i * 0.05 }}
                className="px-1"
              >
                <ChevronRight className="size-4 text-[hsl(var(--text-tertiary))]" />
              </motion.div>
            )}

            {/* Stage box */}
            <motion.button
              type="button"
              initial={reduced ? false : { opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2, delay: reduced ? 0 : i * 0.06 }}
              onClick={() => onStageClick?.(stage, i)}
              disabled={isDisabled && !onStageClick}
              className={cn(
                'flex flex-col items-start gap-1.5 px-4 py-3 rounded-xl border',
                'transition-all min-w-[120px]',
                statusBorder[stage.status],
                statusBg[stage.status],
                onStageClick && !isDisabled && 'cursor-pointer hover:bg-[hsl(var(--bg-elevated))]',
                isDisabled && 'opacity-50',
              )}
            >
              {/* Header row: icon + name + status dot */}
              <div className="flex items-center gap-2 w-full">
                {Icon && (
                  <Icon className={cn('size-3.5 shrink-0', isDisabled ? 'text-[hsl(var(--text-disabled))]' : 'text-[hsl(var(--text-secondary))]')} />
                )}
                <span className={cn(
                  'text-[0.8125rem] font-medium truncate',
                  isDisabled ? 'text-[hsl(var(--text-disabled))]' : 'text-[hsl(var(--text-primary))]',
                )}>
                  {stage.name}
                </span>
                <span
                  className={cn(
                    'size-2 rounded-full shrink-0 ml-auto',
                    statusDot[stage.status],
                    stage.status === 'active' && 'animate-pulse',
                  )}
                />
              </div>

              {/* Metric */}
              {stage.metric && (
                <div className="flex items-baseline gap-1">
                  <span className="text-[0.875rem] font-semibold text-[hsl(var(--text-primary))] tabular-nums">
                    {stage.metric.value}
                  </span>
                  <span className="text-[0.625rem] text-[hsl(var(--text-tertiary))]">
                    {stage.metric.label}
                  </span>
                </div>
              )}
            </motion.button>
          </div>
        )
      })}
    </div>
  )
}
