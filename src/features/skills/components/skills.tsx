"use client"

import { motion } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useSkills } from "../hooks/use-skills"

export function Skills() {
  const { ref, isInView, containerVariants, itemVariants, skillsData } = useSkills()

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
              {Object.entries(skillsData).map(([key, { name }]) => (
                <TabsTrigger key={key} value={key}>
                  {name}
                </TabsTrigger>
              ))}
            </TabsList>

            {Object.entries(skillsData).map(([key, { skills }]) => (
              <TabsContent key={key} value={key}>
                <Card>
                  <CardContent className="p-6">
                    <motion.div variants={containerVariants} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {skills.map((skill, index) => (
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
            ))}
          </Tabs>
        </motion.div>
      </div>
    </section>
  )
}

