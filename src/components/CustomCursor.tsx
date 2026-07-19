import React, { useEffect, useState, useRef } from 'react';

export default function CustomCursor() {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [trailPosition, setTrailPosition] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);
  const [isClicking, setIsClicking] = useState(false);
  const [isHidden, setIsHidden] = useState(true);
  const [isMobile, setIsMobile] = useState(true);
  const requestRef = useRef<number | null>(null);

  useEffect(() => {
    // Check if device supports fine pointers (mice)
    const mediaQuery = window.matchMedia('(pointer: fine)');
    setIsMobile(!mediaQuery.matches);

    const handleMediaChange = (e: MediaQueryListEvent) => {
      setIsMobile(!e.matches);
    };
    mediaQuery.addEventListener('change', handleMediaChange);

    const onMouseMove = (e: MouseEvent) => {
      setPosition({ x: e.clientX, y: e.clientY });
      setIsHidden(false);
    };

    const onMouseLeave = () => {
      setIsHidden(true);
    };

    const onMouseEnter = () => {
      setIsHidden(false);
    };

    const onMouseDown = () => {
      setIsClicking(true);
    };

    const onMouseUp = () => {
      setIsClicking(false);
    };

    // Detect hovers on interactive items
    const handleMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (
        target.closest('button') ||
        target.closest('a') ||
        target.closest('.interactive-chip') ||
        target.closest('input') ||
        target.closest('[role="button"]')
      ) {
        setIsHovered(true);
      } else {
        setIsHovered(false);
      }
    };

    window.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseleave', onMouseLeave);
    document.addEventListener('mouseenter', onMouseEnter);
    window.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mouseup', onMouseUp);
    window.addEventListener('mouseover', handleMouseOver);

    // Smooth trail follow (interpolation)
    const updateTrail = () => {
      setTrailPosition((prev) => {
        const dx = position.x - prev.x;
        const dy = position.y - prev.y;
        // Adjust the multiplier for follow speed (0.15 = smooth lag)
        return {
          x: prev.x + dx * 0.16,
          y: prev.y + dy * 0.16,
        };
      });
      requestRef.current = requestAnimationFrame(updateTrail);
    };
    requestRef.current = requestAnimationFrame(updateTrail);

    return () => {
      mediaQuery.removeEventListener('change', handleMediaChange);
      window.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseleave', onMouseLeave);
      document.removeEventListener('mouseenter', onMouseEnter);
      window.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mouseup', onMouseUp);
      window.removeEventListener('mouseover', handleMouseOver);
      if (requestRef.current) {
        cancelAnimationFrame(requestRef.current);
      }
    };
  }, [position]);

  if (isMobile || isHidden) return null;

  return (
    <>
      {/* Inner precise dot */}
      <div
        id="custom-cursor-dot"
        className="fixed top-0 left-0 w-1.5 h-1.5 bg-cyan-400 rounded-full pointer-events-none z-50 mix-blend-screen -translate-x-1/2 -translate-y-1/2 transition-transform duration-100 ease-out"
        style={{
          left: `${position.x}px`,
          top: `${position.y}px`,
          transform: `translate(-50%, -50%) scale(${isClicking ? 0.6 : 1})`,
        }}
      />

      {/* Magnetic Outer glow ring */}
      <div
        id="custom-cursor-ring"
        className={`fixed top-0 left-0 rounded-full pointer-events-none z-50 mix-blend-screen -translate-x-1/2 -translate-y-1/2 transition-all duration-300 ease-out border ${
          isHovered
            ? 'w-12 h-12 border-purple-400 bg-purple-500/10 shadow-[0_0_15px_rgba(168,85,247,0.3)]'
            : 'w-7 h-7 border-cyan-400/50 bg-transparent shadow-none'
        }`}
        style={{
          left: `${trailPosition.x}px`,
          top: `${trailPosition.y}px`,
          transform: `translate(-50%, -50%) scale(${isClicking ? 0.95 : 1})`,
        }}
      />
    </>
  );
}
