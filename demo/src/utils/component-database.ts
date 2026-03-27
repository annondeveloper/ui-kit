// ─── Component Database ─────────────────────────────────────────────────────
// Registry of the 30 most important components for the AI Code Generator.

export interface ComponentInfo {
  name: string
  category: 'primitives' | 'forms' | 'navigation' | 'overlays' | 'data-display' | 'monitoring' | 'visual-effects' | 'ai-realtime'
  description: string
  props: string[]
  importPath: string
  example: string
}

const DATABASE: ComponentInfo[] = [
  // ── Primitives ──────────────────────────────────────────────────────────────
  {
    name: 'Button',
    category: 'primitives',
    description: 'Primary action button with variants, sizes, loading states, and icon support.',
    props: ['variant', 'size', 'disabled', 'loading', 'leftIcon', 'rightIcon'],
    importPath: '@annondeveloper/ui-kit',
    example: '<Button variant="primary" size="md">Click me</Button>',
  },
  {
    name: 'Badge',
    category: 'primitives',
    description: 'Small label for status, counts, or categorization with color variants.',
    props: ['variant', 'size', 'color', 'dot'],
    importPath: '@annondeveloper/ui-kit',
    example: '<Badge variant="solid" color="blue">New</Badge>',
  },
  {
    name: 'Card',
    category: 'primitives',
    description: 'Container with surface styling, padding, and optional header/footer sections.',
    props: ['padding', 'radius', 'shadow', 'hoverable'],
    importPath: '@annondeveloper/ui-kit',
    example: '<Card padding="lg" hoverable>\n  <h3>Card Title</h3>\n  <p>Card content goes here.</p>\n</Card>',
  },
  {
    name: 'Avatar',
    category: 'primitives',
    description: 'User avatar with image, initials fallback, status indicator, and group stacking.',
    props: ['src', 'name', 'size', 'status', 'shape'],
    importPath: '@annondeveloper/ui-kit',
    example: '<Avatar src="/avatar.jpg" name="Jane Doe" size="md" status="online" />',
  },
  {
    name: 'Typography',
    category: 'primitives',
    description: 'Text rendering with semantic variants, fluid sizing, and text-wrap control.',
    props: ['variant', 'size', 'weight', 'color', 'align'],
    importPath: '@annondeveloper/ui-kit',
    example: '<Typography variant="h2">Heading</Typography>',
  },
  {
    name: 'Divider',
    category: 'primitives',
    description: 'Horizontal or vertical divider line with optional label.',
    props: ['orientation', 'label', 'color'],
    importPath: '@annondeveloper/ui-kit',
    example: '<Divider label="OR" />',
  },
  {
    name: 'Skeleton',
    category: 'primitives',
    description: 'Loading placeholder with pulse animation, supports text, circle, and rectangle shapes.',
    props: ['width', 'height', 'variant', 'animate'],
    importPath: '@annondeveloper/ui-kit',
    example: '<Skeleton width="200px" height="1rem" />',
  },
  {
    name: 'Chip',
    category: 'primitives',
    description: 'Compact element for tags, filters, or selections with optional remove button.',
    props: ['variant', 'size', 'removable', 'onRemove'],
    importPath: '@annondeveloper/ui-kit',
    example: '<Chip removable onRemove={() => {}}>React</Chip>',
  },

  // ── Forms ───────────────────────────────────────────────────────────────────
  {
    name: 'FormInput',
    category: 'forms',
    description: 'Text input with label, description, error state, and left/right sections.',
    props: ['label', 'placeholder', 'error', 'description', 'leftSection', 'rightSection'],
    importPath: '@annondeveloper/ui-kit',
    example: '<FormInput label="Email" placeholder="you@example.com" />',
  },
  {
    name: 'Select',
    category: 'forms',
    description: 'Dropdown select with search, groups, multi-select, and custom rendering.',
    props: ['label', 'options', 'value', 'onChange', 'placeholder', 'searchable'],
    importPath: '@annondeveloper/ui-kit',
    example: '<Select\n  label="Country"\n  options={[\n    { value: "us", label: "United States" },\n    { value: "uk", label: "United Kingdom" },\n  ]}\n/>',
  },
  {
    name: 'Checkbox',
    category: 'forms',
    description: 'Checkbox with label, indeterminate state, and group support.',
    props: ['label', 'checked', 'onChange', 'indeterminate', 'disabled'],
    importPath: '@annondeveloper/ui-kit',
    example: '<Checkbox label="I agree to the terms" />',
  },
  {
    name: 'DatePicker',
    category: 'forms',
    description: 'Calendar date picker with range selection, min/max dates, and locale support.',
    props: ['value', 'onChange', 'minDate', 'maxDate', 'locale'],
    importPath: '@annondeveloper/ui-kit',
    example: '<DatePicker label="Start Date" value={date} onChange={setDate} />',
  },
  {
    name: 'ToggleSwitch',
    category: 'forms',
    description: 'On/off toggle switch with label and description.',
    props: ['checked', 'onChange', 'label', 'size', 'disabled'],
    importPath: '@annondeveloper/ui-kit',
    example: '<ToggleSwitch label="Dark Mode" checked={dark} onChange={setDark} />',
  },
  {
    name: 'Slider',
    category: 'forms',
    description: 'Range slider with marks, steps, and min/max labels.',
    props: ['value', 'onChange', 'min', 'max', 'step', 'marks'],
    importPath: '@annondeveloper/ui-kit',
    example: '<Slider min={0} max={100} value={50} onChange={setValue} />',
  },
  {
    name: 'SearchInput',
    category: 'forms',
    description: 'Search input with icon, clear button, and debounced onChange.',
    props: ['value', 'onChange', 'placeholder', 'debounce'],
    importPath: '@annondeveloper/ui-kit',
    example: '<SearchInput placeholder="Search components..." onChange={setQuery} />',
  },

  // ── Navigation ──────────────────────────────────────────────────────────────
  {
    name: 'Tabs',
    category: 'navigation',
    description: 'Tab navigation with panels, icons, badges, and controlled/uncontrolled modes.',
    props: ['defaultValue', 'value', 'onChange', 'items'],
    importPath: '@annondeveloper/ui-kit',
    example: '<Tabs defaultValue="overview">\n  <Tabs.List>\n    <Tabs.Tab value="overview">Overview</Tabs.Tab>\n    <Tabs.Tab value="details">Details</Tabs.Tab>\n  </Tabs.List>\n  <Tabs.Panel value="overview">Overview content</Tabs.Panel>\n  <Tabs.Panel value="details">Details content</Tabs.Panel>\n</Tabs>',
  },
  {
    name: 'Breadcrumbs',
    category: 'navigation',
    description: 'Breadcrumb trail for hierarchical navigation with separator customization.',
    props: ['items', 'separator', 'maxItems'],
    importPath: '@annondeveloper/ui-kit',
    example: '<Breadcrumbs items={[\n  { label: "Home", href: "/" },\n  { label: "Components", href: "/components" },\n  { label: "Button" },\n]} />',
  },
  {
    name: 'Navbar',
    category: 'navigation',
    description: 'Responsive navigation bar with logo, links, and mobile hamburger menu.',
    props: ['logo', 'items', 'sticky', 'transparent'],
    importPath: '@annondeveloper/ui-kit',
    example: '<Navbar logo={<Logo />} items={navItems} sticky />',
  },

  // ── Overlays ────────────────────────────────────────────────────────────────
  {
    name: 'Dialog',
    category: 'overlays',
    description: 'Modal dialog with backdrop, focus trap, and keyboard dismissal. Uses native <dialog>.',
    props: ['open', 'onClose', 'title', 'size'],
    importPath: '@annondeveloper/ui-kit',
    example: '<Dialog open={open} onClose={() => setOpen(false)} title="Confirm">\n  <p>Are you sure?</p>\n  <Button onClick={() => setOpen(false)}>Close</Button>\n</Dialog>',
  },
  {
    name: 'Drawer',
    category: 'overlays',
    description: 'Slide-in panel from any edge with overlay and focus management.',
    props: ['open', 'onClose', 'position', 'size'],
    importPath: '@annondeveloper/ui-kit',
    example: '<Drawer open={open} onClose={() => setOpen(false)} position="right">\n  Drawer content\n</Drawer>',
  },
  {
    name: 'Tooltip',
    category: 'overlays',
    description: 'Contextual tooltip that appears on hover/focus with smart positioning.',
    props: ['content', 'position', 'delay'],
    importPath: '@annondeveloper/ui-kit',
    example: '<Tooltip content="More info">\n  <Button>Hover me</Button>\n</Tooltip>',
  },
  {
    name: 'DropdownMenu',
    category: 'overlays',
    description: 'Context menu or action menu with keyboard navigation and nested groups.',
    props: ['items', 'trigger', 'align'],
    importPath: '@annondeveloper/ui-kit',
    example: '<DropdownMenu\n  trigger={<Button>Actions</Button>}\n  items={[\n    { label: "Edit", onClick: edit },\n    { label: "Delete", onClick: del, variant: "danger" },\n  ]}\n/>',
  },

  // ── Data Display ────────────────────────────────────────────────────────────
  {
    name: 'DataTable',
    category: 'data-display',
    description: 'Full-featured data table with sorting, pagination, column resizing, and row selection.',
    props: ['columns', 'data', 'sortable', 'selectable', 'pagination'],
    importPath: '@annondeveloper/ui-kit',
    example: '<DataTable\n  columns={[\n    { key: "name", header: "Name" },\n    { key: "status", header: "Status" },\n    { key: "date", header: "Date" },\n  ]}\n  data={rows}\n  sortable\n  pagination={{ pageSize: 10 }}\n/>',
  },
  {
    name: 'MetricCard',
    category: 'data-display',
    description: 'KPI metric display with value, trend indicator, sparkline, and comparison.',
    props: ['title', 'value', 'change', 'trend', 'icon'],
    importPath: '@annondeveloper/ui-kit',
    example: '<MetricCard\n  title="Revenue"\n  value="$48,230"\n  change={12.5}\n  trend="up"\n/>',
  },
  {
    name: 'TimeSeriesChart',
    category: 'data-display',
    description: 'Line/area chart for time-based data with zoom, tooltip, and multiple series.',
    props: ['data', 'series', 'height', 'showGrid', 'animate'],
    importPath: '@annondeveloper/ui-kit',
    example: '<TimeSeriesChart\n  data={timeData}\n  series={[{ key: "value", color: "blue" }]}\n  height={300}\n/>',
  },
  {
    name: 'Progress',
    category: 'data-display',
    description: 'Progress bar with percentage, label, color variants, and animated fill.',
    props: ['value', 'max', 'size', 'color', 'label', 'animated'],
    importPath: '@annondeveloper/ui-kit',
    example: '<Progress value={65} max={100} color="blue" label="65% complete" />',
  },

  // ── Monitoring ──────────────────────────────────────────────────────────────
  {
    name: 'LogViewer',
    category: 'monitoring',
    description: 'Scrollable log output with syntax highlighting, search, and auto-scroll.',
    props: ['lines', 'maxLines', 'autoScroll', 'searchable', 'highlightLevel'],
    importPath: '@annondeveloper/ui-kit',
    example: '<LogViewer lines={logLines} autoScroll searchable />',
  },
  {
    name: 'StatusBadge',
    category: 'monitoring',
    description: 'Status indicator badge with semantic colors for healthy/warning/critical/unknown states.',
    props: ['status', 'label', 'pulse'],
    importPath: '@annondeveloper/ui-kit',
    example: '<StatusBadge status="healthy" label="API Gateway" pulse />',
  },

  // ── Visual Effects ──────────────────────────────────────────────────────────
  {
    name: 'ShimmerButton',
    category: 'visual-effects',
    description: 'Button with animated shimmer/glow effect for prominent CTAs.',
    props: ['children', 'shimmerColor', 'size', 'onClick'],
    importPath: '@annondeveloper/ui-kit',
    example: '<ShimmerButton size="lg">Get Started</ShimmerButton>',
  },

  // ── AI / Realtime ───────────────────────────────────────────────────────────
  {
    name: 'StreamingText',
    category: 'ai-realtime',
    description: 'Text that renders character-by-character, simulating LLM streaming output.',
    props: ['text', 'streaming', 'showCursor', 'speed', 'onComplete'],
    importPath: '@annondeveloper/ui-kit',
    example: '<StreamingText text={response} streaming={isLoading} showCursor />',
  },
]

/**
 * Returns the full component database (30 components).
 */
export function getComponentDatabase(): ComponentInfo[] {
  return DATABASE
}

/**
 * Fuzzy search components by name, description, and category.
 * Matches if every word in the query appears in any of the searchable fields.
 */
export function searchComponents(query: string): ComponentInfo[] {
  if (!query.trim()) return DATABASE

  const words = query.toLowerCase().split(/\s+/).filter(Boolean)

  return DATABASE.filter((c) => {
    const haystack = `${c.name} ${c.description} ${c.category} ${c.props.join(' ')}`.toLowerCase()
    return words.every((word) => haystack.includes(word))
  }).sort((a, b) => {
    // Prefer name matches first
    const aNameMatch = a.name.toLowerCase().includes(words[0])
    const bNameMatch = b.name.toLowerCase().includes(words[0])
    if (aNameMatch && !bNameMatch) return -1
    if (!aNameMatch && bNameMatch) return 1
    return 0
  })
}
