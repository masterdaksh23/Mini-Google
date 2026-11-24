import React, { useRef, useEffect } from 'react';
import {
  Globe,
  ArrowDownLeft,
  ArrowUpRight,
  Sparkles,
  ExternalLink,
  ShieldCheck,
  AlertOctagon,
  X
} from 'lucide-react';

export function NodeDetailsModal({
  selectedNodeId,
  onClose,
  pages,
  rankings,
  contributions,
  inDegrees,
  outDegrees,
  inLinks,
  outLinks
}) {
  const dialogRef = useRef(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (selectedNodeId) {
      if (!dialog.open) {
        dialog.showModal();
      }
    } else {
      if (dialog.open) {
        dialog.close();
      }
    }
  }, [selectedNodeId]);

  if (!selectedNodeId) return null;

  const page = pages.find(p => p.id === selectedNodeId);
  if (!page) return null;

  const rankInfo = rankings.find(r => r.id === selectedNodeId) || {
    rank: '-',
    score: 0,
    percentage: '0.00'
  };

  const incomingContribs = contributions[selectedNodeId] || [];
  const incomingIds = inLinks[selectedNodeId] || [];
  const outgoingIds = outLinks[selectedNodeId] || [];

  const pageMap = new Map(pages.map(p => [p.id, p]));

  const isTop = rankInfo.rank === 1;
  const isZeroIn = (inDegrees[selectedNodeId] || 0) === 0;

  return (
    <dialog
      ref={dialogRef}
      onCancel={onClose}
      aria-labelledby="node-details-title"
      className="m-auto rounded-3xl p-0 bg-transparent text-slate-100 max-w-lg w-full border border-slate-700/80 shadow-2xl backdrop:bg-black/75 backdrop:backdrop-blur-sm"
    >
      <div className="glass-panel rounded-3xl p-6 border border-slate-700/60 flex flex-col space-y-4">
        {/* Header */}
        <div className="flex items-start justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-2xl flex items-center justify-center text-lg font-black shadow-lg"
              style={{
                backgroundColor: page.colorHint || '#38bdf8',
                color: '#0a0d14'
              }}
            >
              #{rankInfo.rank}
            </div>
            <div>
              <h2 id="node-details-title" className="text-base font-bold text-slate-100 flex items-center gap-2">
                <span>{page.title || page.domain}</span>
                {isTop && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
                    ★ #1 Authority
                  </span>
                )}
                {isZeroIn && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-500/20 text-red-400 border border-red-500/40">
                    ⚠ 0 In-Links
                  </span>
                )}
              </h2>
              <span className="font-mono text-xs text-sky-400">{page.domain}</span>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Description */}
        {page.description && (
          <p className="text-xs text-slate-300 leading-relaxed bg-slate-900/50 p-3 rounded-2xl border border-slate-800/80">
            {page.description}
          </p>
        )}

        {/* Key Metrics Cards */}
        <div className="grid grid-cols-3 gap-2.5">
          <div className="p-3 rounded-2xl bg-slate-900/80 border border-slate-800 text-center">
            <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
              PageRank
            </span>
            <span className="text-base font-mono font-bold text-sky-400">
              {rankInfo.percentage}%
            </span>
            <span className="text-[10px] text-slate-500 block font-mono">
              {(rankInfo.score).toFixed(4)}
            </span>
          </div>

          <div className="p-3 rounded-2xl bg-slate-900/80 border border-slate-800 text-center">
            <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
              In-Degree
            </span>
            <span className={`text-base font-mono font-bold ${isZeroIn ? 'text-red-400' : 'text-emerald-400'}`}>
              {inDegrees[selectedNodeId] || 0}
            </span>
            <span className="text-[10px] text-slate-500 block">incoming links</span>
          </div>

          <div className="p-3 rounded-2xl bg-slate-900/80 border border-slate-800 text-center">
            <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
              Out-Degree
            </span>
            <span className="text-base font-mono font-bold text-amber-400">
              {outDegrees[selectedNodeId] || 0}
            </span>
            <span className="text-[10px] text-slate-500 block">outgoing links</span>
          </div>
        </div>

        {/* Incoming Link Authority Breakdown */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
              <ArrowDownLeft className="w-3.5 h-3.5 text-emerald-400" />
              <span>Incoming Authority Breakdown</span>
            </h3>
            <span className="text-[10px] text-slate-400">d = 0.85 transfer</span>
          </div>

          {incomingContribs.length === 0 ? (
            <div className="p-3 rounded-2xl bg-red-950/20 border border-red-900/40 text-red-300 text-xs">
              No websites link to this page. Its score is purely the base teleportation damping factor (1 - d)/N = 0.025.
            </div>
          ) : (
            <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1 custom-scroll text-xs">
              {incomingContribs.map(contrib => (
                <div
                  key={contrib.sourceId}
                  className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between"
                >
                  <div className="flex items-center gap-2 truncate">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 shrink-0" />
                    <span className="font-mono text-slate-200 truncate">{contrib.sourceDomain}</span>
                  </div>
                  <div className="flex items-center gap-2 shrink-0 font-mono">
                    <span className="text-emerald-400 font-bold">
                      +{contrib.transferScore.toFixed(4)}
                    </span>
                    <span className="text-[10px] text-slate-400 px-1.5 py-0.5 rounded bg-slate-800">
                      {contrib.percentOfTargetRank.toFixed(1)}% of total
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Outgoing Links */}
        <div className="space-y-1.5">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
            <ArrowUpRight className="w-3.5 h-3.5 text-amber-400" />
            <span>Outgoing Links ({outgoingIds.length})</span>
          </h3>
          <div className="flex flex-wrap gap-1.5">
            {outgoingIds.length === 0 ? (
              <span className="text-[11px] text-slate-500 italic">No outgoing links (Dangling sink node).</span>
            ) : (
              outgoingIds.map(tgtId => {
                const targetPage = pageMap.get(tgtId);
                return (
                  <span
                    key={tgtId}
                    className="px-2.5 py-1 rounded-xl bg-slate-800 border border-slate-700 text-slate-300 font-mono text-[11px]"
                  >
                    → {targetPage?.domain || `Page ${tgtId}`}
                  </span>
                );
              })
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="pt-2 border-t border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="py-1.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </dialog>
  );
}

