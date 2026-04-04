/**
 * Cloudflare Worker — hosted MCP server for @annondeveloper/ui-kit
 *
 * Provides the same 6 MCP tools as the local server but accessible via
 * HTTP SSE transport from anywhere. No Node.js required on the client.
 *
 * Endpoints:
 *   GET  /sse            — Establish SSE connection (MCP protocol)
 *   POST /messages       — Send MCP messages to a session
 *   GET  /health         — Health check
 *   GET  /               — Landing page with setup instructions
 */

import { McpServer, ResourceTemplate } from '@modelcontextprotocol/sdk/server/mcp.js'
import { SSEServerTransport } from '@modelcontextprotocol/sdk/server/sse.js'
import { z } from 'zod'

// Registry is inlined at build time (no filesystem in Workers)
import registry from './registry.json'

interface ComponentEntry {
  name: string
  description: string
  category: string
  tier: string[]
  importStatement: string
  props: { name: string; type: string; required: boolean; default?: string; description: string }[]
  examples: { title: string; code: string }[]
  accessibility: string
  relatedComponents: string[]
}

interface Registry {
  version: string
  components: Record<string, ComponentEntry>
  themes: Record<string, { name: string; hex: string; css: string }>
  icons: Record<string, { name: string; keywords: string[] }>
}

const reg = registry as Registry

// ─── Component lookup ────────────────────────────────────────────────────────

function getComponent(name: string): ComponentEntry | null {
  const key = Object.keys(reg.components).find(k => k.toLowerCase() === name.toLowerCase())
  return key ? reg.components[key] : null
}

function searchComponents(query: string, limit: number = 10) {
  const q = query.toLowerCase()
  const scored = Object.values(reg.components).map(c => {
    let score = 0
    let reason = ''
    if (c.name.toLowerCase().includes(q)) { score += 10; reason = 'Name match' }
    if (c.description.toLowerCase().includes(q)) { score += 5; reason = reason || 'Description match' }
    if (c.category.toLowerCase().includes(q)) { score += 3; reason = reason || 'Category match' }
    c.props.forEach(p => { if (p.name.toLowerCase().includes(q)) { score += 1; reason = reason || 'Prop match' } })
    return { ...c, score, reason: reason || 'Keyword match', importStatement: c.importStatement }
  })
  return scored.filter(s => s.score > 0).sort((a, b) => b.score - a.score).slice(0, limit)
}

// ─── MCP Server factory ──────────────────────────────────────────────────────

