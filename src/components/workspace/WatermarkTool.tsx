import React from 'react';
import { Download } from 'lucide-react';
import type { WatermarkSettings } from '../../types/pdf';

export interface WatermarkToolProps {
  watermarkSettings: WatermarkSettings;
  onWatermarkSettingsChange: (settings: WatermarkSettings) => void;
  isProcessing: boolean;
  onProcess: () => void;
}

export const WatermarkTool: React.FC<WatermarkToolProps> = ({
  watermarkSettings,
  onWatermarkSettingsChange,
  isProcessing,
  onProcess,
}) => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
      <h4 style={{ fontSize: '15px', fontWeight: 700, marginBottom: '2px' }}>
        Watermark Settings
      </h4>

      <div>
        <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)' }}>
          Watermark Text
        </label>
        <input
          type="text"
          value={watermarkSettings.text}
          onChange={(e) => onWatermarkSettingsChange({ ...watermarkSettings, text: e.target.value })}
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
        />
      </div>

      <div>
        <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)' }}>
          Opacity: {Math.round(watermarkSettings.opacity * 100)}%
        </label>
        <input
          type="range"
          min="0.05"
          max="0.8"
          step="0.05"
          value={watermarkSettings.opacity}
          onChange={(e) =>
            onWatermarkSettingsChange({ ...watermarkSettings, opacity: parseFloat(e.target.value) })
          }
          style={{ width: '100%', marginTop: '4px' }}
        />
      </div>

      <div>
        <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)' }}>
          Rotation: {watermarkSettings.rotation}°
        </label>
        <input
          type="range"
          min="-90"
          max="90"
          step="15"
          value={watermarkSettings.rotation}
          onChange={(e) =>
            onWatermarkSettingsChange({ ...watermarkSettings, rotation: parseInt(e.target.value, 10) })
          }
          style={{ width: '100%', marginTop: '4px' }}
        />
      </div>

      <button
        type="button"
        onClick={onProcess}
        disabled={isProcessing}
        className="btn btn-primary btn-sm"
        style={{ width: '100%', marginTop: '6px' }}
      >
        <Download size={14} />
        <span>Apply Watermark & Export</span>
      </button>
    </div>
  );
};
