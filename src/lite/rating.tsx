import { forwardRef } from 'react'
import { Rating as StandardRating, type RatingProps } from '../components/rating'

export type LiteRatingProps = Omit<RatingProps, 'motion'>

export const Rating = forwardRef<HTMLDivElement, LiteRatingProps>(
  (props, ref) => <StandardRating ref={ref} motion={0} {...props} />
)
Rating.displayName = 'Rating'
