// ─── Shared Component Preview Renderer ─────────────────────────────────────
// Used by GeneratorPage and EmbedComponentPage to render component previews.
// Contains all 147+ component imports and a switch-based renderer.

import React, { useState } from 'react'
import { Icon } from '@ui/core/icons/icon'
import { Button } from '@ui/components/button'
import { Card } from '@ui/components/card'
import { Badge } from '@ui/components/badge'
import { SearchInput } from '@ui/components/search-input'
import { FormInput } from '@ui/components/form-input'
import { Select } from '@ui/components/select'
import { MetricCard } from '@ui/domain/metric-card'
import { DataTable, type ColumnDef } from '@ui/domain/data-table'

// Forms
import { Textarea } from '@ui/components/textarea'
import { NumberInput } from '@ui/components/number-input'
import { PasswordInput } from '@ui/components/password-input'
import { Checkbox } from '@ui/components/checkbox'
import { ToggleSwitch } from '@ui/components/toggle-switch'
import { Slider } from '@ui/components/slider'
import { Rating } from '@ui/components/rating'
import { RadioGroup } from '@ui/components/radio-group'
import { DatePicker } from '@ui/components/date-picker'
import { TagInput } from '@ui/components/tag-input'
import { FileUpload } from '@ui/components/file-upload'
import { ColorInput } from '@ui/components/color-input'

// Navigation
import { Tabs, TabPanel } from '@ui/components/tabs'
import { Breadcrumbs } from '@ui/components/breadcrumbs'
import { Pagination } from '@ui/components/pagination'
import { Accordion } from '@ui/components/accordion'

// Data Display
import { Progress } from '@ui/components/progress'
import { Sparkline } from '@ui/domain/sparkline'
import { StatusBadge } from '@ui/components/status-badge'
import { StatusPulse } from '@ui/components/status-pulse'
import { Skeleton } from '@ui/components/skeleton'
import { Avatar } from '@ui/components/avatar'
import { Divider } from '@ui/components/divider'
import { Typography } from '@ui/components/typography'
import { Kbd } from '@ui/components/kbd'
import { Alert } from '@ui/components/alert'

// Overlays
import { Tooltip } from '@ui/components/tooltip'

// Domain
import { TimeSeriesChart } from '@ui/domain/time-series-chart'
import { RingChart } from '@ui/domain/ring-chart'
import { CoreChart } from '@ui/domain/core-chart'
import { ThresholdGauge } from '@ui/domain/threshold-gauge'
import { UtilizationBar } from '@ui/domain/utilization-bar'
import { LogViewer } from '@ui/domain/log-viewer'
import { CopyBlock } from '@ui/domain/copy-block'

// Primitives
import { ActionIcon } from '@ui/components/action-icon'
import { AnimatedCounter } from '@ui/components/animated-counter'
import { AvatarGroup } from '@ui/components/avatar'
import { AvatarUpload } from '@ui/components/avatar-upload'
import { ButtonGroup } from '@ui/components/button-group'
import { Chip } from '@ui/components/chip'
import { CopyButton as CopyButtonComp } from '@ui/components/copy-button'
import { Indicator } from '@ui/components/indicator'
import { Link as LinkComp } from '@ui/components/link'
import { Spoiler } from '@ui/components/spoiler'
import { SuccessCheckmark } from '@ui/components/success-checkmark'
import { Highlight as TextHighlight } from '@ui/components/highlight'

// Forms (additional)
import { Combobox } from '@ui/components/combobox'
import { MultiSelect } from '@ui/components/multi-select'
import { OtpInput } from '@ui/components/otp-input'
import { PinInput } from '@ui/components/pin-input'
import { InlineEdit } from '@ui/components/inline-edit'
import { Calendar } from '@ui/components/calendar'
import { DateRangePicker } from '@ui/components/date-range-picker'
import { TimePicker } from '@ui/components/time-picker'
import { FilterPill } from '@ui/components/filter-pill'
import { TransferList } from '@ui/components/transfer-list'
import { SegmentedControl } from '@ui/components/segmented-control'

// Navigation (additional)
import { Stepper } from '@ui/components/stepper'
import { TableOfContents } from '@ui/components/table-of-contents'
import { Timeline as TimelineComp } from '@ui/components/timeline'
import { Navbar } from '@ui/components/navbar'
import { Sidebar } from '@ui/components/sidebar'
import { AppShell } from '@ui/components/app-shell'
import { BackToTop } from '@ui/components/back-to-top'
import { Carousel } from '@ui/components/carousel'
import { ContainerQuery } from '@ui/components/container-query'

// Overlays (additional)
import { ConfirmDialog } from '@ui/components/confirm-dialog'
import { DropdownMenu } from '@ui/components/dropdown-menu'
import { NativeTooltip } from '@ui/components/native-tooltip'
import { Popover } from '@ui/components/popover'
import { Sheet } from '@ui/components/sheet'

