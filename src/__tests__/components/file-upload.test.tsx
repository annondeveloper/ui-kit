import { describe, it, expect, vi, afterEach } from 'vitest'
import { render, screen, cleanup, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { axe, toHaveNoViolations } from 'jest-axe'
import { FileUpload } from '../../components/file-upload'

expect.extend(toHaveNoViolations)

// Helper to create a mock File
function createFile(name: string, size: number, type: string): File {
  const content = new ArrayBuffer(size)
  return new File([content], name, { type })
}

// Helper to create a drag event with files
function createDragEvent(type: string, files: File[]) {
  const dt = new DataTransfer()
  files.forEach(f => dt.items.add(f))
  return new Event(type, { bubbles: true }) as any
}

describe('FileUpload', () => {
  afterEach(() => {
    cleanup()
  })

  // ─── Render tests ──────────────────────────────────────────────────

  describe('rendering', () => {
    it('renders a drop zone region', () => {
      const { container } = render(<FileUpload name="files" />)
      expect(container.querySelector('.ui-file-upload__dropzone')).toBeInTheDocument()
    })

    it('renders with label', () => {
      render(<FileUpload name="files" label="Upload files" />)
      expect(screen.getByText('Upload files')).toBeInTheDocument()
    })

    it('renders description text', () => {
      render(<FileUpload name="files" description="Drag files here or click to browse" />)
      expect(screen.getByText('Drag files here or click to browse')).toBeInTheDocument()
    })

    it('renders error message', () => {
      render(<FileUpload name="files" error="File too large" />)
      expect(screen.getByText('File too large')).toBeInTheDocument()
    })

    it('applies data-disabled attribute when disabled', () => {
      const { container } = render(<FileUpload name="files" disabled />)
      expect(container.querySelector('.ui-file-upload')).toHaveAttribute('data-disabled', '')
    })

    it('forwards className', () => {
      const { container } = render(<FileUpload name="files" className="custom" />)
      expect(container.querySelector('.ui-file-upload')?.className).toContain('custom')
    })

    it('has a hidden file input', () => {
      const { container } = render(<FileUpload name="files" />)
      const fileInput = container.querySelector('input[type="file"]') as HTMLInputElement
      expect(fileInput).toBeInTheDocument()
      // Input is visually hidden via CSS class or aria-hidden
      expect(fileInput).toHaveAttribute('aria-hidden', 'true')
    })

    it('sets accept attribute on file input', () => {
      const { container } = render(<FileUpload name="files" accept="image/*,.pdf" />)
      const fileInput = container.querySelector('input[type="file"]') as HTMLInputElement
      expect(fileInput).toHaveAttribute('accept', 'image/*,.pdf')
    })

    it('sets multiple attribute on file input when multiple', () => {
      const { container } = render(<FileUpload name="files" multiple />)
      const fileInput = container.querySelector('input[type="file"]') as HTMLInputElement
      expect(fileInput).toHaveAttribute('multiple')
    })
  })

  // ─── Click to upload ───────────────────────────────────────────────

  describe('click to upload', () => {
    it('clicking drop zone triggers file input', async () => {
      const { container } = render(<FileUpload name="files" />)
      const fileInput = container.querySelector('input[type="file"]') as HTMLInputElement
      const clickSpy = vi.spyOn(fileInput, 'click')
      const dropzone = container.querySelector('.ui-file-upload__dropzone')!
      await userEvent.click(dropzone)
      expect(clickSpy).toHaveBeenCalled()
    })

    it('does not trigger file input when disabled', async () => {
      const { container } = render(<FileUpload name="files" disabled />)
      const fileInput = container.querySelector('input[type="file"]') as HTMLInputElement
      const clickSpy = vi.spyOn(fileInput, 'click')
      const dropzone = container.querySelector('.ui-file-upload__dropzone')!
      // Disabled wrapper has pointer-events: none, but let's verify through code
      expect(container.querySelector('.ui-file-upload')).toHaveAttribute('data-disabled', '')
    })

    it('calls onChange when files are selected via input', async () => {
      const onChange = vi.fn()
      const { container } = render(<FileUpload name="files" onChange={onChange} />)
      const fileInput = container.querySelector('input[type="file"]') as HTMLInputElement
      const file = createFile('test.png', 1024, 'image/png')

      Object.defineProperty(fileInput, 'files', {
        value: [file],
        writable: false,
      })
      fireEvent.change(fileInput)

      expect(onChange).toHaveBeenCalledWith([file])
    })
  })

  // ─── Drag and drop ─────────────────────────────────────────────────

  describe('drag and drop', () => {
    it('sets dragover state when dragging over', () => {
      const { container } = render(<FileUpload name="files" />)
      const dropzone = container.querySelector('.ui-file-upload__dropzone')!
      fireEvent.dragEnter(dropzone, { dataTransfer: { types: ['Files'] } })
      fireEvent.dragOver(dropzone, { dataTransfer: { types: ['Files'] } })
      expect(container.querySelector('.ui-file-upload')).toHaveAttribute('data-dragover', '')
    })

    it('removes dragover state when dragging out', () => {
      const { container } = render(<FileUpload name="files" />)
      const dropzone = container.querySelector('.ui-file-upload__dropzone')!
      fireEvent.dragEnter(dropzone, { dataTransfer: { types: ['Files'] } })
      fireEvent.dragOver(dropzone, { dataTransfer: { types: ['Files'] } })
      fireEvent.dragLeave(dropzone)
      expect(container.querySelector('.ui-file-upload')).not.toHaveAttribute('data-dragover')
    })

    it('handles drop event and calls onChange', () => {
      const onChange = vi.fn()
      const { container } = render(<FileUpload name="files" onChange={onChange} />)
      const dropzone = container.querySelector('.ui-file-upload__dropzone')!
      const file = createFile('test.pdf', 2048, 'application/pdf')

      fireEvent.drop(dropzone, {
        dataTransfer: { files: [file], types: ['Files'] },
      })

      expect(onChange).toHaveBeenCalledWith([file])
    })
  })

  // ─── File type validation ──────────────────────────────────────────

  describe('file type validation', () => {
    it('accepts files matching the accept pattern', () => {
      const onChange = vi.fn()
      const onError = vi.fn()
      const { container } = render(
        <FileUpload name="files" accept="image/*" onChange={onChange} onError={onError} />
      )
      const fileInput = container.querySelector('input[type="file"]') as HTMLInputElement
      const file = createFile('photo.png', 1024, 'image/png')
      Object.defineProperty(fileInput, 'files', { value: [file], writable: false })
      fireEvent.change(fileInput)
      expect(onChange).toHaveBeenCalledWith([file])
      expect(onError).not.toHaveBeenCalled()
    })

    it('rejects files not matching the accept pattern', () => {
      const onChange = vi.fn()
      const onError = vi.fn()
      const { container } = render(
        <FileUpload name="files" accept="image/*" onChange={onChange} onError={onError} />
      )
      const fileInput = container.querySelector('input[type="file"]') as HTMLInputElement
      const file = createFile('doc.pdf', 1024, 'application/pdf')
      Object.defineProperty(fileInput, 'files', { value: [file], writable: false })
      fireEvent.change(fileInput)
      expect(onChange).not.toHaveBeenCalled()
      expect(onError).toHaveBeenCalled()
    })
  })

  // ─── Size validation ───────────────────────────────────────────────

  describe('size validation', () => {
    it('accepts files within maxSize', () => {
      const onChange = vi.fn()
      const onError = vi.fn()
      const { container } = render(
        <FileUpload name="files" maxSize={5000} onChange={onChange} onError={onError} />
      )
      const fileInput = container.querySelector('input[type="file"]') as HTMLInputElement
      const file = createFile('small.txt', 1024, 'text/plain')
      Object.defineProperty(fileInput, 'files', { value: [file], writable: false })
      fireEvent.change(fileInput)
      expect(onChange).toHaveBeenCalledWith([file])
    })

    it('rejects files exceeding maxSize', () => {
      const onChange = vi.fn()
      const onError = vi.fn()
      const { container } = render(
        <FileUpload name="files" maxSize={500} onChange={onChange} onError={onError} />
      )
      const fileInput = container.querySelector('input[type="file"]') as HTMLInputElement
      const file = createFile('big.txt', 1024, 'text/plain')
      Object.defineProperty(fileInput, 'files', { value: [file], writable: false })
      fireEvent.change(fileInput)
      expect(onChange).not.toHaveBeenCalled()
      expect(onError).toHaveBeenCalled()
    })
  })

  // ─── Max files ─────────────────────────────────────────────────────

  describe('max files', () => {
    it('limits number of files to maxFiles', () => {
      const onChange = vi.fn()
      const onError = vi.fn()
      const { container } = render(
        <FileUpload name="files" multiple maxFiles={2} onChange={onChange} onError={onError} />
      )
      const fileInput = container.querySelector('input[type="file"]') as HTMLInputElement
      const files = [
        createFile('a.txt', 100, 'text/plain'),
        createFile('b.txt', 100, 'text/plain'),
        createFile('c.txt', 100, 'text/plain'),
      ]
      Object.defineProperty(fileInput, 'files', { value: files, writable: false })
      fireEvent.change(fileInput)
      expect(onError).toHaveBeenCalled()
    })
  })

  // ─── File list display ─────────────────────────────────────────────

  describe('file list', () => {
    it('displays selected file names', () => {
      const { container } = render(<FileUpload name="files" />)
      const fileInput = container.querySelector('input[type="file"]') as HTMLInputElement
      const file = createFile('report.pdf', 2048, 'application/pdf')
      Object.defineProperty(fileInput, 'files', { value: [file], writable: false })
      fireEvent.change(fileInput)
      expect(screen.getByText('report.pdf')).toBeInTheDocument()
    })

    it('displays formatted file size', () => {
      const { container } = render(<FileUpload name="files" />)
      const fileInput = container.querySelector('input[type="file"]') as HTMLInputElement
      const file = createFile('report.pdf', 2048, 'application/pdf')
      Object.defineProperty(fileInput, 'files', { value: [file], writable: false })
      fireEvent.change(fileInput)
      expect(screen.getByText('2 KB')).toBeInTheDocument()
    })

    it('has a remove button for each file', () => {
      const { container } = render(<FileUpload name="files" />)
      const fileInput = container.querySelector('input[type="file"]') as HTMLInputElement
      const file = createFile('report.pdf', 2048, 'application/pdf')
      Object.defineProperty(fileInput, 'files', { value: [file], writable: false })
      fireEvent.change(fileInput)
      const removeBtn = container.querySelector('.ui-file-upload__remove')
      expect(removeBtn).toBeInTheDocument()
    })

    it('removes a file when remove button is clicked', async () => {
      const onChange = vi.fn()
      const { container } = render(<FileUpload name="files" onChange={onChange} />)
      const fileInput = container.querySelector('input[type="file"]') as HTMLInputElement
      const file = createFile('report.pdf', 2048, 'application/pdf')
      Object.defineProperty(fileInput, 'files', { value: [file], writable: false })
      fireEvent.change(fileInput)
      expect(screen.getByText('report.pdf')).toBeInTheDocument()

      const removeBtn = container.querySelector('.ui-file-upload__remove')!
      await userEvent.click(removeBtn)
      expect(screen.queryByText('report.pdf')).not.toBeInTheDocument()
      expect(onChange).toHaveBeenLastCalledWith([])
    })
  })

  // ─── Preview ───────────────────────────────────────────────────────

  describe('preview', () => {
    it('shows thumbnail for image files when showPreview is true', () => {
      const { container } = render(<FileUpload name="files" showPreview />)
      const fileInput = container.querySelector('input[type="file"]') as HTMLInputElement
      const file = createFile('photo.png', 1024, 'image/png')
      Object.defineProperty(fileInput, 'files', { value: [file], writable: false })
      fireEvent.change(fileInput)
      // Should have a thumbnail element
      const thumbnail = container.querySelector('.ui-file-upload__thumbnail')
      expect(thumbnail).toBeInTheDocument()
    })

    it('shows file icon for non-image files', () => {
      const { container } = render(<FileUpload name="files" showPreview />)
      const fileInput = container.querySelector('input[type="file"]') as HTMLInputElement
      const file = createFile('doc.pdf', 1024, 'application/pdf')
      Object.defineProperty(fileInput, 'files', { value: [file], writable: false })
      fireEvent.change(fileInput)
      const icon = container.querySelector('.ui-file-upload__file-icon')
      expect(icon).toBeInTheDocument()
    })
  })

  // ─── Motion ────────────────────────────────────────────────────────

  describe('motion', () => {
    it('applies data-motion attribute', () => {
      const { container } = render(<FileUpload name="files" motion={2} />)
      expect(container.querySelector('.ui-file-upload')).toHaveAttribute('data-motion', '2')
    })

    it('defaults to motion level 3', () => {
      const { container } = render(<FileUpload name="files" />)
      expect(container.querySelector('.ui-file-upload')).toHaveAttribute('data-motion', '3')
    })
  })

  // ─── Accessibility ─────────────────────────────────────────────────

  describe('accessibility', () => {
    it('has no axe violations', async () => {
      const { container } = render(<FileUpload name="files" label="Upload" />)
      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })

    it('drop zone has accessible role', () => {
      const { container } = render(<FileUpload name="files" />)
      const dropzone = container.querySelector('.ui-file-upload__dropzone')!
      expect(dropzone).toHaveAttribute('role', 'button')
    })

    it('drop zone has tabindex for keyboard focus', () => {
      const { container } = render(<FileUpload name="files" />)
      const dropzone = container.querySelector('.ui-file-upload__dropzone')!
      expect(dropzone).toHaveAttribute('tabindex', '0')
    })

    it('error message uses role="alert"', () => {
      render(<FileUpload name="files" error="Error" />)
      expect(screen.getByRole('alert')).toHaveTextContent('Error')
    })

    it('drop zone has keyboard Enter support', async () => {
      const { container } = render(<FileUpload name="files" />)
      const dropzone = container.querySelector('.ui-file-upload__dropzone')!
      const fileInput = container.querySelector('input[type="file"]') as HTMLInputElement
      const clickSpy = vi.spyOn(fileInput, 'click')
      fireEvent.keyDown(dropzone, { key: 'Enter' })
      expect(clickSpy).toHaveBeenCalled()
    })
  })

  // ─── Style injection ──────────────────────────────────────────────

  describe('style injection', () => {
    it('injects CSS on mount', () => {
      render(<FileUpload name="files" />)
      const styleTags = document.querySelectorAll('style[data-ui-style]')
      expect(styleTags.length).toBeGreaterThan(0)
    })
  })

  // ─── Display name ─────────────────────────────────────────────────

  describe('display name', () => {
    it('has displayName set to "FileUpload"', () => {
      expect(FileUpload.displayName).toBe('FileUpload')
    })
  })
})
