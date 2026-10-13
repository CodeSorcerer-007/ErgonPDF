import React, { useState } from 'react';
import { FileCode, Download } from 'lucide-react';
import { PDFEngineService } from '../../services/pdfEngine';
import type { PDFDocumentState } from '../../types/pdf';

export interface PdfToWordToolProps {
  docState: PDFDocumentState;
  isProcessing: boolean;
  setIsProcessing: (val: boolean) => void;
  setProcessingStatus: (status: string) => void;
}

export const PdfToWordTool: React.FC<PdfToWordToolProps> = ({
  docState,
  isProcessing,
  setIsProcessing,
  setProcessingStatus,
}) => {
  const [docTitle, setDocTitle] = useState<string>(docState.name.replace(/\.[^/.]+$/, ''));

  const handleConvertToWord = async () => {
    setIsProcessing(true);
    setProcessingStatus('Converting PDF to Microsoft Word document…');
    try {
      const wordBlob = await PDFEngineService.convertToWordDoc(
        docState.arrayBuffer,
        docTitle.trim() || docState.name
      );
      const url = URL.createObjectURL(wordBlob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = `${(docTitle.trim() || docState.name).replace('.pdf', '')}.doc`;
      document.body.appendChild(a);
      a.click();
      setTimeout(() => {
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }, 100);
    } catch (err) {
      console.error('Failed to convert to Word:', err);
      alert('Could not convert document to Word format.');
    } finally {
      setIsProcessing(false);
      setProcessingStatus('');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <FileCode size={16} color="var(--accent-primary)" />
        <h4 style={{ fontSize: '15px', fontWeight: 700 }}>PDF to Word Document</h4>
      </div>
      <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
        Converts document headings, paragraphs, and page breaks into an editable Microsoft Word document.
      </p>

      <div>
        <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)' }}>
          Document Title
        </label>
        <input
          type="text"
          value={docTitle}
          onChange={(e) => setDocTitle(e.target.value)}
          placeholder="Enter document title…"
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
        onClick={handleConvertToWord}
        disabled={isProcessing}
        className="btn btn-primary btn-sm"
        style={{ width: '100%' }}
      >
        <Download size={14} />
        <span>Download Word (.doc)</span>
      </button>
    </div>
  );
};
