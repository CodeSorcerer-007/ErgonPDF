import React, { useState } from 'react';
import { ScanText, Loader2, Copy, Check } from 'lucide-react';

export interface OcrToolProps {
  currentPageNum: number;
  isOcrLoading: boolean;
  ocrProgress: string;
  ocrText: string;
  onRunOCR: () => void;
}

export const OcrTool: React.FC<OcrToolProps> = ({
  currentPageNum,
  isOcrLoading,
  ocrProgress,
  ocrText,
  onRunOCR,
}) => {
  const [copied, setCopied] = useState<boolean>(false);

  const handleCopy = () => {
    if (!ocrText) return;
    navigator.clipboard.writeText(ocrText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
      <h4 style={{ fontSize: '15px', fontWeight: 700, marginBottom: '2px' }}>
        Local OCR Recognition
      </h4>
      <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
        Extract searchable text from scanned pages directly inside your browser.
      </p>

      <button
        type="button"
        onClick={onRunOCR}
        disabled={isOcrLoading}
        className="btn btn-secondary btn-sm"
        style={{ width: '100%' }}
      >
        {isOcrLoading ? (
          <>
            <Loader2 size={14} className="animate-spin" />
            <span>{ocrProgress}</span>
          </>
        ) : (
          <>
            <ScanText size={14} />
            <span>Scan Current Page ({currentPageNum})</span>
          </>
        )}
      </button>

      {ocrText && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)' }}>
              Recognized Text:
            </span>
            <button
              type="button"
              onClick={handleCopy}
              className={`btn btn-sm ${copied ? 'btn-primary' : 'btn-secondary'}`}
              style={{ fontSize: '11px', padding: '2px 8px' }}
            >
              {copied ? <Check size={12} /> : <Copy size={12} />}
              <span>{copied ? 'Copied!' : 'Copy OCR Text'}</span>
            </button>
          </div>
          <textarea
            readOnly
            value={ocrText}
            rows={8}
            style={{
              width: '100%',
              padding: '8px',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-medium)',
              background: 'var(--bg-tertiary)',
              color: 'var(--text-primary)',
              fontSize: '12px',
              fontFamily: 'var(--font-mono)',
            }}
          />
        </div>
      )}
    </div>
  );
};
