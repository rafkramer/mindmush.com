const APP_ICONS = [
  '/icons/debloat_ai_icon.png',
  '/icons/facekit_3d_icon.png',
  '/icons/obama_run_icon.png',
  '/icons/amanda_ai_icon.png',
  '/icons/dagame.png',
];

export default function IconOrbit() {
  const iconCount = 50;
  const orbitSize = 630;

  // Pre-calculate icon positions
  const icons = Array.from({ length: iconCount }).map((_, i) => {
    const angle = (i / iconCount) * 360;
    const radian = (angle * Math.PI) / 180;
    return {
      x: Math.cos(radian) * orbitSize,
      y: Math.sin(radian) * orbitSize,
      icon: APP_ICONS[i % APP_ICONS.length],
    };
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
        .orbit-container {
          animation: spin 100s linear infinite;
        }
      `}</style>
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ perspective: '1200px' }}
      >
        {/* Full viewport orbit with tilt */}
        <div
          className="absolute"
          style={{
            top: '40%',
            left: '50%',
            transform: 'translate(-50%, -50%) rotateX(60deg) rotateZ(0deg)',
            transformStyle: 'preserve-3d',
            width: '100vw',
            height: '100vh',
          }}
        >
          {/* Visible orbit ring */}
          <div
            className="absolute"
            style={{
              left: '50%',
              top: '50%',
              transform: 'translate(-50%, -50%)',
              width: orbitSize * 2,
              height: orbitSize * 2,
              borderRadius: '50%',
              border: '1px solid rgba(139, 92, 246, 0.15)',
              boxShadow: '0 0 30px rgba(139, 92, 246, 0.1), inset 0 0 30px rgba(139, 92, 246, 0.05)',
            }}
          />

          {/* Single rotating container for all icons */}
          <div
            className="absolute orbit-container"
            style={{
              left: '50%',
              top: '50%',
              width: orbitSize * 2,
              height: orbitSize * 2,
            }}
          >
            {icons.map((icon, i) => (
              <div
                key={i}
                className="absolute"
                style={{
                  left: '50%',
                  top: '50%',
                  transform: `translate(-50%, -50%) translate(${icon.x}px, ${icon.y}px)`,
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
    </>
  );
}
