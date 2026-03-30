export interface CSSDefinition {
  readonly id: string
  readonly css: string
}

let counter = 0
const cache = new Map<string, CSSDefinition>()

/**
 * Tagged template for component CSS. Returns a stable CSSDefinition with a
 * unique id. Identical CSS text returns the same object (memoized), preventing
 * duplicate style injection when the same template is evaluated multiple times
 * (e.g. HMR, dynamic imports re-executing module scope).
 */
export function css(strings: TemplateStringsArray, ...values: unknown[]): CSSDefinition {
  const cssText = strings.reduce((acc, str, i) =>
    acc + str + (values[i] ?? ''), '').trim()

  const cached = cache.get(cssText)
  if (cached) return cached

  const def: CSSDefinition = { id: `ui-${counter++}`, css: cssText }
  cache.set(cssText, def)
  return def
}
