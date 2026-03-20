'use client'

import { useState, useCallback } from 'react'
import { NavLink, Outlet, useLocation } from 'react-router-dom'
import { UIProvider } from '@ui/components/ui-provider'
import { AppShell } from '@ui/components/app-shell'
import { Sidebar, SidebarHeader, SidebarContent, SidebarFooter, SidebarItem } from '@ui/components/sidebar'
import { Navbar } from '@ui/components/navbar'
import { Drawer } from '@ui/components/drawer'
import { Icon } from '@ui/core/icons/icon'
import { css } from '@ui/core/styles/css-tag'
import { useStyles } from '@ui/core/styles/use-styles'

// ─── Navigation categories ───────────────────────────────────────────────────

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

// ─── Minimal demo-specific styles (layout is handled by components) ──────────

const appStyles = css`
  @layer demo {
    /* Logo block */
    .demo-logo {
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
      flex-shrink: 0;
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

    /* Controls */
    .demo-controls {
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

    /* Icon button (navbar actions) */
    .demo-icon-btn {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      padding: 0.375rem;
      border-radius: var(--radius-md);
      border: none;
      background: transparent;
      color: var(--text-primary);
      cursor: pointer;
    }

    .demo-icon-btn:hover {
      background: oklch(100% 0 0 / 0.06);
    }

    /* Main content area */
    .demo-main {
      padding: 2rem;
    }

    @media (max-width: 768px) {
      .demo-main {
        padding: 1rem;
      }
    }

    /* Drawer nav links */
    .demo-drawer-nav {
      display: flex;
      flex-direction: column;
      gap: 0.125rem;
      padding: 0.75rem 0;
    }

    .demo-drawer-link {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.5rem 0.75rem;
      border-radius: var(--radius-md);
      font-size: var(--text-sm);
      color: var(--text-secondary);
      text-decoration: none;
      transition: all 0.15s;
    }

    .demo-drawer-link:hover {
      background: oklch(100% 0 0 / 0.04);
      color: var(--text-primary);
    }

    .demo-drawer-link--active {
      color: var(--brand);
      background: var(--brand-subtle);
      font-weight: 600;
    }
  }
`

// ─── Shared sub-components ───────────────────────────────────────────────────

function Logo() {
  return (
    <div className="demo-logo">
      <div className="demo-logo-icon">
        <Icon name="zap" size="sm" style={{ color: 'white' }} />
      </div>
      <div>
        <div className="demo-logo-text">ui-kit v2</div>
        <div className="demo-logo-sub">Aurora Fluid</div>
      </div>
    </div>
  )
}

function DemoControls({
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

// ─── App ─────────────────────────────────────────────────────────────────────

export default function App() {
  const [light, setLight] = useState(false)
  const [motion, setMotion] = useState(3)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const location = useLocation()

  useStyles('demo-app', appStyles)

  const toggleTheme = useCallback(() => setLight(l => !l), [])
  const closeDrawer = useCallback(() => setDrawerOpen(false), [])

  // ── Sidebar (desktop — hidden at <=768px by AppShell) ──
  const sidebar = (
    <Sidebar
      collapsed={sidebarCollapsed}
      onCollapse={setSidebarCollapsed}
    >
      <SidebarHeader>
        <Logo />
      </SidebarHeader>

      <SidebarContent>
        {categories.map(c => (
          <NavLink key={c.path} to={c.path} end={c.path === '/'} style={{ textDecoration: 'none' }}>
            {({ isActive }) => (
              <SidebarItem
                icon={<Icon name={c.icon} size="sm" />}
                label={c.label}
                active={isActive}
              />
            )}
          </NavLink>
        ))}
      </SidebarContent>

      <SidebarFooter>
        <DemoControls
          motion={motion}
          setMotion={setMotion}
          light={light}
          onToggleTheme={toggleTheme}
        />
      </SidebarFooter>
    </Sidebar>
  )

  // ── Navbar (visible at all sizes; hamburger opens Drawer on mobile) ──
  const navbar = (
    <Navbar
      bordered
      sticky
      logo={<Logo />}
      actions={
        <>
          <button
            className="demo-icon-btn"
            onClick={toggleTheme}
            aria-label="Toggle theme"
          >
            <Icon name={light ? 'eye-off' : 'eye'} size="sm" />
          </button>
          <button
            className="demo-icon-btn"
            onClick={() => setDrawerOpen(true)}
            aria-label="Open navigation"
          >
            <Icon name="menu" size="md" />
          </button>
        </>
      }
    />
  )

  return (
    <UIProvider motion={motion as 0 | 1 | 2 | 3} mode={light ? 'light' : 'dark'}>
      <AppShell
        navbar={navbar}
        sidebar={sidebar}
        sidebarCollapsed={sidebarCollapsed}
      >
        {/* Mobile drawer — sidebar content as overlay */}
        <Drawer open={drawerOpen} onClose={closeDrawer} side="left" size="sm">
          <Logo />
          <nav className="demo-drawer-nav">
            {categories.map(c => (
              <NavLink
                key={c.path}
                to={c.path}
                end={c.path === '/'}
                onClick={closeDrawer}
                className={({ isActive }) =>
                  `demo-drawer-link${isActive ? ' demo-drawer-link--active' : ''}`
                }
              >
                <Icon name={c.icon} size="sm" />
                {c.label}
              </NavLink>
            ))}
          </nav>
          <div style={{ marginBlockStart: 'auto', paddingBlockStart: '1rem' }}>
            <DemoControls
              motion={motion}
              setMotion={setMotion}
              light={light}
              onToggleTheme={() => { toggleTheme(); closeDrawer() }}
            />
          </div>
        </Drawer>

        {/* Main content */}
        <main className="demo-main" key={location.pathname}>
          <Outlet />
        </main>
      </AppShell>
    </UIProvider>
  )
}
