import React, { useEffect, useRef } from 'react';

export default function MovingParticles() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = canvas.width = canvas.offsetWidth || 300;
    let height = canvas.height = canvas.offsetHeight || 500;

    const particles: {
      x: number;
      y: number;
      vx: number;
      vy: number;
      size: number;
      alpha: number;
    }[] = [];

    // Create 35 floating particles for a sleek background effect
    const particleCount = 35;
    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.45, // Slow elegant drift
        vy: (Math.random() - 0.5) * 0.45,
        size: Math.random() * 2 + 1, // 1px to 3px
        alpha: Math.random() * 0.4 + 0.3, // 0.3 to 0.7 opacity
      });
    }

    const resizeObserver = new ResizeObserver((entries) => {
      for (let entry of entries) {
        width = canvas.width = entry.contentRect.width || canvas.offsetWidth;
        height = canvas.height = entry.contentRect.height || canvas.offsetHeight;
      }
    });
    
    resizeObserver.observe(canvas);

    const render = () => {
      if (!ctx || !canvas) return;
      ctx.clearRect(0, 0, width, height);

      // Move and draw particles
      particles.forEach((p, idx) => {
        p.x += p.vx;
        p.y += p.vy;

        // Wrap around borders safely
        if (p.x < 0) p.x = width;
        if (p.x > width) p.x = 0;
        if (p.y < 0) p.y = height;
        if (p.y > height) p.y = 0;

        // Draw particle glowing dot
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(56, 189, 248, ${p.alpha})`; // Elegant sky blue / cyan
        ctx.fill();

        // Draw connecting lines between close particles
        for (let j = idx + 1; j < particles.length; j++) {
          const p2 = particles[j];
          const dx = p.x - p2.x;
          const dy = p.y - p2.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < 65) {
            const lineAlpha = (1 - dist / 65) * 0.12;
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.strokeStyle = `rgba(56, 189, 248, ${lineAlpha})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }
      });

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      resizeObserver.disconnect();
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none opacity-50 z-0"
    />
  );
}
