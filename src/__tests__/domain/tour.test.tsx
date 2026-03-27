import { describe, it, expect, vi, afterEach, beforeEach } from 'vitest'
import { render, screen, cleanup, fireEvent } from '@testing-library/react'
import { axe, toHaveNoViolations } from 'jest-axe'
import { Tour, type TourStep } from '../../domain/tour'

expect.extend(toHaveNoViolations)

const steps: TourStep[] = [
  {
    target: '#step-1',
    title: 'Welcome',
    description: 'This is the first step',
    placement: 'bottom',
  },
  {
    target: '#step-2',
    title: 'Features',
    description: 'Here are some features',
    placement: 'right',
  },
  {
    target: '#step-3',
    title: 'Finish',
    description: 'You are all done!',
    placement: 'top',
  },
]

function renderWithTargets(ui: React.ReactElement) {
  const result = render(
    <>
      <div id="step-1" style={{ position: 'absolute', top: 100, left: 100, width: 100, height: 50 }}>Step 1</div>
      <div id="step-2" style={{ position: 'absolute', top: 200, left: 200, width: 100, height: 50 }}>Step 2</div>
      <div id="step-3" style={{ position: 'absolute', top: 300, left: 300, width: 100, height: 50 }}>Step 3</div>
      {ui}
    </>
  )
  return result
}

