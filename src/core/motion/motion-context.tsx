import { createContext, type ReactNode, type ReactElement } from 'react'

export const MotionContext = createContext<number>(3)

export function MotionProvider({ level, children }: { level: number; children: ReactNode }): ReactElement {
  return <MotionContext.Provider value={level}>{children}</MotionContext.Provider>
}
