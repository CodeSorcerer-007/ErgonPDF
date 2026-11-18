import React, { useState, useRef, useEffect, useCallback } from 'react';
import { 
  Trash2, 
  Copy, 
  ArrowUp, 
  ArrowDown, 
  Lock, 
  Unlock 
} from 'lucide-react';
import type { CanvasElement } from '../../types/pdf';

interface InteractiveDesignLayerProps {
  elements: CanvasElement[];
  currentPageNum: number;
  zoomScale: number;
  selectedElementId: string | null;
  onSelectElement: (id: string | null) => void;
  onUpdateElement: (id: string, updates: Partial<CanvasElement>) => void;
  onDeleteElement: (id: string) => void;
  onDuplicateElement: (id: string) => void;
  onBringForward: (id: string) => void;
  onSendBackward: (id: string) => void;
  snapToGrid?: boolean;
  gridSize?: number;
}

type ResizeDirection = 'nw' | 'n' | 'ne' | 'e' | 'se' | 's' | 'sw' | 'w';

export const InteractiveDesignLayer: React.FC<InteractiveDesignLayerProps> = ({
  elements,
  currentPageNum,
  zoomScale,
  selectedElementId,
  onSelectElement,
  onUpdateElement,
  onDeleteElement,
  onDuplicateElement,
  onBringForward,
  onSendBackward,
  snapToGrid = false,
  gridSize = 2,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  // Dragging state
  const [isDragging, setIsDragging] = useState(false);
  const [dragStartPos, setDragStartPos] = useState<{ mouseX: number; mouseY: number; elemX: number; elemY: number } | null>(null);

  // Resizing state
  const [isResizing, setIsResizing] = useState(false);
  const [resizeDir, setResizeDir] = useState<ResizeDirection | null>(null);
  const [resizeStartPos, setResizeStartPos] = useState<{
    mouseX: number;
    mouseY: number;
    elemX: number;
    elemY: number;
    elemW: number;
    elemH: number;
  } | null>(null);

  // Inline text editing state
  const [editingTextId, setEditingTextId] = useState<string | null>(null);
  const textInputRef = useRef<HTMLTextAreaElement>(null);

  const pageElements = elements.filter((el) => el.pageNumber === currentPageNum);
  const selectedElement = pageElements.find((el) => el.id === selectedElementId);

  // Snap coordinate helper
  const snapVal = useCallback((val: number): number => {
    if (!snapToGrid) return val;
    return Math.round(val / gridSize) * gridSize;
  }, [snapToGrid, gridSize]);

  // Focus textarea when editing inline
  useEffect(() => {
    if (editingTextId && textInputRef.current) {
      textInputRef.current.focus();
      textInputRef.current.select();
    }
  }, [editingTextId]);

  // Global mouse handlers for Drag and Resize
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      if (rect.width === 0 || rect.height === 0) return;

      if (isDragging && dragStartPos && selectedElementId) {
        e.preventDefault();
        const deltaXPercent = ((e.clientX - dragStartPos.mouseX) / rect.width) * 100;
        const deltaYPercent = ((e.clientY - dragStartPos.mouseY) / rect.height) * 100;

        let newX = snapVal(Math.max(0, Math.min(95, dragStartPos.elemX + deltaXPercent)));
        let newY = snapVal(Math.max(0, Math.min(95, dragStartPos.elemY + deltaYPercent)));

        onUpdateElement(selectedElementId, { xPercent: newX, yPercent: newY });
      } else if (isResizing && resizeStartPos && resizeDir && selectedElementId) {
        e.preventDefault();
        const deltaXPercent = ((e.clientX - resizeStartPos.mouseX) / rect.width) * 100;
        const deltaYPercent = ((e.clientY - resizeStartPos.mouseY) / rect.height) * 100;

        let newX = resizeStartPos.elemX;
        let newY = resizeStartPos.elemY;
        let newW = resizeStartPos.elemW;
        let newH = resizeStartPos.elemH;

        if (resizeDir.includes('e')) {
          newW = Math.max(3, snapVal(resizeStartPos.elemW + deltaXPercent));
        }
        if (resizeDir.includes('s')) {
          newH = Math.max(2, snapVal(resizeStartPos.elemH + deltaYPercent));
        }
        if (resizeDir.includes('w')) {
          const proposedW = resizeStartPos.elemW - deltaXPercent;
          if (proposedW >= 3) {
            newW = snapVal(proposedW);
            newX = snapVal(resizeStartPos.elemX + deltaXPercent);
          }
        }
        if (resizeDir.includes('n')) {
          const proposedH = resizeStartPos.elemH - deltaYPercent;
          if (proposedH >= 2) {
            newH = snapVal(proposedH);
            newY = snapVal(resizeStartPos.elemY + deltaYPercent);
          }
        }

        onUpdateElement(selectedElementId, {
          xPercent: Math.max(0, Math.min(100 - newW, newX)),
          yPercent: Math.max(0, Math.min(100 - newH, newY)),
          widthPercent: Math.min(100, newW),
          heightPercent: Math.min(100, newH),
        });
      }
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      setDragStartPos(null);
      setIsResizing(false);
      setResizeDir(null);
      setResizeStartPos(null);
    };

    if (isDragging || isResizing) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, dragStartPos, isResizing, resizeStartPos, resizeDir, selectedElementId, onUpdateElement, snapVal]);

  // Keyboard controls for selected element (Delete, Duplicate, Escape, Nudge)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!selectedElementId) return;
      const target = e.target as HTMLElement | null;
      const isInput = target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable);
      if (isInput && editingTextId) return;

      if (e.key === 'Delete' || e.key === 'Backspace') {
        e.preventDefault();
        onDeleteElement(selectedElementId);
        onSelectElement(null);
      } else if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'd') {
        e.preventDefault();
        onDuplicateElement(selectedElementId);
      } else if (e.key === 'Escape') {
        onSelectElement(null);
        setEditingTextId(null);
      } else if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
        e.preventDefault();
        const step = e.shiftKey ? 5 : 1;
        if (!selectedElement) return;

        let { xPercent, yPercent } = selectedElement;
        if (e.key === 'ArrowUp') yPercent = Math.max(0, yPercent - step);
        if (e.key === 'ArrowDown') yPercent = Math.min(100 - selectedElement.heightPercent, yPercent + step);
        if (e.key === 'ArrowLeft') xPercent = Math.max(0, xPercent - step);
        if (e.key === 'ArrowRight') xPercent = Math.min(100 - selectedElement.widthPercent, xPercent + step);

        onUpdateElement(selectedElementId, { xPercent, yPercent });
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedElementId, selectedElement, editingTextId, onDeleteElement, onDuplicateElement, onSelectElement, onUpdateElement]);

  const handleStartDrag = (e: React.MouseEvent, el: CanvasElement) => {
    if (el.locked) return;
    if ((e.target as HTMLElement).closest('.action-bubble') || (e.target as HTMLElement).closest('.resize-handle')) {
      return;
    }
    e.stopPropagation();
    onSelectElement(el.id);
    setIsDragging(true);
    setDragStartPos({
      mouseX: e.clientX,
      mouseY: e.clientY,
      elemX: el.xPercent,
      elemY: el.yPercent,
    });
  };

  const handleStartResize = (e: React.MouseEvent, dir: ResizeDirection, el: CanvasElement) => {
    if (el.locked) return;
    e.stopPropagation();
    setIsResizing(true);
    setResizeDir(dir);
    setResizeStartPos({
      mouseX: e.clientX,
      mouseY: e.clientY,
      elemX: el.xPercent,
      elemY: el.yPercent,
      elemW: el.widthPercent,
      elemH: el.heightPercent,
    });
  };

  // Render element content based on type
  const renderElementContent = (el: CanvasElement) => {
    if (el.type === 'text') {
      const isEditing = editingTextId === el.id;
      if (isEditing) {
        return (
          <textarea
            ref={textInputRef}
            value={el.text || ''}
            onChange={(e) => onUpdateElement(el.id, { text: e.target.value })}
            onBlur={() => setEditingTextId(null)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                setEditingTextId(null);
              }
            }}
            style={{
              width: '100%',
              height: '100%',
              border: 'none',
              outline: 'none',
              background: 'transparent',
              resize: 'none',
              fontFamily: el.fontFamily === 'TimesRoman' ? 'serif' : el.fontFamily === 'Courier' ? 'monospace' : 'inherit',
              fontSize: `${(el.fontSize || 14) * zoomScale}px`,
              fontWeight: el.fontWeight || 'normal',
              fontStyle: el.fontStyle || 'normal',
              color: el.color || '#111827',
              textAlign: el.textAlign || 'left',
              padding: '2px',
              lineHeight: 1.25,
            }}
          />
        );
      }
      return (
        <div
          onDoubleClick={() => setEditingTextId(el.id)}
          style={{
            width: '100%',
            height: '100%',
            overflow: 'hidden',
            fontFamily: el.fontFamily === 'TimesRoman' ? 'serif' : el.fontFamily === 'Courier' ? 'monospace' : 'inherit',
            fontSize: `${(el.fontSize || 14) * zoomScale}px`,
            fontWeight: el.fontWeight || 'normal',
            fontStyle: el.fontStyle || 'normal',
            color: el.color || '#111827',
            textAlign: el.textAlign || 'left',
            backgroundColor: el.backgroundColor || 'transparent',
            padding: '2px 4px',
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-word',
            userSelect: 'none',
            lineHeight: 1.25,
          }}
        >
          {el.text || 'Double-click to type'}
        </div>
      );
    }

    if (el.type === 'shape') {
      const fill = el.fillColor || 'rgba(59, 130, 246, 0.2)';
      const stroke = el.strokeColor || '#2563eb';
      const strokeW = el.strokeWidth || 2;

      if (el.shapeType === 'circle') {
        return (
          <div style={{
            width: '100%',
            height: '100%',
            borderRadius: '50%',
            background: fill,
            border: `${strokeW}px solid ${stroke}`,
            boxSizing: 'border-box',
          }} />
        );
      }
      if (el.shapeType === 'line') {
        return (
          <div style={{
            width: '100%',
            height: '100%',
            display: 'flex',
            alignItems: 'center',
          }}>
            <div style={{
              width: '100%',
              height: `${strokeW}px`,
              background: stroke,
            }} />
          </div>
        );
      }
      if (el.shapeType === 'arrow') {
        return (
          <svg width="100%" height="100%" viewBox="0 0 100 40" preserveAspectRatio="none">
            <line x1="0" y1="20" x2="86" y2="20" stroke={stroke} strokeWidth={strokeW * 1.5} />
            <polygon points="84,10 100,20 84,30" fill={stroke} />
          </svg>
        );
      }
      if (el.shapeType === 'checkmark') {
        return (
          <svg width="100%" height="100%" viewBox="0 0 100 100">
            <polyline points="20,50 45,75 85,25" fill="none" stroke={stroke || '#10b981'} strokeWidth={strokeW * 3} strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        );
      }
      if (el.shapeType === 'rounded-rectangle') {
        return (
          <div style={{
            width: '100%',
            height: '100%',
            borderRadius: '12px',
            background: fill,
            border: `${strokeW}px solid ${stroke}`,
            boxSizing: 'border-box',
          }} />
        );
      }
      // default rectangle
      return (
        <div style={{
          width: '100%',
          height: '100%',
          background: fill,
          border: `${strokeW}px solid ${stroke}`,
          boxSizing: 'border-box',
        }} />
      );
    }

    if (el.type === 'sticky') {
      const isEditing = editingTextId === el.id;
      const bg = el.stickyColor || '#fef08a';
      return (
        <div style={{
          width: '100%',
          height: '100%',
          background: bg,
          border: '1px solid rgba(0,0,0,0.12)',
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
          borderRadius: '4px',
          padding: '8px',
          display: 'flex',
          flexDirection: 'column',
          boxSizing: 'border-box',
        }}>
          {isEditing ? (
            <textarea
              ref={textInputRef}
              value={el.text || ''}
              onChange={(e) => onUpdateElement(el.id, { text: e.target.value })}
              onBlur={() => setEditingTextId(null)}
              style={{
                width: '100%',
                height: '100%',
                border: 'none',
                outline: 'none',
                background: 'transparent',
                resize: 'none',
                fontFamily: 'inherit',
                fontSize: `${(el.fontSize || 12) * zoomScale}px`,
                color: '#1f2937',
              }}
            />
          ) : (
            <div
              onDoubleClick={() => setEditingTextId(el.id)}
              style={{
                width: '100%',
                height: '100%',
                fontSize: `${(el.fontSize || 12) * zoomScale}px`,
                color: '#1f2937',
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-word',
                overflow: 'hidden',
                userSelect: 'none',
              }}
            >
              {el.text || 'Double-click to write note'}
            </div>
          )}
        </div>
      );
    }

    if (el.type === 'stamp') {
      const stampText = el.stampText || el.stampVariant?.toUpperCase() || 'APPROVED';
      const isRed = ['REJECTED', 'VOID', 'URGENT', 'CONFIDENTIAL'].includes(stampText);
      const stampColor = isRed ? '#dc2626' : '#059669';
      return (
        <div style={{
          width: '100%',
          height: '100%',
          border: `3px solid ${stampColor}`,
          borderRadius: '6px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: stampColor,
          fontFamily: 'Impact, "Arial Black", sans-serif',
          fontWeight: 800,
          fontSize: `${Math.min(26 * zoomScale, 18)}px`,
          letterSpacing: '0.12em',
          textTransform: 'uppercase',
          transform: 'rotate(-5deg)',
          userSelect: 'none',
          boxSizing: 'border-box',
          background: 'rgba(255,255,255,0.7)',
        }}>
          {stampText}
        </div>
      );
    }

    if (el.type === 'redaction') {
      return (
        <div style={{
          width: '100%',
          height: '100%',
          background: el.backgroundColor === '#ffffff' ? '#ffffff' : '#000000',
          border: '1px dashed #ef4444',
          boxSizing: 'border-box',
        }} />
      );
    }

    if ((el.type === 'image' || el.type === 'signature') && el.dataUrl) {
      return (
        <img
          src={el.dataUrl}
          alt={el.type}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'contain',
            pointerEvents: 'none',
            userSelect: 'none',
          }}
        />
      );
    }

    return null;
  };

  return (
    <div
      ref={containerRef}
      onClick={() => onSelectElement(null)}
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        zIndex: 10,
        pointerEvents: 'auto',
      }}
    >
      {pageElements.map((el) => {
        const isSelected = el.id === selectedElementId;
        const opacity = el.opacity !== undefined ? el.opacity : 1;

        return (
          <div
            key={el.id}
            onMouseDown={(e) => handleStartDrag(e, el)}
            style={{
              position: 'absolute',
              left: `${el.xPercent}%`,
              top: `${el.yPercent}%`,
              width: `${el.widthPercent}%`,
              height: `${el.heightPercent}%`,
              opacity,
              zIndex: el.zIndex || (isSelected ? 20 : 10),
              cursor: el.locked ? 'default' : isDragging && isSelected ? 'grabbing' : 'grab',
              outline: isSelected ? '2px solid var(--accent-primary, #3b82f6)' : '1px dashed rgba(59, 130, 246, 0.25)',
              boxSizing: 'border-box',
              transition: isDragging ? 'none' : 'outline 0.15s ease',
            }}
          >
            {/* Element Core Content */}
            {renderElementContent(el)}

            {/* Floating Quick Action Bubble (Right above selected element) */}
            {isSelected && (
              <div
                className="action-bubble glass-panel animate-fade-in"
                onClick={(e) => e.stopPropagation()}
                style={{
                  position: 'absolute',
                  top: '-38px',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  padding: '3px 6px',
                  background: 'var(--bg-secondary, #1e293b)',
                  border: '1px solid var(--border-subtle, rgba(255,255,255,0.15))',
                  borderRadius: '20px',
                  boxShadow: '0 4px 14px rgba(0,0,0,0.3)',
                  zIndex: 50,
                  whiteSpace: 'nowrap',
                }}
              >
                {/* Duplicate */}
                <button
                  type="button"
                  onClick={() => onDuplicateElement(el.id)}
                  className="btn btn-ghost btn-icon"
                  style={{ width: '24px', height: '24px', padding: 0 }}
                  title="Duplicate (Ctrl+D)"
                >
                  <Copy size={13} />
                </button>

                {/* Layer Up */}
                <button
                  type="button"
                  onClick={() => onBringForward(el.id)}
                  className="btn btn-ghost btn-icon"
                  style={{ width: '24px', height: '24px', padding: 0 }}
                  title="Bring Forward"
                >
                  <ArrowUp size={13} />
                </button>

                {/* Layer Down */}
                <button
                  type="button"
                  onClick={() => onSendBackward(el.id)}
                  className="btn btn-ghost btn-icon"
                  style={{ width: '24px', height: '24px', padding: 0 }}
                  title="Send Backward"
                >
                  <ArrowDown size={13} />
                </button>

                {/* Lock / Unlock */}
                <button
                  type="button"
                  onClick={() => onUpdateElement(el.id, { locked: !el.locked })}
                  className="btn btn-ghost btn-icon"
                  style={{ width: '24px', height: '24px', padding: 0, color: el.locked ? '#f59e0b' : 'inherit' }}
                  title={el.locked ? "Unlock element" : "Lock position"}
                >
                  {el.locked ? <Lock size={13} /> : <Unlock size={13} />}
                </button>

                <div style={{ width: '1px', height: '14px', background: 'var(--border-subtle, rgba(255,255,255,0.2))', margin: '0 2px' }} />

                {/* Delete */}
                <button
                  type="button"
                  onClick={() => {
                    onDeleteElement(el.id);
                    onSelectElement(null);
                  }}
                  className="btn btn-ghost btn-icon"
                  style={{ width: '24px', height: '24px', padding: 0, color: '#ef4444' }}
                  title="Delete element (Del)"
                >
                  <Trash2 size={13} />
                </button>
              </div>
            )}

            {/* 8-Point Resize Handles (Only on Selected & Unlocked Element) */}
            {isSelected && !el.locked && (
              <>
                {(['nw', 'n', 'ne', 'e', 'se', 's', 'sw', 'w'] as ResizeDirection[]).map((dir) => {
                  let cursor = 'nwse-resize';
                  let posStyle: React.CSSProperties = {};

                  if (dir === 'nw') {
                    cursor = 'nwse-resize';
                    posStyle = { top: '-5px', left: '-5px' };
                  } else if (dir === 'n') {
                    cursor = 'ns-resize';
                    posStyle = { top: '-5px', left: '50%', transform: 'translateX(-50%)' };
                  } else if (dir === 'ne') {
                    cursor = 'nesw-resize';
                    posStyle = { top: '-5px', right: '-5px' };
                  } else if (dir === 'e') {
                    cursor = 'ew-resize';
                    posStyle = { top: '50%', right: '-5px', transform: 'translateY(-50%)' };
                  } else if (dir === 'se') {
                    cursor = 'nwse-resize';
                    posStyle = { bottom: '-5px', right: '-5px' };
                  } else if (dir === 's') {
                    cursor = 'ns-resize';
                    posStyle = { bottom: '-5px', left: '50%', transform: 'translateX(-50%)' };
                  } else if (dir === 'sw') {
                    cursor = 'nesw-resize';
                    posStyle = { bottom: '-5px', left: '-5px' };
                  } else if (dir === 'w') {
                    cursor = 'ew-resize';
                    posStyle = { top: '50%', left: '-5px', transform: 'translateY(-50%)' };
                  }

                  return (
                    <div
                      key={dir}
                      className="resize-handle"
                      onMouseDown={(e) => handleStartResize(e, dir, el)}
                      style={{
                        position: 'absolute',
                        width: '9px',
                        height: '9px',
                        borderRadius: '50%',
                        background: '#ffffff',
                        border: '2px solid var(--accent-primary, #3b82f6)',
                        boxShadow: '0 1px 3px rgba(0,0,0,0.3)',
                        cursor,
                        zIndex: 30,
                        ...posStyle,
                      }}
                    />
                  );
                })}
              </>
            )}
          </div>
        );
      })}
    </div>
  );
};
