"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import { cn } from "@/utils/cn"
import { scrollToElement } from "@/utils/scroll-utils"
import { NAV_ITEMS } from "../constants/nav-items"

interface DesktopNavProps {
  activeSection: string
  closeMenu: () => void
}

export function DesktopNav({ activeSection, closeMenu }: DesktopNavProps) {
  return (
    <nav className="hidden md:flex items-center space-x-8">
      {NAV_ITEMS.map((item) => (
        <Link
          key={item.name}
          href={item.href}
          className={cn(
            "transition-colors relative",
            activeSection === item.href.substring(1)
              ? "text-primary font-medium"
              : "text-foreground/80 hover:text-primary",
          )}
          onClick={(e) => {
            e.preventDefault()
            scrollToElement(item.href.substring(1))
            closeMenu()
          }}
        >
          {item.name}
          {activeSection === item.href.substring(1) && (
            <motion.span
              layoutId="activeSection"
              className="absolute -bottom-1 left-0 right-0 h-0.5 bg-primary"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
            />
          )}
        </Link>
      ))}
    </nav>
  )
} 