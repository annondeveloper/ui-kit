import { forwardRef, type HTMLAttributes } from 'react'

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
  ({ stages, orientation = 'horizontal', className, ...rest }, ref) => (
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
)
PipelineStage.displayName = 'PipelineStage'
