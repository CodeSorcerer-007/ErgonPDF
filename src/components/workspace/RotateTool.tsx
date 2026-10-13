import React from 'react';
import { RotateCw, RotateCcw, RefreshCw } from 'lucide-react';
import type { PDFPageInfo } from '../../types/pdf';

export interface RotateToolProps {
  pages: PDFPageInfo[];
  onUpdatePages: (newPages: PDFPageInfo[]) => void;
}

export const RotateTool: React.FC<RotateToolProps> = ({ pages, onUpdatePages }) => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
      <div>
        <h4 style={{ fontSize: '15px', fontWeight: 700, marginBottom: '4px' }}>
          Rotate Document Pages
        </h4>
        <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
          Bulk rotate all pages or adjust the active page's angle.
        </p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <button
          type="button"
          onClick={() => {
            const newPages = pages.map((p) => ({ ...p, rotation: (p.rotation + 90) % 360 }));
            onUpdatePages(newPages);
          }}
          className="btn btn-secondary btn-sm"
          style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
        >
          <RotateCw size={14} />
          <span>Rotate All Pages 90° Clockwise</span>
        </button>

        <button
          type="button"
          onClick={() => {
            const newPages = pages.map((p) => ({ ...p, rotation: (p.rotation + 270) % 360 }));
            onUpdatePages(newPages);
          }}
          className="btn btn-secondary btn-sm"
          style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
        >
          <RotateCcw size={14} />
          <span>Rotate All Pages 90° Counter-CW</span>
        </button>

        <button
          type="button"
          onClick={() => {
            const newPages = pages.map((p) => ({ ...p, rotation: (p.rotation + 180) % 360 }));
            onUpdatePages(newPages);
          }}
          className="btn btn-secondary btn-sm"
          style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
        >
          <RefreshCw size={14} />
          <span>Flip All Pages Upside Down (180°)</span>
        </button>

        <button
          type="button"
          onClick={() => {
            const newPages = pages.map((p) => ({ ...p, rotation: 0 }));
            onUpdatePages(newPages);
          }}
          className="btn btn-ghost btn-sm"
          style={{ width: '100%' }}
        >
          <span>Reset All Rotations to 0°</span>
        </button>
      </div>
    </div>
  );
};
