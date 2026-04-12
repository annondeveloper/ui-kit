import { describe, it, expect, vi, beforeEach } from 'vitest'
import type { Registry, ComponentEntry, ThemeEntry, IconEntry } from '../../mcp/registry/types'

// ---------------------------------------------------------------------------
// Mock external dependencies that may not be installed (optional deps)
// These vi.mock calls are hoisted by vitest to the top of the file before
// any imports are resolved, so they intercept even transitive imports.
// ---------------------------------------------------------------------------

// Minimal zod mock — z.string(), z.number(), z.array(), z.enum() with
// .optional(), .default(), .describe() chaining
vi.mock('zod', () => {
  function createZodChain(): Record<string, unknown> {
    const chain: Record<string, unknown> = {}
    const self = () => chain
    chain.optional = self
    chain.default = self
    chain.describe = self
    chain.min = self
    chain.max = self
    return chain
  }
  return {
    z: {
      string: () => createZodChain(),
      number: () => createZodChain(),
      boolean: () => createZodChain(),
      array: () => createZodChain(),
      enum: () => createZodChain(),
      object: () => createZodChain(),
    },
  }
})

// Minimal McpServer mock that captures tool/resource registrations
vi.mock('@modelcontextprotocol/sdk/server/mcp.js', () => {
  class MockResourceTemplate {
    pattern: string
    listCallback?: () => Promise<unknown>

    constructor(pattern: string, options: { list?: () => Promise<unknown> }) {
      this.pattern = pattern
      this.listCallback = options?.list
    }
  }

  class MockMcpServer {
    _registeredTools = new Map<string, { callback: (...args: unknown[]) => Promise<unknown> }>()
    _registeredResources = new Map<string, { resourceTemplate: InstanceType<typeof MockResourceTemplate>; callback: (...args: unknown[]) => Promise<unknown> }>()

    constructor(_opts: { name: string; version: string }) {}

    tool(...args: unknown[]): void {
      if (args.length >= 4) {
        this._registeredTools.set(args[0] as string, { callback: args[3] as (...a: unknown[]) => Promise<unknown> })
      } else {
        this._registeredTools.set(args[0] as string, { callback: args[1] as (...a: unknown[]) => Promise<unknown> })
      }
    }

    resource(name: string, template: InstanceType<typeof MockResourceTemplate>, callback: (...args: unknown[]) => Promise<unknown>): void {
      this._registeredResources.set(name, { resourceTemplate: template, callback })
    }
  }

  return { McpServer: MockMcpServer, ResourceTemplate: MockResourceTemplate }
})

// ---------------------------------------------------------------------------
// Test fixture: a small registry with 5 components, 3 themes, 3 icons
// ---------------------------------------------------------------------------

function makeComponent(overrides: Partial<ComponentEntry>): ComponentEntry {
  return {
    name: 'Unknown',
    description: 'A component',
    category: 'general',
    tier: ['standard'],
    importPath: '@annondeveloper/ui-kit',
    importStatement: "import { Unknown } from '@annondeveloper/ui-kit'",
    sourceFile: 'src/components/Unknown.tsx',
    props: [],
    examples: [],
    accessibility: 'Keyboard and screen-reader accessible.',
    keywords: [],
    relatedComponents: [],
    ...overrides,
  }
}

