import { readFileSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'
import type { Registry, ComponentEntry } from './types.js'

let registry: Registry | null = null

export function loadRegistry(): Registry {
  if (registry) return registry
  // Load from dist/mcp/registry.json (relative to this file's compiled location)
  const __dirname = dirname(fileURLToPath(import.meta.url))
  // When bundled by tsup, this file is at dist/mcp/index.js
  // registry.json is at dist/mcp/registry.json (same directory)
  const registryPath = resolve(__dirname, 'registry.json')
  registry = JSON.parse(readFileSync(registryPath, 'utf-8'))
  return registry!
}

export function getComponent(name: string): ComponentEntry | null {
  const reg = loadRegistry()
  // Case-insensitive lookup
  const key = Object.keys(reg.components).find(k => k.toLowerCase() === name.toLowerCase())
  return key ? reg.components[key] : null
}

export interface SearchResult {
  name: string
  description: string
  score: number
  reason: string
  importStatement: string
}

export function searchComponents(query: string, limit = 10): SearchResult[] {
  const reg = loadRegistry()
  const words = query.toLowerCase().split(/\s+/).filter(Boolean)
  const results: SearchResult[] = []

  for (const [name, comp] of Object.entries(reg.components)) {
    let score = 0
    const reasons: string[] = []
    const nameLower = name.toLowerCase()

    for (const word of words) {
      if (nameLower === word) { score += 100; reasons.push(`Exact name match: ${name}`) }
      else if (nameLower.includes(word)) { score += 50; reasons.push(`Name contains "${word}"`) }
      if (comp.keywords.some(k => k === word || k.startsWith(word + '-') || k.endsWith('-' + word))) { score += 30; reasons.push(`Keyword match`) }
      if (comp.description.toLowerCase().includes(word)) { score += 20; reasons.push(`Description match`) }
      if (comp.props.some(p => p.name.toLowerCase().includes(word))) { score += 10; reasons.push(`Prop match`) }
      if (comp.category.toLowerCase().includes(word)) { score += 15; reasons.push(`Category match: ${comp.category}`) }
    }

    if (score > 0) {
      // Deduplicate reasons, join up to 3
      const uniqueReasons = [...new Set(reasons)].slice(0, 3).join('; ')
      results.push({ name, description: comp.description, score, reason: uniqueReasons, importStatement: comp.importStatement })
    }
  }

  // Boost related components: if a component scored, give +5 to its related components
  const scoreMap = new Map(results.map(r => [r.name, r]))
  for (const r of [...results]) {
    const comp = reg.components[r.name]
    if (!comp) continue
    for (const rel of comp.relatedComponents) {
      const existing = scoreMap.get(rel)
      if (existing) {
        existing.score += 5
        // Don't add reason — it's a subtle boost
      } else {
        // Related component didn't match directly; add it with a small score
        const relComp = reg.components[rel]
        if (relComp) {
          const entry: SearchResult = { name: rel, description: relComp.description, score: 5, reason: `Related to ${r.name}`, importStatement: relComp.importStatement }
          results.push(entry)
          scoreMap.set(rel, entry)
        }
      }
    }
  }

  return results.sort((a, b) => b.score - a.score).slice(0, limit)
}
