import React from 'react';
import { Columns2 } from 'lucide-react';
import type { PDFPageInfo } from '../../types/pdf';

export interface HalveToolProps {
  pages: PDFPageInfo[];
  isProcessing: boolean;
  onProcess: () => void;
}

export const HalveTool: React.FC<HalveToolProps> = ({ pages, isProcessing, onProcess }) => {
  const activePages = pages.filter((p) => !p.deleted);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <Columns2 size={16} color="var(--accent-primary)" />
        <h4 style={{ fontSize: '15px', fontWeight: 700 }}>Halve 2-in-1 Spreads</h4>
      </div>
      <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
        Cuts every landscape double-page spread vertically down the center into separate individual single pages.
      </p>
      <div className="glass-card" style={{ padding: '12px', fontSize: '12px', color: 'var(--text-muted)' }}>
        Resulting page count will be: <strong style={{ color: 'var(--text-primary)' }}>{activePages.length * 2} pages</strong>.
      </div>
      <button
        type="button"
        onClick={onProcess}
        disabled={isProcessing}
        className="btn btn-primary btn-sm"
        style={{ width: '100%' }}
      >
        <Columns2 size={14} />
        <span>Split Spreads in Half</span>
      </button>
    </div>
  );
};
