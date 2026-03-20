import { describe, it, expect, vi, afterEach, beforeEach } from 'vitest'
import { render, screen, cleanup, fireEvent } from '@testing-library/react'
import { axe, toHaveNoViolations } from 'jest-axe'
import { useState } from 'react'
import { ConfirmDialog } from '../../components/confirm-dialog'

expect.extend(toHaveNoViolations)

// jsdom doesn't implement showModal/close natively
beforeEach(() => {
  HTMLDialogElement.prototype.showModal = vi.fn(function (this: HTMLDialogElement) {
    this.setAttribute('open', '')
  })
  HTMLDialogElement.prototype.close = vi.fn(function (this: HTMLDialogElement) {
    this.removeAttribute('open')
  })
})

describe('ConfirmDialog', () => {
  afterEach(() => {
    cleanup()
  })

  // ─── Rendering ──────────────────────────────────────────────────────

  describe('rendering', () => {
    it('renders a dialog element when open', () => {
      render(
        <ConfirmDialog open onConfirm={() => {}} onCancel={() => {}} title="Confirm?" />
      )
      expect(screen.getByRole('dialog')).toBeInTheDocument()
    })

    it('renders title text', () => {
      render(
        <ConfirmDialog open onConfirm={() => {}} onCancel={() => {}} title="Are you sure?" />
      )
      expect(screen.getByRole('heading', { name: 'Are you sure?' })).toBeInTheDocument()
    })

    it('renders description text', () => {
      render(
        <ConfirmDialog
          open
          onConfirm={() => {}}
          onCancel={() => {}}
          title="Delete?"
          description="This action cannot be undone."
        />
      )
      expect(screen.getByText('This action cannot be undone.')).toBeInTheDocument()
    })

    it('renders confirm and cancel buttons', () => {
      render(
        <ConfirmDialog open onConfirm={() => {}} onCancel={() => {}} title="Confirm?" />
      )
      expect(screen.getByRole('button', { name: 'Confirm' })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: 'Cancel' })).toBeInTheDocument()
    })

    it('renders custom button labels', () => {
      render(
        <ConfirmDialog
          open
          onConfirm={() => {}}
          onCancel={() => {}}
          title="Delete?"
          confirmLabel="Delete"
          cancelLabel="Keep"
        />
      )
      expect(screen.getByRole('button', { name: 'Delete' })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: 'Keep' })).toBeInTheDocument()
    })
  })

  // ─── Actions ──────────────────────────────────────────────────────────

  describe('actions', () => {
    it('calls onConfirm when confirm button is clicked', () => {
      const onConfirm = vi.fn()
      render(
        <ConfirmDialog open onConfirm={onConfirm} onCancel={() => {}} title="Confirm?" />
      )
      fireEvent.click(screen.getByRole('button', { name: 'Confirm' }))
      expect(onConfirm).toHaveBeenCalledTimes(1)
    })

    it('calls onCancel when cancel button is clicked', () => {
      const onCancel = vi.fn()
      render(
        <ConfirmDialog open onConfirm={() => {}} onCancel={onCancel} title="Confirm?" />
      )
      fireEvent.click(screen.getByRole('button', { name: 'Cancel' }))
      expect(onCancel).toHaveBeenCalledTimes(1)
    })

    it('calls onCancel when Escape is pressed', () => {
      const onCancel = vi.fn()
      render(
        <ConfirmDialog open onConfirm={() => {}} onCancel={onCancel} title="Confirm?" />
      )
      const dialog = screen.getByRole('dialog')
      fireEvent.keyDown(dialog, { key: 'Escape' })
      expect(onCancel).toHaveBeenCalledTimes(1)
    })

    it('calls onCancel when backdrop is clicked', () => {
      const onCancel = vi.fn()
      render(
        <ConfirmDialog open onConfirm={() => {}} onCancel={onCancel} title="Confirm?" />
      )
      const dialog = screen.getByRole('dialog')
      fireEvent.click(dialog, { target: dialog })
      expect(onCancel).toHaveBeenCalledTimes(1)
    })
  })

  // ─── Danger variant ──────────────────────────────────────────────────

  describe('danger variant', () => {
    it('applies danger variant to confirm button', () => {
      render(
        <ConfirmDialog
          open
          onConfirm={() => {}}
          onCancel={() => {}}
          title="Delete?"
          variant="danger"
        />
      )
      const confirmBtn = screen.getByRole('button', { name: 'Confirm' })
      expect(confirmBtn).toHaveAttribute('data-variant', 'danger')
    })

    it('default variant uses primary for confirm button', () => {
      render(
        <ConfirmDialog open onConfirm={() => {}} onCancel={() => {}} title="Confirm?" />
      )
      const confirmBtn = screen.getByRole('button', { name: 'Confirm' })
      expect(confirmBtn).toHaveAttribute('data-variant', 'primary')
    })
  })

  // ─── Loading state ──────────────────────────────────────────────────

  describe('loading state', () => {
    it('shows loading state on confirm button', () => {
      render(
        <ConfirmDialog
          open
          onConfirm={() => {}}
          onCancel={() => {}}
          title="Saving..."
          loading
        />
      )
      const confirmBtn = screen.getByRole('button', { name: 'Confirm' })
      expect(confirmBtn).toHaveAttribute('aria-busy', 'true')
    })

    it('prevents confirm click when loading', () => {
      const onConfirm = vi.fn()
      render(
        <ConfirmDialog
          open
          onConfirm={onConfirm}
          onCancel={() => {}}
          title="Saving..."
          loading
        />
      )
      const confirmBtn = screen.getByRole('button', { name: 'Confirm' })
      fireEvent.click(confirmBtn)
      // Button is disabled when loading, so the click handler on Button should not fire
      expect(onConfirm).not.toHaveBeenCalled()
    })

    it('disables cancel button when loading', () => {
      render(
        <ConfirmDialog
          open
          onConfirm={() => {}}
          onCancel={() => {}}
          title="Saving..."
          loading
        />
      )
      const cancelBtn = screen.getByRole('button', { name: 'Cancel' })
      expect(cancelBtn).toBeDisabled()
    })
  })

  // ─── ReactNode description ──────────────────────────────────────────

  describe('ReactNode description', () => {
    it('supports ReactNode as description', () => {
      render(
        <ConfirmDialog
          open
          onConfirm={() => {}}
          onCancel={() => {}}
          title="Delete?"
          description={<span data-testid="rich-desc">Rich description</span>}
        />
      )
      expect(screen.getByTestId('rich-desc')).toBeInTheDocument()
    })
  })

  // ─── Motion ──────────────────────────────────────────────────────────

  describe('motion', () => {
    it('passes motion prop to dialog', () => {
      render(
        <ConfirmDialog
          open
          onConfirm={() => {}}
          onCancel={() => {}}
          title="Confirm?"
          motion={0}
        />
      )
      expect(screen.getByRole('dialog')).toHaveAttribute('data-motion', '0')
    })
  })

  // ─── Accessibility ──────────────────────────────────────────────────

  describe('accessibility', () => {
    it('has no axe violations when open', async () => {
      const { container } = render(
        <ConfirmDialog
          open
          onConfirm={() => {}}
          onCancel={() => {}}
          title="Confirm action?"
          description="This will do something."
        />
      )
      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })

    it('has no axe violations when closed', async () => {
      const { container } = render(
        <ConfirmDialog
          open={false}
          onConfirm={() => {}}
          onCancel={() => {}}
          title="Confirm?"
        />
      )
      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })

    it('dialog has aria-labelledby pointing to title', () => {
      render(
        <ConfirmDialog open onConfirm={() => {}} onCancel={() => {}} title="Confirm?" />
      )
      const dialog = screen.getByRole('dialog')
      expect(dialog).toHaveAttribute('aria-labelledby')
    })
  })
})
