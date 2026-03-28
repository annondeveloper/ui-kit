import { StrictMode, lazy, Suspense } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { ToastProvider } from '@ui/domain/toast'
import App from './App'
import './index.css'

// ─── Utility Pages ──────────────────────────────────────────────────────────
const Home = lazy(() => import('./pages/Home'))
const DocsPage = lazy(() => import('./pages/DocsPage'))
const IconsPage = lazy(() => import('./pages/IconsPage'))
const ThemePage = lazy(() => import('./pages/ThemePage'))
const PerformancePage = lazy(() => import('./pages/PerformancePage'))
const GeneratorPage = lazy(() => import('./pages/GeneratorPage'))
const ChoreographyPage = lazy(() => import('./pages/ChoreographyPage'))
const McpPage = lazy(() => import('./pages/McpPage'))
const FigmaPage = lazy(() => import('./pages/FigmaPage'))

// ─── Component Pages (A-Z) ──────────────────────────────────────────────────
const AccordionPage = lazy(() => import('./pages/components/AccordionPage'))
const AlertPage = lazy(() => import('./pages/components/AlertPage'))
const AnimatedCounterPage = lazy(() => import('./pages/components/AnimatedCounterPage'))
const AppShellPage = lazy(() => import('./pages/components/AppShellPage'))
const AvatarPage = lazy(() => import('./pages/components/AvatarPage'))
const BackgroundBeamsPage = lazy(() => import('./pages/components/BackgroundBeamsPage'))
const BackgroundBoxesPage = lazy(() => import('./pages/components/BackgroundBoxesPage'))
const BadgePage = lazy(() => import('./pages/components/BadgePage'))
const BorderBeamPage = lazy(() => import('./pages/components/BorderBeamPage'))
const BreadcrumbsPage = lazy(() => import('./pages/components/BreadcrumbsPage'))
const ButtonPage = lazy(() => import('./pages/components/ButtonPage'))
const Card3dPage = lazy(() => import('./pages/components/Card3dPage'))
const CardPage = lazy(() => import('./pages/components/CardPage'))
const CheckboxPage = lazy(() => import('./pages/components/CheckboxPage'))
const ColorInputPage = lazy(() => import('./pages/components/ColorInputPage'))
const ColumnVisibilityTogglePage = lazy(() => import('./pages/components/ColumnVisibilityTogglePage'))
const ComboBoxPage = lazy(() => import('./pages/components/ComboBoxPage'))
const CommandBarPage = lazy(() => import('./pages/components/CommandBarPage'))
const ConfidenceBarPage = lazy(() => import('./pages/components/ConfidenceBarPage'))
const CoreChartPage = lazy(() => import('./pages/components/CoreChartPage'))
const CopyBlockPage = lazy(() => import('./pages/components/CopyBlockPage'))
const CsvExportPage = lazy(() => import('./pages/components/CsvExportPage'))
const DashboardGridPage = lazy(() => import('./pages/components/DashboardGridPage'))
const DataTablePage = lazy(() => import('./pages/components/DataTablePage'))
const DatePickerPage = lazy(() => import('./pages/components/DatePickerPage'))
const DensitySelectorPage = lazy(() => import('./pages/components/DensitySelectorPage'))
const DialogPage = lazy(() => import('./pages/components/DialogPage'))
const DiffViewerPage = lazy(() => import('./pages/components/DiffViewerPage'))
const DividerPage = lazy(() => import('./pages/components/DividerPage'))
const DrawerPage = lazy(() => import('./pages/components/DrawerPage'))
const DropdownMenuPage = lazy(() => import('./pages/components/DropdownMenuPage'))
const EmptyStatePage = lazy(() => import('./pages/components/EmptyStatePage'))
const EncryptedTextPage = lazy(() => import('./pages/components/EncryptedTextPage'))
const EvervaultCardPage = lazy(() => import('./pages/components/EvervaultCardPage'))
const FileUploadPage = lazy(() => import('./pages/components/FileUploadPage'))
const FilterPillPage = lazy(() => import('./pages/components/FilterPillPage'))
const FlipWordsPage = lazy(() => import('./pages/components/FlipWordsPage'))
const FormInputPage = lazy(() => import('./pages/components/FormInputPage'))
const GeoMapPage = lazy(() => import('./pages/components/GeoMapPage'))
const GlowCardPage = lazy(() => import('./pages/components/GlowCardPage'))
const HeatmapCalendarPage = lazy(() => import('./pages/components/HeatmapCalendarPage'))
const HeroHighlightPage = lazy(() => import('./pages/components/HeroHighlightPage'))
const InfiniteScrollPage = lazy(() => import('./pages/components/InfiniteScrollPage'))
const InlineEditPage = lazy(() => import('./pages/components/InlineEditPage'))
const KanbanColumnPage = lazy(() => import('./pages/components/KanbanColumnPage'))
const KbdPage = lazy(() => import('./pages/components/KbdPage'))
const LinkPage = lazy(() => import('./pages/components/LinkPage'))
const LiveFeedPage = lazy(() => import('./pages/components/LiveFeedPage'))
const LogViewerPage = lazy(() => import('./pages/components/LogViewerPage'))
const MetricCardPage = lazy(() => import('./pages/components/MetricCardPage'))
const MeteorShowerPage = lazy(() => import('./pages/components/MeteorShowerPage'))
const NavbarPage = lazy(() => import('./pages/components/NavbarPage'))
const NetworkTrafficCardPage = lazy(() => import('./pages/components/NetworkTrafficCardPage'))
const NotificationStackPage = lazy(() => import('./pages/components/NotificationStackPage'))
const NumberTickerPage = lazy(() => import('./pages/components/NumberTickerPage'))
const OrbitingCirclesPage = lazy(() => import('./pages/components/OrbitingCirclesPage'))
const OtpInputPage = lazy(() => import('./pages/components/OtpInputPage'))
const PaginationPage = lazy(() => import('./pages/components/PaginationPage'))
const PipelineStagePage = lazy(() => import('./pages/components/PipelineStagePage'))
const PopoverPage = lazy(() => import('./pages/components/PopoverPage'))
const PortStatusGridPage = lazy(() => import('./pages/components/PortStatusGridPage'))
const ProgressPage = lazy(() => import('./pages/components/ProgressPage'))
const RackDiagramPage = lazy(() => import('./pages/components/RackDiagramPage'))
const RadioGroupPage = lazy(() => import('./pages/components/RadioGroupPage'))
const RatingPage = lazy(() => import('./pages/components/RatingPage'))
const RealtimeValuePage = lazy(() => import('./pages/components/RealtimeValuePage'))
const ResponsiveCardPage = lazy(() => import('./pages/components/ResponsiveCardPage'))
const RingChartPage = lazy(() => import('./pages/components/RingChartPage'))
const RipplePage = lazy(() => import('./pages/components/RipplePage'))
const SearchInputPage = lazy(() => import('./pages/components/SearchInputPage'))
const SelectPage = lazy(() => import('./pages/components/SelectPage'))
const SeverityTimelinePage = lazy(() => import('./pages/components/SeverityTimelinePage'))
const SheetPage = lazy(() => import('./pages/components/SheetPage'))
const ShimmerButtonPage = lazy(() => import('./pages/components/ShimmerButtonPage'))
const SidebarPage = lazy(() => import('./pages/components/SidebarPage'))
const SkeletonPage = lazy(() => import('./pages/components/SkeletonPage'))
const SliderPage = lazy(() => import('./pages/components/SliderPage'))
const SmartTablePage = lazy(() => import('./pages/components/SmartTablePage'))
const SortableListPage = lazy(() => import('./pages/components/SortableListPage'))
const SparklinePage = lazy(() => import('./pages/components/SparklinePage'))
const SpotlightCardPage = lazy(() => import('./pages/components/SpotlightCardPage'))
const StatusBadgePage = lazy(() => import('./pages/components/StatusBadgePage'))
const StatusPulsePage = lazy(() => import('./pages/components/StatusPulsePage'))
const StorageBarPage = lazy(() => import('./pages/components/StorageBarPage'))
const SwitchFaceplatePage = lazy(() => import('./pages/components/SwitchFaceplatePage'))
const StepWizardPage = lazy(() => import('./pages/components/StepWizardPage'))
const StreamingTextPage = lazy(() => import('./pages/components/StreamingTextPage'))
const TabsPage = lazy(() => import('./pages/components/TabsPage'))
const TagInputPage = lazy(() => import('./pages/components/TagInputPage'))
const TextRevealPage = lazy(() => import('./pages/components/TextRevealPage'))
const ThresholdGaugePage = lazy(() => import('./pages/components/ThresholdGaugePage'))
const TimeRangeSelectorPage = lazy(() => import('./pages/components/TimeRangeSelectorPage'))
const TimeSeriesChartPage = lazy(() => import('./pages/components/TimeSeriesChartPage'))
const ToastPage = lazy(() => import('./pages/components/ToastPage'))
const ToggleSwitchPage = lazy(() => import('./pages/components/ToggleSwitchPage'))
const TooltipPage = lazy(() => import('./pages/components/TooltipPage'))
const TracingBeamPage = lazy(() => import('./pages/components/TracingBeamPage'))
const TreeViewPage = lazy(() => import('./pages/components/TreeViewPage'))
const TruncatedTextPage = lazy(() => import('./pages/components/TruncatedTextPage'))
const TypingIndicatorPage = lazy(() => import('./pages/components/TypingIndicatorPage'))
const TypographyPage = lazy(() => import('./pages/components/TypographyPage'))
const UpstreamDashboardPage = lazy(() => import('./pages/components/UpstreamDashboardPage'))
const UptimeTrackerPage = lazy(() => import('./pages/components/UptimeTrackerPage'))
const UtilizationBarPage = lazy(() => import('./pages/components/UtilizationBarPage'))
const ViewTransitionLinkPage = lazy(() => import('./pages/components/ViewTransitionLinkPage'))
const WavyBackgroundPage = lazy(() => import('./pages/components/WavyBackgroundPage'))

