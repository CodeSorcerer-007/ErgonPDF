export type DocumentType = 
  | 'contract' 
  | 'invoice' 
  | 'academic_paper' 
  | 'resume' 
  | 'form' 
  | 'report' 
  | 'general';

export interface DocumentAnalysis {
  type: DocumentType;
  confidence: number;
  wordCount: number;
  estimatedReadingTimeMinutes: number;
  summary: string;
  keyPoints: string[];
  actionItems: string[];
  importantDates: string[];
  financialEntities: string[];
  contactInfo: {
    emails: string[];
    phones: string[];
  };
}

export interface Flashcard {
  id: string;
  question: string;
  answer: string;
  pageReference?: number;
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  pageReference?: number;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  content: string;
  pageReferences?: number[];
  timestamp: number;
}

export class AIService {
  /**
   * Performs zero-network local heuristic document analysis and classification.
   */
  static analyzeDocumentLocally(
    documentText: string, 
    _pageTexts?: { pageNumber: number; text: string }[]
  ): DocumentAnalysis {
    const lower = documentText.toLowerCase();
    const words = documentText.trim().split(/\s+/).filter(Boolean);
    const wordCount = words.length;
    const readingTime = Math.max(1, Math.round(wordCount / 200));

    // Robust Multi-Signal Heuristic Classification
    const scores: Record<DocumentType, number> = {
      contract: 0,
      invoice: 0,
      academic_paper: 0,
      resume: 0,
      form: 0,
      report: 0,
      general: 0,
    };

    // Contract indicators (High-value phrases)
    if (lower.includes('master services agreement') || lower.includes('service agreement')) scores.contract += 15;
    if (lower.includes('agreement') || lower.includes('contract')) scores.contract += 6;
    if (lower.includes('in witness whereof')) scores.contract += 10;
    if (lower.includes('terms and conditions') || lower.includes('hereby')) scores.contract += 5;
    if (lower.includes('parties agree') || lower.includes('by and between')) scores.contract += 8;
    if (lower.includes('confidentiality') || lower.includes('scope of services')) scores.contract += 4;

    // Invoice indicators
    if (lower.includes('tax invoice') || lower.includes('commercial invoice')) scores.invoice += 15;
    if (lower.includes('invoice #') || lower.includes('invoice no')) scores.invoice += 12;
    if (lower.includes('bill to:') || lower.includes('remit to:')) scores.invoice += 10;
    if (lower.includes('subtotal') || lower.includes('balance due') || lower.includes('amount due')) scores.invoice += 8;
    if (lower.includes('unit price') || lower.includes('qty')) scores.invoice += 5;
    if (lower.includes('invoice') && scores.contract < 5) scores.invoice += 4;

    // Academic indicators
    if (lower.includes('abstract') && lower.includes('references')) scores.academic_paper += 15;
    if (lower.includes('doi:') || lower.includes('et al.')) scores.academic_paper += 10;
    if (lower.includes('methodology') || lower.includes('hypothesis')) scores.academic_paper += 6;

    // Resume indicators
    if (lower.includes('curriculum vitae') || lower.includes('resume')) scores.resume += 15;
    if (lower.includes('experience') && lower.includes('education') && lower.includes('skills')) scores.resume += 12;
    if (lower.includes('work history') || lower.includes('professional summary')) scores.resume += 8;

    // Form indicators
    if (lower.includes('application form') || lower.includes('registration form')) scores.form += 15;
    if (lower.includes('fillable') || lower.includes('date of birth') || lower.includes('applicant signature')) scores.form += 8;

    // Report indicators
    if (lower.includes('annual report') || lower.includes('quarterly report')) scores.report += 15;
    if (lower.includes('executive summary') || lower.includes('key findings')) scores.report += 8;

    let bestType: DocumentType = 'general';
    let maxScore = 0;
    for (const [key, val] of Object.entries(scores) as [DocumentType, number][]) {
      if (val > maxScore) {
        maxScore = val;
        bestType = key;
      }
    }

    const type: DocumentType = maxScore >= 4 ? bestType : 'general';
    const confidence = maxScore >= 12 ? 0.95 : maxScore >= 6 ? 0.88 : 0.72;

    // Extract Entities using RegEx
    const emailRegex = /([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9._-]+)/gi;
    const emails = Array.from(new Set(documentText.match(emailRegex) || [])).slice(0, 10);

    const phoneRegex = /(\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/g;
    const phones = Array.from(new Set(documentText.match(phoneRegex) || [])).slice(0, 10);

    const dateRegex = /\b(\d{1,2}[/-]\d{1,2}[/-]\d{2,4}|(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]* \d{1,2},? \d{4}|\d{4}[/-]\d{1,2}[/-]\d{1,2})\b/gi;
    const importantDates = Array.from(new Set(documentText.match(dateRegex) || [])).slice(0, 10);

    const moneyRegex = /([$€£¥₹]\s?[\d,]+(?:\.\d{2})?|\b[\d,]+(?:\.\d{2})?\s?(?:USD|EUR|GBP|INR)\b)/gi;
    const financialEntities = Array.from(new Set(documentText.match(moneyRegex) || [])).slice(0, 10);

    // Heuristic Summarization & Key Points
    const sentences = documentText
      .split(/[.!?]+/)
      .map((s) => s.trim())
      .filter((s) => s.length > 25 && s.length < 240);

    const summarySentences = sentences.slice(0, 3);
    const summary = summarySentences.length > 0
      ? summarySentences.join('. ') + '.'
      : 'Document content analyzed. Use the interactive queries below to extract specific findings.';

    const keyPoints = sentences
      .filter((s) => 
        s.toLowerCase().includes('important') || 
        s.toLowerCase().includes('key') || 
        s.toLowerCase().includes('shall') || 
        s.toLowerCase().includes('requires') ||
        s.toLowerCase().includes('total') ||
        s.toLowerCase().includes('conclude') ||
        s.toLowerCase().includes('note')
      )
      .slice(0, 5);

    if (keyPoints.length < 3 && sentences.length >= 3) {
      keyPoints.push(...sentences.slice(3, 7));
    }

    const actionItems = sentences
      .filter((s) => 
        s.toLowerCase().includes('must') || 
        s.toLowerCase().includes('action') || 
        s.toLowerCase().includes('submit') || 
        s.toLowerCase().includes('due by') ||
        s.toLowerCase().includes('required to') ||
        s.toLowerCase().includes('payment')
      )
      .slice(0, 5);

    return {
      type,
      confidence,
      wordCount,
      estimatedReadingTimeMinutes: readingTime,
      summary,
      keyPoints: keyPoints.slice(0, 5),
      actionItems: actionItems.length > 0 ? actionItems : ['Review document details and archive.'],
      importantDates,
      financialEntities,
      contactInfo: { emails, phones },
    };
  }

  /**
   * Responds to user chat queries about the document, finding relevant pages and generating answers.
   */
  static answerQuery(
    query: string, 
    pageTexts: { pageNumber: number; text: string }[]
  ): { answer: string; pageReferences: number[] } {
    const qLower = query.toLowerCase();
    const matchedPages: { pageNumber: number; score: number; snippet: string }[] = [];

    const queryTerms = qLower.split(/\s+/).filter((w) => w.length > 2);

    pageTexts.forEach((p) => {
      const pTextLower = p.text.toLowerCase();
      let score = 0;
      queryTerms.forEach((term) => {
        if (pTextLower.includes(term)) {
          score += 1;
        }
      });
      if (score > 0) {
        matchedPages.push({
          pageNumber: p.pageNumber,
          score,
          snippet: p.text.slice(0, 200),
        });
      }
    });

    matchedPages.sort((a, b) => b.score - a.score);

    if (matchedPages.length === 0) {
      return {
        answer: `I could not locate specific mentions of "${query}" in this document. Try searching with different terms or check if the document requires OCR.`,
        pageReferences: [],
      };
    }

    const topRefs = matchedPages.slice(0, 3).map((m) => m.pageNumber);
    const mainSnippet = matchedPages[0].snippet.replace(/\s+/g, ' ');

    let answer = `Based on the document context on **Page ${matchedPages[0].pageNumber}**:\n\n> "…${mainSnippet}…"\n\n`;
    if (topRefs.length > 1) {
      answer += `Relevant discussions also occur on **Pages ${topRefs.slice(1).join(', ')}**.`;
    }

    return {
      answer,
      pageReferences: topRefs,
    };
  }

  /**
   * Generates interactive flashcards for study notes from document text.
   */
  static generateFlashcards(
    pageTexts: { pageNumber: number; text: string }[]
  ): Flashcard[] {
    const flashcards: Flashcard[] = [];
    pageTexts.forEach((p) => {
      const sentences = p.text.split(/[.!?]+/).map((s) => s.trim()).filter((s) => s.length > 30);
      sentences.forEach((s) => {
        if (s.includes(' is ') || s.includes(' are ') || s.includes(' defined as ')) {
          const parts = s.split(/ is | are | defined as /);
          if (parts.length === 2 && parts[0].length < 40 && parts[1].length < 160) {
            flashcards.push({
              id: `fc-${Math.random().toString(36).substring(2, 9)}`,
              question: `What is ${parts[0]}?`,
              answer: parts[1],
              pageReference: p.pageNumber,
            });
          }
        }
      });
    });

    if (flashcards.length === 0) {
      flashcards.push({
        id: 'fc-default',
        question: 'What is the primary topic of this document?',
        answer: pageTexts[0]?.text.slice(0, 150) || 'General documentation',
        pageReference: 1,
      });
    }

    return flashcards.slice(0, 8);
  }
}
