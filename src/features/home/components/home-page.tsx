import { Hero } from "@/features/hero/components/hero"
import { About } from "@/features/about/components/about"
import { Projects } from "@/features/projects/components/projects"
import { Skills } from "@/features/skills/components/skills"
import { TechRadar } from "@/features/tech-radar/components/tech-radar"
import { Contact } from "@/features/contact/components/contact"
import { MainLayout } from "@/components/layouts/main-layout"

// Flag to control which sections to display
const SHOW_ALL_SECTIONS = false

export function HomePage() {
  return (
    <MainLayout>
      <main className="min-h-screen bg-background">
        <Hero />
        <About />
        <Skills />
        <TechRadar />
        <Projects />
        <Contact />
      </main>
    </MainLayout>
  )
}

