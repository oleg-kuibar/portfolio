"use client";

import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ExternalLinkIcon, SearchIcon } from "lucide-react";
import { ProjectFilter } from "./project-filter";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useTheme } from "next-themes";
import { cn } from "@/utils/cn";
import { handleLinkClick } from "@/utils/link-utils";
import { useProjects } from "../hooks/use-projects";
import { ProjectCategory } from "../types/project";
import { FaGithub } from "react-icons/fa";

export function Projects() {
  const { theme } = useTheme();
  const {
    ref,
    isInView,
    activeFilter,
    setActiveFilter,
    selectedProject,
    setSelectedProject,
    categories,
    filteredProjects,
    containerVariants,
    itemVariants,
  } = useProjects();

  return (
    <section id="projects" className="py-20 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Featured Projects
          </h2>
          <div className="w-20 h-1 mx-auto mb-6 bg-primary"></div>
          <p className="text-lg text-foreground/70 max-w-3xl mx-auto">
            Explore my portfolio of projects that showcase my technical skills,
            problem-solving abilities, and attention to detail.
          </p>
        </div>

        <ProjectFilter
          categories={categories}
          onFilterChange={setActiveFilter}
          activeFilter={activeFilter}
        />

        <div className="min-h-[800px]">
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
                  key={`${project.id}-${project.title}`}
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
                      "bg-card",
                    )}
                  >
                    <div className="relative h-48 w-full overflow-hidden">
                      {project.image &&
                      !project.image.includes("placeholder.svg") ? (
                        <Image
                          src={project.image}
                          alt={project.title}
                          fill
                          className={cn(
                            "object-cover transition-transform duration-500 group-hover:scale-105",
                            "dark:brightness-90",
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
                          <Badge
                            variant="default"
                            className="bg-orange-500 text-white dark:bg-orange-400"
                          >
                            POC
                          </Badge>
                        )}
                      </div>
                      {project.image &&
                        !project.image.includes("placeholder.svg") && (
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
                        {project.tags.length > 3 && (
                          <Badge variant="secondary">
                            +{project.tags.length - 3}
                          </Badge>
                        )}
                      </div>
                    </CardContent>
                    <CardFooter className="flex justify-between">
                      <Button variant="outline" size="sm" asChild>
                        <a
                          href={project.githubUrl || "#"}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) =>
                            handleLinkClick(
                              project.githubUrl,
                              e,
                              "GitHub repository coming soon!",
                            )
                          }
                        >
                          <FaGithub className="mr-2 h-4 w-4" />
                          Code
                        </a>
                      </Button>
                      <Button size="sm" asChild>
                        <a
                          href={project.demoUrl || "#"}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) =>
                            handleLinkClick(
                              project.demoUrl,
                              e,
                              "Live demo coming soon!",
                            )
                          }
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
            onClick={() => setActiveFilter(ProjectCategory.All)}
          >
            View All Projects
          </Button>
        </div>

        {/* Project Details Dialog */}
        <Dialog
          open={!!selectedProject}
          onOpenChange={(open) => !open && setSelectedProject(null)}
        >
          <DialogContent
            className={cn(
              "max-w-3xl max-h-[90vh] overflow-y-auto",
              theme === "dark" && "bg-card/95 backdrop-blur-sm",
            )}
          >
            {selectedProject && (
              <>
                <DialogHeader>
                  <DialogTitle className="text-2xl">
                    {selectedProject.title}
                  </DialogTitle>
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
                    className={cn(
                      "object-cover",
                      theme === "dark" && "dark-image-filter",
                    )}
                  />
                </div>
                <div className="space-y-4">
                  <p>{selectedProject.description}</p>

                  {selectedProject.details && (
                    <>
                      <div>
                        <h3 className="text-lg font-semibold mb-2">
                          Challenge
                        </h3>
                        <p className="text-foreground/80">
                          {selectedProject.details.challenge}
                        </p>
                      </div>

                      <div>
                        <h3 className="text-lg font-semibold mb-2">Solution</h3>
                        <p className="text-foreground/80">
                          {selectedProject.details.solution}
                        </p>
                      </div>

                      {selectedProject.details.architecture && (
                        <div>
                          <h3 className="text-lg font-semibold mb-2">
                            Architecture
                          </h3>
                          <p className="text-foreground/80">
                            {selectedProject.details.architecture}
                          </p>
                        </div>
                      )}

                      {selectedProject.details.results && (
                        <div>
                          <h3 className="text-lg font-semibold mb-2">
                            Results
                          </h3>
                          <p className="text-foreground/80">
                            {selectedProject.details.results}
                          </p>
                        </div>
                      )}

                      <div>
                        <h3 className="text-lg font-semibold mb-2">
                          Technologies
                        </h3>
                        <div className="flex flex-wrap gap-2">
                          {selectedProject.details.technologies.map(
                            (tech, index) => (
                              <Badge key={index} variant="secondary">
                                {tech}
                              </Badge>
                            ),
                          )}
                        </div>
                      </div>
                    </>
                  )}

                  <div className="flex justify-between pt-4">
                    <Button variant="outline" asChild>
                      <a
                        href={selectedProject.githubUrl || "#"}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) =>
                          handleLinkClick(
                            selectedProject.githubUrl,
                            e,
                            "GitHub repository coming soon!",
                          )
                        }
                      >
                        <FaGithub className="mr-2 h-4 w-4" />
                        View Code
                      </a>
                    </Button>
                    <Button asChild>
                      <a
                        href={selectedProject.demoUrl || "#"}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) =>
                          handleLinkClick(
                            selectedProject.demoUrl,
                            e,
                            "Live demo coming soon!",
                          )
                        }
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
  );
}
