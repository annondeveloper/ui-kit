import { forwardRef, type InputHTMLAttributes } from 'react'

export interface LiteSearchInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type' | 'size'> {
  size?: 'sm' | 'md' | 'lg'
}

export const SearchInput = forwardRef<HTMLInputElement, LiteSearchInputProps>(
  ({ size = 'md', className, ...rest }, ref) => (
    <div className={`ui-lite-search-input${className ? ` ${className}` : ''}`} data-size={size}>
      <span className="ui-lite-search-input__icon" aria-hidden="true">&#x1F50D;</span>
      <input ref={ref} type="search" {...rest} />
    </div>
  )
)
SearchInput.displayName = 'SearchInput'
