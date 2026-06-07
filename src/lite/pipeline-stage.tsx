import { forwardRef, type HTMLAttributes } from 'react'
import { css } from '../core/styles/css-tag'
import { useStyles } from '../core/styles/use-styles'

const pipelineStageStyles = css`
  @layer components {
    @scope (.ui-lite-pipeline-stage) {
      :scope { display: flex; gap: 0; align-items: center; }
      :scope[data-orientation="vertical"] { flex-direction: column; align-items: flex-start; }
      .ui-lite-pipeline-stage__item { display: flex; align-items: center; gap: 0.375rem; font-size: 0.8125rem; color: var(--text-primary, oklch(97% 0 0)); }
      :scope[data-orientation="vertical"] .ui-lite-pipeline-stage__item { flex-direction: column; align-items: flex-start; }
      .ui-lite-pipeline-stage__dot { inline-size: 12px; block-size: 12px; border-radius: 50%; flex-shrink: 0; }
      .ui-lite-pipeline-stage__item[data-status="pending"] .ui-lite-pipeline-stage__dot { background: oklch(50% 0 0 / 0.3); }
      .ui-lite-pipeline-stage__item[data-status="running"] .ui-lite-pipeline-stage__dot { background: oklch(70% 0.17 250); }
      .ui-lite-pipeline-stage__item[data-status="success"] .ui-lite-pipeline-stage__dot { background: oklch(72% 0.19 145); }
      .ui-lite-pipeline-stage__item[data-status="failed"] .ui-lite-pipeline-stage__dot { background: oklch(62% 0.22 25); }
      .ui-lite-pipeline-stage__item[data-status="skipped"] .ui-lite-pipeline-stage__dot { background: oklch(50% 0 0 / 0.15); }
      .ui-lite-pipeline-stage__connector { inline-size: 2rem; block-size: 2px; background: var(--border-subtle, oklch(100% 0 0 / 0.04)); flex-shrink: 0; }
      :scope[data-orientation="vertical"] .ui-lite-pipeline-stage__connector { inline-size: 2px; block-size: 1.5rem; margin-inline-start: 5px; }
    }
  }
`

export interface LiteStage {
  id: string
  label: string
  status: 'pending' | 'running' | 'success' | 'failed' | 'skipped'
}

export interface LitePipelineStageProps extends HTMLAttributes<HTMLDivElement> {
  stages: LiteStage[]
  orientation?: 'horizontal' | 'vertical'
}

export const PipelineStage = forwardRef<HTMLDivElement, LitePipelineStageProps>(
  ({ stages, orientation = 'horizontal', className, ...rest }, ref) => {
    useStyles('lite-pipeline-stage', pipelineStageStyles)
    return (
    <div
      ref={ref}
      className={`ui-lite-pipeline-stage${className ? ` ${className}` : ''}`}
      data-orientation={orientation}
      {...rest}
    >
      {stages.map((stage, i) => (
        <div key={stage.id} className="ui-lite-pipeline-stage__item" data-status={stage.status}>
          <span className="ui-lite-pipeline-stage__dot" />
          <span className="ui-lite-pipeline-stage__label">{stage.label}</span>
          {i < stages.length - 1 && <span className="ui-lite-pipeline-stage__connector" />}
        </div>
      ))}
    </div>
    )
  }
)
PipelineStage.displayName = 'PipelineStage'
