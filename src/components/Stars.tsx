import { useEffect, useRef, useCallback } from 'react';

interface Star3D {
  x: number;      // 3D position
  y: number;
  z: number;
  baseZ: number;  // Original Z for reset
  size: number;
  brightness: number;
}

interface ShootingStar {
  x: number;
  y: number;
  z: number;
  vx: number;
  vy: number;
  vz: number;
  life: number;
  maxLife: number;
  size: number;
  trail: Array<{ x: number; y: number; opacity: number }>;
}

// Section color themes - vivid and distinct
const sectionColors = [
  { r: 147, g: 51, b: 234 },   // Hero - vivid purple
  { r: 100, g: 120, b: 255 },  // Stats - vibrant blue/indigo
  { r: 6, g: 182, b: 212 },    // Portfolio - cyan
  { r: 16, g: 185, b: 129 },   // Philosophy - emerald
  { r: 236, g: 72, b: 153 },   // Contact - pink
];

export default function Stars() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const starsRef = useRef<Star3D[]>([]);
  const shootingStarsRef = useRef<ShootingStar[]>([]);
  const scrollRef = useRef({ y: 0, velocity: 0, targetVelocity: 0, section: 0, targetSection: 0 });
  const mouseRef = useRef({ x: 0.5, y: 0.5, targetX: 0.5, targetY: 0.5 });
  const cameraRef = useRef({ rotX: 0, rotY: 0, targetRotX: 0, targetRotY: 0 });
  const lastScrollY = useRef(0);
  const lastScrollTime = useRef(Date.now());
  const nextShootingStarRef = useRef(0);

  // 3D to 2D projection with perspective
  const project = useCallback((x: number, y: number, z: number, width: number, height: number, fov: number) => {
    const centerX = width / 2;
    const centerY = height / 2;

    // Perspective projection
    const scale = fov / (fov + z);
    const projX = centerX + x * scale;
    const projY = centerY + y * scale;

    return { x: projX, y: projY, scale };
  }, []);

  const createShootingStar = useCallback((width: number, height: number) => {
    // Slow, graceful shooting star
    const x = width * 0.3 + Math.random() * width * 0.5;
    const y = -20;

    return {
      x,
      y,
      z: 150,
      vx: -(1.5 + Math.random() * 1.5),
      vy: 3 + Math.random() * 2,
      vz: 0,
      life: 0,
      maxLife: 150 + Math.random() * 80, // Longer, more graceful
      size: 0.6 + Math.random() * 0.6,
      trail: [] as Array<{ x: number; y: number; opacity: number }>,
    };
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = window.innerWidth;
    let height = window.innerHeight;
    const fov = 400; // Field of view
    const starFieldDepth = 1500;

    const resize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width;
      canvas.height = height;
    };
    resize();
    window.addEventListener('resize', resize);

    // Generate 3D star field
    const stars: Star3D[] = [];
    const starCount = 400;

    for (let i = 0; i < starCount; i++) {
      const z = Math.random() * starFieldDepth;
      stars.push({
        x: (Math.random() - 0.5) * width * 3,
        y: (Math.random() - 0.5) * height * 3,
        z,
        baseZ: z,
        size: 0.4 + Math.random() * 1.4,
        brightness: 0.3 + Math.random() * 0.7,
      });
    }
    starsRef.current = stars;

    // Mouse tracking for camera rotation
    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current.targetX = e.clientX / width;
      mouseRef.current.targetY = e.clientY / height;
    };
    window.addEventListener('mousemove', handleMouseMove);

    // Scroll tracking
    const handleScroll = () => {
      const now = Date.now();
      const dt = Math.max(now - lastScrollTime.current, 1);
      const newScrollY = window.scrollY;
      const scrollDelta = newScrollY - lastScrollY.current;

      scrollRef.current.targetVelocity = Math.min(Math.max(scrollDelta / dt, -5), 5);
      scrollRef.current.y = newScrollY;

      const sectionHeight = window.innerHeight;
      const currentSection = Math.min(
        Math.floor((newScrollY + sectionHeight * 0.5) / sectionHeight),
        sectionColors.length - 1
      );
      scrollRef.current.targetSection = currentSection;

      lastScrollY.current = newScrollY;
      lastScrollTime.current = now;
    };
    window.addEventListener('scroll', handleScroll, { passive: true });

    nextShootingStarRef.current = Date.now() + 3000;

    let animationId: number;
    let time = 0;

    const animate = () => {
      time += 0.016;

      // Smooth interpolations
      mouseRef.current.x += (mouseRef.current.targetX - mouseRef.current.x) * 0.05;
      mouseRef.current.y += (mouseRef.current.targetY - mouseRef.current.y) * 0.05;
      scrollRef.current.velocity += (scrollRef.current.targetVelocity - scrollRef.current.velocity) * 0.08;
      scrollRef.current.targetVelocity *= 0.95;
      scrollRef.current.section += (scrollRef.current.targetSection - scrollRef.current.section) * 0.04;

      // Idle 3D orbit - continuous gentle rotation around the star field
      const orbitSpeed = 0.08; // Base orbit speed
      const orbitX = Math.sin(time * orbitSpeed) * 0.15 + Math.sin(time * orbitSpeed * 1.7) * 0.05;
      const orbitY = Math.cos(time * orbitSpeed * 0.8) * 0.12 + Math.cos(time * orbitSpeed * 1.3) * 0.06;

      // Camera rotation based on mouse + idle orbit
      cameraRef.current.targetRotX = (mouseRef.current.y - 0.5) * 0.3 + orbitX;
      cameraRef.current.targetRotY = (mouseRef.current.x - 0.5) * 0.4 + orbitY;
      cameraRef.current.rotX += (cameraRef.current.targetRotX - cameraRef.current.rotX) * 0.025;
      cameraRef.current.rotY += (cameraRef.current.targetRotY - cameraRef.current.rotY) * 0.025;

      const scrollVelocity = scrollRef.current.velocity;
      const currentSection = scrollRef.current.section;

      // Interpolate section colors
      const sectionIndex = Math.floor(currentSection);
      const sectionProgress = currentSection - sectionIndex;
      const color1 = sectionColors[Math.min(sectionIndex, sectionColors.length - 1)];
      const color2 = sectionColors[Math.min(sectionIndex + 1, sectionColors.length - 1)];

      const nebulaR = color1.r + (color2.r - color1.r) * sectionProgress;
      const nebulaG = color1.g + (color2.g - color1.g) * sectionProgress;
      const nebulaB = color1.b + (color2.b - color1.b) * sectionProgress;

      // Clear with dark background
      ctx.fillStyle = '#08080a';
      ctx.fillRect(0, 0, width, height);

      // Draw nebula gradients
      const nebulaOpacity = 0.2 + Math.sin(time * 0.2) * 0.04;

      // Primary nebula - top right
      const grad1 = ctx.createRadialGradient(
        width * 0.75, height * 0.25, 0,
        width * 0.75, height * 0.25, width * 0.8
      );
      grad1.addColorStop(0, `rgba(${nebulaR}, ${nebulaG}, ${nebulaB}, ${nebulaOpacity})`);
      grad1.addColorStop(0.3, `rgba(${nebulaR}, ${nebulaG}, ${nebulaB}, ${nebulaOpacity * 0.5})`);
      grad1.addColorStop(0.6, `rgba(${nebulaR}, ${nebulaG}, ${nebulaB}, ${nebulaOpacity * 0.15})`);
      grad1.addColorStop(1, 'transparent');
      ctx.fillStyle = grad1;
      ctx.fillRect(0, 0, width, height);

      // Secondary nebula - bottom left
      const grad2 = ctx.createRadialGradient(
        width * 0.2, height * 0.8, 0,
        width * 0.2, height * 0.8, width * 0.6
      );
      grad2.addColorStop(0, `rgba(${nebulaR * 0.7}, ${nebulaG * 0.8}, ${nebulaB}, ${nebulaOpacity * 0.6})`);
      grad2.addColorStop(0.4, `rgba(${nebulaR * 0.5}, ${nebulaG * 0.6}, ${nebulaB * 0.9}, ${nebulaOpacity * 0.2})`);
      grad2.addColorStop(1, 'transparent');
      ctx.fillStyle = grad2;
      ctx.fillRect(0, 0, width, height);

      // Camera rotation matrix components
      const cosX = Math.cos(cameraRef.current.rotX);
      const sinX = Math.sin(cameraRef.current.rotX);
      const cosY = Math.cos(cameraRef.current.rotY);
      const sinY = Math.sin(cameraRef.current.rotY);

      // Movement based on scroll - different for each section transition
      const scrollY = scrollRef.current.y;
      const isFirstSection = scrollY < height; // Hero → Numbers

      // Hero→Numbers: reversed zoom OUT
      // Everything else: normal zoom IN
      const forwardSpeed = isFirstSection ? -scrollVelocity * 8 : scrollVelocity * 8;

      // Sort stars by Z for proper rendering (far to near)
      const sortedStars = [...starsRef.current].sort((a, b) => b.z - a.z);

      // Draw stars with 3D projection
      sortedStars.forEach((star) => {
        // Move stars toward camera when scrolling
        star.z -= forwardSpeed;

        // Reset stars that pass the camera
        if (star.z < 1) {
          star.z = starFieldDepth;
          star.x = (Math.random() - 0.5) * width * 3;
          star.y = (Math.random() - 0.5) * height * 3;
        }
        if (star.z > starFieldDepth) {
          star.z = 1;
        }

        // Apply camera rotation
        let rotatedX = star.x * cosY - star.z * sinY;
        let rotatedZ = star.x * sinY + star.z * cosY;
        let rotatedY = star.y * cosX - rotatedZ * sinX;
        rotatedZ = star.y * sinX + rotatedZ * cosX;

        // Project to 2D
        const projected = project(rotatedX, rotatedY, rotatedZ, width, height, fov);

        // Skip if behind camera or off screen
        if (rotatedZ < 1 || projected.x < -50 || projected.x > width + 50 || projected.y < -50 || projected.y > height + 50) {
          return;
        }

        // Size based on distance (closer = bigger)
        const size = star.size * projected.scale * 1.5;

        // Brightness based on distance and base brightness
        const distanceFade = Math.min(1, (starFieldDepth - rotatedZ) / starFieldDepth);
        const twinkle = 0.7 + Math.sin(time * 2 + star.x * 0.01) * 0.3;
        const alpha = star.brightness * distanceFade * twinkle;

        // Color tint based on section
        const tint = star.brightness > 0.7 ? 0.3 : 0.1;
        const r = Math.floor(255 - (255 - nebulaR) * tint);
        const g = Math.floor(255 - (255 - nebulaG) * tint);
        const b = Math.floor(255 - (255 - nebulaB) * tint);

        // Draw glow for bright/close stars
        if (size > 1.5 && alpha > 0.5) {
          const glowSize = size * 4;
          const glow = ctx.createRadialGradient(
            projected.x, projected.y, 0,
            projected.x, projected.y, glowSize
          );
          glow.addColorStop(0, `rgba(${r}, ${g}, ${b}, ${alpha * 0.3})`);
          glow.addColorStop(0.5, `rgba(${r}, ${g}, ${b}, ${alpha * 0.1})`);
          glow.addColorStop(1, 'transparent');
          ctx.fillStyle = glow;
          ctx.fillRect(projected.x - glowSize, projected.y - glowSize, glowSize * 2, glowSize * 2);
        }

        // Draw star
        ctx.beginPath();
        ctx.arc(projected.x, projected.y, Math.max(0.5, size), 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${alpha})`;
        ctx.fill();

        // Motion blur streaks when moving fast
        if (Math.abs(forwardSpeed) > 5 && size > 1) {
          const streakLength = Math.abs(forwardSpeed) * projected.scale * 0.5;
          const streakDir = forwardSpeed > 0 ? 1 : -1;

          const gradient = ctx.createLinearGradient(
            projected.x, projected.y,
            projected.x + (projected.x - width / 2) * streakDir * 0.1,
            projected.y + (projected.y - height / 2) * streakDir * 0.1
          );
          gradient.addColorStop(0, `rgba(${r}, ${g}, ${b}, ${alpha * 0.8})`);
          gradient.addColorStop(1, 'transparent');

          ctx.beginPath();
          ctx.moveTo(projected.x, projected.y);
          ctx.lineTo(
            projected.x + (projected.x - width / 2) * streakDir * streakLength * 0.01,
            projected.y + (projected.y - height / 2) * streakDir * streakLength * 0.01
          );
          ctx.strokeStyle = gradient;
          ctx.lineWidth = size * 0.8;
          ctx.lineCap = 'round';
          ctx.stroke();
        }
      });

      // Shooting stars - subtle random spawning
      const now = Date.now();

      // Spawn randomly (subtle and occasional)
      if (now > nextShootingStarRef.current && shootingStarsRef.current.length < 1) {
        shootingStarsRef.current.push(createShootingStar(width, height));
        nextShootingStarRef.current = now + 12000 + Math.random() * 18000;
      }

      shootingStarsRef.current = shootingStarsRef.current.filter((star) => {
        // Move
        star.x += star.vx;
        star.y += star.vy;
        star.life++;

        // Add to trail
        star.trail.unshift({ x: star.x, y: star.y, opacity: 1 });
        if (star.trail.length > 15) star.trail.pop();

        // Fade in/out
        const progress = star.life / star.maxLife;
        const opacity = progress < 0.15 ? progress / 0.15 : progress > 0.6 ? (1 - progress) / 0.4 : 1;

        if (opacity <= 0) return false;

        // Draw subtle trail
        if (star.trail.length > 2) {
          ctx.beginPath();
          ctx.moveTo(star.trail[0].x, star.trail[0].y);
          for (let i = 1; i < star.trail.length; i++) {
            ctx.lineTo(star.trail[i].x, star.trail[i].y);
          }

          const trailGrad = ctx.createLinearGradient(
            star.trail[0].x, star.trail[0].y,
            star.trail[star.trail.length - 1].x,
            star.trail[star.trail.length - 1].y
          );
          trailGrad.addColorStop(0, `rgba(255, 255, 255, ${opacity * 0.7})`);
          trailGrad.addColorStop(0.5, `rgba(255, 255, 255, ${opacity * 0.3})`);
          trailGrad.addColorStop(1, 'transparent');

          ctx.strokeStyle = trailGrad;
          ctx.lineWidth = star.size;
          ctx.lineCap = 'round';
          ctx.stroke();
        }

        // Small bright head
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.size * 0.8, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${opacity * 0.9})`;
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
  }, [project, createShootingStar]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 z-0"
      style={{ background: '#08080a' }}
    />
  );
}
