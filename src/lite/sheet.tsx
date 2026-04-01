import { Sheet as StandardSheet, type SheetProps } from '../components/sheet'

export type LiteSheetProps = Omit<SheetProps, 'motion'>

export function Sheet(props: LiteSheetProps) {
  return <StandardSheet motion={0} {...props} />
}
Sheet.displayName = 'Sheet'
