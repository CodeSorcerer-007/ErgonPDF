import React from 'react';
import { KeyRound, RefreshCw, Copy, Check } from 'lucide-react';

export interface PasswordGeneratorToolProps {
  genPassVal: string;
  onGenPassValChange: (val: string) => void;
  genPassLen: number;
  onGenPassLenChange: (len: number) => void;
  genPassCopied: boolean;
  onGenPassCopiedChange: (copied: boolean) => void;
}

export const PasswordGeneratorTool: React.FC<PasswordGeneratorToolProps> = ({
  genPassVal,
  onGenPassValChange,
  genPassLen,
  onGenPassLenChange,
  genPassCopied,
  onGenPassCopiedChange,
}) => {
  const handleGenerate = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789!@#$%^&*()_+-=';
    const arr = new Uint32Array(genPassLen);
    window.crypto.getRandomValues(arr);
    let res = '';
    for (let i = 0; i < genPassLen; i++) res += chars[arr[i] % chars.length];
    onGenPassValChange(res);
    onGenPassCopiedChange(false);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(genPassVal);
    onGenPassCopiedChange(true);
    setTimeout(() => onGenPassCopiedChange(false), 2000);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <KeyRound size={16} color="#10b981" />
        <h4 style={{ fontSize: '15px', fontWeight: 700 }}>Password Generator</h4>
      </div>
      <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
        Generate cryptographically secure passwords for locking PDF documents.
      </p>

      <div
        className="glass-card"
        style={{ padding: '12px', background: 'var(--bg-tertiary)', border: '1px solid var(--border-medium)' }}
      >
        <span
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '14px',
            fontWeight: 700,
            color: 'var(--accent-primary)',
            wordBreak: 'break-all',
          }}
        >
          {genPassVal}
        </span>
      </div>

      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: 'var(--text-muted)' }}>
          <span>Length</span>
          <span>{genPassLen} characters</span>
        </div>
        <input
          type="range"
          min="8"
          max="48"
          value={genPassLen}
          onChange={(e) => onGenPassLenChange(parseInt(e.target.value, 10))}
          style={{ width: '100%', marginTop: '4px' }}
        />
      </div>

      <div style={{ display: 'flex', gap: '8px' }}>
        <button
          type="button"
          onClick={handleGenerate}
          className="btn btn-secondary btn-sm"
          style={{ flex: 1 }}
        >
          <RefreshCw size={13} />
          <span>Generate</span>
        </button>

        <button
          type="button"
          onClick={handleCopy}
          className={`btn btn-sm ${genPassCopied ? 'btn-primary' : 'btn-secondary'}`}
          style={{ flex: 1 }}
        >
          {genPassCopied ? <Check size={13} /> : <Copy size={13} />}
          <span>{genPassCopied ? 'Copied' : 'Copy'}</span>
        </button>
      </div>
    </div>
  );
};
