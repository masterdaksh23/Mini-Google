import React, { useState, useRef, useEffect } from 'react';
import {
  Plus,
  Trash2,
  ExternalLink,
  Globe,
  Link2,
  RotateCcw,
  AlertCircle,
  X,
  Check
} from 'lucide-react';

export function GraphEditorModal({
  isOpen,
  onClose,
  pages,
  links,
  onAddPage,
  onRemovePage,
  onAddLink,
  onRemoveLink,
  onResetSeed,
  onSelectPreset,
  presets,
  selectedPreset
}) {
  const dialogRef = useRef(null);

  // New Page Form State
  const [newDomain, setNewDomain] = useState('');
  const [newTitle, setNewTitle] = useState('');
  const [newColor, setNewColor] = useState('#38bdf8');
  const [domainError, setDomainError] = useState('');

  // New Link Form State
  const [sourceId, setSourceId] = useState(pages[0]?.id || 1);
  const [targetId, setTargetId] = useState(pages[1]?.id || 2);
  const [linkError, setLinkError] = useState('');
  const [successToast, setSuccessToast] = useState('');

  // Native HTMLDialogElement control per Modern Web Guidance
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

  // Handle native cancel (Esc key)
  const handleCancel = (e) => {
    e.preventDefault();
    onClose();
  };

  // Basic URL / Domain validation
  const validateDomain = (input) => {
    const cleaned = input.trim().replace(/^https?:\/\//i, '').replace(/\/.*$/, '');
    if (!cleaned) {
      return { valid: false, error: 'Domain name is required' };
    }
    // Check reasonable domain format: word characters, dots, hyphens
    const domainRegex = /^[a-zA-Z0-9][a-zA-Z0-9-]{0,61}[a-zA-Z0-9]?(\.[a-zA-Z]{2,})+$/;
    if (!domainRegex.test(cleaned)) {
      return { valid: false, error: 'Please enter a valid domain (e.g. foodies-hub.com)' };
    }
    // Check duplicate domain
    if (pages.some(p => p.domain.toLowerCase() === cleaned.toLowerCase())) {
      return { valid: false, error: 'A page with this domain already exists!' };
    }
    return { valid: true, domain: cleaned };
  };

  const handleCreatePage = (e) => {
    e.preventDefault();
    setDomainError('');

    const validation = validateDomain(newDomain);
    if (!validation.valid) {
      setDomainError(validation.error);
      return;
    }

    const title = newTitle.trim() || validation.domain.split('.')[0].replace(/-/g, ' ');
    onAddPage({
      domain: validation.domain,
      title,
      colorHint: newColor
    });

    setNewDomain('');
    setNewTitle('');
    setSuccessToast(`Added website "${validation.domain}"! PageRank updated.`);
    setTimeout(() => setSuccessToast(''), 3000);
  };

  const handleCreateLink = (e) => {
    e.preventDefault();
    setLinkError('');

    const src = Number(sourceId);
    const tgt = Number(targetId);

    if (src === tgt) {
      setLinkError('Self-links (from a page to itself) are not allowed.');
      return;
    }

    // Check if link already exists
    const exists = links.some(l => Number(l.source) === src && Number(l.target) === tgt);
    if (exists) {
      setLinkError('This directed link already exists!');
      return;
    }

    onAddLink(src, tgt);
    setSuccessToast(`Linked Page ${src} → Page ${tgt}! PageRank authority flowing.`);
    setTimeout(() => setSuccessToast(''), 3000);
  };

  const pageMap = new Map(pages.map(p => [p.id, p]));

  return (
    <dialog
      ref={dialogRef}
      onCancel={handleCancel}
      aria-labelledby="editor-title"
      className="m-auto rounded-3xl p-0 bg-transparent text-slate-100 max-w-2xl w-full border border-slate-700/80 shadow-2xl backdrop:bg-black/75 backdrop:backdrop-blur-sm"
    >
      <div className="glass-panel rounded-3xl p-6 border border-slate-700/60 flex flex-col max-h-[88vh]">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              <Globe className="w-5 h-5" />
            </div>
            <div>
              <h2 id="editor-title" className="text-base font-bold text-slate-100">
                Interactive Graph & Network Editor
              </h2>
              <p className="text-xs text-slate-400">
                Add websites, wire up directed links, and watch PageRank authority shift dynamically in real-time.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
            title="Close editor"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Feedback Alert Toast */}
        {successToast && (
          <div className="mb-4 px-3.5 py-2 rounded-xl bg-emerald-950/80 border border-emerald-500/50 text-emerald-300 text-xs flex items-center gap-2 animate-fade-in">
            <Check className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{successToast}</span>
          </div>
        )}

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto space-y-6 pr-2 custom-scroll text-xs">
          {/* Preset Networks Bar */}
          <div className="rounded-2xl p-3.5 bg-slate-900/60 border border-slate-800 flex items-center justify-between gap-3">
            <div>
              <span className="font-semibold text-slate-200 block text-xs">Load Graph Preset</span>
              <span className="text-[11px] text-slate-400">
                Quickly switch between classic network topologies.
              </span>
            </div>
            <div className="flex items-center gap-2">
              <select
                value={selectedPreset}
                onChange={(e) => onSelectPreset(e.target.value)}
                className="px-3 py-1.5 rounded-xl bg-slate-800 text-slate-200 border border-slate-700 text-xs font-medium cursor-pointer"
              >
                {presets.map(p => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
              <button
                type="button"
                onClick={onResetSeed}
                className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-300 border border-slate-700 font-semibold flex items-center gap-1.5 transition-colors"
                title="Reset to Pune Pizza seed data"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset Seed</span>
              </button>
            </div>
          </div>

          {/* Section 1: Add Website Form */}
          <form onSubmit={handleCreatePage} className="rounded-2xl p-4 bg-slate-900/80 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-slate-200 flex items-center gap-2 text-xs uppercase tracking-wider">
                <Plus className="w-4 h-4 text-sky-400" />
                <span>Add New Website</span>
              </h3>
              <span className="text-[10px] text-slate-500">Node ID auto-assigned</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-medium text-slate-300 mb-1">
                  Domain / URL *
                </label>
                <input
                  type="text"
                  placeholder="e.g. organic-farms-pune.in"
                  value={newDomain}
                  onChange={(e) => {
                    setNewDomain(e.target.value);
                    if (domainError) setDomainError('');
                  }}
                  className={`w-full px-3 py-2 rounded-xl bg-slate-950/80 border text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-1 ${
                    domainError ? 'border-red-500 focus:ring-red-500' : 'border-slate-700 focus:ring-sky-500'
                  }`}
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-slate-300 mb-1">
                  Display Title (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Pune Organic Farms"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950/80 border border-slate-700 text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
                />
              </div>
            </div>

            {domainError && (
              <p className="text-red-400 text-[11px] flex items-center gap-1.5">
                <AlertCircle className="w-3.5 h-3.5" />
                <span>{domainError}</span>
              </p>
            )}

            <div className="flex items-center justify-between pt-1">
              <div className="flex items-center gap-2">
                <span className="text-[11px] text-slate-400">Sphere Color:</span>
                <div className="flex items-center gap-1.5">
                  {['#38bdf8', '#22c55e', '#a855f7', '#f97316', '#eab308', '#ec4899'].map(c => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setNewColor(c)}
                      className={`w-5 h-5 rounded-full transition-transform ${newColor === c ? 'scale-125 ring-2 ring-white' : 'hover:scale-110'}`}
                      style={{ backgroundColor: c }}
                    />
                  ))}
                </div>
              </div>

              <button
                type="submit"
                className="py-1.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold flex items-center gap-1.5 shadow-md shadow-blue-600/30 transition-all"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Website</span>
              </button>
            </div>
          </form>

          {/* Section 2: Add Directed Link Form */}
          <form onSubmit={handleCreateLink} className="rounded-2xl p-4 bg-slate-900/80 border border-slate-800 space-y-3">
            <h3 className="font-bold text-slate-200 flex items-center gap-2 text-xs uppercase tracking-wider">
              <Link2 className="w-4 h-4 text-emerald-400" />
              <span>Add Directed Link (Source → Target)</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-center">
              <div>
                <label className="block text-[11px] font-medium text-slate-300 mb-1">
                  Source (Linking From)
                </label>
                <select
                  value={sourceId}
                  onChange={(e) => setSourceId(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950/80 border border-slate-700 text-slate-100 font-mono text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500 cursor-pointer"
                >
                  {pages.map(p => (
                    <option key={`src-${p.id}`} value={p.id}>
                      #{p.id} {p.domain}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-medium text-slate-300 mb-1">
                  Target (Receiving Authority)
                </label>
                <select
                  value={targetId}
                  onChange={(e) => setTargetId(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950/80 border border-slate-700 text-slate-100 font-mono text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500 cursor-pointer"
                >
                  {pages.map(p => (
                    <option key={`tgt-${p.id}`} value={p.id}>
                      #{p.id} {p.domain}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {linkError && (
              <p className="text-red-400 text-[11px] flex items-center gap-1.5">
                <AlertCircle className="w-3.5 h-3.5" />
                <span>{linkError}</span>
              </p>
            )}

            <div className="flex justify-end pt-1">
              <button
                type="submit"
                className="py-1.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold flex items-center gap-1.5 shadow-md shadow-emerald-600/30 transition-all"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Directed Link</span>
              </button>
            </div>
          </form>

          {/* Section 3: Existing Links Management */}
          <div className="rounded-2xl p-4 bg-slate-900/60 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-slate-200 text-xs uppercase tracking-wider">
                Existing Directed Links ({links.length})
              </h3>
              <span className="text-[10px] text-slate-400">Click trash to remove link</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto pr-1 custom-scroll">
              {links.map((link) => {
                const srcPage = pageMap.get(Number(link.source));
                const tgtPage = pageMap.get(Number(link.target));
                const linkId = link.id || `${link.source}-${link.target}`;

                return (
                  <div
                    key={linkId}
                    className="flex items-center justify-between px-3 py-1.5 rounded-xl bg-slate-950/70 border border-slate-800 text-slate-300 font-mono text-[11px] group hover:border-slate-700"
                  >
                    <div className="flex items-center gap-1.5 truncate mr-2">
                      <span className="font-bold text-amber-400 truncate max-w-[90px]">
                        {srcPage?.domain.split('.')[0] || link.source}
                      </span>
                      <span className="text-slate-500 font-sans">→</span>
                      <span className="font-bold text-emerald-400 truncate max-w-[90px]">
                        {tgtPage?.domain.split('.')[0] || link.target}
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => onRemoveLink(link.source, link.target)}
                      className="text-slate-500 hover:text-red-400 p-1 rounded-lg transition-colors"
                      title="Remove directed link"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Section 4: Current Pages List */}
          <div className="rounded-2xl p-4 bg-slate-900/60 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-slate-200 text-xs uppercase tracking-wider">
                Manage Pages ({pages.length})
              </h3>
              <span className="text-[10px] text-slate-400">Minimum 2 pages required</span>
            </div>

            <div className="space-y-1.5 max-h-44 overflow-y-auto pr-1 custom-scroll">
              {pages.map(page => (
                <div
                  key={page.id}
                  className="flex items-center justify-between px-3 py-1.5 rounded-xl bg-slate-950/70 border border-slate-800 text-xs"
                >
                  <div className="flex items-center gap-2 truncate">
                    <span
                      className="w-3 h-3 rounded-full shrink-0"
                      style={{ backgroundColor: page.colorHint || '#38bdf8' }}
                    />
                    <span className="font-bold font-mono text-slate-400">#{page.id}</span>
                    <span className="font-mono text-slate-200 truncate">{page.domain}</span>
                    {page.title && (
                      <span className="text-[11px] text-slate-500 truncate hidden sm:inline">
                        ({page.title})
                      </span>
                    )}
                  </div>

                  {pages.length > 2 && (
                    <button
                      type="button"
                      onClick={() => onRemovePage(page.id)}
                      className="text-slate-500 hover:text-red-400 p-1 rounded-lg transition-colors"
                      title="Delete website"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="pt-4 mt-4 border-t border-slate-800 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="py-2 px-5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-100 font-semibold text-xs transition-colors"
          >
            Done Editing
          </button>
        </div>
      </div>
    </dialog>
  );
}

