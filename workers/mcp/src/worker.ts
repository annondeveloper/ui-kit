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
<html><head><title>ui-kit MCP Server</title><meta charset="utf-8">
<style>body{font-family:system-ui;background:#0a0a0f;color:#e0e0e0;max-width:640px;margin:4rem auto;padding:0 1.5rem;line-height:1.6}
h1{background:linear-gradient(135deg,#818cf8,#c084fc);-webkit-background-clip:text;-webkit-text-fill-color:transparent;font-size:2rem}
code{background:#1a1a2e;padding:0.15em 0.4em;border-radius:4px;font-size:0.9em}
pre{background:#1a1a2e;padding:1rem;border-radius:8px;overflow-x:auto}
a{color:#818cf8}</style></head>
<body>
<h1>@annondeveloper/ui-kit MCP</h1>
<p>This is the hosted MCP server for the ui-kit component library. Connect your AI assistant to browse 147 components, generate code, and access theme tokens.</p>
<h2>Connect</h2>
<p>Add this to your MCP client config:</p>
<pre><code>{
  "mcpServers": {
    "ui-kit": {
      "url": "WORKER_URL/sse"
    }
  }
}</code></pre>
<h2>Endpoints</h2>
<ul>
<li><code>GET /sse</code> — SSE connection (MCP protocol)</li>
<li><code>POST /messages?sessionId=ID</code> — Send messages</li>
<li><code>GET /health</code> — Health check</li>
</ul>
<h2>Tools</h2>
<p><code>list_components</code>, <code>get_component</code>, <code>search_components</code>, <code>generate_snippet</code>, <code>get_theme</code>, <code>get_icons</code></p>
<p><a href="https://github.com/annondeveloper/ui-kit">GitHub</a> · <a href="https://www.npmjs.com/package/@annondeveloper/ui-kit">npm</a> · <a href="https://jsr.io/@annondeveloper/ui-kit">JSR</a></p>
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
