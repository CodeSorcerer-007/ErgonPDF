import React from 'react';
import { FileText, Copy, Download } from 'lucide-react';
import { PDFEngineService } from '../../services/pdfEngine';
import type { PDFDocumentState } from '../../types/pdf';

export interface ExtractTextToolProps {
  docState: PDFDocumentState;
  extractedDocText: string;
  onExtractedDocTextChange: (text: string) => void;
  isProcessing: boolean;
  setIsProcessing: (val: boolean) => void;
  setProcessingStatus: (status: string) => void;
}

export const ExtractTextTool: React.FC<ExtractTextToolProps> = ({
  docState,
  extractedDocText,
  onExtractedDocTextChange,
  isProcessing,
  setIsProcessing,
  setProcessingStatus,
}) => {
  const handleExtractText = async () => {
    setIsProcessing(true);
    setProcessingStatus('Extracting text content…');
    try {
      const { text } = await PDFEngineService.extractFullText(docState.arrayBuffer);
      onExtractedDocTextChange(text);
    } catch (err) {
      console.error('Extract text error:', err);
      alert('Could not extract text from document.');
    } finally {
      setIsProcessing(false);
      setProcessingStatus('');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <FileText size={16} color="var(--accent-primary)" />
        <h4 style={{ fontSize: '15px', fontWeight: 700 }}>Extract Document Text</h4>
      </div>
      <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
        Extract all selectable paragraphs and text lines into plain text.
      </p>

      <button
        type="button"
        onClick={handleExtractText}
        disabled={isProcessing}
        className="btn btn-secondary btn-sm"
        style={{ width: '100%' }}
      >
        <FileText size={14} />
        <span>Extract All Text</span>
      </button>

      {extractedDocText && (
        <div>
          <pre
            style={{
              width: '100%',
              maxHeight: '240px',
              overflowY: 'auto',
              padding: '10px',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-medium)',
              background: 'var(--bg-tertiary)',
              color: 'var(--text-primary)',
              fontSize: '11px',
              fontFamily: 'var(--font-mono)',
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-word',
            }}
          >
            {extractedDocText}
          </pre>
          <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
            <button
              type="button"
              onClick={() => {
                navigator.clipboard.writeText(extractedDocText);
                alert('Copied to clipboard!');
              }}
              className="btn btn-secondary btn-sm"
              style={{ flex: 1 }}
            >
              <Copy size={13} />
              <span>Copy</span>
            </button>
            <button
              type="button"
              onClick={() => {
                const blob = new Blob([extractedDocText], { type: 'text/plain;charset=utf-8' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `${docState.name.replace('.pdf', '')}_text.txt`;
                a.click();
              }}
              className="btn btn-primary btn-sm"
              style={{ flex: 1 }}
            >
              <Download size={13} />
              <span>Download .txt</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