function createMcpServer(): McpServer {
  const server = new McpServer({
    name: '@annondeveloper/ui-kit',
    version: reg.version,
  })

  server.tool('list_components', 'List all UI Kit components', {
    category: z.string().optional().describe('Filter by category'),
    tier: z.string().optional().describe('Filter by tier: standard, lite, or premium'),
  }, async ({ category, tier }) => {
    let components = Object.values(reg.components)
    if (category) components = components.filter(c => c.category === category)
    if (tier) components = components.filter(c => c.tier.includes(tier))
    const list = components.map(c => `- **${c.name}** (${c.category}) — ${c.description}\n  Import: \`${c.importStatement}\``)
    return { content: [{ type: 'text' as const, text: `# Components (${components.length})\n\n${list.join('\n\n')}` }] }
  })

  server.tool('get_component', 'Get full API documentation for a specific component', {
    name: z.string().describe('Component name'),
  }, async ({ name }) => {
    const comp = getComponent(name)
    if (!comp) return { content: [{ type: 'text' as const, text: `Component "${name}" not found.` }] }
    const propsTable = comp.props.map(p =>
      `| \`${p.name}\` | \`${p.type}\` | ${p.required ? 'Yes' : 'No'} | ${p.default || '-'} | ${p.description} |`
    ).join('\n')
    const examples = comp.examples.map(e => `### ${e.title}\n\`\`\`tsx\n${e.code}\n\`\`\``).join('\n\n')
    return { content: [{ type: 'text' as const, text: `# ${comp.name}\n\n${comp.description}\n\n## Import\n\`\`\`tsx\n${comp.importStatement}\n\`\`\`\n\n## Props\n| Prop | Type | Required | Default | Description |\n|------|------|----------|---------|-------------|\n${propsTable}\n\n## Examples\n${examples}\n\n**Category:** ${comp.category} | **Tiers:** ${comp.tier.join(', ')}` }] }
  })

  server.tool('search_components', 'Search components by use-case or keyword', {
    query: z.string().describe('Natural language search'),
    limit: z.number().optional().default(10),
  }, async ({ query, limit }) => {
    const results = searchComponents(query, limit)
    if (results.length === 0) return { content: [{ type: 'text' as const, text: `No results for "${query}"` }] }
    const text = results.map((r, i) => `${i + 1}. **${r.name}** (score: ${r.score}) — ${r.description}\n   \`${r.importStatement}\``).join('\n\n')
    return { content: [{ type: 'text' as const, text: `# Search: "${query}"\n\n${text}` }] }
  })

  server.tool('generate_snippet', 'Generate working TSX code', {
    components: z.array(z.string()).describe('Component names'),
    scenario: z.string().optional(),
  }, async ({ components: names, scenario }) => {
    const comps = names.map(n => getComponent(n)).filter(Boolean) as ComponentEntry[]
    if (comps.length === 0) return { content: [{ type: 'text' as const, text: 'No valid components found.' }] }
    const imports = [...new Set(comps.map(c => c.importStatement))].join('\n')
    const jsx = comps.map(c => c.examples[0]?.code.split('\n').filter(l => !l.startsWith('import ')).join('\n').trim() || `<${c.name} />`).join('\n        ')
    const code = `${imports}\nimport { UIProvider } from '@annondeveloper/ui-kit'\n\nexport function ${(scenario || 'Example').replace(/[^a-zA-Z0-9]/g, '').slice(0, 30)}() {\n  return (\n    <UIProvider>\n      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>\n        ${jsx}\n      </div>\n    </UIProvider>\n  )\n}`
    return { content: [{ type: 'text' as const, text: `# Generated Snippet\n\n\`\`\`tsx\n${code}\n\`\`\`` }] }
  })

  server.tool('get_theme', 'Get theme tokens and CSS', {
    name: z.string().describe('Theme name'),
    mode: z.enum(['dark', 'light']).optional().default('dark'),
  }, async ({ name, mode }) => {
    const key = `${name}-${mode}`
    const theme = reg.themes[key] || reg.themes[name]
    if (!theme) return { content: [{ type: 'text' as const, text: `Theme "${name}" not found. Available: ${Object.keys(reg.themes).join(', ')}` }] }
    return { content: [{ type: 'text' as const, text: `# Theme: ${theme.name}\n\n\`\`\`css\n${theme.css}\n\`\`\`` }] }
  })

  server.tool('get_icons', 'Browse built-in SVG icons', {
    search: z.string().optional(),
  }, async ({ search }) => {
    let icons = Object.values(reg.icons)
    if (search) icons = icons.filter(i => i.name.includes(search.toLowerCase()) || i.keywords.some(k => k.includes(search.toLowerCase())))
    const list = icons.map(i => `- **${i.name}** — \`<Icon name="${i.name}" />\``).join('\n')
    return { content: [{ type: 'text' as const, text: `# Icons (${icons.length})\n\n${list}` }] }
  })

  server.resource('component', new ResourceTemplate('component://{name}', {
    list: async () => ({
      resources: Object.values(reg.components).map(c => ({
        uri: `component://${c.name}`,
        name: c.name,
        description: c.description,
        mimeType: 'text/markdown' as const,
      }))
    })
  }), async (uri, { name }) => {
    const comp = getComponent(name as string)
    if (!comp) return { contents: [{ uri: uri.href, mimeType: 'text/plain', text: `Not found` }] }
    const propsDoc = comp.props.map(p => `- \`${p.name}: ${p.type}\` — ${p.description}`).join('\n')
    return { contents: [{ uri: uri.href, mimeType: 'text/markdown', text: `# ${comp.name}\n\n${comp.description}\n\n## Props\n${propsDoc}` }] }
  })

  return server
}

// ─── Cloudflare Worker fetch handler ─────────────────────────────────────────

const sessions = new Map<string, SSEServerTransport>()

