'use client'

import { useState, useMemo } from 'react'
import { css } from '@ui/core/styles/css-tag'
import { useStyles } from '@ui/core/styles/use-styles'
import { Icon } from '@ui/core/icons/icon'
import { Button } from '@ui/components/button'
import { Card } from '@ui/components/card'
import { Badge } from '@ui/components/badge'
import { FormInput } from '@ui/components/form-input'
import { CopyBlock } from '@ui/domain/copy-block'
import { searchComponents, type ComponentInfo } from '../utils/component-database'

// ─── AI Assistant Configs ────────────────────────────────────────────────────

interface AssistantConfig {
  id: string
  name: string
  logoChar: string
  connectionType: string
  badgeVariant: string
  steps: string[]
  config: string
  configLang: string
}

const ASSISTANT_CONFIGS: AssistantConfig[] = [
  {
    id: 'claude',
    name: 'Claude Code',
    logoChar: 'C',
    connectionType: 'Full Plugin',
    badgeVariant: 'success',
    steps: [
      'Install: npm i -g @anthropic-ai/claude-code',
      'Run: npx @annondeveloper/ui-kit mcp',
      'Plugin auto-detected -- 5 skills + 2 agents available',
    ],
    config: `// ~/.claude/plugins/ui-kit/plugin.json
{
  "name": "ui-kit",
  "mcpServers": {
    "ui-kit": {
      "command": "node",
      "args": ["./dist/mcp/index.js"]
    }
  },
  "skills": [
    "component-finder",
    "generate-component",
    "design-system",
    "tier-guide",
    "audit-accessibility"
  ]
}`,
    configLang: 'json',
  },
  {
    id: 'claude-desktop',
    name: 'Claude Desktop',
    logoChar: 'D',
    connectionType: 'MCP Config',
    badgeVariant: 'info',
    steps: [
      'Open Claude Desktop settings',
      'Add MCP server config below',
      'Restart Claude Desktop',
    ],
    config: `// ~/Library/Application Support/Claude/claude_desktop_config.json
{
  "mcpServers": {
    "ui-kit": {
      "command": "npx",
      "args": ["-y", "@annondeveloper/ui-kit", "mcp", "--stdio"]
    }
  }
}`,
    configLang: 'json',
  },
  {
    id: 'cursor',
    name: 'Cursor',
    logoChar: '{',
    connectionType: '.cursor/mcp.json',
    badgeVariant: 'info',
    steps: [
      'Create .cursor/mcp.json in your project root',
      'Paste the config below',
      'Restart Cursor -- tools appear in Composer',
    ],
    config: `// .cursor/mcp.json
{
  "mcpServers": {
    "ui-kit": {
      "command": "npx",
      "args": ["-y", "@annondeveloper/ui-kit", "mcp", "--stdio"]
    }
  }
}`,
    configLang: 'json',
  },
  {
    id: 'vscode',
    name: 'VS Code / Copilot',
    logoChar: 'V',
    connectionType: '.vscode/mcp.json',
    badgeVariant: 'info',
    steps: [
      'Create .vscode/mcp.json in your project',
      'Paste the config below',
      'Open Copilot Chat -- MCP tools auto-discovered',
    ],
    config: `// .vscode/mcp.json
{
  "servers": {
    "ui-kit": {
      "type": "stdio",
      "command": "npx",
      "args": ["-y", "@annondeveloper/ui-kit", "mcp", "--stdio"]
    }
  }
}`,
    configLang: 'json',
  },
  {
    id: 'windsurf',
    name: 'Windsurf',
    logoChar: 'W',
    connectionType: 'MCP Settings',
    badgeVariant: 'info',
    steps: [
      'Open Windsurf > Settings > MCP',
      'Add a new server with the config below',
      'Cascade will discover all 6 tools',
    ],
    config: `// Windsurf MCP Settings
{
  "mcpServers": {
    "ui-kit": {
      "command": "npx",
      "args": ["-y", "@annondeveloper/ui-kit", "mcp", "--stdio"]
    }
  }
}`,
    configLang: 'json',
  },
  {
    id: 'codex',
    name: 'Codex CLI',
    logoChar: 'X',
    connectionType: '~/.codex/config.json',
    badgeVariant: 'info',
    steps: [
      'Create or edit ~/.codex/config.json',
      'Add the MCP server entry below',
      'Run codex -- it picks up the server automatically',
    ],
    config: `// ~/.codex/config.json
{
  "mcpServers": {
    "ui-kit": {
      "command": "npx",
      "args": ["-y", "@annondeveloper/ui-kit", "mcp", "--stdio"]
    }
  }
}`,
    configLang: 'json',
  },
]

