import { forwardRef, useState, type HTMLAttributes, type ReactNode } from 'react'
import { css } from '../core/styles/css-tag'
import { useStyles } from '../core/styles/use-styles'

const tabsStyles = css`
  @layer components {
    @scope (.ui-lite-tabs) {
      :scope {
        display: flex;
        flex-direction: column;
        gap: 0;
      }
      :scope[data-orientation="vertical"] {
        flex-direction: row;
      }

      .ui-lite-tabs__list {
        position: relative;
        display: flex;
        align-items: stretch;
        gap: 0;
        border-block-end: 1px solid var(--border-subtle, oklch(100% 0 0 / 0.08));
        overflow-x: auto;
        scrollbar-width: none;
      }
      .ui-lite-tabs__list::-webkit-scrollbar { display: none; }

      :scope[data-orientation="vertical"] .ui-lite-tabs__list {
        flex-direction: column;
        border-block-end: none;
        border-inline-end: 1px solid var(--border-subtle, oklch(100% 0 0 / 0.08));
        padding-inline-end: 0.5rem;
        min-inline-size: 140px;
        overflow-x: visible;
      }

      .ui-lite-tabs__tab {
        position: relative;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        gap: 0.25rem;
        padding: 0.5rem 0.875rem;
        background: none;
        border: none;
        border-block-end: 2px solid transparent;
        font-family: inherit;
        font-size: 0.875rem;
        font-weight: 500;
        cursor: pointer;
        white-space: nowrap;
        flex-shrink: 0;
        color: var(--text-secondary, oklch(70% 0 0));
      }
      .ui-lite-tabs__tab:hover:not([aria-selected="true"]):not(:disabled) {
        color: var(--text-primary, oklch(97% 0 0));
      }
      .ui-lite-tabs__tab[aria-selected="true"] {
        color: var(--text-primary, oklch(97% 0 0));
        font-weight: 600;
        border-block-end-color: var(--brand, oklch(65% 0.2 270));
      }
      .ui-lite-tabs__tab:disabled {
        opacity: 0.5;
        cursor: not-allowed;
      }
      .ui-lite-tabs__tab:focus-visible {
        outline: 2px solid var(--brand, oklch(65% 0.2 270));
        outline-offset: -2px;
        border-radius: var(--radius-sm, 0.25rem);
      }

      .ui-lite-tabs__tab-icon {
        display: inline-flex;
        align-items: center;
      }
      .ui-lite-tabs__tab-icon svg {
        inline-size: 1em;
        block-size: 1em;
      }

      .ui-lite-tabs__tab-label {
        line-height: 1;
      }

      .ui-lite-tabs__tab-badge {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        min-inline-size: 1.25em;
        padding-inline: 0.25em;
        font-size: 0.75em;
        font-weight: 600;
        line-height: 1;
        border-radius: var(--radius-full, 9999px);
        background: oklch(65% 0.2 270 / 0.15);
        color: var(--brand, oklch(65% 0.2 270));
      }

      .ui-lite-tabs__tab-close {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        inline-size: 1.25em;
        block-size: 1.25em;
        border: none;
        background: none;
        color: var(--text-secondary, oklch(70% 0 0));
        cursor: pointer;
        border-radius: var(--radius-sm, 0.25rem);
        padding: 0;
        margin-inline-start: 0.25em;
        font-size: 1em;
        line-height: 1;
      }
      .ui-lite-tabs__tab-close:hover {
        background: oklch(100% 0 0 / 0.08);
        color: var(--text-primary, oklch(97% 0 0));
      }

      /* Pills variant */
      :scope[data-variant="pills"] .ui-lite-tabs__list {
        border: none;
        gap: 0.25rem;
      }
      :scope[data-variant="pills"] .ui-lite-tabs__tab {
        border-radius: var(--radius-md, 0.5rem);
        border-block-end: none;
      }
      :scope[data-variant="pills"] .ui-lite-tabs__tab[aria-selected="true"] {
        background: var(--brand, oklch(65% 0.2 270));
        color: oklch(100% 0 0);
      }

      /* Enclosed variant */
      :scope[data-variant="enclosed"] .ui-lite-tabs__list {
        background: var(--bg-surface, oklch(18% 0.01 270));
        border: 1px solid var(--border-subtle, oklch(100% 0 0 / 0.08));
        border-radius: var(--radius-md, 0.5rem);
        padding: 0.25rem;
        gap: 0.25rem;
      }
      :scope[data-variant="enclosed"] .ui-lite-tabs__tab {
        border-radius: var(--radius-sm, 0.375rem);
        border-block-end: none;
      }
      :scope[data-variant="enclosed"] .ui-lite-tabs__tab[aria-selected="true"] {
        background: var(--bg-elevated, oklch(28% 0.02 270));
      }

      /* Sizes */
      :scope[data-size="sm"] .ui-lite-tabs__tab {
        padding: 0.375rem 0.625rem;
        font-size: 0.75rem;
      }
      :scope[data-size="lg"] .ui-lite-tabs__tab {
        padding: 0.625rem 1.125rem;
        font-size: 1rem;
      }

      .ui-lite-tabs__panels {
        padding-block-start: 0.75rem;
      }
      :scope[data-orientation="vertical"] .ui-lite-tabs__panels {
        padding-block-start: 0;
        padding-inline-start: 1rem;
        flex: 1;
        min-inline-size: 0;
      }

      .ui-lite-tabs__panel {
        outline: none;
        color: var(--text-primary, oklch(97% 0 0));
      }
      .ui-lite-tabs__panel[hidden] {
        display: none;
      }
    }
  }
`

