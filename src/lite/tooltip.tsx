import { Tooltip as StandardTooltip, type TooltipProps } from '../components/tooltip'

export type LiteTooltipProps = Omit<TooltipProps, 'motion'>

export function Tooltip(props: LiteTooltipProps) {
  return <StandardTooltip motion={0} {...props} />
}
Tooltip.displayName = 'Tooltip'
