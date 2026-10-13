import React from 'react';
import { Table, Download } from 'lucide-react';
import { PDFEngineService } from '../../services/pdfEngine';
import type { PDFDocumentState } from '../../types/pdf';

export interface PdfToExcelToolProps {
  docState: PDFDocumentState;
  extractedCsvText: string;
  onExtractedCsvTextChange: (csv: string) => void;
  isProcessing: boolean;
  setIsProcessing: (val: boolean) => void;
  setProcessingStatus: (status: string) => void;
}

export const PdfToExcelTool: React.FC<PdfToExcelToolProps> = ({
  docState,
  extractedCsvText,
  onExtractedCsvTextChange,
  isProcessing,
  setIsProcessing,
  setProcessingStatus,
}) => {
  const handleExtractTables = async () => {
    setIsProcessing(true);
    setProcessingStatus('Parsing tabular matrix…');
    try {
      const csv = await PDFEngineService.extractTablesToCSV(docState.arrayBuffer);
      onExtractedCsvTextChange(csv);
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = `${docState.name.replace(/\.[^/.]+$/, '')}_data.csv`;
      document.body.appendChild(a);
      a.click();
      setTimeout(() => {
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }, 100);
    } catch (err) {
      console.error('Failed to extract tables:', err);
      alert('Could not extract tabular data from this document.');
    } finally {
      setIsProcessing(false);
      setProcessingStatus('');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <Table size={16} color="var(--accent-primary)" />
        <h4 style={{ fontSize: '15px', fontWeight: 700 }}>Extract Table to CSV</h4>
      </div>
      <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
        Extract numeric tabular data, invoices, and columns into spreadsheet CSV format.
      </p>
      <button
        type="button"
        onClick={handleExtractTables}
        disabled={isProcessing}
        className="btn btn-primary btn-sm"
        style={{ width: '100%' }}
      >
        <Download size={14} />
        <span>Download Table CSV</span>
      </button>
      {extractedCsvText && (
        <textarea
          readOnly
          value={extractedCsvText}
          rows={6}
          style={{
            width: '100%',
            padding: '8px',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border-medium)',
            background: 'var(--bg-tertiary)',
            color: 'var(--text-primary)',
            fontSize: '11px',
            fontFamily: 'var(--font-mono)',
          }}
        />
      )}
    </div>
  );
};
