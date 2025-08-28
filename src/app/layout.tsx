import type React from "react";
import type {
  Metadata,
  Viewport,
} from "next/dist/lib/metadata/types/metadata-interface";
import { Inter, Poppins } from "next/font/google";
import { ThemeProvider } from "next-themes";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { Analytics } from "@vercel/analytics/react"

import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const poppins = Poppins({
  weight: ["400", "500", "600", "700"],
  subsets: ["latin"],
  variable: "--font-poppins",
});

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0f172a" },
  ],
};

export const metadata: Metadata = {
  title: "Oleg Kuibar | Staff Frontend Engineer",
  description:
    "Portfolio of Oleg Kuibar, a Staff Frontend Engineer specializing in React, TypeScript, and modern frontend architecture.",
  keywords: [
    "frontend engineer",
    "react",
    "typescript",
    "next.js",
    "staff engineer",
  ],
  authors: [{ name: "Oleg Kuibar" }],
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://olegkuibar.dev",
    title: "Oleg Kuibar | Staff Frontend Engineer",
    description:
      "Portfolio of Oleg Kuibar, a Staff Frontend Engineer specializing in React, TypeScript, and modern frontend architecture.",
    siteName: "Oleg Kuibar Portfolio",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${inter.variable} ${poppins.variable} font-sans dark-mode-transition`}
      >
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          {children}
        </ThemeProvider>
        <SpeedInsights />
        <Analytics />
      </body>
    </html>
  );
}
