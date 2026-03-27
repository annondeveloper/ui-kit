#!/usr/bin/env node
/**
 * build-registry.ts
 *
 * Scans actual source files and generates a complete registry.json
 * describing every component, theme, and icon in the library.
 *
 * Run after TypeScript compilation:
 *   node dist/mcp/scripts/build-registry.js
 */

import * as fs from 'node:fs'
import * as path from 'node:path'
import type {
  Registry,
  ComponentEntry,
  PropEntry,
  Example,
  ThemeEntry,
  IconEntry,
} from '../registry/types'

// ─── Paths ──────────────────────────────────────────────────────────────────

const ROOT = path.resolve(import.meta.dirname ?? __dirname, '..', '..', '..')
const SRC = path.join(ROOT, 'src')
const COMPONENTS_INDEX = path.join(SRC, 'components', 'index.ts')
const DOMAIN_INDEX = path.join(SRC, 'domain', 'index.ts')
const THEMES_FILE = path.join(SRC, 'core', 'tokens', 'themes.ts')
const ICONS_FILE = path.join(SRC, 'core', 'icons', 'paths.ts')
const LITE_DIR = path.join(SRC, 'lite')
const PREMIUM_DIR = path.join(SRC, 'premium')
const PKG_JSON = path.join(ROOT, 'package.json')

const OUT_DIR = path.join(ROOT, 'dist', 'mcp')
const OUT_FILE = path.join(OUT_DIR, 'registry.json')

// ─── Helpers ────────────────────────────────────────────────────────────────

function readFile(filePath: string): string {
  try {
    return fs.readFileSync(filePath, 'utf-8')
  } catch {
    console.warn(`[build-registry] Warning: could not read ${filePath}`)
    return ''
  }
}

function fileExists(filePath: string): boolean {
  return fs.existsSync(filePath)
}

/** Convert PascalCase to kebab-case */
function toKebab(name: string): string {
  return name
    .replace(/([a-z0-9])([A-Z])/g, '$1-$2')
    .replace(/([A-Z])([A-Z][a-z])/g, '$1-$2')
    .toLowerCase()
}

/** Get package version from package.json */
function getVersion(): string {
  const pkg = JSON.parse(readFile(PKG_JSON))
  return pkg.version ?? '0.0.0'
}

// ─── Category mapping ───────────────────────────────────────────────────────

const CATEGORY_MAP: Record<string, string> = {
  // Form inputs
  Button: 'actions',
  ButtonGroup: 'actions',
  ActionIcon: 'actions',
  CopyButton: 'actions',

  FormInput: 'form-inputs',
  Select: 'form-inputs',
  Combobox: 'form-inputs',
  MultiSelect: 'form-inputs',
  ColorInput: 'form-inputs',
  FileUpload: 'form-inputs',
  InlineEdit: 'form-inputs',
  SearchInput: 'form-inputs',
  OtpInput: 'form-inputs',
  PinInput: 'form-inputs',
  TagInput: 'form-inputs',
  NumberInput: 'form-inputs',
  PasswordInput: 'form-inputs',
  Textarea: 'form-inputs',
  DatePicker: 'form-inputs',
  DateRangePicker: 'form-inputs',
  TimePicker: 'form-inputs',
  Checkbox: 'form-inputs',
  RadioGroup: 'form-inputs',
  ToggleSwitch: 'form-inputs',
  Slider: 'form-inputs',
  Rating: 'form-inputs',

  // Data display
  Badge: 'data-display',
  StatusBadge: 'data-display',
  StatusPulse: 'data-display',
  Avatar: 'data-display',
  AvatarGroup: 'data-display',
  AvatarUpload: 'data-display',
  Card: 'data-display',
  Skeleton: 'data-display',
  Progress: 'data-display',
  AnimatedCounter: 'data-display',
  SuccessCheckmark: 'data-display',
  Chip: 'data-display',
  Indicator: 'data-display',
  Kbd: 'data-display',
  Timeline: 'data-display',
  Stepper: 'data-display',
  Calendar: 'data-display',
  Typography: 'data-display',
  Link: 'data-display',
  Highlight: 'data-display',
  TextHighlight: 'data-display',
  Spoiler: 'data-display',
  Divider: 'data-display',

  // Overlays
  Tooltip: 'overlays',
  NativeTooltip: 'overlays',
  Popover: 'overlays',
  Dialog: 'overlays',
  ConfirmDialog: 'overlays',
  Sheet: 'overlays',
  DropdownMenu: 'overlays',
  Drawer: 'overlays',
  Spotlight: 'overlays',

  // Navigation
  Tabs: 'navigation',
  TabPanel: 'navigation',
  Breadcrumbs: 'navigation',
  Pagination: 'navigation',
  Sidebar: 'navigation',
  SidebarHeader: 'navigation',
  SidebarContent: 'navigation',
  SidebarFooter: 'navigation',
  SidebarItem: 'navigation',
  Navbar: 'navigation',
  AppShell: 'navigation',
  TableOfContents: 'navigation',
  SegmentedControl: 'navigation',
  Affix: 'navigation',
  BackToTop: 'navigation',

  // Layout
  Accordion: 'layout',
  Carousel: 'layout',
  FilterPill: 'layout',
  FilterPillGroup: 'layout',
  TransferList: 'layout',
  UIProvider: 'layout',
}

