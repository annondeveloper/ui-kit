'use client'
import { useState, useCallback, useMemo, useEffect, useRef, Suspense, createContext, useContext } from 'react'
import { NavLink, Outlet, useLocation } from 'react-router-dom'
import { UIProvider } from '@ui/components/ui-provider'
import { Drawer } from '@ui/components/drawer'
import { SearchInput } from '@ui/components/search-input'
import { Badge } from '@ui/components/badge'
import { Divider } from '@ui/components/divider'
import { ToggleSwitch } from '@ui/components/toggle-switch'
import { Tooltip } from '@ui/components/tooltip'
import { BorderBeam } from '@ui/domain/border-beam'
import { Icon, type IconName } from '@ui/core/icons/icon'
import { Skeleton } from '@ui/components/skeleton'
import { css } from '@ui/core/styles/css-tag'
import { useStyles } from '@ui/core/styles/use-styles'

// ─── Global Tier Context ──────────────────────────────────────────────────────
export type Tier = 'lite' | 'standard' | 'premium'
const TierContext = createContext<{ tier: Tier; setTier: (t: Tier) => void }>({ tier: 'standard', setTier: () => {} })
export function useTier() { return useContext(TierContext) }

const pages: { path: string; label: string; icon: IconName }[] = [
  { path: '/', label: 'Home', icon: 'zap' },
  { path: '/icons', label: 'Icons', icon: 'image' },
  { path: '/themes', label: 'Theme Playground', icon: 'settings' as const },
  { path: '/docs', label: 'Documentation', icon: 'file' },
]

// ─── Component Sidebar Groups ─────────────────────────────────────────────────
interface ComponentEntry {
  name: string
  path: string | null // null = no page yet (dimmed)
  premium?: boolean   // has premium tier features
}

interface ComponentGroup {
  label: string
  icon: IconName
  items: ComponentEntry[]
}

