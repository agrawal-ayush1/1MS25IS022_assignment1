import React, { useState, useEffect } from 'react';
import {
  Search,
  BookOpen,
  ExternalLink,
  ShieldCheck,
  CheckSquare,
  Square,
  Plus,
  ArrowRight,
  ArrowLeft,
  Filter,
  Sparkles,
  Globe,
  Database
} from 'lucide-react';
import { PaperSource, ResearchProjectConfig } from '../../types/research';

interface Stage3SourcesProps {
  project: ResearchProjectConfig;
  papers: PaperSource[];
  onUpdatePapers: (papers: PaperSource[]) => void;
  onBack: () => void;
  onProceedToVerify: () => void;
}

export const Stage3Sources: React.FC<Stage3SourcesProps> = ({
  project,
  papers,
  onUpdatePapers,
  onBack,
  onProceedToVerify,
}) => {
  const [query, setQuery] = useState(
    project.booleanSearchQueries[0] || project.topic || 'deep learning'
  );
  const [selectedDatabases, setSelectedDatabases] = useState<string[]>([
    'arxiv',
    'crossref',
    'europepmc',
  ]);
  const [searching, setSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Manual paper modal state
  const [showManualModal, setShowManualModal] = useState(false);
  const [manualTitle, setManualTitle] = useState('');
  const [manualAuthors, setManualAuthors] = useState('');
  const [manualVenue, setManualVenue] = useState('');
  const [manualYear, setManualYear] = useState('2024');
  const [manualDoi, setManualDoi] = useState('');
  const [manualAbstract, setManualAbstract] = useState('');

  // Initial search if no papers loaded yet
  useEffect(() => {
    if (papers.length === 0 && project.topic.trim()) {
      handleSearch();
    }
  }, []);

  const handleSearch = async () => {
    if (!query.trim()) return;
    setSearching(true);
    setError(null);

    try {
      const res = await fetch('/api/research/search-sources', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: query.trim(),
          databases: selectedDatabases,
        }),
      });

      const data = await res.json();
      if (!data.success) throw new Error(data.error || 'Failed to search academic sources');

      const incoming: PaperSource[] = (data.papers || []).map((p: any) => ({
        ...p,
        selected: true,
      }));

      // Merge with existing papers avoiding duplicates
      const existingIds = new Set(papers.map((p) => p.doi || p.title.toLowerCase()));
      const filtered = incoming.filter((p) => !existingIds.has(p.doi || p.title.toLowerCase()));
      onUpdatePapers([...papers, ...filtered]);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Error querying scholarly repositories');
    } finally {
      setSearching(false);
    }
  };

  const toggleSelectPaper = (id: string) => {
    onUpdatePapers(
      papers.map((p) => (p.id === id ? { ...p, selected: !p.selected } : p))
    );
  };

  const selectAll = (select: boolean) => {
    onUpdatePapers(papers.map((p) => ({ ...p, selected: select })));
  };

  const handleAddManualPaper = () => {
    if (!manualTitle.trim()) return;

    const newPaper: PaperSource = {
      id: `manual-${Date.now()}`,
      title: manualTitle.trim(),
      authors: manualAuthors
        ? manualAuthors.split(',').map((s) => s.trim())
        : ['Author'],
      venue: manualVenue.trim() || 'Scholarly Journal / Proceedings',
      year: Number(manualYear) || 2024,
      doi: manualDoi.trim() || undefined,
      url: manualDoi.trim() ? `https://doi.org/${manualDoi.trim()}` : undefined,
      abstract: manualAbstract.trim() || 'Peer-reviewed academic publication.',
      sourceType: 'manual',
      verified: true,
      selected: true,
    };

    onUpdatePapers([newPaper, ...papers]);
    setShowManualModal(false);
    setManualTitle('');
    setManualAuthors('');
    setManualVenue('');
    setManualDoi('');
    setManualAbstract('');
  };

  const selectedCount = papers.filter((p) => p.selected).length;

  return (
    <div className="space-y-8 animate-fadeIn max-w-5xl mx-auto">
      {/* Stage Header */}
      <div className="bg-gradient-to-r from-slate-900 via-emerald-950/30 to-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-xl">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-600/20 border border-emerald-500/30 flex items-center justify-center shrink-0">
              <Search className="w-6 h-6 text-emerald-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  Stage 3 of 10
                </span>
                <span className="text-xs text-slate-400">Literature Search Execution</span>
              </div>
              <h2 className="text-2xl font-bold text-white tracking-tight mt-1">
                Find Scholarly Sources
              </h2>
              <p className="text-sm text-slate-400 mt-1">
                Query scholarly databases (arXiv, CrossRef, Europe PMC) for peer-reviewed journal papers and verified preprints.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setShowManualModal(true)}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 transition border border-slate-700"
          >
            <Plus className="w-4 h-4 text-emerald-400" />
            <span>Add Paper by DOI</span>
          </button>
        </div>

        {/* Database Filters & Live Search Bar */}
        <div className="mt-6 pt-6 border-t border-slate-800/80 space-y-4">
          <div className="flex flex-wrap items-center gap-4 text-xs">
            <span className="text-slate-400 font-medium flex items-center gap-1.5">
              <Database className="w-3.5 h-3.5 text-indigo-400" />
              Target Repositories:
            </span>
            {[
              { id: 'arxiv', label: 'arXiv Preprints (CS/Math/Physics)' },
              { id: 'crossref', label: 'CrossRef (Peer-Reviewed Journals & DOIs)' },
              { id: 'europepmc', label: 'Europe PMC / PubMed (Life Sciences & Bio)' },
            ].map((db) => (
              <label key={db.id} className="flex items-center gap-1.5 cursor-pointer text-slate-300 hover:text-white">
                <input
                  type="checkbox"
                  checked={selectedDatabases.includes(db.id)}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setSelectedDatabases([...selectedDatabases, db.id]);
                    } else {
                      setSelectedDatabases(selectedDatabases.filter((d) => d !== db.id));
                    }
                  }}
                  className="rounded accent-emerald-500 bg-slate-900 border-slate-700"
                />
                <span>{db.label}</span>
              </label>
            ))}
          </div>

          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleSearch())}
                placeholder="Search literature by topic, keywords, or Boolean string..."
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-3 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            <button
              type="button"
              onClick={handleSearch}
              disabled={searching || !query.trim()}
              className="px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold text-sm transition-all shadow-lg shadow-emerald-600/20 flex items-center gap-2 shrink-0"
            >
              {searching ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                  <span>Searching...</span>
                </>
              ) : (
                <>
                  <Search className="w-4 h-4" />
                  <span>Search Repositories</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-sm">
          {error}
        </div>
      )}

      {/* Results Header & Selection Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h3 className="text-base font-bold text-slate-100">
            Retrieved Scholarly Sources
          </h3>
          <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-800 text-slate-300">
            {papers.length} Papers
          </span>
          <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            {selectedCount} Selected
          </span>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <button
            type="button"
            onClick={() => selectAll(true)}
            className="text-slate-400 hover:text-slate-200 transition"
          >
            Select All
          </button>
          <span className="text-slate-700">|</span>
          <button
            type="button"
            onClick={() => selectAll(false)}
            className="text-slate-400 hover:text-slate-200 transition"
          >
            Deselect All
          </button>
        </div>
      </div>

      {/* Papers List */}
      <div className="space-y-3.5">
        {papers.map((paper) => (
          <div
            key={paper.id}
            onClick={() => toggleSelectPaper(paper.id)}
            className={`p-5 rounded-2xl border transition-all cursor-pointer ${
              paper.selected
                ? 'bg-slate-900/90 border-emerald-500/50 shadow-md shadow-emerald-950/20 ring-1 ring-emerald-500/20'
                : 'bg-slate-950/60 border-slate-800 hover:border-slate-700 text-slate-400'
            }`}
          >
            <div className="flex items-start gap-3.5">
              <button
                type="button"
                className="mt-1 text-slate-400 hover:text-emerald-400 transition shrink-0"
              >
                {paper.selected ? (
                  <CheckSquare className="w-5 h-5 text-emerald-400" />
                ) : (
                  <Square className="w-5 h-5 text-slate-600" />
                )}
              </button>

              <div className="flex-1 space-y-2">
                <div className="flex flex-wrap items-center gap-2">
                  <span className={`text-[10px] font-semibold px-2 py-0.5 rounded uppercase tracking-wider ${
                    paper.sourceType === 'arxiv'
                      ? 'bg-red-500/10 text-red-400 border border-red-500/20'
                      : paper.sourceType === 'europepmc'
                      ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                      : 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20'
                  }`}>
                    {paper.sourceType}
                  </span>
                  <span className="text-xs text-slate-400 font-medium">
                    {paper.venue} • {paper.year}
                  </span>
                  {paper.doi && (
                    <span className="text-[11px] font-mono-code text-slate-400 bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
                      DOI: {paper.doi}
                    </span>
                  )}
                  {paper.citationCount !== undefined && paper.citationCount > 0 && (
                    <span className="text-[10px] text-amber-400 font-semibold bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                      {paper.citationCount} Citations
                    </span>
                  )}
                </div>

                <h4 className="text-sm sm:text-base font-bold text-slate-100 leading-snug">
                  {paper.title}
                </h4>

                <p className="text-xs text-slate-400">
                  <span className="text-slate-500">Authors:</span> {paper.authors.join(', ')}
                </p>

                <p className="text-xs text-slate-300 leading-relaxed line-clamp-3">
                  {paper.abstract}
                </p>

                {paper.url && (
                  <div className="pt-1">
                    <a
                      href={paper.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-400 hover:text-emerald-300"
                    >
                      <span>Read Original Source</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}

        {papers.length === 0 && !searching && (
          <div className="text-center py-16 bg-slate-900/30 border border-dashed border-slate-800 rounded-2xl space-y-3">
            <BookOpen className="w-8 h-8 text-slate-600 mx-auto" />
            <h4 className="text-sm font-semibold text-slate-300">
              No papers found for this query
            </h4>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              Try adjusting your search terms, broadening the Boolean operators, or click &quot;Add Paper by DOI&quot;.
            </p>
          </div>
        )}
      </div>

      {/* Manual Paper Modal */}
      {showManualModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Plus className="w-4 h-4 text-emerald-400" />
              <span>Add Verified Academic Source</span>
            </h3>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Paper Title *</label>
                <input
                  type="text"
                  value={manualTitle}
                  onChange={(e) => setManualTitle(e.target.value)}
                  placeholder="e.g. Attention Is All You Need"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-slate-100"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Authors (comma-separated)</label>
                <input
                  type="text"
                  value={manualAuthors}
                  onChange={(e) => setManualAuthors(e.target.value)}
                  placeholder="e.g. Vaswani, Shazeer, Parmar, Uszkoreit"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-slate-100"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Publication Venue</label>
                  <input
                    type="text"
                    value={manualVenue}
                    onChange={(e) => setManualVenue(e.target.value)}
                    placeholder="e.g. NeurIPS, IEEE, Nature"
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-slate-100"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Year</label>
                  <input
                    type="number"
                    value={manualYear}
                    onChange={(e) => setManualYear(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-slate-100"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">DOI / URL</label>
                <input
                  type="text"
                  value={manualDoi}
                  onChange={(e) => setManualDoi(e.target.value)}
                  placeholder="e.g. 10.48550/arXiv.1706.03762"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-slate-100"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Abstract Summary</label>
                <textarea
                  value={manualAbstract}
                  onChange={(e) => setManualAbstract(e.target.value)}
                  rows={3}
                  placeholder="Paste abstract or empirical summary..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-slate-100"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setShowManualModal(false)}
                className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleAddManualPaper}
                disabled={!manualTitle.trim()}
                className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-xs font-semibold"
              >
                Save Source
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Navigation Buttons */}
      <div className="flex items-center justify-between pt-4 border-t border-slate-800">
        <button
          type="button"
          onClick={onBack}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 font-semibold text-xs transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Plan</span>
        </button>

        <button
          type="button"
          onClick={onProceedToVerify}
          disabled={selectedCount === 0}
          className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-indigo-600 hover:from-emerald-500 hover:to-indigo-500 disabled:opacity-50 text-white font-bold text-sm transition-all shadow-lg shadow-emerald-600/30"
        >
          <span>Verify Selected Sources ({selectedCount})</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
