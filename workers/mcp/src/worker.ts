/**
 * Cloudflare Worker — hosted MCP server for @annondeveloper/ui-kit
 *
 * Provides the same 8 MCP tools as the local server but accessible via
 * HTTP SSE transport from anywhere. No Node.js required on the client.
 *
 * Endpoints:
 *   GET  /sse            — Establish SSE connection (MCP protocol)
 *   POST /messages       — Send MCP messages to a session
 *   GET  /health         — Health check
 *   GET  /               — Landing page with setup instructions
 */

import { McpServer, ResourceTemplate } from '@modelcontextprotocol/sdk/server/mcp.js'
import { SSEServerTransport } from '@modelcontextprotocol/sdk/server/sse.js'
import { z } from 'zod'

// Registry is inlined at build time (no filesystem in Workers)
import registry from './registry.json'

interface ComponentEntry {
  name: string
  description: string
  category: string
  tier: string[]
  importStatement: string
  props: { name: string; type: string; required: boolean; default?: string; description: string }[]
  examples: { title: string; code: string }[]
  accessibility: string
  relatedComponents: string[]
}

interface Registry {
  version: string
  components: Record<string, ComponentEntry>
  themes: Record<string, { name: string; hex: string; css: string }>
  icons: Record<string, { name: string; keywords: string[] }>
}

const reg = registry as Registry

// ─── Helpers ─────────────────────────────────────────────────────────────────

function findSimilarNames(name: string, allNames: string[], limit = 5): string[] {
  const lower = name.toLowerCase()
  // Exact substring matches first
  const substring = allNames.filter(n => n.toLowerCase().includes(lower) || lower.includes(n.toLowerCase()))
  if (substring.length > 0) return substring.slice(0, limit)
  // Levenshtein-like: sort by edit distance
  const scored = allNames.map(n => {
    const a = n.toLowerCase(), b = lower
    let dist = 0
    for (let i = 0; i < Math.max(a.length, b.length); i++) {
      if (a[i] !== b[i]) dist++
    }
    return { name: n, dist }
  }).sort((a, b) => a.dist - b.dist)
  return scored.slice(0, limit).map(s => s.name)
}

const CSS_SETUP_NOTE = `
> **Required CSS Setup** — Add these imports to your root layout (e.g. \`app/layout.tsx\` or \`main.tsx\`):
> \`\`\`tsx
> import '@annondeveloper/ui-kit/css/theme.css'
> import '@annondeveloper/ui-kit/css/all.css'
> \`\`\`
> Without these imports, components will render with correct HTML/ARIA but no visual styling.`

const DESIGN_GUIDE = `
## Design Best Practices

### Layout Pattern
Always wrap pages with \`<PageShell>\` and use layout primitives:
\`\`\`tsx
<PageShell padding="lg" maxWidth="xl">
  <PageHeader title="..." />
  {/* content sections */}
</PageShell>
\`\`\`

### Spacing Rules
- Use layout components (PageShell, SectionHeader, Toolbar) — they handle spacing automatically
- Never add manual margins between layout components — they have built-in spacing
- Use \`gap\` prop on StatsGrid/CardGrid, not CSS gaps

### Responsive Design
- All layout components are responsive by default — no media queries needed
- CardGrid/StatsGrid use CSS Grid auto-fit — they reflow automatically
- PageHeader stacks on narrow viewports via container queries
- Toolbar wraps on mobile automatically

### Color & Theme
- Always use semantic color tokens: \`var(--text-primary)\`, \`var(--bg-surface)\`, \`var(--brand)\`
- Never use hardcoded hex colors — they break in light mode and high contrast
- Use \`generateTheme('#hex')\` to create a brand theme from any color

### Typography
- Titles: use PageHeader/SectionHeader — they handle fluid sizing with clamp()
- Body text: system default is optimized; use \`text-wrap: pretty\` for paragraphs
- Don't override font sizes — the design system handles responsive scaling

### Motion
- All components respect \`prefers-reduced-motion\` automatically
- Use \`motion\` prop (0-3) to control animation intensity
- Premium tier adds spring physics and aurora effects

### Accessibility (built-in)
- All components ship with WCAG AA contrast, ARIA attributes, keyboard navigation
- Use semantic HTML: \`PageHeader\` renders \`<header>\`, \`Toolbar\` has \`role="toolbar"\`
- Focus management is handled automatically for dialogs, dropdowns, popovers

### Common Patterns
- **Dashboard**: PageShell > PageHeader > StatsGrid > SectionHeader > CardGrid
- **Settings**: PageShell > PageHeader > SectionHeader > Card > ListLayout > FormInputs
- **List view**: PageShell > PageHeader > Toolbar > ListLayout > Pagination
- **Detail view**: PageShell > PageHeader (with breadcrumbs) > CardGrid > PropertyList
`

