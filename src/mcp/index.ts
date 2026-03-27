// Entry point for ui-kit MCP server
const args = process.argv.slice(2)

if (args.includes('--sse')) {
  const portIdx = args.indexOf('--port')
  const port = portIdx >= 0 ? parseInt(args[portIdx + 1], 10) : 3100
  import('./transports/sse.js').then(m => m.startSSE(port))
} else {
  import('./transports/stdio.js').then(m => m.startStdio())
}
