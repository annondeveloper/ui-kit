'use client'

import { type ReactNode } from 'react'
import { css } from '../core/styles/css-tag'
import { useStyles } from '../core/styles/use-styles'
import { Dialog } from './dialog'
import { Button } from './button'

// ─── Types ──────────────────────────────────────────────────────────────────

export interface ConfirmDialogProps {
  open: boolean
  onConfirm: () => void
  onCancel: () => void
  title: ReactNode
  description?: ReactNode
  confirmLabel?: string
  cancelLabel?: string
  variant?: 'default' | 'danger'
  loading?: boolean
  motion?: 0 | 1 | 2 | 3
}

// ─── Styles ─────────────────────────────────────────────────────────────────

const confirmDialogStyles = css`
  @layer components {
    @scope (.ui-confirm-dialog) {
      .ui-confirm-dialog__description {
        margin: 0;
        font-size: var(--text-sm, 0.875rem);
        line-height: 1.5;
        color: var(--text-secondary, oklch(70% 0 0));
        text-wrap: pretty;
      }

      .ui-confirm-dialog__actions {
        display: flex;
        justify-content: flex-end;
        gap: var(--space-sm, 0.5rem);
        padding-block-start: var(--space-lg, 1.25rem);
      }

      /* Touch targets */
      @media (pointer: coarse) {
        .ui-confirm-dialog__actions button {
          min-block-size: 44px;
        }
      }
    }
  }
`

// ─── Component ──────────────────────────────────────────────────────────────

export function ConfirmDialog({
  open,
  onConfirm,
  onCancel,
  title,
  description,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  variant = 'default',
  loading = false,
  motion: motionProp,
}: ConfirmDialogProps) {
  useStyles('confirm-dialog', confirmDialogStyles)

  return (
    <div className="ui-confirm-dialog">
      <Dialog
        open={open}
        onClose={onCancel}
        title={title}
        size="sm"
        showClose={false}
        motion={motionProp}
      >
        {description && (
          <div className="ui-confirm-dialog__description">
            {description}
          </div>
        )}
        <div className="ui-confirm-dialog__actions">
          <Button
            variant="secondary"
            onClick={onCancel}
            disabled={loading}
          >
            {cancelLabel}
          </Button>
          <Button
            variant={variant === 'danger' ? 'danger' : 'primary'}
            onClick={onConfirm}
            loading={loading}
            disabled={loading}
          >
            {confirmLabel}
          </Button>
        </div>
      </Dialog>
    </div>
  )
}

ConfirmDialog.displayName = 'ConfirmDialog'
