import React from 'react';
import { Shuffle } from 'lucide-react';

export interface AlternateMixToolProps {
  alternateMixFile: File | null;
  onAlternateMixFileChange: (file: File | null) => void;
  alternateMixReverse: boolean;
  onAlternateMixReverseChange: (reverse: boolean) => void;
  isProcessing: boolean;
  onProcess: () => void;
}

export const AlternateMixTool: React.FC<AlternateMixToolProps> = ({
  alternateMixFile,
  onAlternateMixFileChange,
  alternateMixReverse,
  onAlternateMixReverseChange,
  isProcessing,
  onProcess,
}) => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <Shuffle size={16} color="var(--accent-primary)" />
        <h4 style={{ fontSize: '15px', fontWeight: 700 }}>Alternate & Mix 2 PDFs</h4>
      </div>
      <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
        Interleave pages from current document (fronts) with a 2nd document (backs).
      </p>

      <div
        className="glass-card"
        style={{
          padding: '14px',
          textAlign: 'center',
          cursor: 'pointer',
          border: alternateMixFile ? '2px solid var(--accent-primary)' : '1px dashed var(--border-medium)',
        }}
        onClick={() => {
          const input = document.createElement('input');
          input.type = 'file';
          input.accept = '.pdf';
          input.onchange = (e) => {
            const f = (e.target as HTMLInputElement).files?.[0];
            if (f) onAlternateMixFileChange(f);
          };
          input.click();
        }}
      >
        <Shuffle size={20} style={{ margin: '0 auto 6px', color: 'var(--accent-primary)' }} />
        <span style={{ fontSize: '12px', fontWeight: 600, display: 'block' }}>
          {alternateMixFile ? alternateMixFile.name : 'Select Document 2 (Back Pages)'}
        </span>
      </div>

      <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', cursor: 'pointer' }}>
        <input
          type="checkbox"
          checked={alternateMixReverse}
          onChange={(e) => onAlternateMixReverseChange(e.target.checked)}
        />
        <span>Reverse Document 2 page order (Duplex scanner)</span>
      </label>

      <button
        type="button"
        onClick={onProcess}
        disabled={!alternateMixFile || isProcessing}
        className="btn btn-primary btn-sm"
        style={{ width: '100%' }}
      >
        <Shuffle size={14} />
        <span>Mix Documents & Export</span>
      </button>
    </div>
  );
};
