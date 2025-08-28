"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/utils/cn";
import { MailIcon, MapPinIcon } from "lucide-react";
import { FaLinkedin } from "react-icons/fa";
import { SiGithub } from "react-icons/si";
import { CONTACT_INFO } from "../constants/contact-info";

interface ContactInfoCardProps {
  isDark: boolean;
}

const getIcon = (iconName: string) => {
  switch (iconName) {
    case "mail":
      return <MailIcon className="h-5 w-5" />;
    case "linkedin":
      return <FaLinkedin className="h-5 w-5" />;
    case "github":
      return <SiGithub className="h-5 w-5" />;
    case "map":
      return <MapPinIcon className="h-5 w-5" />;
    default:
      return null;
  }
};

export function ContactInfoCard({ isDark }: ContactInfoCardProps) {
  return (
    <Card
      className={cn(
        "h-full border-none shadow-md",
        isDark && "bg-card/80 backdrop-blur-sm",
      )}
    >
      <CardHeader>
        <CardTitle>Contact Information</CardTitle>
        <CardDescription>
          Feel free to reach out through any of these channels
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {CONTACT_INFO.map((item) => (
          <div key={item.title} className="flex items-start">
            <div
              className={cn(
                "mr-3 mt-0.5",
                isDark ? "text-primary/80" : "text-primary",
              )}
            >
              {getIcon(item.icon)}
            </div>
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
  );
}