// ─── Generated Code Samples ─────────────────────────────────────────────────

const GENERATED_LOGIN_CODE = `import { Card } from '@annondeveloper/ui-kit'
import { FormInput } from '@annondeveloper/ui-kit'
import { Button } from '@annondeveloper/ui-kit'
import { PasswordInput } from '@annondeveloper/ui-kit'

export function LoginForm() {
  return (
    <Card padding="lg" style={{ maxWidth: 400 }}>
      <h2>Sign In</h2>
      <FormInput name="email" label="Email" type="email"
        placeholder="you@company.com" />
      <PasswordInput name="password" label="Password" />
      <Button variant="primary" fullWidth>
        Sign In
      </Button>
    </Card>
  )
}`

// ─── Use Cases ──────────────────────────────────────────────────────────────

const USE_CASES = [
  {
    prompt: '"Build me a dashboard with key metrics"',
    lang: 'typescript',
    result: `import { MetricCard } from '@annondeveloper/ui-kit'
import { TimeSeriesChart } from '@annondeveloper/ui-kit'

export function Dashboard() {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
      <MetricCard label="Revenue" value="$48.2K" trend={12.5} icon="bar-chart" />
      <MetricCard label="Users" value="2,847" trend={-3.1} icon="users" />
      <MetricCard label="Uptime" value="99.97%" trend={0.02} icon="activity" />
      <div style={{ gridColumn: 'span 3' }}>
        <TimeSeriesChart data={revenueData} height={280} />
      </div>
    </div>
  )
}`,
  },
  {
    prompt: '"Find a date picker component"',
    lang: 'json',
    result: `[
  { "name": "DatePicker", "tier": "premium", "score": 0.98,
    "description": "Full-featured date picker with calendar dropdown, range selection, presets" },
  { "name": "DateRangePicker", "tier": "premium", "score": 0.91,
    "description": "Select date ranges with start/end, presets, comparison mode" },
  { "name": "Calendar", "tier": "premium", "score": 0.85,
    "description": "Inline calendar with single/range/multi selection, events" },
  { "name": "TimePicker", "tier": "standard", "score": 0.62,
    "description": "Time selection with hour/minute/AM-PM, 12 and 24h modes" }
]`,
  },
  {
    prompt: '"Audit my form for accessibility"',
    lang: 'text',
    result: `Accessibility Audit -- LoginForm
================================
PASS  [contrast]    Text contrast 7.2:1 exceeds AA (4.5:1)
PASS  [keyboard]    Tab order: email -> password -> submit (correct)
PASS  [labels]      All inputs have associated <label> elements
WARN  [target]      Submit button 38px tall -- recommend 44px minimum
FAIL  [live-region] No aria-live for form validation errors
PASS  [focus]       Focus ring visible on all interactive elements
PASS  [semantics]   Using <form> with role="form"

Score: 5/7 passing | 1 warning | 1 failure
Fix: Add aria-live="polite" to validation message container`,
  },
  {
    prompt: '"Which tier for a mobile-first app?"',
    lang: 'text',
    result: `Tier Recommendation: Lite
=========================
Rationale:
- Mobile-first = bundle size critical (< 2KB per component)
- Lite tier: ~20 lines each, zero motion overhead
- No spring physics or aurora glow needed on mobile
- CSS-only animations via @starting-style fallback
- Tree-shakes to ~0.5KB per component gzipped

If you later need animations on tablet/desktop:
  -> Import Standard tier for those breakpoints
  -> Use <ContainerQuery> to swap tiers dynamically

Example:
  import { Button } from '@annondeveloper/ui-kit/lite'  // 0.4KB
  vs
  import { Button } from '@annondeveloper/ui-kit'        // 1.8KB`,
  },
]

// ─── Styles ──────────────────────────────────────────────────────────────────

