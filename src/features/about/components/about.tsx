"use client"

import { useRef } from "react"
import { motion, useInView } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import { RocketIcon, CodeIcon, UsersIcon } from "lucide-react"

export function About() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, amount: 0.3 })

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
      },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5 },
    },
  }

  const cards = [
    {
      icon: <CodeIcon className="h-10 w-10 text-primary" />,
      title: "Technical Excellence",
      description:
        "I specialize in building high-performance, scalable frontend systems with React, TypeScript, and Next.js.",
    },
    {
      icon: <RocketIcon className="h-10 w-10 text-primary" />,
      title: "Architectural Innovation",
      description:
        "I design modular, maintainable architectures that scale with complexity and enable teams to work efficiently.",
    },
    {
      icon: <UsersIcon className="h-10 w-10 text-primary" />,
      title: "Team Leadership",
      description:
        "I mentor engineers, drive technical decisions, and bridge the gap between business goals and technical implementation.",
    },
  ]

  return (
    <section id="about" className="py-20 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">About Me</h2>
          <div className="w-20 h-1 bg-primary mx-auto mb-6"></div>
          <p className="text-lg text-foreground/70 max-w-3xl mx-auto">
            As a Staff Frontend Engineer with 8+ years of experience, I bridge technical excellence, architectural
            innovation, and team leadership to craft scalable, maintainable, and user-focused systems.
          </p>
        </div>

        <motion.div
          ref={ref}
          variants={containerVariants}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          className="grid grid-cols-1 md:grid-cols-3 gap-8"
        >
          {cards.map((card, index) => (
            <motion.div key={index} variants={itemVariants}>
              <Card className="h-full border-none shadow-md hover:shadow-lg transition-shadow">
                <CardContent className="p-6 flex flex-col items-center text-center">
                  <div className="mb-4 p-3 rounded-full bg-primary/10">{card.icon}</div>
                  <h3 className="text-xl font-semibold mb-3">{card.title}</h3>
                  <p className="text-foreground/70">{card.description}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>

        <motion.div
          variants={itemVariants}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          className="mt-16 bg-card rounded-lg p-8 shadow-md"
        >
          <div className="max-w-3xl mx-auto">
            <h3 className="text-2xl font-semibold mb-4">My Journey</h3>
            <p className="text-foreground/70 mb-4">
              I&apos;m a Frontend Enthusiast from Toronto. While I primarily focus on frontend technologies, I have a
              boundless passion for exploring and discovering new technologies. I believe in lifelong learning and
              always strive to expand my horizons as a software engineer.
            </p>
            <p className="text-foreground/70">
              My work extends beyond code—I shape systems, mentor teams, and drive strategic outcomes. This portfolio
              showcases flagship projects, alongside thought leadership via blog posts. It&apos;s a living artifact of my
              experience in frontend engineering, highlighting my ability to lead complex initiatives, optimize critical
              paths, and deliver measurable business value.
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  )
}

