// ─── AI Code Generator ──────────────────────────────────────────────────────
// Generates production-ready component compositions for five frameworks from
// either a named template or a custom selection of components. Pure, browser-safe
// TypeScript — no fs/path — so it tree-shakes into apps importing
// `@annondeveloper/ui-kit/ai`.

import { getComponentDatabase } from './component-database'

// ─── Public types ───────────────────────────────────────────────────────────

export type Framework = 'react' | 'react-ts' | 'vue' | 'svelte' | 'html'

export interface GeneratorOptions {
  framework?: Framework
  tier?: 'lite' | 'standard' | 'premium'
  theme?: string
  layout?: 'grid' | 'stack' | 'sidebar'
}

/** Generated code for every supported framework. */
export interface GeneratedCode {
  react: string
  reactTs: string
  vue: string
  svelte: string
  html: string
}

type Tier = NonNullable<GeneratorOptions['tier']>
type Layout = NonNullable<GeneratorOptions['layout']>

const DEFAULTS: Required<Omit<GeneratorOptions, never>> = {
  framework: 'react-ts',
  tier: 'standard',
  theme: 'aurora',
  layout: 'stack',
}

// ─── Import / naming helpers ────────────────────────────────────────────────

function importPath(tier: Tier): string {
  if (tier === 'lite') return '@annondeveloper/ui-kit/lite'
  if (tier === 'premium') return '@annondeveloper/ui-kit/premium'
  return '@annondeveloper/ui-kit'
}

/** Tier-prefixed component identifier (Lite.../Premium...); standard is unprefixed. */
function tierName(name: string, tier: Tier): string {
  if (tier === 'lite') return `Lite${name}`
  if (tier === 'premium') return `Premium${name}`
  return name
}

function layoutStyle(layout: Layout): string {
  if (layout === 'grid') {
    return `display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem'`
  }
  if (layout === 'sidebar') {
    return `display: 'grid', gridTemplateColumns: '280px 1fr', gap: '1.5rem'`
  }
  return `display: 'flex', flexDirection: 'column', gap: '1.5rem'`
}

function cssLayoutBlock(layout: Layout): string {
  if (layout === 'grid') {
    return 'display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 1.5rem;'
  }
  if (layout === 'sidebar') {
    return 'display: grid; grid-template-columns: 280px 1fr; gap: 1.5rem;'
  }
  return 'display: flex; flex-direction: column; gap: 1.5rem;'
}

// ─── Composition model ──────────────────────────────────────────────────────
// Each piece of generated UI is described once as a list of element specs, then
// rendered per framework. Keeping a single source of truth means every framework
// output stays in sync and references the same components.

interface ElementSpec {
  /** Base (unprefixed) component name. */
  component: string
  /** Inner content / child markup (already framework-agnostic enough to reuse). */
  children?: string
  /** Attributes rendered identically across frameworks (static strings only). */
  attrs?: Record<string, string>
}

interface Composition {
  title: string
  layout: Layout
  elements: ElementSpec[]
}

function renderAttrs(attrs: Record<string, string> | undefined): string {
  if (!attrs) return ''
  const parts = Object.entries(attrs).map(([k, v]) => `${k}="${v}"`)
  return parts.length ? ' ' + parts.join(' ') : ''
}

// ─── React (JSX / TSX) ──────────────────────────────────────────────────────

function renderReact(comp: Composition, tier: Tier, ts: boolean): string {
  const ip = importPath(tier)
  const used = [...new Set(comp.elements.map((e) => tierName(e.component, tier)))]
  const imports = `import { ${used.join(', ')} } from '${ip}'`
  const fnSig = ts ? 'export default function GeneratedLayout(): JSX.Element {' : 'export default function GeneratedLayout() {'

  const body = comp.elements
    .map((e) => {
      const name = tierName(e.component, tier)
      const attrs = renderAttrs(e.attrs)
      if (e.children) {
        return `        <${name}${attrs}>${e.children}</${name}>`
      }
      return `        <${name}${attrs} />`
    })
    .join('\n')

  return `${imports}

${fnSig}
  return (
    <div style={{ maxWidth: '1200px', margin: '2rem auto', padding: '0 1rem' }}>
      <h1 style={{ marginBottom: '1.5rem' }}>${comp.title}</h1>
      <div style={{ ${layoutStyle(comp.layout)} }}>
${body}
      </div>
    </div>
  )
}`
}

// ─── Vue (SFC, <script setup>) ──────────────────────────────────────────────

function renderVue(comp: Composition, tier: Tier): string {
  const ip = importPath(tier)
  const used = [...new Set(comp.elements.map((e) => tierName(e.component, tier)))]

  const body = comp.elements
    .map((e) => {
      const name = tierName(e.component, tier)
      const attrs = renderAttrs(e.attrs)
      if (e.children) {
        return `    <${name}${attrs}>${e.children}</${name}>`
      }
      return `    <${name}${attrs} />`
    })
    .join('\n')

  return `<script setup lang="ts">
import { ${used.join(', ')} } from '${ip}'
</script>

<template>
  <div class="generated-layout">
    <h1>${comp.title}</h1>
    <div class="generated-grid">
${body}
    </div>
  </div>
</template>

<style scoped>
.generated-layout { max-width: 1200px; margin: 2rem auto; padding: 0 1rem; }
.generated-grid { ${cssLayoutBlock(comp.layout)} }
</style>`
}

// ─── Svelte ─────────────────────────────────────────────────────────────────

