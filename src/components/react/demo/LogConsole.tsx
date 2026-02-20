import { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { LogEntry } from './log-entries';

interface LogConsoleProps {
  entries: LogEntry[];
  currentStep: number;
  isFinished: boolean;
  returnValue?: object;
}

const LEVEL_COLORS: Record<LogEntry['level'], string> = {
  INFO: '#89b4fa',
  WARN: '#f9e2af',
  ERROR: '#f38ba8',
  SUCCESS: '#a6e3a1',
};

export function LogConsole({ entries, currentStep, isFinished, returnValue }: LogConsoleProps) {
  const logRef = useRef<HTMLDivElement>(null);

  const visibleEntries = entries.filter(e => e.stepIndex <= currentStep);

  // Auto-scroll to bottom when entries change
  useEffect(() => {
    if (logRef.current) {
      logRef.current.scrollTop = logRef.current.scrollHeight;
    }
  }, [visibleEntries.length, isFinished]);

  return (
    <div style={{
      borderRadius: '0.375rem',
      border: '1.5px solid #313244',
      background: '#1e1e2e',
      overflow: 'hidden',
      fontFamily: 'var(--font-mono)',
      fontSize: '0.6rem',
    }}>
      {/* Header bar with traffic lights */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '0.35rem',
        padding: '0.3rem 0.5rem',
        borderBottom: '1px solid #313244',
        background: '#181825',
      }}>
        <div style={{ width: 7, height: 7, borderRadius: '50%', background: '#f38ba8' }} />
        <div style={{ width: 7, height: 7, borderRadius: '50%', background: '#f9e2af' }} />
        <div style={{ width: 7, height: 7, borderRadius: '50%', background: '#a6e3a1' }} />
        <span style={{ marginLeft: '0.35rem', color: '#6c7086', fontSize: '0.55rem', letterSpacing: '0.03em' }}>
          Convex Dashboard
        </span>
      </div>

      {/* Log entries */}
      <div
        ref={logRef}
        style={{
          maxHeight: '10rem',
          overflowY: 'auto',
          padding: '0.35rem 0.5rem',
        }}
      >
        <AnimatePresence initial={false}>
          {visibleEntries.map((entry, i) => (
            <motion.div
              key={`${entry.stepIndex}-${i}`}
              initial={{ opacity: 0, x: 8 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -8 }}
              transition={{ duration: 0.2 }}
              style={{
                display: 'flex',
                gap: '0.4rem',
                alignItems: 'baseline',
                padding: '0.12rem 0',
                lineHeight: 1.4,
              }}
            >
              <span style={{ color: '#585b70', flexShrink: 0 }}>{entry.timestamp}</span>
              <span style={{
                color: LEVEL_COLORS[entry.level],
                fontWeight: 600,
                flexShrink: 0,
                fontSize: '0.5rem',
                padding: '0 0.2rem',
                borderRadius: '0.15rem',
                background: `${LEVEL_COLORS[entry.level]}15`,
              }}>
                {entry.level}
              </span>
              <span style={{ color: '#7f849c', flexShrink: 0 }}>{entry.source}</span>
              <span style={{ color: '#cdd6f4' }}>{entry.message}</span>
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Return value JSON */}
        {isFinished && returnValue && visibleEntries.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.15, duration: 0.25 }}
            style={{
              marginTop: '0.35rem',
              padding: '0.35rem 0.5rem',
              borderRadius: '0.25rem',
              background: '#11111b',
              border: '1px solid #313244',
              color: '#585b70',
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-all',
              lineHeight: 1.4,
            }}
          >
            <span style={{ color: '#6c7086', fontSize: '0.5rem' }}>Return value:</span>
            {'\n'}
            <span style={{ color: '#a6adc8' }}>
              {JSON.stringify(returnValue, null, 2)}
            </span>
          </motion.div>
        )}
      </div>
    </div>
  );
}
