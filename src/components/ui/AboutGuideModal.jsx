import React, { useRef, useEffect } from 'react';
import {
  BookOpen,
  Sparkles,
  Dice5,
  Layers,
  Network,
  X,
  CheckCircle2
} from 'lucide-react';

export function AboutGuideModal({ isOpen, onClose }) {
  const dialogRef = useRef(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (isOpen) {
      if (!dialog.open) {
        dialog.showModal();
      }
    } else {
      if (dialog.open) {
        dialog.close();
      }
    }
  }, [isOpen]);

  return (
    <dialog
      ref={dialogRef}
      onCancel={onClose}
      aria-labelledby="about-title"
      className="m-auto rounded-3xl p-0 bg-transparent text-slate-100 max-w-2xl w-full border border-slate-700/80 shadow-2xl backdrop:bg-black/75 backdrop:backdrop-blur-sm"
    >
      <div className="glass-panel rounded-3xl p-6 border border-slate-700/60 flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-blue-500/20 text-blue-400 border border-blue-500/30">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h2 id="about-title" className="text-base font-bold text-slate-100">
                About Mini Google & PageRank
              </h2>
              <p className="text-xs text-slate-400">
                Mathematical foundations and physical dice game intuition
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto space-y-4 pr-1 text-xs text-slate-300 leading-relaxed custom-scroll">
          {/* Card 1: What is PageRank */}
          <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-2">
            <h3 className="font-bold text-slate-100 flex items-center gap-2 text-sm text-sky-400">
              <Sparkles className="w-4 h-4" />
              <span>1. The PageRank Algorithm</span>
            </h3>
            <p>
              Invented by Larry Page and Sergey Brin in 1998 at Stanford, PageRank computes the authority of websites based on the web's hyperlink structure.
            </p>
            <p>
              Instead of just counting raw link numbers, a link from a <b>high-authority page counts more</b> than a link from an obscure page. If a high-ranked page points to multiple sites, its vote is split equally among its out-links:
            </p>
            <div className="p-2.5 rounded-xl bg-slate-950 font-mono text-[11px] text-emerald-400 border border-slate-800">
              PR(u) = (1 - d)/N + d × ∑ [ PR(v) / Out(v) ]
            </div>
            <p className="text-slate-400 text-[11px]">
              Where <b>d = 0.85</b> is the damping factor (representing an 85% probability of following a link and a 15% probability of jumping to a random page).
            </p>
          </div>

          {/* Card 2: The Dice Game */}
          <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-2">
            <h3 className="font-bold text-slate-100 flex items-center gap-2 text-sm text-amber-400">
              <Dice5 className="w-4 h-4" />
              <span>2. The Random Surfer Dice Game</span>
            </h3>
            <p>
              The Random Surfer provides the physical, intuitive model for PageRank:
            </p>
            <ul className="list-disc list-inside space-y-1 text-slate-300 ml-2">
              <li><b>Start:</b> Roll a die (1–6) to land on your first page, adding a <b>"|"</b> tally line.</li>
              <li>
                <b>Each Turn:</b> Roll again:
                <ul className="list-circle list-inside ml-4 text-slate-400">
                  <li><b>Roll 6 (16.7% boredom):</b> Teleport! Roll again to jump to any page at random.</li>
                  <li>
                    <b>Roll 1–5:</b> Follow an outgoing link. If 2 links exist, roll again:
                    <span className="text-amber-300"> odd (1,3,5) → 1st arrow</span>,{' '}
                    <span className="text-sky-300">even (2,4,6) → 2nd arrow</span>.
                  </li>
                </ul>
              </li>
              <li><b>20-Line Game:</b> Tally stops at 20 visits.</li>
              <li><b>10,000 Trials:</b> Running 10,000 rolls aggregates the stationary distribution of the Markov chain, converging directly to the PageRank order!</li>
            </ul>
          </div>

          {/* Card 3: The Seed Dataset */}
          <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-2">
            <h3 className="font-bold text-slate-100 flex items-center gap-2 text-sm text-emerald-400">
              <CheckCircle2 className="w-4 h-4" />
              <span>3. Seed Data & Expected Results</span>
            </h3>
            <p>
              The Pune Food & Pizza network demonstrates why quality links beat spam:
            </p>
            <div className="grid grid-cols-2 gap-2 text-[11px] font-mono">
              <div className="p-2 rounded-xl bg-emerald-950/40 border border-emerald-500/40 text-emerald-300">
                <b>#1 best-pizza-pune.com (39.3%)</b><br />
                Has 4 high-quality incoming links from local guides, blogs, and recipe sites.
              </div>
              <div className="p-2 rounded-xl bg-red-950/40 border border-red-500/40 text-red-300">
                <b>#6 pizza-pizza-pizza.com (2.5%)</b><br />
                Has 0 incoming links. Only gets base damping score, ranking dead last.
              </div>
            </div>
            <p className="text-[11px] text-slate-400">
              Verified order: <b>2 best-pizza-pune.com &gt; 1 pune-food-guide.com &gt; 3 college-canteen-blog.com &gt; 4 pizza-recipes-home.com &gt; 5 cheap-eats-pune.com &gt; 6 pizza-pizza-pizza.com</b>
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="pt-3 mt-3 border-t border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="py-1.5 px-5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-100 font-semibold text-xs transition-colors"
          >
            Close Guide
          </button>
        </div>
      </div>
    </dialog>
  );
}

