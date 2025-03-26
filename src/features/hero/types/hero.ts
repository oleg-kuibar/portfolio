export interface SocialLinks {
  linkedin: string;
  github: string;
}

export interface HeroProps {
  title: string;
  subtitle: string;
  name: string;
  role: string;
  description: string;
  socialLinks: SocialLinks;
}

export interface HeroBackgroundProps {
  isDark: boolean;
}
