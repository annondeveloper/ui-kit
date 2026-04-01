import { forwardRef } from 'react'
import { Navbar as StandardNavbar, type NavbarProps } from '../components/navbar'

export type LiteNavbarProps = NavbarProps

export const Navbar = forwardRef<HTMLElement, LiteNavbarProps>(
  (props, ref) => <StandardNavbar ref={ref} {...props} />
)
Navbar.displayName = 'Navbar'
