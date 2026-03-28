'use client'

import { useState, useMemo, useCallback, useRef, useEffect } from 'react'
import { css } from '@ui/core/styles/css-tag'
import { useStyles } from '@ui/core/styles/use-styles'
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

// ── Additional Imports: Primitives ───────────────────────────────────────────
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

// ── Additional Imports: Forms ────────────────────────────────────────────────
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

// ── Additional Imports: Navigation ───────────────────────────────────────────
import { Stepper } from '@ui/components/stepper'
import { TableOfContents } from '@ui/components/table-of-contents'
import { Timeline as TimelineComp } from '@ui/components/timeline'
import { Navbar } from '@ui/components/navbar'
import { Sidebar } from '@ui/components/sidebar'
import { AppShell } from '@ui/components/app-shell'
import { BackToTop } from '@ui/components/back-to-top'
import { Carousel } from '@ui/components/carousel'
import { ContainerQuery } from '@ui/components/container-query'

// ── Additional Imports: Overlays ─────────────────────────────────────────────
import { Dialog } from '@ui/components/dialog'
import { Drawer } from '@ui/components/drawer'
import { DropdownMenu } from '@ui/components/dropdown-menu'
import { NativeTooltip } from '@ui/components/native-tooltip'
import { Popover } from '@ui/components/popover'
import { Sheet } from '@ui/components/sheet'

// ── Additional Imports: Data Display ─────────────────────────────────────────
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

// ── Additional Imports: Infrastructure / Monitoring ──────────────────────────
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

// ── Additional Imports: Domain Tools ─────────────────────────────────────────
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

// ── Additional Imports: Visual Effects ───────────────────────────────────────
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

// ── Additional Imports: AI / Realtime ────────────────────────────────────────
import { ConfidenceBar } from '@ui/domain/confidence-bar'
import { LiveFeed } from '@ui/domain/live-feed'
import { RealtimeValue } from '@ui/domain/realtime-value'
import { StreamingText } from '@ui/domain/streaming-text'
import { TypingIndicator } from '@ui/domain/typing-indicator'

import { useTier } from '../App'
import { renderComponentPreview } from '../utils/component-previews'
import { getComponentDatabase, searchComponents, type ComponentInfo } from '../utils/component-database'
import {
  generateFromTemplate,
  generateFromComponents,
  type LayoutTemplate,
  type GeneratedCode,
} from '../utils/code-generator'

// ─── Styles ─────────────────────────────────────────────────────────────────

