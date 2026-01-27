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
          primaryColor: '#0d9488',
          primaryTextColor: '#f1f5f9',
          primaryBorderColor: '#334155',
          lineColor: '#64748b',
          secondaryColor: '#1e293b',
          tertiaryColor: '#0f172a',
          background: '#0f172a',
          mainBkg: '#1e293b',
          nodeBorder: '#334155',
          clusterBkg: '#1e293b',
          clusterBorder: '#334155',
          titleColor: '#f1f5f9',
          edgeLabelBackground: '#1e293b',
        } : {
          primaryColor: '#0d9488',
          primaryTextColor: '#1e293b',
          primaryBorderColor: '#cbd5e1',
          lineColor: '#64748b',
          secondaryColor: '#f1f5f9',
          tertiaryColor: '#f8fafc',
          background: '#f8fafc',
          mainBkg: '#f1f5f9',
          nodeBorder: '#cbd5e1',
          clusterBkg: '#f1f5f9',
          clusterBorder: '#cbd5e1',
          titleColor: '#1e293b',
          edgeLabelBackground: '#f1f5f9',
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
