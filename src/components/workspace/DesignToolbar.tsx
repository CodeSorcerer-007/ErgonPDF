import React, { useState, useRef } from 'react';
import { 
  Type, 
  Square, 
  Circle, 
  Minus, 
  ArrowRight, 
  CheckSquare, 
  Tag, 
  Image as ImageIcon, 
  PenTool, 
  StickyNote, 
  ShieldAlert, 
  Trash2, 
  Undo, 
  Redo, 
  Bold, 
  Italic, 
  AlignLeft, 
  AlignCenter, 
  AlignRight, 
  ChevronDown
} from 'lucide-react';
import type { CanvasElement, ShapeType, StampVariant } from '../../types/pdf';

interface DesignToolbarProps {
  onAddText: (variant: 'heading' | 'subheading' | 'body' | 'callout') => void;
  onAddShape: (shape: ShapeType) => void;
  onAddStamp: (variant: StampVariant) => void;
  onAddImage: (file: File) => void;
  onOpenSignature: () => void;
  onAddSticky: (color?: string) => void;
  onAddRedaction: (whiteout?: boolean) => void;
  selectedElement: CanvasElement | null;
  onUpdateSelected: (updates: Partial<CanvasElement>) => void;
  onDeleteSelected: () => void;
  canUndo: boolean;
  canRedo: boolean;
  onUndo: () => void;
  onRedo: () => void;
  onClearPage: () => void;
  elementsCount: number;
}

