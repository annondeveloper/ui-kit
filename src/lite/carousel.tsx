import { forwardRef } from 'react'
import { Carousel as StandardCarousel, type CarouselProps } from '../components/carousel'

export type LiteCarouselProps = Omit<CarouselProps, 'motion'>

export const Carousel = forwardRef<HTMLDivElement, LiteCarouselProps>(
  (props, ref) => <StandardCarousel ref={ref} motion={0} {...props} />
)
Carousel.displayName = 'Carousel'
