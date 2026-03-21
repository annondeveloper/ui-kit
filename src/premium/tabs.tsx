'use client'

import { useRef, useEffect, useCallback, useState } from 'react'
import { Tabs as BaseTabs, TabPanel, type TabsProps, type TabPanelProps } from '../components/tabs'
import { useMotionLevel } from '../core/motion/use-motion-level'
import { css } from '../core/styles/css-tag'
import { useStyles } from '../core/styles/use-styles'

const premiumTabsStyles = css`
  @layer premium {
    @scope (.ui-premium-tabs) {
      :scope {
        position: relative;
      }
      /* Morphing underline indicator */
      .ui-premium-tabs__indicator {
        position: absolute;
        block-size: 2px;
        background: var(--brand, oklch(65% 0.2 270));
        border-radius: 1px;
        transition: left 0.3s cubic-bezier(0.34, 1.56, 0.64, 1),
                    width 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
        z-index: 2;
        pointer-events: none;
      }
      /* Panel crossfade */
      :scope .ui-tabs__panel:not([hidden]) {
        animation: ui-premium-tabs-panel-enter 0.3s ease-out;
      }
      @keyframes ui-premium-tabs-panel-enter {
        from {
          opacity: 0;
          transform: translateY(6px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }
      /* Stagger entry for content children */
      :scope .ui-tabs__panel:not([hidden]) > * {
        animation: ui-premium-tabs-stagger 0.25s ease-out both;
      }
      :scope .ui-tabs__panel:not([hidden]) > *:nth-child(1) { animation-delay: 0ms; }
      :scope .ui-tabs__panel:not([hidden]) > *:nth-child(2) { animation-delay: 40ms; }
      :scope .ui-tabs__panel:not([hidden]) > *:nth-child(3) { animation-delay: 80ms; }
      :scope .ui-tabs__panel:not([hidden]) > *:nth-child(4) { animation-delay: 120ms; }
      :scope .ui-tabs__panel:not([hidden]) > *:nth-child(5) { animation-delay: 160ms; }
      @keyframes ui-premium-tabs-stagger {
        from {
          opacity: 0;
          transform: translateY(4px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }
      /* Motion 0: disable */
      :scope[data-motion="0"] .ui-premium-tabs__indicator {
        transition: none;
      }
      :scope[data-motion="0"] .ui-tabs__panel:not([hidden]),
      :scope[data-motion="0"] .ui-tabs__panel:not([hidden]) > * {
        animation: none;
      }
    }
  }
`

export function Tabs({
  motion: motionProp,
  onChange,
  ...rest
}: TabsProps) {
  const motionLevel = useMotionLevel(motionProp)
  useStyles('premium-tabs', premiumTabsStyles)
  const wrapperRef = useRef<HTMLDivElement>(null)
  const indicatorRef = useRef<HTMLDivElement>(null)

  const updateIndicator = useCallback(() => {
    if (motionLevel < 2) return
    const wrapper = wrapperRef.current
    const indicator = indicatorRef.current
    if (!wrapper || !indicator) return

    const activeTab = wrapper.querySelector<HTMLElement>('[role="tab"][aria-selected="true"]')
    if (!activeTab) {
      indicator.style.opacity = '0'
      return
    }

    const tablist = wrapper.querySelector<HTMLElement>('[role="tablist"]')
    if (!tablist) return

    const tablistRect = tablist.getBoundingClientRect()
    const tabRect = activeTab.getBoundingClientRect()

    indicator.style.opacity = '1'
    indicator.style.left = `${tabRect.left - tablistRect.left}px`
    indicator.style.width = `${tabRect.width}px`
    // Position at bottom of tablist
    indicator.style.top = `${tablistRect.height - 2}px`
  }, [motionLevel])

  // Update indicator on mount and when tabs change
  useEffect(() => {
    updateIndicator()
  })

  const handleChange = useCallback((tabId: string) => {
    onChange?.(tabId)
    // Defer indicator update to next frame so DOM has settled
    requestAnimationFrame(updateIndicator)
  }, [onChange, updateIndicator])

  return (
    <div ref={wrapperRef} className="ui-premium-tabs" data-motion={motionLevel}>
      {motionLevel >= 2 && (
        <div ref={indicatorRef} className="ui-premium-tabs__indicator" style={{ opacity: 0 }} />
      )}
      <BaseTabs motion={motionProp} onChange={handleChange} {...rest} />
    </div>
  )
}

Tabs.displayName = 'Tabs'

// Re-export TabPanel unchanged
export { TabPanel } from '../components/tabs'
export type { TabsProps, TabPanelProps } from '../components/tabs'
