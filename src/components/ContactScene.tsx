import { useRef, useMemo, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';

const PARTICLE_COUNT = 150;

function CosmicOrb() {
  const meshRef = useRef<THREE.Mesh>(null);
  const ringRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = state.clock.elapsedTime * 0.15;
      meshRef.current.rotation.z = Math.sin(state.clock.elapsedTime * 0.1) * 0.1;
    }
    if (ringRef.current) {
      ringRef.current.rotation.z = state.clock.elapsedTime * 0.1;
    }
  });

  return (
    <group>
      <mesh ref={meshRef}>
        <icosahedronGeometry args={[1, 1]} />
        <meshBasicMaterial color="#8b5cf6" wireframe transparent opacity={0.25} />
      </mesh>
      <mesh>
        <sphereGeometry args={[1.1, 32, 32]} />
        <meshBasicMaterial color="#6d45d9" transparent opacity={0.06} />
      </mesh>
      <group ref={ringRef}>
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[1.6, 0.008, 16, 64]} />
          <meshBasicMaterial color="#a78bfa" transparent opacity={0.2} />
        </mesh>
        <mesh rotation={[Math.PI / 2.5, 0.3, 0]}>
          <torusGeometry args={[1.9, 0.005, 16, 64]} />
          <meshBasicMaterial color="#8b5cf6" transparent opacity={0.12} />
        </mesh>
      </group>
    </group>
  );
}

function OrbitingDust() {
  const pointsRef = useRef<THREE.Points>(null);
  const mouseRef = useRef({ x: 0, y: 0 });
  const { viewport } = useThree();

  const { positions, velocities, angles, radii, speeds } = useMemo(() => {
    const positions = new Float32Array(PARTICLE_COUNT * 3);
    const velocities = new Float32Array(PARTICLE_COUNT * 3);
    const angles = new Float32Array(PARTICLE_COUNT);
    const radii = new Float32Array(PARTICLE_COUNT);
    const speeds = new Float32Array(PARTICLE_COUNT);

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const radius = 2 + Math.random() * 2;
      const angle = Math.random() * Math.PI * 2;

      angles[i] = angle;
      radii[i] = radius;
      speeds[i] = (0.2 + Math.random() * 0.2) * (Math.random() > 0.5 ? 1 : -1);

      const i3 = i * 3;
      positions[i3] = Math.cos(angle) * radius;
      positions[i3 + 1] = (Math.random() - 0.5) * 1.5;
      positions[i3 + 2] = Math.sin(angle) * radius;
    }

    return { positions, velocities, angles, radii, speeds };
  }, []);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current.x = (e.clientX / window.innerWidth) * 2 - 1;
      mouseRef.current.y = -(e.clientY / window.innerHeight) * 2 + 1;
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  useFrame((state) => {
    if (!pointsRef.current) return;

    const positionAttribute = pointsRef.current.geometry.attributes.position;
    const pos = positionAttribute.array as Float32Array;

    const mouseX = mouseRef.current.x * viewport.width * 0.4;
    const mouseY = mouseRef.current.y * viewport.height * 0.4;

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const i3 = i * 3;
      angles[i] += speeds[i] * 0.008;

      const targetX = Math.cos(angles[i]) * radii[i];
      const targetZ = Math.sin(angles[i]) * radii[i];

      const dx = pos[i3] - mouseX;
      const dy = pos[i3 + 1] - mouseY;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist < 2 && dist > 0) {
        const force = (2 - dist) / 2 * 0.15;
        velocities[i3] += (dx / dist) * force;
        velocities[i3 + 1] += (dy / dist) * force;
      }

      velocities[i3] += (targetX - pos[i3]) * 0.03;
      velocities[i3 + 2] += (targetZ - pos[i3 + 2]) * 0.03;

      velocities[i3] *= 0.94;
      velocities[i3 + 1] *= 0.94;
      velocities[i3 + 2] *= 0.94;

      pos[i3] += velocities[i3];
      pos[i3 + 1] += velocities[i3 + 1];
      pos[i3 + 2] += velocities[i3 + 2];
    }

    positionAttribute.needsUpdate = true;
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial size={0.03} color="#a78bfa" transparent opacity={0.7} sizeAttenuation />
    </points>
  );
}

export default function ContactScene() {
  return (
    <div className="w-full h-[400px]">
      <Canvas camera={{ position: [0, 0, 5], fov: 50 }} style={{ background: 'transparent' }}>
        <CosmicOrb />
        <OrbitingDust />
      </Canvas>
    </div>
  );
}
