# AI Integrations

Connect @annondeveloper/ui-kit to your AI coding assistant. All integrations use the same hosted MCP server — zero install, instant setup.

## Quick Connect

**Hosted MCP URL:** `https://ui-kit-mcp.annondeveloper.workers.dev/sse`

| Assistant | Config File | Guide |
|-----------|------------|-------|
| **Claude Code** | Plugin install | [Setup →](claude-code/README.md) |
| **Claude Desktop** | `claude_desktop_config.json` | Add MCP URL |
| **Cursor** | `.cursor/mcp.json` | [Setup →](cursor/README.md) |
| **VS Code / Copilot** | `.vscode/mcp.json` | [Setup →](vscode/README.md) |
| **Windsurf** | MCP settings | [Setup →](windsurf/README.md) |
| **Codex CLI** | `~/.codex/config.json` | [Setup →](codex/README.md) |
| **Any MCP Client** | — | Use the SSE URL above |

## What You Get

All integrations provide the same 6 tools:

| Tool | Description |
|------|-------------|
| `list_components` | Browse 147 components by category or tier |
| `get_component` | Full API reference — props, types, examples |
| `search_components` | Find components by use case |
| `generate_snippet` | Working TSX with correct imports |
| `get_theme` | OKLCH theme tokens and CSS |
| `get_icons` | 50+ built-in SVG icons |

## Claude Code Plugin (Enhanced)

The Claude Code plugin goes beyond MCP with:
- **5 skills** — component finder, code generator, design system guide, tier selector, a11y auditor
- **2 agents** — component architect, accessibility reviewer
- **Hooks** — session start announcement, convention reminders
- **Auto-MCP** — hosted server connected automatically

## Local Server

For offline use or custom hosting:

```bash
npm install @annondeveloper/ui-kit
npx @annondeveloper/ui-kit mcp              # stdio (Claude Code, Cursor)
npx @annondeveloper/ui-kit mcp --sse        # SSE (web clients)
```
