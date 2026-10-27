import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json({ limit: '10mb' }));

// Server-side Gemini initialization with required User-Agent
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

// Resilient helper for calling Gemini with model fallback cascade
async function askGemini(prompt: string, systemInstruction?: string) {
  const models = ['gemini-3.8-flash', 'gemini-3.1-flash-lite', 'gemini-flash-latest'];
  let lastError: any = null;

  for (const model of models) {
    try {
      const response = await ai.models.generateContent({
        model,
        contents: prompt,
        config: systemInstruction
          ? { systemInstruction }
          : undefined,
      });
      if (response.text) {
        return response.text;
      }
    } catch (err: any) {
      console.warn(`Model ${model} encountered an issue (${err.message}), trying fallback...`);
      lastError = err;
      // Brief pause before trying fallback model
      await new Promise((resolve) => setTimeout(resolve, 800));
    }
  }

  throw lastError || new Error('Failed to generate content across available models');
}

// -------------------------------------------------------------
// Real Academic Search Utilities
// -------------------------------------------------------------

interface PaperSource {
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
}

// Search arXiv API
async function searchArxiv(query: string, maxResults = 8): Promise<PaperSource[]> {
  try {
    const formattedQuery = query.replace(/[^\w\s]/g, ' ').trim();
    const url = `https://export.arxiv.org/api/query?search_query=all:${encodeURIComponent(
      formattedQuery
    )}&start=0&max_results=${maxResults}&sortBy=relevance&sortOrder=descending`;

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);

    const res = await fetch(url, { signal: controller.signal });
    clearTimeout(timeout);

    if (!res.ok) return [];
    const text = await res.text();

    const entries = text.split('<entry>');
    entries.shift(); // remove header

    const papers: PaperSource[] = [];
    for (const entry of entries) {
      const titleMatch = entry.match(/<title>([\s\S]*?)<\/title>/);
      const summaryMatch = entry.match(/<summary>([\s\S]*?)<\/summary>/);
      const idMatch = entry.match(/<id>([\s\S]*?)<\/id>/);
      const publishedMatch = entry.match(/<published>([\s\S]*?)<\/published>/);
      const doiMatch = entry.match(/<arxiv:doi[\s\S]*?>([\s\S]*?)<\/arxiv:doi>/);

      const authors: string[] = [];
      const authorMatches = entry.matchAll(/<author>[\s\S]*?<name>([\s\S]*?)<\/name>[\s\S]*?<\/author>/g);
      for (const m of authorMatches) {
        if (m[1]) authors.push(m[1].trim());
      }

      const title = titleMatch ? titleMatch[1].replace(/\n/g, ' ').replace(/\s+/g, ' ').trim() : 'Untitled Paper';
      const abstract = summaryMatch ? summaryMatch[1].replace(/\n/g, ' ').replace(/\s+/g, ' ').trim() : '';
      const paperUrl = idMatch ? idMatch[1].trim() : '';
      const year = publishedMatch ? new Date(publishedMatch[1].trim()).getFullYear() : 2024;
      const doi = doiMatch ? doiMatch[1].trim() : (paperUrl.includes('arxiv.org/abs/') ? `10.48550/arXiv.${paperUrl.split('/abs/')[1]}` : undefined);

      papers.push({
        id: `arxiv-${Math.random().toString(36).substring(2, 9)}`,
        title,
        authors: authors.length > 0 ? authors : ['Anonymous Researcher'],
        venue: 'arXiv Preprint Repository',
        year,
        doi,
        url: paperUrl || (doi ? `https://doi.org/${doi}` : undefined),
        abstract,
        sourceType: 'arxiv',
        verified: true,
      });
    }

    return papers;
  } catch (err) {
    console.error('Error fetching from arXiv:', err);
    return [];
  }
}

