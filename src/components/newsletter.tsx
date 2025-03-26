"use client"

import type React from "react"

import { useState } from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { MailIcon, CheckIcon } from "lucide-react"

export function Newsletter() {
  const [email, setEmail] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubscribed, setIsSubscribed] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (!email) {
      setError("Please enter your email address")
      return
    }

    if (!/^\S+@\S+\.\S+$/.test(email)) {
      setError("Please enter a valid email address")
      return
    }

    setIsSubmitting(true)

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1500))

      setIsSubmitting(false)
      setIsSubscribed(true)
      setEmail("")
    } catch (error) {
      setIsSubmitting(false)
      setError("Failed to subscribe. Please try again later.")
    }
  }

  return (
    <section className="py-16 bg-primary/5">
      <div className="container mx-auto px-4">
        <Card className="max-w-3xl mx-auto border-none shadow-lg overflow-hidden">
          <div className="grid grid-cols-1 md:grid-cols-5">
            <div className="md:col-span-3 p-8">
              <CardHeader className="p-0 mb-4">
                <CardTitle className="text-2xl">Subscribe to My Newsletter</CardTitle>
                <CardDescription>
                  Get the latest articles, tutorials, and updates on frontend development delivered to your inbox.
                </CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                {!isSubscribed ? (
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                      <Input
                        type="email"
                        placeholder="your@email.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className={error ? "border-destructive" : ""}
                      />
                      {error && <p className="text-sm text-destructive">{error}</p>}
                    </div>
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
                          Subscribing...
                        </span>
                      ) : (
                        <span className="flex items-center">
                          <MailIcon className="mr-2 h-4 w-4" />
                          Subscribe
                        </span>
                      )}
                    </Button>
                    <p className="text-xs text-foreground/60 text-center">
                      I respect your privacy. Unsubscribe at any time.
                    </p>
                  </form>
                ) : (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg text-center"
                  >
                    <div className="flex items-center justify-center mb-2">
                      <div className="bg-green-100 dark:bg-green-800/30 p-2 rounded-full">
                        <CheckIcon className="h-6 w-6 text-green-600 dark:text-green-400" />
                      </div>
                    </div>
                    <h4 className="font-medium text-green-800 dark:text-green-400">Thank you for subscribing!</h4>
                    <p className="text-sm text-green-700 dark:text-green-500 mt-1">
                      You'll receive updates on the latest articles and tutorials.
                    </p>
                  </motion.div>
                )}
              </CardContent>
            </div>
            <div className="hidden md:block md:col-span-2 bg-gradient-to-br from-primary/80 to-primary p-8 text-white flex items-center justify-center">
              <div className="text-center">
                <MailIcon className="h-16 w-16 mx-auto mb-4 opacity-90" />
                <h3 className="text-xl font-semibold mb-2">Stay Updated</h3>
                <p className="text-white/80 text-sm">
                  Join 500+ developers who get regular insights on frontend development best practices.
                </p>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </section>
  )
}