const DOMAIN_CATEGORY_MAP: Record<string, string> = {
  // Toast / notifications
  ToastProvider: 'feedback',
  NotificationStack: 'feedback',

  // Command & navigation
  CommandBar: 'navigation',
  StepWizard: 'navigation',
  Tour: 'navigation',

  // Scroll & animation
  ScrollReveal: 'animation',
  InfiniteScroll: 'data-display',
  ViewTransitionLink: 'navigation',

  // Cards & layout
  ResponsiveCard: 'data-display',
  EmptyState: 'data-display',
  PropertyList: 'data-display',
  EntityCard: 'data-display',
  ServiceStrip: 'data-display',

  // Tables & data
  DataTable: 'data-tables',
  SmartTable: 'data-tables',
  TreeView: 'data-tables',
  SortableList: 'data-tables',
  KanbanColumn: 'data-tables',
  DensitySelector: 'data-tables',
  ColumnVisibilityToggle: 'data-tables',
  CSVExportButton: 'data-tables',

  // Text & code
  TruncatedText: 'text-code',
  CopyBlock: 'text-code',
  DiffViewer: 'text-code',
  JsonViewer: 'text-code',
  CodeEditor: 'text-code',
  RichTextEditor: 'text-code',

  // Metrics & charts
  MetricCard: 'data-visualization',
  Sparkline: 'data-visualization',
  ThresholdGauge: 'data-visualization',
  RingChart: 'data-visualization',
  CoreChart: 'data-visualization',
  StorageBar: 'data-visualization',
  UtilizationBar: 'data-visualization',
  TimeSeriesChart: 'data-visualization',
  HeatmapCalendar: 'data-visualization',

  // Infrastructure
  RackDiagram: 'infrastructure',
  SeverityTimeline: 'infrastructure',
  LogViewer: 'infrastructure',
  PortStatusGrid: 'infrastructure',
  PipelineStage: 'infrastructure',
  UptimeTracker: 'infrastructure',
  TimeRangeSelector: 'infrastructure',
  SwitchFaceplate: 'infrastructure',
  DiskMountBar: 'infrastructure',
  ConnectionTestPanel: 'infrastructure',
  NetworkTrafficCard: 'infrastructure',
  DashboardGrid: 'infrastructure',
  GeoMap: 'infrastructure',
  UpstreamDashboard: 'infrastructure',

  // AI / realtime
  StreamingText: 'ai-realtime',
  TypingIndicator: 'ai-realtime',
  ConfidenceBar: 'ai-realtime',
  LiveFeed: 'ai-realtime',
  RealtimeValue: 'ai-realtime',

  // Magic UI effects
  ShimmerButton: 'magic-effects',
  BorderBeam: 'magic-effects',
  MeteorShower: 'magic-effects',
  GlowCard: 'magic-effects',
  TextReveal: 'magic-effects',
  OrbitingCircles: 'magic-effects',
  NumberTicker: 'magic-effects',
  Ripple: 'magic-effects',
  BackgroundBeams: 'magic-effects',
  WavyBackground: 'magic-effects',
  BackgroundBoxes: 'magic-effects',
  SpotlightCard: 'magic-effects',
  Card3D: 'magic-effects',
  EvervaultCard: 'magic-effects',
  FlipWords: 'magic-effects',
  EncryptedText: 'magic-effects',
  HeroHighlight: 'magic-effects',
  Highlight: 'magic-effects',
  TracingBeam: 'magic-effects',

  // Image
  Cropper: 'media',
}

function categorize(name: string, isDomain: boolean): string {
  if (isDomain) {
    return DOMAIN_CATEGORY_MAP[name] ?? 'domain-other'
  }
  return CATEGORY_MAP[name] ?? 'other'
}

// ─── Related components heuristics ──────────────────────────────────────────

