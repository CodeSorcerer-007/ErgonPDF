import React from 'react';
import { PenTool, Sparkles, Trash2, Download, AlertCircle } from 'lucide-react';

export interface AnnotateToolProps {
  annotationMode: 'pen' | 'highlighter';
  onAnnotationModeChange: (mode: 'pen' | 'highlighter') => void;
  annotationColor: string;
  onAnnotationColorChange: (color: string) => void;
  annotationWidth: number;
  onAnnotationWidthChange: (width: number) => void;
  onClearAnnotations: () => void;
  isProcessing: boolean;
  onProcess: () => void;
}

export const AnnotateTool: React.FC<AnnotateToolProps> = ({
  annotationMode,
  onAnnotationModeChange,
  annotationColor,
  onAnnotationColorChange,
  annotationWidth,
  onAnnotationWidthChange,
  onClearAnnotations,
  isProcessing,
  onProcess,
}) => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <PenTool size={16} color="var(--accent-primary)" />
        <h4 style={{ fontSize: '15px', fontWeight: 700 }}>Annotate & Draw</h4>
      </div>
      <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
        Draw, highlight, and sketch directly onto the active page. Strokes are automatically baked into the PDF upon export.
      </p>

      {/* Prominent Rasterization Notice */}
      <div
        className="glass-card"
        style={{
          padding: '10px 12px',
          fontSize: '11px',
          color: 'var(--text-secondary)',
          lineHeight: '1.4',
          borderLeft: '3px solid var(--accent-primary)',
          display: 'flex',
          gap: '8px',
          alignItems: 'flex-start',
        }}
      >
        <AlertCircle size={15} style={{ flexShrink: 0, marginTop: '2px', color: 'var(--accent-primary)' }} />
        <span>
          <strong>Notice:</strong> Drawing strokes are composited as a full-page raster layer on export. This replaces vector text underneath with a bitmap. To preserve vector text fidelity, use the Sign & Fill tool for localized image stamps.
        </span>
      </div>

      {/* Mode Selector */}
      <div>
        <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)' }}>Tool Mode</label>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginTop: '6px' }}>
          <button
            type="button"
            onClick={() => onAnnotationModeChange('pen')}
            className={`btn btn-sm ${annotationMode === 'pen' ? 'btn-primary' : 'btn-secondary'}`}
          >
            <PenTool size={13} />
            <span>Pen</span>
          </button>
          <button
            type="button"
            onClick={() => onAnnotationModeChange('highlighter')}
            className={`btn btn-sm ${annotationMode === 'highlighter' ? 'btn-primary' : 'btn-secondary'}`}
          >
            <Sparkles size={13} />
            <span>Highlighter</span>
          </button>
        </div>
      </div>

      {/* Color Selector */}
      <div>
        <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)' }}>Color Palette</label>
        <div style={{ display: 'flex', gap: '8px', marginTop: '6px' }}>
          {[
            { name: 'Amber', color: '#f59e0b' },
            { name: 'Blue', color: '#3b82f6' },
            { name: 'Red', color: '#ef4444' },
            { name: 'Green', color: '#10b981' },
            { name: 'Obsidian', color: '#0f172a' },
          ].map((c) => (
            <button
              key={c.color}
              type="button"
              onClick={() => onAnnotationColorChange(c.color)}
              style={{
                width: '24px',
                height: '24px',
                borderRadius: '50%',
                background: c.color,
                border: annotationColor === c.color ? '2px solid #ffffff' : '1px solid rgba(0,0,0,0.2)',
                boxShadow: annotationColor === c.color ? '0 0 0 2px var(--accent-primary)' : 'none',
                cursor: 'pointer',
              }}
              title={c.name}
            />
          ))}
        </div>
      </div>

      {/* Stroke Thickness */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: 'var(--text-muted)' }}>
          <span>Stroke Thickness</span>
          <span>{annotationWidth}px</span>
        </div>
        <input
          type="range"
          min={2}
          max={24}
          value={annotationWidth}
          onChange={(e) => onAnnotationWidthChange(Number(e.target.value))}
          style={{ width: '100%', marginTop: '6px' }}
        />
      </div>

      {/* Actions */}
      <button
        type="button"
        onClick={onClearAnnotations}
        className="btn btn-secondary btn-sm"
        style={{ width: '100%' }}
      >
        <Trash2 size={14} />
        <span>Clear Page Drawing</span>
      </button>

      <button
        type="button"
        onClick={onProcess}
        disabled={isProcessing}
        className="btn btn-primary btn-sm"
        style={{ width: '100%' }}
      >
        <Download size={14} />
        <span>Bake Annotations & Export</span>
      </button>
    </div>
  );
};
