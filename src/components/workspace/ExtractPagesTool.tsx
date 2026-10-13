import React from 'react';
import { FolderDown } from 'lucide-react';
import { PDFEngineService } from '../../services/pdfEngine';
import type { PDFDocumentState } from '../../types/pdf';

export interface ExtractPagesToolProps {
  docState: PDFDocumentState;
  extractRangeText: string;
  onRangeTextChange: (text: string) => void;
  isProcessing: boolean;
  setIsProcessing: (val: boolean) => void;
  setProcessingStatus: (status: string) => void;
}

export const ExtractPagesTool: React.FC<ExtractPagesToolProps> = ({
  docState,
  extractRangeText,
  onRangeTextChange,
  isProcessing,
  setIsProcessing,
  setProcessingStatus,
}) => {
  const handleExtract = async () => {
    setIsProcessing(true);
    setProcessingStatus('Extracting selected pages…');
    try {
      const pageNumbers: number[] = [];
      extractRangeText.split(',').forEach((part) => {
        const range = part.trim().split('-');
        if (range.length === 2) {
          const start = parseInt(range[0], 10);
          const end = parseInt(range[1], 10);
          for (let i = start; i <= end; i++) pageNumbers.push(i);
        } else if (range.length === 1 && parseInt(range[0], 10)) {
          pageNumbers.push(parseInt(range[0], 10));
        }
      });

      const extracted = await PDFEngineService.extractPageRanges(docState.arrayBuffer, pageNumbers);
      const blob = new Blob([new Uint8Array(extracted)], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = `${docState.name.replace('.pdf', '')}_extracted.pdf`;
      document.body.appendChild(a);
      a.click();
      setTimeout(() => {
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }, 100);
    } catch (err) {
      console.error('Extraction error:', err);
      alert('Could not extract pages. Check range format.');
    } finally {
      setIsProcessing(false);
      setProcessingStatus('');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
      <div>
        <h4 style={{ fontSize: '15px', fontWeight: 700, marginBottom: '4px' }}>
          Extract Specific Pages
        </h4>
        <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
          Specify comma-separated page numbers or ranges to isolate into a new PDF.
        </p>
      </div>

      <div>
        <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)' }}>
          Page Ranges (e.g. 1, 3-5)
        </label>
        <input
          type="text"
          value={extractRangeText}
          onChange={(e) => onRangeTextChange(e.target.value)}
          placeholder="1, 3-5"
          style={{
            width: '100%',
            padding: '8px 12px',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border-medium)',
            background: 'var(--bg-tertiary)',
            color: 'var(--text-primary)',
            marginTop: '4px',
            fontSize: '13px',
          }}
        />
      </div>

      <button
        type="button"
        onClick={handleExtract}
        disabled={isProcessing}
        className="btn btn-primary btn-sm"
        style={{ width: '100%' }}
      >
        <FolderDown size={14} />
        <span>Download Extracted Pages</span>
      </button>
    </div>
  );
};
