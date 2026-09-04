import React, { useState } from 'react';
import { X, Sparkles, Send, FileText, CheckSquare, Calendar, Download, BookOpen } from 'lucide-react';
import { AIService } from '../services/aiService';
import type { DocumentAnalysis, Flashcard, ChatMessage } from '../services/aiService';

interface AiStudioModalProps {
  isOpen: boolean;
  onClose: () => void;
  documentName: string;
  documentText: string;
  pageTexts: { pageNumber: number; text: string }[];
  onNavigateToPage?: (pageNum: number) => void;
}

export const AiStudioModal: React.FC<AiStudioModalProps> = ({
  isOpen,
  onClose,
  documentName,
  documentText,
  pageTexts,
  onNavigateToPage,
}) => {
  const [activeTab, setActiveTab] = useState<'insights' | 'chat' | 'flashcards'>('insights');
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'msg-welcome',
      sender: 'assistant',
      content: `Hello! I've analyzed **${documentName}**. You can ask me questions about this document, request summaries, or ask for specific details.`,
      timestamp: Date.now(),
    },
  ]);
  const [inputQuery, setInputQuery] = useState('');

  const analysis: DocumentAnalysis = React.useMemo(() => {
    if (!documentText) {
      return {
        type: 'general',
        confidence: 0.8,
        wordCount: 0,
        estimatedReadingTimeMinutes: 1,
        summary: 'No document text found. Try running OCR if this is a scanned document.',
        keyPoints: [],
        actionItems: [],
        importantDates: [],
        financialEntities: [],
        contactInfo: { emails: [], phones: [] },
      };
    }
    return AIService.analyzeDocumentLocally(documentText, pageTexts);
  }, [documentText, pageTexts]);

  const flashcards: Flashcard[] = React.useMemo(() => {
    return AIService.generateFlashcards(pageTexts);
  }, [pageTexts]);

  if (!isOpen) return null;

  const handleSendMessage = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputQuery.trim()) return;

    const userMsg: ChatMessage = {
      id: `usr-${Date.now()}`,
      sender: 'user',
      content: inputQuery,
      timestamp: Date.now(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputQuery('');

    const res = AIService.answerQuery(inputQuery, pageTexts);
    setTimeout(() => {
      const botMsg: ChatMessage = {
        id: `bot-${Date.now()}`,
        sender: 'assistant',
        content: res.answer,
        pageReferences: res.pageReferences,
        timestamp: Date.now(),
      };
      setMessages((prev) => [...prev, botMsg]);
    }, 250);
  };

  const exportSummaryMarkdown = () => {
    const md = `# Document Analysis: ${documentName}

**Document Classification:** ${analysis.type.toUpperCase()} (Confidence: ${Math.round(analysis.confidence * 100)}%)
**Word Count:** ${analysis.wordCount} words (~${analysis.estimatedReadingTimeMinutes} min read)

## Executive Summary
${analysis.summary}

## Key Highlights
${analysis.keyPoints.map((p) => `- ${p}`).join('\n')}

## Action Items & Deadlines
${analysis.actionItems.map((a) => `- [ ] ${a}`).join('\n')}

## Important Dates Detected
${analysis.importantDates.join(', ') || 'None'}

---
*Generated privately with ErgonPDF AI Studio*
`;
    const blob = new Blob([md], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${documentName.replace('.pdf', '')}_summary.md`;
    a.click();
  };

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      zIndex: 110,
      background: 'rgba(0, 0, 0, 0.65)',
      backdropFilter: 'blur(8px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px',
    }} onClick={onClose}>
      <div className="glass-panel animate-scale-in" style={{
        width: '100%',
        maxWidth: '780px',
        height: '85vh',
        display: 'flex',
        flexDirection: 'column',
        background: 'var(--bg-secondary)',
        borderRadius: 'var(--radius-lg)',
        boxShadow: 'var(--shadow-xl)',
        overflow: 'hidden',
      }} onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div style={{
          padding: '16px 20px',
          borderBottom: '1px solid var(--border-subtle)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '34px',
              height: '34px',
              borderRadius: '10px',
              background: 'linear-gradient(135deg, #8b5cf6 0%, #ec4899 100%)',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 2px 10px rgba(139, 92, 246, 0.4)',
            }}>
              <Sparkles size={18} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <h3 style={{ fontSize: '17px', fontWeight: 700 }}>AI Document Studio</h3>
                <span className="badge badge-privacy" style={{ fontSize: '10px' }}>
                  Private & Local
                </span>
              </div>
              <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                {documentName} • {analysis.wordCount} words
              </p>
            </div>
          </div>
          <button onClick={onClose} className="btn btn-ghost btn-icon">
            <X size={18} />
          </button>
        </div>

        {/* Tab Buttons */}
        <div style={{
          display: 'flex',
          borderBottom: '1px solid var(--border-subtle)',
          background: 'var(--bg-tertiary)',
        }}>
          <button
            onClick={() => setActiveTab('insights')}
            className="btn btn-ghost"
            style={{
              flex: 1,
              borderRadius: 0,
              borderBottom: activeTab === 'insights' ? '2px solid var(--accent-primary)' : 'none',
              color: activeTab === 'insights' ? 'var(--accent-primary)' : 'var(--text-secondary)',
              fontWeight: activeTab === 'insights' ? 600 : 500,
            }}
          >
            <FileText size={15} />
            <span>Document Insights</span>
          </button>

          <button
            onClick={() => setActiveTab('chat')}
            className="btn btn-ghost"
            style={{
              flex: 1,
              borderRadius: 0,
              borderBottom: activeTab === 'chat' ? '2px solid var(--accent-primary)' : 'none',
              color: activeTab === 'chat' ? 'var(--accent-primary)' : 'var(--text-secondary)',
              fontWeight: activeTab === 'chat' ? 600 : 500,
            }}
          >
            <Sparkles size={15} />
            <span>Ask & Chat</span>
          </button>

          <button
            onClick={() => setActiveTab('flashcards')}
            className="btn btn-ghost"
            style={{
              flex: 1,
              borderRadius: 0,
              borderBottom: activeTab === 'flashcards' ? '2px solid var(--accent-primary)' : 'none',
              color: activeTab === 'flashcards' ? 'var(--accent-primary)' : 'var(--text-secondary)',
              fontWeight: activeTab === 'flashcards' ? 600 : 500,
            }}
          >
            <BookOpen size={15} />
            <span>Study Flashcards</span>
          </button>
        </div>

        {/* Tab Content */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '20px' }}>
          {activeTab === 'insights' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {/* Type Card */}
              <div className="glass-card" style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <span style={{ fontSize: '11px', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 600 }}>
                    Detected Classification
                  </span>
                  <h4 style={{ fontSize: '18px', fontWeight: 700, textTransform: 'capitalize' }}>
                    {analysis.type.replace('_', ' ')} Document
                  </h4>
                  <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                    Confidence: {Math.round(analysis.confidence * 100)}% • Approx. {analysis.estimatedReadingTimeMinutes} min reading time
                  </p>
                </div>
                <button onClick={exportSummaryMarkdown} className="btn btn-secondary btn-sm">
                  <Download size={13} />
                  <span>Export Markdown</span>
                </button>
              </div>

              {/* Summary */}
              <div className="glass-card" style={{ padding: '16px 20px' }}>
                <h4 style={{ fontSize: '15px', fontWeight: 700, marginBottom: '8px' }}>
                  Executive Summary
                </h4>
                <p style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                  {analysis.summary}
                </p>
              </div>

              {/* Key Takeaways */}
              {analysis.keyPoints.length > 0 && (
                <div className="glass-card" style={{ padding: '16px 20px' }}>
                  <h4 style={{ fontSize: '15px', fontWeight: 700, marginBottom: '10px' }}>
                    Key Takeaways
                  </h4>
                  <ul style={{ paddingLeft: '18px', fontSize: '13px', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {analysis.keyPoints.map((point, i) => (
                      <li key={i}>{point}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Action Items */}
              {analysis.actionItems.length > 0 && (
                <div className="glass-card" style={{ padding: '16px 20px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
                    <CheckSquare size={16} color="var(--accent-primary)" />
                    <h4 style={{ fontSize: '15px', fontWeight: 700 }}>
                      Action Items & Requirements
                    </h4>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    {analysis.actionItems.map((item, i) => (
                      <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', fontSize: '13px' }}>
                        <input type="checkbox" style={{ marginTop: '3px' }} />
                        <span>{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Entities */}
              {analysis.importantDates.length > 0 && (
                <div className="glass-card" style={{ padding: '16px 20px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                    <Calendar size={16} color="var(--info)" />
                    <h4 style={{ fontSize: '15px', fontWeight: 700 }}>
                      Important Dates Detected
                    </h4>
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                    {analysis.importantDates.map((date, idx) => (
                      <span key={idx} className="badge badge-muted" style={{ fontSize: '12px', padding: '4px 10px' }}>
                        {date}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'chat' && (
            <div style={{ display: 'flex', flexDirection: 'column', height: '100%', justifyContent: 'space-between' }}>
              <div style={{ overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '14px', paddingBottom: '16px' }}>
                {messages.map((m) => (
                  <div
                    key={m.id}
                    style={{
                      alignSelf: m.sender === 'user' ? 'flex-end' : 'flex-start',
                      maxWidth: '85%',
                      padding: '12px 16px',
                      borderRadius: 'var(--radius-md)',
                      background: m.sender === 'user' ? 'var(--accent-primary)' : 'var(--bg-tertiary)',
                      color: m.sender === 'user' ? '#ffffff' : 'var(--text-primary)',
                      boxShadow: 'var(--shadow-xs)',
                    }}
                  >
                    <p style={{ fontSize: '14px', lineHeight: 1.5, whiteSpace: 'pre-wrap' }}>
                      {m.content}
                    </p>

                    {m.pageReferences && m.pageReferences.length > 0 && (
                      <div style={{
                        marginTop: '8px',
                        paddingTop: '6px',
                        borderTop: '1px solid rgba(255,255,255,0.15)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        fontSize: '11px',
                      }}>
                        <span>Jump to page:</span>
                        {m.pageReferences.map((page) => (
                          <button
                            key={page}
                            onClick={() => {
                              if (onNavigateToPage) {
                                onNavigateToPage(page);
                                onClose();
                              }
                            }}
                            className="btn btn-secondary btn-sm"
                            style={{ padding: '1px 6px', fontSize: '11px' }}
                          >
                            Page {page}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Chat Input Bar */}
              <form onSubmit={handleSendMessage} style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                paddingTop: '12px',
                borderTop: '1px solid var(--border-subtle)',
              }}>
                <input
                  type="text"
                  placeholder="Ask any question about this document (e.g. 'What are the payment terms?')"
                  value={inputQuery}
                  onChange={(e) => setInputQuery(e.target.value)}
                  style={{
                    flex: 1,
                    padding: '10px 14px',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border-medium)',
                    background: 'var(--bg-tertiary)',
                    color: 'var(--text-primary)',
                    outline: 'none',
                    fontSize: '14px',
                  }}
                />
                <button type="submit" className="btn btn-primary" style={{ padding: '10px 16px' }}>
                  <Send size={15} />
                  <span>Ask</span>
                </button>
              </form>
            </div>
          )}

          {activeTab === 'flashcards' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                Automatically generated study flashcards based on document key concepts and definitions.
              </p>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                gap: '14px',
              }}>
                {flashcards.map((fc) => (
                  <div key={fc.id} className="glass-card" style={{ padding: '16px' }}>
                    <span className="badge badge-accent" style={{ fontSize: '10px', marginBottom: '8px' }}>
                      Page {fc.pageReference || 1}
                    </span>
                    <h5 style={{ fontSize: '14px', fontWeight: 700, marginBottom: '6px', color: 'var(--text-primary)' }}>
                      {fc.question}
                    </h5>
                    <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
                      {fc.answer}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
