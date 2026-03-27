import { describe, it, expect, vi, afterEach, beforeEach } from 'vitest'
import { render, screen, cleanup, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { createRef } from 'react'
import { axe, toHaveNoViolations } from 'jest-axe'
import { AvatarUpload } from '../../components/avatar-upload'

expect.extend(toHaveNoViolations)

// Mock URL.createObjectURL/revokeObjectURL
const mockCreateObjectURL = vi.fn(() => 'blob:mock-url')
const mockRevokeObjectURL = vi.fn()

beforeEach(() => {
  globalThis.URL.createObjectURL = mockCreateObjectURL
  globalThis.URL.revokeObjectURL = mockRevokeObjectURL
})

afterEach(() => {
  cleanup()
  vi.restoreAllMocks()
})

function createMockFile(name = 'avatar.png', size = 1024, type = 'image/png'): File {
  const content = new Uint8Array(size)
  return new File([content], name, { type })
}

describe('AvatarUpload', () => {
  // ─── Rendering ──────────────────────────────────────────────────────

  describe('rendering', () => {
    it('renders root with ui-avatar-upload class', () => {
      const { container } = render(<AvatarUpload />)
      expect(container.querySelector('.ui-avatar-upload')).toBeInTheDocument()
    })

    it('renders container as a label element', () => {
      const { container } = render(<AvatarUpload />)
      expect(container.querySelector('label.ui-avatar-upload__container')).toBeInTheDocument()
    })

    it('renders file input', () => {
      const { container } = render(<AvatarUpload />)
      const input = container.querySelector('input[type="file"]')
      expect(input).toBeInTheDocument()
    })

    it('renders placeholder when no value', () => {
      const { container } = render(<AvatarUpload />)
      expect(container.querySelector('.ui-avatar-upload__placeholder')).toBeInTheDocument()
    })

    it('renders custom placeholder', () => {
      render(<AvatarUpload placeholder={<span data-testid="custom-ph">Pick</span>} />)
      expect(screen.getByTestId('custom-ph')).toBeInTheDocument()
    })

    it('renders image when value is provided', () => {
      render(<AvatarUpload value="https://example.com/avatar.jpg" />)
      const img = screen.getByAltText('Avatar')
      expect(img).toBeInTheDocument()
      expect(img).toHaveAttribute('src', 'https://example.com/avatar.jpg')
    })

    it('renders overlay when image is present', () => {
      const { container } = render(<AvatarUpload value="https://example.com/avatar.jpg" />)
      expect(container.querySelector('.ui-avatar-upload__overlay')).toBeInTheDocument()
    })

    it('renders "Change" text in overlay', () => {
      render(<AvatarUpload value="https://example.com/avatar.jpg" />)
      expect(screen.getByText('Change')).toBeInTheDocument()
    })
  })

  // ─── Shape ─────────────────────────────────────────────────────────

  describe('shape', () => {
    it('defaults to circle shape', () => {
      const { container } = render(<AvatarUpload />)
      expect(container.querySelector('.ui-avatar-upload')).toHaveAttribute('data-shape', 'circle')
    })

    it('supports square shape', () => {
      const { container } = render(<AvatarUpload shape="square" />)
      expect(container.querySelector('.ui-avatar-upload')).toHaveAttribute('data-shape', 'square')
    })
  })

  // ─── Size ──────────────────────────────────────────────────────────

  describe('size', () => {
    it('applies default size of 120px', () => {
      const { container } = render(<AvatarUpload />)
      const labelEl = container.querySelector('.ui-avatar-upload__container') as HTMLElement
      expect(labelEl.style.inlineSize).toBe('120px')
      expect(labelEl.style.blockSize).toBe('120px')
    })

    it('applies custom size', () => {
      const { container } = render(<AvatarUpload size={80} />)
      const labelEl = container.querySelector('.ui-avatar-upload__container') as HTMLElement
      expect(labelEl.style.inlineSize).toBe('80px')
      expect(labelEl.style.blockSize).toBe('80px')
    })
  })

  // ─── File upload ───────────────────────────────────────────────────

  describe('file upload', () => {
    it('calls onChange when file is selected', async () => {
      const onChange = vi.fn()
      const { container } = render(<AvatarUpload onChange={onChange} />)
      const input = container.querySelector('input[type="file"]') as HTMLInputElement
      const file = createMockFile()
      await userEvent.upload(input, file)
      expect(onChange).toHaveBeenCalledWith(file, 'blob:mock-url')
    })

    it('sets accept attribute on file input', () => {
      const { container } = render(<AvatarUpload accept=".png,.jpg" />)
      const input = container.querySelector('input[type="file"]')
      expect(input).toHaveAttribute('accept', '.png,.jpg')
    })

    it('defaults accept to "image/*"', () => {
      const { container } = render(<AvatarUpload />)
      const input = container.querySelector('input[type="file"]')
      expect(input).toHaveAttribute('accept', 'image/*')
    })

    it('has aria-label on file input', () => {
      const { container } = render(<AvatarUpload />)
      const input = container.querySelector('input[type="file"]')
      expect(input).toHaveAttribute('aria-label', 'Upload avatar file')
    })
  })

  // ─── Max size validation ──────────────────────────────────────────

  describe('max size validation', () => {
    it('shows error when file exceeds maxSize', async () => {
      const onChange = vi.fn()
      const { container } = render(
        <AvatarUpload onChange={onChange} maxSize={512} />
      )
      const input = container.querySelector('input[type="file"]') as HTMLInputElement
      const largeFile = createMockFile('big.png', 1024)
      await userEvent.upload(input, largeFile)
      expect(onChange).not.toHaveBeenCalled()
      expect(screen.getByRole('alert')).toBeInTheDocument()
      expect(screen.getByRole('alert').textContent).toContain('File too large')
    })

    it('does not show error when file is within maxSize', async () => {
      const onChange = vi.fn()
      const { container } = render(
        <AvatarUpload onChange={onChange} maxSize={2048} />
      )
      const input = container.querySelector('input[type="file"]') as HTMLInputElement
      const smallFile = createMockFile('small.png', 1024)
      await userEvent.upload(input, smallFile)
      expect(onChange).toHaveBeenCalled()
      expect(screen.queryByRole('alert')).not.toBeInTheDocument()
    })
  })

  // ─── Remove button ────────────────────────────────────────────────

  describe('remove', () => {
    it('renders remove button when value and onRemove are provided', () => {
      render(
        <AvatarUpload value="https://example.com/avatar.jpg" onRemove={() => {}} />
      )
      expect(screen.getByRole('button', { name: 'Remove avatar' })).toBeInTheDocument()
    })

    it('does not render remove button when no onRemove', () => {
      render(<AvatarUpload value="https://example.com/avatar.jpg" />)
      expect(screen.queryByRole('button', { name: 'Remove avatar' })).not.toBeInTheDocument()
    })

    it('calls onRemove when remove button is clicked', async () => {
      const onRemove = vi.fn()
      render(
        <AvatarUpload value="https://example.com/avatar.jpg" onRemove={onRemove} />
      )
      await userEvent.click(screen.getByRole('button', { name: 'Remove avatar' }))
      expect(onRemove).toHaveBeenCalledTimes(1)
    })

    it('does not render remove when no value', () => {
      render(<AvatarUpload onRemove={() => {}} />)
      expect(screen.queryByRole('button', { name: 'Remove avatar' })).not.toBeInTheDocument()
    })
  })

  // ─── Drag and drop ────────────────────────────────────────────────

  describe('drag and drop', () => {
    it('sets data-drag-over on dragover', () => {
      const { container } = render(<AvatarUpload />)
      const labelEl = container.querySelector('.ui-avatar-upload__container')!
      fireEvent.dragOver(labelEl, { dataTransfer: { files: [] } })
      expect(labelEl).toHaveAttribute('data-drag-over', 'true')
    })

    it('removes data-drag-over on dragleave', () => {
      const { container } = render(<AvatarUpload />)
      const labelEl = container.querySelector('.ui-avatar-upload__container')!
      fireEvent.dragOver(labelEl, { dataTransfer: { files: [] } })
      fireEvent.dragLeave(labelEl, { dataTransfer: { files: [] } })
      expect(labelEl).not.toHaveAttribute('data-drag-over')
    })

    it('processes dropped file', () => {
      const onChange = vi.fn()
      const { container } = render(<AvatarUpload onChange={onChange} />)
      const labelEl = container.querySelector('.ui-avatar-upload__container')!
      const file = createMockFile()
      fireEvent.drop(labelEl, {
        dataTransfer: { files: [file] },
      })
      expect(onChange).toHaveBeenCalledWith(file, 'blob:mock-url')
    })
  })

  // ─── Disabled ──────────────────────────────────────────────────────

  describe('disabled', () => {
    it('sets data-disabled when disabled', () => {
      const { container } = render(<AvatarUpload disabled />)
      expect(container.querySelector('.ui-avatar-upload')).toHaveAttribute('data-disabled', 'true')
    })

    it('sets aria-disabled on container label', () => {
      const { container } = render(<AvatarUpload disabled />)
      expect(container.querySelector('.ui-avatar-upload__container')).toHaveAttribute('aria-disabled', 'true')
    })

    it('disables file input', () => {
      const { container } = render(<AvatarUpload disabled />)
      expect(container.querySelector('input[type="file"]')).toBeDisabled()
    })

    it('does not process dropped file when disabled', () => {
      const onChange = vi.fn()
      const { container } = render(<AvatarUpload disabled onChange={onChange} />)
      const labelEl = container.querySelector('.ui-avatar-upload__container')!
      const file = createMockFile()
      fireEvent.drop(labelEl, {
        dataTransfer: { files: [file] },
      })
      expect(onChange).not.toHaveBeenCalled()
    })
  })

  // ─── Ref forwarding ───────────────────────────────────────────────

  describe('ref', () => {
    it('forwards ref to root div', () => {
      const ref = createRef<HTMLDivElement>()
      render(<AvatarUpload ref={ref} />)
      expect(ref.current).toBeInstanceOf(HTMLDivElement)
    })
  })

  // ─── Props forwarding ─────────────────────────────────────────────

  describe('props forwarding', () => {
    it('merges custom className', () => {
      const { container } = render(<AvatarUpload className="custom" />)
      const root = container.querySelector('.ui-avatar-upload')!
      expect(root.className).toContain('ui-avatar-upload')
      expect(root.className).toContain('custom')
    })

    it('forwards additional HTML attributes', () => {
      render(<AvatarUpload data-testid="my-upload" id="upload-1" />)
      const el = screen.getByTestId('my-upload')
      expect(el).toHaveAttribute('id', 'upload-1')
    })
  })

  // ─── Accessibility ────────────────────────────────────────────────

  describe('accessibility', () => {
    it('has no axe violations (empty)', async () => {
      const { container } = render(<AvatarUpload />)
      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })

    it('has no axe violations (with image)', async () => {
      const { container } = render(
        <AvatarUpload value="https://example.com/avatar.jpg" />
      )
      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })
  })

  // ─── Style injection ─────────────────────────────────────────────

  describe('style injection', () => {
    it('injects CSS on mount', () => {
      render(<AvatarUpload />)
      const styleTags = document.querySelectorAll('style[data-ui-style]')
      expect(styleTags.length).toBeGreaterThan(0)
    })

    it('CSS includes @scope (.ui-avatar-upload)', () => {
      render(<AvatarUpload />)
      const styleTags = document.querySelectorAll('style[data-ui-style]')
      const allCSS = Array.from(styleTags).map(s => s.textContent).join('')
      expect(allCSS).toContain('@scope (.ui-avatar-upload)')
    })
  })

  // ─── Display name ─────────────────────────────────────────────────

  describe('display name', () => {
    it('has displayName set to "AvatarUpload"', () => {
      expect(AvatarUpload.displayName).toBe('AvatarUpload')
    })
  })
})
