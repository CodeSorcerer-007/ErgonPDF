import React from 'react';
import { 
  Type, 
  Square, 
  Tag, 
  Trash2, 
  Copy, 
  ArrowUp, 
  ArrowDown, 
  Lock, 
  Unlock, 
  Layers, 
  Sparkles, 
  Download,
  Bold,
  Italic,
  AlignLeft,
  AlignCenter,
  AlignRight,
  PenTool
} from 'lucide-react';
import type { CanvasElement, ShapeType, StampVariant } from '../../types/pdf';

interface DesignInspectorProps {
  selectedElement: CanvasElement | null;
  pageElements: CanvasElement[];
  onSelectElement: (id: string | null) => void;
  onUpdateElement: (id: string, updates: Partial<CanvasElement>) => void;
  onDeleteElement: (id: string) => void;
  onDuplicateElement: (id: string) => void;
  onBringForward: (id: string) => void;
  onSendBackward: (id: string) => void;
  onAddText: (variant: 'heading' | 'subheading' | 'body' | 'callout') => void;
  onAddShape: (shape: ShapeType) => void;
  onAddStamp: (variant: StampVariant) => void;
  onOpenSignature: () => void;
  onClearPage: () => void;
  isProcessing: boolean;
  onExport: () => void;
}

export const DesignInspector: React.FC<DesignInspectorProps> = ({
  selectedElement,
  pageElements,
  onSelectElement,
  onUpdateElement,
  onDeleteElement,
  onDuplicateElement,
  onBringForward,
  onSendBackward,
  onAddText,
  onAddShape,
  onAddStamp,
  onOpenSignature,
  onClearPage,
  isProcessing,
  onExport,
}) => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {/* Title */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Sparkles size={16} color="var(--accent-primary)" />
          <h4 style={{ fontSize: '15px', fontWeight: 700 }}>Design Studio</h4>
        </div>
        <span className="badge badge-accent" style={{ fontSize: '10px' }}>
          Canvas Mode
        </span>
      </div>

      <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
        Freely customize, design, add, or delete elements with instant vector precision.
      </p>

      {/* Selected Element Property Inspector */}
      {selectedElement ? (
        <div
          className="glass-card animate-fade-in"
          style={{
            padding: '14px',
            display: 'flex',
            flexDirection: 'column',
            gap: '14px',
            border: '1px solid var(--border-medium)',
            borderRadius: 'var(--radius-md)',
            background: 'var(--bg-tertiary, #1c2230)',
          }}
        >
          {/* Header of selected item */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '8px' }}>
            <span style={{ fontSize: '12px', fontWeight: 700, textTransform: 'capitalize', color: 'var(--accent-primary)' }}>
              {selectedElement.type === 'shape' ? `${selectedElement.shapeType || 'Shape'}` : `${selectedElement.type}`} Properties
            </span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <button
                type="button"
                onClick={() => onUpdateElement(selectedElement.id, { locked: !selectedElement.locked })}
                className="btn btn-ghost btn-icon"
                style={{ width: '22px', height: '22px', padding: 0 }}
                title={selectedElement.locked ? "Unlock" : "Lock position"}
              >
                {selectedElement.locked ? <Lock size={12} color="#f59e0b" /> : <Unlock size={12} />}
              </button>
              <button
                type="button"
                onClick={() => onDeleteElement(selectedElement.id)}
                className="btn btn-ghost btn-icon"
                style={{ width: '22px', height: '22px', padding: 0, color: '#ef4444' }}
                title="Delete Element (Del)"
              >
                <Trash2 size={12} />
              </button>
            </div>
          </div>

          {/* Text Properties */}
          {selectedElement.type === 'text' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div>
                <label style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>
                  Text Content
                </label>
                <textarea
                  value={selectedElement.text || ''}
                  onChange={(e) => onUpdateElement(selectedElement.id, { text: e.target.value })}
                  rows={2}
                  style={{
                    width: '100%',
                    padding: '6px 8px',
                    borderRadius: '6px',
                    border: '1px solid var(--border-subtle)',
                    background: 'var(--bg-primary)',
                    color: 'var(--text-primary)',
                    fontSize: '12px',
                    fontFamily: 'inherit',
                  }}
                />
              </div>

              {/* Font Family & Size */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                <div>
                  <label style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block', marginBottom: '2px' }}>Font</label>
                  <select
                    value={selectedElement.fontFamily || 'Helvetica'}
                    onChange={(e) => onUpdateElement(selectedElement.id, { fontFamily: e.target.value as any })}
                    style={{ width: '100%', padding: '4px 6px', fontSize: '12px', borderRadius: '4px', background: 'var(--bg-primary)', color: 'var(--text-primary)' }}
                  >
                    <option value="Helvetica">Inter / Sans</option>
                    <option value="TimesRoman">Times / Serif</option>
                    <option value="Courier">Courier / Mono</option>
                  </select>
                </div>

                <div>
                  <label style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block', marginBottom: '2px' }}>Size ({selectedElement.fontSize || 14}pt)</label>
                  <input
                    type="range"
                    min={8}
                    max={64}
                    value={selectedElement.fontSize || 14}
                    onChange={(e) => onUpdateElement(selectedElement.id, { fontSize: Number(e.target.value) })}
                    style={{ width: '100%' }}
                  />
                </div>
              </div>

              {/* Style & Align */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', gap: '4px' }}>
                  <button
                    type="button"
                    onClick={() => onUpdateElement(selectedElement.id, { fontWeight: selectedElement.fontWeight === 'bold' ? 'normal' : 'bold' })}
                    className={`btn btn-sm ${selectedElement.fontWeight === 'bold' ? 'btn-primary' : 'btn-secondary'}`}
                    style={{ padding: '4px 8px' }}
                  >
                    <Bold size={12} />
                  </button>
                  <button
                    type="button"
                    onClick={() => onUpdateElement(selectedElement.id, { fontStyle: selectedElement.fontStyle === 'italic' ? 'normal' : 'italic' })}
                    className={`btn btn-sm ${selectedElement.fontStyle === 'italic' ? 'btn-primary' : 'btn-secondary'}`}
                    style={{ padding: '4px 8px' }}
                  >
                    <Italic size={12} />
                  </button>
                </div>

                <div style={{ display: 'flex', gap: '4px' }}>
                  <button
                    type="button"
                    onClick={() => onUpdateElement(selectedElement.id, { textAlign: 'left' })}
                    className={`btn btn-sm ${selectedElement.textAlign === 'left' || !selectedElement.textAlign ? 'btn-primary' : 'btn-secondary'}`}
                    style={{ padding: '4px 8px' }}
                  >
                    <AlignLeft size={12} />
                  </button>
                  <button
                    type="button"
                    onClick={() => onUpdateElement(selectedElement.id, { textAlign: 'center' })}
                    className={`btn btn-sm ${selectedElement.textAlign === 'center' ? 'btn-primary' : 'btn-secondary'}`}
                    style={{ padding: '4px 8px' }}
                  >
                    <AlignCenter size={12} />
                  </button>
                  <button
                    type="button"
                    onClick={() => onUpdateElement(selectedElement.id, { textAlign: 'right' })}
                    className={`btn btn-sm ${selectedElement.textAlign === 'right' ? 'btn-primary' : 'btn-secondary'}`}
                    style={{ padding: '4px 8px' }}
                  >
                    <AlignRight size={12} />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Shape Properties */}
          {selectedElement.type === 'shape' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div>
                <label style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>Stroke Width ({selectedElement.strokeWidth || 2}px)</label>
                <input
                  type="range"
                  min={1}
                  max={12}
                  value={selectedElement.strokeWidth || 2}
                  onChange={(e) => onUpdateElement(selectedElement.id, { strokeWidth: Number(e.target.value) })}
                  style={{ width: '100%' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>Fill Preset</label>
                <div style={{ display: 'flex', gap: '6px' }}>
                  {[
                    { label: 'Blue', color: 'rgba(59, 130, 246, 0.2)' },
                    { label: 'Red', color: 'rgba(239, 68, 68, 0.2)' },
                    { label: 'Green', color: 'rgba(16, 185, 129, 0.2)' },
                    { label: 'Yellow', color: 'rgba(245, 158, 11, 0.2)' },
                    { label: 'None', color: 'transparent' },
                  ].map((s) => (
                    <button
                      key={s.label}
                      type="button"
                      onClick={() => onUpdateElement(selectedElement.id, { fillColor: s.color })}
                      style={{
                        padding: '4px 8px',
                        fontSize: '10px',
                        borderRadius: '4px',
                        background: s.color === 'transparent' ? 'transparent' : s.color,
                        border: selectedElement.fillColor === s.color ? '2px solid var(--accent-primary)' : '1px solid var(--border-subtle)',
                        cursor: 'pointer',
                        color: 'var(--text-primary)',
                      }}
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Stamp Properties */}
          {selectedElement.type === 'stamp' && (
            <div>
              <label style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>Custom Stamp Text</label>
              <input
                type="text"
                value={selectedElement.stampText || ''}
                onChange={(e) => onUpdateElement(selectedElement.id, { stampText: e.target.value.toUpperCase() })}
                style={{
                  width: '100%',
                  padding: '6px 8px',
                  borderRadius: '6px',
                  border: '1px solid var(--border-subtle)',
                  background: 'var(--bg-primary)',
                  color: 'var(--text-primary)',
                  fontSize: '12px',
                  fontWeight: 700,
                }}
              />
            </div>
          )}

          {/* Layer and Duplicate/Delete Actions on Element */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px', marginTop: '6px' }}>
            <button
              type="button"
              onClick={() => onBringForward(selectedElement.id)}
              className="btn btn-secondary btn-sm"
              style={{ fontSize: '11px', display: 'flex', alignItems: 'center', gap: '4px' }}
              title="Bring forward in stack"
            >
              <ArrowUp size={12} />
              <span>Forward</span>
            </button>
            <button
              type="button"
              onClick={() => onSendBackward(selectedElement.id)}
              className="btn btn-secondary btn-sm"
              style={{ fontSize: '11px', display: 'flex', alignItems: 'center', gap: '4px' }}
              title="Send backward in stack"
            >
              <ArrowDown size={12} />
              <span>Backward</span>
            </button>
            <button
              type="button"
              onClick={() => onDuplicateElement(selectedElement.id)}
              className="btn btn-secondary btn-sm"
              style={{ fontSize: '11px', display: 'flex', alignItems: 'center', gap: '4px' }}
            >
              <Copy size={12} />
              <span>Duplicate</span>
            </button>
            <button
              type="button"
              onClick={() => {
                onDeleteElement(selectedElement.id);
                onSelectElement(null);
              }}
              className="btn btn-danger btn-sm"
              style={{ fontSize: '11px', display: 'flex', alignItems: 'center', gap: '4px' }}
            >
              <Trash2 size={12} />
              <span>Delete</span>
            </button>
          </div>
        </div>
      ) : (
        /* When No Element is Selected: Quick Layers / Add Bar */
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div>
            <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)' }}>
              Page Layers ({pageElements.length})
            </span>
            <div
              style={{
                maxHeight: '160px',
                overflowY: 'auto',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-sm)',
                marginTop: '6px',
                background: 'var(--bg-primary)',
              }}
            >
              {pageElements.length === 0 ? (
                <div style={{ padding: '16px', textAlign: 'center', fontSize: '11px', color: 'var(--text-muted)' }}>
                  No elements on this page yet. Use the tools above to add text, shapes, or stamps!
                </div>
              ) : (
                pageElements.map((el, idx) => (
                  <div
                    key={el.id}
                    onClick={() => onSelectElement(el.id)}
                    style={{
                      padding: '8px 10px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      borderBottom: idx < pageElements.length - 1 ? '1px solid var(--border-subtle)' : 'none',
                      cursor: 'pointer',
                      fontSize: '11px',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Layers size={12} color="var(--accent-primary)" />
                      <span style={{ fontWeight: 600, textTransform: 'capitalize' }}>
                        {el.type === 'text' ? (el.text ? `"${el.text.substring(0, 16)}…"` : 'Text') : el.type}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteElement(el.id);
                      }}
                      className="btn btn-ghost btn-icon"
                      style={{ padding: '2px', color: '#ef4444' }}
                    >
                      <Trash2 size={11} />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Quick Creation Buttons */}
          <div>
            <label style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)' }}>Quick Add</label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px', marginTop: '6px' }}>
              <button
                type="button"
                onClick={() => onAddText('heading')}
                className="btn btn-secondary btn-sm"
                style={{ fontSize: '11px', justifyContent: 'flex-start' }}
              >
                <Type size={12} />
                <span>+ Text</span>
              </button>
              <button
                type="button"
                onClick={() => onAddShape('rectangle')}
                className="btn btn-secondary btn-sm"
                style={{ fontSize: '11px', justifyContent: 'flex-start' }}
              >
                <Square size={12} />
                <span>+ Box</span>
              </button>
              <button
                type="button"
                onClick={() => onAddStamp('approved')}
                className="btn btn-secondary btn-sm"
                style={{ fontSize: '11px', justifyContent: 'flex-start' }}
              >
                <Tag size={12} />
                <span>+ Stamp</span>
              </button>
              <button
                type="button"
                onClick={onOpenSignature}
                className="btn btn-secondary btn-sm"
                style={{ fontSize: '11px', justifyContent: 'flex-start' }}
              >
                <PenTool size={12} />
                <span>+ Sign</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Clear Page & Export Action */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: 'auto' }}>
        {pageElements.length > 0 && (
          <button
            type="button"
            onClick={onClearPage}
            className="btn btn-ghost btn-sm"
            style={{ width: '100%', color: 'var(--text-muted)' }}
          >
            <Trash2 size={13} />
            <span>Clear Page Elements</span>
          </button>
        )}

        <button
          type="button"
          onClick={onExport}
          disabled={isProcessing}
          className="btn btn-primary btn-sm"
          style={{ width: '100%' }}
        >
          <Download size={14} />
          <span>Bake Design & Export PDF</span>
        </button>
      </div>
    </div>
  );
};
