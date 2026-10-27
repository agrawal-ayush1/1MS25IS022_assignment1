import React, { useState } from 'react';
import {
  GitMerge,
  Sparkles,
  CheckCircle2,
  AlertOctagon,
  HelpCircle,
  Lightbulb,
  ArrowRight,
  ArrowLeft,
  Layers,
  Flame
} from 'lucide-react';
import { LiteratureSynthesis, EvidenceMatrixEntry, ResearchProjectConfig } from '../../types/research';

interface Stage6SynthesisProps {
  project: ResearchProjectConfig;
  matrix: EvidenceMatrixEntry[];
  synthesis: LiteratureSynthesis | null;
  onUpdateSynthesis: (synthesis: LiteratureSynthesis) => void;
  onBack: () => void;
  onProceedToOutline: () => void;
}

export const Stage6Synthesis: React.FC<Stage6SynthesisProps> = ({
  project,
  matrix,
  synthesis,
  onUpdateSynthesis,
  onBack,
  onProceedToOutline,
}) => {
  const [synthesizing, setSynthesizing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSynthesize = async () => {
    if (matrix.length === 0) {
      setError('Matrix is empty. Please complete Stage 5 first.');
      return;
    }

    setSynthesizing(true);
    setError(null);

    try {
      const res = await fetch('/api/research/synthesize-literature', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          evidenceMatrix: matrix,
          topic: project.topic,
          researchQuestions: project.primaryResearchQuestions,
        }),
      });

      const data = await res.json();
      if (!data.success) throw new Error(data.error || 'Failed to synthesize literature');

      onUpdateSynthesis(data.synthesis);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Error synthesizing literature');
    } finally {
      setSynthesizing(false);
    }
  };

  return (
    <div className="space-y-8 animate-fadeIn max-w-6xl mx-auto">
      {/* Stage Header */}
      <div className="bg-gradient-to-r from-slate-900 via-purple-950/30 to-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-xl">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-purple-600/20 border border-purple-500/30 flex items-center justify-center shrink-0">
              <GitMerge className="w-6 h-6 text-purple-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-400 border border-purple-500/20">
                  Stage 6 of 10
                </span>
                <span className="text-xs text-slate-400">Critical Literature Synthesis</span>
              </div>
              <h2 className="text-2xl font-bold text-white tracking-tight mt-1">
                Synthesize Literature & Identify Research Gaps
              </h2>
              <p className="text-sm text-slate-400 mt-1">
                Compare studies, uncover areas of consensus, dissect contradictory findings, and isolate actionable research gaps.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleSynthesize}
            disabled={synthesizing}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white font-bold text-xs transition shadow-lg shadow-purple-600/20 shrink-0"
          >
            {synthesizing ? (
              <>
                <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                <span>Synthesizing Literature...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>{synthesis ? 'Re-Synthesize' : 'Run Synthesis & Gap Analysis'}</span>
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

      {synthesis ? (
        <div className="space-y-6">
          {/* Section 1: Thematic Synthesis Narrative */}
          <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-6 sm:p-7 space-y-3">
            <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
              <Layers className="w-4 h-4 text-purple-400" />
              <span>Overarching Thematic Synthesis</span>
            </h3>
            <p className="text-sm text-slate-300 leading-relaxed font-academic text-base sm:text-lg">
              {synthesis.thematicSynthesis}
            </p>
          </div>

          {/* Section 2: Consensus Points vs Contradictions Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Consensus & Convergences */}
            <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-6 space-y-4">
              <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <h3 className="text-sm font-bold text-slate-100">
                  Consensus & Convergent Findings
                </h3>
              </div>

              <div className="space-y-3">
                {synthesis.consensusPoints.map((pt, i) => (
                  <div key={i} className="p-4 rounded-xl bg-slate-950 border border-slate-800/80 space-y-2">
                    <h4 className="text-xs font-bold text-emerald-300">
                      {pt.claim}
                    </h4>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      {pt.explanation}
                    </p>
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {pt.supportingCitations.map((cite, cIdx) => (
                        <span
                          key={cIdx}
                          className="text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded border border-emerald-500/20"
                        >
                          {cite}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Contradictions & Academic Debates */}
            <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-6 space-y-4">
              <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
                <Flame className="w-4 h-4 text-amber-400" />
                <h3 className="text-sm font-bold text-slate-100">
                  Contradictions & Academic Debates
                </h3>
              </div>

              <div className="space-y-3">
                {synthesis.contradictionsAndDebates.map((item, i) => (
                  <div key={i} className="p-4 rounded-xl bg-slate-950 border border-slate-800/80 space-y-3">
                    <h4 className="text-xs font-bold text-amber-300">
                      Debate: {item.debate}
                    </h4>

                    <div className="grid grid-cols-2 gap-2 text-[11px]">
                      <div className="p-2.5 rounded-lg bg-slate-900/90 border border-slate-800 space-y-1">
                        <span className="text-slate-400 block font-semibold">Perspective A:</span>
                        <p className="text-slate-200">{item.perspectiveA}</p>
                        <span className="text-[10px] text-sky-400 block pt-1 font-mono">{item.citationA}</span>
                      </div>

                      <div className="p-2.5 rounded-lg bg-slate-900/90 border border-slate-800 space-y-1">
                        <span className="text-slate-400 block font-semibold">Perspective B:</span>
                        <p className="text-slate-200">{item.perspectiveB}</p>
                        <span className="text-[10px] text-sky-400 block pt-1 font-mono">{item.citationB}</span>
                      </div>
                    </div>

                    <div className="text-xs text-slate-400 bg-slate-900/50 p-2.5 rounded-lg border border-slate-800/50">
                      <span className="font-semibold text-slate-300">Root Cause Analysis: </span>
                      {item.analysis}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Section 3: Grounded Research Gaps */}
          <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Lightbulb className="w-5 h-5 text-amber-400" />
                <div>
                  <h3 className="text-base font-bold text-slate-100">
                    Discovered Research Gaps (Literature Grounded)
                  </h3>
                  <p className="text-xs text-slate-400">
                    Specific empirical and theoretical vacuums that our manuscript directly addresses.
                  </p>
                </div>
              </div>
              <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20">
                {synthesis.researchGaps.length} Gaps Isolated
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {synthesis.researchGaps.map((gap, i) => (
                <div
                  key={i}
                  className="p-5 rounded-xl bg-slate-950 border border-slate-800 flex flex-col justify-between space-y-3 relative group hover:border-indigo-500/40 transition-all"
                >
                  <div className="space-y-2">
                    <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                      {gap.gapId}
                    </span>
                    <h4 className="text-sm font-bold text-slate-100">
                      {gap.title}
                    </h4>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      {gap.description}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-slate-800/80 space-y-2 text-xs">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">
                        Literature Proof:
                      </span>
                      <p className="text-slate-300 text-[11px] mt-0.5">
                        {gap.literatureEvidence}
                      </p>
                    </div>

                    <div className="p-2.5 rounded-lg bg-indigo-500/5 border border-indigo-500/20">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-300 block">
                        Our Paper&apos;s Contribution:
                      </span>
                      <p className="text-indigo-200 text-[11px] mt-0.5">
                        {gap.proposedOpportunity}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center py-16 bg-slate-900/40 border border-dashed border-slate-800 rounded-2xl space-y-4">
          <GitMerge className="w-12 h-12 text-slate-600 mx-auto" />
          <div className="space-y-1">
            <h4 className="text-base font-bold text-slate-200">
              Literature Synthesis Pending
            </h4>
            <p className="text-xs text-slate-400 max-w-md mx-auto">
              Click &quot;Run Synthesis &amp; Gap Analysis&quot; to cross-compare the findings across all your verified sources, reveal consensus points, dissect debates, and extract research gaps.
            </p>
          </div>
          <button
            type="button"
            onClick={handleSynthesize}
            disabled={synthesizing}
            className="px-6 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-semibold text-xs transition shadow-lg shadow-purple-600/20"
          >
            {synthesizing ? 'Synthesizing...' : 'Run Synthesis & Gap Analysis Now'}
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
          <span>Back to Evidence Matrix</span>
        </button>

        <button
          type="button"
          onClick={onProceedToOutline}
          disabled={!synthesis}
          className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 disabled:opacity-50 text-white font-bold text-sm transition-all shadow-lg shadow-purple-600/30"
        >
          <span>Proceed to Stage 7: Create Outline</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
