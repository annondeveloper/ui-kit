# UI Kit MCP Server

Model Context Protocol server for `@annondeveloper/ui-kit` — gives AI assistants (Claude, Cursor, Windsurf, Copilot) full knowledge of all 154 components, 15 themes, and 50 icons so they generate correct, working code using your library.

**No other React UI library ships an MCP server.** This is a first-mover differentiator.

---

## What It Does

When an AI assistant connects to this MCP server, it can:

- **Browse** all 154 components with descriptions and categories
- **Get full API docs** for any component — every prop, type, default, example
- **Search by use-case** — "I need a date picker with range" returns ranked results
- **Generate working code** — correct imports, correct props, ready to paste
- **Query themes** — get all 15 theme token values as CSS
- **Browse icons** — search 50+ built-in SVG icons by name

The AI never hallucinates props, never guesses imports, never makes up APIs. It reads the ground truth from the registry.

---

## Architecture

```
src/mcp/
├── index.ts                  ← Entry point (stdio default, --sse for remote)
├── server.ts                 ← Core MCP server (6 tools + resource provider)
├── registry/
│   ├── types.ts              ← TypeScript types for registry data
│   └── loader.ts             ← Registry loader + fuzzy search engine
├── transports/
│   ├── stdio.ts              ← Local stdio transport (default)
│   └── sse.ts                ← Remote HTTP SSE transport
└── scripts/
    └── build-registry.ts     ← Source scanner → registry.json generator

dist/mcp/
├── index.js                  ← Compiled server (564 KB, bundled with MCP SDK)
├── registry.json             ← Auto-generated component metadata
└── scripts/
    └── build-registry.js     ← Compiled registry builder
```

---

## 6 Tools

### `list_components`

List all components, optionally filtered by category or tier.

```
Input:  { category?: string, tier?: string }
Output: Markdown list of components with name, category, description, import path
```

**Categories:** `actions`, `form-inputs`, `data-display`, `overlays`, `navigation`, `layout`, `feedback`, `animation`, `data-tables`, `text-code`, `data-visualization`, `infrastructure`, `ai-realtime`, `magic-effects`, `media`

**Tiers:** `standard`, `lite`, `premium`

Example: "List all form input components" → returns Calendar, DatePicker, DateRangePicker, FormInput, NumberInput, PasswordInput, etc.

---

### `get_component`

Get full API documentation for a specific component.

```
Input:  { name: string }
Output: Component name, description, import statement, full props table (name, type, required, default, description), usage examples, accessibility notes, related components, category, tiers
```

Example response for `get_component({ name: "Button" })`:

```markdown
# Button
Interactive action trigger

## Import
import { Button } from '@annondeveloper/ui-kit'

## Props
| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| variant | 'primary' | 'secondary' | 'ghost' | 'danger' | 'link' | No | 'primary' | Visual style |
| size | 'xs' | 'sm' | 'md' | 'lg' | 'xl' | No | 'md' | Button size |
| loading | boolean | No | false | Shows loading spinner |
| loadingText | string | No | - | Text during loading |
| fullWidth | boolean | No | - | Fill container width |
| iconOnly | boolean | No | - | Compact square button |
...

## Accessibility
Uses native <button>. Keyboard accessible via Enter/Space. Includes aria-disabled and aria-busy.

## Related Components
ButtonGroup, ActionIcon, CopyButton
```

---

### `search_components`

Fuzzy search components by natural language query.

```
Input:  { query: string, limit?: number }
Output: Ranked results with name, score, reasons, import path
```

Scoring: exact name match (+100), name contains word (+50), keyword match (+30), description match (+20), prop match (+10). Returns deduplicated reasons for each match.

Example: `search_components({ query: "upload image avatar crop" })`

```
1. AvatarUpload (score: 200) — Name contains "upload"; Keyword match; Description match
2. Avatar (score: 150) — Exact name match; Keyword match; Description match
3. Cropper (score: 110) — Name contains "crop"; Keyword match; Description match
```

---

### `generate_snippet`

