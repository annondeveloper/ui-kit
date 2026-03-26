'use client'

import {
  type HTMLAttributes,
} from 'react'
import { css } from '../core/styles/css-tag'
import { useStyles } from '../core/styles/use-styles'
import { useMotionLevel } from '../core/motion/use-motion-level'
import { cn } from '../core/utils/cn'
import { ComponentErrorBoundary } from '../core/utils/error-boundary'

// ─── Types ──────────────────────────────────────────────────────────────────

export interface Stage {
  id: string
  label: string
  status: 'pending' | 'running' | 'success' | 'failed' | 'skipped'
  duration?: number
}

export interface PipelineStageProps extends HTMLAttributes<HTMLDivElement> {
  stages: Stage[]
  orientation?: 'horizontal' | 'vertical'
  onStageClick?: (stageId: string) => void
  motion?: 0 | 1 | 2 | 3
}

// ─── Styles ─────────────────────────────────────────────────────────────────

const pipelineStyles = css`
  @layer components {
    @scope (.ui-pipeline-stage) {
      :scope {
        position: relative;
      }

      .ui-pipeline-stage__list {
        list-style: none;
        margin: 0;
        padding: 0;
        display: flex;
        align-items: center;
      }

      :scope[data-orientation="horizontal"] .ui-pipeline-stage__list {
        flex-direction: row;
        gap: 0;
      }

      :scope[data-orientation="vertical"] .ui-pipeline-stage__list {
        flex-direction: column;
        align-items: flex-start;
        gap: 0;
      }

      /* Stage item */
      .ui-pipeline-stage__item {
        display: flex;
        align-items: center;
        gap: var(--space-xs, 0.25rem);
      }

      :scope[data-orientation="vertical"] .ui-pipeline-stage__item {
        flex-direction: row;
      }

      .ui-pipeline-stage__indicator {
        inline-size: 2rem;
        block-size: 2rem;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
        font-size: 0.75rem;
        font-weight: 700;
        position: relative;
      }

      /* Status colors */
      .ui-pipeline-stage__indicator[data-status="pending"] {
        background: var(--border-subtle, oklch(100% 0 0 / 0.06));
        border: 2px dashed var(--border-strong, oklch(100% 0 0 / 0.15));
        color: var(--text-tertiary, oklch(55% 0 0));
      }
      .ui-pipeline-stage__indicator[data-status="running"] {
        background: oklch(65% 0.2 270 / 0.15);
        border: 2px solid oklch(65% 0.2 270);
        color: oklch(65% 0.2 270);
        animation: ui-pipeline-pulse 1.5s ease-in-out infinite;
      }
      .ui-pipeline-stage__indicator[data-status="success"] {
        background: oklch(72% 0.19 155 / 0.15);
        border: 2px solid oklch(72% 0.19 155);
        color: oklch(72% 0.19 155);
      }
      .ui-pipeline-stage__indicator[data-status="failed"] {
        background: oklch(62% 0.22 25 / 0.15);
        border: 2px solid oklch(62% 0.22 25);
        color: oklch(62% 0.22 25);
      }
      .ui-pipeline-stage__indicator[data-status="skipped"] {
        background: var(--border-subtle, oklch(100% 0 0 / 0.04));
        border: 2px solid var(--border-default, oklch(100% 0 0 / 0.1));
        color: var(--text-tertiary, oklch(55% 0 0));
      }

      @keyframes ui-pipeline-pulse {
        0%, 100% { box-shadow: 0 0 0 0 oklch(65% 0.2 270 / 0.3); }
        50% { box-shadow: 0 0 0 6px oklch(65% 0.2 270 / 0); }
      }

      :scope[data-motion="0"] .ui-pipeline-stage__indicator[data-status="running"] {
        animation: none;
      }

      /* Status icons */
      .ui-pipeline-stage__icon {
        font-size: 0.875rem;
        line-height: 1;
      }

      /* Label + duration */
      .ui-pipeline-stage__content {
        display: flex;
        flex-direction: column;
        min-inline-size: 0;
      }

      .ui-pipeline-stage__label {
        font-size: var(--text-sm, 0.875rem);
        font-weight: 600;
        color: var(--text-primary, oklch(90% 0 0));
        line-height: 1.3;
      }

      .ui-pipeline-stage__label-btn {
        all: unset;
        cursor: pointer;
        font: inherit;
        color: inherit;
        font-weight: inherit;
      }
      .ui-pipeline-stage__label-btn:focus-visible {
        outline: 2px solid var(--brand, oklch(65% 0.2 270));
        outline-offset: 2px;
        border-radius: 2px;
      }
      .ui-pipeline-stage__label-btn:hover {
        text-decoration: underline;
      }

      .ui-pipeline-stage__duration {
        font-size: var(--text-xs, 0.75rem);
        color: var(--text-tertiary, oklch(55% 0 0));
        font-variant-numeric: tabular-nums;
      }

      /* Connector */
      .ui-pipeline-stage__connector {
        flex-shrink: 0;
      }

      :scope[data-orientation="horizontal"] .ui-pipeline-stage__connector {
        inline-size: 2rem;
        block-size: 2px;
        background: var(--border-subtle, oklch(100% 0 0 / 0.12));
        margin-inline: var(--space-2xs, 0.125rem);
        align-self: center;
      }

      :scope[data-orientation="vertical"] .ui-pipeline-stage__connector {
        inline-size: 2px;
        block-size: 1.5rem;
        background: var(--border-subtle, oklch(100% 0 0 / 0.12));
        margin-inline-start: calc(1rem - 1px);
      }

      /* Forced colors */
      @media (forced-colors: active) {
        .ui-pipeline-stage__indicator {
          forced-color-adjust: none;
          border: 2px solid CanvasText;
        }
        .ui-pipeline-stage__connector {
          background: GrayText;
        }
      }
    }
  }
`

