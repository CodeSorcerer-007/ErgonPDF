import React from 'react';
import { Unlock, Check, AlertTriangle } from 'lucide-react';

export interface UnlockToolProps {
  isProcessing: boolean;
  onProcess: () => void;
}

export const UnlockTool: React.FC<UnlockToolProps> = ({ isProcessing, onProcess }) => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <Unlock size={16} color="var(--accent-primary)" />
        <h4 style={{ fontSize: '15px', fontWeight: 700 }}>
          Unlock & Decrypt PDF
        </h4>
      </div>

      <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
        Strip permission restrictions (printing, copying, form filling) and owner security wrappers from documents you own.
      </p>

      <div
        className="glass-card"
        style={{
          padding: '12px',
          fontSize: '12px',
          color: 'var(--text-secondary)',
          lineHeight: '1.5',
          borderLeft: '3px solid var(--accent-primary)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 600, marginBottom: '4px', color: 'var(--text-primary)' }}>
          <AlertTriangle size={14} color="var(--accent-primary)" />
          <span>Client-Side Decryption Model</span>
        </div>
        Client-side decryption operates purely inside your browser without transmitting files to any server. If a document is locked with an unknown user password, it cannot be decrypted without the key. However, for documents protected by permission restrictions or known passwords, ErgonPDF parses the streams with permission overrides and re-synthesizes a clean, unencrypted PDF.
      </div>

      <button
        type="button"
        onClick={onProcess}
        disabled={isProcessing}
        className="btn btn-primary btn-sm"
        style={{ width: '100%' }}
      >
        <Check size={14} />
        <span>Try Unlock & Save Unrestricted PDF</span>
      </button>
    </div>
  );
};
