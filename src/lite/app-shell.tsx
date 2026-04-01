import { forwardRef } from 'react'
import { AppShell as StandardAppShell, type AppShellProps } from '../components/app-shell'

export type LiteAppShellProps = AppShellProps

export const AppShell = forwardRef<HTMLDivElement, LiteAppShellProps>(
  (props, ref) => <StandardAppShell ref={ref} {...props} />
)
AppShell.displayName = 'AppShell'
