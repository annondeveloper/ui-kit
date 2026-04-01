import { Popover as StandardPopover, type PopoverProps } from '../components/popover'

export type LitePopoverProps = Omit<PopoverProps, 'motion'>

export function Popover(props: LitePopoverProps) {
  return <StandardPopover motion={0} {...props} />
}
Popover.displayName = 'Popover'
