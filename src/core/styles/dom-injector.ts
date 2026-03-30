const injectedSheets = new Map<string, CSSStyleSheet | HTMLStyleElement>()

// Batch adoptedStyleSheets updates to avoid rebuilding the array on every inject/remove.
// Without batching, navigating through 50+ pages causes O(n) array copies per mutation,
// each triggering a full document style recalculation.
let batchDepth = 0
let batchDirty = false

function supportsAdoptedStyleSheets(): boolean {
  return (
    typeof document !== 'undefined' &&
    'adoptedStyleSheets' in document &&
    typeof CSSStyleSheet !== 'undefined' &&
    'replaceSync' in CSSStyleSheet.prototype
  )
}

function syncAdoptedStyleSheets(): void {
  if (typeof document === 'undefined') return
  if (!supportsAdoptedStyleSheets()) return
  const sheets: CSSStyleSheet[] = []
  for (const entry of injectedSheets.values()) {
    if (entry instanceof CSSStyleSheet) sheets.push(entry)
  }
  document.adoptedStyleSheets = sheets
}

/** Batch multiple inject/remove calls into a single adoptedStyleSheets update. */
export function batchStyles(fn: () => void): void {
  batchDepth++
  try {
    fn()
  } finally {
    batchDepth--
    if (batchDepth === 0 && batchDirty) {
      batchDirty = false
      syncAdoptedStyleSheets()
    }
  }
}

export function injectCSS(id: string, cssText: string): void {
  if (typeof document === 'undefined') return
  if (injectedSheets.has(id)) return

  if (supportsAdoptedStyleSheets()) {
    const sheet = new CSSStyleSheet()
    sheet.replaceSync(cssText)
    injectedSheets.set(id, sheet)
    if (batchDepth > 0) {
      batchDirty = true
    } else {
      document.adoptedStyleSheets = [...document.adoptedStyleSheets, sheet]
    }
  } else {
    const style = document.createElement('style')
    style.setAttribute('data-ui-style', id)
    style.textContent = cssText
    document.head.appendChild(style)
    injectedSheets.set(id, style)
  }
}

export function removeCSS(id: string): void {
  if (typeof document === 'undefined') return

  const entry = injectedSheets.get(id)
  if (!entry) return

  injectedSheets.delete(id)

  if (entry instanceof CSSStyleSheet) {
    if (batchDepth > 0) {
      batchDirty = true
    } else {
      document.adoptedStyleSheets = document.adoptedStyleSheets.filter(s => s !== entry)
    }
  } else {
    entry.remove()
  }
}
