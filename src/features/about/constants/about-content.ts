import type {
  AboutCard,
  AboutContent,
  AboutAnimationVariants,
} from "../types/about";

export const ABOUT_CARDS: AboutCard[] = [
  {
    icon: "code",
    title: "Technical Excellence",
    description:
      "I specialize in building high-performance, scalable frontend systems with React, TypeScript, and Next.js.",
  },
  {
    icon: "rocket",
    title: "Architectural Innovation",
    description:
      "I design modular, maintainable architectures that scale with complexity and enable teams to work efficiently.",
  },
  {
    icon: "users",
    title: "Team Leadership",
    description:
      "I mentor engineers, drive technical decisions, and bridge the gap between business goals and technical implementation.",
  },
];

export const ABOUT_CONTENT: AboutContent = {
  title: "About Me",
  subtitle:
    "As a Staff Frontend Engineer with 8+ years of experience, I bridge technical excellence, architectural innovation, and team leadership to craft scalable, maintainable, and user-focused systems.",
  journey: {
    title: "My Journey",
    paragraphs: [
      "I'm a Frontend Enthusiast from Toronto. While I primarily focus on frontend technologies, I have a boundless passion for exploring and discovering new technologies. I believe in lifelong learning and always strive to expand my horizons as a software engineer.",
      "My work extends beyond code—I shape systems, mentor teams, and drive strategic outcomes. This portfolio showcases flagship projects, alongside thought leadership via blog posts. It's a living artifact of my experience in frontend engineering, highlighting my ability to lead complex initiatives, optimize critical paths, and deliver measurable business value.",
    ],
  },
};

export const ABOUT_ANIMATIONS: {
  container: AboutAnimationVariants;
  item: AboutAnimationVariants;
} = {
  container: {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
      },
    },
  },
  item: {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5 },
    },
  },
};
