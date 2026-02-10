import { motion } from 'framer-motion';

interface PlayButtonProps {
  playing: boolean;
  finished: boolean;
  onPlay: () => void;
  onStep?: () => void;
  onReset?: () => void;
  stepDisabled?: boolean;
  hasInteracted: boolean;
  fg: string;
  bg: string;
  border: string;
  mutedFg: string;
  accent: string;
  stepLabel?: string;
}

export function PlayButton({
  playing, finished, onPlay, onStep, onReset,
  stepDisabled, hasInteracted, fg, bg, border, mutedFg, accent, stepLabel,
}: PlayButtonProps) {
  const label = playing ? 'Pause' : finished ? 'Replay' : 'Play';
  const showPulse = !hasInteracted && !playing;

  const baseStyle = {
    fontFamily: 'var(--font-mono)' as const,
    fontSize: '0.75rem',
    padding: '0.25rem 0.625rem',
    borderRadius: '0.25rem',
    cursor: 'pointer' as const,
    transition: 'all 0.15s ease',
  };

  return (
    <div style={{ display: 'flex', gap: '0.25rem', alignItems: 'center' }}>
      <motion.button
        onClick={onPlay}
        animate={showPulse ? {
          boxShadow: [
            `0 0 0 0px ${accent}40`,
            `0 0 0 6px ${accent}00`,
          ],
        } : {
          boxShadow: `0 0 0 0px ${accent}00`,
        }}
        transition={showPulse ? {
          duration: 1.5,
          repeat: Infinity,
          ease: 'easeOut',
        } : { duration: 0.2 }}
        style={{
          ...baseStyle,
          border: `2px solid ${showPulse ? accent : border}`,
          background: showPulse ? accent : 'transparent',
          color: showPulse ? bg : fg,
          fontWeight: showPulse ? 600 : 400,
        }}
      >
        {showPulse ? '▶ Play' : label}
      </motion.button>
      {onStep && (
        <button onClick={onStep} disabled={stepDisabled} style={{
          ...baseStyle,
          border: `2px solid ${border}`,
          background: 'transparent',
          color: stepDisabled ? mutedFg : fg,
          opacity: stepDisabled ? 0.5 : 1,
          cursor: stepDisabled ? 'default' : 'pointer',
        }}>
          {stepLabel || 'Step'}
        </button>
      )}
      {onReset && (
        <button onClick={onReset} style={{
          ...baseStyle,
          border: `2px solid ${border}`,
          background: 'transparent',
          color: fg,
        }}>
          Reset
        </button>
      )}
    </div>
  );
}
