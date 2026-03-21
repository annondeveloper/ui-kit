import { describe, it, expect, vi, afterEach } from 'vitest'
import { render, screen, cleanup, fireEvent } from '@testing-library/react'
import { createRef } from 'react'
import { axe, toHaveNoViolations } from 'jest-axe'
import { TagInput } from '../../components/tag-input'

expect.extend(toHaveNoViolations)

describe('TagInput', () => {
  afterEach(() => {
    cleanup()
  })

  // ─── Render tests ──────────────────────────────────────────────────

  describe('rendering', () => {
    it('renders a container div', () => {
      const { container } = render(<TagInput tags={[]} onChange={vi.fn()} aria-label="Tags" />)
      expect(container.querySelector('.ui-tag-input')).toBeInTheDocument()
    })

    it('applies ui-tag-input class', () => {
      const { container } = render(<TagInput tags={[]} onChange={vi.fn()} aria-label="Tags" />)
      expect(container.querySelector('.ui-tag-input')).toBeInTheDocument()
    })

    it('renders an input element', () => {
      render(<TagInput tags={[]} onChange={vi.fn()} aria-label="Tags" />)
      expect(screen.getByRole('textbox')).toBeInTheDocument()
    })

    it('renders existing tags', () => {
      render(<TagInput tags={['React', 'Vue']} onChange={vi.fn()} aria-label="Tags" />)
      expect(screen.getByText('React')).toBeInTheDocument()
      expect(screen.getByText('Vue')).toBeInTheDocument()
    })

    it('renders placeholder', () => {
      render(<TagInput tags={[]} onChange={vi.fn()} placeholder="Add tags..." aria-label="Tags" />)
      expect(screen.getByPlaceholderText('Add tags...')).toBeInTheDocument()
    })

    it('renders with size="md" by default', () => {
      const { container } = render(<TagInput tags={[]} onChange={vi.fn()} aria-label="Tags" />)
      expect(container.querySelector('.ui-tag-input')).toHaveAttribute('data-size', 'md')
    })

    it('renders with size="sm"', () => {
      const { container } = render(<TagInput tags={[]} onChange={vi.fn()} aria-label="Tags" size="sm" />)
      expect(container.querySelector('.ui-tag-input')).toHaveAttribute('data-size', 'sm')
    })

    it('renders with size="lg"', () => {
      const { container } = render(<TagInput tags={[]} onChange={vi.fn()} aria-label="Tags" size="lg" />)
      expect(container.querySelector('.ui-tag-input')).toHaveAttribute('data-size', 'lg')
    })
  })

  // ─── Adding tags ──────────────────────────────────────────────────

  describe('adding tags', () => {
    it('adds tag on Enter', () => {
      const onChange = vi.fn()
      render(<TagInput tags={['existing']} onChange={onChange} aria-label="Tags" />)
      const input = screen.getByRole('textbox')

      fireEvent.change(input, { target: { value: 'new-tag' } })
      fireEvent.keyDown(input, { key: 'Enter' })
      expect(onChange).toHaveBeenCalledWith(['existing', 'new-tag'])
    })

    it('adds tag on comma', () => {
      const onChange = vi.fn()
      render(<TagInput tags={[]} onChange={onChange} aria-label="Tags" />)
      const input = screen.getByRole('textbox')

      fireEvent.change(input, { target: { value: 'tag1,' } })
      fireEvent.keyDown(input, { key: ',' })
      expect(onChange).toHaveBeenCalledWith(['tag1'])
    })

    it('adds tag on Tab', () => {
      const onChange = vi.fn()
      render(<TagInput tags={[]} onChange={onChange} aria-label="Tags" />)
      const input = screen.getByRole('textbox')

      fireEvent.change(input, { target: { value: 'tag-tab' } })
      fireEvent.keyDown(input, { key: 'Tab' })
      expect(onChange).toHaveBeenCalledWith(['tag-tab'])
    })

    it('trims whitespace from tags', () => {
      const onChange = vi.fn()
      render(<TagInput tags={[]} onChange={onChange} aria-label="Tags" />)
      const input = screen.getByRole('textbox')

      fireEvent.change(input, { target: { value: '  spaced  ' } })
      fireEvent.keyDown(input, { key: 'Enter' })
      expect(onChange).toHaveBeenCalledWith(['spaced'])
    })

    it('does not add empty tags', () => {
      const onChange = vi.fn()
      render(<TagInput tags={[]} onChange={onChange} aria-label="Tags" />)
      const input = screen.getByRole('textbox')

      fireEvent.change(input, { target: { value: '' } })
      fireEvent.keyDown(input, { key: 'Enter' })
      expect(onChange).not.toHaveBeenCalled()
    })

    it('clears input after adding tag', () => {
      const onChange = vi.fn()
      render(<TagInput tags={[]} onChange={onChange} aria-label="Tags" />)
      const input = screen.getByRole('textbox') as HTMLInputElement

      fireEvent.change(input, { target: { value: 'hello' } })
      fireEvent.keyDown(input, { key: 'Enter' })
      expect(input.value).toBe('')
    })
  })

  // ─── Removing tags ────────────────────────────────────────────────

  describe('removing tags', () => {
    it('removes tag when X button is clicked', () => {
      const onChange = vi.fn()
      render(<TagInput tags={['a', 'b', 'c']} onChange={onChange} aria-label="Tags" />)
      const removeButtons = screen.getAllByRole('button', { name: /remove/i })
      fireEvent.click(removeButtons[1]) // Remove 'b'
      expect(onChange).toHaveBeenCalledWith(['a', 'c'])
    })

    it('removes last tag on backspace when input is empty', () => {
      const onChange = vi.fn()
      render(<TagInput tags={['a', 'b']} onChange={onChange} aria-label="Tags" />)
      const input = screen.getByRole('textbox')

      fireEvent.keyDown(input, { key: 'Backspace' })
      expect(onChange).toHaveBeenCalledWith(['a'])
    })

    it('does not remove tag on backspace when input has value', () => {
      const onChange = vi.fn()
      render(<TagInput tags={['a', 'b']} onChange={onChange} aria-label="Tags" />)
      const input = screen.getByRole('textbox')

      fireEvent.change(input, { target: { value: 'typing' } })
      fireEvent.keyDown(input, { key: 'Backspace' })
      expect(onChange).not.toHaveBeenCalled()
    })
  })

  // ─── Duplicate prevention ────────────────────────────────────────

  describe('duplicate prevention', () => {
    it('prevents duplicate tags by default', () => {
      const onChange = vi.fn()
      render(<TagInput tags={['react']} onChange={onChange} aria-label="Tags" />)
      const input = screen.getByRole('textbox')

      fireEvent.change(input, { target: { value: 'react' } })
      fireEvent.keyDown(input, { key: 'Enter' })
      expect(onChange).not.toHaveBeenCalled()
    })

    it('allows duplicates when allowDuplicates is true', () => {
      const onChange = vi.fn()
      render(<TagInput tags={['react']} onChange={onChange} allowDuplicates aria-label="Tags" />)
      const input = screen.getByRole('textbox')

      fireEvent.change(input, { target: { value: 'react' } })
      fireEvent.keyDown(input, { key: 'Enter' })
      expect(onChange).toHaveBeenCalledWith(['react', 'react'])
    })
  })

  // ─── Max tags ─────────────────────────────────────────────────────

  describe('maxTags', () => {
    it('prevents adding tags beyond maxTags', () => {
      const onChange = vi.fn()
      render(<TagInput tags={['a', 'b']} onChange={onChange} maxTags={2} aria-label="Tags" />)
      const input = screen.getByRole('textbox')

      fireEvent.change(input, { target: { value: 'c' } })
      fireEvent.keyDown(input, { key: 'Enter' })
      expect(onChange).not.toHaveBeenCalled()
    })

    it('allows adding when under maxTags', () => {
      const onChange = vi.fn()
      render(<TagInput tags={['a']} onChange={onChange} maxTags={3} aria-label="Tags" />)
      const input = screen.getByRole('textbox')

      fireEvent.change(input, { target: { value: 'b' } })
      fireEvent.keyDown(input, { key: 'Enter' })
      expect(onChange).toHaveBeenCalledWith(['a', 'b'])
    })
  })

  // ─── Validation ───────────────────────────────────────────────────

  describe('validation', () => {
    it('rejects tags that fail validation', () => {
      const onChange = vi.fn()
      const validate = (tag: string) => tag.length >= 3
      render(<TagInput tags={[]} onChange={onChange} validate={validate} aria-label="Tags" />)
      const input = screen.getByRole('textbox')

      fireEvent.change(input, { target: { value: 'ab' } })
      fireEvent.keyDown(input, { key: 'Enter' })
      expect(onChange).not.toHaveBeenCalled()
    })

    it('accepts tags that pass validation', () => {
      const onChange = vi.fn()
      const validate = (tag: string) => tag.length >= 3
      render(<TagInput tags={[]} onChange={onChange} validate={validate} aria-label="Tags" />)
      const input = screen.getByRole('textbox')

      fireEvent.change(input, { target: { value: 'abc' } })
      fireEvent.keyDown(input, { key: 'Enter' })
      expect(onChange).toHaveBeenCalledWith(['abc'])
    })
  })

  // ─── Disabled state ───────────────────────────────────────────────

  describe('disabled state', () => {
    it('disables the input when disabled is true', () => {
      render(<TagInput tags={['a']} onChange={vi.fn()} disabled aria-label="Tags" />)
      expect(screen.getByRole('textbox')).toBeDisabled()
    })

    it('does not show remove buttons when disabled', () => {
      render(<TagInput tags={['a', 'b']} onChange={vi.fn()} disabled aria-label="Tags" />)
      expect(screen.queryAllByRole('button', { name: /remove/i })).toHaveLength(0)
    })
  })

  // ─── Error state ──────────────────────────────────────────────────

  describe('error state', () => {
    it('shows error message', () => {
      render(<TagInput tags={[]} onChange={vi.fn()} error="Too many tags" aria-label="Tags" />)
      expect(screen.getByText('Too many tags')).toBeInTheDocument()
    })

    it('sets data-invalid when error is provided', () => {
      const { container } = render(<TagInput tags={[]} onChange={vi.fn()} error="Error" aria-label="Tags" />)
      expect(container.querySelector('.ui-tag-input')).toHaveAttribute('data-invalid', '')
    })
  })

  // ─── Ref and props forwarding ─────────────────────────────────────

  describe('ref and props forwarding', () => {
    it('forwards ref to container div', () => {
      const ref = createRef<HTMLDivElement>()
      render(<TagInput ref={ref} tags={[]} onChange={vi.fn()} aria-label="Tags" />)
      expect(ref.current).toBeInstanceOf(HTMLDivElement)
    })

    it('forwards className', () => {
      const { container } = render(<TagInput tags={[]} onChange={vi.fn()} className="custom" aria-label="Tags" />)
      expect(container.querySelector('.ui-tag-input')!.className).toContain('custom')
    })
  })

  // ─── Accessibility ────────────────────────────────────────────────

  describe('accessibility', () => {
    it('has no axe violations', async () => {
      const { container } = render(<TagInput tags={['react', 'vue']} onChange={vi.fn()} aria-label="Tags" />)
      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })

    it('remove buttons have accessible labels', () => {
      render(<TagInput tags={['react']} onChange={vi.fn()} aria-label="Tags" />)
      expect(screen.getByRole('button', { name: /remove react/i })).toBeInTheDocument()
    })
  })

  // ─── Style injection ──────────────────────────────────────────────

  describe('style injection', () => {
    it('injects CSS on mount', () => {
      render(<TagInput tags={[]} onChange={vi.fn()} aria-label="Tags" />)
      const styleTags = document.querySelectorAll('style[data-ui-style]')
      expect(styleTags.length).toBeGreaterThan(0)
    })

    it('CSS includes @scope (.ui-tag-input)', () => {
      render(<TagInput tags={[]} onChange={vi.fn()} aria-label="Tags" />)
      const styleTags = document.querySelectorAll('style[data-ui-style]')
      const allCSS = Array.from(styleTags).map(s => s.textContent).join('')
      expect(allCSS).toContain('@scope (.ui-tag-input)')
    })
  })

  // ─── Display name ─────────────────────────────────────────────────

  describe('display name', () => {
    it('has displayName set to "TagInput"', () => {
      expect(TagInput.displayName).toBe('TagInput')
    })
  })
})
