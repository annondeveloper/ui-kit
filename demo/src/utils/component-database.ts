// ─── Component Database ─────────────────────────────────────────────────────
// Registry of ALL 147 components for the AI Code Generator.

export interface ComponentInfo {
  name: string
  category: 'primitives' | 'forms' | 'navigation' | 'overlays' | 'data-display' | 'monitoring' | 'visual-effects' | 'ai-realtime' | 'layout' | 'infrastructure'
  description: string
  props: string[]
  importPath: string
  example: string
}

// ─── Pre-computed search index for fast lookups ─────────────────────────────

let _searchIndex: Map<string, string> | null = null

function getSearchIndex(): Map<string, string> {
  if (_searchIndex) return _searchIndex
  _searchIndex = new Map()
  for (const c of DATABASE) {
    _searchIndex.set(
      c.name,
      `${c.name} ${c.description} ${c.category} ${c.props.join(' ')}`.toLowerCase(),
    )
  }
  return _searchIndex
}

// ─── Category index for fast filtering ──────────────────────────────────────

let _categoryIndex: Map<string, ComponentInfo[]> | null = null

function getCategoryIndex(): Map<string, ComponentInfo[]> {
  if (_categoryIndex) return _categoryIndex
  _categoryIndex = new Map()
  for (const c of DATABASE) {
    const list = _categoryIndex.get(c.category) ?? []
    list.push(c)
    _categoryIndex.set(c.category, list)
  }
  return _categoryIndex
}

