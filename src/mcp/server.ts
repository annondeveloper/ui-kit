import { McpServer, ResourceTemplate } from '@modelcontextprotocol/sdk/server/mcp.js'
import { z } from 'zod'
import { loadRegistry, getComponent, searchComponents } from './registry/loader.js'

export function createServer() {
  const reg = loadRegistry()
  const server = new McpServer({
    name: '@annondeveloper/ui-kit',
    version: reg.version,
  })

  // Tool 1: list_components
  server.tool('list_components', 'List all UI Kit components, optionally filtered by category or tier', {
    category: z.string().optional().describe('Filter by category'),
    tier: z.string().optional().describe('Filter by tier: standard, lite, or premium'),
  }, async ({ category, tier }) => {
    const reg = loadRegistry()
    let components = Object.values(reg.components)
    if (category) components = components.filter(c => c.category === category)
    if (tier) components = components.filter(c => c.tier.includes(tier))
    const list = components.map(c => `- **${c.name}** (${c.category}) — ${c.description}\n  Import: \`${c.importStatement}\``)
    return { content: [{ type: 'text' as const, text: `# Components (${components.length})\n\n${list.join('\n\n')}` }] }
  })

  // Tool 2: get_component
  server.tool('get_component', 'Get full API documentation for a specific component', {
    name: z.string().describe('Component name, e.g. "Button" or "Calendar"'),
  }, async ({ name }) => {
    const comp = getComponent(name)
    if (!comp) return { content: [{ type: 'text' as const, text: `Component "${name}" not found.` }] }

    const propsTable = comp.props.map(p =>
      `| \`${p.name}\` | \`${p.type}\` | ${p.required ? 'Yes' : 'No'} | ${p.default || '-'} | ${p.description} |`
    ).join('\n')

    const examples = comp.examples.map(e => `### ${e.title}\n\`\`\`tsx\n${e.code}\n\`\`\``).join('\n\n')

    const text = `# ${comp.name}

${comp.description}

## Import
\`\`\`tsx
${comp.importStatement}
\`\`\`

## Props
| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
${propsTable}

## Examples
${examples}

## Accessibility
${comp.accessibility}

## Related Components
${comp.relatedComponents.join(', ') || 'None'}

**Category:** ${comp.category} | **Tiers:** ${comp.tier.join(', ')}`

    return { content: [{ type: 'text' as const, text }] }
  })

  // Tool 3: search_components
  server.tool('search_components', 'Search components by use-case or keyword', {
    query: z.string().describe('Natural language search, e.g. "date selection with range"'),
    limit: z.number().optional().default(10).describe('Max results'),
  }, async ({ query, limit }) => {
    const results = searchComponents(query, limit)
    if (results.length === 0) return { content: [{ type: 'text' as const, text: `No components found for "${query}"` }] }
    const text = results.map((r, i) => `${i + 1}. **${r.name}** (score: ${r.score}) — ${r.description}\n   ${r.reason}\n   \`${r.importStatement}\``).join('\n\n')
    return { content: [{ type: 'text' as const, text: `# Search results for "${query}"\n\n${text}` }] }
  })

  // Tool 4: generate_snippet
  server.tool('generate_snippet', 'Generate working TSX code using UI Kit components', {
    components: z.array(z.string()).describe('Component names to use'),
    scenario: z.string().optional().describe('Description of what to build'),
  }, async ({ components: names, scenario }) => {
    const comps = names.map(n => getComponent(n)).filter(Boolean)
    if (comps.length === 0) return { content: [{ type: 'text' as const, text: 'No valid components found.' }] }

    // Deduplicate imports by package path
    const importSet = new Set(comps.map(c => c!.importStatement))
    const imports = Array.from(importSet).join('\n')

    // Build composable JSX — nest components logically
    const jsxParts: string[] = []
    for (const comp of comps) {
      if (!comp) continue
      const c = comp
      // Use first example if available, otherwise build from props
      if (c.examples.length > 0) {
        jsxParts.push(c.examples[0].code)
      } else {
        // Build minimal valid JSX from required props
        const requiredProps = c.props.filter(p => p.required)
        const propStr = requiredProps.map(p => {
          if (p.type.includes('string')) return `${p.name}="${p.name}"`
          if (p.type.includes('number')) return `${p.name}={0}`
          if (p.type.includes('boolean')) return p.name
          return `${p.name}={undefined}`
        }).join(' ')
        const hasChildren = c.props.some(p => p.name === 'children')
        jsxParts.push(hasChildren
          ? `<${c.name} ${propStr}>${c.name} content</${c.name}>`
          : `<${c.name} ${propStr} />`)
      }
    }

    const indent = '      '
    const snippet = jsxParts.join(`\n${indent}`)
    const code = `${imports}

export function ${scenario ? scenario.replace(/[^a-zA-Z0-9]/g, '').slice(0, 30) || 'Example' : 'Example'}() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      ${snippet}
    </div>
  )
}`

    const notes = [
      `Components used: ${comps.map(c => c!.name).join(', ')}`,
      comps.some(c => c!.tier.includes('premium')) ? 'Tip: Import from "@annondeveloper/ui-kit/premium" for enhanced animations' : '',
      'Wrap your app in <UIProvider> for theme and motion support',
    ].filter(Boolean).join('\n')

    return { content: [{ type: 'text' as const, text: `# Generated Snippet${scenario ? `: ${scenario}` : ''}\n\n\`\`\`tsx\n${code}\n\`\`\`\n\n## Notes\n${notes}` }] }
  })

  // Tool 5: get_theme
  server.tool('get_theme', 'Get theme tokens and CSS for a named theme', {
    name: z.string().describe('Theme name: aurora, sunset, rose, amber, ocean, emerald, cyan, violet, fuchsia, slate, corporate, midnight, forest, wine, carbon'),
    mode: z.enum(['dark', 'light']).optional().default('dark').describe('Color mode'),
  }, async ({ name, mode }) => {
    const reg = loadRegistry()
    const key = `${name}-${mode}`
    const theme = reg.themes[key] || reg.themes[name]
    if (!theme) return { content: [{ type: 'text' as const, text: `Theme "${name}" not found. Available: ${Object.keys(reg.themes).join(', ')}` }] }
    return { content: [{ type: 'text' as const, text: `# Theme: ${theme.name} (${mode})\n\nHex: \`${theme.hex}\`\n\n## CSS Tokens\n\`\`\`css\n${theme.css}\n\`\`\`\n\n## Usage\n\`\`\`tsx\nimport { applyTheme, generateTheme } from '@annondeveloper/ui-kit/theme'\n\nconst theme = generateTheme('${theme.hex}', '${mode}')\napplyTheme(theme)\n\`\`\`` }] }
  })

  // Tool 6: get_icons
  server.tool('get_icons', 'Browse built-in SVG icons', {
    search: z.string().optional().describe('Filter icons by name'),
  }, async ({ search }) => {
    const reg = loadRegistry()
    let icons = Object.values(reg.icons)
    if (search) icons = icons.filter(i => i.name.includes(search.toLowerCase()) || i.keywords.some(k => k.includes(search.toLowerCase())))
    const list = icons.map(i => `- **${i.name}** — \`<Icon name="${i.name}" />\``).join('\n')
    return { content: [{ type: 'text' as const, text: `# Icons (${icons.length})\n\nImport: \`import { Icon } from '@annondeveloper/ui-kit'\`\n\n${list}` }] }
  })

  // Resources: component://
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
    if (!comp) return { contents: [{ uri: uri.href, mimeType: 'text/plain', text: `Component "${name}" not found` }] }
    const propsDoc = comp.props.map(p => `- \`${p.name}${p.required ? '' : '?'}: ${p.type}\` ${p.default ? `(default: ${p.default})` : ''} — ${p.description}`).join('\n')
    return { contents: [{ uri: uri.href, mimeType: 'text/markdown', text: `# ${comp.name}\n\n${comp.description}\n\n## Import\n\`\`\`tsx\n${comp.importStatement}\n\`\`\`\n\n## Props\n${propsDoc}\n\n## Examples\n${comp.examples.map(e => `\`\`\`tsx\n${e.code}\n\`\`\``).join('\n\n')}` }] }
  })

  return server
}
