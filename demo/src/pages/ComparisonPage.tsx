'use client'

import { useState, useMemo, lazy, Suspense } from 'react'
import { css } from '@ui/core/styles/css-tag'
import { useStyles } from '@ui/core/styles/use-styles'

// ─── Component Registry ────────────────────────────────────────────────────────

interface ComponentDef {
  name: string
  slug: string
  hasLite: boolean
  hasPremium: boolean
  approxSize: string
}

const components: ComponentDef[] = [
  { name: 'Accordion', slug: 'accordion', hasLite: true, hasPremium: true, approxSize: '2.1 KB' },
  { name: 'ActionIcon', slug: 'action-icon', hasLite: true, hasPremium: true, approxSize: '1.2 KB' },
  { name: 'Affix', slug: 'affix', hasLite: true, hasPremium: true, approxSize: '0.9 KB' },
  { name: 'Alert', slug: 'alert', hasLite: true, hasPremium: true, approxSize: '1.8 KB' },
  { name: 'AnimatedCounter', slug: 'animated-counter', hasLite: true, hasPremium: true, approxSize: '1.5 KB' },
  { name: 'AppShell', slug: 'app-shell', hasLite: true, hasPremium: true, approxSize: '3.2 KB' },
  { name: 'Avatar', slug: 'avatar', hasLite: true, hasPremium: true, approxSize: '1.4 KB' },
  { name: 'AvatarUpload', slug: 'avatar-upload', hasLite: true, hasPremium: true, approxSize: '2.5 KB' },
  { name: 'BackToTop', slug: 'back-to-top', hasLite: true, hasPremium: true, approxSize: '0.8 KB' },
  { name: 'Badge', slug: 'badge', hasLite: true, hasPremium: true, approxSize: '0.9 KB' },
  { name: 'Breadcrumbs', slug: 'breadcrumbs', hasLite: true, hasPremium: true, approxSize: '1.3 KB' },
  { name: 'Button', slug: 'button', hasLite: true, hasPremium: true, approxSize: '1.6 KB' },
  { name: 'ButtonGroup', slug: 'button-group', hasLite: true, hasPremium: true, approxSize: '1.0 KB' },
  { name: 'Calendar', slug: 'calendar', hasLite: true, hasPremium: true, approxSize: '4.2 KB' },
  { name: 'Card', slug: 'card', hasLite: true, hasPremium: true, approxSize: '1.1 KB' },
  { name: 'Carousel', slug: 'carousel', hasLite: true, hasPremium: true, approxSize: '3.0 KB' },
  { name: 'Checkbox', slug: 'checkbox', hasLite: true, hasPremium: true, approxSize: '1.2 KB' },
  { name: 'Chip', slug: 'chip', hasLite: true, hasPremium: true, approxSize: '1.0 KB' },
  { name: 'ColorInput', slug: 'color-input', hasLite: true, hasPremium: true, approxSize: '2.1 KB' },
  { name: 'ComboBox', slug: 'combobox', hasLite: true, hasPremium: true, approxSize: '3.5 KB' },
  { name: 'CommandBar', slug: 'command-bar', hasLite: true, hasPremium: true, approxSize: '4.0 KB' },
  { name: 'ConfirmDialog', slug: 'confirm-dialog', hasLite: true, hasPremium: true, approxSize: '2.0 KB' },
  { name: 'CopyButton', slug: 'copy-button', hasLite: true, hasPremium: true, approxSize: '0.8 KB' },
  { name: 'DataTable', slug: 'data-table', hasLite: true, hasPremium: true, approxSize: '5.5 KB' },
  { name: 'DatePicker', slug: 'date-picker', hasLite: true, hasPremium: true, approxSize: '4.5 KB' },
  { name: 'Dialog', slug: 'dialog', hasLite: true, hasPremium: true, approxSize: '2.2 KB' },
  { name: 'Divider', slug: 'divider', hasLite: true, hasPremium: true, approxSize: '0.5 KB' },
  { name: 'Drawer', slug: 'drawer', hasLite: true, hasPremium: true, approxSize: '2.4 KB' },
  { name: 'DropdownMenu', slug: 'dropdown-menu', hasLite: true, hasPremium: true, approxSize: '2.8 KB' },
  { name: 'EmptyState', slug: 'empty-state', hasLite: true, hasPremium: true, approxSize: '1.3 KB' },
  { name: 'FormInput', slug: 'form-input', hasLite: true, hasPremium: true, approxSize: '1.5 KB' },
  { name: 'Indicator', slug: 'indicator', hasLite: true, hasPremium: true, approxSize: '0.7 KB' },
  { name: 'MetricCard', slug: 'metric-card', hasLite: true, hasPremium: true, approxSize: '3.8 KB' },
  { name: 'Pagination', slug: 'pagination', hasLite: true, hasPremium: true, approxSize: '2.0 KB' },
  { name: 'Popover', slug: 'popover', hasLite: true, hasPremium: true, approxSize: '2.5 KB' },
  { name: 'Progress', slug: 'progress', hasLite: true, hasPremium: true, approxSize: '1.0 KB' },
  { name: 'RadioGroup', slug: 'radio-group', hasLite: true, hasPremium: true, approxSize: '1.4 KB' },
  { name: 'Rating', slug: 'rating', hasLite: true, hasPremium: true, approxSize: '1.6 KB' },
  { name: 'SearchInput', slug: 'search-input', hasLite: true, hasPremium: true, approxSize: '1.8 KB' },
  { name: 'SegmentedControl', slug: 'segmented-control', hasLite: true, hasPremium: true, approxSize: '2.0 KB' },
  { name: 'Select', slug: 'select', hasLite: true, hasPremium: true, approxSize: '2.3 KB' },
  { name: 'Skeleton', slug: 'skeleton', hasLite: true, hasPremium: true, approxSize: '0.6 KB' },
  { name: 'Slider', slug: 'slider', hasLite: true, hasPremium: true, approxSize: '2.0 KB' },
  { name: 'Sparkline', slug: 'sparkline', hasLite: true, hasPremium: true, approxSize: '1.8 KB' },
  { name: 'StatusBadge', slug: 'status-badge', hasLite: true, hasPremium: true, approxSize: '1.0 KB' },
  { name: 'Tabs', slug: 'tabs', hasLite: true, hasPremium: true, approxSize: '2.2 KB' },
  { name: 'Toast', slug: 'toast', hasLite: true, hasPremium: true, approxSize: '2.5 KB' },
  { name: 'ToggleSwitch', slug: 'toggle-switch', hasLite: true, hasPremium: true, approxSize: '1.1 KB' },
  { name: 'Tooltip', slug: 'tooltip', hasLite: true, hasPremium: true, approxSize: '1.5 KB' },
  { name: 'Typography', slug: 'typography', hasLite: true, hasPremium: true, approxSize: '0.8 KB' },
]