const LANDING_HTML = `<!DOCTYPE html>
<html><head><title>ui-kit MCP Server</title><meta charset="utf-8"><meta name="viewport" content="width=device-width">
<style>
*{box-sizing:border-box;margin:0}
body{font-family:system-ui,-apple-system,sans-serif;background:#08080d;color:#c8c8d0;min-height:100vh;padding:0}
.hero{text-align:center;padding:4rem 1.5rem 3rem;background:radial-gradient(ellipse at 50% 0%,oklch(25% 0.08 270 / 0.4),transparent 70%)}
h1{font-size:clamp(1.75rem,5vw,2.5rem);font-weight:800;letter-spacing:-0.03em;background:linear-gradient(135deg,#818cf8 0%,#c084fc 50%,#f472b6 100%);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text}
.sub{color:#8888a0;font-size:1rem;margin-top:0.75rem;max-width:480px;margin-inline:auto;line-height:1.6}
.badge{display:inline-flex;align-items:center;gap:0.375rem;background:#1a1a2e;border:1px solid #2a2a3e;border-radius:9999px;padding:0.25rem 0.75rem;font-size:0.75rem;color:#10b981;margin-top:1rem}
.badge::before{content:'';width:6px;height:6px;background:#10b981;border-radius:50%;animation:pulse 2s ease-in-out infinite}
@keyframes pulse{0%,100%{opacity:1}50%{opacity:0.4}}
.content{max-width:600px;margin:0 auto;padding:0 1.5rem 4rem}
.step{margin-top:2.5rem}
.step-num{display:inline-flex;align-items:center;justify-content:center;width:1.5rem;height:1.5rem;border-radius:50%;background:#818cf8;color:#fff;font-size:0.75rem;font-weight:700}
.step h2{display:inline;font-size:1rem;font-weight:600;color:#e0e0e8;margin-left:0.5rem}
.step p{color:#8888a0;font-size:0.875rem;margin-top:0.375rem;line-height:1.5}
pre{background:#0f0f1a;border:1px solid #1e1e30;border-radius:0.5rem;padding:1rem;margin-top:0.75rem;overflow-x:auto;font-size:0.8125rem;line-height:1.5;color:#c8c8d0;position:relative}
pre .copy{position:absolute;top:0.5rem;right:0.5rem;background:#1e1e30;border:1px solid #2e2e40;border-radius:0.25rem;color:#818cf8;padding:0.25rem 0.5rem;font-size:0.6875rem;cursor:pointer;font-family:inherit}
pre .copy:hover{background:#2a2a3e}
code{font-family:'SF Mono','Fira Code','JetBrains Mono',monospace}
.tools{display:grid;grid-template-columns:repeat(auto-fit,minmax(160px,1fr));gap:0.75rem;margin-top:1rem}
.tool{background:#0f0f1a;border:1px solid #1e1e30;border-radius:0.5rem;padding:0.75rem;font-size:0.8125rem}
.tool strong{color:#e0e0e8;display:block;margin-bottom:0.25rem}
.tool span{color:#6b6b80;font-size:0.75rem;line-height:1.4}
.prompts{margin-top:1rem;display:flex;flex-direction:column;gap:0.5rem}
.prompt{background:#0f0f1a;border:1px solid #1e1e30;border-radius:0.5rem;padding:0.625rem 0.875rem;font-size:0.8125rem;color:#a0a0b0;font-style:italic;cursor:pointer;transition:border-color 0.15s}
.prompt:hover{border-color:#818cf8}
.links{margin-top:3rem;text-align:center;font-size:0.8125rem;color:#6b6b80}
.links a{color:#818cf8;text-decoration:none;margin:0 0.75rem}
.links a:hover{text-decoration:underline}
</style></head>
<body>
<div class="hero">
  <h1>ui-kit MCP Server</h1>
  <p class="sub">147 React components your AI can discover, understand, and use. Zero setup required.</p>
  <div class="badge">Live on Cloudflare Workers</div>
</div>

<div class="content">
  <div class="step">
    <span class="step-num">1</span>
    <h2>Add to your AI assistant</h2>
    <p>Copy this into your MCP config (Claude, Cursor, or any MCP client):</p>
    <pre><button class="copy" onclick="navigator.clipboard.writeText(this.nextElementSibling.textContent)">Copy</button><code>{
  "mcpServers": {
    "ui-kit": {
      "url": "WORKER_URL/sse"
    }
  }
}</code></pre>
  </div>

  <div class="step">
    <span class="step-num">2</span>
    <h2>Ask your AI to build</h2>
    <p>Try these prompts — your AI will use real component APIs, not guesses:</p>
    <div class="prompts">
      <div class="prompt">"Build a dashboard with MetricCard, DataTable, and TimeSeriesChart"</div>
      <div class="prompt">"Create a multi-step form wizard with validation"</div>
      <div class="prompt">"Show me all the chart components available"</div>
      <div class="prompt">"Generate a login page with the ui-kit design system"</div>
    </div>
  </div>

  <div class="step">
    <span class="step-num">3</span>
    <h2>Install the library</h2>
    <p>When you're ready to use the generated code:</p>
    <pre><code>npm install @annondeveloper/ui-kit</code></pre>
  </div>

  <div class="step">
    <h2 style="margin-left:0">Available Tools</h2>
    <div class="tools">
      <div class="tool"><strong>list_components</strong><span>Browse all 147 components by category or tier</span></div>
      <div class="tool"><strong>get_component</strong><span>Full API reference — props, types, examples</span></div>
      <div class="tool"><strong>search_components</strong><span>Find components by use case</span></div>
      <div class="tool"><strong>generate_snippet</strong><span>Working TSX with correct imports</span></div>
      <div class="tool"><strong>get_theme</strong><span>OKLCH theme tokens and CSS</span></div>
      <div class="tool"><strong>get_icons</strong><span>50+ built-in SVG icons</span></div>
    </div>
  </div>

  <div class="links">
    <a href="https://github.com/annondeveloper/ui-kit">GitHub</a>
    <a href="https://www.npmjs.com/package/@annondeveloper/ui-kit">npm</a>
    <a href="https://jsr.io/@annondeveloper/ui-kit">JSR</a>
    <a href="https://annondeveloper.github.io/ui-kit/">Demo</a>
    <a href="WORKER_URL/health">Health</a>
  </div>
</div>
</body></html>`

