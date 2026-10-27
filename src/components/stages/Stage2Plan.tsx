import React, { useState } from 'react';
import {
  FileSearch,
  Tag,
  Code2,
  Filter,
  CheckCircle,
  Plus,
  Trash2,
  ArrowRight,
  ArrowLeft,
  Copy,
  Sparkles
} from 'lucide-react';
import { ResearchProjectConfig } from '../../types/research';

interface Stage2PlanProps {
  project: ResearchProjectConfig;
  onUpdateProject: (updates: Partial<ResearchProjectConfig>) => void;
  onBack: () => void;
  onProceedToSearch: () => void;
}

export const Stage2Plan: React.FC<Stage2PlanProps> = ({
  project,
  onUpdateProject,
  onBack,
  onProceedToSearch,
}) => {
  const [newKeyword, setNewKeyword] = useState('');
  const [copiedQuery, setCopiedQuery] = useState<number | null>(null);

  // Default keywords if empty
  const defaultKeywords = project.searchKeywords.length > 0 ? project.searchKeywords : [
    project.topic.split(' ').slice(0, 3).join(' '),
    'systematic review',
    'empirical benchmark',
    'state of the art',
    'performance trade-off'
  ];

  const handleAddKeyword = () => {
    if (newKeyword.trim()) {
      const updated = Array.from(new Set([...(project.searchKeywords || []), newKeyword.trim()]));
      onUpdateProject({ searchKeywords: updated });
      setNewKeyword('');
    }
  };

  const handleRemoveKeyword = (kw: string) => {
    onUpdateProject({
      searchKeywords: project.searchKeywords.filter((k) => k !== kw),
    });
  };

  const handleCopyQuery = (query: string, index: number) => {
    navigator.clipboard.writeText(query);
    setCopiedQuery(index);
    setTimeout(() => setCopiedQuery(null), 2000);
  };

  return (
    <div className="space-y-8 animate-fadeIn max-w-5xl mx-auto">
      {/* Stage Header */}
      <div className="bg-gradient-to-r from-slate-900 via-sky-950/40 to-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-xl">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-sky-600/20 border border-sky-500/30 flex items-center justify-center shrink-0">
            <FileSearch className="w-6 h-6 text-sky-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-sky-500/10 text-sky-400 border border-sky-500/20">
                Stage 2 of 10
              </span>
              <span className="text-xs text-slate-400">Search Strategy Formulation</span>
            </div>
            <h2 className="text-2xl font-bold text-white tracking-tight mt-1">
              Plan the Research & Formulate Queries
            </h2>
            <p className="text-sm text-slate-400 mt-1">
              Break the research questions into searchable subtopics, academic keywords, Boolean retrieval operators, and inclusion/exclusion filters.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Keywords & Boolean Search Strings */}
        <div className="lg:col-span-2 space-y-6">
          {/* Academic Keywords Tags */}
          <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Tag className="w-4 h-4 text-sky-400" />
                <h3 className="text-base font-bold text-slate-100">
                  Searchable Academic Keywords & MeSH Terms
                </h3>
              </div>
              <span className="text-xs text-slate-400">
                {(project.searchKeywords?.length || 0)} keywords
              </span>
            </div>

            <div className="flex flex-wrap gap-2 pt-1">
              {(project.searchKeywords.length > 0 ? project.searchKeywords : defaultKeywords).map((kw, i) => (
                <span
                  key={i}
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-slate-950 border border-slate-700/80 text-xs text-slate-200 group"
                >
                  <span>{kw}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveKeyword(kw)}
                    className="text-slate-500 hover:text-rose-400 transition"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>

            <div className="flex gap-2 pt-2">
              <input
                type="text"
                value={newKeyword}
                onChange={(e) => setNewKeyword(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddKeyword())}
                placeholder="Add subtopic keyword or index term..."
                className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
              />
              <button
                type="button"
                onClick={handleAddKeyword}
                className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add</span>
              </button>
            </div>
          </div>

          {/* Formulated Boolean Query Expressions */}
          <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-6 space-y-4">
            <div className="flex items-center gap-2">
              <Code2 className="w-4 h-4 text-indigo-400" />
              <h3 className="text-base font-bold text-slate-100">
                Boolean Query Formulations
              </h3>
            </div>
            <p className="text-xs text-slate-400">
              Synthesized boolean queries optimized for academic search engines (arXiv API, CrossRef, PubMed, IEEE Xplore).
            </p>

            <div className="space-y-3 pt-1">
              {(project.booleanSearchQueries.length > 0 ? project.booleanSearchQueries : [
                `("${project.topic}") AND ("empirical" OR "benchmark" OR "review")`,
                `("${project.searchKeywords[0] || 'efficiency'}" OR "${project.searchKeywords[1] || 'optimization'}") AND ("latency" OR "throughput")`
              ]).map((query, idx) => (
                <div
                  key={idx}
                  className="p-3.5 rounded-xl bg-slate-950 border border-slate-800/80 font-mono-code text-xs text-sky-300 flex items-center justify-between gap-3 group"
                >
                  <span className="truncate">{query}</span>
                  <button
                    type="button"
                    onClick={() => handleCopyQuery(query, idx)}
                    className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white transition shrink-0"
                    title="Copy search query"
                  >
                    {copiedQuery === idx ? (
                      <span className="text-[10px] text-emerald-400 font-sans font-semibold">Copied!</span>
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Search Strategy & Criteria */}
        <div className="space-y-6">
          <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-6 space-y-4">
            <div className="flex items-center gap-2 text-sm font-bold text-slate-100 border-b border-slate-800 pb-3">
              <Filter className="w-4 h-4 text-emerald-400" />
              <span>Inclusion & Exclusion Strategy</span>
            </div>

            <div className="space-y-3">
              <div>
                <span className="text-xs font-semibold text-emerald-400 flex items-center gap-1.5">
                  <CheckCircle className="w-3.5 h-3.5" />
                  Inclusion Criteria:
                </span>
                <ul className="mt-1 space-y-1 text-xs text-slate-300 list-disc list-inside">
                  <li>Peer-reviewed publications and verified arXiv preprints</li>
                  <li>Directly addresses stated research questions (RQ1-RQ3)</li>
                  <li>Reports reproducible methodology or empirical evaluation</li>
                  <li>Published within 2018–2025 (or seminal foundational works)</li>
                </ul>
              </div>

              <div className="pt-2 border-t border-slate-800/80">
                <span className="text-xs font-semibold text-rose-400 flex items-center gap-1.5">
                  <span className="w-3.5 h-3.5 rounded-full bg-rose-500/20 text-rose-400 text-center leading-none text-[10px] flex items-center justify-center">✕</span>
                  Exclusion Criteria:
                </span>
                <ul className="mt-1 space-y-1 text-xs text-slate-400 list-disc list-inside">
                  <li>Non-academic opinion blogs or speculative news editorials</li>
                  <li>Duplicate preprints superseded by final journal versions</li>
                  <li>Studies with insufficient experimental disclosure</li>
                  <li>Unverified citations lacking verifiable DOIs</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-indigo-500/5 border border-indigo-500/20 text-xs text-slate-300 space-y-2">
            <div className="flex items-center gap-1.5 font-bold text-indigo-300">
              <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
              <span>Search Database Target:</span>
            </div>
            <p className="text-slate-400 text-[11px] leading-relaxed">
              In Stage 3, ScholarForge connects directly to real APIs: <strong>arXiv API</strong>, <strong>CrossRef Registry</strong>, and <strong>Europe PMC</strong> for peer-reviewed papers with exact DOIs.
            </p>
          </div>
        </div>
      </div>

      {/* Navigation Buttons */}
      <div className="flex items-center justify-between pt-4 border-t border-slate-800">
        <button
          type="button"
          onClick={onBack}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 font-semibold text-xs transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Topic</span>
        </button>

        <button
          type="button"
          onClick={onProceedToSearch}
          className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-500 hover:to-indigo-500 text-white font-bold text-sm transition-all shadow-lg shadow-sky-600/30"
        >
          <span>Proceed to Stage 3: Find Sources</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
