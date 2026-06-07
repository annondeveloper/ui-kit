// ─── AI Component Database ──────────────────────────────────────────────────
// In-bundle registry of every shipped component, with metadata for the AI
// Component Generator. This is pure, browser-safe TypeScript data — no fs/path
// access — so it tree-shakes cleanly into apps that import `@annondeveloper/ui-kit/ai`.

/**
 * Metadata describing a single component in the library.
 *
 * - `category` is the top-level grouping: `'general'` for `src/components`
 *   components, `'domain'` for specialized `src/domain` components.
 * - `subcategory` is the finer-grained grouping (e.g. `'forms'`, `'data-display'`).
 * - `tiers` lists the weight tiers the component ships in. Every component is
 *   available in `'standard'`; most are also in `'lite'` and `'premium'`.
 */
export interface ComponentInfo {
  name: string
  category: string
  subcategory: string
  description: string
  tiers: string[]
}

// ─── Database ───────────────────────────────────────────────────────────────
// All 148 shipped components. Sourced from the component metadata and the
// per-tier source directories (src/components, src/domain, src/lite, src/premium).

const DATABASE: ComponentInfo[] = [
  { name: 'ActionIcon', category: 'general', subcategory: 'primitives', description: 'Icon-only button with variant styling, loading state, and accessible label requirement.', tiers: ['lite', 'standard', 'premium'] },
  { name: 'Alert', category: 'general', subcategory: 'primitives', description: 'Contextual feedback message with severity variants, dismiss button, and optional action.', tiers: ['lite', 'standard', 'premium'] },
  { name: 'AnimatedCounter', category: 'general', subcategory: 'primitives', description: 'Animated number display that smoothly transitions between values with easing.', tiers: ['lite', 'standard', 'premium'] },
  { name: 'Avatar', category: 'general', subcategory: 'primitives', description: 'User avatar with image, initials fallback, status indicator, and group stacking.', tiers: ['lite', 'standard', 'premium'] },
  { name: 'AvatarGroup', category: 'general', subcategory: 'primitives', description: 'Stacked group of avatars with overflow count indicator.', tiers: ['standard'] },
  { name: 'Badge', category: 'general', subcategory: 'primitives', description: 'Small label for status, counts, or categorization with color variants and optional dot.', tiers: ['lite', 'standard', 'premium'] },
  { name: 'Button', category: 'general', subcategory: 'primitives', description: 'Primary action button with variants, sizes, loading states, and icon support.', tiers: ['lite', 'standard', 'premium'] },
  { name: 'ButtonGroup', category: 'general', subcategory: 'primitives', description: 'Groups buttons together with shared styling, orientation, and attached mode.', tiers: ['lite', 'standard', 'premium'] },
  { name: 'Card', category: 'general', subcategory: 'primitives', description: 'Container with surface styling, header/footer sections, and expandable content.', tiers: ['lite', 'standard', 'premium'] },
  { name: 'Chip', category: 'general', subcategory: 'primitives', description: 'Selectable compact element for tags, filters, or choices with toggle behavior.', tiers: ['lite', 'standard', 'premium'] },
  { name: 'CopyButton', category: 'general', subcategory: 'primitives', description: 'Render-prop button that copies a value to clipboard with copied state feedback.', tiers: ['lite', 'standard', 'premium'] },
  { name: 'Divider', category: 'general', subcategory: 'primitives', description: 'Horizontal or vertical divider line with optional label.', tiers: ['lite', 'standard', 'premium'] },
  { name: 'Indicator', category: 'general', subcategory: 'primitives', description: 'Positional badge overlay on any element for notification dots or counts.', tiers: ['lite', 'standard', 'premium'] },
  { name: 'Kbd', category: 'general', subcategory: 'primitives', description: 'Keyboard key representation with styling for shortcuts and hotkey displays.', tiers: ['lite', 'standard', 'premium'] },
  { name: 'Link', category: 'general', subcategory: 'primitives', description: 'Styled anchor element with underline modes, external link handling, and variant options.', tiers: ['lite', 'standard', 'premium'] },
  { name: 'Progress', category: 'general', subcategory: 'primitives', description: 'Progress bar with percentage, label, color variants, and animated fill.', tiers: ['lite', 'standard', 'premium'] },
  { name: 'Skeleton', category: 'general', subcategory: 'primitives', description: 'Loading placeholder with shimmer/pulse animation, supports text, circle, and rectangle shapes.', tiers: ['lite', 'standard', 'premium'] },
  { name: 'Spoiler', category: 'general', subcategory: 'primitives', description: 'Collapsible content area with show/hide toggle and max-height constraint.', tiers: ['lite', 'standard', 'premium'] },
  { name: 'StatusBadge', category: 'general', subcategory: 'primitives', description: 'Status indicator badge with semantic colors for healthy/warning/critical/unknown states.', tiers: ['lite', 'standard', 'premium'] },
  { name: 'StatusPulse', category: 'general', subcategory: 'primitives', description: 'Animated pulsing dot indicator for real-time connection or health status.', tiers: ['lite', 'standard', 'premium'] },
  { name: 'SuccessCheckmark', category: 'general', subcategory: 'primitives', description: 'Animated checkmark with particles for success confirmation feedback.', tiers: ['lite', 'standard', 'premium'] },
  { name: 'TextHighlight', category: 'general', subcategory: 'primitives', description: 'Highlights matching substrings within text with customizable color and case sensitivity.', tiers: ['lite', 'standard', 'premium'] },
  { name: 'Typography', category: 'general', subcategory: 'primitives', description: 'Text rendering with semantic variants, fluid sizing, and text-wrap control.', tiers: ['lite', 'standard', 'premium'] },
  { name: 'AvatarUpload', category: 'general', subcategory: 'forms', description: 'Avatar image upload with preview, remove button, and size/format validation.', tiers: ['lite', 'standard', 'premium'] },
  { name: 'Calendar', category: 'general', subcategory: 'forms', description: 'Full calendar grid with date selection, disabled dates, locale support, and multi-month view.', tiers: ['lite', 'standard', 'premium'] },
  { name: 'Checkbox', category: 'general', subcategory: 'forms', description: 'Checkbox with label, indeterminate state, and error message support.', tiers: ['lite', 'standard', 'premium'] },
  { name: 'ColorInput', category: 'general', subcategory: 'forms', description: 'Color picker input with swatches, hex/rgb input, and preview swatch display.', tiers: ['lite', 'standard', 'premium'] },
  { name: 'Combobox', category: 'general', subcategory: 'forms', description: 'Searchable dropdown with type-ahead, create option, and async search support.', tiers: ['lite', 'standard', 'premium'] },
  { name: 'DatePicker', category: 'general', subcategory: 'forms', description: 'Calendar date picker with text input, min/max dates, and locale support.', tiers: ['lite', 'standard', 'premium'] },
  { name: 'DateRangePicker', category: 'general', subcategory: 'forms', description: 'Dual-calendar date range selector with preset ranges and min/max constraints.', tiers: ['lite', 'standard', 'premium'] },
  { name: 'FileUpload', category: 'general', subcategory: 'forms', description: 'Drag-and-drop file upload with preview, size limits, and multi-file support.', tiers: ['lite', 'standard', 'premium'] },
  { name: 'FilterPill', category: 'general', subcategory: 'forms', description: 'Compact pill button for active filters with remove action and count badge.', tiers: ['lite', 'standard', 'premium'] },
  { name: 'FormInput', category: 'general', subcategory: 'forms', description: 'Text input with label, description, error state, icons, and character count.', tiers: ['lite', 'standard', 'premium'] },
  { name: 'InlineEdit', category: 'general', subcategory: 'forms', description: 'Click-to-edit text that toggles between display and input mode.', tiers: ['lite', 'standard', 'premium'] },
  { name: 'MultiSelect', category: 'general', subcategory: 'forms', description: 'Multi-value select with tags, search, clearable, and max selection limit.', tiers: ['lite', 'standard', 'premium'] },
  { name: 'NumberInput', category: 'general', subcategory: 'forms', description: 'Numeric input with increment/decrement buttons, min/max, step, and precision control.', tiers: ['lite', 'standard', 'premium'] },
  { name: 'OtpInput', category: 'general', subcategory: 'forms', description: 'One-time password input with auto-focus advance and paste support.', tiers: ['lite', 'standard', 'premium'] },
  { name: 'PasswordInput', category: 'general', subcategory: 'forms', description: 'Password field with visibility toggle and optional strength meter.', tiers: ['lite', 'standard', 'premium'] },
  { name: 'PinInput', category: 'general', subcategory: 'forms', description: 'PIN code input with mask mode, auto-advance, and completion callback.', tiers: ['lite', 'standard', 'premium'] },
  { name: 'RadioGroup', category: 'general', subcategory: 'forms', description: 'Radio button group with horizontal/vertical layout and accessible keyboard navigation.', tiers: ['lite', 'standard', 'premium'] },
  { name: 'Rating', category: 'general', subcategory: 'forms', description: 'Star rating input with half-star precision, custom icons, and read-only mode.', tiers: ['lite', 'standard', 'premium'] },
  { name: 'SearchInput', category: 'general', subcategory: 'forms', description: 'Search input with icon, clear button, loading state, and debounced onChange.', tiers: ['lite', 'standard', 'premium'] },
  { name: 'SegmentedControl', category: 'general', subcategory: 'forms', description: 'Pill-style toggle group for selecting between mutually exclusive options.', tiers: ['lite', 'standard', 'premium'] },
  { name: 'Select', category: 'general', subcategory: 'forms', description: 'Dropdown select with search, groups, clearable, and multiple selection modes.', tiers: ['lite', 'standard', 'premium'] },
  { name: 'Slider', category: 'general', subcategory: 'forms', description: 'Range slider with marks, steps, tick display, and value tooltip.', tiers: ['lite', 'standard', 'premium'] },
  { name: 'TagInput', category: 'general', subcategory: 'forms', description: 'Tag/chip input where users can add and remove tags with validation.', tiers: ['lite', 'standard', 'premium'] },
  { name: 'Textarea', category: 'general', subcategory: 'forms', description: 'Multi-line text input with auto-resize, character count, and min/max rows.', tiers: ['lite', 'standard', 'premium'] },
  { name: 'TimePicker', category: 'general', subcategory: 'forms', description: 'Time selection input with 12/24 hour format, minute step, and min/max time.', tiers: ['lite', 'standard', 'premium'] },
  { name: 'ToggleSwitch', category: 'general', subcategory: 'forms', description: 'On/off toggle switch with label and description.', tiers: ['lite', 'standard', 'premium'] },
  { name: 'TransferList', category: 'general', subcategory: 'forms', description: 'Dual-list transfer widget for moving items between two lists with search.', tiers: ['lite', 'standard', 'premium'] },
  { name: 'Accordion', category: 'general', subcategory: 'navigation', description: 'Expandable content panels with single or multiple open mode and variants.', tiers: ['lite', 'standard', 'premium'] },
  { name: 'Breadcrumbs', category: 'general', subcategory: 'navigation', description: 'Breadcrumb trail for hierarchical navigation with separator customization.', tiers: ['lite', 'standard', 'premium'] },
  { name: 'Pagination', category: 'general', subcategory: 'navigation', description: 'Page navigation with numbered buttons, prev/next, and sibling count control.', tiers: ['lite', 'standard', 'premium'] },
  { name: 'Stepper', category: 'general', subcategory: 'navigation', description: 'Step indicator for multi-step processes with clickable steps and orientation.', tiers: ['lite', 'standard', 'premium'] },
  { name: 'TableOfContents', category: 'general', subcategory: 'navigation', description: 'Sidebar navigation that tracks scroll position and highlights active section.', tiers: ['lite', 'standard', 'premium'] },
  { name: 'Tabs', category: 'general', subcategory: 'navigation', description: 'Tab navigation with panels, closable tabs, variants, and lazy rendering.', tiers: ['lite', 'standard', 'premium'] },
  { name: 'Timeline', category: 'general', subcategory: 'navigation', description: 'Vertical or alternate timeline with customizable connectors and icons.', tiers: ['lite', 'standard', 'premium'] },
  { name: 'Affix', category: 'general', subcategory: 'layout', description: 'Fixed-position element anchored to viewport edges with z-index control.', tiers: ['lite', 'standard', 'premium'] },
  { name: 'AppShell', category: 'general', subcategory: 'layout', description: 'Application layout shell with navbar, sidebar, and footer slots.', tiers: ['lite', 'standard', 'premium'] },
  { name: 'BackToTop', category: 'general', subcategory: 'layout', description: 'Floating button that scrolls to page top, appears after scrolling down.', tiers: ['lite', 'standard', 'premium'] },
  { name: 'Carousel', category: 'general', subcategory: 'layout', description: 'Horizontal slide carousel with autoplay, dots, arrows, and slides-per-view control.', tiers: ['lite', 'standard', 'premium'] },
  { name: 'ContainerQuery', category: 'general', subcategory: 'layout', description: 'Container-query wrapper providing width/height to children via render prop or CSS.', tiers: ['lite', 'standard', 'premium'] },
  { name: 'Navbar', category: 'general', subcategory: 'layout', description: 'Responsive top navigation bar with logo, links, actions, and sticky mode.', tiers: ['lite', 'standard', 'premium'] },
  { name: 'Sidebar', category: 'general', subcategory: 'layout', description: 'Collapsible side navigation panel with items, icons, and width control.', tiers: ['lite', 'standard', 'premium'] },
  { name: 'UIProvider', category: 'general', subcategory: 'layout', description: 'Root provider that sets theme tokens, color mode, motion level, and density.', tiers: ['standard'] },
  { name: 'ConfirmDialog', category: 'general', subcategory: 'overlays', description: 'Confirmation modal with confirm/cancel actions, danger variant, and loading state.', tiers: ['lite', 'standard', 'premium'] },
  { name: 'Dialog', category: 'general', subcategory: 'overlays', description: 'Modal dialog using native <dialog> with backdrop, focus trap, and keyboard dismissal.', tiers: ['lite', 'standard', 'premium'] },
  { name: 'Drawer', category: 'general', subcategory: 'overlays', description: 'Slide-in panel from any edge with overlay and focus management.', tiers: ['lite', 'standard', 'premium'] },
  { name: 'DropdownMenu', category: 'general', subcategory: 'overlays', description: 'Context or action menu with keyboard navigation and placement control.', tiers: ['lite', 'standard', 'premium'] },
  { name: 'NativeTooltip', category: 'general', subcategory: 'overlays', description: 'Lightweight tooltip using the native HTML title attribute with zero JS overhead.', tiers: ['lite', 'standard', 'premium'] },
  { name: 'Popover', category: 'general', subcategory: 'overlays', description: 'Rich content popover with arrow, controlled/uncontrolled modes, and modal option.', tiers: ['lite', 'standard', 'premium'] },
  { name: 'Sheet', category: 'general', subcategory: 'overlays', description: 'Bottom/side sheet panel overlay with title, description, and close button.', tiers: ['lite', 'standard', 'premium'] },
  { name: 'Spotlight', category: 'general', subcategory: 'overlays', description: 'Command palette / spotlight search overlay with keyboard shortcut and fuzzy filtering.', tiers: ['lite', 'standard', 'premium'] },
  { name: 'Tooltip', category: 'general', subcategory: 'overlays', description: 'Contextual tooltip that appears on hover/focus with smart positioning.', tiers: ['lite', 'standard', 'premium'] },
  { name: 'CopyBlock', category: 'domain', subcategory: 'data-display', description: 'Syntax-highlighted code block with one-click copy, line numbers, and line highlighting.', tiers: ['lite', 'standard', 'premium'] },
  { name: 'CoreChart', category: 'domain', subcategory: 'data-display', description: 'CPU/GPU core utilization heatmap grid with color scales and labels.', tiers: ['lite', 'standard', 'premium'] },
  { name: 'DataTable', category: 'domain', subcategory: 'data-display', description: 'Full-featured data table with sorting, pagination, column resizing, and row selection.', tiers: ['lite', 'standard', 'premium'] },
  { name: 'DiffViewer', category: 'domain', subcategory: 'data-display', description: 'Side-by-side or unified diff viewer with line numbers and fold unchanged sections.', tiers: ['lite', 'standard', 'premium'] },
  { name: 'EmptyState', category: 'domain', subcategory: 'data-display', description: 'Placeholder for empty content areas with icon, title, description, and action button.', tiers: ['lite', 'standard', 'premium'] },
  { name: 'HeatmapCalendar', category: 'domain', subcategory: 'data-display', description: 'GitHub-style contribution heatmap calendar with color scale and date click handler.', tiers: ['lite', 'standard', 'premium'] },
  { name: 'JsonViewer', category: 'domain', subcategory: 'data-display', description: 'Interactive JSON tree viewer with expand/collapse, clipboard copy, and data type display.', tiers: ['lite', 'standard', 'premium'] },
  { name: 'KanbanColumn', category: 'domain', subcategory: 'data-display', description: 'Kanban board column with draggable cards, WIP limits, and collapse toggle.', tiers: ['lite', 'standard', 'premium'] },
  { name: 'MetricCard', category: 'domain', subcategory: 'data-display', description: 'KPI metric display with value, trend indicator, sparkline, and status color.', tiers: ['lite', 'standard', 'premium'] },
  { name: 'PropertyList', category: 'domain', subcategory: 'data-display', description: 'Key-value property list with optional two-column layout and striped rows.', tiers: ['lite', 'standard', 'premium'] },
  { name: 'ResponsiveCard', category: 'domain', subcategory: 'data-display', description: 'Card that adapts layout (vertical/horizontal/compact) based on container width.', tiers: ['lite', 'standard', 'premium'] },
  { name: 'RingChart', category: 'domain', subcategory: 'data-display', description: 'Circular progress/donut chart with animated fill, label, and customizable thickness.', tiers: ['lite', 'standard', 'premium'] },
  { name: 'SmartTable', category: 'domain', subcategory: 'data-display', description: 'Enhanced DataTable wrapper with built-in search bar, column toggle, and pagination.', tiers: ['lite', 'standard', 'premium'] },
  { name: 'SortableList', category: 'domain', subcategory: 'data-display', description: 'Drag-and-drop reorderable list with optional handle grip and orientation.', tiers: ['lite', 'standard', 'premium'] },
  { name: 'Sparkline', category: 'domain', subcategory: 'data-display', description: 'Compact inline SVG sparkline chart with gradient fill and tooltip.', tiers: ['lite', 'standard', 'premium'] },
  { name: 'StorageBar', category: 'domain', subcategory: 'data-display', description: 'Segmented horizontal bar showing storage/resource allocation breakdown.', tiers: ['lite', 'standard', 'premium'] },
  { name: 'ThresholdGauge', category: 'domain', subcategory: 'data-display', description: 'Semi-circular gauge with warning/critical threshold zones and animated needle.', tiers: ['lite', 'standard', 'premium'] },
  { name: 'TimeSeriesChart', category: 'domain', subcategory: 'data-display', description: 'Line/area chart for time-based data with multiple series, grid, and tooltip.', tiers: ['lite', 'standard', 'premium'] },
  { name: 'TreeView', category: 'domain', subcategory: 'data-display', description: 'Hierarchical tree with expand/collapse, multi-select, lazy loading, and guide lines.', tiers: ['lite', 'standard', 'premium'] },
  { name: 'TruncatedText', category: 'domain', subcategory: 'data-display', description: 'Text that truncates after N lines with optional expand toggle and tooltip.', tiers: ['lite', 'standard', 'premium'] },
  { name: 'ConnectionTestPanel', category: 'domain', subcategory: 'monitoring', description: 'Sequential connection test display with pass/fail steps, retry, and cancel actions.', tiers: ['lite', 'standard', 'premium'] },
  { name: 'DashboardGrid', category: 'domain', subcategory: 'monitoring', description: 'Auto-layout grid for dashboard widgets with optional groups and responsive columns.', tiers: ['lite', 'standard', 'premium'] },
  { name: 'DiskMountBar', category: 'domain', subcategory: 'monitoring', description: 'Disk mount point usage bars showing used/free space per filesystem mount.', tiers: ['lite', 'standard', 'premium'] },
  { name: 'EntityCard', category: 'domain', subcategory: 'monitoring', description: 'Infrastructure entity card with status, metrics, tags, and quick actions.', tiers: ['lite', 'standard', 'premium'] },
  { name: 'GeoMap', category: 'domain', subcategory: 'monitoring', description: 'SVG world map with plotted points, connection lines, and interactive hover/click.', tiers: ['lite', 'standard', 'premium'] },
  { name: 'LogViewer', category: 'domain', subcategory: 'monitoring', description: 'Scrollable log output with syntax highlighting, level filter, search, and auto-tail.', tiers: ['lite', 'standard', 'premium'] },
  { name: 'NetworkTrafficCard', category: 'domain', subcategory: 'monitoring', description: 'Network interface traffic card showing in/out bit rates, vendor, and status.', tiers: ['lite', 'standard', 'premium'] },
  { name: 'PipelineStage', category: 'domain', subcategory: 'monitoring', description: 'CI/CD pipeline visualization with connected stages showing status and duration.', tiers: ['lite', 'standard', 'premium'] },
  { name: 'PortStatusGrid', category: 'domain', subcategory: 'monitoring', description: 'Grid of network port status indicators with click handler and size variants.', tiers: ['lite', 'standard', 'premium'] },
  { name: 'RackDiagram', category: 'domain', subcategory: 'monitoring', description: 'Server rack visualization with device slots, unit numbers, and status indicators.', tiers: ['lite', 'standard', 'premium'] },
  { name: 'ServiceStrip', category: 'domain', subcategory: 'monitoring', description: 'Horizontal strip of service status icons with overflow handling and click events.', tiers: ['lite', 'standard', 'premium'] },
  { name: 'SeverityTimeline', category: 'domain', subcategory: 'monitoring', description: 'Timeline of severity-colored events with expandable details and max visible limit.', tiers: ['lite', 'standard', 'premium'] },
  { name: 'SwitchFaceplate', category: 'domain', subcategory: 'monitoring', description: 'Network switch faceplate visualization with port layout, labels, and click handler.', tiers: ['lite', 'standard', 'premium'] },
  { name: 'UpstreamDashboard', category: 'domain', subcategory: 'monitoring', description: 'ISP upstream link dashboard with hero/compact/table modes and summary aggregation.', tiers: ['lite', 'standard', 'premium'] },
  { name: 'UptimeTracker', category: 'domain', subcategory: 'monitoring', description: 'Visual uptime history bar with daily status squares and SLA target line.', tiers: ['lite', 'standard', 'premium'] },
  { name: 'UtilizationBar', category: 'domain', subcategory: 'monitoring', description: 'Segmented utilization bar with warning/critical thresholds and label display.', tiers: ['lite', 'standard', 'premium'] },
  { name: 'CodeEditor', category: 'domain', subcategory: 'infrastructure', description: 'Lightweight code editor with syntax highlighting, line numbers, and tab support.', tiers: ['lite', 'standard', 'premium'] },
  { name: 'ColumnVisibilityToggle', category: 'domain', subcategory: 'infrastructure', description: 'Dropdown toggle for showing/hiding table columns with reset option.', tiers: ['lite', 'standard', 'premium'] },
  { name: 'CommandBar', category: 'domain', subcategory: 'infrastructure', description: 'Command palette overlay with fuzzy search, keyboard shortcut activation, and groups.', tiers: ['lite', 'standard', 'premium'] },
  { name: 'Cropper', category: 'domain', subcategory: 'infrastructure', description: 'Image cropper with aspect ratio lock, zoom, rotate, and rounded output mode.', tiers: ['lite', 'standard', 'premium'] },
  { name: 'CSVExportButton', category: 'domain', subcategory: 'infrastructure', description: 'Button that exports table data to CSV file download with column mapping.', tiers: ['lite', 'standard', 'premium'] },
  { name: 'DensitySelector', category: 'domain', subcategory: 'infrastructure', description: 'Compact/comfortable/spacious density toggle for adjusting UI spacing.', tiers: ['lite', 'standard', 'premium'] },
  { name: 'InfiniteScroll', category: 'domain', subcategory: 'infrastructure', description: 'Infinite scrolling container with load-more trigger, loader, and pull-to-refresh.', tiers: ['lite', 'standard', 'premium'] },
  { name: 'NotificationStack', category: 'domain', subcategory: 'infrastructure', description: 'Stacked notification list with dismiss, mark-read, and dismiss-all actions.', tiers: ['lite', 'standard', 'premium'] },
  { name: 'RichTextEditor', category: 'domain', subcategory: 'infrastructure', description: 'WYSIWYG rich text editor with toolbar, formatting commands, and HTML output.', tiers: ['lite', 'standard', 'premium'] },
  { name: 'ScrollReveal', category: 'domain', subcategory: 'infrastructure', description: 'Wrapper that animates children into view on scroll with configurable animation.', tiers: ['lite', 'standard', 'premium'] },
  { name: 'StepWizard', category: 'domain', subcategory: 'infrastructure', description: 'Multi-step wizard with step indicators, navigation controls, and skip option.', tiers: ['lite', 'standard', 'premium'] },
  { name: 'TimeRangeSelector', category: 'domain', subcategory: 'infrastructure', description: 'Time range preset selector for dashboards with custom range option.', tiers: ['lite', 'standard', 'premium'] },
  { name: 'ToastProvider', category: 'domain', subcategory: 'infrastructure', description: 'Toast notification provider with position control and useToast() hook for triggering.', tiers: ['lite', 'standard', 'premium'] },
  { name: 'Tour', category: 'domain', subcategory: 'infrastructure', description: 'Guided product tour with step-by-step highlights, tooltips, and progress indicator.', tiers: ['lite', 'standard', 'premium'] },
  { name: 'ViewTransitionLink', category: 'domain', subcategory: 'infrastructure', description: 'Anchor link that triggers View Transitions API for smooth page navigation.', tiers: ['lite', 'standard', 'premium'] },
  { name: 'BackgroundBeams', category: 'domain', subcategory: 'visual-effects', description: 'Animated vertical light beams background with customizable count and color.', tiers: ['lite', 'standard', 'premium'] },
  { name: 'BackgroundBoxes', category: 'domain', subcategory: 'visual-effects', description: 'Animated grid of translucent boxes as a decorative background layer.', tiers: ['lite', 'standard', 'premium'] },
  { name: 'BorderBeam', category: 'domain', subcategory: 'visual-effects', description: 'Animated glowing beam that traces along the border of a container.', tiers: ['lite', 'standard', 'premium'] },
  { name: 'Card3D', category: 'domain', subcategory: 'visual-effects', description: 'Card with 3D tilt effect on mouse move, optional glare, and perspective control.', tiers: ['lite', 'standard', 'premium'] },
  { name: 'EncryptedText', category: 'domain', subcategory: 'visual-effects', description: 'Text that scrambles through random characters before revealing the actual content.', tiers: ['lite', 'standard', 'premium'] },
  { name: 'EvervaultCard', category: 'domain', subcategory: 'visual-effects', description: 'Card with encrypted/matrix-style animated background that follows cursor position.', tiers: ['lite', 'standard', 'premium'] },
  { name: 'FlipWords', category: 'domain', subcategory: 'visual-effects', description: 'Cycling word animation that flips between provided words on an interval.', tiers: ['lite', 'standard', 'premium'] },
  { name: 'GlowCard', category: 'domain', subcategory: 'visual-effects', description: 'Card with a radial glow effect that follows the cursor position.', tiers: ['lite', 'standard', 'premium'] },
  { name: 'HeroHighlight', category: 'domain', subcategory: 'visual-effects', description: 'Section with gradient highlight effect that responds to cursor movement.', tiers: ['lite', 'standard', 'premium'] },
  { name: 'MeteorShower', category: 'domain', subcategory: 'visual-effects', description: 'Decorative animated meteor streaks falling across a container background.', tiers: ['lite', 'standard', 'premium'] },
  { name: 'NumberTicker', category: 'domain', subcategory: 'visual-effects', description: 'Animated number counter that ticks up or down to the target value.', tiers: ['lite', 'standard', 'premium'] },
  { name: 'OrbitingCircles', category: 'domain', subcategory: 'visual-effects', description: 'Circular orbit animation with items rotating around a center point.', tiers: ['lite', 'standard', 'premium'] },
  { name: 'Ripple', category: 'domain', subcategory: 'visual-effects', description: 'Click-triggered ripple effect overlay for interactive elements.', tiers: ['lite', 'standard', 'premium'] },
  { name: 'ShimmerButton', category: 'domain', subcategory: 'visual-effects', description: 'Button with animated shimmer/glow sweep effect for prominent CTAs.', tiers: ['lite', 'standard', 'premium'] },
  { name: 'SpotlightCard', category: 'domain', subcategory: 'visual-effects', description: 'Card with a spotlight glow that follows cursor for interactive hover effect.', tiers: ['lite', 'standard', 'premium'] },
  { name: 'TextReveal', category: 'domain', subcategory: 'visual-effects', description: 'Text reveal animation triggered on mount or when scrolled into view.', tiers: ['lite', 'standard', 'premium'] },
  { name: 'TracingBeam', category: 'domain', subcategory: 'visual-effects', description: 'Vertical beam line that traces alongside content as user scrolls through.', tiers: ['lite', 'standard', 'premium'] },
  { name: 'WavyBackground', category: 'domain', subcategory: 'visual-effects', description: 'Animated wavy SVG background layer with customizable wave count and speed.', tiers: ['lite', 'standard', 'premium'] },
  { name: 'ConfidenceBar', category: 'domain', subcategory: 'ai-realtime', description: 'Horizontal bar showing AI confidence level with low/medium/high color thresholds.', tiers: ['lite', 'standard', 'premium'] },
  { name: 'LiveFeed', category: 'domain', subcategory: 'ai-realtime', description: 'Real-time event feed with auto-scroll, pause/resume, and connection status.', tiers: ['lite', 'standard', 'premium'] },
  { name: 'RealtimeValue', category: 'domain', subcategory: 'ai-realtime', description: 'Numeric display that flashes on change and shows delta from previous value.', tiers: ['lite', 'standard', 'premium'] },
  { name: 'StreamingText', category: 'domain', subcategory: 'ai-realtime', description: 'Text that renders character-by-character, simulating LLM streaming output.', tiers: ['lite', 'standard', 'premium'] },
  { name: 'TypingIndicator', category: 'domain', subcategory: 'ai-realtime', description: 'Animated typing dots indicator for chat or messaging interfaces.', tiers: ['lite', 'standard', 'premium'] },
]

/**
 * Returns the full component database — every shipped component with metadata.
 */
export function getComponentDatabase(): ComponentInfo[] {
  return DATABASE
}

/**
 * Case-insensitive full-text search across each component's name, description,
 * and subcategory. An empty or whitespace-only query returns the full database.
 */
export function searchComponents(query: string): ComponentInfo[] {
  const q = query.trim().toLowerCase()
  if (!q) return DATABASE

  return DATABASE.filter((c) => {
    const haystack = `${c.name} ${c.description} ${c.subcategory}`.toLowerCase()
    return haystack.includes(q)
  })
}
