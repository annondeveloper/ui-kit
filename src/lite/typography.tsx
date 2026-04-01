import { forwardRef } from 'react'
import { Typography as StandardTypography, type TypographyProps } from '../components/typography'

export type LiteTypographyProps = Omit<TypographyProps, 'motion'>

export const Typography = forwardRef<HTMLElement, LiteTypographyProps>(
  (props, ref) => <StandardTypography ref={ref} motion={0} {...props} />
)
Typography.displayName = 'Typography'
