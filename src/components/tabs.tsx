'use client'

import {
  useState,
  useCallback,
  useRef,
  Children,
  isValidElement,
  type HTMLAttributes,
  type ReactNode,
  type KeyboardEvent,
} from 'react'
import { css } from '../core/styles/css-tag'
import { useStyles } from '../core/styles/use-styles'
import { useMotionLevel } from '../core/motion/use-motion-level'
import { useStableId } from '../core/a11y/stable-id'
import { cn } from '../core/utils/cn'

// ─── Types ──────────────────────────────────────────────────────────────────

export interface Tab {
  id: string
  label: ReactNode
  icon?: ReactNode
  disabled?: boolean
}

export interface TabsProps extends Omit<HTMLAttributes<HTMLDivElement>, 'onChange'> {
  tabs: Tab[]
  activeTab?: string
  defaultTab?: string
  onChange?: (tabId: string) => void
  variant?: 'underline' | 'pills' | 'enclosed'
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  orientation?: 'horizontal' | 'vertical'
  lazy?: boolean
  motion?: 0 | 1 | 2 | 3
  children: ReactNode
}

export interface TabPanelProps extends HTMLAttributes<HTMLDivElement> {
  tabId: string
  children: ReactNode
}

// ─── Styles ─────────────────────────────────────────────────────────────────

