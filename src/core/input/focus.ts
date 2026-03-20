import { useState, useEffect } from 'react'

export type FocusMethod = 'keyboard' | 'pointer' | 'programmatic'

export function useFocusMethod(): FocusMethod {
  const [method, setMethod] = useState<FocusMethod>('pointer')

  useEffect(() => {
    const onKey = () => setMethod('keyboard')
    const onPointer = () => setMethod('pointer')

    document.addEventListener('keydown', onKey)
    document.addEventListener('pointerdown', onPointer)

    return () => {
      document.removeEventListener('keydown', onKey)
      document.removeEventListener('pointerdown', onPointer)
    }
  }, [])

  return method
}
