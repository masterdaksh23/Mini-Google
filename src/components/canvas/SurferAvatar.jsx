import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';

/**
 * 3D Avatar representing the Random Surfer traveling through the web graph.
 */
export function SurferAvatar({
  currentPageId,
  nodePositions,
  lastAction
}) {
  const groupRef = useRef();
  const currentPos = useRef(new THREE.Vector3(0, 0, 0));
  const targetPos = useRef(new THREE.Vector3(0, 0, 0));
  const isTeleporting = useRef(false);

  useEffect(() => {
    if (currentPageId && nodePositions.has(currentPageId)) {
      const pos = nodePositions.get(currentPageId);
      targetPos.current.set(pos.x, pos.y + 4.0, pos.z);
      if (lastAction?.type === 'start') {
        currentPos.current.copy(targetPos.current);
      }
      isTeleporting.current = lastAction?.teleport || false;
    }
  }, [currentPageId, nodePositions, lastAction]);

  useFrame((state, delta) => {
    if (!groupRef.current) return;

    // Smoothly interpolate towards target node position
    const lerpSpeed = isTeleporting.current ? 4.0 : 6.0;
    currentPos.current.lerp(targetPos.current, Math.min(1.0, delta * lerpSpeed));
    groupRef.current.position.copy(currentPos.current);

    // Subtle bobbing motion
    const t = state.clock.getElapsedTime();
    groupRef.current.position.y += Math.sin(t * 5.0) * 0.4;
    groupRef.current.rotation.y = t * 2.0;
  });

  if (!currentPageId || !nodePositions.has(currentPageId)) return null;

  return (
    <group ref={groupRef}>
      {/* Outer Golden Glow */}
      <mesh>
        <sphereGeometry args={[1.2, 16, 16]} />
        <meshBasicMaterial
          color="#fbbf24"
          transparent={true}
          opacity={0.35}
          blending={THREE.AdditiveBlending}
        />
      </mesh>

      {/* Surfer Core Orb */}
      <mesh>
        <sphereGeometry args={[0.7, 16, 16]} />
        <meshStandardMaterial
          color="#f59e0b"
          emissive="#fbbf24"
          emissiveIntensity={1.2}
          roughness={0.1}
          metalness={0.8}
        />
      </mesh>

      {/* Surfer Rings */}
      <mesh rotation={[Math.PI / 3, 0, 0]}>
        <torusGeometry args={[1.3, 0.08, 8, 24]} />
        <meshBasicMaterial color="#fef08a" />
      </mesh>

      {/* Point light to illuminate current page */}
      <pointLight color="#fbbf24" intensity={2.5} distance={15} />

      {/* Label above surfer */}
      <Html position={[0, 2.0, 0]} center distanceFactor={40} style={{ pointerEvents: 'none' }}>
        <div className="bg-amber-500/90 text-slate-950 text-[10px] font-extrabold px-2 py-0.5 rounded-full shadow-lg border border-amber-300 flex items-center gap-1 whitespace-nowrap animate-bounce">
          <span>🎲</span>
          <span>Surfer Here</span>
        </div>
      </Html>
    </group>
  );
}

