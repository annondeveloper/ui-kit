# @annondeveloper/ui-kit — OpenAI Codex CLI Integration

Connect the OpenAI Codex CLI to the ui-kit MCP server.

## Setup

Add to your Codex MCP configuration (`~/.codex/config.json` or project-level):

```json
{
  "mcpServers": {
    "ui-kit": {
      "type": "sse",
      "url": "https://ui-kit-mcp.annondeveloper.workers.dev/sse"
    }
  }
}
```

## Local Server (alternative)

```json
{
  "mcpServers": {
    "ui-kit": {
      "command": "npx",
      "args": ["@annondeveloper/ui-kit", "mcp"]
    }
  }
}
```
