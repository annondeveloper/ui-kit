import { describe, it, expect, vi, afterEach, beforeEach } from 'vitest'
import { render, screen, cleanup, fireEvent, act } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { createRef } from 'react'
import { axe, toHaveNoViolations } from 'jest-axe'
import { SearchInput } from '../../components/search-input'

expect.extend(toHaveNoViolations)

describe('SearchInput', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
    cleanup()
  })

  // ─── Render tests ──────────────────────────────────────────────────

  describe('rendering', () => {
    it('renders a search input element', () => {
      render(<SearchInput aria-label="Search" />)
      const input = screen.getByRole('searchbox')
      expect(input).toBeInTheDocument()
    })

    it('applies ui-search-input class', () => {
      const { container } = render(<SearchInput aria-label="Search" />)
      expect(container.querySelector('.ui-search-input')).toBeInTheDocument()
    })

    it('renders with type="search"', () => {
      render(<SearchInput aria-label="Search" />)
      expect(screen.getByRole('searchbox')).toHaveAttribute('type', 'search')
    })

    it('renders search icon by default', () => {
      const { container } = render(<SearchInput aria-label="Search" />)
      const icon = container.querySelector('.ui-search-input__icon')
      expect(icon).toBeInTheDocument()
      expect(icon!.querySelector('svg')).toBeInTheDocument()
    })

    it('renders placeholder text', () => {
      render(<SearchInput aria-label="Search" placeholder="Search..." />)
      expect(screen.getByPlaceholderText('Search...')).toBeInTheDocument()
    })

    it('renders with size="sm"', () => {
      const { container } = render(<SearchInput aria-label="Search" size="sm" />)
      expect(container.querySelector('.ui-search-input')).toHaveAttribute('data-size', 'sm')
    })

    it('renders with size="md" by default', () => {
      const { container } = render(<SearchInput aria-label="Search" />)
      expect(container.querySelector('.ui-search-input')).toHaveAttribute('data-size', 'md')
    })

    it('renders with size="lg"', () => {
      const { container } = render(<SearchInput aria-label="Search" size="lg" />)
      expect(container.querySelector('.ui-search-input')).toHaveAttribute('data-size', 'lg')
    })
  })

  // ─── Value and onChange tests ──────────────────────────────────────

  describe('value and onChange', () => {
    it('works as controlled input with value prop', () => {
      render(<SearchInput aria-label="Search" value="hello" onChange={vi.fn()} />)
      expect(screen.getByRole('searchbox')).toHaveValue('hello')
    })

    it('works as uncontrolled input with defaultValue', () => {
      render(<SearchInput aria-label="Search" defaultValue="world" />)
      expect(screen.getByRole('searchbox')).toHaveValue('world')
    })

    it('fires onChange after debounce period', async () => {
      const onChange = vi.fn()
      render(<SearchInput aria-label="Search" onChange={onChange} debounce={300} />)
      const input = screen.getByRole('searchbox')

      fireEvent.change(input, { target: { value: 'test' } })
      expect(onChange).not.toHaveBeenCalled()

      act(() => { vi.advanceTimersByTime(300) })
      expect(onChange).toHaveBeenCalledWith('test')
    })

    it('debounces onChange with default 300ms', () => {
      const onChange = vi.fn()
      render(<SearchInput aria-label="Search" onChange={onChange} />)
      const input = screen.getByRole('searchbox')

      fireEvent.change(input, { target: { value: 'a' } })
      act(() => { vi.advanceTimersByTime(100) })
      fireEvent.change(input, { target: { value: 'ab' } })
      act(() => { vi.advanceTimersByTime(100) })
      fireEvent.change(input, { target: { value: 'abc' } })
      act(() => { vi.advanceTimersByTime(300) })

      // Should only fire once with final value
      expect(onChange).toHaveBeenCalledTimes(1)
      expect(onChange).toHaveBeenCalledWith('abc')
    })

    it('uses custom debounce timing', () => {
      const onChange = vi.fn()
      render(<SearchInput aria-label="Search" onChange={onChange} debounce={500} />)
      const input = screen.getByRole('searchbox')

      fireEvent.change(input, { target: { value: 'test' } })
      act(() => { vi.advanceTimersByTime(300) })
      expect(onChange).not.toHaveBeenCalled()

      act(() => { vi.advanceTimersByTime(200) })
      expect(onChange).toHaveBeenCalledWith('test')
    })
  })

  // ─── onSearch tests ───────────────────────────────────────────────

  describe('onSearch', () => {
    it('fires onSearch immediately on Enter', () => {
      const onSearch = vi.fn()
      render(<SearchInput aria-label="Search" onSearch={onSearch} />)
      const input = screen.getByRole('searchbox')

      fireEvent.change(input, { target: { value: 'query' } })
      fireEvent.keyDown(input, { key: 'Enter' })
      expect(onSearch).toHaveBeenCalledWith('query')
    })

    it('does not fire onSearch on non-Enter keys', () => {
      const onSearch = vi.fn()
      render(<SearchInput aria-label="Search" onSearch={onSearch} />)
      const input = screen.getByRole('searchbox')

      fireEvent.change(input, { target: { value: 'test' } })
      fireEvent.keyDown(input, { key: 'a' })
      expect(onSearch).not.toHaveBeenCalled()
    })
  })

  // ─── Clear button tests ───────────────────────────────────────────

  describe('clear button', () => {
    it('shows clear button when input has value', () => {
      render(<SearchInput aria-label="Search" value="text" onChange={vi.fn()} />)
      expect(screen.getByRole('button', { name: /clear/i })).toBeInTheDocument()
    })

    it('hides clear button when input is empty', () => {
      render(<SearchInput aria-label="Search" value="" onChange={vi.fn()} />)
      expect(screen.queryByRole('button', { name: /clear/i })).not.toBeInTheDocument()
    })

    it('clears input and calls onClear when clear button is clicked', () => {
      const onClear = vi.fn()
      const onChange = vi.fn()
      render(<SearchInput aria-label="Search" value="text" onChange={onChange} onClear={onClear} />)
      fireEvent.click(screen.getByRole('button', { name: /clear/i }))
      expect(onClear).toHaveBeenCalledTimes(1)
    })

    it('does not show clear button when clearable is false', () => {
      render(<SearchInput aria-label="Search" value="text" onChange={vi.fn()} clearable={false} />)
      expect(screen.queryByRole('button', { name: /clear/i })).not.toBeInTheDocument()
    })
  })

  // ─── Loading state ────────────────────────────────────────────────

  describe('loading state', () => {
    it('shows spinner when loading is true', () => {
      const { container } = render(<SearchInput aria-label="Search" loading />)
      expect(container.querySelector('.ui-search-input__spinner')).toBeInTheDocument()
    })

    it('hides search icon when loading', () => {
      const { container } = render(<SearchInput aria-label="Search" loading />)
      expect(container.querySelector('.ui-search-input__icon')).not.toBeInTheDocument()
    })

    it('sets data-loading attribute', () => {
      const { container } = render(<SearchInput aria-label="Search" loading />)
      expect(container.querySelector('.ui-search-input')).toHaveAttribute('data-loading', 'true')
    })
  })

  // ─── Ref and props forwarding ─────────────────────────────────────

  describe('ref and props forwarding', () => {
    it('forwards ref to input element', () => {
      const ref = createRef<HTMLInputElement>()
      render(<SearchInput ref={ref} aria-label="Search" />)
      expect(ref.current).toBeInstanceOf(HTMLInputElement)
    })

    it('forwards className', () => {
      const { container } = render(<SearchInput aria-label="Search" className="custom" />)
      expect(container.querySelector('.ui-search-input')!.className).toContain('custom')
    })

    it('forwards disabled', () => {
      render(<SearchInput aria-label="Search" disabled />)
      expect(screen.getByRole('searchbox')).toBeDisabled()
    })
  })

  // ─── Accessibility ────────────────────────────────────────────────

  describe('accessibility', () => {
    it('has no axe violations', async () => {
      vi.useRealTimers()
      const { container } = render(<SearchInput aria-label="Search" />)
      const results = await axe(container)
      expect(results).toHaveNoViolations()
      vi.useFakeTimers()
    })

    it('has no axe violations with value and clear button', async () => {
      vi.useRealTimers()
      const { container } = render(
        <SearchInput aria-label="Search" value="test" onChange={vi.fn()} />
      )
      const results = await axe(container)
      expect(results).toHaveNoViolations()
      vi.useFakeTimers()
    })
  })

  // ─── Style injection ──────────────────────────────────────────────

  describe('style injection', () => {
    it('injects CSS on mount', () => {
      render(<SearchInput aria-label="Search" />)
      const styleTags = document.querySelectorAll('style[data-ui-style]')
      expect(styleTags.length).toBeGreaterThan(0)
    })

    it('CSS includes @scope (.ui-search-input)', () => {
      render(<SearchInput aria-label="Search" />)
      const styleTags = document.querySelectorAll('style[data-ui-style]')
      const allCSS = Array.from(styleTags).map(s => s.textContent).join('')
      expect(allCSS).toContain('@scope (.ui-search-input)')
    })
  })

  // ─── Display name ─────────────────────────────────────────────────

  describe('display name', () => {
    it('has displayName set to "SearchInput"', () => {
      expect(SearchInput.displayName).toBe('SearchInput')
    })
  })
})