const DATABASE: ComponentInfo[] = [
  // ── Primitives ──────────────────────────────────────────────────────────────
  {
    name: 'ActionIcon',
    category: 'primitives',
    description: 'Icon-only button with variant styling, loading state, and accessible label requirement.',
    props: ['variant', 'color', 'size', 'radius', 'loading'],
    importPath: '@annondeveloper/ui-kit',
    example: '<ActionIcon variant="filled" aria-label="Settings"><GearIcon /></ActionIcon>',
  },
  {
    name: 'Alert',
    category: 'primitives',
    description: 'Contextual feedback message with severity variants, dismiss button, and optional action.',
    props: ['variant', 'title', 'dismissible', 'action', 'banner'],
    importPath: '@annondeveloper/ui-kit',
    example: '<Alert variant="warning" title="Disk usage high">Storage is at 92%.</Alert>',
  },
  {
    name: 'AnimatedCounter',
    category: 'primitives',
    description: 'Animated number display that smoothly transitions between values with easing.',
    props: ['value', 'format', 'duration', 'motion'],
    importPath: '@annondeveloper/ui-kit',
    example: '<AnimatedCounter value={1234} />',
  },
  {
    name: 'Avatar',
    category: 'primitives',
    description: 'User avatar with image, initials fallback, status indicator, and group stacking.',
    props: ['src', 'name', 'size', 'status', 'icon'],
    importPath: '@annondeveloper/ui-kit',
    example: '<Avatar src="/avatar.jpg" name="Jane Doe" size="md" status="online" />',
  },
  {
    name: 'AvatarGroup',
    category: 'primitives',
    description: 'Stacked group of avatars with overflow count indicator.',
    props: ['max', 'size', 'children'],
    importPath: '@annondeveloper/ui-kit',
    example: '<AvatarGroup max={3}>\n  <Avatar name="Alice" />\n  <Avatar name="Bob" />\n</AvatarGroup>',
  },
  {
    name: 'Badge',
    category: 'primitives',
    description: 'Small label for status, counts, or categorization with color variants and optional dot.',
    props: ['variant', 'size', 'dot', 'count', 'removable'],
    importPath: '@annondeveloper/ui-kit',
    example: '<Badge variant="primary" dot>New</Badge>',
  },
  {
    name: 'Button',
    category: 'primitives',
    description: 'Primary action button with variants, sizes, loading states, and icon support.',
    props: ['variant', 'size', 'loading', 'icon', 'fullWidth'],
    importPath: '@annondeveloper/ui-kit',
    example: '<Button variant="primary" size="md">Click me</Button>',
  },
  {
    name: 'ButtonGroup',
    category: 'primitives',
    description: 'Groups buttons together with shared styling, orientation, and attached mode.',
    props: ['orientation', 'size', 'variant', 'attached'],
    importPath: '@annondeveloper/ui-kit',
    example: '<ButtonGroup attached>\n  <Button>Left</Button>\n  <Button>Right</Button>\n</ButtonGroup>',
  },
  {
    name: 'Card',
    category: 'primitives',
    description: 'Container with surface styling, header/footer sections, and expandable content.',
    props: ['variant', 'padding', 'interactive', 'header', 'footer'],
    importPath: '@annondeveloper/ui-kit',
    example: '<Card padding="lg" interactive>\n  <h3>Card Title</h3>\n  <p>Card content goes here.</p>\n</Card>',
  },
  {
    name: 'Chip',
    category: 'primitives',
    description: 'Selectable compact element for tags, filters, or choices with toggle behavior.',
    props: ['checked', 'onChange', 'variant', 'size', 'color'],
    importPath: '@annondeveloper/ui-kit',
    example: '<Chip checked={selected} onChange={setSelected}>React</Chip>',
  },
  {
    name: 'CopyButton',
    category: 'primitives',
    description: 'Render-prop button that copies a value to clipboard with copied state feedback.',
    props: ['value', 'timeout', 'children', 'size'],
    importPath: '@annondeveloper/ui-kit',
    example: '<CopyButton value="npm install">\n  {({ copied, copy }) => <Button onClick={copy}>{copied ? "Copied" : "Copy"}</Button>}\n</CopyButton>',
  },
  {
    name: 'Divider',
    category: 'primitives',
    description: 'Horizontal or vertical divider line with optional label.',
    props: ['orientation', 'variant', 'label', 'spacing'],
    importPath: '@annondeveloper/ui-kit',
    example: '<Divider label="OR" />',
  },
  {
    name: 'Indicator',
    category: 'primitives',
    description: 'Positional badge overlay on any element for notification dots or counts.',
    props: ['label', 'color', 'position', 'processing', 'withBorder'],
    importPath: '@annondeveloper/ui-kit',
    example: '<Indicator label="3" color="danger">\n  <Avatar name="User" />\n</Indicator>',
  },
  {
    name: 'Kbd',
    category: 'primitives',
    description: 'Keyboard key representation with styling for shortcuts and hotkey displays.',
    props: ['size', 'variant', 'children'],
    importPath: '@annondeveloper/ui-kit',
    example: '<Kbd>Ctrl</Kbd> + <Kbd>K</Kbd>',
  },
  {
    name: 'Link',
    category: 'primitives',
    description: 'Styled anchor element with underline modes, external link handling, and variant options.',
    props: ['variant', 'underline', 'external', 'size', 'href'],
    importPath: '@annondeveloper/ui-kit',
    example: '<Link href="/docs" variant="brand">Documentation</Link>',
  },
  {
    name: 'Progress',
    category: 'primitives',
    description: 'Progress bar with percentage, label, color variants, and animated fill.',
    props: ['value', 'max', 'size', 'variant', 'showValue'],
    importPath: '@annondeveloper/ui-kit',
    example: '<Progress value={65} max={100} variant="success" />',
  },
  {
    name: 'Skeleton',
    category: 'primitives',
    description: 'Loading placeholder with shimmer/pulse animation, supports text, circle, and rectangle shapes.',
    props: ['variant', 'width', 'height', 'lines', 'animation'],
    importPath: '@annondeveloper/ui-kit',
    example: '<Skeleton variant="text" lines={3} />',
  },
  {
    name: 'Spoiler',
    category: 'primitives',
    description: 'Collapsible content area with show/hide toggle and max-height constraint.',
    props: ['maxHeight', 'showLabel', 'hideLabel', 'initialState'],
    importPath: '@annondeveloper/ui-kit',
    example: '<Spoiler maxHeight={100} showLabel="Show more">\n  <p>Long content here...</p>\n</Spoiler>',
  },
  {
    name: 'StatusBadge',
    category: 'primitives',
    description: 'Status indicator badge with semantic colors for healthy/warning/critical/unknown states.',
    props: ['status', 'label', 'icon', 'size', 'pulse'],
    importPath: '@annondeveloper/ui-kit',
    example: '<StatusBadge status="ok" label="API Gateway" pulse />',
  },
  {
    name: 'StatusPulse',
    category: 'primitives',
    description: 'Animated pulsing dot indicator for real-time connection or health status.',
    props: ['status', 'size', 'label', 'motion'],
    importPath: '@annondeveloper/ui-kit',
    example: '<StatusPulse status="ok" label="Connected" />',
  },
  {
    name: 'SuccessCheckmark',
    category: 'primitives',
    description: 'Animated checkmark with particles for success confirmation feedback.',
    props: ['size', 'animated', 'label', 'motion'],
    importPath: '@annondeveloper/ui-kit',
    example: '<SuccessCheckmark size="lg" animated />',
  },
  {
    name: 'TextHighlight',
    category: 'primitives',
    description: 'Highlights matching substrings within text with customizable color and case sensitivity.',
    props: ['children', 'highlight', 'color', 'caseSensitive'],
    importPath: '@annondeveloper/ui-kit',
    example: '<TextHighlight highlight="react">Learn React today</TextHighlight>',
  },
  {
    name: 'Typography',
    category: 'primitives',
    description: 'Text rendering with semantic variants, fluid sizing, and text-wrap control.',
    props: ['variant', 'color', 'weight', 'align', 'truncate'],
    importPath: '@annondeveloper/ui-kit',
    example: '<Typography variant="h2">Heading</Typography>',
  },

  // ── Forms ───────────────────────────────────────────────────────────────────
  {
    name: 'AvatarUpload',
    category: 'forms',
    description: 'Avatar image upload with preview, remove button, and size/format validation.',
    props: ['value', 'onChange', 'onRemove', 'size', 'shape'],
    importPath: '@annondeveloper/ui-kit',
    example: '<AvatarUpload value={avatarUrl} onChange={handleUpload} shape="circle" />',
  },
  {
    name: 'Calendar',
    category: 'forms',
    description: 'Full calendar grid with date selection, disabled dates, locale support, and multi-month view.',
    props: ['value', 'onChange', 'minDate', 'maxDate', 'locale'],
    importPath: '@annondeveloper/ui-kit',
    example: '<Calendar value={date} onChange={setDate} />',
  },
  {
    name: 'Checkbox',
    category: 'forms',
    description: 'Checkbox with label, indeterminate state, and error message support.',
    props: ['label', 'checked', 'onChange', 'indeterminate', 'error'],
    importPath: '@annondeveloper/ui-kit',
    example: '<Checkbox label="I agree to the terms" />',
  },
  {
    name: 'ColorInput',
    category: 'forms',
    description: 'Color picker input with swatches, hex/rgb input, and preview swatch display.',
    props: ['value', 'onChange', 'label', 'swatches', 'showInput'],
    importPath: '@annondeveloper/ui-kit',
    example: '<ColorInput label="Brand Color" value={color} onChange={setColor} />',
  },
  {
    name: 'Combobox',
    category: 'forms',
    description: 'Searchable dropdown with type-ahead, create option, and async search support.',
    props: ['options', 'value', 'onChange', 'onSearch', 'allowCreate'],
    importPath: '@annondeveloper/ui-kit',
    example: '<Combobox name="fruit" options={fruits} placeholder="Pick a fruit" />',
  },
  {
    name: 'DatePicker',
    category: 'forms',
    description: 'Calendar date picker with text input, min/max dates, and locale support.',
    props: ['value', 'onChange', 'min', 'max', 'label'],
    importPath: '@annondeveloper/ui-kit',
    example: '<DatePicker label="Start Date" value={date} onChange={setDate} />',
  },
  {
    name: 'DateRangePicker',
    category: 'forms',
    description: 'Dual-calendar date range selector with preset ranges and min/max constraints.',
    props: ['value', 'onChange', 'presets', 'minDate', 'maxDate'],
    importPath: '@annondeveloper/ui-kit',
    example: '<DateRangePicker value={range} onChange={setRange} />',
  },
  {
    name: 'FileUpload',
    category: 'forms',
    description: 'Drag-and-drop file upload with preview, size limits, and multi-file support.',
    props: ['accept', 'multiple', 'maxSize', 'onChange', 'showPreview'],
    importPath: '@annondeveloper/ui-kit',
    example: '<FileUpload name="docs" accept="image/*" maxSize={5_000_000} onChange={setFiles} />',
  },
  {
    name: 'FilterPill',
    category: 'forms',
    description: 'Compact pill button for active filters with remove action and count badge.',
    props: ['label', 'active', 'onRemove', 'count', 'icon'],
    importPath: '@annondeveloper/ui-kit',
    example: '<FilterPill label="Status: Active" onRemove={clearFilter} />',
  },
  {
    name: 'FormInput',
    category: 'forms',
    description: 'Text input with label, description, error state, icons, and character count.',
    props: ['label', 'placeholder', 'error', 'icon', 'clearable'],
    importPath: '@annondeveloper/ui-kit',
    example: '<FormInput name="email" label="Email" placeholder="you@example.com" />',
  },
  {
    name: 'InlineEdit',
    category: 'forms',
    description: 'Click-to-edit text that toggles between display and input mode.',
    props: ['value', 'onChange', 'editTrigger', 'multiline', 'onSave'],
    importPath: '@annondeveloper/ui-kit',
    example: '<InlineEdit value={title} onChange={setTitle} />',
  },
  {
    name: 'MultiSelect',
    category: 'forms',
    description: 'Multi-value select with tags, search, clearable, and max selection limit.',
    props: ['options', 'value', 'onChange', 'searchable', 'maxSelected'],
    importPath: '@annondeveloper/ui-kit',
    example: '<MultiSelect options={languages} value={selected} onChange={setSelected} searchable />',
  },
  {
    name: 'NumberInput',
    category: 'forms',
    description: 'Numeric input with increment/decrement buttons, min/max, step, and precision control.',
    props: ['value', 'onChange', 'min', 'max', 'step'],
    importPath: '@annondeveloper/ui-kit',
    example: '<NumberInput label="Quantity" value={qty} onChange={setQty} min={0} max={100} />',
  },
  {
    name: 'OtpInput',
    category: 'forms',
    description: 'One-time password input with auto-focus advance and paste support.',
    props: ['length', 'value', 'onChange', 'onComplete', 'type'],
    importPath: '@annondeveloper/ui-kit',
    example: '<OtpInput length={6} onComplete={verify} />',
  },
  {
    name: 'PasswordInput',
    category: 'forms',
    description: 'Password field with visibility toggle and optional strength meter.',
    props: ['value', 'onChange', 'label', 'showStrengthMeter', 'visibilityToggle'],
    importPath: '@annondeveloper/ui-kit',
    example: '<PasswordInput label="Password" showStrengthMeter />',
  },
  {
    name: 'PinInput',
    category: 'forms',
    description: 'PIN code input with mask mode, auto-advance, and completion callback.',
    props: ['length', 'value', 'onChange', 'mask', 'onComplete'],
    importPath: '@annondeveloper/ui-kit',
    example: '<PinInput length={4} mask onComplete={handlePin} />',
  },
  {
    name: 'RadioGroup',
    category: 'forms',
    description: 'Radio button group with horizontal/vertical layout and accessible keyboard navigation.',
    props: ['options', 'value', 'onChange', 'orientation', 'label'],
    importPath: '@annondeveloper/ui-kit',
    example: '<RadioGroup name="plan" options={[\n  { value: "free", label: "Free" },\n  { value: "pro", label: "Pro" },\n]} />',
  },
  {
    name: 'Rating',
    category: 'forms',
    description: 'Star rating input with half-star precision, custom icons, and read-only mode.',
    props: ['value', 'onChange', 'max', 'allowHalf', 'readOnly'],
    importPath: '@annondeveloper/ui-kit',
    example: '<Rating value={rating} onChange={setRating} max={5} allowHalf />',
  },
  {
    name: 'SearchInput',
    category: 'forms',
    description: 'Search input with icon, clear button, loading state, and debounced onChange.',
    props: ['value', 'onChange', 'placeholder', 'debounce', 'clearable'],
    importPath: '@annondeveloper/ui-kit',
    example: '<SearchInput placeholder="Search components..." onChange={setQuery} />',
  },
  {
    name: 'SegmentedControl',
    category: 'forms',
    description: 'Pill-style toggle group for selecting between mutually exclusive options.',
    props: ['data', 'value', 'onChange', 'size', 'fullWidth'],
    importPath: '@annondeveloper/ui-kit',
    example: '<SegmentedControl data={["Daily", "Weekly", "Monthly"]} value={period} onChange={setPeriod} />',
  },
  {
    name: 'Select',
    category: 'forms',
    description: 'Dropdown select with search, groups, clearable, and multiple selection modes.',
    props: ['options', 'value', 'onChange', 'searchable', 'clearable'],
    importPath: '@annondeveloper/ui-kit',
    example: '<Select name="country" label="Country" options={[\n  { value: "us", label: "United States" },\n]} />',
  },
  {
    name: 'Slider',
    category: 'forms',
    description: 'Range slider with marks, steps, tick display, and value tooltip.',
    props: ['value', 'onChange', 'min', 'max', 'step'],
    importPath: '@annondeveloper/ui-kit',
    example: '<Slider min={0} max={100} value={50} onChange={setValue} />',
  },
  {
    name: 'TagInput',
    category: 'forms',
    description: 'Tag/chip input where users can add and remove tags with validation.',
    props: ['tags', 'onChange', 'placeholder', 'maxTags', 'validate'],
    importPath: '@annondeveloper/ui-kit',
    example: '<TagInput tags={tags} onChange={setTags} placeholder="Add tag..." />',
  },
  {
    name: 'Textarea',
    category: 'forms',
    description: 'Multi-line text input with auto-resize, character count, and min/max rows.',
    props: ['value', 'onChange', 'label', 'autosize', 'maxLength'],
    importPath: '@annondeveloper/ui-kit',
    example: '<Textarea label="Description" placeholder="Enter details..." />',
  },
  {
    name: 'TimePicker',
    category: 'forms',
    description: 'Time selection input with 12/24 hour format, minute step, and min/max time.',
    props: ['value', 'onChange', 'format', 'minuteStep', 'label'],
    importPath: '@annondeveloper/ui-kit',
    example: '<TimePicker label="Start Time" format="12h" value={time} onChange={setTime} />',
  },
  {
    name: 'ToggleSwitch',
    category: 'forms',
    description: 'On/off toggle switch with label and description.',
    props: ['checked', 'onChange', 'label', 'size', 'error'],
    importPath: '@annondeveloper/ui-kit',
    example: '<ToggleSwitch label="Dark Mode" checked={dark} onChange={setDark} />',
  },
  {
    name: 'TransferList',
    category: 'forms',
    description: 'Dual-list transfer widget for moving items between two lists with search.',
    props: ['value', 'onChange', 'titles', 'searchable', 'showTransferAll'],
    importPath: '@annondeveloper/ui-kit',
    example: '<TransferList value={[available, selected]} onChange={setLists} searchable />',
  },

  // ── Navigation ──────────────────────────────────────────────────────────────
  {
    name: 'Accordion',
    category: 'navigation',
    description: 'Expandable content panels with single or multiple open mode and variants.',
    props: ['items', 'type', 'defaultOpen', 'variant', 'size'],
    importPath: '@annondeveloper/ui-kit',
    example: '<Accordion items={[\n  { id: "1", title: "Section 1", content: <p>Content</p> },\n]} />',
  },
  {
    name: 'Breadcrumbs',
    category: 'navigation',
    description: 'Breadcrumb trail for hierarchical navigation with separator customization.',
    props: ['items', 'separator', 'maxVisible', 'onNavigate'],
    importPath: '@annondeveloper/ui-kit',
    example: '<Breadcrumbs items={[\n  { label: "Home", href: "/" },\n  { label: "Components" },\n]} />',
  },
  {
    name: 'Pagination',
    category: 'navigation',
    description: 'Page navigation with numbered buttons, prev/next, and sibling count control.',
    props: ['page', 'totalPages', 'onChange', 'siblingCount', 'size'],
    importPath: '@annondeveloper/ui-kit',
    example: '<Pagination page={currentPage} totalPages={20} onChange={setPage} />',
  },
  {
    name: 'Stepper',
    category: 'navigation',
    description: 'Step indicator for multi-step processes with clickable steps and orientation.',
    props: ['steps', 'activeStep', 'orientation', 'variant', 'onStepClick'],
    importPath: '@annondeveloper/ui-kit',
    example: '<Stepper steps={[\n  { label: "Account" },\n  { label: "Profile" },\n  { label: "Review" },\n]} activeStep={1} />',
  },
  {
    name: 'TableOfContents',
    category: 'navigation',
    description: 'Sidebar navigation that tracks scroll position and highlights active section.',
    props: ['items', 'activeId', 'scrollSpy', 'variant', 'size'],
    importPath: '@annondeveloper/ui-kit',
    example: '<TableOfContents items={tocItems} scrollSpy />',
  },
  {
    name: 'Tabs',
    category: 'navigation',
    description: 'Tab navigation with panels, closable tabs, variants, and lazy rendering.',
    props: ['tabs', 'activeTab', 'onChange', 'variant', 'orientation'],
    importPath: '@annondeveloper/ui-kit',
    example: '<Tabs tabs={[\n  { id: "overview", label: "Overview" },\n  { id: "details", label: "Details" },\n]} defaultTab="overview">\n  <TabPanel tabId="overview">Overview content</TabPanel>\n</Tabs>',
  },
  {
    name: 'Timeline',
    category: 'navigation',
    description: 'Vertical or alternate timeline with customizable connectors and icons.',
    props: ['items', 'variant', 'size', 'connectorStyle', 'motion'],
    importPath: '@annondeveloper/ui-kit',
    example: '<Timeline items={[\n  { title: "Created", description: "Issue opened", time: "2h ago" },\n]} />',
  },

  // ── Layout ──────────────────────────────────────────────────────────────────
  {
    name: 'Affix',
    category: 'layout',
    description: 'Fixed-position element anchored to viewport edges with z-index control.',
    props: ['position', 'zIndex', 'withinPortal', 'target'],
    importPath: '@annondeveloper/ui-kit',
    example: '<Affix position={{ bottom: 20, right: 20 }}>\n  <Button>Help</Button>\n</Affix>',
  },
  {
    name: 'AppShell',
    category: 'layout',
    description: 'Application layout shell with navbar, sidebar, and footer slots.',
    props: ['navbar', 'sidebar', 'footer', 'sidebarCollapsed', 'sidebarPosition'],
    importPath: '@annondeveloper/ui-kit',
    example: '<AppShell navbar={<Navbar />} sidebar={<Sidebar />}>\n  <main>Content</main>\n</AppShell>',
  },
  {
    name: 'BackToTop',
    category: 'layout',
    description: 'Floating button that scrolls to page top, appears after scrolling down.',
    props: ['visibleFrom', 'smooth', 'showProgress', 'size'],
    importPath: '@annondeveloper/ui-kit',
    example: '<BackToTop visibleFrom={300} />',
  },
  {
    name: 'Carousel',
    category: 'layout',
    description: 'Horizontal slide carousel with autoplay, dots, arrows, and slides-per-view control.',
    props: ['autoPlay', 'showArrows', 'showDots', 'loop', 'slidesPerView'],
    importPath: '@annondeveloper/ui-kit',
    example: '<Carousel showArrows showDots>\n  <div>Slide 1</div>\n  <div>Slide 2</div>\n</Carousel>',
  },
  {
    name: 'ContainerQuery',
    category: 'layout',
    description: 'Container-query wrapper providing width/height to children via render prop or CSS.',
    props: ['children'],
    importPath: '@annondeveloper/ui-kit',
    example: '<ContainerQuery>\n  {({ width }) => <p>{width > 600 ? "Wide" : "Narrow"}</p>}\n</ContainerQuery>',
  },
  {
    name: 'Navbar',
    category: 'layout',
    description: 'Responsive top navigation bar with logo, links, actions, and sticky mode.',
    props: ['logo', 'children', 'actions', 'sticky', 'transparent'],
    importPath: '@annondeveloper/ui-kit',
    example: '<Navbar logo={<Logo />} sticky>\n  <a href="/docs">Docs</a>\n</Navbar>',
  },
  {
    name: 'Sidebar',
    category: 'layout',
    description: 'Collapsible side navigation panel with items, icons, and width control.',
    props: ['collapsed', 'onCollapse', 'width', 'position', 'children'],
    importPath: '@annondeveloper/ui-kit',
    example: '<Sidebar collapsed={collapsed}>\n  <SidebarItem icon={<HomeIcon />} label="Home" active />\n</Sidebar>',
  },
  {
    name: 'UIProvider',
    category: 'layout',
    description: 'Root provider that sets theme tokens, color mode, motion level, and density.',
    props: ['theme', 'mode', 'motion', 'density', 'onModeChange'],
    importPath: '@annondeveloper/ui-kit',
    example: '<UIProvider mode="dark" motion={3}>\n  <App />\n</UIProvider>',
  },

  // ── Overlays ────────────────────────────────────────────────────────────────
  {
    name: 'ConfirmDialog',
    category: 'overlays',
    description: 'Confirmation modal with confirm/cancel actions, danger variant, and loading state.',
    props: ['open', 'onConfirm', 'onCancel', 'title', 'variant'],
    importPath: '@annondeveloper/ui-kit',
    example: '<ConfirmDialog open={open} title="Delete item?" variant="danger" onConfirm={del} onCancel={close} />',
  },
  {
    name: 'Dialog',
    category: 'overlays',
    description: 'Modal dialog using native <dialog> with backdrop, focus trap, and keyboard dismissal.',
    props: ['open', 'onClose', 'title', 'size', 'footer'],
    importPath: '@annondeveloper/ui-kit',
    example: '<Dialog open={open} onClose={() => setOpen(false)} title="Confirm">\n  <p>Are you sure?</p>\n</Dialog>',
  },
  {
    name: 'Drawer',
    category: 'overlays',
    description: 'Slide-in panel from any edge with overlay and focus management.',
    props: ['open', 'onClose', 'side', 'size', 'overlay'],
    importPath: '@annondeveloper/ui-kit',
    example: '<Drawer open={open} onClose={() => setOpen(false)} side="right">\n  Drawer content\n</Drawer>',
  },
  {
    name: 'DropdownMenu',
    category: 'overlays',
    description: 'Context or action menu with keyboard navigation and placement control.',
    props: ['items', 'children', 'placement', 'open', 'onOpenChange'],
    importPath: '@annondeveloper/ui-kit',
    example: '<DropdownMenu items={[\n  { label: "Edit", onSelect: edit },\n  { label: "Delete", onSelect: del },\n]}>\n  <Button>Actions</Button>\n</DropdownMenu>',
  },
  {
    name: 'NativeTooltip',
    category: 'overlays',
    description: 'Lightweight tooltip using the native HTML title attribute with zero JS overhead.',
    props: ['content', 'children'],
    importPath: '@annondeveloper/ui-kit',
    example: '<NativeTooltip content="More info">\n  <Button>Hover me</Button>\n</NativeTooltip>',
  },
  {
    name: 'Popover',
    category: 'overlays',
    description: 'Rich content popover with arrow, controlled/uncontrolled modes, and modal option.',
    props: ['content', 'children', 'placement', 'arrow', 'modal'],
    importPath: '@annondeveloper/ui-kit',
    example: '<Popover content={<div>Popover content</div>}>\n  <Button>Open</Button>\n</Popover>',
  },
  {
    name: 'Sheet',
    category: 'overlays',
    description: 'Bottom/side sheet panel overlay with title, description, and close button.',
    props: ['open', 'onClose', 'side', 'title', 'size'],
    importPath: '@annondeveloper/ui-kit',
    example: '<Sheet open={open} onClose={close} side="bottom" title="Details">\n  Sheet content\n</Sheet>',
  },
  {
    name: 'Spotlight',
    category: 'overlays',
    description: 'Command palette / spotlight search overlay with keyboard shortcut and fuzzy filtering.',
    props: ['actions', 'open', 'onOpenChange', 'shortcut', 'placeholder'],
    importPath: '@annondeveloper/ui-kit',
    example: '<Spotlight actions={spotlightActions} shortcut="meta+k" />',
  },
  {
    name: 'Tooltip',
    category: 'overlays',
    description: 'Contextual tooltip that appears on hover/focus with smart positioning.',
    props: ['content', 'children', 'placement', 'delay', 'interactive'],
    importPath: '@annondeveloper/ui-kit',
    example: '<Tooltip content="More info">\n  <Button>Hover me</Button>\n</Tooltip>',
  },

  // ── Data Display ────────────────────────────────────────────────────────────
  {
    name: 'CopyBlock',
    category: 'data-display',
    description: 'Syntax-highlighted code block with one-click copy, line numbers, and line highlighting.',
    props: ['code', 'language', 'showLineNumbers', 'highlight', 'title'],
    importPath: '@annondeveloper/ui-kit',
    example: '<CopyBlock code="const x = 42;" language="typescript" />',
  },
  {
    name: 'CoreChart',
    category: 'data-display',
    description: 'CPU/GPU core utilization heatmap grid with color scales and labels.',
    props: ['cores', 'columns', 'size', 'showLabels', 'colorScale'],
    importPath: '@annondeveloper/ui-kit',
    example: '<CoreChart cores={coreData} columns={8} colorScale="green-red" />',
  },
  {
    name: 'DataTable',
    category: 'data-display',
    description: 'Full-featured data table with sorting, pagination, column resizing, and row selection.',
    props: ['data', 'columns', 'sortable', 'selectable', 'paginated'],
    importPath: '@annondeveloper/ui-kit',
    example: '<DataTable\n  columns={[\n    { key: "name", header: "Name" },\n    { key: "status", header: "Status" },\n  ]}\n  data={rows}\n  sortable\n/>',
  },
  {
    name: 'DiffViewer',
    category: 'data-display',
    description: 'Side-by-side or unified diff viewer with line numbers and fold unchanged sections.',
    props: ['oldValue', 'newValue', 'mode', 'showLineNumbers', 'foldUnchanged'],
    importPath: '@annondeveloper/ui-kit',
    example: '<DiffViewer oldValue={before} newValue={after} mode="unified" />',
  },
  {
    name: 'EmptyState',
    category: 'data-display',
    description: 'Placeholder for empty content areas with icon, title, description, and action button.',
    props: ['icon', 'title', 'description', 'action', 'size'],
    importPath: '@annondeveloper/ui-kit',
    example: '<EmptyState title="No results" description="Try a different query" action={<Button>Reset</Button>} />',
  },
  {
    name: 'HeatmapCalendar',
    category: 'data-display',
    description: 'GitHub-style contribution heatmap calendar with color scale and date click handler.',
    props: ['data', 'colorScale', 'startDate', 'showTooltip', 'onDateClick'],
    importPath: '@annondeveloper/ui-kit',
    example: '<HeatmapCalendar data={contributions} />',
  },
  {
    name: 'JsonViewer',
    category: 'data-display',
    description: 'Interactive JSON tree viewer with expand/collapse, clipboard copy, and data type display.',
    props: ['data', 'initialExpandDepth', 'enableClipboard', 'sortKeys', 'theme'],
    importPath: '@annondeveloper/ui-kit',
    example: '<JsonViewer data={apiResponse} initialExpandDepth={2} />',
  },
  {
    name: 'KanbanColumn',
    category: 'data-display',
    description: 'Kanban board column with draggable cards, WIP limits, and collapse toggle.',
    props: ['title', 'cards', 'columnId', 'wipLimit', 'onCardMove'],
    importPath: '@annondeveloper/ui-kit',
    example: '<KanbanColumn columnId="todo" title="To Do" cards={todoCards} />',
  },
  {
    name: 'MetricCard',
    category: 'data-display',
    description: 'KPI metric display with value, trend indicator, sparkline, and status color.',
    props: ['title', 'value', 'change', 'trend', 'sparkline'],
    importPath: '@annondeveloper/ui-kit',
    example: '<MetricCard title="Revenue" value="$48,230" change={{ value: 12.5 }} trend="up" />',
  },
  {
    name: 'PropertyList',
    category: 'data-display',
    description: 'Key-value property list with optional two-column layout and striped rows.',
    props: ['items', 'columns', 'size', 'striped'],
    importPath: '@annondeveloper/ui-kit',
    example: '<PropertyList items={[\n  { label: "Hostname", value: "srv-01" },\n  { label: "IP", value: "10.0.0.1" },\n]} />',
  },
  {
    name: 'ResponsiveCard',
    category: 'data-display',
    description: 'Card that adapts layout (vertical/horizontal/compact) based on container width.',
    props: ['title', 'description', 'image', 'actions', 'variant'],
    importPath: '@annondeveloper/ui-kit',
    example: '<ResponsiveCard title="Article" description="Summary text" image={<img src="/thumb.jpg" />} />',
  },
  {
    name: 'RingChart',
    category: 'data-display',
    description: 'Circular progress/donut chart with animated fill, label, and customizable thickness.',
    props: ['value', 'max', 'size', 'thickness', 'showValue'],
    importPath: '@annondeveloper/ui-kit',
    example: '<RingChart value={75} max={100} size="md" showValue />',
  },
  {
    name: 'SmartTable',
    category: 'data-display',
    description: 'Enhanced DataTable wrapper with built-in search bar, column toggle, and pagination.',
    props: ['data', 'columns', 'searchable', 'columnToggle', 'paginated'],
    importPath: '@annondeveloper/ui-kit',
    example: '<SmartTable data={rows} columns={cols} searchable paginated />',
  },
  {
    name: 'SortableList',
    category: 'data-display',
    description: 'Drag-and-drop reorderable list with optional handle grip and orientation.',
    props: ['items', 'onChange', 'handle', 'orientation', 'disabled'],
    importPath: '@annondeveloper/ui-kit',
    example: '<SortableList items={listItems} onChange={setItems} handle />',
  },
  {
    name: 'Sparkline',
    category: 'data-display',
    description: 'Compact inline SVG sparkline chart with gradient fill and tooltip.',
    props: ['data', 'width', 'height', 'color', 'gradient'],
    importPath: '@annondeveloper/ui-kit',
    example: '<Sparkline data={[10, 30, 20, 50, 40]} height={32} />',
  },
  {
    name: 'StorageBar',
    category: 'data-display',
    description: 'Segmented horizontal bar showing storage/resource allocation breakdown.',
    props: ['segments', 'total', 'showLabels', 'showLegend', 'size'],
    importPath: '@annondeveloper/ui-kit',
    example: '<StorageBar segments={[\n  { label: "Used", value: 60, color: "blue" },\n  { label: "Free", value: 40, color: "gray" },\n]} total={100} />',
  },
  {
    name: 'ThresholdGauge',
    category: 'data-display',
    description: 'Semi-circular gauge with warning/critical threshold zones and animated needle.',
    props: ['value', 'thresholds', 'label', 'showValue', 'size'],
    importPath: '@annondeveloper/ui-kit',
    example: '<ThresholdGauge value={72} thresholds={{ warning: 70, critical: 90 }} />',
  },
  {
    name: 'TimeSeriesChart',
    category: 'data-display',
    description: 'Line/area chart for time-based data with multiple series, grid, and tooltip.',
    props: ['series', 'height', 'showGrid', 'showTooltip', 'showLegend'],
    importPath: '@annondeveloper/ui-kit',
    example: '<TimeSeriesChart\n  series={[{ key: "cpu", data: cpuData, color: "blue" }]}\n  height={300}\n/>',
  },
  {
    name: 'TreeView',
    category: 'data-display',
    description: 'Hierarchical tree with expand/collapse, multi-select, lazy loading, and guide lines.',
    props: ['nodes', 'selected', 'onSelect', 'expanded', 'showGuides'],
    importPath: '@annondeveloper/ui-kit',
    example: '<TreeView nodes={fileTree} onSelect={setSelected} showGuides />',
  },
  {
    name: 'TruncatedText',
    category: 'data-display',
    description: 'Text that truncates after N lines with optional expand toggle and tooltip.',
    props: ['text', 'lines', 'expandable', 'showTooltip'],
    importPath: '@annondeveloper/ui-kit',
    example: '<TruncatedText text={longText} lines={2} expandable />',
  },

  // ── Monitoring ──────────────────────────────────────────────────────────────
  {
    name: 'ConnectionTestPanel',
    category: 'monitoring',
    description: 'Sequential connection test display with pass/fail steps, retry, and cancel actions.',
    props: ['steps', 'title', 'onRetry', 'running', 'size'],
    importPath: '@annondeveloper/ui-kit',
    example: '<ConnectionTestPanel steps={testSteps} running onRetry={rerun} />',
  },
  {
    name: 'DashboardGrid',
    category: 'monitoring',
    description: 'Auto-layout grid for dashboard widgets with optional groups and responsive columns.',
    props: ['groups', 'columns', 'gap', 'children'],
    importPath: '@annondeveloper/ui-kit',
    example: '<DashboardGrid columns="auto" gap="md">\n  <MetricCard title="CPU" value="42%" />\n</DashboardGrid>',
  },
  {
    name: 'DiskMountBar',
    category: 'monitoring',
    description: 'Disk mount point usage bars showing used/free space per filesystem mount.',
    props: ['mounts', 'maxVisible', 'showFree', 'formatBytes', 'size'],
    importPath: '@annondeveloper/ui-kit',
    example: '<DiskMountBar mounts={[\n  { path: "/", used: 45e9, total: 100e9 },\n]} />',
  },
  {
    name: 'EntityCard',
    category: 'monitoring',
    description: 'Infrastructure entity card with status, metrics, tags, and quick actions.',
    props: ['name', 'status', 'type', 'metrics', 'tags'],
    importPath: '@annondeveloper/ui-kit',
    example: '<EntityCard name="web-01" type="Server" status="ok" metrics={[{ label: "CPU", value: "23%" }]} />',
  },
  {
    name: 'GeoMap',
    category: 'monitoring',
    description: 'SVG world map with plotted points, connection lines, and interactive hover/click.',
    props: ['points', 'connections', 'showLabels', 'interactive', 'onPointClick'],
    importPath: '@annondeveloper/ui-kit',
    example: '<GeoMap points={locations} connections={links} interactive />',
  },
  {
    name: 'LogViewer',
    category: 'monitoring',
    description: 'Scrollable log output with syntax highlighting, level filter, search, and auto-tail.',
    props: ['lines', 'maxLines', 'autoTail', 'search', 'filterLevel'],
    importPath: '@annondeveloper/ui-kit',
    example: '<LogViewer lines={logLines} autoTail search="ERROR" />',
  },
  {
    name: 'NetworkTrafficCard',
    category: 'monitoring',
    description: 'Network interface traffic card showing in/out bit rates, vendor, and status.',
    props: ['title', 'traffic', 'status', 'vendor', 'trend'],
    importPath: '@annondeveloper/ui-kit',
    example: '<NetworkTrafficCard title="eth0" traffic={{ inBps: 1e9, outBps: 5e8 }} status="ok" />',
  },
  {
    name: 'PipelineStage',
    category: 'monitoring',
    description: 'CI/CD pipeline visualization with connected stages showing status and duration.',
    props: ['stages', 'orientation', 'onStageClick', 'motion'],
    importPath: '@annondeveloper/ui-kit',
    example: '<PipelineStage stages={[\n  { id: "build", label: "Build", status: "success" },\n  { id: "test", label: "Test", status: "running" },\n]} />',
  },
  {
    name: 'PortStatusGrid',
    category: 'monitoring',
    description: 'Grid of network port status indicators with click handler and size variants.',
    props: ['ports', 'columns', 'size', 'onPortClick'],
    importPath: '@annondeveloper/ui-kit',
    example: '<PortStatusGrid ports={portData} columns={24} onPortClick={showPortInfo} />',
  },
  {
    name: 'RackDiagram',
    category: 'monitoring',
    description: 'Server rack visualization with device slots, unit numbers, and status indicators.',
    props: ['units', 'devices', 'showUnitNumbers', 'orientation', 'size'],
    importPath: '@annondeveloper/ui-kit',
    example: '<RackDiagram units={42} devices={rackDevices} showUnitNumbers />',
  },
  {
    name: 'ServiceStrip',
    category: 'monitoring',
    description: 'Horizontal strip of service status icons with overflow handling and click events.',
    props: ['services', 'maxVisible', 'size', 'onServiceClick'],
    importPath: '@annondeveloper/ui-kit',
    example: '<ServiceStrip services={[\n  { name: "API", status: "ok" },\n  { name: "DB", status: "warning" },\n]} />',
  },
  {
    name: 'SeverityTimeline',
    category: 'monitoring',
    description: 'Timeline of severity-colored events with expandable details and max visible limit.',
    props: ['events', 'orientation', 'expandable', 'maxVisible'],
    importPath: '@annondeveloper/ui-kit',
    example: '<SeverityTimeline events={incidents} expandable />',
  },
  {
    name: 'SwitchFaceplate',
    category: 'monitoring',
    description: 'Network switch faceplate visualization with port layout, labels, and click handler.',
    props: ['ports', 'rows', 'label', 'showLabels', 'onPortClick'],
    importPath: '@annondeveloper/ui-kit',
    example: '<SwitchFaceplate ports={switchPorts} rows={2} label="Switch-01" />',
  },
  {
    name: 'UpstreamDashboard',
    category: 'monitoring',
    description: 'ISP upstream link dashboard with hero/compact/table modes and summary aggregation.',
    props: ['links', 'title', 'mode', 'showSummary', 'groupBy'],
    importPath: '@annondeveloper/ui-kit',
    example: '<UpstreamDashboard links={upstreamLinks} mode="hero" showSummary />',
  },
  {
    name: 'UptimeTracker',
    category: 'monitoring',
    description: 'Visual uptime history bar with daily status squares and SLA target line.',
    props: ['days', 'slaTarget', 'showSla', 'motion'],
    importPath: '@annondeveloper/ui-kit',
    example: '<UptimeTracker days={uptimeDays} slaTarget={99.9} showSla />',
  },
  {
    name: 'UtilizationBar',
    category: 'monitoring',
    description: 'Segmented utilization bar with warning/critical thresholds and label display.',
    props: ['segments', 'max', 'thresholds', 'showLabels', 'size'],
    importPath: '@annondeveloper/ui-kit',
    example: '<UtilizationBar segments={[\n  { label: "CPU", value: 65 },\n]} thresholds={{ warning: 70, critical: 90 }} />',
  },

  // ── Infrastructure ──────────────────────────────────────────────────────────
  {
    name: 'CodeEditor',
    category: 'infrastructure',
    description: 'Lightweight code editor with syntax highlighting, line numbers, and tab support.',
    props: ['value', 'onChange', 'language', 'readOnly', 'showLineNumbers'],
    importPath: '@annondeveloper/ui-kit',
    example: '<CodeEditor language="typescript" value={code} onChange={setCode} />',
  },
  {
    name: 'ColumnVisibilityToggle',
    category: 'infrastructure',
    description: 'Dropdown toggle for showing/hiding table columns with reset option.',
    props: ['columns', 'onChange', 'onReset', 'motion'],
    importPath: '@annondeveloper/ui-kit',
    example: '<ColumnVisibilityToggle columns={columnConfig} onChange={toggleColumn} />',
  },
  {
    name: 'CommandBar',
    category: 'infrastructure',
    description: 'Command palette overlay with fuzzy search, keyboard shortcut activation, and groups.',
    props: ['items', 'open', 'onOpenChange', 'placeholder', 'shortcut'],
    importPath: '@annondeveloper/ui-kit',
    example: '<CommandBar items={commands} open={open} onOpenChange={setOpen} placeholder="Type a command..." />',
  },
  {
    name: 'Cropper',
    category: 'infrastructure',
    description: 'Image cropper with aspect ratio lock, zoom, rotate, and rounded output mode.',
    props: ['src', 'aspectRatio', 'onCrop', 'showZoom', 'rounded'],
    importPath: '@annondeveloper/ui-kit',
    example: '<Cropper src="/photo.jpg" aspectRatio={1} onCrop={handleCrop} />',
  },
  {
    name: 'CSVExportButton',
    category: 'infrastructure',
    description: 'Button that exports table data to CSV file download with column mapping.',
    props: ['data', 'filename', 'columns', 'onExport', 'size'],
    importPath: '@annondeveloper/ui-kit',
    example: '<CSVExportButton data={tableData} filename="export.csv" />',
  },
  {
    name: 'DensitySelector',
    category: 'infrastructure',
    description: 'Compact/comfortable/spacious density toggle for adjusting UI spacing.',
    props: ['value', 'onChange', 'size', 'motion'],
    importPath: '@annondeveloper/ui-kit',
    example: '<DensitySelector value={density} onChange={setDensity} />',
  },
  {
    name: 'InfiniteScroll',
    category: 'infrastructure',
    description: 'Infinite scrolling container with load-more trigger, loader, and pull-to-refresh.',
    props: ['onLoadMore', 'hasMore', 'loading', 'threshold', 'pullToRefresh'],
    importPath: '@annondeveloper/ui-kit',
    example: '<InfiniteScroll onLoadMore={fetchMore} hasMore={hasNext}>\n  {items.map(item => <Card key={item.id} />)}\n</InfiniteScroll>',
  },
  {
    name: 'NotificationStack',
    category: 'infrastructure',
    description: 'Stacked notification list with dismiss, mark-read, and dismiss-all actions.',
    props: ['notifications', 'onDismiss', 'onMarkAllRead', 'maxVisible'],
    importPath: '@annondeveloper/ui-kit',
    example: '<NotificationStack notifications={notifs} onDismiss={dismiss} />',
  },
  {
    name: 'RichTextEditor',
    category: 'infrastructure',
    description: 'WYSIWYG rich text editor with toolbar, formatting commands, and HTML output.',
    props: ['value', 'onChange', 'placeholder', 'toolbar', 'size'],
    importPath: '@annondeveloper/ui-kit',
    example: '<RichTextEditor value={html} onChange={setHtml} placeholder="Write something..." />',
  },
  {
    name: 'ScrollReveal',
    category: 'infrastructure',
    description: 'Wrapper that animates children into view on scroll with configurable animation.',
    props: ['animation', 'delay', 'threshold', 'once', 'stagger'],
    importPath: '@annondeveloper/ui-kit',
    example: '<ScrollReveal animation="fade-up">\n  <Card>Revealed on scroll</Card>\n</ScrollReveal>',
  },
  {
    name: 'StepWizard',
    category: 'infrastructure',
    description: 'Multi-step wizard with step indicators, navigation controls, and skip option.',
    props: ['steps', 'activeStep', 'onChange', 'orientation', 'allowSkip'],
    importPath: '@annondeveloper/ui-kit',
    example: '<StepWizard steps={wizardSteps} activeStep={step} onChange={setStep}>\n  {stepContent}\n</StepWizard>',
  },
  {
    name: 'TimeRangeSelector',
    category: 'infrastructure',
    description: 'Time range preset selector for dashboards with custom range option.',
    props: ['presets', 'value', 'onChange', 'showCustom'],
    importPath: '@annondeveloper/ui-kit',
    example: '<TimeRangeSelector value={range} onChange={setRange} />',
  },
  {
    name: 'ToastProvider',
    category: 'infrastructure',
    description: 'Toast notification provider with position control and useToast() hook for triggering.',
    props: ['position', 'maxVisible', 'motion', 'children'],
    importPath: '@annondeveloper/ui-kit',
    example: '<ToastProvider position="top-right">\n  <App />\n</ToastProvider>',
  },
  {
    name: 'Tour',
    category: 'infrastructure',
    description: 'Guided product tour with step-by-step highlights, tooltips, and progress indicator.',
    props: ['steps', 'open', 'onClose', 'onFinish', 'showProgress'],
    importPath: '@annondeveloper/ui-kit',
    example: '<Tour steps={tourSteps} open={showTour} onFinish={() => setShowTour(false)} />',
  },
  {
    name: 'ViewTransitionLink',
    category: 'infrastructure',
    description: 'Anchor link that triggers View Transitions API for smooth page navigation.',
    props: ['transitionName', 'href', 'children'],
    importPath: '@annondeveloper/ui-kit',
    example: '<ViewTransitionLink href="/about" transitionName="page">About</ViewTransitionLink>',
  },

  // ── Visual Effects ──────────────────────────────────────────────────────────
  {
    name: 'BackgroundBeams',
    category: 'visual-effects',
    description: 'Animated vertical light beams background with customizable count and color.',
    props: ['count', 'color', 'children', 'motion'],
    importPath: '@annondeveloper/ui-kit',
    example: '<BackgroundBeams count={8} color="oklch(75% 0.15 270)">\n  <h1>Hero</h1>\n</BackgroundBeams>',
  },
  {
    name: 'BackgroundBoxes',
    category: 'visual-effects',
    description: 'Animated grid of translucent boxes as a decorative background layer.',
    props: ['rows', 'cols', 'children', 'motion'],
    importPath: '@annondeveloper/ui-kit',
    example: '<BackgroundBoxes rows={12} cols={12}>\n  <h1>Content</h1>\n</BackgroundBoxes>',
  },
  {
    name: 'BorderBeam',
    category: 'visual-effects',
    description: 'Animated glowing beam that traces along the border of a container.',
    props: ['duration', 'color', 'size', 'children'],
    importPath: '@annondeveloper/ui-kit',
    example: '<BorderBeam duration={4}>\n  <Card>Premium content</Card>\n</BorderBeam>',
  },
  {
    name: 'Card3D',
    category: 'visual-effects',
    description: 'Card with 3D tilt effect on mouse move, optional glare, and perspective control.',
    props: ['perspective', 'maxTilt', 'glare', 'children'],
    importPath: '@annondeveloper/ui-kit',
    example: '<Card3D maxTilt={15} glare>\n  <p>Tilt me!</p>\n</Card3D>',
  },
  {
    name: 'EncryptedText',
    category: 'visual-effects',
    description: 'Text that scrambles through random characters before revealing the actual content.',
    props: ['text', 'trigger', 'speed', 'scrambleChars'],
    importPath: '@annondeveloper/ui-kit',
    example: '<EncryptedText text="Hello World" trigger="mount" />',
  },
  {
    name: 'EvervaultCard',
    category: 'visual-effects',
    description: 'Card with encrypted/matrix-style animated background that follows cursor position.',
    props: ['children', 'motion'],
    importPath: '@annondeveloper/ui-kit',
    example: '<EvervaultCard>\n  <p>Secure content</p>\n</EvervaultCard>',
  },
  {
    name: 'FlipWords',
    category: 'visual-effects',
    description: 'Cycling word animation that flips between provided words on an interval.',
    props: ['words', 'interval', 'motion'],
    importPath: '@annondeveloper/ui-kit',
    example: '<FlipWords words={["fast", "beautiful", "modern"]} />',
  },
  {
    name: 'GlowCard',
    category: 'visual-effects',
    description: 'Card with a radial glow effect that follows the cursor position.',
    props: ['glowColor', 'children', 'motion'],
    importPath: '@annondeveloper/ui-kit',
    example: '<GlowCard>\n  <p>Glowing content</p>\n</GlowCard>',
  },
  {
    name: 'HeroHighlight',
    category: 'visual-effects',
    description: 'Section with gradient highlight effect that responds to cursor movement.',
    props: ['children', 'motion'],
    importPath: '@annondeveloper/ui-kit',
    example: '<HeroHighlight>\n  <h1>Build <Highlight>amazing</Highlight> products</h1>\n</HeroHighlight>',
  },
  {
    name: 'MeteorShower',
    category: 'visual-effects',
    description: 'Decorative animated meteor streaks falling across a container background.',
    props: ['count', 'children', 'motion'],
    importPath: '@annondeveloper/ui-kit',
    example: '<MeteorShower count={20}>\n  <Card>Content</Card>\n</MeteorShower>',
  },
  {
    name: 'NumberTicker',
    category: 'visual-effects',
    description: 'Animated number counter that ticks up or down to the target value.',
    props: ['value', 'direction', 'delay', 'motion'],
    importPath: '@annondeveloper/ui-kit',
    example: '<NumberTicker value={1000} />',
  },
  {
    name: 'OrbitingCircles',
    category: 'visual-effects',
    description: 'Circular orbit animation with items rotating around a center point.',
    props: ['radius', 'duration', 'reverse', 'children'],
    importPath: '@annondeveloper/ui-kit',
    example: '<OrbitingCircles radius={120}>\n  <Icon1 />\n  <Icon2 />\n  <Icon3 />\n</OrbitingCircles>',
  },
  {
    name: 'Ripple',
    category: 'visual-effects',
    description: 'Click-triggered ripple effect overlay for interactive elements.',
    props: ['color', 'duration', 'children', 'motion'],
    importPath: '@annondeveloper/ui-kit',
    example: '<Ripple>\n  <Button>Click for ripple</Button>\n</Ripple>',
  },
  {
    name: 'ShimmerButton',
    category: 'visual-effects',
    description: 'Button with animated shimmer/glow sweep effect for prominent CTAs.',
    props: ['shimmerColor', 'size', 'children', 'motion'],
    importPath: '@annondeveloper/ui-kit',
    example: '<ShimmerButton size="lg">Get Started</ShimmerButton>',
  },
  {
    name: 'SpotlightCard',
    category: 'visual-effects',
    description: 'Card with a spotlight glow that follows cursor for interactive hover effect.',
    props: ['spotlightColor', 'children', 'motion'],
    importPath: '@annondeveloper/ui-kit',
    example: '<SpotlightCard>\n  <p>Hover to reveal spotlight</p>\n</SpotlightCard>',
  },
  {
    name: 'TextReveal',
    category: 'visual-effects',
    description: 'Text reveal animation triggered on mount or when scrolled into view.',
    props: ['text', 'trigger', 'speed', 'motion'],
    importPath: '@annondeveloper/ui-kit',
    example: '<TextReveal text="Welcome to the future" trigger="inView" />',
  },
  {
    name: 'TracingBeam',
    category: 'visual-effects',
    description: 'Vertical beam line that traces alongside content as user scrolls through.',
    props: ['color', 'children', 'motion'],
    importPath: '@annondeveloper/ui-kit',
    example: '<TracingBeam>\n  <article>Long-form content...</article>\n</TracingBeam>',
  },
  {
    name: 'WavyBackground',
    category: 'visual-effects',
    description: 'Animated wavy SVG background layer with customizable wave count and speed.',
    props: ['waveCount', 'speed', 'color', 'children'],
    importPath: '@annondeveloper/ui-kit',
    example: '<WavyBackground waveCount={5}>\n  <h1>Landing Hero</h1>\n</WavyBackground>',
  },

  // ── AI / Realtime ───────────────────────────────────────────────────────────
  {
    name: 'ConfidenceBar',
    category: 'ai-realtime',
    description: 'Horizontal bar showing AI confidence level with low/medium/high color thresholds.',
    props: ['value', 'label', 'showValue', 'thresholds', 'size'],
    importPath: '@annondeveloper/ui-kit',
    example: '<ConfidenceBar value={0.87} label="Confidence" showValue />',
  },
  {
    name: 'LiveFeed',
    category: 'ai-realtime',
    description: 'Real-time event feed with auto-scroll, pause/resume, and connection status.',
    props: ['items', 'maxItems', 'autoScroll', 'paused', 'connectionStatus'],
    importPath: '@annondeveloper/ui-kit',
    example: '<LiveFeed items={events} autoScroll connectionStatus="connected" />',
  },
  {
    name: 'RealtimeValue',
    category: 'ai-realtime',
    description: 'Numeric display that flashes on change and shows delta from previous value.',
    props: ['value', 'previousValue', 'format', 'showDelta', 'flashOnChange'],
    importPath: '@annondeveloper/ui-kit',
    example: '<RealtimeValue value={42.5} previousValue={41.2} showDelta flashOnChange />',
  },
  {
    name: 'StreamingText',
    category: 'ai-realtime',
    description: 'Text that renders character-by-character, simulating LLM streaming output.',
    props: ['text', 'streaming', 'showCursor', 'speed', 'onComplete'],
    importPath: '@annondeveloper/ui-kit',
    example: '<StreamingText text={response} streaming={isLoading} showCursor />',
  },
  {
    name: 'TypingIndicator',
    category: 'ai-realtime',
    description: 'Animated typing dots indicator for chat or messaging interfaces.',
    props: ['avatar', 'label', 'size', 'motion'],
    importPath: '@annondeveloper/ui-kit',
    example: '<TypingIndicator label="AI is thinking..." />',
  },
]

