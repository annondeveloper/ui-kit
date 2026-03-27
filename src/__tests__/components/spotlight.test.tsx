import { describe, it, expect, vi, afterEach } from 'vitest'
import { render, screen, cleanup, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { axe, toHaveNoViolations } from 'jest-axe'
import { Spotlight, type SpotlightAction } from '../../components/spotlight'

expect.extend(toHaveNoViolations)

const actions: SpotlightAction[] = [
  { id: '1', title: 'Home', description: 'Go to homepage', onClick: vi.fn(), group: 'Navigation' },
  { id: '2', title: 'Settings', description: 'Open settings', onClick: vi.fn(), group: 'Navigation' },
  { id: '3', title: 'Create Project', onClick: vi.fn(), group: 'Actions', keywords: ['new', 'add'] },
  { id: '4', title: 'Help', onClick: vi.fn() },
]

function resetOnClick() {
  actions.forEach((a) => (a.onClick as ReturnType<typeof vi.fn>).mockClear())
}

describe('Spotlight', () => {
  afterEach(() => {
    cleanup()
    resetOnClick()
  })

  // ─── Rendering ──────────────────────────────────────────────────────

  describe('rendering', () => {
    it('renders nothing when open=false', () => {
      const { container } = render(
        <Spotlight actions={actions} open={false} onOpenChange={() => {}} />
      )
      expect(container.querySelector('.ui-spotlight')).toBeNull()
    })

    it('renders overlay when open=true', () => {
      const { container } = render(
        <Spotlight actions={actions} open={true} onOpenChange={() => {}} />
      )
      expect(container.querySelector('.ui-spotlight__overlay')).toBeInTheDocument()
    })

    it('renders search input', () => {
      render(<Spotlight actions={actions} open onOpenChange={() => {}} />)
      expect(screen.getByRole('combobox')).toBeInTheDocument()
    })

    it('renders with custom placeholder', () => {
      render(
        <Spotlight actions={actions} open onOpenChange={() => {}} placeholder="Find anything..." />
      )
      expect(screen.getByPlaceholderText('Find anything...')).toBeInTheDocument()
    })

    it('renders all action items', () => {
      render(<Spotlight actions={actions} open onOpenChange={() => {}} />)
      expect(screen.getByText('Home')).toBeInTheDocument()
      expect(screen.getByText('Settings')).toBeInTheDocument()
      expect(screen.getByText('Create Project')).toBeInTheDocument()
      expect(screen.getByText('Help')).toBeInTheDocument()
    })

    it('renders action descriptions', () => {
      render(<Spotlight actions={actions} open onOpenChange={() => {}} />)
      expect(screen.getByText('Go to homepage')).toBeInTheDocument()
      expect(screen.getByText('Open settings')).toBeInTheDocument()
    })

    it('renders group headers', () => {
      render(<Spotlight actions={actions} open onOpenChange={() => {}} />)
      expect(screen.getByText('Navigation')).toBeInTheDocument()
      expect(screen.getByText('Actions')).toBeInTheDocument()
    })

    it('forwards className', () => {
      const { container } = render(
        <Spotlight actions={actions} open onOpenChange={() => {}} className="custom" />
      )
      expect(container.querySelector('.ui-spotlight')?.className).toContain('custom')
    })
  })

  // ─── Shortcut badge ───────────────────────────────────────────────

  describe('shortcut badge', () => {
    it('displays shortcut keys', () => {
      const { container } = render(
        <Spotlight actions={actions} open onOpenChange={() => {}} shortcut="meta+k" />
      )
      const kbds = container.querySelectorAll('.ui-spotlight__kbd')
      expect(kbds.length).toBeGreaterThanOrEqual(2)
    })
  })

  // ─── Search/filter ────────────────────────────────────────────────

  describe('search', () => {
    it('filters actions by title', async () => {
      render(<Spotlight actions={actions} open onOpenChange={() => {}} />)
      const input = screen.getByRole('combobox')
      await userEvent.type(input, 'Home')
      expect(screen.getByText('Home')).toBeInTheDocument()
      expect(screen.queryByText('Settings')).not.toBeInTheDocument()
    })

    it('filters by keywords', async () => {
      render(<Spotlight actions={actions} open onOpenChange={() => {}} />)
      const input = screen.getByRole('combobox')
      await userEvent.type(input, 'new')
      expect(screen.getByText('Create Project')).toBeInTheDocument()
    })

    it('shows nothing found message when no results', async () => {
      render(
        <Spotlight
          actions={actions}
          open
          onOpenChange={() => {}}
          nothingFoundMessage="Nothing here"
        />
      )
      const input = screen.getByRole('combobox')
      await userEvent.type(input, 'xyznonexistent')
      expect(screen.getByText('Nothing here')).toBeInTheDocument()
    })

    it('uses custom filter function', async () => {
      const customFilter = vi.fn().mockReturnValue([actions[0]])
      render(
        <Spotlight actions={actions} open onOpenChange={() => {}} filter={customFilter} />
      )
      const input = screen.getByRole('combobox')
      await userEvent.type(input, 'test')
      expect(customFilter).toHaveBeenCalledWith('test', actions)
    })

    it('respects limit prop', async () => {
      render(
        <Spotlight actions={actions} open onOpenChange={() => {}} limit={2} />
      )
      const options = screen.getAllByRole('option')
      expect(options.length).toBeLessThanOrEqual(2)
    })
  })

  // ─── Keyboard navigation ─────────────────────────────────────────

  describe('keyboard navigation', () => {
    it('highlights first item by default', () => {
      render(<Spotlight actions={actions} open onOpenChange={() => {}} />)
      const options = screen.getAllByRole('option')
      expect(options[0]).toHaveAttribute('data-active', '')
    })

    it('moves highlight with ArrowDown', async () => {
      render(<Spotlight actions={actions} open onOpenChange={() => {}} />)
      const input = screen.getByRole('combobox')
      await userEvent.type(input, '{ArrowDown}')
      const options = screen.getAllByRole('option')
      expect(options[1]).toHaveAttribute('data-active', '')
    })

    it('moves highlight with ArrowUp', async () => {
      render(<Spotlight actions={actions} open onOpenChange={() => {}} />)
      const input = screen.getByRole('combobox')
      await userEvent.type(input, '{ArrowDown}{ArrowDown}{ArrowUp}')
      const options = screen.getAllByRole('option')
      expect(options[1]).toHaveAttribute('data-active', '')
    })

    it('selects item on Enter', async () => {
      const onOpenChange = vi.fn()
      render(
        <Spotlight actions={actions} open onOpenChange={onOpenChange} />
      )
      const input = screen.getByRole('combobox')
      await userEvent.type(input, '{Enter}')
      expect(actions[0].onClick).toHaveBeenCalled()
      expect(onOpenChange).toHaveBeenCalledWith(false)
    })

    it('closes on Escape', async () => {
      const onOpenChange = vi.fn()
      render(<Spotlight actions={actions} open onOpenChange={onOpenChange} />)
      const input = screen.getByRole('combobox')
      await userEvent.type(input, '{Escape}')
      expect(onOpenChange).toHaveBeenCalledWith(false)
    })
  })

  // ─── Overlay click ───────────────────────────────────────────────

  describe('overlay', () => {
    it('closes on overlay click', async () => {
      const onOpenChange = vi.fn()
      const { container } = render(
        <Spotlight actions={actions} open onOpenChange={onOpenChange} />
      )
      const overlay = container.querySelector('.ui-spotlight__overlay')!
      // Click directly on overlay (not on dialog)
      fireEvent.click(overlay)
      expect(onOpenChange).toHaveBeenCalledWith(false)
    })
  })

  // ─── Global shortcut ─────────────────────────────────────────────

  describe('global shortcut', () => {
    it('toggles open on Meta+K', () => {
      const onOpenChange = vi.fn()
      render(
        <Spotlight actions={actions} open={false} onOpenChange={onOpenChange} />
      )
      fireEvent.keyDown(document, { key: 'k', metaKey: true })
      expect(onOpenChange).toHaveBeenCalledWith(true)
    })

    it('uses custom shortcut', () => {
      const onOpenChange = vi.fn()
      render(
        <Spotlight actions={actions} open={false} onOpenChange={onOpenChange} shortcut="ctrl+p" />
      )
      fireEvent.keyDown(document, { key: 'p', ctrlKey: true })
      expect(onOpenChange).toHaveBeenCalledWith(true)
    })
  })

  // ─── Action selection ─────────────────────────────────────────────

  describe('action selection', () => {
    it('calls onClick when action is clicked', async () => {
      const onOpenChange = vi.fn()
      render(
        <Spotlight actions={actions} open onOpenChange={onOpenChange} />
      )
      const options = screen.getAllByRole('option')
      const helpOption = options[options.length - 1]
      await userEvent.click(helpOption)
      expect(actions[3].onClick).toHaveBeenCalled()
      expect(onOpenChange).toHaveBeenCalledWith(false)
    })

    it('highlights item on mouse enter', async () => {
      render(<Spotlight actions={actions} open onOpenChange={() => {}} />)
      const options = screen.getAllByRole('option')
      const helpOption = options[options.length - 1] // Help is last
      fireEvent.mouseEnter(helpOption)
      expect(helpOption).toHaveAttribute('data-active', '')
    })
  })

  // ─── ARIA ─────────────────────────────────────────────────────────

  describe('aria', () => {
    it('has dialog role with aria-modal', () => {
      render(<Spotlight actions={actions} open onOpenChange={() => {}} />)
      const dialog = screen.getByRole('dialog')
      expect(dialog).toHaveAttribute('aria-modal', 'true')
    })

    it('has aria-label on dialog', () => {
      render(<Spotlight actions={actions} open onOpenChange={() => {}} />)
      const dialog = screen.getByRole('dialog')
      expect(dialog).toHaveAttribute('aria-label', 'Spotlight search')
    })

    it('combobox has aria-expanded', () => {
      render(<Spotlight actions={actions} open onOpenChange={() => {}} />)
      expect(screen.getByRole('combobox')).toHaveAttribute('aria-expanded', 'true')
    })

    it('combobox has aria-controls pointing to listbox', () => {
      render(<Spotlight actions={actions} open onOpenChange={() => {}} />)
      const combobox = screen.getByRole('combobox')
      const listbox = screen.getByRole('listbox')
      expect(combobox.getAttribute('aria-controls')).toBe(listbox.id)
    })

    it('combobox has aria-activedescendant', () => {
      render(<Spotlight actions={actions} open onOpenChange={() => {}} />)
      const combobox = screen.getByRole('combobox')
      expect(combobox.getAttribute('aria-activedescendant')).toBeTruthy()
    })
  })

  // ─── Accessibility ────────────────────────────────────────────────

  describe('accessibility', () => {
    it('has no axe violations', async () => {
      const { container } = render(
        <Spotlight actions={actions} open onOpenChange={() => {}} />
      )
      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })
  })

  // ─── Style injection ─────────────────────────────────────────────

  describe('style injection', () => {
    it('injects CSS on mount', () => {
      render(<Spotlight actions={actions} open onOpenChange={() => {}} />)
      const styleTags = document.querySelectorAll('style[data-ui-style]')
      expect(styleTags.length).toBeGreaterThan(0)
    })

    it('CSS includes @scope (.ui-spotlight)', () => {
      render(<Spotlight actions={actions} open onOpenChange={() => {}} />)
      const styleTags = document.querySelectorAll('style[data-ui-style]')
      const allCSS = Array.from(styleTags).map((s) => s.textContent).join('')
      expect(allCSS).toContain('@scope (.ui-spotlight)')
    })
  })

  // ─── Display name ────────────────────────────────────────────────

  describe('display name', () => {
    it('has displayName set to "Spotlight"', () => {
      expect(Spotlight.displayName).toBe('Spotlight')
    })
  })
})