const styles = css`
  @layer demo {
    .gen-page {
      max-width: 1100px;
      margin: 0 auto;
    }

    /* ── Hero ─────────────────────────────────────────────────────────── */
    .gen-hero {
      margin-block-end: 2.5rem;
    }

    .gen-hero__title {
      font-size: var(--text-2xl, 1.875rem);
      font-weight: 800;
      letter-spacing: -0.02em;
      margin-block-end: 0.25rem;
      background: linear-gradient(135deg, oklch(75% 0.2 270), oklch(70% 0.25 300));
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }

    .gen-hero__subtitle {
      font-size: var(--text-sm, 0.875rem);
      color: var(--text-secondary);
      max-width: 600px;
    }

    /* ── Section Headers ──────────────────────────────────────────────── */
    .gen-section {
      margin-block-end: 2.5rem;
    }

    .gen-section__header {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      margin-block-end: 1rem;
    }

    .gen-section__title {
      font-size: var(--text-lg, 1.125rem);
      font-weight: 700;
      letter-spacing: -0.01em;
    }

    .gen-section__badge {
      font-size: 0.75rem;
    }

    /* ── Template Gallery ─────────────────────────────────────────────── */
    .gen-templates {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(230px, 1fr));
      gap: 1rem;
    }

    .gen-template-card {
      position: relative;
      padding: 1.25rem;
      border-radius: 12px;
      background: var(--bg-elevated);
      border: 2px solid transparent;
      cursor: pointer;
      transition: border-color 0.2s, box-shadow 0.2s, transform 0.15s;

      &:hover {
        transform: translateY(-2px);
        box-shadow: var(--shadow-md);
      }

      &[data-active='true'] {
        border-color: var(--brand);
        box-shadow: 0 0 0 3px oklch(from var(--brand) l c h / 0.15);
      }
    }

    .gen-template-card__icon {
      width: 40px;
      height: 40px;
      border-radius: 10px;
      background: oklch(from var(--brand) l c h / 0.15);
      display: flex;
      align-items: center;
      justify-content: center;
      margin-block-end: 0.75rem;
      color: var(--brand-light);
    }

    .gen-template-card__title {
      font-size: 0.9375rem;
      font-weight: 600;
      margin-block-end: 0.25rem;
    }

    .gen-template-card__desc {
      font-size: 0.8125rem;
      color: var(--text-secondary);
      line-height: 1.4;
    }

    .gen-template-card__components {
      display: flex;
      flex-wrap: wrap;
      gap: 0.375rem;
      margin-block-start: 0.75rem;
    }

    /* ── Custom Builder ───────────────────────────────────────────────── */
    .gen-builder {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1.5rem;

      @media (max-width: 768px) {
        grid-template-columns: 1fr;
      }
    }

    .gen-builder__panel {
      min-height: 300px;
    }

    .gen-builder__panel-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-block-end: 0.75rem;
    }

    .gen-builder__panel-title {
      font-size: 0.875rem;
      font-weight: 600;
      color: var(--text-secondary);
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }

    .gen-component-list {
      display: flex;
      flex-direction: column;
      gap: 0.375rem;
      max-height: 400px;
      overflow-y: auto;
      padding-inline-end: 0.25rem;
    }

    .gen-component-item {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 0.625rem 0.75rem;
      border-radius: 8px;
      background: var(--bg-elevated);
      cursor: pointer;
      transition: background 0.15s, opacity 0.15s, transform 0.15s;
      user-select: none;

      &:hover {
        background: var(--bg-hover);
      }

      &[draggable='true'] {
        cursor: grab;
      }

      &[draggable='true']:active {
        cursor: grabbing;
      }

      &.gen-dragging {
        opacity: 0.4;
        transform: scale(0.97);
      }
    }

    .gen-drag-handle {
      display: flex;
      align-items: center;
      color: var(--text-tertiary);
      flex-shrink: 0;
      cursor: grab;
      touch-action: none;

      &:active {
        cursor: grabbing;
      }
    }

    .gen-drag-handle__icon {
      display: flex;
      flex-direction: column;
      gap: 2px;
      width: 12px;
      align-items: center;
    }

    .gen-drag-handle__dots {
      display: flex;
      gap: 2px;
    }

    .gen-drag-handle__dot {
      width: 3px;
      height: 3px;
      border-radius: 50%;
      background: currentColor;
    }

    .gen-component-item__name {
      font-size: 0.875rem;
      font-weight: 600;
    }

    .gen-component-item__desc {
      font-size: 0.75rem;
      color: var(--text-secondary);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .gen-component-item__add {
      margin-inline-start: auto;
      flex-shrink: 0;
    }

    .gen-selected-list {
      display: flex;
      flex-direction: column;
      gap: 0.375rem;
      min-height: 60px;
    }

    .gen-selected-item {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.5rem 0.75rem;
      border-radius: 8px;
      background: oklch(from var(--brand) l c h / 0.1);
      border: 1px solid oklch(from var(--brand) l c h / 0.2);
      transition: opacity 0.15s, transform 0.15s;

      &[draggable='true'] {
        cursor: grab;
      }

      &[draggable='true']:active {
        cursor: grabbing;
      }

      &.gen-dragging {
        opacity: 0.4;
        transform: scale(0.97);
      }
    }

    .gen-selected-item__name {
      font-size: 0.875rem;
      font-weight: 600;
      flex: 1;
    }

    .gen-composition-drop-zone {
      min-height: 200px;
      border-radius: 12px;
      border: 2px dashed var(--border-default);
      transition: border-color 0.2s, background 0.2s, box-shadow 0.2s;
      padding: 0.5rem;
    }

    .gen-composition-drop-zone[data-drag-over='true'] {
      border-color: var(--brand);
      background: oklch(from var(--brand) l c h / 0.05);
      box-shadow: 0 0 0 3px oklch(from var(--brand) l c h / 0.1);
    }

    .gen-selected-empty {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      height: 200px;
      color: var(--text-secondary);
      font-size: 0.875rem;
      gap: 0.5rem;
    }

    .gen-selected-empty__icon {
      color: var(--text-tertiary);
      opacity: 0.5;
    }

    .gen-drag-indicator {
      height: 2px;
      background: var(--brand);
      border-radius: 1px;
      margin: -1px 0;
      transition: opacity 0.1s;
      box-shadow: 0 0 4px oklch(from var(--brand) l c h / 0.4);
    }

    .gen-item-enter {
      animation: gen-item-slide-in 0.2s ease-out;
    }

    @keyframes gen-item-slide-in {
      from {
        opacity: 0;
        transform: translateY(-8px) scale(0.95);
      }
      to {
        opacity: 1;
        transform: translateY(0) scale(1);
      }
    }

    .gen-item-remove {
      animation: gen-item-slide-out 0.15s ease-in forwards;
    }

    @keyframes gen-item-slide-out {
      from {
        opacity: 1;
        transform: translateX(0) scale(1);
      }
      to {
        opacity: 0;
        transform: translateX(20px) scale(0.95);
      }
    }

    /* ── Layout Selector ──────────────────────────────────────────────── */
    .gen-layout-selector {
      display: flex;
      gap: 0.5rem;
      margin-block-end: 1rem;
    }

    .gen-layout-btn {
      padding: 0.5rem 1rem;
      border-radius: 8px;
      border: 1px solid var(--border-subtle);
      background: transparent;
      color: var(--text-primary);
      cursor: pointer;
      font-size: 0.8125rem;
      font-weight: 500;
      transition: all 0.15s;

      &:hover {
        background: var(--bg-hover);
      }

      &[data-active='true'] {
        background: oklch(from var(--brand) l c h / 0.15);
        border-color: var(--brand);
        color: var(--brand-light);
      }
    }

    /* ── Columns Selector ──────────────────────────────────────────────── */
    .gen-columns-selector {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      margin-block-end: 1rem;
    }

    .gen-columns-selector__label {
      font-size: 0.8125rem;
      font-weight: 600;
      color: var(--text-secondary);
    }

    .gen-columns-selector__btns {
      display: flex;
      gap: 0.25rem;
    }

    .gen-col-btn {
      padding: 0.375rem 0.625rem;
      border-radius: 6px;
      border: 1px solid var(--border-subtle);
      background: transparent;
      color: var(--text-primary);
      cursor: pointer;
      font-size: 0.75rem;
      font-weight: 600;
      min-width: 2rem;
      text-align: center;
      transition: all 0.15s;

      &:hover {
        background: var(--bg-hover);
      }

      &[data-active='true'] {
        background: oklch(from var(--brand) l c h / 0.15);
        border-color: var(--brand);
        color: var(--brand-light);
      }
    }

    /* ── Composition Grid ──────────────────────────────────────────────── */
    .gen-composition-grid {
      display: grid;
      grid-template-columns: repeat(var(--gen-cols, 2), 1fr);
      gap: 0.75rem;
      min-height: 60px;

      @media (max-width: 600px) {
        grid-template-columns: 1fr;
      }
    }

    .gen-composition-item {
      grid-column: span var(--gen-span, 1);
    }

    /* ── Span Control ──────────────────────────────────────────────────── */
    .gen-span-control {
      display: flex;
      align-items: center;
      gap: 0.25rem;
      margin-inline-start: auto;
      flex-shrink: 0;
    }

    .gen-span-label {
      font-size: 0.625rem;
      color: var(--text-tertiary);
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.04em;
    }

    .gen-span-btn {
      width: 1.375rem;
      height: 1.375rem;
      border-radius: 4px;
      border: 1px solid var(--border-subtle);
      background: transparent;
      color: var(--text-secondary);
      cursor: pointer;
      font-size: 0.625rem;
      font-weight: 700;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 0;
      transition: all 0.12s;

      &:hover {
        background: var(--bg-hover);
      }

      &[data-active='true'] {
        background: oklch(from var(--brand) l c h / 0.2);
        border-color: var(--brand);
        color: var(--brand-light);
      }
    }

    .gen-resize-handle {
      display: flex;
      align-items: center;
      color: var(--text-tertiary);
      font-size: 0.75rem;
      opacity: 0.4;
      margin-inline-end: 0.125rem;
    }

    /* ── Tier Selector ────────────────────────────────────────────────── */
    .gen-tier-selector {
      display: flex;
      gap: 0.5rem;
      margin-block-end: 1.5rem;
    }

    .gen-tier-btn {
      padding: 0.375rem 0.875rem;
      border-radius: 20px;
      border: 1px solid var(--border-subtle);
      background: transparent;
      color: var(--text-primary);
      cursor: pointer;
      font-size: 0.8125rem;
      font-weight: 500;
      transition: all 0.15s;

      &:hover {
        background: var(--bg-hover);
      }

      &[data-active='true'] {
        background: oklch(from var(--brand) l c h / 0.15);
        border-color: var(--brand);
        color: var(--brand-light);
      }
    }

    /* ── Code Output ──────────────────────────────────────────────────── */
    .gen-code-output {
      position: relative;
    }

    .gen-code-block {
      background: var(--bg-base);
      border-radius: 12px;
      border: 1px solid var(--border-default);
      overflow: hidden;
    }

    .gen-code-block__header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0.625rem 1rem;
      background: var(--bg-surface);
      border-block-end: 1px solid var(--border-default);
    }

    .gen-code-block__lang {
      font-size: 0.75rem;
      font-weight: 600;
      color: var(--text-secondary);
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }

    .gen-code-block__copy {
      display: flex;
      align-items: center;
      gap: 0.375rem;
      padding: 0.375rem 0.75rem;
      border-radius: 6px;
      border: 1px solid var(--border-subtle);
      background: transparent;
      color: var(--text-secondary);
      cursor: pointer;
      font-size: 0.75rem;
      font-weight: 500;
      transition: all 0.15s;

      &:hover {
        background: var(--bg-hover);
        color: var(--text-primary);
      }

      &[data-copied='true'] {
        color: oklch(75% 0.2 150);
        border-color: oklch(75% 0.2 150 / 0.3);
      }
    }

    .gen-code-block__content {
      padding: 1rem;
      overflow-x: auto;
      max-height: 500px;
      overflow-y: auto;
    }

    .gen-code-block__pre {
      margin: 0;
      font-family: 'SF Mono', 'Fira Code', 'JetBrains Mono', monospace;
      font-size: 0.8125rem;
      line-height: 1.6;
      white-space: pre;
      color: var(--text-primary);
      tab-size: 2;
    }

    /* ── Preview ──────────────────────────────────────────────────────── */
    .gen-preview {
      border-radius: 12px;
      border: 1px solid var(--border-default);
      overflow: hidden;
      margin-block-end: 1.5rem;
    }

    .gen-preview__header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0.625rem 1rem;
      background: var(--bg-surface);
      border-block-end: 1px solid var(--border-default);
    }

    .gen-preview__title {
      font-size: 0.75rem;
      font-weight: 600;
      color: var(--text-secondary);
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }

    .gen-preview__dots {
      display: flex;
      gap: 6px;
    }

    .gen-preview__dot {
      width: 10px;
      height: 10px;
      border-radius: 50%;
    }

    .gen-preview__content {
      padding: 1.5rem;
      min-height: 200px;
      background: var(--bg-base);
    }

    .gen-preview__placeholder {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      height: 200px;
      color: var(--text-secondary);
      text-align: center;
      gap: 0.5rem;
    }

    .gen-preview__placeholder-icon {
      color: var(--text-tertiary);
    }

    /* ── Inline Preview Components ────────────────────────────────────── */
    .gen-inline-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 1rem;
    }

    .gen-inline-metric {
      padding: 1rem;
      border-radius: 10px;
      background: var(--bg-surface);
      border: 1px solid var(--border-default);
    }

    .gen-inline-metric__label {
      font-size: 0.75rem;
      color: var(--text-secondary);
      margin-block-end: 0.25rem;
    }

    .gen-inline-metric__value {
      font-size: 1.5rem;
      font-weight: 700;
    }

    .gen-inline-metric__change {
      font-size: 0.75rem;
      margin-block-start: 0.25rem;
    }

    .gen-inline-table {
      width: 100%;
      border-collapse: collapse;
      font-size: 0.8125rem;
      margin-block-start: 1rem;
    }

    .gen-inline-table th {
      text-align: start;
      padding: 0.5rem 0.75rem;
      border-block-end: 1px solid var(--border-default);
      color: var(--text-secondary);
      font-weight: 600;
      font-size: 0.75rem;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }

    .gen-inline-table td {
      padding: 0.5rem 0.75rem;
      border-block-end: 1px solid var(--border-subtle);
    }

    .gen-inline-form {
      display: flex;
      flex-direction: column;
      gap: 1rem;
      max-width: 400px;
    }

    .gen-inline-input {
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
    }

    .gen-inline-input label {
      font-size: 0.8125rem;
      font-weight: 600;
    }

    .gen-inline-input input,
    .gen-inline-input select {
      padding: 0.5rem 0.75rem;
      border-radius: 8px;
      border: 1px solid var(--border-subtle);
      background: var(--bg-surface);
      color: inherit;
      font-size: 0.875rem;
    }

    .gen-inline-hero {
      text-align: center;
      padding: 2rem 1rem;
    }

    .gen-inline-hero h2 {
      font-size: 1.5rem;
      font-weight: 800;
      margin-block-end: 0.5rem;
    }

    .gen-inline-hero p {
      color: var(--text-secondary);
      margin-block-end: 1rem;
      font-size: 0.875rem;
    }

    .gen-inline-cards {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
      gap: 0.75rem;
      margin-block-start: 1.5rem;
      text-align: start;
    }

    .gen-inline-feature {
      padding: 1rem;
      border-radius: 10px;
      background: var(--bg-surface);
      border: 1px solid var(--border-default);
    }

    .gen-inline-feature h4 {
      font-size: 0.875rem;
      margin-block-end: 0.25rem;
    }

    .gen-inline-feature p {
      font-size: 0.75rem;
      margin: 0;
    }

    .gen-inline-btn {
      display: inline-flex;
      padding: 0.5rem 1.25rem;
      border-radius: 8px;
      border: none;
      font-weight: 600;
      font-size: 0.875rem;
      cursor: pointer;
    }

    .gen-inline-btn--primary {
      background: var(--brand);
      color: white;
    }

    .gen-inline-btn--outline {
      background: transparent;
      border: 1px solid var(--border-strong);
      color: var(--text-primary);
      margin-inline-start: 0.5rem;
    }

    /* ── Tab Override ─────────────────────────────────────────────────── */
    .gen-tabs {
      margin-block-end: 0;
    }
  }
`

