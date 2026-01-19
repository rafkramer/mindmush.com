import { useScroll } from 'framer-motion';
import { useEffect, useState, useRef } from 'react';

// ===== TWEAK THESE VALUES =====
const HERO_ARC_PEAK_PX = 210;        // Arc peak position from top on hero (px)
const SCROLLED_TOP_PERCENT = 45;     // Orbit center position on 10M page (% of viewport)
const SCROLLED_RADIUS = 550;         // Orbit radius on 10M page (px) - smaller = more space on sides
const SIDE_PADDING = 80;             // Minimum padding from screen edges (px)
// ==============================

const APP_ICONS = [
  // Main app icons
  '/icons/debloat_ai_icon.png',
  '/icons/facekit_3d_icon.png',
  '/icons/obama_run_icon.png',
  '/icons/amanda_ai_icon.png',
  '/icons/dagame.png',
  '/icons/Game_image.webp',
  // Temp icons to fill orbit
  '/icons/app-icons  temp/instagram.png',
  '/icons/app-icons  temp/tiktok.png',
  '/icons/app-icons  temp/spotify.png',
  '/icons/app-icons  temp/netflix.png',
  '/icons/app-icons  temp/discord.png',
  '/icons/app-icons  temp/snapchat.png',
  '/icons/app-icons  temp/youtube.png',
  '/icons/app-icons  temp/twitch.png',
  '/icons/app-icons  temp/reddit.png',
  '/icons/app-icons  temp/x.png',
  '/icons/app-icons  temp/whatsapp.png',
  '/icons/app-icons  temp/telegram.png',
  '/icons/app-icons  temp/uber.png',
  '/icons/app-icons  temp/airbnb.png',
  '/icons/app-icons  temp/venmo.png',
  '/icons/app-icons  temp/shazam.png',
  '/icons/app-icons  temp/notion.png',
  '/icons/app-icons  temp/doordash.png',
  '/icons/app-icons  temp/lyft.png',
  '/icons/app-icons  temp/pinterest.png',
];

