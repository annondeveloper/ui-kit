import { describe, it, expect } from 'vitest'
import {
  getComponentDatabase,
  searchComponents,
  generateFromTemplate,
  generateFromComponents,
  type ComponentInfo,
  type GeneratedCode,
} from '../../ai'

const FRAMEWORK_KEYS: (keyof GeneratedCode)[] = ['react', 'reactTs', 'vue', 'svelte', 'html']

function expectGeneratedCode(code: GeneratedCode): void {
  for (const key of FRAMEWORK_KEYS) {
    expect(typeof code[key]).toBe('string')
    expect(code[key].length).toBeGreaterThan(0)
  }
}

describe('getComponentDatabase', () => {
  it('returns a non-empty array', () => {
    const db = getComponentDatabase()
    expect(Array.isArray(db)).toBe(true)
    expect(db.length).toBeGreaterThan(0)
  })

  it('returns correctly-shaped ComponentInfo entries', () => {
    const db = getComponentDatabase()
    for (const c of db) {
      expect(typeof c.name).toBe('string')
      expect(c.name.length).toBeGreaterThan(0)
      expect(typeof c.category).toBe('string')
      expect(typeof c.subcategory).toBe('string')
      expect(typeof c.description).toBe('string')
      expect(Array.isArray(c.tiers)).toBe(true)
      expect(c.tiers.length).toBeGreaterThan(0)
      // every component ships at least in the standard tier
      expect(c.tiers).toContain('standard')
    }
  })

  it('includes both general and domain categories', () => {
    const db = getComponentDatabase()
    const categories = new Set(db.map((c) => c.category))
    expect(categories.has('general')).toBe(true)
    expect(categories.has('domain')).toBe(true)
  })

  it('returns the same stable reference shape across calls', () => {
    const a = getComponentDatabase()
    const b = getComponentDatabase()
    expect(a.length).toBe(b.length)
  })
})

describe('searchComponents', () => {
  it('returns matches for a query', () => {
    const results = searchComponents('chart')
    expect(results.length).toBeGreaterThan(0)
    for (const c of results) {
      const haystack = `${c.name} ${c.description} ${c.subcategory}`.toLowerCase()
      expect(haystack.includes('chart')).toBe(true)
    }
    // TimeSeriesChart is a clear "chart" match
    expect(results.some((c) => c.name === 'TimeSeriesChart')).toBe(true)
  })

  it('is case-insensitive', () => {
    const lower = searchComponents('button')
    const upper = searchComponents('BUTTON')
    expect(lower.length).toBe(upper.length)
    expect(lower.length).toBeGreaterThan(0)
  })

  it('matches against the description and subcategory, not just name', () => {
    const results = searchComponents('clipboard')
    expect(results.length).toBeGreaterThan(0)
  })

  it('returns the full database for an empty or whitespace query', () => {
    const all = getComponentDatabase()
    expect(searchComponents('').length).toBe(all.length)
    expect(searchComponents('   ').length).toBe(all.length)
  })

  it('returns an empty array for a no-match query', () => {
    expect(searchComponents('zzzznotacomponentzzzz')).toEqual([])
  })
})

describe('generateFromTemplate', () => {
  const templates = ['dashboard', 'form', 'marketing', 'saas'] as const

  for (const template of templates) {
    it(`generates a full GeneratedCode for the "${template}" template`, () => {
      const code = generateFromTemplate(template)
      expectGeneratedCode(code)
    })
  }

  it('dashboard output references its key components', () => {
    const code = generateFromTemplate('dashboard')
    expect(code.reactTs).toContain('MetricCard')
    expect(code.reactTs).toContain('DataTable')
    expect(code.reactTs).toContain('TimeSeriesChart')
  })

  it('honors the tier option in import paths and component names', () => {
    const code = generateFromTemplate('dashboard', { tier: 'premium' })
    expect(code.react).toContain('@annondeveloper/ui-kit/premium')
    expect(code.react).toContain('PremiumMetricCard')

    const lite = generateFromTemplate('dashboard', { tier: 'lite' })
    expect(lite.react).toContain('@annondeveloper/ui-kit/lite')
    expect(lite.react).toContain('LiteMetricCard')
  })

  it('embeds the theme name into the HTML output', () => {
    const code = generateFromTemplate('marketing', { theme: 'sunset' })
    expect(code.html).toContain('sunset')
  })
})

describe('generateFromComponents', () => {
  it('produces non-empty output for a custom selection', () => {
    const code = generateFromComponents(['MetricCard', 'Button'], { framework: 'vue' })
    expectGeneratedCode(code)
  })

  it('includes the requested component names in every framework output', () => {
    const code = generateFromComponents(['MetricCard', 'Button'])
    for (const key of FRAMEWORK_KEYS) {
      expect(code[key]).toContain('MetricCard')
      expect(code[key]).toContain('Button')
    }
  })

  it('respects the grid layout option', () => {
    const code = generateFromComponents(['Card', 'Card'], { layout: 'grid' })
    expect(code.react).toContain('grid')
    expect(code.vue).toContain('grid')
  })

  it('respects the sidebar layout option', () => {
    const code = generateFromComponents(['Sidebar', 'DataTable'], { layout: 'sidebar' })
    expect(code.react).toContain('280px')
  })

  it('honors the standard tier import path by default', () => {
    const code = generateFromComponents(['Button'])
    expect(code.react).toContain("from '@annondeveloper/ui-kit'")
  })
})

describe('type contracts', () => {
  it('ComponentInfo carries the documented fields', () => {
    const sample: ComponentInfo = getComponentDatabase()[0]
    const keys = Object.keys(sample).sort()
    expect(keys).toEqual(['category', 'description', 'name', 'subcategory', 'tiers'])
  })
})