// ─── Template Metadata ──────────────────────────────────────────────────────

interface TemplateInfo {
  id: LayoutTemplate
  title: string
  description: string
  icon: 'grid' | 'edit' | 'zap' | 'table'
  components: string[]
}

const templates: TemplateInfo[] = [
  {
    id: 'dashboard',
    title: 'Dashboard',
    description: 'KPI cards, charts, and data tables for admin panels.',
    icon: 'grid',
    components: ['MetricCard', 'DataTable', 'Card', 'Badge'],
  },
  {
    id: 'form',
    title: 'Form',
    description: 'Contact or settings form with validation and submit.',
    icon: 'edit',
    components: ['FormInput', 'Select', 'Checkbox', 'Button', 'Card'],
  },
  {
    id: 'marketing',
    title: 'Marketing',
    description: 'Hero section with CTA, features grid, and badges.',
    icon: 'zap',
    components: ['ShimmerButton', 'Badge', 'Card', 'Typography'],
  },
  {
    id: 'data-table',
    title: 'Data Table',
    description: 'Searchable table with filters, badges, and actions.',
    icon: 'table',
    components: ['DataTable', 'SearchInput', 'Badge', 'Button'],
  },
]

// ─── Framework Tab Configs ──────────────────────────────────────────────────

type Framework = 'react' | 'vue' | 'angular' | 'svelte' | 'html'

