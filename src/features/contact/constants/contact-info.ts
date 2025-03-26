import type { ContactInfo } from "../types/contact";

export const CONTACT_INFO: ContactInfo[] = [
  {
    icon: "mail",
    title: "Email",
    value: "contact@olegkuibar.dev",
    link: "mailto:contact@olegkuibar.dev",
  },
  {
    icon: "linkedin",
    title: "LinkedIn",
    value: "linkedin.com/in/olegkuibar",
    link: "https://linkedin.com/in/olegkuibar",
  },
  {
    icon: "github",
    title: "GitHub",
    value: "github.com/oleg-kuibar",
    link: "https://github.com/oleg-kuibar",
  },
  {
    icon: "map",
    title: "Location",
    value: "Toronto, Canada",
    link: null,
  },
];

export const CONTACT_ANIMATIONS = {
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