// ─── Dynamic Import Map ────────────────────────────────────────────────────────

type PreviewModule = { default: React.ComponentType }

function loadPreview(slug: string, tier: 'lite' | 'standard' | 'premium'): React.LazyExoticComponent<React.ComponentType> {
  return lazy(() => import(`./comparison-previews/${slug}-${tier}.tsx`).catch(() => ({
    default: () => <div className="comp__unavailable">Preview not available</div>,
  })) as Promise<PreviewModule>)
}

// ─── Fallback Preview ──────────────────────────────────────────────────────────

function FallbackPreview({ name, tier }: { name: string; tier: string }) {
  return (
    <div className="comp__placeholder">
      <div className="comp__placeholder-name">{name}</div>
      <div className="comp__placeholder-tier">{tier} tier</div>
      <div className="comp__placeholder-hint">
        Select a component to preview all 3 tiers side by side.
      </div>
    </div>
  )
}

// ─── Styles ────────────────────────────────────────────────────────────────────

const styles = css`
  @layer demo {
    .comp {
      max-width: 1400px;
      margin: 0 auto;
    }

    .comp__header {
      margin-block-end: 2rem;
    }

    .comp__title {
      font-size: var(--text-2xl, 1.875rem);
      font-weight: 800;
      letter-spacing: -0.02em;
      margin-block-end: 0.25rem;
      text-wrap: balance;
    }

    .comp__subtitle {
      font-size: var(--text-sm, 0.875rem);
      color: var(--text-secondary);
    }

    /* ── Selector ──────────────────────────────────── */

    .comp__selector {
      margin-block-end: 2rem;
    }

    .comp__select {
      width: 100%;
      max-width: 400px;
      padding: 0.625rem 1rem;
      background: var(--bg-surface);
      border: 1px solid var(--border-default);
      border-radius: var(--radius-md, 0.5rem);
      color: var(--text-primary);
      font-size: var(--text-sm, 0.875rem);
      font-family: inherit;
      cursor: pointer;
      outline: none;
      transition: border-color 0.15s;
    }

    .comp__select:focus {
      border-color: var(--brand);
    }

    .comp__select option {
      background: var(--bg-base);
      color: var(--text-primary);
    }

    /* ── Grid ──────────────────────────────────────── */

    .comp__grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 1.5rem;
    }

    @media (max-width: 900px) {
      .comp__grid {
        grid-template-columns: 1fr;
      }
    }

    /* ── Column ────────────────────────────────────── */

    .comp__col {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .comp__col-header {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding-block-end: 0.75rem;
      border-block-end: 1px solid var(--border-default);
    }

    .comp__col-label {
      font-size: var(--text-sm, 0.875rem);
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }

    .comp__col-label--lite {
      color: var(--status-ok);
    }

    .comp__col-label--standard {
      color: var(--brand-light);
    }

    .comp__col-label--premium {
      color: var(--aurora-1);
    }

    .comp__col-dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
    }

    .comp__col-dot--lite { background: var(--status-ok); }
    .comp__col-dot--standard { background: var(--brand-light); }
    .comp__col-dot--premium { background: var(--aurora-1); }

    /* ── Preview card ──────────────────────────────── */

    .comp__preview {
      background: var(--bg-elevated);
      border: 1px solid var(--border-default);
      border-radius: var(--radius-lg, 0.75rem);
      padding: 1.5rem;
      min-height: 120px;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    /* ── Import block ──────────────────────────────── */

    .comp__import {
      background: var(--bg-surface);
      border: 1px solid var(--border-subtle);
      border-radius: var(--radius-sm, 0.375rem);
      padding: 0.625rem 0.75rem;
      font-family: 'SF Mono', 'Cascadia Code', 'Fira Code', monospace;
      font-size: var(--text-xs, 0.75rem);
      color: var(--text-secondary);
      overflow-x: auto;
      white-space: nowrap;
    }

    .comp__size {
      font-size: var(--text-xs, 0.75rem);
      color: var(--text-tertiary);
      text-align: end;
    }

    /* ── Placeholder ───────────────────────────────── */

    .comp__placeholder {
      text-align: center;
      padding: 2rem 1rem;
    }

    .comp__placeholder-name {
      font-size: var(--text-lg, 1.125rem);
      font-weight: 700;
      color: var(--text-primary);
    }

    .comp__placeholder-tier {
      font-size: var(--text-xs, 0.75rem);
      color: var(--text-tertiary);
      text-transform: uppercase;
      letter-spacing: 0.05em;
      margin-block-start: 0.25rem;
    }

    .comp__placeholder-hint {
      font-size: var(--text-sm, 0.875rem);
      color: var(--text-secondary);
      margin-block-start: 1rem;
      max-width: 20rem;
      margin-inline: auto;
      line-height: 1.5;
    }

    .comp__unavailable {
      font-size: var(--text-sm, 0.875rem);
      color: var(--text-tertiary);
      font-style: italic;
    }

    /* ── Info row ───────────────────────────────────── */

    .comp__info {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
      margin-block-start: 2rem;
      padding: 1.5rem;
      background: var(--bg-elevated);
      border: 1px solid var(--border-default);
      border-radius: var(--radius-lg, 0.75rem);
    }

    .comp__info-title {
      font-size: var(--text-sm, 0.875rem);
      font-weight: 700;
      color: var(--text-primary);
    }

    .comp__info-text {
      font-size: var(--text-sm, 0.875rem);
      color: var(--text-secondary);
      line-height: 1.6;
    }

    .comp__info-list {
      list-style: none;
      padding: 0;
      margin: 0;
      display: flex;
      flex-direction: column;
      gap: 0.375rem;
    }

    .comp__info-list li {
      font-size: var(--text-sm, 0.875rem);
      color: var(--text-secondary);
      padding-inline-start: 1rem;
      position: relative;
    }

    .comp__info-list li::before {
      content: '';
      position: absolute;
      inset-inline-start: 0;
      top: 0.5em;
      width: 6px;
      height: 6px;
      border-radius: 50%;
      background: var(--brand);
    }
  }
`

