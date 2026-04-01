import { forwardRef } from 'react'
import { Card as StandardCard, type CardProps } from '../components/card'

export type LiteCardProps = Omit<CardProps, 'motion'>

export const Card = forwardRef<HTMLElement, LiteCardProps>(
  (props, ref) => <StandardCard ref={ref} motion={0} {...props} />
)
Card.displayName = 'Card'
