import { useState } from 'react'
import { NavLink, Outlet } from 'react-router-dom'
import { UIProvider } from '@ui/components/ui-provider'
import { Icon } from '@ui/core/icons/icon'
import { Slider } from '@ui/components/slider'
import { ToggleSwitch } from '@ui/components/toggle-switch'

const categories = [
  { path: '/', label: 'Home', icon: 'zap' as const },
  { path: '/core', label: 'Core', icon: 'code' as const },
  { path: '/forms', label: 'Forms', icon: 'edit' as const },
  { path: '/overlays', label: 'Overlays', icon: 'menu' as const },
  { path: '/data', label: 'Data', icon: 'bar-chart' as const },
  { path: '/monitor', label: 'Monitoring', icon: 'activity' as const },
  { path: '/ai', label: 'AI & Realtime', icon: 'terminal' as const },
]

export default function App() {
  const [light, setLight] = useState(false)
  const [motion, setMotion] = useState(3)
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <UIProvider motion={motion as 0 | 1 | 2 | 3} mode={light ? 'light' : 'dark'}>
      <div style={{ display: 'flex', minHeight: '100dvh' }}>
        {/* Desktop Sidebar */}
        <aside style={{
          width: 240,
          flexShrink: 0,
          borderInlineEnd: '1px solid var(--border-subtle)',
          background: 'var(--bg-surface)',
          position: 'sticky',
          top: 0,
          height: '100dvh',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'auto',
        }}>
          {/* Logo */}
          <div style={{ padding: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{
              width: 32, height: 32, borderRadius: 'var(--radius-md)',
              background: 'var(--brand)', display: 'grid', placeItems: 'center',
            }}>
              <Icon name="zap" size="sm" style={{ color: 'white' }} />
            </div>
            <div>
              <div style={{ fontSize: 'var(--text-sm)', fontWeight: 700, color: 'var(--text-primary)' }}>ui-kit v2</div>
              <div style={{ fontSize: '0.625rem', color: 'var(--text-tertiary)' }}>Aurora Fluid</div>
            </div>
          </div>

          {/* Navigation */}
          <nav style={{ flex: 1, padding: '0 0.75rem' }}>
            {categories.map(c => (
              <NavLink
                key={c.path}
                to={c.path}
                end={c.path === '/'}
                style={({ isActive }) => ({
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.5rem 0.75rem',
                  borderRadius: 'var(--radius-md)',
                  fontSize: 'var(--text-sm)',
                  color: isActive ? 'var(--brand)' : 'var(--text-secondary)',
                  background: isActive ? 'var(--brand-subtle)' : 'transparent',
                  fontWeight: isActive ? 600 : 400,
                  marginBottom: '0.125rem',
                  transition: 'all 0.15s',
                })}
              >
                <Icon name={c.icon} size="sm" />
                {c.label}
              </NavLink>
            ))}
          </nav>

          {/* Controls */}
          <div style={{ padding: '0.75rem', borderBlockStart: '1px solid var(--border-subtle)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
              <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)' }}>Light mode</span>
              <ToggleSwitch
                checked={light}
                onChange={() => setLight(l => !l)}
                size="sm"
              />
            </div>
            <div style={{ marginBottom: '0.5rem' }}>
              <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)' }}>Motion: {motion}</span>
              <Slider
                min={0}
                max={3}
                step={1}
                value={motion}
                onChange={setMotion}
                size="sm"
              />
            </div>
          </div>
        </aside>

        {/* Mobile header */}
        <div style={{
          display: 'none',
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          zIndex: 40,
          alignItems: 'center',
          gap: '0.75rem',
          padding: '0.75rem 1rem',
          background: 'var(--bg-surface)',
          borderBottom: '1px solid var(--border-subtle)',
        }}>
          <button
            onClick={() => setMobileOpen(true)}
            style={{
              padding: '0.375rem',
              borderRadius: 'var(--radius-md)',
              border: 'none',
              background: 'transparent',
              color: 'var(--text-primary)',
              cursor: 'pointer',
            }}
          >
            <Icon name="menu" size="md" />
          </button>
          <span style={{ fontSize: 'var(--text-sm)', fontWeight: 600 }}>ui-kit v2</span>
        </div>

        {/* Mobile overlay */}
        {mobileOpen && (
          <div style={{
            position: 'fixed',
            inset: 0,
            zIndex: 50,
          }}>
            <div
              style={{ position: 'absolute', inset: 0, background: 'oklch(0% 0 0 / 0.5)' }}
              onClick={() => setMobileOpen(false)}
            />
            <div style={{
              position: 'absolute',
              left: 0,
              top: 0,
              bottom: 0,
              width: 260,
              background: 'var(--bg-surface)',
              boxShadow: 'var(--shadow-lg)',
              padding: '1rem',
            }}>
              <nav>
                {categories.map(c => (
                  <NavLink
                    key={c.path}
                    to={c.path}
                    end={c.path === '/'}
                    onClick={() => setMobileOpen(false)}
                    style={({ isActive }) => ({
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      padding: '0.5rem 0.75rem',
                      borderRadius: 'var(--radius-md)',
                      fontSize: 'var(--text-sm)',
                      color: isActive ? 'var(--brand)' : 'var(--text-secondary)',
                      background: isActive ? 'var(--brand-subtle)' : 'transparent',
                      fontWeight: isActive ? 600 : 400,
                      marginBottom: '0.125rem',
                    })}
                  >
                    <Icon name={c.icon} size="sm" />
                    {c.label}
                  </NavLink>
                ))}
              </nav>
            </div>
          </div>
        )}

        {/* Main content */}
        <main style={{ flex: 1, minWidth: 0, padding: '2rem' }}>
          <Outlet />
        </main>
      </div>
    </UIProvider>
  )
}