const FIXTURE_COMPONENTS: Record<string, ComponentEntry> = {
  Button: makeComponent({
    name: 'Button',
    description: 'Interactive button with multiple variants and sizes',
    category: 'actions',
    tier: ['standard', 'lite', 'premium'],
    importStatement: "import { Button } from '@annondeveloper/ui-kit'",
    sourceFile: 'src/components/Button.tsx',
    props: [
      { name: 'variant', type: "'solid' | 'outline' | 'ghost'", required: false, default: "'solid'", description: 'Visual style' },
      { name: 'size', type: "'sm' | 'md' | 'lg'", required: false, default: "'md'", description: 'Button size' },
      { name: 'children', type: 'ReactNode', required: true, description: 'Button content' },
      { name: 'disabled', type: 'boolean', required: false, default: 'false', description: 'Disable the button' },
    ],
    examples: [
      { title: 'Primary', code: '<Button variant="solid">Click me</Button>' },
      { title: 'Outline', code: '<Button variant="outline">Outline</Button>' },
    ],
    keywords: ['click', 'action', 'submit'],
    relatedComponents: ['IconButton', 'ActionIcon'],
  }),
  Card: makeComponent({
    name: 'Card',
    description: 'Surface container with optional header and footer',
    category: 'layout',
    tier: ['standard', 'premium'],
    importStatement: "import { Card } from '@annondeveloper/ui-kit'",
    sourceFile: 'src/components/Card.tsx',
    props: [
      { name: 'children', type: 'ReactNode', required: true, description: 'Card content' },
      { name: 'padding', type: "'sm' | 'md' | 'lg'", required: false, default: "'md'", description: 'Inner padding' },
    ],
    examples: [
      { title: 'Basic card', code: '<Card>Hello world</Card>' },
    ],
    keywords: ['container', 'surface', 'box'],
    relatedComponents: ['Button'],
  }),
  Calendar: makeComponent({
    name: 'Calendar',
    description: 'Date picker with range selection support',
    category: 'inputs',
    tier: ['standard'],
    importStatement: "import { Calendar } from '@annondeveloper/ui-kit'",
    sourceFile: 'src/components/Calendar.tsx',
    props: [
      { name: 'value', type: 'Date', required: false, description: 'Selected date' },
      { name: 'onChange', type: '(date: Date) => void', required: true, description: 'Change handler' },
      { name: 'range', type: 'boolean', required: false, default: 'false', description: 'Enable range mode' },
    ],
    examples: [
      { title: 'Basic', code: '<Calendar onChange={setDate} />' },
    ],
    keywords: ['date', 'picker', 'range', 'selection'],
    relatedComponents: ['DateInput'],
  }),
  MetricCard: makeComponent({
    name: 'MetricCard',
    description: 'Dashboard metric display with trend indicator',
    category: 'domain',
    tier: ['premium'],
    importStatement: "import { MetricCard } from '@annondeveloper/ui-kit/premium'",
    sourceFile: 'src/domain/MetricCard.tsx',
    props: [
      { name: 'label', type: 'string', required: true, description: 'Metric label' },
      { name: 'value', type: 'number', required: true, description: 'Metric value' },
    ],
    examples: [],
    keywords: ['metric', 'dashboard', 'kpi', 'trend'],
    relatedComponents: ['Card'],
  }),
  Dialog: makeComponent({
    name: 'Dialog',
    description: 'Modal dialog with focus trap and backdrop',
    category: 'overlays',
    tier: ['standard', 'lite'],
    importStatement: "import { Dialog } from '@annondeveloper/ui-kit'",
    sourceFile: 'src/components/Dialog.tsx',
    props: [
      { name: 'open', type: 'boolean', required: true, description: 'Whether the dialog is open' },
      { name: 'onClose', type: '() => void', required: true, description: 'Close handler' },
      { name: 'children', type: 'ReactNode', required: true, description: 'Dialog content' },
    ],
    examples: [],
    keywords: ['modal', 'popup', 'overlay'],
    relatedComponents: ['Button'],
  }),
}

const FIXTURE_THEMES: Record<string, ThemeEntry> = {
  'aurora-dark': {
    name: 'Aurora',
    hex: '#7c3aed',
    description: 'Default Aurora Fluid theme',
    tokens: { '--color-primary': 'oklch(55% 0.27 270)' },
    css: ':root { --color-primary: oklch(55% 0.27 270); }',
  },
  'aurora-light': {
    name: 'Aurora',
    hex: '#7c3aed',
    description: 'Aurora light mode',
    tokens: { '--color-primary': 'oklch(65% 0.27 270)' },
    css: ':root { --color-primary: oklch(65% 0.27 270); }',
  },
  'ocean-dark': {
    name: 'Ocean',
    hex: '#0ea5e9',
    description: 'Deep ocean theme',
    tokens: { '--color-primary': 'oklch(60% 0.2 230)' },
    css: ':root { --color-primary: oklch(60% 0.2 230); }',
  },
}

