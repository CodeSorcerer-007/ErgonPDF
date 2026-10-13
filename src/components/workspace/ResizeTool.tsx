import React from 'react';
import { Maximize2 } from 'lucide-react';
import type { ResizeSettings } from '../../types/pdf';

export interface ResizeToolProps {
  resizeSettings: ResizeSettings;
  onResizeSettingsChange: (settings: ResizeSettings) => void;
  isProcessing: boolean;
  onProcess: () => void;
}

export const ResizeTool: React.FC<ResizeToolProps> = ({
  resizeSettings,
  onResizeSettingsChange,
  isProcessing,
  onProcess,
}) => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <Maximize2 size={16} color="var(--accent-primary)" />
        <h4 style={{ fontSize: '15px', fontWeight: 700 }}>Resize Dimensions</h4>
      </div>

      <div>
        <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)' }}>Standard Sheet Size</label>
        <select
          value={resizeSettings.targetSize}
          onChange={(e) =>
            onResizeSettingsChange({ ...resizeSettings, targetSize: e.target.value as any })
          }
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
          <option value="A4">A4 (210 × 297 mm)</option>
          <option value="A3">A3 (297 × 420 mm)</option>
          <option value="A5">A5 (148 × 210 mm)</option>
          <option value="Letter">US Letter (8.5 × 11 in)</option>
          <option value="Legal">US Legal (8.5 × 14 in)</option>
        </select>
      </div>

      <button
        type="button"
        onClick={onProcess}
        disabled={isProcessing}
        className="btn btn-primary btn-sm"
        style={{ width: '100%' }}
      >
        <Maximize2 size={14} />
        <span>Resize Pages</span>
      </button>
    </div>
  );
};