const tabsStyles = css`
  @layer components {
    @scope (.ui-tabs) {
      :scope {
        display: flex;
        flex-direction: column;
        gap: 0;
        container-type: inline-size;
      }

      :scope[data-orientation="vertical"] {
        flex-direction: row;
        gap: 0;
      }

      /* ── Tablist ───────────────────────────────────────── */

      .ui-tabs__list {
        position: relative;
        display: flex;
        align-items: stretch;
        gap: var(--space-xs, 0.25rem);
        overflow-x: auto;
        scrollbar-width: none;
        -ms-overflow-style: none;
      }
      .ui-tabs__list::-webkit-scrollbar {
        display: none;
      }

      :scope[data-orientation="vertical"] .ui-tabs__list {
        flex-direction: column;
        overflow-x: visible;
        overflow-y: auto;
        border-inline-end: 1px solid var(--border-subtle, oklch(100% 0 0 / 0.08));
        padding-inline-end: var(--space-sm, 0.5rem);
        min-inline-size: 140px;
      }

      /* Fade edges for overflow */
      .ui-tabs__list-wrapper {
        position: relative;
        overflow: hidden;
      }
      .ui-tabs__list-wrapper::before,
      .ui-tabs__list-wrapper::after {
        content: '';
        position: absolute;
        inset-block: 0;
        inline-size: 2rem;
        z-index: 2;
        pointer-events: none;
        opacity: 0;
        transition: opacity 0.2s;
      }
      .ui-tabs__list-wrapper::before {
        inset-inline-start: 0;
        background: linear-gradient(to right, var(--bg-surface, oklch(18% 0.01 270)), transparent);
      }
      .ui-tabs__list-wrapper::after {
        inset-inline-end: 0;
        background: linear-gradient(to left, var(--bg-surface, oklch(18% 0.01 270)), transparent);
      }
      .ui-tabs__list-wrapper[data-overflow-start="true"]::before { opacity: 1; }
      .ui-tabs__list-wrapper[data-overflow-end="true"]::after { opacity: 1; }

      /* ── Tab Button ────────────────────────────────────── */

      .ui-tabs__tab {
        position: relative;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        gap: var(--space-xs, 0.25rem);
        border: none;
        background: transparent;
        color: var(--text-secondary, oklch(70% 0 0));
        cursor: pointer;
        white-space: nowrap;
        font-family: inherit;
        font-weight: 500;
        outline: none;
        transition: color 0.15s, background 0.15s;
        flex-shrink: 0;
      }

      .ui-tabs__tab:focus-visible {
        outline: 2px solid var(--brand, oklch(65% 0.2 270));
        outline-offset: -2px;
        border-radius: var(--radius-sm, 0.25rem);
      }

      .ui-tabs__tab[aria-selected="true"] {
        color: var(--text-primary, oklch(90% 0 0));
        font-weight: 600;
      }

      .ui-tabs__tab[aria-disabled="true"] {
        opacity: 0.4;
        cursor: not-allowed;
      }

      .ui-tabs__tab svg {
        inline-size: 1em;
        block-size: 1em;
        flex-shrink: 0;
      }

      /* ── Sizes ─────────────────────────────────────────── */

      :scope[data-size="xs"] .ui-tabs__tab {
        padding-block: 0.25rem;
        padding-inline: 0.5rem;
        font-size: var(--text-xs, 0.6875rem);
      }
      :scope[data-size="sm"] .ui-tabs__tab {
        padding-block: 0.375rem;
        padding-inline: 0.625rem;
        font-size: var(--text-xs, 0.75rem);
      }
      :scope[data-size="md"] .ui-tabs__tab {
        padding-block: 0.5rem;
        padding-inline: 0.875rem;
        font-size: var(--text-sm, 0.875rem);
      }
      :scope[data-size="lg"] .ui-tabs__tab {
        padding-block: 0.625rem;
        padding-inline: 1.125rem;
        font-size: var(--text-base, 1rem);
      }
      :scope[data-size="xl"] .ui-tabs__tab {
        padding-block: 0.75rem;
        padding-inline: 1.375rem;
        font-size: var(--text-lg, 1.125rem);
      }

      /* ── Underline Variant ─────────────────────────────── */

      :scope[data-variant="underline"] .ui-tabs__list {
        border-block-end: 1px solid var(--border-subtle, oklch(100% 0 0 / 0.08));
      }
      :scope[data-variant="underline"][data-orientation="vertical"] .ui-tabs__list {
        border-block-end: none;
      }

      :scope[data-variant="underline"] .ui-tabs__tab::after {
        content: '';
        position: absolute;
        inset-block-end: -1px;
        inset-inline: 0;
        block-size: 2px;
        background: var(--brand, oklch(65% 0.2 270));
        border-radius: 1px 1px 0 0;
        transform: scaleX(0);
        transition: transform 0.2s var(--ease-out, ease-out);
      }
      :scope[data-variant="underline"] .ui-tabs__tab[aria-selected="true"]::after {
        transform: scaleX(1);
      }
      :scope[data-variant="underline"][data-orientation="vertical"] .ui-tabs__tab::after {
        inset-block: 0;
        inset-inline-end: calc(-1 * var(--space-sm, 0.5rem) - 1px);
        inset-inline-start: auto;
        inline-size: 2px;
        block-size: auto;
        border-radius: 0 1px 1px 0;
        transform: scaleY(0);
      }
      :scope[data-variant="underline"][data-orientation="vertical"] .ui-tabs__tab[aria-selected="true"]::after {
        transform: scaleY(1);
      }

      /* No underline animation when motion=0 */
      :scope[data-motion="0"][data-variant="underline"] .ui-tabs__tab::after {
        transition: none;
      }

      /* ── Pills Variant ─────────────────────────────────── */

      :scope[data-variant="pills"] .ui-tabs__tab {
        border-radius: var(--radius-full, 9999px);
      }
      :scope[data-variant="pills"] .ui-tabs__tab[aria-selected="true"] {
        background: var(--brand, oklch(65% 0.2 270));
        color: var(--text-on-brand);
      }
      :scope[data-variant="pills"] .ui-tabs__tab:hover:not([aria-selected="true"]):not([aria-disabled="true"]) {
        background: var(--bg-hover);
      }

      /* ── Enclosed Variant ──────────────────────────────── */

      :scope[data-variant="enclosed"] .ui-tabs__list {
        background: var(--bg-surface, oklch(18% 0.01 270));
        border-radius: var(--radius-md, 0.5rem);
        padding: var(--space-xs, 0.25rem);
        border: 1px solid var(--border-subtle, oklch(100% 0 0 / 0.08));
      }
      :scope[data-variant="enclosed"] .ui-tabs__tab {
        border-radius: var(--radius-sm, 0.375rem);
      }
      :scope[data-variant="enclosed"] .ui-tabs__tab[aria-selected="true"] {
        background: var(--bg-elevated, oklch(28% 0.02 270));
        box-shadow: var(--shadow-sm, 0 1px 3px oklch(0% 0 0 / 0.12));
      }
      :scope[data-variant="enclosed"] .ui-tabs__tab:hover:not([aria-selected="true"]):not([aria-disabled="true"]) {
        background: var(--bg-hover);
      }

      /* ── Panel ─────────────────────────────────────────── */

      .ui-tabs__panel {
        padding-block-start: var(--space-md, 1rem);
        outline: none;
      }
      :scope[data-orientation="vertical"] .ui-tabs__panel {
        padding-block-start: 0;
        padding-inline-start: var(--space-md, 1rem);
        flex: 1;
        min-inline-size: 0;
      }

      .ui-tabs__panel[hidden] {
        display: none;
      }

      /* Panel entry animation — motion 2+ */
      :scope:not([data-motion="0"]):not([data-motion="1"]) .ui-tabs__panel:not([hidden]) {
        animation: ui-tabs-fade-in 0.2s var(--ease-out, ease-out);
      }

      /* Hover state for non-selected tabs */
      .ui-tabs__tab:hover:not([aria-selected="true"]):not([aria-disabled="true"]) {
        color: var(--text-primary, oklch(90% 0 0));
      }

      /* ── Touch targets ─────────────────────────────────── */

      @media (pointer: coarse) {
        .ui-tabs__tab {
          min-block-size: 44px;
          min-inline-size: 44px;
        }
      }

      /* ── Forced colors ─────────────────────────────────── */

      @media (forced-colors: active) {
        .ui-tabs__tab[aria-selected="true"] {
          border-block-end: 2px solid Highlight;
        }
        .ui-tabs__tab:focus-visible {
          outline: 2px solid Highlight;
        }
        .ui-tabs__list {
          border-color: ButtonText;
        }
      }

      /* ── Print ─────────────────────────────────────────── */

      @media print {
        .ui-tabs__tab::after {
          display: none;
        }
        .ui-tabs__panel[hidden] {
          display: block !important;
        }
      }
    }

    @keyframes ui-tabs-fade-in {
      from { opacity: 0; transform: translateY(4px); }
      to { opacity: 1; transform: translateY(0); }
    }
  }
`

