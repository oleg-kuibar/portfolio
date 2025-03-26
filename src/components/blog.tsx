"use client"

import { useRef } from "react"
import Image from "next/image"
import { motion, useInView } from "framer-motion"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { CalendarIcon, ClockIcon, ArrowRightIcon } from "lucide-react"
import { handleLinkClick } from "@/lib/link-utils"

export function Blog() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, amount: 0.1 })

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

  const blogPosts = [
    {
      title: "Architecting React for Enterprise Scale",
      excerpt:
        "A deep dive into structuring large-scale React applications for maintainability, performance, and team collaboration.",
      image: "/placeholder.svg?height=300&width=600",
      date: "March 15, 2023",
      readTime: "12 min read",
      tags: ["React", "Architecture", "Enterprise"],
      url: "#",
    },
    {
      title: "Micro-Frontends vs. Monoliths: A Performance Study",
      excerpt:
        "Comparing the performance implications of micro-frontend architecture against traditional monolithic approaches.",
      image: "/placeholder.svg?height=300&width=600",
      date: "January 22, 2023",
      readTime: "15 min read",
      tags: ["Micro-Frontends", "Performance", "Architecture"],
      url: "#",
    },
    {
      title: "The Future of Frontend Testing",
      excerpt: "Exploring emerging testing strategies and tools that are shaping the future of frontend development.",
      image: "/placeholder.svg?height=300&width=600",
      date: "November 8, 2022",
      readTime: "10 min read",
      tags: ["Testing", "Frontend", "Best Practices"],
      url: "#",
    },
  ]

  return (
    <section id="blog" className="py-20">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Technical Blog</h2>
          <div className="w-20 h-1 bg-primary mx-auto mb-6"></div>
          <p className="text-lg text-foreground/70 max-w-3xl mx-auto">
            Insights, tutorials, and thought leadership on frontend development, architecture, and engineering best
            practices.
          </p>
        </div>

        <motion.div
          ref={ref}
          variants={containerVariants}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
        >
          {blogPosts.map((post, index) => (
            <motion.div key={index} variants={itemVariants}>
              <Card className="h-full overflow-hidden border-none shadow-md hover:shadow-lg transition-all duration-300">
                <div className="relative h-48 w-full overflow-hidden">
                  <Image
                    src={post.image || "/placeholder.svg"}
                    alt={post.title}
                    fill
                    className="object-cover transition-transform duration-500 hover:scale-105"
                  />
                </div>
                <CardHeader>
                  <div className="flex items-center gap-4 text-sm text-foreground/60 mb-2">
                    <div className="flex items-center">
                      <CalendarIcon className="mr-1 h-4 w-4" />
                      {post.date}
                    </div>
                    <div className="flex items-center">
                      <ClockIcon className="mr-1 h-4 w-4" />
                      {post.readTime}
                    </div>
                  </div>
                  <CardTitle className="line-clamp-2">{post.title}</CardTitle>
                  <CardDescription className="line-clamp-3">{post.excerpt}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {post.tags.map((tag, tagIndex) => (
                      <Badge key={tagIndex} variant="secondary">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
                <CardFooter>
                  <Button variant="ghost" className="ml-auto group" asChild>
                    <a href={post.url || "#"} onClick={(e) => handleLinkClick(post.url, e, "Article coming soon!")}>
                      Read More
                      <ArrowRightIcon className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </a>
                  </Button>
                </CardFooter>
              </Card>
            </motion.div>
          ))}
        </motion.div>

        <div className="text-center mt-12">
          <Button
            variant="outline"
            size="lg"
            onClick={() => {
              alert("More articles coming soon!")
            }}
          >
            View All Articles
          </Button>
        </div>
      </div>
    </section>
  )
}

