import { DropdownMenu as StandardDropdownMenu, type DropdownMenuProps, type MenuItem } from '../components/dropdown-menu'

export type LiteMenuItem = MenuItem
export type LiteDropdownMenuProps = Omit<DropdownMenuProps, 'motion'>

export function DropdownMenu(props: LiteDropdownMenuProps) {
  return <StandardDropdownMenu motion={0} {...props} />
}
DropdownMenu.displayName = 'DropdownMenu'
