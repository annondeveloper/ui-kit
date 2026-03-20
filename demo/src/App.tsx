'use client'

import { useState, useCallback } from 'react'
import { NavLink, Outlet, useLocation } from 'react-router-dom'
import { UIProvider } from '@ui/components/ui-provider'
import { Icon } from '@ui/core/icons/icon'
import { css } from '@ui/core/styles/css-tag'
import { useStyles } from '@ui/core/styles/use-styles'

const categories = [
  { path: '/', label: 'Home', icon: 'zap' as const },
  { path: '/core', label: 'Core', icon: 'code' as const },
  { path: '/forms', label: 'Forms', icon: 'edit' as const },
  { path: '/overlays', label: 'Overlays', icon: 'menu' as const },
  { path: '/data', label: 'Data', icon: 'bar-chart' as const },
  { path: '/monitor', label: 'Monitoring', icon: 'activity' as const },
  { path: '/ai', label: 'AI & Realtime', icon: 'terminal' as const },
  { path: '/docs', label: 'Docs', icon: 'file' as const },
]

const appStyles = css`
  @layer demo {
    .demo-layout {
      display: flex;
      min-height: 100dvh;
    }

    /* Desktop sidebar */
    .demo-sidebar {
      width: 240px;
      flex-shrink: 0;
      border-inline-end: 1px solid var(--border-subtle);
      background: var(--bg-surface);
      position: sticky;
      top: 0;
      height: 100dvh;
      display: flex;
      flex-direction: column;
      overflow-y: auto;
      z-index: 30;
    }

    @media (max-width: 768px) {
      .demo-sidebar {
        display: none;
      }
    }

    /* Mobile header bar */
    .demo-mobile-header {
      display: none;
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      z-index: 40;
      align-items: center;
      gap: 0.75rem;
      padding: 0.75rem 1rem;
      background: var(--bg-surface);
      border-bottom: 1px solid var(--border-subtle);
      backdrop-filter: blur(12px);
    }

    @media (max-width: 768px) {
      .demo-mobile-header {
        display: flex;
      }
    }

    /* Mobile sidebar overlay */
    .demo-mobile-overlay {
      position: fixed;
      inset: 0;
      z-index: 50;
    }

    .demo-mobile-backdrop {
      position: absolute;
      inset: 0;
      background: oklch(0% 0 0 / 0.6);
      backdrop-filter: blur(4px);
    }

    .demo-mobile-drawer {
      position: absolute;
      left: 0;
      top: 0;
      bottom: 0;
      width: 280px;
      background: var(--bg-surface);
      box-shadow: var(--shadow-lg);
      display: flex;
      flex-direction: column;
      overflow-y: auto;
      animation: demo-slide-in 0.2s ease-out;
    }

    @keyframes demo-slide-in {
      from { transform: translateX(-100%); }
      to { transform: translateX(0); }
    }

    /* Main content */
    .demo-main {
      flex: 1;
      min-width: 0;
      padding: 2rem;
    }

    @media (max-width: 768px) {
      .demo-main {
        padding: 1rem;
        padding-top: calc(56px + 1rem);
      }
    }

    /* Sidebar logo */
    .demo-logo {
      padding: 1.25rem;
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }

    .demo-logo-icon {
      width: 32px;
      height: 32px;
      border-radius: var(--radius-md);
      background: var(--brand);
      display: grid;
      place-items: center;
    }

    .demo-logo-text {
      font-size: var(--text-sm);
      font-weight: 700;
      color: var(--text-primary);
    }

    .demo-logo-sub {
      font-size: 0.625rem;
      color: var(--text-tertiary);
    }

    /* Nav links */
    .demo-nav {
      flex: 1;
      padding: 0 0.75rem;
    }

    .demo-nav-link {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.5rem 0.75rem;
      border-radius: var(--radius-md);
      font-size: var(--text-sm);
      color: var(--text-secondary);
      margin-bottom: 0.125rem;
      transition: all 0.15s;
      text-decoration: none;
    }

    .demo-nav-link:hover {
      background: oklch(100% 0 0 / 0.04);
      color: var(--text-primary);
    }

    .demo-nav-link--active {
      color: var(--brand);
      background: var(--brand-subtle);
      font-weight: 600;
    }

    .demo-nav-link--active:hover {
      background: var(--brand-subtle);
      color: var(--brand);
    }

    /* Controls footer */
    .demo-controls {
      padding: 0.75rem;
      border-block-start: 1px solid var(--border-subtle);
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }

    .demo-control-row {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .demo-control-label {
      font-size: var(--text-xs);
      color: var(--text-secondary);
      min-width: 3rem;
    }

    /* Motion level buttons */
    .demo-motion-btn {
      width: 28px;
      height: 28px;
      border-radius: var(--radius-sm);
      border: 1px solid var(--border-default);
      background: transparent;
      color: var(--text-secondary);
      font-size: 0.75rem;
      font-weight: 600;
      cursor: pointer;
      display: grid;
      place-items: center;
      transition: all 0.15s;
    }

    .demo-motion-btn:hover {
      border-color: var(--border-strong);
      background: oklch(100% 0 0 / 0.04);
    }

    .demo-motion-btn--active {
      background: var(--brand);
      color: white;
      border-color: var(--brand);
    }

    .demo-motion-btn--active:hover {
      background: var(--brand);
      border-color: var(--brand);
    }

    /* Theme toggle button */
    .demo-theme-toggle {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
      width: 100%;
      padding: 0.5rem;
      border-radius: var(--radius-md);
      border: 1px solid var(--border-default);
      background: transparent;
      color: var(--text-secondary);
      font-size: var(--text-xs);
      font-weight: 500;
      cursor: pointer;
      transition: all 0.15s;
    }

    .demo-theme-toggle:hover {
      background: oklch(100% 0 0 / 0.04);
      border-color: var(--border-strong);
    }

    /* Close button for mobile drawer */
    .demo-close-btn {
      position: absolute;
      top: 0.75rem;
      right: 0.75rem;
      width: 32px;
      height: 32px;
      border-radius: var(--radius-sm);
      border: none;
      background: transparent;
      color: var(--text-secondary);
      cursor: pointer;
      display: grid;
      place-items: center;
      z-index: 1;
    }

    .demo-close-btn:hover {
      background: oklch(100% 0 0 / 0.06);
    }

    /* Hamburger button */
    .demo-hamburger {
      padding: 0.375rem;
      border-radius: var(--radius-md);
      border: none;
      background: transparent;
      color: var(--text-primary);
      cursor: pointer;
    }

    .demo-hamburger:hover {
      background: oklch(100% 0 0 / 0.06);
    }
  }
`

