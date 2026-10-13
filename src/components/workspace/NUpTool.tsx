import React from 'react';
import { Grid2X2 } from 'lucide-react';
import type { NUpSettings } from '../../types/pdf';

export interface NUpToolProps {
  nUpSettings: NUpSettings;
  onNUpSettingsChange: (settings: NUpSettings) => void;
  isProcessing: boolean;
  onProcess: () => void;
}

export const NUpTool: React.FC<NUpToolProps> = ({
  nUpSettings,
  onNUpSettingsChange,
  isProcessing,
  onProcess,
}) => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <Grid2X2 size={16} color="var(--accent-primary)" />
        <h4 style={{ fontSize: '15px', fontWeight: 700 }}>Pages per Sheet (N-Up)</h4>
      </div>
      <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
        Impose multiple document pages into a single printed sheet to save paper.
      </p>

      <div>
        <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)' }}>Pages per Sheet</label>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '6px', marginTop: '6px' }}>
          {([2, 4, 9, 16] as const).map((count) => (
            <button
              key={count}
              type="button"
              onClick={() => onNUpSettingsChange({ ...nUpSettings, pagesPerSheet: count })}
              className={`btn btn-sm ${nUpSettings.pagesPerSheet === count ? 'btn-primary' : 'btn-secondary'}`}
            >
              {count}-Up
            </button>
          ))}
        </div>
      </div>

      <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', cursor: 'pointer' }}>
        <input
          type="checkbox"
          checked={nUpSettings.addBorder}
          onChange={(e) => onNUpSettingsChange({ ...nUpSettings, addBorder: e.target.checked })}
        />
        <span>Draw separation borders between pages</span>
      </label>

      <button
        type="button"
        onClick={onProcess}
        disabled={isProcessing}
        className="btn btn-primary btn-sm"
        style={{ width: '100%' }}
      >
        <Grid2X2 size={14} />
        <span>Apply N-Up Imposition</span>
      </button>
    </div>
  );
};
