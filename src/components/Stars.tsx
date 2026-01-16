import { useEffect, useRef, useCallback } from 'react';

interface Star {
  x: number;
  y: number;
  baseX: number;
  baseY: number;
  size: number;
  opacity: number;
  depth: number;
  twinkleSpeed: number;
  twinkleOffset: number;
  glow: boolean;
}

interface ShootingStar {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  size: number;
  trail: Array<{ x: number; y: number }>;
}

export default function Stars() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef = useRef({ x: 0.5, y: 0.5, targetX: 0.5, targetY: 0.5 });
  const scrollRef = useRef({ y: 0, velocity: 0, targetVelocity: 0 });
  const starsRef = useRef<Star[]>([]);
  const shootingStarsRef = useRef<ShootingStar[]>([]);
  const nextShootingStarRef = useRef(0);
  const lastScrollY = useRef(0);
  const lastScrollTime = useRef(Date.now());

  const createShootingStar = useCallback(() => {
    const speed = 10 + Math.random() * 6;
    const x = window.innerWidth * 0.2 + Math.random() * window.innerWidth * 0.8;
    const y = -20;

    return {
      x,
      y,
      vx: -(Math.random() * 0.4 + 0.2) * speed,
      vy: (Math.random() * 0.3 + 0.7) * speed,
      life: 0,
      maxLife: 80 + Math.random() * 40,
      size: Math.random() * 1 + 0.8,
      trail: [] as Array<{ x: number; y: number }>,
    };
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    // Generate stars across 4 depth layers
    const stars: Star[] = [];
    const layers = [
      { count: 150, depthMin: 0, depthMax: 0.2, sizeMin: 0.3, sizeMax: 0.7, glowChance: 0 },
      { count: 80, depthMin: 0.2, depthMax: 0.45, sizeMin: 0.5, sizeMax: 1.0, glowChance: 0.08 },
      { count: 40, depthMin: 0.45, depthMax: 0.7, sizeMin: 0.8, sizeMax: 1.5, glowChance: 0.2 },
      { count: 15, depthMin: 0.7, depthMax: 1, sizeMin: 1.2, sizeMax: 2.2, glowChance: 0.4 },
    ];

    layers.forEach((layer) => {
      for (let i = 0; i < layer.count; i++) {
        const x = Math.random() * 100;
        const y = Math.random() * 100;
        stars.push({
          x,
          y,
          baseX: x,
          baseY: y,
          size: layer.sizeMin + Math.random() * (layer.sizeMax - layer.sizeMin),
          opacity: 0.15 + Math.random() * 0.6,
          depth: layer.depthMin + Math.random() * (layer.depthMax - layer.depthMin),
          twinkleSpeed: 0.3 + Math.random() * 1.2,
          twinkleOffset: Math.random() * Math.PI * 2,
          glow: Math.random() < layer.glowChance,
        });
      }
    });
    starsRef.current = stars;

    // Mouse tracking
    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current.targetX = e.clientX / window.innerWidth;
      mouseRef.current.targetY = e.clientY / window.innerHeight;
    };
    window.addEventListener('mousemove', handleMouseMove);

    // Scroll tracking with velocity
    const handleScroll = () => {
      const now = Date.now();
      const dt = Math.max(now - lastScrollTime.current, 1);
      const newScrollY = window.scrollY;
      const scrollDelta = newScrollY - lastScrollY.current;

      // Calculate velocity (pixels per ms, capped)
      scrollRef.current.targetVelocity = Math.min(Math.max(scrollDelta / dt, -3), 3);
      scrollRef.current.y = newScrollY;

      lastScrollY.current = newScrollY;
      lastScrollTime.current = now;
    };
    window.addEventListener('scroll', handleScroll, { passive: true });

    // Shooting star spawner
    nextShootingStarRef.current = Date.now() + 2000 + Math.random() * 3000;

    let animationId: number;
    let time = 0;

    const animate = () => {
      time += 0.016;

      // Smooth interpolations
      mouseRef.current.x += (mouseRef.current.targetX - mouseRef.current.x) * 0.03;
      mouseRef.current.y += (mouseRef.current.targetY - mouseRef.current.y) * 0.03;
      scrollRef.current.velocity += (scrollRef.current.targetVelocity - scrollRef.current.velocity) * 0.1;
      scrollRef.current.targetVelocity *= 0.95; // Decay target velocity

      const scrollVelocity = scrollRef.current.velocity;
      const scrollY = scrollRef.current.y;

      // Clear canvas
      ctx.fillStyle = '#09090b';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw stars with scroll parallax
      starsRef.current.forEach((star) => {
        // Mouse parallax
        const mouseParallaxX = (mouseRef.current.x - 0.5) * star.depth * 50;
        const mouseParallaxY = (mouseRef.current.y - 0.5) * star.depth * 40;

        // Scroll parallax - deeper stars move slower (creates depth)
        const scrollParallax = scrollY * star.depth * 0.15;

        // Base position with parallax
        let x = (star.baseX / 100) * canvas.width + mouseParallaxX;
        let y = ((star.baseY / 100) * canvas.height + mouseParallaxY + scrollParallax) % (canvas.height + 100);

        // Wrap stars vertically
        if (y > canvas.height + 50) y -= canvas.height + 100;
        if (y < -50) y += canvas.height + 100;

        // Twinkle
        const twinkle = 0.5 + Math.sin(time * star.twinkleSpeed + star.twinkleOffset) * 0.5;
        const opacity = star.opacity * twinkle;

        // Scroll velocity stretching (warp effect)
        const stretchFactor = Math.abs(scrollVelocity) * star.depth * 8;
        const isStretched = stretchFactor > 0.5;

        // Draw glow for bright stars
        if (star.glow && opacity > 0.4 && !isStretched) {
          const glowSize = star.size * 5;
          const gradient = ctx.createRadialGradient(x, y, 0, x, y, glowSize);
          gradient.addColorStop(0, `rgba(255, 255, 255, ${opacity * 0.12})`);
          gradient.addColorStop(0.4, `rgba(255, 255, 255, ${opacity * 0.04})`);
          gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
          ctx.beginPath();
          ctx.arc(x, y, glowSize, 0, Math.PI * 2);
          ctx.fillStyle = gradient;
          ctx.fill();
        }

        // Draw star (stretched when scrolling fast)
        if (isStretched && star.depth > 0.3) {
          // Draw as a streak/line when scrolling
          const streakLength = stretchFactor * 3;
          const gradient = ctx.createLinearGradient(
            x,
            y - streakLength,
            x,
            y + streakLength
          );
          gradient.addColorStop(0, 'rgba(255, 255, 255, 0)');
          gradient.addColorStop(0.5, `rgba(255, 255, 255, ${opacity})`);
          gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');

          ctx.beginPath();
          ctx.moveTo(x, y - streakLength);
          ctx.lineTo(x, y + streakLength);
          ctx.strokeStyle = gradient;
          ctx.lineWidth = star.size * 0.8;
          ctx.lineCap = 'round';
          ctx.stroke();
        } else {
          // Normal circle star
          ctx.beginPath();
          ctx.arc(x, y, star.size, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(255, 255, 255, ${opacity})`;
          ctx.fill();
        }
      });

      // Spawn shooting stars (less frequent)
      const now = Date.now();
      if (now > nextShootingStarRef.current) {
        shootingStarsRef.current.push(createShootingStar());
        nextShootingStarRef.current = now + 8000 + Math.random() * 12000;
      }

      // Draw shooting stars
      shootingStarsRef.current = shootingStarsRef.current.filter((star) => {
        star.trail.unshift({ x: star.x, y: star.y });
        if (star.trail.length > 20) star.trail.pop();

        star.x += star.vx;
        star.y += star.vy;
        star.life++;

        const progress = star.life / star.maxLife;
        const opacity =
          progress < 0.1
            ? progress / 0.1
            : progress > 0.4
              ? Math.max(0, (1 - progress) / 0.6)
              : 1;

        if (opacity <= 0) return false;

        // Draw subtle trail
        if (star.trail.length > 1) {
          ctx.beginPath();
          ctx.moveTo(star.x, star.y);
          for (let i = 0; i < star.trail.length; i++) {
            ctx.lineTo(star.trail[i].x, star.trail[i].y);
          }

          const lastPoint = star.trail[star.trail.length - 1];
          const gradient = ctx.createLinearGradient(star.x, star.y, lastPoint.x, lastPoint.y);
          gradient.addColorStop(0, `rgba(255, 255, 255, ${opacity * 0.6})`);
          gradient.addColorStop(0.3, `rgba(255, 255, 255, ${opacity * 0.3})`);
          gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');

          ctx.strokeStyle = gradient;
          ctx.lineWidth = star.size * 0.7;
          ctx.lineCap = 'round';
          ctx.lineJoin = 'round';
          ctx.stroke();
        }

        // Small head
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${opacity * 0.8})`;
        ctx.fill();

        return star.life < star.maxLife;
      });

      animationId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('resize', resize);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('scroll', handleScroll);
    };
  }, [createShootingStar]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 z-0"
      style={{ background: '#09090b' }}
    />
  );
}
