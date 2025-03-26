import type React from "react"
/**
 * Checks if a URL is valid
 * @param url The URL to check
 * @returns True if the URL is valid, false otherwise
 */
export function isValidUrl(url: string): boolean {
  if (!url || url === "#") return false

  try {
    new URL(url)
    return true
  } catch (e) {
    return false
  }
}

/**
 * Handles click events for links that might not be valid yet
 * @param url The URL to navigate to
 * @param e The click event
 * @param fallbackMessage The message to show if the URL is not valid
 */
export function handleLinkClick(
  url: string,
  e: React.MouseEvent<HTMLAnchorElement>,
  fallbackMessage = "Link coming soon!",
): void {
  if (!isValidUrl(url)) {
    e.preventDefault()
    alert(fallbackMessage)
  }
}

