import React, { useRef, useEffect, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Stars } from '@react-three/drei';
import * as THREE from 'three';
import { GraphNodes } from './GraphNodes';
import { GraphEdges } from './GraphEdges';
import { SurferAvatar } from './SurferAvatar';

/**
 * Animated background dust grid to give depth perception in 3D space.
 */
function SpaceBackground() {
  const pointsRef = useRef();
  const count = 350;

  const [positions, colors] = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const col = new Float32Array(count * 3);
    const colorChoices = [
      new THREE.Color('#38bdf8'),
      new THREE.Color('#818cf8'),
      new THREE.Color('#34d399'),
      new THREE.Color('#64748b')
    ];

    for (let i = 0; i < count; i++) {
      const radius = 60 + Math.random() * 80;
      const theta = Math.random() * Math.PI * 2;
      const phi = (Math.random() - 0.5) * Math.PI;

      pos[i * 3] = radius * Math.cos(theta) * Math.cos(phi);
      pos[i * 3 + 1] = radius * Math.sin(phi);
      pos[i * 3 + 2] = radius * Math.sin(theta) * Math.cos(phi);

      const c = colorChoices[Math.floor(Math.random() * colorChoices.length)];
      col[i * 3] = c.r;
      col[i * 3 + 1] = c.g;
      col[i * 3 + 2] = c.b;
    }
    return [pos, col];
  }, []);

  useFrame((state) => {
    if (pointsRef.current) {
      pointsRef.current.rotation.y = state.clock.getElapsedTime() * 0.015;
    }
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={count}
          array={positions}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-color"
          count={count}
          array={colors}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={1.2}
        vertexColors
        transparent
        opacity={0.4}
        sizeAttenuation
      />
    </points>
  );
}

/**
 * Controller inside Canvas to support camera reset / focus commands.
 */
function CameraController({ resetTrigger, controlsRef }) {
  useEffect(() => {
    if (resetTrigger > 0 && controlsRef.current) {
      controlsRef.current.reset();
      controlsRef.current.target.set(0, 0, 0);
    }
  }, [resetTrigger, controlsRef]);

  return null;
}

export function GraphScene({
  pages,
  links,
  nodePositions,
  nodeRadii,
  rankings,
  inDegrees,
  outDegrees,
  topPageId,
  bottomPageId,
  zeroInDegreePages,
  hoveredNodeId,
  selectedNodeId,
  onHoverNode,
  onSelectNode,
  isAutoRotating,
  resetCameraTrigger,
  showSurfer,
  surferCurrentPageId,
  surferLastAction
}) {
  const controlsRef = useRef();

  return (
    <div className="absolute inset-0 w-full h-full bg-[#080b12] overflow-hidden">
      <Canvas
        camera={{ position: [0, 18, 68], fov: 48, near: 0.5, far: 500 }}
        gl={{ antialias: true, alpha: false, powerPreference: 'high-performance' }}
      >
        <color attach="background" args={['#080b12']} />
        <fog attach="fog" args={['#080b12', 45, 170]} />

        {/* Ambient & Directional Lights */}
        <ambientLight intensity={0.65} color="#e2e8f0" />
        <directionalLight position={[30, 45, 30]} intensity={1.2} color="#ffffff" />
        <directionalLight position={[-30, -30, -30]} intensity={0.4} color="#38bdf8" />
        <pointLight position={[0, 0, 0]} intensity={1.5} color="#4f46e5" distance={90} />

        {/* Subtle Stars & Floating Dust */}
        <Stars radius={120} depth={50} count={1200} factor={3} saturation={0.5} fade speed={0.8} />
        <SpaceBackground />

        {/* Graph Edges with Animated Flow Particles */}
        <GraphEdges
          links={links}
          nodePositions={nodePositions}
          nodeRadii={nodeRadii}
          hoveredNodeId={hoveredNodeId}
          selectedNodeId={selectedNodeId}
        />

        {/* Graph Nodes with Dynamic Sizing & 3D Badges */}
        <GraphNodes
          pages={pages}
          nodePositions={nodePositions}
          nodeRadii={nodeRadii}
          rankings={rankings}
          inDegrees={inDegrees}
          outDegrees={outDegrees}
          topPageId={topPageId}
          bottomPageId={bottomPageId}
          zeroInDegreePages={zeroInDegreePages}
          hoveredNodeId={hoveredNodeId}
          selectedNodeId={selectedNodeId}
          onHoverNode={onHoverNode}
          onSelectNode={onSelectNode}
        />

        {/* 3D Surfer Avatar for Random Surfer Mode */}
        {showSurfer && (
          <SurferAvatar
            currentPageId={surferCurrentPageId}
            nodePositions={nodePositions}
            lastAction={surferLastAction}
          />
        )}

        {/* Camera Orbit Controls */}
        <OrbitControls
          ref={controlsRef}
          enableDamping={true}
          dampingFactor={0.05}
          autoRotate={isAutoRotating}
          autoRotateSpeed={0.6}
          minDistance={12}
          maxDistance={140}
        />

        <CameraController
          resetTrigger={resetCameraTrigger}
          controlsRef={controlsRef}
        />
      </Canvas>
    </div>
  );
}

