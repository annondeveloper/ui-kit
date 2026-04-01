import { forwardRef } from 'react'
import { Slider as StandardSlider, type SliderProps } from '../components/slider'

export type LiteSliderProps = Omit<SliderProps, 'motion'>

export const Slider = forwardRef<HTMLDivElement, LiteSliderProps>(
  (props, ref) => <StandardSlider ref={ref} motion={0} {...props} />
)
Slider.displayName = 'Slider'
