import { forwardRef, type HTMLAttributes } from 'react'

export interface LiteStreamingTextProps extends HTMLAttributes<HTMLDivElement> {
  text: string
}

export const StreamingText = forwardRef<HTMLDivElement, LiteStreamingTextProps>(
  ({ text, className, ...rest }, ref) => (
    <div ref={ref} className={`ui-lite-streaming-text${className ? ` ${className}` : ''}`} {...rest}>
      {text}
    </div>
  )
)
StreamingText.displayName = 'StreamingText'
