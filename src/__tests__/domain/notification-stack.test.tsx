import { describe, it, expect, vi, afterEach, beforeEach } from 'vitest'
import { render, screen, cleanup, fireEvent, act } from '@testing-library/react'
import { axe, toHaveNoViolations } from 'jest-axe'
import { NotificationStack, type Notification } from '../../domain/notification-stack'

expect.extend(toHaveNoViolations)

const now = 1711000000000 // Fixed timestamp

const sampleNotifications: Notification[] = [
  {
    id: '1',
    title: 'Build succeeded',
    description: 'Production build completed in 42s',
    timestamp: now - 60000, // 1 min ago
    variant: 'success',
    read: false,
    group: 'CI/CD',
  },
  {
    id: '2',
    title: 'New comment',
    description: 'Alice commented on your PR',
    timestamp: now - 300000, // 5 min ago
    variant: 'info',
    read: false,
    group: 'Activity',
  },
  {
    id: '3',
    title: 'Disk space warning',
    description: 'Server disk usage at 90%',
    timestamp: now - 3600000, // 1 hour ago
    variant: 'warning',
    read: true,
    group: 'CI/CD',
  },
  {
    id: '4',
    title: 'Deployment failed',
    description: 'Staging deployment failed with exit code 1',
    timestamp: now - 7200000, // 2 hours ago
    variant: 'error',
    read: true,
    group: 'CI/CD',
    action: { label: 'View Logs', onClick: vi.fn() },
  },
  {
    id: '5',
    title: 'Team invitation',
    timestamp: now - 86400000, // 1 day ago
    read: false,
    group: 'Activity',
  },
]

