"use client"

import { useState, useEffect } from "react"

export function useMobile() {
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    // Set initial state based on window width
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }

    // Check immediately
    checkIfMobile()

    // Use matchMedia for more efficient listening
    const mediaQuery = window.matchMedia("(max-width: 767px)")

    // Define listener
    const handleMediaQueryChange = (e: MediaQueryListEvent) => {
      setIsMobile(e.matches)
    }

    // Modern browsers
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener("change", handleMediaQueryChange)
      return () => mediaQuery.removeEventListener("change", handleMediaQueryChange)
    }
    // Fallback for older browsers
    else {
      mediaQuery.addListener(handleMediaQueryChange)
      return () => mediaQuery.removeListener(handleMediaQueryChange)
    }
  }, [])

  return isMobile
}

