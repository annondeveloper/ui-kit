# @annondeveloper/ui-kit — Cursor Integration

Connect Cursor to the ui-kit MCP server for component discovery, API reference, and code generation.

## Setup

Copy `.cursor/mcp.json` into your project root:

```bash
cp -r plugins/cursor/.cursor /path/to/your/project/
```

Or manually create `.cursor/mcp.json` in your project:

```json
{
  "mcpServers": {
    "ui-kit": {
      "url": "https://ui-kit-mcp.annondeveloper.workers.dev/sse"
    }
  }
}
```

Restart Cursor. The MCP server gives Cursor access to all 147 components, theme tokens, and code generation.

## Try It

Ask Cursor:
- "Build a dashboard with MetricCard and DataTable from ui-kit"
- "Show me all form components in ui-kit"
- "Generate a login page using ui-kit's Aurora Fluid design"
