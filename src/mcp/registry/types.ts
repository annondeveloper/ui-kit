export interface PropEntry {
  name: string
  type: string
  required: boolean
  default?: string
  description: string
}

export interface Example {
  title: string
  code: string
}

export interface ComponentEntry {
  name: string
  description: string
  category: string
  tier: string[]
  importPath: string
  importStatement: string
  sourceFile: string
  props: PropEntry[]
  examples: Example[]
  accessibility: string
  keywords: string[]
  relatedComponents: string[]
}

export interface ThemeEntry {
  name: string
  hex: string
  description: string
  tokens: Record<string, string>
  css: string
}

export interface IconEntry {
  name: string
  paths: string[]
  keywords: string[]
}

export interface Registry {
  version: string
  generatedAt: string
  componentCount: number
  components: Record<string, ComponentEntry>
  themes: Record<string, ThemeEntry>
  icons: Record<string, IconEntry>
  categories: Record<string, string[]>
}
