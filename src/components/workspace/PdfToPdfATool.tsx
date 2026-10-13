import React from 'react';
import { Archive } from 'lucide-react';

export interface PdfToPdfAToolProps {
  isProcessing: boolean;
  onProcess: () => void;
}

export const PdfToPdfATool: React.FC<PdfToPdfAToolProps> = ({ isProcessing, onProcess }) => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <Archive size={16} color="var(--accent-primary)" />
        <h4 style={{ fontSize: '15px', fontWeight: 700 }}>PDF to PDF/A Archival</h4>
      </div>
      <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
        Transforms document to ISO 19005-1 compliant PDF/A-1b standard for guaranteed long-term digital preservation.
      </p>

      <button
        type="button"
        onClick={onProcess}
        disabled={isProcessing}
        className="btn btn-primary btn-sm"
        style={{ width: '100%' }}
      >
        <Archive size={14} />
        <span>Convert & Download PDF/A</span>
      </button>
    </div>
  );
};
