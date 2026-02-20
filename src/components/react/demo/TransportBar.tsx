import { motion } from 'framer-motion';
import { useThemeColors } from '../useThemeColors';

interface TransportBarProps {
  playing: boolean;
  isFinished: boolean;
  hasInteracted: boolean;
  step: number;
  totalSteps: number;
  onTogglePlay: () => void;
  onStep: () => void;
  onReset: () => void;
  onScrub?: (step: number) => void;
}

export function TransportBar({
  playing, isFinished, hasInteracted, step, totalSteps,
  onTogglePlay, onStep, onReset, onScrub,
}: TransportBarProps) {
  const colors = useThemeColors();
  if (!colors) return null;

  const { foreground: fg, background: bg, border, mutedFg, accent, success } = colors;

  const progress = totalSteps > 0 ? step / totalSteps : 0;
  const showPulse = !hasInteracted && !playing;

  const btnBase: React.CSSProperties = {
    fontFamily: 'var(--font-mono)',
    fontSize: '0.7rem',
    padding: '0.25rem 0.6rem',
    borderRadius: '0.25rem',
    cursor: 'pointer',
    transition: 'all 0.15s ease',
    border: `1.5px solid ${border}`,
    background: 'transparent',
    color: fg,
  };

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem',
      padding: '0.4rem 0.5rem',
      borderRadius: '0.375rem',
      border: `1.5px solid ${border}`,
      background: colors.muted,
    }}>
      {/* Play/Pause */}
      <motion.button
        onClick={onTogglePlay}
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
          ...btnBase,
          borderColor: showPulse ? accent : border,
          background: showPulse ? accent : 'transparent',
          color: showPulse ? bg : fg,
          fontWeight: showPulse ? 600 : 400,
          minWidth: '3.5rem',
        }}
      >
        {showPulse ? '▶ Play' : playing ? 'Pause' : isFinished ? 'Replay' : 'Play'}
      </motion.button>

      {/* Step */}
      <button
        onClick={onStep}
        disabled={isFinished}
        style={{
          ...btnBase,
          opacity: isFinished ? 0.4 : 1,
          cursor: isFinished ? 'default' : 'pointer',
        }}
      >
        Step
      </button>

      {/* Reset */}
      <button onClick={onReset} style={btnBase}>
        Reset
      </button>

      {/* Scrubber track */}
      <div
        onClick={(e) => {
          if (!onScrub || totalSteps === 0) return;
          const rect = e.currentTarget.getBoundingClientRect();
          const ratio = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
          onScrub(Math.round(ratio * totalSteps));
        }}
        style={{
          flex: 1,
          height: 6,
          borderRadius: 3,
          background: `${border}80`,
          overflow: 'hidden',
          cursor: onScrub ? 'pointer' : 'default',
          position: 'relative',
          minWidth: '3rem',
        }}
      >
        <motion.div
          animate={{ width: `${progress * 100}%` }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          style={{
            height: '100%',
            background: isFinished ? success : accent,
            borderRadius: 3,
          }}
        />
      </div>

      {/* Step counter */}
      <span style={{
        fontFamily: 'var(--font-mono)',
        fontSize: '0.6rem',
        color: mutedFg,
        flexShrink: 0,
        minWidth: '3rem',
        textAlign: 'right',
      }}>
        {step}/{totalSteps}
      </span>
    </div>
  );
}
