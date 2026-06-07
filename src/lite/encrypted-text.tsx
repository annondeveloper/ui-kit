import { forwardRef, type HTMLAttributes } from 'react'
import { css } from '../core/styles/css-tag'
import { useStyles } from '../core/styles/use-styles'

const encryptedTextStyles = css`
  @layer components {
    @scope (.ui-lite-encrypted-text) {
      :scope {
        display: inline;
        font-variant-numeric: tabular-nums;
        font-family: var(--font-mono, ui-monospace, monospace);
      }
    }
  }
`

export interface LiteEncryptedTextProps extends HTMLAttributes<HTMLSpanElement> {
  text: string
  trigger?: 'mount' | 'hover' | 'inView'
  speed?: number
  scrambleChars?: string
}

export const EncryptedText = forwardRef<HTMLSpanElement, LiteEncryptedTextProps>(
  ({ text, trigger = 'mount', speed = 2, scrambleChars, className, ...rest }, ref) => {
    useStyles('lite-encrypted-text', encryptedTextStyles)
    return (
    <span
      ref={ref}
      className={`ui-lite-encrypted-text${className ? ` ${className}` : ''}`}
      data-trigger={trigger}
      data-speed={speed}
      aria-label={text}
      {...rest}
    >
      {text}
    </span>
    )
  }
)
EncryptedText.displayName = 'EncryptedText'
