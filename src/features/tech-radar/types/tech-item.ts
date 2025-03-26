export type TechLevel = "core" | "frequent" | "occasional" | "exploring";
export type TechCategory = "frontend" | "backend" | "testing" | "devops";

export interface TechItem {
  name: string;
  category: TechCategory;
  level: TechLevel;
  description: string;
}

export interface TechItemPosition {
  x: number;
  y: number;
  radius: number;
  labelX?: number;
  labelY?: number;
}
