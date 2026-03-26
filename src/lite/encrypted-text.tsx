import { forwardRef, type HTMLAttributes } from 'react'

export interface LiteEncryptedTextProps extends HTMLAttributes<HTMLSpanElement> {
  text: string
  trigger?: 'mount' | 'hover' | 'inView'
  speed?: number
  scrambleChars?: string
}

export const EncryptedText = forwardRef<HTMLSpanElement, LiteEncryptedTextProps>(
  ({ text, trigger = 'mount', speed = 2, scrambleChars, className, ...rest }, ref) => (
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
)
EncryptedText.displayName = 'EncryptedText'
