# @annondeveloper/ui-kit — VS Code / Copilot Integration

Connect VS Code with GitHub Copilot or any MCP-compatible extension to the ui-kit component library.

## Setup with Copilot Chat (MCP support)

Add to `.vscode/mcp.json` in your project:

```json
{
  "servers": {
    "ui-kit": {
      "type": "sse",
      "url": "https://ui-kit-mcp.annondeveloper.workers.dev/sse"
    }
  }
}
```

## Setup with Continue.dev

Add to `~/.continue/config.json`:

```json
{
  "mcpServers": [
    {
      "name": "ui-kit",
      "transport": {
        "type": "sse",
        "url": "https://ui-kit-mcp.annondeveloper.workers.dev/sse"
      }
    }
  ]
}
```

## Local Server (alternative)

```bash
npm install @annondeveloper/ui-kit
npx @annondeveloper/ui-kit mcp
```