const FIXTURE_ICONS: Record<string, IconEntry> = {
  check: { name: 'check', paths: ['M5 13l4 4L19 7'], keywords: ['confirm', 'done', 'tick'] },
  close: { name: 'close', paths: ['M6 6l12 12M18 6l-12 12'], keywords: ['dismiss', 'remove', 'x'] },
  search: { name: 'search', paths: ['M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z'], keywords: ['find', 'lookup'] },
}

const FIXTURE_REGISTRY: Registry = {
  version: '2.7.0-test',
  generatedAt: '2026-03-30T00:00:00Z',
  componentCount: 5,
  components: FIXTURE_COMPONENTS,
  themes: FIXTURE_THEMES,
  icons: FIXTURE_ICONS,
  categories: {
    actions: ['Button'],
    layout: ['Card'],
    inputs: ['Calendar'],
    domain: ['MetricCard'],
    overlays: ['Dialog'],
  },
}

// ---------------------------------------------------------------------------
// Mock the registry loader so it returns our fixture instead of reading disk
// ---------------------------------------------------------------------------

vi.mock('../../mcp/registry/loader', () => ({
  loadRegistry: vi.fn(() => FIXTURE_REGISTRY),
  getComponent: vi.fn((name: string) => {
    const key = Object.keys(FIXTURE_COMPONENTS).find(
      k => k.toLowerCase() === name.toLowerCase()
    )
    return key ? FIXTURE_COMPONENTS[key] : null
  }),
  searchComponents: vi.fn((query: string, limit = 10) => {
    const words = query.toLowerCase().split(/\s+/).filter(Boolean)
    const results: Array<{ name: string; description: string; score: number; reason: string; importStatement: string }> = []

    for (const [name, comp] of Object.entries(FIXTURE_COMPONENTS)) {
      let score = 0
      const reasons: string[] = []
      const nameLower = name.toLowerCase()

      for (const word of words) {
        if (nameLower === word) { score += 100; reasons.push(`Exact name match: ${name}`) }
        else if (nameLower.includes(word)) { score += 50; reasons.push(`Name contains "${word}"`) }
        if (comp.keywords.some(k => k.includes(word))) { score += 30; reasons.push('Keyword match') }
        if (comp.description.toLowerCase().includes(word)) { score += 20; reasons.push('Description match') }
        if (comp.props.some(p => p.name.toLowerCase().includes(word))) { score += 10; reasons.push('Prop match') }
      }

      if (score > 0) {
        const uniqueReasons = [...new Set(reasons)].slice(0, 3).join('; ')
        results.push({ name, description: comp.description, score, reason: uniqueReasons, importStatement: comp.importStatement })
      }
    }

    return results.sort((a, b) => b.score - a.score).slice(0, limit)
  }),
}))

// ---------------------------------------------------------------------------
// Import createServer AFTER mocking
// ---------------------------------------------------------------------------

import { createServer } from '../../mcp/server'

// ---------------------------------------------------------------------------
// Type for the mock McpServer internals we access in helpers
// ---------------------------------------------------------------------------

interface MockServer {
  _registeredTools: Map<string, { callback: (...args: unknown[]) => Promise<{ content: Array<{ type: string; text: string }> }> }>
  _registeredResources: Map<string, {
    resourceTemplate: { listCallback?: () => Promise<{ resources: Array<{ uri: string; name: string; description: string; mimeType: string }> }> }
    callback: (uri: URL, params: Record<string, string>) => Promise<{ contents: Array<{ uri: string; mimeType: string; text: string }> }>
  }>
}

// ---------------------------------------------------------------------------
// Helper: invoke a tool on the McpServer and extract the text result
// ---------------------------------------------------------------------------

async function callTool(server: ReturnType<typeof createServer>, name: string, args: Record<string, unknown> = {}): Promise<string> {
  const srv = server as unknown as MockServer
  const tool = srv._registeredTools.get(name)
  if (!tool) throw new Error(`Tool "${name}" not registered. Available: ${Array.from(srv._registeredTools.keys()).join(', ')}`)
  const result = await tool.callback(args, {})
  return result.content.map(c => c.text).join('\n')
}

