/**
 * Types for the vendored ReactBits InfiniteMenu (plain JSX, no types of its own).
 * Without this, `items` infers as never[] from its [] default and rejects
 * everything passed in — same trap as StaggeredMenu.
 */

export interface InfiniteMenuItem {
  image: string
  link: string
  title: string
  description: string
}

export interface InfiniteMenuProps {
  items?: InfiniteMenuItem[]
  /** Camera zoom. */
  scale?: number
}

export default function InfiniteMenu(props: InfiniteMenuProps): JSX.Element
