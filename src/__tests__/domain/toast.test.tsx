import { describe, it, expect, vi, afterEach, beforeEach } from 'vitest'
import { render, screen, cleanup, fireEvent, act, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { axe, toHaveNoViolations } from 'jest-axe'
import { ToastProvider, useToast } from '../../domain/toast'
import { useRef, useEffect } from 'react'

expect.extend(toHaveNoViolations)

// Helper to create a test component that exposes the toast API
function TestApp({
  onApi,
  position,
  maxVisible,
  motion,
}: {
  onApi?: (api: ReturnType<typeof useToast>) => void
  position?: 'top-right' | 'top-center' | 'bottom-right' | 'bottom-center'
  maxVisible?: number
  motion?: 0 | 1 | 2 | 3
}) {
  return (
    <ToastProvider position={position} maxVisible={maxVisible} motion={motion}>
      <Inner onApi={onApi} />
    </ToastProvider>
  )
}

function Inner({ onApi }: { onApi?: (api: ReturnType<typeof useToast>) => void }) {
  const api = useToast()
  const called = useRef(false)
  useEffect(() => {
    if (!called.current) {
      called.current = true
      onApi?.(api)
    }
  }, [api, onApi])
  return <div data-testid="inner">content</div>
}

describe('Toast', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    cleanup()
    vi.useRealTimers()
  })

  // ─── Rendering ──────────────────────────────────────────────────────

  describe('rendering', () => {
    it('renders the ToastProvider with children', () => {
      render(<TestApp />)
      expect(screen.getByTestId('inner')).toBeInTheDocument()
    })

    it('renders the toast container with ui-toast-container class', () => {
      const { container } = render(<TestApp />)
      expect(container.querySelector('.ui-toast-container')).toBeInTheDocument()
    })

    it('shows a toast when toast() is called', () => {
      let api: ReturnType<typeof useToast>
      render(<TestApp onApi={(a) => { api = a }} />)
      act(() => { api.toast({ title: 'Hello World' }) })
      expect(screen.getByText('Hello World')).toBeInTheDocument()
    })

    it('renders title and description', () => {
      let api: ReturnType<typeof useToast>
      render(<TestApp onApi={(a) => { api = a }} />)
      act(() => { api.toast({ title: 'Title', description: 'Description text' }) })
      expect(screen.getByText('Title')).toBeInTheDocument()
      expect(screen.getByText('Description text')).toBeInTheDocument()
    })

    it('returns a unique toast ID', () => {
      let api: ReturnType<typeof useToast>
      render(<TestApp onApi={(a) => { api = a }} />)
      let id1: string, id2: string
      act(() => { id1 = api.toast({ title: 'One' }) })
      act(() => { id2 = api.toast({ title: 'Two' }) })
      expect(id1!).toBeTruthy()
      expect(id2!).toBeTruthy()
      expect(id1!).not.toBe(id2!)
    })
  })

  // ─── Auto-dismiss ─────────────────────────────────────────────────

  describe('auto-dismiss', () => {
    it('auto-dismisses after default duration (5000ms)', () => {
      let api: ReturnType<typeof useToast>
      render(<TestApp onApi={(a) => { api = a }} />)
      act(() => { api.toast({ title: 'Temporary' }) })
      expect(screen.getByText('Temporary')).toBeInTheDocument()
      act(() => { vi.advanceTimersByTime(5000) })
      expect(screen.queryByText('Temporary')).not.toBeInTheDocument()
    })

    it('auto-dismisses after custom duration', () => {
      let api: ReturnType<typeof useToast>
      render(<TestApp onApi={(a) => { api = a }} />)
      act(() => { api.toast({ title: 'Quick', duration: 2000 }) })
      act(() => { vi.advanceTimersByTime(1999) })
      expect(screen.getByText('Quick')).toBeInTheDocument()
      act(() => { vi.advanceTimersByTime(2) })
      expect(screen.queryByText('Quick')).not.toBeInTheDocument()
    })

    it('does not auto-dismiss when duration is 0 (persistent)', () => {
      let api: ReturnType<typeof useToast>
      render(<TestApp onApi={(a) => { api = a }} />)
      act(() => { api.toast({ title: 'Sticky', duration: 0 }) })
      act(() => { vi.advanceTimersByTime(60000) })
      expect(screen.getByText('Sticky')).toBeInTheDocument()
    })
  })

  // ─── Manual dismiss ───────────────────────────────────────────────

  describe('manual dismiss', () => {
    it('dismisses a specific toast by ID', () => {
      let api: ReturnType<typeof useToast>
      render(<TestApp onApi={(a) => { api = a }} />)
      let id: string
      act(() => { id = api.toast({ title: 'Removable', duration: 0 }) })
      expect(screen.getByText('Removable')).toBeInTheDocument()
      act(() => { api.dismiss(id!) })
      expect(screen.queryByText('Removable')).not.toBeInTheDocument()
    })

    it('dismisses all toasts', () => {
      let api: ReturnType<typeof useToast>
      render(<TestApp onApi={(a) => { api = a }} />)
      act(() => {
        api.toast({ title: 'A', duration: 0 })
        api.toast({ title: 'B', duration: 0 })
        api.toast({ title: 'C', duration: 0 })
      })
      expect(screen.getByText('A')).toBeInTheDocument()
      expect(screen.getByText('B')).toBeInTheDocument()
      expect(screen.getByText('C')).toBeInTheDocument()
      act(() => { api.dismissAll() })
      expect(screen.queryByText('A')).not.toBeInTheDocument()
      expect(screen.queryByText('B')).not.toBeInTheDocument()
      expect(screen.queryByText('C')).not.toBeInTheDocument()
    })

    it('shows close button when dismissible (default)', () => {
      let api: ReturnType<typeof useToast>
      render(<TestApp onApi={(a) => { api = a }} />)
      act(() => { api.toast({ title: 'Closable', duration: 0 }) })
      expect(screen.getByLabelText('Dismiss')).toBeInTheDocument()
    })

    it('hides close button when dismissible=false', () => {
      let api: ReturnType<typeof useToast>
      render(<TestApp onApi={(a) => { api = a }} />)
      act(() => { api.toast({ title: 'No close', dismissible: false, duration: 0 }) })
      expect(screen.queryByLabelText('Dismiss')).not.toBeInTheDocument()
    })

    it('clicking close button dismisses the toast', () => {
      let api: ReturnType<typeof useToast>
      render(<TestApp onApi={(a) => { api = a }} />)
      act(() => { api.toast({ title: 'Close me', duration: 0 }) })
      fireEvent.click(screen.getByLabelText('Dismiss'))
      expect(screen.queryByText('Close me')).not.toBeInTheDocument()
    })
  })

  // ─── Variants ─────────────────────────────────────────────────────

  describe('variants', () => {
    it.each(['default', 'success', 'warning', 'error', 'info'] as const)(
      'renders %s variant with data-variant attribute',
      (variant) => {
        let api: ReturnType<typeof useToast>
        render(<TestApp onApi={(a) => { api = a }} />)
        act(() => { api.toast({ title: `Toast ${variant}`, variant, duration: 0 }) })
        const toast = screen.getByText(`Toast ${variant}`).closest('[data-variant]')
        expect(toast).toHaveAttribute('data-variant', variant)
      }
    )
  })

  // ─── Action button ────────────────────────────────────────────────

  describe('action button', () => {
    it('renders an action button', () => {
      let api: ReturnType<typeof useToast>
      const onClick = vi.fn()
      render(<TestApp onApi={(a) => { api = a }} />)
      act(() => {
        api.toast({
          title: 'With action',
          action: { label: 'Undo', onClick },
          duration: 0,
        })
      })
      expect(screen.getByRole('button', { name: 'Undo' })).toBeInTheDocument()
    })

    it('calls action onClick when clicked', () => {
      let api: ReturnType<typeof useToast>
      const onClick = vi.fn()
      render(<TestApp onApi={(a) => { api = a }} />)
      act(() => {
        api.toast({
          title: 'With action',
          action: { label: 'Undo', onClick },
          duration: 0,
        })
      })
      fireEvent.click(screen.getByRole('button', { name: 'Undo' }))
      expect(onClick).toHaveBeenCalledTimes(1)
    })
  })

  // ─── Custom icon ──────────────────────────────────────────────────

  describe('icon', () => {
    it('renders a custom icon', () => {
      let api: ReturnType<typeof useToast>
      render(<TestApp onApi={(a) => { api = a }} />)
      act(() => {
        api.toast({
          title: 'With icon',
          icon: <span data-testid="custom-icon">★</span>,
          duration: 0,
        })
      })
      expect(screen.getByTestId('custom-icon')).toBeInTheDocument()
    })
  })

  // ─── Deduplication ────────────────────────────────────────────────

  describe('deduplication', () => {
    it('deduplicates toasts with the same id', () => {
      let api: ReturnType<typeof useToast>
      render(<TestApp onApi={(a) => { api = a }} />)
      act(() => {
        api.toast({ id: 'dup', title: 'First', duration: 0 })
        api.toast({ id: 'dup', title: 'Second', duration: 0 })
      })
      expect(screen.queryByText('First')).not.toBeInTheDocument()
      expect(screen.getByText('Second')).toBeInTheDocument()
    })
  })

  // ─── Queue / Max visible ──────────────────────────────────────────

  describe('queue and stacking', () => {
    it('respects maxVisible and queues excess toasts', () => {
      let api: ReturnType<typeof useToast>
      render(<TestApp onApi={(a) => { api = a }} maxVisible={2} />)
      act(() => {
        api.toast({ title: 'Toast 1', duration: 0 })
        api.toast({ title: 'Toast 2', duration: 0 })
        api.toast({ title: 'Toast 3', duration: 0 })
      })
      expect(screen.getByText('Toast 1')).toBeInTheDocument()
      expect(screen.getByText('Toast 2')).toBeInTheDocument()
      expect(screen.queryByText('Toast 3')).not.toBeInTheDocument()
    })

    it('shows queued toast when a visible toast is dismissed', () => {
      let api: ReturnType<typeof useToast>
      render(<TestApp onApi={(a) => { api = a }} maxVisible={2} />)
      let id1: string
      act(() => {
        id1 = api.toast({ title: 'Toast 1', duration: 0 })
        api.toast({ title: 'Toast 2', duration: 0 })
        api.toast({ title: 'Toast 3', duration: 0 })
      })
      act(() => { api.dismiss(id1!) })
      expect(screen.queryByText('Toast 1')).not.toBeInTheDocument()
      expect(screen.getByText('Toast 3')).toBeInTheDocument()
    })
  })

  // ─── Pause on hover ───────────────────────────────────────────────

  describe('pause on hover', () => {
    it('pauses auto-dismiss timer on hover', () => {
      let api: ReturnType<typeof useToast>
      render(<TestApp onApi={(a) => { api = a }} />)
      act(() => { api.toast({ title: 'Hover me', duration: 3000 }) })

      const toast = screen.getByText('Hover me').closest('.ui-toast')!
      act(() => { vi.advanceTimersByTime(1500) })
      // Hover to pause
      fireEvent.mouseEnter(toast)
      act(() => { vi.advanceTimersByTime(5000) })
      // Should still be visible because paused
      expect(screen.getByText('Hover me')).toBeInTheDocument()
      // Unhover to resume
      fireEvent.mouseLeave(toast)
      act(() => { vi.advanceTimersByTime(1501) })
      expect(screen.queryByText('Hover me')).not.toBeInTheDocument()
    })
  })

  // ─── Position ─────────────────────────────────────────────────────

  describe('position', () => {
    it.each([
      'top-right',
      'top-center',
      'bottom-right',
      'bottom-center',
    ] as const)('renders with data-position="%s"', (position) => {
      const { container } = render(<TestApp position={position} />)
      const el = container.querySelector('.ui-toast-container')
      expect(el).toHaveAttribute('data-position', position)
    })
  })

  // ─── Accessibility ────────────────────────────────────────────────

  describe('accessibility', () => {
    it('each toast has role="status"', () => {
      let api: ReturnType<typeof useToast>
      render(<TestApp onApi={(a) => { api = a }} />)
      act(() => { api.toast({ title: 'A11y toast', duration: 0 }) })
      const statuses = screen.getAllByRole('status')
      expect(statuses.length).toBeGreaterThanOrEqual(1)
    })

    it('each toast has aria-live="polite"', () => {
      let api: ReturnType<typeof useToast>
      render(<TestApp onApi={(a) => { api = a }} />)
      act(() => { api.toast({ title: 'Live region', duration: 0 }) })
      const toast = screen.getByText('Live region').closest('[role="status"]')
      expect(toast).toHaveAttribute('aria-live', 'polite')
    })

    it('error variant toast has aria-live="assertive"', () => {
      let api: ReturnType<typeof useToast>
      render(<TestApp onApi={(a) => { api = a }} />)
      act(() => { api.toast({ title: 'Error toast', variant: 'error', duration: 0 }) })
      const toast = screen.getByText('Error toast').closest('[role="status"]')
      expect(toast).toHaveAttribute('aria-live', 'assertive')
    })

    it('has no axe violations', async () => {
      // axe needs real timers
      vi.useRealTimers()
      let api: ReturnType<typeof useToast>
      const { container } = render(<TestApp onApi={(a) => { api = a }} />)
      act(() => {
        api.toast({ title: 'Accessible', duration: 0 })
      })
      const results = await axe(container)
      expect(results).toHaveNoViolations()
      vi.useFakeTimers()
    })
  })

  // ─── Motion ───────────────────────────────────────────────────────

  describe('motion', () => {
    it('sets data-motion on toast container', () => {
      const { container } = render(<TestApp motion={0} />)
      const el = container.querySelector('.ui-toast-container')
      expect(el).toHaveAttribute('data-motion', '0')
    })
  })

  // ─── Progress bar ─────────────────────────────────────────────────

  describe('progress bar', () => {
    it('renders a progress indicator for auto-dismissing toasts', () => {
      let api: ReturnType<typeof useToast>
      const { container } = render(<TestApp onApi={(a) => { api = a }} />)
      act(() => { api.toast({ title: 'Progress', duration: 5000 }) })
      expect(container.querySelector('.ui-toast__progress')).toBeInTheDocument()
    })

    it('does not render progress bar for persistent toasts', () => {
      let api: ReturnType<typeof useToast>
      const { container } = render(<TestApp onApi={(a) => { api = a }} />)
      act(() => { api.toast({ title: 'No progress', duration: 0 }) })
      expect(container.querySelector('.ui-toast__progress')).not.toBeInTheDocument()
    })
  })
})
