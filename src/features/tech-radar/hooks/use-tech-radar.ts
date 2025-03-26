import { useCallback, useRef, useState } from "react";
import { TechItem, TechItemPosition } from "../types/tech-item";
import { TECH_ITEMS } from "../constants/tech-items";

export const useTechRadar = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const techItemPositions = useRef<{ [key: string]: TechItemPosition }>({});
  const [hoveredTech, setHoveredTech] = useState<TechItem | null>(null);
  const [hoveredLegendItem, setHoveredLegendItem] = useState<string | null>(
    null,
  );
  const [activeCategory, setActiveCategory] = useState("all");

  const filteredTechItems =
    activeCategory === "all"
      ? TECH_ITEMS
      : TECH_ITEMS.filter((item) => item.category === activeCategory);

  const handleCanvasMouseMove = useCallback(
    (
      e:
        | React.MouseEvent<HTMLCanvasElement>
        | React.TouchEvent<HTMLCanvasElement>,
    ) => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const rect = canvas.getBoundingClientRect();
      const x = ("touches" in e ? e.touches[0].clientX : e.clientX) - rect.left;
      const y = ("touches" in e ? e.touches[0].clientY : e.clientY) - rect.top;

      let hoveredItem = null;
      for (const [name, position] of Object.entries(
        techItemPositions.current,
      )) {
        const distance = Math.sqrt(
          Math.pow(x - position.x, 2) + Math.pow(y - position.y, 2),
        );
        if (distance < position.radius + 5) {
          hoveredItem = TECH_ITEMS.find((item) => item.name === name) || null;
          break;
        }
      }

      setHoveredTech(hoveredItem);
    },
    [],
  );

  const handleTouchStart = useCallback(
    (e: React.TouchEvent<HTMLCanvasElement>) => {
      e.preventDefault();
      handleCanvasMouseMove(e);
    },
    [handleCanvasMouseMove],
  );

  const handleTouchMove = useCallback(
    (e: React.TouchEvent<HTMLCanvasElement>) => {
      e.preventDefault();
      handleCanvasMouseMove(e);
    },
    [handleCanvasMouseMove],
  );

  const handleMouseLeave = useCallback(() => {
    setHoveredTech(null);
    setHoveredLegendItem(null);
  }, []);

  const handleLegendItemHover = useCallback((level: string | null) => {
    setHoveredLegendItem(level);
  }, []);

  return {
    canvasRef,
    techItemPositions,
    hoveredTech,
    hoveredLegendItem,
    activeCategory,
    setActiveCategory,
    filteredTechItems,
    handleCanvasMouseMove,
    handleTouchStart,
    handleTouchMove,
    handleMouseLeave,
    handleLegendItemHover,
  };
};
