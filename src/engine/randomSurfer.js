/**
 * Random Surfer (Dice Game) Simulation Engine.
 * 
 * Implements the exact rules:
 * 1. Start: roll a dice (1..N); that page is your first page — add a "|" line for it.
 * 2. Each turn, roll again:
 *    - Roll 6: bored -> teleport: roll again and jump to that page.
 *    - Roll 1-5: follow an outgoing arrow of the current page.
 *      If the page has 2 arrows, roll again: odd (1,3,5) -> first arrow, even (2,4,6) -> second arrow.
 *      If 1 arrow: follow that arrow.
 *      If 0 arrows: teleport (roll 1..N).
 * 3. Every page reached gets a "|" line. Stop at 20 lines (or user can step/auto-play).
 * 4. Run 10,000 trials aggregates visit counts so the ranking converges to PageRank order.
 */

export function rollDice(max = 6) {
  return Math.floor(Math.random() * max) + 1;
}

export function initializeSurferState(pages) {
  if (!pages || pages.length === 0) {
    return {
      currentPageId: null,
      tallies: {},
      totalTallyCount: 0,
      stepCount: 0,
      isFinished20: false,
      history: [],
      lastAction: null
    };
  }

  // Initial dice roll to select starting page
  const roll = rollDice(Math.min(6, pages.length));
  // Pick page by 1-based index or matching ID
  const startPage = pages[roll - 1] || pages[0];
  const startId = startPage.id;

  const tallies = {};
  pages.forEach(p => {
    tallies[p.id] = 0;
  });
  tallies[startId] = 1;

  const initialAction = {
    step: 1,
    roll,
    type: 'start',
    message: `Start Game: Rolled ${roll} → Landed on ${startPage.domain}`,
    pageId: startId,
    pageDomain: startPage.domain,
    teleport: false
  };

  return {
    currentPageId: startId,
    tallies,
    totalTallyCount: 1,
    stepCount: 1,
    isFinished20: false,
    history: [initialAction],
    lastAction: initialAction
  };
}

export function stepSurfer(currentState, pages, links) {
  if (!currentState.currentPageId) {
    return initializeSurferState(pages);
  }

  const { currentPageId, tallies, totalTallyCount, stepCount, history } = currentState;
  const pageMap = new Map(pages.map(p => [p.id, p]));
  const currPage = pageMap.get(currentPageId);

  // Find outgoing arrows
  const outgoingLinks = links.filter(l => Number(l.source) === Number(currentPageId));
  const outCount = outgoingLinks.length;

  let nextId = null;
  let actionDetails = null;

  // Turn Rule:
  // Roll a dice (1-6)
  const roll1 = rollDice(6);

  if (roll1 === 6 || outCount === 0) {
    // Boredom Teleport!
    const teleportRoll = rollDice(Math.min(6, pages.length));
    const teleportPage = pages[teleportRoll - 1] || pages[0];
    nextId = teleportPage.id;

    const reason = roll1 === 6 
      ? `Rolled 6: Bored! 😴 Teleporting → Rolled ${teleportRoll} → Jumped to ${teleportPage.domain}`
      : `No outgoing arrows! Dead end → Teleporting: Rolled ${teleportRoll} → Jumped to ${teleportPage.domain}`;

    actionDetails = {
      step: stepCount + 1,
      roll1,
      roll2: teleportRoll,
      type: 'teleport',
      message: reason,
      fromId: currentPageId,
      fromDomain: currPage?.domain,
      pageId: nextId,
      pageDomain: teleportPage.domain,
      teleport: true
    };
  } else {
    // Roll 1-5: follow an outgoing arrow
    if (outCount === 1) {
      nextId = Number(outgoingLinks[0].target);
      const targetPage = pageMap.get(nextId);
      actionDetails = {
        step: stepCount + 1,
        roll1,
        type: 'follow',
        message: `Rolled ${roll1} (1–5): Followed lone arrow → ${targetPage?.domain || `Page ${nextId}`}`,
        fromId: currentPageId,
        fromDomain: currPage?.domain,
        pageId: nextId,
        pageDomain: targetPage?.domain,
        teleport: false
      };
    } else if (outCount === 2) {
      // "If the page has 2 arrows, roll again: odd (1,3,5) → first arrow, even (2,4,6) → second arrow"
      const roll2 = rollDice(6);
      const chosenLink = (roll2 % 2 === 1) ? outgoingLinks[0] : outgoingLinks[1];
      nextId = Number(chosenLink.target);
      const targetPage = pageMap.get(nextId);
      const arrowName = roll2 % 2 === 1 ? '1st arrow (odd)' : '2nd arrow (even)';

      actionDetails = {
        step: stepCount + 1,
        roll1,
        roll2,
        type: 'follow-choice',
        message: `Rolled ${roll1}: Chose arrow → Rolled ${roll2} (${arrowName}) → ${targetPage?.domain}`,
        fromId: currentPageId,
        fromDomain: currPage?.domain,
        pageId: nextId,
        pageDomain: targetPage?.domain,
        teleport: false
      };
    } else {
      // More than 2 arrows: choose arrow uniformly
      const roll2 = rollDice(outCount);
      const chosenLink = outgoingLinks[roll2 - 1];
      nextId = Number(chosenLink.target);
      const targetPage = pageMap.get(nextId);

      actionDetails = {
        step: stepCount + 1,
        roll1,
        roll2,
        type: 'follow-choice',
        message: `Rolled ${roll1}: Multiple arrows → Rolled ${roll2} of ${outCount} → ${targetPage?.domain}`,
        fromId: currentPageId,
        fromDomain: currPage?.domain,
        pageId: nextId,
        pageDomain: targetPage?.domain,
        teleport: false
      };
    }
  }

  const updatedTallies = { ...tallies };
  updatedTallies[nextId] = (updatedTallies[nextId] || 0) + 1;
  const newTotalTally = totalTallyCount + 1;
  const newStepCount = stepCount + 1;

  return {
    currentPageId: nextId,
    tallies: updatedTallies,
    totalTallyCount: newTotalTally,
    stepCount: newStepCount,
    isFinished20: newTotalTally >= 20,
    history: [actionDetails, ...history.slice(0, 49)],
    lastAction: actionDetails
  };
}

