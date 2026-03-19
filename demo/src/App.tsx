import { useState, useCallback } from 'react'
import { Outlet, NavLink, useLocation } from 'react-router-dom'
import { Sun, Moon, Menu, X, Copy, Check, Package } from 'lucide-react'

const categories = [
  { path: '/',            label: 'Home',        emoji: '\u{1F3E0}', count: 0 },
  { path: '/ai',          label: 'AI & Realtime', emoji: '\u{1F916}', count: 8 },
  { path: '/monitor',     label: 'Monitoring',  emoji: '\u{1F4CA}', count: 13 },
  { path: '/data',        label: 'Smart Data',  emoji: '\u{1F9E0}', count: 8 },
  { path: '/interactive', label: 'Interactive',  emoji: '\u{1F579}', count: 9 },
  { path: '/core',        label: 'Core',        emoji: '\u{1F9F1}', count: 11 },
  { path: '/forms',       label: 'Forms',       emoji: '\u{270D}',  count: 9 },
  { path: '/layout',      label: 'Layout',      emoji: '\u{1F4D0}', count: 6 },
]

function Sidebar({ onClose }: { onClose?: () => void }) {
  const [light, setLight] = useState(false)
  const [copied, setCopied] = useState(false)

  const toggleTheme = useCallback(() => {
    setLight(p => {
      document.documentElement.classList.toggle('light', !p)
      return !p
    })
  }, [])

  const handleCopy = useCallback(() => {
    void navigator.clipboard.writeText('npm install @annondeveloper/ui-kit').then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }, [])

  return (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="p-5 flex items-center gap-2.5">
        <div className="size-8 rounded-xl bg-[hsl(var(--brand-primary))] flex items-center justify-center">
          <Package className="size-4 text-white" />
        </div>
        <div>
          <div className="text-sm font-semibold text-[hsl(var(--text-primary))]">ui-kit</div>
          <div className="text-[10px] text-[hsl(var(--text-tertiary))]">@annondeveloper</div>
        </div>
        {onClose && (
          <button onClick={onClose} className="ml-auto p-1 rounded-lg hover:bg-[hsl(var(--bg-elevated))] cursor-pointer">
            <X className="size-4 text-[hsl(var(--text-secondary))]" />
          </button>
        )}
      </div>

      {/* Nav links */}
      <nav className="flex-1 px-3 space-y-0.5 overflow-y-auto">
        {categories.map(c => (
          <NavLink
            key={c.path}
            to={c.path}
            end={c.path === '/'}
            onClick={onClose}
            className={({ isActive }) =>
              `flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors ${
                isActive
                  ? 'bg-[hsl(var(--brand-primary))]/10 text-[hsl(var(--brand-primary))] font-medium'
                  : 'text-[hsl(var(--text-secondary))] hover:bg-[hsl(var(--bg-elevated))] hover:text-[hsl(var(--text-primary))]'
              }`
            }
          >
            <span className="text-base">{c.emoji}</span>
            <span className="flex-1">{c.label}</span>
            {c.count > 0 && (
              <span className="text-[10px] tabular-nums px-1.5 py-0.5 rounded-full bg-[hsl(var(--bg-overlay))] text-[hsl(var(--text-tertiary))]">
                {c.count}
              </span>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Bottom controls */}
      <div className="p-3 border-t border-[hsl(var(--border-subtle))] space-y-2">
        <button
          onClick={handleCopy}
          className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-mono bg-[hsl(var(--bg-base))] border border-[hsl(var(--border-subtle))] text-[hsl(var(--text-secondary))] hover:border-[hsl(var(--border-default))] transition-colors cursor-pointer"
        >
          <span className="flex-1 text-left truncate">npm i @annondeveloper/ui-kit</span>
          {copied ? <Check className="size-3 text-[hsl(var(--status-ok))]" /> : <Copy className="size-3" />}
        </button>
        <button
          onClick={toggleTheme}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-xs font-medium text-[hsl(var(--text-secondary))] hover:bg-[hsl(var(--bg-elevated))] transition-colors cursor-pointer"
        >
          {light ? <Moon className="size-3.5" /> : <Sun className="size-3.5" />}
          {light ? 'Dark mode' : 'Light mode'}
        </button>
      </div>
    </div>
  )
}

export default function App() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const location = useLocation()

  return (
    <div className="flex min-h-screen">
      {/* Desktop sidebar */}
      <aside className="hidden md:block w-[220px] shrink-0 border-r border-[hsl(var(--border-subtle))] bg-[hsl(var(--bg-surface))] sticky top-0 h-screen overflow-y-auto">
        <Sidebar />
      </aside>

      {/* Mobile header */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-40 flex items-center gap-3 px-4 py-3 bg-[hsl(var(--bg-surface))]/80 backdrop-blur-lg border-b border-[hsl(var(--border-subtle))]">
        <button
          onClick={() => setMobileOpen(true)}
          className="p-1.5 rounded-lg hover:bg-[hsl(var(--bg-elevated))] cursor-pointer"
        >
          <Menu className="size-5 text-[hsl(var(--text-primary))]" />
        </button>
        <span className="text-sm font-semibold text-[hsl(var(--text-primary))]">ui-kit</span>
      </div>

      {/* Mobile sidebar overlay */}
      {mobileOpen && (
        <div className="md:hidden fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black/50" onClick={() => setMobileOpen(false)} />
          <div className="absolute left-0 top-0 bottom-0 w-[260px] bg-[hsl(var(--bg-surface))] shadow-2xl">
            <Sidebar onClose={() => setMobileOpen(false)} />
          </div>
        </div>
      )}

      {/* Main content */}
      <main className="flex-1 min-w-0 md:pb-0 pb-4 pt-14 md:pt-0" key={location.pathname}>
        <Outlet />
      </main>
    </div>
  )
}
