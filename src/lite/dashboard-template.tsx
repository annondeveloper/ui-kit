import { forwardRef, type HTMLAttributes, type ReactNode } from 'react'

export interface LiteDashboardMetric {
  title: string
  value: ReactNode
}

export interface LiteDashboardSection {
  title: string
  content: ReactNode
}

export interface LiteDashboardTemplateProps extends Omit<HTMLAttributes<HTMLDivElement>, 'title'> {
  title?: ReactNode
  metrics?: LiteDashboardMetric[]
  sections?: LiteDashboardSection[]
  sidebar?: ReactNode
  children?: ReactNode
}

/** Lite DashboardTemplate — simple flex layout, no animation, inline styles */
export const DashboardTemplate = forwardRef<HTMLDivElement, LiteDashboardTemplateProps>(
  ({ title, metrics, sections, sidebar, children, className, ...rest }, ref) => {
    return (
      <div
        ref={ref}
        className={`ui-lite-dashboard-template${className ? ` ${className}` : ''}`}
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '1rem',
          minInlineSize: '320px',
        }}
        {...rest}
      >
        {/* Header */}
        {title && (
          <h2 style={{
            margin: 0,
            fontSize: '1.5rem',
            fontWeight: 700,
            color: 'oklch(90% 0 0)',
            lineHeight: 1.3,
          }}>
            {title}
          </h2>
        )}

        {/* Metric strip */}
        {metrics && metrics.length > 0 && (
          <div style={{
            display: 'flex',
            gap: '0.5rem',
            overflowX: 'auto',
          }}>
            {metrics.map((metric, i) => (
              <div
                key={i}
                style={{
                  flexShrink: 0,
                  minInlineSize: '120px',
                  padding: '0.625rem 0.875rem',
                  background: 'oklch(20% 0.01 270)',
                  border: '1px solid oklch(100% 0 0 / 0.08)',
                  borderRadius: '0.5rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.125rem',
                }}
              >
                <span style={{
                  fontSize: '0.75rem',
                  color: 'oklch(55% 0 0)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.04em',
                  fontWeight: 600,
                }}>
                  {metric.title}
                </span>
                <span style={{
                  fontSize: '1.125rem',
                  fontWeight: 700,
                  color: 'oklch(90% 0 0)',
                }}>
                  {metric.value}
                </span>
              </div>
            ))}
          </div>
        )}

        {/* Body */}
        <div style={{
          display: 'flex',
          gap: '1rem',
          alignItems: 'flex-start',
        }}>
          {/* Main content */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '1rem', minInlineSize: 0 }}>
            {sections?.map((section, i) => (
              <div
                key={i}
                style={{
                  background: 'oklch(20% 0.01 270)',
                  border: '1px solid oklch(100% 0 0 / 0.08)',
                  borderRadius: '0.5rem',
                  overflow: 'hidden',
                }}
              >
                <div style={{
                  padding: '0.75rem 1rem',
                  borderBlockEnd: '1px solid oklch(100% 0 0 / 0.06)',
                }}>
                  <h3 style={{
                    margin: 0,
                    fontSize: '0.875rem',
                    fontWeight: 600,
                    color: 'oklch(90% 0 0)',
                  }}>
                    {section.title}
                  </h3>
                </div>
                <div style={{ padding: '1rem' }}>
                  {section.content}
                </div>
              </div>
            ))}
            {children}
          </div>

          {/* Sidebar */}
          {sidebar && (
            <aside style={{
              inlineSize: '240px',
              flexShrink: 0,
            }}>
              {sidebar}
            </aside>
          )}
        </div>
      </div>
    )
  }
)
DashboardTemplate.displayName = 'DashboardTemplate'