const componentGroups: ComponentGroup[] = [
  {
    label: 'Primitives',
    icon: 'code',
    items: [
      { name: 'Button', path: '/components/button' },
      { name: 'Badge', path: '/components/badge' },
      { name: 'Avatar', path: '/components/avatar' },
      { name: 'Card', path: '/components/card' },
      { name: 'Divider', path: '/components/divider' },
      { name: 'Skeleton', path: '/components/skeleton' },
      { name: 'StatusBadge', path: '/components/status-badge' },
      { name: 'StatusPulse', path: '/components/status-pulse' },
      { name: 'FilterPill', path: '/components/filter-pill' },
      { name: 'EmptyState', path: '/components/empty-state' },
      { name: 'TruncatedText', path: '/components/truncated-text' },
      { name: 'Typography', path: '/components/typography' },
      { name: 'Kbd', path: '/components/kbd' },
      { name: 'Link', path: '/components/link' },
    ],
  },
  {
    label: 'Forms',
    icon: 'edit',
    items: [
      { name: 'FormInput', path: '/components/form-input' },
      { name: 'Select', path: '/components/select' },
      { name: 'Checkbox', path: '/components/checkbox' },
      { name: 'ToggleSwitch', path: '/components/toggle-switch' },
      { name: 'Slider', path: '/components/slider' },
      { name: 'RadioGroup', path: '/components/radio-group' },
      { name: 'ComboBox', path: '/components/combobox' },
      { name: 'DatePicker', path: '/components/date-picker', premium: true },
      { name: 'TagInput', path: '/components/tag-input' },
      { name: 'OtpInput', path: '/components/otp-input' },
      { name: 'FileUpload', path: '/components/file-upload' },
      { name: 'ColorInput', path: '/components/color-input' },
      { name: 'SearchInput', path: '/components/search-input' },
      { name: 'Rating', path: '/components/rating' },
      { name: 'InlineEdit', path: '/components/inline-edit' },
    ],
  },
  {
    label: 'Overlays',
    icon: 'menu',
    items: [
      { name: 'Dialog', path: '/components/dialog' },
      { name: 'Drawer', path: '/components/drawer', premium: true },
      { name: 'Tooltip', path: '/components/tooltip' },
      { name: 'Alert', path: '/components/alert', premium: true },
      { name: 'Toast', path: '/components/toast' },
      { name: 'Sheet', path: '/components/sheet' },
      { name: 'Popover', path: '/components/popover' },
      { name: 'DropdownMenu', path: '/components/dropdown-menu' },
      { name: 'NotificationStack', path: '/components/notification-stack' },
      { name: 'CommandBar', path: '/components/command-bar' },
    ],
  },
  {
    label: 'Navigation',
    icon: 'arrow-right',
    items: [
      { name: 'Tabs', path: '/components/tabs' },
      { name: 'Accordion', path: '/components/accordion' },
      { name: 'Breadcrumbs', path: '/components/breadcrumbs' },
      { name: 'Pagination', path: '/components/pagination' },
      { name: 'Navbar', path: '/components/navbar' },
      { name: 'Sidebar', path: '/components/sidebar' },
      { name: 'AppShell', path: '/components/app-shell' },
      { name: 'StepWizard', path: '/components/step-wizard' },
    ],
  },
  {
    label: 'Data Display',
    icon: 'bar-chart',
    items: [
      { name: 'DataTable', path: '/components/data-table' },
      { name: 'SmartTable', path: '/components/smart-table', premium: true },
      { name: 'MetricCard', path: '/components/metric-card', premium: true },
      { name: 'UpstreamDashboard', path: '/components/upstream-dashboard' },
      { name: 'Progress', path: '/components/progress' },
      { name: 'Sparkline', path: '/components/sparkline' },
      { name: 'AnimatedCounter', path: '/components/animated-counter' },
      { name: 'NumberTicker', path: '/components/number-ticker' },
      { name: 'ConfidenceBar', path: '/components/confidence-bar' },
      { name: 'ThresholdGauge', path: '/components/threshold-gauge' },
      { name: 'UtilizationBar', path: '/components/utilization-bar' },
      { name: 'HeatmapCalendar', path: '/components/heatmap-calendar' },
      { name: 'CopyBlock', path: '/components/copy-block' },
      { name: 'DiffViewer', path: '/components/diff-viewer' },
      { name: 'TreeView', path: '/components/tree-view' },
      { name: 'TimeSeriesChart', path: '/components/time-series-chart' },
      { name: 'RingChart', path: '/components/ring-chart' },
      { name: 'CoreChart', path: '/components/core-chart' },
      { name: 'StorageBar', path: '/components/storage-bar' },
    ],
  },
  {
    label: 'Monitoring',
    icon: 'activity',
    items: [
      { name: 'LogViewer', path: '/components/log-viewer', premium: true },
      { name: 'LiveFeed', path: '/components/live-feed' },
      { name: 'PipelineStage', path: '/components/pipeline-stage' },
      { name: 'UptimeTracker', path: '/components/uptime-tracker' },
      { name: 'PortStatusGrid', path: '/components/port-status-grid' },
      { name: 'NetworkTrafficCard', path: '/components/network-traffic-card' },
      { name: 'SeverityTimeline', path: '/components/severity-timeline' },
      { name: 'RealtimeValue', path: '/components/realtime-value' },
      { name: 'GeoMap', path: '/components/geo-map' },
      { name: 'DashboardGrid', path: '/components/dashboard-grid' },
      { name: 'RackDiagram', path: '/components/rack-diagram' },
      { name: 'SwitchFaceplate', path: '/components/switch-faceplate' },
      { name: 'DensitySelector', path: '/components/density-selector' },
      { name: 'ColumnVisibilityToggle', path: '/components/column-visibility-toggle' },
      { name: 'CSVExport', path: '/components/csv-export' },
      { name: 'PropertyList', path: '/components/property-list' },
      { name: 'EntityCard', path: '/components/entity-card' },
      { name: 'ServiceStrip', path: '/components/service-strip' },
      { name: 'DiskMountBar', path: '/components/disk-mount-bar' },
      { name: 'ConnectionTestPanel', path: '/components/connection-test-panel' },
    ],
  },
  {
    label: 'AI & Realtime',
    icon: 'terminal',
    items: [
      { name: 'StreamingText', path: '/components/streaming-text' },
      { name: 'TypingIndicator', path: '/components/typing-indicator' },
      { name: 'EncryptedText', path: '/components/encrypted-text' },
      { name: 'FlipWords', path: '/components/flip-words' },
      { name: 'TextReveal', path: '/components/text-reveal' },
      { name: 'InfiniteScroll', path: '/components/infinite-scroll' },
      { name: 'SortableList', path: '/components/sortable-list' },
      { name: 'KanbanColumn', path: '/components/kanban-column' },
    ],
  },
  {
    label: 'Visual Effects',
    icon: 'zap',
    items: [
      { name: 'BackgroundBeams', path: '/components/background-beams' },
      { name: 'BackgroundBoxes', path: '/components/background-boxes' },
      { name: 'BorderBeam', path: '/components/border-beam' },
      { name: 'GlowCard', path: '/components/glow-card' },
      { name: 'SpotlightCard', path: '/components/spotlight-card' },
      { name: 'Card3D', path: '/components/card-3d' },
      { name: 'EvervaultCard', path: '/components/evervault-card' },
      { name: 'HeroHighlight', path: '/components/hero-highlight' },
      { name: 'MeteorShower', path: '/components/meteor-shower' },
      { name: 'WavyBackground', path: '/components/wavy-background' },
      { name: 'OrbitingCircles', path: '/components/orbiting-circles' },
      { name: 'Ripple', path: '/components/ripple' },
      { name: 'ShimmerButton', path: '/components/shimmer-button' },
      { name: 'TracingBeam', path: '/components/tracing-beam' },
      { name: 'ResponsiveCard', path: '/components/responsive-card' },
      { name: 'TimeRangeSelector', path: '/components/time-range-selector' },
      { name: 'ViewTransitionLink', path: '/components/view-transition-link' },
    ],
  },
]

// Total component count
const totalComponents = componentGroups.reduce((sum, g) => sum + g.items.length, 0)

