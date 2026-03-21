import { forwardRef, type HTMLAttributes, type ReactNode } from 'react'

export interface LiteTab {
  id: string
  label: ReactNode
  disabled?: boolean
}

export interface LiteTabsProps extends Omit<HTMLAttributes<HTMLDivElement>, 'onChange'> {
  tabs: LiteTab[]
  activeTab?: string
  onChange?: (tabId: string) => void
  variant?: 'underline' | 'pills'
}

export const Tabs = forwardRef<HTMLDivElement, LiteTabsProps>(
  ({ tabs, activeTab, onChange, variant = 'underline', className, children, ...rest }, ref) => (
    <div ref={ref} className={`ui-lite-tabs${className ? ` ${className}` : ''}`} data-variant={variant} {...rest}>
      <div className="ui-lite-tabs__list" role="tablist">
        {tabs.map(tab => (
          <button
            key={tab.id}
            role="tab"
            type="button"
            className="ui-lite-tabs__tab"
            aria-selected={activeTab === tab.id}
            disabled={tab.disabled}
            onClick={() => onChange?.(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>
      <div className="ui-lite-tabs__panels">{children}</div>
    </div>
  )
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
  )
)
TabPanel.displayName = 'TabPanel'
