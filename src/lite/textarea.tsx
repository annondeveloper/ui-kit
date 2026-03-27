import { forwardRef } from 'react'
import { Textarea as StandardTextarea, type TextareaProps } from '../components/textarea'

export type LiteTextareaProps = Omit<TextareaProps, 'motion'>

export const Textarea = forwardRef<HTMLTextAreaElement, LiteTextareaProps>(
  (props, ref) => <StandardTextarea ref={ref} motion={0} {...props} />
)
Textarea.displayName = 'Textarea'
