/**
 * Classic iterative PageRank engine with dangling-node handling.
 * 
 * Formula:
 * PR(u) = (1 - d)/N + d * [ sum_{v in In(u)} (PR(v) / Out(v)) + (sum_{w in Dangling} PR(w)) / N ]
 */

export function computePageRank(pages, links, options = {}) {
  const d = options.damping ?? 0.85;
  const epsilon = options.epsilon ?? 1e-6;
  const maxIterations = options.maxIterations ?? 500;

  const N = pages.length;
  if (N === 0) {
    return {
      scores: {},
      rankings: [],
      inDegrees: {},
      outDegrees: {},
      inLinks: {},
      outLinks: {},
      contributions: {},
      iterations: 0,
      deltaHistory: [],
      isAcceptanceCriteriaMet: false,
      topPageId: null,
      bottomPageId: null,
      zeroInDegreePages: []
    };
  }

  // Build adjacency maps
  const inDegrees = {};
  const outDegrees = {};
  const inLinks = {};
  const outLinks = {};
  const pageMap = new Map();

  pages.forEach(p => {
    inDegrees[p.id] = 0;
    outDegrees[p.id] = 0;
    inLinks[p.id] = [];
    outLinks[p.id] = [];
    pageMap.set(p.id, p);
  });

  links.forEach(l => {
    const src = Number(l.source);
    const tgt = Number(l.target);
    if (pageMap.has(src) && pageMap.has(tgt)) {
      // Avoid duplicate edges in degree count if needed
      if (!outLinks[src].includes(tgt)) {
        outLinks[src].push(tgt);
        outDegrees[src] = (outDegrees[src] || 0) + 1;
      }
      if (!inLinks[tgt].includes(src)) {
        inLinks[tgt].push(src);
        inDegrees[tgt] = (inDegrees[tgt] || 0) + 1;
      }
    }
  });

  // Initial uniform probability
  let pr = {};
  pages.forEach(p => {
    pr[p.id] = 1.0 / N;
  });

  const deltaHistory = [];
  let iterations = 0;

  // Power iteration loop
  for (let it = 0; it < maxIterations; it++) {
    iterations = it + 1;
    const nextPr = {};

    // Calculate sum of PR from dangling nodes (out-degree = 0)
    let danglingSum = 0;
    pages.forEach(p => {
      if (outDegrees[p.id] === 0) {
        danglingSum += pr[p.id];
      }
    });

    const baseRank = (1.0 - d) / N;
    const danglingContrib = (d * danglingSum) / N;

    let maxDelta = 0;

    pages.forEach(p => {
      let incomingRank = 0;
      const callers = inLinks[p.id] || [];
      callers.forEach(srcId => {
        const srcOut = outDegrees[srcId];
        if (srcOut > 0) {
          incomingRank += pr[srcId] / srcOut;
        }
      });

      const newScore = baseRank + danglingContrib + d * incomingRank;
      nextPr[p.id] = newScore;

      const delta = Math.abs(newScore - pr[p.id]);
      if (delta > maxDelta) {
        maxDelta = delta;
      }
    });

    deltaHistory.push(maxDelta);
    pr = nextPr;

    if (maxDelta < epsilon) {
      break;
    }
  }

  // Normalize scores so they sum to 1.0
  const totalScore = Object.values(pr).reduce((acc, val) => acc + val, 0);
  const normalizedPr = {};
  pages.forEach(p => {
    normalizedPr[p.id] = totalScore > 0 ? pr[p.id] / totalScore : 1.0 / N;
  });

  // Compute incoming contributions per page for visual breakdown
  const contributions = {};
  pages.forEach(p => {
    contributions[p.id] = (inLinks[p.id] || []).map(srcId => {
      const srcOut = outDegrees[srcId] || 1;
      const transferScore = d * (normalizedPr[srcId] / srcOut);
      return {
        sourceId: srcId,
        sourceDomain: pageMap.get(srcId)?.domain || `Page ${srcId}`,
        transferScore,
        percentOfTargetRank: normalizedPr[p.id] > 0 ? (transferScore / normalizedPr[p.id]) * 100 : 0
      };
    }).sort((a, b) => b.transferScore - a.transferScore);
  });

  // Build sorted rankings
  const rankings = pages.map(p => {
    return {
      id: p.id,
      domain: p.domain,
      title: p.title || p.domain,
      score: normalizedPr[p.id],
      percentage: (normalizedPr[p.id] * 100).toFixed(2),
      inDegree: inDegrees[p.id] || 0,
      outDegree: outDegrees[p.id] || 0,
      colorHint: p.colorHint,
      isTop: false,
      isBottom: false
    };
  }).sort((a, b) => b.score - a.score);

  // Assign ranks and identify top/bottom
  rankings.forEach((item, index) => {
    item.rank = index + 1;
  });

  if (rankings.length > 0) {
    rankings[0].isTop = true;
    rankings[rankings.length - 1].isBottom = true;
  }

  const topPageId = rankings.length > 0 ? rankings[0].id : null;
  const bottomPageId = rankings.length > 0 ? rankings[rankings.length - 1].id : null;
  const zeroInDegreePages = pages.filter(p => inDegrees[p.id] === 0).map(p => p.id);

  // Acceptance criteria check for seed data (order: 2, 1, 3, 4, 5, 6)
  const orderString = rankings.map(r => r.id).join('>');
  const isAcceptanceCriteriaMet = orderString.startsWith('2>1>3>4>5>6');

  return {
    scores: normalizedPr,
    rankings,
    inDegrees,
    outDegrees,
    inLinks,
    outLinks,
    contributions,
    iterations,
    deltaHistory,
    isAcceptanceCriteriaMet,
    orderString,
    topPageId,
    bottomPageId,
    zeroInDegreePages
  };
}

