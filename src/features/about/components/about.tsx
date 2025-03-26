"use client"

import { motion } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/utils/cn"
import { useAbout } from "../hooks/use-about"

export function About() {
  const { ref, isInView, isDark, cards, content, animations, getIcon } = useAbout()

  return (
    <section id="about" className="py-20 bg-muted/10">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">About Me</h2>
          <div className="w-20 h-1 mx-auto mb-6 bg-primary/80"></div>
          <p className="text-lg text-foreground/70 max-w-3xl mx-auto">
            I'm a passionate software engineer with expertise in building scalable web applications and micro-frontend architectures.
          </p>
        </div>

        <motion.div
          ref={ref}
          variants={animations.container}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          className="grid grid-cols-1 md:grid-cols-3 gap-8"
        >
          {cards.map((card, index) => (
            <motion.div key={index} variants={animations.item}>
              <Card className={cn("h-full border-none shadow-md hover:shadow-lg transition-shadow", isDark && "bg-card/80 backdrop-blur-sm")}>
                <CardContent className="p-6 flex flex-col items-center text-center">
                  <div className="mb-4 p-3 rounded-full bg-primary/10">{getIcon(card.icon)}</div>
                  <h3 className="text-xl font-semibold mb-3">{card.title}</h3>
                  <p className="text-foreground/70">{card.description}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>

        <motion.div
          variants={animations.item}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          className={cn("mt-16 bg-card rounded-lg p-8 shadow-md", isDark && "bg-card/80 backdrop-blur-sm")}
        >
          <div className="max-w-3xl mx-auto">
            <h3 className="text-2xl font-semibold mb-4">{content.journey.title}</h3>
            {content.journey.paragraphs.map((paragraph, index) => (
              <p key={index} className={cn("text-foreground/70", index < content.journey.paragraphs.length - 1 && "mb-4")}>
                {paragraph}
              </p>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  )
}

