export interface Skill {
  name: string;
  level: number;
}

export interface SkillCategory {
  name: string;
  description: string;
  skills: SkillDetails[];
}

export type ExperienceLevel = "Expert" | "Advanced" | "Intermediate";

export interface SkillDetails {
  name: string;
  icon: string;
  experienceLevel: ExperienceLevel;
  yearsOfExperience: number;
  projects: number;
  certifications: string[];
  notableAchievements: string[];
}

export interface SkillAnimationVariants {
  container: {
    hidden: { opacity: 0 };
    visible: {
      opacity: 1;
      transition: {
        staggerChildren: number;
      };
    };
  };
  item: {
    hidden: { opacity: 0; y: number };
    visible: {
      opacity: 1;
      y: 0;
      transition: { duration: number };
    };
  };
}