export const DesignToolbar: React.FC<DesignToolbarProps> = ({
  onAddText,
  onAddShape,
  onAddStamp,
  onAddImage,
  onOpenSignature,
  onAddSticky,
  onAddRedaction,
  selectedElement,
  onUpdateSelected,
  onDeleteSelected,
  canUndo,
  canRedo,
  onUndo,
  onRedo,
  onClearPage,
  elementsCount,
}) => {
  const [activeDropdown, setActiveDropdown] = useState<'text' | 'shape' | 'stamp' | 'sticky' | 'color' | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const toggleDropdown = (key: 'text' | 'shape' | 'stamp' | 'sticky' | 'color') => {
    setActiveDropdown((prev) => (prev === key ? null : key));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onAddImage(file);
      e.target.value = '';
    }
  };

  return (
    <div
      className="glass-panel animate-fade-in"
      onClick={(e) => {
        // Prevent closing dropdown if clicking inside toolbar dropdowns
        if (!(e.target as HTMLElement).closest('.dropdown-menu')) {
          // keep open
        }
      }}
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '8px',
        padding: '6px 12px',
        background: 'var(--bg-secondary, #181d28)',
        border: '1px solid var(--border-subtle, rgba(255,255,255,0.12))',
        borderRadius: 'var(--radius-lg, 12px)',
        boxShadow: '0 8px 24px rgba(0,0,0,0.25)',
        width: '100%',
        maxWidth: '920px',
        margin: '0 auto 12px auto',
        flexWrap: 'wrap',
        position: 'relative',
        zIndex: 40,
      }}
    >
      {/* Primary Creation Tools */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '4px', position: 'relative' }}>
        {/* Add Text Menu */}
        <div style={{ position: 'relative' }}>
          <button
            type="button"
            onClick={() => toggleDropdown('text')}
            className={`btn btn-sm ${activeDropdown === 'text' ? 'btn-primary' : 'btn-ghost'}`}
            style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '6px 10px' }}
            title="Add text to document"
          >
            <Type size={15} />
            <span style={{ fontSize: '12px', fontWeight: 600 }}>Text</span>
            <ChevronDown size={12} />
          </button>

          {activeDropdown === 'text' && (
            <div
              className="dropdown-menu glass-panel animate-scale-in"
              style={{
                position: 'absolute',
                top: '100%',
                left: 0,
                marginTop: '6px',
                background: 'var(--bg-secondary, #1e293b)',
                border: '1px solid var(--border-subtle)',
                borderRadius: '8px',
                boxShadow: 'var(--shadow-lg)',
                padding: '6px',
                display: 'flex',
                flexDirection: 'column',
                gap: '2px',
                minWidth: '160px',
                zIndex: 60,
              }}
            >
              <button
                type="button"
                className="btn btn-ghost btn-sm"
                style={{ justifyContent: 'flex-start', fontSize: '13px', fontWeight: 700 }}
                onClick={() => {
                  onAddText('heading');
                  setActiveDropdown(null);
                }}
              >
                <span>Add Heading</span>
              </button>
              <button
                type="button"
                className="btn btn-ghost btn-sm"
                style={{ justifyContent: 'flex-start', fontSize: '12px', fontWeight: 600 }}
                onClick={() => {
                  onAddText('subheading');
                  setActiveDropdown(null);
                }}
              >
                <span>Add Subheading</span>
              </button>
              <button
                type="button"
                className="btn btn-ghost btn-sm"
                style={{ justifyContent: 'flex-start', fontSize: '12px' }}
                onClick={() => {
                  onAddText('body');
                  setActiveDropdown(null);
                }}
              >
                <span>Add Body Text</span>
              </button>
              <button
                type="button"
                className="btn btn-ghost btn-sm"
                style={{ justifyContent: 'flex-start', fontSize: '12px', color: 'var(--accent-primary)' }}
                onClick={() => {
                  onAddText('callout');
                  setActiveDropdown(null);
                }}
              >
                <span>Add Callout Box</span>
              </button>
            </div>
          )}
        </div>

        {/* Add Shapes Menu */}
        <div style={{ position: 'relative' }}>
          <button
            type="button"
            onClick={() => toggleDropdown('shape')}
            className={`btn btn-sm ${activeDropdown === 'shape' ? 'btn-primary' : 'btn-ghost'}`}
            style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '6px 10px' }}
            title="Add geometric shapes"
          >
            <Square size={14} />
            <span style={{ fontSize: '12px', fontWeight: 600 }}>Shapes</span>
            <ChevronDown size={12} />
          </button>

          {activeDropdown === 'shape' && (
            <div
              className="dropdown-menu glass-panel animate-scale-in"
              style={{
                position: 'absolute',
                top: '100%',
                left: 0,
                marginTop: '6px',
                background: 'var(--bg-secondary, #1e293b)',
                border: '1px solid var(--border-subtle)',
                borderRadius: '8px',
                boxShadow: 'var(--shadow-lg)',
                padding: '6px',
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '4px',
                minWidth: '200px',
                zIndex: 60,
              }}
            >
              <button
                type="button"
                className="btn btn-ghost btn-sm"
                style={{ justifyContent: 'flex-start', gap: '6px' }}
                onClick={() => { onAddShape('rectangle'); setActiveDropdown(null); }}
              >
                <Square size={13} />
                <span>Rectangle</span>
              </button>
              <button
                type="button"
                className="btn btn-ghost btn-sm"
                style={{ justifyContent: 'flex-start', gap: '6px' }}
                onClick={() => { onAddShape('rounded-rectangle'); setActiveDropdown(null); }}
              >
                <Square size={13} style={{ borderRadius: '3px' }} />
                <span>Rounded</span>
              </button>
              <button
                type="button"
                className="btn btn-ghost btn-sm"
                style={{ justifyContent: 'flex-start', gap: '6px' }}
                onClick={() => { onAddShape('circle'); setActiveDropdown(null); }}
              >
                <Circle size={13} />
                <span>Circle</span>
              </button>
              <button
                type="button"
                className="btn btn-ghost btn-sm"
                style={{ justifyContent: 'flex-start', gap: '6px' }}
                onClick={() => { onAddShape('line'); setActiveDropdown(null); }}
              >
                <Minus size={13} />
                <span>Line</span>
              </button>
              <button
                type="button"
                className="btn btn-ghost btn-sm"
                style={{ justifyContent: 'flex-start', gap: '6px' }}
                onClick={() => { onAddShape('arrow'); setActiveDropdown(null); }}
              >
                <ArrowRight size={13} />
                <span>Arrow</span>
              </button>
              <button
                type="button"
                className="btn btn-ghost btn-sm"
                style={{ justifyContent: 'flex-start', gap: '6px' }}
                onClick={() => { onAddShape('checkmark'); setActiveDropdown(null); }}
              >
                <CheckSquare size={13} />
                <span>Checkmark</span>
              </button>
            </div>
          )}
        </div>

        {/* Add Stamp Menu */}
        <div style={{ position: 'relative' }}>
          <button
            type="button"
            onClick={() => toggleDropdown('stamp')}
            className={`btn btn-sm ${activeDropdown === 'stamp' ? 'btn-primary' : 'btn-ghost'}`}
            style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '6px 10px' }}
            title="Place rubber stamps"
          >
            <Tag size={14} />
            <span style={{ fontSize: '12px', fontWeight: 600 }}>Stamps</span>
            <ChevronDown size={12} />
          </button>

          {activeDropdown === 'stamp' && (
            <div
              className="dropdown-menu glass-panel animate-scale-in"
              style={{
                position: 'absolute',
                top: '100%',
                left: 0,
                marginTop: '6px',
                background: 'var(--bg-secondary, #1e293b)',
                border: '1px solid var(--border-subtle)',
                borderRadius: '8px',
                boxShadow: 'var(--shadow-lg)',
                padding: '6px',
                display: 'flex',
                flexDirection: 'column',
                gap: '3px',
                minWidth: '150px',
                zIndex: 60,
              }}
            >
              {[
                { name: 'APPROVED', variant: 'approved' as StampVariant, color: '#059669' },
                { name: 'CONFIDENTIAL', variant: 'confidential' as StampVariant, color: '#dc2626' },
                { name: 'DRAFT', variant: 'draft' as StampVariant, color: '#d97706' },
                { name: 'URGENT', variant: 'urgent' as StampVariant, color: '#dc2626' },
                { name: 'VOID', variant: 'void' as StampVariant, color: '#4b5563' },
                { name: 'COMPLETED', variant: 'completed' as StampVariant, color: '#059669' },
                { name: 'REJECTED', variant: 'rejected' as StampVariant, color: '#dc2626' },
              ].map((s) => (
                <button
                  key={s.variant}
                  type="button"
                  className="btn btn-ghost btn-sm"
                  style={{ justifyContent: 'flex-start', color: s.color, fontWeight: 700, fontSize: '11px', letterSpacing: '0.05em' }}
                  onClick={() => {
                    onAddStamp(s.variant);
                    setActiveDropdown(null);
                  }}
                >
                  <span>{s.name}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Add Image */}
        <input
          type="file"
          ref={fileInputRef}
          accept="image/png,image/jpeg,image/webp,image/svg+xml"
          style={{ display: 'none' }}
          onChange={handleImageUpload}
        />
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="btn btn-ghost btn-sm"
          style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '6px 10px' }}
          title="Upload & place image / logo"
        >
          <ImageIcon size={14} />
          <span style={{ fontSize: '12px', fontWeight: 600 }}>Image</span>
        </button>

        {/* Add Signature */}
        <button
          type="button"
          onClick={onOpenSignature}
          className="btn btn-ghost btn-sm"
          style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '6px 10px' }}
          title="Draw or stamp signature"
        >
          <PenTool size={14} />
          <span style={{ fontSize: '12px', fontWeight: 600 }}>Sign</span>
        </button>

        {/* Add Sticky Note */}
        <button
          type="button"
          onClick={() => onAddSticky()}
          className="btn btn-ghost btn-sm"
          style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '6px 10px' }}
          title="Add sticky comment"
        >
          <StickyNote size={14} />
          <span style={{ fontSize: '12px', fontWeight: 600 }}>Sticky</span>
        </button>

        {/* Add Redaction */}
        <button
          type="button"
          onClick={() => onAddRedaction(false)}
          className="btn btn-ghost btn-sm"
          style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '6px 10px' }}
          title="Mask sensitive area with blackout"
        >
          <ShieldAlert size={14} color="#ef4444" />
          <span style={{ fontSize: '12px', fontWeight: 600 }}>Redact</span>
        </button>
      </div>

      {/* Selected Element Quick Inspector Controls */}
      {selectedElement && (
        <div
          className="animate-fade-in"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            background: 'rgba(255,255,255,0.06)',
            padding: '2px 8px',
            borderRadius: '8px',
          }}
        >
          {/* Text Controls */}
          {selectedElement.type === 'text' && (
            <>
              {/* Bold Toggle */}
              <button
                type="button"
                onClick={() => onUpdateSelected({ fontWeight: selectedElement.fontWeight === 'bold' ? 'normal' : 'bold' })}
                className={`btn btn-ghost btn-icon ${selectedElement.fontWeight === 'bold' ? 'btn-primary' : ''}`}
                style={{ width: '26px', height: '26px', padding: 0 }}
                title="Toggle Bold"
              >
                <Bold size={13} />
              </button>

              {/* Italic Toggle */}
              <button
                type="button"
                onClick={() => onUpdateSelected({ fontStyle: selectedElement.fontStyle === 'italic' ? 'normal' : 'italic' })}
                className={`btn btn-ghost btn-icon ${selectedElement.fontStyle === 'italic' ? 'btn-primary' : ''}`}
                style={{ width: '26px', height: '26px', padding: 0 }}
                title="Toggle Italic"
              >
                <Italic size={13} />
              </button>

              {/* Font Size buttons */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
                <button
                  type="button"
                  onClick={() => onUpdateSelected({ fontSize: Math.max(8, (selectedElement.fontSize || 14) - 2) })}
                  className="btn btn-ghost btn-icon"
                  style={{ width: '22px', height: '22px', padding: 0, fontSize: '11px' }}
                >
                  -
                </button>
                <span style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', minWidth: '24px', textAlign: 'center' }}>
                  {selectedElement.fontSize || 14}
                </span>
                <button
                  type="button"
                  onClick={() => onUpdateSelected({ fontSize: Math.min(72, (selectedElement.fontSize || 14) + 2) })}
                  className="btn btn-ghost btn-icon"
                  style={{ width: '22px', height: '22px', padding: 0, fontSize: '11px' }}
                >
                  +
                </button>
              </div>

              {/* Text Align */}
              <button
                type="button"
                onClick={() => {
                  const current = selectedElement.textAlign || 'left';
                  const next = current === 'left' ? 'center' : current === 'center' ? 'right' : 'left';
                  onUpdateSelected({ textAlign: next });
                }}
                className="btn btn-ghost btn-icon"
                style={{ width: '26px', height: '26px', padding: 0 }}
                title="Cycle Alignment"
              >
                {selectedElement.textAlign === 'center' ? <AlignCenter size={13} /> : selectedElement.textAlign === 'right' ? <AlignRight size={13} /> : <AlignLeft size={13} />}
              </button>

              {/* Color Swatch */}
              <div style={{ display: 'flex', gap: '3px' }}>
                {['#111827', '#ffffff', '#ef4444', '#3b82f6', '#10b981', '#f59e0b'].map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => onUpdateSelected({ color: c })}
                    style={{
                      width: '16px',
                      height: '16px',
                      borderRadius: '50%',
                      background: c,
                      border: selectedElement.color === c ? '2px solid var(--accent-primary)' : '1px solid rgba(255,255,255,0.2)',
                      cursor: 'pointer',
                      padding: 0,
                    }}
                  />
                ))}
              </div>
            </>
          )}

          {/* Shape Controls */}
          {selectedElement.type === 'shape' && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Fill:</span>
              {[
                'rgba(59, 130, 246, 0.2)',
                'rgba(239, 68, 68, 0.2)',
                'rgba(16, 185, 129, 0.2)',
                'rgba(245, 158, 11, 0.2)',
                'transparent'
              ].map((c, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => onUpdateSelected({ fillColor: c })}
                  style={{
                    width: '16px',
                    height: '16px',
                    borderRadius: '3px',
                    background: c === 'transparent' ? '#ffffff' : c,
                    border: selectedElement.fillColor === c ? '2px solid var(--accent-primary)' : '1px solid rgba(255,255,255,0.3)',
                    cursor: 'pointer',
                    padding: 0,
                  }}
                  title={c}
                />
              ))}
            </div>
          )}

          {/* Sticky Note Controls */}
          {selectedElement.type === 'sticky' && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Color:</span>
              {[
                { name: 'Yellow', bg: '#fef08a' },
                { name: 'Mint', bg: '#bbf7d0' },
                { name: 'Sky', bg: '#bfdbfe' },
                { name: 'Pink', bg: '#fbcfe8' },
                { name: 'Orange', bg: '#fed7aa' }
              ].map((s) => (
                <button
                  key={s.name}
                  type="button"
                  onClick={() => onUpdateSelected({ stickyColor: s.bg })}
                  style={{
                    width: '16px',
                    height: '16px',
                    borderRadius: '50%',
                    background: s.bg,
                    border: selectedElement.stickyColor === s.bg ? '2px solid var(--accent-primary)' : '1px solid rgba(0,0,0,0.2)',
                    cursor: 'pointer',
                    padding: 0,
                  }}
                  title={s.name}
                />
              ))}
            </div>
          )}

          {/* Delete Element Button */}
          <button
            type="button"
            onClick={onDeleteSelected}
            className="btn btn-ghost btn-icon"
            style={{ width: '26px', height: '26px', padding: 0, color: '#ef4444' }}
            title="Delete Selected (Del)"
          >
            <Trash2 size={13} />
          </button>
        </div>
      )}

      {/* History & Clear Actions */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
        {/* Undo / Redo */}
        <button
          type="button"
          onClick={onUndo}
          disabled={!canUndo}
          className="btn btn-ghost btn-icon"
          style={{ width: '28px', height: '28px', padding: 0 }}
          title="Undo canvas change (Ctrl+Z)"
        >
          <Undo size={14} />
        </button>
        <button
          type="button"
          onClick={onRedo}
          disabled={!canRedo}
          className="btn btn-ghost btn-icon"
          style={{ width: '28px', height: '28px', padding: 0 }}
          title="Redo canvas change (Ctrl+Y)"
        >
          <Redo size={14} />
        </button>

        {elementsCount > 0 && (
          <button
            type="button"
            onClick={onClearPage}
            className="btn btn-ghost btn-sm"
            style={{ fontSize: '11px', color: 'var(--text-muted)', padding: '4px 8px' }}
            title="Delete all elements on active page"
          >
            Clear ({elementsCount})
          </button>
        )}
      </div>
    </div>
  );
};
