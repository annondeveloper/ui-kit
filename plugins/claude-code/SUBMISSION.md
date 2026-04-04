# Claude Code Plugin Submission

**Submit at:** https://claude.ai/settings/plugins/submit or https://platform.claude.com/plugins/submit

## Plugin Details

- **Name:** ui-kit
- **Source:** https://github.com/annondeveloper/ui-kit.git
- **Directory:** plugins/claude-code
- **Version:** 1.0.0
- **Author:** annondeveloper

## Description

Native Claude Code integration for @annondeveloper/ui-kit — a zero-dependency React component library with 147 components, 3 weight tiers, physics-based animations, and OKLCH color system. Gives Claude deep awareness of the library's components, design patterns, and conventions.

Includes 5 skills for component discovery, code generation, design system reference, tier selection, and accessibility auditing. 2 custom agents for architecture design and accessibility review. Auto-connects to a hosted MCP server with 6 tools.

## Example Use Cases

### 1. Finding the right component
**User says:** "I need a component for selecting dates with a range"
**What happens:** Claude loads the `component-finder` skill, searches the registry, and recommends `DatePicker` and `DateRangePicker` with their exact props, import paths, and tier availability.

### 2. Building a dashboard
**User says:** "Build me a monitoring dashboard with CPU, memory, and network metrics"
**What happens:** Claude loads `generate-component` skill, uses the MCP `generate_snippet` tool, and produces working TSX:
```tsx
import { UIProvider, MetricCard, TimeSeriesChart, ThresholdGauge } from '@annondeveloper/ui-kit'

function Dashboard() {
  return (
    <UIProvider>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
        <MetricCard title="CPU" value="87.4%" trend="up" status="warning" sparkline={[65,70,72,80,85,87]} />
        <MetricCard title="Memory" value="12.3 GB" trend="flat" status="ok" />
        <MetricCard title="Network" value="1.2 Gbps" trend="down" status="ok" />
      </div>
      <TimeSeriesChart series={series} height={300} />
    </UIProvider>
  )
}
```

### 3. Choosing the right weight tier
**User says:** "My app needs to be under 50KB, which tier should I use?"
**What happens:** Claude loads `tier-guide` skill and recommends Lite tier (0.3-1.2 KB per component, CSS-only) with import path `@annondeveloper/ui-kit/lite`.

### 4. Accessibility auditing
**User says:** "Check if my form is accessible"
**What happens:** Claude loads `audit-accessibility` skill, reads the component code, and checks against WCAG AA criteria: proper labels, keyboard navigation, contrast ratios, ARIA attributes, touch targets, and motion respect.

### 5. Learning the design system
**User says:** "How do colors work in this library?"
**What happens:** Claude loads `design-system` skill and explains the OKLCH color system with relative color syntax, CSS custom properties, and the `generateTheme()` API.

### 6. Architecture design (agent)
**User says:** "Design the component architecture for a settings page"
**What happens:** The `component-architect` agent activates, considers the available components, suggests a layout using AppShell + Tabs + FormInput + ToggleSwitch + Select, recommends tiers per component, and produces a component tree with working code.

### 7. Deep accessibility review (agent)
**User says:** "Do an accessibility review of my entire app"
**What happens:** The `accessibility-reviewer` agent reads all component files, checks semantic HTML, ARIA patterns, keyboard navigation, contrast ratios, touch targets, and motion handling, producing a report with Critical/Warning/Info findings.

## What Makes This Plugin Unique

1. **First component library with a native Claude Code plugin** — not just docs, but structured skills and agents
2. **Auto-connected MCP server** — 6 tools for programmatic component access, hosted on Cloudflare Workers
3. **Zero dependencies** — the plugin is pure Markdown + JSON, no npm install needed
4. **Design system awareness** — teaches Claude about OKLCH colors, Aurora Fluid design, physics animations
5. **Accessibility-first** — dedicated audit skill and agent with UI Kit-specific WCAG checks
