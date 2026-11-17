import React from 'react';
import { Unlock, Check, AlertTriangle, Key } from 'lucide-react';

export interface UnlockToolProps {
  isProcessing: boolean;
  onProcess: () => void;
  password?: string;
  onPasswordChange?: (pw: string) => void;
}

export const UnlockTool: React.FC<UnlockToolProps> = ({
  isProcessing,
  onProcess,
  password = '',
  onPasswordChange,
}) => {
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

      {onPasswordChange && (
        <div>
          <label style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Key size={12} />
            <span>Document Password (if locked)</span>
          </label>
          <input
            type="password"
            placeholder="Leave empty if only restricted by permissions"
            value={password}
            onChange={(e) => onPasswordChange(e.target.value)}
            style={{
              width: '100%',
              padding: '6px 10px',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-medium)',
              background: 'var(--bg-tertiary)',
              color: 'var(--text-primary)',
              fontSize: '12px',
              marginTop: '4px',
            }}
          />
        </div>
      )}

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
        Client-side decryption operates purely inside your browser without transmitting files to any server. If a document is protected by permission restrictions, ErgonPDF overrides them directly. If protected by a user password, enter it above to permanently decrypt and produce a clean, unrestricted PDF.
      </div>

      <button
        type="button"
        onClick={onProcess}
        disabled={isProcessing}
        className="btn btn-primary btn-sm"
        style={{ width: '100%' }}
      >
        <Check size={14} />
        <span>Unlock & Save Unrestricted PDF</span>
      </button>
    </div>
  );
};