// Search CrossRef API (Peer-reviewed journals, conferences, DOIs)
async function searchCrossRef(query: string, maxResults = 8): Promise<PaperSource[]> {
  try {
    const url = `https://api.crossref.org/works?query=${encodeURIComponent(
      query
    )}&rows=${maxResults}&select=DOI,title,author,issued,container-title,abstract,is-referenced-by-count,URL`;

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);

    const res = await fetch(url, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'ScholarForgeAcademicAgent/1.0 (mailto:scholarforge@academic.ai)',
      },
    });
    clearTimeout(timeout);

    if (!res.ok) return [];
    const data = await res.json();
    const items = data.message?.items || [];

    const papers: PaperSource[] = [];
    for (const item of items) {
      if (!item.title || item.title.length === 0) continue;
      const title = item.title[0];
      const authors = (item.author || []).map((a: any) =>
        [a.given, a.family].filter(Boolean).join(' ') || a.name || 'Unknown'
      );
      const venue = (item['container-title'] && item['container-title'][0]) || 'Academic Journal / Proceedings';
      const year = item.issued?.['date-parts']?.[0]?.[0] || 2023;
      const doi = item.DOI;
      const rawAbstract = item.abstract || '';
      const abstract = rawAbstract.replace(/<[^>]*>/g, '').trim() || `Scholarly publication published in ${venue}.`;

      papers.push({
        id: `crossref-${Math.random().toString(36).substring(2, 9)}`,
        title,
        authors: authors.length > 0 ? authors : ['Contributing Authors'],
        venue,
        year: Number(year) || 2023,
        doi,
        url: item.URL || (doi ? `https://doi.org/${doi}` : undefined),
        abstract,
        citationCount: item['is-referenced-by-count'],
        sourceType: 'crossref',
        verified: true,
      });
    }

    return papers;
  } catch (err) {
    console.error('Error fetching from CrossRef:', err);
    return [];
  }
}

// Search Europe PMC (Biomedical, Life Sciences, Open Access)
async function searchEuropePMC(query: string, maxResults = 6): Promise<PaperSource[]> {
  try {
    const url = `https://www.ebi.ac.uk/europepmc/webservices/rest/search?query=${encodeURIComponent(
      query
    )}&format=json&pageSize=${maxResults}&resultType=core`;

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);

    const res = await fetch(url, { signal: controller.signal });
    clearTimeout(timeout);

    if (!res.ok) return [];
    const data = await res.json();
    const resultList = data.resultList?.result || [];

    const papers: PaperSource[] = [];
    for (const item of resultList) {
      if (!item.title) continue;
      const authors = item.authorString ? item.authorString.split(',').map((s: string) => s.trim()) : ['Researchers'];
      const venue = item.journalTitle || 'Europe PMC / PubMed Central';
      const year = Number(item.pubYear) || 2023;
      const doi = item.doi;

      papers.push({
        id: `epmc-${Math.random().toString(36).substring(2, 9)}`,
        title: item.title.replace(/\.$/, ''),
        authors,
        venue,
        year,
        doi,
        url: doi ? `https://doi.org/${doi}` : `https://europepmc.org/article/${item.source}/${item.id}`,
        abstract: item.abstractText || `Published in ${venue}. Indexed in Europe PMC.`,
        citationCount: item.citedByCount,
        sourceType: 'europepmc',
        verified: true,
      });
    }

    return papers;
  } catch (err) {
    console.error('Europe PMC query error:', err);
    return [];
  }
}

// -------------------------------------------------------------
// API Routes
// -------------------------------------------------------------