function SidebarContent({ onNavigate }: { onNavigate?: () => void }) {
  return (
    <>
      <div className="demo-logo">
        <div className="demo-logo-icon">
          <Icon name="zap" size="sm" style={{ color: 'white' }} />
        </div>
        <div>
          <div className="demo-logo-text">ui-kit v2</div>
          <div className="demo-logo-sub">Aurora Fluid</div>
        </div>
      </div>

      <nav className="demo-nav">
        {categories.map(c => (
          <NavLink
            key={c.path}
            to={c.path}
            end={c.path === '/'}
            onClick={onNavigate}
            className={({ isActive }) =>
              `demo-nav-link${isActive ? ' demo-nav-link--active' : ''}`
            }
          >
            <Icon name={c.icon} size="sm" />
            {c.label}
          </NavLink>
        ))}
      </nav>
    </>
  )
}

function SidebarControls({
  motion,
  setMotion,
  light,
  onToggleTheme,
}: {
  motion: number
  setMotion: (m: number) => void
  light: boolean
  onToggleTheme: () => void
}) {
  return (
    <div className="demo-controls">
      <div className="demo-control-row">
        <span className="demo-control-label">Motion</span>
        {[0, 1, 2, 3].map(level => (
          <button
            key={level}
            className={`demo-motion-btn${motion === level ? ' demo-motion-btn--active' : ''}`}
            onClick={() => setMotion(level)}
          >
            {level}
          </button>
        ))}
      </div>
      <button className="demo-theme-toggle" onClick={onToggleTheme}>
        <Icon name={light ? 'eye-off' : 'eye'} size="sm" />
        {light ? 'Dark mode' : 'Light mode'}
      </button>
    </div>
  )
}

export default function App() {
  const [light, setLight] = useState(false)
  const [motion, setMotion] = useState(3)
  const [mobileOpen, setMobileOpen] = useState(false)
  const location = useLocation()

  useStyles('demo-app', appStyles)

  const closeMobile = useCallback(() => setMobileOpen(false), [])
  const toggleTheme = useCallback(() => setLight(l => !l), [])

  return (
    <UIProvider motion={motion as 0 | 1 | 2 | 3} mode={light ? 'light' : 'dark'}>
      <div className="demo-layout">
        {/* Desktop sidebar */}
        <aside className="demo-sidebar">
          <SidebarContent />
          <SidebarControls
            motion={motion}
            setMotion={setMotion}
            light={light}
            onToggleTheme={toggleTheme}
          />
        </aside>

        {/* Mobile header */}
        <div className="demo-mobile-header">
          <button className="demo-hamburger" onClick={() => setMobileOpen(true)}>
            <Icon name="menu" size="md" />
          </button>
          <span style={{ fontSize: 'var(--text-sm)', fontWeight: 600, color: 'var(--text-primary)' }}>
            ui-kit v2
          </span>
          <div style={{ marginInlineStart: 'auto' }}>
            <button className="demo-hamburger" onClick={toggleTheme}>
              <Icon name={light ? 'eye-off' : 'eye'} size="sm" />
            </button>
          </div>
        </div>

        {/* Mobile sidebar overlay */}
        {mobileOpen && (
          <div className="demo-mobile-overlay">
            <div className="demo-mobile-backdrop" onClick={closeMobile} />
            <div className="demo-mobile-drawer">
              <button className="demo-close-btn" onClick={closeMobile}>
                <Icon name="x" size="sm" />
              </button>
              <SidebarContent onNavigate={closeMobile} />
              <SidebarControls
                motion={motion}
                setMotion={setMotion}
                light={light}
                onToggleTheme={() => { toggleTheme(); closeMobile() }}
              />
            </div>
          </div>
        )}

        {/* Main content */}
        <main className="demo-main" key={location.pathname}>
          <Outlet />
        </main>
      </div>
    </UIProvider>
  )
}
