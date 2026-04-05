import { McpServer, ResourceTemplate } from '@modelcontextprotocol/sdk/server/mcp.js'
import { z } from 'zod'
import { loadRegistry, getComponent, searchComponents } from './registry/loader.js'
import { logToolCall } from './analytics.js'

// ─── Helpers ──────────────────────────────────────────────────────────────────

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

export function createServer() {
  const reg = loadRegistry()
  const server = new McpServer({
    name: '@annondeveloper/ui-kit',
    version: reg.version,
  })

  // Tool 1: list_components
  server.tool('list_components', 'List all UI Kit components, optionally filtered by category or tier', {
    category: z.string().optional().describe('Filter by category'),
    tier: z.string().optional().describe('Filter by tier: standard, lite, or premium'),
  }, async ({ category, tier }) => {
    try {
      logToolCall('list_components', { query: [category, tier].filter(Boolean).join(',') || undefined })
      const reg = loadRegistry()
      let components = Object.values(reg.components)
      if (category) components = components.filter(c => c.category === category)
      if (tier) components = components.filter(c => c.tier.includes(tier))
      const list = components.map(c => `- **${c.name}** (${c.category}) — ${c.description}\n  Import: \`${c.importStatement}\``)
      return { content: [{ type: 'text' as const, text: `# Components (${components.length})\n\n${CSS_SETUP_NOTE}\n\n${list.join('\n\n')}` }] }
    } catch (error) {
      console.error('[ui-kit-mcp]', 'list_components', error)
      return { content: [{ type: 'text' as const, text: `Error in list_components: ${(error as Error).message}` }], isError: true }
    }
  })

  // Tool 2: get_component
  server.tool('get_component', 'Get full API documentation for a specific component', {
    name: z.string().describe('Component name, e.g. "Button" or "Calendar"'),
  }, async ({ name }) => {
    try {
      logToolCall('get_component', { components: [name] })
      const comp = getComponent(name)
      if (!comp) {
        const reg = loadRegistry()
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

${CSS_SETUP_NOTE}`

      return { content: [{ type: 'text' as const, text }] }
    } catch (error) {
      console.error('[ui-kit-mcp]', 'get_component', error)
      return { content: [{ type: 'text' as const, text: `Error in get_component: ${(error as Error).message}` }], isError: true }
    }
  })

  // Tool 3: search_components
  server.tool('search_components', 'Search components by use-case or keyword', {
    query: z.string().describe('Natural language search, e.g. "date selection with range"'),
    limit: z.number().optional().default(10).describe('Max results'),
  }, async ({ query, limit }) => {
    try {
      logToolCall('search_components', { query })
      const results = searchComponents(query, limit)
      if (results.length === 0) return { content: [{ type: 'text' as const, text: `No components found for "${query}"` }] }
      const text = results.map((r, i) => `${i + 1}. **${r.name}** (score: ${r.score}) — ${r.description}\n   ${r.reason}\n   \`${r.importStatement}\``).join('\n\n')
      return { content: [{ type: 'text' as const, text: `# Search results for "${query}"\n\n${text}` }] }
    } catch (error) {
      console.error('[ui-kit-mcp]', 'search_components', error)
      return { content: [{ type: 'text' as const, text: `Error in search_components: ${(error as Error).message}` }], isError: true }
    }
  })

  // Tool 4: generate_snippet
  server.tool('generate_snippet', 'Generate working TSX code using UI Kit components', {
    components: z.array(z.string()).describe('Component names to use'),
    scenario: z.string().optional().describe('Description of what to build'),
  }, async ({ components: names, scenario }) => {
    try {
      logToolCall('generate_snippet', { components: names })
      const comps = names.map(n => getComponent(n)).filter(Boolean)
      if (comps.length === 0) return { content: [{ type: 'text' as const, text: 'No valid components found.' }] }

      // Deduplicate imports by package path
      const importSet = new Set(comps.map(c => c!.importStatement))
      const imports = Array.from(importSet).join('\n')

      // Build composable JSX — nest components logically
      const jsxParts: string[] = []
      for (const comp of comps) {
        if (!comp) continue
        const c = comp
        // Use first example if available, otherwise build from props
        if (c.examples.length > 0) {
          // Extract just the JSX from the example, skip import lines
          const exampleCode = c.examples[0].code
          const jsxOnly = exampleCode.split('\n').filter(line => !line.startsWith('import ')).join('\n').trim()
          jsxParts.push(jsxOnly)
        } else {
          // Build minimal valid JSX from required props
          const requiredProps = c.props.filter(p => p.required)
          const propStr = requiredProps.map(p => {
            if (p.type.includes('|')) {
              const match = p.type.match(/'([^']*)'/)
              if (match) return `${p.name}="${match[1]}"`
            }
            if (p.type.includes('string')) return `${p.name}="${p.name}"`
            if (p.type.includes('number')) return `${p.name}={0}`
            if (p.type.includes('boolean')) return p.name
            if (p.type.includes('=>') || p.type.includes('Function') || p.type.includes('function')) return `${p.name}={() => {}}`
            if (p.type.includes('[]') || p.type.includes('Array')) return `${p.name}={[]}`
            if (p.type.includes('Record') || p.type.includes('object') || p.type.trimStart().startsWith('{')) return `${p.name}={{}}`
            return `${p.name}={undefined}`
          }).join(' ')
          const hasChildren = c.props.some(p => p.name === 'children')
          jsxParts.push(hasChildren
            ? `<${c.name} ${propStr}>${c.name} content</${c.name}>`
            : `<${c.name} ${propStr} />`)
        }
      }

      const indent = '        '
      const snippet = jsxParts.join(`\n${indent}`)
      const code = `// Required CSS imports — add to your root layout:
// import '@annondeveloper/ui-kit/css/theme.css'
// import '@annondeveloper/ui-kit/css/all.css'

${imports}
import { UIProvider } from '@annondeveloper/ui-kit'

export function ${scenario ? scenario.replace(/[^a-zA-Z0-9]/g, '').slice(0, 30) || 'Example' : 'Example'}() {
  return (
    <UIProvider>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        ${snippet}
      </div>
    </UIProvider>
  )
}`

      const notes = [
        `Components used: ${comps.map(c => c!.name).join(', ')}`,
        comps.some(c => c!.tier.includes('premium')) ? 'Tip: Import from "@annondeveloper/ui-kit/premium" for enhanced animations' : '',
        'Output is wrapped in <UIProvider> for theme and motion support',
      ].filter(Boolean).join('\n')

      return { content: [{ type: 'text' as const, text: `# Generated Snippet${scenario ? `: ${scenario}` : ''}\n\n\`\`\`tsx\n${code}\n\`\`\`\n\n## Notes\n${notes}` }] }
    } catch (error) {
      console.error('[ui-kit-mcp]', 'generate_snippet', error)
      return { content: [{ type: 'text' as const, text: `Error in generate_snippet: ${(error as Error).message}` }], isError: true }
    }
  })

  // Tool 5: get_theme
  server.tool('get_theme', 'Get theme tokens and CSS for a named theme', {
    name: z.string().describe('Theme name: aurora, sunset, rose, amber, ocean, emerald, cyan, violet, fuchsia, slate, corporate, midnight, forest, wine, carbon'),
    mode: z.enum(['dark', 'light']).optional().default('dark').describe('Color mode'),
  }, async ({ name, mode }) => {
    try {
      logToolCall('get_theme', { query: `${name}-${mode}` })
      const reg = loadRegistry()
      const key = `${name}-${mode}`
      const theme = reg.themes[key] || reg.themes[name]
      if (!theme) return { content: [{ type: 'text' as const, text: `Theme "${name}" not found. Available: ${Object.keys(reg.themes).join(', ')}` }] }
      return { content: [{ type: 'text' as const, text: `# Theme: ${theme.name} (${mode})\n\nHex: \`${theme.hex}\`\n\n## CSS Tokens\n\`\`\`css\n${theme.css}\n\`\`\`\n\n## Usage\n\`\`\`tsx\nimport { applyTheme, generateTheme } from '@annondeveloper/ui-kit/theme'\n\nconst theme = generateTheme('${theme.hex}', '${mode}')\napplyTheme(theme)\n\`\`\`` }] }
    } catch (error) {
      console.error('[ui-kit-mcp]', 'get_theme', error)
      return { content: [{ type: 'text' as const, text: `Error in get_theme: ${(error as Error).message}` }], isError: true }
    }
  })

  // Tool 6: get_icons
  server.tool('get_icons', 'Browse built-in SVG icons', {
    search: z.string().optional().describe('Filter icons by name'),
  }, async ({ search }) => {
    try {
      logToolCall('get_icons', { query: search })
      const reg = loadRegistry()
      let icons = Object.values(reg.icons)
      if (search) icons = icons.filter(i => i.name.includes(search.toLowerCase()) || i.keywords.some(k => k.includes(search.toLowerCase())))
      const list = icons.map(i => `- **${i.name}** — \`<Icon name="${i.name}" />\``).join('\n')
      return { content: [{ type: 'text' as const, text: `# Icons (${icons.length})\n\nImport: \`import { Icon } from '@annondeveloper/ui-kit'\`\n\n${list}` }] }
    } catch (error) {
      console.error('[ui-kit-mcp]', 'get_icons', error)
      return { content: [{ type: 'text' as const, text: `Error in get_icons: ${(error as Error).message}` }], isError: true }
    }
  })

  // Tool 7: get_started — guided setup for novice users
  server.tool('get_started', 'Complete setup guide for new projects. Start here if you are using UI Kit for the first time.', {
    framework: z.enum(['nextjs', 'vite', 'remix', 'cra', 'other']).optional().default('nextjs').describe('Your framework'),
  }, async ({ framework }) => {
    try {
      logToolCall('get_started', { query: framework })

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
    } catch (error) {
      console.error('[ui-kit-mcp]', 'get_started', error)
      return { content: [{ type: 'text' as const, text: `Error: ${(error as Error).message}` }], isError: true }
    }
  })

  // Tool 8: get_page_template — full page scaffolds with proper layout
  server.tool('get_page_template', 'Get a complete, working page scaffold with proper layout and spacing. Returns production-ready code.', {
    template: z.enum([
      'dashboard', 'settings', 'list', 'detail', 'empty', 'auth', 'landing'
    ]).describe('Page template type'),
    tier: z.enum(['standard', 'lite', 'premium']).optional().default('standard').describe('Component tier'),
  }, async ({ template, tier }) => {
    try {
      logToolCall('get_page_template', { query: `${template}-${tier}` })

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
    } catch (error) {
      console.error('[ui-kit-mcp]', 'get_page_template', error)
      return { content: [{ type: 'text' as const, text: `Error: ${(error as Error).message}` }], isError: true }
    }
  })

  // Resources: component://
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
    if (!comp) return { contents: [{ uri: uri.href, mimeType: 'text/plain', text: `Component "${name}" not found` }] }
    const propsDoc = comp.props.map(p => `- \`${p.name}${p.required ? '' : '?'}: ${p.type}\` ${p.default ? `(default: ${p.default})` : ''} — ${p.description}`).join('\n')
    return { contents: [{ uri: uri.href, mimeType: 'text/markdown', text: `# ${comp.name}\n\n${comp.description}\n\n## Import\n\`\`\`tsx\n${comp.importStatement}\n\`\`\`\n\n## Props\n${propsDoc}\n\n## Examples\n${comp.examples.map(e => `\`\`\`tsx\n${e.code}\n\`\`\``).join('\n\n')}` }] }
  })

  return server
}
