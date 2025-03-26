import { Project, ProjectCategory } from "../types/project";

export const PROJECTS_DATA: Project[] = [
  {
    id: "tasksync",
    title: "TaskSync",
    description:
      "A real-time collaboration tool for teams to manage tasks, track progress, and communicate efficiently.",
    image: "/placeholder.svg?height=400&width=600",
    tags: ["React", "TypeScript", "Socket.io", "Redux", "Node.js"],
    category: ProjectCategory.FullStack,
    demoUrl: "#",
    githubUrl:
      "https://github.com/oleg-kuibar/react-jsonschema-chakra-ui-custom-forms",
    featured: true,
    details: {
      challenge:
        "Building a real-time collaboration tool that maintains data consistency across multiple users while providing a responsive UI.",
      solution:
        "Implemented a WebSocket-based architecture with optimistic UI updates and conflict resolution strategies. Used Redux for state management and Socket.io for real-time communication between clients and server.",
      technologies: [
        "React",
        "TypeScript",
        "Socket.io",
        "Redux",
        "Node.js",
        "MongoDB",
        "Express",
      ],
      architecture:
        "Microservices architecture with separate services for authentication, task management, and real-time updates.",
      results:
        "Reduced team coordination overhead by 35% and improved project delivery times by 20% in internal testing.",
    },
  },
  {
    id: "graphql-inspector",
    title: "GraphQL Network Inspector",
    description:
      "A Chrome extension for viewing and debugging GraphQL requests with my contribution of a 'copy cURL' feature.",
    image: "/placeholder.svg?height=400&width=600",
    tags: [
      "GraphQL",
      "React",
      "Chrome Extension",
      "Developer Tools",
      "Open Source",
    ],
    category: ProjectCategory.DeveloperTools,
    demoUrl: "#",
    githubUrl: "https://github.com/warrenday/graphql-network-inspector",
    featured: true,
    details: {
      challenge:
        "While working with GraphQL, I found this extension extremely useful but noticed it lacked a 'copy cURL' feature that would streamline debugging, ticket creation, and pair programming.",
      solution:
        "I contributed to the open-source project by implementing the 'copy cURL' feature, allowing developers to easily share GraphQL requests as cURL commands for debugging and collaboration.",
      technologies: [
        "React",
        "GraphQL",
        "Chrome Extension API",
        "TypeScript",
        "JavaScript",
      ],
      results:
        "My contribution was merged into the main project, benefiting over 5,000 active users with an average rating of 4.8/5 in the Chrome Web Store.",
    },
  },
  {
    id: "single-spa",
    title: "Single-SPA Microfrontends",
    description:
      "A proof of concept for micro-frontend architecture using Single-SPA with React, Angular, and shared styling.",
    image:
      "https://sjc.microlink.io/esUyj1DsnAUhCGGbNdD59W4_QiLgcwvbdOeHYkB85lnBI6WQ1smzCInxsuYn-_bsB1SiK-WqC7PyP1uGJsPX6Q.jpeg",
    tags: ["Single-SPA", "React", "Angular", "Micro-frontends", "Architecture"],
    category: ProjectCategory.Architecture,
    demoUrl: "/case-studies/single-spa",
    githubUrl: "https://github.com/Single-Spa-Microfrontends",
    featured: true,
    details: {
      challenge:
        "Enabling multiple teams to work independently on different parts of an ad tech platform without conflicts.",
      solution:
        "Implemented a micro-frontend architecture using Single-SPA to integrate multiple frameworks and enable independent deployment.",
      technologies: [
        "Single-SPA",
        "React",
        "Angular",
        "TailwindCSS",
        "Webpack",
      ],
      architecture:
        "Micro-frontend architecture with a root config orchestrating multiple framework-specific applications.",
      results:
        "Successfully implemented in production for ad tech applications, resulting in increased development velocity and team autonomy.",
    },
  },
  {
    id: "portfolio",
    title: "Portfolio Website",
    description:
      "A high-performance, accessible portfolio website built with Next.js and TypeScript.",
    image: "/placeholder.svg?height=400&width=600",
    tags: ["Next.js", "TypeScript", "Tailwind CSS", "Framer Motion"],
    category: ProjectCategory.Frontend,
    demoUrl: "#",
    githubUrl: "#",
    featured: false,
    details: {
      challenge:
        "Creating a portfolio that showcases technical skills while maintaining excellent performance and accessibility.",
      solution:
        "Built a Next.js application with server components, optimized assets, and accessibility-first design.",
      technologies: ["Next.js", "TypeScript", "Tailwind CSS", "Framer Motion"],
      results:
        "Achieved 97+ Lighthouse scores across performance, accessibility, and SEO metrics.",
    },
  },
  {
    id: "modern-db-ide",
    title: "Modern Database IDE",
    description:
      "A modern, open-source database IDE inspired by DBeaver, built with an emphasis on user experience and contemporary design principles.",
    image: "/placeholder.svg?height=400&width=600",
    tags: ["Electron", "React", "TypeScript", "SQL", "Database Tools"],
    category: ProjectCategory.DeveloperTools,
    demoUrl: "#",
    githubUrl: "#",
    featured: true,
    poc: true,
    details: {
      challenge:
        "Traditional database IDEs like DBeaver, while powerful, often have dated UIs and lack modern UX patterns that developers have come to expect.",
      solution:
        "Developed an Electron-based database IDE that maintains DBeaver's powerful features while introducing a modern, intuitive interface with dark mode support and customizable workspaces.",
      technologies: [
        "Electron",
        "React",
        "TypeScript",
        "SQL",
        "Monaco Editor",
        "Node.js",
      ],
      results:
        "Created an open-source alternative that combines robust database management capabilities with contemporary design principles and received positive community feedback.",
    },
  },
  {
    id: "voip-solution",
    title: "VoIP Communication Platform",
    description:
      "A modern VoIP solution replacing traditional landline calls with web, iOS and Android applications.",
    image: "/placeholder.svg?height=400&width=600",
    tags: ["WebRTC", "React Native", "Node.js", "SIP", "VoIP"],
    category: ProjectCategory.FullStack,
    demoUrl: "#",
    githubUrl: "#",
    featured: true,
    poc: true,
    details: {
      challenge:
        "Creating a reliable, cross-platform VoIP solution to replace traditional landline calls while maintaining call quality and reliability.",
      solution:
        "Developed a WebRTC-based system with native mobile apps and web interface, implementing SIP protocol for PSTN integration.",
      technologies: [
        "WebRTC",
        "React Native",
        "Node.js",
        "PostgreSQL",
        "Redis",
        "SIP.js",
        "Docker",
      ],
      architecture:
        "Microservices architecture with dedicated services for call handling, user management, and PSTN integration.",
      results:
        "Successfully deployed solution handling thousands of daily calls across web and mobile platforms with 99.9% uptime and high audio quality.",
    },
  },
];
