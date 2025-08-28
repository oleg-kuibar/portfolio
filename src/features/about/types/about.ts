import type { Variants } from "framer-motion";

export interface AboutCard {
  icon: string;
  title: string;
  description: string;
}

export interface AboutContent {
  title: string;
  subtitle: string;
  journey: {
    title: string;
    paragraphs: string[];
  };
}

export type AboutAnimationVariants = Variants;