/**
 * Returns the full component database (148 components).
 */
export function getComponentDatabase(): ComponentInfo[] {
  return DATABASE
}

/**
 * Returns components filtered by category.
 */
export function getComponentsByCategory(category: ComponentInfo['category']): ComponentInfo[] {
  return getCategoryIndex().get(category) ?? []
}

/**
 * Returns all distinct categories.
 */
export function getCategories(): ComponentInfo['category'][] {
  return [...getCategoryIndex().keys()] as ComponentInfo['category'][]
}

/**
 * Fuzzy search components by name, description, category, and props.
 * Uses pre-computed search index for efficiency with the larger dataset.
 * Matches if every word in the query appears in any of the searchable fields.
 */
export function searchComponents(query: string): ComponentInfo[] {
  if (!query.trim()) return DATABASE

  const words = query.toLowerCase().split(/\s+/).filter(Boolean)
  const index = getSearchIndex()

  const results: ComponentInfo[] = []

  for (const c of DATABASE) {
    const haystack = index.get(c.name)!
    if (words.every((word) => haystack.includes(word))) {
      results.push(c)
    }
  }

  // Sort: exact name match first, then name-starts-with, then name-contains, then rest
  const firstWord = words[0]
  return results.sort((a, b) => {
    const aName = a.name.toLowerCase()
    const bName = b.name.toLowerCase()
    const aExact = aName === firstWord
    const bExact = bName === firstWord
    if (aExact && !bExact) return -1
    if (!aExact && bExact) return 1
    const aStartsWith = aName.startsWith(firstWord)
    const bStartsWith = bName.startsWith(firstWord)
    if (aStartsWith && !bStartsWith) return -1
    if (!aStartsWith && bStartsWith) return 1
    const aContains = aName.includes(firstWord)
    const bContains = bName.includes(firstWord)
    if (aContains && !bContains) return -1
    if (!aContains && bContains) return 1
    return 0
  })
}
