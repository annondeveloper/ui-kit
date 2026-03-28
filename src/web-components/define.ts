import { createWebComponent } from './wrapper'
import { Button } from '../components/button'
import { Badge } from '../components/badge'
import { Card } from '../components/card'
import { Alert } from '../components/alert'
import { Progress } from '../components/progress'
import { Avatar } from '../components/avatar'
import { Divider } from '../components/divider'
import { Typography } from '../components/typography'
import { Kbd } from '../components/kbd'
import { Skeleton } from '../components/skeleton'
import { StatusBadge } from '../components/status-badge'
import { StatusPulse } from '../components/status-pulse'
import { Checkbox } from '../components/checkbox'
import { ToggleSwitch } from '../components/toggle-switch'
import { Slider } from '../components/slider'
import { FormInput } from '../components/form-input'
import { SearchInput } from '../components/search-input'
import { Chip } from '../components/chip'
import { Rating } from '../components/rating'
import { Tooltip } from '../components/tooltip'

// Theme CSS placeholder — replaced with compiled theme.css content at build time
const themeCSS = `/* Theme tokens injected at build time */`

interface ElementDef {
  tag: string
  component: React.ComponentType<any>
  attrs: string[]
}

const elements: ElementDef[] = [
  { tag: 'button', component: Button, attrs: ['variant', 'size', 'loading', 'disabled', 'full-width'] },
  { tag: 'badge', component: Badge, attrs: ['variant', 'size', 'dot', 'pulse'] },
  { tag: 'card', component: Card, attrs: ['variant', 'padding', 'interactive', 'bordered'] },
  { tag: 'alert', component: Alert, attrs: ['variant', 'title', 'dismissible', 'banner'] },
  { tag: 'progress', component: Progress, attrs: ['value', 'size', 'variant'] },
  { tag: 'avatar', component: Avatar, attrs: ['name', 'src', 'size'] },
  { tag: 'divider', component: Divider, attrs: ['orientation', 'variant', 'spacing', 'label'] },
  { tag: 'typography', component: Typography, attrs: ['variant', 'color', 'weight', 'align'] },
  { tag: 'kbd', component: Kbd, attrs: ['size', 'variant'] },
  { tag: 'skeleton', component: Skeleton, attrs: ['variant', 'width', 'height', 'lines', 'animate'] },
  { tag: 'status-badge', component: StatusBadge, attrs: ['status', 'label', 'pulse', 'size'] },
  { tag: 'status-pulse', component: StatusPulse, attrs: ['status', 'size'] },
  { tag: 'checkbox', component: Checkbox, attrs: ['label', 'size', 'checked', 'disabled'] },
  { tag: 'toggle-switch', component: ToggleSwitch, attrs: ['label', 'size', 'checked', 'disabled'] },
  { tag: 'slider', component: Slider, attrs: ['value', 'min', 'max', 'step'] },
  { tag: 'form-input', component: FormInput, attrs: ['name', 'label', 'placeholder', 'type', 'size', 'error'] },
  { tag: 'search-input', component: SearchInput, attrs: ['placeholder', 'size', 'loading'] },
  { tag: 'chip', component: Chip, attrs: ['size', 'checked', 'disabled'] },
  { tag: 'rating', component: Rating, attrs: ['value', 'max', 'size', 'readonly'] },
  { tag: 'tooltip', component: Tooltip, attrs: ['content', 'placement', 'delay'] },
]

/**
 * Register all UI Kit custom elements in the browser.
 *
 * @param prefix - Element name prefix (default: 'ui'). Elements are
 *   registered as `<{prefix}-button>`, `<{prefix}-card>`, etc.
 *
 * @example
 * ```ts
 * import { defineCustomElements } from '@annondeveloper/ui-kit/web-components'
 * defineCustomElements()
 * // Now use <ui-button variant="primary">Click me</ui-button> in HTML
 * ```
 */
export function defineCustomElements(prefix = 'ui'): void {
  for (const { tag, component, attrs } of elements) {
    const name = `${prefix}-${tag}`
    if (!customElements.get(name)) {
      customElements.define(name, createWebComponent(component, attrs, themeCSS))
    }
  }
}

export { createWebComponent }
