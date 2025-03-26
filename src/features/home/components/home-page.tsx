import { Hero } from "@/features/hero/components/hero";
import { heroMetadata } from "@/features/hero/metadata";
import { About } from "@/features/about/components/about";
import { Projects } from "@/features/projects/components/projects";
import { Skills } from "@/features/skills/components/skills";
import { TechRadar } from "@/features/tech-radar/components/tech-radar";
import { Contact } from "@/features/contact/components/contact";
import { MainLayout } from "@/components/layouts/main-layout";

export function HomePage() {
  return (
    <MainLayout>
      <main className="min-h-screen bg-background">
        <Hero {...heroMetadata} />
        <About />
        <Skills />
        <TechRadar />
        <Projects />
        <Contact />
      </main>
    </MainLayout>
  );
}