interface FrameworkTab {
  value: Framework
  label: string
  lang: string
}

const frameworkTabs: FrameworkTab[] = [
  { value: 'react', label: 'React', lang: 'TSX' },
  { value: 'vue', label: 'Vue', lang: 'VUE' },
  { value: 'angular', label: 'Angular', lang: 'TS' },
  { value: 'svelte', label: 'Svelte', lang: 'SVELTE' },
  { value: 'html', label: 'HTML', lang: 'HTML' },
]

// ─── Copy Button ────────────────────────────────────────────────────────────

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false)
  const timerRef = useRef<ReturnType<typeof setTimeout>>(undefined)

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true)
      if (timerRef.current) clearTimeout(timerRef.current)
      timerRef.current = setTimeout(() => setCopied(false), 2000)
    })
  }, [text])

  useEffect(() => () => { if (timerRef.current) clearTimeout(timerRef.current) }, [])

  return (
    <button className="gen-code-block__copy" onClick={handleCopy} data-copied={copied}>
      <Icon name={copied ? 'check' : 'clipboard'} size="sm" />
      {copied ? 'Copied!' : 'Copy'}
    </button>
  )
}

// ─── Inline Preview Components ──────────────────────────────────────────────

// ─── Composition Item Type ───────────────────────────────────────────────────

interface CompositionItem {
  component: ComponentInfo
  colSpan: number
}

function DashboardPreview() {
  const metrics = [
    { title: 'Revenue', value: '$48,230', change: { value: 12.5 }, trend: 'up' as const, icon: <Icon name="activity" size="sm" /> },
    { title: 'Users', value: '2,847', change: { value: 8.2 }, trend: 'up' as const, icon: <Icon name="user" size="sm" /> },
    { title: 'Conversion', value: '3.24%', change: { value: -1.8 }, trend: 'down' as const, icon: <Icon name="zap" size="sm" /> },
    { title: 'Response', value: '142ms', change: { value: -5.3 }, trend: 'up' as const, icon: <Icon name="clock" size="sm" /> },
  ]

  type DashRow = { name: string; status: string; revenue: string; date: string }
  const dashColumns: ColumnDef<DashRow>[] = [
    { id: 'name', header: 'Name', accessor: 'name', sortable: true },
    { id: 'status', header: 'Status', accessor: 'status', cell: (val) => (
      <StatusBadge status={val === 'Active' ? 'ok' : 'warning'} label={val as string} />
    )},
    { id: 'revenue', header: 'Revenue', accessor: 'revenue', sortable: true },
    { id: 'date', header: 'Date', accessor: 'date', sortable: true },
  ]
  const dashData: DashRow[] = [
    { name: 'Widget Pro', status: 'Active', revenue: '$12,400', date: '2026-03-15' },
    { name: 'Dashboard X', status: 'Active', revenue: '$8,200', date: '2026-03-14' },
    { name: 'Analytics+', status: 'Paused', revenue: '$4,100', date: '2026-03-13' },
    { name: 'Server Monitor', status: 'Active', revenue: '$6,700', date: '2026-03-12' },
    { name: 'Form Builder', status: 'Active', revenue: '$3,200', date: '2026-03-11' },
  ]

  return (
    <>
      <div className="gen-inline-grid">
        {metrics.map(m => (
          <MetricCard key={m.title} title={m.title} value={m.value} change={m.change} trend={m.trend} icon={m.icon} />
        ))}
      </div>
      <div style={{ marginBlockStart: '1rem' }}>
        <DataTable columns={dashColumns} data={dashData} searchable sortable pageSize={5} />
      </div>
    </>
  )
}

function FormPreview() {
  return (
    <div className="gen-inline-form">
      <FormInput label="Full Name" placeholder="Jane Doe" name="name" />
      <FormInput label="Email" placeholder="jane@example.com" name="email" type="email" />
      <Select
        name="category"
        label="Category"
        placeholder="Select a category"
        options={[
          { value: 'general', label: 'General Inquiry' },
          { value: 'support', label: 'Support' },
          { value: 'feedback', label: 'Feedback' },
        ]}
      />
      <Button variant="primary">Send Message</Button>
    </div>
  )
}

function MarketingPreview() {
  return (
    <div className="gen-inline-hero">
      <Badge variant="primary" size="sm">New in v2.3</Badge>
      <h2 style={{ marginBlockStart: '0.75rem' }}>Build beautiful interfaces</h2>
      <p>A revolutionary component library with physics-based animations.</p>
      <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
        <Button variant="primary">Get Started</Button>
        <Button variant="secondary">Documentation</Button>
      </div>
      <div className="gen-inline-cards">
        {['Zero Dependencies', 'Physics Animations', 'OKLCH Colors', 'Three Tiers'].map(f => (
          <Card key={f} style={{ padding: '1rem' }}>
            <h4 style={{ fontSize: '0.875rem', marginBlockEnd: '0.25rem' }}>{f}</h4>
            <p style={{ fontSize: '0.75rem', margin: 0, color: 'var(--text-secondary)' }}>Feature description goes here.</p>
          </Card>
        ))}
      </div>
    </div>
  )
}