export default {
  async fetch(request: Request): Promise<Response> {
    const url = new URL(request.url)
    const cors = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    }

    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: cors })
    }

    // Landing page
    if (request.method === 'GET' && url.pathname === '/') {
      const html = LANDING_HTML.replace('WORKER_URL', url.origin)
      return new Response(html, { headers: { ...cors, 'Content-Type': 'text/html' } })
    }

    // Health check
    if (request.method === 'GET' && url.pathname === '/health') {
      return Response.json({ status: 'ok', sessions: sessions.size, version: reg.version }, { headers: cors })
    }

    // SSE connection
    if (request.method === 'GET' && url.pathname === '/sse') {
      const server = createMcpServer()
      const transport = new SSEServerTransport('/messages', new Response() as any)

      // Create a ReadableStream for SSE
      const { readable, writable } = new TransformStream()
      const writer = writable.getWriter()
      const encoder = new TextEncoder()

      // Patch the transport to write to our stream instead of Node response
      const originalSend = transport.send?.bind(transport)
      if (originalSend) {
        transport.send = async (message: unknown) => {
          await writer.write(encoder.encode(`data: ${JSON.stringify(message)}\n\n`))
        }
      }

      sessions.set(transport.sessionId, transport)
      transport.onclose = () => sessions.delete(transport.sessionId)

      // Send session ID as first SSE event
      writer.write(encoder.encode(`event: endpoint\ndata: /messages?sessionId=${transport.sessionId}\n\n`))

      await server.connect(transport)

      return new Response(readable, {
        headers: {
          ...cors,
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache',
          'Connection': 'keep-alive',
        },
      })
    }

    // Message handler
    if (request.method === 'POST' && url.pathname === '/messages') {
      const sessionId = url.searchParams.get('sessionId')
      if (!sessionId || !sessions.has(sessionId)) {
        return Response.json({ error: 'Session not found' }, { status: 404, headers: cors })
      }
      const transport = sessions.get(sessionId)!
      const body = await request.json()
      try {
        await transport.handlePostMessage(request as any, new Response() as any, body)
        return new Response('OK', { status: 200, headers: cors })
      } catch (error) {
        return Response.json({ error: (error as Error).message }, { status: 500, headers: cors })
      }
    }

    return new Response('Not found', { status: 404, headers: cors })
  },
}
