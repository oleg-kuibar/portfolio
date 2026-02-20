import { useCallback, useEffect, useRef, useState } from 'react';

interface PanZoomOptions {
  minScale?: number;
  maxScale?: number;
  zoomSensitivity?: number;
  disabled?: boolean;
}

interface Transform {
  x: number;
  y: number;
  scale: number;
}

export function usePanZoom(options?: PanZoomOptions) {
  const {
    minScale = 0.3,
    maxScale = 3.0,
    zoomSensitivity = 0.001,
    disabled = false,
  } = options ?? {};

  const containerRef = useRef<HTMLDivElement>(null);
  const [transform, setTransform] = useState<Transform>({ x: 0, y: 0, scale: 1 });
  const [isPanning, setIsPanning] = useState(false);

  // Refs for mid-drag state to avoid re-renders
  const panStartRef = useRef<{ x: number; y: number; tx: number; ty: number } | null>(null);
  const transformRef = useRef(transform);
  transformRef.current = transform;

  // Track whether pointer is hovering (for wheel preventDefault)
  const hoveredRef = useRef(false);

  // Pinch tracking
  const pointersRef = useRef<Map<number, { x: number; y: number }>>(new Map());
  const pinchStartDistRef = useRef<number | null>(null);
  const pinchStartScaleRef = useRef<number>(1);

  const clampScale = useCallback((s: number) => Math.min(maxScale, Math.max(minScale, s)), [minScale, maxScale]);

  const resetView = useCallback(() => {
    setTransform({ x: 0, y: 0, scale: 1 });
  }, []);

  const zoomIn = useCallback(() => {
    setTransform(t => {
      const newScale = clampScale(t.scale * 1.25);
      // Zoom toward center of container
      const el = containerRef.current;
      if (!el) return { ...t, scale: newScale };
      const rect = el.getBoundingClientRect();
      const cx = rect.width / 2;
      const cy = rect.height / 2;
      const ratio = newScale / t.scale;
      return {
        x: cx - ratio * (cx - t.x),
        y: cy - ratio * (cy - t.y),
        scale: newScale,
      };
    });
  }, [clampScale]);

  const zoomOut = useCallback(() => {
    setTransform(t => {
      const newScale = clampScale(t.scale / 1.25);
      const el = containerRef.current;
      if (!el) return { ...t, scale: newScale };
      const rect = el.getBoundingClientRect();
      const cx = rect.width / 2;
      const cy = rect.height / 2;
      const ratio = newScale / t.scale;
      return {
        x: cx - ratio * (cx - t.x),
        y: cy - ratio * (cy - t.y),
        scale: newScale,
      };
    });
  }, [clampScale]);

  // Wheel zoom toward cursor
  useEffect(() => {
    const el = containerRef.current;
    if (!el || disabled) return;

    const onWheel = (e: WheelEvent) => {
      if (!hoveredRef.current) return;
      e.preventDefault();
      const rect = el.getBoundingClientRect();
      const cursorX = e.clientX - rect.left;
      const cursorY = e.clientY - rect.top;

      setTransform(t => {
        const delta = -e.deltaY * zoomSensitivity;
        const newScale = clampScale(t.scale * (1 + delta));
        const ratio = newScale / t.scale;
        return {
          x: cursorX - ratio * (cursorX - t.x),
          y: cursorY - ratio * (cursorY - t.y),
          scale: newScale,
        };
      });
    };

    el.addEventListener('wheel', onWheel, { passive: false });
    return () => el.removeEventListener('wheel', onWheel);
  }, [disabled, clampScale, zoomSensitivity]);

  const onPointerEnter = useCallback(() => { hoveredRef.current = true; }, []);
  const onPointerLeave = useCallback(() => { hoveredRef.current = false; }, []);

  const onPointerDown = useCallback((e: React.PointerEvent) => {
    if (disabled) return;
    const el = containerRef.current;
    if (!el) return;

    pointersRef.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    el.setPointerCapture(e.pointerId);

    if (pointersRef.current.size === 2) {
      // Start pinch
      const pts = [...pointersRef.current.values()];
      const dist = Math.hypot(pts[1].x - pts[0].x, pts[1].y - pts[0].y);
      pinchStartDistRef.current = dist;
      pinchStartScaleRef.current = transformRef.current.scale;
      panStartRef.current = null;
      return;
    }

    if (pointersRef.current.size === 1) {
      panStartRef.current = {
        x: e.clientX,
        y: e.clientY,
        tx: transformRef.current.x,
        ty: transformRef.current.y,
      };
      setIsPanning(true);
    }
  }, [disabled]);

  const onPointerMove = useCallback((e: React.PointerEvent) => {
    if (disabled) return;
    pointersRef.current.set(e.pointerId, { x: e.clientX, y: e.clientY });

    // Pinch zoom
    if (pointersRef.current.size === 2 && pinchStartDistRef.current !== null) {
      const pts = [...pointersRef.current.values()];
      const dist = Math.hypot(pts[1].x - pts[0].x, pts[1].y - pts[0].y);
      const ratio = dist / pinchStartDistRef.current;
      const newScale = clampScale(pinchStartScaleRef.current * ratio);

      const el = containerRef.current;
      if (el) {
        const rect = el.getBoundingClientRect();
        const cx = (pts[0].x + pts[1].x) / 2 - rect.left;
        const cy = (pts[0].y + pts[1].y) / 2 - rect.top;
        const scaleRatio = newScale / transformRef.current.scale;
        setTransform(t => ({
          x: cx - scaleRatio * (cx - t.x),
          y: cy - scaleRatio * (cy - t.y),
          scale: newScale,
        }));
      }
      return;
    }

    // Drag pan
    const start = panStartRef.current;
    if (start && pointersRef.current.size === 1) {
      const dx = e.clientX - start.x;
      const dy = e.clientY - start.y;
      setTransform(t => ({
        ...t,
        x: start.tx + dx,
        y: start.ty + dy,
      }));
    }
  }, [disabled, clampScale]);

  const onPointerUp = useCallback((e: React.PointerEvent) => {
    pointersRef.current.delete(e.pointerId);
    const el = containerRef.current;
    if (el) {
      try { el.releasePointerCapture(e.pointerId); } catch { /* ignore */ }
    }
    if (pointersRef.current.size < 2) {
      pinchStartDistRef.current = null;
    }
    if (pointersRef.current.size === 0) {
      panStartRef.current = null;
      setIsPanning(false);
    }
  }, []);

  const onDoubleClick = useCallback(() => {
    if (disabled) return;
    resetView();
  }, [disabled, resetView]);

  const transformStyle = `translate(${transform.x}px, ${transform.y}px) scale(${transform.scale})`;

  return {
    containerRef,
    transform,
    transformStyle,
    isPanning,
    handlers: {
      onPointerDown,
      onPointerMove,
      onPointerUp,
      onPointerEnter,
      onPointerLeave,
      onDoubleClick,
    },
    resetView,
    zoomIn,
    zoomOut,
  };
}
