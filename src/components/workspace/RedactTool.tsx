import React from 'react';
import { EyeOff } from 'lucide-react';
import type { RedactionBox } from '../../types/pdf';

export interface RedactToolProps {
  redactions: RedactionBox[];
  onAddRedactionBox: () => void;
}

export const RedactTool: React.FC<RedactToolProps> = ({ redactions, onAddRedactionBox }) => {
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

      <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
        Active Redaction Boxes: {redactions.length}
      </span>
    </div>
  );
};
