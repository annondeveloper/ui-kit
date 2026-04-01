import { forwardRef } from 'react'
import { TagInput as StandardTagInput, type TagInputProps } from '../components/tag-input'

export type LiteTagInputProps = Omit<TagInputProps, 'motion'>

export const TagInput = forwardRef<HTMLDivElement, LiteTagInputProps>(
  (props, ref) => <StandardTagInput ref={ref} motion={0} {...props} />
)
TagInput.displayName = 'TagInput'