// ─── Component lookup ────────────────────────────────────────────────────────

function getComponent(name: string): ComponentEntry | null {
  const key = Object.keys(reg.components).find(k => k.toLowerCase() === name.toLowerCase())
  return key ? reg.components[key] : null
}

function searchComponents(query: string, limit: number = 10) {
  const q = query.toLowerCase()
  const scored = Object.values(reg.components).map(c => {
    let score = 0
    let reason = ''
    if (c.name.toLowerCase().includes(q)) { score += 10; reason = 'Name match' }
    if (c.description.toLowerCase().includes(q)) { score += 5; reason = reason || 'Description match' }
    if (c.category.toLowerCase().includes(q)) { score += 3; reason = reason || 'Category match' }
    c.props.forEach(p => { if (p.name.toLowerCase().includes(q)) { score += 1; reason = reason || 'Prop match' } })
    return { ...c, score, reason: reason || 'Keyword match', importStatement: c.importStatement }
  })
  return scored.filter(s => s.score > 0).sort((a, b) => b.score - a.score).slice(0, limit)
}

// ─── MCP Server factory ──────────────────────────────────────────────────────

function createMcpServer(): McpServer {
  const server = new McpServer({
    name: '@annondeveloper/ui-kit',
    version: reg.version,
  })

  server.tool('list_components', 'List all UI Kit components', {
    category: z.string().optional().describe('Filter by category'),
    tier: z.string().optional().describe('Filter by tier: standard, lite, or premium'),
  }, async ({ category, tier }) => {
    let components = Object.values(reg.components)
    if (category) components = components.filter(c => c.category === category)
    if (tier) components = components.filter(c => c.tier.includes(tier))
    const list = components.map(c => `- **${c.name}** (${c.category}) — ${c.description}\n  Import: \`${c.importStatement}\``)
    return { content: [{ type: 'text' as const, text: `# Components (${components.length})\n\n${CSS_SETUP_NOTE}\n\n${list.join('\n\n')}` }] }
  })

  server.tool('get_component', 'Get full API documentation for a specific component', {
    name: z.string().describe('Component name, e.g. "Button" or "Calendar"'),
  }, async ({ name }) => {
    const comp = getComponent(name)
    if (!comp) {
      const allNames = Object.keys(reg.components)
      const suggestions = findSimilarNames(name, allNames)
      const suggestText = suggestions.length > 0
        ? `\n\nDid you mean one of these?\n${suggestions.map(s => `- **${s}**`).join('\n')}\n\nUse \`list_components\` to see all available components.`
        : '\n\nUse `list_components` to see all available components.'
      return { content: [{ type: 'text' as const, text: `Component "${name}" not found.${suggestText}` }] }
    }
    const propsTable = comp.props.map(p =>
      `| \`${p.name}\` | \`${p.type}\` | ${p.required ? 'Yes' : 'No'} | ${p.default || '-'} | ${p.description} |`
    ).join('\n')
    const examples = comp.examples.map(e => `### ${e.title}\n\`\`\`tsx\n${e.code}\n\`\`\``).join('\n\n')
    const text = `# ${comp.name}

${comp.description}

## Import
\`\`\`tsx
${comp.importStatement}
\`\`\`

## Props
| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
${propsTable}

## Examples
${examples}

## Accessibility
${comp.accessibility}

## Related Components
${comp.relatedComponents.join(', ') || 'None'}

**Category:** ${comp.category} | **Tiers:** ${comp.tier.join(', ')}

${CSS_SETUP_NOTE}

${DESIGN_GUIDE}`
    return { content: [{ type: 'text' as const, text }] }
  })

  server.tool('search_components', 'Search components by use-case or keyword', {
    query: z.string().describe('Natural language search'),
    limit: z.number().optional().default(10),
  }, async ({ query, limit }) => {
    const results = searchComponents(query, limit)
    if (results.length === 0) return { content: [{ type: 'text' as const, text: `No results for "${query}"` }] }
    const text = results.map((r, i) => `${i + 1}. **${r.name}** (score: ${r.score}) — ${r.description}\n   \`${r.importStatement}\``).join('\n\n')
    return { content: [{ type: 'text' as const, text: `# Search: "${query}"\n\n${text}` }] }
  })

  server.tool('generate_snippet', 'Generate working TSX code', {
    components: z.array(z.string()).describe('Component names'),
    scenario: z.string().optional(),
  }, async ({ components: names, scenario }) => {
    const comps = names.map(n => getComponent(n)).filter(Boolean) as ComponentEntry[]
    if (comps.length === 0) return { content: [{ type: 'text' as const, text: 'No valid components found.' }] }
    const imports = [...new Set(comps.map(c => c.importStatement))].join('\n')
    const jsx = comps.map(c => c.examples[0]?.code.split('\n').filter(l => !l.startsWith('import ')).join('\n').trim() || `<${c.name} />`).join('\n        ')
    const code = `// Required CSS imports — add to your root layout:\n// import '@annondeveloper/ui-kit/css/theme.css'\n// import '@annondeveloper/ui-kit/css/all.css'\n\n${imports}\nimport { UIProvider } from '@annondeveloper/ui-kit'\n\nexport function ${(scenario || 'Example').replace(/[^a-zA-Z0-9]/g, '').slice(0, 30) || 'Example'}() {\n  return (\n    <UIProvider>\n      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>\n        ${jsx}\n      </div>\n    </UIProvider>\n  )\n}`
    const notes = [
      `Components used: ${comps.map(c => c.name).join(', ')}`,
      comps.some(c => c.tier.includes('premium')) ? 'Tip: Import from "@annondeveloper/ui-kit/premium" for enhanced animations' : '',
      'Output is wrapped in <UIProvider> for theme and motion support',
    ].filter(Boolean).join('\n')
    return { content: [{ type: 'text' as const, text: `# Generated Snippet${scenario ? `: ${scenario}` : ''}\n\n\`\`\`tsx\n${code}\n\`\`\`\n\n## Notes\n${notes}` }] }
  })

  server.tool('get_theme', 'Get theme tokens and CSS', {
    name: z.string().describe('Theme name'),
    mode: z.enum(['dark', 'light']).optional().default('dark'),
  }, async ({ name, mode }) => {
    const key = `${name}-${mode}`
    const theme = reg.themes[key] || reg.themes[name]
    if (!theme) return { content: [{ type: 'text' as const, text: `Theme "${name}" not found. Available: ${Object.keys(reg.themes).join(', ')}` }] }
    return { content: [{ type: 'text' as const, text: `# Theme: ${theme.name}\n\n\`\`\`css\n${theme.css}\n\`\`\`` }] }
  })

  server.tool('get_icons', 'Browse built-in SVG icons', {
    search: z.string().optional(),
  }, async ({ search }) => {
    let icons = Object.values(reg.icons)
    if (search) icons = icons.filter(i => i.name.includes(search.toLowerCase()) || i.keywords.some(k => k.includes(search.toLowerCase())))
    const list = icons.map(i => `- **${i.name}** — \`<Icon name="${i.name}" />\``).join('\n')
    return { content: [{ type: 'text' as const, text: `# Icons (${icons.length})\n\n${list}` }] }
  })

  // Tool 7: get_started
  server.tool('get_started', 'Complete setup guide for new projects. Start here if you are using UI Kit for the first time.', {
    framework: z.enum(['nextjs', 'vite', 'remix', 'cra', 'other']).optional().default('nextjs').describe('Your framework'),
  }, async ({ framework }) => {
    const layoutFile: Record<string, string> = {
      nextjs: 'app/layout.tsx',
      vite: 'src/main.tsx',
      remix: 'app/root.tsx',
      cra: 'src/index.tsx',
      other: 'your root/entry file',
    }
    const file = layoutFile[framework] || layoutFile.other

    const text = `# Getting Started with UI Kit

## Step 1: Install
\`\`\`bash
npm install @annondeveloper/ui-kit
\`\`\`

## Step 2: Import CSS (⚠️ Required!)
Add these to \`${file}\`:
\`\`\`tsx
import '@annondeveloper/ui-kit/css/theme.css'
import '@annondeveloper/ui-kit/css/all.css'
\`\`\`
> Without CSS imports, components render correct HTML but have **no visual styling**.

## Step 3: Wrap with UIProvider
\`\`\`tsx
import { UIProvider } from '@annondeveloper/ui-kit'

export default function RootLayout({ children }) {
  return (
    <UIProvider mode="dark" motion={3}>
      {children}
    </UIProvider>
  )
}
\`\`\`

## Step 4: Use Components
\`\`\`tsx
import { Button, Card, Badge } from '@annondeveloper/ui-kit'

function MyPage() {
  return (
    <Card>
      <h2>Hello World</h2>
      <Badge>New</Badge>
      <Button variant="primary">Get Started</Button>
    </Card>
  )
}
\`\`\`

## Weight Tiers
Each component comes in 3 tiers:
- **Lite** (\`@annondeveloper/ui-kit/lite\`) — minimal CSS-only, ~0.3KB
- **Standard** (\`@annondeveloper/ui-kit\`) — full features, ~2KB
- **Premium** (\`@annondeveloper/ui-kit/premium\`) — spring animations + aurora glow, ~3KB

## Theming
\`\`\`tsx
import { generateTheme, applyTheme } from '@annondeveloper/ui-kit/theme'
const theme = generateTheme('#6366f1', 'dark')
applyTheme(theme)
\`\`\`

## Next Steps
- Use \`list_components\` to browse all ${Object.keys(reg.components).length} components
- Use \`search_components\` to find components by use-case
- Use \`generate_snippet\` to get working code examples
- Use \`get_theme\` to explore pre-built themes`

    return { content: [{ type: 'text' as const, text }] }
  })

  // Tool 8: get_page_template
  server.tool('get_page_template', 'Get a complete, working page scaffold with proper layout and spacing. Returns production-ready code.', {
    template: z.enum([
      'dashboard', 'settings', 'list', 'detail', 'empty', 'auth', 'landing'
    ]).describe('Page template type'),
    tier: z.enum(['standard', 'lite', 'premium']).optional().default('standard').describe('Component tier'),
  }, async ({ template, tier }) => {
    const importPath = tier === 'lite'
      ? '@annondeveloper/ui-kit/lite'
      : tier === 'premium'
        ? '@annondeveloper/ui-kit/premium'
        : '@annondeveloper/ui-kit'

    const templates: Record<string, string> = {
      dashboard: `// Dashboard Page — stats overview + content sections
import '@annondeveloper/ui-kit/css/theme.css'
import '@annondeveloper/ui-kit/css/all.css'
import {
  PageShell, PageHeader, StatsGrid, SectionHeader,
  CardGrid, Card, Toolbar, ListLayout
} from '${importPath}'
import { MetricCard } from '${importPath}'
import { Button } from '${importPath}'
import { SearchInput } from '${importPath}'
import { Badge } from '${importPath}'
import { UIProvider } from '@annondeveloper/ui-kit'

export default function DashboardPage() {
  return (
    <UIProvider>
      <PageShell padding="lg" maxWidth="xl">
        <PageHeader
          title="Dashboard"
          description="Overview of your system status and metrics"
          actions={<Button variant="primary">Create New</Button>}
        />

        <StatsGrid columns={4}>
          <MetricCard label="Total Users" value={1284} trend={12} status="ok" />
          <MetricCard label="Active Now" value={42} status="ok" />
          <MetricCard label="Errors" value={3} status="critical" />
          <MetricCard label="Uptime" value="99.9%" status="ok" />
        </StatsGrid>

        <Toolbar justify="between">
          <SearchInput placeholder="Search..." />
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <Button variant="secondary" size="sm">Filter</Button>
            <Button variant="secondary" size="sm">Export</Button>
          </div>
        </Toolbar>

        <SectionHeader title="Recent Activity" action={<Button variant="ghost" size="sm">View All</Button>} />
        <ListLayout dividers>
          <div>Activity item 1 <Badge>New</Badge></div>
          <div>Activity item 2</div>
          <div>Activity item 3</div>
        </ListLayout>

        <SectionHeader title="Quick Actions" />
        <CardGrid columns={3}>
          <Card padding="md"><h3>Reports</h3><p>Generate and view reports</p></Card>
          <Card padding="md"><h3>Settings</h3><p>Configure your workspace</p></Card>
          <Card padding="md"><h3>Team</h3><p>Manage team members</p></Card>
        </CardGrid>
      </PageShell>
    </UIProvider>
  )
}`,

      settings: `// Settings Page — form sections with save actions
import '@annondeveloper/ui-kit/css/theme.css'
import '@annondeveloper/ui-kit/css/all.css'
import { PageShell, PageHeader, SectionHeader, Card, ListLayout } from '${importPath}'
import { FormInput } from '${importPath}'
import { Button } from '${importPath}'
import { ToggleSwitch } from '${importPath}'
import { UIProvider } from '@annondeveloper/ui-kit'

export default function SettingsPage() {
  return (
    <UIProvider>
      <PageShell padding="lg" maxWidth="md">
        <PageHeader title="Settings" description="Manage your account preferences" />

        <SectionHeader title="Profile" />
        <Card padding="md">
          <ListLayout gap="md">
            <FormInput label="Display Name" placeholder="Your name" />
            <FormInput label="Email" type="email" placeholder="you@example.com" />
            <FormInput label="Bio" placeholder="Tell us about yourself" />
          </ListLayout>
        </Card>

        <SectionHeader title="Notifications" />
        <Card padding="md">
          <ListLayout gap="md">
            <ToggleSwitch label="Email notifications" />
            <ToggleSwitch label="Push notifications" />
            <ToggleSwitch label="Weekly digest" />
          </ListLayout>
        </Card>

        <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
          <Button variant="secondary">Cancel</Button>
          <Button variant="primary">Save Changes</Button>
        </div>
      </PageShell>
    </UIProvider>
  )
}`,

      list: `// List Page — searchable, filterable list of items
import '@annondeveloper/ui-kit/css/theme.css'
import '@annondeveloper/ui-kit/css/all.css'
import { PageShell, PageHeader, Toolbar, ListLayout, Card } from '${importPath}'
import { SearchInput } from '${importPath}'
import { Button } from '${importPath}'
import { Badge } from '${importPath}'
import { Pagination } from '${importPath}'
import { UIProvider } from '@annondeveloper/ui-kit'

export default function ListPage() {
  return (
    <UIProvider>
      <PageShell padding="lg" maxWidth="lg">
        <PageHeader
          title="Devices"
          description="Manage your connected devices"
          actions={<Button variant="primary">Add Device</Button>}
        />

        <Toolbar justify="between">
          <SearchInput placeholder="Search devices..." />
          <Button variant="secondary" size="sm">Filters</Button>
        </Toolbar>

        <ListLayout dividers>
          {/* Repeat for each item */}
          <Card padding="md" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <strong>Device Name</strong>
              <p style={{ margin: 0, color: 'var(--text-secondary)' }}>192.168.1.100</p>
            </div>
            <Badge color="success">Online</Badge>
          </Card>
        </ListLayout>

        <Pagination total={50} pageSize={10} />
      </PageShell>
    </UIProvider>
  )
}`,

      detail: `// Detail Page — single item view with metadata
import '@annondeveloper/ui-kit/css/theme.css'
import '@annondeveloper/ui-kit/css/all.css'
import { PageShell, PageHeader, SectionHeader, Card, CardGrid } from '${importPath}'
import { Button } from '${importPath}'
import { Badge } from '${importPath}'
import { PropertyList } from '${importPath}'
import { UIProvider } from '@annondeveloper/ui-kit'

export default function DetailPage() {
  return (
    <UIProvider>
      <PageShell padding="lg" maxWidth="lg">
        <PageHeader
          title="Device: Core Router"
          description="Detailed view of device status and configuration"
          breadcrumbs={<span>Devices &gt; Core Router</span>}
          actions={
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <Button variant="secondary">Edit</Button>
              <Button variant="danger">Delete</Button>
            </div>
          }
        />

        <CardGrid columns={2}>
          <Card padding="md">
            <SectionHeader title="Status" size="sm" />
            <Badge color="success" size="lg">Online</Badge>
          </Card>
          <Card padding="md">
            <SectionHeader title="Uptime" size="sm" />
            <p style={{ fontSize: '2rem', fontWeight: 700, margin: 0 }}>99.9%</p>
          </Card>
        </CardGrid>

        <SectionHeader title="Properties" />
        <Card padding="md">
          <PropertyList items={[
            { label: 'IP Address', value: '192.168.1.1' },
            { label: 'MAC Address', value: 'AA:BB:CC:DD:EE:FF' },
            { label: 'Firmware', value: 'v3.2.1' },
          ]} />
        </Card>
      </PageShell>
    </UIProvider>
  )
}`,

      empty: `// Empty State Page — when no data exists yet
import '@annondeveloper/ui-kit/css/theme.css'
import '@annondeveloper/ui-kit/css/all.css'
import { PageShell, PageHeader } from '${importPath}'
import { EmptyState } from '${importPath}'
import { Button } from '${importPath}'
import { UIProvider } from '@annondeveloper/ui-kit'

export default function EmptyPage() {
  return (
    <UIProvider>
      <PageShell padding="lg" maxWidth="md">
        <PageHeader title="Devices" />
        <EmptyState
          title="No devices yet"
          description="Add your first device to start monitoring your infrastructure."
          action={<Button variant="primary">Add Device</Button>}
          icon="server"
        />
      </PageShell>
    </UIProvider>
  )
}`,

      auth: `// Auth Page — centered login/signup form
import '@annondeveloper/ui-kit/css/theme.css'
import '@annondeveloper/ui-kit/css/all.css'
import { PageShell, Card } from '${importPath}'
import { FormInput } from '${importPath}'
import { Button } from '${importPath}'
import { UIProvider } from '@annondeveloper/ui-kit'

export default function AuthPage() {
  return (
    <UIProvider>
      <PageShell padding="lg" maxWidth="sm" style={{ minBlockSize: '100vh', justifyContent: 'center' }}>
        <Card padding="lg">
          <h1 style={{ textAlign: 'center', marginBlockEnd: '1.5rem' }}>Sign In</h1>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <FormInput label="Email" type="email" placeholder="you@example.com" />
            <FormInput label="Password" type="password" placeholder="Your password" />
            <Button variant="primary" style={{ inlineSize: '100%' }}>Sign In</Button>
          </div>
          <p style={{ textAlign: 'center', marginBlockStart: '1rem', color: 'var(--text-secondary)' }}>
            Don't have an account? <a href="/signup">Sign up</a>
          </p>
        </Card>
      </PageShell>
    </UIProvider>
  )
}`,

      landing: `// Landing Page — hero + features + CTA
import '@annondeveloper/ui-kit/css/theme.css'
import '@annondeveloper/ui-kit/css/all.css'
import { PageShell, CardGrid, Card, SectionHeader } from '${importPath}'
import { Button } from '${importPath}'
import { Icon } from '@annondeveloper/ui-kit'
import { UIProvider } from '@annondeveloper/ui-kit'

export default function LandingPage() {
  return (
    <UIProvider>
      <PageShell padding="lg" maxWidth="xl">
        <header style={{ textAlign: 'center', paddingBlock: '4rem' }}>
          <h1 style={{ fontSize: 'clamp(2rem, 5vw, 3.5rem)', fontWeight: 800, marginBlockEnd: '1rem' }}>
            Build Beautiful Dashboards
          </h1>
          <p style={{ fontSize: '1.125rem', color: 'var(--text-secondary)', maxInlineSize: '50ch', marginInline: 'auto' }}>
            Zero-dependency React component library with 150+ components,
            physics-based animations, and Aurora Fluid design.
          </p>
          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', marginBlockStart: '2rem' }}>
            <Button variant="primary" size="lg">Get Started</Button>
            <Button variant="secondary" size="lg">View Demo</Button>
          </div>
        </header>

        <SectionHeader title="Features" />
        <CardGrid columns={3}>
          <Card padding="lg">
            <Icon name="layers" size="lg" />
            <h3>3 Weight Tiers</h3>
            <p>Lite, Standard, Premium — choose your bundle budget.</p>
          </Card>
          <Card padding="lg">
            <Icon name="zap" size="lg" />
            <h3>Physics Animations</h3>
            <p>Real spring solver, not approximations.</p>
          </Card>
          <Card padding="lg">
            <Icon name="palette" size="lg" />
            <h3>OKLCH Colors</h3>
            <p>Perceptually uniform, theme from any brand color.</p>
          </Card>
        </CardGrid>
      </PageShell>
    </UIProvider>
  )
}`,
    }

    const code = templates[template] || 'Template not found.'
    const text = `# Page Template: ${template}

Tier: **${tier}**

\`\`\`tsx
${code}
\`\`\`

## Layout Components Used
- \`PageShell\` — page container with padding and max-width
- \`PageHeader\` — title + description + actions
- \`SectionHeader\` — section dividers with optional actions
- \`StatsGrid\` — responsive metric card grid
- \`CardGrid\` — responsive card layout
- \`Toolbar\` — search/filter/action bar
- \`ListLayout\` — vertical list with dividers

${CSS_SETUP_NOTE}`

    return { content: [{ type: 'text' as const, text }] }
  })

  server.resource('component', new ResourceTemplate('component://{name}', {
    list: async () => ({
      resources: Object.values(reg.components).map(c => ({
        uri: `component://${c.name}`,
        name: c.name,
        description: c.description,
        mimeType: 'text/markdown' as const,
      }))
    })
  }), async (uri, { name }) => {
    const comp = getComponent(name as string)
    if (!comp) return { contents: [{ uri: uri.href, mimeType: 'text/plain', text: `Not found` }] }
    const propsDoc = comp.props.map(p => `- \`${p.name}: ${p.type}\` — ${p.description}`).join('\n')
    return { contents: [{ uri: uri.href, mimeType: 'text/markdown', text: `# ${comp.name}\n\n${comp.description}\n\n## Props\n${propsDoc}` }] }
  })

  return server
}

