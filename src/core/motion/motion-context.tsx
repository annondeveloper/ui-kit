import { createContext, type ReactNode } from 'react'

export const MotionContext = createContext<number>(3)

export function MotionProvider({ level, children }: { level: number; children: ReactNode }) {
  return <MotionContext.Provider value={level}>{children}</MotionContext.Provider>
}
