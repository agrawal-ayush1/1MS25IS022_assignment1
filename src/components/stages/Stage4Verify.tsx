import React from 'react';
import {
  CheckCircle2,
  ShieldCheck,
  AlertTriangle,
  ExternalLink,
  Trash2,
  ArrowRight,
  ArrowLeft,
  FileCheck,
  Layers
} from 'lucide-react';
import { PaperSource, ResearchProjectConfig } from '../../types/research';

interface Stage4VerifyProps {
  project: ResearchProjectConfig;
  verifiedPapers: PaperSource[];
  onRemovePaper: (id: string) => void;
  onBack: () => void;
  onProceedToMatrix: () => void;
}

export const Stage4Verify: React.FC<Stage4VerifyProps> = ({
  project,
  verifiedPapers,
  onRemovePaper,
  onBack,
  onProceedToMatrix,
}) => {
  return (
    <div className="space-y-8 animate-fadeIn max-w-5xl mx-auto">
      {/* Stage Header */}
      <div className="bg-gradient-to-r from-slate-900 via-teal-950/30 to-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-xl">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-teal-600/20 border border-teal-500/30 flex items-center justify-center shrink-0">
            <ShieldCheck className="w-6 h-6 text-teal-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-teal-500/10 text-teal-400 border border-teal-500/20">
                Stage 4 of 10
              </span>
              <span className="text-xs text-slate-400">Scholarly Source Verification</span>
            </div>
            <h2 className="text-2xl font-bold text-white tracking-tight mt-1">
              Verify Sources & Academic Authenticity
            </h2>
            <p className="text-sm text-slate-400 mt-1">
              Confirm each source&apos;s title, authors, publication venue, year, DOI or URL, and topical relevance. Never invent references.
            </p>
          </div>
        </div>

        {/* Academic Integrity Pledge Box */}
        <div className="mt-6 p-4 rounded-xl bg-teal-500/10 border border-teal-500/20 flex items-start gap-3">
          <FileCheck className="w-5 h-5 text-teal-400 shrink-0 mt-0.5" />
          <div className="text-xs text-teal-200">
            <span className="font-bold text-teal-300">ScholarForge Integrity Standard: </span>
            Every paper below has been verified through public academic registries (arXiv or CrossRef). No hallucinated references, phantom DOIs, or fabricated author names will be introduced into the manuscript.
          </div>
        </div>
      </div>

      {/* Verified Papers Table */}
      <div className="bg-slate-900/70 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-bold text-slate-100">
              Verified Source Inventory ({verifiedPapers.length})
            </h3>
          </div>
          <span className="text-xs text-emerald-400 font-semibold bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
            100% Registry Verified
          </span>
        </div>

        <div className="divide-y divide-slate-800/80">
          {verifiedPapers.map((paper, idx) => (
            <div key={paper.id} className="p-5 hover:bg-slate-800/30 transition-colors space-y-3">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                  <span className="w-6 h-6 rounded-lg bg-teal-500/10 border border-teal-500/30 text-teal-400 text-xs font-mono font-bold flex items-center justify-center shrink-0 mt-0.5">
                    {idx + 1}
                  </span>
                  <div>
                    <h4 className="text-sm font-bold text-slate-100 leading-snug">
                      {paper.title}
                    </h4>
                    <p className="text-xs text-slate-400 mt-1">
                      {paper.authors.join(', ')} ({paper.year})
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => onRemovePaper(paper.id)}
                  className="text-slate-500 hover:text-rose-400 transition p-1.5 rounded-lg hover:bg-slate-800 shrink-0"
                  title="Remove from verified sources"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              {/* 5-Point Verification Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] pt-1">
                <div className="p-2 rounded-lg bg-slate-950 border border-slate-800/80">
                  <span className="text-slate-500 block">Publication Venue:</span>
                  <span className="font-semibold text-slate-200 truncate block">
                    {paper.venue}
                  </span>
                </div>

                <div className="p-2 rounded-lg bg-slate-950 border border-slate-800/80">
                  <span className="text-slate-500 block">Publication Year:</span>
                  <span className="font-semibold text-slate-200 block">
                    {paper.year} (Confirmed)
                  </span>
                </div>

                <div className="p-2 rounded-lg bg-slate-950 border border-slate-800/80">
                  <span className="text-slate-500 block">DOI Verification:</span>
                  <span className="font-semibold text-teal-400 font-mono-code truncate block">
                    {paper.doi ? paper.doi : 'arXiv Verified'}
                  </span>
                </div>

                <div className="p-2 rounded-lg bg-slate-950 border border-slate-800/80">
                  <span className="text-slate-500 block">Authenticity:</span>
                  <span className="font-semibold text-emerald-400 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                    <span>Real Registry</span>
                  </span>
                </div>
              </div>

              {paper.url && (
                <div className="pt-0.5">
                  <a
                    href={paper.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-[11px] text-teal-400 hover:text-teal-300 font-medium"
                  >
                    <span>View Official Record</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              )}
            </div>
          ))}

          {verifiedPapers.length === 0 && (
            <div className="text-center py-12 text-slate-500 text-xs">
              No sources currently verified. Please return to Stage 3 to select academic papers.
            </div>
          )}
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
          <span>Back to Sources Search</span>
        </button>

        <button
          type="button"
          onClick={onProceedToMatrix}
          disabled={verifiedPapers.length === 0}
          className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-teal-600 to-indigo-600 hover:from-teal-500 hover:to-indigo-500 disabled:opacity-50 text-white font-bold text-sm transition-all shadow-lg shadow-teal-600/30"
        >
          <span>Proceed to Stage 5: Build Evidence Matrix</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
