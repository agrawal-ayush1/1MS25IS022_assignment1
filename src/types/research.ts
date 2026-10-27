export type AcademicLevel = 'Undergraduate' | 'Master / Graduate' | 'PhD Candidate' | 'Postdoctoral / Faculty';
export type CitationStyle = 'IEEE' | 'APA 7th' | 'ACM' | 'Harvard' | 'Nature' | 'Chicago';
export type PaperType = 'Systematic Literature Review' | 'Methodological Proposal' | 'Empirical Synthesis' | 'Position Paper';

export interface ScopeBoundaries {
  inScope: string[];
  outOfScope: string[];
}

export interface ResearchProjectConfig {
  topic: string;
  refinedTitle?: string;
  objective: string;
  academicLevel: AcademicLevel;
  targetWordCount: number;
  citationStyle: CitationStyle;
  paperType: PaperType;
  targetDomain: string;
  primaryResearchQuestions: string[];
  scopeBoundaries: ScopeBoundaries;
  searchKeywords: string[];
  booleanSearchQueries: string[];
  clarificationQuestions?: string[];
  userClarifications?: Record<string, string>;
}

export interface PaperSource {
  id: string;
  title: string;
  authors: string[];
  venue: string;
  year: number;
  doi?: string;
  url?: string;
  abstract: string;
  citationCount?: number;
  sourceType: 'arxiv' | 'crossref' | 'europepmc' | 'manual';
  verified: boolean;
  selected?: boolean;
}

export interface EvidenceMatrixEntry {
  paperIndex: number;
  paperTitle: string;
  authorsFormatted: string;
  year: number;
  venue: string;
  doi?: string;
  researchQuestion: string;
  methodology: string;
  keyFindings: string;
  limitations: string;
  relevanceScore: 'High' | 'Medium' | 'Low';
  relevanceRationale: string;
  primaryEvidenceType: string;
}

export interface ConsensusPoint {
  claim: string;
  supportingCitations: string[];
  explanation: string;
}

export interface ContradictionDebate {
  debate: string;
  perspectiveA: string;
  citationA: string;
  perspectiveB: string;
  citationB: string;
  analysis: string;
}

export interface ResearchGap {
  gapId: string;
  title: string;
  description: string;
  literatureEvidence: string;
  proposedOpportunity: string;
}

export interface LiteratureSynthesis {
  thematicSynthesis: string;
  consensusPoints: ConsensusPoint[];
  contradictionsAndDebates: ContradictionDebate[];
  methodologicalLimitations: string[];
  researchGaps: ResearchGap[];
}

export interface OutlineSection {
  sectionNumber: number;
  title: string;
  targetWords: number;
  subsections: string[];
  keyPoints: string[];
  assignedCitations: string[];
}

export interface PaperOutline {
  proposedTitle: string;
  targetWordCount: number;
  sections: OutlineSection[];
}

export interface ClaimVerificationItem {
  claim: string;
  reason: string;
  recommendedAction: string;
}

export interface DraftValidation {
  overallScore: number;
  auditSummary: string;
  citationAccuracy: {
    status: 'PASS' | 'NEEDS_ATTENTION';
    details: string;
    uncitedClaimsCount: number;
    matchedCitations: string[];
    unmatchedCitations: string[];
  };
  factualGrounding: {
    status: 'PASS' | 'NEEDS_ATTENTION';
    details: string;
    flaggedHallucinations: string[];
  };
  referenceCompleteness: {
    status: 'PASS' | 'NEEDS_ATTENTION';
    details: string;
    missingMetadata: string[];
  };
  logicalConsistency: {
    status: 'PASS' | 'NEEDS_ATTENTION';
    details: string;
    reasoningObservations: string[];
  };
  claimsRequiringVerification: ClaimVerificationItem[];
  disclosedLimitations: string[];
}

export interface ChatMessage {
  id: string;
  role: 'agent' | 'user';
  content: string;
  timestamp: string;
  stage?: number;
}
