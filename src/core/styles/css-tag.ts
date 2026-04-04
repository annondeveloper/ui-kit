export interface CSSDefinition {
  readonly id: string
  readonly css: string
}

const cache = new Map<string, CSSDefinition>()

/**
 * Simple non-cryptographic hash for deterministic CSS IDs.
 * Same CSS text always produces the same ID, eliminating SSR/client mismatch.
 */
function hashCSS(css: string): string {
  let h = 0x811c9dc5 // FNV offset basis
  for (let i = 0; i < css.length; i++) {
    h ^= css.charCodeAt(i)
    h = (h * 0x01000193) | 0 // FNV prime, force 32-bit int
  }
  return `ui-${(h >>> 0).toString(36)}`
}

/**
 * Tagged template for component CSS. Returns a stable CSSDefinition with a
 * deterministic id based on content hash. Identical CSS text returns the same
 * object (memoized), preventing duplicate style injection. Content-based IDs
 * ensure SSR and client hydration produce matching identifiers.
 */
export function css(strings: TemplateStringsArray, ...values: unknown[]): CSSDefinition {
  const cssText = strings.reduce((acc, str, i) =>
    acc + str + (values[i] ?? ''), '').trim()

  const cached = cache.get(cssText)
  if (cached) return cached

  const def: CSSDefinition = { id: hashCSS(cssText), css: cssText }
  cache.set(cssText, def)
  return def
}
