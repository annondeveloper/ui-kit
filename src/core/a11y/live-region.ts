import { useCallback, useRef } from 'react'

export function useLiveRegion(config: { politeness?: 'polite' | 'assertive' } = {}) {
  const { politeness = 'polite' } = config
  const regionRef = useRef<HTMLDivElement | null>(null)

  // Create live region on first use
  const getRegion = () => {
    if (regionRef.current) return regionRef.current
    if (typeof document === 'undefined') return null

    const region = document.createElement('div')
    region.setAttribute('aria-live', politeness)
    region.setAttribute('aria-atomic', 'true')
    region.setAttribute('role', 'status')
    Object.assign(region.style, {
      position: 'absolute', width: '1px', height: '1px',
      overflow: 'hidden', clip: 'rect(0,0,0,0)', whiteSpace: 'nowrap',
    })
    document.body.appendChild(region)
    regionRef.current = region
    return region
  }

  const announce = useCallback((message: string) => {
    const region = getRegion()
    if (region) {
      region.textContent = ''
      // Force re-announcement
      requestAnimationFrame(() => { region.textContent = message })
    }
  }, [])

  return { announce }
}