const styles = css`
  @layer demo {
    .ai-plugins-page {
      max-width: 1100px;
      margin: 0 auto;
    }

    /* ── Hero ─────────────────────────────────────────────────── */
    .ai-hero {
      margin-block-end: 3rem;
      position: relative;
    }

    .ai-hero__aurora {
      position: absolute;
      inset: -40% -30%;
      z-index: -1;
      pointer-events: none;
      background:
        radial-gradient(ellipse 50% 40% at 30% 35%, oklch(50% 0.22 270 / 0.12), transparent 70%),
        radial-gradient(ellipse 45% 50% at 70% 45%, oklch(55% 0.2 310 / 0.10), transparent 70%),
        radial-gradient(ellipse 60% 35% at 50% 70%, oklch(60% 0.16 200 / 0.08), transparent 70%);
      filter: blur(60px);
      animation: ai-aurora-drift 18s ease-in-out infinite alternate;
    }

    @keyframes ai-aurora-drift {
      0% { transform: translate(0, 0) scale(1); opacity: 0.7; }
      100% { transform: translate(-8px, 6px) scale(1.04); opacity: 1; }
    }

    .ai-hero__badge {
      display: inline-flex;
      margin-block-end: 0.75rem;
    }

    .ai-hero__title {
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

    .ai-hero__desc {
      font-size: var(--text-sm, 0.875rem);
      color: var(--text-secondary);
      max-width: 680px;
      line-height: 1.6;
    }

    /* ── Section ─────────────────────────────────────────────── */
    .ai-section {
      margin-block-end: 3rem;
    }

    .ai-section__header {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      margin-block-end: 1.25rem;
    }

    .ai-section__title {
      font-size: var(--text-lg, 1.125rem);
      font-weight: 700;
      letter-spacing: -0.01em;
    }

    /* ── AI Assistant Setup Cards ─────────────────────────────── */
    .ai-assistant-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
      gap: 1rem;
    }

    .ai-assistant-card {
      position: relative;
      overflow: hidden;
    }

    .ai-assistant-card::before {
      content: '';
      position: absolute;
      inset: 0;
      border-radius: inherit;
      background: linear-gradient(135deg, oklch(65% 0.15 270 / 0.04), oklch(70% 0.15 300 / 0.02));
      pointer-events: none;
    }

    .ai-assistant__header {
      display: flex;
      align-items: center;
      gap: 0.625rem;
      margin-block-end: 0.75rem;
    }

    .ai-assistant__logo {
      width: 2.5rem;
      height: 2.5rem;
      border-radius: var(--radius-md, 0.5rem);
      display: grid;
      place-items: center;
      flex-shrink: 0;
      font-size: 1.125rem;
      font-weight: 800;
      color: oklch(95% 0 0);
    }

    .ai-assistant__logo--claude { background: linear-gradient(135deg, oklch(60% 0.2 30), oklch(65% 0.22 15)); }
    .ai-assistant__logo--claude-desktop { background: linear-gradient(135deg, oklch(55% 0.18 25), oklch(60% 0.2 40)); }
    .ai-assistant__logo--cursor { background: linear-gradient(135deg, oklch(45% 0.02 270), oklch(55% 0.03 270)); }
    .ai-assistant__logo--vscode { background: linear-gradient(135deg, oklch(55% 0.18 250), oklch(60% 0.2 230)); }
    .ai-assistant__logo--windsurf { background: linear-gradient(135deg, oklch(60% 0.18 170), oklch(65% 0.2 155)); }
    .ai-assistant__logo--codex { background: linear-gradient(135deg, oklch(50% 0.15 145), oklch(60% 0.17 130)); }

    .ai-assistant__name {
      font-size: 0.9375rem;
      font-weight: 700;
      color: var(--text-primary);
    }

    .ai-assistant__steps {
      list-style: none;
      padding: 0;
      margin: 0 0 0.75rem 0;
      display: flex;
      flex-direction: column;
      gap: 0.375rem;
    }

    .ai-assistant__step {
      display: flex;
      align-items: flex-start;
      gap: 0.5rem;
      font-size: 0.8125rem;
      color: var(--text-secondary);
      line-height: 1.45;
    }

    .ai-assistant__step-num {
      color: var(--brand, oklch(65% 0.2 270));
      font-weight: 700;
      font-size: 0.6875rem;
      flex-shrink: 0;
      margin-top: 0.1rem;
    }

    /* ── Plugin Skills in Action ─────────────────────────────── */
    .ai-skills-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
      gap: 1rem;
    }

    .ai-skill-card {
      position: relative;
      overflow: hidden;
    }

    .ai-skill-card::before {
      content: '';
      position: absolute;
      inset: 0;
      border-radius: inherit;
      background: linear-gradient(160deg, oklch(65% 0.12 270 / 0.06), transparent 60%);
      pointer-events: none;
    }

    .ai-skill__cmd {
      font-family: 'SF Mono', 'Fira Code', monospace;
      font-size: 0.6875rem;
      color: var(--brand, oklch(65% 0.2 270));
      background: var(--brand-subtle, oklch(65% 0.2 270 / 0.08));
      padding: 0.125rem 0.5rem;
      border-radius: var(--radius-xs, 0.25rem);
      display: inline-block;
      margin-block-end: 0.5rem;
    }

    .ai-skill__title {
      font-size: 0.9375rem;
      font-weight: 700;
      color: var(--text-primary);
      margin-block-end: 0.25rem;
    }

    .ai-skill__desc {
      font-size: 0.8125rem;
      color: var(--text-secondary);
      margin-block-end: 0.75rem;
      line-height: 1.45;
    }

    .ai-skill__demo {
      border-radius: var(--radius-md, 0.5rem);
      background: var(--bg-base, oklch(8% 0.02 270));
      border: 1px solid var(--border-subtle);
      padding: 0.75rem;
      font-size: 0.8125rem;
    }

    .ai-skill__search-results {
      list-style: none;
      padding: 0;
      margin: 0.5rem 0 0;
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
    }

    .ai-skill__search-item {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.25rem 0.5rem;
      border-radius: var(--radius-xs, 0.25rem);
      background: var(--bg-surface, oklch(12% 0.015 270));
    }

    .ai-skill__search-name {
      font-weight: 600;
      color: var(--text-primary);
      font-size: 0.75rem;
    }

    .ai-skill__search-cat {
      font-size: 0.6875rem;
      color: var(--text-tertiary);
    }

    .ai-motion-levels {
      display: flex;
      gap: 0.5rem;
      flex-wrap: wrap;
    }

    .ai-motion-chip {
      display: flex;
      align-items: center;
      gap: 0.375rem;
      padding: 0.375rem 0.625rem;
      border-radius: var(--radius-sm, 0.375rem);
      background: var(--bg-surface, oklch(12% 0.015 270));
      border: 1px solid var(--border-subtle);
      font-size: 0.75rem;
      color: var(--text-primary);
    }

    .ai-motion-chip--active {
      border-color: var(--brand, oklch(65% 0.2 270));
      background: var(--brand-subtle, oklch(65% 0.2 270 / 0.08));
    }

    .ai-motion-dot {
      width: 0.5rem;
      height: 0.5rem;
      border-radius: 50%;
      background: var(--brand, oklch(65% 0.2 270));
    }

    .ai-motion-dot--animate {
      animation: ai-pulse 1.5s ease-in-out infinite;
    }

    @keyframes ai-pulse {
      0%, 100% { transform: scale(1); opacity: 0.6; }
      50% { transform: scale(1.5); opacity: 1; }
    }

    .ai-decision-tree {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }

    .ai-decision-node {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.375rem 0.625rem;
      border-radius: var(--radius-sm, 0.375rem);
      font-size: 0.75rem;
      color: var(--text-primary);
    }

    .ai-decision-node--q {
      background: var(--brand-subtle, oklch(65% 0.2 270 / 0.08));
      font-weight: 600;
    }

    .ai-decision-node--a {
      margin-inline-start: 1.5rem;
      background: var(--bg-surface, oklch(12% 0.015 270));
      border: 1px solid var(--border-subtle);
    }

    .ai-audit-list {
      list-style: none;
      padding: 0;
      margin: 0;
      display: flex;
      flex-direction: column;
      gap: 0.375rem;
    }

    .ai-audit-item {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.25rem 0.5rem;
      border-radius: var(--radius-xs, 0.25rem);
      font-size: 0.75rem;
      background: var(--bg-surface, oklch(12% 0.015 270));
    }

    .ai-audit-dot {
      width: 0.5rem;
      height: 0.5rem;
      border-radius: 50%;
      flex-shrink: 0;
    }

    .ai-audit-dot--pass { background: oklch(72% 0.19 155); }
    .ai-audit-dot--warn { background: oklch(75% 0.18 85); }
    .ai-audit-dot--fail { background: oklch(65% 0.22 25); }

    /* ── Use Case Gallery ─────────────────────────────────────── */
    .ai-usecase-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(480px, 1fr));
      gap: 1rem;
    }

    .ai-usecase-card {
      position: relative;
      overflow: hidden;
    }

    .ai-usecase-card::before {
      content: '';
      position: absolute;
      inset: 0;
      border-radius: inherit;
      background: linear-gradient(145deg, oklch(60% 0.12 270 / 0.05), oklch(70% 0.1 300 / 0.03));
      pointer-events: none;
    }

    .ai-usecase__label {
      font-size: 0.6875rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      color: var(--brand, oklch(65% 0.2 270));
      margin-block-end: 0.5rem;
    }

    .ai-usecase__prompt {
      font-family: 'SF Mono', 'Fira Code', monospace;
      font-size: 0.8125rem;
      color: oklch(85% 0 0);
      background: oklch(0% 0 0 / 0.35);
      border: 1px solid oklch(100% 0 0 / 0.06);
      border-radius: var(--radius-sm, 0.375rem);
      padding: 0.625rem 0.75rem;
      margin-block-end: 0.75rem;
      backdrop-filter: blur(4px);
    }

    .ai-usecase__result-label {
      font-size: 0.6875rem;
      font-weight: 600;
      color: oklch(72% 0.19 155);
      text-transform: uppercase;
      letter-spacing: 0.05em;
      margin-block-end: 0.375rem;
      display: flex;
      align-items: center;
      gap: 0.375rem;
    }

    .ai-usecase__result-label::before {
      content: '';
      width: 0.375rem;
      height: 0.375rem;
      border-radius: 50%;
      background: oklch(72% 0.19 155);
    }

    @media (max-width: 640px) {
      .ai-assistant-grid {
        grid-template-columns: 1fr;
      }
      .ai-skills-grid {
        grid-template-columns: 1fr;
      }
      .ai-usecase-grid {
        grid-template-columns: 1fr;
      }
    }
  }
`

