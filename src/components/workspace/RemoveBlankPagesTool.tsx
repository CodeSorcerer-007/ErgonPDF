import React from 'react';
import { Sparkles } from 'lucide-react';

export interface RemoveBlankPagesToolProps {
  isProcessing: boolean;
  onProcess: () => void;
}

export const RemoveBlankPagesTool: React.FC<RemoveBlankPagesToolProps> = ({ isProcessing, onProcess }) => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <Sparkles size={16} color="var(--accent-primary)" />
        <h4 style={{ fontSize: '15px', fontWeight: 700 }}>Remove Blank Pages</h4>
      </div>
      <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
        Scans luminance and text content of all pages and purges empty scanner feeder pages.
      </p>

      <button
        type="button"
        onClick={onProcess}
        disabled={isProcessing}
        className="btn btn-primary btn-sm"
        style={{ width: '100%' }}
      >
        <Sparkles size={14} />
        <span>Scan & Prune Blank Pages</span>
      </button>
    </div>
  );
};
