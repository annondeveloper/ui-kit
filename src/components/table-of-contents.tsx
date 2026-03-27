'use client'

import {
  forwardRef,
  useState,
  useCallback,
  useEffect,
  useRef,
  type HTMLAttributes,
} from 'react'
import { css } from '../core/styles/css-tag'
import { useStyles } from '../core/styles/use-styles'
import { useMotionLevel } from '../core/motion/use-motion-level'
import { cn } from '../core/utils/cn'

// ─── Types ──────────────────────────────────────────────────────────────────

export interface TocItem {
  id: string
  label: string
  level: number
  children?: TocItem[]
}

export interface TableOfContentsProps extends HTMLAttributes<HTMLElement> {
  items: TocItem[]
  activeId?: string
  onItemClick?: (id: string) => void
  scrollSpy?: boolean
  scrollOffset?: number
  size?: 'sm' | 'md' | 'lg'
  variant?: 'default' | 'filled' | 'dots'
  motion?: 0 | 1 | 2 | 3
}

// ─── Helpers ────────────────────────────────────────────────────────────────

function flattenItems(items: TocItem[]): TocItem[] {
  const result: TocItem[] = []
  for (const item of items) {
    result.push(item)
    if (item.children) {
      result.push(...flattenItems(item.children))
    }
  }
  return result
}

// ─── Styles ─────────────────────────────────────────────────────────────────

