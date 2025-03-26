"use client"

import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { MenuIcon, XIcon } from "lucide-react"
import { cn } from "@/utils/cn"
import { useMobile } from "@/hooks/use-mobile"
import { motion } from "framer-motion"
import { ThemeToggle } from "@/features/theme/components/theme-toggle"
import { scrollToElement } from "@/utils/scroll-utils"

// Define which nav items to show
const SHOW_BLOG = false

const navItems = [
  { name: "About", href: "#about" },
  { name: "Skills", href: "#skills" },
  { name: "Tech Radar", href: "#tech-radar" },
  { name: "Projects", href: "#projects" },
  // Conditionally include blog in the navigation
  ...(SHOW_BLOG ? [{ name: "Blog", href: "#blog" }] : []),
  { name: "Contact", href: "#contact" },
]

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [activeSection, setActiveSection] = useState("")
  const isMobile = useMobile()
  const headerRef = useRef<HTMLElement>(null)

  useEffect(() => {
    // Setup intersection observer for header background
    const headerObserver = new IntersectionObserver(
      ([entry]) => {
        // When we're at the very top, remove the background
        setScrolled(!entry.isIntersecting)
      },
      { rootMargin: "-10px 0px 0px 0px", threshold: 0 },
    )

    // Create a sentinel element at the top of the page
    const sentinel = document.createElement("div")
    sentinel.style.position = "absolute"
    sentinel.style.top = "0"
    sentinel.style.height = "1px"
    sentinel.style.width = "100%"
    sentinel.style.pointerEvents = "none"
    document.body.prepend(sentinel)

    headerObserver.observe(sentinel)

    // Setup intersection observers for each section
    const sectionObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && entry.intersectionRatio > 0.3) {
            setActiveSection(entry.target.id)
          }
        })
      },
      {
        rootMargin: "-20% 0px -70% 0px",
        threshold: [0.1, 0.3, 0.5],
      },
    )

    // Observe all sections
    const sections = navItems.map((item) => item.href.substring(1))
    sections.forEach((section) => {
      const element = document.getElementById(section)
      if (element) {
        sectionObserver.observe(element)
      }
    })

    return () => {
      headerObserver.disconnect()
      sectionObserver.disconnect()
      sentinel.remove()
    }
  }, [])

  const toggleMenu = () => setIsOpen(!isOpen)
  const closeMenu = () => setIsOpen(false)

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

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-8">
          {navItems.map((item) => (
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
                if (isMobile) {
                  closeMenu()
                }
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
        <div
          className={cn(
            "fixed inset-0 bg-background z-40 transform transition-transform duration-300 ease-in-out",
            isOpen ? "translate-x-0" : "translate-x-full",
            scrolled ? "top-16" : "top-20",
          )}
        >
          <nav className="flex flex-col items-center justify-center h-full space-y-8">
            {navItems.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "text-xl font-medium transition-colors",
                  activeSection === item.href.substring(1) ? "text-primary" : "text-foreground/80 hover:text-primary",
                )}
                onClick={(e) => {
                  e.preventDefault()
                  scrollToElement(item.href.substring(1))
                  if (isMobile) {
                    closeMenu()
                  }
                }}
              >
                {item.name}
              </Link>
            ))}

            <div className="pt-4">
              <ThemeToggle />
            </div>
          </nav>
        </div>
      )}
    </header>
  )
}

