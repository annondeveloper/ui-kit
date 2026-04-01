import { Dialog as StandardDialog, type DialogProps } from '../components/dialog'

export type LiteDialogProps = Omit<DialogProps, 'motion'>

export function Dialog(props: LiteDialogProps) {
  return <StandardDialog motion={0} {...props} />
}
Dialog.displayName = 'Dialog'
