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
const ComboBoxPage = lazy(() => import('./pages/components/ComboBoxPage'))
const CommandBarPage = lazy(() => import('./pages/components/CommandBarPage'))
const ConfidenceBarPage = lazy(() => import('./pages/components/ConfidenceBarPage'))
const CopyBlockPage = lazy(() => import('./pages/components/CopyBlockPage'))
const DashboardGridPage = lazy(() => import('./pages/components/DashboardGridPage'))
const DataTablePage = lazy(() => import('./pages/components/DataTablePage'))
const DatePickerPage = lazy(() => import('./pages/components/DatePickerPage'))
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
const LiveFeedPage = lazy(() => import('./pages/components/LiveFeedPage'))
const LogViewerPage = lazy(() => import('./pages/components/LogViewerPage'))
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
const RadioGroupPage = lazy(() => import('./pages/components/RadioGroupPage'))
const RatingPage = lazy(() => import('./pages/components/RatingPage'))
const RealtimeValuePage = lazy(() => import('./pages/components/RealtimeValuePage'))
const ResponsiveCardPage = lazy(() => import('./pages/components/ResponsiveCardPage'))
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
const StepWizardPage = lazy(() => import('./pages/components/StepWizardPage'))
const StreamingTextPage = lazy(() => import('./pages/components/StreamingTextPage'))
const TabsPage = lazy(() => import('./pages/components/TabsPage'))
const TagInputPage = lazy(() => import('./pages/components/TagInputPage'))
const TextRevealPage = lazy(() => import('./pages/components/TextRevealPage'))
const ThresholdGaugePage = lazy(() => import('./pages/components/ThresholdGaugePage'))
const TimeRangeSelectorPage = lazy(() => import('./pages/components/TimeRangeSelectorPage'))
const ToastPage = lazy(() => import('./pages/components/ToastPage'))
const ToggleSwitchPage = lazy(() => import('./pages/components/ToggleSwitchPage'))
const TooltipPage = lazy(() => import('./pages/components/TooltipPage'))
const TracingBeamPage = lazy(() => import('./pages/components/TracingBeamPage'))
const TreeViewPage = lazy(() => import('./pages/components/TreeViewPage'))
const TruncatedTextPage = lazy(() => import('./pages/components/TruncatedTextPage'))
const TypingIndicatorPage = lazy(() => import('./pages/components/TypingIndicatorPage'))
const UpstreamDashboardPage = lazy(() => import('./pages/components/UpstreamDashboardPage'))
const UptimeTrackerPage = lazy(() => import('./pages/components/UptimeTrackerPage'))
const UtilizationBarPage = lazy(() => import('./pages/components/UtilizationBarPage'))
const ViewTransitionLinkPage = lazy(() => import('./pages/components/ViewTransitionLinkPage'))
const WavyBackgroundPage = lazy(() => import('./pages/components/WavyBackgroundPage'))

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
            <Route path="components/confidence-bar" element={<Suspense><ConfidenceBarPage /></Suspense>} />
            <Route path="components/copy-block" element={<Suspense><CopyBlockPage /></Suspense>} />
            <Route path="components/dashboard-grid" element={<Suspense><DashboardGridPage /></Suspense>} />
            <Route path="components/data-table" element={<Suspense><DataTablePage /></Suspense>} />
            <Route path="components/date-picker" element={<Suspense><DatePickerPage /></Suspense>} />
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
            <Route path="components/live-feed" element={<Suspense><LiveFeedPage /></Suspense>} />
            <Route path="components/log-viewer" element={<Suspense><LogViewerPage /></Suspense>} />
            <Route path="components/meteor-shower" element={<Suspense><MeteorShowerPage /></Suspense>} />
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
            <Route path="components/radio-group" element={<Suspense><RadioGroupPage /></Suspense>} />
            <Route path="components/rating" element={<Suspense><RatingPage /></Suspense>} />
            <Route path="components/realtime-value" element={<Suspense><RealtimeValuePage /></Suspense>} />
            <Route path="components/responsive-card" element={<Suspense><ResponsiveCardPage /></Suspense>} />
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
            <Route path="components/streaming-text" element={<Suspense><StreamingTextPage /></Suspense>} />
            <Route path="components/tabs" element={<Suspense><TabsPage /></Suspense>} />
            <Route path="components/tag-input" element={<Suspense><TagInputPage /></Suspense>} />
            <Route path="components/text-reveal" element={<Suspense><TextRevealPage /></Suspense>} />
            <Route path="components/threshold-gauge" element={<Suspense><ThresholdGaugePage /></Suspense>} />
            <Route path="components/time-range-selector" element={<Suspense><TimeRangeSelectorPage /></Suspense>} />
            <Route path="components/toast" element={<Suspense><ToastPage /></Suspense>} />
            <Route path="components/toggle-switch" element={<Suspense><ToggleSwitchPage /></Suspense>} />
            <Route path="components/tooltip" element={<Suspense><TooltipPage /></Suspense>} />
            <Route path="components/tracing-beam" element={<Suspense><TracingBeamPage /></Suspense>} />
            <Route path="components/tree-view" element={<Suspense><TreeViewPage /></Suspense>} />
            <Route path="components/truncated-text" element={<Suspense><TruncatedTextPage /></Suspense>} />
            <Route path="components/typing-indicator" element={<Suspense><TypingIndicatorPage /></Suspense>} />
            <Route path="components/upstream-dashboard" element={<Suspense><UpstreamDashboardPage /></Suspense>} />
            <Route path="components/uptime-tracker" element={<Suspense><UptimeTrackerPage /></Suspense>} />
            <Route path="components/utilization-bar" element={<Suspense><UtilizationBarPage /></Suspense>} />
            <Route path="components/view-transition-link" element={<Suspense><ViewTransitionLinkPage /></Suspense>} />
            <Route path="components/wavy-background" element={<Suspense><WavyBackgroundPage /></Suspense>} />
          </Route>
        </Routes>
      </ToastProvider>
    </BrowserRouter>
  </StrictMode>
)
