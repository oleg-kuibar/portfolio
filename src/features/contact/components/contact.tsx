"use client"

import type React from "react"

import { useRef } from "react"
import { motion, useInView } from "framer-motion"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { GithubIcon, LinkedinIcon, MailIcon, MapPinIcon } from "lucide-react"
import { useTheme } from "@/lib/providers/theme-provider"
import { cn } from "@/utils/cn"
import { useState } from "react"

export function Contact() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, amount: 0.3 })
  const [formState, setFormState] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitSuccess, setSubmitSuccess] = useState(false)
  const { resolvedTheme } = useTheme()
  const isDark = resolvedTheme === "dark"

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormState({
      ...formState,
      [e.target.name]: e.target.value,
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Basic validation
    if (!formState.name || !formState.email || !formState.subject || !formState.message) {
      alert("Please fill in all fields")
      return
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(formState.email)) {
      alert("Please enter a valid email address")
      return
    }

    setIsSubmitting(true)

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1500))

      setIsSubmitting(false)
      setSubmitSuccess(true)
      setFormState({
        name: "",
        email: "",
        subject: "",
        message: "",
      })

      // Reset success message after 5 seconds
      setTimeout(() => {
        setSubmitSuccess(false)
      }, 5000)
    } catch (error) {
      setIsSubmitting(false)
      alert("There was an error sending your message. Please try again later.")
    }
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

  const contactInfo = [
    {
      icon: <MailIcon className={cn("h-5 w-5", isDark ? "text-primary/80" : "text-primary")} />,
      title: "Email",
      value: "kuibar.oleg@gmail.com",
      link: "mailto:kuibar.oleg@gmail.com",
    },
    {
      icon: <LinkedinIcon className={cn("h-5 w-5", isDark ? "text-primary/80" : "text-primary")} />,
      title: "LinkedIn",
      value: "linkedin.com/in/olegkuibar",
      link: "https://linkedin.com/in/olegkuibar",
    },
    {
      icon: <GithubIcon className={cn("h-5 w-5", isDark ? "text-primary/80" : "text-primary")} />,
      title: "GitHub",
      value: "github.com/oleg-kuibar",
      link: "https://github.com/oleg-kuibar",
    },
    {
      icon: <MapPinIcon className={cn("h-5 w-5", isDark ? "text-primary/80" : "text-primary")} />,
      title: "Location",
      value: "Toronto, Canada",
      link: null,
    },
  ]

  return (
    <section id="contact" className={cn("py-20", isDark ? "bg-muted/10" : "bg-muted/30")}>
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Get In Touch</h2>
          <div className={cn("w-20 h-1 mx-auto mb-6", isDark ? "bg-primary/80" : "bg-primary")}></div>
          <p className="text-lg text-foreground/70 max-w-3xl mx-auto">
            Have a project in mind or want to discuss potential opportunities? Feel free to reach out!
          </p>
        </div>

        <motion.div
          ref={ref}
          variants={containerVariants}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-6xl mx-auto"
        >
          <motion.div variants={itemVariants} className="lg:col-span-1">
            <Card className={cn("h-full border-none shadow-md", isDark && "bg-card/80 backdrop-blur-sm")}>
              <CardHeader>
                <CardTitle>Contact Information</CardTitle>
                <CardDescription>Feel free to reach out through any of these channels</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {contactInfo.map((item, index) => (
                  <div key={index} className="flex items-start">
                    <div className="mr-3 mt-0.5">{item.icon}</div>
                    <div>
                      <h4 className="font-medium">{item.title}</h4>
                      {item.link ? (
                        <a
                          href={item.link}
                          className={cn(
                            "transition-colors",
                            isDark
                              ? "text-foreground/70 hover:text-primary/80"
                              : "text-foreground/70 hover:text-primary",
                          )}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          {item.value}
                        </a>
                      ) : (
                        <p className="text-foreground/70">{item.value}</p>
                      )}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </motion.div>

          <motion.div variants={itemVariants} className="lg:col-span-2">
            <Card className={cn("border-none shadow-md", isDark && "bg-card/80 backdrop-blur-sm")}>
              <CardHeader>
                <CardTitle>Send Me a Message</CardTitle>
                <CardDescription>I'll get back to you as soon as possible</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label htmlFor="name" className="text-sm font-medium">
                        Name
                      </label>
                      <Input
                        id="name"
                        name="name"
                        placeholder="Your name"
                        value={formState.name}
                        onChange={handleChange}
                        required
                        className={cn(isDark && "bg-card border-muted focus:border-primary/50")}
                      />
                    </div>
                    <div className="space-y-2">
                      <label htmlFor="email" className="text-sm font-medium">
                        Email
                      </label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        placeholder="Your email"
                        value={formState.email}
                        onChange={handleChange}
                        required
                        className={cn(isDark && "bg-card border-muted focus:border-primary/50")}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="subject" className="text-sm font-medium">
                      Subject
                    </label>
                    <Input
                      id="subject"
                      name="subject"
                      placeholder="Subject"
                      value={formState.subject}
                      onChange={handleChange}
                      required
                      className={cn(isDark && "bg-card border-muted focus:border-primary/50")}
                    />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="message" className="text-sm font-medium">
                      Message
                    </label>
                    <Textarea
                      id="message"
                      name="message"
                      placeholder="Your message"
                      rows={5}
                      value={formState.message}
                      onChange={handleChange}
                      required
                      className={cn(isDark && "bg-card border-muted focus:border-primary/50")}
                    />
                  </div>

                  {submitSuccess && (
                    <div
                      className={cn(
                        "p-3 rounded-md text-center",
                        isDark ? "bg-green-900/30 text-green-400" : "bg-green-100 text-green-800",
                      )}
                    >
                      Your message has been sent successfully!
                    </div>
                  )}

                  <Button type="submit" className="w-full" disabled={isSubmitting}>
                    {isSubmitting ? (
                      <span className="flex items-center">
                        <svg
                          className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          ></circle>
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          ></path>
                        </svg>
                        Sending...
                      </span>
                    ) : (
                      "Send Message"
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}

