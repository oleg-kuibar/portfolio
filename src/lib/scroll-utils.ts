export function scrollToElement(elementId: string, offset = 80): void {
  const element = document.getElementById(elementId);

  if (element) {
    // Use the modern scrollIntoView with behavior option
    element.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });

    // Apply offset adjustment after scroll
    // This is needed because scrollIntoView doesn't support offset directly
    setTimeout(() => {
      const elementPosition =
        element.getBoundingClientRect().top + window.scrollY;
      const offsetPosition = elementPosition - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth",
      });
    }, 0);
  }
}

/**
 * Smoothly scrolls to the top of the page
 */
export function scrollToTop(): void {
  try {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  } catch {
    window.scrollTo(0, 0);
  }
}
