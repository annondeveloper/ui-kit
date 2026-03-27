import { describe, it, expect, vi, afterEach } from 'vitest'
import { render, screen, cleanup, fireEvent } from '@testing-library/react'
import { axe, toHaveNoViolations } from 'jest-axe'
import { CodeEditor } from '../../domain/code-editor'

expect.extend(toHaveNoViolations)

const sampleCode = `function hello() {
  const name = "world"
  return \`Hello, \${name}!\`
}`

describe('CodeEditor', () => {
  afterEach(cleanup)

  // ─── Rendering ──────────────────────────────────────────────────────

  describe('rendering', () => {
    it('renders the code editor container', () => {
      const { container } = render(<CodeEditor />)
      expect(container.querySelector('.ui-code-editor')).toBeInTheDocument()
    })

    it('renders with default value', () => {
      render(<CodeEditor defaultValue={sampleCode} />)
      const textarea = screen.getByRole('textbox')
      expect(textarea).toHaveValue(sampleCode)
    })

    it('renders with controlled value', () => {
      render(<CodeEditor value={sampleCode} />)
      const textarea = screen.getByRole('textbox')
      expect(textarea).toHaveValue(sampleCode)
    })

    it('renders placeholder', () => {
      render(<CodeEditor placeholder="Type code here..." />)
      expect(screen.getByPlaceholderText('Type code here...')).toBeInTheDocument()
    })

    it('renders highlighted code in pre layer', () => {
      const { container } = render(<CodeEditor defaultValue="const x = 42" language="javascript" />)
      const pre = container.querySelector('.ui-code-editor__pre')
      expect(pre).toBeInTheDocument()
    })
  })

  // ─── Line numbers ────────────────────────────────────────────────

  describe('line numbers', () => {
    it('shows line numbers by default', () => {
      const { container } = render(<CodeEditor defaultValue={sampleCode} />)
      const gutter = container.querySelector('.ui-code-editor__gutter')
      expect(gutter).toBeInTheDocument()
    })

    it('hides line numbers when showLineNumbers is false', () => {
      const { container } = render(<CodeEditor defaultValue={sampleCode} showLineNumbers={false} />)
      const gutter = container.querySelector('.ui-code-editor__gutter')
      expect(gutter).not.toBeInTheDocument()
    })

    it('starts line numbers from lineNumberStart', () => {
      const code = 'a\nb\nc'
      const { container } = render(<CodeEditor defaultValue={code} lineNumberStart={10} />)
      const lineNums = container.querySelectorAll('.ui-code-editor__line-number')
      expect(lineNums[0]).toHaveTextContent('10')
      expect(lineNums[1]).toHaveTextContent('11')
      expect(lineNums[2]).toHaveTextContent('12')
    })

    it('renders correct number of line numbers', () => {
      const { container } = render(<CodeEditor defaultValue={sampleCode} />)
      const lineNums = container.querySelectorAll('.ui-code-editor__line-number')
      expect(lineNums.length).toBe(sampleCode.split('\n').length)
    })
  })

  // ─── Syntax highlighting ─────────────────────────────────────────

  describe('syntax highlighting', () => {
    it('highlights keywords', () => {
      const { container } = render(
        <CodeEditor defaultValue="const x = 1" language="javascript" />
      )
      const keyword = container.querySelector('.ui-code-editor__token--keyword')
      expect(keyword).toBeInTheDocument()
      expect(keyword).toHaveTextContent('const')
    })

    it('highlights strings', () => {
      const { container } = render(
        <CodeEditor defaultValue='const x = "hello"' language="javascript" />
      )
      const str = container.querySelector('.ui-code-editor__token--string')
      expect(str).toBeInTheDocument()
    })

    it('highlights numbers', () => {
      const { container } = render(
        <CodeEditor defaultValue="const x = 42" language="javascript" />
      )
      const num = container.querySelector('.ui-code-editor__token--number')
      expect(num).toBeInTheDocument()
      expect(num).toHaveTextContent('42')
    })

    it('highlights comments', () => {
      const { container } = render(
        <CodeEditor defaultValue="// comment" language="javascript" />
      )
      const comment = container.querySelector('.ui-code-editor__token--comment')
      expect(comment).toBeInTheDocument()
    })

    it('highlights python keywords', () => {
      const { container } = render(
        <CodeEditor defaultValue="def foo():" language="python" />
      )
      const keyword = container.querySelector('.ui-code-editor__token--keyword')
      expect(keyword).toHaveTextContent('def')
    })

    it('renders plain text for plain language', () => {
      const { container } = render(
        <CodeEditor defaultValue="hello world" language="plain" />
      )
      expect(container.querySelector('.ui-code-editor__token--keyword')).not.toBeInTheDocument()
    })
  })

  // ─── Tab handling ─────────────────────────────────────────────────

  describe('tab handling', () => {
    it('inserts spaces on Tab key', () => {
      const onChange = vi.fn()
      render(<CodeEditor defaultValue="hello" onChange={onChange} />)
      const textarea = screen.getByRole('textbox')
      // Set cursor at start
      fireEvent.keyDown(textarea, { key: 'Tab' })
      expect(onChange).toHaveBeenCalled()
    })

    it('does not change focus on Tab', () => {
      render(<CodeEditor defaultValue="hello" />)
      const textarea = screen.getByRole('textbox')
      const prevented = fireEvent.keyDown(textarea, { key: 'Tab' })
      // fireEvent returns false when preventDefault was called
      expect(prevented).toBe(false)
    })
  })

  // ─── Read only ────────────────────────────────────────────────────

  describe('read only', () => {
    it('sets readOnly on textarea', () => {
      render(<CodeEditor defaultValue="hello" readOnly />)
      const textarea = screen.getByRole('textbox')
      expect(textarea).toHaveAttribute('readOnly')
    })
  })

  // ─── onChange ─────────────────────────────────────────────────────

  describe('onChange', () => {
    it('calls onChange when typing', () => {
      const onChange = vi.fn()
      render(<CodeEditor defaultValue="" onChange={onChange} />)
      const textarea = screen.getByRole('textbox')
      fireEvent.change(textarea, { target: { value: 'hello' } })
      expect(onChange).toHaveBeenCalledWith('hello')
    })
  })

  // ─── Word wrap ────────────────────────────────────────────────────

  describe('word wrap', () => {
    it('applies word-wrap data attribute when wordWrap is true', () => {
      const { container } = render(<CodeEditor defaultValue="hello" wordWrap />)
      const textarea = container.querySelector('.ui-code-editor__textarea')
      expect(textarea).toHaveAttribute('data-word-wrap')
    })

    it('does not apply word-wrap by default', () => {
      const { container } = render(<CodeEditor defaultValue="hello" />)
      const textarea = container.querySelector('.ui-code-editor__textarea')
      expect(textarea).not.toHaveAttribute('data-word-wrap')
    })
  })

  // ─── Motion ─────────────────────────────────────────────────────

  describe('motion', () => {
    it('sets data-motion attribute', () => {
      const { container } = render(<CodeEditor motion={0} />)
      expect(container.querySelector('.ui-code-editor')).toHaveAttribute('data-motion', '0')
    })

    it('sets data-motion to 3', () => {
      const { container } = render(<CodeEditor motion={3} />)
      expect(container.querySelector('.ui-code-editor')).toHaveAttribute('data-motion', '3')
    })
  })

  // ─── Accessibility ─────────────────────────────────────────────

  describe('accessibility', () => {
    it('has no axe violations', async () => {
      const { container } = render(<CodeEditor defaultValue={sampleCode} />)
      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })

    it('has role="group" on the container', () => {
      render(<CodeEditor />)
      expect(screen.getByRole('group')).toBeInTheDocument()
    })

    it('has aria-label on the container', () => {
      render(<CodeEditor />)
      expect(screen.getByRole('group')).toHaveAttribute('aria-label', 'Code editor')
    })

    it('textarea has aria-label', () => {
      render(<CodeEditor />)
      expect(screen.getByLabelText('Code input')).toBeInTheDocument()
    })

    it('textarea has aria-multiline', () => {
      render(<CodeEditor />)
      const textarea = screen.getByRole('textbox')
      expect(textarea).toHaveAttribute('aria-multiline', 'true')
    })

    it('gutter is aria-hidden', () => {
      const { container } = render(<CodeEditor defaultValue="hello" />)
      const gutter = container.querySelector('.ui-code-editor__gutter')
      expect(gutter).toHaveAttribute('aria-hidden', 'true')
    })

    it('pre layer is aria-hidden', () => {
      const { container } = render(<CodeEditor defaultValue="hello" />)
      const pre = container.querySelector('.ui-code-editor__pre')
      expect(pre).toHaveAttribute('aria-hidden', 'true')
    })
  })

  // ─── Edge cases ─────────────────────────────────────────────────

  describe('edge cases', () => {
    it('renders empty editor', () => {
      const { container } = render(<CodeEditor />)
      expect(container.querySelector('.ui-code-editor')).toBeInTheDocument()
    })

    it('passes additional className', () => {
      const { container } = render(<CodeEditor className="custom" />)
      expect(container.querySelector('.ui-code-editor.custom')).toBeInTheDocument()
    })

    it('applies height constraints', () => {
      const { container } = render(<CodeEditor minHeight={200} maxHeight={500} />)
      const editor = container.querySelector('.ui-code-editor') as HTMLElement
      expect(editor.style.minBlockSize).toBe('200px')
      expect(editor.style.maxBlockSize).toBe('500px')
    })

    it('disables spellcheck', () => {
      render(<CodeEditor />)
      const textarea = screen.getByRole('textbox')
      expect(textarea).toHaveAttribute('spellcheck', 'false')
    })
  })
})