const RELATED_GROUPS: string[][] = [
  ['Button', 'ButtonGroup', 'ActionIcon', 'CopyButton'],
  ['FormInput', 'NumberInput', 'PasswordInput', 'Textarea', 'SearchInput'],
  ['Select', 'Combobox', 'MultiSelect'],
  ['DatePicker', 'DateRangePicker', 'TimePicker', 'Calendar'],
  ['Checkbox', 'RadioGroup', 'ToggleSwitch'],
  ['Badge', 'StatusBadge', 'StatusPulse', 'Chip', 'Indicator'],
  ['Avatar', 'AvatarGroup', 'AvatarUpload'],
  ['Dialog', 'ConfirmDialog', 'Sheet', 'Drawer'],
  ['Tooltip', 'NativeTooltip', 'Popover'],
  ['Tabs', 'SegmentedControl'],
  ['Sidebar', 'Navbar', 'AppShell'],
  ['Breadcrumbs', 'Pagination', 'TableOfContents'],
  ['Progress', 'Skeleton'],
  ['OtpInput', 'PinInput'],
  ['FilterPill', 'FilterPillGroup', 'TagInput'],
  ['DataTable', 'SmartTable', 'DensitySelector', 'ColumnVisibilityToggle', 'CSVExportButton'],
  ['MetricCard', 'Sparkline', 'ThresholdGauge', 'RingChart', 'CoreChart'],
  ['StorageBar', 'UtilizationBar', 'DiskMountBar'],
  ['RackDiagram', 'SwitchFaceplate', 'PortStatusGrid'],
  ['StreamingText', 'TypingIndicator', 'ConfidenceBar'],
  ['CopyBlock', 'DiffViewer', 'JsonViewer', 'CodeEditor'],
  ['Timeline', 'Stepper', 'SeverityTimeline'],
  ['ShimmerButton', 'GlowCard', 'BorderBeam', 'SpotlightCard', 'Card3D'],
]

function getRelated(name: string): string[] {
  for (const group of RELATED_GROUPS) {
    if (group.includes(name)) {
      return group.filter((n) => n !== name)
    }
  }
  return []
}

// ─── Accessibility descriptions ─────────────────────────────────────────────

function getAccessibility(name: string): string {
  const lower = name.toLowerCase()

  if (/button|action/i.test(lower))
    return 'Uses native <button> element. Keyboard accessible via Enter/Space. Includes aria-disabled and aria-busy for loading state.'
  if (/dialog|confirm|sheet|drawer/i.test(lower))
    return 'Uses native <dialog> element with focus trap. Escape key closes. Returns focus on close. aria-modal and aria-labelledby set.'
  if (/tooltip|popover/i.test(lower))
    return 'Tooltip linked via aria-describedby. Shows on focus and hover. Popover uses native popover API when available.'
  if (/select|combobox|multi/i.test(lower))
    return 'Implements WAI-ARIA combobox/listbox pattern. Arrow key navigation, type-ahead, aria-expanded, aria-activedescendant.'
  if (/checkbox/i.test(lower))
    return 'Uses native <input type="checkbox">. Supports indeterminate state. Label associated via id.'
  if (/radio/i.test(lower))
    return 'Uses native <fieldset>/<input type="radio">. Arrow key navigation between options per WAI-ARIA radio group pattern.'
  if (/toggle|switch/i.test(lower))
    return 'Uses role="switch" with aria-checked. Toggled via Space/Enter. Meets 44px touch target minimum.'
  if (/slider/i.test(lower))
    return 'Uses native <input type="range">. Arrow keys adjust value. aria-valuemin, aria-valuemax, aria-valuenow set.'
  if (/tab/i.test(lower))
    return 'Implements WAI-ARIA tabs pattern. Arrow key navigation. role="tablist", role="tab", role="tabpanel" with aria-controls.'
  if (/menu|dropdown/i.test(lower))
    return 'Implements WAI-ARIA menu pattern. Arrow key navigation, Escape to close. role="menu" and role="menuitem".'
  if (/accordion/i.test(lower))
    return 'Uses native <details>/<summary> or WAI-ARIA accordion pattern. Enter/Space toggles sections.'
  if (/input|password|search|number|textarea|otp|pin|tag|date|time|color/i.test(lower))
    return 'Uses native form elements. Label association via aria-labelledby or <label>. Error states use aria-invalid and aria-describedby.'
  if (/breadcrumb/i.test(lower))
    return 'Uses <nav aria-label="Breadcrumb"> with <ol>. Current page marked with aria-current="page".'
  if (/pagination/i.test(lower))
    return 'Uses <nav aria-label="Pagination">. Current page marked with aria-current. Keyboard navigable.'
  if (/sidebar|navbar|nav/i.test(lower))
    return 'Uses <nav> landmark with aria-label. Keyboard navigable links. Collapsed state uses aria-expanded.'
  if (/alert/i.test(lower))
    return 'Uses role="alert" for screen reader announcement. Supports aria-live for dynamic content.'
  if (/skeleton/i.test(lower))
    return 'Uses aria-hidden="true" on skeleton elements. aria-busy="true" on parent container during loading.'
  if (/progress/i.test(lower))
    return 'Uses native <progress> or role="progressbar" with aria-valuenow, aria-valuemin, aria-valuemax.'
  if (/carousel/i.test(lower))
    return 'Uses role="region" with aria-roledescription="carousel". Slides use aria-label. Keyboard arrows navigate.'
  if (/table|data/i.test(lower))
    return 'Uses semantic <table> with proper <thead>, <th scope>, <tbody>. Sortable columns announce sort direction.'

  return 'Follows WAI-ARIA best practices. Keyboard accessible. Screen reader compatible.'
}

