"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { MenuIcon, XIcon } from "lucide-react"
import { cn } from "@/utils/cn"
import { ThemeToggle } from "@/features/theme/components/theme-toggle"
import { useNav } from "../hooks/use-nav"
import { DesktopNav } from "./desktop-nav"
import { MobileNav } from "./mobile-nav"

export function Navbar() {
  const {
    isOpen,
    scrolled,
    activeSection,
    isMobile,
    headerRef,
    toggleMenu,
    closeMenu,
  } = useNav()

  return (
    <header
      ref={headerRef}
      className={cn(
        "fixed top-0 w-full z-50 transition-all duration-300",
        scrolled ? "bg-background/80 backdrop-blur-md shadow-sm dark:bg-background/90" : "bg-transparent",
      )}
    >
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <Link href="/" className="text-2xl font-bold text-primary">
          OK<span className="text-primary/70">.</span>
        </Link>

        <DesktopNav activeSection={activeSection} closeMenu={closeMenu} />

        <div className="flex items-center space-x-4">
          <ThemeToggle />

          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="icon"
            aria-label="Toggle menu"
            className="md:hidden rounded-full"
            onClick={toggleMenu}
          >
            {isOpen ? <XIcon className="h-5 w-5" /> : <MenuIcon className="h-5 w-5" />}
          </Button>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isMobile && (
        <MobileNav
          isOpen={isOpen}
          scrolled={scrolled}
          activeSection={activeSection}
          closeMenu={closeMenu}
        />
      )}
    </header>
  )
}

