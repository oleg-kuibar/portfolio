"use client"

import Link from "next/link"
import { cn } from "@/utils/cn"
import { scrollToElement } from "@/utils/scroll-utils"
import { NAV_ITEMS } from "../constants/nav-items"
import { ThemeToggle } from "@/features/theme/components/theme-toggle"
import { motion, AnimatePresence } from "framer-motion"

interface MobileNavProps {
  isOpen: boolean
  scrolled: boolean
  activeSection: string
  closeMenu: () => void
}

const menuVariants = {
  closed: {
    y: "-100%",
    opacity: 0,
  },
  open: {
    y: 0,
    opacity: 1,
    transition: {
      type: "spring",
      damping: 25,
      stiffness: 300,
    },
  },
  exit: {
    y: "-100%",
    opacity: 0,
    transition: {
      duration: 0.2,
      ease: "easeInOut",
    },
  },
}

const itemVariants = {
  closed: { y: -20, opacity: 0 },
  open: (i: number) => ({
    y: 0,
    opacity: 1,
    transition: {
      delay: i * 0.1,
      duration: 0.3,
      ease: "easeOut",
    },
  }),
}

export function MobileNav({ isOpen, scrolled, activeSection, closeMenu }: MobileNavProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <div 
          className="fixed inset-0 z-[100] safe-area-padding overscroll-none touch-none"
          style={{ WebkitTapHighlightColor: "transparent" }}
        >
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-0 bg-background/60 backdrop-blur-sm"
            onClick={closeMenu}
          />

          {/* Navigation Panel */}
          <motion.div
            variants={menuVariants}
            initial="closed"
            animate="open"
            exit="exit"
            className={cn(
              "absolute inset-x-0 w-full bg-background/95 backdrop-blur-md",
              "border-b border-border/30 shadow-[0_0_15px_rgba(0,0,0,0.05)]",
              "dark:shadow-[0_0_15px_rgba(0,0,0,0.2)]",
              "max-h-[50vh]",
              scrolled ? "top-16" : "top-20",
            )}
          >
            <nav className="flex flex-col h-full safe-area-top">
              {/* Navigation Links */}
              <motion.div 
                className="flex-1 flex flex-col items-center justify-center py-6 overflow-y-auto overscroll-contain"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.1 }}
              >
                {NAV_ITEMS.map((item, i) => (
                  <motion.div
                    key={item.name}
                    variants={itemVariants}
                    initial="closed"
                    animate="open"
                    custom={i}
                    className="w-full"
                  >
                    <Link
                      href={item.href}
                      className={cn(
                        "block w-full px-8 py-4 text-lg font-medium transition-all",
                        "hover:bg-primary/5 active:bg-primary/10",
                        "touch-manipulation select-none",
                        activeSection === item.href.substring(1)
                          ? "text-primary relative before:absolute before:left-0 before:top-1/2 before:-translate-y-1/2 before:h-8 before:w-1 before:bg-primary before:rounded-r"
                          : "text-foreground/70 hover:text-primary",
                      )}
                      onClick={(e) => {
                        e.preventDefault()
                        scrollToElement(item.href.substring(1))
                        closeMenu()
                      }}
                    >
                      {item.name}
                    </Link>
                  </motion.div>
                ))}
              </motion.div>

              {/* Footer */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="py-4 border-t border-border/30"
              >
                <div className="flex justify-center">
                  <ThemeToggle />
                </div>
              </motion.div>
            </nav>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
} 