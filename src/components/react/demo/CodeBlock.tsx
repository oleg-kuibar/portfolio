import { useState, useCallback } from 'react';
import { Highlight, themes } from 'prism-react-renderer';
import { useThemeColors } from '../useThemeColors';

interface CodeBlockProps {
  code: string;
  language?: string;
  title?: string;
  showCopy?: boolean;
}

export function CodeBlock({ code, language = 'typescript', title, showCopy = true }: CodeBlockProps) {
  const colors = useThemeColors();
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(code.trim());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [code]);

  if (!colors) return null;

  const { border, mutedFg } = colors;

  return (
    <div style={{
      borderRadius: '0.5rem',
      overflow: 'hidden',
      border: `1.5px solid ${border}`,
      fontSize: '0.8rem',
      lineHeight: 1.6,
    }}>
      {/* Header bar */}
      {(title || showCopy) && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0.35rem 0.75rem',
          background: '#1e1e2e',
          borderBottom: '1px solid #313244',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <div style={{ display: 'flex', gap: '0.3rem' }}>
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#f38ba8', display: 'inline-block' }} />
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#f9e2af', display: 'inline-block' }} />
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#a6e3a1', display: 'inline-block' }} />
            </div>
            {title && (
              <span style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '0.65rem',
                color: '#a6adc8',
              }}>
                {title}
              </span>
            )}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            {language && (
              <span style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '0.55rem',
                color: '#585b70',
                textTransform: 'uppercase',
                letterSpacing: '0.04em',
              }}>
                {language}
              </span>
            )}
            {showCopy && (
              <button
                onClick={handleCopy}
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.6rem',
                  color: copied ? '#a6e3a1' : '#6c7086',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  padding: '0.1rem 0.3rem',
                }}
              >
                {copied ? 'Copied!' : 'Copy'}
              </button>
            )}
          </div>
        </div>
      )}

      {/* Code content */}
      <Highlight theme={themes.oneDark} code={code.trim()} language={language}>
        {({ style, tokens, getLineProps, getTokenProps }) => (
          <pre style={{
            ...style,
            margin: 0,
            padding: '0.75rem 1rem',
            background: '#1e1e2e',
            overflow: 'auto',
          }}>
            {tokens.map((line, i) => (
              <div key={i} {...getLineProps({ line })}>
                {line.map((token, key) => (
                  <span key={key} {...getTokenProps({ token })} />
                ))}
              </div>
            ))}
          </pre>
        )}
      </Highlight>
    </div>
  );
}
