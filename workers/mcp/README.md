# ui-kit MCP Server — Cloudflare Worker

Hosted MCP server for `@annondeveloper/ui-kit`. Provides the same 6 tools as the local MCP server but accessible via HTTP SSE transport from anywhere.

## Setup

```bash
# From the project root, build the library and registry first
npm run build:mcp

# Then set up the worker
cd workers/mcp
npm install
npm run build:worker   # copies registry.json into src/

# Deploy to Cloudflare
npx wrangler login      # one-time auth
npx wrangler deploy     # deploy to workers.dev
```

## Endpoints

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/` | Landing page with setup instructions |
| `GET` | `/sse` | Establish SSE connection (MCP protocol) |
| `POST` | `/messages?sessionId=ID` | Send MCP messages |
| `GET` | `/health` | Health check |

## Connect Your AI

After deploying, add this to your MCP client config:

```json
{
  "mcpServers": {
    "ui-kit": {
      "url": "https://ui-kit-mcp.<your-subdomain>.workers.dev/sse"
    }
  }
}
```

## Local Development

```bash
npm run dev   # starts wrangler dev server on localhost:8787
```

## Architecture

- **Stateless** — reads a bundled JSON registry, no database
- **Edge-deployed** — runs on 300+ Cloudflare PoPs globally
- **Zero cold start** — V8 isolates boot in <1ms
- **Free tier** — 100K requests/day on Cloudflare free plan
