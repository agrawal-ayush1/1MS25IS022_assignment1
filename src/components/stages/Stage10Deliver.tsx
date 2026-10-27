import React, { useState } from 'react';
import {
  Award,
  Download,
  Printer,
  FileText,
  FileCode,
  Table,
  CheckCircle2,
  AlertTriangle,
  Copy,
  ExternalLink,
  BookOpen,
  ArrowLeft,
  Share2
} from 'lucide-react';
import {
  ResearchProjectConfig,
  PaperSource,
  EvidenceMatrixEntry,
  PaperOutline,
  DraftValidation,
} from '../../types/research';
import {
  generateBibTeX,
  generateLaTeX,
  generateEvidenceMatrixCSV,
  downloadFile,
} from '../../utils/academicHelpers';

interface Stage10DeliverProps {
  project: ResearchProjectConfig;
  verifiedPapers: PaperSource[];
  matrix: EvidenceMatrixEntry[];
  outline: PaperOutline | null;
  draftText: string;
  validation: DraftValidation | null;
  onBack: () => void;
  onRestartNewPaper: () => void;
}

export const Stage10Deliver: React.FC<Stage10DeliverProps> = ({
  project,
  verifiedPapers,
  matrix,
  outline,
  draftText,
  validation,
  onBack,
  onRestartNewPaper,
}) => {
  const [copiedSection, setCopiedSection] = useState<string | null>(null);

  const bibtex = generateBibTeX(matrix.length > 0 ? matrix : verifiedPapers);
  const latex = generateLaTeX(outline?.proposedTitle || project.topic, draftText, bibtex);
  const csv = generateEvidenceMatrixCSV(matrix);

  const wordCount = draftText ? draftText.trim().split(/\s+/).filter(Boolean).length : 0;

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = (type: 'pdf' | 'tex' | 'bib' | 'md' | 'csv') => {
    const slug = (project.refinedTitle || project.topic)
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '_')
      .slice(0, 30);

    if (type === 'pdf') {
      window.print();
    } else if (type === 'tex') {
      downloadFile(latex, `${slug}_manuscript.tex`, 'text/x-tex');
    } else if (type === 'bib') {
      downloadFile(bibtex, `${slug}_references.bib`, 'application/x-bibtex');
    } else if (type === 'md') {
      downloadFile(draftText, `${slug}_paper.md`, 'text/markdown');
    } else if (type === 'csv') {
      downloadFile(csv, `${slug}_evidence_matrix.csv`, 'text/csv');
    }
  };

  const handleCopyText = (content: string, label: string) => {
    navigator.clipboard.writeText(content);
    setCopiedSection(label);
    setTimeout(() => setCopiedSection(null), 2000);
  };

  return (
    <div className="space-y-8 animate-fadeIn max-w-5xl mx-auto">
      {/* Stage Header */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-xl no-print">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500 to-indigo-500 flex items-center justify-center shrink-0 shadow-lg shadow-amber-500/20">
              <Award className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20">
                  Stage 10 of 10
                </span>
                <span className="text-xs text-slate-400">Final Academic Delivery Packet</span>
              </div>
              <h2 className="text-2xl font-bold text-white tracking-tight mt-1">
                Deliver the Research Paper
              </h2>
              <p className="text-sm text-slate-400 mt-1">
                Your completed academic packet: typeset manuscript, verified {project.citationStyle} bibliography, ethical limitations disclosure, and flagged verification items.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handlePrint}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs transition shadow-lg shadow-indigo-600/30 shrink-0"
          >
            <Printer className="w-4 h-4" />
            <span>Print / Save as PDF</span>
          </button>
        </div>

        {/* Multi-Format Export Buttons */}
        <div className="mt-6 pt-6 border-t border-slate-800/80">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-3">
            One-Click Scholarly Exports
          </span>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
            <button
              type="button"
              onClick={() => handleDownload('pdf')}
              className="p-3 rounded-xl bg-slate-950 hover:bg-slate-800/80 border border-slate-800 hover:border-slate-700 transition flex flex-col items-center gap-1.5 text-center group"
            >
              <FileText className="w-5 h-5 text-rose-400 group-hover:scale-110 transition-transform" />
              <span className="text-xs font-bold text-slate-200">PDF / Print</span>
              <span className="text-[10px] text-slate-500">Camera-Ready</span>
            </button>

            <button
              type="button"
              onClick={() => handleDownload('tex')}
              className="p-3 rounded-xl bg-slate-950 hover:bg-slate-800/80 border border-slate-800 hover:border-slate-700 transition flex flex-col items-center gap-1.5 text-center group"
            >
              <FileCode className="w-5 h-5 text-emerald-400 group-hover:scale-110 transition-transform" />
              <span className="text-xs font-bold text-slate-200">LaTeX (.tex)</span>
              <span className="text-[10px] text-slate-500">Overleaf Ready</span>
            </button>

            <button
              type="button"
              onClick={() => handleDownload('bib')}
              className="p-3 rounded-xl bg-slate-950 hover:bg-slate-800/80 border border-slate-800 hover:border-slate-700 transition flex flex-col items-center gap-1.5 text-center group"
            >
              <BookOpen className="w-5 h-5 text-amber-400 group-hover:scale-110 transition-transform" />
              <span className="text-xs font-bold text-slate-200">BibTeX (.bib)</span>
              <span className="text-[10px] text-slate-500">Zotero / Mendeley</span>
            </button>

            <button
              type="button"
              onClick={() => handleDownload('md')}
              className="p-3 rounded-xl bg-slate-950 hover:bg-slate-800/80 border border-slate-800 hover:border-slate-700 transition flex flex-col items-center gap-1.5 text-center group"
            >
              <FileText className="w-5 h-5 text-sky-400 group-hover:scale-110 transition-transform" />
              <span className="text-xs font-bold text-slate-200">Markdown (.md)</span>
              <span className="text-[10px] text-slate-500">Full Text</span>
            </button>

            <button
              type="button"
              onClick={() => handleDownload('csv')}
              className="p-3 rounded-xl bg-slate-950 hover:bg-slate-800/80 border border-slate-800 hover:border-slate-700 transition flex flex-col items-center gap-1.5 text-center group"
            >
              <Table className="w-5 h-5 text-purple-400 group-hover:scale-110 transition-transform" />
              <span className="text-xs font-bold text-slate-200">Matrix (.csv)</span>
              <span className="text-[10px] text-slate-500">All 4 Dimensions</span>
            </button>
          </div>
        </div>
      </div>

      {/* Packet Delivery Component 1: Academic Paper Typeset Sheet */}
      <div className="academic-paper-sheet bg-white text-slate-900 rounded-2xl p-8 sm:p-14 shadow-2xl border border-slate-200 font-academic leading-relaxed selection:bg-indigo-100">
        <div className="prose prose-slate max-w-none">
          {/* Header Metadata */}
          <div className="text-center border-b border-slate-300 pb-6 mb-8 space-y-2">
            <span className="text-xs uppercase tracking-widest text-slate-500 font-sans font-semibold">
              {project.paperType} • {project.targetDomain}
            </span>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-950 font-academic tracking-tight">
              {outline?.proposedTitle || project.refinedTitle || project.topic}
            </h1>
            <p className="text-sm text-slate-600 font-sans italic">
              ScholarForge Academic Research Agent • Citation Style: {project.citationStyle}
            </p>
          </div>

          {/* Render Sections */}
          {draftText ? (
            draftText.split('\n\n').map((paragraph, pIdx) => {
              const trimmed = paragraph.trim();

              if (trimmed.startsWith('# ')) {
                return null; // already printed in title header
              }
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

              return (
                <p key={pIdx} className="text-base sm:text-[17px] text-slate-800 leading-[1.8] my-3 text-justify">
                  {trimmed}
                </p>
              );
            })
          ) : (
            <p className="text-slate-500 italic">No manuscript text drafted yet.</p>
          )}
        </div>
      </div>

      {/* Packet Delivery Component 2: Ethical Disclosures & Claims Requiring Verification */}
      {validation && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 no-print">
          {/* Stated Methodological Limitations */}
          <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-6 space-y-3">
            <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <h3 className="text-sm font-bold text-slate-100">
                Ethically Disclosed Limitations
              </h3>
            </div>
            <ul className="space-y-2 text-xs text-slate-300 list-disc list-inside">
              {validation.disclosedLimitations?.map((lim, idx) => (
                <li key={idx} className="leading-relaxed">{lim}</li>
              ))}
              {(!validation.disclosedLimitations || validation.disclosedLimitations.length === 0) && (
                <li className="text-slate-500 italic">Explicitly detailed in Section 10 of manuscript.</li>
              )}
            </ul>
          </div>

          {/* List of Claims Requiring Primary Empirical Verification */}
          <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-6 space-y-3">
            <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
              <AlertTriangle className="w-4 h-4 text-amber-400" />
              <h3 className="text-sm font-bold text-slate-100">
                Claims Requiring Experimental Verification
              </h3>
            </div>
            <ul className="space-y-2 text-xs text-slate-300">
              {validation.claimsRequiringVerification?.map((item, idx) => (
                <li key={idx} className="p-2.5 rounded-lg bg-slate-950 border border-slate-800/80 leading-relaxed">
                  <span className="font-semibold text-amber-300 block">&quot;{item.claim}&quot;</span>
                  <span className="text-slate-400 block text-[11px] mt-0.5">{item.recommendedAction}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* Navigation & Restart Buttons */}
      <div className="flex items-center justify-between pt-4 border-t border-slate-800 no-print">
        <button
          type="button"
          onClick={onBack}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 font-semibold text-xs transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Validation Audit</span>
        </button>

        <button
          type="button"
          onClick={onRestartNewPaper}
          className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs transition border border-slate-700"
        >
          <span>Start New Research Project</span>
        </button>
      </div>
    </div>
  );
};
