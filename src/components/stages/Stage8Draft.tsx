import React, { useState } from 'react';
import {
  PenTool,
  Sparkles,
  BookOpen,
  FileCode,
  Eye,
  CheckCircle2,
  Copy,
  ArrowRight,
  ArrowLeft,
  RefreshCw,
  Sliders,
  AlignLeft
} from 'lucide-react';
import {
  PaperOutline,
  ResearchProjectConfig,
  EvidenceMatrixEntry,
  LiteratureSynthesis,
} from '../../types/research';

interface Stage8DraftProps {
  project: ResearchProjectConfig;
  matrix: EvidenceMatrixEntry[];
  synthesis: LiteratureSynthesis | null;
  outline: PaperOutline | null;
  draftText: string;
  onUpdateDraftText: (draft: string) => void;
  onBack: () => void;
  onProceedToValidate: () => void;
}

export const Stage8Draft: React.FC<Stage8DraftProps> = ({
  project,
  matrix,
  synthesis,
  outline,
  draftText,
  onUpdateDraftText,
  onBack,
  onProceedToValidate,
}) => {
  const [drafting, setDrafting] = useState(false);
  const [selectedSection, setSelectedSection] = useState<string>('FULL_PAPER');
  const [viewMode, setViewMode] = useState<'typeset' | 'editor' | 'markdown'>('typeset');
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const wordCount = draftText ? draftText.trim().split(/\s+/).filter(Boolean).length : 0;

  const handleDraft = async () => {
    setDrafting(true);
    setError(null);

    try {
      const res = await fetch('/api/research/draft-paper', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic: project.topic,
          paperType: project.paperType,
          citationStyle: project.citationStyle,
          outline,
          evidenceMatrix: matrix,
          researchGaps: synthesis?.researchGaps || [],
          researchQuestions: project.primaryResearchQuestions,
          sectionToDraft: selectedSection === 'FULL_PAPER' ? undefined : selectedSection,
        }),
      });

      const data = await res.json();
      if (!data.success) throw new Error(data.error || 'Failed to draft paper');

      if (selectedSection === 'FULL_PAPER' || !draftText) {
        onUpdateDraftText(data.draft);
      } else {
        // Append or replace section in draft
        onUpdateDraftText(`${draftText}\n\n${data.draft}`);
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Error drafting paper section with Gemini');
    } finally {
      setDrafting(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(draftText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-8 animate-fadeIn max-w-6xl mx-auto">
      {/* Stage Header */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-xl">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center shrink-0">
              <PenTool className="w-6 h-6 text-indigo-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                  Stage 8 of 10
                </span>
                <span className="text-xs text-slate-400">Academic Manuscript Composition</span>
              </div>
              <h2 className="text-2xl font-bold text-white tracking-tight mt-1">
                Write the Research Paper
              </h2>
              <p className="text-sm text-slate-400 mt-1">
                Draft strictly evidence-grounded academic text citing verified sources ({project.citationStyle} format). No fabricated citations or ungrounded statistics.
              </p>
            </div>
          </div>

          {/* Action Button & Selector */}
          <div className="flex flex-wrap items-center gap-2">
            <select
              value={selectedSection}
              onChange={(e) => setSelectedSection(e.target.value)}
              className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            >
              <option value="FULL_PAPER">All 12 Sections (Complete Paper)</option>
              {outline?.sections.map((s) => (
                <option key={s.sectionNumber} value={`Section ${s.sectionNumber}: ${s.title}`}>
                  Section {s.sectionNumber}: {s.title}
                </option>
              ))}
            </select>

            <button
              type="button"
              onClick={handleDraft}
              disabled={drafting}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-bold text-xs transition shadow-lg shadow-indigo-600/20 shrink-0"
            >
              {drafting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                  <span>Composing Manuscript...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>{draftText ? 'Regenerate Section' : 'Draft Manuscript with Agent'}</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* View Switcher & Word Metrics */}
        <div className="mt-6 pt-6 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-950 border border-slate-800 text-xs">
            <button
              type="button"
              onClick={() => setViewMode('typeset')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold transition ${
                viewMode === 'typeset'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Camera-Ready Typeset</span>
            </button>

            <button
              type="button"
              onClick={() => setViewMode('editor')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold transition ${
                viewMode === 'editor'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <AlignLeft className="w-3.5 h-3.5" />
              <span>Direct Manuscript Editor</span>
            </button>

            <button
              type="button"
              onClick={() => setViewMode('markdown')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold transition ${
                viewMode === 'markdown'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <FileCode className="w-3.5 h-3.5" />
              <span>Markdown Source</span>
            </button>
          </div>

          <div className="flex items-center gap-4 text-xs">
            <div className="flex items-center gap-1.5">
              <span className="text-slate-400">Word Count:</span>
              <span className="font-mono font-bold text-amber-400">{wordCount}</span>
              <span className="text-slate-500">/ {project.targetWordCount} target</span>
            </div>

            {draftText && (
              <button
                type="button"
                onClick={handleCopy}
                className="flex items-center gap-1 text-slate-400 hover:text-white transition"
              >
                <Copy className="w-3.5 h-3.5" />
                <span>{copied ? 'Copied' : 'Copy'}</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-sm">
          {error}
        </div>
      )}

      {/* Draft Content Rendering */}
      {draftText ? (
        <div className="space-y-4">
          {viewMode === 'typeset' && (
            <div className="academic-paper-sheet bg-white text-slate-900 rounded-2xl p-8 sm:p-14 shadow-2xl border border-slate-200 max-w-4xl mx-auto font-academic leading-relaxed selection:bg-indigo-100">
              <div className="prose prose-slate max-w-none">
                {/* Parse simple markdown sections for camera-ready formatting */}
                {draftText.split('\n\n').map((paragraph, pIdx) => {
                  const trimmed = paragraph.trim();

                  // Main H1 Title
                  if (trimmed.startsWith('# ')) {
                    return (
                      <h1
                        key={pIdx}
                        className="text-2xl sm:text-3xl font-bold text-center text-slate-950 font-academic tracking-tight mb-4 border-b pb-4"
                      >
                        {trimmed.replace('# ', '')}
                      </h1>
                    );
                  }

                  // H2 Section Headers
                  if (trimmed.startsWith('## ')) {
                    return (
                      <h2
                        key={pIdx}
                        className="text-lg sm:text-xl font-bold text-slate-900 font-sans tracking-wide uppercase mt-8 mb-3 border-b border-slate-200 pb-1"
                      >
                        {trimmed.replace('## ', '')}
                      </h2>
                    );
                  }

                  // H3 Subsections
                  if (trimmed.startsWith('### ')) {
                    return (
                      <h3
                        key={pIdx}
                        className="text-base font-bold text-slate-800 font-sans mt-5 mb-2"
                      >
                        {trimmed.replace('### ', '')}
                      </h3>
                    );
                  }

                  // Blockquotes
                  if (trimmed.startsWith('> ')) {
                    return (
                      <blockquote
                        key={pIdx}
                        className="border-l-4 border-indigo-600 bg-indigo-50/50 p-4 rounded-r-xl italic text-slate-700 my-4 text-sm font-sans"
                      >
                        {trimmed.replace('> ', '')}
                      </blockquote>
                    );
                  }

                  // Unordered lists
                  if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
                    return (
                      <ul key={pIdx} className="list-disc list-inside space-y-1 my-3 text-slate-800 text-base">
                        {trimmed.split('\n').map((li, lIdx) => (
                          <li key={lIdx}>{li.replace(/^[-*]\s+/, '')}</li>
                        ))}
                      </ul>
                    );
                  }

                  // Regular Paragraph with in-text citation styling
                  return (
                    <p key={pIdx} className="text-base sm:text-[17px] text-slate-800 leading-[1.8] my-3 text-justify">
                      {trimmed}
                    </p>
                  );
                })}
              </div>
            </div>
          )}

          {viewMode === 'editor' && (
            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-xl">
              <textarea
                value={draftText}
                onChange={(e) => onUpdateDraftText(e.target.value)}
                rows={25}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-5 text-sm text-slate-200 font-academic text-base leading-relaxed focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="Manuscript text..."
              />
            </div>
          )}

          {viewMode === 'markdown' && (
            <div className="bg-slate-950 border border-slate-800 rounded-2xl p-6 overflow-x-auto shadow-xl">
              <pre className="font-mono-code text-xs text-slate-300 whitespace-pre-wrap leading-relaxed">
                {draftText}
              </pre>
            </div>
          )}
        </div>
      ) : (
        <div className="text-center py-20 bg-slate-900/40 border border-dashed border-slate-800 rounded-2xl space-y-4">
          <PenTool className="w-12 h-12 text-slate-600 mx-auto" />
          <div className="space-y-1">
            <h4 className="text-base font-bold text-slate-200">
              Draft Not Yet Composed
            </h4>
            <p className="text-xs text-slate-400 max-w-md mx-auto">
              Click &quot;Draft Manuscript with Agent&quot; to begin generating the academic paper grounded strictly in the verified evidence from your {matrix.length} sources.
            </p>
          </div>
          <button
            type="button"
            onClick={handleDraft}
            disabled={drafting}
            className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs transition shadow-lg shadow-indigo-600/20"
          >
            {drafting ? 'Composing...' : 'Draft Complete Manuscript Now'}
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
          <span>Back to Outline</span>
        </button>

        <button
          type="button"
          onClick={onProceedToValidate}
          disabled={!draftText}
          className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-sky-600 hover:from-indigo-500 hover:to-sky-500 disabled:opacity-50 text-white font-bold text-sm transition-all shadow-lg shadow-indigo-600/30"
        >
          <span>Proceed to Stage 9: Validate Draft</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