describe('NotificationStack', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(now)
  })

  afterEach(() => {
    cleanup()
    vi.useRealTimers()
  })

  // ─── Rendering ──────────────────────────────────────────────────────

  describe('rendering', () => {
    it('renders the notification stack', () => {
      const { container } = render(
        <NotificationStack notifications={sampleNotifications} />
      )
      expect(container.querySelector('.ui-notification-stack')).toBeInTheDocument()
    })

    it('renders all notifications', () => {
      render(<NotificationStack notifications={sampleNotifications} />)
      expect(screen.getByText('Build succeeded')).toBeInTheDocument()
      expect(screen.getByText('New comment')).toBeInTheDocument()
      expect(screen.getByText('Disk space warning')).toBeInTheDocument()
      expect(screen.getByText('Deployment failed')).toBeInTheDocument()
      expect(screen.getByText('Team invitation')).toBeInTheDocument()
    })

    it('renders notification descriptions', () => {
      render(<NotificationStack notifications={sampleNotifications} />)
      expect(screen.getByText('Production build completed in 42s')).toBeInTheDocument()
    })

    it('renders with data-variant attribute', () => {
      const { container } = render(
        <NotificationStack notifications={[sampleNotifications[0]]} />
      )
      const card = container.querySelector('.ui-notification')
      expect(card).toHaveAttribute('data-variant', 'success')
    })
  })

  // ─── Dismiss ──────────────────────────────────────────────────────

  describe('dismiss', () => {
    it('calls onDismiss when dismiss button is clicked', () => {
      const onDismiss = vi.fn()
      render(
        <NotificationStack
          notifications={sampleNotifications}
          onDismiss={onDismiss}
        />
      )
      const dismissButtons = screen.getAllByLabelText('Dismiss notification')
      fireEvent.click(dismissButtons[0])
      expect(onDismiss).toHaveBeenCalledWith('1')
    })

    it('calls onDismissAll when clear all is clicked', () => {
      const onDismissAll = vi.fn()
      render(
        <NotificationStack
          notifications={sampleNotifications}
          onDismissAll={onDismissAll}
        />
      )
      fireEvent.click(screen.getByText('Clear all'))
      expect(onDismissAll).toHaveBeenCalledTimes(1)
    })
  })

  // ─── Mark read ────────────────────────────────────────────────────

  describe('mark read', () => {
    it('calls onMarkRead when a notification is clicked', () => {
      const onMarkRead = vi.fn()
      render(
        <NotificationStack
          notifications={sampleNotifications}
          onMarkRead={onMarkRead}
        />
      )
      fireEvent.click(screen.getByText('Build succeeded'))
      expect(onMarkRead).toHaveBeenCalledWith('1')
    })

    it('calls onMarkAllRead when mark all read is clicked', () => {
      const onMarkAllRead = vi.fn()
      render(
        <NotificationStack
          notifications={sampleNotifications}
          onMarkAllRead={onMarkAllRead}
        />
      )
      fireEvent.click(screen.getByText('Mark all read'))
      expect(onMarkAllRead).toHaveBeenCalledTimes(1)
    })
  })

  // ─── Unread indicator ─────────────────────────────────────────────

  describe('unread indicator', () => {
    it('shows unread dot on unread notifications', () => {
      const { container } = render(
        <NotificationStack notifications={sampleNotifications} />
      )
      const unreadDots = container.querySelectorAll('.ui-notification__unread-dot')
      // 3 unread notifications (id 1, 2, 5)
      expect(unreadDots.length).toBe(3)
    })

    it('does not show unread dot on read notifications', () => {
      const { container } = render(
        <NotificationStack
          notifications={[{ ...sampleNotifications[2], read: true }]}
        />
      )
      expect(container.querySelector('.ui-notification__unread-dot')).not.toBeInTheDocument()
    })
  })

  // ─── Grouping ─────────────────────────────────────────────────────

  describe('grouping', () => {
    it('groups notifications by category', () => {
      render(<NotificationStack notifications={sampleNotifications} />)
      expect(screen.getByText('CI/CD')).toBeInTheDocument()
      expect(screen.getByText('Activity')).toBeInTheDocument()
    })

    it('renders group headers', () => {
      const { container } = render(
        <NotificationStack notifications={sampleNotifications} />
      )
      const groupHeaders = container.querySelectorAll('.ui-notification-stack__group-header')
      expect(groupHeaders.length).toBeGreaterThanOrEqual(2)
    })
  })

  // ─── Empty state ──────────────────────────────────────────────────

  describe('empty state', () => {
    it('shows empty message when no notifications', () => {
      render(<NotificationStack notifications={[]} />)
      expect(screen.getByText('No notifications')).toBeInTheDocument()
    })

    it('shows custom empty message', () => {
      render(
        <NotificationStack notifications={[]} emptyMessage="All caught up!" />
      )
      expect(screen.getByText('All caught up!')).toBeInTheDocument()
    })
  })

  // ─── Timestamps ───────────────────────────────────────────────────

  describe('timestamps', () => {
    it('renders relative timestamps', () => {
      render(<NotificationStack notifications={sampleNotifications} />)
      // The fmtRelative function should produce relative time strings
      // Exact text depends on Intl.RelativeTimeFormat, just check they exist
      const timeElements = screen.getAllByTestId('notification-time')
      expect(timeElements.length).toBe(sampleNotifications.length)
    })
  })

  // ─── Action button ────────────────────────────────────────────────

  describe('action button', () => {
    it('renders action button on notification', () => {
      render(<NotificationStack notifications={sampleNotifications} />)
      expect(screen.getByRole('button', { name: 'View Logs' })).toBeInTheDocument()
    })

    it('calls action onClick when clicked', () => {
      render(<NotificationStack notifications={sampleNotifications} />)
      fireEvent.click(screen.getByRole('button', { name: 'View Logs' }))
      expect(sampleNotifications[3].action!.onClick).toHaveBeenCalled()
    })
  })

  // ─── Max visible ──────────────────────────────────────────────────

  describe('max visible', () => {
    it('limits visible notifications with maxVisible', () => {
      const { container } = render(
        <NotificationStack
          notifications={sampleNotifications}
          maxVisible={2}
        />
      )
      const notifications = container.querySelectorAll('.ui-notification')
      expect(notifications.length).toBe(2)
    })
  })

  // ─── Custom icon ──────────────────────────────────────────────────

  describe('icon', () => {
    it('renders custom icon', () => {
      const notif: Notification[] = [{
        id: 'ic',
        title: 'Icon test',
        timestamp: now,
        icon: <span data-testid="custom-icon">★</span>,
      }]
      render(<NotificationStack notifications={notif} />)
      expect(screen.getByTestId('custom-icon')).toBeInTheDocument()
    })
  })

  // ─── Motion ───────────────────────────────────────────────────────

  describe('motion', () => {
    it('sets data-motion on the stack', () => {
      const { container } = render(
        <NotificationStack notifications={sampleNotifications} motion={0} />
      )
      expect(container.querySelector('.ui-notification-stack')).toHaveAttribute('data-motion', '0')
    })
  })

  // ─── Accessibility ────────────────────────────────────────────────

  describe('accessibility', () => {
    it('has no axe violations', async () => {
      vi.useRealTimers()
      const { container } = render(
        <NotificationStack notifications={sampleNotifications} />
      )
      const results = await axe(container)
      expect(results).toHaveNoViolations()
      vi.useFakeTimers()
      vi.setSystemTime(now)
    })

    it('notification cards are articles', () => {
      render(<NotificationStack notifications={sampleNotifications} />)
      const articles = screen.getAllByRole('article')
      expect(articles.length).toBe(sampleNotifications.length)
    })
  })
})
