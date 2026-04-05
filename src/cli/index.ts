import { copyFileSync, existsSync, mkdirSync, readFileSync, writeFileSync } from 'fs'
import { join, resolve, dirname } from 'path'
import { fileURLToPath } from 'url'
import { componentRegistry } from './registry.js'
import { addCommand } from './commands/add.js'
import { createCommand, TEMPLATE_NAMES } from './commands/create.js'
import { figmaExportCommand } from './commands/figma-export.js'
import { mcpSetupCommand } from './commands/mcp-setup.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const args = process.argv.slice(2)
const command = args[0]

function parseFlags(argv: string[]): Record<string, string> {
  const flags: Record<string, string> = {}
  for (let i = 0; i < argv.length; i++) {
    if (argv[i].startsWith('--') && i + 1 < argv.length && !argv[i + 1].startsWith('--')) {
      flags[argv[i].slice(2)] = argv[i + 1]
      i++
    } else if (argv[i].startsWith('--') && argv[i].includes('=')) {
      const [key, val] = argv[i].slice(2).split('=')
      flags[key] = val
    }
  }
  return flags
}

switch (command) {
  case 'init':
    init(args.slice(1))
    break
  case 'add':
    runAdd(args.slice(1))
    break
  case 'create':
    runCreate(args.slice(1))
    break
  case 'list':
    list()
    break
  case 'theme':
    theme(args[1])
    break
  case 'figma-export':
    runFigmaExport(args.slice(1))
    break
  case 'mcp':
    runMcpSetup()
    break
  case 'stats':
    runStats()
    break
  case 'help':
  case '--help':
  case '-h':
    help()
    break
  default:
    help()
}

function init(flags: string[]) {
  const dir = flags.find(f => !f.startsWith('-')) || '.'
  const target = resolve(dir)
  mkdirSync(target, { recursive: true })

  const themeSrc = join(__dirname, '..', 'css', 'theme.css')
  if (existsSync(themeSrc)) {
    copyFileSync(themeSrc, join(target, 'theme.css'))
    console.log(`\u2713 Copied theme.css to ${target}/theme.css`)
  } else {
    console.log('Theme CSS not found in dist. Import from @annondeveloper/ui-kit/css/theme.css instead.')
  }

  // Try to auto-detect and patch root layout file
  const layoutCandidates = [
    join(target, 'app', 'layout.tsx'),        // Next.js App Router
    join(target, 'app', 'layout.jsx'),
    join(target, 'src', 'app', 'layout.tsx'),  // Next.js with src/
    join(target, 'src', 'app', 'layout.jsx'),
    join(target, 'src', 'main.tsx'),           // Vite/CRA
    join(target, 'src', 'main.jsx'),
    join(target, 'src', 'index.tsx'),
    join(target, 'src', 'index.jsx'),
  ]

  const cssImportLine = "import '@annondeveloper/ui-kit/css/all.css'"
  const themeImportLine = "import '@annondeveloper/ui-kit/css/theme.css'"

  let patched = false
  for (const candidate of layoutCandidates) {
    if (existsSync(candidate)) {
      const content = readFileSync(candidate, 'utf-8')
      if (!content.includes('@annondeveloper/ui-kit/css')) {
        const lines = content.split('\n')
        // Find last import line to insert after
        let lastImportIdx = -1
        for (let i = 0; i < lines.length; i++) {
          if (lines[i].startsWith('import ')) lastImportIdx = i
        }
        const insertIdx = lastImportIdx >= 0 ? lastImportIdx + 1 : 0
        lines.splice(insertIdx, 0, themeImportLine, cssImportLine)
        writeFileSync(candidate, lines.join('\n'))
        console.log(`\u2713 Added CSS imports to ${candidate}`)
        patched = true
      } else {
        console.log(`\u2713 CSS imports already present in ${candidate}`)
        patched = true
      }
      break
    }
  }

  if (!patched) {
    console.log('\n\u26a0\ufe0f  Could not auto-detect root layout. Add these imports manually:')
  }

  console.log('\n\u2500\u2500 Setup \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500')
  console.log('')
  console.log('  1. Import CSS (required for styling):')
  console.log(`     ${themeImportLine}`)
  console.log(`     ${cssImportLine}`)
  console.log('')
  console.log('  2. Wrap your app with UIProvider:')
  console.log('     import { UIProvider } from "@annondeveloper/ui-kit"')
  console.log('     <UIProvider><App /></UIProvider>')
  console.log('')
  console.log('  3. Start using components:')
  console.log('     import { Button, Card } from "@annondeveloper/ui-kit"')
  console.log('')
}

