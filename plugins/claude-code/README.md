# @annondeveloper/ui-kit — Claude Code Plugin

Native Claude Code integration for the ui-kit component library. Gives Claude deep awareness of 147 components, the Aurora Fluid design system, and project conventions.

## Install

```bash
claude plugin add annondeveloper/ui-kit --path plugins/claude-code
```

Or clone and use locally:

```bash
git clone https://github.com/annondeveloper/ui-kit.git
claude --plugin-dir ui-kit/plugins/claude-code
```

## What You Get

### Skills (invoke with `/ui-kit:*`)

| Skill | Trigger | What it does |
|-------|---------|-------------|
| `/ui-kit:component-finder` | "find a component for..." | Searches 147 components by name, feature, or use case |
| `/ui-kit:generate-component` | "build a dashboard..." | Generates production TSX with correct imports and conventions |
| `/ui-kit:design-system` | "how do colors work?" | Explains OKLCH, motion levels, Aurora Fluid, CSS architecture |
| `/ui-kit:tier-guide` | "which tier should I use?" | Recommends Lite/Standard/Premium based on requirements |
| `/ui-kit:audit-accessibility` | "check my component" | Audits for WCAG AA, keyboard nav, ARIA, touch targets |

### Agents

| Agent | Purpose |
|-------|---------|
| `component-architect` | Designs multi-component layouts and page architectures |
| `accessibility-reviewer` | Deep accessibility review with UI Kit-specific checks |

### MCP Server (auto-connected)

The plugin auto-connects to the hosted MCP server at `ui-kit-mcp.annondeveloper.workers.dev`, giving Claude programmatic access to:
- `list_components` — browse all components
- `get_component` — full API reference
- `search_components` — semantic search
- `generate_snippet` — working TSX generation
- `get_theme` — OKLCH theme tokens
- `get_icons` — 50+ SVG icons

### Hooks

- **SessionStart** — announces available skills on session start

## No Dependencies

The plugin is pure Markdown + JSON. No npm install, no build step, no runtime. Just install and go.