// ─── Parse export lines from index.ts ───────────────────────────────────────

interface ExportInfo {
  components: string[]
  propsTypes: string[]
  folderOrFile: string
}

function parseExportLines(indexContent: string): ExportInfo[] {
  const results: ExportInfo[] = []
  const lines = indexContent.split('\n')

  for (const line of lines) {
    // Match: export { Foo, type FooProps } from './bar'
    const exportMatch = line.match(
      /export\s*\{([^}]+)\}\s*from\s*['"]\.\/([^'"]+)['"]/
    )
    if (!exportMatch) continue

    const items = exportMatch[1]
    const folder = exportMatch[2]

    const components: string[] = []
    const propsTypes: string[] = []

    // Split on commas and categorize
    for (const item of items.split(',')) {
      const trimmed = item.trim()
      if (!trimmed) continue

      if (trimmed.startsWith('type ')) {
        const typeName = trimmed.replace('type ', '').trim()
        if (typeName.endsWith('Props')) {
          propsTypes.push(typeName)
        }
      } else {
        // Skip helper types and functions that aren't components (lowercase start)
        if (/^[A-Z]/.test(trimmed)) {
          components.push(trimmed)
        }
      }
    }

    if (components.length > 0) {
      results.push({ components, propsTypes, folderOrFile: folder })
    }
  }

  return results
}

// ─── Parse Props interface from .tsx source ─────────────────────────────────

function parsePropsFromSource(source: string, propsName: string): PropEntry[] {
  const props: PropEntry[] = []

  // Find the interface block: export interface FooProps extends ... { ... }
  // We need to handle multi-line blocks and nested braces
  const interfaceRegex = new RegExp(
    `export\\s+interface\\s+${escapeRegex(propsName)}[^{]*\\{`,
    's'
  )
  const startMatch = interfaceRegex.exec(source)
  if (!startMatch) return props

  const startIdx = startMatch.index + startMatch[0].length
  let depth = 1
  let endIdx = startIdx

  for (let i = startIdx; i < source.length && depth > 0; i++) {
    if (source[i] === '{') depth++
    if (source[i] === '}') depth--
    if (depth === 0) {
      endIdx = i
      break
    }
  }

  const body = source.slice(startIdx, endIdx)

  // Parse each prop line. Handle multiline JSDoc comments.
  // Strategy: split on lines, accumulate JSDoc, then match prop lines.
  const lines = body.split('\n')
  let currentJsdoc = ''

  for (const line of lines) {
    const trimmed = line.trim()

    // Accumulate JSDoc: /** ... */
    const jsdocInline = trimmed.match(/\/\*\*\s*(.*?)\s*\*\//)
    if (jsdocInline) {
      currentJsdoc = jsdocInline[1]
      // Check if this is a standalone line (no prop on same line)
      if (!trimmed.replace(jsdocInline[0], '').trim().match(/^\w/)) {
        continue
      }
    }

    // JSDoc opening
    if (trimmed.startsWith('/**')) {
      currentJsdoc = trimmed.replace(/\/\*\*\s*/, '').replace(/\s*\*\/$/, '')
      continue
    }
    // JSDoc continuation
    if (trimmed.startsWith('*') && !trimmed.startsWith('*/')) {
      currentJsdoc += ' ' + trimmed.replace(/^\*\s*/, '').replace(/\s*\*\/$/, '')
      continue
    }
    // JSDoc close
    if (trimmed === '*/') continue

    // Prop line: name?: type  or  name: type
    const propMatch = trimmed.match(/^(\w+)(\?)?:\s*(.+?)(?:\s*\/\/.*)?$/)
    if (propMatch) {
      const [, propName, optional, rawType] = propMatch
      // Skip the 'children' prop from HTMLAttributes extends
      if (propName === 'children') {
        currentJsdoc = ''
        continue
      }

      props.push({
        name: propName,
        type: cleanType(rawType),
        required: !optional,
        description: currentJsdoc.trim() || `The ${propName} property`,
      })
      currentJsdoc = ''
    } else {
      // If line doesn't match a prop pattern, reset jsdoc only if it's not part of one
      if (trimmed && !trimmed.startsWith('*') && !trimmed.startsWith('/')) {
        currentJsdoc = ''
      }
    }
  }

  return props
}

function cleanType(raw: string): string {
  // Remove trailing semicolons, commas, and trim
  return raw.replace(/[;,]\s*$/, '').trim()
}

function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

// ─── Parse default values from component function ───────────────────────────

function parseDefaults(
  source: string,
  componentName: string
): Record<string, string> {
  const defaults: Record<string, string> = {}

  // Match destructuring in function params:
  // function Foo({ variant = 'primary', size = 'md', ...props }: FooProps) {
  // or forwardRef<..., FooProps>(({ variant = 'primary', ...props }, ref) => {
  // or const Foo = ({ variant = 'primary' }: FooProps) => {

  // Generic pattern: find destructuring with defaults
  const destructureRegex =
    /\(\s*\{([^}]*)\}\s*(?::\s*\w+)?\s*(?:,\s*\w+)?\s*\)/gs
  let match: RegExpExecArray | null

  while ((match = destructureRegex.exec(source)) !== null) {
    const block = match[1]
    // Parse each `name = value` pair
    const defaultRegex = /(\w+)\s*=\s*([^,}]+)/g
    let dm: RegExpExecArray | null
    while ((dm = defaultRegex.exec(block)) !== null) {
      const [, name, val] = dm
      defaults[name] = val.trim()
    }
  }

  return defaults
}

