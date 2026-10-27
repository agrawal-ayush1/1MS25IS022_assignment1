import React, { useState } from 'react';
import {
  TableProperties,
  Sparkles,
  Download,
  Filter,
  Search,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  ArrowRight,
  ArrowLeft,
  FileSpreadsheet
} from 'lucide-react';
import { EvidenceMatrixEntry, PaperSource, ResearchProjectConfig } from '../../types/research';
import { generateEvidenceMatrixCSV, downloadFile } from '../../utils/academicHelpers';

interface Stage5MatrixProps {
  project: ResearchProjectConfig;
  verifiedPapers: PaperSource[];
  matrix: EvidenceMatrixEntry[];
  onUpdateMatrix: (matrix: EvidenceMatrixEntry[]) => void;
  onBack: () => void;
  onProceedToSynthesis: () => void;
}

export const Stage5Matrix: React.FC<Stage5MatrixProps> = ({
  project,
  verifiedPapers,
  matrix,
  onUpdateMatrix,
  onBack,
  onProceedToSynthesis,
}) => {
  const [extracting, setExtracting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchFilter, setSearchFilter] = useState('');
  const [relevanceFilter, setRelevanceFilter] = useState<'All' | 'High' | 'Medium' | 'Low'>('All');
  const [expandedRow, setExpandedRow] = useState<number | null>(null);

  const handleBuildMatrix = async () => {
    if (verifiedPapers.length === 0) {
      setError('Please verify at least one paper before building the matrix.');
      return;
    }

    setExtracting(true);
    setError(null);

    try {
      const res = await fetch('/api/research/build-evidence-matrix', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          papers: verifiedPapers,
          topic: project.topic,
          researchQuestions: project.primaryResearchQuestions,
        }),
      });

      const data = await res.json();
      if (!data.success) throw new Error(data.error || 'Failed to extract evidence matrix');

      onUpdateMatrix(data.matrix || []);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Error extracting evidence matrix with Gemini');
    } finally {
      setExtracting(false);
    }
  };

  const handleExportCSV = () => {
    if (matrix.length === 0) return;
    const csv = generateEvidenceMatrixCSV(matrix);
    downloadFile(csv, `evidence-matrix-${project.topic.slice(0, 20).replace(/\s+/g, '_')}.csv`, 'text/csv');
  };

  const filteredMatrix = matrix.filter((row) => {
    const matchesSearch =
      searchFilter === '' ||
      row.paperTitle.toLowerCase().includes(searchFilter.toLowerCase()) ||
      row.authorsFormatted.toLowerCase().includes(searchFilter.toLowerCase()) ||
      row.keyFindings.toLowerCase().includes(searchFilter.toLowerCase()) ||
      row.methodology.toLowerCase().includes(searchFilter.toLowerCase());

    const matchesRelevance =
      relevanceFilter === 'All' || row.relevanceScore === relevanceFilter;

    return matchesSearch && matchesRelevance;
  });

  return (
    <div className="space-y-8 animate-fadeIn max-w-6xl mx-auto">
      {/* Stage Header */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-xl">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center shrink-0">
              <TableProperties className="w-6 h-6 text-indigo-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                  Stage 5 of 10
                </span>
                <span className="text-xs text-slate-400">Systematic Data Extraction</span>
              </div>
              <h2 className="text-2xl font-bold text-white tracking-tight mt-1">
                Build the Evidence Matrix
              </h2>
              <p className="text-sm text-slate-400 mt-1">
                Synthesize and record each source&apos;s research question, methodology, key findings, stated limitations, and topical relevance.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {matrix.length > 0 && (
              <button
                type="button"
                onClick={handleExportCSV}
                className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition border border-slate-700"
                title="Download matrix as CSV"
              >
                <Download className="w-4 h-4 text-indigo-400" />
                <span>Export CSV</span>
              </button>
            )}

            <button
              type="button"
              onClick={handleBuildMatrix}
              disabled={extracting}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-bold text-xs transition shadow-lg shadow-indigo-600/20"
            >
              {extracting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                  <span>Synthesizing Matrix...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>{matrix.length > 0 ? 'Re-Extract Matrix' : 'Extract Evidence Matrix'}</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Filter & Search Bar */}
        {matrix.length > 0 && (
          <div className="mt-6 pt-6 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-3">
            <div className="relative flex-1 min-w-[240px]">
              <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
              <input
                type="text"
                value={searchFilter}
                onChange={(e) => setSearchFilter(e.target.value)}
                placeholder="Filter by author, methodology, or finding..."
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>

            <div className="flex items-center gap-1.5 text-xs">
              <span className="text-slate-400 font-medium mr-1">Relevance:</span>
              {(['All', 'High', 'Medium', 'Low'] as const).map((lvl) => (
                <button
                  key={lvl}
                  type="button"
                  onClick={() => setRelevanceFilter(lvl)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition ${
                    relevanceFilter === lvl
                      ? 'bg-indigo-600 text-white'
                      : 'bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800'
                  }`}
                >
                  {lvl}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-sm">
          {error}
        </div>
      )}

      {/* Evidence Matrix Grid / Table */}
      {matrix.length > 0 ? (
        <div className="bg-slate-900/70 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
          <div className="divide-y divide-slate-800/80">
            {filteredMatrix.map((row, idx) => {
              const isExpanded = expandedRow === idx;
              return (
                <div key={idx} className="p-5 hover:bg-slate-800/20 transition-colors space-y-4">
                  {/* Row Header */}
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3">
                      <span className="w-7 h-7 rounded-lg bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 text-xs font-mono font-bold flex items-center justify-center shrink-0 mt-0.5">
                        {idx + 1}
                      </span>
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-semibold text-slate-100 text-sm">
                            {row.authorsFormatted} ({row.year})
                          </span>
                          <span className="text-xs text-slate-400">• {row.venue}</span>
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                              row.relevanceScore === 'High'
                                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                                : row.relevanceScore === 'Medium'
                                ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                                : 'bg-slate-800 text-slate-400'
                            }`}
                          >
                            {row.relevanceScore} Relevance
                          </span>
                          <span className="text-[10px] font-mono text-indigo-300 bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/20">
                            {row.primaryEvidenceType}
                          </span>
                        </div>
                        <h4 className="text-xs sm:text-sm font-bold text-slate-200 mt-1">
                          {row.paperTitle}
                        </h4>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => setExpandedRow(isExpanded ? null : idx)}
                      className="text-slate-400 hover:text-white p-1 rounded-lg bg-slate-800 shrink-0"
                    >
                      {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>
                  </div>

                  {/* 4 Core Dimensions Matrix */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                    {/* Dimension 1: Research Question */}
                    <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800/80 space-y-1">
                      <span className="text-[10px] uppercase font-bold tracking-wider text-sky-400 block">
                        Research Question / Stated Problem
                      </span>
                      <p className="text-slate-300 leading-relaxed">
                        {row.researchQuestion}
                      </p>
                    </div>

                    {/* Dimension 2: Methodology */}
                    <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800/80 space-y-1">
                      <span className="text-[10px] uppercase font-bold tracking-wider text-indigo-400 block">
                        Methodology / Architecture / Setup
                      </span>
                      <p className="text-slate-300 leading-relaxed">
                        {row.methodology}
                      </p>
                    </div>

                    {/* Dimension 3: Key Findings */}
                    <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800/80 space-y-1">
                      <span className="text-[10px] uppercase font-bold tracking-wider text-emerald-400 block">
                        Key Findings & Quantitative Outcomes
                      </span>
                      <p className="text-slate-300 leading-relaxed">
                        {row.keyFindings}
                      </p>
                    </div>

                    {/* Dimension 4: Stated Limitations */}
                    <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800/80 space-y-1">
                      <span className="text-[10px] uppercase font-bold tracking-wider text-rose-400 block">
                        Limitations & Constraints
                      </span>
                      <p className="text-slate-400 leading-relaxed">
                        {row.limitations}
                      </p>
                    </div>
                  </div>

                  {/* Expanded Rationale */}
                  {isExpanded && (
                    <div className="p-3.5 rounded-xl bg-indigo-500/5 border border-indigo-500/20 text-xs space-y-2">
                      <span className="text-[11px] font-bold text-indigo-300">
                        Relevance Rationale for Our Paper:
                      </span>
                      <p className="text-slate-300 leading-relaxed">
                        {row.relevanceRationale}
                      </p>
                      {row.doi && (
                        <p className="text-[11px] font-mono-code text-slate-400 pt-1">
                          DOI: {row.doi}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="text-center py-16 bg-slate-900/40 border border-dashed border-slate-800 rounded-2xl space-y-4">
          <FileSpreadsheet className="w-12 h-12 text-slate-600 mx-auto" />
          <div className="space-y-1">
            <h4 className="text-base font-bold text-slate-200">
              Evidence Matrix Not Yet Generated
            </h4>
            <p className="text-xs text-slate-400 max-w-md mx-auto">
              Click &quot;Extract Evidence Matrix&quot; above to have the agent analyze your {verifiedPapers.length} verified sources and map their methodologies, empirical findings, and limitations.
            </p>
          </div>
          <button
            type="button"
            onClick={handleBuildMatrix}
            disabled={extracting}
            className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs transition shadow-lg shadow-indigo-600/20"
          >
            {extracting ? 'Synthesizing...' : 'Extract Evidence Matrix Now'}
          </button>
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
          <span>Back to Verify</span>
        </button>

        <button
          type="button"
          onClick={onProceedToSynthesis}
          disabled={matrix.length === 0}
          className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-sky-600 hover:from-indigo-500 hover:to-sky-500 disabled:opacity-50 text-white font-bold text-sm transition-all shadow-lg shadow-indigo-600/30"
        >
          <span>Proceed to Stage 6: Synthesize Literature</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
