import { describe, it, expect, vi, afterEach } from 'vitest'
import { render, screen, cleanup, fireEvent } from '@testing-library/react'
import { createRef } from 'react'

// Premium components
import { Button } from '../../premium/button'
import { Card } from '../../premium/card'
import { Dialog } from '../../premium/dialog'
import { Tabs } from '../../premium/tabs'
import { MetricCard } from '../../premium/metric-card'

// Standard components (for type identity checks)
import { Button as BaseButton } from '../../components/button'
import { Card as BaseCard } from '../../components/card'

afterEach(() => {
  cleanup()
})

// ─── Premium Button ──────────────────────────────────────────────────────────

describe('Premium Button', () => {
  it('renders without crashing', () => {
    render(<Button>Click me</Button>)
    expect(screen.getByRole('button', { name: 'Click me' })).toBeInTheDocument()
  })

  it('wraps the standard Button (contains .ui-button in output)', () => {
    const { container } = render(<Button>Wrapped</Button>)
    expect(container.querySelector('.ui-button')).toBeInTheDocument()
  })

  it('adds premium CSS class (.ui-premium-button)', () => {
    const { container } = render(<Button>Premium</Button>)
    expect(container.querySelector('.ui-premium-button')).toBeInTheDocument()
  })

  it('creates ripple element on click', () => {
    const { container } = render(<Button motion={2}>Ripple</Button>)
    const btn = screen.getByRole('button', { name: 'Ripple' })

    // Simulate click with coordinates
    fireEvent.click(btn, { clientX: 50, clientY: 20 })

    const ripple = container.querySelector('.ui-premium-button__ripple')
    expect(ripple).toBeInTheDocument()
  })

  it('does not create ripple at motion level 0', () => {
    const { container } = render(<Button motion={0}>No Ripple</Button>)
    const btn = screen.getByRole('button', { name: 'No Ripple' })

    fireEvent.click(btn, { clientX: 50, clientY: 20 })

    const ripple = container.querySelector('.ui-premium-button__ripple')
    expect(ripple).not.toBeInTheDocument()
  })

  it('forwards ref to the underlying button element', () => {
    const ref = createRef<HTMLButtonElement>()
    render(<Button ref={ref}>Ref Test</Button>)
    expect(ref.current).toBeInstanceOf(HTMLButtonElement)
    expect(ref.current?.textContent).toContain('Ref Test')
  })

  it('passes onClick through to base button', () => {
    const handleClick = vi.fn()
    render(<Button motion={2} onClick={handleClick}>Clickable</Button>)
    const btn = screen.getByRole('button', { name: 'Clickable' })
    fireEvent.click(btn, { clientX: 50, clientY: 20 })
    expect(handleClick).toHaveBeenCalledOnce()
  })

  it('passes variant and size props through', () => {
    render(<Button variant="secondary" size="lg">Styled</Button>)
    const btn = screen.getByRole('button', { name: 'Styled' })
    expect(btn).toHaveAttribute('data-variant', 'secondary')
    expect(btn).toHaveAttribute('data-size', 'lg')
  })
})

// ─── Premium Card ────────────────────────────────────────────────────────────

describe('Premium Card', () => {
  it('renders without crashing', () => {
    const { container } = render(<Card>Card content</Card>)
    expect(container.textContent).toContain('Card content')
  })

  it('wraps the standard Card (contains .ui-card in output)', () => {
    const { container } = render(<Card>Inner</Card>)
    expect(container.querySelector('.ui-card')).toBeInTheDocument()
  })

  it('adds premium CSS class (.ui-premium-card)', () => {
    const { container } = render(<Card>Premium</Card>)
    expect(container.querySelector('.ui-premium-card')).toBeInTheDocument()
  })

  it('forwards ref to the underlying card element', () => {
    const ref = createRef<HTMLElement>()
    render(<Card ref={ref}>Ref Card</Card>)
    expect(ref.current).toBeInstanceOf(HTMLElement)
  })

  it('passes variant and padding props through', () => {
    const { container } = render(<Card variant="elevated" padding="lg">Styled Card</Card>)
    const card = container.querySelector('.ui-card')
    expect(card).toHaveAttribute('data-variant', 'elevated')
    expect(card).toHaveAttribute('data-padding', 'lg')
  })
})

// ─── Premium Dialog ──────────────────────────────────────────────────────────