export interface LiteTab {
  id: string
  label: ReactNode
  disabled?: boolean
  /** Icon rendered before the label */
  icon?: ReactNode
  /** Badge content rendered after the label */
  badge?: ReactNode
  /** Show a close button on this tab */
  closeable?: boolean
}

export interface LiteTabsProps extends Omit<HTMLAttributes<HTMLDivElement>, 'onChange'> {
  tabs: LiteTab[]
  activeTab?: string
  /** Initial active tab for uncontrolled usage */
  defaultTab?: string
  onChange?: (tabId: string) => void
  variant?: 'underline' | 'pills' | 'enclosed'
  /** data-orientation attribute */
  orientation?: 'horizontal' | 'vertical'
  /** data-size attribute */
  size?: 'sm' | 'md' | 'lg'
  /** Called when a closeable tab's close button is clicked */
  onClose?: (tabId: string) => void
  /** Interface only — defer rendering of inactive panels */
  lazy?: boolean
}

export const Tabs = forwardRef<HTMLDivElement, LiteTabsProps>(
  (
    {
      tabs,
      activeTab,
      defaultTab,
      onChange,
      variant = 'underline',
      orientation = 'horizontal',
      size = 'md',
      onClose,
      // interface-only — destructure so it doesn't spread onto <div>
      lazy: _lazy,
      className,
      children,
      ...rest
    },
    ref,
  ) => {
    useStyles('lite-tabs', tabsStyles)
    // Uncontrolled fallback: track internal active tab when activeTab is not provided
    const [internalActive, setInternalActive] = useState<string | undefined>(defaultTab)
    const resolved = activeTab ?? internalActive

    function handleTabClick(tabId: string) {
      if (!activeTab) setInternalActive(tabId)
      onChange?.(tabId)
    }

    return (
      <div
        ref={ref}
        className={`ui-lite-tabs${className ? ` ${className}` : ''}`}
        data-variant={variant}
        data-orientation={orientation}
        data-size={size}
        {...rest}
      >
        <div className="ui-lite-tabs__list" role="tablist" aria-orientation={orientation}>
          {tabs.map(tab => (
            <button
              key={tab.id}
              role="tab"
              type="button"
              className="ui-lite-tabs__tab"
              aria-selected={resolved === tab.id}
              disabled={tab.disabled}
              onClick={() => handleTabClick(tab.id)}
            >
              {tab.icon && <span className="ui-lite-tabs__tab-icon">{tab.icon}</span>}
              <span className="ui-lite-tabs__tab-label">{tab.label}</span>
              {tab.badge !== undefined && <span className="ui-lite-tabs__tab-badge">{tab.badge}</span>}
              {tab.closeable && onClose && (
                <button
                  type="button"
                  className="ui-lite-tabs__tab-close"
                  aria-label={`Close ${typeof tab.label === 'string' ? tab.label : tab.id}`}
                  onClick={e => { e.stopPropagation(); onClose(tab.id) }}
                >
                  &times;
                </button>
              )}
            </button>
          ))}
        </div>
        <div className="ui-lite-tabs__panels">{children}</div>
      </div>
    )
  },
)
Tabs.displayName = 'Tabs'

export interface LiteTabPanelProps extends HTMLAttributes<HTMLDivElement> {
  tabId: string
  activeTab?: string
}

export const TabPanel = forwardRef<HTMLDivElement, LiteTabPanelProps>(
  ({ tabId, activeTab, className, ...rest }, ref) => {
    useStyles('lite-tabs', tabsStyles)
    return (
      <div
        ref={ref}
        className={`ui-lite-tabs__panel${className ? ` ${className}` : ''}`}
        role="tabpanel"
        hidden={activeTab !== tabId}
        {...rest}
      />
    )
  },
)
TabPanel.displayName = 'TabPanel'
