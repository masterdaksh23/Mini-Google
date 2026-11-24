import {
  forceSimulation,
  forceManyBody,
  forceLink,
  forceCenter,
  forceCollide
} from 'd3-force-3d';

/**
 * Creates and manages a 3D force simulation for nodes and links.
 */
export function create3DForceLayout(pages, links, onTick) {
  // Create node data copies
  const nodeMap = new Map();
  const nodes = pages.map((p, idx) => {
    // Distribute initially in a 3D sphere/circle
    const angle = (idx / pages.length) * Math.PI * 2;
    const phi = ((idx % 3) - 1) * 0.6;
    const radius = 22;

    const node = {
      id: p.id,
      domain: p.domain,
      x: Math.cos(angle) * Math.cos(phi) * radius,
      y: Math.sin(phi) * radius,
      z: Math.sin(angle) * Math.cos(phi) * radius,
      vx: 0,
      vy: 0,
      vz: 0,
      radius: 3.5
    };
    nodeMap.set(p.id, node);
    return node;
  });

  // Convert links to d3 format (source and target can be IDs)
  const simLinks = links.map(l => ({
    id: l.id || `${l.source}-${l.target}`,
    source: Number(l.source),
    target: Number(l.target)
  }));

  const simulation = forceSimulation(nodes, 3) // 3 dimensions!
    .force('charge', forceManyBody().strength(-240).distanceMax(180))
    .force('link', forceLink(simLinks).id(d => d.id).distance(30).strength(0.6))
    .force('center', forceCenter(0, 0, 0).strength(0.35))
    .force('collide', forceCollide().radius(d => (d.radius || 3) + 3).iterations(2))
    .velocityDecay(0.3)
    .alphaDecay(0.02)
    .on('tick', () => {
      if (onTick) {
        onTick(nodes);
      }
    });

  return {
    simulation,
    nodes,
    nodeMap,
    stop: () => simulation.stop(),
    restart: () => {
      simulation.alpha(0.6).restart();
    },
    updateData: (newPages, newLinks) => {
      // Preserve existing positions if nodes exist
      const existingPos = new Map();
      nodes.forEach(n => {
        existingPos.set(n.id, { x: n.x, y: n.y, z: n.z, vx: n.vx, vy: n.vy, vz: n.vz });
      });

      const updatedNodes = newPages.map((p, idx) => {
        const prev = existingPos.get(p.id);
        if (prev) {
          return {
            id: p.id,
            domain: p.domain,
            x: prev.x,
            y: prev.y,
            z: prev.z,
            vx: prev.vx,
            vy: prev.vy,
            vz: prev.vz,
            radius: 3.5
          };
        }
        const angle = (idx / newPages.length) * Math.PI * 2;
        return {
          id: p.id,
          domain: p.domain,
          x: Math.cos(angle) * 20,
          y: (Math.random() - 0.5) * 15,
          z: Math.sin(angle) * 20,
          vx: 0,
          vy: 0,
          vz: 0,
          radius: 3.5
        };
      });

      const updatedLinks = newLinks.map(l => ({
        id: l.id || `${l.source}-${l.target}`,
        source: Number(l.source),
        target: Number(l.target)
      }));

      simulation.nodes(updatedNodes);
      simulation.force('link').links(updatedLinks);
      simulation.alpha(0.7).restart();

      return updatedNodes;
    }
  };
}