// ─── TabPanel ───────────────────────────────────────────────────────────────

export function TabPanel({ tabId, children, className, ...rest }: TabPanelProps) {
  return (
    <div className={cn('ui-tabs__panel-inner', className)} data-tab-id={tabId} {...rest}>
      {children}
    </div>
  )
}
TabPanel.displayName = 'TabPanel'

// ─── Component ──────────────────────────────────────────────────────────────

export function Tabs({
  tabs,
  activeTab: controlledActive,
  defaultTab,
  onChange,
  variant = 'underline',
  size = 'md',
  orientation = 'horizontal',
  lazy = false,
  motion: motionProp,
  children,
  className,
  ...rest
}: TabsProps) {
  const cls = useStyles('tabs', tabsStyles)
  const motionLevel = useMotionLevel(motionProp)
  const baseId = useStableId('tabs')
  const tablistRef = useRef<HTMLDivElement>(null)

  // Determine initial tab
  const isControlled = controlledActive !== undefined
  const [internalActive, setInternalActive] = useState(
    () => defaultTab ?? tabs[0]?.id ?? ''
  )
  const activeId = isControlled ? controlledActive : internalActive

  // Collect TabPanel children
  const panelChildren: { tabId: string; content: ReactNode }[] = []
  Children.forEach(children, (child) => {
    if (isValidElement(child) && child.props && (child as any).props['data-tab-id'] !== undefined) {
      panelChildren.push({ tabId: (child as any).props['data-tab-id'], content: (child as any).props.children })
    } else if (isValidElement(child) && (child.type as any)?.displayName === 'TabPanel') {
      panelChildren.push({ tabId: (child.props as any).tabId, content: (child.props as any).children })
    }
  })

  // Generate IDs for ARIA linking
  const getTabId = (tabId: string) => `${baseId}-tab-${tabId}`
  const getPanelId = (tabId: string) => `${baseId}-panel-${tabId}`

  // Get enabled tabs for keyboard navigation
  const enabledTabs = tabs.filter((t) => !t.disabled)

  const handleTabClick = useCallback(
    (tabId: string) => {
      const tab = tabs.find((t) => t.id === tabId)
      if (tab?.disabled) return
      if (!isControlled) {
        setInternalActive(tabId)
      }
      onChange?.(tabId)
    },
    [tabs, isControlled, onChange]
  )

  const handleKeyDown = useCallback(
    (e: KeyboardEvent<HTMLDivElement>) => {
      const isVertical = orientation === 'vertical'
      const nextKey = isVertical ? 'ArrowDown' : 'ArrowRight'
      const prevKey = isVertical ? 'ArrowUp' : 'ArrowLeft'

      if (![nextKey, prevKey, 'Home', 'End', 'Enter', ' '].includes(e.key)) return
      e.preventDefault()

      // Find current focused tab index among all tabs
      const focusedEl = document.activeElement as HTMLElement
      const allTabEls = Array.from(
        tablistRef.current?.querySelectorAll<HTMLElement>('[role="tab"]') ?? []
      )
      const currentIdx = allTabEls.indexOf(focusedEl)
      if (currentIdx === -1 && !['Home', 'End'].includes(e.key)) return

      // Get enabled indices
      const enabledIndices = tabs.reduce<number[]>((acc, t, i) => {
        if (!t.disabled) acc.push(i)
        return acc
      }, [])

      if (enabledIndices.length === 0) return

      let targetIdx: number

      if (e.key === 'Home') {
        targetIdx = enabledIndices[0]
      } else if (e.key === 'End') {
        targetIdx = enabledIndices[enabledIndices.length - 1]
      } else if (e.key === 'Enter' || e.key === ' ') {
        // Activate the focused tab
        if (currentIdx >= 0) {
          handleTabClick(tabs[currentIdx].id)
        }
        return
      } else {
        // Arrow navigation: find next enabled tab
        const currentEnabledIdx = enabledIndices.indexOf(currentIdx)
        if (e.key === nextKey) {
          const next = currentEnabledIdx + 1
          targetIdx = enabledIndices[next >= enabledIndices.length ? 0 : next]
        } else {
          const prev = currentEnabledIdx - 1
          targetIdx = enabledIndices[prev < 0 ? enabledIndices.length - 1 : prev]
        }
      }

      allTabEls[targetIdx]?.focus()

      // Update tabindex for roving pattern
      allTabEls.forEach((el, i) => {
        el.setAttribute('tabindex', i === targetIdx ? '0' : '-1')
      })
    },
    [orientation, tabs, handleTabClick]
  )

  return (
    <div
      className={cn(cls('root'), className)}
      data-variant={variant}
      data-size={size}
      data-orientation={orientation}
      data-motion={motionLevel}
      {...rest}
    >
      <div className="ui-tabs__list-wrapper">
        <div
          ref={tablistRef}
          role="tablist"
          aria-orientation={orientation}
          className="ui-tabs__list"
          onKeyDown={handleKeyDown}
        >
          {tabs.map((tab, i) => {
            const isActive = tab.id === activeId
            const enabledIndex = enabledTabs.findIndex((t) => t.id === tab.id)
            // Active tab gets tabindex 0, or if no active in enabled, first enabled gets 0
            const activeInEnabled = enabledTabs.some((t) => t.id === activeId)
            const shouldHaveTabIndex =
              tab.disabled
                ? -1
                : isActive
                  ? 0
                  : (!activeInEnabled && enabledIndex === 0)
                    ? 0
                    : -1

            return (
              <button
                key={tab.id}
                id={getTabId(tab.id)}
                role="tab"
                type="button"
                aria-selected={isActive}
                aria-controls={getPanelId(tab.id)}
                aria-disabled={tab.disabled || undefined}
                tabIndex={shouldHaveTabIndex}
                className="ui-tabs__tab"
                onClick={() => handleTabClick(tab.id)}
              >
                {tab.icon && <span className="ui-tabs__tab-icon">{tab.icon}</span>}
                {tab.label}
              </button>
            )
          })}
        </div>
      </div>

      <div className="ui-tabs__panels">
        {tabs.map((tab) => {
          const isActive = tab.id === activeId
          const panel = panelChildren.find((p) => p.tabId === tab.id)

          if (lazy && !isActive) return null

          return (
            <div
              key={tab.id}
              id={getPanelId(tab.id)}
              role="tabpanel"
              aria-labelledby={getTabId(tab.id)}
              className="ui-tabs__panel"
              hidden={!isActive}
              tabIndex={isActive ? 0 : -1}
            >
              {panel?.content}
            </div>
          )
        })}
      </div>
    </div>
  )
}

Tabs.displayName = 'Tabs'
