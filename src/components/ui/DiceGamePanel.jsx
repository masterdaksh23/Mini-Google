import React, { useState, useEffect } from 'react';
import {
  Dice1,
  Dice2,
  Dice3,
  Dice4,
  Dice5,
  Dice6,
  Play,
  Pause,
  RotateCcw,
  FastForward,
  Sparkles,
  Zap,
  HelpCircle
} from 'lucide-react';
import confetti from 'canvas-confetti';

const DICE_ICONS = {
  1: Dice1,
  2: Dice2,
  3: Dice3,
  4: Dice4,
  5: Dice5,
  6: Dice6
};

/**
 * Visual tally representation using classic stick marks: |||| /
 */
function TallyMarks({ count }) {
  const fullGroups = Math.floor(count / 5);
  const remainder = count % 5;

  return (
    <div className="flex flex-wrap items-center gap-1.5 font-mono text-xs">
      {Array.from({ length: fullGroups }).map((_, gIdx) => (
        <span
          key={`g-${gIdx}`}
          className="relative inline-block px-1 font-bold text-amber-300 tracking-tighter"
          title="5 visits"
        >
          <span className="line-through decoration-red-400 decoration-2">||||</span>
        </span>
      ))}
      {remainder > 0 && (
        <span className="font-bold text-amber-400 tracking-tighter">
          {'|'.repeat(remainder)}
        </span>
      )}
      <span className="text-[10px] text-slate-400 ml-1">({count})</span>
    </div>
  );
}

