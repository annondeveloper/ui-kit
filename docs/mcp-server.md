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

### 2. `get_component`
Get full API documentation for a single component — props table, examples, accessibility notes, related components.

| Parameter | Type | Description |
|-----------|------|-------------|
| `name` | string | Component name, e.g. "Button" or "Calendar" |

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
