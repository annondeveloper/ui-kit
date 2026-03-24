import { Link } from 'react-router-dom'
import { Button } from '@ui/components/button'
import { Card } from '@ui/components/card'
import { Badge } from '@ui/components/badge'
import { Icon, type IconName } from '@ui/core/icons/icon'
import { AnimatedCounter } from '@ui/components/animated-counter'
import { MetricCard } from '@ui/domain/metric-card'
import { Sparkline } from '@ui/domain/sparkline'
import { StatusBadge } from '@ui/components/status-badge'
import { StatusPulse } from '@ui/components/status-pulse'
import { CopyBlock } from '@ui/domain/copy-block'
import { css } from '@ui/core/styles/css-tag'
import { useStyles } from '@ui/core/styles/use-styles'

// ─── Page Styles ─────────────────────────────────────────────────────────────

const homeStyles = css`
  @layer demo {
    .home {
      --section-gap: clamp(3rem, 6vw, 5rem);
    }

    /* ─── Hero ─── */
    .home-hero {
      position: relative;
      text-align: center;
      padding-block: clamp(3rem, 8vw, 6rem) clamp(2rem, 5vw, 4rem);
      max-width: 720px;
      margin-inline: auto;
      overflow: visible;
    }

    .home-hero-glow {
      position: absolute;
      inset: -40% -20%;
      z-index: -1;
      pointer-events: none;
      background:
        radial-gradient(ellipse 60% 50% at 30% 40%, oklch(55% 0.18 270 / 0.12), transparent 70%),
        radial-gradient(ellipse 50% 60% at 70% 50%, oklch(60% 0.15 310 / 0.10), transparent 70%),
        radial-gradient(ellipse 70% 40% at 50% 60%, oklch(65% 0.12 200 / 0.08), transparent 70%);
      filter: blur(40px);
      animation: home-glow-drift 12s ease-in-out infinite alternate;
    }

    @keyframes home-glow-drift {
      0% { transform: translate(0, 0) scale(1); opacity: 0.7; }
      100% { transform: translate(10px, -8px) scale(1.05); opacity: 1; }
    }

    .home-hero h1 {
      font-size: clamp(2rem, 5vw, 3.25rem);
      font-weight: 800;
      letter-spacing: -0.035em;
      line-height: 1.08;
      margin-block-end: 1.25rem;
      text-wrap: balance;
      color: var(--text-primary);
    }

    .home-hero-sub {
      font-size: clamp(1rem, 2.2vw, 1.2rem);
      color: var(--text-secondary);
      line-height: 1.65;
      max-width: 520px;
      margin-inline: auto;
      margin-block-end: 2rem;
      text-wrap: pretty;
    }

    .home-hero-actions {
      display: flex;
      gap: 0.75rem;
      justify-content: center;
      flex-wrap: wrap;
    }

    /* ─── Stats Bar ─── */
    .home-stats {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 1px;
      margin-block-start: clamp(2rem, 4vw, 3rem);
      margin-block-end: var(--section-gap);
      border-radius: var(--radius-lg, 0.75rem);
      overflow: hidden;
      background: var(--border-subtle, oklch(100% 0 0 / 0.08));
    }

    @media (max-width: 640px) {
      .home-stats {
        grid-template-columns: repeat(2, 1fr);
      }
    }

    .home-stat {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 0.25rem;
      padding: 1.25rem 1rem;
      background: var(--bg-surface, oklch(20% 0 0));
    }

    .home-stat-value {
      font-size: var(--text-xl, 1.5rem);
      font-weight: 700;
      color: var(--text-primary);
      font-variant-numeric: tabular-nums;
    }

    .home-stat-label {
      font-size: var(--text-xs, 0.75rem);
      color: var(--text-tertiary);
      text-transform: uppercase;
      letter-spacing: 0.06em;
    }

    /* ─── Sections ─── */
    .home-section {
      margin-block-end: var(--section-gap);
    }

    .home-section-header {
      text-align: center;
      margin-block-end: 2rem;
    }

    .home-section-header h2 {
      font-size: clamp(1.5rem, 3vw, 2rem);
      font-weight: 700;
      letter-spacing: -0.02em;
      color: var(--text-primary);
      margin-block-end: 0.5rem;
    }

    .home-section-header p {
      font-size: var(--text-md, 1rem);
      color: var(--text-secondary);
      max-width: 500px;
      margin-inline: auto;
      line-height: 1.6;
      text-wrap: pretty;
    }

    /* ─── Dashboard Preview ─── */
    .home-dashboard {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
      gap: 1rem;
    }

    .home-dashboard-footer {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 1rem 1.25rem;
      margin-block-start: 1rem;
      border-radius: var(--radius-md, 0.5rem);
      background: var(--bg-surface, oklch(20% 0 0));
      border: 1px solid var(--border-subtle, oklch(100% 0 0 / 0.08));
    }

    .home-dashboard-statuses {
      display: flex;
      gap: 1rem;
      align-items: center;
      flex-wrap: wrap;
    }

    .home-dashboard-sparkline-wrap {
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }

    .home-dashboard-sparkline-label {
      font-size: var(--text-xs, 0.75rem);
      color: var(--text-tertiary);
      white-space: nowrap;
    }

    /* ─── Feature Grid ─── */
    .home-features {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
      gap: 1rem;
    }

    .home-feature-icon {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 2.5rem;
      height: 2.5rem;
      border-radius: var(--radius-md, 0.5rem);
      background: oklch(55% 0.15 270 / 0.12);
      margin-block-end: 0.75rem;
      color: var(--brand, oklch(70% 0.18 270));
    }

    .home-feature-title {
      font-weight: 600;
      font-size: var(--text-md, 1rem);
      margin-block-end: 0.375rem;
      color: var(--text-primary);
    }

    .home-feature-desc {
      font-size: var(--text-sm, 0.875rem);
      color: var(--text-secondary);
      line-height: 1.55;
    }

    /* ─── Category Grid ─── */
    .home-categories {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 0.75rem;
    }

    .home-category {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 1rem 1.25rem;
      text-decoration: none;
      color: inherit;
      border-radius: var(--radius-md, 0.5rem);
      background: var(--bg-surface, oklch(20% 0 0));
      border: 1px solid var(--border-subtle, oklch(100% 0 0 / 0.08));
      transition: border-color 0.2s, background 0.2s;
    }

    .home-category:hover {
      border-color: var(--brand, oklch(70% 0.18 270));
      background: oklch(100% 0 0 / 0.03);
    }

    .home-category-count {
      font-size: var(--text-xl, 1.5rem);
      font-weight: 700;
      color: var(--brand, oklch(70% 0.18 270));
      min-width: 2ch;
      font-variant-numeric: tabular-nums;
    }

    .home-category-name {
      font-size: var(--text-sm, 0.875rem);
      font-weight: 500;
      color: var(--text-primary);
    }

    .home-category-sub {
      font-size: var(--text-xs, 0.75rem);
      color: var(--text-tertiary);
    }

    /* ─── Code Example ─── */
    .home-code {
      max-width: 640px;
      margin-inline: auto;
    }

    /* ─── Motion Demo ─── */
    .home-motion-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 1rem;
    }

    .home-motion-card {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 1rem;
      padding: 1.5rem 1rem;
    }

    .home-motion-label {
      font-size: var(--text-sm, 0.875rem);
      font-weight: 600;
      color: var(--text-primary);
    }

    .home-motion-desc {
      font-size: var(--text-xs, 0.75rem);
      color: var(--text-tertiary);
      text-align: center;
      line-height: 1.5;
    }

    /* ─── Component Gallery ─── */
    .home-gallery-group {
      margin-block-end: 2rem;
    }

    .home-gallery-group-header {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      margin-block-end: 0.75rem;
      padding-block-end: 0.5rem;
      border-block-end: 1px solid var(--border-subtle, oklch(100% 0 0 / 0.08));
    }

    .home-gallery-group-icon {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 1.75rem;
      height: 1.75rem;
      border-radius: var(--radius-sm, 0.25rem);
      background: oklch(55% 0.15 270 / 0.1);
      color: var(--brand, oklch(70% 0.18 270));
    }

    .home-gallery-group-title {
      font-size: var(--text-md, 1rem);
      font-weight: 700;
      color: var(--text-primary);
    }

    .home-gallery-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
      gap: 0.75rem;
    }

    .home-gallery-card {
      display: flex;
      flex-direction: column;
      gap: 0.375rem;
      padding: 1rem 1.125rem;
      text-decoration: none;
      color: inherit;
      border-radius: var(--radius-md, 0.5rem);
      background: var(--bg-surface, oklch(20% 0 0));
      border: 1px solid var(--border-subtle, oklch(100% 0 0 / 0.08));
      transition: border-color 0.2s, background 0.2s, transform 0.15s;
    }
    .home-gallery-card:hover {
      border-color: var(--brand, oklch(70% 0.18 270));
      background: oklch(100% 0 0 / 0.03);
      transform: translateY(-1px);
    }
    .home-gallery-card--disabled {
      opacity: 0.45;
      pointer-events: none;
      cursor: default;
    }
    .home-gallery-card--disabled:hover {
      border-color: var(--border-subtle, oklch(100% 0 0 / 0.08));
      background: var(--bg-surface, oklch(20% 0 0));
      transform: none;
    }

    .home-gallery-card-top {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .home-gallery-card-name {
      font-size: var(--text-sm, 0.875rem);
      font-weight: 600;
      color: var(--text-primary);
    }

    .home-gallery-card-tiers {
      display: flex;
      gap: 0.25rem;
      margin-inline-start: auto;
    }

    .home-gallery-tier {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 1.25rem;
      height: 1.25rem;
      border-radius: var(--radius-sm, 0.25rem);
      font-size: 0.5625rem;
      font-weight: 700;
      line-height: 1;
    }
    .home-gallery-tier--L {
      background: oklch(70% 0.12 150 / 0.15);
      color: oklch(75% 0.15 150);
    }
    .home-gallery-tier--S {
      background: oklch(65% 0.12 250 / 0.15);
      color: oklch(70% 0.15 250);
    }
    .home-gallery-tier--P {
      background: oklch(65% 0.15 310 / 0.15);
      color: oklch(72% 0.18 310);
    }

    .home-gallery-card-desc {
      font-size: var(--text-xs, 0.75rem);
      color: var(--text-tertiary);
      line-height: 1.5;
    }

    /* ─── Getting Started ─── */
    .home-getting-started {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
      gap: 1rem;
    }

    .home-tier-card {
      padding: 1.5rem;
      border-radius: var(--radius-md, 0.5rem);
      background: var(--bg-surface, oklch(20% 0 0));
      border: 1px solid var(--border-subtle, oklch(100% 0 0 / 0.08));
    }

    .home-tier-card-header {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      margin-block-end: 0.375rem;
    }

    .home-tier-card-title {
      font-size: var(--text-md, 1rem);
      font-weight: 700;
      color: var(--text-primary);
    }

    .home-tier-card-desc {
      font-size: var(--text-sm, 0.875rem);
      color: var(--text-secondary);
      line-height: 1.5;
      margin-block-end: 1rem;
    }

    .home-tier-card-code {
      font-size: var(--text-xs, 0.75rem);
      font-family: monospace;
      padding: 0.625rem 0.875rem;
      border-radius: var(--radius-sm, 0.25rem);
      background: oklch(10% 0 0 / 0.5);
      color: var(--text-secondary);
      overflow-x: auto;
      white-space: nowrap;
    }

    /* ─── Hero Preview Strip ─── */
    .home-hero-preview {
      display: flex;
      gap: 0.75rem;
      justify-content: center;
      align-items: center;
      flex-wrap: wrap;
      margin-block-start: 2rem;
      padding: 1rem;
      border-radius: var(--radius-md, 0.5rem);
      background: oklch(100% 0 0 / 0.02);
      border: 1px solid var(--border-subtle, oklch(100% 0 0 / 0.06));
    }

    /* ─── Footer ─── */
    .home-footer {
      display: flex;
      align-items: center;
      justify-content: center;
      flex-wrap: wrap;
      gap: 1rem;
      padding-block: 2rem;
      border-block-start: 1px solid var(--border-subtle, oklch(100% 0 0 / 0.08));
    }

    .home-footer a {
      font-size: var(--text-sm, 0.875rem);
      color: var(--text-secondary);
      text-decoration: none;
      transition: color 0.15s;
    }

    .home-footer a:hover {
      color: var(--text-primary);
    }

    .home-footer-sep {
      width: 1px;
      height: 1rem;
      background: var(--border-subtle, oklch(100% 0 0 / 0.08));
    }
  }
`