function renderSvelte(comp: Composition, tier: Tier): string {
  const ip = importPath(tier)
  const used = [...new Set(comp.elements.map((e) => tierName(e.component, tier)))]

  const body = comp.elements
    .map((e) => {
      const name = tierName(e.component, tier)
      const attrs = renderAttrs(e.attrs)
      if (e.children) {
        return `    <${name}${attrs}>${e.children}</${name}>`
      }
      return `    <${name}${attrs} />`
    })
    .join('\n')

  return `<script lang="ts">
  import { ${used.join(', ')} } from '${ip}'
</script>

<div class="generated-layout">
  <h1>${comp.title}</h1>
  <div class="generated-grid">
${body}
  </div>
</div>

<style>
  .generated-layout { max-width: 1200px; margin: 2rem auto; padding: 0 1rem; }
  .generated-grid { ${cssLayoutBlock(comp.layout)} }
</style>`
}

// ─── HTML (standalone, uses ui-kit standalone CSS) ──────────────────────────

function renderHtml(comp: Composition, theme: string): string {
  const body = comp.elements
    .map((e) => {
      const cls = `ui-${e.component.replace(/([a-z0-9])([A-Z])/g, '$1-$2').replace(/([A-Z]+)([A-Z][a-z])/g, '$1-$2').toLowerCase()}`
      const inner = e.children ?? `<span>${e.component}</span>`
      return `      <!-- ${e.component} -->\n      <div class="${cls}">${inner}</div>`
    })
    .join('\n')

  return `<!DOCTYPE html>
<html lang="en" data-theme="${theme}">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${comp.title}</title>
  <!-- UI Kit standalone CSS (all components + ${theme} theme) -->
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@annondeveloper/ui-kit/css/theme.css" />
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@annondeveloper/ui-kit/css/all.css" />
  <style>
    body { font-family: system-ui, -apple-system, sans-serif; margin: 0; padding: 2rem; }
    .generated-layout { max-width: 1200px; margin: 0 auto; }
    .generated-grid { ${cssLayoutBlock(comp.layout)} }
  </style>
</head>
<body>
  <div class="generated-layout">
    <h1>${comp.title}</h1>
    <div class="generated-grid">
${body}
    </div>
  </div>
</body>
</html>`
}

// ─── Assembly ───────────────────────────────────────────────────────────────

function assemble(comp: Composition, options: GeneratorOptions): GeneratedCode {
  const tier = options.tier ?? DEFAULTS.tier
  const theme = options.theme ?? DEFAULTS.theme

  return {
    react: renderReact(comp, tier, false),
    reactTs: renderReact(comp, tier, true),
    vue: renderVue(comp, tier),
    svelte: renderSvelte(comp, tier),
    html: renderHtml(comp, theme),
  }
}

// ─── Templates ──────────────────────────────────────────────────────────────

type TemplateName = 'dashboard' | 'form' | 'marketing' | 'saas'

const TEMPLATES: Record<TemplateName, (layout: Layout) => Composition> = {
  dashboard: (layout) => ({
    title: 'Dashboard',
    layout: layout === 'stack' ? 'grid' : layout,
    elements: [
      { component: 'MetricCard', attrs: { title: 'Revenue', value: '$48,230', trend: 'up' } },
      { component: 'TimeSeriesChart', children: '{/* series prop */}' },
      { component: 'DataTable', children: '{/* columns + data props */}' },
    ],
  }),
  form: (layout) => ({
    title: 'Contact Form',
    layout,
    elements: [
      {
        component: 'Card',
        children: '\n          <FormInput label="Email" placeholder="you@example.com" />\n          <Select label="Category" />\n          <Button variant="primary">Submit</Button>\n        ',
      },
    ],
  }),
  marketing: (layout) => ({
    title: 'Landing Hero',
    layout: layout === 'stack' ? 'grid' : layout,
    elements: [
      { component: 'Badge', attrs: { variant: 'primary' }, children: 'New' },
      { component: 'Card', children: '<h2>Build faster</h2><p>Zero-dependency components.</p>' },
      { component: 'Button', attrs: { variant: 'primary' }, children: 'Get Started' },
    ],
  }),
  saas: (layout) => ({
    title: 'SaaS App Shell',
    layout: layout === 'stack' ? 'sidebar' : layout,
    elements: [
      { component: 'Sidebar', children: '{/* nav items */}' },
      { component: 'Tabs', children: '{/* tab panels */}' },
      { component: 'DataTable', children: '{/* columns + data props */}' },
    ],
  }),
}

// ─── Public API ─────────────────────────────────────────────────────────────

/**
 * Generate a complete layout from a named template.
 *
 * Defaults: `framework: 'react-ts'`, `tier: 'standard'`, `theme: 'aurora'`,
 * `layout: 'stack'`.
 */
export function generateFromTemplate(
  template: TemplateName,
  options: GeneratorOptions = {},
): GeneratedCode {
  const layout = options.layout ?? DEFAULTS.layout
  const builder = TEMPLATES[template]
  const composition = builder
    ? builder(layout)
    : { title: 'Layout', layout, elements: [] }
  return assemble(composition, options)
}

/**
 * Assemble code from a custom selection of component names, honoring the chosen
 * layout and tier. Unknown names are still emitted so the output stays useful.
 *
 * Defaults: `framework: 'react-ts'`, `tier: 'standard'`, `theme: 'aurora'`,
 * `layout: 'stack'`.
 */
export function generateFromComponents(
  components: string[],
  options: GeneratorOptions = {},
): GeneratedCode {
  const layout = options.layout ?? DEFAULTS.layout
  const db = getComponentDatabase()
  const byName = new Map(db.map((c) => [c.name, c]))

  const elements: ElementSpec[] = components.map((name) => {
    const info = byName.get(name)
    return {
      component: name,
      children: info ? `{/* ${info.description.slice(0, 60)} */}` : undefined,
    }
  })

  const composition: Composition = {
    title: 'Custom Layout',
    layout,
    elements,
  }
  return assemble(composition, options)
}
