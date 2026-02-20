import { useEffect, useRef } from 'react';

/**
 * Calls `onVisible` once when the target element scrolls into view.
 * Uses IntersectionObserver with the given threshold.
 */
export function useAutoPlay(
  onVisible: () => void,
  options?: { threshold?: number; enabled?: boolean },
) {
  const ref = useRef<HTMLDivElement>(null);
  const firedRef = useRef(false);
  const { threshold = 0.3, enabled = true } = options ?? {};

  useEffect(() => {
    const el = ref.current;
    if (!el || !enabled || firedRef.current) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !firedRef.current) {
          firedRef.current = true;
          onVisible();
          observer.disconnect();
        }
      },
      { threshold },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [onVisible, threshold, enabled]);

  return ref;
}