// ─── Cloudflare Worker fetch handler ─────────────────────────────────────────

const sessions = new Map<string, SSEServerTransport>()

const LANDING_HTML = `<!DOCTYPE html>
<html><head><title>ui-kit MCP Server</title><meta charset="utf-8"><meta name="viewport" content="width=device-width">
<style>
*{box-sizing:border-box;margin:0}
body{font-family:system-ui,-apple-system,sans-serif;background:#08080d;color:#c8c8d0;min-height:100vh;padding:0}
.hero{text-align:center;padding:4rem 1.5rem 3rem;background:radial-gradient(ellipse at 50% 0%,oklch(25% 0.08 270 / 0.4),transparent 70%)}
h1{font-size:clamp(1.75rem,5vw,2.5rem);font-weight:800;letter-spacing:-0.03em;background:linear-gradient(135deg,#818cf8 0%,#c084fc 50%,#f472b6 100%);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text}
.sub{color:#8888a0;font-size:1rem;margin-top:0.75rem;max-width:480px;margin-inline:auto;line-height:1.6}
.badge{display:inline-flex;align-items:center;gap:0.375rem;background:#1a1a2e;border:1px solid #2a2a3e;border-radius:9999px;padding:0.25rem 0.75rem;font-size:0.75rem;color:#10b981;margin-top:1rem}
.badge::before{content:'';width:6px;height:6px;background:#10b981;border-radius:50%;animation:pulse 2s ease-in-out infinite}
@keyframes pulse{0%,100%{opacity:1}50%{opacity:0.4}}
.content{max-width:600px;margin:0 auto;padding:0 1.5rem 4rem}
.step{margin-top:2.5rem}
.step-num{display:inline-flex;align-items:center;justify-content:center;width:1.5rem;height:1.5rem;border-radius:50%;background:#818cf8;color:#fff;font-size:0.75rem;font-weight:700}
.step h2{display:inline;font-size:1rem;font-weight:600;color:#e0e0e8;margin-left:0.5rem}
.step p{color:#8888a0;font-size:0.875rem;margin-top:0.375rem;line-height:1.5}
pre{background:#0f0f1a;border:1px solid #1e1e30;border-radius:0.5rem;padding:1rem;margin-top:0.75rem;overflow-x:auto;font-size:0.8125rem;line-height:1.5;color:#c8c8d0;position:relative}
pre .copy{position:absolute;top:0.5rem;right:0.5rem;background:#1e1e30;border:1px solid #2e2e40;border-radius:0.25rem;color:#818cf8;padding:0.25rem 0.5rem;font-size:0.6875rem;cursor:pointer;font-family:inherit}
pre .copy:hover{background:#2a2a3e}
code{font-family:'SF Mono','Fira Code','JetBrains Mono',monospace}
.tools{display:grid;grid-template-columns:repeat(auto-fit,minmax(160px,1fr));gap:0.75rem;margin-top:1rem}
.tool{background:#0f0f1a;border:1px solid #1e1e30;border-radius:0.5rem;padding:0.75rem;font-size:0.8125rem}
.tool strong{color:#e0e0e8;display:block;margin-bottom:0.25rem}
.tool span{color:#6b6b80;font-size:0.75rem;line-height:1.4}
.prompts{margin-top:1rem;display:flex;flex-direction:column;gap:0.5rem}
.prompt{background:#0f0f1a;border:1px solid #1e1e30;border-radius:0.5rem;padding:0.625rem 0.875rem;font-size:0.8125rem;color:#a0a0b0;font-style:italic;cursor:pointer;transition:border-color 0.15s}
.prompt:hover{border-color:#818cf8}
.links{margin-top:3rem;text-align:center;font-size:0.8125rem;color:#6b6b80}
.links a{color:#818cf8;text-decoration:none;margin:0 0.75rem}
.links a:hover{text-decoration:underline}
</style></head>
<body>
<div class="hero">
  <h1>ui-kit MCP Server</h1>
  <p class="sub">147 React components your AI can discover, understand, and use. Zero setup required.</p>
  <div class="badge">Live on Cloudflare Workers</div>
</div>

<div class="content">
  <div class="step">
    <span class="step-num">1</span>
    <h2>Add to your AI assistant</h2>
    <p>Copy this into your MCP config (Claude, Cursor, or any MCP client):</p>
    <pre><button class="copy" onclick="navigator.clipboard.writeText(this.nextElementSibling.textContent)">Copy</button><code>{
  "mcpServers": {
    "ui-kit": {
      "url": "WORKER_URL/sse"
    }
  }
}</code></pre>
  </div>

  <div class="step">
    <span class="step-num">2</span>
    <h2>Ask your AI to build</h2>
    <p>Try these prompts — your AI will use real component APIs, not guesses:</p>
    <div class="prompts">
      <div class="prompt">"Build a dashboard with MetricCard, DataTable, and TimeSeriesChart"</div>
      <div class="prompt">"Create a multi-step form wizard with validation"</div>
      <div class="prompt">"Show me all the chart components available"</div>
      <div class="prompt">"Generate a login page with the ui-kit design system"</div>
    </div>
  </div>

  <div class="step">
    <span class="step-num">3</span>
    <h2>Install the library</h2>
    <p>When you're ready to use the generated code:</p>
    <pre><code>npm install @annondeveloper/ui-kit</code></pre>
  </div>

  <div class="step">
    <h2 style="margin-left:0">Available Tools</h2>
    <div class="tools">
      <div class="tool"><strong>list_components</strong><span>Browse all 147 components by category or tier</span></div>
      <div class="tool"><strong>get_component</strong><span>Full API reference — props, types, examples</span></div>
      <div class="tool"><strong>search_components</strong><span>Find components by use case</span></div>
      <div class="tool"><strong>generate_snippet</strong><span>Working TSX with correct imports</span></div>
      <div class="tool"><strong>get_theme</strong><span>OKLCH theme tokens and CSS</span></div>
      <div class="tool"><strong>get_icons</strong><span>50+ built-in SVG icons</span></div>
      <div class="tool"><strong>get_started</strong><span>Framework-aware setup guide</span></div>
      <div class="tool"><strong>get_page_template</strong><span>7 production-ready page scaffolds</span></div>
    </div>
  </div>

  <div class="links">
    <a href="https://github.com/annondeveloper/ui-kit">GitHub</a>
    <a href="https://www.npmjs.com/package/@annondeveloper/ui-kit">npm</a>
    <a href="https://jsr.io/@annondeveloper/ui-kit">JSR</a>
    <a href="https://annondeveloper.github.io/ui-kit/">Demo</a>
    <a href="WORKER_URL/health">Health</a>
  </div>
</div>
</body></html>`

