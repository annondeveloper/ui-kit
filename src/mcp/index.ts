// Entry point for ui-kit MCP server

// Global error handlers — prevent silent crashes, log structured errors.
// Registered once here (not in createServer) to avoid duplicate listeners.
process.on('uncaughtException', (error) => {
  console.error('[ui-kit-mcp] Uncaught exception:', error)
  process.exit(1)
})

process.on('unhandledRejection', (reason) => {
  console.error('[ui-kit-mcp] Unhandled rejection:', reason)
})

const args = process.argv.slice(2)

if (args.includes('--sse')) {
  const portIdx = args.indexOf('--port')
  const port = portIdx >= 0 ? parseInt(args[portIdx + 1], 10) : 3100
  import('./transports/sse.js').then(m => m.startSSE(port))
} else {
  import('./transports/stdio.js').then(m => m.startStdio())
}