export default function ScrollIconOrbit() {
  const { scrollY } = useScroll();
  const [windowHeight, setWindowHeight] = useState(800);
  const [windowWidth, setWindowWidth] = useState(1200);
  const [animatedValues, setAnimatedValues] = useState({
    size: 1200,
    top: 145,
    rotateX: 0,
    opacity: 1,
    scale: 1,
  });
  const animationRef = useRef<number>();

  useEffect(() => {
    const updateDimensions = () => {
      const h = window.innerHeight;
      const w = window.innerWidth;
      setWindowHeight(h);
      setWindowWidth(w);
      // Set initial top based on viewport - arc peak position
      const initialTop = ((HERO_ARC_PEAK_PX + 1200) / h) * 100;
      setAnimatedValues(prev => ({ ...prev, top: initialTop }));
    };
    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, []);

  // Smooth animation using lerp
  useEffect(() => {
    const unsubscribe = scrollY.on('change', (scrollValue) => {
      const progress = Math.min(Math.max(scrollValue / windowHeight, 0), 1);

      // Calculate max radius that fits screen with padding
      const maxRadiusForScreen = (windowWidth / 2) - SIDE_PADDING;
      const finalSize = Math.min(SCROLLED_RADIUS, maxRadiusForScreen);

      // Arc peak position on hero, orbit center on 10M page
      const initialTopPercent = ((HERO_ARC_PEAK_PX + 1200) / windowHeight) * 100;

      // For scrolled state (10M page), center vertically
      const targetSize = 1200 - (1200 - finalSize) * progress;
      const targetTop = initialTopPercent - (initialTopPercent - SCROLLED_TOP_PERCENT) * progress;
      const targetRotateX = 60 * progress;

      // Start fading right after numbers, complete before showcase
      const fadeProgress = Math.min(Math.max((scrollValue - windowHeight) / (windowHeight * 0.5), 0), 1);
      // Smooth ease-in-out curve
      const easedFade = fadeProgress < 0.5
        ? 2 * fadeProgress * fadeProgress
        : 1 - Math.pow(-2 * fadeProgress + 2, 2) / 2;
      const targetOpacity = 1 - easedFade;
      // Subtle zoom as it fades (scale 1 → 1.4)
      const targetScale = 1 + easedFade * 0.4;

      const lerp = (start: number, end: number, factor: number) => start + (end - start) * factor;
      const lerpFactor = 0.08;

      const animate = () => {
        setAnimatedValues((prev) => {
          const newSize = lerp(prev.size, targetSize, lerpFactor);
          const newTop = lerp(prev.top, targetTop, lerpFactor);
          const newRotateX = lerp(prev.rotateX, targetRotateX, lerpFactor);
          const newOpacity = lerp(prev.opacity, targetOpacity, lerpFactor);
          const newScale = lerp(prev.scale, targetScale, lerpFactor);

          const sizeDiff = Math.abs(newSize - targetSize);
          const topDiff = Math.abs(newTop - targetTop);
          const rotateDiff = Math.abs(newRotateX - targetRotateX);

          if (sizeDiff < 0.5 && topDiff < 0.1 && rotateDiff < 0.1) {
            return { size: targetSize, top: targetTop, rotateX: targetRotateX, opacity: targetOpacity, scale: targetScale };
          }

          animationRef.current = requestAnimationFrame(animate);
          return { size: newSize, top: newTop, rotateX: newRotateX, opacity: newOpacity, scale: newScale };
        });
      };

      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      animationRef.current = requestAnimationFrame(animate);
    });

    return () => {
      unsubscribe();
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [scrollY, windowHeight, windowWidth]);

  const { size, top, rotateX, opacity, scale } = animatedValues;

  // Icons
  const iconCount = 50;
  const icons = Array.from({ length: iconCount }).map((_, i) => {
    const angle = (i / iconCount) * 360;
    const radian = (angle * Math.PI) / 180;
    return { radian, icon: APP_ICONS[i % APP_ICONS.length] };
  });

  return (
    <>
      <style>{`
        @keyframes spin {
          from { transform: translate(-50%, -50%) rotate(0deg); }
          to { transform: translate(-50%, -50%) rotate(-360deg); }
        }
        @keyframes counterSpin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .orbit-container { animation: spin 100s linear infinite; }
      `}</style>
      <div
        className="hidden lg:block fixed inset-0 pointer-events-none z-0"
        style={{ opacity }}
      >
        <div className="absolute inset-0" style={{ perspective: '1200px' }}>
          <div
            className="absolute"
            style={{
              top: `${top}%`,
              left: '50%',
              transform: `translate(-50%, -50%) rotateX(${rotateX}deg) scale(${scale})`,
              transformStyle: 'preserve-3d',
            }}
          >
            {/* Ring */}
            <div
              className="absolute"
              style={{
                left: '50%',
                top: '50%',
                transform: 'translate(-50%, -50%)',
                width: size * 2,
                height: size * 2,
                borderRadius: '50%',
                border: '1px solid rgba(139, 92, 246, 0.15)',
                boxShadow: '0 0 30px rgba(139, 92, 246, 0.1), inset 0 0 30px rgba(139, 92, 246, 0.05)',
              }}
            />

            {/* Icons container */}
            <div
              className="absolute orbit-container"
              style={{
                left: '50%',
                top: '50%',
                width: size * 2,
                height: size * 2,
              }}
            >
              {icons.map((icon, i) => (
                <div
                  key={i}
                  className="absolute"
                  style={{
                    left: '50%',
                    top: '50%',
                    transform: `translate(-50%, -50%) translate(${Math.cos(icon.radian) * size}px, ${Math.sin(icon.radian) * size}px)`,
                  }}
                >
                  <img
                    src={icon.icon}
                    alt=""
                    className="w-[30px] h-[30px] rounded-lg"
                    style={{
                      animation: 'counterSpin 100s linear infinite',
                      boxShadow: '0 8px 20px rgba(139, 92, 246, 0.2), 0 4px 12px rgba(0, 0, 0, 0.3)',
                      border: '1px solid rgba(255,255,255,0.1)',
                    }}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