const tocStyles = css`
  @layer components {
    @scope (.ui-toc) {
      :scope {
        position: relative;
        display: flex;
        flex-direction: column;
        font-family: inherit;
      }

      /* ── List ───────────────────────────────────────── */

      .ui-toc__list {
        list-style: none;
        margin: 0;
        padding: 0;
        position: relative;
      }

      .ui-toc__list .ui-toc__list {
        margin-inline-start: 0;
      }

      /* ── Item ───────────────────────────────────────── */

      .ui-toc__item {
        position: relative;
      }

      /* ── Link ───────────────────────────────────────── */

      .ui-toc__link {
        position: relative;
        display: block;
        text-decoration: none;
        color: var(--text-tertiary, oklch(55% 0 0));
        font-weight: 400;
        border: none;
        background: transparent;
        cursor: pointer;
        font-family: inherit;
        text-align: start;
        inline-size: 100%;
        outline: none;
        transition: color 0.15s, background 0.15s, padding-inline-start 0.15s;
        border-radius: var(--radius-sm, 0.25rem);
        line-height: 1.5;
      }

      .ui-toc__link:hover {
        color: var(--text-primary, oklch(90% 0 0));
      }

      .ui-toc__link:focus-visible {
        outline: 2px solid var(--brand, oklch(65% 0.2 270));
        outline-offset: 2px;
      }

      .ui-toc__link[data-active="true"] {
        color: var(--brand, oklch(65% 0.2 270));
        font-weight: 600;
      }

      /* ── Indentation per level ──────────────────────── */

      .ui-toc__link[data-level="1"] { padding-inline-start: 0.75rem; }
      .ui-toc__link[data-level="2"] { padding-inline-start: 1.5rem; }
      .ui-toc__link[data-level="3"] { padding-inline-start: 2.25rem; }
      .ui-toc__link[data-level="4"] { padding-inline-start: 3rem; }
      .ui-toc__link[data-level="5"] { padding-inline-start: 3.75rem; }
      .ui-toc__link[data-level="6"] { padding-inline-start: 4.5rem; }

      /* ── Sizes ──────────────────────────────────────── */

      :scope[data-size="sm"] .ui-toc__link {
        padding-block: 0.1875rem;
        font-size: var(--text-xs, 0.75rem);
      }
      :scope[data-size="md"] .ui-toc__link {
        padding-block: 0.3125rem;
        font-size: var(--text-sm, 0.875rem);
      }
      :scope[data-size="lg"] .ui-toc__link {
        padding-block: 0.4375rem;
        font-size: var(--text-base, 1rem);
      }

      /* ── Default variant — left border indicator ────── */

      :scope[data-variant="default"] .ui-toc__list {
        border-inline-start: 2px solid oklch(100% 0 0 / 0.06);
      }

      :scope[data-variant="default"] .ui-toc__indicator {
        position: absolute;
        inset-inline-start: -2px;
        inline-size: 2px;
        border-radius: 1px;
        background: var(--brand, oklch(65% 0.2 270));
        box-shadow: 0 0 8px oklch(from var(--brand, oklch(65% 0.2 270)) l c h / 0.3);
        pointer-events: none;
        z-index: 1;
      }

      :scope[data-variant="default"][data-motion="0"] .ui-toc__indicator {
        transition: none;
      }
      :scope[data-variant="default"][data-motion="1"] .ui-toc__indicator {
        transition: transform 0.15s ease-out, block-size 0.15s ease-out;
      }
      :scope[data-variant="default"][data-motion="2"] .ui-toc__indicator {
        transition: transform 0.25s cubic-bezier(0.34, 1.56, 0.64, 1),
                    block-size 0.25s cubic-bezier(0.34, 1.56, 0.64, 1);
      }
      :scope[data-variant="default"][data-motion="3"] .ui-toc__indicator {
        transition: transform 0.35s cubic-bezier(0.22, 1.3, 0.36, 1),
                    block-size 0.35s cubic-bezier(0.22, 1.3, 0.36, 1);
      }

      /* ── Filled variant ─────────────────────────────── */

      :scope[data-variant="filled"] .ui-toc__link[data-active="true"] {
        background: oklch(from var(--brand, oklch(65% 0.2 270)) l c h / 0.1);
        border-radius: var(--radius-sm, 0.25rem);
      }

      /* ── Dots variant ───────────────────────────────── */

      :scope[data-variant="dots"] .ui-toc__link {
        padding-inline-start: 1.5rem;
      }
      :scope[data-variant="dots"] .ui-toc__link[data-level="2"] { padding-inline-start: 2.25rem; }
      :scope[data-variant="dots"] .ui-toc__link[data-level="3"] { padding-inline-start: 3rem; }
      :scope[data-variant="dots"] .ui-toc__link[data-level="4"] { padding-inline-start: 3.75rem; }
      :scope[data-variant="dots"] .ui-toc__link[data-level="5"] { padding-inline-start: 4.5rem; }
      :scope[data-variant="dots"] .ui-toc__link[data-level="6"] { padding-inline-start: 5.25rem; }

      :scope[data-variant="dots"] .ui-toc__link::before {
        content: '';
        position: absolute;
        inset-inline-start: 0.5rem;
        inset-block-start: 50%;
        transform: translateY(-50%);
        inline-size: 6px;
        block-size: 6px;
        border-radius: var(--radius-full, 9999px);
        background: oklch(100% 0 0 / 0.15);
        transition: background 0.15s, box-shadow 0.15s;
      }
      :scope[data-variant="dots"] .ui-toc__link[data-level="2"]::before { inset-inline-start: 1.25rem; }
      :scope[data-variant="dots"] .ui-toc__link[data-level="3"]::before { inset-inline-start: 2rem; }
      :scope[data-variant="dots"] .ui-toc__link[data-level="4"]::before { inset-inline-start: 2.75rem; }
      :scope[data-variant="dots"] .ui-toc__link[data-level="5"]::before { inset-inline-start: 3.5rem; }
      :scope[data-variant="dots"] .ui-toc__link[data-level="6"]::before { inset-inline-start: 4.25rem; }

      :scope[data-variant="dots"] .ui-toc__link[data-active="true"]::before {
        background: var(--brand, oklch(65% 0.2 270));
        box-shadow: 0 0 6px oklch(from var(--brand, oklch(65% 0.2 270)) l c h / 0.4);
      }

      /* ── Touch targets ──────────────────────────────── */

      @media (pointer: coarse) {
        .ui-toc__link {
          min-block-size: 44px;
          display: flex;
          align-items: center;
        }
      }

      /* ── Forced colors ──────────────────────────────── */

      @media (forced-colors: active) {
        .ui-toc__link[data-active="true"] {
          outline: 2px solid Highlight;
        }
        :scope[data-variant="default"] .ui-toc__list {
          border-color: ButtonText;
        }
        :scope[data-variant="default"] .ui-toc__indicator {
          background: Highlight;
        }
      }

      /* ── Print ──────────────────────────────────────── */

      @media print {
        .ui-toc__link[data-active="true"] {
          font-weight: 700;
          text-decoration: underline;
        }
        .ui-toc__indicator {
          display: none;
        }
        :scope[data-variant="dots"] .ui-toc__link::before {
          display: none;
        }
      }
    }
  }
`

// ─── Component ──────────────────────────────────────────────────────────────

