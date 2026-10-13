import React from 'react';
import type { PDFPageInfo } from '../../types/pdf';

export interface RemovePagesToolProps {
  pages: PDFPageInfo[];
  onUpdatePages: (newPages: PDFPageInfo[]) => void;
}

export const RemovePagesTool: React.FC<RemovePagesToolProps> = ({ pages, onUpdatePages }) => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
      <div>
        <h4 style={{ fontSize: '15px', fontWeight: 700, marginBottom: '4px' }}>
          Bulk Remove Pages
        </h4>
        <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
          Quickly eliminate multiple pages by pattern or selection.
        </p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <button
          type="button"
          onClick={() => {
            const newPages = pages.map((p, idx) => (idx % 2 === 1 ? { ...p, deleted: true } : p));
            onUpdatePages(newPages);
          }}
          className="btn btn-secondary btn-sm"
          style={{ width: '100%' }}
        >
          <span>Delete All Even Pages (2, 4, 6…)</span>
        </button>

        <button
          type="button"
          onClick={() => {
            const newPages = pages.map((p, idx) => (idx % 2 === 0 ? { ...p, deleted: true } : p));
            onUpdatePages(newPages);
          }}
          className="btn btn-secondary btn-sm"
          style={{ width: '100%' }}
        >
          <span>Delete All Odd Pages (1, 3, 5…)</span>
        </button>

        <button
          type="button"
          onClick={() => {
            const newPages = pages.map((p) => ({ ...p, deleted: !p.deleted }));
            onUpdatePages(newPages);
          }}
          className="btn btn-secondary btn-sm"
          style={{ width: '100%' }}
        >
          <span>Invert Page Deletions</span>
        </button>

        <button
          type="button"
          onClick={() => {
            const newPages = pages.map((p) => ({ ...p, deleted: false }));
            onUpdatePages(newPages);
          }}
          className="btn btn-ghost btn-sm"
          style={{ width: '100%' }}
        >
          <span>Restore All Deleted Pages</span>
        </button>
      </div>
    </div>
  );
};
