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
    <group ref={groupRef}>
      {/* Main planet - wireframe sphere */}
      <mesh ref={planetRef}>
        <icosahedronGeometry args={[2, 2]} />
        <meshBasicMaterial color="#8b5cf6" wireframe transparent opacity={0.4} />
      </mesh>

      {/* Solid inner core */}
      <mesh>
        <sphereGeometry args={[1.9, 32, 32]} />
        <meshBasicMaterial color="#1a1a2e" transparent opacity={0.9} />
      </mesh>

      {/* Atmosphere glow */}
      <mesh ref={atmosphereRef}>
        <sphereGeometry args={[2.3, 32, 32]} />
        <meshBasicMaterial color="#6d45d9" transparent opacity={0.04} side={THREE.BackSide} />
      </mesh>

      {/* Outer atmosphere */}
      <mesh>
        <sphereGeometry args={[2.6, 32, 32]} />
        <meshBasicMaterial color="#8b5cf6" transparent opacity={0.02} side={THREE.BackSide} />
      </mesh>

      {/* Ring 1 */}
      <mesh rotation={[Math.PI / 2.2, 0, 0]}>
        <torusGeometry args={[2.6, 0.008, 16, 100]} />
        <meshBasicMaterial color="#a78bfa" transparent opacity={0.3} />
      </mesh>

      {/* Ring 2 */}
      <mesh rotation={[Math.PI / 2.4, 0.15, 0]}>
        <torusGeometry args={[3.0, 0.005, 16, 100]} />
        <meshBasicMaterial color="#8b5cf6" transparent opacity={0.15} />
      </mesh>
    </group>
  );
}

function OrbitingMoons() {
  const groupRef = useRef<THREE.Group>(null);

  const moons = useMemo(() => {
    return [
      { radius: 3.2, speed: 0.3, size: 0.08, offset: 0 },
      { radius: 3.5, speed: -0.2, size: 0.06, offset: Math.PI },
      { radius: 3.8, speed: 0.15, size: 0.05, offset: Math.PI / 2 },
    ];
  }, []);

  useFrame((state) => {
    if (!groupRef.current) return;
    groupRef.current.children.forEach((child, i) => {
      const moon = moons[i];
      const angle = state.clock.elapsedTime * moon.speed + moon.offset;
      child.position.x = Math.cos(angle) * moon.radius;
      child.position.z = Math.sin(angle) * moon.radius;
      child.position.y = Math.sin(angle * 2) * 0.3;
    });
  });

  return (
    <group ref={groupRef}>
      {moons.map((moon, i) => (
        <mesh key={i}>
          <sphereGeometry args={[moon.size, 16, 16]} />
          <meshBasicMaterial color="#ffffff" transparent opacity={0.8} />
        </mesh>
      ))}
    </group>
  );
}

function FloatingDust() {
  const pointsRef = useRef<THREE.Points>(null);

  const positions = useMemo(() => {
    const pos = new Float32Array(60 * 3);
    for (let i = 0; i < 60; i++) {
      const i3 = i * 3;
      const radius = 3 + Math.random() * 3;
      const theta = Math.random() * Math.PI * 2;
      const phi = (Math.random() - 0.5) * Math.PI * 0.5;
      pos[i3] = radius * Math.cos(phi) * Math.cos(theta);
      pos[i3 + 1] = radius * Math.sin(phi);
      pos[i3 + 2] = radius * Math.cos(phi) * Math.sin(theta);
    }
    return pos;
  }, []);

  useFrame((state) => {
    if (pointsRef.current) {
      pointsRef.current.rotation.y = state.clock.elapsedTime * 0.02;
    }
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" count={60} array={positions} itemSize={3} />
      </bufferGeometry>
      <pointsMaterial size={0.03} color="#a78bfa" transparent opacity={0.5} sizeAttenuation />
    </points>
  );
}

export default function HeroScene() {
  return (
    <div className="w-full h-[500px] lg:h-[650px]">
      <Canvas camera={{ position: [0, 0, 8], fov: 50 }} style={{ background: 'transparent' }}>
        <Planet />
      </Canvas>
    </div>
  );
}
