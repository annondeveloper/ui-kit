'use client'
import { useState, useCallback, Suspense } from 'react'
import { NavLink, Outlet, useLocation } from 'react-router-dom'
import { UIProvider } from '@ui/components/ui-provider'
import { Drawer } from '@ui/components/drawer'
import { Icon, type IconName } from '@ui/core/icons/icon'
import { Skeleton } from '@ui/components/skeleton'
import { css } from '@ui/core/styles/css-tag'
import { useStyles } from '@ui/core/styles/use-styles'

const pages: { path: string; label: string; icon: IconName }[] = [
  { path: '/', label: 'Home', icon: 'zap' },
  { path: '/core', label: 'Primitives', icon: 'code' },
  { path: '/forms', label: 'Forms', icon: 'edit' },
  { path: '/overlays', label: 'Overlays', icon: 'menu' },
  { path: '/data', label: 'Data', icon: 'bar-chart' },
  { path: '/monitor', label: 'Monitoring', icon: 'activity' },
  { path: '/ai', label: 'AI & Realtime', icon: 'terminal' },
  { path: '/animations', label: 'Animations', icon: 'zap' },
  { path: '/icons', label: 'Icons', icon: 'image' },
  { path: '/themes', label: 'Theme Playground', icon: 'settings' as const },
  { path: '/docs', label: 'Documentation', icon: 'file' },
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
      overflow-x: hidden;
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
    </>
  )
}

function Controls({ motion, setMotion, light, toggleLight }: {
  motion: number; setMotion: (n: number) => void
  light: boolean; toggleLight: () => void
}) {
  return (
    <>
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
  const [drawerOpen, setDrawerOpen] = useState(false)
  const location = useLocation()

  useStyles('site-layout', layoutStyles)
  const toggleLight = useCallback(() => setLight(l => !l), [])
  const closeDrawer = useCallback(() => setDrawerOpen(false), [])

  return (
    <UIProvider motion={motion as 0|1|2|3} mode={light ? 'light' : 'dark'}>
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
            <Controls motion={motion} setMotion={setMotion} light={light} toggleLight={toggleLight} />
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
              <Controls motion={motion} setMotion={setMotion} light={light} toggleLight={() => { toggleLight(); closeDrawer() }} />
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
    </UIProvider>
  )
}
