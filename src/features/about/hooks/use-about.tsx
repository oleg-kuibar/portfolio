import { useRef } from "react";
import { useInView } from "framer-motion";
import { useTheme } from "next-themes";
import { CodeIcon, RocketIcon, UsersIcon } from "lucide-react";
import {
  ABOUT_CARDS,
  ABOUT_ANIMATIONS,
  ABOUT_CONTENT,
} from "../constants/about-content";
import type { ReactElement } from "react";

export function useAbout() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.3 });
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";

  const getIcon = (iconName: string): ReactElement | null => {
    switch (iconName) {
      case "code":
        return <CodeIcon className="h-10 w-10 text-primary" />;
      case "rocket":
        return <RocketIcon className="h-10 w-10 text-primary" />;
      case "users":
        return <UsersIcon className="h-10 w-10 text-primary" />;
      default:
        return null;
    }
  };

  return {
    ref,
    isInView,
    isDark,
    cards: ABOUT_CARDS,
    content: ABOUT_CONTENT,
    animations: ABOUT_ANIMATIONS,
    getIcon,
  };
}
