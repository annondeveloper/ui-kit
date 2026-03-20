import { useId } from 'react'

export function useStableId(prefix = 'ui'): string {
  const id = useId()
  return `${prefix}-${id.replace(/:/g, '')}`
}
