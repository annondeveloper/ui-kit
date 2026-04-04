/**
 * extract-component-meta.ts
 *
 * Single source of truth for component metadata. Extracts from TypeScript source:
 * - Props interfaces (name, type, required, default, description)
 * - Tier availability (lite/standard/premium)
 * - Component name, category, displayName
 * - Import paths per tier
 *
 * Output: dist/component-meta.json
 * Consumers: demo pages, code generators, MCP registry, Storybook
 *
 * Usage: npx tsx scripts/extract-component-meta.ts
 */

import { readFileSync, writeFileSync, existsSync, readdirSync } from 'fs'
import { resolve, basename } from 'path'
import * as ts from 'typescript'

const ROOT = resolve(import.meta.dirname, '..')
const COMPONENTS_DIR = resolve(ROOT, 'src/components')
const DOMAIN_DIR = resolve(ROOT, 'src/domain')
const LITE_DIR = resolve(ROOT, 'src/lite')
const PREMIUM_DIR = resolve(ROOT, 'src/premium')
const OUTPUT = resolve(ROOT, 'dist/component-meta.json')

interface PropMeta {
  name: string
  type: string
  required: boolean
  default?: string
  description: string
}

interface ComponentMeta {
  name: string
  fileName: string
  category: 'component' | 'domain'
  tiers: ('lite' | 'standard' | 'premium')[]
  imports: {
    standard: string
    lite?: string
    premium?: string
  }
  props: PropMeta[]
  displayName: string
}

// ─── TypeScript AST Prop Extraction ──────────────────────────────────────────

function extractPropsFromFile(filePath: string): { interfaceName: string; props: PropMeta[] }[] {
  const source = readFileSync(filePath, 'utf-8')
  const sourceFile = ts.createSourceFile(filePath, source, ts.ScriptTarget.Latest, true)
  const results: { interfaceName: string; props: PropMeta[] }[] = []

  function visit(node: ts.Node) {
    if (ts.isInterfaceDeclaration(node) && node.name.text.endsWith('Props')) {
      const isExported = node.modifiers?.some(m => m.kind === ts.SyntaxKind.ExportKeyword)
      if (!isExported) return

      const props: PropMeta[] = []
      for (const member of node.members) {
        if (ts.isPropertySignature(member) && member.name) {
          const name = (member.name as ts.Identifier).text
          const type = member.type ? source.slice(member.type.pos, member.type.end).trim() : 'unknown'
          const required = !member.questionToken

          // Extract JSDoc from preceding comment
          const fullText = source.slice(Math.max(0, member.pos - 300), member.pos)
          const jsdoc = fullText.match(/\/\*\*\s*([\s\S]*?)\s*\*\/\s*$/)
          const lineComment = fullText.match(/\/\/\s*(.+)\s*$/)
          const description = jsdoc
            ? jsdoc[1].replace(/\s*\*\s*/g, ' ').replace(/@\w+\s*/g, '').trim()
            : lineComment
              ? lineComment[1].trim()
              : ''

          props.push({ name, type, required, description })
        }
      }
      results.push({ interfaceName: node.name.text, props })
    }
    ts.forEachChild(node, visit)
  }

  visit(sourceFile)

  // Extract default values from destructuring patterns
  const defaultPattern = /(\w+)\s*=\s*(['"].*?['"]|true|false|\d+(?:\.\d+)?)/g
  const defaults = new Map<string, string>()
  let match
  while ((match = defaultPattern.exec(source)) !== null) {
    defaults.set(match[1], match[2])
  }
  for (const result of results) {
    for (const prop of result.props) {
      const def = defaults.get(prop.name)
      if (def) prop.default = def
    }
  }

  return results
}

// ─── Component Discovery ─────────────────────────────────────────────────────

function kebabToPascal(name: string): string {
  return name.replace(/(^|-)([a-z])/g, (_, __, c: string) => c.toUpperCase())
}

function discoverComponents(): ComponentMeta[] {
  const components: ComponentMeta[] = []

  const processDir = (dir: string, category: 'component' | 'domain') => {
    if (!existsSync(dir)) return
    const files = readdirSync(dir).filter(f => f.endsWith('.tsx') && !f.includes('.stories.'))

    for (const file of files) {
      const fileName = basename(file, '.tsx')
      if (fileName === 'index' || fileName === 'ui-provider') continue

      const componentName = kebabToPascal(fileName)
      const filePath = resolve(dir, file)

      const tiers: ('lite' | 'standard' | 'premium')[] = ['standard']
      if (existsSync(resolve(LITE_DIR, file))) tiers.unshift('lite')
      if (existsSync(resolve(PREMIUM_DIR, file))) tiers.push('premium')

      const extracted = extractPropsFromFile(filePath)
      const propsInterface = extracted.find(e =>
        e.interfaceName === componentName + 'Props' ||
        e.interfaceName.endsWith('Props')
      )

      const imports: ComponentMeta['imports'] = {
        standard: `import { ${componentName} } from '@annondeveloper/ui-kit'`,
      }
      if (tiers.includes('lite')) {
        imports.lite = `import { ${componentName} } from '@annondeveloper/ui-kit/lite'`
      }
      if (tiers.includes('premium')) {
        imports.premium = `import { ${componentName} } from '@annondeveloper/ui-kit/premium'`
      }

      components.push({
        name: componentName,
        fileName,
        category,
        tiers,
        imports,
        props: propsInterface?.props ?? [],
        displayName: componentName,
      })
    }
  }

  processDir(COMPONENTS_DIR, 'component')
  processDir(DOMAIN_DIR, 'domain')

  return components.sort((a, b) => a.name.localeCompare(b.name))
}

// ─── Main ────────────────────────────────────────────────────────────────────

const components = discoverComponents()

const meta = {
  version: JSON.parse(readFileSync(resolve(ROOT, 'package.json'), 'utf-8')).version,
  generatedAt: new Date().toISOString(),
  totalComponents: components.length,
  tierCounts: {
    standard: components.length,
    lite: components.filter(c => c.tiers.includes('lite')).length,
    premium: components.filter(c => c.tiers.includes('premium')).length,
  },
  components,
}

writeFileSync(OUTPUT, JSON.stringify(meta, null, 2))

console.log('[extract-component-meta] Generated ' + OUTPUT)
console.log('  Components: ' + meta.totalComponents)
console.log('  Standard: ' + meta.tierCounts.standard + ' | Lite: ' + meta.tierCounts.lite + ' | Premium: ' + meta.tierCounts.premium)
console.log('  Total props extracted: ' + components.reduce((sum, c) => sum + c.props.length, 0))
