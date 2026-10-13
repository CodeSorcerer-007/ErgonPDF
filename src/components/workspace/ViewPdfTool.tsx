import React from 'react';
import { Eye, ExternalLink, ZoomIn, ZoomOut } from 'lucide-react';
import type { PDFDocumentState } from '../../types/pdf';

export interface ViewPdfToolProps {
  docState: PDFDocumentState;
  zoomScale: number;
  onZoomChange: (scale: number) => void;
}

export const ViewPdfTool: React.FC<ViewPdfToolProps> = ({
  docState,
  zoomScale,
  onZoomChange,
}) => {
  const handleOpenFullscreen = () => {
    try {
      const blob = new Blob([docState.arrayBuffer], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      window.open(url, '_blank');
      setTimeout(() => URL.revokeObjectURL(url), 60000);
    } catch (e) {
      console.error('Failed to open PDF in new tab:', e);
      // Fallback: toggle browser fullscreen
      if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen?.();
      } else {
        document.exitFullscreen?.();
      }
    }
  };

  const formatBytes = (bytes: number): string => {
    if (!bytes) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${(bytes / Math.pow(k, i)).toFixed(1)} ${sizes[i]}`;
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <Eye size={16} color="var(--accent-primary)" />
        <h4 style={{ fontSize: '15px', fontWeight: 700 }}>Document Inspector & Viewer</h4>
      </div>
      <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
        High-fidelity vector PDF preview with page metrics and reading tools.
      </p>

      {/* Document Information Card */}
      <div
        className="glass-card"
        style={{
          padding: '12px 14px',
          display: 'flex',
          flexDirection: 'column',
          gap: '8px',
          fontSize: '12px',
          background: 'var(--bg-tertiary)',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span style={{ color: 'var(--text-muted)' }}>File Name:</span>
          <span style={{ fontWeight: 600, color: 'var(--text-primary)', maxWidth: '140px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={docState.name}>
            {docState.name}
          </span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span style={{ color: 'var(--text-muted)' }}>Total Pages:</span>
          <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{docState.pageCount}</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span style={{ color: 'var(--text-muted)' }}>File Size:</span>
          <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{formatBytes(docState.arrayBuffer?.byteLength || 0)}</span>
        </div>
      </div>

      {/* Zoom Controls */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
          <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)' }}>
            Zoom Scale ({Math.round(zoomScale * 100)}%)
          </label>
          <div style={{ display: 'flex', gap: '4px' }}>
            <button
              type="button"
              onClick={() => onZoomChange(Math.max(0.5, Math.round((zoomScale - 0.25) * 100) / 100))}
              className="btn btn-ghost btn-icon"
              style={{ padding: '3px' }}
              title="Zoom out"
            >
              <ZoomOut size={13} />
            </button>
            <button
              type="button"
              onClick={() => onZoomChange(1.0)}
              className="btn btn-ghost btn-sm"
              style={{ padding: '1px 6px', fontSize: '10px' }}
              title="Reset zoom"
            >
              100%
            </button>
            <button
              type="button"
              onClick={() => onZoomChange(Math.min(3.0, Math.round((zoomScale + 0.25) * 100) / 100))}
              className="btn btn-ghost btn-icon"
              style={{ padding: '3px' }}
              title="Zoom in"
            >
              <ZoomIn size={13} />
            </button>
          </div>
        </div>
        <input
          type="range"
          min="0.5"
          max="3.0"
          step="0.1"
          value={zoomScale}
          onChange={(e) => onZoomChange(parseFloat(e.target.value))}
          style={{ width: '100%' }}
        />
      </div>

      {/* Fullscreen Button */}
      <button
        type="button"
        onClick={handleOpenFullscreen}
        className="btn btn-primary btn-sm"
        style={{ width: '100%' }}
      >
        <ExternalLink size={14} />
        <span>Open in Fullscreen Tab</span>
      </button>
    </div>
  );
};