/**
 * Fast Monte Carlo simulation of 10,000 trials
 */
export function runSurferTrials(pages, links, totalTrials = 10000) {
  const N = pages.length;
  if (N === 0) return { counts: {}, percentages: {}, rankings: [] };

  const outMap = new Map();
  pages.forEach(p => outMap.set(p.id, []));
  links.forEach(l => {
    const src = Number(l.source);
    const tgt = Number(l.target);
    if (outMap.has(src)) {
      outMap.get(src).push(tgt);
    }
  });

  const counts = {};
  pages.forEach(p => { counts[p.id] = 0; });

  // 1. Start: roll dice
  let currIndex = Math.floor(Math.random() * N);
  let currId = pages[currIndex].id;
  counts[currId] = 1;

  for (let i = 1; i < totalTrials; i++) {
    const roll = Math.floor(Math.random() * 6) + 1;
    const arrows = outMap.get(currId) || [];

    if (roll === 6 || arrows.length === 0) {
      // Teleport
      currIndex = Math.floor(Math.random() * N);
      currId = pages[currIndex].id;
    } else {
      // Follow arrow
      if (arrows.length === 1) {
        currId = arrows[0];
      } else if (arrows.length === 2) {
        const roll2 = Math.floor(Math.random() * 6) + 1;
        currId = (roll2 % 2 === 1) ? arrows[0] : arrows[1];
      } else {
        const pick = Math.floor(Math.random() * arrows.length);
        currId = arrows[pick];
      }
    }

    counts[currId] = (counts[currId] || 0) + 1;
  }

  const percentages = {};
  pages.forEach(p => {
    percentages[p.id] = ((counts[p.id] / totalTrials) * 100).toFixed(2);
  });

  const rankings = pages.map(p => ({
    id: p.id,
    domain: p.domain,
    title: p.title || p.domain,
    count: counts[p.id] || 0,
    percentage: parseFloat(percentages[p.id] || 0),
    colorHint: p.colorHint
  })).sort((a, b) => b.count - a.count);

  rankings.forEach((r, idx) => {
    r.rank = idx + 1;
  });

  return {
    counts,
    percentages,
    rankings,
    totalTrials
  };
}