// ─── Styles ───────────────────────────────────────────────────────────────────
const layoutStyles = css`
  @layer demo {
    /* ─── Root layout ─── */
    .site {
      display: flex;
      min-height: 100dvh;
    }

    /* ─── Desktop sidebar ─── */
    .site-sidebar {
      width: clamp(240px, 18vw, 280px);
      flex-shrink: 0;
      position: sticky;
      top: 0;
      height: 100dvh;
      display: flex;
      flex-direction: column;
      transition: background 0.4s ease, border-color 0.4s ease,
                  backdrop-filter 0.4s ease;
    }

    /* ════════════════════════════════════════════════════════════
       LITE TIER — clean, minimal, no effects
       ════════════════════════════════════════════════════════════ */
    .site-sidebar[data-tier="lite"] {
      background: var(--bg-base, oklch(14% 0 0));
      border-inline-end: 1px solid oklch(100% 0 0 / 0.06);
    }

    .site-sidebar[data-tier="lite"] .site-brand__logo {
      background: oklch(40% 0 0);
      box-shadow: none;
    }
    .site-sidebar[data-tier="lite"] .site-brand__logo::after {
      display: none;
    }
    .site-sidebar[data-tier="lite"] .site-brand__name {
      color: var(--text-secondary, oklch(70% 0 0));
    }
    .site-sidebar[data-tier="lite"] .site-brand__tagline {
      display: none;
    }
    .site-sidebar[data-tier="lite"] .site-brand__version {
      display: none;
    }

    /* Lite: no search hint badge */
    .site-sidebar[data-tier="lite"] .site-search__hint {
      display: none;
    }

    /* Lite: flat nav links, no transitions */
    .site-sidebar[data-tier="lite"] .site-nav-link {
      transition: none;
      border-radius: 0;
      padding-block: 0.375rem;
    }
    .site-sidebar[data-tier="lite"] .site-nav-link:hover {
      background: oklch(100% 0 0 / 0.03);
    }
    .site-sidebar[data-tier="lite"] .site-nav-link--active {
      background: oklch(100% 0 0 / 0.05);
      color: var(--text-primary);
      font-weight: 600;
    }

    /* Lite: no badges on groups */
    .site-sidebar[data-tier="lite"] .site-group__count .ui-badge {
      display: none;
    }

    /* Lite: instant collapse, no spring */
    .site-sidebar[data-tier="lite"] .site-group__body {
      transition: grid-template-rows 0.01s;
    }
    .site-sidebar[data-tier="lite"] .site-group__chevron {
      transition: transform 0.01s;
    }

    /* Lite: simple component links */
    .site-sidebar[data-tier="lite"] .site-clink {
      transition: none;
      border-inline-start: none;
    }
    .site-sidebar[data-tier="lite"] .site-clink--active {
      color: var(--text-primary);
      background: oklch(100% 0 0 / 0.05);
      border-inline-start: none;
      font-weight: 600;
    }

    /* Lite: no premium dots */
    .site-sidebar[data-tier="lite"] .site-clink__premium {
      display: none;
    }

    /* Lite: minimal footer */
    .site-sidebar[data-tier="lite"] .site-sidebar-footer {
      border-block-start: 1px solid oklch(100% 0 0 / 0.06);
    }

    /* Lite: no glow on tier pill */
    .site-sidebar[data-tier="lite"] .site-tier-pill--active {
      background: oklch(50% 0 0);
      border-color: oklch(50% 0 0);
      box-shadow: none;
    }

    /* Lite: hide search — too fancy for lite */
    /* Actually keep search, just make it simpler */
    .site-sidebar[data-tier="lite"] .ui-search-input .ui-search-input__field:focus {
      box-shadow: none;
      border-color: oklch(100% 0 0 / 0.2);
    }

    /* ════════════════════════════════════════════════════════════
       STANDARD TIER — polished, brand-tinted
       ════════════════════════════════════════════════════════════ */
    .site-sidebar[data-tier="standard"] {
      background: var(--bg-surface, oklch(16% 0.01 270));
      border-inline-end: 1px solid var(--border-subtle, oklch(100% 0 0 / 0.08));
    }

    /* ════════════════════════════════════════════════════════════
       PREMIUM TIER — glassmorphism, aurora glows, shimmer
       ════════════════════════════════════════════════════════════ */
    .site-sidebar[data-tier="premium"] {
      background: var(--bg-surface);
      border-inline-end: 1px solid oklch(100% 0 0 / 0.1);
      backdrop-filter: blur(16px) saturate(1.4);
      -webkit-backdrop-filter: blur(16px) saturate(1.4);
    }

    /* Premium: aurora ambient glow behind brand */
    .site-sidebar[data-tier="premium"] .site-brand {
      position: relative;
      overflow: hidden;
    }
    .site-sidebar[data-tier="premium"] .site-brand::before {
      content: '';
      position: absolute;
      inset: -20px;
      background: radial-gradient(
        ellipse 120px 80px at 30% 50%,
        oklch(65% 0.2 270 / 0.15),
        transparent
      ),
      radial-gradient(
        ellipse 100px 60px at 70% 40%,
        oklch(70% 0.18 310 / 0.1),
        transparent
      );
      animation: site-aurora-pulse 6s ease-in-out infinite alternate;
      pointer-events: none;
      z-index: 0;
    }
    .site-sidebar[data-tier="premium"] .site-brand > * {
      position: relative;
      z-index: 1;
    }

    @keyframes site-aurora-pulse {
      0% { opacity: 0.6; transform: scale(1); }
      50% { opacity: 1; transform: scale(1.05); }
      100% { opacity: 0.7; transform: scale(0.98); }
    }

    /* Premium: brand logo animated glow */
    .site-sidebar[data-tier="premium"] .site-brand__logo {
      box-shadow: 0 0 16px oklch(from var(--brand, oklch(65% 0.2 270)) l c h / 0.35),
                  0 0 32px oklch(from var(--brand, oklch(65% 0.2 270)) l c h / 0.15);
      animation: site-logo-glow 3s ease-in-out infinite alternate;
    }

    @keyframes site-logo-glow {
      0% { box-shadow: 0 0 12px oklch(from var(--brand, oklch(65% 0.2 270)) l c h / 0.3); }
      100% { box-shadow: 0 0 24px oklch(from var(--brand, oklch(65% 0.2 270)) l c h / 0.5),
                          0 0 48px oklch(from var(--brand, oklch(65% 0.2 270)) l c h / 0.15); }
    }

    /* Premium: glowing search focus ring */
    .site-sidebar[data-tier="premium"] .ui-search-input .ui-search-input__field:focus {
      border-color: var(--brand, oklch(65% 0.2 270));
      box-shadow: 0 0 0 3px oklch(from var(--brand, oklch(65% 0.2 270)) l c h / 0.2),
                  0 0 16px oklch(from var(--brand, oklch(65% 0.2 270)) l c h / 0.12);
    }

    /* Premium: group header shimmer on hover */
    .site-sidebar[data-tier="premium"] .site-group__header {
      position: relative;
      overflow: hidden;
    }
    .site-sidebar[data-tier="premium"] .site-group__header::before {
      content: '';
      position: absolute;
      inset: 0;
      background: linear-gradient(
        110deg,
        transparent 20%,
        oklch(100% 0 0 / 0.04) 45%,
        oklch(100% 0 0 / 0.08) 50%,
        oklch(100% 0 0 / 0.04) 55%,
        transparent 80%
      );
      transform: translateX(-100%);
      transition: transform 0.6s ease;
      pointer-events: none;
    }
    .site-sidebar[data-tier="premium"] .site-group__header:hover::before {
      transform: translateX(100%);
    }

    /* Premium: active nav items glow trail */
    .site-sidebar[data-tier="premium"] .site-nav-link--active {
      background: oklch(from var(--brand, oklch(65% 0.2 270)) l c h / 0.12);
      box-shadow: inset 0 0 12px oklch(from var(--brand, oklch(65% 0.2 270)) l c h / 0.08),
                  0 0 8px oklch(from var(--brand, oklch(65% 0.2 270)) l c h / 0.06);
    }

    /* Premium: active component link glow */
    .site-sidebar[data-tier="premium"] .site-clink--active {
      background: oklch(from var(--brand, oklch(65% 0.2 270)) l c h / 0.1);
      box-shadow: inset 0 0 8px oklch(from var(--brand, oklch(65% 0.2 270)) l c h / 0.06);
    }

    /* Premium: animated pulse on premium dots */
    .site-sidebar[data-tier="premium"] .site-clink__premium {
      background: oklch(75% 0.2 310);
      animation: site-premium-dot-pulse 2s ease-in-out infinite;
    }

    @keyframes site-premium-dot-pulse {
      0%, 100% { opacity: 1; box-shadow: 0 0 4px oklch(75% 0.2 310 / 0.5); }
      50% { opacity: 0.6; box-shadow: 0 0 8px oklch(75% 0.2 310 / 0.3); }
    }

    /* Premium: badge glow */
    .site-sidebar[data-tier="premium"] .site-group__count .ui-badge[data-variant="primary"] {
      box-shadow: 0 0 6px oklch(from var(--brand, oklch(65% 0.2 270)) l c h / 0.25);
    }

    /* Premium: spring transitions on everything */
    .site-sidebar[data-tier="premium"] .site-nav-link {
      transition: background 0.35s cubic-bezier(0.34, 1.56, 0.64, 1),
                  color 0.25s ease,
                  box-shadow 0.35s cubic-bezier(0.34, 1.56, 0.64, 1);
    }
    .site-sidebar[data-tier="premium"] .site-clink {
      transition: background 0.35s cubic-bezier(0.34, 1.56, 0.64, 1),
                  color 0.25s ease,
                  border-color 0.35s cubic-bezier(0.34, 1.56, 0.64, 1),
                  box-shadow 0.35s cubic-bezier(0.34, 1.56, 0.64, 1);
    }
    .site-sidebar[data-tier="premium"] .site-group__body {
      transition: grid-template-rows 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
    }
    .site-sidebar[data-tier="premium"] .site-group__chevron {
      transition: transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
    }

    /* Premium: tier pill glow when active */
    .site-sidebar[data-tier="premium"] .site-tier-pill--active {
      box-shadow: 0 0 12px oklch(from var(--brand, oklch(65% 0.2 270)) l c h / 0.4),
                  0 0 4px oklch(from var(--brand, oklch(65% 0.2 270)) l c h / 0.2);
    }

    /* Premium: glass footer */
    .site-sidebar[data-tier="premium"] .site-sidebar-footer {
      background: var(--bg-surface);
      border-block-start: 1px solid oklch(100% 0 0 / 0.08);
    }

    /* Premium: motion segment glow */
    .site-sidebar[data-tier="premium"] .site-motion-seg__btn--active {
      box-shadow: 0 0 8px oklch(from var(--brand, oklch(65% 0.2 270)) l c h / 0.35);
    }

    /* ─── Brand header ─── */
    .site-brand {
      padding: 1.25rem 1rem 0.75rem;
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }

    .site-brand__logo {
      position: relative;
      width: 34px;
      height: 34px;
      border-radius: var(--radius-md, 0.5rem);
      background: var(--brand, oklch(65% 0.2 270));
      display: grid;
      place-items: center;
      flex-shrink: 0;
      transition: box-shadow 0.4s ease;
    }
    .site-brand__logo::after {
      content: '';
      position: absolute;
      inset: -4px;
      border-radius: var(--radius-md, 0.5rem);
      background: oklch(from var(--brand, oklch(65% 0.2 270)) l c h / 0.15);
      z-index: -1;
      filter: blur(8px);
    }

    .site-brand__text {
      display: flex;
      flex-direction: column;
      gap: 0.125rem;
    }

    .site-brand__name {
      font-size: 0.875rem;
      font-weight: 800;
      color: var(--text-primary);
      line-height: 1.1;
      letter-spacing: -0.01em;
      transition: color 0.3s ease;
    }

    .site-brand__tagline {
      font-size: 0.5625rem;
      color: var(--text-tertiary);
      letter-spacing: 0.06em;
      text-transform: uppercase;
      font-weight: 500;
      transition: opacity 0.3s ease;
    }

    .site-brand__version {
      margin-inline-start: auto;
      transition: opacity 0.3s ease;
    }

    /* ─── Brand area wrapper for premium BorderBeam ─── */
    .site-brand-wrap {
      margin: 0;
    }
    .site-brand-wrap--premium {
      margin: 0.5rem 0.75rem 0;
      border-radius: var(--radius-lg, 0.75rem);
    }
    .site-brand-wrap--premium .site-brand {
      padding: 1rem 0.75rem 0.5rem;
    }

    /* ─── Search wrapper ─── */
    .site-search {
      padding: 0 0.75rem 0.5rem;
      position: relative;
    }

    .site-search__hint {
      position: absolute;
      inset-inline-end: 1.25rem;
      top: 50%;
      transform: translateY(-50%);
      font-size: 0.625rem;
      font-family: monospace;
      color: var(--text-tertiary);
      background: oklch(50% 0 0 / 0.1);
      padding: 0.0625rem 0.3125rem;
      border-radius: var(--radius-sm, 0.25rem);
      border: 1px solid var(--border-subtle);
      pointer-events: none;
      line-height: 1.4;
      transition: opacity 0.2s ease;
    }

    /* ─── Scrollable nav region ─── */
    .site-nav-scroll {
      flex: 1;
      overflow-y: auto;
      overflow-x: hidden;
      overscroll-behavior: contain;
      scrollbar-width: thin;
      scrollbar-color: oklch(50% 0 0 / 0.2) transparent;
    }

    /* Nav links */
    .site-nav {
      padding: 0.25rem 0.5rem;
      display: flex;
      flex-direction: column;
      gap: 1px;
    }

    .site-nav-link {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.4375rem 0.625rem;
      border-radius: var(--radius-sm);
      font-size: 0.8125rem;
      color: var(--text-secondary);
      text-decoration: none;
      transition: background 0.15s, color 0.15s;
      line-height: 1;
    }
    .site-nav-link:hover {
      background: oklch(100% 0 0 / 0.04);
      color: var(--text-primary);
    }
    .site-nav-link--active {
      background: oklch(from var(--brand, oklch(65% 0.2 270)) l c h / 0.08);
      color: var(--brand);
      font-weight: 600;
    }

    /* ─── Section header ─── */
    .site-section-header {
      display: flex;
      align-items: center;
      gap: 0.375rem;
      padding: 0.5rem 0.75rem 0.25rem;
      font-size: 0.625rem;
      font-weight: 700;
      color: var(--text-tertiary);
      text-transform: uppercase;
      letter-spacing: 0.06em;
      user-select: none;
    }
    .site-section-header__count {
      margin-inline-start: auto;
    }

    /* ─── Component groups ─── */
    .site-groups {
      padding: 0 0.5rem 0.5rem;
      display: flex;
      flex-direction: column;
      gap: 2px;
    }

    .site-group {
      border-radius: var(--radius-sm);
    }

    .site-group__header {
      display: flex;
      align-items: center;
      gap: 0.375rem;
      padding: 0.375rem 0.5rem;
      font-size: 0.6875rem;
      font-weight: 700;
      color: var(--text-tertiary);
      text-transform: uppercase;
      letter-spacing: 0.05em;
      cursor: pointer;
      border: none;
      background: none;
      width: 100%;
      text-align: start;
      border-radius: var(--radius-sm);
      transition: color 0.15s, background 0.15s;
      line-height: 1;
    }
    .site-group__header:hover {
      color: var(--text-secondary);
      background: oklch(100% 0 0 / 0.03);
    }
    .site-group__header--active {
      color: var(--text-secondary);
    }

    .site-group__count {
      margin-inline-start: auto;
      display: flex;
      align-items: center;
      gap: 0.375rem;
    }

    .site-group__chevron {
      display: flex;
      transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
    }
    .site-group__chevron--open {
      transform: rotate(90deg);
    }

    @media (prefers-reduced-motion: reduce) {
      .site-group__chevron {
        transition: transform 0.01s;
      }
      .site-sidebar[data-tier="premium"] .site-brand::before {
        animation: none;
      }
      .site-sidebar[data-tier="premium"] .site-brand__logo {
        animation: none;
      }
      .site-sidebar[data-tier="premium"] .site-clink__premium {
        animation: none;
      }
      .site-sidebar[data-tier="premium"] .site-group__header::before {
        display: none;
      }
      .site-sidebar[data-tier="premium"] .site-nav-link,
      .site-sidebar[data-tier="premium"] .site-clink {
        transition: none;
      }
    }

    /* Animated collapse container */
    .site-group__body {
      display: grid;
      grid-template-rows: 0fr;
      transition: grid-template-rows 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
    }
    .site-group__body--open {
      grid-template-rows: 1fr;
    }

    @media (prefers-reduced-motion: reduce) {
      .site-group__body {
        transition: grid-template-rows 0.01s;
      }
    }

    .site-group__inner {
      overflow: hidden;
    }

    .site-group__list {
      padding: 0.125rem 0;
      display: flex;
      flex-direction: column;
      gap: 0;
    }

    /* Component links */
    .site-clink {
      display: flex;
      align-items: center;
      gap: 0.375rem;
      padding: 0.3125rem 0.5rem 0.3125rem 1.625rem;
      font-size: 0.75rem;
      color: var(--text-secondary);
      text-decoration: none;
      border-radius: var(--radius-sm);
      border-inline-start: 2px solid transparent;
      transition: background 0.15s, color 0.15s, border-color 0.15s;
      line-height: 1;
      position: relative;
    }
    .site-clink:hover {
      background: oklch(100% 0 0 / 0.04);
      color: var(--text-primary);
    }
    .site-clink--active {
      background: oklch(from var(--brand, oklch(65% 0.2 270)) l c h / 0.08);
      color: var(--brand);
      font-weight: 600;
      border-inline-start-color: var(--brand);
    }
    .site-clink--disabled {
      color: var(--text-tertiary);
      opacity: 0.4;
      pointer-events: none;
      cursor: default;
    }

    .site-clink__premium {
      width: 5px;
      height: 5px;
      border-radius: 50%;
      background: oklch(75% 0.18 60);
      flex-shrink: 0;
      margin-inline-start: auto;
      transition: background 0.3s ease, box-shadow 0.3s ease;
    }

    /* ─── Search results mode ─── */
    .site-search-results {
      padding: 0 0.5rem 0.5rem;
      display: flex;
      flex-direction: column;
      gap: 2px;
    }

    .site-search-results__group {
      font-size: 0.625rem;
      font-weight: 700;
      color: var(--text-tertiary);
      text-transform: uppercase;
      letter-spacing: 0.05em;
      padding: 0.5rem 0.5rem 0.25rem;
    }

    .site-search-results__empty {
      padding: 2rem 1rem;
      text-align: center;
      color: var(--text-tertiary);
      font-size: 0.8125rem;
    }
    .site-search-results__empty-icon {
      font-size: 1.5rem;
      margin-block-end: 0.5rem;
      opacity: 0.4;
    }

    /* Match highlight */
    .site-clink__match {
      color: var(--brand);
      font-weight: 700;
    }

    /* ─── Sidebar footer ─── */
    .site-sidebar-footer {
      padding: 0.75rem;
      border-block-start: 1px solid var(--border-subtle);
      display: flex;
      flex-direction: column;
      gap: 0.625rem;
      transition: background 0.4s ease, border-color 0.4s ease;
    }

    .site-control-row {
      display: flex;
      align-items: center;
      gap: 0.375rem;
    }

    .site-control-label {
      font-size: 0.6875rem;
      color: var(--text-tertiary);
      min-width: 2.5rem;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      font-weight: 600;
    }

    /* Motion segmented control */
    .site-motion-seg {
      display: flex;
      gap: 0;
      background: oklch(50% 0 0 / 0.08);
      border-radius: var(--radius-sm);
      padding: 2px;
      flex: 1;
    }

    .site-motion-seg__btn {
      flex: 1;
      height: 22px;
      border-radius: calc(var(--radius-sm) - 1px);
      border: none;
      background: transparent;
      color: var(--text-tertiary);
      font-size: 0.625rem;
      font-weight: 700;
      cursor: pointer;
      transition: all 0.2s cubic-bezier(0.34, 1.56, 0.64, 1);
      display: grid;
      place-items: center;
    }
    .site-motion-seg__btn:hover {
      color: var(--text-secondary);
    }
    .site-motion-seg__btn--active {
      background: var(--brand);
      color: oklch(100% 0 0);
      box-shadow: 0 1px 3px oklch(0% 0 0 / 0.2);
    }

    @media (prefers-reduced-motion: reduce) {
      .site-motion-seg__btn {
        transition: none;
      }
    }

    /* Tier pills */
    .site-tier-pills {
      display: flex;
      gap: 0.25rem;
      flex: 1;
    }

    .site-tier-pill {
      flex: 1;
      height: 24px;
      border-radius: var(--radius-full, 9999px);
      border: 1px solid var(--border-default);
      background: transparent;
      color: var(--text-tertiary);
      font-size: 0.625rem;
      font-weight: 700;
      cursor: pointer;
      transition: all 0.2s cubic-bezier(0.34, 1.56, 0.64, 1);
      text-transform: uppercase;
      letter-spacing: 0.03em;
    }
    .site-tier-pill:hover {
      border-color: var(--border-strong);
      color: var(--text-secondary);
    }
    .site-tier-pill--active {
      background: var(--brand);
      color: oklch(100% 0 0);
      border-color: var(--brand);
      transition: all 0.25s cubic-bezier(0.34, 1.56, 0.64, 1);
    }

    /* Theme toggle row */
    .site-theme-row {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .site-theme-label {
      font-size: 0.6875rem;
      color: var(--text-tertiary);
      text-transform: uppercase;
      letter-spacing: 0.05em;
      font-weight: 600;
    }

    /* ─── Mobile header ─── */
    .site-mobile-header {
      display: none;
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      z-index: 40;
      height: 48px;
      align-items: center;
      padding: 0 0.75rem;
      gap: 0.5rem;
      background: oklch(from var(--bg-surface) l c h / 0.85);
      border-bottom: 1px solid var(--border-subtle);
      backdrop-filter: blur(16px) saturate(1.4);
      -webkit-backdrop-filter: blur(16px) saturate(1.4);
    }

    .site-hamburger {
      width: 36px;
      height: 36px;
      border: none;
      border-radius: var(--radius-sm);
      background: transparent;
      color: var(--text-primary);
      cursor: pointer;
      display: grid;
      place-items: center;
    }
    .site-hamburger:hover {
      background: oklch(100% 0 0 / 0.06);
    }

    .site-mobile-title {
      font-size: 0.8125rem;
      font-weight: 700;
      color: var(--text-primary);
    }

    .site-mobile-actions {
      margin-inline-start: auto;
      display: flex;
      gap: 0.25rem;
    }

    /* ─── Main content ─── */
    .site-main {
      flex: 1;
      min-width: 0;
      padding: 2rem 3rem;
      overflow-y: auto;
      overflow-x: clip;
    }

    @media (min-width: 1400px) {
      .site-main {
        padding-inline: clamp(3rem, 8vw, 12rem);
      }
    }

    @media (min-width: 1920px) {
      .site-main {
        padding-inline: clamp(6rem, 12vw, 20rem);
      }
    }

    /* ─── Responsive ─── */
    @media (max-width: 768px) {
      .site-sidebar {
        display: none;
      }
      .site-mobile-header {
        display: flex;
      }
      .site-main {
        padding: 1rem;
        padding-top: calc(48px + 1rem);
      }
    }
  }
`

