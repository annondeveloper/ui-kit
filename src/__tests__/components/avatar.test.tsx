import { describe, it, expect, afterEach } from 'vitest'
import { render, screen, cleanup, fireEvent } from '@testing-library/react'
import { createRef } from 'react'
import { axe, toHaveNoViolations } from 'jest-axe'
import { Avatar, AvatarGroup } from '../../components/avatar'

expect.extend(toHaveNoViolations)

describe('Avatar', () => {
  afterEach(() => {
    cleanup()
  })

  // ─── Render tests ──────────────────────────────────────────────────

  describe('rendering', () => {
    it('renders a <div> element', () => {
      const { container } = render(<Avatar alt="User" />)
      const avatar = container.querySelector('.ui-avatar')
      expect(avatar).toBeInTheDocument()
      expect(avatar?.tagName).toBe('DIV')
    })

    it('applies ui-avatar class', () => {
      const { container } = render(<Avatar alt="User" />)
      const avatar = container.querySelector('.ui-avatar')
      expect(avatar).toBeInTheDocument()
    })

    it('renders image when src is provided', () => {
      render(<Avatar src="https://example.com/photo.jpg" alt="Jane Doe" />)
      const img = screen.getByRole('img', { name: 'Jane Doe' })
      expect(img).toBeInTheDocument()
      expect(img).toHaveAttribute('src', 'https://example.com/photo.jpg')
    })

    it('renders initials from single name', () => {
      const { container } = render(<Avatar name="Jane" />)
      const initials = container.querySelector('.ui-avatar__initials')
      expect(initials).toHaveTextContent('J')
    })

    it('renders initials from two-word name (first + last)', () => {
      const { container } = render(<Avatar name="Jane Doe" />)
      const initials = container.querySelector('.ui-avatar__initials')
      expect(initials).toHaveTextContent('JD')
    })

    it('renders initials from multi-word name (first + last)', () => {
      const { container } = render(<Avatar name="Mary Jane Watson" />)
      const initials = container.querySelector('.ui-avatar__initials')
      expect(initials).toHaveTextContent('MW')
    })

    it('falls back to initials when image errors', () => {
      const { container } = render(
        <Avatar src="https://example.com/broken.jpg" alt="Jane" name="Jane Doe" />
      )
      const img = container.querySelector('img')
      expect(img).toBeInTheDocument()

      // Simulate image error
      fireEvent.error(img!)

      const initials = container.querySelector('.ui-avatar__initials')
      expect(initials).toHaveTextContent('JD')
      expect(container.querySelector('img')).not.toBeInTheDocument()
    })

    it('renders custom fallback icon', () => {
      const icon = <svg data-testid="fallback-icon" />
      const { container } = render(<Avatar icon={icon} />)
      expect(screen.getByTestId('fallback-icon')).toBeInTheDocument()
      const wrapper = container.querySelector('.ui-avatar__icon')
      expect(wrapper).toBeInTheDocument()
    })

    it('renders with size="md" by default', () => {
      const { container } = render(<Avatar alt="User" />)
      const avatar = container.querySelector('.ui-avatar')
      expect(avatar).toHaveAttribute('data-size', 'md')
    })

    it('renders with size="sm"', () => {
      const { container } = render(<Avatar size="sm" alt="User" />)
      expect(container.querySelector('.ui-avatar')).toHaveAttribute('data-size', 'sm')
    })

    it('renders with size="lg"', () => {
      const { container } = render(<Avatar size="lg" alt="User" />)
      expect(container.querySelector('.ui-avatar')).toHaveAttribute('data-size', 'lg')
    })

    it('renders with size="xl"', () => {
      const { container } = render(<Avatar size="xl" alt="User" />)
      expect(container.querySelector('.ui-avatar')).toHaveAttribute('data-size', 'xl')
    })

    it('renders status indicator', () => {
      const { container } = render(<Avatar status="online" alt="User" />)
      const status = container.querySelector('.ui-avatar__status')
      expect(status).toBeInTheDocument()
      expect(status).toHaveAttribute('data-status', 'online')
    })

    it('renders status="offline"', () => {
      const { container } = render(<Avatar status="offline" alt="User" />)
      const status = container.querySelector('.ui-avatar__status')
      expect(status).toHaveAttribute('data-status', 'offline')
    })

    it('renders status="away"', () => {
      const { container } = render(<Avatar status="away" alt="User" />)
      const status = container.querySelector('.ui-avatar__status')
      expect(status).toHaveAttribute('data-status', 'away')
    })

    it('renders status="busy"', () => {
      const { container } = render(<Avatar status="busy" alt="User" />)
      const status = container.querySelector('.ui-avatar__status')
      expect(status).toHaveAttribute('data-status', 'busy')
    })

    it('does not render status indicator when status is not set', () => {
      const { container } = render(<Avatar alt="User" />)
      expect(container.querySelector('.ui-avatar__status')).not.toBeInTheDocument()
    })

    it('forwards ref to div element', () => {
      const ref = createRef<HTMLDivElement>()
      render(<Avatar ref={ref} alt="User" />)
      expect(ref.current).toBeInstanceOf(HTMLDivElement)
    })

    it('forwards className', () => {
      const { container } = render(<Avatar className="custom" alt="User" />)
      const avatar = container.querySelector('.ui-avatar')
      expect(avatar?.className).toContain('ui-avatar')
      expect(avatar?.className).toContain('custom')
    })

    it('forwards additional HTML attributes', () => {
      const { container } = render(<Avatar data-testid="my-avatar" id="av-1" alt="User" />)
      const avatar = screen.getByTestId('my-avatar')
      expect(avatar).toHaveAttribute('id', 'av-1')
    })
  })

  // ─── Accessibility tests ──────────────────────────────────────────

  describe('accessibility', () => {
    it('has no axe violations (with image)', async () => {
      const { container } = render(<Avatar src="https://example.com/photo.jpg" alt="Jane Doe" />)
      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })

    it('has no axe violations (with initials)', async () => {
      const { container } = render(<Avatar name="Jane Doe" aria-label="Jane Doe" />)
      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })

    it('has no axe violations (with status)', async () => {
      const { container } = render(<Avatar name="Jane" status="online" aria-label="Jane, online" />)
      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })

    it('image has alt text', () => {
      render(<Avatar src="https://example.com/photo.jpg" alt="Jane Doe" />)
      const img = screen.getByRole('img')
      expect(img).toHaveAttribute('alt', 'Jane Doe')
    })
  })

  // ─── Style injection tests ────────────────────────────────────────

  describe('style injection', () => {
    it('injects CSS on mount', () => {
      render(<Avatar alt="User" />)
      const styleTags = document.querySelectorAll('style[data-ui-style]')
      expect(styleTags.length).toBeGreaterThan(0)
    })

    it('CSS includes @layer components', () => {
      render(<Avatar alt="User" />)
      const styleTags = document.querySelectorAll('style[data-ui-style]')
      const allCSS = Array.from(styleTags).map(s => s.textContent).join('')
      expect(allCSS).toContain('@layer components')
    })

    it('CSS includes @scope (.ui-avatar)', () => {
      render(<Avatar alt="User" />)
      const styleTags = document.querySelectorAll('style[data-ui-style]')
      const allCSS = Array.from(styleTags).map(s => s.textContent).join('')
      expect(allCSS).toContain('@scope (.ui-avatar)')
    })
  })

  // ─── Display name ─────────────────────────────────────────────────

  describe('display name', () => {
    it('has displayName set to "Avatar"', () => {
      expect(Avatar.displayName).toBe('Avatar')
    })
  })
})

