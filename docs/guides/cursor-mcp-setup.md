# Cursor MCP Setup

Use this guide to connect `@annondeveloper/ui-kit` to Cursor through MCP so Cursor can browse the component registry and generate code against the real API surface instead of guessing.

## What you get in Cursor

Once the MCP server is connected, Cursor can:

- list available components
- inspect component props and examples
- search the registry by use case
- generate snippets with the correct imports
- inspect theme tokens and icon metadata

## Before you start

Make sure you have:

- Node.js installed
- Cursor installed
- a local checkout of the `ui-kit` repository

## 1. Build the MCP server

From the `ui-kit` repo root:

```bash
npm install
npm run build:mcp
```

This creates the compiled MCP server at:

```text
dist/mcp/index.js
```

## 2. Add the MCP config to Cursor

Create this file in the project where you want Cursor to use the server:

```text
.cursor/mcp.json
```

Add the following config:

```json
{
  "mcpServers": {
    "ui-kit": {
      "command": "node",
      "args": ["/absolute/path/to/ui-kit/dist/mcp/index.js"]
    }
  }
}
```

Replace `/absolute/path/to/ui-kit/dist/mcp/index.js` with the real path on your machine.

## 3. Restart Cursor

Close and reopen Cursor after saving `.cursor/mcp.json`. Cursor should pick up the new MCP server configuration on startup.

## 4. Verify it works

Open Cursor in the project and try prompts like:

```text
List the ui-kit form input components.
```

```text
Show me the props for the DataTable component from ui-kit.
```

```text
Generate a date range filter UI using ui-kit components.
```

If the server is connected correctly, Cursor should answer using `ui-kit` component names, real imports, and actual props from the registry.

## Troubleshooting

### Cursor does not see the server

Check:

- `.cursor/mcp.json` is valid JSON
- the `dist/mcp/index.js` path is correct
- you ran `npm run build:mcp`
- Cursor was restarted after the config change

### The server starts but returns incomplete data

Rebuild the MCP artifacts:

```bash
npm run build:mcp
```

That rebuilds the MCP bundle and registry output.

### I want a shared team server instead

For a shared remote setup, use the SSE flow described in the MCP docs and point Cursor to the `/sse` endpoint instead of running the local stdio server.

## Cursor-specific limitation right now

The MCP demo page references:

```bash
npx @annondeveloper/ui-kit mcp
```

But the current CLI source in this repository does not yet expose a public `mcp` command. Until that lands, Cursor setup is still manual through `.cursor/mcp.json` plus the built `dist/mcp/index.js` server path.

## Related references

- `mcp_readme.md`
- `demo/src/pages/McpPage.tsx`
- `package.json`
