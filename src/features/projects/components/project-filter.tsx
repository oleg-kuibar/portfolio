"use client"
import { Button } from "@/components/ui/button"
import { cn } from "@/utils/cn"

interface ProjectFilterProps {
  categories: string[]
  onFilterChange: (category: string) => void
  activeFilter: string
}

export function ProjectFilter({ categories, onFilterChange, activeFilter }: ProjectFilterProps) {
  return (
    <div className="flex flex-wrap justify-center gap-2 mb-8">
      {["All", ...categories].map((category) => (
        <Button
          key={category}
          variant={activeFilter === category ? "default" : "outline"}
          size="sm"
          onClick={() => onFilterChange(category)}
          className={cn(
            "rounded-full px-4 transition-all",
            activeFilter === category ? "bg-primary text-primary-foreground" : "hover:bg-primary/10 hover:text-primary",
          )}
        >
          {category}
        </Button>
      ))}
    </div>
  )
}