// ─── Brand Area Component ─────────────────────────────────────────────────────
function BrandArea({ tier }: { tier: Tier }) {
  const inner = (
    <div className="site-brand">
      <div className="site-brand__logo">
        <Icon name="zap" size={16} style={{ color: 'white' }} />
      </div>
      <div className="site-brand__text">
        <div className="site-brand__name">ui-kit</div>
        <div className="site-brand__tagline">Aurora Fluid v2</div>
      </div>
      <span className="site-brand__version">
        <Badge variant="primary" size="xs">v2.0</Badge>
      </span>
    </div>
  )

  if (tier === 'premium') {
    return (
      <div className="site-brand-wrap site-brand-wrap--premium">
        <BorderBeam duration={8} color="oklch(65% 0.2 270 / 0.6)" size={60}>
          {inner}
        </BorderBeam>
      </div>
    )
  }

  return <div className="site-brand-wrap">{inner}</div>
}

// ─── Sidebar Content (shared desktop + mobile) ───────────────────────────────

interface SidebarContentProps {
  searchQuery: string
  onSearchChange: (v: string) => void
  openGroups: Record<string, boolean>
  toggleGroup: (label: string) => void
  onClick?: () => void
  motion: number
  setMotion: (n: number) => void
  light: boolean
  toggleLight: () => void
  tier: Tier
  setTier: (t: Tier) => void
  searchInputRef?: React.RefObject<HTMLInputElement | null>
}