// ─── Generate example code ──────────────────────────────────────────────────

function generateExamples(
  name: string,
  props: PropEntry[],
  isDomain: boolean
): Example[] {
  const examples: Example[] = []
  const importFrom = isDomain ? '@annondeveloper/ui-kit' : '@annondeveloper/ui-kit'

  // Basic usage
  const requiredProps = props.filter((p) => p.required)
  const basicPropsStr = requiredProps
    .map((p) => {
      if (p.type === 'string' || p.type === 'ReactNode') return `${p.name}="${sampleValue(p)}"`
      if (p.type === 'number') return `${p.name}={${sampleNumberValue(p)}}`
      if (p.type === 'boolean') return p.name
      if (p.type.includes('[]')) return `${p.name}={[]}`
      return `${p.name}={${sampleValue(p)}}`
    })
    .join(' ')

  const hasChildren = needsChildren(name)
  const childContent = hasChildren ? `Click me` : ''
  const selfClosing = !hasChildren && !childContent

  const basicJsx = selfClosing
    ? `<${name} ${basicPropsStr}/>`.replace(/\s+\/>/, ' />')
    : `<${name} ${basicPropsStr}>${childContent}</${name}>`.replace(
        /\s+>/,
        '>'
      )

  examples.push({
    title: 'Basic usage',
    code: `import { ${name} } from '${importFrom}'\n\n${basicJsx}`,
  })

  // Variant example (if component has variant prop)
  const variantProp = props.find((p) => p.name === 'variant')
  if (variantProp) {
    const variants = variantProp.type.match(/'([^']+)'/g)
    if (variants && variants.length > 1) {
      const secondVariant = variants[1].replace(/'/g, '')
      const variantJsx = selfClosing
        ? `<${name} variant="${secondVariant}" ${basicPropsStr}/>`
        : `<${name} variant="${secondVariant}" ${basicPropsStr}>${childContent}</${name}>`
      examples.push({
        title: `With ${secondVariant} variant`,
        code: variantJsx.replace(/\s+\/>/, ' />').replace(/\s+>/, '>'),
      })
    }
  }

  return examples
}

function sampleValue(prop: PropEntry): string {
  const name = prop.name.toLowerCase()
  if (name === 'title' || name === 'label') return 'Example'
  if (name === 'description') return 'A brief description'
  if (name === 'placeholder') return 'Enter value...'
  if (name === 'value') return 'value'
  if (name === 'name') return 'field-name'
  if (name.includes('url') || name.includes('href') || name.includes('src'))
    return 'https://example.com'
  if (name.includes('icon')) return '<Icon />'
  return 'value'
}

