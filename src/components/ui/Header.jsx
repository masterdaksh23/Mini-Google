import React from 'react';
import {
  RotateCcw,
  Compass,
  Edit3,
  Search,
  BookOpen,
  CheckCircle2,
  AlertTriangle,
  Play,
  Layers,
  Sparkles
} from 'lucide-react';

export function Header({
  activeMode,
  setActiveMode,
  isAcceptanceCriteriaMet,
  orderString,
  onOpenEditor,
  onOpenSearch,
  onOpenAbout,
  isAutoRotating,
  setIsAutoRotating,
  onResetCamera,
  onResetToSeed,
  selectedPreset,
  onSelectPreset,
  presets
}) {
  return (
    <header className="absolute top-0 left-0 right-0 z-30 flex flex-wrap items-center justify-between gap-3 px-4 py-3 pointer-events-none">
      {/* Brand & Acceptance Badge */}
      <div className="flex items-center gap-3 pointer-events-auto">
        <div className="flex items-center gap-2.5 px-3.5 py-1.5 rounded-2xl glass-panel shadow-lg border border-slate-700/50">
          {/* Google 4-color stylized logo */}
          <div className="flex items-center text-xl font-black tracking-tight font-sans">
            <span className="text-white mr-1 text-sm font-semibold tracking-normal px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700">Mini</span>
            <span className="text-[#4285F4]">G</span>
            <span className="text-[#EA4335]">o</span>
            <span className="text-[#FBBC05]">o</span>
            <span className="text-[#4285F4]">g</span>
            <span className="text-[#34A853]">l</span>
            <span className="text-[#EA4335]">e</span>
          </div>

          <div className="h-4 w-[1px] bg-slate-700 mx-1 hidden sm:block" />

          {/* Seed Verification Badge */}
          <div
            title={`Current ranking order: ${orderString}`}
            className={`hidden md:flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-medium border transition-colors ${
              isAcceptanceCriteriaMet
                ? 'bg-emerald-950/60 text-emerald-300 border-emerald-500/40'
                : 'bg-amber-950/60 text-amber-300 border-amber-500/40'
            }`}
          >
            {isAcceptanceCriteriaMet ? (
              <>
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>Seed Order Verified: <b>2 &gt; 1 &gt; 3 &gt; 4 &gt; 5 &gt; 6</b></span>
              </>
            ) : (
              <>
                <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                <span>Custom Order: <b>{orderString}</b></span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Mode Switcher Tabs */}
      <div className="flex items-center p-1 rounded-2xl glass-panel pointer-events-auto border border-slate-700/60 shadow-xl">
        <button
          onClick={() => setActiveMode('pagerank')}
          className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all duration-200 ${
            activeMode === 'pagerank'
              ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30 ring-1 ring-blue-400/40'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>PageRank (Algorithm)</span>
        </button>

        <button
          onClick={() => setActiveMode('random-surfer')}
          className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all duration-200 ${
            activeMode === 'random-surfer'
              ? 'bg-amber-600 text-white shadow-md shadow-amber-600/30 ring-1 ring-amber-400/40'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
          }`}
        >
          <Play className="w-3.5 h-3.5" />
          <span>Random Surfer (Dice Game)</span>
        </button>

        <button
          onClick={() => setActiveMode('dual')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all duration-200 ${
            activeMode === 'dual'
              ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30 ring-1 ring-emerald-400/40'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Side-by-Side</span>
          <span className="sm:hidden">Dual</span>
        </button>
      </div>

      {/* Right Action Tools */}
      <div className="flex items-center gap-2 pointer-events-auto">
        {/* Search Mini Google button */}
        <button
          onClick={onOpenSearch}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-xl glass-panel hover:bg-slate-800/80 text-slate-200 hover:text-white border border-slate-700/60 shadow-lg transition-all"
          title="Search Mini Google index"
        >
          <Search className="w-3.5 h-3.5 text-sky-400" />
          <span className="hidden sm:inline">Search Google</span>
        </button>

        {/* Edit Graph Modal Trigger */}
        <button
          onClick={onOpenEditor}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-xl glass-panel hover:bg-slate-800/80 text-slate-200 hover:text-white border border-slate-700/60 shadow-lg transition-all"
          title="Add websites and links"
        >
          <Edit3 className="w-3.5 h-3.5 text-emerald-400" />
          <span className="hidden sm:inline">Edit Graph</span>
        </button>

        {/* Preset Selector Dropdown */}
        <div className="relative">
          <select
            value={selectedPreset}
            onChange={(e) => onSelectPreset(e.target.value)}
            className="px-2.5 py-1.5 text-xs font-medium rounded-xl glass-panel text-slate-200 border border-slate-700/60 shadow-lg cursor-pointer outline-none hover:bg-slate-800/80 transition-all appearance-none pr-7"
            title="Load network presets"
          >
            {presets.map(p => (
              <option key={p.id} value={p.id} className="bg-slate-900 text-slate-200">
                {p.name}
              </option>
            ))}
          </select>
          <span className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 text-[10px]">
            ▼
          </span>
        </div>

        {/* Camera Reset */}
        <button
          onClick={onResetCamera}
          className="p-1.5 text-xs font-medium rounded-xl glass-panel hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700/60 transition-all"
          title="Reset Camera View"
        >
          <Compass className="w-4 h-4" />
        </button>

        {/* Auto-Rotation Toggle */}
        <button
          onClick={() => setIsAutoRotating(!isAutoRotating)}
          className={`p-1.5 text-xs font-medium rounded-xl glass-panel border transition-all ${
            isAutoRotating
              ? 'text-sky-400 border-sky-500/50 bg-sky-950/40'
              : 'text-slate-400 border-slate-700 hover:text-slate-200'
          }`}
          title={isAutoRotating ? 'Pause 3D Auto-Rotation' : 'Resume 3D Auto-Rotation'}
        >
          <RotateCcw className={`w-4 h-4 ${isAutoRotating ? 'animate-spin-slow' : ''}`} />
        </button>

        {/* About Guide */}
        <button
          onClick={onOpenAbout}
          className="p-1.5 text-xs font-medium rounded-xl glass-panel hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700/60 transition-all"
          title="Algorithm & Dice Game Explanation"
        >
          <BookOpen className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
}