function DataTablePreview() {
  type TeamRow = { name: string; role: string; status: string; value: string; updated: string }
  const columns: ColumnDef<TeamRow>[] = [
    { id: 'name', header: 'Name', accessor: 'name', sortable: true },
    { id: 'role', header: 'Role', accessor: 'role', sortable: true },
    { id: 'status', header: 'Status', accessor: 'status', sortable: true, cell: (val) => (
      <StatusBadge status={val === 'Active' ? 'ok' : val === 'Away' ? 'warning' : 'info'} label={val as string} />
    )},
    { id: 'value', header: 'Value', accessor: 'value', sortable: true },
    { id: 'updated', header: 'Updated', accessor: 'updated', sortable: true },
  ]
  const data: TeamRow[] = [
    { name: 'Alice Johnson', role: 'Engineer', status: 'Active', value: '$12,400', updated: '2026-03-25' },
    { name: 'Bob Smith', role: 'Designer', status: 'Active', value: '$9,800', updated: '2026-03-24' },
    { name: 'Carol Williams', role: 'PM', status: 'Away', value: '$7,200', updated: '2026-03-23' },
    { name: 'Dave Brown', role: 'Engineer', status: 'Active', value: '$11,600', updated: '2026-03-22' },
    { name: 'Eve Davis', role: 'QA', status: 'Review', value: '$5,400', updated: '2026-03-21' },
    { name: 'Frank Miller', role: 'DevOps', status: 'Active', value: '$8,900', updated: '2026-03-20' },
  ]

  return (
    <DataTable
      columns={columns}
      data={data}
      searchable
      sortable
      pageSize={5}
    />
  )
}

function CustomComponentPreview({ component }: { component: ComponentInfo }) {
  return <>{renderComponentPreview(component.name)}</>
}

