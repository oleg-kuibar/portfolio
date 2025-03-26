"use client"

import { useRef, useState, useMemo } from "react"
import Image from "next/image"
import { motion, useInView, AnimatePresence } from "framer-motion"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ExternalLinkIcon, GithubIcon, SearchIcon } from "lucide-react"
import { ProjectFilter } from "./project-filter"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { useTheme } from "next-themes"
import { cn } from "@/utils/cn"
import { handleLinkClick } from "@/utils/link-utils"

// Project type definition
interface Project {
  id: string
  title: string
  description: string
  image: string
  tags: string[]
  category: string
  demoUrl: string
  githubUrl: string
  featured: boolean
  poc?: boolean
  details?: {
    challenge: string
    solution: string
    technologies: string[]
    architecture?: string
    results?: string
  }
}

export function Projects() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-100px" })
  const [activeFilter, setActiveFilter] = useState<string>("all")
  const [selectedProject, setSelectedProject] = useState<Project | null>(null)
  const { theme } = useTheme()

  const projects = useMemo<Project[]>(() => [
    {
      id: "tasksync",
      title: "TaskSync",
      description:
        "A real-time collaboration tool for teams to manage tasks, track progress, and communicate efficiently.",
      image: "/placeholder.svg?height=400&width=600",
      tags: ["React", "TypeScript", "Socket.io", "Redux", "Node.js"],
      category: "Full Stack",
      demoUrl: "#",
      githubUrl: "https://github.com/oleg-kuibar/react-jsonschema-chakra-ui-custom-forms",
      featured: true,
      details: {
        challenge:
          "Building a real-time collaboration tool that maintains data consistency across multiple users while providing a responsive UI.",
        solution:
          "Implemented a WebSocket-based architecture with optimistic UI updates and conflict resolution strategies. Used Redux for state management and Socket.io for real-time communication between clients and server.",
        technologies: ["React", "TypeScript", "Socket.io", "Redux", "Node.js", "MongoDB", "Express"],
        architecture:
          "Microservices architecture with separate services for authentication, task management, and real-time updates.",
        results:
          "Reduced team coordination overhead by 35% and improved project delivery times by 20% in internal testing.",
      },
    },
    {
      id: "graphql-inspector",
      title: "GraphQL Network Inspector",
      description:
        "A Chrome extension for viewing and debugging GraphQL requests with my contribution of a 'copy cURL' feature.",
      image: "/placeholder.svg?height=400&width=600",
      tags: ["GraphQL", "React", "Chrome Extension", "Developer Tools", "Open Source"],
      category: "Developer Tools",
      demoUrl: "#",
      githubUrl: "https://github.com/warrenday/graphql-network-inspector",
      featured: true,
      details: {
        challenge:
          "While working with GraphQL, I found this extension extremely useful but noticed it lacked a 'copy cURL' feature that would streamline debugging, ticket creation, and pair programming.",
        solution:
          "I contributed to the open-source project by implementing the 'copy cURL' feature, allowing developers to easily share GraphQL requests as cURL commands for debugging and collaboration.",
        technologies: ["React", "GraphQL", "Chrome Extension API", "TypeScript", "JavaScript"],
        results:
          "My contribution was merged into the main project, benefiting over 5,000 active users with an average rating of 4.8/5 in the Chrome Web Store.",
      },
    },
    {
      id: "single-spa",
      title: "Single-SPA Microfrontends",
      description:
        "A proof of concept for micro-frontend architecture using Single-SPA with React, Angular, and shared styling.",
      image:
        "https://sjc.microlink.io/esUyj1DsnAUhCGGbNdD59W4_QiLgcwvbdOeHYkB85lnBI6WQ1smzCInxsuYn-_bsB1SiK-WqC7PyP1uGJsPX6Q.jpeg",
      tags: ["Single-SPA", "React", "Angular", "Micro-frontends", "Architecture"],
      category: "Architecture",
      demoUrl: "/case-studies/single-spa",
      githubUrl: "https://github.com/Single-Spa-Microfrontends",
      featured: true,
      details: {
        challenge:
          "Enabling multiple teams to work independently on different parts of an ad tech platform without conflicts.",
        solution:
          "Implemented a micro-frontend architecture using Single-SPA to integrate multiple frameworks and enable independent deployment.",
        technologies: ["Single-SPA", "React", "Angular", "TailwindCSS", "Webpack"],
        architecture:
          "Micro-frontend architecture with a root config orchestrating multiple framework-specific applications.",
        results:
          "Successfully implemented in production for ad tech applications, resulting in increased development velocity and team autonomy.",
      },
    },
    {
      id: "portfolio",
      title: "Portfolio Website",
      description: "A high-performance, accessible portfolio website built with Next.js and TypeScript.",
      image: "/placeholder.svg?height=400&width=600",
      tags: ["Next.js", "TypeScript", "Tailwind CSS", "Framer Motion"],
      category: "Frontend",
      demoUrl: "#",
      githubUrl: "#",
      featured: false,
      details: {
        challenge:
          "Creating a portfolio that showcases technical skills while maintaining excellent performance and accessibility.",
        solution:
          "Built a Next.js application with server components, optimized assets, and accessibility-first design.",
        technologies: ["Next.js", "TypeScript", "Tailwind CSS", "Framer Motion"],
        results: "Achieved 97+ Lighthouse scores across performance, accessibility, and SEO metrics.",
      },
    },
    {
      id: "modern-db-ide",
      title: "Modern Database IDE",
      description: "A modern, open-source database IDE inspired by DBeaver, built with an emphasis on user experience and contemporary design principles.",
      image: "/placeholder.svg?height=400&width=600", 
      tags: ["Electron", "React", "TypeScript", "SQL", "Database Tools"],
      category: "Developer Tools",
      demoUrl: "#",
      githubUrl: "#",
      featured: true,
      poc: true,
      details: {
        challenge: 
          "Traditional database IDEs like DBeaver, while powerful, often have dated UIs and lack modern UX patterns that developers have come to expect.",
        solution:
          "Developed an Electron-based database IDE that maintains DBeaver's powerful features while introducing a modern, intuitive interface with dark mode support and customizable workspaces.",
        technologies: ["Electron", "React", "TypeScript", "SQL", "Monaco Editor", "Node.js"],
        results:
          "Created an open-source alternative that combines robust database management capabilities with contemporary design principles and received positive community feedback.",
      },
    },
    {
      id: "voip-solution",
      title: "VoIP Communication Platform",
      description: "A modern VoIP solution replacing traditional landline calls with web, iOS and Android applications.",
      image: "/placeholder.svg?height=400&width=600",
      tags: ["WebRTC", "React Native", "Node.js", "SIP", "VoIP"],
      category: "Full Stack",
      demoUrl: "#",
      githubUrl: "#", 
      featured: true,
      poc: true,
      details: {
        challenge:
          "Creating a reliable, cross-platform VoIP solution to replace traditional landline calls while maintaining call quality and reliability.",
        solution:
          "Developed a WebRTC-based system with native mobile apps and web interface, implementing SIP protocol for PSTN integration.",
        technologies: ["WebRTC", "React Native", "Node.js", "PostgreSQL", "Redis", "SIP.js", "Docker"],
        architecture:
          "Microservices architecture with dedicated services for call handling, user management, and PSTN integration.",
        results:
          "Successfully deployed solution handling thousands of daily calls across web and mobile platforms with 99.9% uptime and high audio quality.",
      },
    },
  ], []) // Empty dependency array since projects are static

  // Extract unique categories
  const categories = useMemo(() => {
    return Array.from(new Set(projects.map((project) => project.category)))
  }, [projects])

  // Filter projects based on active filter
  const filteredProjects = useMemo(() => {
    if (activeFilter === "all") {
      return projects
    }
    return projects.filter((project) => project.category === activeFilter)
  }, [projects, activeFilter])

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
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6 },
    },
  }

  return (
    <section id="projects" className="py-20 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Featured Projects</h2>
          <div className="w-20 h-1 mx-auto mb-6 bg-primary"></div>
          <p className="text-lg text-foreground/70 max-w-3xl mx-auto">
            Explore my portfolio of projects that showcase my technical skills, problem-solving abilities, and attention
            to detail.
          </p>
        </div>

        <ProjectFilter categories={categories} onFilterChange={setActiveFilter} activeFilter={activeFilter} />

        <div className="min-h-[800px]">
          {" "}
          {/* Fixed minimum height container to prevent layout shifts */}
          <motion.div
            ref={ref}
            variants={containerVariants}
            initial="hidden"
            animate={isInView ? "visible" : "hidden"}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          >
            <AnimatePresence mode="wait">
              {filteredProjects.map((project) => (
                <motion.div
                  key={`${project.id}-${project.title}`} // Ensure unique keys
                  variants={itemVariants}
                  layout
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{ duration: 0.5 }}
                >
                  <Card
                    className={cn(
                      "h-full overflow-hidden border-none shadow-md hover:shadow-lg transition-all duration-300 group",
                      "bg-card"
                    )}
                  >
                    <div className="relative h-48 w-full overflow-hidden">
                      {project.image && !project.image.includes("placeholder.svg") ? (
                        <Image
                          src={project.image}
                          alt={project.title}
                          fill
                          className={cn(
                            "object-cover transition-transform duration-500 group-hover:scale-105",
                            "dark:brightness-90"
                          )}
                        />
                      ) : (
                        <div className="absolute inset-0 bg-card">
                          <div className="absolute inset-0 flex items-center justify-center p-6">
                            <h3 className="text-2xl font-bold text-center text-primary">
                              {project.title}
                            </h3>
                          </div>
                        </div>
                      )}
                      <div className="absolute top-2 right-2 flex gap-2">
                        {project.featured && (
                          <Badge variant="default" className="bg-primary">
                            Featured
                          </Badge>
                        )}
                        {project.poc && (
                          <Badge variant="default" className="bg-orange-500 text-white dark:bg-orange-400">
                            POC
                          </Badge>
                        )}
                      </div>
                      {project.image && !project.image.includes("placeholder.svg") && (
                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-white border-white hover:bg-white/20 hover:text-white transition-colors"
                            onClick={() => setSelectedProject(project)}
                          >
                            <SearchIcon className="mr-2 h-4 w-4" />
                            View Details
                          </Button>
                        </div>
                      )}
                    </div>
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <CardTitle>{project.title}</CardTitle>
                        <Badge variant="outline">{project.category}</Badge>
                      </div>
                      <CardDescription>{project.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-wrap gap-2">
                        {project.tags.slice(0, 3).map((tag, tagIndex) => (
                          <Badge key={tagIndex} variant="secondary">
                            {tag}
                          </Badge>
                        ))}
                        {project.tags.length > 3 && <Badge variant="secondary">+{project.tags.length - 3}</Badge>}
                      </div>
                    </CardContent>
                    <CardFooter className="flex justify-between">
                      <Button
                        variant="outline"
                        size="sm"
                        asChild
                      >
                        <a
                          href={project.githubUrl || "#"}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => handleLinkClick(project.githubUrl, e, "GitHub repository coming soon!")}
                        >
                          <GithubIcon className="mr-2 h-4 w-4" />
                          Code
                        </a>
                      </Button>
                      <Button 
                        size="sm" 
                        asChild
                      >
                        <a
                          href={project.demoUrl || "#"}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => handleLinkClick(project.demoUrl, e, "Live demo coming soon!")}
                        >
                          <ExternalLinkIcon className="mr-2 h-4 w-4" />
                          Live Demo
                        </a>
                      </Button>
                    </CardFooter>
                  </Card>
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        </div>

        <div className="text-center mt-12">
          <Button
            variant="outline"
            size="lg"
            onClick={() => setActiveFilter("all")}
          >
            View All Projects
          </Button>
        </div>

        {/* Project Details Dialog */}
        <Dialog open={!!selectedProject} onOpenChange={(open) => !open && setSelectedProject(null)}>
          <DialogContent
            className={cn("max-w-3xl max-h-[90vh] overflow-y-auto", theme === "dark" && "bg-card/95 backdrop-blur-sm")}
          >
            {selectedProject && (
              <>
                <DialogHeader>
                  <DialogTitle className="text-2xl">{selectedProject.title}</DialogTitle>
                  <DialogDescription>
                    <Badge variant="outline" className="mt-2">
                      {selectedProject.category}
                    </Badge>
                  </DialogDescription>
                </DialogHeader>
                <div className="relative h-64 w-full overflow-hidden rounded-md my-4">
                  <Image
                    src={selectedProject.image || "/placeholder.svg"}
                    alt={selectedProject.title}
                    fill
                    className={cn("object-cover", theme === "dark" && "dark-image-filter")}
                  />
                </div>
                <div className="space-y-4">
                  <p>{selectedProject.description}</p>

                  {selectedProject.details && (
                    <>
                      <div>
                        <h3 className="text-lg font-semibold mb-2">Challenge</h3>
                        <p className="text-foreground/80">{selectedProject.details.challenge}</p>
                      </div>

                      <div>
                        <h3 className="text-lg font-semibold mb-2">Solution</h3>
                        <p className="text-foreground/80">{selectedProject.details.solution}</p>
                      </div>

                      {selectedProject.details.architecture && (
                        <div>
                          <h3 className="text-lg font-semibold mb-2">Architecture</h3>
                          <p className="text-foreground/80">{selectedProject.details.architecture}</p>
                        </div>
                      )}

                      {selectedProject.details.results && (
                        <div>
                          <h3 className="text-lg font-semibold mb-2">Results</h3>
                          <p className="text-foreground/80">{selectedProject.details.results}</p>
                        </div>
                      )}

                      <div>
                        <h3 className="text-lg font-semibold mb-2">Technologies</h3>
                        <div className="flex flex-wrap gap-2">
                          {selectedProject.details.technologies.map((tech, index) => (
                            <Badge key={index} variant="secondary">
                              {tech}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </>
                  )}

                  <div className="flex justify-between pt-4">
                    <Button
                      variant="outline"
                      asChild
                    >
                      <a
                        href={selectedProject.githubUrl || "#"}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => handleLinkClick(selectedProject.githubUrl, e, "GitHub repository coming soon!")}
                      >
                        <GithubIcon className="mr-2 h-4 w-4" />
                        View Code
                      </a>
                    </Button>
                    <Button 
                      asChild
                    >
                      <a
                        href={selectedProject.demoUrl || "#"}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => handleLinkClick(selectedProject.demoUrl, e, "Live demo coming soon!")}
                      >
                        <ExternalLinkIcon className="mr-2 h-4 w-4" />
                        Live Demo
                      </a>
                    </Button>
                  </div>
                </div>
              </>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </section>
  )
}

