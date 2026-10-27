import React from 'react';
import { BookOpen, ShieldCheck, MessageSquare, Download, Sparkles, Layers, FileText } from 'lucide-react';
import { ResearchProjectConfig, PaperSource, EvidenceMatrixEntry } from '../types/research';

interface NavbarProps {
  project: ResearchProjectConfig;
  verifiedPapers: PaperSource[];
  evidenceMatrix: EvidenceMatrixEntry[];
  draftText: string;
  isChatOpen: boolean;
  onToggleChat: () => void;
  onSelectSampleTopic: (index: number) => void;
  onJumpToStage: (stage: number) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  project,
  verifiedPapers,
  evidenceMatrix,
  draftText,
  isChatOpen,
  onToggleChat,
  onJumpToStage,
}) => {
  const wordCount = draftText ? draftText.trim().split(/\s+/).length : 0;

  return (
    <header className="sticky top-0 z-30 bg-slate-950/90 backdrop-blur-md border-b border-slate-800 text-slate-100 no-print">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Brand / Logo */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-sky-400 p-[1px] shadow-lg shadow-indigo-500/20">
            <div className="w-full h-full bg-slate-950 rounded-[11px] flex items-center justify-center">
              <BookOpen className="w-5 h-5 text-indigo-400" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-bold text-lg tracking-tight bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
                ScholarForge
              </h1>
              <span className="text-[10px] font-semibold tracking-wider uppercase px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                AI Research Paper Agent
              </span>
            </div>
            <p className="text-xs text-slate-400 truncate max-w-[280px] sm:max-w-md hidden sm:block">
              {project.topic || 'Systematic Literature Review & Paper Writing Engine'}
            </p>
          </div>
        </div>

        {/* Live Project Metrics & Quick Badges */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Citation Style Badge */}
          <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 text-xs text-slate-300">
            <span className="text-slate-500">Style:</span>
            <span className="font-semibold text-sky-400">{project.citationStyle}</span>
          </div>

          {/* Verified Papers Badge */}
          <button
            onClick={() => onJumpToStage(3)}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs text-slate-300 transition-colors"
            title="Click to view verified academic sources"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span className="font-medium text-emerald-400">{verifiedPapers.length}</span>
            <span className="text-slate-400 hidden lg:inline">Sources Verified</span>
          </button>

          {/* Matrix Badge */}
          {evidenceMatrix.length > 0 && (
            <button
              onClick={() => onJumpToStage(5)}
              className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs text-slate-300 transition-colors"
            >
              <Layers className="w-3.5 h-3.5 text-indigo-400" />
              <span className="font-medium text-indigo-400">{evidenceMatrix.length}</span>
              <span className="text-slate-400">Matrix Rows</span>
            </button>
          )}

          {/* Word Count / Target Badge */}
          {wordCount > 0 && (
            <button
              onClick={() => onJumpToStage(8)}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs text-slate-300 transition-colors"
            >
              <FileText className="w-3.5 h-3.5 text-amber-400" />
              <span className="font-medium text-amber-400">{wordCount}</span>
              <span className="text-slate-400 hidden sm:inline">/ {project.targetWordCount} w</span>
            </button>
          )}

          {/* Toggle Agent Chat */}
          <button
            onClick={onToggleChat}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all shadow-sm ${
              isChatOpen
                ? 'bg-indigo-600 text-white shadow-indigo-600/30'
                : 'bg-indigo-950/60 hover:bg-indigo-900/60 text-indigo-300 border border-indigo-700/50'
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Ask Agent</span>
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          </button>
        </div>
      </div>
    </header>
  );
};
