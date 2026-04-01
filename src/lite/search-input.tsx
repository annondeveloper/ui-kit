import { forwardRef } from 'react'
import { SearchInput as StandardSearchInput, type SearchInputProps } from '../components/search-input'

export type LiteSearchInputProps = Omit<SearchInputProps, 'motion'>

export const SearchInput = forwardRef<HTMLInputElement, LiteSearchInputProps>(
  (props, ref) => <StandardSearchInput ref={ref} motion={0} {...props} />
)
SearchInput.displayName = 'SearchInput'
