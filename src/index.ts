// ── Utils ────────────────────────────────────────────────────────────────────
export {
  cn,
  sanitize,
  isSafeColor,
  fmtBps,
  fmtSpeed,
  fmtUtil,
  fmtBytes,
  fmtPct,
  fmtUptime,
  fmtRelative,
  fmtCompact,
  fmtDuration,
  stripCidr,
  clamp,
  utilColor,
  defaultUtilColorMap,
} from './utils'

export type { UtilColorMap } from './utils'

// ── Components ───────────────────────────────────────────────────────────────
export { Button } from './components/button'
export type { ButtonProps, ButtonVariant, ButtonSize } from './components/button'

export { Badge, createBadgeVariant } from './components/badge'
export type { BadgeProps, BadgeColor, BadgeVariantConfig } from './components/badge'

export { Checkbox } from './components/checkbox'
export type { CheckboxProps } from './components/checkbox'

export { Select } from './components/select'
export type { SelectProps, SelectOption } from './components/select'

export { ToggleSwitch } from './components/toggle-switch'
export type { ToggleSwitchProps } from './components/toggle-switch'

export { FormInput, INPUT_CLS, LABEL_CLS, TEXTAREA_CLS } from './components/form-input'
export type { FormInputProps } from './components/form-input'

export { FilterPill } from './components/filter-pill'
export type { FilterPillProps } from './components/filter-pill'

export { EmptyState } from './components/empty-state'
export type { EmptyStateProps } from './components/empty-state'

export { Skeleton, SkeletonText, SkeletonCard } from './components/skeleton'
export type { SkeletonTextProps } from './components/skeleton'

export { TruncatedText } from './components/truncated-text'
export type { TruncatedTextProps } from './components/truncated-text'

export { ConfirmDialog } from './components/confirm-dialog'
export type { ConfirmDialogProps } from './components/confirm-dialog'

export { AnimatedCounter } from './components/animated-counter'
export type { AnimatedCounterProps } from './components/animated-counter'

export { SuccessCheckmark } from './components/success-checkmark'
export type { SuccessCheckmarkProps } from './components/success-checkmark'

export { StatusBadge, defaultStatusMap } from './components/status-badge'
export type { StatusBadgeProps, StatusConfig } from './components/status-badge'

export { StatusPulse, defaultPulseConfigMap } from './components/status-pulse'
export type { StatusPulseProps, PulseConfig } from './components/status-pulse'

export { Toaster, toast } from './components/toast'
export type { ToasterProps } from './components/toast'

export { DataTable } from './components/data-table'
export type { DataTableProps, Density } from './components/data-table'

export { Tabs } from './components/tabs'
export type { TabsProps, Tab } from './components/tabs'

export { DropdownMenu } from './components/dropdown-menu'
export type { DropdownMenuProps, MenuItem } from './components/dropdown-menu'

export { Sheet } from './components/sheet'
export type { SheetProps } from './components/sheet'

export { Progress } from './components/progress'
export type { ProgressProps } from './components/progress'

export { Avatar } from './components/avatar'
export type { AvatarProps } from './components/avatar'

export { Popover } from './components/popover'
export type { PopoverProps } from './components/popover'

export { Slider } from './components/slider'
export type { SliderProps } from './components/slider'

export { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from './components/card'
export type { CardProps, CardSubProps } from './components/card'

export { RadioGroup } from './components/radio-group'
export type { RadioGroupProps, RadioOption } from './components/radio-group'

export { Tooltip } from './components/tooltip'
export type { TooltipProps } from './components/tooltip'

// ── Monitoring Components ────────────────────────────────────────────────────
export { MetricCard } from './components/metric-card'
export type { MetricCardProps } from './components/metric-card'

export { UtilizationBar } from './components/utilization-bar'
export type { UtilizationBarProps } from './components/utilization-bar'

export { Sparkline } from './components/sparkline'
export type { SparklineProps } from './components/sparkline'

export { ThresholdGauge } from './components/threshold-gauge'
export type { ThresholdGaugeProps } from './components/threshold-gauge'

export { SeverityTimeline } from './components/severity-timeline'
export type { SeverityTimelineProps, TimelineEvent } from './components/severity-timeline'

export { LogViewer } from './components/log-viewer'
export type { LogViewerProps, LogEntry } from './components/log-viewer'

export { PortStatusGrid } from './components/port-status-grid'
export type { PortStatusGridProps, PortStatus } from './components/port-status-grid'

export { TimeRangeSelector } from './components/time-range-selector'
export type { TimeRangeSelectorProps, TimeRange } from './components/time-range-selector'

export { PipelineStage } from './components/pipeline-stage'
export type { PipelineStageProps, StageInfo } from './components/pipeline-stage'

export { UptimeTracker } from './components/uptime-tracker'
export type { UptimeTrackerProps, DayStatus } from './components/uptime-tracker'

// ── Real-Time & AI Components ───────────────────────────────────────────────
export { StreamingText } from './components/streaming-text'
export type { StreamingTextProps } from './components/streaming-text'

export { TypingIndicator } from './components/typing-indicator'
export type { TypingIndicatorProps } from './components/typing-indicator'

export { ConfidenceBar } from './components/confidence-bar'
export type { ConfidenceBarProps } from './components/confidence-bar'

export { LiveFeed } from './components/live-feed'
export type { LiveFeedProps, FeedItem } from './components/live-feed'

export { DiffViewer } from './components/diff-viewer'
export type { DiffViewerProps } from './components/diff-viewer'

export { HeatmapCalendar } from './components/heatmap-calendar'
export type { HeatmapCalendarProps, DayValue } from './components/heatmap-calendar'

export { NotificationStack } from './components/notification-stack'
export type { NotificationStackProps, Notification } from './components/notification-stack'

export { KanbanColumn } from './components/kanban-column'
export type { KanbanColumnProps, KanbanItem, KanbanBadgeColor } from './components/kanban-column'

// ── Smart Components ────────────────────────────────────────────────────────
export { SmartTable } from './components/smart-table'
export type { SmartTableProps, FilterSuggestion } from './components/smart-table'

export { RealtimeValue } from './components/realtime-value'
export type { RealtimeValueProps } from './components/realtime-value'

export { CommandBar } from './components/command-bar'
export type { CommandBarProps, CommandItem } from './components/command-bar'

export { SortableList, DragHandle } from './components/sortable-list'
export type { SortableListProps, SortableItem, DragHandleProps } from './components/sortable-list'

export { InfiniteScroll } from './components/infinite-scroll'
export type { InfiniteScrollProps } from './components/infinite-scroll'

export { ColorInput } from './components/color-input'
export type { ColorInputProps } from './components/color-input'

export { StepWizard } from './components/step-wizard'
export type { StepWizardProps, WizardStep } from './components/step-wizard'

export { CopyBlock } from './components/copy-block'
export type { CopyBlockProps } from './components/copy-block'
