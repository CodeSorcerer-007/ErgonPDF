import React, { useState } from 'react';
import { KeyRound, Copy, Check, RefreshCw, X, ShieldCheck } from 'lucide-react';

interface PasswordGenModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PasswordGenModal: React.FC<PasswordGenModalProps> = ({ isOpen, onClose }) => {
  const [length, setLength] = useState<number>(20);
  const [useUpper, setUseUpper] = useState<boolean>(true);
  const [useLower, setUseLower] = useState<boolean>(true);
  const [useNumbers, setUseNumbers] = useState<boolean>(true);
  const [useSymbols, setUseSymbols] = useState<boolean>(true);
  const [password, setPassword] = useState<string>(() => generate(20, true, true, true, true));
  const [copied, setCopied] = useState<boolean>(false);

  if (!isOpen) return null;

  function generate(len: number, u: boolean, l: boolean, n: boolean, s: boolean): string {
    let chars = '';
    if (u) chars += 'ABCDEFGHJKLMNPQRSTUVWXYZ';
    if (l) chars += 'abcdefghijkmnpqrstuvwxyz';
    if (n) chars += '23456789';
    if (s) chars += '!@#$%^&*()-_=+[]{}|;:,.<>?';
    if (!chars) chars = 'abcdefghijkmnpqrstuvwxyz';

    const array = new Uint32Array(len);
    window.crypto.getRandomValues(array);
    let result = '';
    for (let i = 0; i < len; i++) {
      result += chars[array[i] % chars.length];
    }
    return result;
  }

  const handleRegenerate = () => {
    setPassword(generate(length, useUpper, useLower, useNumbers, useSymbols));
    setCopied(false);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(password);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const entropy = Math.round(length * Math.log2(
    (useUpper ? 24 : 0) + (useLower ? 24 : 0) + (useNumbers ? 8 : 0) + (useSymbols ? 26 : 0) || 10
  ));

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-content glass-panel animate-scale-up"
        onClick={(e) => e.stopPropagation()}
        style={{ width: '480px', maxWidth: '95vw', padding: '24px' }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '18px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: 'var(--radius-md)',
                background: 'rgba(16, 185, 129, 0.15)',
                color: '#10b981',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <KeyRound size={20} />
            </div>
            <div>
              <h3 style={{ fontSize: '17px', fontWeight: 700 }}>Password Generator</h3>
              <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                Generate cryptographic passphrases to secure your documents
              </p>
            </div>
          </div>

          <button onClick={onClose} className="btn btn-ghost btn-icon">
            <X size={18} />
          </button>
        </div>

        {/* Generated Password Display */}
        <div
          className="glass-card"
          style={{
            padding: '14px 16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '12px',
            marginBottom: '16px',
            background: 'var(--bg-tertiary)',
            border: '1px solid var(--border-medium)',
          }}
        >
          <span
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '16px',
              fontWeight: 700,
              wordBreak: 'break-all',
              letterSpacing: '1px',
              color: 'var(--accent-primary)',
            }}
          >
            {password}
          </span>

          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0 }}>
            <button
              onClick={handleRegenerate}
              className="btn btn-ghost btn-icon"
              title="Generate New Password"
            >
              <RefreshCw size={15} />
            </button>
            <button
              onClick={handleCopy}
              className={`btn btn-sm ${copied ? 'btn-primary' : 'btn-secondary'}`}
              style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              {copied ? <Check size={14} /> : <Copy size={14} />}
              <span>{copied ? 'Copied' : 'Copy'}</span>
            </button>
          </div>
        </div>

        {/* Strength Meter */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
          <ShieldCheck size={15} color="#10b981" />
          <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
            Cryptographic Entropy: <strong style={{ color: '#10b981' }}>{entropy} bits</strong> ({entropy > 90 ? 'Extremely Strong' : entropy > 60 ? 'Strong' : 'Moderate'})
          </span>
        </div>

        {/* Controls */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '20px' }}>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', fontWeight: 600 }}>
              <span>Length</span>
              <span style={{ color: 'var(--accent-primary)' }}>{length} characters</span>
            </div>
            <input
              type="range"
              min="8"
              max="48"
              value={length}
              onChange={(e) => {
                const val = parseInt(e.target.value);
                setLength(val);
                setPassword(generate(val, useUpper, useLower, useNumbers, useSymbols));
              }}
              style={{ width: '100%', marginTop: '6px' }}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={useUpper}
                onChange={(e) => {
                  setUseUpper(e.target.checked);
                  setPassword(generate(length, e.target.checked, useLower, useNumbers, useSymbols));
                }}
              />
              <span>Uppercase (A-Z)</span>
            </label>

            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={useLower}
                onChange={(e) => {
                  setUseLower(e.target.checked);
                  setPassword(generate(length, useUpper, e.target.checked, useNumbers, useSymbols));
                }}
              />
              <span>Lowercase (a-z)</span>
            </label>

            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={useNumbers}
                onChange={(e) => {
                  setUseNumbers(e.target.checked);
                  setPassword(generate(length, useUpper, useLower, e.target.checked, useSymbols));
                }}
              />
              <span>Numbers (0-9)</span>
            </label>

            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={useSymbols}
                onChange={(e) => {
                  setUseSymbols(e.target.checked);
                  setPassword(generate(length, useUpper, useLower, useNumbers, e.target.checked));
                }}
              />
              <span>Symbols (!@#$)</span>
            </label>
          </div>
        </div>

        <button onClick={onClose} className="btn btn-secondary btn-sm" style={{ width: '100%' }}>
          Done
        </button>
      </div>
    </div>
  );
};
