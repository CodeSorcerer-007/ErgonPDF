import React, { useState } from 'react';
import { 
  FileText, 
  ArrowUp, 
  ArrowDown, 
  Copy, 
  Trash2, 
  RotateCw, 
  CheckSquare, 
  Square, 
  ChevronLeft, 
  ChevronRight,
  Layers
} from 'lucide-react';
import type { PDFPageInfo } from '../../types/pdf';

export interface ThumbnailSidebarProps {
  pages: PDFPageInfo[];
  currentPageNum: number;
  onPageClick: (pageNum: number, e?: React.MouseEvent) => void;
  onMovePage: (index: number, direction: 'up' | 'down') => void;
  onDuplicatePage: (index: number) => void;
  onDeletePage: (index: number) => void;
  onReorderPages: (fromIndex: number, toIndex: number) => void;
  onRotatePage?: (index: number) => void;
  selectedPageIndices?: Set<number>;
  onToggleSelectPage?: (
    index: number,
    options?: boolean | { shiftKey?: boolean; ctrlKey?: boolean; metaKey?: boolean }
  ) => void;
  onSelectAllPages?: () => void;
  onRotateSelectedPages?: (delta: number) => void;
  onDeleteSelectedPages?: () => void;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}

export const ThumbnailSidebar: React.FC<ThumbnailSidebarProps> = ({
  pages,
  currentPageNum,
  onPageClick,
  onMovePage,
  onDuplicatePage,
  onDeletePage,
  onReorderPages,
  onRotatePage,
  selectedPageIndices = new Set([currentPageNum - 1]),
  onToggleSelectPage,
  onSelectAllPages,
  onRotateSelectedPages,
  onDeleteSelectedPages,
  isCollapsed = false,
  onToggleCollapse,
}) => {
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const isDraggingRef = React.useRef<boolean>(false);

  const activePages = pages.filter((p) => !p.deleted);
  const selectedCount = selectedPageIndices.size;

  if (isCollapsed) {
    return (
      <aside
        aria-label="Pages rail collapsed"
        style={{
          width: '40px',
          background: 'var(--bg-card)',
          borderRight: '1px solid var(--border-subtle)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          padding: '12px 4px',
          gap: '12px',
          flexShrink: 0,
        }}
      >
        <button
          type="button"
          onClick={onToggleCollapse}
          className="btn btn-ghost btn-icon"
          title="Expand page thumbnails"
          aria-label="Expand page thumbnails"
          style={{ padding: '6px' }}
        >
          <ChevronRight size={16} />
        </button>
        <div style={{
          writingMode: 'vertical-rl',
          transform: 'rotate(180deg)',
          fontSize: '11px',
          fontWeight: 700,
          textTransform: 'uppercase',
          color: 'var(--text-muted)',
          letterSpacing: '0.08em',
          marginTop: '8px',
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
        }}>
          <Layers size={13} style={{ transform: 'rotate(90deg)' }} />
          <span>{activePages.length} Pages</span>
        </div>
      </aside>
    );
  }

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
        flexShrink: 0,
        position: 'relative',
      }}
    >
      {/* Sidebar Header */}
      <div style={{
        padding: '12px 14px',
        borderBottom: '1px solid var(--border-subtle)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        background: 'var(--bg-secondary)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
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
          {onSelectAllPages && (
            <button
              type="button"
              onClick={onSelectAllPages}
              className="btn btn-ghost btn-sm"
              style={{ padding: '1px 6px', fontSize: '10.5px', height: 'auto', color: 'var(--text-secondary)' }}
              title="Select or deselect all pages"
            >
              {selectedCount === activePages.length ? 'Deselect' : 'All'}
            </button>
          )}
        </div>

        {onToggleCollapse && (
          <button
            type="button"
            onClick={onToggleCollapse}
            className="btn btn-ghost btn-icon"
            style={{ padding: '4px' }}
            title="Collapse thumbnails sidebar"
            aria-label="Collapse page thumbnails"
          >
            <ChevronLeft size={15} />
          </button>
        )}
      </div>

      {/* Multi-Page Selection Batch Toolbar */}
      {selectedCount > 1 && (
        <div className="batch-actions-bar">
          <span style={{ fontWeight: 600, color: 'var(--accent-primary)' }}>
            {selectedCount} selected
          </span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            {onRotateSelectedPages && (
              <button
                type="button"
                onClick={() => onRotateSelectedPages(90)}
                className="btn btn-secondary btn-sm"
                style={{ padding: '2px 8px', fontSize: '11px' }}
                title="Rotate all selected pages 90°"
              >
                <RotateCw size={11} style={{ marginRight: '3px' }} />
                <span>Rotate</span>
              </button>
            )}
            {onDeleteSelectedPages && (
              <button
                type="button"
                onClick={onDeleteSelectedPages}
                className="btn btn-danger btn-sm"
                style={{ padding: '2px 8px', fontSize: '11px' }}
                title="Delete all selected pages"
              >
                <Trash2 size={11} style={{ marginRight: '3px' }} />
                <span>Delete</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* Thumbnails List */}
      <div 
        role="listbox"
        aria-label="Document page thumbnails"
        aria-multiselectable="true"
        style={{
        padding: '12px',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
        overflowY: 'auto',
        flex: 1,
      }}>
        {pages.map((page: PDFPageInfo, index: number) => {
          if (page.deleted) return null;
          const isSelected = selectedPageIndices.has(index);
          const isCurrent = index === currentPageNum - 1;
          const isDragging = draggedIndex === index;
          const isOver = dragOverIndex === index;

          return (
            <div
              key={index}
              draggable
              onDragStart={(e) => {
                isDraggingRef.current = true;
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
                setTimeout(() => {
                  isDraggingRef.current = false;
                }, 80);
              }}
              onClick={(e) => {
                if (isDraggingRef.current) return;
                onPageClick(index + 1, e);
              }}
              tabIndex={0}
              role="option"
              aria-label={`Page ${index + 1}${isSelected ? ', selected' : ''}${isCurrent ? ', active' : ''}`}
              aria-selected={isSelected}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  onPageClick(index + 1, e as unknown as React.MouseEvent);
                }
              }}
              className="interactive-card"
              style={{
                userSelect: 'none',
                WebkitUserSelect: 'none',
                padding: '8px',
                cursor: 'grab',
                borderRadius: 'var(--radius-md)',
                border: isOver
                  ? '2px dashed var(--accent-primary)'
                  : isSelected
                  ? '2px solid var(--accent-primary)'
                  : isCurrent
                  ? '1.5px solid var(--border-strong)'
                  : '1px solid var(--border-subtle)',
                background: isSelected ? 'var(--accent-primary-light)' : isCurrent ? 'var(--bg-card)' : 'var(--bg-primary)',
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
              {/* Thumbnail Image Container */}
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

                {/* Selection Checkbox Indicator */}
                <div
                  role="checkbox"
                  aria-checked={isSelected}
                  onClick={(e) => {
                    e.stopPropagation();
                    if (onToggleSelectPage) {
                      onToggleSelectPage(index, {
                        shiftKey: e.shiftKey,
                        ctrlKey: e.ctrlKey,
                        metaKey: e.metaKey,
                      });
                    }
                  }}
                  style={{
                    position: 'absolute',
                    top: '6px',
                    left: '6px',
                    cursor: 'pointer',
                    background: isSelected ? 'var(--accent-primary)' : 'rgba(255, 255, 255, 0.85)',
                    color: isSelected ? '#ffffff' : 'var(--text-muted)',
                    borderRadius: '3px',
                    padding: '2px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    border: '1px solid var(--border-subtle)',
                    boxShadow: 'var(--shadow-xs)',
                  }}
                  title={isSelected ? 'Deselect page' : 'Select page'}
                >
                  {isSelected ? <CheckSquare size={12} /> : <Square size={12} />}
                </div>

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

                {/* Rotation indicator if rotated */}
                {page.rotation > 0 && (
                  <span
                    style={{
                      position: 'absolute',
                      top: '6px',
                      right: '6px',
                      background: 'rgba(200, 76, 50, 0.9)',
                      color: '#ffffff',
                      fontSize: '9px',
                      fontFamily: 'var(--font-mono)',
                      padding: '1px 4px',
                      borderRadius: 'var(--radius-xs)',
                    }}
                  >
                    {page.rotation}°
                  </span>
                )}
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
                  {onRotatePage && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onRotatePage(index);
                      }}
                      className="btn btn-ghost btn-icon"
                      style={{ padding: '3px' }}
                      title="Rotate page 90° clockwise"
                      aria-label={`Rotate page ${index + 1} 90 degrees`}
                    >
                      <RotateCw size={12} />
                    </button>
                  )}
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
      </div>
    </aside>
  );
};