describe('Premium Dialog', () => {
  it('renders without crashing', () => {
    const { container } = render(
      <Dialog open={false} onClose={() => {}}>
        Dialog content
      </Dialog>
    )
    expect(container.querySelector('.ui-premium-dialog')).toBeInTheDocument()
  })

  it('wraps the standard Dialog (contains .ui-dialog in output)', () => {
    const { container } = render(
      <Dialog open={false} onClose={() => {}}>
        Content
      </Dialog>
    )
    expect(container.querySelector('.ui-dialog')).toBeInTheDocument()
  })

  it('adds premium CSS class (.ui-premium-dialog)', () => {
    const { container } = render(
      <Dialog open={false} onClose={() => {}}>
        Premium content
      </Dialog>
    )
    expect(container.querySelector('.ui-premium-dialog')).toBeInTheDocument()
  })

  it('does not render particles when closed', () => {
    const { container } = render(
      <Dialog open={false} onClose={() => {}} motion={3}>
        Closed
      </Dialog>
    )
    expect(container.querySelector('.ui-premium-dialog__particles')).not.toBeInTheDocument()
  })

  it('renders backdrop particles markup when open at motion level 3', () => {
    // Mock showModal since jsdom doesn't support it
    HTMLDialogElement.prototype.showModal = vi.fn()
    HTMLDialogElement.prototype.close = vi.fn()

    const { container } = render(
      <Dialog open={true} onClose={() => {}} motion={3}>
        Open with particles
      </Dialog>
    )
    expect(container.querySelector('.ui-premium-dialog__particles')).toBeInTheDocument()
    const particles = container.querySelectorAll('.ui-premium-dialog__particle')
    expect(particles.length).toBeGreaterThan(0)
  })

  it('passes onClose through', () => {
    HTMLDialogElement.prototype.showModal = vi.fn()
    HTMLDialogElement.prototype.close = vi.fn()

    const onClose = vi.fn()
    const { container } = render(
      <Dialog open={true} onClose={onClose} showClose>
        Closeable
      </Dialog>
    )
    // jsdom doesn't fully support <dialog> accessibility, query by class
    const closeBtn = container.querySelector('.ui-dialog__close') as HTMLElement
    expect(closeBtn).toBeInTheDocument()
    fireEvent.click(closeBtn)
    expect(onClose).toHaveBeenCalledOnce()
  })
})

// ─── Premium Tabs ────────────────────────────────────────────────────────────

describe('Premium Tabs', () => {
  const tabs = [
    { id: 'one', label: 'Tab One' },
    { id: 'two', label: 'Tab Two' },
  ]

  it('renders without crashing', () => {
    const { container } = render(
      <Tabs tabs={tabs} defaultTab="one">
        <div data-tab-id="one">Panel 1</div>
        <div data-tab-id="two">Panel 2</div>
      </Tabs>
    )
    expect(container.querySelector('.ui-premium-tabs')).toBeInTheDocument()
  })

  it('wraps the standard Tabs (contains .ui-tabs in output)', () => {
    const { container } = render(
      <Tabs tabs={tabs} defaultTab="one">
        <div data-tab-id="one">Panel 1</div>
        <div data-tab-id="two">Panel 2</div>
      </Tabs>
    )
    expect(container.querySelector('.ui-tabs')).toBeInTheDocument()
  })

  it('adds premium CSS class (.ui-premium-tabs)', () => {
    const { container } = render(
      <Tabs tabs={tabs} defaultTab="one">
        <div data-tab-id="one">Panel 1</div>
        <div data-tab-id="two">Panel 2</div>
      </Tabs>
    )
    expect(container.querySelector('.ui-premium-tabs')).toBeInTheDocument()
  })

  it('renders tab buttons from the tabs prop', () => {
    render(
      <Tabs tabs={tabs} defaultTab="one">
        <div data-tab-id="one">Panel 1</div>
        <div data-tab-id="two">Panel 2</div>
      </Tabs>
    )
    expect(screen.getByRole('tab', { name: 'Tab One' })).toBeInTheDocument()
    expect(screen.getByRole('tab', { name: 'Tab Two' })).toBeInTheDocument()
  })

  it('passes onChange through', () => {
    const onChange = vi.fn()
    render(
      <Tabs tabs={tabs} defaultTab="one" onChange={onChange}>
        <div data-tab-id="one">Panel 1</div>
        <div data-tab-id="two">Panel 2</div>
      </Tabs>
    )
    fireEvent.click(screen.getByRole('tab', { name: 'Tab Two' }))
    expect(onChange).toHaveBeenCalledWith('two')
  })
})

// ─── Premium MetricCard ──────────────────────────────────────────────────────

describe('Premium MetricCard', () => {
  it('renders without crashing', () => {
    const { container } = render(
      <MetricCard title="Revenue" value="$1,234" />
    )
    expect(container.textContent).toContain('Revenue')
    expect(container.textContent).toContain('$1,234')
  })

  it('wraps the standard MetricCard (contains .ui-metric-card in output)', () => {
    const { container } = render(
      <MetricCard title="Users" value="500" />
    )
    expect(container.querySelector('.ui-metric-card')).toBeInTheDocument()
  })

  it('adds premium CSS class (.ui-premium-metric-card)', () => {
    const { container } = render(
      <MetricCard title="Count" value="42" />
    )
    expect(container.querySelector('.ui-premium-metric-card')).toBeInTheDocument()
  })

  it('passes status prop through', () => {
    const { container } = render(
      <MetricCard title="Health" value="OK" status="ok" />
    )
    const metricCard = container.querySelector('.ui-metric-card')
    expect(metricCard).toHaveAttribute('data-status', 'ok')
  })

  it('renders sparkline when data provided', () => {
    const { container } = render(
      <MetricCard title="Trend" value="100" sparkline={[10, 20, 15, 25, 30]} />
    )
    expect(container.querySelector('.ui-metric-card__sparkline')).toBeInTheDocument()
  })
})

// ─── Barrel export ──────────────────────────────────────────────────────────

describe('Premium barrel export', () => {
  it('exports all 5 premium components', async () => {
    const premium = await import('../../premium/index')
    expect(premium.Button).toBeDefined()
    expect(premium.Card).toBeDefined()
    expect(premium.Dialog).toBeDefined()
    expect(premium.Tabs).toBeDefined()
    expect(premium.MetricCard).toBeDefined()
  })

  it('premium Button is different from base Button', () => {
    expect(Button).not.toBe(BaseButton)
  })

  it('premium Card is different from base Card', () => {
    expect(Card).not.toBe(BaseCard)
  })
})
