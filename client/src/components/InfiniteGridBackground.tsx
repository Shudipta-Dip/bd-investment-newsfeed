import React, { useRef, useEffect } from 'react';
import { 
  motion, 
  useMotionValue, 
  useMotionTemplate, 
  useAnimationFrame 
} from "framer-motion";

const GridPattern = ({ offsetX, offsetY, size }: { offsetX: any; offsetY: any; size: number }) => {
  return (
    <svg className="w-full h-full">
      <defs>
        <motion.pattern
          id="grid-pattern"
          width={size}
          height={size}
          patternUnits="userSpaceOnUse"
          x={offsetX}
          y={offsetY}
        >
          <path
            d={`M ${size} 0 L 0 0 0 ${size}`}
            fill="none"
            stroke="currentColor"
            strokeWidth="1"
            className="text-muted-foreground" 
          />
        </motion.pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#grid-pattern)" />
    </svg>
  );
};

export const InfiniteGridBackground = () => {
  const gridSize = 40;
  const containerRef = useRef<HTMLDivElement>(null);

  // Motion values to track global mouse coords for the spotlight mask
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  useEffect(() => {
    const handleGlobalMouseMove = (e: MouseEvent) => {
      if (!containerRef.current) return;
      const { left, top } = containerRef.current.getBoundingClientRect();
      mouseX.set(e.clientX - left);
      mouseY.set(e.clientY - top);
    };
    window.addEventListener("mousemove", handleGlobalMouseMove);
    return () => window.removeEventListener("mousemove", handleGlobalMouseMove);
  }, [mouseX, mouseY]);

  // Motion values for offset infinite loop scrolling
  const gridOffsetX = useMotionValue(0);
  const gridOffsetY = useMotionValue(0);

  const speedX = 0.5; 
  const speedY = 0.5;

  useAnimationFrame(() => {
    const currentX = gridOffsetX.get();
    const currentY = gridOffsetY.get();
    gridOffsetX.set((currentX + speedX) % gridSize);
    gridOffsetY.set((currentY + speedY) % gridSize);
  });

  const maskImage = useMotionTemplate`radial-gradient(300px circle at ${mouseX}px ${mouseY}px, black, transparent)`;

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 w-screen h-screen overflow-hidden pointer-events-none z-0 bg-background"
    >
      {/* Layer 1: Subtle background grid (always visible) */}
      <div className="absolute inset-0 opacity-[0.05]">
        <GridPattern offsetX={gridOffsetX} offsetY={gridOffsetY} size={gridSize} />
      </div>

      {/* Layer 2: Highlighted grid (revealed by mouse mask) */}
      <motion.div 
        className="absolute inset-0 opacity-[0.35]"
        style={{ maskImage, WebkitMaskImage: maskImage }}
      >
        <GridPattern offsetX={gridOffsetX} offsetY={gridOffsetY} size={gridSize} />
      </motion.div>

      {/* Decorative Blur Spheres */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Top-right orange/primary glow: highly dimmed in dark mode */}
        <div className="absolute right-[-20%] top-[-20%] w-[40%] h-[40%] rounded-full bg-orange-500/25 dark:bg-orange-600/5 blur-[120px]" />
        <div className="absolute right-[10%] top-[-10%] w-[20%] h-[20%] rounded-full bg-primary/20 dark:bg-primary/5 blur-[100px]" />
        
        {/* Bottom-left blue glow: matching intensity */}
        <div className="absolute left-[-15%] bottom-[-15%] w-[40%] h-[40%] rounded-full bg-blue-500/25 dark:bg-blue-600/10 blur-[120px]" />
      </div>
    </div>
  );
};
