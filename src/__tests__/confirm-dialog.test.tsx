import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ConfirmDialog } from '../components/confirm-dialog'

// Mock framer-motion to avoid portal/animation issues
vi.mock('framer-motion', async () => {
  const actual = await vi.importActual('framer-motion')
  return {
    ...actual,
    AnimatePresence: ({ children }: { children: React.ReactNode }) => <>{children}</>,
    motion: {
      div: ({ children, ...props }: React.PropsWithChildren<Record<string, unknown>>) => {
        // Filter out motion-specific props
        const htmlProps: Record<string, unknown> = {}
        for (const [key, val] of Object.entries(props)) {
          if (!['initial', 'animate', 'exit', 'transition', 'variants', 'custom'].includes(key)) {
            htmlProps[key] = val
          }
        }
        return <div {...htmlProps}>{children}</div>
      },
    },
  }
})

describe('ConfirmDialog', () => {
  it('renders when open', () => {
    render(
      <ConfirmDialog
        open={true}
        onOpenChange={() => {}}
        title="Delete Item"
        description="Are you sure?"
        onConfirm={() => {}}
      />
    )
    expect(screen.getByText('Delete Item')).toBeInTheDocument()
  })

  it('shows title and message', () => {
    render(
      <ConfirmDialog
        open={true}
        onOpenChange={() => {}}
        title="Confirm Action"
        description="This cannot be undone."
        onConfirm={() => {}}
      />
    )
    expect(screen.getByText('Confirm Action')).toBeInTheDocument()
    expect(screen.getByText('This cannot be undone.')).toBeInTheDocument()
  })

  it('calls onConfirm on confirm button click', async () => {
    const user = userEvent.setup()
    const onConfirm = vi.fn()
    render(
      <ConfirmDialog
        open={true}
        onOpenChange={() => {}}
        title="Delete"
        description="Sure?"
        confirmLabel="Delete"
        onConfirm={onConfirm}
      />
    )
    await user.click(screen.getByRole('button', { name: 'Delete' }))
    expect(onConfirm).toHaveBeenCalledOnce()
  })

  it('calls onCancel on cancel button click', async () => {
    const user = userEvent.setup()
    const onOpenChange = vi.fn()
    render(
      <ConfirmDialog
        open={true}
        onOpenChange={onOpenChange}
        title="Delete"
        description="Sure?"
        cancelLabel="Nope"
        onConfirm={() => {}}
      />
    )
    await user.click(screen.getByRole('button', { name: 'Nope' }))
    // Radix AlertDialog.Cancel calls onOpenChange(false)
    expect(onOpenChange).toHaveBeenCalledWith(false)
  })
})
