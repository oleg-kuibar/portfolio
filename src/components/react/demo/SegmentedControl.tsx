import { useThemeColors } from '../useThemeColors';

interface SegmentedControlProps<T extends string> {
  value: T;
  options: { value: T; label: string }[];
  onChange: (value: T) => void;
  size?: 'sm' | 'md';
}

export function SegmentedControl<T extends string>({
  value, options, onChange, size = 'sm',
}: SegmentedControlProps<T>) {
  const colors = useThemeColors();
  if (!colors) return null;

  const { foreground: fg, background: bg, border, mutedFg } = colors;
  const fontSize = size === 'sm' ? '0.65rem' : '0.75rem';
  const padding = size === 'sm' ? '0.15rem 0.4rem' : '0.25rem 0.625rem';

  return (
    <div style={{
      display: 'inline-flex',
      gap: '0.2rem',
      padding: '0.15rem',
      borderRadius: '0.3rem',
      border: `1.5px solid ${border}`,
      background: bg,
    }}>
      {options.map(opt => {
        const active = opt.value === value;
        return (
          <button
            key={opt.value}
            onClick={() => onChange(opt.value)}
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize,
              padding,
              borderRadius: '0.2rem',
              border: 'none',
              background: active ? fg : 'transparent',
              color: active ? bg : mutedFg,
              cursor: 'pointer',
              fontWeight: active ? 600 : 400,
              transition: 'all 0.15s ease',
              lineHeight: 1.2,
            }}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}
