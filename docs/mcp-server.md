# MCP Server

UI Kit ships a Model Context Protocol server that gives AI assistants direct access to the component library — docs, props, examples, themes, and code generation.

## Setup

```bash
npx @annondeveloper/ui-kit mcp
```

This auto-detects your AI assistant (Claude Desktop, Claude Code, or Cursor) and writes the MCP configuration. See `docs/guides/mcp-setup.md` for manual configuration and troubleshooting.

## Transports

- **stdio** (default) — used by Claude Desktop and Claude Code
- **SSE** — HTTP-based transport for web integrations, runs on a configurable port with session management, CORS support, and idle session cleanup (30-minute timeout)

## Tools

### 1. `list_components`
Browse all components with optional filters.

| Parameter | Type | Description |
|-----------|------|-------------|
| `category` | string? | Filter by category (e.g. "layout", "input") |
| `tier` | string? | Filter by tier: "standard", "lite", or "premium" |

Every response includes the CSS setup reminder and the full component list with tier/category metadata.

### 2. `get_component`
Get full API documentation for a single component — props table, examples, accessibility notes, related components.

| Parameter | Type | Description |
|-----------|------|-------------|
| `name` | string | Component name, e.g. "Button" or "Calendar" |

**Fuzzy matching:** If the exact name isn't found, the server suggests similar names using substring matching and edit distance. For example, asking for "Buton" returns suggestions like "Button", "ButtonGroup".

Every response includes the CSS setup note and the design best practices guide (layout patterns, spacing rules, color tokens, motion, accessibility).

### 3. `search_components`
Natural language search across components by use-case or keyword.

| Parameter | Type | Description |
|-----------|------|-------------|
| `query` | string | Search query, e.g. "date selection with range" |
| `limit` | number? | Max results (default: 10) |

### 4. `generate_snippet`
Generate working TSX code with correct imports for one or more components.

| Parameter | Type | Description |
|-----------|------|-------------|
| `components` | string[] | Component names to use |
| `scenario` | string? | Description of what to build |

### 5. `get_theme`
Get theme tokens and CSS for any of 15 built-in themes.

| Parameter | Type | Description |
|-----------|------|-------------|
| `name` | string | Theme name (aurora, sunset, ocean, emerald, etc.) |
| `mode` | "dark" \| "light" | Color mode (default: "dark") |

### 6. `get_icons`
Browse the built-in SVG icon set.

| Parameter | Type | Description |
|-----------|------|-------------|
| `search` | string? | Filter icons by name or keyword |

### 7. `get_started`
Complete setup guide for new projects. Start here if using UI Kit for the first time.

| Parameter | Type | Description |
|-----------|------|-------------|
| `framework` | "nextjs" \| "vite" \| "remix" \| "cra" \| "other" | Your framework (default: "nextjs") |

Returns a step-by-step guide covering installation, CSS imports (with the correct entry file for your framework), UIProvider setup, first component example, weight tier overview, and theming. Also lists next-step tool recommendations.

### 8. `get_page_template`
Get a complete, working page scaffold with proper layout and spacing. Returns production-ready, copy-paste code.

| Parameter | Type | Description |
|-----------|------|-------------|
| `template` | enum | Page type (see below) |
| `tier` | "standard" \| "lite" \| "premium" | Component tier (default: "standard") |

**7 templates:**

| Template | Description |
|----------|-------------|
| `dashboard` | Stats overview + content sections with StatsGrid, Toolbar, ListLayout, CardGrid |
| `settings` | Form sections with SectionHeader, Card, FormInput, ToggleSwitch, save actions |
| `list` | Searchable, filterable list with Toolbar, SearchInput, Pagination |
| `detail` | Single item view with breadcrumbs, CardGrid, PropertyList |
| `empty` | Empty state page with EmptyState component and CTA |
| `auth` | Centered login/signup form with Card and FormInput |
| `landing` | Hero section + feature cards + CTA buttons |

Each template includes:
- CSS imports at the top (so the output works immediately)
- UIProvider wrapper
- Correct import path for the selected tier
- Layout component reference table
- CSS setup reminder

## Design Guide in Responses

The `get_component` tool appends a design best practices guide to every response, covering:

- **Layout pattern** — always wrap pages with `<PageShell>`, use layout primitives
- **Spacing rules** — use layout components instead of manual margins
- **Responsive design** — all layout components are responsive by default
- **Color & theme** — use semantic tokens (`var(--text-primary)`), never hardcoded hex
- **Typography** — use PageHeader/SectionHeader for fluid sizing
- **Motion** — components respect `prefers-reduced-motion` automatically
- **Accessibility** — WCAG AA contrast, ARIA attributes, keyboard nav are built-in
- **Common patterns** — dashboard, settings, list view, detail view component trees

## CSS Setup Note

Every tool that returns component code includes this reminder:

> **Required CSS Setup** — Add these imports to your root layout:
> ```tsx
> import '@annondeveloper/ui-kit/css/theme.css'
> import '@annondeveloper/ui-kit/css/all.css'
> ```
> Without these imports, components will render with correct HTML/ARIA but no visual styling.

This appears in responses from `list_components`, `get_component`, `generate_snippet`, and `get_page_template`.

## Resource URIs

The server exposes components as MCP resources using the `component://` URI scheme:

```
component://Button
component://Calendar
component://DataTable
```

Each resource returns a Markdown document with the component's description, import statement, props, and examples. Clients can list all available resources to discover the full component catalog.

## Analytics

Tool usage is logged locally (opt-in via `UI_KIT_TELEMETRY=1`) to `~/.ui-kit/analytics.jsonl`. View aggregated stats with:

```bash
npx @annondeveloper/ui-kit stats
```

This shows total tool calls, calls by tool name, and the most-requested components.

## Source

- Server: `src/mcp/server.ts`
- Transports: `src/mcp/transports/stdio.ts`, `src/mcp/transports/sse.ts`
- Analytics: `src/mcp/analytics.ts`
- Setup guide: `docs/guides/mcp-setup.md`
