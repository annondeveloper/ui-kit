import { copyFileSync, existsSync, mkdirSync } from 'fs'
import { join, resolve, dirname } from 'path'
import { fileURLToPath } from 'url'
import { componentRegistry } from './registry.js'
import { addCommand } from './commands/add.js'
import { createCommand, TEMPLATE_NAMES } from './commands/create.js'
import { figmaExportCommand } from './commands/figma-export.js'

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

  console.log('\nSetup:')
  console.log('  import { UIProvider } from "@annondeveloper/ui-kit"')
  console.log('  // Wrap your app: <UIProvider><App /></UIProvider>')
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