// Data Display (additional)
import { DiffViewer } from '@ui/domain/diff-viewer'
import { EmptyState } from '@ui/domain/empty-state'
import { HeatmapCalendar } from '@ui/domain/heatmap-calendar'
import { JsonViewer } from '@ui/domain/json-viewer'
import { KanbanColumn } from '@ui/domain/kanban-column'
import { PropertyList } from '@ui/domain/property-list'
import { ResponsiveCard } from '@ui/domain/responsive-card'
import { SortableList } from '@ui/domain/sortable-list'
import { StorageBar } from '@ui/domain/storage-bar'
import { TreeView } from '@ui/domain/tree-view'
import { TruncatedText } from '@ui/domain/truncated-text'

// Infrastructure / Monitoring
import { ConnectionTestPanel } from '@ui/domain/connection-test-panel'
import { DashboardGrid } from '@ui/domain/dashboard-grid'
import { DiskMountBar } from '@ui/domain/disk-mount-bar'
import { EntityCard } from '@ui/domain/entity-card'
import { GeoMap } from '@ui/domain/geo-map'
import { NetworkTrafficCard } from '@ui/domain/network-traffic-card'
import { PipelineStage } from '@ui/domain/pipeline-stage'
import { PortStatusGrid } from '@ui/domain/port-status-grid'
import { RackDiagram } from '@ui/domain/rack-diagram'
import { ServiceStrip } from '@ui/domain/service-strip'
import { SeverityTimeline } from '@ui/domain/severity-timeline'
import { SwitchFaceplate } from '@ui/domain/switch-faceplate'
import { UpstreamDashboard } from '@ui/domain/upstream-dashboard'
import { UptimeTracker } from '@ui/domain/uptime-tracker'

// Domain Tools
import { ColumnVisibilityToggle } from '@ui/domain/column-visibility-toggle'
import { CSVExportButton } from '@ui/domain/csv-export'
import { DensitySelector } from '@ui/domain/density-selector'
import { InfiniteScroll } from '@ui/domain/infinite-scroll'
import { ScrollReveal } from '@ui/domain/scroll-reveal'
import { StepWizard } from '@ui/domain/step-wizard'
import { TimeRangeSelector } from '@ui/domain/time-range-selector'
import { NotificationStack } from '@ui/domain/notification-stack'
import { CodeEditor } from '@ui/domain/code-editor'
import { RichTextEditor } from '@ui/domain/rich-text-editor'
import { ShimmerButton } from '@ui/domain/shimmer-button'

// Visual Effects
import { BackgroundBeams } from '@ui/domain/background-beams'
import { BackgroundBoxes } from '@ui/domain/background-boxes'
import { BorderBeam } from '@ui/domain/border-beam'
import { Card3D } from '@ui/domain/card-3d'
import { EncryptedText } from '@ui/domain/encrypted-text'
import { EvervaultCard } from '@ui/domain/evervault-card'
import { FlipWords } from '@ui/domain/flip-words'
import { GlowCard } from '@ui/domain/glow-card'
import { HeroHighlight } from '@ui/domain/hero-highlight'
import { MeteorShower } from '@ui/domain/meteor-shower'
import { NumberTicker } from '@ui/domain/number-ticker'
import { OrbitingCircles } from '@ui/domain/orbiting-circles'
import { Ripple } from '@ui/domain/ripple'
import { SpotlightCard } from '@ui/domain/spotlight-card'
import { TextReveal } from '@ui/domain/text-reveal'
import { TracingBeam } from '@ui/domain/tracing-beam'
import { WavyBackground } from '@ui/domain/wavy-background'

// AI / Realtime
import { ConfidenceBar } from '@ui/domain/confidence-bar'
import { LiveFeed } from '@ui/domain/live-feed'
import { RealtimeValue } from '@ui/domain/realtime-value'
import { StreamingText } from '@ui/domain/streaming-text'
import { TypingIndicator } from '@ui/domain/typing-indicator'

// ─── Preview Renderer ──────────────────────────────────────────────────────

/**
 * Renders a preview for any component by name.
 * Returns a ReactNode with sensible default props.
 */
export function renderComponentPreview(name: string): React.ReactNode {
  return <ComponentPreviewSwitch name={name} />
}

