const injectedSheets = new Map<string, CSSStyleSheet | HTMLStyleElement>()

function supportsAdoptedStyleSheets(): boolean {
  return (
    typeof document !== 'undefined' &&
    'adoptedStyleSheets' in document &&
    typeof CSSStyleSheet !== 'undefined' &&
    'replaceSync' in CSSStyleSheet.prototype
  )
}

export function injectCSS(id: string, cssText: string): void {
  if (typeof document === 'undefined') return
  if (injectedSheets.has(id)) return

  if (supportsAdoptedStyleSheets()) {
    const sheet = new CSSStyleSheet()
    sheet.replaceSync(cssText)
    document.adoptedStyleSheets = [...document.adoptedStyleSheets, sheet]
    injectedSheets.set(id, sheet)
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

  if (entry instanceof CSSStyleSheet) {
    document.adoptedStyleSheets = document.adoptedStyleSheets.filter(s => s !== entry)
  } else {
    entry.remove()
  }

  injectedSheets.delete(id)
}
