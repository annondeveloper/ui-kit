import { forwardRef } from 'react'
import { Drawer as StandardDrawer, type DrawerProps } from '../components/drawer'

export type LiteDrawerProps = Omit<DrawerProps, 'motion'>

export const Drawer = forwardRef<HTMLDivElement, LiteDrawerProps>(
  (props, ref) => <StandardDrawer ref={ref} motion={0} {...props} />
)
Drawer.displayName = 'Drawer'
