import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeftIcon } from "lucide-react";
import { FaGithub } from "react-icons/fa";

export function SingleSpaPage() {
  return (
    <main className="min-h-screen bg-background pt-20">
      {/* Header */}
      <div className="bg-gradient-to-b from-primary/10 to-background py-16">
        <div className="container mx-auto px-4">
          <Link
            href="/projects"
            className="inline-flex items-center text-sm text-foreground/70 hover:text-primary mb-8 transition-colors"
          >
            <ArrowLeftIcon className="mr-2 h-4 w-4" />
            Back to Projects
          </Link>

          <div className="flex flex-col md:flex-row gap-8 items-center">
            <div className="flex-1">
              <h1 className="text-3xl md:text-4xl font-bold mb-4">
                Single-Spa Microfrontends
              </h1>
              <p className="text-xl text-foreground/70 mb-6">
                My journey from discovering micro-frontend architecture to
                implementing it at scale
              </p>

              <div className="flex flex-wrap gap-2 mb-6">
                <Badge variant="secondary">Architecture</Badge>
                <Badge variant="secondary">React</Badge>
                <Badge variant="secondary">Angular</Badge>
                <Badge variant="secondary">Single-SPA</Badge>
                <Badge variant="secondary">Micro-frontends</Badge>
              </div>

              <div className="flex gap-4">
                <Button asChild>
                  <a
                    href="https://github.com/Single-Spa-Microfrontends"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center"
                  >
                    <FaGithub className="mr-2 h-4 w-4" />
                    View Repository
                  </a>
                </Button>
              </div>
            </div>

            <div className="flex-1">
              <div className="relative rounded-lg overflow-hidden shadow-lg">
                <Image
                  src="https://sjc.microlink.io/esUyj1DsnAUhCGGbNdD59W4_QiLgcwvbdOeHYkB85lnBI6WQ1smzCInxsuYn-_bsB1SiK-WqC7PyP1uGJsPX6Q.jpeg"
                  alt="Single-Spa-Microfrontends GitHub Repository"
                  width={600}
                  height={400}
                  className="w-full object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-3xl mx-auto">
          <section className="mb-16">
            <h2 className="text-2xl font-bold mb-6">The Discovery Phase</h2>
            <div className="prose dark:prose-invert max-w-none">
              <p>
                My journey with micro-frontends began when I was tasked with
                solving a critical challenge: how to enable multiple teams to
                work independently on different parts of our ad tech platform
                without stepping on each other&apos;s toes.
              </p>

              <p>
                After researching various architectural patterns, I discovered
                the micro-frontend approach, which promised to bring the
                benefits of microservices to the frontend world. Among the
                different implementation options, Single-SPA stood out for its
                maturity and flexibility.
              </p>

              <p>
                What particularly intrigued me about Single-SPA was its ability
                to:
              </p>

              <ul>
                <li>
                  Integrate multiple frameworks (React, Angular, Vue) in a
                  single application
                </li>
                <li>Enable independent deployment of frontend modules</li>
                <li>
                  Support gradual migration from legacy to modern frameworks
                </li>
                <li>
                  Provide a consistent user experience across different parts of
                  the application
                </li>
              </ul>
            </div>
          </section>

          <section className="mb-16">
            <h2 className="text-2xl font-bold mb-6">
              Building the Proof of Concept
            </h2>
            <div className="prose dark:prose-invert max-w-none">
              <p>
                To validate this approach, I created a comprehensive proof of
                concept that demonstrated the integration of multiple frameworks
                within a single application. This became the
                <a
                  href="https://github.com/Single-Spa-Microfrontends"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {" "}
                  Single-Spa-Microfrontends
                </a>{" "}
                repository.
              </p>

              <p>The POC included several key components:</p>

              <ul>
                <li>
                  <strong>Root Config:</strong> The central hub that initializes
                  and manages micro-apps based on routes
                </li>
                <li>
                  <strong>React Navbar:</strong> A shared navigation component
                  built with React
                </li>
                <li>
                  <strong>Angular Legacy App:</strong> An older Angular v11
                  application, demonstrating migration paths
                </li>
                <li>
                  <strong>Angular New App:</strong> A modern Angular v16
                  application, showing framework coexistence
                </li>
                <li>
                  <strong>Shared Styleguide:</strong> Using TailwindCSS to
                  maintain consistent look and feel
                </li>
              </ul>

              <p>
                The most challenging aspect was orchestrating the loading and
                lifecycle management of each micro-frontend while ensuring they
                could communicate effectively without tight coupling.
              </p>

              <p>
                I implemented a system where each micro-frontend ran on its own
                port during development:
              </p>

              <ul>
                <li>Root Config: 9000</li>
                <li>React Navbar: 9001</li>
                <li>Angular Legacy: 9002</li>
                <li>Angular New App: 9003</li>
                <li>Styleguide: 9004</li>
              </ul>
            </div>

            <div className="mt-8">
              <Card>
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold mb-4">
                    Technical Architecture
                  </h3>
                  <Image
                    src="/placeholder.svg?height=300&width=600"
                    alt="Single-SPA Architecture Diagram"
                    width={600}
                    height={300}
                    className="w-full rounded-md mb-4"
                  />
                  <p className="text-sm text-foreground/70">
                    The architecture diagram shows how the root config
                    orchestrates the loading and mounting of micro-frontends
                    based on the current route, with shared services enabling
                    cross-application communication.
                  </p>
                </CardContent>
              </Card>
            </div>
          </section>

          <section className="mb-16">
            <h2 className="text-2xl font-bold mb-6">
              Implementation in Production
            </h2>
            <div className="prose dark:prose-invert max-w-none">
              <p>
                Following the successful POC, I led the implementation of this
                architecture in our ad tech platform. This involved:
              </p>

              <ul>
                <li>
                  Breaking down our monolithic frontend into domain-specific
                  micro-frontends
                </li>
                <li>
                  Establishing team boundaries and ownership for each
                  micro-frontend
                </li>
                <li>
                  Creating a shared component library to maintain UI consistency
                </li>
                <li>Setting up CI/CD pipelines for independent deployment</li>
                <li>
                  Implementing cross-application state management and
                  communication
                </li>
              </ul>

              <p>
                The ad tech applications presented unique challenges due to
                their complex data visualization requirements and real-time data
                processing needs. We structured our micro-frontends around key
                business domains:
              </p>

              <ul>
                <li>Campaign Management</li>
                <li>Analytics Dashboard</li>
                <li>Audience Targeting</li>
                <li>Creative Studio</li>
                <li>Reporting Engine</li>
              </ul>

              <p>
                Each domain was owned by a dedicated team, who could develop,
                test, and deploy their micro-frontend independently,
                significantly accelerating our development velocity.
              </p>
            </div>
          </section>

          <section className="mb-16">
            <h2 className="text-2xl font-bold mb-6">
              Results and Lessons Learned
            </h2>
            <div className="prose dark:prose-invert max-w-none">
              <p>
                The implementation of the micro-frontend architecture yielded
                significant benefits:
              </p>

              <ul>
                <li>
                  <strong>Increased Development Velocity:</strong> Teams could
                  work and deploy independently
                </li>
                <li>
                  <strong>Improved Scalability:</strong> Both in terms of
                  codebase and team organization
                </li>
                <li>
                  <strong>Enhanced Resilience:</strong> Issues in one
                  micro-frontend didn&apos;t affect others
                </li>
                <li>
                  <strong>Flexible Technology Choices:</strong> Teams could
                  select the best tools for their specific needs
                </li>
                <li>
                  <strong>Gradual Migration Path:</strong> Legacy code could be
                  replaced incrementally
                </li>
              </ul>

              <p>However, the journey wasn&apos;t without challenges:</p>

              <ul>
                <li>
                  <strong>Initial Setup Complexity:</strong> The learning curve
                  and initial configuration were steep
                </li>
                <li>
                  <strong>Bundle Size Management:</strong> Avoiding duplicate
                  dependencies required careful planning
                </li>
                <li>
                  <strong>Consistent User Experience:</strong> Maintaining UI
                  consistency across teams required discipline
                </li>
                <li>
                  <strong>Testing Strategy:</strong> End-to-end testing became
                  more complex
                </li>
                <li>
                  <strong>Performance Optimization:</strong> Loading multiple
                  applications required careful optimization
                </li>
              </ul>

              <p>
                Overall, the micro-frontend approach proved to be a game-changer
                for our organization, enabling us to scale our development
                efforts while maintaining a cohesive product experience.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-6">Key Takeaways</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold mb-2">
                    When to Use Micro-frontends
                  </h3>
                  <p className="text-foreground/70">
                    Micro-frontends shine in large applications with multiple
                    teams working in parallel. They&apos;re particularly
                    valuable when you need to integrate different frameworks or
                    gradually modernize legacy applications.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold mb-2">When to Avoid</h3>
                  <p className="text-foreground/70">
                    For smaller applications or teams, the overhead of
                    micro-frontends may outweigh the benefits. Consider your
                    team size, application complexity, and deployment needs
                    before adopting this architecture.
                  </p>
                </CardContent>
              </Card>
            </div>
          </section>

          <div className="mt-16 text-center">
            <p className="text-foreground/70 mb-6">
              Interested in learning more about micro-frontend architecture or
              discussing your specific use case?
            </p>
            <Button asChild>
              <Link href="/contact">Get in Touch</Link>
            </Button>
          </div>
        </div>
      </div>
    </main>
  );
}
