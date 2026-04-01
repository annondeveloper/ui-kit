import { ConfirmDialog as StandardConfirmDialog, type ConfirmDialogProps } from '../components/confirm-dialog'

export type LiteConfirmDialogProps = Omit<ConfirmDialogProps, 'motion'>

export function ConfirmDialog(props: LiteConfirmDialogProps) {
  return <StandardConfirmDialog motion={0} {...props} />
}
ConfirmDialog.displayName = 'ConfirmDialog'
