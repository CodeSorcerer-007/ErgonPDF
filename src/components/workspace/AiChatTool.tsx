import React from 'react';
import { Sparkles, MessageSquare, BookOpen, FileText, ShieldCheck, ArrowRight } from 'lucide-react';
import type { PDFDocumentState } from '../../types/pdf';

export interface AiChatToolProps {
  docState: PDFDocumentState;
  fullDocumentText: string;
  fullPageTexts: { pageNumber: number; text: string }[];
  isExtractingText?: boolean;
  onOpenAiStudio: () => void;
}

export const AiChatTool: React.FC<AiChatToolProps> = ({
  docState,
  fullDocumentText,
  fullPageTexts,
  isExtractingText = false,
  onOpenAiStudio,
}) => {
  const wordCount = fullDocumentText ? fullDocumentText.trim().split(/\s+/).filter(Boolean).length : 0;
  const pageCount = fullPageTexts.length || docState.pages.filter((p) => !p.deleted).length;
  const estimatedReadMinutes = Math.max(1, Math.round(wordCount / 200));

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {/* Tool Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <Sparkles size={16} color="var(--accent-primary)" />
        <h4 style={{ fontSize: '15px', fontWeight: 700 }}>AI Document Studio</h4>
      </div>
      <p style={{ fontSize: '12px', color: 'var(--text-muted)', lineHeight: 1.45 }}>
        Perform semantic Q&amp;A queries, synthesize executive summaries, discover action items, and generate study flashcards from this document.
      </p>

      {/* Document Metrics Card */}
      <div
        className="glass-card"
        style={{
          padding: '12px 14px',
          background: 'var(--bg-tertiary)',
          borderRadius: 'var(--radius-md)',
          display: 'flex',
          flexDirection: 'column',
          gap: '8px',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.04em', color: 'var(--text-muted)', fontWeight: 600 }}>
            Document Corpus
          </span>
          {isExtractingText ? (
            <span className="badge" style={{ fontSize: '10px' }}>Extracting…</span>
          ) : (
            <span className="badge badge-accent" style={{ fontSize: '10px' }}>Ready</span>
          )}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px', paddingTop: '4px' }}>
          <div>
            <div style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-primary)' }}>
              {isExtractingText ? '—' : wordCount.toLocaleString()}
            </div>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Words</div>
          </div>
          <div>
            <div style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-primary)' }}>
              {pageCount}
            </div>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Pages</div>
          </div>
          <div>
            <div style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-primary)' }}>
              {isExtractingText ? '—' : `~${estimatedReadMinutes}m`}
            </div>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Read Time</div>
          </div>
        </div>
      </div>

      {/* Primary Action Button */}
      <button
        type="button"
        onClick={onOpenAiStudio}
        className="btn btn-primary"
        style={{
          width: '100%',
          padding: '12px 16px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '8px',
          fontWeight: 600,
        }}
      >
        <Sparkles size={16} />
        <span>Launch AI Studio</span>
        <ArrowRight size={14} />
      </button>

      {/* Available Capabilities */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <span style={{ fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', color: 'var(--text-muted)', letterSpacing: '0.04em' }}>
          Included Capabilities
        </span>

        <div
          className="interactive-card"
          onClick={onOpenAiStudio}
          style={{
            padding: '10px 12px',
            borderRadius: 'var(--radius-sm)',
            border: '1px solid var(--border-subtle)',
            background: 'var(--bg-secondary)',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            cursor: 'pointer',
          }}
        >
          <MessageSquare size={16} color="var(--accent-primary)" />
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>Semantic Q&amp;A Chat</div>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Answers backed by exact page references</div>
          </div>
        </div>

        <div
          className="interactive-card"
          onClick={onOpenAiStudio}
          style={{
            padding: '10px 12px',
            borderRadius: 'var(--radius-sm)',
            border: '1px solid var(--border-subtle)',
            background: 'var(--bg-secondary)',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            cursor: 'pointer',
          }}
        >
          <FileText size={16} color="var(--accent-primary)" />
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>Executive Synthesis</div>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Key points, financial entities &amp; deadlines</div>
          </div>
        </div>

        <div
          className="interactive-card"
          onClick={onOpenAiStudio}
          style={{
            padding: '10px 12px',
            borderRadius: 'var(--radius-sm)',
            border: '1px solid var(--border-subtle)',
            background: 'var(--bg-secondary)',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            cursor: 'pointer',
          }}
        >
          <BookOpen size={16} color="var(--accent-primary)" />
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>Study Flashcards</div>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Dynamic question-answer revision cards</div>
          </div>
        </div>
      </div>

      {/* Privacy Guarantee Banner */}
      <div
        style={{
          marginTop: '4px',
          padding: '10px 12px',
          borderRadius: 'var(--radius-sm)',
          background: 'var(--success-bg)',
          border: '1px solid var(--success-border)',
          display: 'flex',
          gap: '8px',
          alignItems: 'flex-start',
        }}
      >
        <ShieldCheck size={16} color="var(--success)" style={{ flexShrink: 0, marginTop: '1px' }} />
        <p style={{ fontSize: '11px', color: 'var(--text-secondary)', lineHeight: 1.4, margin: 0 }}>
          <strong>100% Client-Side Privacy:</strong> Heuristic analysis and semantic search execute entirely within your browser memory. No text or queries leave your machine.
        </p>
      </div>
    </div>
  );
};
