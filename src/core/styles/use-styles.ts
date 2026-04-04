import { useEffect, useCallback, useRef } from 'react'
import { StyleRegistry } from './registry'
import { injectCSS, removeCSS } from './dom-injector'
import { useStyleCollector } from './style-context'
import type { CSSDefinition } from './css-tag'

const globalRegistry = new StyleRegistry()

type ClassNameBuilder = (...parts: (string | false | null | undefined | 0 | '')[]) => string

export function useStyles(name: string, cssDef: CSSDefinition): ClassNameBuilder {
  const collector = useStyleCollector()
  const idRef = useRef(cssDef.id)
  const isSSR = typeof document === 'undefined'

  if (collector) {
    // SSR mode with explicit collector: register styles for server rendering
    collector.add(cssDef.id, cssDef.css)
  }

  useEffect(() => {
    // useEffect never runs on the server, but guard for clarity
    if (collector || isSSR) return

    const id = cssDef.id
    idRef.current = id
    globalRegistry.add(id, cssDef.css)
    injectCSS(id, cssDef.css)

    return () => {
      globalRegistry.remove(id)
      if (globalRegistry.refCount(id) === 0) {
        removeCSS(id)
      }
    }
  }, [cssDef.id, cssDef.css, collector, isSSR])

  const cls: ClassNameBuilder = useCallback(
    (...parts: (string | false | null | undefined | 0 | '')[]) => {
      const prefix = `ui-${name}`
      return parts
        .filter((p): p is string => typeof p === 'string' && p.length > 0)
        .map(p => (p === 'root' ? prefix : `${prefix}--${p}`))
        .join(' ')
    },
    [name]
  )

  return cls
}