// ─── New Component Pages ─────────────────────────────────────────────────────
const ActionIconPage = lazy(() => import('./pages/components/ActionIconPage'))
const AffixPage = lazy(() => import('./pages/components/AffixPage'))
const AvatarUploadPage = lazy(() => import('./pages/components/AvatarUploadPage'))
const BackToTopPage = lazy(() => import('./pages/components/BackToTopPage'))
const ButtonGroupPage = lazy(() => import('./pages/components/ButtonGroupPage'))
const CalendarPage = lazy(() => import('./pages/components/CalendarPage'))
const CarouselPage = lazy(() => import('./pages/components/CarouselPage'))
const ChipPage = lazy(() => import('./pages/components/ChipPage'))
const CodeEditorPage = lazy(() => import('./pages/components/CodeEditorPage'))
const ConfirmDialogPage = lazy(() => import('./pages/components/ConfirmDialogPage'))
const CopyButtonPage = lazy(() => import('./pages/components/CopyButtonPage'))
const CropperPage = lazy(() => import('./pages/components/CropperPage'))
const DateRangePickerPage = lazy(() => import('./pages/components/DateRangePickerPage'))
const HighlightPage = lazy(() => import('./pages/components/HighlightPage'))
const IndicatorPage = lazy(() => import('./pages/components/IndicatorPage'))
const JsonViewerPage = lazy(() => import('./pages/components/JsonViewerPage'))
const MultiSelectPage = lazy(() => import('./pages/components/MultiSelectPage'))
const NativeTooltipPage = lazy(() => import('./pages/components/NativeTooltipPage'))
const NumberInputPage = lazy(() => import('./pages/components/NumberInputPage'))
const PasswordInputPage = lazy(() => import('./pages/components/PasswordInputPage'))
const PinInputPage = lazy(() => import('./pages/components/PinInputPage'))
const RichTextEditorPage = lazy(() => import('./pages/components/RichTextEditorPage'))
const ScrollRevealPage = lazy(() => import('./pages/components/ScrollRevealPage'))
const SegmentedControlPage = lazy(() => import('./pages/components/SegmentedControlPage'))
const SpotlightPage = lazy(() => import('./pages/components/SpotlightPage'))
const SpoilerPage = lazy(() => import('./pages/components/SpoilerPage'))
const StepperPage = lazy(() => import('./pages/components/StepperPage'))
const TableOfContentsPage = lazy(() => import('./pages/components/TableOfContentsPage'))
const TextareaPage = lazy(() => import('./pages/components/TextareaPage'))
const TimePickerPage = lazy(() => import('./pages/components/TimePickerPage'))
const TimelinePage = lazy(() => import('./pages/components/TimelinePage'))
const TourPage = lazy(() => import('./pages/components/TourPage'))
const TransferListPage = lazy(() => import('./pages/components/TransferListPage'))

