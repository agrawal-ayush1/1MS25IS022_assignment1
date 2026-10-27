import React from 'react';
import {
  Compass,
  FileSearch,
  Search,
  CheckCircle2,
  TableProperties,
  GitMerge,
  ListTree,
  PenTool,
  CheckSquare,
  Award,
} from 'lucide-react';

export interface WorkflowStageInfo {
  number: number;
  label: string;
  shortName: string;
  icon: React.ElementType;
  description: string;
}

export const WORKFLOW_STAGES: WorkflowStageInfo[] = [
  {
    number: 1,
    label: '1. Understand Topic',
    shortName: 'Topic',
    icon: Compass,
    description: 'Scope, objectives, RQs, academic level, and citation style',
  },
  {
    number: 2,
    label: '2. Plan Research',
    shortName: 'Plan',
    icon: FileSearch,
    description: 'Subtopics, keywords & Boolean query formulation',
  },
  {
    number: 3,
    label: '3. Find Sources',
    shortName: 'Search',
    icon: Search,
    description: 'Query arXiv, CrossRef, and PubMed open repositories',
  },
  {
    number: 4,
    label: '4. Verify Sources',
    shortName: 'Verify',
    icon: CheckCircle2,
    description: 'Audit DOIs, publication venues, authors & dates',
  },
  {
    number: 5,
    label: '5. Evidence Matrix',
    shortName: 'Matrix',
    icon: TableProperties,
    description: 'Map RQs, methodology, key findings & limitations',
  },
  {
    number: 6,
    label: '6. Synthesize',
    shortName: 'Synthesize',
    icon: GitMerge,
    description: 'Agreements, contradictions, debates & research gaps',
  },
  {
    number: 7,
    label: '7. Create Outline',
    shortName: 'Outline',
    icon: ListTree,
    description: '12-section standard academic paper framework',
  },
  {
    number: 8,
    label: '8. Write Paper',
    shortName: 'Draft',
    icon: PenTool,
    description: 'Draft evidence-grounded manuscript with real citations',
  },
  {
    number: 9,
    label: '9. Validate Draft',
    shortName: 'Validate',
    icon: CheckSquare,
    description: '5-point audit: claims, citations, parity & consistency',
  },
  {
    number: 10,
    label: '10. Deliver Paper',
    shortName: 'Deliver',
    icon: Award,
    description: 'Manuscript packet, references, limitations & multi-export',
  },
];

interface WorkflowStepperProps {
  currentStage: number;
  completedStages: number[];
  onSelectStage: (stageNumber: number) => void;
}

export const WorkflowStepper: React.FC<WorkflowStepperProps> = ({
  currentStage,
  completedStages,
  onSelectStage,
}) => {
  return (
    <div className="bg-slate-900/80 border-b border-slate-800/80 px-4 py-3 no-print overflow-x-auto">
      <div className="max-w-7xl mx-auto flex items-center min-w-max gap-1">
        {WORKFLOW_STAGES.map((stage, idx) => {
          const Icon = stage.icon;
          const isCurrent = currentStage === stage.number;
          const isCompleted = completedStages.includes(stage.number);
          const isPast = stage.number < currentStage || isCompleted;

          return (
            <React.Fragment key={stage.number}>
              <button
                onClick={() => onSelectStage(stage.number)}
                className={`group flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium transition-all relative ${
                  isCurrent
                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/25 ring-1 ring-indigo-400/50'
                    : isCompleted
                    ? 'bg-slate-800/60 hover:bg-slate-800 text-emerald-300 border border-emerald-500/30'
                    : 'bg-slate-950/40 hover:bg-slate-800/60 text-slate-400 hover:text-slate-200 border border-slate-800/50'
                }`}
                title={stage.description}
              >
                <div
                  className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 text-[11px] font-semibold transition-colors ${
                    isCurrent
                      ? 'bg-white/20 text-white'
                      : isCompleted
                      ? 'bg-emerald-500/20 text-emerald-400'
                      : 'bg-slate-800 text-slate-400 group-hover:text-slate-200'
                  }`}
                >
                  {isCompleted && !isCurrent ? '✓' : stage.number}
                </div>
                <div className="flex flex-col text-left">
                  <span className="font-semibold tracking-wide whitespace-nowrap">{stage.shortName}</span>
                </div>
              </button>

              {idx < WORKFLOW_STAGES.length - 1 && (
                <div
                  className={`w-3 h-0.5 shrink-0 ${
                    isPast ? 'bg-indigo-500/50' : 'bg-slate-800'
                  }`}
                />
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
};