function sampleNumberValue(prop: PropEntry): number {
  const name = prop.name.toLowerCase()
  if (name.includes('count') || name.includes('total')) return 10
  if (name.includes('page')) return 1
  if (name.includes('size') || name.includes('length')) return 6
  return 0
}

function needsChildren(name: string): boolean {
  const withChildren = [
    'Button', 'ButtonGroup', 'Card', 'Dialog', 'ConfirmDialog',
    'Sheet', 'Drawer', 'Tooltip', 'Popover', 'Accordion',
    'Typography', 'Link', 'Alert', 'Spoiler', 'Sidebar',
    'SidebarHeader', 'SidebarContent', 'SidebarFooter',
    'AppShell', 'Navbar', 'UIProvider', 'ResponsiveCard',
    'ScrollReveal', 'InfiniteScroll', 'TracingBeam',
    'HeroHighlight', 'GlowCard', 'SpotlightCard', 'Card3D',
    'EvervaultCard', 'BackgroundBeams', 'WavyBackground',
    'BackgroundBoxes',
  ]
  return withChildren.includes(name)
}

// ─── Build keywords ─────────────────────────────────────────────────────────

function buildKeywords(
  name: string,
  props: PropEntry[],
  category: string,
  description: string
): string[] {
  const keywords = new Set<string>()

  // Name parts (PascalCase split)
  for (const part of name.split(/(?=[A-Z])/)) {
    if (part.length > 1) keywords.add(part.toLowerCase())
  }

  // Category
  keywords.add(category.replace(/-/g, ' '))

  // Select prop type keywords
  for (const prop of props) {
    if (prop.name === 'variant' || prop.name === 'size') {
      const values = prop.type.match(/'([^']+)'/g)
      if (values) {
        for (const v of values) keywords.add(v.replace(/'/g, ''))
      }
    }
  }

  // Common synonyms
  const lower = name.toLowerCase()
  if (lower.includes('input') || lower.includes('form')) keywords.add('form')
  if (lower.includes('button')) keywords.add('action')
  if (lower.includes('dialog') || lower.includes('modal'))
    keywords.add('modal')
  if (lower.includes('chart') || lower.includes('metric'))
    keywords.add('chart')
  if (lower.includes('table') || lower.includes('data'))
    keywords.add('table')

  return [...keywords]
}

// ─── Parse themes ───────────────────────────────────────────────────────────

interface ThemeRaw {
  name: string
  hex: string
}

function parseThemes(): ThemeRaw[] {
  const content = readFile(THEMES_FILE)
  const results: ThemeRaw[] = []

  // Match lines like: aurora: generateTheme('#6366f1'),
  const regex = /(\w+):\s*generateTheme\(\s*'(#[0-9a-fA-F]{6})'\s*\)/g
  let match: RegExpExecArray | null

  while ((match = regex.exec(content)) !== null) {
    // Only take the first occurrence of each name (dark mode)
    if (!results.find((r) => r.name === match![1])) {
      results.push({ name: match[1], hex: match[2] })
    }
  }

  return results
}

const THEME_DESCRIPTIONS: Record<string, string> = {
  aurora: 'Default Aurora Fluid identity — Indigo base',
  sunset: 'Warm orange sunset theme',
  rose: 'Vibrant rose/pink theme',
  amber: 'Warm amber/gold theme',
  ocean: 'Cool sky blue ocean theme',
  emerald: 'Fresh green emerald theme',
  cyan: 'Cool cyan/teal theme',
  violet: 'Rich purple violet theme',
  fuchsia: 'Vibrant magenta/fuchsia theme',
  slate: 'Neutral gray/slate theme',
  corporate: 'Professional deep corporate blue',
  midnight: 'Rich midnight indigo theme',
  forest: 'Deep forest green theme',
  wine: 'Rich burgundy/wine theme',
  carbon: 'Minimal carbon/near-black theme',
}

function buildThemeTokensAndCSS(hex: string): { tokens: Record<string, string>; css: string } {
  // We can't import the actual generator at build time easily (it has
  // dependencies on the color utils), so we produce a synthetic token
  // mapping. The MCP server can call generateTheme at runtime for exact values.
  // Here we document the token structure and reference hex.

  const TOKEN_TO_CSS: Record<string, string> = {
    brand: '--brand',
    brandLight: '--brand-light',
    brandDark: '--brand-dark',
    brandSubtle: '--brand-subtle',
    brandGlow: '--brand-glow',
    bgBase: '--bg-base',
    bgSurface: '--bg-surface',
    bgElevated: '--bg-elevated',
    bgOverlay: '--bg-overlay',
    borderSubtle: '--border-subtle',
    borderDefault: '--border-default',
    borderStrong: '--border-strong',
    borderGlow: '--border-glow',
    textPrimary: '--text-primary',
    textSecondary: '--text-secondary',
    textTertiary: '--text-tertiary',
    textDisabled: '--text-disabled',
    statusOk: '--status-ok',
    statusWarning: '--status-warning',
    statusCritical: '--status-critical',
    statusInfo: '--status-info',
    aurora1: '--aurora-1',
    aurora2: '--aurora-2',
  }

  const tokens: Record<string, string> = {}
  for (const [key, cssVar] of Object.entries(TOKEN_TO_CSS)) {
    tokens[cssVar] = `generateTheme('${hex}').${key}`
  }

  const cssLines = Object.entries(TOKEN_TO_CSS)
    .map(([key, cssVar]) => `  ${cssVar}: generateTheme('${hex}').${key};`)
    .join('\n')
  const css = `:root {\n${cssLines}\n}`

  return { tokens, css }
}

// ─── Parse icons ────────────────────────────────────────────────────────────

function parseIcons(): IconEntry[] {
  const content = readFile(ICONS_FILE)
  const icons: IconEntry[] = []

  // Match: 'icon-name': ['path1', 'path2', ...]
  // We need to handle multi-line arrays
  const regex = /'([^']+)':\s*\[([^\]]*)\]/gs
  let match: RegExpExecArray | null

  while ((match = regex.exec(content)) !== null) {
    const name = match[1]
    const pathsStr = match[2]

    const paths: string[] = []
    const pathRegex = /'([^']+)'/g
    let pm: RegExpExecArray | null
    while ((pm = pathRegex.exec(pathsStr)) !== null) {
      paths.push(pm[1])
    }

    // Generate keywords from icon name
    const keywords = name.split('-').filter((p) => p.length > 0)
    // Add semantic keywords
    const kw = [...keywords]
    if (name.includes('chevron') || name.includes('arrow')) kw.push('direction', 'navigation')
    if (name.includes('alert') || name.includes('info')) kw.push('status', 'notification')
    if (name.includes('check')) kw.push('success', 'confirm')
    if (name.includes('x')) kw.push('close', 'remove', 'cancel')
    if (name.includes('eye')) kw.push('visibility', 'show', 'hide')
    if (name.includes('edit') || name.includes('trash')) kw.push('crud', 'modify')
    if (name.includes('file') || name.includes('folder')) kw.push('filesystem')
    if (name.includes('sort')) kw.push('order', 'table')
    if (name.includes('git')) kw.push('version-control', 'vcs')

    icons.push({ name, paths, keywords: [...new Set(kw)] })
  }

  return icons
}