// ─── Status icons ────────────────────────────────────────────────────────────

const STATUS_ICONS: Record<Stage['status'], string> = {
  pending: '\u2022', // bullet
  running: '\u25B6', // play
  success: '\u2713', // check
  failed: '\u2717',  // cross
  skipped: '\u2212', // minus
}

function formatDuration(seconds: number): string {
  if (seconds < 60) return `${seconds}s`
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return s > 0 ? `${m}m ${s}s` : `${m}m`
}

// ─── Component ──────────────────────────────────────────────────────────────

function PipelineStageInner({
  stages,
  orientation = 'horizontal',
  onStageClick,
  motion: motionProp,
  className,
  ...rest
}: PipelineStageProps) {
  useStyles('pipeline-stage', pipelineStyles)
  const motionLevel = useMotionLevel(motionProp)

  return (
    <div
      className={cn('ui-pipeline-stage', className)}
      data-orientation={orientation}
      data-motion={motionLevel}
      {...rest}
    >
      <ol className="ui-pipeline-stage__list">
        {stages.map((stage, i) => (
          <li key={stage.id} style={{ display: 'contents' }}>
            <div className="ui-pipeline-stage__item">
              <div
                className="ui-pipeline-stage__indicator"
                data-status={stage.status}
              >
                <span className="ui-pipeline-stage__icon">{STATUS_ICONS[stage.status]}</span>
              </div>
              <div className="ui-pipeline-stage__content">
                <span className="ui-pipeline-stage__label">
                  {onStageClick ? (
                    <button
                      className="ui-pipeline-stage__label-btn"
                      onClick={() => onStageClick(stage.id)}
                    >
                      {stage.label}
                    </button>
                  ) : (
                    stage.label
                  )}
                </span>
                {stage.duration !== undefined && (
                  <span className="ui-pipeline-stage__duration">
                    {formatDuration(stage.duration)}
                  </span>
                )}
              </div>
            </div>

            {i < stages.length - 1 && (
              <div className="ui-pipeline-stage__connector" aria-hidden="true" />
            )}
          </li>
        ))}
      </ol>
    </div>
  )
}

export function PipelineStage(props: PipelineStageProps) {
  return (
    <ComponentErrorBoundary>
      <PipelineStageInner {...props} />
    </ComponentErrorBoundary>
  )
}

PipelineStage.displayName = 'PipelineStage'
