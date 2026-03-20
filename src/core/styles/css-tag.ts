export interface CSSDefinition {
  readonly id: string
  readonly css: string
}

let counter = 0

export function css(strings: TemplateStringsArray, ...values: unknown[]): CSSDefinition {
  const cssText = strings.reduce((acc, str, i) =>
    acc + str + (values[i] ?? ''), '')
  const id = `ui-${counter++}`
  return { id, css: cssText.trim() }
}
