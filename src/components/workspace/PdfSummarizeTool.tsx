import React, { useState } from 'react';
import { Sparkles, Copy, Check, Download, Loader2 } from 'lucide-react';
import type { PDFDocumentState } from '../../types/pdf';
import { AIService } from '../../services/aiService';
import { PDFEngineService } from '../../services/pdfEngine';
import confetti from 'canvas-confetti';

export interface PdfSummarizeToolProps {
  docState: PDFDocumentState;
  fullDocumentText: string;
}

export const PdfSummarizeTool: React.FC<PdfSummarizeToolProps> = ({
  docState,
  fullDocumentText,
}) => {
  const [summaryMode, setSummaryMode] = useState<'executive' | 'bullets' | 'clauses'>('bullets');
  const [summaryText, setSummaryText] = useState<string>('');
  const [isSummarizing, setIsSummarizing] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleGenerateSummary = async () => {
    setIsSummarizing(true);
    try {
      let textToAnalyze = fullDocumentText;
      if (!textToAnalyze) {
        const res = await PDFEngineService.extractFullText(docState.arrayBuffer);
        textToAnalyze = res.text;
      }
      const result = await AIService.analyzeDocumentLocally(textToAnalyze);

      let formatted = '';
      if (summaryMode === 'bullets') {
        formatted = `• Document Overview: ${result.summary}\n\nKey Takeaways:\n${result.keyPoints.map((k) => `• ${k}`).join('\n')}\n\n• Document Category: ${result.type.toUpperCase()} (${(result.confidence * 100).toFixed(0)}% confidence)\n• Reading Time: ~${result.estimatedReadingTimeMinutes} min (${result.wordCount} words)`;
      } else if (summaryMode === 'executive') {
        formatted = `EXECUTIVE SUMMARY\n\n${result.summary}\n\nSTRATEGIC IMPLICATIONS:\n${result.keyPoints.slice(0, 3).map((k, i) => `${i + 1}. ${k}`).join('\n')}\n\nIdentified Financial / Entity Terms: ${(result.financialEntities.length > 0 ? result.financialEntities : result.actionItems).join(', ') || 'None identified'}`;
      } else {
        formatted = `LEGAL & CLAUSE AUDIT\n\nExecutive Overview:\n${result.summary}\n\nIdentified Obligations & Action Items:\n${(result.actionItems.length > 0 ? result.actionItems : result.keyPoints).map((k) => `[CLAUSE] ${k}`).join('\n')}`;
      }

      setSummaryText(formatted);
      confetti({ particleCount: 40, spread: 50, origin: { y: 0.7 } });
    } catch (err) {
      console.error(err);
      setSummaryText('Unable to complete local AI summary. Ensure the document contains readable text streams.');
    } finally {
      setIsSummarizing(false);
    }
  };

  const handleCopy = () => {
    if (!summaryText) return;
    navigator.clipboard.writeText(summaryText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleExportPdf = async () => {
    if (!summaryText) return;
    try {
      const pdfBytes = await PDFEngineService.createBlankPDF('blank', 1);
      const blob = new Blob([pdfBytes as any], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Summary_${docState.name.replace(/\.[^/.]+$/, '')}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <Sparkles size={18} color="var(--accent-primary)" />
        <h4 style={{ fontSize: '15px', fontWeight: 700, margin: 0 }}>AI Summarizer</h4>
      </div>
      <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: 0 }}>
        Extract executive summaries, key bullet points, and critical clauses with zero cloud transmission.
      </p>

      <div>
        <label style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)' }}>Summary Format</label>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '6px', marginTop: '4px' }}>
          {[
            { id: 'bullets', label: 'Key Bullets' },
            { id: 'executive', label: 'Executive' },
            { id: 'clauses', label: 'Clauses' },
          ].map((m) => (
            <button
              key={m.id}
              type="button"
              onClick={() => setSummaryMode(m.id as any)}
              className={summaryMode === m.id ? 'btn btn-primary btn-sm' : 'btn btn-secondary btn-sm'}
              style={{ fontSize: '11px', padding: '6px 4px' }}
            >
              {m.label}
            </button>
          ))}
        </div>
      </div>

      <button
        type="button"
        onClick={handleGenerateSummary}
        disabled={isSummarizing}
        className="btn btn-primary btn-sm"
        style={{ width: '100%', gap: '6px' }}
      >
        {isSummarizing ? (
          <>
            <Loader2 size={13} className="animate-spin" />
            <span>Analyzing Document Locally…</span>
          </>
        ) : (
          <>
            <Sparkles size={13} />
            <span>Generate AI Summary</span>
          </>
        )}
      </button>

      {summaryText && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <textarea
            readOnly
            rows={10}
            value={summaryText}
            style={{
              width: '100%',
              padding: '8px 10px',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-medium)',
              background: 'var(--bg-tertiary)',
              color: 'var(--text-primary)',
              fontSize: '11.5px',
              lineHeight: 1.45,
              resize: 'none',
            }}
          />

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
            <button
              type="button"
              onClick={handleCopy}
              className="btn btn-secondary btn-sm"
              style={{ gap: '6px' }}
            >
              {copied ? <Check size={13} color="var(--success)" /> : <Copy size={13} />}
              <span>{copied ? 'Copied!' : 'Copy Summary'}</span>
            </button>

            <button
              type="button"
              onClick={handleExportPdf}
              className="btn btn-secondary btn-sm"
              style={{ gap: '6px' }}
            >
              <Download size={13} />
              <span>Export as PDF</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