Generate working TSX code combining multiple components.

```
Input:  { components: string[], scenario?: string }
Output: Complete TSX with imports, component composition, usage notes
```

Builds code from actual component APIs — uses required props, deduplicates imports, adds UIProvider reminder if using premium components.

---

### `get_theme`

Get theme tokens and ready-to-paste CSS.

```
Input:  { name: string, mode?: 'dark' | 'light' }
Output: Theme name, hex color, CSS token block, usage code
```

**15 themes available:** aurora, sunset, rose, amber, ocean, emerald, cyan, violet, fuchsia, slate, corporate, midnight, forest, wine, carbon

---

### `get_icons`

Browse built-in SVG icons.

```
Input:  { search?: string }
Output: Icon list with names and usage code
```

**50+ icons** covering: chevrons, actions (check, x, plus, minus), search, navigation, status, media, social, and more.

---

## Resources

The server also exposes MCP resources for direct reading:

```
component://Button        → Full Button documentation (markdown)
component://Calendar      → Full Calendar documentation
component://DataTable     → Full DataTable documentation
... (154 total)
```

Clients can call `resources/list` to get all 154 component resources, then `resources/read` on any URI.

---

## How to Use

### Method 1: Local via stdio (recommended)

The server runs as a local Node.js process. The AI tool communicates via stdin/stdout. No network, no hosting, no API keys.

**Claude Code** — add to `~/.claude/settings.json`:

```json
{
  "mcpServers": {
    "ui-kit": {
      "command": "node",
      "args": ["/path/to/ui-kit/dist/mcp/index.js"]
    }
  }
}
```

**Claude Desktop** — add to `~/Library/Application Support/Claude/claude_desktop_config.json` (Mac) or `%APPDATA%\Claude\claude_desktop_config.json` (Windows):

```json
{
  "mcpServers": {
    "ui-kit": {
      "command": "node",
      "args": ["/path/to/ui-kit/dist/mcp/index.js"]
    }
  }
}
```

**Cursor** — add to `.cursor/mcp.json` in your project:

```json
{
  "mcpServers": {
    "ui-kit": {
      "command": "node",
      "args": ["/path/to/ui-kit/dist/mcp/index.js"]
    }
  }
}
```

**Windsurf / Codeium** — add to MCP settings panel:

```
Name:    ui-kit
Command: node
Args:    /path/to/ui-kit/dist/mcp/index.js
```

**After npm publish**, replace the path with npx:

```json
{
  "mcpServers": {
    "ui-kit": {
      "command": "npx",
      "args": ["@annondeveloper/ui-kit-mcp"]
    }
  }
}
```

Restart your AI tool after adding the config. The 6 tools will appear automatically.

---

### Method 2: Remote via SSE (team-shared)

Run the server as an HTTP service. Multiple team members point to the same URL. Useful for teams that want a shared, always-up-to-date MCP endpoint.

**Start the server:**

```bash
node dist/mcp/index.js --sse --port 3100
```

Output:
```
[ui-kit-mcp] SSE server listening on http://localhost:3100
[ui-kit-mcp] SSE endpoint: http://localhost:3100/sse
```

**Connect from any MCP client:**

```json
{
  "mcpServers": {
    "ui-kit": {
      "url": "http://your-server:3100/sse"
    }
  }
}
```

**Endpoints:**

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/sse` | GET | Establish SSE stream (MCP protocol) |
| `/messages?sessionId=<id>` | POST | Send client messages to server |
| `/health` | GET | Health check — returns `{ status: "ok", sessions: N }` |

**CORS** is enabled (`Access-Control-Allow-Origin: *`) for browser-based clients.

**Deploy anywhere:**

| Platform | Command | Cost |
|----------|---------|------|
| Vercel | Deploy as serverless function | Free tier |
| Cloudflare Workers | `wrangler deploy` | Free tier |
| Railway | Docker container | ~$5/mo |
| Fly.io | `fly deploy` | Free tier |
| Any VPS | `node dist/mcp/index.js --sse --port 3100` | $4-6/mo |
| Docker | `docker run -p 3100:3100 ui-kit-mcp` | Varies |

---

### Method 3: npx (after npm publish)

Once the package is published to npm, anyone can run the MCP server without cloning the repo:

```bash
# stdio mode (local)
npx @annondeveloper/ui-kit-mcp

