'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CopyIcon, CheckIcon } from 'lucide-react';
import { cn } from '@/utils/cn';

interface CodeBlockProps {
  children: string;
  className?: string;
  language?: string;
  title?: string;
  showLineNumbers?: boolean;
}

export function CodeBlock({
  children,
  className,
  language,
  title,
  showLineNumbers = false,
}: CodeBlockProps) {
  const [copied, setCopied] = useState(false);

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(children);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy code:', err);
    }
  };

  const lines = children.split('\n');

  return (
    <div className="my-6 overflow-hidden rounded-lg border bg-muted/20">
      {/* Header */}
      {(title || language) && (
        <div className="flex items-center justify-between px-4 py-2 bg-muted/40 border-b">
          <div className="flex items-center gap-2">
            {title && (
              <span className="text-sm font-medium text-muted-foreground">{title}</span>
            )}
            {language && (
              <Badge variant="secondary" className="text-xs">
                {language}
              </Badge>
            )}
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={copyToClipboard}
            className="h-8 w-8 p-0"
          >
            {copied ? (
              <CheckIcon className="h-4 w-4 text-green-600" />
            ) : (
              <CopyIcon className="h-4 w-4" />
            )}
          </Button>
        </div>
      )}

      {/* Code content */}
      <pre className={cn('overflow-x-auto p-4 text-sm', className)}>
        <code className={cn(language && `language-${language}`)}>
          {showLineNumbers ? (
            <div className="table">
              {lines.map((line, index) => (
                <div key={index} className="table-row">
                  <span className="table-cell pr-4 text-right text-muted-foreground select-none w-8">
                    {index + 1}
                  </span>
                  <span className="table-cell">{line}</span>
                </div>
              ))}
            </div>
          ) : (
            children
          )}
        </code>
      </pre>
    </div>
  );
}

// MDX-compatible wrapper
interface CodeProps {
  children: string;
  className?: string;
}

export function Code({ children, className }: CodeProps) {
  const match = /language-(\w+)/.exec(className || '');
  const language = match ? match[1] : '';

  return (
    <CodeBlock language={language}>
      {children}
    </CodeBlock>
  );
}
