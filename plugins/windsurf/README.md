# @annondeveloper/ui-kit — Windsurf Integration

Connect Windsurf (Codeium) to the ui-kit MCP server.

## Setup

Add to your Windsurf MCP configuration:

```json
{
  "mcpServers": {
    "ui-kit": {
      "serverUrl": "https://ui-kit-mcp.annondeveloper.workers.dev/sse"
    }
  }
}
```

Restart Windsurf. The MCP server provides access to all 147 components with full API docs and code generation.