describe('Tour', () => {
  beforeEach(() => {
    // Mock getBoundingClientRect
    Element.prototype.getBoundingClientRect = vi.fn().mockReturnValue({
      top: 100,
      left: 100,
      bottom: 150,
      right: 200,
      width: 100,
      height: 50,
      x: 100,
      y: 100,
      toJSON: () => {},
    })

    // Mock ResizeObserver
    global.ResizeObserver = class MockResizeObserver {
      observe = vi.fn()
      unobserve = vi.fn()
      disconnect = vi.fn()
    } as unknown as typeof ResizeObserver
  })

  afterEach(cleanup)

  // ─── Rendering ──────────────────────────────────────────────────────

  describe('rendering', () => {
    it('renders nothing when open is false', () => {
      const { container } = renderWithTargets(<Tour steps={steps} open={false} />)
      expect(container.querySelector('.ui-tour')).not.toBeInTheDocument()
    })

    it('renders overlay when open', () => {
      const { container } = renderWithTargets(<Tour steps={steps} open />)
      expect(container.querySelector('.ui-tour')).toBeInTheDocument()
    })

    it('renders current step title', () => {
      renderWithTargets(<Tour steps={steps} open />)
      expect(screen.getByText('Welcome')).toBeInTheDocument()
    })

    it('renders current step description', () => {
      renderWithTargets(<Tour steps={steps} open />)
      expect(screen.getByText('This is the first step')).toBeInTheDocument()
    })

    it('renders the SVG overlay', () => {
      const { container } = renderWithTargets(<Tour steps={steps} open />)
      expect(container.querySelector('.ui-tour__overlay')).toBeInTheDocument()
    })
  })

  // ─── Navigation ─────────────────────────────────────────────────────

  describe('navigation', () => {
    it('shows Next button on first step', () => {
      renderWithTargets(<Tour steps={steps} open />)
      expect(screen.getByText('Next')).toBeInTheDocument()
    })

    it('does not show Previous button on first step', () => {
      renderWithTargets(<Tour steps={steps} open />)
      expect(screen.queryByText('Previous')).not.toBeInTheDocument()
    })

    it('navigates to next step on Next click', () => {
      const onStepChange = vi.fn()
      renderWithTargets(<Tour steps={steps} open onStepChange={onStepChange} />)
      fireEvent.click(screen.getByText('Next'))
      expect(onStepChange).toHaveBeenCalledWith(1)
    })

    it('shows Previous button on second step', () => {
      renderWithTargets(<Tour steps={steps} open currentStep={1} />)
      expect(screen.getByText('Previous')).toBeInTheDocument()
    })

    it('navigates to previous step on Previous click', () => {
      const onStepChange = vi.fn()
      renderWithTargets(<Tour steps={steps} open currentStep={1} onStepChange={onStepChange} />)
      fireEvent.click(screen.getByText('Previous'))
      expect(onStepChange).toHaveBeenCalledWith(0)
    })

    it('shows Finish button on last step', () => {
      renderWithTargets(<Tour steps={steps} open currentStep={2} />)
      expect(screen.getByRole('button', { name: 'Finish' })).toBeInTheDocument()
    })

    it('calls onFinish and onClose on Finish click', () => {
      const onFinish = vi.fn()
      const onClose = vi.fn()
      renderWithTargets(<Tour steps={steps} open currentStep={2} onFinish={onFinish} onClose={onClose} />)
      fireEvent.click(screen.getByRole('button', { name: 'Finish' }))
      expect(onFinish).toHaveBeenCalledTimes(1)
      expect(onClose).toHaveBeenCalledTimes(1)
    })
  })

  // ─── Skip ───────────────────────────────────────────────────────────

  describe('skip', () => {
    it('shows Skip button by default', () => {
      renderWithTargets(<Tour steps={steps} open />)
      expect(screen.getByText('Skip')).toBeInTheDocument()
    })

    it('hides Skip button when showSkip is false', () => {
      renderWithTargets(<Tour steps={steps} open showSkip={false} />)
      expect(screen.queryByText('Skip')).not.toBeInTheDocument()
    })

    it('calls onClose on Skip click', () => {
      const onClose = vi.fn()
      renderWithTargets(<Tour steps={steps} open onClose={onClose} />)
      fireEvent.click(screen.getByText('Skip'))
      expect(onClose).toHaveBeenCalledTimes(1)
    })

    it('does not show Skip on last step', () => {
      renderWithTargets(<Tour steps={steps} open currentStep={2} />)
      expect(screen.queryByText('Skip')).not.toBeInTheDocument()
    })
  })

  // ─── Progress ───────────────────────────────────────────────────────

  describe('progress', () => {
    it('shows progress text', () => {
      renderWithTargets(<Tour steps={steps} open />)
      expect(screen.getByText('Step 1 of 3')).toBeInTheDocument()
    })

    it('hides progress when showProgress is false', () => {
      renderWithTargets(<Tour steps={steps} open showProgress={false} />)
      expect(screen.queryByText('Step 1 of 3')).not.toBeInTheDocument()
    })

    it('renders step dots', () => {
      const { container } = renderWithTargets(<Tour steps={steps} open />)
      const dots = container.querySelectorAll('.ui-tour__dot')
      expect(dots.length).toBe(3)
    })

    it('marks current dot as active', () => {
      const { container } = renderWithTargets(<Tour steps={steps} open currentStep={1} />)
      const dots = container.querySelectorAll('.ui-tour__dot')
      expect(dots[1]).toHaveAttribute('data-active')
    })

    it('marks completed dots', () => {
      const { container } = renderWithTargets(<Tour steps={steps} open currentStep={2} />)
      const dots = container.querySelectorAll('.ui-tour__dot')
      expect(dots[0]).toHaveAttribute('data-completed')
      expect(dots[1]).toHaveAttribute('data-completed')
    })
  })

  // ─── Close behaviors ───────────────────────────────────────────────

  describe('close behaviors', () => {
    it('closes on Escape key', () => {
      const onClose = vi.fn()
      renderWithTargets(<Tour steps={steps} open onClose={onClose} />)
      fireEvent.keyDown(document, { key: 'Escape' })
      expect(onClose).toHaveBeenCalledTimes(1)
    })

    it('does not close on Escape when closeOnEscape is false', () => {
      const onClose = vi.fn()
      renderWithTargets(<Tour steps={steps} open onClose={onClose} closeOnEscape={false} />)
      fireEvent.keyDown(document, { key: 'Escape' })
      expect(onClose).not.toHaveBeenCalled()
    })

    it('closes on overlay click', () => {
      const onClose = vi.fn()
      const { container } = renderWithTargets(<Tour steps={steps} open onClose={onClose} />)
      const overlay = container.querySelector('.ui-tour__overlay')!
      fireEvent.click(overlay)
      expect(onClose).toHaveBeenCalledTimes(1)
    })

    it('does not close on overlay click when closeOnOverlay is false', () => {
      const onClose = vi.fn()
      const { container } = renderWithTargets(
        <Tour steps={steps} open onClose={onClose} closeOnOverlay={false} />
      )
      const overlay = container.querySelector('.ui-tour__overlay')!
      fireEvent.click(overlay)
      expect(onClose).not.toHaveBeenCalled()
    })
  })

  // ─── Step callbacks ─────────────────────────────────────────────────

  describe('step callbacks', () => {
    it('calls onShow when a step is displayed', () => {
      const onShow = vi.fn()
      const stepsWithCallback: TourStep[] = [
        { ...steps[0], onShow },
        steps[1],
        steps[2],
      ]
      renderWithTargets(<Tour steps={stepsWithCallback} open />)
      expect(onShow).toHaveBeenCalledTimes(1)
    })
  })

  // ─── Motion ─────────────────────────────────────────────────────────

  describe('motion', () => {
    it('sets data-motion attribute', () => {
      const { container } = renderWithTargets(<Tour steps={steps} open motion={0} />)
      expect(container.querySelector('.ui-tour')).toHaveAttribute('data-motion', '0')
    })

    it('sets data-motion to 3', () => {
      const { container } = renderWithTargets(<Tour steps={steps} open motion={3} />)
      expect(container.querySelector('.ui-tour')).toHaveAttribute('data-motion', '3')
    })
  })

  // ─── Accessibility ─────────────────────────────────────────────────

  describe('accessibility', () => {
    it('has no axe violations', async () => {
      const { container } = renderWithTargets(<Tour steps={steps} open />)
      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })

    it('has role="dialog"', () => {
      renderWithTargets(<Tour steps={steps} open />)
      expect(screen.getByRole('dialog')).toBeInTheDocument()
    })

    it('has aria-modal', () => {
      renderWithTargets(<Tour steps={steps} open />)
      expect(screen.getByRole('dialog')).toHaveAttribute('aria-modal', 'true')
    })

    it('has descriptive aria-label', () => {
      renderWithTargets(<Tour steps={steps} open />)
      expect(screen.getByRole('dialog')).toHaveAttribute(
        'aria-label',
        'Tour step 1 of 3: Welcome'
      )
    })

    it('all buttons have accessible names', () => {
      renderWithTargets(<Tour steps={steps} open />)
      const buttons = screen.getAllByRole('button')
      buttons.forEach(btn => {
        expect(btn).toHaveAccessibleName()
      })
    })
  })

  // ─── Edge cases ─────────────────────────────────────────────────────

  describe('edge cases', () => {
    it('renders with single step', () => {
      renderWithTargets(<Tour steps={[steps[0]]} open />)
      expect(screen.getByText('Welcome')).toBeInTheDocument()
      expect(screen.getByRole('button', { name: 'Finish' })).toBeInTheDocument()
    })

    it('does not render Previous on single step', () => {
      renderWithTargets(<Tour steps={[steps[0]]} open />)
      expect(screen.queryByText('Previous')).not.toBeInTheDocument()
    })

    it('uncontrolled step state works', () => {
      renderWithTargets(<Tour steps={steps} open />)
      expect(screen.getByText('Welcome')).toBeInTheDocument()
      fireEvent.click(screen.getByText('Next'))
      expect(screen.getByText('Features')).toBeInTheDocument()
    })
  })
})