// 1. Initial Topic Assessment & Clarification Assistant (Stage 1)
app.post('/api/research/analyze-topic', async (req, res) => {
  try {
    const { topic, objective, targetAudience, academicLevel, wordCount, citationStyle } = req.body;

    const prompt = `
You are the AI Research Paper Agent.
CORE BEHAVIORAL RULE:
When given a broad topic (such as "AI in healthcare"), first identify a focused research question (such as "How can AI improve early disease detection?"). Then suggest relevant research areas, gather credible sources, and organize the paper into sections.

Examine this research project specification:
- Research Topic: "${topic}"
- Stated Objective: "${objective || 'Not specified'}"
- Academic Level: "${academicLevel || 'Master / Graduate'}"
- Target Word Count: "${wordCount || '3000-5000'}"
- Citation Style: "${citationStyle || 'IEEE'}"
- Target Field / Domain: "${targetAudience || 'Computer Science / Engineering / Interdisciplinary'}"

Provide a structured, formal academic assessment JSON object:
{
  "clearTopicTitle": "Formal Academic Working Title",
  "refinedResearchObjective": "A rigorous, single-sentence research objective",
  "primaryResearchQuestions": ["RQ1...", "RQ2...", "RQ3..."],
  "scopeBoundaries": {
    "inScope": ["Aspect 1", "Aspect 2"],
    "outOfScope": ["Aspect 1", "Aspect 2"]
  },
  "recommendedPaperType": "Systematic Literature Review" or "Methodological Proposal" or "Empirical Synthesis",
  "searchKeywords": ["Keyword 1", "Keyword 2", "Keyword 3", "Keyword 4", "Keyword 5"],
  "booleanSearchQueries": [
    "(\\"term 1\\" OR \\"term 2\\") AND (\\"term 3\\")",
    "(\\"term A\\" AND \\"term B\\")"
  ],
  "clarificationQuestions": [
    "Question 1 clarifying any missing methodological scope or constraints",
    "Question 2 regarding target benchmark or practical application domain"
  ]
}
Return pure JSON only, without markdown code fences if possible, or strictly formatted JSON.`;

    const raw = await askGemini(prompt, 'You are an expert academic research director.');
    const cleaned = raw.replace(/```json/g, '').replace(/```/g, '').trim();
    const parsed = JSON.parse(cleaned);
    res.json({ success: true, data: parsed });
  } catch (error: any) {
    console.error('Topic analysis error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// 2. Real Academic Search Aggregator (Stage 3 & 4)
app.post('/api/research/search-sources', async (req, res) => {
  try {
    const { query, databases = ['arxiv', 'crossref', 'europepmc'] } = req.body;

    if (!query) {
      return res.status(400).json({ error: 'Search query is required' });
    }

    const tasks: Promise<PaperSource[]>[] = [];
    if (databases.includes('arxiv')) tasks.push(searchArxiv(query, 6));
    if (databases.includes('crossref')) tasks.push(searchCrossRef(query, 6));
    if (databases.includes('europepmc')) tasks.push(searchEuropePMC(query, 5));

    const results = await Promise.all(tasks);
    const flattened = results.flat();

    const seen = new Set<string>();
    const deduplicated: PaperSource[] = [];

    for (const p of flattened) {
      const key = (p.doi || p.title.toLowerCase().replace(/[^a-z0-9]/g, '')).trim();
      if (!seen.has(key)) {
        seen.add(key);
        deduplicated.push(p);
      }
    }

    res.json({
      success: true,
      count: deduplicated.length,
      papers: deduplicated,
    });
  } catch (error: any) {
    console.error('Search error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// 3. Evidence Matrix Extraction (Stage 5)
app.post('/api/research/build-evidence-matrix', async (req, res) => {
  try {
    const { papers, topic, researchQuestions } = req.body;

    if (!papers || !Array.isArray(papers) || papers.length === 0) {
      return res.status(400).json({ error: 'At least one paper is required' });
    }

    const paperSummaries = papers.map((p, idx) => `
Paper [${idx + 1}]:
Title: ${p.title}
Authors: ${p.authors.join(', ')} (${p.year})
Venue: ${p.venue}
DOI: ${p.doi || 'N/A'}
Abstract: ${p.abstract}
`).join('\n---\n');

    const prompt = `
You are the AI Research Paper Agent.
Your task is Stage 5: "Build an Evidence Matrix".
Research Topic: ${topic}
Target Research Questions: ${JSON.stringify(researchQuestions || [])}

Analyze each of the following verified academic sources. Never invent data or claims. If a detail is not stated in the abstract, mark it as "Not explicitly detailed in abstract (requires full-text audit)".

Sources to analyze:
${paperSummaries}

Produce a JSON array of Evidence Matrix entries corresponding to each paper:
[
  {
    "paperIndex": 0,
    "paperTitle": "...",
    "authorsFormatted": "Vaswani et al. (2017)",
    "year": 2017,
    "venue": "...",
    "doi": "...",
    "researchQuestion": "Specific problem or core question addressed by the authors",
    "methodology": "Model architecture, dataset, theoretical framework, or experimental design used",
    "keyFindings": "Principal empirical results, quantitative performance, or theoretical outcomes",
    "limitations": "Explicit constraints, computational overhead, sample restrictions, or author-stated limitations",
    "relevanceScore": "High" | "Medium" | "Low",
    "relevanceRationale": "How this specific paper directly informs our research questions",
    "primaryEvidenceType": "Empirical Benchmark" | "Theoretical Proof" | "Observational Study" | "Algorithmic Proposal"
  }
]
Return pure JSON array only.`;

    const raw = await askGemini(prompt, 'You are an academic systematic reviewer with strict evidence synthesis standards.');
    const cleaned = raw.replace(/```json/g, '').replace(/```/g, '').trim();
    const matrix = JSON.parse(cleaned);

    res.json({ success: true, matrix });
  } catch (error: any) {
    console.error('Evidence matrix error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// 4. Literature Synthesis & Research Gap Analysis (Stage 6)
app.post('/api/research/synthesize-literature', async (req, res) => {
  try {
    const { evidenceMatrix, topic, researchQuestions } = req.body;

    const matrixSummary = JSON.stringify(evidenceMatrix, null, 2);

    const prompt = `
You are the AI Research Paper Agent.
Your task is Stage 6: "Synthesize the literature and identify research gaps".
Research Topic: ${topic}
Research Questions: ${JSON.stringify(researchQuestions || [])}

CORE BEHAVIORAL RULE:
Compare existing research methods, datasets, findings, and limitations. Identify research gaps based on the available evidence and cite credible sources.

Evidence Matrix Data:
${matrixSummary}

Perform a rigorous academic synthesis:
1. Compare studies across methodologies and findings.
2. Identify areas of Consensus and Agreements (where multiple studies converge).
3. Identify Contradictions, Discrepancies, and Conflicting Evidence.
4. Evaluate Systematic Limitations across the current state-of-the-art.
5. Identify at least 3 distinct, actionable Research Gaps solidly grounded in the literature (cite the verified sources by author and year).

Output a JSON object with this exact structure:
{
  "thematicSynthesis": "A 2-3 paragraph overarching synthesis of how current literature conceptualizes the field.",
  "consensusPoints": [
    {
      "claim": "Consensus claim",
      "supportingCitations": ["Author et al. (Year)", "Author2 et al. (Year)"],
      "explanation": "Detailed explanation of convergent findings"
    }
  ],
  "contradictionsAndDebates": [
    {
      "debate": "Point of contention or trade-off",
      "perspectiveA": "Finding/claim from Study A",
      "citationA": "Author A et al. (Year)",
      "perspectiveB": "Contrasting finding/claim from Study B",
      "citationB": "Author B et al. (Year)",
      "analysis": "Root cause of variance (e.g., benchmark variance, sample size, architectural differences)"
    }
  ],
  "methodologicalLimitations": [
    "Limitation 1 across current studies",
    "Limitation 2...",
    "Limitation 3..."
  ],
  "researchGaps": [
    {
      "gapId": "GAP-1",
      "title": "Concise Gap Title",
      "description": "Comprehensive explanation of the unresolved problem",
      "literatureEvidence": "Why this gap exists based on current studies (cite sources)",
      "proposedOpportunity": "How our paper or future work can address this gap"
    }
  ]
}
Return pure JSON only.`;

    const raw = await askGemini(prompt, 'You are an academic research synthesizer who refuses to fabricate facts.');
    const cleaned = raw.replace(/```json/g, '').replace(/```/g, '').trim();
    const synthesis = JSON.parse(cleaned);

    res.json({ success: true, synthesis });
  } catch (error: any) {
    console.error('Synthesis error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// 5. Paper Outline Proposal (Stage 7)
app.post('/api/research/generate-outline', async (req, res) => {
  try {
    const { topic, paperType, citationStyle, wordCount, evidenceMatrix, researchGaps, researchQuestions } = req.body;

    const prompt = `
You are the AI Research Paper Agent.
Your task is Stage 7: "Create an outline proposing paper structure before drafting".
Mandatory Output Structure:
1. Title
2. Abstract
3. Keywords
4. Introduction
5. Background and Related Work
6. Research Gap
7. Research Questions and Objectives
8. Methodology (or Proposed Methodology)
9. Results and Discussion, where supported by actual evidence or data
10. Limitations
11. Conclusion and Future Work
12. References

Context:
Topic: ${topic}
Paper Type: ${paperType || 'Systematic Literature Review & Synthesis'}
Citation Style: ${citationStyle || 'IEEE'}
Total Word Count Target: ${wordCount || 3500}
Verified Sources Available: ${(evidenceMatrix || []).map((m: any) => `${m.authorsFormatted}: ${m.paperTitle}`).join('; ')}
Research Gaps Identified: ${(researchGaps || []).map((g: any) => g.title).join('; ')}
Research Questions: ${JSON.stringify(researchQuestions || [])}

Create a detailed academic outline JSON object:
{
  "proposedTitle": "Formal Academic Paper Title",
  "targetWordCount": ${Number(wordCount) || 3500},
  "sections": [
    {
      "sectionNumber": 1,
      "title": "Title & Frontmatter",
      "targetWords": 50,
      "subsections": ["Proposed Title", "Author Metadata", "Affiliations"],
      "keyPoints": ["Formal title reflecting scope"],
      "assignedCitations": []
    },
    {
      "sectionNumber": 2,
      "title": "Abstract",
      "targetWords": 250,
      "subsections": ["Context", "Problem Statement", "Methodology / Approach", "Key Findings", "Significance"],
      "keyPoints": ["Structured abstract covering context, problem, synthesis, and takeaways"],
      "assignedCitations": []
    }
  ]
}
Ensure all 12 sections are present in order. For sections 4 through 11, distribute the word count appropriately and assign relevant citations from verified sources. Return pure JSON only.`;

    const raw = await askGemini(prompt, 'You are an academic editorial board member structuring high-impact papers.');
    const cleaned = raw.replace(/```json/g, '').replace(/```/g, '').trim();
    const outline = JSON.parse(cleaned);

    res.json({ success: true, outline });
  } catch (error: any) {
    console.error('Outline error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// 6. Paper Drafting (Stage 8)
app.post('/api/research/draft-paper', async (req, res) => {
  try {
    const {
      topic,
      paperType,
      citationStyle,
      outline,
      evidenceMatrix,
      researchGaps,
      researchQuestions,
      sectionToDraft,
    } = req.body;

    const sourcesRef = (evidenceMatrix || []).map((m: any, idx: number) => {
      const citeKey = citationStyle === 'IEEE' ? `[${idx + 1}]` : `(${m.authorsFormatted})`;
      return `${citeKey}: ${m.authorsFormatted}, "${m.paperTitle}", ${m.venue}, ${m.year}. DOI: ${m.doi || 'N/A'}. Key findings: ${m.keyFindings}. Limitations: ${m.limitations}`;
    }).join('\n\n');

    const prompt = `
You are the AI Research Paper Agent.
Your task is Stage 8: "Write the paper: Draft using evidence from verified sources".

CRITICAL ACADEMIC INTEGRITY DIRECTIVES:
- Use formal but clear academic language.
- Prefer primary research papers and authoritative sources.
- Cite factual and technical claims appropriately using ${citationStyle || 'IEEE'} style.
- Distinguish established findings, author interpretations, hypotheses, and unresolved questions.
- Report conflicting evidence fairly.
- NEVER fabricate sources, DOIs, quotations, statistics, experiments, or results.
- NEVER claim to have searched a database or verified a source unless this actually occurred.
- Do not invent experimental results for research that has not been conducted.
- Label proposed methodology as PROPOSED, not completed.
- Structure must strictly adhere to the 12 sections:
  1. Title
  2. Abstract
  3. Keywords
  4. Introduction
  5. Background and Related Work
  6. Research Gap
  7. Research Questions and Objectives
  8. Methodology (or Proposed Methodology)
  9. Results and Discussion (strictly supported by evidence or literature data)
  10. Limitations
  11. Conclusion and Future Work
  12. References (Must list verified sources only)

Topic: ${topic}
Paper Type: ${paperType || 'Systematic Literature Review'}
Target Citation Style: ${citationStyle || 'IEEE'}
Verified Sources Available for Citation:
${sourcesRef}

Research Questions:
${JSON.stringify(researchQuestions || [], null, 2)}

Identified Research Gaps:
${JSON.stringify(researchGaps || [], null, 2)}

${sectionToDraft ? `DRAFT SPECIFICALLY SECTION: "${sectionToDraft}".` : 'DRAFT THE COMPLETE PAPER WITH ALL 12 SECTIONS.'}

Format the response in rich, elegant Academic Markdown with clear headings (## 1. Title, ## 2. Abstract, etc.), blockquotes for key definitions or gap statements, LaTeX formulas where appropriate, and a full References section at the end matching ${citationStyle}.`;

    const draft = await askGemini(prompt, 'You are an elite academic scholar writing high-impact research papers under the strictest ethical guidelines.');

    res.json({ success: true, draft });
  } catch (error: any) {
    console.error('Drafting error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// 7. Draft Validation Engine (Stage 9)
app.post('/api/research/validate-draft', async (req, res) => {
  try {
    const { draftText, evidenceMatrix, citationStyle } = req.body;

    const sources = (evidenceMatrix || []).map((m: any, idx: number) => ({
      index: idx + 1,
      citationKey: citationStyle === 'IEEE' ? `[${idx + 1}]` : m.authorsFormatted,
      title: m.paperTitle,
      authors: m.authorsFormatted,
      year: m.year,
      doi: m.doi,
    }));

    const prompt = `
You are the AI Research Paper Agent.
Your task is Stage 9: "Validate the draft: Check factual claims, citation accuracy, reference completeness, logical consistency, and whether conclusions follow from the evidence".

CORE BEHAVIORAL RULE:
Verify publication details and connect each source to the claims it supports. Flag any uncited claim or missing citation. Never invent citations or DOIs.

Examine this drafted research paper:
---
${draftText}
---

Verified Sources in Repository:
${JSON.stringify(sources, null, 2)}

Perform a comprehensive 5-point academic audit and return a JSON object:
{
  "overallScore": 92,
  "auditSummary": "Executive summary of the draft's academic rigor, citation density, and integrity",
  "citationAccuracy": {
    "status": "PASS" | "NEEDS_ATTENTION",
    "details": "Evaluation of whether in-text citations match the reference list and vice-versa",
    "uncitedClaimsCount": 0,
    "matchedCitations": ["..."],
    "unmatchedCitations": ["..."]
  },
  "factualGrounding": {
    "status": "PASS" | "NEEDS_ATTENTION",
    "details": "Whether empirical claims are grounded in the verified evidence matrix or primary papers",
    "flaggedHallucinations": []
  },
  "referenceCompleteness": {
    "status": "PASS" | "NEEDS_ATTENTION",
    "details": "Check for complete author list, publication venue, year, and valid DOI/URL",
    "missingMetadata": []
  },
  "logicalConsistency": {
    "status": "PASS" | "NEEDS_ATTENTION",
    "details": "Check whether research questions are answered and conclusions strictly follow from evidence",
    "reasoningObservations": ["..."]
  },
  "claimsRequiringVerification": [
    {
      "claim": "Specific sentence or technical assertion",
      "reason": "Why this claim needs primary experimental data or further citation",
      "recommendedAction": "e.g. Add empirical benchmark reference or soften claim to hypothesis"
    }
  ],
  "disclosedLimitations": [
    "Limitation 1 properly disclosed in Section 10",
    "Limitation 2..."
  ]
}
Return pure JSON only.`;

    const raw = await askGemini(prompt, 'You are an academic peer-review auditor checking for citation ethics and factual rigor.');
    const cleaned = raw.replace(/```json/g, '').replace(/```/g, '').trim();
    const validation = JSON.parse(cleaned);

    res.json({ success: true, validation });
  } catch (error: any) {
    console.error('Validation error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// 8. Interactive Agent Chat Assistant
app.post('/api/research/chat', async (req, res) => {
  try {
    const { messages, currentStage, currentTopic, evidenceMatrix } = req.body;

    const systemPrompt = `
You are the AI Research Paper Agent, an academic research assistant specializing in:
- Literature reviews
- Evidence synthesis
- Research gap identification
- Research paper writing

CORE BEHAVIORAL PATTERNS TO FOLLOW RIGIDLY:
Example 1:
Input: "Write a research paper on AI in healthcare." (or any broad topic)
Behavioral Pattern: First identify a focused research question, such as "How can AI improve early disease detection?" Then suggest relevant research areas, gather credible sources, and organize the paper into sections. Do not jump immediately into full drafting without this systematic narrowing.

Example 2:
Input: "Write a literature review on fake review detection." (or any literature synthesis)
Behavioral Pattern: Compare existing research methods, datasets, findings, and limitations. Identify research gaps based on the available evidence and cite credible sources.

Example 3:
Input: "Add references to my research paper." (or citation verification requests)
Behavioral Pattern: Find relevant sources, verify their publication details, and connect each source to the claims it supports. Never invent citations or DOIs.

RULES:
1. Follow these examples as behavioral patterns in all user interactions.
2. Adapt the structure to the user's specific topic.
3. Use clear, formal academic language.
4. Never fabricate research findings or references under any circumstances.
5. Prefer primary research papers and authoritative sources.
6. Distinguish established findings, author interpretations, hypotheses, and unresolved questions.
7. Report conflicting evidence fairly.
8. Current Active Stage: ${currentStage || 'Stage 1: Understand the topic'}
9. Current Topic: "${currentTopic || 'Not yet defined'}"
10. Available Verified Sources: ${(evidenceMatrix || []).length} papers in evidence matrix.

Always maintain high scholarly rigor. Guide the user constructively through the 10-stage systematic methodology. If essential information is missing, ask concise clarifying questions.`;

    const conversationContext = messages
      .slice(-6)
      .map((m: any) => `${m.role === 'user' ? 'User' : 'Agent'}: ${m.content}`)
      .join('\n');

    const prompt = `${conversationContext}\n\nAgent (respond directly to the user):`;
    const reply = await askGemini(prompt, systemPrompt);

    res.json({ success: true, reply });
  } catch (error: any) {
    console.error('Agent chat error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// -------------------------------------------------------------
// Vite Middleware / Static Server
// -------------------------------------------------------------
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`AI Research Paper Agent server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