// Legacy switch kept as reference — now delegated to shared utils/component-previews.tsx
function _LegacyCustomComponentPreview({ component }: { component: ComponentInfo }) {
  const name = component.name
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
            { id: '2', trigger: 'How many components?', content: '116 components across 3 weight tiers.' },
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

    // ── Primitives (missing) ──────────────────────────────────────────────────
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
    case 'TextHighlight':
      return <TextHighlight highlight="component">A component library with 147 components.</TextHighlight>

    // ── Forms (missing) ───────────────────────────────────────────────────────
    case 'Combobox':
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

    // ── Navigation (missing) ─────────────────────────────────────────────────
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

    // ── Overlays (missing) ────────────────────────────────────────────────────
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

    // ── Data Display (missing) ────────────────────────────────────────────────
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

    // ── Infrastructure / Monitoring (missing) ─────────────────────────────────
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

    // ── Domain Tools (missing) ────────────────────────────────────────────────
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

    // ── Visual Effects (missing) ──────────────────────────────────────────────
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

    // ── AI / Realtime (missing) ───────────────────────────────────────────────
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

function CustomPreview({ items, columns }: { items: CompositionItem[]; columns: number }) {
  if (items.length === 0) {
    return (
      <div className="gen-preview__placeholder">
        <Icon name="plus" size={32} className="gen-preview__placeholder-icon" />
        <span>Add components to see a preview</span>
      </div>
    )
  }

  return (
    <div
      className="gen-composition-grid"
      style={{ '--gen-cols': columns } as React.CSSProperties}
    >
      {items.map((item, i) => (
        <div
          key={`${item.component.name}-${i}`}
          className="gen-composition-item"
          style={{ '--gen-span': Math.min(item.colSpan, columns) } as React.CSSProperties}
        >
          <CustomComponentPreview component={item.component} />
        </div>
      ))}
    </div>
  )
}

// ─── Main Page Component ────────────────────────────────────────────────────

export default function GeneratorPage() {
  useStyles('gen-page', styles)
  const { tier } = useTier()

  // State
  const [selectedTemplate, setSelectedTemplate] = useState<LayoutTemplate | null>('dashboard')
  const [compositionItems, setCompositionItems] = useState<CompositionItem[]>([])
  const [columns, setColumns] = useState(2)
  const [customLayout, setCustomLayout] = useState<'stack' | 'grid' | 'sidebar'>('stack')
  const [searchQuery, setSearchQuery] = useState('')
  const [activeFramework, setActiveFramework] = useState<Framework>('react')
  const [activeTier, setActiveTier] = useState<string>(tier)
  const [mode, setMode] = useState<'template' | 'custom'>('template')

  // Derived: flat component list for code generation
  const customComponents = useMemo(() => compositionItems.map(item => item.component), [compositionItems])

  // Drag-and-drop state
  const [dragSource, setDragSource] = useState<{ type: 'available' | 'composition'; index: number; name: string } | null>(null)
  const [dragOverComposition, setDragOverComposition] = useState(false)
  const [dropIndicatorIndex, setDropIndicatorIndex] = useState<number | null>(null)
  const [recentlyAdded, setRecentlyAdded] = useState<number | null>(null)
  const compositionRef = useRef<HTMLDivElement>(null)
  const touchStateRef = useRef<{
    active: boolean
    identifier: number
    startX: number
    startY: number
    element: HTMLElement | null
    ghost: HTMLElement | null
    source: { type: 'available' | 'composition'; index: number; name: string } | null
  }>({ active: false, identifier: -1, startX: 0, startY: 0, element: null, ghost: null, source: null })

  // Database
  const allComponents = useMemo(() => getComponentDatabase(), [])
  const filteredComponents = useMemo(() => searchComponents(searchQuery), [searchQuery])

  // Code generation
  const generatedCode: GeneratedCode = useMemo(() => {
    if (mode === 'template' && selectedTemplate) {
      return generateFromTemplate(selectedTemplate, activeTier)
    }
    return generateFromComponents(customComponents, customLayout, activeTier)
  }, [mode, selectedTemplate, customComponents, customLayout, activeTier])

  const currentCode = generatedCode[activeFramework]

  // Handlers
  const selectTemplate = useCallback((t: LayoutTemplate) => {
    setSelectedTemplate(t)
    setMode('template')
  }, [])

  const addComponent = useCallback((c: ComponentInfo, atIndex?: number) => {
    const newItem: CompositionItem = { component: c, colSpan: 1 }
    setCompositionItems(prev => {
      if (atIndex !== undefined && atIndex >= 0 && atIndex <= prev.length) {
        const next = [...prev]
        next.splice(atIndex, 0, newItem)
        return next
      }
      return [...prev, newItem]
    })
    setMode('custom')
    setSelectedTemplate(null)
    setRecentlyAdded(atIndex ?? null)
    setTimeout(() => setRecentlyAdded(null), 250)
  }, [])

  const removeComponent = useCallback((index: number) => {
    setCompositionItems(prev => prev.filter((_, i) => i !== index))
  }, [])

  const clearComponents = useCallback(() => {
    setCompositionItems([])
  }, [])

  const moveComponent = useCallback((fromIndex: number, toIndex: number) => {
    setCompositionItems(prev => {
      const next = [...prev]
      const [moved] = next.splice(fromIndex, 1)
      const adjustedTo = toIndex > fromIndex ? toIndex - 1 : toIndex
      next.splice(adjustedTo, 0, moved)
      return next
    })
  }, [])

  const setItemSpan = useCallback((index: number, span: number) => {
    setCompositionItems(prev => prev.map((item, i) => i === index ? { ...item, colSpan: span } : item))
  }, [])

  // ── Drag handlers for Available items ──
  const handleAvailableDragStart = useCallback((e: React.DragEvent, c: ComponentInfo, index: number) => {
    setDragSource({ type: 'available', index, name: c.name })
    e.dataTransfer.setData('text/plain', JSON.stringify({ type: 'available', name: c.name, index }))
    e.dataTransfer.effectAllowed = 'copyMove'
    const target = e.currentTarget as HTMLElement
    target.classList.add('gen-dragging')
  }, [])

  const handleDragEnd = useCallback((e: React.DragEvent) => {
    const target = e.currentTarget as HTMLElement
    target.classList.remove('gen-dragging')
    setDragSource(null)
    setDragOverComposition(false)
    setDropIndicatorIndex(null)
  }, [])

  // ── Drag handlers for Composition items (reorder) ──
  const handleCompositionDragStart = useCallback((e: React.DragEvent, index: number, name: string) => {
    setDragSource({ type: 'composition', index, name })
    e.dataTransfer.setData('text/plain', JSON.stringify({ type: 'composition', name, index }))
    e.dataTransfer.effectAllowed = 'move'
    const target = e.currentTarget as HTMLElement
    target.classList.add('gen-dragging')
  }, [])

  // ── Drop zone handlers ──
  const handleCompositionDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = dragSource?.type === 'available' ? 'copy' : 'move'
    setDragOverComposition(true)

    // Calculate insertion index based on mouse Y position
    const zone = compositionRef.current
    if (!zone) return
    const items = zone.querySelectorAll('.gen-selected-item')
    let insertIdx = items.length
    for (let i = 0; i < items.length; i++) {
      const rect = items[i].getBoundingClientRect()
      const midY = rect.top + rect.height / 2
      if (e.clientY < midY) {
        insertIdx = i
        break
      }
    }
    setDropIndicatorIndex(insertIdx)
  }, [dragSource])

  const handleCompositionDragLeave = useCallback((e: React.DragEvent) => {
    // Only handle if leaving the zone itself, not entering a child
    const related = e.relatedTarget as Node | null
    const zone = compositionRef.current
    if (zone && related && zone.contains(related)) return
    setDragOverComposition(false)
    setDropIndicatorIndex(null)
  }, [])

  const handleCompositionDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDragOverComposition(false)
    setDropIndicatorIndex(null)

    let data: { type: string; name: string; index: number }
    try {
      data = JSON.parse(e.dataTransfer.getData('text/plain'))
    } catch {
      return
    }

    // Calculate drop index
    const zone = compositionRef.current
    let insertIdx = compositionItems.length
    if (zone) {
      const items = zone.querySelectorAll('.gen-selected-item')
      for (let i = 0; i < items.length; i++) {
        const rect = items[i].getBoundingClientRect()
        const midY = rect.top + rect.height / 2
        if (e.clientY < midY) {
          insertIdx = i
          break
        }
      }
    }

    if (data.type === 'available') {
      // Add from available list
      const comp = allComponents.find(c => c.name === data.name)
      if (comp) addComponent(comp, insertIdx)
    } else if (data.type === 'composition') {
      // Reorder within composition
      moveComponent(data.index, insertIdx)
    }

    setDragSource(null)
  }, [compositionItems, allComponents, addComponent, moveComponent])

  // ── Touch drag support ──
  const createTouchGhost = useCallback((el: HTMLElement, x: number, y: number) => {
    const ghost = el.cloneNode(true) as HTMLElement
    ghost.style.position = 'fixed'
    ghost.style.left = `${x - el.offsetWidth / 2}px`
    ghost.style.top = `${y - el.offsetHeight / 2}px`
    ghost.style.width = `${el.offsetWidth}px`
    ghost.style.pointerEvents = 'none'
    ghost.style.zIndex = '9999'
    ghost.style.opacity = '0.85'
    ghost.style.transform = 'scale(1.05)'
    ghost.style.boxShadow = '0 8px 24px oklch(0% 0 0 / 0.25)'
    ghost.style.borderRadius = '8px'
    ghost.style.transition = 'transform 0.1s'
    document.body.appendChild(ghost)
    return ghost
  }, [])

  const handleTouchStart = useCallback((e: React.TouchEvent, source: { type: 'available' | 'composition'; index: number; name: string }) => {
    const touch = e.touches[0]
    const ts = touchStateRef.current
    ts.active = false // Don't activate until move threshold
    ts.identifier = touch.identifier
    ts.startX = touch.clientX
    ts.startY = touch.clientY
    ts.element = e.currentTarget as HTMLElement
    ts.source = source
    ts.ghost = null
  }, [])

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    const ts = touchStateRef.current
    const touch = Array.from(e.touches).find(t => t.identifier === ts.identifier)
    if (!touch || !ts.element) return

    const dx = touch.clientX - ts.startX
    const dy = touch.clientY - ts.startY

    // Activate drag after threshold
    if (!ts.active) {
      if (Math.abs(dx) + Math.abs(dy) < 10) return
      ts.active = true
      ts.ghost = createTouchGhost(ts.element, touch.clientX, touch.clientY)
      ts.element.classList.add('gen-dragging')
      e.preventDefault()
    }

    if (!ts.active) return
    e.preventDefault()

    // Move ghost
    if (ts.ghost) {
      ts.ghost.style.left = `${touch.clientX - ts.element.offsetWidth / 2}px`
      ts.ghost.style.top = `${touch.clientY - ts.element.offsetHeight / 2}px`
    }

    // Check if over composition zone
    const zone = compositionRef.current
    if (!zone) return
    const zoneRect = zone.getBoundingClientRect()
    const overZone = touch.clientX >= zoneRect.left && touch.clientX <= zoneRect.right &&
                     touch.clientY >= zoneRect.top && touch.clientY <= zoneRect.bottom

    setDragOverComposition(overZone)

    if (overZone) {
      const items = zone.querySelectorAll('.gen-selected-item')
      let idx = items.length
      for (let i = 0; i < items.length; i++) {
        const rect = items[i].getBoundingClientRect()
        if (touch.clientY < rect.top + rect.height / 2) {
          idx = i
          break
        }
      }
      setDropIndicatorIndex(idx)
    } else {
      setDropIndicatorIndex(null)
    }
  }, [createTouchGhost])

  const handleTouchEnd = useCallback((_e: React.TouchEvent) => {
    const ts = touchStateRef.current
    if (ts.ghost) {
      ts.ghost.remove()
      ts.ghost = null
    }
    if (ts.element) {
      ts.element.classList.remove('gen-dragging')
    }

    if (ts.active && ts.source) {
      const zone = compositionRef.current
      if (dragOverComposition && zone) {
        // Determine drop index from indicator
        const insertIdx = dropIndicatorIndex ?? compositionItems.length

        if (ts.source.type === 'available') {
          const comp = allComponents.find(c => c.name === ts.source!.name)
          if (comp) addComponent(comp, insertIdx)
        } else if (ts.source.type === 'composition') {
          moveComponent(ts.source.index, insertIdx)
        }
      } else if (ts.source.type === 'composition') {
        // Dragged out of composition zone — remove
        removeComponent(ts.source.index)
      }
    }

    ts.active = false
    ts.source = null
    ts.element = null
    setDragOverComposition(false)
    setDropIndicatorIndex(null)
  }, [dragOverComposition, dropIndicatorIndex, compositionItems, allComponents, addComponent, moveComponent, removeComponent])

  return (
    <div className="gen-page">
      {/* Hero */}
      <div className="gen-hero">
        <h1 className="gen-hero__title">Code Generator</h1>
        <p className="gen-hero__subtitle">
          Generate production-ready code from templates or by composing components.
          Outputs code for React, Vue, Angular, Svelte, and plain HTML.
        </p>
      </div>

      {/* Tier Selector */}
      <div className="gen-tier-selector">
        {(['lite', 'standard', 'premium'] as const).map((t) => (
          <button
            key={t}
            className="gen-tier-btn"
            data-active={activeTier === t}
            onClick={() => setActiveTier(t)}
          >
            {t.charAt(0).toUpperCase() + t.slice(1)}
          </button>
        ))}
      </div>

      {/* Template Gallery */}
      <div className="gen-section">
        <div className="gen-section__header">
          <Icon name="grid" size="sm" />
          <span className="gen-section__title">Templates</span>
          <Badge variant="info" size="sm" className="gen-section__badge">Quick Start</Badge>
        </div>

        <div className="gen-templates">
          {templates.map((t) => (
            <div
              key={t.id}
              className="gen-template-card"
              data-active={mode === 'template' && selectedTemplate === t.id}
              onClick={() => selectTemplate(t.id)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => e.key === 'Enter' && selectTemplate(t.id)}
            >
              <div className="gen-template-card__icon">
                <Icon name={t.icon} size="sm" />
              </div>
              <div className="gen-template-card__title">{t.title}</div>
              <div className="gen-template-card__desc">{t.description}</div>
              <div className="gen-template-card__components">
                {t.components.map(c => (
                  <Badge key={c} variant="info" size="sm">{c}</Badge>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Custom Builder */}
      <div className="gen-section">
        <div className="gen-section__header">
          <Icon name="plus" size="sm" />
          <span className="gen-section__title">Custom Builder</span>
          <Badge variant="info" size="sm" className="gen-section__badge">
            {customComponents.length} selected
          </Badge>
        </div>

        {/* Layout selector */}
        <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap', alignItems: 'center', marginBlockEnd: '1rem' }}>
          <div className="gen-layout-selector" style={{ marginBlockEnd: 0 }}>
            {(['stack', 'grid', 'sidebar'] as const).map((l) => (
              <button
                key={l}
                className="gen-layout-btn"
                data-active={customLayout === l}
                onClick={() => { setCustomLayout(l); if (compositionItems.length > 0) setMode('custom') }}
              >
                {l.charAt(0).toUpperCase() + l.slice(1)}
              </button>
            ))}
          </div>

          <div className="gen-columns-selector" style={{ marginBlockEnd: 0 }}>
            <span className="gen-columns-selector__label">Columns:</span>
            <div className="gen-columns-selector__btns">
              {([1, 2, 3, 4] as const).map((n) => (
                <button
                  key={n}
                  className="gen-col-btn"
                  data-active={columns === n}
                  onClick={() => setColumns(n)}
                >
                  {n}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="gen-builder">
          {/* Available Components */}
          <div className="gen-builder__panel">
            <div className="gen-builder__panel-header">
              <span className="gen-builder__panel-title">Available</span>
            </div>
            <SearchInput
              placeholder="Search components..."
              value={searchQuery}
              onChange={setSearchQuery}
              style={{ marginBlockEnd: '0.75rem' }}
            />
            <div className="gen-component-list">
              {filteredComponents.map((c, idx) => (
                <div
                  key={c.name}
                  className="gen-component-item"
                  draggable
                  onDragStart={(e) => handleAvailableDragStart(e, c, idx)}
                  onDragEnd={handleDragEnd}
                  onTouchStart={(e) => handleTouchStart(e, { type: 'available', index: idx, name: c.name })}
                  onTouchMove={handleTouchMove}
                  onTouchEnd={handleTouchEnd}
                  onClick={() => addComponent(c)}
                >
                  <span className="gen-drag-handle" aria-hidden="true">
                    <span className="gen-drag-handle__icon">
                      <span className="gen-drag-handle__dots"><span className="gen-drag-handle__dot" /><span className="gen-drag-handle__dot" /></span>
                      <span className="gen-drag-handle__dots"><span className="gen-drag-handle__dot" /><span className="gen-drag-handle__dot" /></span>
                      <span className="gen-drag-handle__dots"><span className="gen-drag-handle__dot" /><span className="gen-drag-handle__dot" /></span>
                    </span>
                  </span>
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <div className="gen-component-item__name">{c.name}</div>
                    <div className="gen-component-item__desc">{c.description}</div>
                  </div>
                  <Badge variant="info" size="sm">{c.category}</Badge>
                  <button className="gen-component-item__add" onClick={(e) => { e.stopPropagation(); addComponent(c) }}>
                    <Icon name="plus" size="sm" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Selected Components */}
          <div className="gen-builder__panel">
            <div className="gen-builder__panel-header">
              <span className="gen-builder__panel-title">Composition</span>
              {compositionItems.length > 0 && (
                <Button variant="ghost" size="sm" onClick={clearComponents}>Clear All</Button>
              )}
            </div>
            <div
              ref={compositionRef}
              className="gen-composition-drop-zone"
              data-drag-over={dragOverComposition}
              onDragOver={handleCompositionDragOver}
              onDragLeave={handleCompositionDragLeave}
              onDrop={handleCompositionDrop}
            >
              {compositionItems.length === 0 ? (
                <div className="gen-selected-empty">
                  <span className="gen-selected-empty__icon" aria-hidden="true">
                    <Icon name="plus" size={28} />
                  </span>
                  <span>Drop components here</span>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>
                    or click items on the left to add
                  </span>
                </div>
              ) : (
                <div className="gen-selected-list">
                  {compositionItems.map((item, i) => (
                    <div key={`${item.component.name}-${i}`}>
                      {dropIndicatorIndex === i && dragOverComposition && (
                        <div className="gen-drag-indicator" />
                      )}
                      <div
                        className={`gen-selected-item${recentlyAdded === i ? ' gen-item-enter' : ''}`}
                        draggable
                        onDragStart={(e) => handleCompositionDragStart(e, i, item.component.name)}
                        onDragEnd={handleDragEnd}
                        onTouchStart={(e) => handleTouchStart(e, { type: 'composition', index: i, name: item.component.name })}
                        onTouchMove={handleTouchMove}
                        onTouchEnd={handleTouchEnd}
                      >
                        <span className="gen-drag-handle" aria-hidden="true">
                          <span className="gen-drag-handle__icon">
                            <span className="gen-drag-handle__dots"><span className="gen-drag-handle__dot" /><span className="gen-drag-handle__dot" /></span>
                            <span className="gen-drag-handle__dots"><span className="gen-drag-handle__dot" /><span className="gen-drag-handle__dot" /></span>
                            <span className="gen-drag-handle__dots"><span className="gen-drag-handle__dot" /><span className="gen-drag-handle__dot" /></span>
                          </span>
                        </span>
                        <span className="gen-selected-item__name">{item.component.name}</span>
                        <div className="gen-span-control">
                          <span className="gen-resize-handle" aria-hidden="true">
                            <Icon name="grid" size={12} />
                          </span>
                          <span className="gen-span-label">Span</span>
                          {([1, 2, 3, 4] as const).map((s) => (
                            <button
                              key={s}
                              className="gen-span-btn"
                              data-active={item.colSpan === s}
                              onClick={(e) => { e.stopPropagation(); setItemSpan(i, s) }}
                              title={`Span ${s} column${s > 1 ? 's' : ''}`}
                            >
                              {s}
                            </button>
                          ))}
                        </div>
                        <button onClick={() => removeComponent(i)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)', flexShrink: 0 }}>
                          <Icon name="x" size="sm" />
                        </button>
                      </div>
                    </div>
                  ))}
                  {dropIndicatorIndex === compositionItems.length && dragOverComposition && (
                    <div className="gen-drag-indicator" />
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Preview */}
      <div className="gen-section">
        <div className="gen-section__header">
          <Icon name="eye" size="sm" />
          <span className="gen-section__title">Preview</span>
        </div>

        <div className="gen-preview">
          <div className="gen-preview__header">
            <div className="gen-preview__dots">
              <div className="gen-preview__dot" style={{ background: 'oklch(65% 0.2 25)' }} />
              <div className="gen-preview__dot" style={{ background: 'oklch(80% 0.2 90)' }} />
              <div className="gen-preview__dot" style={{ background: 'oklch(75% 0.2 150)' }} />
            </div>
            <span className="gen-preview__title">
              {mode === 'template' && selectedTemplate
                ? `${selectedTemplate.charAt(0).toUpperCase() + selectedTemplate.slice(1)} Template`
                : 'Custom Layout'}
            </span>
          </div>
          <div className="gen-preview__content">
            {mode === 'template' && selectedTemplate === 'dashboard' && <DashboardPreview />}
            {mode === 'template' && selectedTemplate === 'form' && <FormPreview />}
            {mode === 'template' && selectedTemplate === 'marketing' && <MarketingPreview />}
            {mode === 'template' && selectedTemplate === 'data-table' && <DataTablePreview />}
            {mode === 'custom' && <CustomPreview items={compositionItems} columns={columns} />}
            {!selectedTemplate && mode === 'template' && (
              <div className="gen-preview__placeholder">
                <Icon name="eye" size={32} className="gen-preview__placeholder-icon" />
                <span>Select a template to see a preview</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Code Output */}
      <div className="gen-section">
        <div className="gen-section__header">
          <Icon name="code" size="sm" />
          <span className="gen-section__title">Generated Code</span>
        </div>

        {/* Framework Tabs */}
        <div style={{ display: 'flex', gap: '0.25rem', marginBlockEnd: '0.75rem' }}>
          {frameworkTabs.map((tab) => (
            <button
              key={tab.value}
              className="gen-layout-btn"
              data-active={activeFramework === tab.value}
              onClick={() => setActiveFramework(tab.value)}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="gen-code-block">
          <div className="gen-code-block__header">
            <span className="gen-code-block__lang">
              {frameworkTabs.find(t => t.value === activeFramework)?.lang}
            </span>
            <CopyButton text={currentCode} />
          </div>
          <div className="gen-code-block__content">
            <pre className="gen-code-block__pre">{currentCode}</pre>
          </div>
        </div>
      </div>
    </div>
  )
}