function ComponentPreviewSwitch({ name }: { name: string }) {
  const [paginationPage, setPaginationPage] = useState(1)

  switch (name) {
    // ── Buttons & Basic ──
    case 'Button':
      return (
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          <Button variant="primary">Primary</Button>
          <Button variant="secondary">Outline</Button>
          <Button variant="ghost">Ghost</Button>
        </div>
      )
    case 'Badge':
      return (
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          <Badge variant="primary">Primary</Badge>
          <Badge variant="success">Success</Badge>
          <Badge variant="warning">Warning</Badge>
        </div>
      )
    case 'Card':
      return (
        <Card style={{ padding: '1rem' }}>
          <h4 style={{ fontSize: '0.875rem', fontWeight: 600, marginBlockEnd: '0.25rem' }}>Sample Card</h4>
          <p style={{ fontSize: '0.8125rem', margin: 0, color: 'var(--text-secondary)' }}>Card content goes here.</p>
        </Card>
      )
    case 'MetricCard':
      return <MetricCard title="Revenue" value="$48,230" change={{ value: 12.5 }} trend="up" icon={<Icon name="activity" size="sm" />} />
    case 'Select':
      return (
        <Select
          name="preview-select"
          placeholder="Choose an option"
          options={[
            { value: '1', label: 'Option A' },
            { value: '2', label: 'Option B' },
            { value: '3', label: 'Option C' },
          ]}
        />
      )
    case 'FormInput':
      return <FormInput label="Sample Input" placeholder="Type something..." name="preview-input" />
    case 'DataTable': {
      type SampleRow = { name: string; status: string; updated: string }
      const cols: ColumnDef<SampleRow>[] = [
        { id: 'name', header: 'Name', accessor: 'name', sortable: true },
        { id: 'status', header: 'Status', accessor: 'status', cell: (val) => (
          <StatusBadge status={val === 'Active' ? 'ok' : 'warning'} label={val as string} />
        )},
        { id: 'updated', header: 'Updated', accessor: 'updated', sortable: true },
      ]
      const rows: SampleRow[] = [
        { name: 'Item A', status: 'Active', updated: '2026-03-25' },
        { name: 'Item B', status: 'Pending', updated: '2026-03-24' },
        { name: 'Item C', status: 'Active', updated: '2026-03-23' },
      ]
      return <DataTable columns={cols} data={rows} searchable sortable pageSize={5} />
    }
    case 'SearchInput':
      return <SearchInput placeholder="Search..." />

    // ── Forms ──
    case 'Textarea':
      return <Textarea name="demo-textarea" label="Message" placeholder="Type your message here..." />
    case 'NumberInput':
      return <NumberInput name="demo-number" label="Quantity" />
    case 'PasswordInput':
      return <PasswordInput name="demo-password" label="Password" />
    case 'Checkbox':
      return <Checkbox label="Accept terms and conditions" />
    case 'ToggleSwitch':
      return <ToggleSwitch label="Enable notifications" />
    case 'Slider':
      return <Slider label="Volume" />
    case 'Rating':
      return <Rating />
    case 'RadioGroup':
      return (
        <RadioGroup
          name="demo-radio"
          label="Select an option"
          options={[
            { value: 'a', label: 'Option A' },
            { value: 'b', label: 'Option B' },
            { value: 'c', label: 'Option C' },
          ]}
        />
      )
    case 'DatePicker':
      return <DatePicker label="Date" />
    case 'TagInput':
      return <TagInput tags={['react', 'typescript']} onChange={() => {}} placeholder="Add tag..." />
    case 'FileUpload':
      return <FileUpload name="demo-upload" />
    case 'ColorInput':
      return <ColorInput name="demo-color" label="Color" />

    // ── Navigation ──
    case 'Tabs':
      return (
        <Tabs tabs={[{ id: '1', label: 'Tab 1' }, { id: '2', label: 'Tab 2' }, { id: '3', label: 'Tab 3' }]} defaultTab="1">
          <TabPanel tabId="1"><div style={{ padding: '0.75rem' }}>Tab 1 content</div></TabPanel>
          <TabPanel tabId="2"><div style={{ padding: '0.75rem' }}>Tab 2 content</div></TabPanel>
          <TabPanel tabId="3"><div style={{ padding: '0.75rem' }}>Tab 3 content</div></TabPanel>
        </Tabs>
      )
    case 'Breadcrumbs':
      return <Breadcrumbs items={[{ label: 'Home', href: '#' }, { label: 'Products', href: '#' }, { label: 'Current Page' }]} />
    case 'Pagination':
      return <Pagination page={paginationPage} totalPages={10} onChange={setPaginationPage} />
    case 'Accordion':
      return (
        <Accordion
          type="single"
          items={[
            { id: '1', trigger: 'What is UI Kit?', content: 'A zero-dependency React component library with physics-based animations.' },
            { id: '2', trigger: 'How many components?', content: '147 components across 3 weight tiers.' },
            { id: '3', trigger: 'What design system?', content: 'Aurora Fluid design with OKLCH color system.' },
          ]}
        />
      )

    // ── Data Display ──
    case 'Progress':
      return <Progress value={65} label="Upload Progress" />
    case 'Sparkline':
      return <Sparkline data={[10, 25, 15, 30, 20, 35, 28, 40, 32]} />
    case 'StatusBadge':
      return (
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          <StatusBadge status="ok" label="Healthy" pulse />
          <StatusBadge status="warning" label="Degraded" />
          <StatusBadge status="critical" label="Down" />
        </div>
      )
    case 'StatusPulse':
      return (
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <StatusPulse status="ok" label="Online" />
          <StatusPulse status="warning" label="Degraded" />
          <StatusPulse status="critical" label="Offline" />
        </div>
      )
    case 'Skeleton':
      return <Skeleton variant="text" lines={3} />
    case 'Avatar':
      return (
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          <Avatar name="John Doe" />
          <Avatar name="Jane Smith" />
          <Avatar name="Bob Wilson" />
        </div>
      )
    case 'Divider':
      return (
        <div>
          <p style={{ fontSize: '0.875rem', marginBlockEnd: '0.5rem' }}>Content above</p>
          <Divider />
          <p style={{ fontSize: '0.875rem', marginBlockStart: '0.5rem' }}>Content below</p>
        </div>
      )
    case 'Typography':
      return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
          <Typography variant="h3">Heading</Typography>
          <Typography variant="body" color="secondary">Body text with secondary color</Typography>
        </div>
      )
    case 'Kbd':
      return (
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          <Kbd>Ctrl</Kbd> + <Kbd>K</Kbd>
        </div>
      )
    case 'Alert':
      return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <Alert variant="info" title="Information">This is an informational alert message.</Alert>
          <Alert variant="warning" title="Warning">Please check your configuration.</Alert>
        </div>
      )

    // ── Overlays ──
    case 'Dialog':
      return <Button variant="secondary" onClick={() => {}}>Open Dialog</Button>
    case 'Tooltip':
      return (
        <Tooltip content="This is a tooltip">
          <Button variant="secondary">Hover me</Button>
        </Tooltip>
      )
    case 'Toast':
      return <Button variant="secondary" onClick={() => {}}>Show Toast</Button>

    // ── Domain ──
    case 'TimeSeriesChart':
      return (
        <TimeSeriesChart
          series={[{
            id: 'cpu',
            label: 'CPU Usage',
            data: [
              { timestamp: Date.now() - 3600000, value: 45 },
              { timestamp: Date.now() - 2700000, value: 52 },
              { timestamp: Date.now() - 1800000, value: 38 },
              { timestamp: Date.now() - 900000, value: 65 },
              { timestamp: Date.now(), value: 72 },
            ],
          }]}
          height={200}
        />
      )
    case 'RingChart':
      return <RingChart value={72} size="md" showValue />
    case 'CoreChart':
      return <CoreChart cores={Array.from({ length: 8 }, (_, i) => ({ id: i, usage: Math.random() * 100 }))} />
    case 'ThresholdGauge':
      return <ThresholdGauge value={72} />
    case 'UtilizationBar':
      return <UtilizationBar segments={[{ label: 'Used', value: 65, color: 'oklch(65% 0.2 270)' }, { label: 'Free', value: 35, color: 'oklch(70% 0.05 270)' }]} />
    case 'LogViewer':
      return (
        <LogViewer
          lines={[
            { id: 1, timestamp: new Date(Date.now() - 60000), level: 'info', message: 'Server started on port 3000' },
            { id: 2, timestamp: new Date(Date.now() - 30000), level: 'info', message: 'Connected to database' },
            { id: 3, timestamp: new Date(), level: 'warn', message: 'High memory usage detected' },
          ]}
          style={{ height: '150px' }}
        />
      )
    case 'CopyBlock':
      return <CopyBlock code="npm install @annondeveloper/ui-kit" language="bash" />

    // ── Primitives (additional) ──
    case 'ActionIcon':
      return (
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          <ActionIcon aria-label="Edit"><Icon name="edit" size={16} /></ActionIcon>
          <ActionIcon aria-label="Settings"><Icon name="settings" size={16} /></ActionIcon>
          <ActionIcon aria-label="Delete"><Icon name="x" size={16} /></ActionIcon>
        </div>
      )
    case 'AnimatedCounter':
      return <AnimatedCounter value={1234} />
    case 'AvatarGroup':
      return (
        <AvatarGroup max={3}>
          <Avatar name="Alice" />
          <Avatar name="Bob" />
          <Avatar name="Carol" />
          <Avatar name="Dave" />
          <Avatar name="Eve" />
        </AvatarGroup>
      )
    case 'AvatarUpload':
      return <AvatarUpload />
    case 'ButtonGroup':
      return (
        <ButtonGroup>
          <Button size="sm">Left</Button>
          <Button size="sm">Center</Button>
          <Button size="sm">Right</Button>
        </ButtonGroup>
      )
    case 'Chip':
      return (
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          <Chip>React</Chip>
          <Chip>TypeScript</Chip>
          <Chip>OKLCH</Chip>
        </div>
      )
    case 'CopyButton':
      return (
        <CopyButtonComp value="npm install @annondeveloper/ui-kit">
          {({ copied, copy }) => (
            <Button size="sm" variant={copied ? 'primary' : 'secondary'} onClick={copy}>
              {copied ? 'Copied!' : 'Copy install command'}
            </Button>
          )}
        </CopyButtonComp>
      )
    case 'Indicator':
      return <Indicator><Avatar name="User" /></Indicator>
    case 'Link':
      return <LinkComp href="#">Click this link</LinkComp>
    case 'Spoiler':
      return (
        <Spoiler maxHeight={60}>
          <p style={{ margin: 0, lineHeight: 1.6 }}>
            This content is hidden behind a spoiler. Click to expand and see more text
            that was truncated. The Spoiler component gracefully handles overflow with
            a fade effect and an expand/collapse toggle button.
          </p>
        </Spoiler>
      )
    case 'SuccessCheckmark':
      return <SuccessCheckmark />
    case 'Highlight':
    case 'TextHighlight':
      return <TextHighlight highlight="component">A component library with 147 components.</TextHighlight>

    // ── Forms (additional) ──
    case 'Combobox':
    case 'ComboBox':
      return (
        <Combobox
          name="combo"
          label="Framework"
          options={[
            { value: 'react', label: 'React' },
            { value: 'vue', label: 'Vue' },
            { value: 'svelte', label: 'Svelte' },
            { value: 'angular', label: 'Angular' },
          ]}
        />
      )
    case 'MultiSelect':
      return (
        <MultiSelect
          name="multi"
          label="Tags"
          options={[
            { value: 'a', label: 'Alpha' },
            { value: 'b', label: 'Beta' },
            { value: 'c', label: 'Gamma' },
            { value: 'd', label: 'Delta' },
          ]}
        />
      )
    case 'OtpInput':
      return <OtpInput length={6} />
    case 'PinInput':
      return <PinInput length={4} />
    case 'InlineEdit':
      return <InlineEdit value="Click to edit this text" onChange={() => {}} />
    case 'Calendar':
      return <Calendar />
    case 'DateRangePicker':
      return <DateRangePicker name="range" label="Date Range" />
    case 'TimePicker':
      return <TimePicker name="time" label="Time" />
    case 'FilterPill':
      return (
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          <FilterPill label="Active" active />
          <FilterPill label="Pending" />
          <FilterPill label="Closed" />
        </div>
      )
    case 'TransferList':
      return (
        <TransferList
          value={[
            [
              { value: 'react', label: 'React' },
              { value: 'vue', label: 'Vue' },
              { value: 'svelte', label: 'Svelte' },
            ],
            [
              { value: 'angular', label: 'Angular' },
            ],
          ]}
          onChange={() => {}}
          titles={['Available', 'Selected']}
        />
      )
    case 'SegmentedControl':
      return (
        <SegmentedControl
          data={[
            { value: 'day', label: 'Day' },
            { value: 'week', label: 'Week' },
            { value: 'month', label: 'Month' },
          ]}
        />
      )

    // ── Navigation (additional) ──
    case 'Stepper':
      return (
        <Stepper
          steps={[
            { id: '1', label: 'Account' },
            { id: '2', label: 'Details' },
            { id: '3', label: 'Review' },
          ]}
          activeStep={1}
        />
      )
    case 'TableOfContents':
      return (
        <TableOfContents
          items={[
            { id: 'intro', label: 'Introduction', level: 1 },
            { id: 'setup', label: 'Setup', level: 2 },
            { id: 'usage', label: 'Usage', level: 2 },
            { id: 'api', label: 'API Reference', level: 1 },
          ]}
        />
      )
    case 'Timeline':
      return (
        <TimelineComp
          items={[
            { id: '1', title: 'Created', description: 'Project started', status: 'completed' },
            { id: '2', title: 'In Progress', description: 'Building features', status: 'active' },
            { id: '3', title: 'Review', description: 'Pending review', status: 'pending' },
          ]}
        />
      )
    case 'Navbar':
      return (
        <Navbar bordered>
          <span style={{ fontWeight: 700 }}>MyApp</span>
        </Navbar>
      )
    case 'Sidebar':
      return (
        <div style={{ height: 200, position: 'relative', overflow: 'hidden' }}>
          <Sidebar>
            <div style={{ padding: '1rem' }}>Nav items here</div>
          </Sidebar>
        </div>
      )
    case 'AppShell':
      return (
        <div style={{ height: 200, overflow: 'hidden' }}>
          <AppShell>
            <div style={{ padding: '1rem' }}>App content area</div>
          </AppShell>
        </div>
      )
    case 'BackToTop':
      return <BackToTop />
    case 'Carousel':
      return (
        <Carousel>
          <div style={{ padding: '2rem', background: 'var(--bg-elevated)', textAlign: 'center' }}>Slide 1</div>
          <div style={{ padding: '2rem', background: 'var(--bg-elevated)', textAlign: 'center' }}>Slide 2</div>
          <div style={{ padding: '2rem', background: 'var(--bg-elevated)', textAlign: 'center' }}>Slide 3</div>
        </Carousel>
      )
    case 'Affix':
      return <Badge>Affix positions elements fixed on screen</Badge>
    case 'ContainerQuery':
      return (
        <ContainerQuery>
          {(size) => <Badge>{size.breakpoint === 'lg' || size.breakpoint === 'xl' ? 'Large' : size.breakpoint === 'md' ? 'Medium' : 'Small'} container ({size.width}px)</Badge>}
        </ContainerQuery>
      )
    case 'UIProvider':
      return <Badge>UIProvider wraps app with theme and motion context</Badge>

    // ── Overlays (additional) ──
    case 'ConfirmDialog':
      return <Button variant="secondary" onClick={() => {}}>Open Confirm Dialog</Button>
    case 'Drawer':
      return <Button variant="secondary" onClick={() => {}}>Open Drawer</Button>
    case 'DropdownMenu':
      return (
        <DropdownMenu
          items={[
            { label: 'Edit', onClick: () => {} },
            { label: 'Duplicate', onClick: () => {} },
            { type: 'separator' },
            { label: 'Delete', danger: true, onClick: () => {} },
          ]}
        >
          <Button size="sm">Actions Menu</Button>
        </DropdownMenu>
      )
    case 'NativeTooltip':
      return (
        <NativeTooltip content="Native browser tooltip">
          <Button variant="secondary" size="sm">Hover for native tooltip</Button>
        </NativeTooltip>
      )
    case 'Popover':
      return (
        <Popover content={<div style={{ padding: '0.75rem' }}>Popover content here</div>}>
          <Button size="sm">Click for popover</Button>
        </Popover>
      )
    case 'Sheet':
      return <Button variant="secondary" onClick={() => {}}>Open Sheet</Button>
    case 'Spotlight':
      return <Button variant="secondary" onClick={() => {}}>Open Spotlight (Cmd+K)</Button>

    // ── Data Display (additional) ──
    case 'DiffViewer':
      return (
        <DiffViewer
          oldValue={'const greeting = "hello";\nconst x = 1;'}
          newValue={'const greeting = "world";\nconst x = 2;\nconst y = 3;'}
          language="typescript"
        />
      )
    case 'EmptyState':
      return (
        <EmptyState
          title="No data yet"
          description="Add items to get started with your project."
          action={<Button size="sm" variant="primary">Add Item</Button>}
        />
      )
    case 'HeatmapCalendar':
      return (
        <HeatmapCalendar
          data={[
            { date: '2026-01-15', value: 3 },
            { date: '2026-01-16', value: 7 },
            { date: '2026-01-20', value: 5 },
            { date: '2026-02-01', value: 9 },
            { date: '2026-02-14', value: 2 },
            { date: '2026-03-01', value: 6 },
          ]}
        />
      )
    case 'JsonViewer':
      return (
        <JsonViewer
          data={{
            name: 'ui-kit',
            version: '2.5.0',
            components: 147,
            features: ['OKLCH', 'physics', 'zero-dep'],
          }}
        />
      )
    case 'KanbanColumn':
      return (
        <KanbanColumn
          title="To Do"
          columnId="todo"
          cards={[
            { id: '1', title: 'Design system', tags: ['design'], priority: 'high' },
            { id: '2', title: 'Build components', tags: ['dev'], priority: 'medium' },
            { id: '3', title: 'Write docs', priority: 'low' },
          ]}
        />
      )
    case 'PropertyList':
      return (
        <PropertyList
          items={[
            { label: 'Name', value: 'ui-kit' },
            { label: 'Version', value: '2.5.0' },
            { label: 'License', value: 'MIT' },
            { label: 'Components', value: '147' },
          ]}
        />
      )
    case 'ResponsiveCard':
      return (
        <ResponsiveCard
          title="Responsive Card"
          description="Adapts layout to container width automatically"
          actions={<Button size="sm">View</Button>}
        />
      )
    case 'SmartTable':
      return <Badge>SmartTable auto-configures columns from data schema</Badge>
    case 'SortableList':
      return (
        <SortableList
          items={[
            { id: '1', content: 'Item 1 — drag to reorder' },
            { id: '2', content: 'Item 2 — drag to reorder' },
            { id: '3', content: 'Item 3 — drag to reorder' },
          ]}
          onChange={() => {}}
        />
      )
    case 'StorageBar':
      return (
        <StorageBar
          segments={[
            { label: 'System', value: 45, color: 'oklch(65% 0.2 270)' },
            { label: 'Apps', value: 30, color: 'oklch(72% 0.19 145)' },
            { label: 'Free', value: 25 },
          ]}
          total={100}
        />
      )
    case 'TreeView':
      return (
        <TreeView
          nodes={[
            {
              id: '1',
              label: 'src',
              children: [
                { id: '2', label: 'components' },
                { id: '3', label: 'utils' },
              ],
            },
            { id: '4', label: 'package.json' },
            { id: '5', label: 'tsconfig.json' },
          ]}
        />
      )
    case 'TruncatedText':
      return (
        <TruncatedText
          text="This is a long text that will be truncated after two lines. The component handles overflow gracefully with an expand toggle so users can reveal the full content."
          lines={2}
          expandable
        />
      )

    // ── Infrastructure / Monitoring ──
    case 'ConnectionTestPanel':
      return (
        <ConnectionTestPanel
          steps={[
            { id: 'dns', label: 'DNS Lookup', status: 'passed' },
            { id: 'tcp', label: 'TCP Connect', status: 'running' },
            { id: 'tls', label: 'TLS Handshake', status: 'pending' },
          ]}
        />
      )
    case 'DashboardGrid':
      return (
        <DashboardGrid columns={2}>
          <Card style={{ padding: '0.75rem' }}>Widget 1</Card>
          <Card style={{ padding: '0.75rem' }}>Widget 2</Card>
          <Card style={{ padding: '0.75rem' }}>Widget 3</Card>
          <Card style={{ padding: '0.75rem' }}>Widget 4</Card>
        </DashboardGrid>
      )
    case 'DiskMountBar':
      return (
        <DiskMountBar
          mounts={[
            { mount: '/', totalBytes: 1e11, usedBytes: 4.5e10, freeBytes: 5.5e10, utilPct: 45 },
            { mount: '/data', totalBytes: 5e11, usedBytes: 3.8e11, freeBytes: 1.2e11, utilPct: 76 },
          ]}
        />
      )
    case 'EntityCard':
      return (
        <EntityCard
          name="web-prod-01"
          type="Server"
          status="ok"
          metrics={[
            { label: 'CPU', value: '24%' },
            { label: 'Memory', value: '68%' },
          ]}
        />
      )
    case 'GeoMap':
      return (
        <GeoMap
          points={[
            { id: 'nyc', lat: 40.7, lng: -74, label: 'NYC', status: 'ok' },
            { id: 'ldn', lat: 51.5, lng: -0.1, label: 'London', status: 'ok' },
            { id: 'tky', lat: 35.7, lng: 139.7, label: 'Tokyo', status: 'warning' },
          ]}
          style={{ height: 200 }}
        />
      )
    case 'NetworkTrafficCard':
      return (
        <NetworkTrafficCard
          title="eth0"
          status="ok"
          traffic={{ inbound: 150e6, outbound: 100e6 }}
        />
      )
    case 'PipelineStage':
      return (
        <PipelineStage
          stages={[
            { id: 'build', label: 'Build', status: 'success' },
            { id: 'test', label: 'Test', status: 'running' },
            { id: 'deploy', label: 'Deploy', status: 'pending' },
          ]}
        />
      )
    case 'PortStatusGrid':
      return (
        <PortStatusGrid
          ports={Array.from({ length: 24 }, (_, i) => ({
            port: i + 1,
            status: (i < 20 ? 'ok' : i < 22 ? 'warning' : 'critical') as 'ok' | 'warning' | 'critical',
          }))}
        />
      )
    case 'RackDiagram':
      return (
        <RackDiagram
          units={12}
          devices={[
            { startU: 1, heightU: 2, label: 'Core Switch', status: 'ok' },
            { startU: 4, heightU: 3, label: 'App Server', status: 'ok' },
            { startU: 8, heightU: 2, label: 'Storage Array', status: 'warning' },
          ]}
        />
      )
    case 'ServiceStrip':
      return (
        <ServiceStrip
          services={[
            { name: 'nginx', status: 'running' },
            { name: 'postgres', status: 'running' },
            { name: 'redis', status: 'stopped' },
            { name: 'worker', status: 'error' },
          ]}
        />
      )
    case 'SeverityTimeline':
      return (
        <SeverityTimeline
          events={[
            { id: '1', severity: 'critical', title: 'Outage detected', timestamp: Date.now() - 7200000 },
            { id: '2', severity: 'warning', title: 'High CPU usage', timestamp: Date.now() - 3600000 },
            { id: '3', severity: 'ok', title: 'Service recovered', timestamp: Date.now() },
          ]}
        />
      )
    case 'SwitchFaceplate':
      return (
        <SwitchFaceplate
          ports={Array.from({ length: 12 }, (_, i) => ({
            id: i + 1,
            status: (i < 8 ? 'up' : i < 10 ? 'down' : 'unused') as 'up' | 'down' | 'unused',
            type: 'ethernet' as const,
          }))}
          label="SW-01"
        />
      )
    case 'UpstreamDashboard':
      return (
        <UpstreamDashboard
          links={[
            { id: '1', vendor: 'Cogent', location: 'NYC', inbound: 500e6, outbound: 300e6, status: 'ok' },
            { id: '2', vendor: 'Lumen', location: 'LAX', inbound: 200e6, outbound: 150e6, status: 'warning' },
          ]}
        />
      )
    case 'UptimeTracker':
      return (
        <UptimeTracker
          days={Array.from({ length: 30 }, (_, i) => ({
            date: `2026-03-${String(i + 1).padStart(2, '0')}`,
            status: (i === 15 ? 'degraded' : 'up') as 'up' | 'degraded',
          }))}
        />
      )

    // ── Domain Tools ──
    case 'ColumnVisibilityToggle':
      return (
        <ColumnVisibilityToggle
          columns={[
            { id: 'name', label: 'Name', visible: true },
            { id: 'status', label: 'Status', visible: true },
            { id: 'date', label: 'Date', visible: false },
          ]}
        />
      )
    case 'CSVExport':
    case 'CSVExportButton':
      return (
        <CSVExportButton
          data={[
            { name: 'Alice', role: 'Admin', email: 'alice@example.com' },
            { name: 'Bob', role: 'User', email: 'bob@example.com' },
          ]}
          filename="export.csv"
        />
      )
    case 'DensitySelector':
      return <DensitySelector />
    case 'InfiniteScroll':
      return (
        <InfiniteScroll onLoadMore={() => {}} hasMore={false} endMessage={<span>All items loaded</span>}>
          <div style={{ padding: '0.5rem' }}>Item 1</div>
          <div style={{ padding: '0.5rem' }}>Item 2</div>
          <div style={{ padding: '0.5rem' }}>Item 3</div>
        </InfiniteScroll>
      )
    case 'ScrollReveal':
      return (
        <ScrollReveal animation="fade-up">
          <Card style={{ padding: '1rem' }}>This content reveals on scroll</Card>
        </ScrollReveal>
      )
    case 'StepWizard':
      return (
        <StepWizard
          steps={[
            { id: '1', label: 'Account' },
            { id: '2', label: 'Profile' },
            { id: '3', label: 'Confirm' },
          ]}
          activeStep={1}
        >
          <div style={{ padding: '1rem' }}>Step content area</div>
        </StepWizard>
      )
    case 'TimeRangeSelector':
      return <TimeRangeSelector />
    case 'ToastProvider':
      return <Button variant="secondary" onClick={() => {}}>Show Toast</Button>
    case 'ViewTransitionLink':
      return <Badge>ViewTransitionLink morphs between routes</Badge>
    case 'NotificationStack':
      return (
        <NotificationStack
          notifications={[
            { id: '1', title: 'Deploy complete', description: 'v2.5.0 deployed to production', timestamp: Date.now() - 120000, variant: 'success' },
            { id: '2', title: 'New comment', description: 'Alice commented on PR #42', timestamp: Date.now() - 60000 },
          ]}
        />
      )
    case 'CommandBar':
      return <Button variant="secondary" onClick={() => {}}>Open Command Bar (Cmd+K)</Button>
    case 'CodeEditor':
      return (
        <CodeEditor
          language="typescript"
          defaultValue={'const greeting: string = "Hello, world!";\nconsole.log(greeting);'}
        />
      )
    case 'Cropper':
      return <Badge>Cropper requires an image source (use src prop)</Badge>
    case 'RichTextEditor':
      return <RichTextEditor />
    case 'Tour':
      return <Badge>Tour creates guided onboarding steps over target elements</Badge>
    case 'ShimmerButton':
      return <ShimmerButton>Shimmer Effect</ShimmerButton>

    // ── Visual Effects ──
    case 'BackgroundBeams':
      return (
        <div style={{ position: 'relative', height: 120, borderRadius: 8, overflow: 'hidden', background: 'var(--bg-base)' }}>
          <BackgroundBeams />
          <div style={{ position: 'relative', zIndex: 1, padding: '1rem', color: 'var(--text-primary)' }}>Background Beams</div>
        </div>
      )
    case 'BackgroundBoxes':
      return (
        <div style={{ position: 'relative', height: 120, borderRadius: 8, overflow: 'hidden', background: 'var(--bg-base)' }}>
          <BackgroundBoxes />
          <div style={{ position: 'relative', zIndex: 1, padding: '1rem', color: 'var(--text-primary)' }}>Background Boxes</div>
        </div>
      )
    case 'BorderBeam':
      return (
        <BorderBeam>
          <Card style={{ padding: '0.75rem' }}>Content with animated border beam</Card>
        </BorderBeam>
      )
    case 'Card3D':
      return (
        <Card3D>
          <Card style={{ padding: '0.75rem' }}>Hover for 3D tilt effect</Card>
        </Card3D>
      )
    case 'EncryptedText':
      return <EncryptedText text="ENCRYPTED" />
    case 'EvervaultCard':
      return (
        <EvervaultCard>
          <div style={{ padding: '1rem' }}>Hover for evervault effect</div>
        </EvervaultCard>
      )
    case 'FlipWords':
      return <FlipWords words={['innovative', 'powerful', 'beautiful', 'fast']} />
    case 'GlowCard':
      return (
        <GlowCard>
          <div style={{ padding: '0.75rem' }}>Hover for glow effect</div>
        </GlowCard>
      )
    case 'HeroHighlight':
      return (
        <HeroHighlight>
          <div style={{ padding: '1rem' }}>Highlighted hero content</div>
        </HeroHighlight>
      )
    case 'MeteorShower':
      return (
        <div style={{ position: 'relative', height: 120, borderRadius: 8, overflow: 'hidden', background: 'var(--bg-base)' }}>
          <MeteorShower count={5} />
        </div>
      )
    case 'NumberTicker':
      return <NumberTicker value={9876} />
    case 'OrbitingCircles':
      return (
        <div style={{ position: 'relative', height: 160 }}>
          <OrbitingCircles>
            <span>A</span>
            <span>B</span>
            <span>C</span>
          </OrbitingCircles>
        </div>
      )
    case 'Ripple':
      return (
        <Ripple>
          <Button>Click for ripple</Button>
        </Ripple>
      )
    case 'SpotlightCard':
      return (
        <SpotlightCard>
          <div style={{ padding: '0.75rem' }}>Hover for spotlight</div>
        </SpotlightCard>
      )
    case 'TextReveal':
      return <TextReveal text="Revealed on scroll" />
    case 'TracingBeam':
      return (
        <div style={{ height: 100 }}>
          <TracingBeam>
            <p style={{ margin: 0 }}>Tracing beam follows scroll position</p>
          </TracingBeam>
        </div>
      )
    case 'WavyBackground':
      return (
        <div style={{ position: 'relative', height: 120, borderRadius: 8, overflow: 'hidden' }}>
          <WavyBackground />
          <div style={{ position: 'relative', zIndex: 1, padding: '1rem', color: 'var(--text-primary)' }}>Wavy background</div>
        </div>
      )

    // ── AI / Realtime ──
    case 'ConfidenceBar':
      return <ConfidenceBar value={72} label="Model Confidence" showValue />
    case 'LiveFeed':
      return (
        <LiveFeed
          items={[
            { id: '1', content: 'Server started on port 3000', timestamp: Date.now() - 120000 },
            { id: '2', content: 'Request received: GET /api/users', timestamp: Date.now() - 60000 },
            { id: '3', content: 'Database query completed in 42ms', timestamp: Date.now() },
          ]}
        />
      )
    case 'RealtimeValue':
      return <RealtimeValue value={42.7} previousValue={41.2} showDelta />
    case 'StreamingText':
      return <StreamingText text="This text streams in token by token like an LLM response..." speed={50} />
    case 'TypingIndicator':
      return <TypingIndicator />

    default:
      return (
        <Card style={{ padding: '1rem' }}>
          <span style={{ fontWeight: 700 }}>{name}</span>
          <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', margin: '0.25rem 0 0' }}>
            Interactive preview for this component.
          </p>
        </Card>
      )
  }
}
