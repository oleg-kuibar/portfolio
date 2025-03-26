import { useRef } from "react";
import { useInView } from "framer-motion";
import { useTheme } from "next-themes";

export function useHero() {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, amount: 0.3 });
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";

  const scrollToAbout = () => {
    const aboutSection = document.getElementById("about");
    if (aboutSection) {
      aboutSection.scrollIntoView({ behavior: "smooth" });
    }
  };

  return {
    ref,
    isInView,
    isDark,
    scrollToAbout,
  };
}
