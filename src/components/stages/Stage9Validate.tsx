import React, { useState } from 'react';
import {
  CheckSquare,
  Sparkles,
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  FileCheck,
  ArrowRight,
  ArrowLeft,
  SearchCheck,
  Scale
} from 'lucide-react';
import {
  DraftValidation,
  EvidenceMatrixEntry,
  ResearchProjectConfig,
} from '../../types/research';

interface Stage9ValidateProps {
  project: ResearchProjectConfig;
  matrix: EvidenceMatrixEntry[];
  draftText: string;
  validation: DraftValidation | null;
  onUpdateValidation: (validation: DraftValidation) => void;
  onBack: () => void;
  onProceedToDeliver: () => void;
}

export const Stage9Validate: React.FC<Stage9ValidateProps> = ({
  project,
  matrix,
  draftText,
  validation,
  onUpdateValidation,
  onBack,
  onProceedToDeliver,
}) => {
  const [auditing, setAuditing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleValidate = async () => {
    if (!draftText) {
      setError('Draft is empty. Please complete Stage 8 first.');
      return;
    }

    setAuditing(true);
    setError(null);

    try {
      const res = await fetch('/api/research/validate-draft', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          draftText,
          evidenceMatrix: matrix,
          citationStyle: project.citationStyle,
        }),
      });

      const data = await res.json();
      if (!data.success) throw new Error(data.error || 'Failed to validate draft');

      onUpdateValidation(data.validation);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Error executing academic validation audit');
    } finally {
      setAuditing(false);
    }
  };

  return (
    <div className="space-y-8 animate-fadeIn max-w-5xl mx-auto">
      {/* Stage Header */}
      <div className="bg-gradient-to-r from-slate-900 via-emerald-950/30 to-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-xl">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-600/20 border border-emerald-500/30 flex items-center justify-center shrink-0">
              <CheckSquare className="w-6 h-6 text-emerald-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  Stage 9 of 10
                </span>
                <span className="text-xs text-slate-400">Academic Rigor &amp; Peer-Audit</span>
              </div>
              <h2 className="text-2xl font-bold text-white tracking-tight mt-1">
                Validate the Manuscript Draft
              </h2>
              <p className="text-sm text-slate-400 mt-1">
                Audit factual claims, citation parity, reference completeness, and logical consistency. Identify any unverified assertions requiring experimental trials.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleValidate}
            disabled={auditing}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold text-xs transition shadow-lg shadow-emerald-600/20 shrink-0"
          >
            {auditing ? (
              <>
                <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                <span>Auditing Manuscript...</span>
              </>
            ) : (
              <>
                <SearchCheck className="w-4 h-4" />
                <span>{validation ? 'Re-Audit Draft' : 'Run 5-Point Validation Audit'}</span>
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

      {validation ? (
        <div className="space-y-6">
          {/* Audit Score & Executive Summary */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 sm:p-8 flex flex-col sm:flex-row items-center gap-6 shadow-xl">
            {/* Score Ring */}
            <div className="relative w-28 h-28 flex items-center justify-center shrink-0">
              <div className="w-full h-full rounded-full border-4 border-slate-800" />
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                <span className="text-3xl font-extrabold text-white font-mono">
                  {validation.overallScore}
                </span>
                <span className="text-[10px] uppercase font-bold tracking-wider text-emerald-400">
                  Rigor Index
                </span>
              </div>
            </div>

            <div className="space-y-2 text-center sm:text-left">
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  Ethical Citation Pass
                </span>
                <span className="text-xs text-slate-400">
                  Audit style: {project.citationStyle}
                </span>
              </div>
              <h3 className="text-lg font-bold text-slate-100">
                Peer-Review Audit Assessment
              </h3>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                {validation.auditSummary}
              </p>
            </div>
          </div>

          {/* 4 Core Verification Pillars */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Pillar 1: Citation Accuracy */}
            <div className="p-5 rounded-2xl bg-slate-900/70 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-200 flex items-center gap-2">
                  <CheckCircle2 className={`w-4 h-4 ${validation.citationAccuracy.status === 'PASS' ? 'text-emerald-400' : 'text-amber-400'}`} />
                  Citation Parity &amp; Accuracy
                </span>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                  validation.citationAccuracy.status === 'PASS'
                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                    : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                }`}>
                  {validation.citationAccuracy.status}
                </span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                {validation.citationAccuracy.details}
              </p>
            </div>

            {/* Pillar 2: Factual Grounding */}
            <div className="p-5 rounded-2xl bg-slate-900/70 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-200 flex items-center gap-2">
                  <ShieldCheck className={`w-4 h-4 ${validation.factualGrounding.status === 'PASS' ? 'text-emerald-400' : 'text-amber-400'}`} />
                  Factual Evidence Grounding
                </span>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                  validation.factualGrounding.status === 'PASS'
                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                    : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                }`}>
                  {validation.factualGrounding.status}
                </span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                {validation.factualGrounding.details}
              </p>
            </div>

            {/* Pillar 3: Reference Completeness */}
            <div className="p-5 rounded-2xl bg-slate-900/70 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-200 flex items-center gap-2">
                  <FileCheck className={`w-4 h-4 ${validation.referenceCompleteness.status === 'PASS' ? 'text-emerald-400' : 'text-amber-400'}`} />
                  Reference Completeness &amp; DOIs
                </span>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                  validation.referenceCompleteness.status === 'PASS'
                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                    : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                }`}>
                  {validation.referenceCompleteness.status}
                </span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                {validation.referenceCompleteness.details}
              </p>
            </div>

            {/* Pillar 4: Logical Consistency */}
            <div className="p-5 rounded-2xl bg-slate-900/70 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-200 flex items-center gap-2">
                  <Scale className={`w-4 h-4 ${validation.logicalConsistency.status === 'PASS' ? 'text-emerald-400' : 'text-amber-400'}`} />
                  Logical Consistency &amp; Deductions
                </span>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                  validation.logicalConsistency.status === 'PASS'
                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                    : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                }`}>
                  {validation.logicalConsistency.status}
                </span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                {validation.logicalConsistency.details}
              </p>
            </div>
          </div>

          {/* List of Claims Requiring Further Verification (Critical Academic Standard) */}
          <div className="p-6 rounded-2xl bg-slate-900/70 border border-slate-800 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-amber-400" />
                <div>
                  <h3 className="text-sm font-bold text-slate-100">
                    Claims Requiring Further Experimental Verification
                  </h3>
                  <p className="text-xs text-slate-400">
                    Mandatory academic disclosure: claims or hypotheses that cannot be definitively settled without primary laboratory / empirical benchmarks.
                  </p>
                </div>
              </div>
              <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20">
                {validation.claimsRequiringVerification?.length || 0} Flagged Assertions
              </span>
            </div>

            <div className="space-y-3">
              {validation.claimsRequiringVerification?.map((item, i) => (
                <div key={i} className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                  <div className="flex items-start gap-2">
                    <span className="w-5 h-5 rounded-md bg-amber-500/10 text-amber-400 text-xs font-mono font-bold flex items-center justify-center shrink-0 mt-0.5">
                      {i + 1}
                    </span>
                    <h4 className="text-xs font-bold text-slate-200">
                      &quot;{item.claim}&quot;
                    </h4>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-[11px] pt-1 pl-7">
                    <div className="p-2 rounded-lg bg-slate-900/80 border border-slate-800/80">
                      <span className="text-slate-500 block font-semibold">Audit Rationale:</span>
                      <p className="text-slate-400">{item.reason}</p>
                    </div>
                    <div className="p-2 rounded-lg bg-indigo-500/5 border border-indigo-500/20">
                      <span className="text-indigo-300 block font-semibold">Recommended Scientific Action:</span>
                      <p className="text-indigo-200">{item.recommendedAction}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center py-16 bg-slate-900/40 border border-dashed border-slate-800 rounded-2xl space-y-4">
          <CheckSquare className="w-12 h-12 text-slate-600 mx-auto" />
          <div className="space-y-1">
            <h4 className="text-base font-bold text-slate-200">
              Audit Not Yet Run
            </h4>
            <p className="text-xs text-slate-400 max-w-md mx-auto">
              Click &quot;Run 5-Point Validation Audit&quot; to cross-examine in-text citations against the verified sources repository, identify any unverified statements, and compute the paper&apos;s rigor score.
            </p>
          </div>
          <button
            type="button"
            onClick={handleValidate}
            disabled={auditing}
            className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs transition shadow-lg shadow-emerald-600/20"
          >
            {auditing ? 'Auditing...' : 'Run 5-Point Validation Audit Now'}
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
          <span>Back to Draft</span>
        </button>

        <button
          type="button"
          onClick={onProceedToDeliver}
          disabled={!validation}
          className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-indigo-600 hover:from-emerald-500 hover:to-indigo-500 disabled:opacity-50 text-white font-bold text-sm transition-all shadow-lg shadow-emerald-600/30"
        >
          <span>Proceed to Stage 10: Deliver Paper</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
