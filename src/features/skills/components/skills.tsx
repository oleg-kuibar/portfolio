"use client"

import { useRef } from "react"
import { motion, useInView } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export function Skills() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, amount: 0.3 })

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
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

  const frontendSkills = [
    { name: "React", level: 95 },
    { name: "TypeScript", level: 90 },
    { name: "Next.js", level: 92 },
    { name: "CSS/Tailwind", level: 88 },
    { name: "Redux/Context API", level: 85 },
    { name: "React Query", level: 80 },
    { name: "Framer Motion", level: 75 },
    { name: "Testing (Jest, RTL)", level: 85 },
  ]

  const backendSkills = [
    { name: "Node.js", level: 80 },
    { name: "Express", level: 75 },
    { name: "GraphQL", level: 70 },
    { name: "REST API Design", level: 85 },
    { name: "MongoDB", level: 65 },
    { name: "PostgreSQL", level: 60 },
    { name: "AWS Services", level: 65 },
    { name: "Firebase", level: 70 },
  ]

  const otherSkills = [
    { name: "System Architecture", level: 85 },
    { name: "CI/CD", level: 80 },
    { name: "Performance Optimization", level: 90 },
    { name: "Agile/Scrum", level: 85 },
    { name: "Technical Leadership", level: 90 },
    { name: "Code Reviews", level: 95 },
    { name: "Mentoring", level: 85 },
    { name: "Documentation", level: 80 },
  ]

  return (
    <section id="skills" className="py-20">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Skills & Expertise</h2>
          <div className="w-20 h-1 bg-primary mx-auto mb-6"></div>
          <p className="text-lg text-foreground/70 max-w-3xl mx-auto">
            A comprehensive overview of my technical skills and expertise, showcasing my proficiency across various
            technologies and domains.
          </p>
        </div>

        <motion.div
          ref={ref}
          variants={containerVariants}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          className="max-w-4xl mx-auto"
        >
          <Tabs defaultValue="frontend" className="w-full">
            <TabsList className="grid w-full grid-cols-3 mb-8">
              <TabsTrigger value="frontend">Frontend</TabsTrigger>
              <TabsTrigger value="backend">Backend</TabsTrigger>
              <TabsTrigger value="other">Leadership & Other</TabsTrigger>
            </TabsList>

            <TabsContent value="frontend">
              <Card>
                <CardContent className="p-6">
                  <motion.div variants={containerVariants} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {frontendSkills.map((skill, index) => (
                      <motion.div key={index} variants={itemVariants} className="space-y-2">
                        <div className="flex justify-between">
                          <span className="font-medium">{skill.name}</span>
                          <span className="text-foreground/70">{skill.level}%</span>
                        </div>
                        <Progress value={skill.level} className="h-2" />
                      </motion.div>
                    ))}
                  </motion.div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="backend">
              <Card>
                <CardContent className="p-6">
                  <motion.div variants={containerVariants} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {backendSkills.map((skill, index) => (
                      <motion.div key={index} variants={itemVariants} className="space-y-2">
                        <div className="flex justify-between">
                          <span className="font-medium">{skill.name}</span>
                          <span className="text-foreground/70">{skill.level}%</span>
                        </div>
                        <Progress value={skill.level} className="h-2" />
                      </motion.div>
                    ))}
                  </motion.div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="other">
              <Card>
                <CardContent className="p-6">
                  <motion.div variants={containerVariants} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {otherSkills.map((skill, index) => (
                      <motion.div key={index} variants={itemVariants} className="space-y-2">
                        <div className="flex justify-between">
                          <span className="font-medium">{skill.name}</span>
                          <span className="text-foreground/70">{skill.level}%</span>
                        </div>
                        <Progress value={skill.level} className="h-2" />
                      </motion.div>
                    ))}
                  </motion.div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </motion.div>
      </div>
    </section>
  )
}

