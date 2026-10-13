import React from 'react';
import { Download } from 'lucide-react';
import type { PageNumberSettings } from '../../types/pdf';

export interface PageNumbersToolProps {
  pageNumberSettings: PageNumberSettings;
  onPageNumberSettingsChange: (settings: PageNumberSettings) => void;
  isProcessing: boolean;
  onProcess: () => void;
}

export const PageNumbersTool: React.FC<PageNumbersToolProps> = ({
  pageNumberSettings,
  onPageNumberSettingsChange,
  isProcessing,
  onProcess,
}) => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
      <h4 style={{ fontSize: '15px', fontWeight: 700, marginBottom: '2px' }}>
        Page Numbers
      </h4>

      <div>
        <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)' }}>
          Format
        </label>
        <select
          value={pageNumberSettings.format}
          onChange={(e) =>
            onPageNumberSettingsChange({ ...pageNumberSettings, format: e.target.value as any })
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
          <option value="Page 1 of n">Page 1 of n</option>
          <option value="Page 1">Page 1</option>
          <option value="1">1</option>
          <option value="- 1 -">- 1 -</option>
        </select>
      </div>

      <div>
        <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)' }}>
          Position
        </label>
        <select
          value={pageNumberSettings.position}
          onChange={(e) =>
            onPageNumberSettingsChange({ ...pageNumberSettings, position: e.target.value as any })
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
          <option value="bottom-center">Bottom Center</option>
          <option value="bottom-right">Bottom Right</option>
          <option value="bottom-left">Bottom Left</option>
          <option value="top-right">Top Right</option>
          <option value="top-center">Top Center</option>
        </select>
      </div>

      <button
        type="button"
        onClick={onProcess}
        disabled={isProcessing}
        className="btn btn-primary btn-sm"
        style={{ width: '100%', marginTop: '6px' }}
      >
        <Download size={14} />
        <span>Apply Numbers & Export</span>
      </button>
    </div>
  );
};
