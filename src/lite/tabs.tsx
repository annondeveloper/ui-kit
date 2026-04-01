import { forwardRef, useState, type HTMLAttributes, type ReactNode } from 'react'

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
  ({ tabId, activeTab, className, ...rest }, ref) => (
    <div
      ref={ref}
      className={`ui-lite-tabs__panel${className ? ` ${className}` : ''}`}
      role="tabpanel"
      hidden={activeTab !== tabId}
      {...rest}
    />
  ),
)
TabPanel.displayName = 'TabPanel'
