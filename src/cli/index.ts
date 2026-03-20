import { copyFileSync, existsSync, mkdirSync } from 'fs'
import { join, resolve, dirname } from 'path'
import { fileURLToPath } from 'url'
import { componentRegistry } from './registry.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const args = process.argv.slice(2)
const command = args[0]

switch (command) {
  case 'init':
    init(args.slice(1))
    break
  case 'list':
    list()
    break
  case 'theme':
    theme(args[1])
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
  init [dir]      Copy theme.css to your project
  list            List all available components
  theme <hex>     Generate theme from brand color
  help            Show this help message
`)
}
