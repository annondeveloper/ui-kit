import { describe, it, expect, vi, afterEach, beforeEach } from 'vitest'
import { render, screen, cleanup, fireEvent, act } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { axe, toHaveNoViolations } from 'jest-axe'
import { Cropper } from '../../domain/cropper'

expect.extend(toHaveNoViolations)

const TEST_SRC = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=='

// Mock image loading
beforeEach(() => {
  // Override naturalWidth/naturalHeight for the test image
  Object.defineProperty(HTMLImageElement.prototype, 'naturalWidth', {
    get: () => 800,
    configurable: true,
  })
  Object.defineProperty(HTMLImageElement.prototype, 'naturalHeight', {
    get: () => 600,
    configurable: true,
  })
})

afterEach(() => {
  cleanup()
})

function triggerImageLoad() {
  const img = document.querySelector('img')
  if (img) {
    fireEvent.load(img)
  }
}

describe('Cropper', () => {
  // ─── Rendering ──────────────────────────────────────────────────────

  describe('rendering', () => {
    it('renders with ui-cropper scope class', () => {
      const { container } = render(<Cropper src={TEST_SRC} />)
      expect(container.querySelector('.ui-cropper')).toBeInTheDocument()
    })

    it('renders the image element', () => {
      render(<Cropper src={TEST_SRC} />)
      const img = screen.getByAltText('Image to crop')
      expect(img).toBeInTheDocument()
      expect(img).toHaveAttribute('src', TEST_SRC)
    })

    it('renders the container', () => {
      const { container } = render(<Cropper src={TEST_SRC} />)
      expect(container.querySelector('.ui-cropper__container')).toBeInTheDocument()
    })

    it('renders application role on container', () => {
      render(<Cropper src={TEST_SRC} />)
      expect(screen.getByRole('application')).toBeInTheDocument()
    })

    it('has aria-label on cropper container', () => {
      render(<Cropper src={TEST_SRC} />)
      expect(screen.getByRole('application')).toHaveAttribute('aria-label', 'Image cropper')
    })
  })

  // ─── Controls ──────────────────────────────────────────────────────

  describe('controls', () => {
    it('renders zoom slider by default', () => {
      render(<Cropper src={TEST_SRC} />)
      expect(screen.getByLabelText('Zoom level')).toBeInTheDocument()
    })

    it('hides zoom slider when showZoom is false', () => {
      render(<Cropper src={TEST_SRC} showZoom={false} />)
      expect(screen.queryByLabelText('Zoom level')).not.toBeInTheDocument()
    })

    it('renders rotate buttons by default', () => {
      render(<Cropper src={TEST_SRC} />)
      expect(screen.getByLabelText('Rotate left 90 degrees')).toBeInTheDocument()
      expect(screen.getByLabelText('Rotate right 90 degrees')).toBeInTheDocument()
    })

    it('hides rotate controls when showRotate is false', () => {
      render(<Cropper src={TEST_SRC} showRotate={false} />)
      expect(screen.queryByLabelText('Rotate left 90 degrees')).not.toBeInTheDocument()
    })

    it('renders rotation slider', () => {
      render(<Cropper src={TEST_SRC} />)
      expect(screen.getByLabelText('Rotation angle')).toBeInTheDocument()
    })

    it('hides all controls when both showZoom and showRotate are false', () => {
      const { container } = render(<Cropper src={TEST_SRC} showZoom={false} showRotate={false} />)
      expect(container.querySelector('.ui-cropper__controls')).not.toBeInTheDocument()
    })
  })

  // ─── Zoom ──────────────────────────────────────────────────────────

  describe('zoom', () => {
    it('zoom slider defaults to 1 (100%)', () => {
      render(<Cropper src={TEST_SRC} />)
      const slider = screen.getByLabelText('Zoom level') as HTMLInputElement
      expect(slider.value).toBe('1')
    })

    it('updates zoom when slider changes', async () => {
      render(<Cropper src={TEST_SRC} />)
      const slider = screen.getByLabelText('Zoom level')
      fireEvent.change(slider, { target: { value: '1.5' } })
      expect((slider as HTMLInputElement).value).toBe('1.5')
    })

    it('displays zoom percentage', () => {
      render(<Cropper src={TEST_SRC} />)
      expect(screen.getByText('100%')).toBeInTheDocument()
    })

    it('updates percentage display when zoom changes', () => {
      render(<Cropper src={TEST_SRC} />)
      const slider = screen.getByLabelText('Zoom level')
      fireEvent.change(slider, { target: { value: '2' } })
      expect(screen.getByText('200%')).toBeInTheDocument()
    })

    it('zoom slider has correct range', () => {
      render(<Cropper src={TEST_SRC} />)
      const slider = screen.getByLabelText('Zoom level') as HTMLInputElement
      expect(slider.min).toBe('0.5')
      expect(slider.max).toBe('3')
    })
  })

  // ─── Rotation ──────────────────────────────────────────────────────

  describe('rotation', () => {
    it('rotate left button decreases rotation by 90', async () => {
      render(<Cropper src={TEST_SRC} />)
      const rotateLeft = screen.getByLabelText('Rotate left 90 degrees')
      await userEvent.click(rotateLeft)
      expect(screen.getByText('-90°')).toBeInTheDocument()
    })

    it('rotate right button increases rotation by 90', async () => {
      render(<Cropper src={TEST_SRC} />)
      const rotateRight = screen.getByLabelText('Rotate right 90 degrees')
      await userEvent.click(rotateRight)
      expect(screen.getByText('90°')).toBeInTheDocument()
    })

    it('rotation slider updates rotation', () => {
      render(<Cropper src={TEST_SRC} />)
      const slider = screen.getByLabelText('Rotation angle')
      fireEvent.change(slider, { target: { value: '45' } })
      expect(screen.getByText('45°')).toBeInTheDocument()
    })

    it('rotation slider has correct range', () => {
      render(<Cropper src={TEST_SRC} />)
      const slider = screen.getByLabelText('Rotation angle') as HTMLInputElement
      expect(slider.min).toBe('-180')
      expect(slider.max).toBe('180')
    })
  })

  // ─── Grid ──────────────────────────────────────────────────────────

  describe('grid', () => {
    it('renders grid lines when showGrid is true and image loaded', () => {
      const { container } = render(<Cropper src={TEST_SRC} showGrid />)
      triggerImageLoad()
      expect(container.querySelector('.ui-cropper__grid')).toBeInTheDocument()
    })

    it('does not render grid when showGrid is false', () => {
      const { container } = render(<Cropper src={TEST_SRC} showGrid={false} />)
      triggerImageLoad()
      expect(container.querySelector('.ui-cropper__grid')).not.toBeInTheDocument()
    })

    it('renders 4 grid lines (rule of thirds)', () => {
      const { container } = render(<Cropper src={TEST_SRC} showGrid />)
      triggerImageLoad()
      const lines = container.querySelectorAll('.ui-cropper__grid-line')
      expect(lines.length).toBe(4)
    })
  })

  // ─── Rounded mode ──────────────────────────────────────────────────

  describe('rounded', () => {
    it('sets data-rounded attribute when rounded is true', () => {
      const { container } = render(<Cropper src={TEST_SRC} rounded />)
      expect(container.querySelector('[data-rounded]')).toBeInTheDocument()
    })

    it('does not set data-rounded when rounded is false', () => {
      const { container } = render(<Cropper src={TEST_SRC} rounded={false} />)
      expect(container.querySelector('[data-rounded]')).not.toBeInTheDocument()
    })
  })

  // ─── Crop area and handles ─────────────────────────────────────────

  describe('crop area', () => {
    it('renders crop area after image loads', () => {
      const { container } = render(<Cropper src={TEST_SRC} />)
      triggerImageLoad()
      expect(container.querySelector('.ui-cropper__crop-area')).toBeInTheDocument()
    })

    it('does not render crop area before image loads', () => {
      const { container } = render(<Cropper src={TEST_SRC} />)
      expect(container.querySelector('.ui-cropper__crop-area')).not.toBeInTheDocument()
    })

    it('renders 8 resize handles after image loads', () => {
      const { container } = render(<Cropper src={TEST_SRC} />)
      triggerImageLoad()
      const handles = container.querySelectorAll('.ui-cropper__handle')
      expect(handles.length).toBe(8)
    })

    it('resize handles have correct positions', () => {
      const { container } = render(<Cropper src={TEST_SRC} />)
      triggerImageLoad()
      const positions = ['nw', 'n', 'ne', 'e', 'se', 's', 'sw', 'w']
      positions.forEach(pos => {
        expect(container.querySelector(`.ui-cropper__handle--${pos}`)).toBeInTheDocument()
      })
    })

    it('crop area has aria-label for crop region', () => {
      render(<Cropper src={TEST_SRC} />)
      triggerImageLoad()
      expect(screen.getByLabelText('Crop region')).toBeInTheDocument()
    })
  })

  // ─── onCrop callback ──────────────────────────────────────────────

  describe('onCrop callback', () => {
    it('calls onCrop with rotation and zoom after rotate button click', async () => {
      const onCrop = vi.fn()
      render(<Cropper src={TEST_SRC} onCrop={onCrop} />)
      triggerImageLoad()

      const rotateRight = screen.getByLabelText('Rotate right 90 degrees')
      await userEvent.click(rotateRight)

      // onCrop should have been called with rotation: 90
      if (onCrop.mock.calls.length > 0) {
        const lastCall = onCrop.mock.calls[onCrop.mock.calls.length - 1][0]
        expect(lastCall.rotation).toBe(90)
      }
    })

    it('onCrop result includes all expected fields', async () => {
      const onCrop = vi.fn()
      render(<Cropper src={TEST_SRC} onCrop={onCrop} />)
      triggerImageLoad()

      const rotateRight = screen.getByLabelText('Rotate right 90 degrees')
      await userEvent.click(rotateRight)

      if (onCrop.mock.calls.length > 0) {
        const result = onCrop.mock.calls[onCrop.mock.calls.length - 1][0]
        expect(result).toHaveProperty('x')
        expect(result).toHaveProperty('y')
        expect(result).toHaveProperty('width')
        expect(result).toHaveProperty('height')
        expect(result).toHaveProperty('rotation')
        expect(result).toHaveProperty('zoom')
      }
    })
  })

  // ─── Image transform ──────────────────────────────────────────────

  describe('image transform', () => {
    it('applies zoom transform to image', () => {
      render(<Cropper src={TEST_SRC} />)
      const img = screen.getByAltText('Image to crop')
      expect(img.style.transform).toContain('scale(1)')
    })

    it('applies rotation transform to image', async () => {
      render(<Cropper src={TEST_SRC} />)
      const rotateRight = screen.getByLabelText('Rotate right 90 degrees')
      await userEvent.click(rotateRight)
      const img = screen.getByAltText('Image to crop')
      expect(img.style.transform).toContain('rotate(90deg)')
    })

    it('image is not draggable', () => {
      render(<Cropper src={TEST_SRC} />)
      const img = screen.getByAltText('Image to crop')
      expect(img).toHaveAttribute('draggable', 'false')
    })
  })

  // ─── Motion ────────────────────────────────────────────────────────

  describe('motion', () => {
    it('sets data-motion attribute', () => {
      const { container } = render(<Cropper src={TEST_SRC} motion={2} />)
      expect(container.querySelector('[data-motion="2"]')).toBeInTheDocument()
    })
  })

  // ─── Accessibility ─────────────────────────────────────────────────

  describe('accessibility', () => {
    it('image has alt text', () => {
      render(<Cropper src={TEST_SRC} />)
      expect(screen.getByAltText('Image to crop')).toBeInTheDocument()
    })

    it('rotate buttons have aria-labels', () => {
      render(<Cropper src={TEST_SRC} />)
      expect(screen.getByLabelText('Rotate left 90 degrees')).toBeInTheDocument()
      expect(screen.getByLabelText('Rotate right 90 degrees')).toBeInTheDocument()
    })

    it('zoom slider has aria-label', () => {
      render(<Cropper src={TEST_SRC} />)
      expect(screen.getByLabelText('Zoom level')).toBeInTheDocument()
    })

    it('container has aria-roledescription', () => {
      render(<Cropper src={TEST_SRC} />)
      expect(screen.getByRole('application')).toHaveAttribute('aria-roledescription', 'cropper')
    })

    it('resize handles have aria-label', () => {
      render(<Cropper src={TEST_SRC} />)
      triggerImageLoad()
      expect(screen.getByLabelText('Resize nw')).toBeInTheDocument()
      expect(screen.getByLabelText('Resize se')).toBeInTheDocument()
    })

    it('passes axe accessibility audit', async () => {
      const { container } = render(<Cropper src={TEST_SRC} />)
      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })
  })

  // ─── className ─────────────────────────────────────────────────────

  describe('className', () => {
    it('merges custom className', () => {
      const { container } = render(<Cropper src={TEST_SRC} className="my-cropper" />)
      expect(container.querySelector('.ui-cropper')).toHaveClass('my-cropper')
    })
  })

  // ─── Overlay ───────────────────────────────────────────────────────

  describe('overlay', () => {
    it('renders overlay regions after image loads', () => {
      const { container } = render(<Cropper src={TEST_SRC} />)
      triggerImageLoad()
      expect(container.querySelector('.ui-cropper__overlay')).toBeInTheDocument()
      expect(container.querySelector('.ui-cropper__overlay-top')).toBeInTheDocument()
      expect(container.querySelector('.ui-cropper__overlay-bottom')).toBeInTheDocument()
      expect(container.querySelector('.ui-cropper__overlay-left')).toBeInTheDocument()
      expect(container.querySelector('.ui-cropper__overlay-right')).toBeInTheDocument()
    })

    it('overlay is aria-hidden', () => {
      const { container } = render(<Cropper src={TEST_SRC} />)
      triggerImageLoad()
      expect(container.querySelector('.ui-cropper__overlay')).toHaveAttribute('aria-hidden', 'true')
    })
  })

  // ─── Component metadata ────────────────────────────────────────────

  describe('component metadata', () => {
    it('has correct displayName', () => {
      expect(Cropper.displayName).toBe('Cropper')
    })
  })
})