export const TableOfContents = forwardRef<HTMLElement, TableOfContentsProps>(
  (
    {
      items,
      activeId: controlledActiveId,
      onItemClick,
      scrollSpy = false,
      scrollOffset = 0,
      size = 'md',
      variant = 'default',
      motion: motionProp,
      className,
      ...rest
    },
    ref
  ) => {
    const cls = useStyles('toc', tocStyles)
    const motionLevel = useMotionLevel(motionProp)

    const isControlled = controlledActiveId !== undefined
    const [internalActiveId, setInternalActiveId] = useState('')
    const activeId = isControlled ? controlledActiveId : internalActiveId

    const listRef = useRef<HTMLUListElement>(null)
    const indicatorRef = useRef<HTMLDivElement>(null)

    // Update indicator position for default variant
    const updateIndicator = useCallback(() => {
      if (variant !== 'default') return
      const list = listRef.current
      const indicator = indicatorRef.current
      if (!list || !indicator || !activeId) {
        if (indicator) indicator.style.opacity = '0'
        return
      }

      const activeLink = list.querySelector<HTMLElement>(`[data-id="${activeId}"]`)
      if (!activeLink) {
        indicator.style.opacity = '0'
        return
      }

      const listRect = list.getBoundingClientRect()
      const linkRect = activeLink.getBoundingClientRect()
      const offsetY = linkRect.top - listRect.top

      indicator.style.transform = `translateY(${offsetY}px)`
      indicator.style.blockSize = `${linkRect.height}px`
      indicator.style.opacity = '1'
    }, [variant, activeId])

    useEffect(() => {
      updateIndicator()
    }, [updateIndicator])

    // Scroll spy using IntersectionObserver
    useEffect(() => {
      if (!scrollSpy || typeof window === 'undefined') return

      const allItems = flattenItems(items)
      const ids = allItems.map((item) => item.id)
      const elements = ids
        .map((id) => document.getElementById(id))
        .filter((el): el is HTMLElement => el !== null)

      if (elements.length === 0) return

      const observer = new IntersectionObserver(
        (entries) => {
          // Find the topmost visible section closest to top of viewport
          let topmostId: string | null = null
          let topmostTop = Infinity

          for (const entry of entries) {
            if (entry.isIntersecting) {
              const top = entry.boundingClientRect.top
              if (top < topmostTop) {
                topmostTop = top
                topmostId = entry.target.id
              }
            }
          }

          if (topmostId) {
            if (!isControlled) setInternalActiveId(topmostId)
          }
        },
        {
          rootMargin: `${-scrollOffset}px 0px 0px 0px`,
          threshold: [0, 0.5, 1],
        }
      )

      elements.forEach((el) => observer.observe(el))
      return () => observer.disconnect()
    }, [scrollSpy, scrollOffset, items, isControlled])

    const handleClick = useCallback(
      (id: string) => {
        if (!isControlled) setInternalActiveId(id)
        onItemClick?.(id)

        if (typeof window !== 'undefined') {
          const target = document.getElementById(id)
          if (target) {
            target.scrollIntoView({ behavior: motionLevel > 0 ? 'smooth' : 'auto' })
          }
        }
      },
      [isControlled, onItemClick, motionLevel]
    )

    const renderItems = useCallback(
      (tocItems: TocItem[]) => (
        <ul className="ui-toc__list" role="list">
          {tocItems.map((item) => (
            <li key={item.id} className="ui-toc__item">
              <button
                type="button"
                className="ui-toc__link"
                data-id={item.id}
                data-level={item.level}
                data-active={item.id === activeId || undefined}
                onClick={() => handleClick(item.id)}
              >
                {item.label}
              </button>
              {item.children && item.children.length > 0 && renderItems(item.children)}
            </li>
          ))}
        </ul>
      ),
      [activeId, handleClick]
    )

    return (
      <nav
        ref={ref}
        aria-label="Table of contents"
        className={cn(cls('root'), className)}
        data-size={size}
        data-variant={variant}
        data-motion={motionLevel}
        {...rest}
      >
        <div style={{ position: 'relative' }}>
          {variant === 'default' && (
            <div
              ref={indicatorRef}
              className="ui-toc__indicator"
              aria-hidden="true"
              style={{ opacity: 0 }}
            />
          )}
          <ul ref={listRef} className="ui-toc__list" role="list">
            {items.map((item) => (
              <li key={item.id} className="ui-toc__item">
                <button
                  type="button"
                  className="ui-toc__link"
                  data-id={item.id}
                  data-level={item.level}
                  data-active={item.id === activeId || undefined}
                  onClick={() => handleClick(item.id)}
                >
                  {item.label}
                </button>
                {item.children && item.children.length > 0 && renderItems(item.children)}
              </li>
            ))}
          </ul>
        </div>
      </nav>
    )
  }
)

TableOfContents.displayName = 'TableOfContents'
