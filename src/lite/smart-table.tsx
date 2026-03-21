import { type ReactNode } from 'react'
import { DataTable, type LiteColumnDef, type LiteDataTableProps } from './data-table'

/** SmartTable lite — alias for DataTable lite */
export interface LiteSmartTableProps<T extends object> extends LiteDataTableProps<T> {}

export function SmartTable<T extends object>(props: LiteSmartTableProps<T>) {
  return <DataTable {...props} />
}
SmartTable.displayName = 'SmartTable'
