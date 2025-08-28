'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ExternalLinkIcon, PlayIcon, CodeIcon } from 'lucide-react';

interface StackBlitzProps {
  id: string;
  title?: string;
  description?: string;
  height?: number;
  view?: 'preview' | 'editor' | 'both';
  hideExplorer?: boolean;
  hideNavigation?: boolean;
  hideDevtools?: boolean;
  devtoolsHeight?: number;
}

export function StackBlitzEmbed({
  id,
  title = 'StackBlitz Demo',
  description,
  height = 400,
  view = 'both',
  hideExplorer = false,
  hideNavigation = false,
  hideDevtools = true,
  devtoolsHeight = 0,
}: StackBlitzProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [showCode, setShowCode] = useState(view === 'editor');

  useEffect(() => {
    // Load StackBlitz embed script if not already loaded
    if (!document.querySelector('script[src*="stackblitz"]')) {
      const script = document.createElement('script');
      script.src = 'https://unpkg.com/@stackblitz/sdk@1/bundles/sdk.js';
      script.async = true;
      document.head.appendChild(script);
    }
  }, []);

  const embedUrl = `https://stackblitz.com/edit/${id}?embed=1&view=${view}&hideExplorer=${hideExplorer}&hideNavigation=${hideNavigation}&hideDevtools=${hideDevtools}&devtoolsHeight=${devtoolsHeight}`;

  return (
    <Card className="my-6 overflow-hidden">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs">
              <PlayIcon className="h-3 w-3 mr-1" />
              Interactive Demo
            </Badge>
            <CardTitle className="text-lg">{title}</CardTitle>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowCode(!showCode)}
              className="text-xs"
            >
              <CodeIcon className="h-3 w-3 mr-1" />
              {showCode ? 'Preview' : 'Code'}
            </Button>
            <Button variant="ghost" size="sm" asChild>
              <a
                href={`https://stackblitz.com/edit/${id}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs"
              >
                <ExternalLinkIcon className="h-3 w-3 mr-1" />
                Open in StackBlitz
              </a>
            </Button>
          </div>
        </div>
        {description && (
          <p className="text-sm text-muted-foreground">{description}</p>
        )}
      </CardHeader>

      <CardContent className="p-0">
        <div
          className="w-full bg-muted/20"
          style={{ height: `${height}px` }}
        >
          <iframe
            src={embedUrl}
            width="100%"
            height="100%"
            frameBorder="0"
            allow="accelerometer; ambient-light-sensor; camera; encrypted-media; geolocation; gyroscope; hid; microphone; midi; payment; usb; vr; xr-spatial-tracking"
            sandbox="allow-forms allow-modals allow-popups allow-presentation allow-same-origin allow-scripts"
            onLoad={() => setIsLoaded(true)}
            className="w-full h-full"
          />
        </div>

        {!isLoaded && (
          <div className="flex items-center justify-center w-full h-full bg-muted/20 absolute inset-0">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
              <p className="text-sm text-muted-foreground">Loading StackBlitz...</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// Helper component for inline usage in MDX
interface StackBlitzMDXProps {
  id: string;
  title?: string;
  height?: number;
}

export function StackBlitz({ id, title, height = 400 }: StackBlitzMDXProps) {
  return (
    <StackBlitzEmbed
      id={id}
      title={title}
      height={height}
      view="both"
      hideDevtools={true}
    />
  );
}
