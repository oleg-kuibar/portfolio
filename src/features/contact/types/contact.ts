export interface ContactFormData {
  name: string;
  email: string;
  subject: string;
  message: string;
}

export interface ContactInfo {
  icon: string;
  title: string;
  value: string;
  link: string | null;
}

export interface ContactFormState {
  data: ContactFormData;
  isSubmitting: boolean;
  submitSuccess: boolean;
}

export interface ContactAnimationVariants {
  hidden: {
    opacity: number;
    y?: number;
  };
  visible: {
    opacity: number;
    y?: number;
    transition?: {
      duration?: number;
      staggerChildren?: number;
    };
  };
}
