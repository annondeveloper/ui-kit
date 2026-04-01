import { forwardRef } from 'react'
import { Pagination as StandardPagination, type PaginationProps } from '../components/pagination'

export type LitePaginationProps = Omit<PaginationProps, 'motion'>

export const Pagination = forwardRef<HTMLElement, LitePaginationProps>(
  (props, ref) => <StandardPagination ref={ref} motion={0} {...props} />
)
Pagination.displayName = 'Pagination'