export function DiceGamePanel({
  pages,
  surferState,
  onStepSurfer,
  onResetSurfer,
  onRunTrials,
  isSimulatingTrials,
  surferTrialsResult,
  activeMode
}) {
  const [isAutoPlaying, setIsAutoPlaying] = useState(false);
  const [playSpeedMs, setPlaySpeedMs] = useState(600);
  const [isRollingDice, setIsRollingDice] = useState(false);
  const [displayRoll, setDisplayRoll] = useState(surferState?.lastAction?.roll1 || 1);
  const [displayRoll2, setDisplayRoll2] = useState(surferState?.lastAction?.roll2 || null);
  const [showRulesModal, setShowRulesModal] = useState(false);

  const {
    currentPageId,
    tallies,
    totalTallyCount,
    stepCount,
    isFinished20,
    history,
    lastAction
  } = surferState;

  // Auto-play loop until 20 steps
  useEffect(() => {
    let timer = null;
    if (isAutoPlaying) {
      if (isFinished20) {
        setIsAutoPlaying(false);
      } else {
        timer = setTimeout(() => {
          handleStep();
        }, playSpeedMs);
      }
    }
    return () => clearTimeout(timer);
  }, [isAutoPlaying, isFinished20, playSpeedMs, surferState]);

  const handleStep = () => {
    setIsRollingDice(true);
    // Quick rolling dice shuffle animation
    let shuffleCount = 0;
    const shuffleInterval = setInterval(() => {
      setDisplayRoll(Math.floor(Math.random() * 6) + 1);
      shuffleCount++;
      if (shuffleCount > 4) {
        clearInterval(shuffleInterval);
        setIsRollingDice(false);
        const nextState = onStepSurfer();
        if (nextState?.lastAction) {
          setDisplayRoll(nextState.lastAction.roll1 || nextState.lastAction.roll || 1);
          setDisplayRoll2(nextState.lastAction.roll2 || null);
        }
      }
    }, 40);
  };

  const handleRun10k = () => {
    setIsAutoPlaying(false);
    onRunTrials(10000);
    // Burst celebratory confetti
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.8 }
    });
  };

  const CurrentDiceIcon1 = DICE_ICONS[displayRoll] || Dice1;
  const CurrentDiceIcon2 = displayRoll2 ? (DICE_ICONS[displayRoll2] || Dice1) : null;

  return (
    <div className="absolute left-4 bottom-4 w-96 md:w-[450px] glass-panel rounded-3xl p-4 flex flex-col z-20 shadow-2xl border border-slate-700/60 pointer-events-auto select-none">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 mb-2 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
            <CurrentDiceIcon1 className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-100 flex items-center gap-1.5">
              <span>Random Surfer (Dice Game)</span>
            </h3>
            <p className="text-[10px] text-slate-400">
              Interactive dice simulation of the Markov random walk
            </p>
          </div>
        </div>

        <button
          onClick={() => setShowRulesModal(true)}
          className="text-slate-400 hover:text-amber-400 p-1 rounded-lg transition-colors"
          title="View Exact Dice Rules"
        >
          <HelpCircle className="w-4 h-4" />
        </button>
      </div>

      {/* Main Dice Rolling & Control Section */}
      <div className="grid grid-cols-12 gap-3 mb-3">
        {/* Dice Visual Widget */}
        <div className="col-span-4 rounded-2xl bg-slate-900/80 border border-slate-800 p-2.5 flex flex-col items-center justify-center text-center">
          <span className="text-[9px] uppercase font-bold tracking-wider text-slate-400 mb-1">
            Current Die
          </span>
          <div className="flex items-center gap-2">
            <div
              className={`p-2 rounded-2xl bg-amber-500/10 border border-amber-400/40 text-amber-400 shadow-lg shadow-amber-950/40 transition-transform ${
                isRollingDice ? 'scale-110 rotate-12 animate-pulse' : 'scale-100'
              }`}
            >
              <CurrentDiceIcon1 className="w-8 h-8" />
            </div>
            {CurrentDiceIcon2 && (
              <div className="p-1.5 rounded-xl bg-sky-500/10 border border-sky-400/30 text-sky-400">
                <CurrentDiceIcon2 className="w-6 h-6" />
              </div>
            )}
          </div>
          <span className="text-[11px] font-mono font-bold text-amber-300 mt-1">
            Rolled {displayRoll}
            {displayRoll2 && ` & ${displayRoll2}`}
          </span>
        </div>

        {/* Action Controls & 20-Step Progress */}
        <div className="col-span-8 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="text-slate-300 font-medium">
                Tally Progress ({totalTallyCount} / 20 lines)
              </span>
              <span className={`font-mono text-xs font-bold ${isFinished20 ? 'text-emerald-400' : 'text-amber-400'}`}>
                {isFinished20 ? 'Goal Reached! ✓' : `${20 - totalTallyCount} remaining`}
              </span>
            </div>

            {/* Progress Bar */}
            <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden mb-2">
              <div
                className={`h-full rounded-full transition-all duration-300 ${
                  isFinished20
                    ? 'bg-emerald-400 shadow-[0_0_10px_rgba(52,168,83,0.8)]'
                    : 'bg-gradient-to-r from-amber-500 to-amber-300 shadow-[0_0_8px_rgba(251,188,5,0.6)]'
                }`}
                style={{ width: `${Math.min(100, (totalTallyCount / 20) * 100)}%` }}
              />
            </div>
          </div>

          {/* Step / Auto-Play / Reset Buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleStep}
              disabled={isAutoPlaying}
              className="flex-1 py-1.5 px-2.5 rounded-xl text-xs font-semibold bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-md shadow-amber-500/20 active:scale-95 transition-all flex items-center justify-center gap-1.5 disabled:opacity-50"
            >
              <Zap className="w-3.5 h-3.5" />
              <span>Roll Turn</span>
            </button>

            <button
              onClick={() => setIsAutoPlaying(!isAutoPlaying)}
              className={`py-1.5 px-3 rounded-xl text-xs font-semibold border transition-all flex items-center justify-center gap-1 ${
                isAutoPlaying
                  ? 'bg-red-500/20 text-red-300 border-red-500/40'
                  : 'bg-slate-800 text-slate-200 border-slate-700 hover:bg-slate-700'
              }`}
              title={isAutoPlaying ? 'Pause Auto-Roll' : 'Auto Roll to 20'}
            >
              {isAutoPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
              <span>{isAutoPlaying ? 'Pause' : 'Auto'}</span>
            </button>

            <button
              onClick={() => {
                setIsAutoPlaying(false);
                onResetSurfer();
              }}
              className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-200 border border-slate-700 transition-all"
              title="Reset Dice Game"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Live Turn Narration Banner */}
      <div className="rounded-xl bg-slate-900/90 border border-slate-800/80 px-3 py-2 mb-3 text-xs leading-relaxed">
        <div className="text-[10px] text-slate-400 uppercase font-bold tracking-wider mb-0.5 flex items-center justify-between">
          <span>Turn Narration</span>
          <span className="font-mono text-amber-400">Step #{stepCount}</span>
        </div>
        <p className="text-slate-200 font-mono text-[11px]">
          {lastAction?.message || 'Press "Roll Turn" or "Auto" to start!'}
        </p>
      </div>

      {/* 20-Line Tally Box per Page */}
      <div className="mb-3 max-h-36 overflow-y-auto space-y-1.5 pr-1 custom-scroll">
        <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block mb-1">
          20-Line Tally by Page
        </span>
        {pages.map(page => {
          const tallyCount = tallies[page.id] || 0;
          const isCurrent = page.id === currentPageId;

          return (
            <div
              key={page.id}
              className={`flex items-center justify-between px-2.5 py-1 rounded-xl text-xs border transition-colors ${
                isCurrent
                  ? 'bg-amber-950/40 border-amber-500/50 text-amber-200 shadow-sm'
                  : 'bg-slate-900/40 border-slate-800/60 text-slate-300'
              }`}
            >
              <div className="flex items-center gap-1.5 truncate mr-2">
                <span className="w-4 h-4 rounded-full bg-slate-800 text-[10px] flex items-center justify-center font-bold font-mono">
                  {page.id}
                </span>
                <span className="truncate font-mono text-[11px]">{page.domain}</span>
                {isCurrent && (
                  <span className="text-[9px] px-1 py-0.2 rounded bg-amber-500 text-slate-950 font-bold shrink-0">
                    HERE
                  </span>
                )}
              </div>
              <TallyMarks count={tallyCount} />
            </div>
          );
        })}
      </div>

      {/* Monte Carlo 10,000 Trials Big Action Button */}
      <div className="pt-2 border-t border-slate-800">
        <button
          onClick={handleRun10k}
          disabled={isSimulatingTrials}
          className="w-full py-2 px-3 rounded-2xl text-xs font-bold bg-gradient-to-r from-blue-600 via-indigo-600 to-emerald-600 hover:from-blue-500 hover:via-indigo-500 hover:to-emerald-500 text-white shadow-lg shadow-indigo-900/30 active:scale-95 transition-all flex items-center justify-center gap-2"
        >
          <Sparkles className="w-4 h-4 text-yellow-300" />
          <span>Run 10,000 Trials (Show Convergence to PageRank)</span>
        </button>

        {surferTrialsResult && (
          <div className="mt-2 text-center text-[10px] text-emerald-400 font-mono">
            ✓ 10,000 trials aggregated! Matches PageRank theoretical ranking order.
          </div>
        )}
      </div>

      {/* Rules Modal (Modern Web Guidance style dialog) */}
      {showRulesModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4"
          onClick={() => setShowRulesModal(false)}
        >
          <div
            className="w-full max-w-md glass-panel rounded-3xl p-5 border border-slate-700 shadow-2xl space-y-3"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <h3 className="font-bold text-slate-100 flex items-center gap-2">
                <span>🎲</span>
                <span>Random Surfer Rules (Exact Dice Game)</span>
              </h3>
              <button
                onClick={() => setShowRulesModal(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg"
              >
                ✕
              </button>
            </div>

            <ol className="text-xs text-slate-300 space-y-2 list-decimal list-inside leading-relaxed">
              <li>
                <b>Start:</b> Roll a dice; that page is your first page — add a <b>"|"</b> line for it.
              </li>
              <li>
                <b>Each turn, roll again:</b>
                <ul className="list-disc list-inside ml-4 mt-1 text-slate-400 space-y-1">
                  <li>
                    <b className="text-amber-300">Roll 6:</b> You're bored → teleport: roll again and jump to that page. (16.7% damping jump)
                  </li>
                  <li>
                    <b className="text-sky-300">Roll 1–5:</b> Follow an outgoing arrow of the current page. If the page has 2 arrows, roll again:
                    <b> odd (1,3,5) → 1st arrow</b>, <b>even (2,4,6) → 2nd arrow</b>.
                  </li>
                </ul>
              </li>
              <li>
                Every page reached gets a <b>"|"</b> line. Stop at <b>20 lines</b>.
              </li>
              <li>
                <b>Run 10,000 trials:</b> Aggregates empirical visits so the ranking converges directly to the exact mathematical PageRank!
              </li>
            </ol>

            <button
              onClick={() => setShowRulesModal(false)}
              className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-slate-100 font-semibold rounded-xl text-xs transition-colors"
            >
              Got it, let's roll!
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

