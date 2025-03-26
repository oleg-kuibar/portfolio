import { useRef } from "react"
import { useInView } from "framer-motion"
import { SKILLS_DATA } from "../constants/skills-data"

export const useSkills = () => {
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

  return {
    ref,
    isInView,
    containerVariants,
    itemVariants,
    skillsData: SKILLS_DATA,
  }
} 