import React from 'react';
import { Download } from 'lucide-react';

export interface CompressToolProps {
  compressionPreset: 'lossless' | 'balanced' | 'max' | 'grayscale';
  onPresetChange: (preset: 'lossless' | 'balanced' | 'max' | 'grayscale') => void;
  compressionGrayscale: boolean;
  onGrayscaleChange: (val: boolean) => void;
  compressionDpi: number;
  onDpiChange: (dpi: number) => void;
  compressionQuality: number;
  onQualityChange: (q: number) => void;
  isProcessing: boolean;
  onProcess: () => void;
}

export const CompressTool: React.FC<CompressToolProps> = ({
  compressionPreset,
  onPresetChange,
  compressionGrayscale,
  onGrayscaleChange,
  compressionDpi,
  onDpiChange,
  compressionQuality,
  onQualityChange,
  isProcessing,
  onProcess,
}) => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
      <div>
        <h4 style={{ fontSize: '15px', fontWeight: 700, marginBottom: '4px' }}>
          Adaptive PDF Compression
        </h4>
        <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
          Intelligent dual-mode compressor. Automatically preserves text vectors or downsamples images.
        </p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {[
          { id: 'lossless', label: 'Smart Lossless', desc: '0% visual loss, crisp text & vectors' },
          { id: 'balanced', label: 'Balanced (Recommended)', desc: '150 DPI JPEG, ~50-70% smaller' },
          { id: 'max', label: 'Maximum Compression', desc: '96 DPI JPEG, ~75-85% smaller' },
          { id: 'grayscale', label: 'Grayscale Scan Optimizer', desc: '8-bit luminance, 80-90% smaller' },
        ].map((preset) => (
          <div
            key={preset.id}
            onClick={() => {
              onPresetChange(preset.id as any);
              if (preset.id === 'grayscale') onGrayscaleChange(true);
              if (preset.id === 'max') onDpiChange(96);
              if (preset.id === 'balanced') onDpiChange(150);
            }}
            className="glass-card"
            style={{
              padding: '10px 12px',
              cursor: 'pointer',
              border: compressionPreset === preset.id ? '2px solid var(--accent-primary)' : '1px solid var(--border-subtle)',
              background: compressionPreset === preset.id ? 'var(--accent-primary-light)' : 'var(--bg-tertiary)',
              borderRadius: 'var(--radius-md)',
            }}
          >
            <span style={{ fontSize: '12px', fontWeight: 700, display: 'block' }}>
              {preset.label}
            </span>
            <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
              {preset.desc}
            </span>
          </div>
        ))}
      </div>

      {/* Additional Settings */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '4px' }}>
        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', cursor: 'pointer' }}>
          <input
            type="checkbox"
            checked={compressionGrayscale}
            onChange={(e) => onGrayscaleChange(e.target.checked)}
          />
          <span>Convert to Grayscale (Dramatically smaller scans)</span>
        </label>

        <div>
          <label style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)' }}>Target DPI Resolution</label>
          <select
            value={compressionDpi}
            onChange={(e) => onDpiChange(parseInt(e.target.value, 10))}
            style={{
              width: '100%',
              padding: '6px 10px',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-medium)',
              background: 'var(--bg-tertiary)',
              color: 'var(--text-primary)',
              fontSize: '12px',
              marginTop: '4px',
            }}
          >
            <option value={72}>72 DPI (Extreme Web/Email)</option>
            <option value={96}>96 DPI (Fast Screen)</option>
            <option value={150}>150 DPI (Balanced Standard)</option>
            <option value={300}>300 DPI (High Print Quality)</option>
          </select>
        </div>

        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)' }}>
            <span>Image Quality</span>
            <span>{Math.round(compressionQuality * 100)}%</span>
          </div>
          <input
            type="range"
            min="0.3"
            max="0.9"
            step="0.05"
            value={compressionQuality}
            onChange={(e) => onQualityChange(parseFloat(e.target.value))}
            style={{ width: '100%', marginTop: '4px' }}
          />
        </div>
      </div>

      <button
        onClick={onProcess}
        disabled={isProcessing}
        className="btn btn-primary btn-sm"
        style={{ width: '100%', marginTop: '6px' }}
      >
        <Download size={14} />
        <span>Execute Compression</span>
      </button>
    </div>
  );
};
