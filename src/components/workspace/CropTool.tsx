import React from 'react';
import { Crop } from 'lucide-react';
import type { CropSettings } from '../../types/pdf';

export interface CropToolProps {
  cropSettings: CropSettings;
  onCropSettingsChange: (settings: CropSettings) => void;
  isProcessing: boolean;
  onProcess: () => void;
}

export const CropTool: React.FC<CropToolProps> = ({
  cropSettings,
  onCropSettingsChange,
  isProcessing,
  onProcess,
}) => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <Crop size={16} color="var(--accent-primary)" />
        <h4 style={{ fontSize: '15px', fontWeight: 700 }}>Crop Page Margins</h4>
      </div>

      <div>
        <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)' }}>
          Top Margin: {cropSettings.topPercent}%
        </label>
        <input
          type="range"
          min="0"
          max="40"
          value={cropSettings.topPercent}
          onChange={(e) =>
            onCropSettingsChange({ ...cropSettings, topPercent: parseInt(e.target.value, 10) })
          }
          style={{ width: '100%', marginTop: '4px' }}
        />
      </div>

      <div>
        <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)' }}>
          Bottom Margin: {cropSettings.bottomPercent}%
        </label>
        <input
          type="range"
          min="0"
          max="40"
          value={cropSettings.bottomPercent}
          onChange={(e) =>
            onCropSettingsChange({ ...cropSettings, bottomPercent: parseInt(e.target.value, 10) })
          }
          style={{ width: '100%', marginTop: '4px' }}
        />
      </div>

      <div>
        <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)' }}>
          Side Margins: {cropSettings.leftPercent}%
        </label>
        <input
          type="range"
          min="0"
          max="40"
          value={cropSettings.leftPercent}
          onChange={(e) =>
            onCropSettingsChange({
              ...cropSettings,
              leftPercent: parseInt(e.target.value, 10),
              rightPercent: parseInt(e.target.value, 10),
            })
          }
          style={{ width: '100%', marginTop: '4px' }}
        />
      </div>

      <button
        type="button"
        onClick={onProcess}
        disabled={isProcessing}
        className="btn btn-primary btn-sm"
        style={{ width: '100%' }}
      >
        <Crop size={14} />
        <span>Apply Crop Bounds</span>
      </button>
    </div>
  );
};
