import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { SEED_PAGES, SEED_LINKS, PRESETS } from './constants/seedData';
import { computePageRank } from './engine/pagerank';
import {
  initializeSurferState,
  stepSurfer,
  runSurferTrials
} from './engine/randomSurfer';
import { create3DForceLayout } from './engine/forceSimulation3D';
import { GraphScene } from './components/canvas/GraphScene';
import { Header } from './components/ui/Header';
import { Leaderboard } from './components/ui/Leaderboard';
import { DiceGamePanel } from './components/ui/DiceGamePanel';
import { GraphEditorModal } from './components/ui/GraphEditorModal';
import { NodeDetailsModal } from './components/ui/NodeDetailsModal';
import { SearchSimulatorModal } from './components/ui/SearchSimulatorModal';
import { AboutGuideModal } from './components/ui/AboutGuideModal';

export default function App() {
  // Graph Network Data State
  const [pages, setPages] = useState(() => JSON.parse(JSON.stringify(SEED_PAGES)));
  const [links, setLinks] = useState(() => JSON.parse(JSON.stringify(SEED_LINKS)));
  const [selectedPreset, setSelectedPreset] = useState('pune-pizza');

  // Active Presentation Mode: 'pagerank' | 'random-surfer' | 'dual'
  const [activeMode, setActiveMode] = useState('pagerank');

  // Interactive UI State
  const [hoveredNodeId, setHoveredNodeId] = useState(null);
  const [selectedNodeId, setSelectedNodeId] = useState(null);
  const [isAutoRotating, setIsAutoRotating] = useState(true);
  const [resetCameraTrigger, setResetCameraTrigger] = useState(0);

  // Modals
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isAboutOpen, setIsAboutOpen] = useState(false);

  // Random Surfer Simulation State
  const [surferState, setSurferState] = useState(() => initializeSurferState(pages));
  const [surferTrialsResult, setSurferTrialsResult] = useState(null);
  const [isSimulatingTrials, setIsSimulatingTrials] = useState(false);

  // Compute PageRank continuously whenever pages or links change
  const pageRankResult = useMemo(() => {
    return computePageRank(pages, links, { damping: 0.85, epsilon: 1e-6 });
  }, [pages, links]);

  const {
    scores,
    rankings,
    inDegrees,
    outDegrees,
    inLinks,
    outLinks,
    contributions,
    isAcceptanceCriteriaMet,
    orderString,
    topPageId,
    bottomPageId,
    zeroInDegreePages
  } = pageRankResult;

  // Node radii scaling based on PageRank score
  const nodeRadii = useMemo(() => {
    const radiiMap = new Map();
    const maxScore = rankings.length > 0 ? Math.max(...rankings.map(r => r.score || 0)) : 1;

    pages.forEach(p => {
      const score = scores[p.id] || (1 / pages.length);
      // Scale between 1.8 and 4.6
      const normalized = maxScore > 0 ? score / maxScore : 0.5;
      const radius = 1.8 + normalized * 2.8;
      radiiMap.set(p.id, radius);
    });

    return radiiMap;
  }, [pages, scores, rankings]);

  // 3D Physics Node Positions
  const [nodePositions, setNodePositions] = useState(() => {
    const map = new Map();
    pages.forEach((p, idx) => {
      const angle = (idx / pages.length) * Math.PI * 2;
      map.set(p.id, {
        x: Math.cos(angle) * 22,
        y: ((idx % 3) - 1) * 8,
        z: Math.sin(angle) * 22
      });
    });
    return map;
  });

  const simulationRef = useRef(null);

  // Initialize and update 3D Force Simulation
  useEffect(() => {
    let animFrame = null;

    const handleTick = (simNodes) => {
      // Throttle state update to animation frame
      if (!animFrame) {
        animFrame = requestAnimationFrame(() => {
          const map = new Map();
          simNodes.forEach(n => {
            map.set(n.id, { x: n.x, y: n.y, z: n.z });
          });
          setNodePositions(map);
          animFrame = null;
        });
      }
    };

    if (!simulationRef.current) {
      simulationRef.current = create3DForceLayout(pages, links, handleTick);
    } else {
      simulationRef.current.updateData(pages, links);
    }

    return () => {
      if (animFrame) cancelAnimationFrame(animFrame);
    };
  }, [pages, links]);

  // Cleanup simulation on unmount
  useEffect(() => {
    return () => {
      if (simulationRef.current) {
        simulationRef.current.stop();
      }
    };
  }, []);

  // Preset Selection Handler
  const handleSelectPreset = (presetId) => {
    const preset = PRESETS.find(p => p.id === presetId);
    if (preset) {
      setSelectedPreset(presetId);
      const clonedPages = JSON.parse(JSON.stringify(preset.pages));
      const clonedLinks = JSON.parse(JSON.stringify(preset.links));
      setPages(clonedPages);
      setLinks(clonedLinks);
      setSurferState(initializeSurferState(clonedPages));
      setSurferTrialsResult(null);
      setResetCameraTrigger(prev => prev + 1);
    }
  };

  // Reset to default Pune Pizza seed data
  const handleResetToSeed = () => {
    handleSelectPreset('pune-pizza');
  };

  // Editor Actions
  const handleAddPage = (newPage) => {
    const nextId = pages.length > 0 ? Math.max(...pages.map(p => p.id)) + 1 : 1;
    const pageObj = {
      id: nextId,
      domain: newPage.domain,
      title: newPage.title,
      description: `User-added website ${newPage.domain}`,
      colorHint: newPage.colorHint || '#38bdf8'
    };
    const updated = [...pages, pageObj];
    setPages(updated);
    setSelectedPreset('custom');
  };

  const handleRemovePage = (pageId) => {
    if (pages.length <= 2) return;
    const updatedPages = pages.filter(p => p.id !== pageId);
    const updatedLinks = links.filter(l => Number(l.source) !== pageId && Number(l.target) !== pageId);
    setPages(updatedPages);
    setLinks(updatedLinks);
    setSelectedPreset('custom');
    if (selectedNodeId === pageId) setSelectedNodeId(null);
    if (hoveredNodeId === pageId) setHoveredNodeId(null);
  };

  const handleAddLink = (sourceId, targetId) => {
    const newLinkId = `${sourceId}-${targetId}-${Date.now()}`;
    const newLink = { id: newLinkId, source: Number(sourceId), target: Number(targetId) };
    setLinks(prev => [...prev, newLink]);
    setSelectedPreset('custom');
  };

  const handleRemoveLink = (sourceId, targetId) => {
    const src = Number(sourceId);
    const tgt = Number(targetId);
    setLinks(prev => prev.filter(l => !(Number(l.source) === src && Number(l.target) === tgt)));
    setSelectedPreset('custom');
  };

  // Random Surfer Handlers
  const handleStepSurfer = useCallback(() => {
    let nextState;
    setSurferState(prev => {
      nextState = stepSurfer(prev, pages, links);
      return nextState;
    });
    return nextState;
  }, [pages, links]);

  const handleResetSurfer = () => {
    setSurferState(initializeSurferState(pages));
    setSurferTrialsResult(null);
  };

  const handleRunTrials = (count = 10000) => {
    setIsSimulatingTrials(true);
    setTimeout(() => {
      const result = runSurferTrials(pages, links, count);
      setSurferTrialsResult(result);
      setIsSimulatingTrials(false);
    }, 50);
  };

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-[#080b12] text-slate-100 select-none">
      {/* 3D Scene Canvas */}
      <GraphScene
        pages={pages}
        links={links}
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
        onHoverNode={setHoveredNodeId}
        onSelectNode={setSelectedNodeId}
        isAutoRotating={isAutoRotating}
        resetCameraTrigger={resetCameraTrigger}
        showSurfer={activeMode === 'random-surfer' || activeMode === 'dual'}
        surferCurrentPageId={surferState.currentPageId}
        surferLastAction={surferState.lastAction}
      />

      {/* Top Header Bar */}
      <Header
        activeMode={activeMode}
        setActiveMode={setActiveMode}
        isAcceptanceCriteriaMet={isAcceptanceCriteriaMet}
        orderString={orderString}
        onOpenEditor={() => setIsEditorOpen(true)}
        onOpenSearch={() => setIsSearchOpen(true)}
        onOpenAbout={() => setIsAboutOpen(true)}
        isAutoRotating={isAutoRotating}
        setIsAutoRotating={setIsAutoRotating}
        onResetCamera={() => setResetCameraTrigger(prev => prev + 1)}
        onResetToSeed={handleResetToSeed}
        selectedPreset={selectedPreset}
        onSelectPreset={handleSelectPreset}
        presets={PRESETS}
      />

      {/* Right Side Glassmorphism Leaderboard */}
      <Leaderboard
        rankings={rankings}
        activeMode={activeMode}
        surferTallies={surferState.tallies}
        surferTotalTally={surferState.totalTallyCount}
        surferRankings={surferTrialsResult?.rankings}
        hasSurferTrials={!!surferTrialsResult}
        topPageId={topPageId}
        bottomPageId={bottomPageId}
        zeroInDegreePages={zeroInDegreePages}
        hoveredNodeId={hoveredNodeId}
        selectedNodeId={selectedNodeId}
        onHoverNode={setHoveredNodeId}
        onSelectNode={setSelectedNodeId}
      />

      {/* Bottom Floating Dice Game Controller (Active in Random Surfer or Dual Mode) */}
      {(activeMode === 'random-surfer' || activeMode === 'dual') && (
        <DiceGamePanel
          pages={pages}
          surferState={surferState}
          onStepSurfer={handleStepSurfer}
          onResetSurfer={handleResetSurfer}
          onRunTrials={handleRunTrials}
          isSimulatingTrials={isSimulatingTrials}
          surferTrialsResult={surferTrialsResult}
          activeMode={activeMode}
        />
      )}

      {/* Modals & Dialogs */}
      <GraphEditorModal
        isOpen={isEditorOpen}
        onClose={() => setIsEditorOpen(false)}
        pages={pages}
        links={links}
        onAddPage={handleAddPage}
        onRemovePage={handleRemovePage}
        onAddLink={handleAddLink}
        onRemoveLink={handleRemoveLink}
        onResetSeed={handleResetToSeed}
        onSelectPreset={handleSelectPreset}
        presets={PRESETS}
        selectedPreset={selectedPreset}
      />

      <NodeDetailsModal
        selectedNodeId={selectedNodeId}
        onClose={() => setSelectedNodeId(null)}
        pages={pages}
        rankings={rankings}
        contributions={contributions}
        inDegrees={inDegrees}
        outDegrees={outDegrees}
        inLinks={inLinks}
        outLinks={outLinks}
      />

      <SearchSimulatorModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        pages={pages}
        rankings={rankings}
        onSelectPage={setSelectedNodeId}
      />

      <AboutGuideModal
        isOpen={isAboutOpen}
        onClose={() => setIsAboutOpen(false)}
      />
    </div>
  );
}

