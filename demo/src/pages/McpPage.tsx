'use client'

import { useState, useMemo } from 'react'
import { css } from '@ui/core/styles/css-tag'
import { useStyles } from '@ui/core/styles/use-styles'
import { Icon } from '@ui/core/icons/icon'
import { iconPaths } from '@ui/core/icons/paths'
import { Button } from '@ui/components/button'
import { Card } from '@ui/components/card'
import { Badge } from '@ui/components/badge'
import { FormInput } from '@ui/components/form-input'
import { Select } from '@ui/components/select'
import { CopyBlock } from '@ui/domain/copy-block'
import { Tabs, TabPanel } from '@ui/components/tabs'
import { themes, type ThemeName } from '@ui/core/tokens/themes'
import { getComponentDatabase, searchComponents, type ComponentInfo } from '../utils/component-database'

// ─── Simulated MCP Data ────────────────────────────────────────────────────

const CATEGORIES = [
  { value: '', label: 'All Categories' },
  { value: 'primitives', label: 'Primitives' },
  { value: 'forms', label: 'Forms' },
  { value: 'navigation', label: 'Navigation' },
  { value: 'layout', label: 'Layout' },
  { value: 'overlays', label: 'Overlays' },
  { value: 'data-display', label: 'Data Display' },
  { value: 'monitoring', label: 'Monitoring' },
  { value: 'infrastructure', label: 'Infrastructure' },
  { value: 'visual-effects', label: 'Visual Effects' },
  { value: 'ai-realtime', label: 'AI & Realtime' },
]

const TIERS = [
  { value: '', label: 'All Tiers' },
  { value: 'standard', label: 'Standard' },
  { value: 'lite', label: 'Lite' },
  { value: 'premium', label: 'Premium' },
]

const THEME_NAMES: ThemeName[] = [
  'aurora', 'sunset', 'rose', 'amber', 'ocean', 'emerald',
  'cyan', 'violet', 'fuchsia', 'slate', 'corporate',
  'midnight', 'forest', 'wine', 'carbon',
]

const THEME_HEX: Record<ThemeName, string> = {
  aurora: '#6366f1', sunset: '#f97316', rose: '#f43f5e', amber: '#f59e0b',
  ocean: '#0ea5e9', emerald: '#10b981', cyan: '#06b6d4', violet: '#8b5cf6',
  fuchsia: '#d946ef', slate: '#64748b', corporate: '#1e40af', midnight: '#312e81',
  forest: '#065f46', wine: '#881337', carbon: '#27272a',
}

const SCENARIOS = [
  { value: 'basic', label: 'Basic Usage' },
  { value: 'form', label: 'Form Layout' },
  { value: 'dashboard', label: 'Dashboard Card' },
  { value: 'settings', label: 'Settings Panel' },
]

const ALL_ICONS = Object.keys(iconPaths)

// ─── Styles ──────────────────────────────────────────────────────────────────

