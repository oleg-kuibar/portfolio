import { useRef, useState, useMemo } from "react"
import { useInView } from "framer-motion"
import { PROJECTS_DATA } from "../constants/projects-data"
import type { Project } from "../types/project"
import { ProjectCategory } from "../types/project"

export const useProjects = () => {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-100px" })
  const [activeFilter, setActiveFilter] = useState<ProjectCategory>(ProjectCategory.All)
  const [selectedProject, setSelectedProject] = useState<Project | null>(null)

  // Extract unique categories
  const categories = useMemo(() => {
    return Array.from(new Set(PROJECTS_DATA.map((project) => project.category)))
  }, [])

  // Filter projects based on active filter
  const filteredProjects = useMemo(() => {
    if (activeFilter === ProjectCategory.All) {
      return PROJECTS_DATA
    }
    return PROJECTS_DATA.filter((project) => project.category === activeFilter)
  }, [activeFilter])

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

  return {
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
  }
} 