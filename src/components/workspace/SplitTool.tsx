import React from 'react';
import { Scissors } from 'lucide-react';
import JSZip from 'jszip';
import { PDFEngineService } from '../../services/pdfEngine';
import type { PDFDocumentState } from '../../types/pdf';

export interface SplitToolProps {
  docState: PDFDocumentState;
  splitEveryN: number;
  onSplitEveryNChange: (n: number) => void;
  isProcessing: boolean;
  setIsProcessing: (val: boolean) => void;
  setProcessingStatus: (status: string) => void;
}

export const SplitTool: React.FC<SplitToolProps> = ({
  docState,
  splitEveryN,
  onSplitEveryNChange,
  isProcessing,
  setIsProcessing,
  setProcessingStatus,
}) => {
  const handleSplit = async () => {
    setIsProcessing(true);
    setProcessingStatus('Splitting document into ZIP archive…');
    try {
      const zip = new JSZip();
      const total = docState.pageCount;
      let partIdx = 1;

      for (let start = 1; start <= total; start += splitEveryN) {
        const end = Math.min(total, start + splitEveryN - 1);
        const pagesToExtract: number[] = [];
        for (let p = start; p <= end; p++) pagesToExtract.push(p);

        const bytes = await PDFEngineService.extractPageRanges(docState.arrayBuffer, pagesToExtract);
        zip.file(`part_${partIdx}_pages_${start}-${end}.pdf`, bytes);
        partIdx++;
      }

      const zipBlob = await zip.generateAsync({ type: 'blob' });
      const url = URL.createObjectURL(zipBlob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = `${docState.name.replace('.pdf', '')}_split_parts.zip`;
      document.body.appendChild(a);
      a.click();
      setTimeout(() => {
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }, 100);
    } finally {
      setIsProcessing(false);
      setProcessingStatus('');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
      <div>
        <h4 style={{ fontSize: '15px', fontWeight: 700, marginBottom: '4px' }}>
          Split Document
        </h4>
        <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
          Cut document into single-page PDFs or equal chunks.
        </p>
      </div>

      <div>
        <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)' }}>
          Split Every N Pages
        </label>
        <input
          type="number"
          min="1"
          max={docState.pageCount}
          value={splitEveryN}
          onChange={(e) => onSplitEveryNChange(Math.max(1, parseInt(e.target.value, 10) || 1))}
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
        onClick={handleSplit}
        disabled={isProcessing}
        className="btn btn-primary btn-sm"
        style={{ width: '100%' }}
      >
        <Scissors size={14} />
        <span>Split & Download All Parts (ZIP)</span>
      </button>
    </div>
  );
};
