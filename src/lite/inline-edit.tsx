import { forwardRef } from 'react'
import { InlineEdit as StandardInlineEdit, type InlineEditProps } from '../components/inline-edit'

export type LiteInlineEditProps = Omit<InlineEditProps, 'motion'>

export const InlineEdit = forwardRef<HTMLDivElement, LiteInlineEditProps>(
  (props, ref) => <StandardInlineEdit ref={ref} motion={0} {...props} />
)
InlineEdit.displayName = 'InlineEdit'