// ─── Data ────────────────────────────────────────────────────────────────────

const features: { icon: IconName; title: string; desc: string }[] = [
  {
    icon: 'zap',
    title: 'Zero Dependencies',
    desc: 'Only React 19 as a peer dep. Every utility, animation, and style system built from scratch.',
  },
  {
    icon: 'activity',
    title: 'Physics Animations',
    desc: 'Real spring solver using RK4 integration. Not CSS approximations -- actual differential equations.',
  },
  {
    icon: 'eye',
    title: 'Aurora Fluid Design',
    desc: 'Deep atmospheric surfaces, ambient glows, ethereal color washes. OKLCH perceptually uniform colors.',
  },
  {
    icon: 'terminal',
    title: 'AI-Ready Components',
    desc: 'StreamingText, LiveFeed, RealtimeValue, TypingIndicator -- purpose-built for AI interfaces.',
  },
  {
    icon: 'edit',
    title: 'Built-in Form Engine',
    desc: 'createForm(), useForm(), validators, FieldArray. Full form solution with zero extra packages.',
  },
  {
    icon: 'grip-vertical',
    title: 'Universal Input',
    desc: 'Touch, mouse, keyboard, gamepad -- unified input system with gesture recognition and haptics.',
  },
]

const categories: { name: string; count: number; path: string; desc: string }[] = [
  { name: 'Primitives', count: 14, path: '/core', desc: 'Button, Card, Badge...' },
  { name: 'Forms', count: 13, path: '/forms', desc: 'Input, Select, DatePicker...' },
  { name: 'Overlays', count: 10, path: '/overlays', desc: 'Dialog, Sheet, Popover...' },
  { name: 'Data Display', count: 9, path: '/data', desc: 'Table, Tree, Timeline...' },
  { name: 'Monitoring', count: 11, path: '/monitor', desc: 'MetricCard, Gauge, Heatmap...' },
  { name: 'AI & Realtime', count: 5, path: '/ai', desc: 'Streaming, LiveFeed...' },
  { name: 'Layout', count: 8, path: '/core', desc: 'AppShell, Sidebar, Grid...' },
  { name: 'Navigation', count: 7, path: '/core', desc: 'Tabs, Breadcrumbs, Navbar...' },
]