const styles = css`
  @layer demo {
    .mcp-page {
      max-width: 1100px;
      margin: 0 auto;
    }

    /* ── Hero ─────────────────────────────────────────────────── */
    .mcp-hero {
      margin-block-end: 3rem;
    }

    .mcp-hero__badge {
      display: inline-flex;
      margin-block-end: 0.75rem;
    }

    .mcp-hero__title {
      font-size: clamp(1.75rem, 3.5vw, 2.5rem);
      font-weight: 800;
      letter-spacing: -0.025em;
      margin-block-end: 0.5rem;
      background: linear-gradient(135deg, var(--brand, oklch(65% 0.2 270)), var(--brand-light, oklch(75% 0.2 300)));
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
      text-wrap: balance;
    }

    .mcp-hero__desc {
      font-size: var(--text-sm, 0.875rem);
      color: var(--text-secondary);
      max-width: 680px;
      line-height: 1.6;
    }

    /* ── Section ─────────────────────────────────────────────── */
    .mcp-section {
      margin-block-end: 3rem;
    }

    .mcp-section__header {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      margin-block-end: 1.25rem;
    }

    .mcp-section__title {
      font-size: var(--text-lg, 1.125rem);
      font-weight: 700;
      letter-spacing: -0.01em;
    }

    /* ── Tool Cards Grid ─────────────────────────────────────── */
    .mcp-tools {
      display: grid;
      grid-template-columns: 1fr;
      gap: 1.5rem;
    }

    .mcp-tool {
      padding: 1.25rem;
    }

    .mcp-tool__header {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      margin-block-end: 0.5rem;
    }

    .mcp-tool__icon {
      width: 2.25rem;
      height: 2.25rem;
      border-radius: var(--radius-md, 0.5rem);
      background: var(--brand-subtle, oklch(65% 0.2 270 / 0.08));
      display: grid;
      place-items: center;
      color: var(--brand, oklch(65% 0.2 270));
      flex-shrink: 0;
    }

    .mcp-tool__name {
      font-size: 0.9375rem;
      font-weight: 700;
      font-family: 'SF Mono', 'Fira Code', monospace;
      color: var(--text-primary);
    }

    .mcp-tool__desc {
      font-size: var(--text-sm, 0.875rem);
      color: var(--text-secondary);
      margin-block-end: 1rem;
      line-height: 1.5;
    }

    .mcp-tool__panel {
      border-radius: var(--radius-md, 0.5rem);
      background: var(--bg-base, oklch(8% 0.02 270));
      border: 1px solid var(--border-subtle);
      padding: 1rem;
    }

    .mcp-tool__controls {
      display: flex;
      gap: 0.75rem;
      flex-wrap: wrap;
      margin-block-end: 0.75rem;
      align-items: flex-end;
    }

    .mcp-tool__controls > * {
      flex: 1;
      min-width: 140px;
    }

    .mcp-tool__result {
      font-size: 0.8125rem;
      font-family: 'SF Mono', 'Fira Code', monospace;
      color: var(--text-secondary);
      background: var(--bg-surface, oklch(12% 0.015 270));
      border: 1px solid var(--border-subtle);
      border-radius: var(--radius-sm, 0.375rem);
      padding: 0.75rem;
      max-height: 300px;
      overflow-y: auto;
      white-space: pre-wrap;
      word-break: break-word;
      line-height: 1.5;
    }

    .mcp-tool__result-empty {
      color: var(--text-tertiary);
      font-style: italic;
    }

    /* ── Component List from tool ─────────────────────────────── */
    .mcp-comp-list {
      list-style: none;
      padding: 0;
      margin: 0;
      display: flex;
      flex-direction: column;
      gap: 0.375rem;
    }

    .mcp-comp-list__item {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.375rem 0.5rem;
      border-radius: var(--radius-sm, 0.375rem);
      font-size: 0.8125rem;
      transition: background 0.15s;
    }

    .mcp-comp-list__item:hover {
      background: var(--bg-elevated, oklch(16% 0.02 270));
    }

    .mcp-comp-list__name {
      font-weight: 600;
      color: var(--text-primary);
    }

    .mcp-comp-list__cat {
      color: var(--text-tertiary);
      font-size: 0.75rem;
    }

    /* ── Icon Grid ──────────────────────────────────────────── */
    .mcp-icon-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(5rem, 1fr));
      gap: 0.5rem;
    }

    .mcp-icon-item {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 0.25rem;
      padding: 0.5rem;
      border-radius: var(--radius-sm, 0.375rem);
      transition: background 0.15s;
      cursor: default;
    }

    .mcp-icon-item:hover {
      background: var(--bg-elevated, oklch(16% 0.02 270));
    }

    .mcp-icon-item__label {
      font-size: 0.625rem;
      color: var(--text-tertiary);
      text-align: center;
      word-break: break-all;
    }

    /* ── Architecture Diagram ─────────────────────────────────── */
    .mcp-arch {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0;
      flex-wrap: wrap;
      padding: 2rem 1rem;
    }

    .mcp-arch__node {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 0.5rem;
      padding: 1rem 1.5rem;
      border-radius: var(--radius-md, 0.5rem);
      border: 1px solid var(--border-default);
      background: var(--bg-surface, oklch(12% 0.015 270));
      min-width: 120px;
      text-align: center;
    }

    .mcp-arch__node--active {
      border-color: var(--brand, oklch(65% 0.2 270));
      background: var(--brand-subtle, oklch(65% 0.2 270 / 0.08));
    }

    .mcp-arch__node-label {
      font-size: 0.8125rem;
      font-weight: 600;
      color: var(--text-primary);
    }

    .mcp-arch__node-desc {
      font-size: 0.6875rem;
      color: var(--text-tertiary);
    }

    .mcp-arch__arrow {
      font-size: 1.5rem;
      color: var(--text-tertiary);
      padding: 0 0.75rem;
      user-select: none;
    }

    /* ── Setup Guide ──────────────────────────────────────────── */
    .mcp-setup {
      display: flex;
      flex-direction: column;
      gap: 1.25rem;
    }

    .mcp-setup__step {
      display: flex;
      gap: 0.75rem;
    }

    .mcp-setup__num {
      width: 1.75rem;
      height: 1.75rem;
      border-radius: 50%;
      background: var(--brand-subtle, oklch(65% 0.2 270 / 0.08));
      color: var(--brand, oklch(65% 0.2 270));
      display: grid;
      place-items: center;
      font-size: 0.75rem;
      font-weight: 700;
      flex-shrink: 0;
    }

    .mcp-setup__content {
      flex: 1;
      min-width: 0;
    }

    .mcp-setup__label {
      font-size: 0.875rem;
      font-weight: 600;
      color: var(--text-primary);
      margin-block-end: 0.375rem;
    }

    .mcp-setup__detail {
      font-size: 0.8125rem;
      color: var(--text-secondary);
      margin-block-end: 0.5rem;
    }

    /* ── Token Preview ─────────────────────────────────────────── */
    .mcp-token-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
      gap: 0.5rem;
    }

    .mcp-token-item {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.5rem;
      border-radius: var(--radius-sm, 0.375rem);
      background: var(--bg-base, oklch(8% 0.02 270));
      border: 1px solid var(--border-subtle);
    }

    .mcp-token-swatch {
      width: 1.5rem;
      height: 1.5rem;
      border-radius: var(--radius-xs, 0.25rem);
      border: 1px solid var(--border-default);
      flex-shrink: 0;
    }

    .mcp-token-info {
      min-width: 0;
    }

    .mcp-token-name {
      font-size: 0.6875rem;
      font-weight: 600;
      color: var(--text-primary);
      font-family: 'SF Mono', 'Fira Code', monospace;
    }

    .mcp-token-value {
      font-size: 0.625rem;
      color: var(--text-tertiary);
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    @media (max-width: 640px) {
      .mcp-arch {
        flex-direction: column;
      }
      .mcp-arch__arrow {
        transform: rotate(90deg);
        padding: 0.25rem 0;
      }
    }
  }
`