describe('AvatarGroup', () => {
  afterEach(() => {
    cleanup()
  })

  describe('rendering', () => {
    it('renders a <div> with ui-avatar-group class', () => {
      const { container } = render(
        <AvatarGroup>
          <Avatar name="A" />
          <Avatar name="B" />
        </AvatarGroup>
      )
      const group = container.querySelector('.ui-avatar-group')
      expect(group).toBeInTheDocument()
      expect(group?.tagName).toBe('DIV')
    })

    it('renders all children when count <= max', () => {
      const { container } = render(
        <AvatarGroup max={5}>
          <Avatar name="A" />
          <Avatar name="B" />
          <Avatar name="C" />
        </AvatarGroup>
      )
      const avatars = container.querySelectorAll('.ui-avatar')
      expect(avatars.length).toBe(3)
    })

    it('renders max avatars + overflow indicator when count > max', () => {
      const { container } = render(
        <AvatarGroup max={2}>
          <Avatar name="A" />
          <Avatar name="B" />
          <Avatar name="C" />
          <Avatar name="D" />
        </AvatarGroup>
      )
      const avatars = container.querySelectorAll('.ui-avatar')
      // 2 visible avatars
      expect(avatars.length).toBe(2)
      // overflow indicator
      const overflow = container.querySelector('.ui-avatar-group__overflow')
      expect(overflow).toBeInTheDocument()
      expect(overflow).toHaveTextContent('+2')
    })

    it('passes size prop to children', () => {
      const { container } = render(
        <AvatarGroup size="lg">
          <Avatar name="A" />
          <Avatar name="B" />
        </AvatarGroup>
      )
      const avatars = container.querySelectorAll('.ui-avatar')
      avatars.forEach(av => {
        expect(av).toHaveAttribute('data-size', 'lg')
      })
    })

    it('forwards className', () => {
      const { container } = render(
        <AvatarGroup className="custom-group">
          <Avatar name="A" />
        </AvatarGroup>
      )
      const group = container.querySelector('.ui-avatar-group')
      expect(group?.className).toContain('custom-group')
    })

    it('forwards ref', () => {
      const ref = createRef<HTMLDivElement>()
      render(
        <AvatarGroup ref={ref}>
          <Avatar name="A" />
        </AvatarGroup>
      )
      expect(ref.current).toBeInstanceOf(HTMLDivElement)
    })
  })

  describe('accessibility', () => {
    it('has no axe violations', async () => {
      const { container } = render(
        <AvatarGroup max={2} aria-label="Team members">
          <Avatar name="A" aria-label="A" />
          <Avatar name="B" aria-label="B" />
          <Avatar name="C" aria-label="C" />
        </AvatarGroup>
      )
      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })
  })

  describe('display name', () => {
    it('has displayName set to "AvatarGroup"', () => {
      expect(AvatarGroup.displayName).toBe('AvatarGroup')
    })
  })
})
