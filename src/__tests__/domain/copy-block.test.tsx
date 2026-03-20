import { describe, it, expect, vi, afterEach } from 'vitest'
import { render, screen, cleanup } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { axe, toHaveNoViolations } from 'jest-axe'
import { CopyBlock } from '../../domain/copy-block'

expect.extend(toHaveNoViolations)

afterEach(() => {
  cleanup()
  vi.restoreAllMocks()
})

describe('CopyBlock', () => {
  // ─── Rendering ──────────────────────────────────────────────────────

  describe('rendering', () => {
    it('renders with scope class', () => {
      const { container } = render(<CopyBlock code="const x = 1" />)
      expect(container.querySelector('.ui-copy-block')).toBeInTheDocument()
    })

    it('renders code in a pre>code structure', () => {
      const { container } = render(<CopyBlock code="const x = 1" />)
      const pre = container.querySelector('pre')
      expect(pre).toBeInTheDocument()
      const code = pre?.querySelector('code')
      expect(code).toBeInTheDocument()
    })

    it('displays the code text', () => {
      render(<CopyBlock code="console.log('hello')" />)
      expect(screen.getByText(/console/)).toBeInTheDocument()
    })

    it('applies custom className', () => {
      const { container } = render(<CopyBlock code="x" className="custom" />)
      expect(container.querySelector('.custom')).toBeInTheDocument()
    })

    it('passes through HTML attributes', () => {
      render(<CopyBlock code="x" data-testid="my-block" />)
      expect(screen.getByTestId('my-block')).toBeInTheDocument()
    })

    it('has displayName', () => {
      expect(CopyBlock.displayName).toBe('CopyBlock')
    })
  })

  // ─── Line Numbers ──────────────────────────────────────────────────

  describe('line numbers', () => {
    it('shows line numbers by default', () => {
      const { container } = render(<CopyBlock code={'line1\nline2\nline3'} />)
      const gutterLines = container.querySelectorAll('.ui-copy-block__line-number')
      expect(gutterLines.length).toBe(3)
    })

    it('shows correct line number values', () => {
      const { container } = render(<CopyBlock code={'a\nb\nc'} />)
      const gutterLines = container.querySelectorAll('.ui-copy-block__line-number')
      expect(gutterLines[0]?.textContent).toBe('1')
      expect(gutterLines[1]?.textContent).toBe('2')
      expect(gutterLines[2]?.textContent).toBe('3')
    })

    it('hides line numbers when showLineNumbers=false', () => {
      const { container } = render(
        <CopyBlock code={'a\nb'} showLineNumbers={false} />
      )
      expect(container.querySelector('.ui-copy-block__line-number')).not.toBeInTheDocument()
    })
  })

  // ─── Syntax Highlighting ────────────────────────────────────────────

  describe('syntax highlighting', () => {
    it('highlights JavaScript keywords', () => {
      const { container } = render(
        <CopyBlock code="const x = 1" language="javascript" />
      )
      const keyword = container.querySelector('.ui-copy-block__token--keyword')
      expect(keyword).toBeInTheDocument()
      expect(keyword?.textContent).toBe('const')
    })

    it('highlights strings', () => {
      const { container } = render(
        <CopyBlock code={`const x = "hello"`} language="javascript" />
      )
      const str = container.querySelector('.ui-copy-block__token--string')
      expect(str).toBeInTheDocument()
      expect(str?.textContent).toContain('hello')
    })

    it('highlights comments', () => {
      const { container } = render(
        <CopyBlock code="// a comment" language="javascript" />
      )
      const comment = container.querySelector('.ui-copy-block__token--comment')
      expect(comment).toBeInTheDocument()
      expect(comment?.textContent).toContain('a comment')
    })

    it('highlights numbers', () => {
      const { container } = render(
        <CopyBlock code="const x = 42" language="javascript" />
      )
      const num = container.querySelector('.ui-copy-block__token--number')
      expect(num).toBeInTheDocument()
      expect(num?.textContent).toBe('42')
    })

    it('renders text language without token spans', () => {
      const { container } = render(
        <CopyBlock code="just plain text" language="text" />
      )
      expect(container.querySelector('.ui-copy-block__token--keyword')).not.toBeInTheDocument()
    })

    it('highlights JSON keys', () => {
      const { container } = render(
        <CopyBlock code='{ "name": "value" }' language="json" />
      )
      const key = container.querySelector('.ui-copy-block__token--keyword')
      expect(key).toBeInTheDocument()
    })

    it('highlights JSON booleans', () => {
      const { container } = render(
        <CopyBlock code='{ "active": true }' language="json" />
      )
      const bool = container.querySelector('.ui-copy-block__token--keyword')
      expect(bool).toBeInTheDocument()
    })

    it('highlights CSS properties', () => {
      const { container } = render(
        <CopyBlock code="color: red;" language="css" />
      )
      const prop = container.querySelector('.ui-copy-block__token--keyword')
      expect(prop).toBeInTheDocument()
    })

    it('highlights bash flags', () => {
      const { container } = render(
        <CopyBlock code="npm install --save" language="bash" />
      )
      const flag = container.querySelector('.ui-copy-block__token--keyword')
      expect(flag).toBeInTheDocument()
    })
  })

  // ─── Highlight Lines ────────────────────────────────────────────────

  describe('highlight lines', () => {
    it('highlights specified lines', () => {
      const { container } = render(
        <CopyBlock code={'a\nb\nc'} highlight={[2]} />
      )
      const lines = container.querySelectorAll('.ui-copy-block__line')
      expect(lines[1]).toHaveAttribute('data-highlighted')
    })

    it('does not highlight non-specified lines', () => {
      const { container } = render(
        <CopyBlock code={'a\nb\nc'} highlight={[2]} />
      )
      const lines = container.querySelectorAll('.ui-copy-block__line')
      expect(lines[0]).not.toHaveAttribute('data-highlighted')
      expect(lines[2]).not.toHaveAttribute('data-highlighted')
    })

    it('supports multiple highlighted lines', () => {
      const { container } = render(
        <CopyBlock code={'a\nb\nc\nd'} highlight={[1, 3]} />
      )
      const lines = container.querySelectorAll('.ui-copy-block__line')
      expect(lines[0]).toHaveAttribute('data-highlighted')
      expect(lines[2]).toHaveAttribute('data-highlighted')
    })
  })

  // ─── Copy Button ─────────────────────────────────────────────────

  describe('copy button', () => {
    it('renders a copy button', () => {
      render(<CopyBlock code="x" />)
      expect(screen.getByRole('button', { name: /copy/i })).toBeInTheDocument()
    })

    it('copies code to clipboard on click', async () => {
      const mockClipboard = { writeText: vi.fn().mockResolvedValue(undefined) }
      Object.assign(navigator, { clipboard: mockClipboard })

      render(<CopyBlock code="const x = 1" />)
      await userEvent.click(screen.getByRole('button', { name: /copy/i }))
      expect(mockClipboard.writeText).toHaveBeenCalledWith('const x = 1')
    })

    it('shows "Copied!" feedback after copying', async () => {
      const mockClipboard = { writeText: vi.fn().mockResolvedValue(undefined) }
      Object.assign(navigator, { clipboard: mockClipboard })

      render(<CopyBlock code="x" />)
      await userEvent.click(screen.getByRole('button', { name: /copy/i }))
      expect(screen.getByText(/copied/i)).toBeInTheDocument()
    })
  })

  // ─── Title Header ──────────────────────────────────────────────────

  describe('title header', () => {
    it('renders title when provided', () => {
      render(<CopyBlock code="x" title="index.ts" />)
      expect(screen.getByText('index.ts')).toBeInTheDocument()
    })

    it('does not render header when no title', () => {
      const { container } = render(<CopyBlock code="x" />)
      expect(container.querySelector('.ui-copy-block__header')).not.toBeInTheDocument()
    })

    it('renders language badge when language is specified', () => {
      const { container } = render(
        <CopyBlock code="x" title="file.ts" language="typescript" />
      )
      const badge = container.querySelector('.ui-copy-block__lang-badge')
      expect(badge).toBeInTheDocument()
      expect(badge?.textContent).toBe('typescript')
    })
  })

  // ─── Max Height ─────────────────────────────────────────────────────

  describe('max height', () => {
    it('applies maxHeight to code container', () => {
      const { container } = render(
        <CopyBlock code={'a\nb\nc'} maxHeight="200px" />
      )
      const codeArea = container.querySelector('.ui-copy-block__body') as HTMLElement
      expect(codeArea?.style.maxHeight).toBe('200px')
    })

    it('does not set maxHeight when not provided', () => {
      const { container } = render(<CopyBlock code="x" />)
      const codeArea = container.querySelector('.ui-copy-block__body') as HTMLElement
      expect(codeArea?.style.maxHeight).toBeFalsy()
    })
  })

  // ─── Accessibility ──────────────────────────────────────────────────

  describe('accessibility', () => {
    it('has no axe violations', async () => {
      const { container } = render(
        <CopyBlock code="const x = 1" title="example.ts" />
      )
      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })

    it('code block has appropriate role', () => {
      const { container } = render(<CopyBlock code="x" />)
      const code = container.querySelector('code')
      expect(code).toBeInTheDocument()
    })

    it('copy button is keyboard accessible', async () => {
      const mockClipboard = { writeText: vi.fn().mockResolvedValue(undefined) }
      Object.assign(navigator, { clipboard: mockClipboard })

      render(<CopyBlock code="x" />)
      const btn = screen.getByRole('button', { name: /copy/i })
      btn.focus()
      await userEvent.keyboard('{Enter}')
      expect(mockClipboard.writeText).toHaveBeenCalled()
    })
  })
})
