import { useState, useEffect, useRef } from "react"
import { useMobile } from "@/hooks/use-mobile"
import { NAV_ITEMS } from "../constants/nav-items"
import type { NavState } from "../types/nav"

export const useNav = () => {
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
    const sections = NAV_ITEMS.map((item) => item.href.substring(1))
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

  return {
    isOpen,
    scrolled,
    activeSection,
    isMobile,
    headerRef,
    toggleMenu,
    closeMenu,
  }
} 