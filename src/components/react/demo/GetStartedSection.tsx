import { useThemeColors } from '../useThemeColors';

export function GetStartedSection() {
  const colors = useThemeColors();
  if (!colors) return null;

  const { foreground: fg, mutedFg, border, primary, secondary, accent } = colors;

  return (
    <section>
      <div style={{
        textAlign: 'center',
        padding: '2rem 1rem',
        borderRadius: '0.5rem',
        border: `1.5px solid ${border}`,
        background: `${primary}06`,
      }}>
        <h2 style={{
          fontFamily: 'var(--font-heading)',
          fontSize: 'clamp(1.25rem, 3vw, 1.75rem)',
          fontWeight: 700,
          color: fg,
          marginBottom: '0.5rem',
        }}>
          Ready to eliminate orphaned data?
        </h2>
        <p style={{
          fontFamily: 'var(--font-sans)',
          fontSize: '0.9rem',
          color: mutedFg,
          maxWidth: '28rem',
          margin: '0 auto 1.25rem',
          lineHeight: 1.6,
        }}>
          Install the component, declare your relationships, and every delete is safe.
        </p>
        <div style={{
          display: 'flex',
          gap: '0.75rem',
          justifyContent: 'center',
          flexWrap: 'wrap',
        }}>
          <a
            href="https://github.com/oleg-kuibar/cascading-deletes"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '0.8rem',
              padding: '0.5rem 1.25rem',
              borderRadius: '0.375rem',
              border: `2px solid ${primary}`,
              background: primary,
              color: '#fff',
              textDecoration: 'none',
              fontWeight: 600,
              transition: 'all 0.15s ease',
            }}
          >
            View on GitHub
          </a>
          <a
            href="https://www.npmjs.com/package/@oleg-kuibar/cascading-deletes"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '0.8rem',
              padding: '0.5rem 1.25rem',
              borderRadius: '0.375rem',
              border: `2px solid ${secondary}`,
              color: secondary,
              textDecoration: 'none',
              fontWeight: 500,
              transition: 'all 0.15s ease',
            }}
          >
            npm package
          </a>
          <a
            href="https://docs.convex.dev/components"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '0.75rem',
              padding: '0.5rem 1.25rem',
              borderRadius: '0.375rem',
              border: `2px solid ${border}`,
              color: mutedFg,
              textDecoration: 'none',
              transition: 'all 0.15s ease',
            }}
          >
            Convex docs
          </a>
        </div>
      </div>
    </section>
  );
}
