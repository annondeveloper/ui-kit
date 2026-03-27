import { forwardRef } from 'react'
import { TableOfContents as StandardTableOfContents, type TableOfContentsProps, type TocItem } from '../components/table-of-contents'

export type { TocItem as LiteTocItem }
export type LiteTableOfContentsProps = Omit<TableOfContentsProps, 'motion'>

export const TableOfContents = forwardRef<HTMLElement, LiteTableOfContentsProps>(
  (props, ref) => <StandardTableOfContents ref={ref} motion={0} {...props} />
)
TableOfContents.displayName = 'TableOfContents'
