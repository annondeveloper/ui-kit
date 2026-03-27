import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, cleanup, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { createRef } from 'react'
import { axe, toHaveNoViolations } from 'jest-axe'
import { Button } from '../../components/button'

expect.extend(toHaveNoViolations)

describe('Button', () => {
  afterEach(() => {
    cleanup()
  })

  // ─── Render tests ──────────────────────────────────────────────────

  describe('rendering', () => {
    it('renders a <button> element with type="button" by default', () => {
      render(<Button>Click</Button>)
      const btn = screen.getByRole('button', { name: 'Click' })
      expect(btn).toBeInTheDocument()
      expect(btn.tagName).toBe('BUTTON')
      expect(btn).toHaveAttribute('type', 'button')
    })

    it('renders with type="submit" when specified', () => {
      render(<Button type="submit">Submit</Button>)
      const btn = screen.getByRole('button', { name: 'Submit' })
      expect(btn).toHaveAttribute('type', 'submit')
    })

    it('renders children text content', () => {
      render(<Button>Hello World</Button>)
      expect(screen.getByRole('button')).toHaveTextContent('Hello World')
    })

    it('renders with variant="primary" by default', () => {
      render(<Button>Primary</Button>)
      expect(screen.getByRole('button')).toHaveAttribute('data-variant', 'primary')
    })

    it('renders with variant="secondary"', () => {
      render(<Button variant="secondary">Secondary</Button>)
      expect(screen.getByRole('button')).toHaveAttribute('data-variant', 'secondary')
    })

    it('renders with variant="ghost"', () => {
      render(<Button variant="ghost">Ghost</Button>)
      expect(screen.getByRole('button')).toHaveAttribute('data-variant', 'ghost')
    })

    it('renders with variant="danger"', () => {
      render(<Button variant="danger">Danger</Button>)
      expect(screen.getByRole('button')).toHaveAttribute('data-variant', 'danger')
    })

    it('renders with size="md" by default', () => {
      render(<Button>Medium</Button>)
      expect(screen.getByRole('button')).toHaveAttribute('data-size', 'md')
    })

    it('renders with size="sm"', () => {
      render(<Button size="sm">Small</Button>)
      expect(screen.getByRole('button')).toHaveAttribute('data-size', 'sm')
    })

    it('renders with size="lg"', () => {
      render(<Button size="lg">Large</Button>)
      expect(screen.getByRole('button')).toHaveAttribute('data-size', 'lg')
    })

    it('applies data-variant and data-size attributes', () => {
      render(<Button variant="danger" size="lg">Action</Button>)
      const btn = screen.getByRole('button')
      expect(btn).toHaveAttribute('data-variant', 'danger')
      expect(btn).toHaveAttribute('data-size', 'lg')
    })

    it('renders with icon prop (leading icon)', () => {
      const icon = <svg data-testid="leading-icon" />
      render(<Button icon={icon}>With Icon</Button>)
      expect(screen.getByTestId('leading-icon')).toBeInTheDocument()
      const iconWrapper = screen.getByTestId('leading-icon').parentElement
      expect(iconWrapper).toHaveClass('ui-button__icon')
    })

    it('renders with iconEnd prop (trailing icon)', () => {
      const icon = <svg data-testid="trailing-icon" />
      render(<Button iconEnd={icon}>With Icon</Button>)
      expect(screen.getByTestId('trailing-icon')).toBeInTheDocument()
      const iconWrapper = screen.getByTestId('trailing-icon').parentElement
      expect(iconWrapper).toHaveClass('ui-button__icon-end')
    })

    it('renders with both icon and iconEnd', () => {
      const leading = <svg data-testid="lead" />
      const trailing = <svg data-testid="trail" />
      render(<Button icon={leading} iconEnd={trailing}>Both</Button>)
      expect(screen.getByTestId('lead')).toBeInTheDocument()
      expect(screen.getByTestId('trail')).toBeInTheDocument()
    })

    it('renders loading state with data-loading="true" and aria-busy', () => {
      render(<Button loading>Loading</Button>)
      const btn = screen.getByRole('button')
      expect(btn).toHaveAttribute('data-loading', 'true')
      expect(btn).toHaveAttribute('aria-busy', 'true')
    })

    it('renders disabled state', () => {
      render(<Button disabled>Disabled</Button>)
      const btn = screen.getByRole('button')
      expect(btn).toBeDisabled()
      expect(btn).toHaveAttribute('aria-disabled', 'true')
    })

    it('forwards ref to button element', () => {
      const ref = createRef<HTMLButtonElement>()
      render(<Button ref={ref}>Ref</Button>)
      expect(ref.current).toBeInstanceOf(HTMLButtonElement)
      expect(ref.current?.tagName).toBe('BUTTON')
    })

    it('forwards className', () => {
      render(<Button className="custom-class">Custom</Button>)
      const btn = screen.getByRole('button')
      expect(btn.className).toContain('ui-button')
      expect(btn.className).toContain('custom-class')
    })

    it('forwards additional HTML attributes', () => {
      render(
        <Button aria-label="Custom label" data-testid="my-btn" id="btn-1">
          Attrs
        </Button>
      )
      const btn = screen.getByTestId('my-btn')
      expect(btn).toHaveAttribute('aria-label', 'Custom label')
      expect(btn).toHaveAttribute('id', 'btn-1')
    })
  })

  // ─── Interaction tests ─────────────────────────────────────────────

  describe('interactions', () => {
    it('calls onClick on click', async () => {
      const handleClick = vi.fn()
      render(<Button onClick={handleClick}>Click Me</Button>)
      await userEvent.click(screen.getByRole('button'))
      expect(handleClick).toHaveBeenCalledTimes(1)
    })

    it('debounces rapid clicks (two clicks within 150ms, only first fires)', () => {
      const handleClick = vi.fn()
      render(<Button onClick={handleClick}>Rapid</Button>)
      const btn = screen.getByRole('button')

      let time = 1000
      vi.spyOn(Date, 'now').mockImplementation(() => time)

      fireEvent.click(btn)
      time = 1050 // 50ms later, within 150ms debounce window
      fireEvent.click(btn)

      expect(handleClick).toHaveBeenCalledTimes(1)
      vi.restoreAllMocks()
    })

    it('fires second click after debounce window passes', () => {
      const handleClick = vi.fn()
      render(<Button onClick={handleClick}>Debounce</Button>)
      const btn = screen.getByRole('button')

      let time = 1000
      vi.spyOn(Date, 'now').mockImplementation(() => time)

      fireEvent.click(btn)
      time = 1200 // 200ms later, beyond 150ms debounce
      fireEvent.click(btn)

      expect(handleClick).toHaveBeenCalledTimes(2)
      vi.restoreAllMocks()
    })

    it('does not fire onClick when disabled', async () => {
      const handleClick = vi.fn()
      render(<Button disabled onClick={handleClick}>Disabled</Button>)
      const btn = screen.getByRole('button')
      fireEvent.click(btn)
      expect(handleClick).not.toHaveBeenCalled()
    })

    it('does not fire onClick when loading', async () => {
      const handleClick = vi.fn()
      render(<Button loading onClick={handleClick}>Loading</Button>)
      const btn = screen.getByRole('button')
      fireEvent.click(btn)
      expect(handleClick).not.toHaveBeenCalled()
    })

    it('Enter key activates the button', async () => {
      const handleClick = vi.fn()
      render(<Button onClick={handleClick}>Enter</Button>)
      const btn = screen.getByRole('button')
      btn.focus()
      await userEvent.keyboard('{Enter}')
      expect(handleClick).toHaveBeenCalledTimes(1)
    })

    it('Space key activates the button', async () => {
      const handleClick = vi.fn()
      render(<Button onClick={handleClick}>Space</Button>)
      const btn = screen.getByRole('button')
      btn.focus()
      await userEvent.keyboard(' ')
      expect(handleClick).toHaveBeenCalledTimes(1)
    })
  })

  // ─── Accessibility tests ──────────────────────────────────────────

  describe('accessibility', () => {
    it('has no axe violations (default state)', async () => {
      const { container } = render(<Button>Accessible</Button>)
      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })

    it('has no axe violations (loading state)', async () => {
      const { container } = render(<Button loading>Loading</Button>)
      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })

    it('has no axe violations (disabled state)', async () => {
      const { container } = render(<Button disabled>Disabled</Button>)
      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })

    it('is focusable via keyboard', () => {
      render(<Button>Focus Me</Button>)
      const btn = screen.getByRole('button')
      btn.focus()
      expect(document.activeElement).toBe(btn)
    })

    it('aria-busy is set when loading', () => {
      render(<Button loading>Busy</Button>)
      expect(screen.getByRole('button')).toHaveAttribute('aria-busy', 'true')
    })

    it('aria-busy is not set when not loading', () => {
      render(<Button>Not Busy</Button>)
      expect(screen.getByRole('button')).not.toHaveAttribute('aria-busy')
    })

    it('aria-disabled is set when disabled', () => {
      render(<Button disabled>Disabled</Button>)
      expect(screen.getByRole('button')).toHaveAttribute('aria-disabled', 'true')
    })

    it('type="button" by default prevents accidental form submission', () => {
      render(<Button>Safe</Button>)
      expect(screen.getByRole('button')).toHaveAttribute('type', 'button')
    })
  })

  // ─── Style injection tests ────────────────────────────────────────

  describe('style injection', () => {
    it('injects CSS on mount', () => {
      render(<Button>Styled</Button>)
      // In jsdom, CSS is injected via <style> tags (no adoptedStyleSheets)
      const styleTags = document.querySelectorAll('style[data-ui-style]')
      expect(styleTags.length).toBeGreaterThan(0)
    })

    it('CSS includes @layer components', () => {
      render(<Button>Layered</Button>)
      const styleTags = document.querySelectorAll('style[data-ui-style]')
      const allCSS = Array.from(styleTags).map(s => s.textContent).join('')
      expect(allCSS).toContain('@layer components')
    })

    it('CSS includes @scope (.ui-button)', () => {
      render(<Button>Scoped</Button>)
      const styleTags = document.querySelectorAll('style[data-ui-style]')
      const allCSS = Array.from(styleTags).map(s => s.textContent).join('')
      expect(allCSS).toContain('@scope (.ui-button)')
    })
  })

  // ─── Motion tests ─────────────────────────────────────────────────

  describe('motion', () => {
    it('applies data-motion attribute reflecting motion level', () => {
      render(<Button motion={2}>Motion</Button>)
      expect(screen.getByRole('button')).toHaveAttribute('data-motion', '2')
    })

    it('uses default motion level 3 when no provider or prop', () => {
      render(<Button>Default Motion</Button>)
      expect(screen.getByRole('button')).toHaveAttribute('data-motion', '3')
    })

    it('applies motion level 0', () => {
      render(<Button motion={0}>No Motion</Button>)
      expect(screen.getByRole('button')).toHaveAttribute('data-motion', '0')
    })

    it('applies motion level 1', () => {
      render(<Button motion={1}>Subtle</Button>)
      expect(screen.getByRole('button')).toHaveAttribute('data-motion', '1')
    })

    it('suppresses hover/active transforms when motion=0', () => {
      const { container } = render(<Button motion={0}>Test</Button>)
      const button = container.querySelector('button')
      expect(button?.getAttribute('data-motion')).toBe('0')
      // The CSS selector :not([data-motion="0"]) ensures transforms don't apply
      // We verify the attribute is set; visual testing confirms CSS behavior
    })

    it('allows transforms when motion >= 1', () => {
      const { container } = render(<Button motion={1}>Test</Button>)
      const button = container.querySelector('button')
      expect(button?.getAttribute('data-motion')).toBe('1')
    })
  })

  // ─── Haptic feedback ──────────────────────────────────────────────

  describe('haptic feedback', () => {
    it('triggers haptic on click when haptics=true', () => {
      const vibrateMock = vi.fn()
      Object.defineProperty(navigator, 'vibrate', { value: vibrateMock, writable: true })

      render(<Button haptics>Haptic</Button>)
      fireEvent.click(screen.getByText('Haptic'))
      expect(vibrateMock).toHaveBeenCalledWith([5]) // 'light' pattern
    })

    it('triggers specific haptic pattern when haptics="heavy"', () => {
      const vibrateMock = vi.fn()
      Object.defineProperty(navigator, 'vibrate', { value: vibrateMock, writable: true })

      render(<Button haptics="heavy">Heavy</Button>)
      fireEvent.click(screen.getByText('Heavy'))
      expect(vibrateMock).toHaveBeenCalledWith([30])
    })

    it('does not trigger haptic when haptics is not set', () => {
      const vibrateMock = vi.fn()
      Object.defineProperty(navigator, 'vibrate', { value: vibrateMock, writable: true })

      render(<Button>No Haptic</Button>)
      fireEvent.click(screen.getByText('No Haptic'))
      expect(vibrateMock).not.toHaveBeenCalled()
    })
  })

  // ─── Keyboard shortcuts ─────────────────────────────────────────

  describe('keyboard shortcuts', () => {
    it('activates button via custom shortcut', () => {
      const onClick = vi.fn()
      render(<Button shortcuts={{ activate: 'ctrl+k' }} onClick={onClick}>Shortcut</Button>)

      fireEvent.keyDown(document, { key: 'k', ctrlKey: true })
      expect(onClick).toHaveBeenCalled()
    })

    it('does not activate without modifier key', () => {
      const onClick = vi.fn()
      render(<Button shortcuts={{ activate: 'ctrl+k' }} onClick={onClick}>Shortcut</Button>)

      fireEvent.keyDown(document, { key: 'k', ctrlKey: false })
      expect(onClick).not.toHaveBeenCalled()
    })

    it('sets aria-keyshortcuts attribute', () => {
      render(<Button shortcuts={{ activate: 'ctrl+enter' }}>Save</Button>)
      expect(screen.getByText('Save')).toHaveAttribute('aria-keyshortcuts', 'ctrl+enter')
    })

    it('does not set aria-keyshortcuts when no shortcuts', () => {
      render(<Button>Normal</Button>)
      expect(screen.getByText('Normal')).not.toHaveAttribute('aria-keyshortcuts')
    })
  })

  // ─── Loading text ──────────────────────────────────────────────────

  describe('loadingText', () => {
    it('renders loadingText instead of children when loading', () => {
      render(<Button loading loadingText="Saving...">Save</Button>)
      const btn = screen.getByRole('button')
      expect(btn).toHaveTextContent('Saving...')
      expect(btn).not.toHaveTextContent('Save')
    })

    it('sets data-has-loading-text when loading with loadingText', () => {
      render(<Button loading loadingText="Please wait...">Submit</Button>)
      const btn = screen.getByRole('button')
      expect(btn).toHaveAttribute('data-has-loading-text', 'true')
    })

    it('does not set data-has-loading-text when not loading', () => {
      render(<Button loadingText="Please wait...">Submit</Button>)
      const btn = screen.getByRole('button')
      expect(btn).not.toHaveAttribute('data-has-loading-text')
    })

    it('renders children when not loading even if loadingText is set', () => {
      render(<Button loadingText="Saving...">Save</Button>)
      const btn = screen.getByRole('button')
      expect(btn).toHaveTextContent('Save')
      expect(btn).not.toHaveTextContent('Saving...')
    })
  })

  // ─── Link variant ────────────────────────────────────────────────

  describe('variant="link"', () => {
    it('renders with data-variant="link"', () => {
      render(<Button variant="link">Learn more</Button>)
      const btn = screen.getByRole('button')
      expect(btn).toHaveAttribute('data-variant', 'link')
    })

    it('still renders a <button> element', () => {
      render(<Button variant="link">Link Button</Button>)
      const btn = screen.getByRole('button')
      expect(btn.tagName).toBe('BUTTON')
    })

    it('renders children text content', () => {
      render(<Button variant="link">Click here</Button>)
      expect(screen.getByRole('button')).toHaveTextContent('Click here')
    })

    it('calls onClick when clicked', () => {
      const handleClick = vi.fn()
      render(<Button variant="link" onClick={handleClick}>Link</Button>)
      fireEvent.click(screen.getByRole('button'))
      expect(handleClick).toHaveBeenCalledTimes(1)
    })
  })

  // ─── Full width ──────────────────────────────────────────────────

  describe('fullWidth', () => {
    it('applies data-full-width attribute when fullWidth is true', () => {
      render(<Button fullWidth>Full Width</Button>)
      const btn = screen.getByRole('button')
      expect(btn).toHaveAttribute('data-full-width', 'true')
    })

    it('does not apply data-full-width when fullWidth is not set', () => {
      render(<Button>Normal Width</Button>)
      const btn = screen.getByRole('button')
      expect(btn).not.toHaveAttribute('data-full-width')
    })

    it('does not apply data-full-width when fullWidth is false', () => {
      render(<Button fullWidth={false}>Normal Width</Button>)
      const btn = screen.getByRole('button')
      expect(btn).not.toHaveAttribute('data-full-width')
    })
  })

  // ─── Icon only ───────────────────────────────────────────────────

  describe('iconOnly', () => {
    it('applies data-icon-only attribute when iconOnly is true', () => {
      const icon = <svg data-testid="icon" />
      render(<Button iconOnly icon={icon} aria-label="Close" />)
      const btn = screen.getByRole('button')
      expect(btn).toHaveAttribute('data-icon-only', 'true')
    })

    it('does not apply data-icon-only when iconOnly is not set', () => {
      render(<Button>Normal</Button>)
      const btn = screen.getByRole('button')
      expect(btn).not.toHaveAttribute('data-icon-only')
    })

    it('renders the icon inside the button', () => {
      const icon = <svg data-testid="close-icon" />
      render(<Button iconOnly icon={icon} aria-label="Close" />)
      expect(screen.getByTestId('close-icon')).toBeInTheDocument()
    })

    it('works with different sizes', () => {
      const icon = <svg data-testid="icon" />
      render(<Button iconOnly icon={icon} size="sm" aria-label="Menu" />)
      const btn = screen.getByRole('button')
      expect(btn).toHaveAttribute('data-icon-only', 'true')
      expect(btn).toHaveAttribute('data-size', 'sm')
    })
  })

  // ─── classNames prop ──────────────────────────────────────────────

  describe('classNames', () => {
    it('applies classNames.root to the button element', () => {
      render(<Button classNames={{ root: 'custom-root' }}>Click</Button>)
      const btn = screen.getByRole('button')
      expect(btn.className).toContain('custom-root')
      expect(btn.className).toContain('ui-button')
    })

    it('applies classNames.icon to the leading icon wrapper', () => {
      const icon = <svg data-testid="lead" />
      const { container } = render(
        <Button icon={icon} classNames={{ icon: 'custom-icon' }}>Click</Button>
      )
      const iconWrapper = screen.getByTestId('lead').parentElement!
      expect(iconWrapper.className).toContain('ui-button__icon')
      expect(iconWrapper.className).toContain('custom-icon')
    })

    it('applies classNames.iconEnd to the trailing icon wrapper', () => {
      const iconEnd = <svg data-testid="trail" />
      const { container } = render(
        <Button iconEnd={iconEnd} classNames={{ iconEnd: 'custom-icon-end' }}>Click</Button>
      )
      const iconWrapper = screen.getByTestId('trail').parentElement!
      expect(iconWrapper.className).toContain('ui-button__icon-end')
      expect(iconWrapper.className).toContain('custom-icon-end')
    })

    it('merges classNames.root with className prop', () => {
      render(
        <Button classNames={{ root: 'cn-root' }} className="class-prop">Click</Button>
      )
      const btn = screen.getByRole('button')
      expect(btn.className).toContain('cn-root')
      expect(btn.className).toContain('class-prop')
      expect(btn.className).toContain('ui-button')
    })

    it('works with partial classNames (only some keys)', () => {
      render(<Button classNames={{ root: 'only-root' }}>Click</Button>)
      const btn = screen.getByRole('button')
      expect(btn.className).toContain('only-root')
    })

    it('handles undefined classNames gracefully', () => {
      render(<Button classNames={undefined}>Click</Button>)
      const btn = screen.getByRole('button')
      expect(btn.className).toContain('ui-button')
    })
  })

  // ─── Display name ─────────────────────────────────────────────────

  describe('display name', () => {
    it('has displayName set to "Button"', () => {
      expect(Button.displayName).toBe('Button')
    })
  })
})
