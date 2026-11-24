import React, { useRef, useMemo } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';

/**
 * Single 3D Graph Node with glowing materials, rank aura, and HTML info label.
 */
function SingleNode({
  page,
  position,
  radius,
  rank,
  score,
  percentage,
  inDegree,
  outDegree,
  isTop,
  isBottom,
  isZeroIn,
  isHovered,
  isSelected,
  onPointerOver,
  onPointerOut,
  onClick
}) {
  const meshRef = useRef();
  const auraRef = useRef();
  const haloRingRef = useRef();

  // Color selection:
  // Top node = Green (#22c55e)
  // Zero in-degree / Bottom = Red (#ef4444)
  // Others = custom or based on rank
  const nodeColor = useMemo(() => {
    if (isTop) return '#22c55e'; // Green highlight for #1 best-pizza-pune.com
    if (isZeroIn || isBottom) return '#ef4444'; // Red highlight for zero incoming / bottom
    return page.colorHint || '#38bdf8';
  }, [isTop, isZeroIn, isBottom, page.colorHint]);

  // Subtle breathing / pulsing animation
  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    if (auraRef.current) {
      const pulseSpeed = isTop ? 3.0 : (isZeroIn ? 4.0 : 1.5);
      const scale = 1.0 + Math.sin(time * pulseSpeed) * (isTop ? 0.12 : 0.08);
      auraRef.current.scale.setScalar(scale);
    }
    if (haloRingRef.current) {
      haloRingRef.current.rotation.z = time * 0.5;
      haloRingRef.current.rotation.x = Math.PI / 2 + Math.sin(time * 0.8) * 0.15;
    }
  });

  return (
    <group position={[position.x, position.y, position.z]}>
      {/* Outer Glow Aura Sphere */}
      <mesh ref={auraRef}>
        <sphereGeometry args={[radius * 1.35, 24, 24]} />
        <meshBasicMaterial
          color={nodeColor}
          transparent={true}
          opacity={isHovered ? 0.35 : (isTop ? 0.22 : (isZeroIn ? 0.25 : 0.12))}
          blending={THREE.AdditiveBlending}
        />
      </mesh>

      {/* Orbiting Halo Ring for Top-Ranked Node */}
      {isTop && (
        <mesh ref={haloRingRef}>
          <ringGeometry args={[radius * 1.5, radius * 1.7, 32]} />
          <meshBasicMaterial
            color="#4ade80"
            side={THREE.DoubleSide}
            transparent={true}
            opacity={0.45}
            blending={THREE.AdditiveBlending}
          />
        </mesh>
      )}

      {/* Warning Ring for Zero-in Node */}
      {isZeroIn && (
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <ringGeometry args={[radius * 1.45, radius * 1.6, 32]} />
          <meshBasicMaterial
            color="#f87171"
            side={THREE.DoubleSide}
            transparent={true}
            opacity={0.5}
            blending={THREE.AdditiveBlending}
          />
        </mesh>
      )}

      {/* Main Core Sphere */}
      <mesh
        ref={meshRef}
        onPointerOver={(e) => {
          e.stopPropagation();
          onPointerOver(page.id);
        }}
        onPointerOut={(e) => {
          e.stopPropagation();
          onPointerOut(page.id);
        }}
        onClick={(e) => {
          e.stopPropagation();
          onClick(page.id);
        }}
        cursor="pointer"
      >
        <sphereGeometry args={[radius, 32, 32]} />
        <meshStandardMaterial
          color={nodeColor}
          emissive={nodeColor}
          emissiveIntensity={isHovered ? 0.9 : (isTop ? 0.7 : (isZeroIn ? 0.75 : 0.4))}
          roughness={0.25}
          metalness={0.2}
        />
      </mesh>

      {/* 3D Floating Label */}
      <Html
        position={[0, radius + 1.8, 0]}
        center
        distanceFactor={45}
        zIndexRange={[100, 0]}
        style={{ pointerEvents: 'none', transition: 'all 0.2s ease-out' }}
      >
        <div
          className={`flex flex-col items-center select-none cursor-pointer transition-all duration-200 ${
            isHovered ? 'scale-110 z-50' : 'scale-100'
          }`}
          style={{ pointerEvents: 'auto' }}
          onClick={(e) => {
            e.stopPropagation();
            onClick(page.id);
          }}
          onMouseEnter={() => onPointerOver(page.id)}
          onMouseLeave={() => onPointerOut(page.id)}
        >
          {/* Rank Badge & Domain pill */}
          <div
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold backdrop-blur-md shadow-lg border transition-all duration-200 ${
              isTop
                ? 'bg-emerald-950/80 text-emerald-300 border-emerald-500/50 shadow-emerald-900/40 ring-2 ring-emerald-500/40'
                : isZeroIn
                ? 'bg-red-950/80 text-red-300 border-red-500/50 shadow-red-900/40 ring-1 ring-red-500/40'
                : 'bg-slate-900/85 text-slate-200 border-slate-700/60 shadow-black/50'
            }`}
          >
            <span
              className={`w-5 h-5 rounded-full flex items-center justify-center text-[11px] font-bold ${
                isTop
                  ? 'bg-emerald-500 text-slate-950'
                  : isZeroIn
                  ? 'bg-red-500 text-white'
                  : rank === 2
                  ? 'bg-slate-300 text-slate-900'
                  : rank === 3
                  ? 'bg-amber-600 text-white'
                  : 'bg-slate-700 text-slate-200'
              }`}
            >
              #{rank}
            </span>
            <span className="font-mono tracking-tight text-[11px]">
              {page.domain}
            </span>
          </div>

          {/* Subtitle pill: PageRank % and Links count */}
          <div className="mt-1 flex items-center gap-1.5 text-[10px] px-2 py-0.5 rounded-md bg-slate-950/70 text-slate-300 border border-slate-800 backdrop-blur-sm">
            <span className="font-bold text-sky-400">{percentage}% PR</span>
            <span className="text-slate-500">•</span>
            <span title="Incoming links">📥 {inDegree} in</span>
            <span className="text-slate-500">•</span>
            <span title="Outgoing links">📤 {outDegree} out</span>
          </div>
        </div>
      </Html>
    </group>
  );
}

export function GraphNodes({
  pages,
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
  onSelectNode
}) {
  const rankingMap = useMemo(() => {
    const map = new Map();
    rankings.forEach(r => map.set(r.id, r));
    return map;
  }, [rankings]);

  return (
    <group name="graph-nodes">
      {pages.map(page => {
        const pos = nodePositions.get(page.id);
        if (!pos) return null;

        const radius = nodeRadii.get(page.id) || 3.0;
        const rankInfo = rankingMap.get(page.id) || {
          rank: '-',
          score: 0,
          percentage: '0.00'
        };

        const inDeg = inDegrees[page.id] ?? 0;
        const outDeg = outDegrees[page.id] ?? 0;
        const isTop = page.id === topPageId;
        const isBottom = page.id === bottomPageId;
        const isZeroIn = inDeg === 0;
        const isHovered = hoveredNodeId === page.id;
        const isSelected = selectedNodeId === page.id;

        return (
          <SingleNode
            key={page.id}
            page={page}
            position={pos}
            radius={radius}
            rank={rankInfo.rank}
            score={rankInfo.score}
            percentage={rankInfo.percentage}
            inDegree={inDeg}
            outDegree={outDeg}
            isTop={isTop}
            isBottom={isBottom}
            isZeroIn={isZeroIn}
            isHovered={isHovered}
            isSelected={isSelected}
            onPointerOver={onHoverNode}
            onPointerOut={() => onHoverNode(null)}
            onClick={onSelectNode}
          />
        );
      })}
    </group>
  );
}