// ─── Component Gallery Data ──────────────────────────────────────────────────
type TierBadge = 'L' | 'S' | 'P'

interface GalleryItem {
  name: string
  desc: string
  path: string | null
  tiers: TierBadge[]
}

interface GalleryGroup {
  label: string
  icon: IconName
  items: GalleryItem[]
}

const galleryGroups: GalleryGroup[] = [
  {
    label: 'Primitives',
    icon: 'code',
    items: [
      { name: 'Button', desc: 'Actions with variants, sizes, icons, loading states', path: '/components/button', tiers: ['L', 'S', 'P'] },
      { name: 'Badge', desc: 'Status indicators, counts, and labels', path: '/components/badge', tiers: ['L', 'S', 'P'] },
      { name: 'Card', desc: 'Versatile container with header, body, footer', path: '/components/card', tiers: ['L', 'S', 'P'] },
      { name: 'Avatar', desc: 'User images with fallback initials', path: null, tiers: ['L', 'S'] },
      { name: 'Divider', desc: 'Visual separation between content areas', path: null, tiers: ['L'] },
      { name: 'Skeleton', desc: 'Animated loading placeholders', path: null, tiers: ['L', 'S'] },
    ],
  },
  {
    label: 'Forms',
    icon: 'edit',
    items: [
      { name: 'Select', desc: 'Dropdown selection with search, multi-select', path: '/components/select', tiers: ['L', 'S', 'P'] },
      { name: 'Checkbox', desc: 'Binary toggle with indeterminate state', path: '/components/checkbox', tiers: ['L', 'S', 'P'] },
      { name: 'ToggleSwitch', desc: 'On/off switch with animated thumb', path: '/components/toggle-switch', tiers: ['L', 'S', 'P'] },
      { name: 'Slider', desc: 'Range input with marks and tooltips', path: null, tiers: ['L', 'S', 'P'] },
      { name: 'RadioGroup', desc: 'Single selection from a set', path: null, tiers: ['L', 'S'] },
      { name: 'DatePicker', desc: 'Calendar-based date selection', path: null, tiers: ['S', 'P'] },
      { name: 'ComboBox', desc: 'Filterable dropdown with autocomplete', path: null, tiers: ['S', 'P'] },
      { name: 'TagInput', desc: 'Multi-value input with tag chips', path: null, tiers: ['S', 'P'] },
      { name: 'FileUpload', desc: 'Drag and drop file uploader', path: null, tiers: ['S', 'P'] },
      { name: 'Rating', desc: 'Star or custom icon rating input', path: null, tiers: ['L', 'S'] },
    ],
  },
  {
    label: 'Overlays',
    icon: 'menu',
    items: [
      { name: 'Dialog', desc: 'Modal dialogs with focus trapping', path: '/components/dialog', tiers: ['L', 'S', 'P'] },
      { name: 'Drawer', desc: 'Slide-out panel from any edge', path: '/components/drawer', tiers: ['L', 'S', 'P'] },
      { name: 'Tooltip', desc: 'Contextual info on hover or focus', path: '/components/tooltip', tiers: ['L', 'S', 'P'] },
      { name: 'Alert', desc: 'Inline status messages and banners', path: '/components/alert', tiers: ['L', 'S', 'P'] },
      { name: 'Sheet', desc: 'Bottom sheet for mobile interfaces', path: null, tiers: ['S', 'P'] },
      { name: 'Popover', desc: 'Anchored floating content panels', path: null, tiers: ['S', 'P'] },
      { name: 'DropdownMenu', desc: 'Contextual action menus', path: null, tiers: ['S', 'P'] },
    ],
  },
  {
    label: 'Navigation',
    icon: 'arrow-right',
    items: [
      { name: 'Tabs', desc: 'Tabbed content with keyboard navigation', path: '/components/tabs', tiers: ['L', 'S', 'P'] },
      { name: 'Accordion', desc: 'Collapsible content sections', path: '/components/accordion', tiers: ['L', 'S', 'P'] },
      { name: 'Breadcrumbs', desc: 'Hierarchical navigation trail', path: null, tiers: ['L', 'S'] },
      { name: 'Pagination', desc: 'Page navigation controls', path: null, tiers: ['L', 'S'] },
      { name: 'Navbar', desc: 'Top-level application navigation', path: null, tiers: ['S', 'P'] },
      { name: 'Sidebar', desc: 'Collapsible side navigation', path: null, tiers: ['S', 'P'] },
    ],
  },
  {
    label: 'Data',
    icon: 'bar-chart',
    items: [
      { name: 'DataTable', desc: 'Sortable, filterable data grids', path: '/components/data-table', tiers: ['L', 'S', 'P'] },
      { name: 'MetricCard', desc: 'KPI display with sparklines and trends', path: '/components/metric-card', tiers: ['L', 'S', 'P'] },
      { name: 'UpstreamDashboard', desc: 'Real-time service monitoring layout', path: '/components/upstream-dashboard', tiers: ['P'] },
      { name: 'Progress', desc: 'Linear and circular progress indicators', path: '/components/progress', tiers: ['L', 'S', 'P'] },
    ],
  },
]