// ─── Tool Definitions ────────────────────────────────────────────────────────

interface ToolDef {
  id: string
  name: string
  icon: string
  description: string
}

const TOOLS: ToolDef[] = [
  {
    id: 'list_components',
    name: 'list_components',
    icon: 'menu',
    description: 'List all UI Kit components, optionally filtered by category or tier. Returns names, categories, descriptions, and import paths.',
  },
  {
    id: 'get_component',
    name: 'get_component',
    icon: 'file',
    description: 'Get full API documentation for a specific component -- every prop, type, default, example, accessibility notes, and related components.',
  },
  {
    id: 'search_components',
    name: 'search_components',
    icon: 'search',
    description: 'Search components by natural language use-case or keyword. Returns ranked results with relevance scores.',
  },
  {
    id: 'generate_snippet',
    name: 'generate_snippet',
    icon: 'code',
    description: 'Generate working TSX code using UI Kit components. Builds correct imports, props, and composition from the actual API.',
  },
  {
    id: 'get_theme',
    name: 'get_theme',
    icon: 'settings',
    description: 'Get theme tokens and ready-to-paste CSS for any of the 15 named themes. Supports dark and light modes.',
  },
  {
    id: 'get_icons',
    name: 'get_icons',
    icon: 'image',
    description: 'Browse all 50+ built-in SVG icons. Search by name or keyword to find the right icon.',
  },
]

// ─── Simulated Tool Responses ────────────────────────────────────────────────

