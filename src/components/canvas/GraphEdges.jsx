import React, { useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';

/**
 * Computes a quadratic Bezier curve between two 3D points with an offset normal
 * so opposing directed edges (e.g. A->B and B->A) curve separately and never overlap.
 */
function createCurvedPath(p1, p2, offsetDirection = 1, curvature = 5.0) {
  const start = new THREE.Vector3(p1.x, p1.y, p1.z);
  const end = new THREE.Vector3(p2.x, p2.y, p2.z);

  const mid = new THREE.Vector3().addVectors(start, end).multiplyScalar(0.5);
  const diff = new THREE.Vector3().subVectors(end, start);
  const dist = diff.length();

  // If points are identical, avoid division by zero
  if (dist < 0.001) {
    return new THREE.QuadraticBezierCurve3(start, start, end);
  }

  // Calculate perpendicular vector for curve
  const up = new THREE.Vector3(0, 1, 0);
  let normal = new THREE.Vector3().crossVectors(diff.clone().normalize(), up);
  if (normal.lengthSq() < 0.001) {
    normal = new THREE.Vector3(1, 0, 0);
  } else {
    normal.normalize();
  }

  // Adjust midpoint with offset
  const actualCurvature = Math.min(curvature, dist * 0.25) * offsetDirection;
  mid.addScaledVector(normal, actualCurvature);
  // Add small Y lift for graceful 3D arc
  mid.y += Math.abs(actualCurvature) * 0.35;

  return new THREE.QuadraticBezierCurve3(start, mid, end);
}

/**
 * Single directed curved edge with animated flow particles and arrowhead cone.
 */
function DirectedEdge({
  edge,
  sourcePos,
  targetPos,
  sourceRadius = 3,
  targetRadius = 3,
  isHoveredSource,
  isHoveredTarget,
  hasActiveHover,
  offsetDirection = 1,
  colorOverride
}) {
  const particlesRef = useRef();

  // Determine edge styling based on hover state
  let edgeColor = '#475569'; // default subtle slate
  let edgeOpacity = 0.35;
  let particleColor = '#60a5fa'; // default flow particle
  let lineWidth = 1.5;

  if (hasActiveHover) {
    if (isHoveredSource) {
      // Outgoing link from hovered node: amber/orange flow
      edgeColor = '#f59e0b';
      particleColor = '#fbbf24';
      edgeOpacity = 0.95;
      lineWidth = 2.5;
    } else if (isHoveredTarget) {
      // Incoming link to hovered node: emerald green authority flow
      edgeColor = '#10b981';
      particleColor = '#34d399';
      edgeOpacity = 0.95;
      lineWidth = 2.5;
    } else {
      // Dim unrelated links
      edgeColor = '#1e293b';
      edgeOpacity = 0.08;
      particleColor = '#334155';
    }
  }

  // Build the curve geometry
  const curve = useMemo(() => {
    return createCurvedPath(sourcePos, targetPos, offsetDirection, 6.0);
  }, [sourcePos.x, sourcePos.y, sourcePos.z, targetPos.x, targetPos.y, targetPos.z, offsetDirection]);

  // Sample points for line
  const linePoints = useMemo(() => {
    return curve.getPoints(36);
  }, [curve]);

  const lineGeometry = useMemo(() => {
    return new THREE.BufferGeometry().setFromPoints(linePoints);
  }, [linePoints]);

  // Arrowhead positioning at edge of target node
  const { arrowPos, arrowRot } = useMemo(() => {
    const totalLength = curve.getLength();
    const t = Math.max(0.1, Math.min(0.95, (totalLength - targetRadius - 1.2) / totalLength));
    const point = curve.getPoint(t);
    const tangent = curve.getTangent(t).normalize();

    const quat = new THREE.Quaternion();
    quat.setFromUnitVectors(new THREE.Vector3(0, 1, 0), tangent);
    const euler = new THREE.Euler().setFromQuaternion(quat);

    return { arrowPos: [point.x, point.y, point.z], arrowRot: [euler.x, euler.y, euler.z] };
  }, [curve, targetRadius]);

  // Animated flow particles (3 particles traveling along curve)
  const particleCount = 3;
  const particleMeshRefs = useRef([]);

  useFrame((state, delta) => {
    const time = state.clock.getElapsedTime();
    // Speed increases when hovered
    const speed = hasActiveHover && (isHoveredSource || isHoveredTarget) ? 0.45 : 0.25;

    for (let i = 0; i < particleCount; i++) {
      const mesh = particleMeshRefs.current[i];
      if (mesh) {
        const offset = i / particleCount;
        const t = (time * speed + offset) % 1.0;
        const p = curve.getPoint(t);
        mesh.position.set(p.x, p.y, p.z);
        // Fade in and out at ends
        const scale = Math.sin(t * Math.PI) * (hasActiveHover && (isHoveredSource || isHoveredTarget) ? 1.3 : 0.85);
        mesh.scale.setScalar(Math.max(0.1, scale));
      }
    }
  });

  return (
    <group>
      {/* Curved Edge Line */}
      <line geometry={lineGeometry}>
        <lineBasicMaterial
          color={edgeColor}
          transparent={true}
          opacity={edgeOpacity}
          linewidth={lineWidth}
        />
      </line>

      {/* Directed Arrowhead Cone */}
      <mesh position={arrowPos} rotation={arrowRot}>
        <coneGeometry args={[0.7, 1.8, 12]} />
        <meshStandardMaterial
          color={edgeColor}
          emissive={edgeColor}
          emissiveIntensity={hasActiveHover && (isHoveredSource || isHoveredTarget) ? 0.8 : 0.3}
          transparent={true}
          opacity={edgeOpacity}
          roughness={0.3}
        />
      </mesh>

      {/* Animated Flow Particles */}
      {(!hasActiveHover || isHoveredSource || isHoveredTarget) && (
        <group>
          {Array.from({ length: particleCount }).map((_, i) => (
            <mesh
              key={i}
              ref={el => (particleMeshRefs.current[i] = el)}
            >
              <sphereGeometry args={[0.42, 10, 10]} />
              <meshBasicMaterial
                color={particleColor}
                transparent={true}
                opacity={hasActiveHover ? 0.95 : 0.75}
              />
            </mesh>
          ))}
        </group>
      )}
    </group>
  );
}

export function GraphEdges({
  links,
  nodePositions,
  nodeRadii,
  hoveredNodeId,
  selectedNodeId
}) {
  const activeNodeId = hoveredNodeId || selectedNodeId;

  // Determine paired links to offset bidirectional edges cleanly
  const edgePairMap = useMemo(() => {
    const pairMap = new Map();
    links.forEach(l => {
      const key1 = `${l.source}->${l.target}`;
      const key2 = `${l.target}->${l.source}`;
      pairMap.set(key1, pairMap.has(key2) ? -1 : 1);
    });
    return pairMap;
  }, [links]);

  return (
    <group name="graph-edges">
      {links.map(link => {
        const srcPos = nodePositions.get(Number(link.source));
        const tgtPos = nodePositions.get(Number(link.target));
        if (!srcPos || !tgtPos) return null;

        const srcId = Number(link.source);
        const tgtId = Number(link.target);
        const isHoveredSource = activeNodeId !== null && srcId === activeNodeId;
        const isHoveredTarget = activeNodeId !== null && tgtId === activeNodeId;
        const offsetDir = edgePairMap.get(`${srcId}->${tgtId}`) || 1;

        const srcRadius = nodeRadii.get(srcId) || 3;
        const tgtRadius = nodeRadii.get(tgtId) || 3;

        return (
          <DirectedEdge
            key={link.id || `${srcId}-${tgtId}`}
            edge={link}
            sourcePos={srcPos}
            targetPos={tgtPos}
            sourceRadius={srcRadius}
            targetRadius={tgtRadius}
            isHoveredSource={isHoveredSource}
            isHoveredTarget={isHoveredTarget}
            hasActiveHover={activeNodeId !== null}
            offsetDirection={offsetDir}
          />
        );
      })}
    </group>
  );
}

