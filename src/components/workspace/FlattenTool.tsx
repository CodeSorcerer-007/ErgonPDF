import React from 'react';
import { Layers } from 'lucide-react';

export interface FlattenToolProps {
  flattenDpi: number;
  onFlattenDpiChange: (dpi: number) => void;
  isProcessing: boolean;
  onProcess: () => void;
}

export const FlattenTool: React.FC<FlattenToolProps> = ({
  flattenDpi,
  onFlattenDpiChange,
  isProcessing,
  onProcess,
}) => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <Layers size={16} color="var(--accent-primary)" />
        <h4 style={{ fontSize: '15px', fontWeight: 700 }}>Flatten & Rasterize</h4>
      </div>
      <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
        Bakes all interactive forms, annotations, and vector layers into non-editable raster bitmaps.
      </p>

      <div>
        <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)' }}>Raster Resolution</label>
        <select
          value={flattenDpi}
          onChange={(e) => onFlattenDpiChange(parseInt(e.target.value, 10))}
          style={{
            width: '100%',
            padding: '8px 12px',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border-medium)',
            background: 'var(--bg-tertiary)',
            color: 'var(--text-primary)',
            marginTop: '4px',
            fontSize: '13px',
          }}
        >
          <option value={100}>100 DPI (Draft / Small)</option>
          <option value={150}>150 DPI (Standard)</option>
          <option value={300}>300 DPI (High Definition)</option>
        </select>
      </div>

      <button
        type="button"
        onClick={onProcess}
        disabled={isProcessing}
        className="btn btn-primary btn-sm"
        style={{ width: '100%' }}
      >
        <Layers size={14} />
        <span>Flatten Document Layers</span>
      </button>
    </div>
  );
};