function simulateListComponents(category: string, tier: string): ComponentInfo[] {
  let db = getComponentDatabase()
  if (category) db = db.filter(c => c.category === category)
  // Tier filter - since the demo database doesn't have tier info, show all for any tier
  return db
}

function simulateGetComponent(name: string): string {
  const db = getComponentDatabase()
  const comp = db.find(c => c.name.toLowerCase() === name.toLowerCase())
  if (!comp) return `Component "${name}" not found. Try: ${db.slice(0, 5).map(c => c.name).join(', ')}...`

  return `# ${comp.name}

${comp.description}

## Import
\`\`\`tsx
import { ${comp.name} } from '${comp.importPath}'
\`\`\`

## Props
${comp.props.map(p => `- \`${p}\``).join('\n')}

## Example
\`\`\`tsx
${comp.example}
\`\`\`

**Category:** ${comp.category}`
}

function simulateSearchComponents(query: string): ComponentInfo[] {
  return searchComponents(query)
}

function simulateGenerateSnippet(compName: string, scenario: string): string {
  const db = getComponentDatabase()
  const comp = db.find(c => c.name.toLowerCase() === compName.toLowerCase())
  if (!comp) return '// Component not found'

  const wrapperName = scenario === 'form' ? 'FormExample' :
    scenario === 'dashboard' ? 'DashboardCard' :
    scenario === 'settings' ? 'SettingsPanel' : 'Example'

  return `import { ${comp.name} } from '${comp.importPath}'

export function ${wrapperName}() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      ${comp.example}
    </div>
  )
}`
}

function simulateGetTheme(name: ThemeName): Record<string, string> {
  const t = themes[name]
  return t as unknown as Record<string, string>
}

// ─── Component ───────────────────────────────────────────────────────────────

