import { useCallback, useEffect, useRef, useState } from 'react';

interface TimelineOptions {
  totalSteps: number;
  intervalMs?: number;
  stepsPerTick?: number;
  autoPlay?: boolean;
}

interface TimelineState {
  step: number;
  playing: boolean;
  isFinished: boolean;
  hasInteracted: boolean;
}

interface TimelineActions {
  play: () => void;
  pause: () => void;
  togglePlay: () => void;
  stepForward: () => void;
  reset: () => void;
  setStep: (step: number) => void;
}

export function useAnimationTimeline(options: TimelineOptions): TimelineState & TimelineActions {
  const { totalSteps, intervalMs = 700, stepsPerTick = 1, autoPlay = false } = options;
  const [step, setStep] = useState(0);
  const [playing, setPlaying] = useState(autoPlay);
  const [hasInteracted, setHasInteracted] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const isFinished = step >= totalSteps;

  useEffect(() => {
    if (playing && !isFinished && totalSteps > 0) {
      intervalRef.current = setInterval(() => {
        setStep(s => {
          const next = Math.min(s + stepsPerTick, totalSteps);
          if (next >= totalSteps) setPlaying(false);
          return next;
        });
      }, intervalMs);
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [playing, isFinished, totalSteps, intervalMs, stepsPerTick]);

  useEffect(() => { if (isFinished) setPlaying(false); }, [isFinished]);

  const play = useCallback(() => {
    setHasInteracted(true);
    if (step >= totalSteps) { setStep(0); }
    setPlaying(true);
  }, [step, totalSteps]);

  const pause = useCallback(() => {
    setHasInteracted(true);
    setPlaying(false);
  }, []);

  const togglePlay = useCallback(() => {
    setHasInteracted(true);
    if (isFinished) { setStep(0); setPlaying(true); }
    else { setPlaying(p => !p); }
  }, [isFinished]);

  const stepForward = useCallback(() => {
    setHasInteracted(true);
    setPlaying(false);
    setStep(s => Math.min(s + 1, totalSteps));
  }, [totalSteps]);

  const reset = useCallback(() => {
    setHasInteracted(true);
    setPlaying(false);
    setStep(0);
  }, []);

  const setStepTo = useCallback((s: number) => {
    setHasInteracted(true);
    setStep(Math.min(Math.max(0, s), totalSteps));
  }, [totalSteps]);

  return {
    step, playing, isFinished, hasInteracted,
    play, pause, togglePlay, stepForward, reset, setStep: setStepTo,
  };
}
