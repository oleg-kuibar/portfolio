import type React from "react";
import { Navbar } from "@/features/navigation/components/navbar";
import { Footer } from "@/features/footer/components/footer";
import { ScrollToTop } from "@/features/ui/components/scroll-to-top";

export function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Navbar />
      {children}
      <Footer />
      <ScrollToTop />
    </>
  );
}
