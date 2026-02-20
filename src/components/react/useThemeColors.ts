import { useState, useEffect } from 'react';

export interface ThemeColors {
  primary: string;
  secondary: string;
  accent: string;
  foreground: string;
  mutedFg: string;
  muted: string;
  border: string;
  background: string;
  danger: string;
  dangerMuted: string;
  success: string;
  warning: string;
  info: string;
}

export function getThemeColors(): ThemeColors {
  const style = getComputedStyle(document.documentElement);
  return {
    primary: style.getPropertyValue('--color-primary').trim(),
    secondary: style.getPropertyValue('--color-secondary').trim(),
    accent: style.getPropertyValue('--color-accent').trim(),
    foreground: style.getPropertyValue('--color-foreground').trim(),
    mutedFg: style.getPropertyValue('--color-muted-foreground').trim(),
    muted: style.getPropertyValue('--color-muted').trim(),
    border: style.getPropertyValue('--color-border').trim(),
    background: style.getPropertyValue('--color-background').trim(),
    danger: style.getPropertyValue('--color-danger').trim(),
    dangerMuted: style.getPropertyValue('--color-danger-muted').trim(),
    success: style.getPropertyValue('--color-success').trim(),
    warning: style.getPropertyValue('--color-warning').trim(),
    info: style.getPropertyValue('--color-info').trim(),
  };
}

export function useThemeColors(): ThemeColors | null {
  const [colors, setColors] = useState<ThemeColors | null>(null);

  useEffect(() => {
    setColors(getThemeColors());
    const observer = new MutationObserver(() => setColors(getThemeColors()));
    observer.observe(document.documentElement, { attributes: true });
    return () => observer.disconnect();
  }, []);

  return colors;
}