// ─── Determine tier ─────────────────────────────────────────────────────────

function determineTier(kebabName: string): string[] {
  const tiers: string[] = ['standard']

  const litePath = path.join(LITE_DIR, `${kebabName}.tsx`)
  if (fileExists(litePath)) {
    tiers.push('lite')
  }

  const premiumPath = path.join(PREMIUM_DIR, `${kebabName}.tsx`)
  if (fileExists(premiumPath)) {
    tiers.push('premium')
  }

  return tiers
}

// ─── Main build ─────────────────────────────────────────────────────────────

function buildRegistry(): Registry {
  const version = getVersion()
  const components: Record<string, ComponentEntry> = {}
  const categories: Record<string, string[]> = {}

  // Process general components
  const generalExports = parseExportLines(readFile(COMPONENTS_INDEX))
  for (const info of generalExports) {
    for (const name of info.components) {
      const kebab = toKebab(name)
      const sourceFile = `src/components/${info.folderOrFile}.tsx`
      const fullSourcePath = path.join(SRC, 'components', `${info.folderOrFile}.tsx`)

      let props: PropEntry[] = []
      let defaults: Record<string, string> = {}

      if (fileExists(fullSourcePath)) {
        const source = readFile(fullSourcePath)
        // Find the matching props type name
        const propsTypeName =
          info.propsTypes.find((t) => t === `${name}Props`) ?? `${name}Props`
        props = parsePropsFromSource(source, propsTypeName)
        defaults = parseDefaults(source, name)

        // Apply defaults to props
        for (const prop of props) {
          if (defaults[prop.name] !== undefined) {
            prop.default = defaults[prop.name]
          }
        }
      }

      const category = categorize(name, false)
      const tier = determineTier(kebab)
      const description = `${name} component — ${categoryDescription(category)}`
      const keywords = buildKeywords(name, props, category, description)
      const examples = generateExamples(name, props, false)
      const accessibility = getAccessibility(name)
      const related = getRelated(name)

      const entry: ComponentEntry = {
        name,
        description,
        category,
        tier,
        importPath: '@annondeveloper/ui-kit',
        importStatement: `import { ${name} } from '@annondeveloper/ui-kit'`,
        sourceFile,
        props,
        examples,
        accessibility,
        keywords,
        relatedComponents: related,
      }

      components[name] = entry

      // Build categories index
      if (!categories[category]) categories[category] = []
      if (!categories[category].includes(name)) categories[category].push(name)
    }
  }

  // Process domain components
  const domainExports = parseExportLines(readFile(DOMAIN_INDEX))
  for (const info of domainExports) {
    for (const name of info.components) {
      const kebab = toKebab(name)
      const sourceFile = `src/domain/${info.folderOrFile}.tsx`
      const fullSourcePath = path.join(SRC, 'domain', `${info.folderOrFile}.tsx`)

      let props: PropEntry[] = []
      let defaults: Record<string, string> = {}

      if (fileExists(fullSourcePath)) {
        const source = readFile(fullSourcePath)
        const propsTypeName =
          info.propsTypes.find((t) => t === `${name}Props`) ?? `${name}Props`
        props = parsePropsFromSource(source, propsTypeName)
        defaults = parseDefaults(source, name)

        for (const prop of props) {
          if (defaults[prop.name] !== undefined) {
            prop.default = defaults[prop.name]
          }
        }
      }

      const category = categorize(name, true)
      const tier = determineTier(kebab)
      const description = `${name} component — ${categoryDescription(category)}`
      const keywords = buildKeywords(name, props, category, description)
      const examples = generateExamples(name, props, true)
      const accessibility = getAccessibility(name)
      const related = getRelated(name)

      const entry: ComponentEntry = {
        name,
        description,
        category,
        tier,
        importPath: '@annondeveloper/ui-kit',
        importStatement: `import { ${name} } from '@annondeveloper/ui-kit'`,
        sourceFile,
        props,
        examples,
        accessibility,
        keywords,
        relatedComponents: related,
      }

      components[name] = entry

      if (!categories[category]) categories[category] = []
      if (!categories[category].includes(name)) categories[category].push(name)
    }
  }

  // Build themes
  const themeEntries: Record<string, ThemeEntry> = {}
  const rawThemes = parseThemes()
  for (const t of rawThemes) {
    const { tokens, css } = buildThemeTokensAndCSS(t.hex)
    themeEntries[t.name] = {
      name: t.name,
      hex: t.hex,
      description: THEME_DESCRIPTIONS[t.name] ?? `${t.name} theme`,
      tokens,
      css,
    }
  }

  // Build icons
  const iconEntries: Record<string, IconEntry> = {}
  const rawIcons = parseIcons()
  for (const icon of rawIcons) {
    iconEntries[icon.name] = icon
  }

  const registry: Registry = {
    version,
    generatedAt: new Date().toISOString(),
    componentCount: Object.keys(components).length,
    components,
    themes: themeEntries,
    icons: iconEntries,
    categories,
  }

  return registry
}

