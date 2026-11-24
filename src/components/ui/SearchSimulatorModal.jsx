import React, { useState, useRef, useEffect, useMemo } from 'react';
import {
  Search,
  ExternalLink,
  Sparkles,
  ArrowRight,
  X,
  Clock,
  ShieldCheck
} from 'lucide-react';

export function SearchSimulatorModal({
  isOpen,
  onClose,
  pages,
  rankings,
  onSelectPage
}) {
  const dialogRef = useRef(null);
  const inputRef = useRef(null);
  const [query, setQuery] = useState('pizza');

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (isOpen) {
      if (!dialog.open) {
        dialog.showModal();
        setTimeout(() => inputRef.current?.focus(), 100);
      }
    } else {
      if (dialog.open) {
        dialog.close();
      }
    }
  }, [isOpen]);

  const rankingMap = useMemo(() => {
    const map = new Map();
    rankings.forEach(r => map.set(r.id, r));
    return map;
  }, [rankings]);

  // Search logic: filter by query, then rank by PageRank score
  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) {
      return rankings.map(r => {
        const page = pages.find(p => p.id === r.id);
        return { ...page, ...r };
      });
    }

    return pages
      .filter(p => {
        const domainMatch = p.domain.toLowerCase().includes(q);
        const titleMatch = (p.title || '').toLowerCase().includes(q);
        const descMatch = (p.description || '').toLowerCase().includes(q);
        return domainMatch || titleMatch || descMatch;
      })
      .map(p => {
        const r = rankingMap.get(p.id) || { rank: '-', score: 0, percentage: '0.00' };
        return { ...p, ...r };
      })
      // Order strictly by PageRank score!
      .sort((a, b) => b.score - a.score);
  }, [query, pages, rankings, rankingMap]);

  return (
    <dialog
      ref={dialogRef}
      onCancel={onClose}
      aria-labelledby="search-modal-title"
      className="m-auto rounded-3xl p-0 bg-transparent text-slate-100 max-w-xl w-full border border-slate-700/80 shadow-2xl backdrop:bg-black/75 backdrop:backdrop-blur-sm"
    >
      <div className="glass-panel rounded-3xl p-6 border border-slate-700/60 flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <div className="flex items-center text-xl font-black font-sans">
              <span className="text-[#4285F4]">G</span>
              <span className="text-[#EA4335]">o</span>
              <span className="text-[#FBBC05]">o</span>
              <span className="text-[#4285F4]">g</span>
              <span className="text-[#34A853]">l</span>
              <span className="text-[#EA4335]">e</span>
            </div>
            <span className="text-xs text-slate-400 font-semibold px-2 py-0.5 rounded-full bg-slate-800">
              PageRank Search Index
            </span>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search Bar Input */}
        <div className="my-4 relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search Pune websites... (e.g. pizza, food, cheap, canteen)"
            className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-slate-900 border border-slate-700 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-slate-100 text-xs font-medium placeholder-slate-500 outline-none shadow-inner"
          />
        </div>

        {/* Quick Query Suggestions */}
        <div className="flex items-center gap-1.5 mb-3 flex-wrap text-[11px] text-slate-400">
          <span>Try queries:</span>
          {['pizza', 'food', 'pune', 'cheap', 'recipes'].map(tag => (
            <button
              key={tag}
              onClick={() => setQuery(tag)}
              className={`px-2 py-0.5 rounded-lg border transition-colors ${
                query === tag ? 'bg-blue-600 text-white border-blue-500' : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
              }`}
            >
              {tag}
            </button>
          ))}
        </div>

        {/* Results Metadata */}
        <div className="text-[11px] text-slate-400 mb-2 flex items-center justify-between">
          <span>About {results.length} results (0.003 seconds)</span>
          <span className="text-sky-400 font-mono">Ranked by PageRank Score</span>
        </div>

        {/* Results List */}
        <div className="flex-1 overflow-y-auto space-y-3 pr-1 custom-scroll text-xs">
          {results.length === 0 ? (
            <div className="p-6 text-center text-slate-400 bg-slate-900/50 rounded-2xl">
              No matching pages found in the index for "{query}".
            </div>
          ) : (
            results.map((item, idx) => (
              <div
                key={item.id}
                onClick={() => {
                  onSelectPage(item.id);
                  onClose();
                }}
                className="p-3.5 rounded-2xl bg-slate-900/70 border border-slate-800 hover:border-blue-500/50 hover:bg-slate-900 cursor-pointer transition-all space-y-1"
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5 truncate">
                    <span className="text-[10px] text-slate-400 font-mono">https://</span>
                    <span className="text-xs font-mono font-bold text-sky-400 hover:underline truncate">
                      {item.domain}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-500/20 text-blue-400 border border-blue-500/40 font-mono">
                      {item.percentage}% PR
                    </span>
                    <span className="text-[10px] font-mono text-slate-400 bg-slate-800 px-1.5 py-0.5 rounded">
                      Result #{idx + 1}
                    </span>
                  </div>
                </div>

                <h4 className="text-sm font-semibold text-blue-400 hover:underline">
                  {item.title || item.domain}
                </h4>

                <p className="text-slate-300 text-xs leading-relaxed line-clamp-2">
                  {item.description || 'Website registered in the Mini Google network graph.'}
                </p>

                {item.id === 6 && (
                  <p className="text-[10px] text-red-400 mt-1 font-mono">
                    Note: Has 0 incoming links. Despite stuffing "pizza" in its name, PageRank ranks it last!
                  </p>
                )}
              </div>
            ))
          )}
        </div>

        {/* Footer Info */}
        <div className="pt-3 mt-3 border-t border-slate-800 text-[10px] text-slate-400 flex items-center justify-between">
          <span>Google revolutionized search in 1998 by using PageRank to eliminate keyword stuffing.</span>
          <button
            onClick={onClose}
            className="py-1 px-3 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg transition-colors font-medium"
          >
            Close
          </button>
        </div>
      </div>
    </dialog>
  );
}