// ─── Page Component ────────────────────────────────────────────────────────────

export default function ComparisonPage() {
  useStyles('comparison-page', styles)
  const [selected, setSelected] = useState<string>('')

  const selectedComponent = useMemo(
    () => components.find(c => c.slug === selected),
    [selected]
  )

  return (
    <div className="comp">
      <header className="comp__header">
        <h1 className="comp__title">Tier Comparison</h1>
        <p className="comp__subtitle">
          Compare Lite, Standard, and Premium tiers side by side. Each tier offers different features, animations, and bundle sizes.
        </p>
      </header>

      {/* Component selector */}
      <div className="comp__selector">
        <select
          className="comp__select"
          value={selected}
          onChange={(e) => setSelected(e.target.value)}
          aria-label="Select a component to compare"
        >
          <option value="">Select a component...</option>
          {components.map(c => (
            <option key={c.slug} value={c.slug}>{c.name}</option>
          ))}
        </select>
      </div>

      {/* 3-column comparison grid */}
      <div className="comp__grid">
        {(['lite', 'standard', 'premium'] as const).map(tier => (
          <div key={tier} className="comp__col">
            <div className="comp__col-header">
              <span className={`comp__col-dot comp__col-dot--${tier}`} />
              <span className={`comp__col-label comp__col-label--${tier}`}>
                {tier}
              </span>
            </div>

            <div className="comp__preview">
              {selectedComponent ? (
                <Suspense fallback={<div className="comp__unavailable">Loading...</div>}>
                  <FallbackPreview name={selectedComponent.name} tier={tier} />
                </Suspense>
              ) : (
                <FallbackPreview name="Component" tier={tier} />
              )}
            </div>

            {selectedComponent && (
              <>
                <div className="comp__import">
                  {tier === 'standard'
                    ? `import { ${selectedComponent.name} } from '@annondeveloper/ui-kit'`
                    : `import { ${selectedComponent.name} } from '@annondeveloper/ui-kit/${tier}'`
                  }
                </div>
                <div className="comp__size">
                  ~{selectedComponent.approxSize} gzip
                  {tier === 'lite' && ' (minimal)'}
                  {tier === 'premium' && ' (with effects)'}
                </div>
              </>
            )}
          </div>
        ))}
      </div>

      {/* Info section */}
      <div className="comp__info">
        <div className="comp__info-title">About Weight Tiers</div>
        <p className="comp__info-text">
          Every component in ui-kit ships in 3 weight tiers so you can optimize your bundle for your use case:
        </p>
        <ul className="comp__info-list">
          <li><strong>Lite</strong> -- Minimal wrappers with no animations or effects. Ideal for server-rendered pages, emails, or bundle-critical apps. Each component is ~20-30 lines.</li>
          <li><strong>Standard</strong> -- Full-featured components with CSS transitions and complete interactivity. The default tier.</li>
          <li><strong>Premium</strong> -- Aurora glow effects, spring-based physics animations, shimmer overlays, and cinematic motion. For apps where visual polish is paramount.</li>
        </ul>
      </div>
    </div>
  )
}
