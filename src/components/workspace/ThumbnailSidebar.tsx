import React, { useState } from 'react';
import { FileText, ArrowUp, ArrowDown, Copy, Trash2 } from 'lucide-react';
import type { PDFPageInfo } from '../../types/pdf';

export interface ThumbnailSidebarProps {
  pages: PDFPageInfo[];
  currentPageNum: number;
  onPageClick: (pageNum: number) => void;
  onMovePage: (index: number, direction: 'up' | 'down') => void;
  onDuplicatePage: (index: number) => void;
  onDeletePage: (index: number) => void;
  onReorderPages: (fromIndex: number, toIndex: number) => void;
}

export const ThumbnailSidebar: React.FC<ThumbnailSidebarProps> = ({
  pages,
  currentPageNum,
  onPageClick,
  onMovePage,
  onDuplicatePage,
  onDeletePage,
  onReorderPages,
}) => {
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  const activePages = pages.filter((p) => !p.deleted);

  return (
    <aside
      aria-label="Document pages rail"
      style={{
        width: '240px',
        background: 'var(--bg-card)',
        borderRight: '1px solid var(--border-subtle)',
        display: 'flex',
        flexDirection: 'column',
        overflowY: 'auto',
        padding: '16px 12px',
        gap: '12px',
        flexShrink: 0,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 4px' }}>
        <span
          style={{
            fontSize: '11px',
            fontWeight: 700,
            textTransform: 'uppercase',
            color: 'var(--text-muted)',
            letterSpacing: '0.04em',
          }}
        >
          Pages ({activePages.length})
        </span>
      </div>

      {pages.map((page: PDFPageInfo, index: number) => {
        if (page.deleted) return null;
        const isSelected = index === currentPageNum - 1;
        const isDragging = draggedIndex === index;
        const isOver = dragOverIndex === index;

        return (
          <div
            key={index}
            draggable
            onDragStart={(e) => {
              e.dataTransfer.setData('text/plain', String(index));
              e.dataTransfer.effectAllowed = 'move';
              setDraggedIndex(index);
            }}
            onDragOver={(e) => {
              e.preventDefault();
              e.dataTransfer.dropEffect = 'move';
              if (dragOverIndex !== index) {
                setDragOverIndex(index);
              }
            }}
            onDragLeave={() => {
              if (dragOverIndex === index) {
                setDragOverIndex(null);
              }
            }}
            onDrop={(e) => {
              e.preventDefault();
              const sourceIdx = draggedIndex !== null ? draggedIndex : parseInt(e.dataTransfer.getData('text/plain'), 10);
              if (!isNaN(sourceIdx) && sourceIdx !== index) {
                onReorderPages(sourceIdx, index);
              }
              setDraggedIndex(null);
              setDragOverIndex(null);
            }}
            onDragEnd={() => {
              setDraggedIndex(null);
              setDragOverIndex(null);
            }}
            onClick={() => onPageClick(index + 1)}
            className="interactive-card"
            style={{
              padding: '8px',
              cursor: 'grab',
              borderRadius: 'var(--radius-md)',
              border: isOver
                ? '2px dashed var(--accent-primary)'
                : isSelected
                ? '1.5px solid var(--accent-primary)'
                : '1px solid var(--border-subtle)',
              background: isSelected ? 'var(--bg-card)' : 'var(--bg-primary)',
              boxShadow: isSelected ? '0 0 0 1px var(--accent-primary), var(--shadow-xs)' : 'var(--shadow-xs)',
              position: 'relative',
              display: 'flex',
              flexDirection: 'column',
              gap: '6px',
              opacity: isDragging ? 0.4 : 1,
              transform: isOver ? 'scale(1.02)' : 'none',
              transition: 'transform var(--transition-fast), border-color var(--transition-fast)',
            }}
          >
            {/* Thumbnail Image */}
            <div
              style={{
                height: '140px',
                background: '#ffffff',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--border-subtle)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                overflow: 'hidden',
                position: 'relative',
              }}
            >
              {page.thumbnailUrl ? (
                <img
                  src={page.thumbnailUrl}
                  alt={`Page ${index + 1}`}
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'contain',
                    transform: `rotate(${page.rotation}deg)`,
                    transition: 'transform var(--transition-fast)',
                    pointerEvents: 'none',
                  }}
                />
              ) : (
                <FileText size={28} strokeWidth={1.5} color="var(--text-muted)" />
              )}

              {/* Page number badge */}
              <span
                style={{
                  position: 'absolute',
                  bottom: '6px',
                  left: '6px',
                  background: 'rgba(22, 22, 22, 0.85)',
                  color: '#ffffff',
                  fontSize: '10px',
                  fontFamily: 'var(--font-mono)',
                  fontWeight: 600,
                  padding: '1px 6px',
                  borderRadius: 'var(--radius-sm)',
                }}
              >
                {index + 1}
              </span>
            </div>

            {/* Page Quick Actions Bar */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                paddingTop: '4px',
              }}
            >
              <div style={{ display: 'flex', gap: '2px' }}>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onMovePage(index, 'up');
                  }}
                  disabled={index === 0}
                  className="btn btn-ghost btn-icon"
                  style={{ padding: '3px' }}
                  title="Move page up"
                  aria-label={`Move page ${index + 1} up`}
                >
                  <ArrowUp size={12} />
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onMovePage(index, 'down');
                  }}
                  disabled={index === pages.length - 1}
                  className="btn btn-ghost btn-icon"
                  style={{ padding: '3px' }}
                  title="Move page down"
                  aria-label={`Move page ${index + 1} down`}
                >
                  <ArrowDown size={12} />
                </button>
              </div>

              <div style={{ display: 'flex', gap: '2px' }}>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDuplicatePage(index);
                  }}
                  className="btn btn-ghost btn-icon"
                  style={{ padding: '3px' }}
                  title="Duplicate page"
                  aria-label={`Duplicate page ${index + 1}`}
                >
                  <Copy size={12} />
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeletePage(index);
                  }}
                  className="btn btn-ghost btn-icon"
                  style={{ padding: '3px', color: 'var(--error)' }}
                  title="Delete page"
                  aria-label={`Delete page ${index + 1}`}
                >
                  <Trash2 size={12} />
                </button>
              </div>
            </div>
          </div>
        );
      })}
    </aside>
  );
};
