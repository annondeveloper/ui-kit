import { registry } from './registry.js'

/** Pretty-print all available components in a table format. */
export function listComponents(): void {
  console.log('')
  console.log('  Available components')
  console.log('  ' + '='.repeat(70))
  console.log('')

  const maxName = Math.max(...registry.map((c) => c.name.length))

  for (const comp of registry) {
    const name = comp.name.padEnd(maxName + 2)
    const deps =
      comp.internalDeps.length > 0
        ? `  [deps: ${comp.internalDeps.join(', ')}]`
        : ''
    console.log(`  ${name} ${comp.description}${deps}`)
  }

  console.log('')
  console.log(`  ${registry.length} components available`)
  console.log('')
}
