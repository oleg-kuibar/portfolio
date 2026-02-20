import { useThemeColors } from '../useThemeColors';

interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  badge?: string;
  id?: string;
}

export function SectionHeader({ title, subtitle, badge, id }: SectionHeaderProps) {
  const colors = useThemeColors();
  if (!colors) return null;

  const { foreground: fg, mutedFg, accent } = colors;

  return (
    <div id={id} style={{ marginBottom: '1rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <h2 style={{
          fontFamily: 'var(--font-heading)',
          fontSize: '1.35rem',
          fontWeight: 600,
          color: fg,
          lineHeight: 1.3,
          margin: 0,
        }}>
          {title}
        </h2>
        {badge && (
          <span style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '0.55rem',
            fontWeight: 600,
            padding: '0.15rem 0.4rem',
            borderRadius: '0.2rem',
            background: `${accent}20`,
            color: accent,
            letterSpacing: '0.04em',
            textTransform: 'uppercase',
          }}>
            {badge}
          </span>
        )}
      </div>
      {subtitle && (
        <p style={{
          fontFamily: 'var(--font-sans)',
          fontSize: '0.875rem',
          color: mutedFg,
          marginTop: '0.3rem',
          maxWidth: '40rem',
          lineHeight: 1.6,
        }}>
          {subtitle}
        </p>
      )}
    </div>
  );
}
