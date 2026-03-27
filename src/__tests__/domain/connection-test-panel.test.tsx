import { describe, it, expect, afterEach, vi } from 'vitest'
import { render, screen, cleanup, fireEvent } from '@testing-library/react'
import { axe, toHaveNoViolations } from 'jest-axe'
import { ConnectionTestPanel } from '../../domain/connection-test-panel'

expect.extend(toHaveNoViolations)

const steps = [
  { id: 'dns', label: 'DNS Resolution', status: 'passed' as const, duration: 12 },
  { id: 'tcp', label: 'TCP Handshake', status: 'passed' as const, duration: 45 },
  { id: 'tls', label: 'TLS Negotiation', status: 'failed' as const, message: 'Certificate expired' },
  { id: 'auth', label: 'Authentication', status: 'skipped' as const },
  { id: 'ping', label: 'Latency Check', status: 'pending' as const },
]

describe('ConnectionTestPanel', () => {
  afterEach(() => {
    cleanup()
  })

  // ─── Render tests ──────────────────────────────────────────────────

  describe('rendering', () => {
    it('renders all step labels', () => {
      render(<ConnectionTestPanel steps={steps} />)
      expect(screen.getByText('DNS Resolution')).toBeInTheDocument()
      expect(screen.getByText('TCP Handshake')).toBeInTheDocument()
      expect(screen.getByText('TLS Negotiation')).toBeInTheDocument()
      expect(screen.getByText('Authentication')).toBeInTheDocument()
      expect(screen.getByText('Latency Check')).toBeInTheDocument()
    })

    it('renders title when provided', () => {
      render(<ConnectionTestPanel steps={steps} title="Connection Test" />)
      expect(screen.getByText('Connection Test')).toBeInTheDocument()
    })

    it('renders status icons for each step', () => {
      const { container } = render(<ConnectionTestPanel steps={steps} />)
      const stepEls = container.querySelectorAll('.ui-connection-test-panel__step')
      expect(stepEls).toHaveLength(5)
      expect(stepEls[0]).toHaveAttribute('data-status', 'passed')
      expect(stepEls[2]).toHaveAttribute('data-status', 'failed')
      expect(stepEls[3]).toHaveAttribute('data-status', 'skipped')
    })

    it('renders failure message', () => {
      render(<ConnectionTestPanel steps={steps} />)
      expect(screen.getByText('Certificate expired')).toBeInTheDocument()
    })

    it('calls onRetry when retry button is clicked', () => {
      const onRetry = vi.fn()
      render(<ConnectionTestPanel steps={steps} onRetry={onRetry} />)
      const retryBtn = screen.getByText(/retry/i)
      fireEvent.click(retryBtn)
      expect(onRetry).toHaveBeenCalledTimes(1)
    })

    it('renders duration for completed steps', () => {
      render(<ConnectionTestPanel steps={steps} />)
      expect(screen.getByText(/12\s*ms/)).toBeInTheDocument()
      expect(screen.getByText(/45\s*ms/)).toBeInTheDocument()
    })

    it('applies data-size attribute', () => {
      const { container } = render(<ConnectionTestPanel steps={steps} size="sm" />)
      expect(container.querySelector('.ui-connection-test-panel')).toHaveAttribute('data-size', 'sm')
    })
  })

  // ─── Accessibility tests ──────────────────────────────────────────

  describe('accessibility', () => {
    it('has no axe violations', async () => {
      const { container } = render(<ConnectionTestPanel steps={steps} title="Test" />)
      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })
  })

  // ─── Display name ─────────────────────────────────────────────────

  describe('display name', () => {
    it('has displayName set to "ConnectionTestPanel"', () => {
      expect(ConnectionTestPanel.displayName).toBe('ConnectionTestPanel')
    })
  })
})
