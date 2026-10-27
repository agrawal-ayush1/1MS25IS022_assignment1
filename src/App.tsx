/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Navbar } from './components/Navbar';
import { WorkflowStepper } from './components/WorkflowStepper';
import { Stage1Topic } from './components/stages/Stage1Topic';
import { Stage2Plan } from './components/stages/Stage2Plan';
import { Stage3Sources } from './components/stages/Stage3Sources';
import { Stage4Verify } from './components/stages/Stage4Verify';
import { Stage5Matrix } from './components/stages/Stage5Matrix';
import { Stage6Synthesis } from './components/stages/Stage6Synthesis';
import { Stage7Outline } from './components/stages/Stage7Outline';
import { Stage8Draft } from './components/stages/Stage8Draft';
import { Stage9Validate } from './components/stages/Stage9Validate';
import { Stage10Deliver } from './components/stages/Stage10Deliver';
import { AgentChatDrawer } from './components/AgentChatDrawer';
import {
  ResearchProjectConfig,
  PaperSource,
  EvidenceMatrixEntry,
  LiteratureSynthesis,
  PaperOutline,
  DraftValidation,
} from './types/research';
import { SAMPLE_RESEARCH_TOPICS } from './utils/academicHelpers';

export default function App() {
  // Current active workflow stage (1 to 10)
  const [currentStage, setCurrentStage] = useState<number>(1);
  const [completedStages, setCompletedStages] = useState<number[]>([]);
  const [isChatOpen, setIsChatOpen] = useState<boolean>(false);

  // Central project state
  const [project, setProject] = useState<ResearchProjectConfig>({
    topic: 'Quantized Low-Rank Adaptation (QLoRA) for Ultra-Low Latency LLM Edge Inference',
    refinedTitle: 'Empirical Synthesis and Latency Analysis of 4-Bit NormalFloat Quantization for Embedded Transformer Acceleration',
    objective: 'Investigate whether 4-bit NormalFloat quantization combined with double quantization can preserve full-precision reasoning accuracy on resource-constrained embedded accelerators while decreasing memory bandwidth by 65%.',
    academicLevel: 'Master / Graduate',
    targetWordCount: 4000,
    citationStyle: 'IEEE',
    paperType: 'Systematic Literature Review',
    targetDomain: 'Machine Learning / Embedded Systems',
    primaryResearchQuestions: [
      'What are the empirical trade-offs between gradient quantization precision and perplexity degradation on edge devices?',
      'How do double quantization memory savings compare across contemporary embedded GPU architectures?',
      'What specific latency bottlenecks arise during autoregressive decoding under 4-bit weight representations?'
    ],
    scopeBoundaries: {
      inScope: [
        'Post-training quantization & parameter-efficient fine-tuning (PEFT)',
        'Quantized Low-Rank Adaptation (QLoRA) and 4-bit NormalFloat formats',
        'Hardware inference latency on mobile GPUs and NPUs'
      ],
      outOfScope: [
        'Full-parameter pre-training from scratch on supercomputer clusters',
        'Quantization-aware training (QAT) requiring massive labeled datasets',
        'Purely biological or analog neuromorphic implementations'
      ]
    },
    searchKeywords: [
      'Quantized Low-Rank Adaptation',
      'QLoRA edge inference',
      'NormalFloat 4-bit',
      'PEFT transformer latency',
      'embedded GPU memory bandwidth'
    ],
    booleanSearchQueries: [
      '("QLoRA" OR "quantized low-rank adaptation") AND ("latency" OR "throughput")',
      '("4-bit" OR "NormalFloat") AND ("transformer" OR "LLM") AND ("edge" OR "embedded")'
    ],
    clarificationQuestions: [
      'Should we evaluate memory bandwidth reduction across both unified mobile SOCs (Apple Silicon) and discrete embedded GPUs (NVIDIA Jetson)?',
      'Do you wish to focus strictly on open-weights decoder-only models (Llama, Mistral) or include encoder-decoder architectures?'
    ],
    userClarifications: {
      'Should we evaluate memory bandwidth reduction across both unified mobile SOCs (Apple Silicon) and discrete embedded GPUs (NVIDIA Jetson)?': 'Yes, compare unified memory architecture against discrete embedded GPU PCIe interconnects.',
      'Do you wish to focus strictly on open-weights decoder-only models (Llama, Mistral) or include encoder-decoder architectures?': 'Focus primarily on modern 7B and 8B parameter decoder-only transformer models.'
    }
  });

  // Verified papers inventory
  const [papers, setPapers] = useState<PaperSource[]>([]);
  // Evidence matrix
  const [evidenceMatrix, setEvidenceMatrix] = useState<EvidenceMatrixEntry[]>([]);
  // Literature synthesis & gaps
  const [synthesis, setSynthesis] = useState<LiteratureSynthesis | null>(null);
  // Paper outline
  const [outline, setOutline] = useState<PaperOutline | null>(null);
  // Manuscript draft text
  const [draftText, setDraftText] = useState<string>('');
  // Draft validation report
  const [validation, setValidation] = useState<DraftValidation | null>(null);

  // Helper to mark stage complete and advance
  const advanceToStage = (nextStage: number, completedStageNumber?: number) => {
    if (completedStageNumber && !completedStages.includes(completedStageNumber)) {
      setCompletedStages((prev) => [...prev, completedStageNumber]);
    }
    setCurrentStage(nextStage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleUpdateProject = (updates: Partial<ResearchProjectConfig>) => {
    setProject((prev) => ({ ...prev, ...updates }));
  };

  const handleSelectSampleTopic = (index: number) => {
    const sample = SAMPLE_RESEARCH_TOPICS[index];
    if (sample) {
      setProject({
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
      });
      setCurrentStage(1);
    }
  };

  const handleRestartNewPaper = () => {
    setProject({
      topic: '',
      objective: '',
      academicLevel: 'Master / Graduate',
      targetWordCount: 3500,
      citationStyle: 'IEEE',
      paperType: 'Systematic Literature Review',
      targetDomain: '',
      primaryResearchQuestions: [],
      scopeBoundaries: { inScope: [], outOfScope: [] },
      searchKeywords: [],
      booleanSearchQueries: [],
    });
    setPapers([]);
    setEvidenceMatrix([]);
    setSynthesis(null);
    setOutline(null);
    setDraftText('');
    setValidation(null);
    setCompletedStages([]);
    setCurrentStage(1);
  };

  const verifiedPapers = papers.filter((p) => p.selected && p.verified);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-indigo-500/30 selection:text-white">
      {/* Top Navigation */}
      <Navbar
        project={project}
        verifiedPapers={verifiedPapers}
        evidenceMatrix={evidenceMatrix}
        draftText={draftText}
        isChatOpen={isChatOpen}
        onToggleChat={() => setIsChatOpen(!isChatOpen)}
        onSelectSampleTopic={handleSelectSampleTopic}
        onJumpToStage={(stage) => setCurrentStage(stage)}
      />

      {/* 10-Stage Visual Workflow Stepper */}
      <WorkflowStepper
        currentStage={currentStage}
        completedStages={completedStages}
        onSelectStage={(stage) => setCurrentStage(stage)}
      />

      {/* Main Content Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
        {currentStage === 1 && (
          <Stage1Topic
            project={project}
            onUpdateProject={handleUpdateProject}
            onProceedToPlan={() => advanceToStage(2, 1)}
          />
        )}

        {currentStage === 2 && (
          <Stage2Plan
            project={project}
            onUpdateProject={handleUpdateProject}
            onBack={() => setCurrentStage(1)}
            onProceedToSearch={() => advanceToStage(3, 2)}
          />
        )}

        {currentStage === 3 && (
          <Stage3Sources
            project={project}
            papers={papers}
            onUpdatePapers={setPapers}
            onBack={() => setCurrentStage(2)}
            onProceedToVerify={() => advanceToStage(4, 3)}
          />
        )}

        {currentStage === 4 && (
          <Stage4Verify
            project={project}
            verifiedPapers={verifiedPapers}
            onRemovePaper={(id) => setPapers(papers.filter((p) => p.id !== id))}
            onBack={() => setCurrentStage(3)}
            onProceedToMatrix={() => advanceToStage(5, 4)}
          />
        )}

        {currentStage === 5 && (
          <Stage5Matrix
            project={project}
            verifiedPapers={verifiedPapers}
            matrix={evidenceMatrix}
            onUpdateMatrix={(mat) => setEvidenceMatrix(mat)}
            onBack={() => setCurrentStage(4)}
            onProceedToSynthesis={() => advanceToStage(6, 5)}
          />
        )}

        {currentStage === 6 && (
          <Stage6Synthesis
            project={project}
            matrix={evidenceMatrix}
            synthesis={synthesis}
            onUpdateSynthesis={(synth) => setSynthesis(synth)}
            onBack={() => setCurrentStage(5)}
            onProceedToOutline={() => advanceToStage(7, 6)}
          />
        )}

        {currentStage === 7 && (
          <Stage7Outline
            project={project}
            matrix={evidenceMatrix}
            synthesis={synthesis}
            outline={outline}
            onUpdateOutline={(outl) => setOutline(outl)}
            onBack={() => setCurrentStage(6)}
            onProceedToDraft={() => advanceToStage(8, 7)}
          />
        )}

        {currentStage === 8 && (
          <Stage8Draft
            project={project}
            matrix={evidenceMatrix}
            synthesis={synthesis}
            outline={outline}
            draftText={draftText}
            onUpdateDraftText={(txt) => setDraftText(txt)}
            onBack={() => setCurrentStage(7)}
            onProceedToValidate={() => advanceToStage(9, 8)}
          />
        )}

        {currentStage === 9 && (
          <Stage9Validate
            project={project}
            matrix={evidenceMatrix}
            draftText={draftText}
            validation={validation}
            onUpdateValidation={(val) => setValidation(val)}
            onBack={() => setCurrentStage(8)}
            onProceedToDeliver={() => advanceToStage(10, 9)}
          />
        )}

        {currentStage === 10 && (
          <Stage10Deliver
            project={project}
            verifiedPapers={verifiedPapers}
            matrix={evidenceMatrix}
            outline={outline}
            draftText={draftText}
            validation={validation}
            onBack={() => setCurrentStage(9)}
            onRestartNewPaper={handleRestartNewPaper}
          />
        )}
      </main>

      {/* Floating or Docked AI Research Paper Agent Drawer */}
      <AgentChatDrawer
        isOpen={isChatOpen}
        onClose={() => setIsChatOpen(false)}
        project={project}
        currentStage={currentStage}
        evidenceMatrix={evidenceMatrix}
      />
    </div>
  );
}
