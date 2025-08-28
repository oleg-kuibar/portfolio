"use client";

import { motion } from "framer-motion";
import { CONTACT_ANIMATIONS } from "../constants/contact-info";
import { useContactForm } from "../hooks/use-contact-form";
import { ContactInfoCard } from "./contact-info-card";
import { ContactForm } from "./contact-form";

export function Contact() {
  const { ref, isInView, isDark, formState, handleChange, handleSubmit } =
    useContactForm();

  return (
    <section id="contact" className="py-20 bg-muted/10">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Get in Touch</h2>
          <div className="w-20 h-1 mx-auto mb-6 bg-primary/80"></div>
          <p className="text-lg text-foreground/70 max-w-3xl mx-auto">
            Have a question or want to work together? I&apos;d love to hear from
            you.
          </p>
        </div>

        <motion.div
          ref={ref}
          variants={CONTACT_ANIMATIONS.container}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-6xl mx-auto"
        >
          <motion.div
            variants={CONTACT_ANIMATIONS.item}
            className="lg:col-span-1"
          >
            <ContactInfoCard isDark={isDark} />
          </motion.div>

          <motion.div
            variants={CONTACT_ANIMATIONS.item}
            className="lg:col-span-2"
          >
            <ContactForm
              isDark={isDark}
              formState={formState}
              handleChange={handleChange}
              handleSubmit={handleSubmit}
            />
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
