import { useRef, useMemo, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';

function Planet() {
  const groupRef = useRef<THREE.Group>(null);
  const planetRef = useRef<THREE.Mesh>(null);
  const atmosphereRef = useRef<THREE.Mesh>(null);
  const mouseRef = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current.x = (e.clientX / window.innerWidth) * 2 - 1;
      mouseRef.current.y = -(e.clientY / window.innerHeight) * 2 + 1;
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  useFrame((state) => {
    if (groupRef.current) {
      // Subtle rotation following mouse
      groupRef.current.rotation.y = mouseRef.current.x * 0.3 + state.clock.elapsedTime * 0.05;
      groupRef.current.rotation.x = mouseRef.current.y * 0.15;
    }
    if (planetRef.current) {
      planetRef.current.rotation.y = state.clock.elapsedTime * 0.08;
    }
    if (atmosphereRef.current) {
      const pulse = 1 + Math.sin(state.clock.elapsedTime * 0.5) * 0.02;
      atmosphereRef.current.scale.set(pulse, pulse, pulse);
    }
  });

  return (
    <group ref={groupRef} position={[0.5, 0, 0]}>
      {/* Main planet - wireframe sphere */}
      <mesh ref={planetRef}>
        <icosahedronGeometry args={[1.7, 2]} />
        <meshBasicMaterial color="#8b5cf6" wireframe transparent opacity={0.4} />
      </mesh>

      {/* Transparent inner core - glass effect */}
      <mesh>
        <sphereGeometry args={[1.6, 32, 32]} />
        <meshBasicMaterial color="#2a1a4a" transparent opacity={0.4} />
      </mesh>

      {/* Atmosphere glow */}
      <mesh ref={atmosphereRef}>
        <sphereGeometry args={[2.0, 32, 32]} />
        <meshBasicMaterial color="#6d45d9" transparent opacity={0.04} side={THREE.BackSide} />
      </mesh>

      {/* Outer atmosphere */}
      <mesh>
        <sphereGeometry args={[2.25, 32, 32]} />
        <meshBasicMaterial color="#8b5cf6" transparent opacity={0.02} side={THREE.BackSide} />
      </mesh>

      {/* Ring 1 */}
      <mesh rotation={[Math.PI / 2.2, 0, 0]}>
        <torusGeometry args={[2.1, 0.006, 16, 100]} />
        <meshBasicMaterial color="#a78bfa" transparent opacity={0.3} />
      </mesh>

      {/* Ring 2 */}
      <mesh rotation={[Math.PI / 2.4, 0.15, 0]}>
        <torusGeometry args={[2.35, 0.004, 16, 100]} />
        <meshBasicMaterial color="#8b5cf6" transparent opacity={0.15} />
      </mesh>
    </group>
  );
}

export default function HeroScene() {
  return (
    <div className="w-full h-[500px] lg:h-[650px]">
      <Canvas
        camera={{ position: [0, 0, 8], fov: 50 }}
        style={{ background: 'transparent' }}
        gl={{ antialias: true }}
      >
        <Planet />
      </Canvas>
    </div>
  );
}
