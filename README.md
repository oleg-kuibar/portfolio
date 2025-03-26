# Portfolio Website

This is a portfolio website for Oleg Kuibar, a Staff Frontend Engineer. The website is built with Next.js, TypeScript, and Tailwind CSS.

## Project Structure

The project follows a feature-based organization pattern:

```sh
src
|
+-- app               # Next.js app directory with routes and layouts
|
+-- assets            # Static assets like images and fonts
|
+-- components        # Shared components used across features
|   |
|   +-- layouts       # Layout components
|   +-- ui            # UI components (shadcn/ui)
|
+-- config            # Global configurations
|
+-- features          # Feature-based modules
|   |
|   +-- about         # About section feature
|   +-- case-studies  # Case studies feature
|   +-- contact       # Contact section feature
|   +-- footer        # Footer feature
|   +-- hero          # Hero section feature
|   +-- home          # Home page feature
|   +-- navigation    # Navigation feature
|   +-- projects      # Projects section feature
|   +-- skills        # Skills section feature
|   +-- tech-radar    # Tech radar feature
|   +-- theme         # Theme feature
|   +-- ui            # UI-specific feature components
|
+-- hooks             # Shared hooks
|
+-- lib               # Reusable libraries and providers
|
+-- types             # Shared TypeScript types
|
+-- utils             # Shared utility functions

