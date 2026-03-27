import { describe, it, expect, afterEach } from 'vitest'
import { render, screen, cleanup } from '@testing-library/react'
import { createRef } from 'react'
import { axe, toHaveNoViolations } from 'jest-axe'
import { ButtonGroup } from '../../components/button-group'
import { Button } from '../../components/button'

expect.extend(toHaveNoViolations)

describe('ButtonGroup', () => {
  afterEach(() => {
    cleanup()
  })

  // ─── Render tests ──────────────────────────────────────────────────

  describe('rendering', () => {
    it('renders a group role element', () => {
      render(
        <ButtonGroup>
          <Button>A</Button>
          <Button>B</Button>
        </ButtonGroup>
      )
      expect(screen.getByRole('group')).toBeInTheDocument()
    })

    it('renders children buttons', () => {
      render(
        <ButtonGroup>
          <Button>First</Button>
          <Button>Second</Button>
          <Button>Third</Button>
        </ButtonGroup>
      )
      expect(screen.getAllByRole('button')).toHaveLength(3)
    })

    it('renders with default orientation="horizontal"', () => {
      render(
        <ButtonGroup>
          <Button>A</Button>
        </ButtonGroup>
      )
      expect(screen.getByRole('group')).toHaveAttribute('data-orientation', 'horizontal')
    })

    it('renders with orientation="vertical"', () => {
      render(
        <ButtonGroup orientation="vertical">
          <Button>A</Button>
        </ButtonGroup>
      )
      expect(screen.getByRole('group')).toHaveAttribute('data-orientation', 'vertical')
    })

    it('renders with default size="md"', () => {
      render(
        <ButtonGroup>
          <Button>A</Button>
        </ButtonGroup>
      )
      expect(screen.getByRole('group')).toHaveAttribute('data-size', 'md')
    })

    it('renders with size="sm"', () => {
      render(
        <ButtonGroup size="sm">
          <Button>A</Button>
        </ButtonGroup>
      )
      expect(screen.getByRole('group')).toHaveAttribute('data-size', 'sm')
    })

    it('renders with size="lg"', () => {
      render(
        <ButtonGroup size="lg">
          <Button>A</Button>
        </ButtonGroup>
      )
      expect(screen.getByRole('group')).toHaveAttribute('data-size', 'lg')
    })

    it('renders with size="xs"', () => {
      render(
        <ButtonGroup size="xs">
          <Button>A</Button>
        </ButtonGroup>
      )
      expect(screen.getByRole('group')).toHaveAttribute('data-size', 'xs')
    })

    it('renders with size="xl"', () => {
      render(
        <ButtonGroup size="xl">
          <Button>A</Button>
        </ButtonGroup>
      )
      expect(screen.getByRole('group')).toHaveAttribute('data-size', 'xl')
    })
  })

  // ─── Variant tests ─────────────────────────────────────────────────

  describe('variants', () => {
    it('renders with default variant="primary"', () => {
      render(
        <ButtonGroup>
          <Button>A</Button>
        </ButtonGroup>
      )
      expect(screen.getByRole('group')).toHaveAttribute('data-variant', 'primary')
    })

    it('renders with variant="secondary"', () => {
      render(
        <ButtonGroup variant="secondary">
          <Button>A</Button>
        </ButtonGroup>
      )
      expect(screen.getByRole('group')).toHaveAttribute('data-variant', 'secondary')
    })

    it('renders with variant="ghost"', () => {
      render(
        <ButtonGroup variant="ghost">
          <Button>A</Button>
        </ButtonGroup>
      )
      expect(screen.getByRole('group')).toHaveAttribute('data-variant', 'ghost')
    })
  })

  // ─── Attached mode tests ──────────────────────────────────────────

  describe('attached mode', () => {
    it('does not set data-attached by default', () => {
      render(
        <ButtonGroup>
          <Button>A</Button>
        </ButtonGroup>
      )
      expect(screen.getByRole('group')).not.toHaveAttribute('data-attached')
    })

    it('sets data-attached when attached is true', () => {
      render(
        <ButtonGroup attached>
          <Button>A</Button>
          <Button>B</Button>
        </ButtonGroup>
      )
      expect(screen.getByRole('group')).toHaveAttribute('data-attached', 'true')
    })

    it('does not set data-attached when attached is false', () => {
      render(
        <ButtonGroup attached={false}>
          <Button>A</Button>
        </ButtonGroup>
      )
      expect(screen.getByRole('group')).not.toHaveAttribute('data-attached')
    })
  })

  // ─── Ref & className forwarding ───────────────────────────────────

  describe('forwarding', () => {
    it('forwards ref to root element', () => {
      const ref = createRef<HTMLDivElement>()
      render(
        <ButtonGroup ref={ref}>
          <Button>A</Button>
        </ButtonGroup>
      )
      expect(ref.current).toBeInstanceOf(HTMLDivElement)
    })

    it('forwards className', () => {
      render(
        <ButtonGroup className="custom-class">
          <Button>A</Button>
        </ButtonGroup>
      )
      const el = screen.getByRole('group')
      expect(el.className).toContain('ui-button-group')
      expect(el.className).toContain('custom-class')
    })

    it('forwards additional HTML attributes', () => {
      render(
        <ButtonGroup data-testid="bg" id="bg1">
          <Button>A</Button>
        </ButtonGroup>
      )
      expect(screen.getByTestId('bg')).toHaveAttribute('id', 'bg1')
    })
  })

  // ─── Motion tests ─────────────────────────────────────────────────

  describe('motion', () => {
    it('applies data-motion attribute', () => {
      render(
        <ButtonGroup motion={2}>
          <Button>A</Button>
        </ButtonGroup>
      )
      expect(screen.getByRole('group')).toHaveAttribute('data-motion', '2')
    })

    it('defaults to motion level 3', () => {
      render(
        <ButtonGroup>
          <Button>A</Button>
        </ButtonGroup>
      )
      expect(screen.getByRole('group')).toHaveAttribute('data-motion', '3')
    })

    it('accepts motion level 0', () => {
      render(
        <ButtonGroup motion={0}>
          <Button>A</Button>
        </ButtonGroup>
      )
      expect(screen.getByRole('group')).toHaveAttribute('data-motion', '0')
    })
  })

  // ─── Accessibility tests ──────────────────────────────────────────

  describe('accessibility', () => {
    it('has no axe violations', async () => {
      const { container } = render(
        <ButtonGroup>
          <Button>Save</Button>
          <Button>Cancel</Button>
        </ButtonGroup>
      )
      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })

    it('has no axe violations (attached)', async () => {
      const { container } = render(
        <ButtonGroup attached variant="secondary">
          <Button>Left</Button>
          <Button>Center</Button>
          <Button>Right</Button>
        </ButtonGroup>
      )
      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })

    it('allows custom role override', () => {
      render(
        <ButtonGroup role="toolbar" aria-label="Formatting">
          <Button>B</Button>
          <Button>I</Button>
        </ButtonGroup>
      )
      expect(screen.getByRole('toolbar')).toBeInTheDocument()
    })
  })

  // ─── Style injection tests ────────────────────────────────────────

  describe('style injection', () => {
    it('injects CSS on mount', () => {
      render(
        <ButtonGroup>
          <Button>A</Button>
        </ButtonGroup>
      )
      const styleTags = document.querySelectorAll('style[data-ui-style]')
      expect(styleTags.length).toBeGreaterThan(0)
    })

    it('CSS includes @scope (.ui-button-group)', () => {
      render(
        <ButtonGroup>
          <Button>A</Button>
        </ButtonGroup>
      )
      const styleTags = document.querySelectorAll('style[data-ui-style]')
      const allCSS = Array.from(styleTags).map(s => s.textContent).join('')
      expect(allCSS).toContain('@scope (.ui-button-group)')
    })
  })

  // ─── Display name ─────────────────────────────────────────────────

  describe('display name', () => {
    it('has displayName set to "ButtonGroup"', () => {
      expect(ButtonGroup.displayName).toBe('ButtonGroup')
    })
  })
})
