"use client"

import { useRef } from "react"
import Image from "next/image"
import { motion, useInView } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { QuoteIcon, ChevronLeftIcon, ChevronRightIcon } from "lucide-react"
import { useState } from "react"
import { cn } from "@/lib/utils"

interface Testimonial {
  id: number
  name: string
  role: string
  company: string
  image: string
  quote: string
}

export function Testimonials() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, amount: 0.3 })
  const [activeIndex, setActiveIndex] = useState(0)

  const testimonials: Testimonial[] = [
    {
      id: 1,
      name: "Alex Johnson",
      role: "CTO",
      company: "TechVision Inc.",
      image: "/placeholder.svg?height=100&width=100",
      quote:
        "Oleg is an exceptional frontend engineer who consistently delivers high-quality code. His architectural insights transformed our application's performance and maintainability. A true professional who elevates any team he works with.",
    },
    {
      id: 2,
      name: "Sarah Chen",
      role: "Product Manager",
      company: "InnovateSoft",
      image: "/placeholder.svg?height=100&width=100",
      quote:
        "Working with Oleg was a game-changer for our project. His technical expertise combined with his ability to understand business requirements resulted in an exceptional user experience. He's not just a developer, but a valuable strategic partner.",
    },
    {
      id: 3,
      name: "Michael Rodriguez",
      role: "Engineering Director",
      company: "DataFlow Systems",
      image: "/placeholder.svg?height=100&width=100",
      quote:
        "Oleg's leadership in frontend architecture set new standards for our engineering team. His mentorship has been invaluable in growing our junior developers, and his technical decisions have stood the test of time as our application scaled.",
    },
  ]

  const nextTestimonial = () => {
    setActiveIndex((prev) => (prev + 1) % testimonials.length)
  }

  const prevTestimonial = () => {
    setActiveIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length)
  }

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

  return (
    <section className="py-20 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">What People Say</h2>
          <div className="w-20 h-1 bg-primary mx-auto mb-6"></div>
          <p className="text-lg text-foreground/70 max-w-3xl mx-auto">
            Feedback from colleagues and clients who have worked with me on various projects.
          </p>
        </div>

        <motion.div
          ref={ref}
          variants={containerVariants}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          className="max-w-4xl mx-auto relative"
        >
          <div className="absolute left-0 top-1/2 -translate-y-1/2 z-10">
            <Button
              variant="ghost"
              size="icon"
              className="rounded-full bg-background/80 backdrop-blur-sm shadow-md hover:bg-background"
              onClick={prevTestimonial}
            >
              <ChevronLeftIcon className="h-6 w-6" />
              <span className="sr-only">Previous testimonial</span>
            </Button>
          </div>

          <div className="overflow-hidden px-10">
            <div
              className="flex transition-transform duration-500 ease-in-out"
              style={{ transform: `translateX(-${activeIndex * 100}%)` }}
            >
              {testimonials.map((testimonial) => (
                <div key={testimonial.id} className="w-full flex-shrink-0">
                  <Card className="border-none shadow-md">
                    <CardContent className="p-8">
                      <div className="flex flex-col md:flex-row gap-6 items-center">
                        <div className="relative w-20 h-20 rounded-full overflow-hidden border-4 border-primary/20 flex-shrink-0">
                          <Image
                            src={testimonial.image || "/placeholder.svg"}
                            alt={testimonial.name}
                            fill
                            className="object-cover"
                          />
                        </div>

                        <div className="flex-1">
                          <QuoteIcon className="h-8 w-8 text-primary/30 mb-4" />
                          <p className="text-lg italic mb-4">{testimonial.quote}</p>
                          <div>
                            <h4 className="font-semibold">{testimonial.name}</h4>
                            <p className="text-sm text-foreground/70">
                              {testimonial.role}, {testimonial.company}
                            </p>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              ))}
            </div>
          </div>

          <div className="absolute right-0 top-1/2 -translate-y-1/2 z-10">
            <Button
              variant="ghost"
              size="icon"
              className="rounded-full bg-background/80 backdrop-blur-sm shadow-md hover:bg-background"
              onClick={nextTestimonial}
            >
              <ChevronRightIcon className="h-6 w-6" />
              <span className="sr-only">Next testimonial</span>
            </Button>
          </div>

          <div className="flex justify-center mt-6 gap-2">
            {testimonials.map((_, index) => (
              <button
                key={index}
                className={cn(
                  "w-3 h-3 rounded-full transition-colors",
                  index === activeIndex ? "bg-primary" : "bg-primary/30",
                )}
                onClick={() => setActiveIndex(index)}
                aria-label={`Go to testimonial ${index + 1}`}
              />
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  )
}

