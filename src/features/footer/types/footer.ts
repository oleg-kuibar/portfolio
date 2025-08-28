export interface SocialLink {
  name: string;
  url: string;
  icon: string;
  label: string;
}

export interface FooterContent {
  role: string;
  socialLinks: SocialLink[];
  techStack: string[];
  name: string;
}
