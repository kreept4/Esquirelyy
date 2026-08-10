import type { ReactNode } from 'react'

/**
 * Types for the vendored ReactBits StaggeredMenu (plain JSX, no types of its
 * own). Without this, TypeScript infers the array props as `never[]` from their
 * `[]` defaults and rejects every item you pass.
 *
 * `logo` is our local addition — see the LOCAL PATCH note in StaggeredMenu.jsx.
 */

export interface StaggeredMenuItem {
  label: string
  ariaLabel?: string
  link: string
}

export interface StaggeredMenuSocialItem {
  label: string
  link: string
}

export interface StaggeredMenuProps {
  position?: 'left' | 'right'
  colors?: string[]
  items?: StaggeredMenuItem[]
  socialItems?: StaggeredMenuSocialItem[]
  socialsTitle?: string
  displaySocials?: boolean
  displayItemNumbering?: boolean
  className?: string
  logo?: ReactNode
  logoUrl?: string
  menuButtonColor?: string
  openMenuButtonColor?: string
  accentColor?: string
  changeMenuColorOnOpen?: boolean
  isFixed?: boolean
  closeOnClickAway?: boolean
  onMenuOpen?: () => void
  onMenuClose?: () => void
}

export declare const StaggeredMenu: (props: StaggeredMenuProps) => JSX.Element
export default StaggeredMenu