export default {
  async fetch(request: Request): Promise<Response> {
    const url = new URL(request.url)
    const cors = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    }

    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: cors })
    }

    // Landing page
    if (request.method === 'GET' && url.pathname === '/') {
      const html = LANDING_HTML.replace('WORKER_URL', url.origin)
      return new Response(html, { headers: { ...cors, 'Content-Type': 'text/html' } })
    }

    // Health check
    if (request.method === 'GET' && url.pathname === '/health') {
      return Response.json({ status: 'ok', sessions: sessions.size, version: reg.version }, { headers: cors })
    }

    // SSE connection
    if (request.method === 'GET' && url.pathname === '/sse') {
      const server = createMcpServer()
      const transport = new SSEServerTransport('/messages', new Response() as any)

      // Create a ReadableStream for SSE
      const { readable, writable } = new TransformStream()
      const writer = writable.getWriter()
      const encoder = new TextEncoder()

      // Patch the transport to write to our stream instead of Node response
      const originalSend = transport.send?.bind(transport)
      if (typeof originalSend === 'function') {
        transport.send = async (message: unknown) => {
          await writer.write(encoder.encode(`data: ${JSON.stringify(message)}\n\n`))
        }
      }

      sessions.set(transport.sessionId, transport)
      transport.onclose = () => sessions.delete(transport.sessionId)

      // Send session ID as first SSE event
      writer.write(encoder.encode(`event: endpoint\ndata: /messages?sessionId=${transport.sessionId}\n\n`))

      await server.connect(transport)

      return new Response(readable, {
        headers: {
          ...cors,
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache',
          'Connection': 'keep-alive',
        },
      })
    }

    // Message handler
    if (request.method === 'POST' && url.pathname === '/messages') {
      const sessionId = url.searchParams.get('sessionId')
      if (!sessionId || !sessions.has(sessionId)) {
        return Response.json({ error: 'Session not found' }, { status: 404, headers: cors })
      }
      const transport = sessions.get(sessionId)!
      const body = await request.json()
      try {
        await transport.handlePostMessage(request as any, new Response() as any, body)
        return new Response('OK', { status: 200, headers: cors })
      } catch (error) {
        return Response.json({ error: (error as Error).message }, { status: 500, headers: cors })
      }
    }

    return new Response('Not found', { status: 404, headers: cors })
  },
}
