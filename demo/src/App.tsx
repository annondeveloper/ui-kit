'use client'
import { useState, useCallback, Suspense, createContext, useContext } from 'react'
import { NavLink, Outlet, useLocation } from 'react-router-dom'
import { UIProvider } from '@ui/components/ui-provider'
import { Drawer } from '@ui/components/drawer'
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
      { name: 'DatePicker', path: '/components/date-picker' },
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
      { name: 'Drawer', path: '/components/drawer' },
      { name: 'Tooltip', path: '/components/tooltip' },
      { name: 'Alert', path: '/components/alert' },
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
      { name: 'SmartTable', path: '/components/smart-table' },
      { name: 'MetricCard', path: '/components/metric-card' },
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
    ],
  },
  {
    label: 'Monitoring',
    icon: 'activity',
    items: [
      { name: 'LogViewer', path: '/components/log-viewer' },
      { name: 'LiveFeed', path: '/components/live-feed' },
      { name: 'PipelineStage', path: '/components/pipeline-stage' },
      { name: 'UptimeTracker', path: '/components/uptime-tracker' },
      { name: 'PortStatusGrid', path: '/components/port-status-grid' },
      { name: 'NetworkTrafficCard', path: '/components/network-traffic-card' },
      { name: 'SeverityTimeline', path: '/components/severity-timeline' },
      { name: 'RealtimeValue', path: '/components/realtime-value' },
      { name: 'GeoMap', path: '/components/geo-map' },
      { name: 'DashboardGrid', path: '/components/dashboard-grid' },
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
  {
    label: 'Domain',
    icon: 'terminal',
    items: [
      { name: 'LogViewer', path: '/components/log-viewer' },
      { name: 'EmptyState', path: '/components/empty-state' },
      { name: 'CopyBlock', path: '/components/copy-block' },
    ],
  },
]

const layoutStyles = css`
  @layer demo {
    /* ─── Root layout ─── */
    .site {
      display: flex;
      min-height: 100dvh;
    }

    /* ─── Desktop sidebar ─── */
    .site-sidebar {
      width: 220px;
      flex-shrink: 0;
      position: sticky;
      top: 0;
      height: 100dvh;
      overflow-y: auto;
      display: flex;
      flex-direction: column;
      background: var(--bg-surface);
      border-inline-end: 1px solid var(--border-subtle);
    }

    .site-sidebar-brand {
      display: flex;
      align-items: center;
      gap: 0.625rem;
      padding: 1rem 1rem 0.75rem;
    }

    .site-sidebar-brand-icon {
      width: 28px;
      height: 28px;
      border-radius: var(--radius-sm);
      background: var(--brand);
      display: grid;
      place-items: center;
      flex-shrink: 0;
    }

    .site-sidebar-brand-name {
      font-size: 0.8125rem;
      font-weight: 700;
      color: var(--text-primary);
      line-height: 1.2;
    }

    .site-sidebar-brand-sub {
      font-size: 0.5625rem;
      color: var(--text-tertiary);
      letter-spacing: 0.04em;
      text-transform: uppercase;
    }

    /* Nav links */
    .site-nav {
      flex: 1;
      padding: 0.5rem 0.5rem;
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
      transition: background 0.1s, color 0.1s;
      line-height: 1;
    }
    .site-nav-link:hover {
      background: oklch(100% 0 0 / 0.04);
      color: var(--text-primary);
    }
    .site-nav-link--active {
      background: var(--brand-subtle);
      color: var(--brand);
      font-weight: 600;
    }

    /* Component nav section */
    .site-nav-divider {
      height: 1px;
      background: var(--border-subtle);
      margin-block: 0.5rem;
    }

    .site-nav-section-label {
      display: flex;
      align-items: center;
      gap: 0.375rem;
      padding: 0.375rem 0.625rem;
      font-size: 0.6875rem;
      font-weight: 700;
      color: var(--text-tertiary);
      text-transform: uppercase;
      letter-spacing: 0.06em;
      cursor: pointer;
      border: none;
      background: none;
      width: 100%;
      text-align: start;
      border-radius: var(--radius-sm);
      transition: color 0.1s;
    }
    .site-nav-section-label:hover {
      color: var(--text-secondary);
    }
    .site-nav-section-chevron {
      margin-inline-start: auto;
      transition: transform 0.2s;
    }
    .site-nav-section-chevron--open {
      transform: rotate(90deg);
    }

    .site-nav-group-label {
      display: flex;
      align-items: center;
      gap: 0.375rem;
      padding: 0.3125rem 0.625rem 0.3125rem 1rem;
      font-size: 0.6875rem;
      font-weight: 600;
      color: var(--text-tertiary);
      cursor: pointer;
      border: none;
      background: none;
      width: 100%;
      text-align: start;
      border-radius: var(--radius-sm);
      transition: color 0.1s;
    }
    .site-nav-group-label:hover {
      color: var(--text-secondary);
    }
    .site-nav-group-chevron {
      margin-inline-start: auto;
      transition: transform 0.15s;
    }
    .site-nav-group-chevron--open {
      transform: rotate(90deg);
    }

    .site-nav-component-link {
      display: flex;
      align-items: center;
      gap: 0.375rem;
      padding: 0.25rem 0.625rem 0.25rem 1.75rem;
      font-size: 0.75rem;
      color: var(--text-secondary);
      text-decoration: none;
      border-radius: var(--radius-sm);
      transition: background 0.1s, color 0.1s;
      line-height: 1;
    }
    .site-nav-component-link:hover {
      background: oklch(100% 0 0 / 0.04);
      color: var(--text-primary);
    }
    .site-nav-component-link--active {
      background: var(--brand-subtle);
      color: var(--brand);
      font-weight: 600;
    }
    .site-nav-component-link--disabled {
      color: var(--text-tertiary);
      opacity: 0.45;
      pointer-events: none;
      cursor: default;
    }

    /* Sidebar footer with controls */
    .site-sidebar-footer {
      padding: 0.75rem;
      border-block-start: 1px solid var(--border-subtle);
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
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
    }

    .site-motion-btn {
      width: 24px;
      height: 24px;
      border-radius: var(--radius-sm);
      border: 1px solid var(--border-default);
      background: transparent;
      color: var(--text-tertiary);
      font-size: 0.6875rem;
      font-weight: 600;
      cursor: pointer;
      display: grid;
      place-items: center;
      transition: all 0.1s;
    }
    .site-motion-btn:hover {
      border-color: var(--border-strong);
      color: var(--text-primary);
    }
    .site-motion-btn--active {
      background: var(--brand);
      color: oklch(100% 0 0);
      border-color: var(--brand);
    }

    .site-theme-btn {
      width: 100%;
      padding: 0.375rem 0.625rem;
      border-radius: var(--radius-sm);
      border: 1px solid var(--border-default);
      background: transparent;
      color: var(--text-secondary);
      font-size: 0.75rem;
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 0.375rem;
      justify-content: center;
      transition: all 0.1s;
    }
    .site-theme-btn:hover {
      border-color: var(--border-strong);
      background: oklch(100% 0 0 / 0.03);
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
      background: var(--bg-surface);
      border-bottom: 1px solid var(--border-subtle);
      backdrop-filter: blur(12px);
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
      /* overflow-x: clip instead of hidden — doesn't create stacking context that clips popovers */
      overflow-x: clip;
    }

    /* On large screens, add MORE padding to push content toward center */
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

function ComponentNav({ onClick }: { onClick?: () => void }) {
  const [sectionOpen, setSectionOpen] = useState(true)
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(componentGroups.map(g => [g.label, true]))
  )

  const toggleGroup = (label: string) =>
    setOpenGroups(prev => ({ ...prev, [label]: !prev[label] }))

  return (
    <>
      <div className="site-nav-divider" />
      <button
        className="site-nav-section-label"
        onClick={() => setSectionOpen(o => !o)}
      >
        <Icon name="code" size={12} />
        Components
        <span className={`site-nav-section-chevron${sectionOpen ? ' site-nav-section-chevron--open' : ''}`}>
          <Icon name="chevron-right" size={10} />
        </span>
      </button>
      {sectionOpen && componentGroups.map(group => (
        <div key={group.label}>
          <button
            className="site-nav-group-label"
            onClick={() => toggleGroup(group.label)}
          >
            <Icon name={group.icon} size={11} />
            {group.label}
            <span className={`site-nav-group-chevron${openGroups[group.label] ? ' site-nav-group-chevron--open' : ''}`}>
              <Icon name="chevron-right" size={9} />
            </span>
          </button>
          {openGroups[group.label] && group.items.map(item =>
            item.path ? (
              <NavLink
                key={item.name}
                to={item.path}
                onClick={onClick}
                className={({ isActive }) =>
                  `site-nav-component-link${isActive ? ' site-nav-component-link--active' : ''}`
                }
              >
                {item.name}
              </NavLink>
            ) : (
              <span key={item.name} className="site-nav-component-link site-nav-component-link--disabled">
                {item.name}
              </span>
            )
          )}
        </div>
      ))}
    </>
  )
}

function NavLinks({ onClick }: { onClick?: () => void }) {
  return (
    <>
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
      <ComponentNav onClick={onClick} />
    </>
  )
}

function Controls({ motion, setMotion, light, toggleLight, tier, setTier }: {
  motion: number; setMotion: (n: number) => void
  light: boolean; toggleLight: () => void
  tier: Tier; setTier: (t: Tier) => void
}) {
  return (
    <>
      <div className="site-control-row">
        <span className="site-control-label">Tier</span>
        {(['lite', 'standard', 'premium'] as const).map(t => (
          <button
            key={t}
            className={`site-motion-btn${tier === t ? ' site-motion-btn--active' : ''}`}
            onClick={() => setTier(t)}
            style={{ fontSize: '0.5625rem', width: 'auto', paddingInline: '0.375rem' }}
          >{t === 'lite' ? 'L' : t === 'standard' ? 'S' : 'P'}</button>
        ))}
      </div>
      <div className="site-control-row">
        <span className="site-control-label">Motion</span>
        {[0, 1, 2, 3].map(n => (
          <button
            key={n}
            className={`site-motion-btn${motion === n ? ' site-motion-btn--active' : ''}`}
            onClick={() => setMotion(n)}
          >{n}</button>
        ))}
      </div>
      <button className="site-theme-btn" onClick={toggleLight}>
        <Icon name={light ? 'eye-off' : 'eye'} size={14} />
        {light ? 'Dark mode' : 'Light mode'}
      </button>
    </>
  )
}

export default function App() {
  const [light, setLight] = useState(false)
  const [motion, setMotion] = useState(3)
  const [tier, setTier] = useState<Tier>('standard')
  const [drawerOpen, setDrawerOpen] = useState(false)
  const location = useLocation()

  useStyles('site-layout', layoutStyles)
  const toggleLight = useCallback(() => setLight(l => !l), [])
  const closeDrawer = useCallback(() => setDrawerOpen(false), [])

  return (
    <UIProvider motion={motion as 0|1|2|3} mode={light ? 'light' : 'dark'}>
      <TierContext.Provider value={{ tier, setTier }}>
      <div className="site">
        {/* Desktop sidebar */}
        <aside className="site-sidebar">
          <div className="site-sidebar-brand">
            <div className="site-sidebar-brand-icon">
              <Icon name="zap" size={14} style={{ color: 'white' }} />
            </div>
            <div>
              <div className="site-sidebar-brand-name">ui-kit</div>
              <div className="site-sidebar-brand-sub">Aurora Fluid v2</div>
            </div>
          </div>
          <nav className="site-nav">
            <NavLinks />
          </nav>
          <div className="site-sidebar-footer">
            <Controls motion={motion} setMotion={setMotion} light={light} toggleLight={toggleLight} tier={tier} setTier={setTier} />
          </div>
        </aside>

        {/* Mobile header */}
        <div className="site-mobile-header">
          <button className="site-hamburger" onClick={() => setDrawerOpen(true)}>
            <Icon name="menu" size={18} />
          </button>
          <span className="site-mobile-title">ui-kit v2</span>
          <div className="site-mobile-actions">
            <button className="site-hamburger" onClick={toggleLight}>
              <Icon name={light ? 'eye-off' : 'eye'} size={16} />
            </button>
          </div>
        </div>

        {/* Mobile drawer */}
        <Drawer open={drawerOpen} onClose={closeDrawer} side="left" size="sm">
          <div style={{ padding: '0.75rem' }}>
            <div className="site-sidebar-brand" style={{ marginBottom: '0.5rem' }}>
              <div className="site-sidebar-brand-icon">
                <Icon name="zap" size={14} style={{ color: 'white' }} />
              </div>
              <div>
                <div className="site-sidebar-brand-name">ui-kit</div>
                <div className="site-sidebar-brand-sub">Aurora Fluid v2</div>
              </div>
            </div>
            <nav className="site-nav" style={{ padding: 0 }}>
              <NavLinks onClick={closeDrawer} />
            </nav>
            <div style={{ marginTop: '1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <Controls motion={motion} setMotion={setMotion} light={light} toggleLight={() => { toggleLight(); closeDrawer() }} tier={tier} setTier={setTier} />
            </div>
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
