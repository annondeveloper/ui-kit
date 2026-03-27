import { forwardRef } from 'react'
import { Spoiler as StandardSpoiler, type SpoilerProps } from '../components/spoiler'

export type LiteSpoilerProps = Omit<SpoilerProps, 'motion'>

export const Spoiler = forwardRef<HTMLDivElement, LiteSpoilerProps>(
  (props, ref) => <StandardSpoiler ref={ref} motion={0} {...props} />
)
Spoiler.displayName = 'Spoiler'
