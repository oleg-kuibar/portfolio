"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/utils/cn";
import type { ContactFormState } from "../types/contact";

interface ContactFormProps {
  isDark: boolean;
  formState: ContactFormState;
  handleChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => void;
  handleSubmit: (e: React.FormEvent) => Promise<void>;
}

export function ContactForm({
  isDark,
  formState,
  handleChange,
  handleSubmit,
}: ContactFormProps) {
  const { data, isSubmitting, submitSuccess } = formState;

  return (
    <Card
      className={cn(
        "border-none shadow-md",
        isDark && "bg-card/80 backdrop-blur-sm",
      )}
    >
      <CardHeader>
        <CardTitle>Send Me a Message</CardTitle>
        <CardDescription>
          I&apos;ll get back to you as soon as possible
        </CardDescription>
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
                value={data.name}
                onChange={handleChange}
                required
                className={cn(
                  isDark && "bg-card border-muted focus:border-primary/50",
                )}
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
                value={data.email}
                onChange={handleChange}
                required
                className={cn(
                  isDark && "bg-card border-muted focus:border-primary/50",
                )}
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
              value={data.subject}
              onChange={handleChange}
              required
              className={cn(
                isDark && "bg-card border-muted focus:border-primary/50",
              )}
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
              value={data.message}
              onChange={handleChange}
              required
              className={cn(
                isDark && "bg-card border-muted focus:border-primary/50",
              )}
            />
          </div>

          {submitSuccess && (
            <div className="text-sm text-green-500 dark:text-green-400">
              Message sent successfully! I&apos;ll get back to you soon.
            </div>
          )}

          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? "Sending..." : "Send Message"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
