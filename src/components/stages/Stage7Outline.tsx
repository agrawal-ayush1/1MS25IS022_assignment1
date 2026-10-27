import React, { useState } from 'react';
import {
  ListTree,
  Sparkles,
  CheckCircle2,
  Clock,
  Layers,
  ArrowRight,
  ArrowLeft,
  BookOpen,
  FileText
} from 'lucide-react';
import {
  PaperOutline,
  ResearchProjectConfig,
  EvidenceMatrixEntry,
  LiteratureSynthesis,
} from '../../types/research';

interface Stage7OutlineProps {
  project: ResearchProjectConfig;
  matrix: EvidenceMatrixEntry[];
  synthesis: LiteratureSynthesis | null;
  outline: PaperOutline | null;
  onUpdateOutline: (outline: PaperOutline) => void;
  onBack: () => void;
  onProceedToDraft: () => void;
}

export const Stage7Outline: React.FC<Stage7OutlineProps> = ({
  project,
  matrix,
  synthesis,
  outline,
  onUpdateOutline,
  onBack,
  onProceedToDraft,
}) => {
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerateOutline = async () => {
    setGenerating(true);
    setError(null);

    try {
      const res = await fetch('/api/research/generate-outline', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic: project.topic,
          paperType: project.paperType,
          citationStyle: project.citationStyle,
          wordCount: project.targetWordCount,
          evidenceMatrix: matrix,
          researchGaps: synthesis?.researchGaps || [],
          researchQuestions: project.primaryResearchQuestions,
        }),
      });

      const data = await res.json();
      if (!data.success) throw new Error(data.error || 'Failed to generate outline');

      onUpdateOutline(data.outline);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Error creating outline proposal');
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="space-y-8 animate-fadeIn max-w-5xl mx-auto">
      {/* Stage Header */}
      <div className="bg-gradient-to-r from-slate-900 via-blue-950/30 to-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-xl">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center shrink-0">
              <ListTree className="w-6 h-6 text-blue-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20">
                  Stage 7 of 10
                </span>
                <span className="text-xs text-slate-400">Structural Outline Proposal</span>
              </div>
              <h2 className="text-2xl font-bold text-white tracking-tight mt-1">
                Create &amp; Approve Paper Outline
              </h2>
              <p className="text-sm text-slate-400 mt-1">
                Propose the rigorous 12-section paper structure before drafting, allocating target word counts and verified citation mappings.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleGenerateOutline}
            disabled={generating}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-bold text-xs transition shadow-lg shadow-blue-600/20 shrink-0"
          >
            {generating ? (
              <>
                <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                <span>Formulating Structure...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>{outline ? 'Re-Propose Outline' : 'Generate Structured Outline'}</span>
              </>
            )}
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-sm">
          {error}
        </div>
      )}

      {outline ? (
        <div className="space-y-6">
          {/* Outline Overview Card */}
          <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
              <span className="font-semibold text-slate-400 uppercase tracking-wider">
                Proposed Working Title:
              </span>
              <div className="flex items-center gap-2">
                <span className="text-blue-400 font-semibold bg-blue-500/10 px-2.5 py-1 rounded-lg border border-blue-500/20">
                  Target: {outline.targetWordCount} words
                </span>
                <span className="text-emerald-400 font-semibold bg-emerald-500/10 px-2.5 py-1 rounded-lg border border-emerald-500/20">
                  12 Standard Sections
                </span>
              </div>
            </div>
            <h3 className="text-xl font-bold text-white font-academic">
              {outline.proposedTitle}
            </h3>
          </div>

          {/* 12 Sections Stepped Accordion / List */}
          <div className="space-y-3">
            {outline.sections.map((sec) => (
              <div
                key={sec.sectionNumber}
                className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-slate-700 transition space-y-3"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <span className="w-7 h-7 rounded-lg bg-blue-500/10 border border-blue-500/30 text-blue-400 text-xs font-mono font-bold flex items-center justify-center shrink-0 mt-0.5">
                      {sec.sectionNumber}
                    </span>
                    <div>
                      <h4 className="text-sm sm:text-base font-bold text-slate-100">
                        {sec.title}
                      </h4>
                      <p className="text-xs text-slate-400 mt-0.5">
                        {sec.keyPoints?.join(' • ')}
                      </p>
                    </div>
                  </div>

                  <span className="text-xs font-mono font-semibold text-slate-400 bg-slate-950 px-2.5 py-1 rounded-lg border border-slate-800 shrink-0">
                    ~{sec.targetWords} words
                  </span>
                </div>

                {/* Subsections & Assigned Citations */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1 text-xs">
                  {sec.subsections && sec.subsections.length > 0 && (
                    <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800/80">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block mb-1">
                        Subsections &amp; Topics:
                      </span>
                      <ul className="space-y-1 text-slate-300 list-disc list-inside">
                        {sec.subsections.map((sub, sIdx) => (
                          <li key={sIdx}>{sub}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {sec.assignedCitations && sec.assignedCitations.length > 0 && (
                    <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800/80">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-sky-400 block mb-1">
                        Assigned Verified Sources:
                      </span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {sec.assignedCitations.map((cite, cIdx) => (
                          <span
                            key={cIdx}
                            className="text-[10px] font-semibold bg-sky-500/10 text-sky-300 px-2 py-0.5 rounded border border-sky-500/20"
                          >
                            {cite}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="text-center py-16 bg-slate-900/40 border border-dashed border-slate-800 rounded-2xl space-y-4">
          <ListTree className="w-12 h-12 text-slate-600 mx-auto" />
          <div className="space-y-1">
            <h4 className="text-base font-bold text-slate-200">
              Outline Not Yet Formulated
            </h4>
            <p className="text-xs text-slate-400 max-w-md mx-auto">
              Click &quot;Generate Structured Outline&quot; to build the formal 12-section architecture with balanced word counts and mapped citations.
            </p>
          </div>
          <button
            type="button"
            onClick={handleGenerateOutline}
            disabled={generating}
            className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs transition shadow-lg shadow-blue-600/20"
          >
            {generating ? 'Formulating...' : 'Generate Structured Outline Now'}
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
          <span>Back to Synthesis</span>
        </button>

        <button
          type="button"
          onClick={onProceedToDraft}
          disabled={!outline}
          className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 disabled:opacity-50 text-white font-bold text-sm transition-all shadow-lg shadow-blue-600/30"
        >
          <span>Approve Outline &amp; Proceed to Stage 8: Write Paper</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
