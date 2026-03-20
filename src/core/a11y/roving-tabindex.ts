import { useEffect, useRef, type RefObject } from 'react'

export interface RovingTabindexConfig {
  orientation?: 'horizontal' | 'vertical' | 'both'
  loop?: boolean
  onActivate?: (index: number) => void
}

export function useRovingTabindex(
  containerRef: RefObject<HTMLElement | null>,
  config: RovingTabindexConfig = {}
): void {
  const { orientation = 'horizontal', loop = true, onActivate } = config
  const currentIndex = useRef(0)

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const getItems = () => Array.from(container.querySelectorAll<HTMLElement>('[role="tab"], [role="option"], [role="menuitem"], [role="radio"], [data-roving-item]'))

    // Initialize: first item tabindex=0, rest tabindex=-1
    const items = getItems()
    items.forEach((item, i) => {
      item.setAttribute('tabindex', i === currentIndex.current ? '0' : '-1')
    })

    const onKeyDown = (e: KeyboardEvent) => {
      const items = getItems()
      if (items.length === 0) return

      const prevKeys = orientation === 'horizontal' ? ['ArrowLeft'] : orientation === 'vertical' ? ['ArrowUp'] : ['ArrowLeft', 'ArrowUp']
      const nextKeys = orientation === 'horizontal' ? ['ArrowRight'] : orientation === 'vertical' ? ['ArrowDown'] : ['ArrowRight', 'ArrowDown']

      let newIndex = currentIndex.current

      if (nextKeys.includes(e.key)) {
        e.preventDefault()
        newIndex = currentIndex.current + 1
        if (newIndex >= items.length) newIndex = loop ? 0 : items.length - 1
      } else if (prevKeys.includes(e.key)) {
        e.preventDefault()
        newIndex = currentIndex.current - 1
        if (newIndex < 0) newIndex = loop ? items.length - 1 : 0
      } else if (e.key === 'Home') {
        e.preventDefault()
        newIndex = 0
      } else if (e.key === 'End') {
        e.preventDefault()
        newIndex = items.length - 1
      } else {
        return
      }

      items[currentIndex.current].setAttribute('tabindex', '-1')
      items[newIndex].setAttribute('tabindex', '0')
      items[newIndex].focus()
      currentIndex.current = newIndex
      onActivate?.(newIndex)
    }

    container.addEventListener('keydown', onKeyDown)
    return () => container.removeEventListener('keydown', onKeyDown)
  }, [containerRef, orientation, loop, onActivate])
}
