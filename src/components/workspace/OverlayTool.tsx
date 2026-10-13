import React from 'react';
import { CopyPlus, Download } from 'lucide-react';

export interface OverlayToolProps {
  overlayFile: File | null;
  onOverlayFileChange: (file: File | null) => void;
  overlayIsUnderlay: boolean;
  onOverlayIsUnderlayChange: (underlay: boolean) => void;
  isProcessing: boolean;
  onProcess: () => void;
}

export const OverlayTool: React.FC<OverlayToolProps> = ({
  overlayFile,
  onOverlayFileChange,
  overlayIsUnderlay,
  onOverlayIsUnderlayChange,
  isProcessing,
  onProcess,
}) => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <CopyPlus size={16} color="var(--accent-primary)" />
        <h4 style={{ fontSize: '15px', fontWeight: 700 }}>Overlay / Letterhead</h4>
      </div>
      <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
        Merge letterhead backgrounds or stationery templates across all pages.
      </p>

      <div
        className="glass-card"
        style={{
          padding: '14px',
          textAlign: 'center',
          cursor: 'pointer',
          border: overlayFile ? '2px solid var(--accent-primary)' : '1px dashed var(--border-medium)',
        }}
        onClick={() => {
          const input = document.createElement('input');
          input.type = 'file';
          input.accept = '.pdf';
          input.onchange = (e) => {
            const f = (e.target as HTMLInputElement).files?.[0];
            if (f) onOverlayFileChange(f);
          };
          input.click();
        }}
      >
        <CopyPlus size={20} style={{ margin: '0 auto 6px', color: 'var(--accent-primary)' }} />
        <span style={{ fontSize: '12px', fontWeight: 600, display: 'block' }}>
          {overlayFile ? overlayFile.name : 'Select Template / Letterhead PDF'}
        </span>
      </div>

      <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', cursor: 'pointer' }}>
        <input
          type="checkbox"
          checked={overlayIsUnderlay}
          onChange={(e) => onOverlayIsUnderlayChange(e.target.checked)}
        />
        <span>Place as Underlay (Behind existing text)</span>
      </label>

      <button
        type="button"
        onClick={onProcess}
        disabled={!overlayFile || isProcessing}
        className="btn btn-primary btn-sm"
        style={{ width: '100%' }}
      >
        <Download size={14} />
        <span>Apply Overlay & Export</span>
      </button>
    </div>
  );
};
