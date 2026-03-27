import { forwardRef } from 'react'
import { BackToTop as StandardBackToTop, type BackToTopProps } from '../components/back-to-top'

export type LiteBackToTopProps = Omit<BackToTopProps, 'motion'>

export const BackToTop = forwardRef<HTMLButtonElement, LiteBackToTopProps>(
  (props, ref) => <StandardBackToTop ref={ref} motion={0} {...props} />
)
BackToTop.displayName = 'BackToTop'