export default function McpPage() {
  useStyles('mcp-page', styles)

  // Tool 1: list_components state
  const [listCategory, setListCategory] = useState('')
  const [listTier, setListTier] = useState('')
  const [listResult, setListResult] = useState<ComponentInfo[] | null>(null)

  // Tool 2: get_component state
  const [getCompName, setGetCompName] = useState('')
  const [getCompResult, setGetCompResult] = useState('')

  // Tool 3: search_components state
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResult, setSearchResult] = useState<ComponentInfo[] | null>(null)

  // Tool 4: generate_snippet state
  const [snippetComp, setSnippetComp] = useState('')
  const [snippetScenario, setSnippetScenario] = useState('basic')
  const [snippetResult, setSnippetResult] = useState('')

  // Tool 5: get_theme state
  const [themeName, setThemeName] = useState<ThemeName>('aurora')
  const [themeResult, setThemeResult] = useState<Record<string, string> | null>(null)

  // Tool 6: get_icons state
  const [iconSearch, setIconSearch] = useState('')
  const filteredIcons = useMemo(() => {
    if (!iconSearch.trim()) return ALL_ICONS
    const q = iconSearch.toLowerCase()
    return ALL_ICONS.filter(name => name.includes(q))
  }, [iconSearch])

  // Setup tabs
  const [setupTab, setSetupTab] = useState('claude')

  const setupTabs = [
    { id: 'claude', label: 'Claude Code' },
    { id: 'cursor', label: 'Cursor' },
    { id: 'vscode', label: 'VS Code' },
    { id: 'npx', label: 'npx' },
  ]

  const claudeConfig = `{
  "mcpServers": {
    "ui-kit": {
      "command": "node",
      "args": ["/path/to/ui-kit/dist/mcp/index.js"]
    }
  }
}`

  const cursorConfig = `// .cursor/mcp.json
{
  "mcpServers": {
    "ui-kit": {
      "command": "node",
      "args": ["/path/to/ui-kit/dist/mcp/index.js"]
    }
  }
}`

  const vscodeConfig = `// .vscode/settings.json
{
  "mcp.servers": {
    "ui-kit": {
      "command": "node",
      "args": ["/path/to/ui-kit/dist/mcp/index.js"]
    }
  }
}`

  const npxConfig = `# After npm publish, use npx:
npx @annondeveloper/ui-kit-mcp

# Or for SSE (team-shared) mode:
npx @annondeveloper/ui-kit-mcp --sse --port 3100`

  return (
    <div className="mcp-page">
      {/* ── Hero ──────────────────────────────────────────────── */}
      <section className="mcp-hero">
        <div className="mcp-hero__badge">
          <Badge variant="info" color="blue">MCP Server</Badge>
        </div>
        <h1 className="mcp-hero__title">MCP Server Integration</h1>
        <p className="mcp-hero__desc">
          The Model Context Protocol (MCP) lets AI assistants like Claude, Cursor, and Copilot
          talk directly to the UI Kit component registry. Instead of guessing APIs, the AI reads
          ground truth -- every prop, type, default, example, and theme token -- and generates
          correct, working code. No other React UI library ships an MCP server.
        </p>
      </section>

      {/* ── Architecture Diagram ──────────────────────────────── */}
      <section className="mcp-section">
        <div className="mcp-section__header">
          <Icon name="activity" size="sm" />
          <h2 className="mcp-section__title">Architecture</h2>
        </div>
        <Card padding="md">
          <div className="mcp-arch">
            <div className="mcp-arch__node">
              <Icon name="terminal" size="md" />
              <span className="mcp-arch__node-label">AI Assistant</span>
              <span className="mcp-arch__node-desc">Claude, Cursor, Copilot</span>
            </div>
            <span className="mcp-arch__arrow">&rarr;</span>
            <div className="mcp-arch__node mcp-arch__node--active">
              <Icon name="zap" size="md" />
              <span className="mcp-arch__node-label">MCP Protocol</span>
              <span className="mcp-arch__node-desc">JSON-RPC over stdio/SSE</span>
            </div>
            <span className="mcp-arch__arrow">&rarr;</span>
            <div className="mcp-arch__node mcp-arch__node--active">
              <Icon name="code" size="md" />
              <span className="mcp-arch__node-label">UI Kit Server</span>
              <span className="mcp-arch__node-desc">6 tools + resources</span>
            </div>
            <span className="mcp-arch__arrow">&rarr;</span>
            <div className="mcp-arch__node">
              <Icon name="bar-chart" size="md" />
              <span className="mcp-arch__node-label">Component Registry</span>
              <span className="mcp-arch__node-desc">154 components, 15 themes</span>
            </div>
          </div>
        </Card>
      </section>

      {/* ── Tool Explorer ──────────────────────────────────────── */}
      <section className="mcp-section">
        <div className="mcp-section__header">
          <Icon name="search" size="sm" />
          <h2 className="mcp-section__title">Tool Explorer</h2>
          <Badge variant="info" size="sm">6 tools</Badge>
        </div>

        <div className="mcp-tools">
          {/* ─ Tool 1: list_components ─ */}
          <Card className="mcp-tool" padding="none">
            <div style={{ padding: '1.25rem' }}>
              <div className="mcp-tool__header">
                <div className="mcp-tool__icon"><Icon name="menu" size="sm" /></div>
                <span className="mcp-tool__name">list_components</span>
              </div>
              <p className="mcp-tool__desc">{TOOLS[0].description}</p>
              <div className="mcp-tool__panel">
                <div className="mcp-tool__controls">
                  <Select
                    name="mcp-category"
                    label="Category"
                    options={CATEGORIES}
                    value={listCategory}
                    onChange={(v) => setListCategory(v as string)}
                    placeholder="All Categories"
                  />
                  <Select
                    name="mcp-tier"
                    label="Tier"
                    options={TIERS}
                    value={listTier}
                    onChange={(v) => setListTier(v as string)}
                    placeholder="All Tiers"
                  />
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => setListResult(simulateListComponents(listCategory, listTier))}
                    style={{ alignSelf: 'flex-end' }}
                  >
                    Try it
                  </Button>
                </div>
                {listResult && (
                  <div className="mcp-tool__result">
                    <ul className="mcp-comp-list">
                      {listResult.map(c => (
                        <li key={c.name} className="mcp-comp-list__item">
                          <span className="mcp-comp-list__name">{c.name}</span>
                          <Badge variant="info" size="sm">{c.category}</Badge>
                          <span className="mcp-comp-list__cat">-- {c.description.slice(0, 60)}...</span>
                        </li>
                      ))}
                    </ul>
                    <div style={{ marginTop: '0.5rem', color: 'var(--text-tertiary)', fontSize: '0.75rem' }}>
                      {listResult.length} component{listResult.length !== 1 ? 's' : ''} found
                    </div>
                  </div>
                )}
                {!listResult && (
                  <div className="mcp-tool__result mcp-tool__result-empty">
                    Select filters and click "Try it" to see the response.
                  </div>
                )}
              </div>
            </div>
          </Card>

          {/* ─ Tool 2: get_component ─ */}
          <Card className="mcp-tool" padding="none">
            <div style={{ padding: '1.25rem' }}>
              <div className="mcp-tool__header">
                <div className="mcp-tool__icon"><Icon name="file" size="sm" /></div>
                <span className="mcp-tool__name">get_component</span>
              </div>
              <p className="mcp-tool__desc">{TOOLS[1].description}</p>
              <div className="mcp-tool__panel">
                <div className="mcp-tool__controls">
                  <FormInput
                    name="mcp-comp-name"
                    label="Component Name"
                    placeholder="e.g. Button, Card, DataTable"
                    value={getCompName}
                    onChange={(e) => setGetCompName((e.target as HTMLInputElement).value)}
                  />
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => setGetCompResult(simulateGetComponent(getCompName))}
                    style={{ alignSelf: 'flex-end' }}
                  >
                    Try it
                  </Button>
                </div>
                {getCompResult ? (
                  <div className="mcp-tool__result">{getCompResult}</div>
                ) : (
                  <div className="mcp-tool__result mcp-tool__result-empty">
                    Enter a component name and click "Try it" to see the full API docs.
                  </div>
                )}
              </div>
            </div>
          </Card>

          {/* ─ Tool 3: search_components ─ */}
          <Card className="mcp-tool" padding="none">
            <div style={{ padding: '1.25rem' }}>
              <div className="mcp-tool__header">
                <div className="mcp-tool__icon"><Icon name="search" size="sm" /></div>
                <span className="mcp-tool__name">search_components</span>
              </div>
              <p className="mcp-tool__desc">{TOOLS[2].description}</p>
              <div className="mcp-tool__panel">
                <div className="mcp-tool__controls">
                  <FormInput
                    name="mcp-search"
                    label="Search Query"
                    placeholder='e.g. "date selection", "loading state", "chart data"'
                    value={searchQuery}
                    onChange={(e) => setSearchQuery((e.target as HTMLInputElement).value)}
                  />
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => setSearchResult(simulateSearchComponents(searchQuery))}
                    style={{ alignSelf: 'flex-end' }}
                  >
                    Try it
                  </Button>
                </div>
                {searchResult ? (
                  <div className="mcp-tool__result">
                    {searchResult.length === 0 ? (
                      <span>No results found for "{searchQuery}"</span>
                    ) : (
                      <ul className="mcp-comp-list">
                        {searchResult.map((c, i) => (
                          <li key={c.name} className="mcp-comp-list__item">
                            <Badge variant="info" size="sm">{i + 1}</Badge>
                            <span className="mcp-comp-list__name">{c.name}</span>
                            <span className="mcp-comp-list__cat">-- {c.description.slice(0, 80)}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                ) : (
                  <div className="mcp-tool__result mcp-tool__result-empty">
                    Enter a natural language search and click "Try it".
                  </div>
                )}
              </div>
            </div>
          </Card>

          {/* ─ Tool 4: generate_snippet ─ */}
          <Card className="mcp-tool" padding="none">
            <div style={{ padding: '1.25rem' }}>
              <div className="mcp-tool__header">
                <div className="mcp-tool__icon"><Icon name="code" size="sm" /></div>
                <span className="mcp-tool__name">generate_snippet</span>
              </div>
              <p className="mcp-tool__desc">{TOOLS[3].description}</p>
              <div className="mcp-tool__panel">
                <div className="mcp-tool__controls">
                  <FormInput
                    name="mcp-snippet-comp"
                    label="Component"
                    placeholder="e.g. Button, Card, MetricCard"
                    value={snippetComp}
                    onChange={(e) => setSnippetComp((e.target as HTMLInputElement).value)}
                  />
                  <Select
                    name="mcp-scenario"
                    label="Scenario"
                    options={SCENARIOS}
                    value={snippetScenario}
                    onChange={(v) => setSnippetScenario(v as string)}
                  />
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => setSnippetResult(simulateGenerateSnippet(snippetComp, snippetScenario))}
                    style={{ alignSelf: 'flex-end' }}
                  >
                    Try it
                  </Button>
                </div>
                {snippetResult ? (
                  <CopyBlock code={snippetResult} language="typescript" />
                ) : (
                  <div className="mcp-tool__result mcp-tool__result-empty">
                    Enter a component name, choose a scenario, and click "Try it".
                  </div>
                )}
              </div>
            </div>
          </Card>

          {/* ─ Tool 5: get_theme ─ */}
          <Card className="mcp-tool" padding="none">
            <div style={{ padding: '1.25rem' }}>
              <div className="mcp-tool__header">
                <div className="mcp-tool__icon"><Icon name="settings" size="sm" /></div>
                <span className="mcp-tool__name">get_theme</span>
              </div>
              <p className="mcp-tool__desc">{TOOLS[4].description}</p>
              <div className="mcp-tool__panel">
                <div className="mcp-tool__controls">
                  <Select
                    name="mcp-theme"
                    label="Theme"
                    options={THEME_NAMES.map(n => ({ value: n, label: n.charAt(0).toUpperCase() + n.slice(1) }))}
                    value={themeName}
                    onChange={(v) => setThemeName(v as ThemeName)}
                  />
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => setThemeResult(simulateGetTheme(themeName))}
                    style={{ alignSelf: 'flex-end' }}
                  >
                    Try it
                  </Button>
                </div>
                {themeResult ? (
                  <div>
                    <div style={{ marginBlockEnd: '0.5rem', fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>
                      Theme: {themeName} | Hex: {THEME_HEX[themeName]}
                    </div>
                    <div className="mcp-token-grid">
                      {Object.entries(themeResult).map(([key, value]) => (
                        <div key={key} className="mcp-token-item">
                          <div
                            className="mcp-token-swatch"
                            style={{ background: value }}
                          />
                          <div className="mcp-token-info">
                            <div className="mcp-token-name">{key.replace(/([A-Z])/g, '-$1').toLowerCase()}</div>
                            <div className="mcp-token-value">{value}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="mcp-tool__result mcp-tool__result-empty">
                    Select a theme and click "Try it" to see its tokens.
                  </div>
                )}
              </div>
            </div>
          </Card>

          {/* ─ Tool 6: get_icons ─ */}
          <Card className="mcp-tool" padding="none">
            <div style={{ padding: '1.25rem' }}>
              <div className="mcp-tool__header">
                <div className="mcp-tool__icon"><Icon name="image" size="sm" /></div>
                <span className="mcp-tool__name">get_icons</span>
              </div>
              <p className="mcp-tool__desc">{TOOLS[5].description}</p>
              <div className="mcp-tool__panel">
                <div className="mcp-tool__controls">
                  <FormInput
                    name="mcp-icon-search"
                    label="Search Icons"
                    placeholder="e.g. arrow, check, alert"
                    value={iconSearch}
                    onChange={(e) => setIconSearch((e.target as HTMLInputElement).value)}
                  />
                </div>
                <div className="mcp-icon-grid">
                  {filteredIcons.slice(0, 48).map(name => (
                    <div key={name} className="mcp-icon-item">
                      <Icon name={name as any} size="md" />
                      <span className="mcp-icon-item__label">{name}</span>
                    </div>
                  ))}
                </div>
                {filteredIcons.length > 48 && (
                  <div style={{ marginTop: '0.5rem', fontSize: '0.75rem', color: 'var(--text-tertiary)', textAlign: 'center' }}>
                    ...and {filteredIcons.length - 48} more
                  </div>
                )}
                {filteredIcons.length === 0 && (
                  <div className="mcp-tool__result mcp-tool__result-empty">
                    No icons match "{iconSearch}".
                  </div>
                )}
              </div>
            </div>
          </Card>
        </div>
      </section>

      {/* ── Setup Guide ────────────────────────────────────────── */}
      <section className="mcp-section">
        <div className="mcp-section__header">
          <Icon name="settings" size="sm" />
          <h2 className="mcp-section__title">Setup Guide</h2>
        </div>

        <Card padding="lg">
          <div className="mcp-setup">
            <div className="mcp-setup__step">
              <div className="mcp-setup__num">1</div>
              <div className="mcp-setup__content">
                <div className="mcp-setup__label">Install the MCP Server</div>
                <div className="mcp-setup__detail">
                  The MCP server ships with the ui-kit package. Run the setup command:
                </div>
                <CopyBlock code="npx @annondeveloper/ui-kit mcp" language="bash" />
              </div>
            </div>

            <div className="mcp-setup__step">
              <div className="mcp-setup__num">2</div>
              <div className="mcp-setup__content">
                <div className="mcp-setup__label">Configure Your AI Tool</div>
                <div className="mcp-setup__detail">
                  Add the MCP server configuration to your AI assistant. Choose your tool:
                </div>
                <Tabs
                  tabs={setupTabs}
                  activeTab={setupTab}
                  onChange={setSetupTab}
                  variant="pills"
                  size="sm"
                >
                  <TabPanel tabId="claude">
                    <div style={{ marginTop: '0.75rem' }}>
                      <div className="mcp-setup__detail">
                        Add to <code>~/.claude/settings.json</code>:
                      </div>
                      <CopyBlock code={claudeConfig} language="json" />
                    </div>
                  </TabPanel>
                  <TabPanel tabId="cursor">
                    <div style={{ marginTop: '0.75rem' }}>
                      <div className="mcp-setup__detail">
                        Add to <code>.cursor/mcp.json</code> in your project:
                      </div>
                      <CopyBlock code={cursorConfig} language="json" />
                    </div>
                  </TabPanel>
                  <TabPanel tabId="vscode">
                    <div style={{ marginTop: '0.75rem' }}>
                      <div className="mcp-setup__detail">
                        Add to your VS Code settings:
                      </div>
                      <CopyBlock code={vscodeConfig} language="json" />
                    </div>
                  </TabPanel>
                  <TabPanel tabId="npx">
                    <div style={{ marginTop: '0.75rem' }}>
                      <div className="mcp-setup__detail">
                        After the package is published to npm, use npx directly:
                      </div>
                      <CopyBlock code={npxConfig} language="bash" />
                    </div>
                  </TabPanel>
                </Tabs>
              </div>
            </div>

            <div className="mcp-setup__step">
              <div className="mcp-setup__num">3</div>
              <div className="mcp-setup__content">
                <div className="mcp-setup__label">Start Using</div>
                <div className="mcp-setup__detail">
                  Restart your AI tool. The 6 tools appear automatically. Ask your AI:
                </div>
                <CopyBlock
                  code={`"Search for a date component using ui-kit"
"Generate a dashboard with MetricCard and TimeSeriesChart"
"What props does the DataTable component accept?"
"Show me the aurora theme CSS tokens"`}
                  language="text"
                />
              </div>
            </div>
          </div>
        </Card>
      </section>

      {/* ── Remote / SSE Mode ──────────────────────────────────── */}
      <section className="mcp-section">
        <div className="mcp-section__header">
          <Icon name="link" size="sm" />
          <h2 className="mcp-section__title">Team Mode (SSE)</h2>
          <Badge variant="info" size="sm">Optional</Badge>
        </div>
        <Card padding="lg">
          <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBlockEnd: '1rem', lineHeight: 1.6 }}>
            Run the MCP server as an HTTP service for team-shared access. Multiple team members
            can point to the same URL. Useful for teams that want a shared, always-up-to-date MCP endpoint.
          </p>
          <CopyBlock
            code={`# Start SSE server
node dist/mcp/index.js --sse --port 3100

# Connect from any MCP client
{
  "mcpServers": {
    "ui-kit": {
      "url": "http://your-server:3100/sse"
    }
  }
}

# Health check
curl http://localhost:3100/health
# Returns: {"status":"ok","sessions":0}`}
            language="bash"
          />
        </Card>
      </section>
    </div>
  )
}
