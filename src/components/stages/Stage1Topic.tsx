import React, { useState } from 'react';
import {
  Compass,
  Sparkles,
  ArrowRight,
  HelpCircle,
  CheckCircle,
  Plus,
  Trash2,
  FileSpreadsheet,
  Settings2,
  Lightbulb
} from 'lucide-react';
import { ResearchProjectConfig, AcademicLevel, CitationStyle, PaperType } from '../../types/research';
import { SAMPLE_RESEARCH_TOPICS, BEHAVIORAL_PATTERNS } from '../../utils/academicHelpers';

interface Stage1TopicProps {
  project: ResearchProjectConfig;
  onUpdateProject: (updates: Partial<ResearchProjectConfig>) => void;
  onProceedToPlan: () => void;
}

export const Stage1Topic: React.FC<Stage1TopicProps> = ({
  project,
  onUpdateProject,
  onProceedToPlan,
}) => {
  const [analyzing, setAnalyzing] = useState(false);
  const [newRQ, setNewRQ] = useState('');
  const [clarificationAnswers, setClarificationAnswers] = useState<Record<string, string>>(
    project.userClarifications || {}
  );
  const [error, setError] = useState<string | null>(null);

  const academicLevels: AcademicLevel[] = [
    'Undergraduate',
    'Master / Graduate',
    'PhD Candidate',
    'Postdoctoral / Faculty',
  ];

  const citationStyles: CitationStyle[] = [
    'IEEE',
    'APA 7th',
    'ACM',
    'Nature',
    'Harvard',
    'Chicago',
  ];

  const paperTypes: PaperType[] = [
    'Systematic Literature Review',
    'Methodological Proposal',
    'Empirical Synthesis',
    'Position Paper',
  ];

  const handleAnalyzeTopic = async () => {
    if (!project.topic.trim()) {
      setError('Please enter a research topic or choose a sample topic.');
      return;
    }
    setError(null);
    setAnalyzing(true);

    try {
      const res = await fetch('/api/research/analyze-topic', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic: project.topic,
          objective: project.objective,
          academicLevel: project.academicLevel,
          wordCount: project.targetWordCount,
          citationStyle: project.citationStyle,
          targetAudience: project.targetDomain,
        }),
      });

      const data = await res.json();
      if (!data.success) throw new Error(data.error || 'Failed to analyze topic');

      const result = data.data;
      onUpdateProject({
        refinedTitle: result.clearTopicTitle,
        objective: result.refinedResearchObjective || project.objective,
        primaryResearchQuestions: result.primaryResearchQuestions || project.primaryResearchQuestions,
        scopeBoundaries: result.scopeBoundaries || project.scopeBoundaries,
        searchKeywords: result.searchKeywords || project.searchKeywords,
        booleanSearchQueries: result.booleanSearchQueries || project.booleanSearchQueries,
        clarificationQuestions: result.clarificationQuestions || [],
      });
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Error assessing research topic with agent');
    } finally {
      setAnalyzing(false);
    }
  };

  const handleAddRQ = () => {
    if (newRQ.trim()) {
      onUpdateProject({
        primaryResearchQuestions: [...project.primaryResearchQuestions, newRQ.trim()],
      });
      setNewRQ('');
    }
  };

  const handleRemoveRQ = (index: number) => {
    onUpdateProject({
      primaryResearchQuestions: project.primaryResearchQuestions.filter((_, i) => i !== index),
    });
  };

  const handleApplySample = (sample: typeof SAMPLE_RESEARCH_TOPICS[0]) => {
    onUpdateProject({
      topic: sample.topic,
      objective: sample.objective,
      academicLevel: sample.academicLevel,
      targetWordCount: sample.wordCount,
      citationStyle: sample.citationStyle,
      paperType: sample.paperType,
      targetDomain: sample.domain,
      primaryResearchQuestions: sample.primaryResearchQuestions,
      scopeBoundaries: { inScope: [], outOfScope: [] },
      searchKeywords: [],
      booleanSearchQueries: [],
      clarificationQuestions: [],
    });
  };

  return (
    <div className="space-y-8 animate-fadeIn max-w-5xl mx-auto">
      {/* Stage Header */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-xl">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center shrink-0">
              <Compass className="w-6 h-6 text-indigo-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                  Stage 1 of 10
                </span>
                <span className="text-xs text-slate-400">Systematic Literature Initiation</span>
              </div>
              <h2 className="text-2xl font-bold text-white tracking-tight mt-1">
                Understand the Topic & Define Scope
              </h2>
              <p className="text-sm text-slate-400 mt-1">
                Specify your research objective, research questions, academic level, target word count, and citation style. The agent will assess feasibility and ask clarifying questions.
              </p>
            </div>
          </div>
        </div>

          {/* Behavioral Patterns & Approaches Learned from Examples */}
          <div className="mt-6 pt-6 border-t border-slate-800/80">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Lightbulb className="w-4 h-4 text-amber-400" />
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-300">
                  Agent Behavioral Patterns &amp; Workflows
                </span>
              </div>
              <span className="text-[10px] text-slate-400 font-mono">3 Standard Approaches</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {BEHAVIORAL_PATTERNS.map((pattern, idx) => (
                <div
                  key={pattern.id}
                  className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 hover:border-indigo-500/50 transition-all flex flex-col justify-between space-y-2.5"
                >
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 uppercase tracking-wider">
                        {pattern.title}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-400">
                      <span className="text-slate-500 font-medium">Input: </span>
                      <span className="italic text-slate-300">&quot;{pattern.input}&quot;</span>
                    </div>
                    <p className="text-[11px] text-slate-300 leading-snug">
                      <span className="text-amber-400/90 font-semibold">Approach: </span>
                      {pattern.output}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      const matchingSample = SAMPLE_RESEARCH_TOPICS[idx];
                      if (matchingSample) {
                        handleApplySample(matchingSample);
                      } else {
                        onUpdateProject({
                          topic: pattern.suggestedTopic,
                          primaryResearchQuestions: [pattern.suggestedRQ],
                        });
                      }
                    }}
                    className="w-full py-1.5 px-2 rounded-lg bg-indigo-950/50 hover:bg-indigo-900/60 text-indigo-300 hover:text-white border border-indigo-700/40 text-[11px] font-semibold transition text-center flex items-center justify-center gap-1.5"
                  >
                    <span>Load {pattern.title.split(':')[1]?.trim() || 'Approach'}</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

      {error && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-sm">
          {error}
        </div>
      )}

      {/* Main Topic Input & Essential Requirements */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Topic & Objective */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-6 space-y-4">
            <div>
              <label className="block text-sm font-semibold text-slate-200 mb-1">
                Research Topic or Hypothesis <span className="text-rose-400">*</span>
              </label>
              <textarea
                value={project.topic}
                onChange={(e) => onUpdateProject({ topic: e.target.value })}
                rows={3}
                placeholder="e.g. Energy-efficient speculative decoding algorithms in edge device transformer architectures..."
                className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-4 py-3 text-slate-100 placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-200 mb-1">
                Core Research Objective / Stated Problem
              </label>
              <textarea
                value={project.objective}
                onChange={(e) => onUpdateProject({ objective: e.target.value })}
                rows={2}
                placeholder="State the central scientific question or problem to be addressed..."
                className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-4 py-3 text-slate-100 placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
              />
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={handleAnalyzeTopic}
                disabled={analyzing || !project.topic.trim()}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-semibold text-sm transition-all shadow-lg shadow-indigo-600/20"
              >
                {analyzing ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                    <span>Agent Evaluating Topic...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 text-indigo-200" />
                    <span>Analyze & Refine Scope</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Research Questions Section */}
          <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-100">Primary Research Questions (RQs)</h3>
                <p className="text-xs text-slate-400">
                  Target questions that the literature review and paper must systematically answer.
                </p>
              </div>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-slate-800 text-indigo-400">
                {project.primaryResearchQuestions.length} RQs
              </span>
            </div>

            <div className="space-y-2.5">
              {project.primaryResearchQuestions.map((rq, idx) => (
                <div
                  key={idx}
                  className="flex items-start gap-3 p-3 rounded-xl bg-slate-950/80 border border-slate-800 text-sm text-slate-200 group"
                >
                  <span className="font-mono text-xs font-bold text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded shrink-0 mt-0.5">
                    RQ{idx + 1}
                  </span>
                  <p className="flex-1 text-sm">{rq}</p>
                  <button
                    type="button"
                    onClick={() => handleRemoveRQ(idx)}
                    className="text-slate-500 hover:text-rose-400 opacity-60 group-hover:opacity-100 transition"
                    title="Remove RQ"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}

              {project.primaryResearchQuestions.length === 0 && (
                <div className="text-center py-6 text-slate-500 text-xs border border-dashed border-slate-800 rounded-xl">
                  No research questions added yet. Click &quot;Analyze & Refine Scope&quot; or add manually below.
                </div>
              )}
            </div>

            {/* Add Custom RQ */}
            <div className="flex gap-2 pt-2">
              <input
                type="text"
                value={newRQ}
                onChange={(e) => setNewRQ(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddRQ())}
                placeholder="Add custom research question (e.g. RQ: How does...)"
                className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
              <button
                type="button"
                onClick={handleAddRQ}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add RQ</span>
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Essential Academic Requirements */}
        <div className="space-y-6">
          <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-6 space-y-5">
            <div className="flex items-center gap-2 text-sm font-bold text-slate-100 border-b border-slate-800 pb-3">
              <Settings2 className="w-4 h-4 text-sky-400" />
              <span>Essential Academic Parameters</span>
            </div>

            {/* Academic Level */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Academic Level
              </label>
              <select
                value={project.academicLevel}
                onChange={(e) => onUpdateProject({ academicLevel: e.target.value as AcademicLevel })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              >
                {academicLevels.map((lvl) => (
                  <option key={lvl} value={lvl}>{lvl}</option>
                ))}
              </select>
            </div>

            {/* Paper Type */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Paper Classification / Type
              </label>
              <select
                value={project.paperType}
                onChange={(e) => onUpdateProject({ paperType: e.target.value as PaperType })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              >
                {paperTypes.map((pt) => (
                  <option key={pt} value={pt}>{pt}</option>
                ))}
              </select>
            </div>

            {/* Citation Style */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Citation & Reference Style
              </label>
              <div className="grid grid-cols-3 gap-1.5">
                {citationStyles.map((style) => (
                  <button
                    key={style}
                    type="button"
                    onClick={() => onUpdateProject({ citationStyle: style })}
                    className={`py-1.5 px-2 rounded-lg text-xs font-semibold transition ${
                      project.citationStyle === style
                        ? 'bg-sky-500 text-slate-950 shadow-sm'
                        : 'bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800'
                    }`}
                  >
                    {style}
                  </button>
                ))}
              </div>
            </div>

            {/* Target Word Count */}
            <div>
              <div className="flex justify-between text-xs font-semibold text-slate-300 mb-1.5">
                <span>Target Word Count</span>
                <span className="text-amber-400 font-mono">{project.targetWordCount} words</span>
              </div>
              <input
                type="range"
                min="1500"
                max="8000"
                step="250"
                value={project.targetWordCount}
                onChange={(e) => onUpdateProject({ targetWordCount: Number(e.target.value) })}
                className="w-full accent-indigo-500 bg-slate-800"
              />
              <div className="flex justify-between text-[10px] text-slate-500 mt-1">
                <span>1,500w (Letter)</span>
                <span>4,000w (Standard)</span>
                <span>8,000w (Extended)</span>
              </div>
            </div>

            {/* Target Domain */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Target Discipline / Domain
              </label>
              <input
                type="text"
                value={project.targetDomain}
                onChange={(e) => onUpdateProject({ targetDomain: e.target.value })}
                placeholder="e.g. Computer Science, Bioengineering, NLP"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>
          </div>

          {/* Scope Boundaries if analyzed */}
          {project.scopeBoundaries && (project.scopeBoundaries.inScope.length > 0 || project.scopeBoundaries.outOfScope.length > 0) && (
            <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-5 space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300">
                Scope Delimitation
              </h4>
              <div>
                <span className="text-[11px] font-semibold text-emerald-400">In Scope:</span>
                <ul className="mt-1 space-y-1 text-xs text-slate-300 list-disc list-inside">
                  {project.scopeBoundaries.inScope.map((item, i) => (
                    <li key={i}>{item}</li>
                  ))}
                </ul>
              </div>
              <div>
                <span className="text-[11px] font-semibold text-rose-400">Out of Scope:</span>
                <ul className="mt-1 space-y-1 text-xs text-slate-400 list-disc list-inside">
                  {project.scopeBoundaries.outOfScope.map((item, i) => (
                    <li key={i}>{item}</li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Agent Clarification Section if Agent Asked for Essential Requirements */}
      {project.clarificationQuestions && project.clarificationQuestions.length > 0 && (
        <div className="bg-amber-500/5 border border-amber-500/20 rounded-2xl p-6 space-y-4">
          <div className="flex items-center gap-3">
            <HelpCircle className="w-5 h-5 text-amber-400" />
            <div>
              <h3 className="text-base font-bold text-amber-300">
                Agent Clarification Requests
              </h3>
              <p className="text-xs text-amber-200/80">
                To guarantee academic rigor, the agent identified these scope nuances that require your input.
              </p>
            </div>
          </div>

          <div className="space-y-4 pt-2">
            {project.clarificationQuestions.map((q, idx) => (
              <div key={idx} className="space-y-1.5">
                <label className="block text-xs font-semibold text-slate-200">
                  {idx + 1}. {q}
                </label>
                <input
                  type="text"
                  value={clarificationAnswers[q] || ''}
                  onChange={(e) => {
                    const updated = { ...clarificationAnswers, [q]: e.target.value };
                    setClarificationAnswers(updated);
                    onUpdateProject({ userClarifications: updated });
                  }}
                  placeholder="Provide your specific requirement or constraint..."
                  className="w-full bg-slate-950/90 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Proceed Button */}
      <div className="flex justify-end pt-4 border-t border-slate-800">
        <button
          type="button"
          onClick={onProceedToPlan}
          disabled={!project.topic.trim()}
          className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-sky-600 hover:from-indigo-500 hover:to-sky-500 disabled:opacity-50 text-white font-bold text-sm transition-all shadow-lg shadow-indigo-600/30"
        >
          <span>Confirm Topic & Proceed to Stage 2: Plan Research</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
