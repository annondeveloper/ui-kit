import { createServer as createHttpServer, type IncomingMessage, type ServerResponse } from 'http'
import { SSEServerTransport } from '@modelcontextprotocol/sdk/server/sse.js'
import { createServer } from '../server.js'

export async function startSSE(port: number) {
  const sessions = new Map<string, SSEServerTransport>()

  const httpServer = createHttpServer(async (req: IncomingMessage, res: ServerResponse) => {
    // CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*')
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

    if (req.method === 'OPTIONS') {
      res.writeHead(204)
      res.end()
      return
    }

    const url = new URL(req.url || '/', `http://localhost:${port}`)

    // GET /sse — establish SSE stream
    if (req.method === 'GET' && url.pathname === '/sse') {
      const mcpServer = createServer()
      const transport = new SSEServerTransport('/messages', res)
      sessions.set(transport.sessionId, transport)

      transport.onclose = () => {
        sessions.delete(transport.sessionId)
      }

      // connect() handles transport start internally
      await mcpServer.connect(transport)
      return
    }

    // POST /messages?sessionId=<id> — receive client messages
    if (req.method === 'POST' && url.pathname === '/messages') {
      const sessionId = url.searchParams.get('sessionId')
      if (!sessionId || !sessions.has(sessionId)) {
        res.writeHead(404, { 'Content-Type': 'application/json' })
        res.end(JSON.stringify({ error: 'Session not found' }))
        return
      }

      const transport = sessions.get(sessionId)!
      // Collect body
      const chunks: Buffer[] = []
      req.on('data', (chunk: Buffer) => chunks.push(chunk))
      req.on('end', async () => {
        try {
          const body = JSON.parse(Buffer.concat(chunks).toString('utf-8'))
          await transport.handlePostMessage(req, res, body)
        } catch {
          res.writeHead(400, { 'Content-Type': 'application/json' })
          res.end(JSON.stringify({ error: 'Invalid JSON' }))
        }
      })
      return
    }

    // Health check
    if (req.method === 'GET' && url.pathname === '/health') {
      res.writeHead(200, { 'Content-Type': 'application/json' })
      res.end(JSON.stringify({ status: 'ok', sessions: sessions.size }))
      return
    }

    res.writeHead(404)
    res.end('Not found')
  })

  httpServer.listen(port, () => {
    console.error(`[ui-kit-mcp] SSE server listening on http://localhost:${port}`)
    console.error(`[ui-kit-mcp] SSE endpoint: http://localhost:${port}/sse`)
  })
}
