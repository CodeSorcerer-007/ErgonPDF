import React from 'react';
import { EyeOff, Download } from 'lucide-react';
import type { RedactionBox } from '../../types/pdf';

export interface RedactToolProps {
  redactions: RedactionBox[];
  onAddRedactionBox: () => void;
  isProcessing?: boolean;
  onProcess?: () => void;
}

export const RedactTool: React.FC<RedactToolProps> = ({
  redactions,
  onAddRedactionBox,
  isProcessing = false,
  onProcess,
}) => {
  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
        <EyeOff size={16} color="var(--error)" />
        <h4 style={{ fontSize: '15px', fontWeight: 700 }}>
          Redact & Blackout
        </h4>
      </div>
      <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '14px' }}>
        Permanently black out confidential numbers, addresses, and sensitive clauses.
      </p>

      <button
        type="button"
        onClick={onAddRedactionBox}
        className="btn btn-secondary btn-sm"
        style={{ width: '100%', marginBottom: '12px' }}
      >
        <span>+ Place Blackout Box</span>
      </button>

      <span style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'block', marginBottom: '8px' }}>
        Active Redaction Boxes: {redactions.length}
      </span>

      {onProcess && (
        <button
          type="button"
          onClick={onProcess}
          disabled={isProcessing || redactions.length === 0}
          className="btn btn-primary"
          style={{ width: '100%', marginTop: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
        >
          <Download size={14} />
          <span>Apply Permanent Redactions & Export PDF</span>
        </button>
      )}

      {redactions.length === 0 && (
        <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '8px', textAlign: 'center' }}>
          Place at least 1 blackout box over sensitive text before applying.
        </p>
      )}
    </div>
  );
};
