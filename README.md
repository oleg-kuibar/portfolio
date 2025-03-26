# Portfolio Website

This is a portfolio website for Oleg Kuibar, a Staff Frontend Engineer. The website is built with Next.js, TypeScript, and Tailwind CSS.

## Environment Setup

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env.local` file in the root directory with the following variables:
   ```env
   # Get your API key from https://resend.com/api-keys
   RESEND_API_KEY=re_your_actual_api_key_here
   ```
4. For production deployment on Vercel, add the environment variables in your Vercel project settings.

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
|   +-- contact       # Contact section feature with Resend integration
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

## Contact Form

The contact form uses Resend for email delivery. To set it up:

1. Sign up for a Resend account at https://resend.com
2. Get your API key from https://resend.com/api-keys
3. Add the API key to your environment variables
4. Verify your domain in Resend to send emails from your domain

The contact form will send emails to contact@olegkuibar.dev.

