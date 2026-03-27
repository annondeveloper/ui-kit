import { forwardRef } from 'react'
import { TransferList as StandardTransferList, type TransferListProps, type TransferListItem } from '../components/transfer-list'

export type { TransferListItem as LiteTransferListItem }
export type LiteTransferListProps = Omit<TransferListProps, 'motion'>

export const TransferList = forwardRef<HTMLDivElement, LiteTransferListProps>(
  (props, ref) => <StandardTransferList ref={ref} motion={0} {...props} />
)
TransferList.displayName = 'TransferList'
