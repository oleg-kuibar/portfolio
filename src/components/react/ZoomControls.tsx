import type { ThemeColors } from './useThemeColors';

interface ZoomControlsProps {
  scale: number;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onReset: () => void;
  onFullscreen?: () => void;
  isFullscreen?: boolean;
  colors: ThemeColors;
}

export function ZoomControls({ scale, onZoomIn, onZoomOut, onReset, onFullscreen, isFullscreen, colors }: ZoomControlsProps) {
  const { foreground: fg, background: bg, border, mutedFg } = colors;

  const btnBase: React.CSSProperties = {
    fontFamily: 'var(--font-mono)',
    fontSize: '0.7rem',
    background: 'none',
    border: 'none',
    color: mutedFg,
    cursor: 'pointer',
    padding: '0 0.3rem',
    lineHeight: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  };

  return (
    <div
      style={{
        position: 'absolute',
        bottom: 6,
        right: 6,
        display: 'flex',
        alignItems: 'center',
        gap: '0.15rem',
        fontFamily: 'var(--font-mono)',
        fontSize: '0.65rem',
        background: `${bg}cc`,
        border: `1px solid ${border}`,
        borderRadius: '0.25rem',
        padding: '0.15rem 0.2rem',
        zIndex: 10,
        userSelect: 'none',
      }}
      // Prevent pan/zoom events from triggering when interacting with controls
      onPointerDown={e => e.stopPropagation()}
      onDoubleClick={e => e.stopPropagation()}
    >
      <button onClick={onZoomOut} title="Zoom out" style={btnBase}>−</button>
      <span style={{ color: mutedFg, fontSize: '0.6rem', minWidth: '2.2rem', textAlign: 'center' }}>
        {Math.round(scale * 100)}%
      </span>
      <button onClick={onZoomIn} title="Zoom in" style={btnBase}>+</button>
      <div style={{ width: 1, height: '0.8rem', background: border, margin: '0 0.1rem' }} />
      <button onClick={onReset} title="Reset view (double-click)" style={btnBase}>⟲</button>
      {onFullscreen && (
        <>
          <div style={{ width: 1, height: '0.8rem', background: border, margin: '0 0.1rem' }} />
          <button
            onClick={onFullscreen}
            title={isFullscreen ? 'Exit fullscreen (Esc)' : 'Fullscreen'}
            style={{ ...btnBase, color: isFullscreen ? fg : mutedFg }}
          >
            {isFullscreen ? '✖' : '⛶'}
          </button>
        </>
      )}
    </div>
  );
}