async function readResource(server: ReturnType<typeof createServer>, uri: string): Promise<string> {
  const srv = server as unknown as MockServer
  const resource = srv._registeredResources.get('component')
  if (!resource) throw new Error('Resource "component" not registered')
  const url = new URL(uri)
  const name = url.hostname || url.pathname.replace(/^\//, '')
  const result = await resource.callback(url, { name })
  return result.contents.map(c => c.text).join('\n')
}

async function listResources(server: ReturnType<typeof createServer>): Promise<Array<{ uri: string; name: string }>> {
  const srv = server as unknown as MockServer
  const resource = srv._registeredResources.get('component')
  if (!resource?.resourceTemplate?.listCallback) throw new Error('Resource "component" has no list callback')
  const result = await resource.resourceTemplate.listCallback()
  return result.resources
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('MCP Server integration', () => {
  let server: ReturnType<typeof createServer>

  beforeEach(() => {
    vi.clearAllMocks()
    server = createServer()
  })

  // =========================================================================
  // Server setup
  // =========================================================================

  describe('server creation', () => {
    it('registers all 9 tools', () => {
      const srv = server as unknown as MockServer
      expect(srv._registeredTools.size).toBe(9)
      expect(srv._registeredTools.has('list_components')).toBe(true)
      expect(srv._registeredTools.has('get_component')).toBe(true)
      expect(srv._registeredTools.has('search_components')).toBe(true)
      expect(srv._registeredTools.has('generate_snippet')).toBe(true)
      expect(srv._registeredTools.has('get_theme')).toBe(true)
      expect(srv._registeredTools.has('get_icons')).toBe(true)
      expect(srv._registeredTools.has('get_started')).toBe(true)
      expect(srv._registeredTools.has('get_page_template')).toBe(true)
      expect(srv._registeredTools.has('get_adaptive_info')).toBe(true)
    })

    it('registers the component resource', () => {
      const srv = server as unknown as MockServer
      expect(srv._registeredResources.has('component')).toBe(true)
    })
  })

  // =========================================================================
  // list_components
  // =========================================================================

  describe('list_components', () => {
    it('returns all components when no filter is provided', async () => {
      const text = await callTool(server, 'list_components', {})
      expect(text).toContain('Components (5)')
      expect(text).toContain('**Button**')
      expect(text).toContain('**Card**')
      expect(text).toContain('**Calendar**')
      expect(text).toContain('**MetricCard**')
      expect(text).toContain('**Dialog**')
    })

    it('filters by category', async () => {
      const text = await callTool(server, 'list_components', { category: 'actions' })
      expect(text).toContain('Components (1)')
      expect(text).toContain('**Button**')
      expect(text).not.toContain('**Card**')
    })

    it('filters by tier', async () => {
      const text = await callTool(server, 'list_components', { tier: 'premium' })
      expect(text).toContain('**Button**')
      expect(text).toContain('**Card**')
      expect(text).toContain('**MetricCard**')
      expect(text).not.toContain('**Calendar**')
      expect(text).not.toContain('**Dialog**')
    })

    it('filters by both category and tier', async () => {
      const text = await callTool(server, 'list_components', { category: 'layout', tier: 'premium' })
      expect(text).toContain('Components (1)')
      expect(text).toContain('**Card**')
      expect(text).not.toContain('**Button**')
    })

    it('returns empty list when no components match', async () => {
      const text = await callTool(server, 'list_components', { category: 'nonexistent' })
      expect(text).toContain('Components (0)')
    })

    it('includes import statements in output', async () => {
      const text = await callTool(server, 'list_components', { category: 'actions' })
      expect(text).toContain("import { Button } from '@annondeveloper/ui-kit'")
    })
  })

  // =========================================================================
  // get_component
  // =========================================================================

  describe('get_component', () => {
    it('returns full markdown docs for a valid component', async () => {
      const text = await callTool(server, 'get_component', { name: 'Button' })
      expect(text).toContain('# Button')
      expect(text).toContain('Interactive button')
      expect(text).toContain('## Import')
      expect(text).toContain('## Props')
      expect(text).toContain('## Examples')
      expect(text).toContain('## Accessibility')
      expect(text).toContain('## Related Components')
    })

    it('includes a props table with all props', async () => {
      const text = await callTool(server, 'get_component', { name: 'Button' })
      expect(text).toContain('`variant`')
      expect(text).toContain('`size`')
      expect(text).toContain('`children`')
      expect(text).toContain('`disabled`')
      expect(text).toContain('Yes')  // required column for children
      expect(text).toContain('No')   // not-required column for variant
    })

    it('includes example code blocks', async () => {
      const text = await callTool(server, 'get_component', { name: 'Button' })
      expect(text).toContain('### Primary')
      expect(text).toContain('<Button variant="solid">Click me</Button>')
      expect(text).toContain('### Outline')
    })

    it('includes related components and metadata', async () => {
      const text = await callTool(server, 'get_component', { name: 'Button' })
      expect(text).toContain('IconButton, ActionIcon')
      expect(text).toContain('**Category:** actions')
      expect(text).toContain('**Tiers:** standard, lite, premium')
    })

    it('returns "not found" for an invalid component name', async () => {
      const text = await callTool(server, 'get_component', { name: 'NonExistent' })
      expect(text).toContain('not found')
      expect(text).toContain('NonExistent')
    })

    it('performs case-insensitive lookup', async () => {
      const text = await callTool(server, 'get_component', { name: 'button' })
      expect(text).toContain('# Button')

      const text2 = await callTool(server, 'get_component', { name: 'CALENDAR' })
      expect(text2).toContain('# Calendar')
    })

    it('shows related components from fixture data', async () => {
      const text = await callTool(server, 'get_component', { name: 'MetricCard' })
      expect(text).toContain('Card')
    })
  })

  // =========================================================================
  // search_components
  // =========================================================================

  describe('search_components', () => {
    it('returns scored results matching component names', async () => {
      const text = await callTool(server, 'search_components', { query: 'button' })
      expect(text).toContain('Search results for "button"')
      expect(text).toContain('**Button**')
      expect(text).toContain('score:')
    })

    it('matches by keywords', async () => {
      const text = await callTool(server, 'search_components', { query: 'date' })
      expect(text).toContain('**Calendar**')
    })

    it('matches by description', async () => {
      const text = await callTool(server, 'search_components', { query: 'dashboard' })
      expect(text).toContain('**MetricCard**')
    })

    it('returns "No components found" for unmatched queries', async () => {
      const text = await callTool(server, 'search_components', { query: 'xyznonexistent' })
      expect(text).toContain('No components found')
    })

    it('respects the limit parameter', async () => {
      const text = await callTool(server, 'search_components', { query: 'a', limit: 2 })
      // "a" should match multiple components; limit to 2
      const resultLines = text.split('\n').filter(line => /^\d+\.\s\*\*/.test(line))
      expect(resultLines.length).toBeLessThanOrEqual(2)
    })

    it('includes import statements in results', async () => {
      const text = await callTool(server, 'search_components', { query: 'metric' })
      expect(text).toContain("import { MetricCard } from '@annondeveloper/ui-kit/premium'")
    })

    it('ranks exact name match higher than keyword match', async () => {
      const text = await callTool(server, 'search_components', { query: 'card' })
      // Card should appear before MetricCard (exact name match scores higher)
      const cardPos = text.indexOf('**Card**')
      const metricPos = text.indexOf('**MetricCard**')
      expect(cardPos).toBeLessThan(metricPos)
    })
  })

  // =========================================================================
  // generate_snippet
  // =========================================================================

  describe('generate_snippet', () => {
    it('generates code using example when available', async () => {
      const text = await callTool(server, 'generate_snippet', { components: ['Button'] })
      expect(text).toContain('Generated Snippet')
      expect(text).toContain('<Button variant="solid">Click me</Button>')
      expect(text).toContain("import { Button } from '@annondeveloper/ui-kit'")
    })

    it('deduplicates imports from the same package', async () => {
      const text = await callTool(server, 'generate_snippet', { components: ['Button', 'Card'] })
      // Both import from @annondeveloper/ui-kit but with different named imports
      // They have different importStatements so both should appear, but only once each
      const importLines = text.split('\n').filter(line => line.startsWith('import'))
      const unique = new Set(importLines)
      expect(importLines.length).toBe(unique.size)
    })

    it('builds minimal JSX from required props when no examples exist', async () => {
      const text = await callTool(server, 'generate_snippet', { components: ['MetricCard'] })
      // MetricCard has no examples, should generate from required props: label (string), value (number)
      expect(text).toContain('MetricCard')
      expect(text).toContain('label=')
      expect(text).toContain('value=')
    })

    it('returns error for all invalid component names', async () => {
      const text = await callTool(server, 'generate_snippet', { components: ['FakeWidget', 'BogusPanel'] })
      expect(text).toContain('No valid components found')
    })

    it('uses scenario as function name', async () => {
      const text = await callTool(server, 'generate_snippet', {
        components: ['Button'],
        scenario: 'Login Form',
      })
      expect(text).toContain('function LoginForm()')
      expect(text).toContain('Generated Snippet: Login Form')
    })

    it('handles mixed valid and invalid component names', async () => {
      const text = await callTool(server, 'generate_snippet', { components: ['Button', 'FakeWidget', 'Card'] })
      expect(text).toContain('Generated Snippet')
      expect(text).toContain('Button')
      expect(text).toContain('Card')
      expect(text).not.toContain('FakeWidget')
    })

    it('includes premium tip when premium component is used', async () => {
      const text = await callTool(server, 'generate_snippet', { components: ['MetricCard'] })
      expect(text).toContain('premium')
    })

    it('includes UIProvider tip in notes', async () => {
      const text = await callTool(server, 'generate_snippet', { components: ['Button'] })
      expect(text).toContain('UIProvider')
    })

    it('uses "Example" as default function name when no scenario', async () => {
      const text = await callTool(server, 'generate_snippet', { components: ['Card'] })
      expect(text).toContain('function Example()')
    })
  })

  // =========================================================================
  // get_theme
  // =========================================================================

  describe('get_theme', () => {
    it('returns CSS tokens for a valid theme', async () => {
      const text = await callTool(server, 'get_theme', { name: 'aurora', mode: 'dark' })
      expect(text).toContain('# Theme: Aurora (dark)')
      expect(text).toContain('#7c3aed')
      expect(text).toContain('--color-primary')
    })

    it('returns dark mode theme when mode is dark', async () => {
      const text = await callTool(server, 'get_theme', { name: 'aurora', mode: 'dark' })
      expect(text).toContain('(dark)')
      expect(text).toContain('Aurora')
    })

    it('returns light mode when requested', async () => {
      const text = await callTool(server, 'get_theme', { name: 'aurora', mode: 'light' })
      expect(text).toContain('(light)')
    })

    it('returns "not found" with available themes for invalid name', async () => {
      const text = await callTool(server, 'get_theme', { name: 'unicorn', mode: 'dark' })
      expect(text).toContain('not found')
      expect(text).toContain('unicorn')
      expect(text).toContain('aurora-dark')
    })

    it('includes usage example with generateTheme', async () => {
      const text = await callTool(server, 'get_theme', { name: 'ocean', mode: 'dark' })
      expect(text).toContain("generateTheme('#0ea5e9', 'dark')")
    })

    it('lists all available themes in not-found message', async () => {
      const text = await callTool(server, 'get_theme', { name: 'nonexistent', mode: 'dark' })
      expect(text).toContain('aurora-dark')
      expect(text).toContain('aurora-light')
      expect(text).toContain('ocean-dark')
    })
  })

  // =========================================================================
  // get_icons
  // =========================================================================

  describe('get_icons', () => {
    it('returns all icons when no search is provided', async () => {
      const text = await callTool(server, 'get_icons', {})
      expect(text).toContain('Icons (3)')
      expect(text).toContain('**check**')
      expect(text).toContain('**close**')
      expect(text).toContain('**search**')
    })

    it('filters by icon name', async () => {
      const text = await callTool(server, 'get_icons', { search: 'check' })
      expect(text).toContain('**check**')
      expect(text).not.toContain('**close**')
      expect(text).not.toContain('**search**')
    })

    it('filters by keyword match', async () => {
      const text = await callTool(server, 'get_icons', { search: 'dismiss' })
      expect(text).toContain('**close**')
      expect(text).not.toContain('**check**')
    })

    it('returns empty list when no icons match', async () => {
      const text = await callTool(server, 'get_icons', { search: 'nonexistent' })
      expect(text).toContain('Icons (0)')
    })

    it('includes Icon component import instruction', async () => {
      const text = await callTool(server, 'get_icons', {})
      expect(text).toContain("import { Icon } from '@annondeveloper/ui-kit'")
    })

    it('includes usage syntax for each icon', async () => {
      const text = await callTool(server, 'get_icons', { search: 'search' })
      expect(text).toContain('<Icon name="search" />')
    })
  })

  // =========================================================================
  // get_adaptive_info
  // =========================================================================

  describe('get_adaptive_info', () => {
    it('returns comprehensive adaptive system documentation', async () => {
      const text = await callTool(server, 'get_adaptive_info', {})
      expect(text).toContain('# Adaptive Tier Rendering')
      expect(text).toContain('navigator.connection')
      expect(text).toContain('Ctrl+Shift+A')
      expect(text).toContain('adaptive={false}')
      expect(text).toContain('Zero layout shift')
    })

    it('explains all three tiers', async () => {
      const text = await callTool(server, 'get_adaptive_info', {})
      expect(text).toContain('Premium (fast)')
      expect(text).toContain('Standard (moderate)')
      expect(text).toContain('Lite (slow)')
    })

    it('includes override instructions', async () => {
      const text = await callTool(server, 'get_adaptive_info', {})
      expect(text).toContain('<UIProvider adaptive={false} motion={3}>')
      expect(text).toContain('<UIProvider tier="lite">')
    })

    it('includes testing instructions', async () => {
      const text = await callTool(server, 'get_adaptive_info', {})
      expect(text).toContain('Chrome DevTools')
      expect(text).toContain('Slow 3G')
      expect(text).toContain('Dev Overlay')
    })
  })

  // =========================================================================
  // get_component adaptive behavior section
  // =========================================================================

  describe('get_component adaptive behavior', () => {
    it('includes adaptive behavior section in component docs', async () => {
      const text = await callTool(server, 'get_component', { name: 'Button' })
      expect(text).toContain('## Adaptive Behavior')
      expect(text).toContain('spring animations, aurora glow, shimmer effects')
      expect(text).toContain('CSS transitions, subtle shadows')
      expect(text).toContain('instant render, no animations, minimal effects')
      expect(text).toContain('zero layout shift')
    })
  })

  // =========================================================================
  // get_started adaptive mention
  // =========================================================================

  describe('get_started adaptive mention', () => {
    it('mentions adaptive rendering as a built-in feature', async () => {
      const text = await callTool(server, 'get_started', { framework: 'nextjs' })
      expect(text).toContain('Adaptive Rendering')
      expect(text).toContain('get_adaptive_info')
    })
  })

  // =========================================================================
  // resource component://
  // =========================================================================

  describe('resource component://', () => {
    it('lists all component resources', async () => {
      const resources = await listResources(server)
      expect(resources).toHaveLength(5)
      const names = resources.map(r => r.name)
      expect(names).toContain('Button')
      expect(names).toContain('Card')
      expect(names).toContain('Calendar')
      expect(names).toContain('MetricCard')
      expect(names).toContain('Dialog')
    })

    it('each resource has a component:// URI', async () => {
      const resources = await listResources(server)
      for (const r of resources) {
        expect(r.uri).toMatch(/^component:\/\//)
      }
    })

    it('reads a valid component and returns markdown', async () => {
      const text = await readResource(server, 'component://Button')
      expect(text).toContain('# Button')
      expect(text).toContain('Interactive button')
      expect(text).toContain('## Import')
      expect(text).toContain('## Props')
      expect(text).toContain('## Examples')
    })

    it('includes prop details with required markers', async () => {
      const text = await readResource(server, 'component://Button')
      expect(text).toContain('`children: ReactNode`')
      expect(text).toContain('`variant?:')  // optional prop has ?
    })

    it('returns "not found" for invalid component URI', async () => {
      const text = await readResource(server, 'component://FakeComponent')
      expect(text).toContain('not found')
    })
  })
})
