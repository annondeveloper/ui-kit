import { forwardRef, type HTMLAttributes, type ReactNode } from 'react'
import { css } from '../core/styles/css-tag'
import { useStyles } from '../core/styles/use-styles'

const upstreamDashboardStyles = css`
  @layer components {
    @scope (.ui-lite-upstream-dashboard) {
      :scope {
        display: flex;
        flex-direction: column;
        gap: var(--space-md, 1rem);
        min-inline-size: 320px;
      }
      .ui-lite-upstream-dashboard__title {
        margin: 0;
        font-size: clamp(1.25rem, 3vw, 1.75rem);
        font-weight: 700;
        color: var(--text-primary, oklch(90% 0 0));
        text-wrap: balance;
        line-height: 1.3;
      }
      .ui-lite-upstream-dashboard__grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
        gap: var(--space-sm, 0.5rem);
      }
      .ui-lite-upstream-dashboard__link {
        display: flex;
        flex-direction: column;
        gap: 0.125rem;
        padding: var(--space-md, 1rem);
        border-radius: var(--radius-lg, 0.75rem);
        background: var(--bg-surface, oklch(22% 0.02 270));
        border: 1px solid var(--border-subtle, oklch(100% 0 0 / 0.08));
        border-inline-start: 3px solid var(--border-subtle, oklch(100% 0 0 / 0.08));
      }
      .ui-lite-upstream-dashboard__link[data-status="ok"] { border-inline-start-color: oklch(72% 0.19 145); }
      .ui-lite-upstream-dashboard__link[data-status="warning"] { border-inline-start-color: oklch(78% 0.17 85); }
      .ui-lite-upstream-dashboard__link[data-status="critical"] { border-inline-start-color: oklch(62% 0.22 25); }
      .ui-lite-upstream-dashboard__link[data-status="unknown"] { border-inline-start-color: oklch(50% 0 0); }
      .ui-lite-upstream-dashboard__vendor {
        font-size: 0.9375rem;
        font-weight: 600;
        color: var(--text-primary, oklch(90% 0 0));
      }
      .ui-lite-upstream-dashboard__location {
        font-size: 0.8125rem;
        color: var(--text-secondary, oklch(70% 0 0));
      }
    }
  }
`

export interface LiteUpstreamLink {
  id: string
  vendor: string
  location: string
  inbound: number
  outbound: number
  status: 'ok' | 'warning' | 'critical' | 'unknown'
}

export interface LiteUpstreamDashboardProps extends Omit<HTMLAttributes<HTMLDivElement>, 'title'> {
  links: LiteUpstreamLink[]
  title?: ReactNode
  mode?: 'hero' | 'compact' | 'table'
}

export const UpstreamDashboard = forwardRef<HTMLDivElement, LiteUpstreamDashboardProps>(
  ({ links, title, mode = 'hero', className, ...rest }, ref) => {
    useStyles('lite-upstream-dashboard', upstreamDashboardStyles)
    return (
    <div
      ref={ref}
      className={`ui-lite-upstream-dashboard${className ? ` ${className}` : ''}`}
      data-mode={mode}
      data-motion="0"
      {...rest}
    >
      {title && <div className="ui-lite-upstream-dashboard__title">{title}</div>}
      <div className="ui-lite-upstream-dashboard__grid">
        {links.map((link) => (
          <div key={link.id} className="ui-lite-upstream-dashboard__link" data-status={link.status}>
            <span className="ui-lite-upstream-dashboard__vendor">{link.vendor}</span>
            <span className="ui-lite-upstream-dashboard__location">{link.location}</span>
          </div>
        ))}
      </div>
    </div>
    )
  }
)
UpstreamDashboard.displayName = 'UpstreamDashboard'
