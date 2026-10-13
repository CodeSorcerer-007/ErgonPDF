import React from 'react';
import { Lock } from 'lucide-react';

export interface ProtectToolProps {
  protectPassword: string;
  onPasswordChange: (password: string) => void;
  isProcessing: boolean;
  onProcess: () => void;
}

export const ProtectTool: React.FC<ProtectToolProps> = ({
  protectPassword,
  onPasswordChange,
  isProcessing,
  onProcess,
}) => {
  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
        <Lock size={16} color="var(--accent-primary)" />
        <h4 style={{ fontSize: '15px', fontWeight: 700 }}>
          Password Protect
        </h4>
      </div>
      <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '14px' }}>
        Lock your document with AES encryption before exporting.
      </p>

      <div>
        <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)' }}>
          Set Access Password
        </label>
        <input
          type="password"
          placeholder="Enter document password…"
          value={protectPassword}
          onChange={(e) => onPasswordChange(e.target.value)}
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
        onClick={onProcess}
        disabled={!protectPassword || isProcessing}
        className="btn btn-primary btn-sm"
        style={{ width: '100%', marginTop: '14px' }}
      >
        <Lock size={14} />
        <span>Lock & Download Document</span>
      </button>
    </div>
  );
};
