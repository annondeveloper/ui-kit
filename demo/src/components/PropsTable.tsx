import { css } from '@ui/core/styles/css-tag'
import { useStyles } from '@ui/core/styles/use-styles'
import { Badge } from '@ui/components/badge'

// ─── Types ──────────────────────────────────────────────────────────────────

export interface PropDef {
  name: string
  type: string
  default?: string
  required?: boolean
  description: string
}

// ─── Styles ─────────────────────────────────────────────────────────────────

const propsTableStyles = css`
  @layer components {
    @scope (.ui-props-table) {
      :scope {
        container-type: inline-size;
        inline-size: 100%;
      }

      /* ── Table mode (wide) ─────────────────────────────── */

      .ui-props-table__table {
        inline-size: 100%;
        border-collapse: collapse;
        font-size: var(--text-sm, 0.875rem);
        line-height: 1.5;
      }

      .ui-props-table__table th {
        text-align: start;
        padding-block: var(--space-sm, 0.5rem);
        padding-inline: var(--space-md, 0.75rem);
        font-size: var(--text-xs, 0.75rem);
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: 0.05em;
        color: var(--text-tertiary, oklch(55% 0 0));
        border-block-end: 1px solid var(--border-subtle, oklch(100% 0 0 / 0.08));
        white-space: nowrap;
      }

      .ui-props-table__table td {
        padding-block: var(--space-sm, 0.5rem);
        padding-inline: var(--space-md, 0.75rem);
        vertical-align: baseline;
      }

      /* Striped rows */
      .ui-props-table__table tbody tr:nth-child(even) {
        background: oklch(100% 0 0 / 0.02);
      }
      .ui-props-table__table tbody tr:hover {
        background: oklch(100% 0 0 / 0.04);
      }

      /* Prop name column */
      .ui-props-table__name {
        display: inline-flex;
        align-items: center;
        gap: var(--space-xs, 0.25rem);
        font-weight: 600;
        color: var(--text-primary, oklch(90% 0 0));
      }

      /* Monospace code values */
      .ui-props-table__code {
        font-family: 'SF Mono', 'Fira Code', 'JetBrains Mono', monospace;
        font-size: var(--text-xs, 0.75rem);
        background: oklch(100% 0 0 / 0.06);
        padding-block: 0.125rem;
        padding-inline: 0.375rem;
        border-radius: var(--radius-sm, 0.25rem);
        color: oklch(from var(--brand, oklch(65% 0.2 270)) calc(l + 0.1) c h);
        word-break: break-word;
      }

      .ui-props-table__default {
        font-family: 'SF Mono', 'Fira Code', 'JetBrains Mono', monospace;
        font-size: var(--text-xs, 0.75rem);
        color: var(--text-secondary, oklch(70% 0 0));
      }

      .ui-props-table__desc {
        color: var(--text-secondary, oklch(70% 0 0));
        text-wrap: pretty;
      }

      .ui-props-table__dash {
        color: var(--text-tertiary, oklch(55% 0 0));
      }

      /* ── Card mode (narrow) ─────────────────────────────── */

      .ui-props-table__cards {
        display: none;
        flex-direction: column;
        gap: var(--space-sm, 0.5rem);
      }

      .ui-props-table__card {
        padding: var(--space-md, 0.75rem);
        border-radius: var(--radius-md, 0.5rem);
        border: 1px solid var(--border-subtle, oklch(100% 0 0 / 0.08));
        background: var(--bg-surface, oklch(22% 0.02 270));
      }

      .ui-props-table__card-header {
        display: flex;
        align-items: center;
        gap: var(--space-xs, 0.25rem);
        margin-block-end: var(--space-xs, 0.25rem);
      }

      .ui-props-table__card-row {
        display: flex;
        align-items: baseline;
        gap: var(--space-sm, 0.5rem);
        font-size: var(--text-xs, 0.75rem);
        margin-block-start: var(--space-xs, 0.25rem);
      }

      .ui-props-table__card-label {
        color: var(--text-tertiary, oklch(55% 0 0));
        font-weight: 500;
        text-transform: uppercase;
        letter-spacing: 0.05em;
        flex-shrink: 0;
        min-inline-size: 4rem;
      }

      .ui-props-table__card-desc {
        color: var(--text-secondary, oklch(70% 0 0));
        font-size: var(--text-sm, 0.875rem);
        margin-block-start: var(--space-xs, 0.25rem);
        text-wrap: pretty;
      }

      /* Responsive: switch to cards when container is narrow */
      @container (max-width: 540px) {
        .ui-props-table__table {
          display: none;
        }
        .ui-props-table__cards {
          display: flex;
        }
      }
    }
  }
`

// ─── Component ──────────────────────────────────────────────────────────────

export function PropsTable({ props }: { props: PropDef[] }) {
  useStyles('props-table', propsTableStyles)

  return (
    <div className="ui-props-table">
      {/* Table view (wide screens) */}
      <table className="ui-props-table__table">
        <thead>
          <tr>
            <th>Prop</th>
            <th>Type</th>
            <th>Default</th>
            <th>Description</th>
          </tr>
        </thead>
        <tbody>
          {props.map((prop) => (
            <tr key={prop.name}>
              <td>
                <span className="ui-props-table__name">
                  {prop.name}
                  {prop.required && (
                    <Badge variant="danger" size="xs">required</Badge>
                  )}
                </span>
              </td>
              <td>
                <code className="ui-props-table__code">{prop.type}</code>
              </td>
              <td>
                {prop.default
                  ? <code className="ui-props-table__default">{prop.default}</code>
                  : <span className="ui-props-table__dash">&mdash;</span>
                }
              </td>
              <td>
                <span className="ui-props-table__desc">{prop.description}</span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Card view (narrow screens) */}
      <div className="ui-props-table__cards">
        {props.map((prop) => (
          <div key={prop.name} className="ui-props-table__card">
            <div className="ui-props-table__card-header">
              <span className="ui-props-table__name">{prop.name}</span>
              {prop.required && (
                <Badge variant="danger" size="xs">required</Badge>
              )}
            </div>
            <div className="ui-props-table__card-row">
              <span className="ui-props-table__card-label">Type</span>
              <code className="ui-props-table__code">{prop.type}</code>
            </div>
            {prop.default && (
              <div className="ui-props-table__card-row">
                <span className="ui-props-table__card-label">Default</span>
                <code className="ui-props-table__default">{prop.default}</code>
              </div>
            )}
            <div className="ui-props-table__card-desc">{prop.description}</div>
          </div>
        ))}
      </div>
    </div>
  )
}