// ─── Component ───────────────────────────────────────────────────────────────

export default function AiPluginsPage() {
  useStyles('ai-plugins-page', styles)

  // Skill demos state
  const [skillSearch, setSkillSearch] = useState('')
  const skillSearchResults = useMemo(() => {
    if (!skillSearch.trim() || skillSearch.trim().length < 2) return [] as ComponentInfo[]
    return searchComponents(skillSearch).slice(0, 6)
  }, [skillSearch])

  const [skillGenPrompt, setSkillGenPrompt] = useState('')

  return (
    <div className="ai-plugins-page">
      {/* ── Hero ──────────────────────────────────────────────── */}
      <section className="ai-hero">
        <div className="ai-hero__aurora" aria-hidden="true" />
        <div className="ai-hero__badge">
          <Badge variant="primary" size="sm" dot pulse>AI Integrations</Badge>
        </div>
        <h1 className="ai-hero__title">AI Plugins &amp; Integrations</h1>
        <p className="ai-hero__desc">
          The first React component library your AI can use natively. Connect Claude, Cursor, Copilot,
          Windsurf, or Codex to 178 components via MCP — the AI reads ground truth (every prop, type,
          default, example, theme token) and generates correct, working code.
        </p>

        {/* Hosted MCP quick connect */}
        <div style={{
          background: 'oklch(0% 0 0 / 0.3)',
          border: '1px solid oklch(100% 0 0 / 0.08)',
          borderRadius: '0.75rem',
          padding: '1rem 1.25rem',
          maxWidth: '560px',
          margin: '1.5rem auto 0',
          backdropFilter: 'blur(8px)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
            <span style={{ color: 'oklch(72% 0.19 155)', fontSize: '0.75rem' }}>{'●'}</span>
            <span style={{ fontSize: '0.75rem', color: 'oklch(70% 0 0)', fontWeight: 600, textTransform: 'uppercase' as const, letterSpacing: '0.05em' }}>Hosted MCP — connect in 10 seconds</span>
          </div>
          <code style={{
            display: 'block',
            fontFamily: "'SF Mono', 'Fira Code', monospace",
            fontSize: '0.8125rem',
            color: 'oklch(85% 0 0)',
            lineHeight: 1.5,
            wordBreak: 'break-all' as const,
          }}>https://ui-kit-mcp.annondeveloper.workers.dev/sse</code>
          <p style={{ margin: '0.5rem 0 0', fontSize: '0.75rem', color: 'oklch(55% 0 0)' }}>
            Add this URL to any MCP client config. No npm install needed. Works with Claude Code, Cursor, VS Code, Windsurf, Codex.
          </p>
        </div>

        {/* Plugin badges */}
        <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center', marginTop: '1rem', flexWrap: 'wrap' as const }}>
          <Badge variant="primary" size="sm">Claude Code Plugin</Badge>
          <Badge variant="info" size="sm">Cursor</Badge>
          <Badge variant="info" size="sm">VS Code</Badge>
          <Badge variant="info" size="sm">Windsurf</Badge>
          <Badge variant="info" size="sm">Codex CLI</Badge>
        </div>
      </section>

      {/* ── Claude Code Plugin Features ──────────────────────────── */}
      <section className="ai-section">
        <div className="ai-section__header">
          <Icon name="zap" size="sm" />
          <h2 className="ai-section__title">Claude Code Plugin</h2>
          <Badge variant="success" size="sm">5 Skills + 2 Agents</Badge>
        </div>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: '1rem' }}>
          The Claude Code plugin goes beyond MCP with skills Claude can invoke automatically, specialized agents, and session hooks.
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '0.75rem' }}>
          {[
            { cmd: '/ui-kit:component-finder', desc: 'Search 178 components by name or use case' },
            { cmd: '/ui-kit:generate-component', desc: 'Produce working TSX with correct imports' },
            { cmd: '/ui-kit:design-system', desc: 'Learn OKLCH, motion levels, Aurora Fluid' },
            { cmd: '/ui-kit:tier-guide', desc: 'Choose Lite / Standard / Premium' },
            { cmd: '/ui-kit:audit-accessibility', desc: 'Check WCAG AA compliance' },
            { cmd: 'component-architect', desc: 'Agent: designs multi-component layouts' },
            { cmd: 'accessibility-reviewer', desc: 'Agent: deep a11y review' },
          ].map(s => (
            <Card key={s.cmd} padding="sm" style={{ background: 'var(--bg-surface)' }}>
              <code style={{ fontSize: '0.75rem', color: 'var(--brand)', display: 'block', marginBottom: '0.25rem' }}>{s.cmd}</code>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{s.desc}</span>
            </Card>
          ))}
        </div>
      </section>

      {/* ── AI Assistant Setup ──────────────────────────────────── */}
      <section className="ai-section">
        <div className="ai-section__header">
          <Icon name="settings" size="sm" />
          <h2 className="ai-section__title">AI Assistant Setup</h2>
          <Badge variant="info" size="sm">6 assistants</Badge>
        </div>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: '1rem', lineHeight: 1.6 }}>
          One-click configuration for every major AI coding assistant. Each card shows the exact config
          you need -- copy it and you are connected to 178 components in seconds.
        </p>
        <div className="ai-assistant-grid">
          {ASSISTANT_CONFIGS.map(a => (
            <Card key={a.id} className="ai-assistant-card" padding="md" style={{ background: 'var(--bg-surface)' }}>
              <div className="ai-assistant__header">
                <div className={`ai-assistant__logo ai-assistant__logo--${a.id}`}>
                  {a.logoChar}
                </div>
                <div>
                  <div className="ai-assistant__name">{a.name}</div>
                  <Badge variant={a.badgeVariant as any} size="sm" style={{ marginTop: '0.125rem' }}>{a.connectionType}</Badge>
                </div>
              </div>
              <ol className="ai-assistant__steps">
                {a.steps.map((step, i) => (
                  <li key={i} className="ai-assistant__step">
                    <span className="ai-assistant__step-num">{i + 1}.</span>
                    <span>{step}</span>
                  </li>
                ))}
              </ol>
              <CopyBlock code={a.config} language={a.configLang as any} />
            </Card>
          ))}
        </div>
      </section>

      {/* ── Plugin Skills in Action ──────────────────────────────── */}
      <section className="ai-section">
        <div className="ai-section__header">
          <Icon name="zap" size="sm" />
          <h2 className="ai-section__title">Plugin Skills in Action</h2>
          <Badge variant="success" size="sm">5 skills</Badge>
        </div>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: '1rem', lineHeight: 1.6 }}>
          Each skill is a specialized capability your AI can invoke. Try the interactive demos below.
        </p>
        <div className="ai-skills-grid">
          {/* Skill 1: Component Finder */}
          <Card className="ai-skill-card" padding="md" style={{ background: 'var(--bg-surface)' }}>
            <div className="ai-skill__cmd">/ui-kit:component-finder</div>
            <div className="ai-skill__title">Component Finder</div>
            <div className="ai-skill__desc">
              Search 178 components by name or natural language use case. Try typing a query.
            </div>
            <div className="ai-skill__demo">
              <FormInput
                name="skill-search"
                label="Search"
                placeholder='Type "date picker" or "loading"...'
                value={skillSearch}
                onChange={(e) => setSkillSearch((e.target as HTMLInputElement).value)}
              />
              {skillSearchResults.length > 0 && (
                <ul className="ai-skill__search-results">
                  {skillSearchResults.slice(0, 4).map(c => (
                    <li key={c.name} className="ai-skill__search-item">
                      <span className="ai-skill__search-name">{c.name}</span>
                      <Badge variant="info" size="sm">{c.category}</Badge>
                      <span className="ai-skill__search-cat">{c.description.slice(0, 40)}...</span>
                    </li>
                  ))}
                </ul>
              )}
              {skillSearch.trim() && skillSearchResults.length === 0 && (
                <p style={{ margin: '0.5rem 0 0', fontSize: '0.75rem', color: 'var(--text-tertiary)', fontStyle: 'italic' }}>No results -- try a different query.</p>
              )}
            </div>
          </Card>

          {/* Skill 2: Code Generator */}
          <Card className="ai-skill-card" padding="md" style={{ background: 'var(--bg-surface)' }}>
            <div className="ai-skill__cmd">/ui-kit:generate-component</div>
            <div className="ai-skill__title">Code Generator</div>
            <div className="ai-skill__desc">
              Describe what you need and get working TSX with correct imports and props.
            </div>
            <div className="ai-skill__demo">
              <FormInput
                name="skill-gen-prompt"
                label="Prompt"
                placeholder='"Build a login form"'
                value={skillGenPrompt}
                onChange={(e) => setSkillGenPrompt((e.target as HTMLInputElement).value)}
              />
              {skillGenPrompt.trim().length > 3 && (
                <div style={{ marginTop: '0.5rem' }}>
                  <CopyBlock code={GENERATED_LOGIN_CODE} language="typescript" />
                </div>
              )}
            </div>
          </Card>

          {/* Skill 3: Design System */}
          <Card className="ai-skill-card" padding="md" style={{ background: 'var(--bg-surface)' }}>
            <div className="ai-skill__cmd">/ui-kit:design-system</div>
            <div className="ai-skill__title">Design System</div>
            <div className="ai-skill__desc">
              OKLCH color system, Aurora Fluid identity, and motion levels 0-3 with live previews.
            </div>
            <div className="ai-skill__demo">
              <div style={{ display: 'flex', gap: '0.375rem', flexWrap: 'wrap' as const, marginBottom: '0.75rem' }}>
                {['oklch(65% 0.2 270)', 'oklch(72% 0.19 155)', 'oklch(75% 0.18 85)', 'oklch(65% 0.22 25)', 'oklch(70% 0.17 200)'].map(c => (
                  <div key={c} style={{ display: 'flex', flexDirection: 'column' as const, alignItems: 'center', gap: '0.125rem' }}>
                    <div style={{ width: '2rem', height: '2rem', borderRadius: '0.375rem', background: c, border: '1px solid var(--border-subtle)' }} />
                    <span style={{ fontSize: '0.5625rem', color: 'var(--text-tertiary)', fontFamily: "'SF Mono', monospace" }}>{c.slice(5, -1)}</span>
                  </div>
                ))}
              </div>
              <div className="ai-motion-levels">
                {[
                  { level: 0, label: 'None', active: false },
                  { level: 1, label: 'Subtle', active: false },
                  { level: 2, label: 'Expressive', active: true },
                  { level: 3, label: 'Cinematic', active: false },
                ].map(m => (
                  <div key={m.level} className={`ai-motion-chip${m.active ? ' ai-motion-chip--active' : ''}`}>
                    <div className={`ai-motion-dot${m.level > 0 ? ' ai-motion-dot--animate' : ''}`} style={{ animationDuration: `${2 - m.level * 0.4}s` }} />
                    <span>{m.level}: {m.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </Card>

          {/* Skill 4: Tier Guide */}
          <Card className="ai-skill-card" padding="md" style={{ background: 'var(--bg-surface)' }}>
            <div className="ai-skill__cmd">/ui-kit:tier-guide</div>
            <div className="ai-skill__title">Tier Guide</div>
            <div className="ai-skill__desc">
              Decision tree to pick the right weight tier for your use case.
            </div>
            <div className="ai-skill__demo">
              <div className="ai-decision-tree">
                <div className="ai-decision-node ai-decision-node--q">Need animations?</div>
                <div className="ai-decision-node ai-decision-node--a">Yes &rarr; <Badge variant="primary" size="sm">Standard</Badge> or <Badge variant="info" size="sm">Premium</Badge></div>
                <div className="ai-decision-node ai-decision-node--a">No &rarr; <Badge variant="info" size="sm">Lite</Badge> (minimal, ~20 lines each)</div>
                <div className="ai-decision-node ai-decision-node--q">Need aurora glow / spring physics?</div>
                <div className="ai-decision-node ai-decision-node--a">Yes &rarr; <Badge variant="info" size="sm">Premium</Badge></div>
                <div className="ai-decision-node ai-decision-node--a">No &rarr; <Badge variant="primary" size="sm">Standard</Badge></div>
                <div className="ai-decision-node ai-decision-node--q">Bundle critical (&lt; 2KB)?</div>
                <div className="ai-decision-node ai-decision-node--a">Yes &rarr; <Badge variant="info" size="sm">Lite</Badge> (zero motion overhead)</div>
              </div>
            </div>
          </Card>

          {/* Skill 5: Accessibility Audit */}
          <Card className="ai-skill-card" padding="md" style={{ background: 'var(--bg-surface)' }}>
            <div className="ai-skill__cmd">/ui-kit:audit-accessibility</div>
            <div className="ai-skill__title">Accessibility Audit</div>
            <div className="ai-skill__desc">
              WCAG AA compliance check with color-coded findings on any component.
            </div>
            <div className="ai-skill__demo">
              <ul className="ai-audit-list">
                {[
                  { status: 'pass', label: 'Contrast ratio 7.2:1 (AAA)', detail: 'Text on bg-surface' },
                  { status: 'pass', label: 'Keyboard navigation', detail: 'Tab, Enter, Escape handled' },
                  { status: 'warn', label: 'Touch target 40px', detail: 'Recommend 44px minimum' },
                  { status: 'pass', label: 'ARIA labels present', detail: 'role="dialog" + aria-labelledby' },
                  { status: 'fail', label: 'Missing aria-live region', detail: 'Toast notifications need assertive' },
                  { status: 'pass', label: 'Focus trap active', detail: 'Modal traps focus correctly' },
                ].map((item, i) => (
                  <li key={i} className="ai-audit-item">
                    <span className={`ai-audit-dot ai-audit-dot--${item.status}`} />
                    <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{item.label}</span>
                    <span style={{ color: 'var(--text-tertiary)', marginInlineStart: 'auto' }}>{item.detail}</span>
                  </li>
                ))}
              </ul>
            </div>
          </Card>
        </div>
      </section>

      {/* ── Use Case Gallery ──────────────────────────────────── */}
      <section className="ai-section">
        <div className="ai-section__header">
          <Icon name="code" size="sm" />
          <h2 className="ai-section__title">Use Case Gallery</h2>
          <Badge variant="info" size="sm">Real prompts</Badge>
        </div>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: '1rem', lineHeight: 1.6 }}>
          Real prompts, real results. See what the AI plugin produces when you ask it naturally.
        </p>
        <div className="ai-usecase-grid">
          {USE_CASES.map((uc, i) => (
            <Card key={i} className="ai-usecase-card" padding="md" style={{ background: 'var(--bg-surface)' }}>
              <div className="ai-usecase__label">Use Case {i + 1}</div>
              <div className="ai-usecase__prompt">{uc.prompt}</div>
              <div className="ai-usecase__result-label">AI Response</div>
              <CopyBlock code={uc.result} language={uc.lang as any} />
            </Card>
          ))}
        </div>
      </section>
    </div>
  )
}