function SidebarContent({
  searchQuery,
  onSearchChange,
  openGroups,
  toggleGroup,
  onClick,
  motion,
  setMotion,
  light,
  toggleLight,
  tier,
  setTier,
  searchInputRef,
}: SidebarContentProps) {
  const location = useLocation()
  const isSearching = searchQuery.length > 0
  const isPremium = tier === 'premium'
  const isLite = tier === 'lite'

  // Filtered results when searching
  const searchResults = useMemo(() => {
    if (!isSearching) return null
    const q = searchQuery.toLowerCase()
    const results: { group: ComponentGroup; items: ComponentEntry[] }[] = []
    for (const group of componentGroups) {
      const matched = group.items.filter(item =>
        item.name.toLowerCase().includes(q)
      )
      if (matched.length > 0) {
        results.push({ group, items: matched })
      }
    }
    return results
  }, [searchQuery, isSearching])

  const totalResults = searchResults?.reduce((s, r) => s + r.items.length, 0) ?? 0

  // Highlight matching text
  const highlightMatch = (name: string) => {
    if (!isSearching) return name
    const q = searchQuery.toLowerCase()
    const idx = name.toLowerCase().indexOf(q)
    if (idx === -1) return name
    return (
      <>
        {name.slice(0, idx)}
        <span className="site-clink__match">{name.slice(idx, idx + searchQuery.length)}</span>
        {name.slice(idx + searchQuery.length)}
      </>
    )
  }

  // Detect which group the current path belongs to
  const activeGroup = useMemo(() => {
    for (const group of componentGroups) {
      for (const item of group.items) {
        if (item.path && location.pathname === item.path) {
          return group.label
        }
      }
    }
    return null
  }, [location.pathname])

  // Render a component link item
  const renderComponentLink = (item: ComponentEntry, showHighlight = false) => {
    const content = (
      <>
        {showHighlight ? highlightMatch(item.name) : item.name}
        {item.premium && !isLite && (
          <span className="site-clink__premium" title="Premium tier" />
        )}
      </>
    )

    if (!item.path) {
      return (
        <span key={item.name} className="site-clink site-clink--disabled">
          {content}
        </span>
      )
    }

    return (
      <NavLink
        key={item.name}
        to={item.path}
        onClick={onClick}
        className={({ isActive }) =>
          `site-clink${isActive ? ' site-clink--active' : ''}`
        }
      >
        {content}
      </NavLink>
    )
  }

  return (
    <>
      {/* Brand */}
      <BrandArea tier={tier} />

      {/* Search */}
      <div className="site-search">
        <SearchInput
          ref={searchInputRef}
          value={searchQuery}
          onChange={onSearchChange}
          onClear={() => onSearchChange('')}
          placeholder="Search components..."
          size="xs"
          debounce={0}
        />
        {!isSearching && <span className="site-search__hint">/</span>}
      </div>

      <Divider spacing="sm" />

      {/* Scrollable nav area */}
      <div className="site-nav-scroll">
        {/* Top-level pages */}
        {!isSearching && (
          <nav className="site-nav">
            {pages.map(p => (
              <NavLink
                key={p.path}
                to={p.path}
                end={p.path === '/'}
                onClick={onClick}
                className={({ isActive }) =>
                  `site-nav-link${isActive ? ' site-nav-link--active' : ''}`
                }
              >
                <Icon name={p.icon} size={14} />
                {p.label}
              </NavLink>
            ))}
          </nav>
        )}

        {!isSearching && <Divider spacing="sm" />}

        {/* Section header: Components */}
        {!isSearching && (
          <div className="site-section-header">
            <Icon name="code" size={10} />
            Components
            {!isLite && (
              <span className="site-section-header__count">
                <Badge variant="default" size="xs">{totalComponents}</Badge>
              </span>
            )}
          </div>
        )}

        {/* Search results */}
        {isSearching && (
          <div className="site-search-results">
            {totalResults > 0 ? (
              <>
                {searchResults!.map(({ group, items }) => (
                  <div key={group.label}>
                    <div className="site-search-results__group">
                      {group.label} ({items.length})
                    </div>
                    {items.map(item => renderComponentLink(item, true))}
                  </div>
                ))}
              </>
            ) : (
              <div className="site-search-results__empty">
                <div className="site-search-results__empty-icon">
                  <Icon name="search" size={24} />
                </div>
                No components match &ldquo;{searchQuery}&rdquo;
              </div>
            )}
          </div>
        )}

        {/* Component groups (accordion) */}
        {!isSearching && (
          <div className="site-groups">
            {componentGroups.map(group => {
              const isOpen = openGroups[group.label] ?? false
              const isActiveGroup = activeGroup === group.label
              return (
                <div className="site-group" key={group.label}>
                  <button
                    className={`site-group__header${isActiveGroup ? ' site-group__header--active' : ''}`}
                    onClick={() => toggleGroup(group.label)}
                    aria-expanded={isOpen}
                  >
                    <Icon name={group.icon} size={11} />
                    {group.label}
                    <span className="site-group__count">
                      <Badge variant={isActiveGroup ? 'primary' : 'default'} size="xs">
                        {group.items.length}
                      </Badge>
                      <span className={`site-group__chevron${isOpen ? ' site-group__chevron--open' : ''}`}>
                        <Icon name="chevron-right" size={9} />
                      </span>
                    </span>
                  </button>
                  <div className={`site-group__body${isOpen ? ' site-group__body--open' : ''}`}>
                    <div className="site-group__inner">
                      <div className="site-group__list">
                        {group.items.map(item => renderComponentLink(item))}
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Footer controls */}
      <div className="site-sidebar-footer">
        {/* Tier */}
        <div className="site-control-row">
          <span className="site-control-label">Tier</span>
          <div className="site-tier-pills">
            {(['lite', 'standard', 'premium'] as const).map(t => {
              const label = t === 'lite' ? 'Lite' : t === 'standard' ? 'Std' : 'Pro'
              const btn = (
                <button
                  key={t}
                  className={`site-tier-pill${tier === t ? ' site-tier-pill--active' : ''}`}
                  onClick={() => setTier(t)}
                >
                  {label}
                </button>
              )
              if (isPremium) {
                return (
                  <Tooltip key={t} content={`Switch to ${t} tier`} placement="top" delay={200}>
                    {btn}
                  </Tooltip>
                )
              }
              return btn
            })}
          </div>
        </div>

        {/* Motion */}
        <div className="site-control-row">
          <span className="site-control-label">Motion</span>
          <div className="site-motion-seg">
            {[0, 1, 2, 3].map(n => (
              <button
                key={n}
                className={`site-motion-seg__btn${motion === n ? ' site-motion-seg__btn--active' : ''}`}
                onClick={() => setMotion(n)}
                aria-label={`Motion level ${n}`}
              >{n}</button>
            ))}
          </div>
        </div>

        {/* Theme toggle */}
        <div className="site-theme-row">
          <ToggleSwitch
            size="xs"
            checked={light}
            onChange={() => toggleLight()}
            label={light ? 'Light' : 'Dark'}
          />
        </div>
      </div>
    </>
  )
}

// ─── App ──────────────────────────────────────────────────────────────────────

export default function App() {
  const [light, setLight] = useState(() => {
    try { return localStorage.getItem('ui-kit-light') === 'true' } catch { return false }
  })
  const [motion, setMotion] = useState(() => {
    try { return Number(localStorage.getItem('ui-kit-motion') ?? '3') } catch { return 3 }
  })
  const [tier, setTier] = useState<Tier>(() => {
    try { return (localStorage.getItem('ui-kit-tier') as Tier) || 'standard' } catch { return 'standard' }
  })
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const location = useLocation()
  const searchInputRef = useRef<HTMLInputElement>(null)

  useStyles('site-layout', layoutStyles)

  // Persist settings to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('ui-kit-light', String(light))
      localStorage.setItem('ui-kit-motion', String(motion))
      localStorage.setItem('ui-kit-tier', tier)
    } catch {}
  }, [light, motion, tier])

  const toggleLight = useCallback(() => setLight(l => !l), [])
  const closeDrawer = useCallback(() => setDrawerOpen(false), [])

  // Determine which group should be open based on current route
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {}
    for (const group of componentGroups) {
      initial[group.label] = false
    }
    return initial
  })

  // Auto-open the group containing the active route
  useEffect(() => {
    for (const group of componentGroups) {
      for (const item of group.items) {
        if (item.path && location.pathname === item.path) {
          setOpenGroups(prev => {
            if (prev[group.label]) return prev
            return { ...prev, [group.label]: true }
          })
          return
        }
      }
    }
  }, [location.pathname])

  const toggleGroup = useCallback((label: string) => {
    setOpenGroups(prev => ({ ...prev, [label]: !prev[label] }))
  }, [])

  // Keyboard shortcut: / or Cmd+K to focus search
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      // Don't intercept if user is typing in an input/textarea
      const tag = (e.target as HTMLElement)?.tagName
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') {
        // Allow Escape to blur from search
        if (e.key === 'Escape' && searchInputRef.current === e.target) {
          searchInputRef.current?.blur()
          setSearchQuery('')
          e.preventDefault()
        }
        return
      }
      if (e.key === '/' || (e.key === 'k' && (e.metaKey || e.ctrlKey))) {
        e.preventDefault()
        searchInputRef.current?.focus()
      }
    }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [])

  const sharedProps = {
    searchQuery,
    onSearchChange: setSearchQuery,
    openGroups,
    toggleGroup,
    motion,
    setMotion,
    light,
    toggleLight,
    tier,
    setTier,
  }

  return (
    <UIProvider motion={motion as 0|1|2|3} mode={light ? 'light' : 'dark'}>
      <TierContext.Provider value={{ tier, setTier }}>
      <div className="site" data-tier={tier}>
        {/* Desktop sidebar */}
        <aside className="site-sidebar" data-tier={tier}>
          <SidebarContent
            {...sharedProps}
            searchInputRef={searchInputRef}
          />
        </aside>

        {/* Mobile header */}
        <div className="site-mobile-header">
          <button className="site-hamburger" onClick={() => setDrawerOpen(true)} aria-label="Open navigation">
            <Icon name="menu" size={18} />
          </button>
          <span className="site-mobile-title">ui-kit v2</span>
          <div className="site-mobile-actions">
            <button className="site-hamburger" onClick={toggleLight} aria-label="Toggle theme">
              <Icon name={light ? 'eye-off' : 'eye'} size={16} />
            </button>
          </div>
        </div>

        {/* Mobile drawer — same sidebar content */}
        <Drawer open={drawerOpen} onClose={closeDrawer} side="left" size="sm">
          <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }} data-tier={tier}>
            <SidebarContent
              {...sharedProps}
              onClick={closeDrawer}
              toggleLight={() => { toggleLight(); closeDrawer() }}
            />
          </div>
        </Drawer>

        {/* Main */}
        <main className="site-main" key={location.pathname}>
          <Suspense fallback={<Skeleton variant="rectangular" width="100%" height={300} />}>
            <Outlet />
          </Suspense>
        </main>
      </div>
      </TierContext.Provider>
    </UIProvider>
  )
}
