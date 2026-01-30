# Portfolio Website

Personal portfolio website for Oleg Kuibar, Software Engineer. Built with Astro, React, and Tailwind CSS v4.

## Tech Stack

- **Framework:** [Astro](https://astro.build/) 5.x with static output
- **UI Components:** [HeroUI](https://heroui.com/) v3 + React islands
- **Styling:** [Tailwind CSS](https://tailwindcss.com/) v4 with OKLCH colors
- **Content:** MDX with Astro Content Collections
- **Diagrams:** Mermaid for technical diagrams
- **Package Manager:** [pnpm](https://pnpm.io/)
- **Deployment:** Vercel

## Getting Started

```bash
# Install dependencies
pnpm install

# Start development server
pnpm dev

# Build for production
pnpm build

# Preview production build
pnpm preview
```

## Project Structure

```
src/
├── components/
│   ├── astro/           # Static Astro components
│   │   ├── BaseHead.astro
│   │   ├── Header.astro
│   │   ├── Footer.astro
│   │   ├── BlogCard.astro
│   │   ├── CategoryBadge.astro
│   │   └── TagList.astro
│   └── react/           # React islands (client-side)
│       ├── Navigation.tsx
│       ├── ThemeToggle.tsx
│       ├── SearchDialog.tsx
│       ├── CategoryTabs.tsx
│       └── Mermaid.tsx
├── content/
│   ├── config.ts        # Content collection schema
│   └── blog/            # MDX blog posts
├── layouts/
│   ├── BaseLayout.astro
│   └── BlogLayout.astro
├── lib/
│   ├── blog.ts          # Blog utilities
│   └── utils.ts         # Helpers (cn, formatDate)
├── pages/
│   ├── index.astro      # Homepage
│   ├── blog/
│   │   ├── index.astro
│   │   ├── [slug].astro
│   │   ├── category/[category].astro
│   │   └── tag/[tag].astro
│   └── rss.xml.ts
└── styles/
    └── global.css       # Tailwind + design tokens
```

## Design System

"Retro with a twist" aesthetic using OKLCH color space:

| Token | Light | Dark |
|-------|-------|------|
| Primary | Teal `oklch(0.55 0.14 195)` | Bright teal `oklch(0.70 0.14 195)` |
| Secondary | Terracotta `oklch(0.60 0.15 45)` | Light terracotta `oklch(0.65 0.14 45)` |
| Accent | Mustard `oklch(0.75 0.15 85)` | Mustard `oklch(0.75 0.15 85)` |

**Typography:**
- Headings: Space Grotesk
- Body: Inter
- Code: JetBrains Mono

## Blog Features

- MDX support with syntax highlighting
- Categories and tags
- Reading time calculation
- Featured posts
- Full-text search
- RSS feed at `/rss.xml`
- Mermaid diagrams

## Scripts

| Command | Description |
|---------|-------------|
| `pnpm dev` | Start dev server at localhost:4321 |
| `pnpm build` | Build static site to `dist/` |
| `pnpm preview` | Preview production build |

## License

MIT
