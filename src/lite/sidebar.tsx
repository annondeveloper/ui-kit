import { forwardRef } from 'react'
import { Sidebar as StandardSidebar, SidebarItem, type SidebarProps, type SidebarItemProps } from '../components/sidebar'

export type LiteSidebarProps = Omit<SidebarProps, 'motion'>
export type LiteSidebarItemProps = SidebarItemProps
export { SidebarItem }

export const Sidebar = forwardRef<HTMLElement, LiteSidebarProps>(
  (props, ref) => <StandardSidebar ref={ref} motion={0} {...props} />
)
Sidebar.displayName = 'Sidebar'
