import React from 'react';
import { QrCode } from 'lucide-react';
import type { QRCodeSettings } from '../../types/pdf';

export interface QRCodeToolProps {
  qrSettings: QRCodeSettings;
  onQrSettingsChange: (settings: QRCodeSettings) => void;
  isProcessing: boolean;
  onProcess: () => void;
}

export const QRCodeTool: React.FC<QRCodeToolProps> = ({
  qrSettings,
  onQrSettingsChange,
  isProcessing,
  onProcess,
}) => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <QrCode size={16} color="var(--accent-primary)" />
        <h4 style={{ fontSize: '15px', fontWeight: 700 }}>Add Dynamic QR Code</h4>
      </div>
      <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
        Stamp a high-resolution QR code onto the current page.
      </p>

      <div>
        <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)' }}>
          QR Code Content / URL
        </label>
        <input
          type="text"
          value={qrSettings.text}
          onChange={(e) => onQrSettingsChange({ ...qrSettings, text: e.target.value })}
          placeholder="https://example.com"
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
        <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)' }}>Stamp Position</label>
        <select
          value={qrSettings.position}
          onChange={(e) => onQrSettingsChange({ ...qrSettings, position: e.target.value as any })}
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
          <option value="bottom-right">Bottom Right</option>
          <option value="bottom-left">Bottom Left</option>
          <option value="top-right">Top Right</option>
          <option value="top-left">Top Left</option>
          <option value="center">Center</option>
        </select>
      </div>

      <button
        type="button"
        onClick={onProcess}
        disabled={!qrSettings.text.trim() || isProcessing}
        className="btn btn-primary btn-sm"
        style={{ width: '100%', marginTop: '6px' }}
      >
        <QrCode size={14} />
        <span>Stamp QR Code & Export</span>
      </button>
    </div>
  );
};