function runAdd(argv: string[]) {
  const name = argv.find(a => !a.startsWith('--'))
  if (!name) {
    console.error('Usage: ui-kit add <component> [--tier standard|lite|premium] [--out-dir ./path]')
    process.exit(1)
  }
  const flags = parseFlags(argv)
  addCommand(name, { tier: flags['tier'], outDir: flags['out-dir'] })
}

function runCreate(argv: string[]) {
  const name = argv.find(a => !a.startsWith('--'))
  if (!name) {
    console.error('Usage: ui-kit create <name> --template <template> [--tier standard|lite|premium] [--theme aurora]')
    console.error(`Templates: ${TEMPLATE_NAMES.join(', ')}`)
    process.exit(1)
  }
  const flags = parseFlags(argv)
  if (!flags['template']) {
    console.error('--template is required.')
    console.error(`Templates: ${TEMPLATE_NAMES.join(', ')}`)
    process.exit(1)
  }
  createCommand(name, { template: flags['template'], tier: flags['tier'], theme: flags['theme'] })
}

function runMcpSetup() {
  mcpSetupCommand()
}

function runStats() {
  try {
    // Dynamic import since analytics.ts is in the MCP module
    import('../mcp/analytics.js').then(({ getStats }) => {
      const stats = getStats()
      if (stats.total === 0) {
        console.log('\nNo MCP usage data found.')
        console.log('Enable telemetry: UI_KIT_TELEMETRY=1')
        console.log('Analytics are stored locally in ~/.ui-kit/analytics.jsonl\n')
        return
      }
      console.log(`\n@annondeveloper/ui-kit — MCP Usage Stats\n`)
      console.log(`Total tool calls: ${stats.total}\n`)
      console.log('By tool:')
      for (const [tool, count] of Object.entries(stats.byTool)) {
        console.log(`  ${tool}: ${count}`)
      }
      if (stats.topComponents.length > 0) {
        console.log('\nTop requested components:')
        for (const [name, count] of stats.topComponents) {
          console.log(`  ${name}: ${count}`)
        }
      }
      console.log()
    })
  } catch {
    console.log('Stats not available. Build the MCP module first: npm run build:mcp')
  }
}

function runFigmaExport(argv: string[]) {
  const flags = parseFlags(argv)
  if (!flags['theme'] || !flags['output']) {
    console.error('Usage: ui-kit figma-export --theme <name|hex> --output <path> [--mode dark|light]')
    process.exit(1)
  }
  figmaExportCommand({ theme: flags['theme'], output: flags['output'], mode: flags['mode'] })
}

function list() {
  const total = componentRegistry.components.length + componentRegistry.domain.length
  console.log(`\n@annondeveloper/ui-kit \u2014 ${total} Components\n`)
  console.log('General Purpose:')
  componentRegistry.components.forEach(c => console.log(`  \u2022 ${c}`))
  console.log('\nDomain (Monitoring, AI, Data):')
  componentRegistry.domain.forEach(c => console.log(`  \u2022 ${c}`))
  console.log()
}

function theme(hex: string | undefined) {
  if (!hex) {
    console.error('Usage: ui-kit theme <hex-color>')
    console.error('  Example: ui-kit theme "#6366f1"')
    process.exit(1)
  }
  console.log(`Generating theme from ${hex}...`)
  console.log('Use the theme entry point:')
  console.log('  import { generateTheme, themeToCSS } from "@annondeveloper/ui-kit/theme"')
  console.log(`  const theme = generateTheme("${hex}")`)
  console.log('  const css = themeToCSS(theme)')
}

function help() {
  console.log(`
@annondeveloper/ui-kit CLI

Commands:
  init [dir]                       Copy theme.css to your project
  add <component> [--tier] [--out-dir]  Copy component source to your project
  create <name> --template <tpl>   Scaffold a new project from template
  list                             List all available components
  theme <hex>                      Generate theme from brand color
  figma-export --theme <name|hex> --output <path>  Export Figma variables JSON
  mcp                              Set up MCP server config for Claude/Cursor
  stats                            Show MCP tool usage statistics
  help                             Show this help message

Templates (for create):
  dashboard   MetricCard grid + DataTable
  form        FormInput + Select + Button in Card
  marketing   Hero with Button + Badge + Card grid
  saas        Sidebar + Tabs + DataTable
  docs        Sidebar + Typography + CopyBlock

Options:
  --tier standard|lite|premium     Component weight tier (default: standard)
  --theme <name>                   Theme preset name (default: aurora)
  --mode dark|light                Color mode for figma-export (default: dark)
  --out-dir <path>                 Output directory for add (default: ./src/components)
`)
}
