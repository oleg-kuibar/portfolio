import { useState, useRef } from "react";
import { useInView } from "framer-motion";
import { useTheme } from "next-themes";
import type { ContactFormData, ContactFormState } from "../types/contact";

const initialFormData: ContactFormData = {
  name: "",
  email: "",
  subject: "",
  message: "",
};

export function useContactForm() {
  const [formState, setFormState] = useState<ContactFormState>({
    data: initialFormData,
    isSubmitting: false,
    submitSuccess: false,
  });
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.3 });
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    setFormState((prev) => ({
      ...prev,
      data: {
        ...prev.data,
        [e.target.name]: e.target.value,
      },
    }));
  };

  const validateForm = () => {
    const { name, email, subject, message } = formState.data;

    if (!name || !email || !subject || !message) {
      alert("Please fill in all fields");
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      alert("Please enter a valid email address");
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setFormState((prev) => ({ ...prev, isSubmitting: true }));

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formState.data),
      });

      if (!response.ok) {
        throw new Error("Failed to send message");
      }

      setFormState({
        data: initialFormData,
        isSubmitting: false,
        submitSuccess: true,
      });

      // Reset success message after 5 seconds
      setTimeout(() => {
        setFormState((prev) => ({ ...prev, submitSuccess: false }));
      }, 5000);
    } catch {
      setFormState((prev) => ({ ...prev, isSubmitting: false }));
      alert("Failed to send message. Please try again later.");
    }
  };

  return {
    ref,
    isInView,
    isDark,
    formState,
    handleChange,
    handleSubmit,
  };
}
