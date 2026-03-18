import { add } from './add.js'
import { init } from './init.js'
import { listComponents } from './list.js'

const HELP = `
  @annondeveloper/ui-kit CLI

  Usage: npx @annondeveloper/ui-kit <command> [options]

  Commands:
    init                Set up ui-kit in your project (copies theme.css + utils.ts)
    add <component>     Add a component to your project
    list                List all available components

  Options:
    --dir <path>        Target directory (default: ./components/ui)
    --overwrite         Overwrite existing files
    --help, -h          Show this help message
`

function parseArgs(argv: string[]): {
  command: string
  positional: string[]
  flags: Record<string, string | boolean>
} {
  const args = argv.slice(2)
  const command = args[0] || 'help'
  const positional: string[] = []
  const flags: Record<string, string | boolean> = {}

  for (let i = 1; i < args.length; i++) {
    const arg = args[i]
    if (arg === '--help' || arg === '-h') {
      flags.help = true
    } else if (arg === '--overwrite') {
      flags.overwrite = true
    } else if (arg === '--dir' && i + 1 < args.length) {
      flags.dir = args[++i]
    } else if (!arg.startsWith('-')) {
      positional.push(arg)
    } else {
      console.error(`  Unknown option: ${arg}`)
      process.exit(1)
    }
  }

  return { command, positional, flags }
}

function main(): void {
  const { command, positional, flags } = parseArgs(process.argv)

  if (flags.help || command === 'help' || command === '--help' || command === '-h') {
    console.log(HELP)
    process.exit(0)
  }

  const dir = (flags.dir as string) || './components/ui'
  const overwrite = !!flags.overwrite

  switch (command) {
    case 'init':
      console.log('')
      console.log('  Initializing @annondeveloper/ui-kit...')
      console.log('')
      init({ dir, overwrite })
      break

    case 'add': {
      const name = positional[0]
      if (!name) {
        console.error('  Error: Please specify a component name.')
        console.error('  Usage: npx @annondeveloper/ui-kit add <component>')
        console.error('  Run "npx @annondeveloper/ui-kit list" to see available components.')
        process.exit(1)
      }
      console.log('')
      add(name, { dir, overwrite })
      break
    }

    case 'list':
      listComponents()
      break

    default:
      console.error(`  Unknown command: ${command}`)
      console.log(HELP)
      process.exit(1)
  }
}

main()
