# MCP Setup Guide

## Quick Setup (30 seconds)

```bash
npx @annondeveloper/ui-kit mcp
```

This auto-detects your AI assistant (Claude Desktop, Claude Code, or Cursor) and configures the MCP server. You'll see a confirmation prompt showing exactly what will be written.

## What You Get

After setup, your AI assistant has access to 6 tools:

| Tool | What it does |
|------|-------------|
| `list_components` | Browse all 147 components, filter by category or tier |
| `get_component` | Get full API docs, props, examples for any component |
| `search_components` | Natural language search ("date picker with range selection") |
| `generate_snippet` | Generate working TSX code with correct imports |
| `get_theme` | Get theme tokens and CSS for any of 15 themes |
| `get_icons` | Browse 50+ built-in SVG icons |

## Try It

After setup, restart your AI assistant and try these prompts:

### Simple component
"Use ui-kit to create a Button with primary variant and a loading state"

### Dashboard layout
"Build a monitoring dashboard with 4 MetricCards showing CPU, Memory, Disk, and Network, plus a DataTable for recent alerts"

### Form
"Create a user registration form with email, password, and name fields using ui-kit's form engine"

### Full page
"Build a SaaS settings page with a Sidebar, Tabs for General/Security/Billing, and a Card-based layout"

## Manual Setup

If you prefer to configure manually, add this to your MCP config file:

### Claude Desktop

| OS | Config path |
|----|------------|
| macOS | `~/Library/Application Support/Claude/claude_desktop_config.json` |
| Linux | `~/.config/Claude/claude_desktop_config.json` |
| Windows | `%APPDATA%/Claude/claude_desktop_config.json` |

```json
{
  "mcpServers": {
    "ui-kit": {
      "command": "npx",
      "args": ["-y", "@annondeveloper/ui-kit-mcp"]
    }
  }
}
```

### Claude Code
File: `~/.claude/settings.json`

Same JSON format as above.

### Cursor
File: `~/.cursor/mcp.json`

Same JSON format as above.

## Verify It Works

1. Restart your AI assistant after configuration
2. Ask: "List all ui-kit components in the actions category"
3. You should see it call the `list_components` MCP tool and return Button, ActionIcon, etc.

## Troubleshooting

**"MCP server not found"**
- The MCP server binary is `@annondeveloper/ui-kit-mcp` (separate from the main library)
- The config uses `npx -y @annondeveloper/ui-kit-mcp` which auto-installs on first use
- No global install needed — npx handles everything

**"Connection refused"**
- The MCP server uses stdio transport by default (no network needed)
- If using SSE mode, check port 3100 is available

**Analytics (opt-in)**
Enable local usage tracking to see which components your AI uses most:
```bash
export UI_KIT_TELEMETRY=1
npx @annondeveloper/ui-kit stats
```
