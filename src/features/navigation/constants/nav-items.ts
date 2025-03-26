import { NavItem } from "../types/nav"

// Define which nav items to show
export const SHOW_BLOG = false

export const NAV_ITEMS: NavItem[] = [
  { name: "About", href: "#about" },
  { name: "Skills", href: "#skills" },
  { name: "Tech Radar", href: "#tech-radar" },
  { name: "Projects", href: "#projects" },
  // Conditionally include blog in the navigation
  ...(SHOW_BLOG ? [{ name: "Blog", href: "#blog" }] : []),
  { name: "Contact", href: "#contact" },
] 