// ─── New Domain Components ─────────────────────────────────────────────────
const PropertyListPage = lazy(() => import('./pages/components/PropertyListPage'))
const EntityCardPage = lazy(() => import('./pages/components/EntityCardPage'))
const ServiceStripPage = lazy(() => import('./pages/components/ServiceStripPage'))
const DiskMountBarPage = lazy(() => import('./pages/components/DiskMountBarPage'))
const ConnectionTestPanelPage = lazy(() => import('./pages/components/ConnectionTestPanelPage'))

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter basename="/ui-kit">
      <ToastProvider position="bottom-right">
        <Routes>
          <Route element={<App />}>
            {/* Utility pages */}
            <Route index element={<Suspense><Home /></Suspense>} />
            <Route path="icons" element={<Suspense><IconsPage /></Suspense>} />
            <Route path="themes" element={<Suspense><ThemePage /></Suspense>} />
            <Route path="docs" element={<Suspense><DocsPage /></Suspense>} />
            <Route path="performance" element={<Suspense><PerformancePage /></Suspense>} />
            <Route path="generator" element={<Suspense><GeneratorPage /></Suspense>} />
            <Route path="choreography" element={<Suspense><ChoreographyPage /></Suspense>} />
            <Route path="mcp" element={<Suspense><McpPage /></Suspense>} />
            <Route path="figma" element={<Suspense><FigmaPage /></Suspense>} />

            {/* Component pages (A-Z) */}
            <Route path="components/accordion" element={<Suspense><AccordionPage /></Suspense>} />
            <Route path="components/alert" element={<Suspense><AlertPage /></Suspense>} />
            <Route path="components/animated-counter" element={<Suspense><AnimatedCounterPage /></Suspense>} />
            <Route path="components/app-shell" element={<Suspense><AppShellPage /></Suspense>} />
            <Route path="components/avatar" element={<Suspense><AvatarPage /></Suspense>} />
            <Route path="components/background-beams" element={<Suspense><BackgroundBeamsPage /></Suspense>} />
            <Route path="components/background-boxes" element={<Suspense><BackgroundBoxesPage /></Suspense>} />
            <Route path="components/badge" element={<Suspense><BadgePage /></Suspense>} />
            <Route path="components/border-beam" element={<Suspense><BorderBeamPage /></Suspense>} />
            <Route path="components/breadcrumbs" element={<Suspense><BreadcrumbsPage /></Suspense>} />
            <Route path="components/button" element={<Suspense><ButtonPage /></Suspense>} />
            <Route path="components/card" element={<Suspense><CardPage /></Suspense>} />
            <Route path="components/card-3d" element={<Suspense><Card3dPage /></Suspense>} />
            <Route path="components/checkbox" element={<Suspense><CheckboxPage /></Suspense>} />
            <Route path="components/color-input" element={<Suspense><ColorInputPage /></Suspense>} />
            <Route path="components/combobox" element={<Suspense><ComboBoxPage /></Suspense>} />
            <Route path="components/command-bar" element={<Suspense><CommandBarPage /></Suspense>} />
            <Route path="components/column-visibility-toggle" element={<Suspense><ColumnVisibilityTogglePage /></Suspense>} />
            <Route path="components/confidence-bar" element={<Suspense><ConfidenceBarPage /></Suspense>} />
            <Route path="components/copy-block" element={<Suspense><CopyBlockPage /></Suspense>} />
            <Route path="components/core-chart" element={<Suspense><CoreChartPage /></Suspense>} />
            <Route path="components/csv-export" element={<Suspense><CsvExportPage /></Suspense>} />
            <Route path="components/dashboard-grid" element={<Suspense><DashboardGridPage /></Suspense>} />
            <Route path="components/data-table" element={<Suspense><DataTablePage /></Suspense>} />
            <Route path="components/date-picker" element={<Suspense><DatePickerPage /></Suspense>} />
            <Route path="components/density-selector" element={<Suspense><DensitySelectorPage /></Suspense>} />
            <Route path="components/dialog" element={<Suspense><DialogPage /></Suspense>} />
            <Route path="components/diff-viewer" element={<Suspense><DiffViewerPage /></Suspense>} />
            <Route path="components/divider" element={<Suspense><DividerPage /></Suspense>} />
            <Route path="components/drawer" element={<Suspense><DrawerPage /></Suspense>} />
            <Route path="components/dropdown-menu" element={<Suspense><DropdownMenuPage /></Suspense>} />
            <Route path="components/empty-state" element={<Suspense><EmptyStatePage /></Suspense>} />
            <Route path="components/encrypted-text" element={<Suspense><EncryptedTextPage /></Suspense>} />
            <Route path="components/evervault-card" element={<Suspense><EvervaultCardPage /></Suspense>} />
            <Route path="components/file-upload" element={<Suspense><FileUploadPage /></Suspense>} />
            <Route path="components/filter-pill" element={<Suspense><FilterPillPage /></Suspense>} />
            <Route path="components/flip-words" element={<Suspense><FlipWordsPage /></Suspense>} />
            <Route path="components/form-input" element={<Suspense><FormInputPage /></Suspense>} />
            <Route path="components/geo-map" element={<Suspense><GeoMapPage /></Suspense>} />
            <Route path="components/glow-card" element={<Suspense><GlowCardPage /></Suspense>} />
            <Route path="components/heatmap-calendar" element={<Suspense><HeatmapCalendarPage /></Suspense>} />
            <Route path="components/hero-highlight" element={<Suspense><HeroHighlightPage /></Suspense>} />
            <Route path="components/infinite-scroll" element={<Suspense><InfiniteScrollPage /></Suspense>} />
            <Route path="components/inline-edit" element={<Suspense><InlineEditPage /></Suspense>} />
            <Route path="components/kanban-column" element={<Suspense><KanbanColumnPage /></Suspense>} />
            <Route path="components/kbd" element={<Suspense><KbdPage /></Suspense>} />
            <Route path="components/link" element={<Suspense><LinkPage /></Suspense>} />
            <Route path="components/live-feed" element={<Suspense><LiveFeedPage /></Suspense>} />
            <Route path="components/log-viewer" element={<Suspense><LogViewerPage /></Suspense>} />
            <Route path="components/meteor-shower" element={<Suspense><MeteorShowerPage /></Suspense>} />
            <Route path="components/metric-card" element={<Suspense><MetricCardPage /></Suspense>} />
            <Route path="components/navbar" element={<Suspense><NavbarPage /></Suspense>} />
            <Route path="components/network-traffic-card" element={<Suspense><NetworkTrafficCardPage /></Suspense>} />
            <Route path="components/notification-stack" element={<Suspense><NotificationStackPage /></Suspense>} />
            <Route path="components/number-ticker" element={<Suspense><NumberTickerPage /></Suspense>} />
            <Route path="components/orbiting-circles" element={<Suspense><OrbitingCirclesPage /></Suspense>} />
            <Route path="components/otp-input" element={<Suspense><OtpInputPage /></Suspense>} />
            <Route path="components/pagination" element={<Suspense><PaginationPage /></Suspense>} />
            <Route path="components/pipeline-stage" element={<Suspense><PipelineStagePage /></Suspense>} />
            <Route path="components/popover" element={<Suspense><PopoverPage /></Suspense>} />
            <Route path="components/port-status-grid" element={<Suspense><PortStatusGridPage /></Suspense>} />
            <Route path="components/progress" element={<Suspense><ProgressPage /></Suspense>} />
            <Route path="components/rack-diagram" element={<Suspense><RackDiagramPage /></Suspense>} />
            <Route path="components/radio-group" element={<Suspense><RadioGroupPage /></Suspense>} />
            <Route path="components/rating" element={<Suspense><RatingPage /></Suspense>} />
            <Route path="components/realtime-value" element={<Suspense><RealtimeValuePage /></Suspense>} />
            <Route path="components/responsive-card" element={<Suspense><ResponsiveCardPage /></Suspense>} />
            <Route path="components/ring-chart" element={<Suspense><RingChartPage /></Suspense>} />
            <Route path="components/ripple" element={<Suspense><RipplePage /></Suspense>} />
            <Route path="components/search-input" element={<Suspense><SearchInputPage /></Suspense>} />
            <Route path="components/select" element={<Suspense><SelectPage /></Suspense>} />
            <Route path="components/severity-timeline" element={<Suspense><SeverityTimelinePage /></Suspense>} />
            <Route path="components/sheet" element={<Suspense><SheetPage /></Suspense>} />
            <Route path="components/shimmer-button" element={<Suspense><ShimmerButtonPage /></Suspense>} />
            <Route path="components/sidebar" element={<Suspense><SidebarPage /></Suspense>} />
            <Route path="components/skeleton" element={<Suspense><SkeletonPage /></Suspense>} />
            <Route path="components/slider" element={<Suspense><SliderPage /></Suspense>} />
            <Route path="components/smart-table" element={<Suspense><SmartTablePage /></Suspense>} />
            <Route path="components/sortable-list" element={<Suspense><SortableListPage /></Suspense>} />
            <Route path="components/sparkline" element={<Suspense><SparklinePage /></Suspense>} />
            <Route path="components/spotlight-card" element={<Suspense><SpotlightCardPage /></Suspense>} />
            <Route path="components/status-badge" element={<Suspense><StatusBadgePage /></Suspense>} />
            <Route path="components/status-pulse" element={<Suspense><StatusPulsePage /></Suspense>} />
            <Route path="components/step-wizard" element={<Suspense><StepWizardPage /></Suspense>} />
            <Route path="components/storage-bar" element={<Suspense><StorageBarPage /></Suspense>} />
            <Route path="components/streaming-text" element={<Suspense><StreamingTextPage /></Suspense>} />
            <Route path="components/switch-faceplate" element={<Suspense><SwitchFaceplatePage /></Suspense>} />
            <Route path="components/tabs" element={<Suspense><TabsPage /></Suspense>} />
            <Route path="components/tag-input" element={<Suspense><TagInputPage /></Suspense>} />
            <Route path="components/text-reveal" element={<Suspense><TextRevealPage /></Suspense>} />
            <Route path="components/threshold-gauge" element={<Suspense><ThresholdGaugePage /></Suspense>} />
            <Route path="components/time-range-selector" element={<Suspense><TimeRangeSelectorPage /></Suspense>} />
            <Route path="components/time-series-chart" element={<Suspense><TimeSeriesChartPage /></Suspense>} />
            <Route path="components/toast" element={<Suspense><ToastPage /></Suspense>} />
            <Route path="components/toggle-switch" element={<Suspense><ToggleSwitchPage /></Suspense>} />
            <Route path="components/tooltip" element={<Suspense><TooltipPage /></Suspense>} />
            <Route path="components/tracing-beam" element={<Suspense><TracingBeamPage /></Suspense>} />
            <Route path="components/tree-view" element={<Suspense><TreeViewPage /></Suspense>} />
            <Route path="components/truncated-text" element={<Suspense><TruncatedTextPage /></Suspense>} />
            <Route path="components/typing-indicator" element={<Suspense><TypingIndicatorPage /></Suspense>} />
            <Route path="components/typography" element={<Suspense><TypographyPage /></Suspense>} />
            <Route path="components/upstream-dashboard" element={<Suspense><UpstreamDashboardPage /></Suspense>} />
            <Route path="components/uptime-tracker" element={<Suspense><UptimeTrackerPage /></Suspense>} />
            <Route path="components/utilization-bar" element={<Suspense><UtilizationBarPage /></Suspense>} />
            <Route path="components/view-transition-link" element={<Suspense><ViewTransitionLinkPage /></Suspense>} />
            <Route path="components/wavy-background" element={<Suspense><WavyBackgroundPage /></Suspense>} />

            {/* New component pages */}
            <Route path="components/action-icon" element={<Suspense><ActionIconPage /></Suspense>} />
            <Route path="components/affix" element={<Suspense><AffixPage /></Suspense>} />
            <Route path="components/avatar-upload" element={<Suspense><AvatarUploadPage /></Suspense>} />
            <Route path="components/back-to-top" element={<Suspense><BackToTopPage /></Suspense>} />
            <Route path="components/button-group" element={<Suspense><ButtonGroupPage /></Suspense>} />
            <Route path="components/calendar" element={<Suspense><CalendarPage /></Suspense>} />
            <Route path="components/carousel" element={<Suspense><CarouselPage /></Suspense>} />
            <Route path="components/chip" element={<Suspense><ChipPage /></Suspense>} />
            <Route path="components/code-editor" element={<Suspense><CodeEditorPage /></Suspense>} />
            <Route path="components/confirm-dialog" element={<Suspense><ConfirmDialogPage /></Suspense>} />
            <Route path="components/copy-button" element={<Suspense><CopyButtonPage /></Suspense>} />
            <Route path="components/cropper" element={<Suspense><CropperPage /></Suspense>} />
            <Route path="components/date-range-picker" element={<Suspense><DateRangePickerPage /></Suspense>} />
            <Route path="components/highlight" element={<Suspense><HighlightPage /></Suspense>} />
            <Route path="components/indicator" element={<Suspense><IndicatorPage /></Suspense>} />
            <Route path="components/json-viewer" element={<Suspense><JsonViewerPage /></Suspense>} />
            <Route path="components/multi-select" element={<Suspense><MultiSelectPage /></Suspense>} />
            <Route path="components/native-tooltip" element={<Suspense><NativeTooltipPage /></Suspense>} />
            <Route path="components/number-input" element={<Suspense><NumberInputPage /></Suspense>} />
            <Route path="components/password-input" element={<Suspense><PasswordInputPage /></Suspense>} />
            <Route path="components/pin-input" element={<Suspense><PinInputPage /></Suspense>} />
            <Route path="components/rich-text-editor" element={<Suspense><RichTextEditorPage /></Suspense>} />
            <Route path="components/scroll-reveal" element={<Suspense><ScrollRevealPage /></Suspense>} />
            <Route path="components/segmented-control" element={<Suspense><SegmentedControlPage /></Suspense>} />
            <Route path="components/spoiler" element={<Suspense><SpoilerPage /></Suspense>} />
            <Route path="components/spotlight" element={<Suspense><SpotlightPage /></Suspense>} />
            <Route path="components/stepper" element={<Suspense><StepperPage /></Suspense>} />
            <Route path="components/table-of-contents" element={<Suspense><TableOfContentsPage /></Suspense>} />
            <Route path="components/textarea" element={<Suspense><TextareaPage /></Suspense>} />
            <Route path="components/time-picker" element={<Suspense><TimePickerPage /></Suspense>} />
            <Route path="components/timeline" element={<Suspense><TimelinePage /></Suspense>} />
            <Route path="components/tour" element={<Suspense><TourPage /></Suspense>} />
            <Route path="components/transfer-list" element={<Suspense><TransferListPage /></Suspense>} />

            {/* New domain components */}
            <Route path="components/property-list" element={<Suspense><PropertyListPage /></Suspense>} />
            <Route path="components/entity-card" element={<Suspense><EntityCardPage /></Suspense>} />
            <Route path="components/service-strip" element={<Suspense><ServiceStripPage /></Suspense>} />
            <Route path="components/disk-mount-bar" element={<Suspense><DiskMountBarPage /></Suspense>} />
            <Route path="components/connection-test-panel" element={<Suspense><ConnectionTestPanelPage /></Suspense>} />
          </Route>
        </Routes>
      </ToastProvider>
    </BrowserRouter>
  </StrictMode>
)
