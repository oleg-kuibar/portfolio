import { serialize } from 'next-mdx-remote/serialize';
import rehypeHighlight from 'rehype-highlight';
import rehypeSlug from 'rehype-slug';
import remarkGfm from 'remark-gfm';
import { MDXRemoteSerializeResult } from 'next-mdx-remote';
import { StackBlitz } from '@/components/mdx/stackblitz';
import { Callout } from '@/components/mdx/callout';
import { CodeBlock } from '@/components/mdx/code-block';

export interface MDXContent {
  compiledSource: string;
  scope?: Record<string, any>;
  frontmatter?: Record<string, any>;
}

/**
 * Serialize MDX content for client-side rendering with proper SSR support
 */
export async function serializeMDX(
  source: string,
  options: {
    scope?: Record<string, any>;
    parseFrontmatter?: boolean;
  } = {}
): Promise<MDXRemoteSerializeResult> {
  const { scope, parseFrontmatter = true } = options;

  return serialize(source, {
    scope,
    parseFrontmatter,
    mdxOptions: {
      development: process.env.NODE_ENV === 'development',
      remarkPlugins: [remarkGfm],
      rehypePlugins: [
        rehypeSlug,
        [rehypeHighlight, {
          ignoreMissing: true,
          aliases: {
            typescript: 'ts',
            javascript: 'js',
            json: 'json',
          }
        }],
      ],
    },
  });
}

/**
 * MDX Renderer component using next-mdx-remote for proper SSR
 */
export function MDXRenderer({ mdxSource }: { mdxSource: MDXRemoteSerializeResult }) {
  // We'll use MDXRemote from next-mdx-remote for proper rendering
  // This will be imported and used in the component that needs it
  return null; // Placeholder - actual rendering will be done with MDXRemote
}

/**
 * Custom components for MDX content
 */
export const MDXComponents = {
  // Custom blog components
  StackBlitz,
  Callout,
  CodeBlock,

  // Code block with syntax highlighting
  pre: ({ children, ...props }: any) => (
    <pre className="overflow-x-auto rounded-lg bg-muted p-4" {...props}>
      {children}
    </pre>
  ),

  code: ({ className, children, ...props }: any) => {
    const match = /language-(\w+)/.exec(className || '');
    return match ? (
      <code className={`${className} text-sm`} {...props}>
        {children}
      </code>
    ) : (
      <code className="bg-muted px-1 py-0.5 rounded text-sm font-mono" {...props}>
        {children}
      </code>
    );
  },

  // Blockquotes with custom styling
  blockquote: ({ children, ...props }: any) => (
    <blockquote
      className="border-l-4 border-primary pl-4 italic text-muted-foreground"
      {...props}
    >
      {children}
    </blockquote>
  ),

  // Tables with better styling
  table: ({ children, ...props }: any) => (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse border border-border" {...props}>
        {children}
      </table>
    </div>
  ),

  th: ({ children, ...props }: any) => (
    <th className="border border-border bg-muted px-4 py-2 text-left font-semibold" {...props}>
      {children}
    </th>
  ),

  td: ({ children, ...props }: any) => (
    <td className="border border-border px-4 py-2" {...props}>
      {children}
    </td>
  ),

  // Headings with anchor links
  h1: ({ children, ...props }: any) => (
    <h1 className="text-3xl font-bold mt-8 mb-4" {...props}>
      {children}
    </h1>
  ),

  h2: ({ children, ...props }: any) => (
    <h2 className="text-2xl font-semibold mt-6 mb-3" {...props}>
      {children}
    </h2>
  ),

  h3: ({ children, ...props }: any) => (
    <h3 className="text-xl font-medium mt-5 mb-2" {...props}>
      {children}
    </h3>
  ),

  h4: ({ children, ...props }: any) => (
    <h4 className="text-lg font-medium mt-4 mb-2" {...props}>
      {children}
    </h4>
  ),

  // Links with external link handling
  a: ({ href, children, ...props }: any) => {
    const isExternal = href?.startsWith('http');
    return (
      <a
        href={href}
        className="text-primary hover:underline"
        {...(isExternal && { target: '_blank', rel: 'noopener noreferrer' })}
        {...props}
      >
        {children}
        {isExternal && <span className="ml-1">↗</span>}
      </a>
    );
  },

  // Lists with better spacing
  ul: ({ children, ...props }: any) => (
    <ul className="list-disc list-inside mb-4 space-y-1" {...props}>
      {children}
    </ul>
  ),

  ol: ({ children, ...props }: any) => (
    <ol className="list-decimal list-inside mb-4 space-y-1" {...props}>
      {children}
    </ol>
  ),

  li: ({ children, ...props }: any) => (
    <li className="text-muted-foreground" {...props}>
      {children}
    </li>
  ),

  // Paragraphs
  p: ({ children, ...props }: any) => (
    <p className="mb-4 leading-relaxed" {...props}>
      {children}
    </p>
  ),

  // Horizontal rule
  hr: (props: any) => (
    <hr className="border-border my-8" {...props} />
  ),
};