# SSE mode (remote)
npx @annondeveloper/ui-kit-mcp --sse --port 3100
```

The binary is registered in `package.json`:

```json
{
  "bin": {
    "ui-kit-mcp": "dist/mcp/index.js"
  }
}
```

---

## How to Build / Update

### Full build (includes MCP)

```bash
npm run build
# Runs: tsup (components) + tsup (CLI) + tsup (MCP) + CSS extraction

npm run build:registry
# Runs: node dist/mcp/scripts/build-registry.js
# Scans src/ and generates dist/mcp/registry.json
```

### MCP only

```bash
npm run build:mcp
# Runs: tsup --config tsup.mcp.config.ts + build:registry
```

### Registry only

```bash
node dist/mcp/scripts/build-registry.js
```

Output: `dist/mcp/registry.json` with 154 components, 15 themes, 50 icons.

The registry is generated at build time by scanning actual source files. It extracts:
- Component names from `src/components/index.ts` and `src/domain/index.ts`
- Props interfaces by parsing TypeScript source (regex-based, no compiler API needed)
- Default values from function parameter destructuring
- JSDoc comments for prop descriptions
- Tier availability by checking `src/lite/` and `src/premium/` for wrappers
- Theme tokens from `src/core/tokens/themes.ts`
- Icon paths from `src/core/icons/paths.ts`

---

## Registry Format

The registry is a single JSON file (`dist/mcp/registry.json`):

```json
{
  "version": "2.4.1",
  "generatedAt": "2026-03-27T...",
  "componentCount": 154,
  "components": {
    "Button": {
      "name": "Button",
      "description": "Button component — interactive action trigger",
      "category": "actions",
      "tier": ["standard", "lite", "premium"],
      "importPath": "@annondeveloper/ui-kit",
      "importStatement": "import { Button } from '@annondeveloper/ui-kit'",
      "sourceFile": "src/components/button.tsx",
      "props": [
        {
          "name": "variant",
          "type": "'primary' | 'secondary' | 'ghost' | 'danger' | 'link'",
          "required": false,
          "default": "'primary'",
          "description": "Visual style variant"
        }
      ],
      "examples": [
        {
          "title": "Basic",
          "code": "<Button variant=\"primary\">Click me</Button>"
        }
      ],
      "accessibility": "Uses native <button>. Keyboard accessible...",
      "keywords": ["button", "action", "click", "submit"],
      "relatedComponents": ["ButtonGroup", "ActionIcon", "CopyButton"]
    }
  },
  "themes": {
    "aurora-dark": {
      "name": "aurora",
      "hex": "#6366f1",
      "description": "Default Aurora Fluid theme",
      "tokens": { "--brand": "oklch(55.1% 0.228 271.9)", ... },
      "css": ":root { --brand: oklch(55.1% 0.228 271.9); ... }"
    }
  },
  "icons": {
    "check": {
      "name": "check",
      "paths": ["M20 6L9 17l-5-5"],
      "keywords": ["check", "checkmark", "done", "complete"]
    }
  },
  "categories": {
    "actions": ["Button", "ButtonGroup", "ActionIcon", "CopyButton"],
    "form-inputs": ["FormInput", "Select", "Calendar", ...],
    ...
  }
}
```

---

## How to Ship

### Option A: Bundled with ui-kit (recommended)

The MCP server ships inside `@annondeveloper/ui-kit`. No separate package needed.

1. Run `npm run build` (includes MCP build + registry generation)
2. Run `npm publish`
3. Users configure `npx @annondeveloper/ui-kit-mcp` in their AI tool

The `dist/mcp/` directory is included in the published package via the `"files": ["dist"]` field in package.json.

### Option B: Separate package

If you want to keep the MCP server separate:

1. Create a new package `@annondeveloper/ui-kit-mcp`
2. Copy `dist/mcp/` as the package contents
3. Add `"bin": { "ui-kit-mcp": "index.js" }` to its package.json
4. Publish separately

### Option C: Docker image

```dockerfile
FROM node:20-slim
WORKDIR /app
COPY dist/mcp/ ./
EXPOSE 3100
CMD ["node", "index.js", "--sse", "--port", "3100"]
```

```bash
docker build -t ui-kit-mcp .
docker run -p 3100:3100 ui-kit-mcp
```

---

## Testing

### Quick test (terminal)

```bash
echo '{"jsonrpc":"2.0","id":1,"method":"initialize","params":{"protocolVersion":"2024-11-05","capabilities":{},"clientInfo":{"name":"test","version":"1.0"}}}' | node dist/mcp/index.js
```

If you see a JSON response with `"serverInfo"`, the server works.

### Test tool listing

```bash
printf '{"jsonrpc":"2.0","id":1,"method":"initialize","params":{"protocolVersion":"2024-11-05","capabilities":{},"clientInfo":{"name":"test","version":"1.0"}}}\n{"jsonrpc":"2.0","method":"notifications/initialized"}\n{"jsonrpc":"2.0","id":2,"method":"tools/list"}\n' | node dist/mcp/index.js
```

Should return 6 tools: `list_components`, `get_component`, `search_components`, `generate_snippet`, `get_theme`, `get_icons`.

### Test search

```bash
printf '{"jsonrpc":"2.0","id":1,"method":"initialize","params":{"protocolVersion":"2024-11-05","capabilities":{},"clientInfo":{"name":"test","version":"1.0"}}}\n{"jsonrpc":"2.0","method":"notifications/initialized"}\n{"jsonrpc":"2.0","id":3,"method":"tools/call","params":{"name":"search_components","arguments":{"query":"date picker","limit":3}}}\n' | node dist/mcp/index.js
```

### Test SSE health

```bash
node dist/mcp/index.js --sse --port 3100 &
curl http://localhost:3100/health
# Returns: {"status":"ok","sessions":0}
```

### Test in Claude Code

Add to `~/.claude/settings.json`, restart Claude Code, then ask:

> "Search for a date component using ui-kit"

Claude will call `search_components` and return DatePicker, DateRangePicker, Calendar.

---

## Dependency

The MCP server requires one runtime dependency:

| Package | Version | Size | Purpose |
|---------|---------|------|---------|
| `@modelcontextprotocol/sdk` | ^1.28.0 | ~50 KB | MCP protocol implementation |

This is bundled into `dist/mcp/index.js` by tsup — no separate install needed. The SDK is listed in `package.json` dependencies so it's installed with the main package.

The SSE transport uses Node.js built-in `http` module — no Express or other HTTP framework needed.

---

## File Sizes

| File | Size | Description |
|------|------|-------------|
| `dist/mcp/index.js` | 565 KB | Server + MCP SDK bundled |
| `dist/mcp/registry.json` | ~200 KB | Component metadata (154 components) |
| `dist/mcp/scripts/build-registry.js` | 27 KB | Registry generator (build-time only) |

These are NOT included in the main library bundle. They are separate entry points that only load when the MCP server is started. Users who `import { Button } from '@annondeveloper/ui-kit'` never download or execute the MCP code.

---

## Troubleshooting

**MCP server doesn't appear in Claude Code:**
- Verify the path in settings.json is absolute and correct
- Restart Claude Code after adding the config
- Check the server starts: `node dist/mcp/index.js` should not crash

**"registry.json not found" error:**
- Run `npm run build:registry` to generate it
- Ensure `dist/mcp/registry.json` exists

**SSE mode not connecting:**
- Check the port isn't in use: `lsof -i :3100`
- Test health endpoint: `curl http://localhost:3100/health`
- Check CORS if connecting from a browser

**Wrong component count or stale data:**
- Regenerate: `node dist/mcp/scripts/build-registry.js`
- This rescans all source files and rebuilds the registry
