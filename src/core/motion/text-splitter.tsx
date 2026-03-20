import { forwardRef } from 'react'

export interface TextSplitterProps {
  text: string
  splitBy?: 'chars' | 'words' | 'lines'
  className?: string
  charClassName?: string
}

export const TextSplitter = forwardRef<HTMLSpanElement, TextSplitterProps>(
  ({ text, splitBy = 'chars', className, charClassName }, ref) => {
    const parts =
      splitBy === 'chars'
        ? text.split('')
        : splitBy === 'words'
          ? text.split(/(\s+)/)
          : text.split('\n')

    return (
      <span ref={ref} className={className} aria-label={text}>
        {parts.map((part, i) => (
          <span
            key={i}
            className={charClassName}
            aria-hidden="true"
            style={{ display: 'inline-block', whiteSpace: part.trim() ? undefined : 'pre' }}
          >
            {part}
          </span>
        ))}
      </span>
    )
  },
)
TextSplitter.displayName = 'TextSplitter'
