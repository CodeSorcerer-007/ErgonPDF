import React from 'react';
import { Download } from 'lucide-react';
import type { PDFPageInfo } from '../../types/pdf';

export interface RemovePagesToolProps {
  pages: PDFPageInfo[];
  onUpdatePages: (newPages: PDFPageInfo[]) => void;
  isProcessing?: boolean;
  onProcess?: () => void;
}

export const RemovePagesTool: React.FC<RemovePagesToolProps> = ({
  pages,
  onUpdatePages,
  isProcessing = false,
  onProcess,
}) => {
  const deletedCount = pages.filter((p) => p.deleted).length;

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

      <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
        Marked for deletion: {deletedCount} of {pages.length} pages
      </span>

      {onProcess && (
        <button
          type="button"
          onClick={onProcess}
          disabled={isProcessing}
          className="btn btn-primary"
          style={{ width: '100%', marginTop: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
        >
          <Download size={14} />
          <span>Apply Deletions & Export PDF</span>
        </button>
      )}
    </div>
  );
};
