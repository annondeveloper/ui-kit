import { createElement } from 'react'
import { createRoot, type Root } from 'react-dom/client'

/** Convert kebab-case attribute names to camelCase prop names. */
function kebabToCamel(str: string): string {
  return str.replace(/-([a-z])/g, (_, c: string) => c.toUpperCase())
}

/**
 * Wrap a React component as a Web Component (Custom Element).
 *
 * Creates a class that extends HTMLElement, renders the React component
 * inside a Shadow DOM, and maps observed HTML attributes to React props.
 *
 * @param ReactComponent - The React component to wrap
 * @param observedAttrs - HTML attributes to observe and pass as props
 * @param cssText - Optional CSS to inject into the Shadow DOM
 * @returns A CustomElementConstructor ready for `customElements.define()`
 *
 * @example
 * ```ts
 * const UIButton = createWebComponent(Button, ['variant', 'size', 'disabled'])
 * customElements.define('ui-button', UIButton)
 * ```
 */
export function createWebComponent(
  ReactComponent: React.ComponentType<any>,
  observedAttrs: string[],
  cssText?: string
): CustomElementConstructor {
  return class extends HTMLElement {
    static get observedAttributes() {
      return observedAttrs
    }

    private _root: Root | null = null
    private _shadow: ShadowRoot

    constructor() {
      super()
      this._shadow = this.attachShadow({ mode: 'open' })
      if (cssText) {
        const sheet = new CSSStyleSheet()
        sheet.replaceSync(cssText)
        this._shadow.adoptedStyleSheets = [sheet]
      }
    }

    connectedCallback() {
      const container = document.createElement('div')
      this._shadow.appendChild(container)
      this._root = createRoot(container)
      this._render()
    }

    attributeChangedCallback() {
      this._render()
    }

    disconnectedCallback() {
      this._root?.unmount()
      this._root = null
    }

    private _render() {
      if (!this._root) return

      const props: Record<string, unknown> = {}
      for (const attr of observedAttrs) {
        const val = this.getAttribute(attr)
        if (val !== null) {
          // Convert common attribute value types
          if (val === 'true') props[kebabToCamel(attr)] = true
          else if (val === 'false') props[kebabToCamel(attr)] = false
          else if (val !== '' && !isNaN(Number(val))) props[kebabToCamel(attr)] = Number(val)
          else props[kebabToCamel(attr)] = val
        }
      }

      // Pass text content from light DOM as children
      if (this.textContent?.trim()) {
        props.children = this.textContent
      }

      this._root.render(createElement(ReactComponent, props))
    }
  }
}
