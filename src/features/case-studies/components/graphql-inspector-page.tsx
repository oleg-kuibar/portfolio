import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowLeftIcon, GithubIcon, ExternalLinkIcon } from "lucide-react"

export function GraphQLInspectorPage() {
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
              <h1 className="text-3xl md:text-4xl font-bold mb-4">GraphQL Network Inspector</h1>
              <p className="text-xl text-foreground/70 mb-6">
                My open source contribution to a popular GraphQL debugging tool
              </p>

              <div className="flex flex-wrap gap-2 mb-6">
                <Badge variant="secondary">GraphQL</Badge>
                <Badge variant="secondary">Chrome Extension</Badge>
                <Badge variant="secondary">Developer Tools</Badge>
                <Badge variant="secondary">Open Source</Badge>
                <Badge variant="secondary">React</Badge>
              </div>

              <div className="flex gap-4">
                <Button asChild>
                  <a
                    href="https://github.com/warrenday/graphql-network-inspector"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center"
                  >
                    <GithubIcon className="mr-2 h-4 w-4" />
                    View Repository
                  </a>
                </Button>
                <Button variant="outline" asChild>
                  <a
                    href="https://chrome.google.com/webstore/detail/graphql-network-inspector/ndlbedplllcgconngcnfmkadhokfaaln"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center"
                  >
                    <ExternalLinkIcon className="mr-2 h-4 w-4" />
                    Chrome Web Store
                  </a>
                </Button>
              </div>
            </div>

            <div className="flex-1">
              <div className="relative rounded-lg overflow-hidden shadow-lg">
                <Image
                  src="/placeholder.svg?height=400&width=600"
                  alt="GraphQL Network Inspector Chrome Extension"
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
            <h2 className="text-2xl font-bold mb-6">The Challenge</h2>
            <div className="prose dark:prose-invert max-w-none">
              <p>
                As a developer working extensively with GraphQL APIs, I relied heavily on the GraphQL Network Inspector
                Chrome extension for debugging and understanding API interactions. This popular tool provides a
                specialized interface for inspecting GraphQL queries, variables, and responses.
              </p>

              <p>
                However, I noticed a significant gap in its functionality: there was no way to easily share GraphQL
                requests with team members or include them in bug reports. During debugging sessions, ticket creation,
                or pair programming, I frequently needed to share the exact request for others to reproduce issues or
                understand the API behavior.
              </p>

              <p>
                The standard approach would be to use cURL commands, which are universally understood and can be
                executed in any terminal. But manually converting GraphQL requests to cURL format was tedious and
                error-prone, especially with complex queries and authentication headers.
              </p>
            </div>
          </section>

          <section className="mb-16">
            <h2 className="text-2xl font-bold mb-6">My Contribution</h2>
            <div className="prose dark:prose-invert max-w-none">
              <p>
                I decided to contribute to this open-source project by implementing a &quot;Copy as cURL&quot; feature. This would
                allow developers to:
              </p>

              <ul>
                <li>Generate a complete cURL command with a single click</li>
                <li>Include all headers, variables, and authentication tokens</li>
                <li>Easily share the exact request with team members</li>
                <li>Paste the command directly into terminal for testing</li>
                <li>Include in bug reports or documentation</li>
              </ul>

              <p>The implementation required careful handling of:</p>

              <ul>
                <li>Proper escaping of special characters in the query and variables</li>
                <li>Formatting the command for readability</li>
                <li>Preserving all HTTP headers, including authentication</li>
                <li>Ensuring the command works across different operating systems</li>
              </ul>

              <p>
                I submitted a pull request with the new feature, complete with tests and documentation. After some
                feedback and refinements, my contribution was merged into the main project.
              </p>
            </div>

            <div className="mt-8">
              <Card>
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold mb-4">Implementation Highlights</h3>
                  <div className="bg-muted p-4 rounded-md overflow-x-auto text-sm font-mono">
                    <pre>{`// Function to generate cURL command from GraphQL request
function generateCurlCommand(request) {
  const { url, method, headers, body } = request;
  
  // Start with the basic curl command
  let curl = \`curl -X \${method} \\
\`;
  
  // Add headers
  Object.entries(headers).forEach(([key, value]) => {
    curl += \`  -H '\${key}: \${value}' \\
\`;
  });
  
  // Add request body if present
  if (body) {
    const escapedBody = JSON.stringify(body).replace(/'/g, "'\\''");
    curl += \`  -d '\${escapedBody}' \\
\`;
  }
  
  // Add URL
  curl += \`  '\${url}'\`;
  
  return curl;
}`}</pre>
                  </div>
                  <p className="text-sm text-foreground/70 mt-4">
                    The core function that transforms a GraphQL request into a properly formatted and escaped cURL
                    command.
                  </p>
                </CardContent>
              </Card>
            </div>
          </section>

          <section className="mb-16">
            <h2 className="text-2xl font-bold mb-6">Impact and Results</h2>
            <div className="prose dark:prose-invert max-w-none">
              <p>
                The &quot;Copy as cURL&quot; feature has been well-received by the community and is now a standard part of the
                GraphQL Network Inspector extension. It has:
              </p>

              <ul>
                <li>
                  <strong>Streamlined debugging workflows</strong> for developers working with GraphQL
                </li>
                <li>
                  <strong>Improved collaboration</strong> by making it easier to share exact API requests
                </li>
                <li>
                  <strong>Enhanced documentation</strong> by allowing precise API examples in tickets and docs
                </li>
                <li>
                  <strong>Saved time</strong> by eliminating the need to manually construct cURL commands
                </li>
              </ul>

              <p>This contribution demonstrates my ability to:</p>

              <ul>
                <li>Identify practical improvements to developer tools</li>
                <li>Contribute effectively to open-source projects</li>
                <li>Implement features that enhance developer productivity</li>
                <li>Work with browser extension technologies</li>
                <li>Understand the nuances of GraphQL and API debugging</li>
              </ul>

              <p>
                I&apos;m proud to have contributed to this project and to have helped improve the developer experience for GraphQL developers worldwide.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-6">Lessons Learned</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold mb-2">Technical Insights</h3>
                  <p className="text-foreground/70">
                    Working on this feature deepened my understanding of GraphQL&apos;s request structure and how browser
                    extensions interact with network traffic. I also gained experience with the nuances of command-line
                    formatting and escaping across different environments.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold mb-2">Open Source Contribution</h3>
                  <p className="text-foreground/70">
                    This experience reinforced the value of contributing to open source. By solving my own pain point, I
                    was able to help thousands of other developers facing the same challenge, while also improving my
                    own skills and visibility in the developer community.
                  </p>
                </CardContent>
              </Card>
            </div>
          </section>

          <div className="mt-16 text-center">
            <p className="text-foreground/70 mb-6">
              Interested in discussing GraphQL, developer tools, or open source contributions?
            </p>
            <Button asChild>
              <Link href="/contact">Get in Touch</Link>
            </Button>
          </div>
        </div>
      </div>
    </main>
  )
}

