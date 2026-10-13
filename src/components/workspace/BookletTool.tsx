import React from 'react';
import { BookOpen } from 'lucide-react';
import type { PDFPageInfo } from '../../types/pdf';

export interface BookletToolProps {
  pages: PDFPageInfo[];
  isProcessing: boolean;
  onProcess: () => void;
}

export const BookletTool: React.FC<BookletToolProps> = ({ pages, isProcessing, onProcess }) => {
  const activePages = pages.filter((p) => !p.deleted);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <BookOpen size={16} color="var(--accent-primary)" />
        <h4 style={{ fontSize: '15px', fontWeight: 700 }}>Booklet Imposition</h4>
      </div>
      <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
        Rearranges pages so that when printed double-sided and folded down the center, pages read in perfect consecutive order.
      </p>
      <div className="glass-card" style={{ padding: '12px', fontSize: '12px', color: 'var(--text-muted)' }}>
        Total sheets required: <strong style={{ color: 'var(--text-primary)' }}>{Math.ceil(activePages.length / 4)} landscape sheets</strong>.
      </div>
      <button
        type="button"
        onClick={onProcess}
        disabled={isProcessing}
        className="btn btn-primary btn-sm"
        style={{ width: '100%' }}
      >
        <BookOpen size={14} />
        <span>Generate Booklet Imposition</span>
      </button>
    </div>
  );
};
