export interface NavItem {
  name: string
  href: string
}

export interface NavState {
  isOpen: boolean
  scrolled: boolean
  activeSection: string
} 