import { useEffect, useRef, useState } from 'react';
import mermaid from 'mermaid';

interface MermaidProps {
  chart: string;
  className?: string;
}

export function Mermaid({ chart, className = '' }: MermaidProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [svg, setSvg] = useState<string>('');

  useEffect(() => {
    const renderChart = async () => {
      // Check if we're in dark mode
      const isDark = document.documentElement.classList.contains('dark');

      mermaid.initialize({
        startOnLoad: false,
        theme: isDark ? 'dark' : 'neutral',
        themeVariables: isDark ? {
          primaryColor: '#3a5ba0',
          primaryTextColor: '#ece5d5',
          primaryBorderColor: '#453d33',
          lineColor: '#78705e',
          secondaryColor: '#b89530',
          tertiaryColor: '#2a2520',
          background: '#2a2520',
          mainBkg: '#332e28',
          nodeBorder: '#453d33',
          clusterBkg: '#332e28',
          clusterBorder: '#453d33',
          titleColor: '#ece5d5',
          edgeLabelBackground: '#332e28',
        } : {
          primaryColor: '#3a5ba0',
          primaryTextColor: '#2c2518',
          primaryBorderColor: '#d1c4a8',
          lineColor: '#78705e',
          secondaryColor: '#e0b400',
          tertiaryColor: '#f5f2ec',
          background: '#f5f2ec',
          mainBkg: '#ebe6dc',
          nodeBorder: '#d1c4a8',
          clusterBkg: '#ebe6dc',
          clusterBorder: '#d1c4a8',
          titleColor: '#2c2518',
          edgeLabelBackground: '#ebe6dc',
        },
        flowchart: {
          htmlLabels: true,
          curve: 'basis',
        },
        securityLevel: 'loose',
      });

      try {
        const id = `mermaid-${Math.random().toString(36).substr(2, 9)}`;
        const { svg } = await mermaid.render(id, chart);
        setSvg(svg);
      } catch (error) {
        console.error('Mermaid rendering error:', error);
      }
    };

    renderChart();

    // Re-render on theme change
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.attributeName === 'class') {
          renderChart();
        }
      });
    });

    observer.observe(document.documentElement, { attributes: true });

    return () => observer.disconnect();
  }, [chart]);

  return (
    <div
      ref={containerRef}
      className={`mermaid-container my-6 flex justify-center overflow-x-auto ${className}`}
      dangerouslySetInnerHTML={{ __html: svg }}
    />
  );
}