function categoryDescription(category: string): string {
  const map: Record<string, string> = {
    'actions': 'interactive action trigger',
    'form-inputs': 'form input control',
    'data-display': 'data display element',
    'overlays': 'overlay / popup layer',
    'navigation': 'navigation component',
    'layout': 'layout and structure',
    'feedback': 'user feedback and notification',
    'animation': 'animation and transition effect',
    'data-tables': 'data table and list management',
    'text-code': 'text and code display',
    'data-visualization': 'data visualization and charting',
    'infrastructure': 'infrastructure and operations monitoring',
    'ai-realtime': 'AI and realtime data display',
    'magic-effects': 'decorative animation effect',
    'media': 'media handling component',
    'domain-other': 'domain-specific component',
    'other': 'UI component',
  }
  return map[category] ?? 'UI component'
}

// ─── Execute ────────────────────────────────────────────────────────────────

function main(): void {
  console.log('[build-registry] Scanning source files...')

  const registry = buildRegistry()

  // Ensure output directory exists
  fs.mkdirSync(OUT_DIR, { recursive: true })

  // Write registry
  fs.writeFileSync(OUT_FILE, JSON.stringify(registry, null, 2), 'utf-8')

  console.log(
    `[build-registry] Wrote ${OUT_FILE} — ${registry.componentCount} components, ` +
      `${Object.keys(registry.themes).length} themes, ${Object.keys(registry.icons).length} icons`
  )
}

main()
