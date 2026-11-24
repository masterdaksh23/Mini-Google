import React from 'react';
import {
  Trophy,
  ArrowDownLeft,
  ArrowUpRight,
  Sparkles,
  Dice5,
  ChevronRight,
  TrendingUp,
  Info
} from 'lucide-react';

export function Leaderboard({
  rankings,
  activeMode,
  surferTallies,
  surferTotalTally,
  surferRankings,
  hasSurferTrials,
  topPageId,
  bottomPageId,
  zeroInDegreePages,
  hoveredNodeId,
  selectedNodeId,
  onHoverNode,
  onSelectNode
}) {
  // Compute max score for relative bar width
  const maxScore = rankings.length > 0 ? Math.max(...rankings.map(r => r.score || 0)) : 1;

  // Surfer tally map
  const surferTallyMap = new Map();
  if (surferRankings && surferRankings.length > 0) {
    surferRankings.forEach(sr => surferTallyMap.set(sr.id, sr));
  }

  return (
    <aside className="absolute right-4 top-16 bottom-4 w-80 md:w-96 glass-panel rounded-3xl p-4 flex flex-col z-20 shadow-2xl border border-slate-700/60 overflow-hidden pointer-events-auto">
      {/* Panel Header */}
      <div className="flex items-center justify-between pb-3 mb-2 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-xl bg-blue-500/20 text-blue-400 border border-blue-500/30">
            <Trophy className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-100 flex items-center gap-1.5">
              <span>Website Leaderboard</span>
            </h2>
            <p className="text-[10px] text-slate-400">
              {activeMode === 'pagerank' && 'Ranked by PageRank Authority'}
              {activeMode === 'random-surfer' && (hasSurferTrials ? 'Ranked by Surfer Monte Carlo Visits' : '20-Tally Dice Surfer Counts')}
              {activeMode === 'dual' && 'Algorithm vs Empirical Dice Surfer'}
            </p>
          </div>
        </div>

        {/* Mode Pill Indicator */}
        <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-800/80 text-slate-300 border border-slate-700">
          {rankings.length} Pages
        </span>
      </div>

      {/* Leaderboard List with Smooth Transition */}
      <div className="flex-1 overflow-y-auto space-y-2 pr-1 custom-scroll">
        {rankings.map((item, index) => {
          const isTop = item.id === topPageId;
          const isBottom = item.id === bottomPageId;
          const isZeroIn = (item.inDegree === 0) || zeroInDegreePages.includes(item.id);
          const isHovered = hoveredNodeId === item.id;
          const isSelected = selectedNodeId === item.id;

          const widthPercent = maxScore > 0 ? (item.score / maxScore) * 100 : 0;
          const surferData = surferTallyMap.get(item.id);
          const currentTally = surferTallies[item.id] || 0;

          return (
            <div
              key={item.id}
              onMouseEnter={() => onHoverNode(item.id)}
              onMouseLeave={() => onHoverNode(null)}
              onClick={() => onSelectNode(item.id)}
              className={`relative rounded-2xl p-3 border cursor-pointer transition-all duration-300 select-none overflow-hidden ${
                isHovered || isSelected
                  ? 'bg-slate-800/90 border-sky-400/60 shadow-lg shadow-sky-950/50 scale-[1.02]'
                  : isTop
                  ? 'bg-emerald-950/20 border-emerald-500/40 hover:bg-emerald-950/30 shadow-emerald-950/20'
                  : isZeroIn
                  ? 'bg-red-950/20 border-red-500/40 hover:bg-red-950/30 shadow-red-950/20'
                  : 'bg-slate-900/40 border-slate-800 hover:bg-slate-800/50'
              }`}
            >
              {/* Background fill bar representing PageRank score */}
              <div
                className={`absolute left-0 top-0 bottom-0 pointer-events-none rounded-2xl transition-all duration-500 opacity-20 ${
                  isTop
                    ? 'bg-gradient-to-r from-emerald-500 to-emerald-400 opacity-25'
                    : isZeroIn
                    ? 'bg-gradient-to-r from-red-500 to-red-400 opacity-20'
                    : 'bg-gradient-to-r from-sky-500 to-indigo-500'
                }`}
                style={{ width: `${Math.max(6, widthPercent)}%` }}
              />

              <div className="relative z-10 flex items-start gap-2.5">
                {/* Rank Badge */}
                <div
                  className={`w-6 h-6 rounded-lg flex items-center justify-center text-xs font-black shrink-0 shadow-sm mt-0.5 ${
                    item.rank === 1
                      ? 'bg-gradient-to-br from-yellow-300 to-amber-500 text-slate-950 ring-2 ring-amber-400/40'
                      : item.rank === 2
                      ? 'bg-gradient-to-br from-slate-200 to-slate-400 text-slate-950'
                      : item.rank === 3
                      ? 'bg-gradient-to-br from-amber-600 to-amber-800 text-white'
                      : 'bg-slate-800 text-slate-400 border border-slate-700'
                  }`}
                >
                  {item.rank}
                </div>

                {/* Main Domain Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1 mb-1">
                    <span className="font-mono text-xs font-semibold text-slate-100 truncate block">
                      {item.domain}
                    </span>

                    {/* Special Highlight Badges */}
                    {isTop && (
                      <span className="shrink-0 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 text-glow-green">
                        ★ #1 Rank
                      </span>
                    )}
                    {isZeroIn && (
                      <span className="shrink-0 px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-500/20 text-red-400 border border-red-500/40 text-glow-red">
                        0 Incoming
                      </span>
                    )}
                  </div>

                  {/* Metrics Row */}
                  <div className="flex items-center justify-between gap-2 text-[11px] text-slate-400">
                    {/* Algorithm PageRank Metric */}
                    <div className="flex items-center gap-1.5">
                      <span className="font-semibold text-sky-400 font-mono">
                        {item.percentage}% PR
                      </span>
                      <span className="text-slate-600">|</span>
                      <span className="text-[10px] text-slate-400 font-mono">
                        PR: {(item.score).toFixed(4)}
                      </span>
                    </div>

                    {/* In-Degree & Out-Degree Badges */}
                    <div className="flex items-center gap-1 font-mono text-[10px]">
                      <span
                        className={`px-1.5 py-0.5 rounded flex items-center gap-0.5 ${
                          item.inDegree > 0
                            ? 'bg-slate-800 text-emerald-400'
                            : 'bg-red-950/60 text-red-400 border border-red-800/40 font-bold'
                        }`}
                        title={`${item.inDegree} incoming links`}
                      >
                        <ArrowDownLeft className="w-2.5 h-2.5" />
                        {item.inDegree} in
                      </span>
                      <span
                        className="px-1.5 py-0.5 rounded bg-slate-800 text-amber-400 flex items-center gap-0.5"
                        title={`${item.outDegree} outgoing links`}
                      >
                        <ArrowUpRight className="w-2.5 h-2.5" />
                        {item.outDegree} out
                      </span>
                    </div>
                  </div>

                  {/* Random Surfer Metrics Comparison (Dual or Random Surfer mode) */}
                  {(activeMode === 'random-surfer' || activeMode === 'dual') && (
                    <div className="mt-2 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px]">
                      <div className="flex items-center gap-1.5 text-amber-300">
                        <Dice5 className="w-3 h-3 text-amber-400" />
                        <span>Dice Game Visits:</span>
                        <span className="font-bold font-mono">
                          {hasSurferTrials && surferData
                            ? `${surferData.count.toLocaleString()} (${surferData.percentage}%)`
                            : `${currentTally} tally`}
                        </span>
                      </div>

                      {hasSurferTrials && surferData && (
                        <div className="flex items-center gap-1">
                          <span className="text-[9px] text-slate-400">Sim Rank:</span>
                          <span className="font-bold text-amber-400 font-mono">
                            #{surferData.rank}
                          </span>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Micro Visual Progress Bar */}
                  <div className="mt-1.5 w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        isTop
                          ? 'bg-emerald-400 shadow-[0_0_8px_rgba(52,168,83,0.6)]'
                          : isZeroIn
                          ? 'bg-red-400 shadow-[0_0_8px_rgba(234,67,53,0.6)]'
                          : 'bg-gradient-to-r from-sky-400 to-indigo-400'
                      }`}
                      style={{ width: `${Math.max(4, widthPercent)}%` }}
                    />
                  </div>
                </div>

                {/* Details Chevron */}
                <div className="shrink-0 self-center text-slate-600 hover:text-slate-300">
                  <ChevronRight className="w-4 h-4" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer Insight Box */}
      <div className="mt-3 pt-3 border-t border-slate-800/80 text-[11px] text-slate-400 flex items-start gap-2">
        <Info className="w-4 h-4 text-sky-400 shrink-0 mt-0.5" />
        <p className="leading-snug">
          Click any website to inspect why it ranks high or low based on incoming link authority.
        </p>
      </div>
    </aside>
  );
}