const motionLevels: { level: 0 | 1 | 2 | 3; label: string; desc: string }[] = [
  { level: 0, label: 'None', desc: 'Instant transitions. Respects prefers-reduced-motion.' },
  { level: 1, label: 'Subtle', desc: 'Simple CSS easing. Gentle fades and slides.' },
  { level: 2, label: 'Expressive', desc: 'Conservative spring physics. No overshoot.' },
  { level: 3, label: 'Cinematic', desc: 'Full spring physics with overshoot and bounce.' },
]

const codeExample = `import { UIProvider, Button, MetricCard, Dialog } from '@annondeveloper/ui-kit'

function App() {
  return (
    <UIProvider motion={2}>
      <MetricCard title="CPU" value="87.4%" trend="up" />
      <Button variant="primary">Deploy</Button>
    </UIProvider>
  )
}`

// ─── Component ───────────────────────────────────────────────────────────────

export default function Home() {
  const cls = useStyles('home', homeStyles)

  return (
    <div className={cls('home')}>

      {/* ── Section 1: Hero ── */}
      <section className={cls('home-hero')}>
        <div className={cls('home-hero-glow')} aria-hidden="true" />
        <Badge variant="primary" size="md" style={{ marginBlockEnd: '1.25rem' }}>
          v2.0 — Zero Dependencies
        </Badge>
        <h1>
          The component library<br />that needs nothing else
        </h1>
        <p className={cls('home-hero-sub')}>
          99 components. Physics-based animations. OKLCH color system.
          Aurora Fluid design language. 3 weight tiers. Built entirely from scratch.
        </p>
        <div className={cls('home-hero-actions')}>
          <Link to="/components/button" style={{ textDecoration: 'none' }}>
            <Button variant="primary" size="lg" icon={<Icon name="zap" size="sm" />}>
              Explore Components
            </Button>
          </Link>
          <Button
            variant="secondary"
            size="lg"
            icon={<Icon name="code" size="sm" />}
            onClick={() => window.open('https://github.com/annondeveloper/ui-kit', '_blank')}
          >
            GitHub
          </Button>
        </div>

        {/* Live Preview Strip */}
        <div className={cls('home-hero-preview')}>
          <Button variant="primary" size="sm">Primary</Button>
          <Button variant="secondary" size="sm">Secondary</Button>
          <Badge variant="primary" size="sm">New</Badge>
          <Badge variant="default" size="sm">v2.0</Badge>
          <StatusBadge status="ok" label="Healthy" pulse />
          <StatusBadge status="warning" label="Degraded" />
          <StatusPulse status="ok" size="sm" />
        </div>

        {/* Stats Bar */}
        <div className={cls('home-stats')}>
          <div className={cls('home-stat')}>
            <span className={cls('home-stat-value')}>
              <AnimatedCounter value={99} />
            </span>
            <span className={cls('home-stat-label')}>Components</span>
          </div>
          <div className={cls('home-stat')}>
            <span className={cls('home-stat-value')}>
              <AnimatedCounter value={75} />
            </span>
            <span className={cls('home-stat-label')}>Lite Tier</span>
          </div>
          <div className={cls('home-stat')}>
            <span className={cls('home-stat-value')}>
              <AnimatedCounter value={14} />
            </span>
            <span className={cls('home-stat-label')}>Premium</span>
          </div>
          <div className={cls('home-stat')}>
            <span className={cls('home-stat-value')}>3</span>
            <span className={cls('home-stat-label')}>Weight Tiers</span>
          </div>
        </div>
      </section>

      {/* ── Section 2: Live Dashboard Preview ── */}
      <section className={cls('home-section')}>
        <div className={cls('home-section-header')}>
          <h2>Built for real interfaces</h2>
          <p>
            Not toy demos. These are production-grade monitoring components
            rendering live data right here on this page.
          </p>
        </div>

        <div className={cls('home-dashboard')}>
          <MetricCard
            title="CPU Usage"
            value="87.4%"
            trend="up"
            status="warning"
            sparkline={[45, 52, 49, 63, 72, 68, 75, 82, 87]}
          />
          <MetricCard
            title="Memory"
            value="62.1%"
            trend="flat"
            status="ok"
            sparkline={[58, 60, 59, 61, 62, 61, 63, 62, 62]}
          />
          <MetricCard
            title="Network I/O"
            value="1,247 req/s"
            trend="up"
            status="ok"
            sparkline={[800, 920, 1050, 1100, 1180, 1200, 1247]}
          />
          <MetricCard
            title="Error Rate"
            value="0.03%"
            trend="down"
            status="ok"
            sparkline={[0.12, 0.08, 0.06, 0.05, 0.04, 0.03]}
          />
        </div>

        <div className={cls('home-dashboard-footer')}>
          <div className={cls('home-dashboard-statuses')}>
            <StatusBadge status="ok" label="API Gateway" pulse />
            <StatusBadge status="ok" label="Database" />
            <StatusBadge status="warning" label="Worker Pool" />
            <StatusPulse status="ok" size="sm" label="All systems operational" />
          </div>
          <div className={cls('home-dashboard-sparkline-wrap')}>
            <span className={cls('home-dashboard-sparkline-label')}>24h throughput</span>
            <Sparkline
              data={[120, 135, 142, 128, 156, 178, 195, 210, 198, 225, 240, 232]}
              width={120}
              height={32}
              gradient
            />
          </div>
        </div>
      </section>

      {/* ── Section 3: Feature Grid ── */}
      <section className={cls('home-section')}>
        <div className={cls('home-section-header')}>
          <h2>What makes this different</h2>
          <p>
            Every feature designed to eliminate the need for additional packages.
          </p>
        </div>

        <div className={cls('home-features')}>
          {features.map((f) => (
            <Card key={f.title} variant="default" padding="md" interactive>
              <div className={cls('home-feature-icon')}>
                <Icon name={f.icon} size="md" />
              </div>
              <div className={cls('home-feature-title')}>{f.title}</div>
              <div className={cls('home-feature-desc')}>{f.desc}</div>
            </Card>
          ))}
        </div>
      </section>

      {/* ── Section 4: Component Categories ── */}
      <section className={cls('home-section')}>
        <div className={cls('home-section-header')}>
          <h2>99 components, 8 categories</h2>
          <p>
            From primitives to domain-specific widgets -- everything you need
            in a single import.
          </p>
        </div>

        <div className={cls('home-categories')}>
          {categories.map((cat) => (
            <Link key={cat.name} to={cat.path} className={cls('home-category')}>
              <span className={cls('home-category-count')}>{cat.count}</span>
              <div>
                <div className={cls('home-category-name')}>{cat.name}</div>
                <div className={cls('home-category-sub')}>{cat.desc}</div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ── Section 5: Component Gallery ── */}
      <section className={cls('home-section')}>
        <div className={cls('home-section-header')}>
          <h2>Component Gallery</h2>
          <p>
            Interactive demo pages for every component. Each one shows all weight tiers,
            sizes, variants, and accessibility features.
          </p>
        </div>

        {galleryGroups.map((group) => (
          <div key={group.label} className={cls('home-gallery-group')}>
            <div className={cls('home-gallery-group-header')}>
              <span className={cls('home-gallery-group-icon')}>
                <Icon name={group.icon} size={14} />
              </span>
              <span className={cls('home-gallery-group-title')}>{group.label}</span>
            </div>
            <div className={cls('home-gallery-grid')}>
              {group.items.map((item) =>
                item.path ? (
                  <Link
                    key={item.name}
                    to={item.path}
                    className={cls('home-gallery-card')}
                  >
                    <div className={cls('home-gallery-card-top')}>
                      <span className={cls('home-gallery-card-name')}>{item.name}</span>
                      <span className={cls('home-gallery-card-tiers')}>
                        {item.tiers.map((t) => (
                          <span key={t} className={cls(`home-gallery-tier home-gallery-tier--${t}`)}>{t}</span>
                        ))}
                      </span>
                    </div>
                    <span className={cls('home-gallery-card-desc')}>{item.desc}</span>
                  </Link>
                ) : (
                  <div
                    key={item.name}
                    className={cls('home-gallery-card home-gallery-card--disabled')}
                  >
                    <div className={cls('home-gallery-card-top')}>
                      <span className={cls('home-gallery-card-name')}>{item.name}</span>
                      <span className={cls('home-gallery-card-tiers')}>
                        {item.tiers.map((t) => (
                          <span key={t} className={cls(`home-gallery-tier home-gallery-tier--${t}`)}>{t}</span>
                        ))}
                      </span>
                    </div>
                    <span className={cls('home-gallery-card-desc')}>{item.desc}</span>
                  </div>
                )
              )}
            </div>
          </div>
        ))}
      </section>

      {/* ── Section 6: Getting Started ── */}
      <section className={cls('home-section')}>
        <div className={cls('home-section-header')}>
          <h2>Getting Started</h2>
          <p>
            Choose the weight tier that fits your project. Lite ships the smallest bundle,
            Premium unlocks every feature.
          </p>
        </div>

        <div className={cls('home-getting-started')}>
          <div className={cls('home-tier-card')}>
            <div className={cls('home-tier-card-header')}>
              <Badge variant="default" size="sm">Lite</Badge>
              <span className={cls('home-tier-card-title')}>75 components</span>
            </div>
            <p className={cls('home-tier-card-desc')}>
              Core primitives, forms, and data display. Minimal bundle for production apps.
            </p>
            <div className={cls('home-tier-card-code')}>
              npm install @annondeveloper/ui-kit
            </div>
          </div>
          <div className={cls('home-tier-card')}>
            <div className={cls('home-tier-card-header')}>
              <Badge variant="primary" size="sm">Standard</Badge>
              <span className={cls('home-tier-card-title')}>89 components</span>
            </div>
            <p className={cls('home-tier-card-desc')}>
              Everything in Lite plus overlays, navigation, advanced forms, and more animations.
            </p>
            <div className={cls('home-tier-card-code')}>
              npm install @annondeveloper/ui-kit
            </div>
          </div>
          <div className={cls('home-tier-card')}>
            <div className={cls('home-tier-card-header')}>
              <Badge variant="primary" size="sm" style={{ background: 'oklch(65% 0.18 310)' }}>Premium</Badge>
              <span className={cls('home-tier-card-title')}>99 components</span>
            </div>
            <p className={cls('home-tier-card-desc')}>
              Full library with monitoring dashboards, AI components, cinematic physics, and domain widgets.
            </p>
            <div className={cls('home-tier-card-code')}>
              npm install @annondeveloper/ui-kit
            </div>
          </div>
        </div>
      </section>

      {/* ── Section 7: Code Example ── */}
      <section className={cls('home-section')}>
        <div className={cls('home-section-header')}>
          <h2>Simple to use</h2>
          <p>Import what you need. Wrap in UIProvider. Ship.</p>
        </div>

        <div className={cls('home-code')}>
          <CopyBlock
            code={codeExample}
            language="typescript"
            showLineNumbers
            title="App.tsx"
          />
        </div>
      </section>

      {/* ── Section 8: Motion Levels ── */}
      <section className={cls('home-section')}>
        <div className={cls('home-section-header')}>
          <h2>4 motion levels</h2>
          <p>
            Users choose their comfort. From zero motion to cinematic springs --
            one prop controls everything.
          </p>
        </div>

        <div className={cls('home-motion-grid')}>
          {motionLevels.map((m) => (
            <Card key={m.level} variant="default" padding="md">
              <div className={cls('home-motion-card')}>
                <Badge variant={m.level === 3 ? 'primary' : 'default'} size="sm">
                  Level {m.level}
                </Badge>
                <span className={cls('home-motion-label')}>{m.label}</span>
                <Button variant="primary" size="sm" motion={m.level}>
                  Click me
                </Button>
                <span className={cls('home-motion-desc')}>{m.desc}</span>
              </div>
            </Card>
          ))}
        </div>
      </section>

      {/* ── Section 9: Footer ── */}
      <footer className={cls('home-footer')}>
        <a href="https://github.com/annondeveloper/ui-kit" target="_blank" rel="noopener noreferrer">
          GitHub
        </a>
        <div className={cls('home-footer-sep')} />
        <a href="https://www.npmjs.com/package/@annondeveloper/ui-kit" target="_blank" rel="noopener noreferrer">
          npm
        </a>
        <div className={cls('home-footer-sep')} />
        <Link to="/docs">Documentation</Link>
        <div className={cls('home-footer-sep')} />
        <Badge variant="default" size="sm">v2.0.1</Badge>
      </footer>
    </div>
  )
}
