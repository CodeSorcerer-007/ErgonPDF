import React from 'react';
import { Download, Sparkles, Check } from 'lucide-react';
import type { WatermarkSettings } from '../../types/pdf';

export interface WatermarkToolProps {
  watermarkSettings: WatermarkSettings;
  onWatermarkSettingsChange: (settings: WatermarkSettings) => void;
  isProcessing: boolean;
  onProcess: () => void;
}

const PRESET_TEXTS = ['CONFIDENTIAL', 'DRAFT', 'SAMPLE', 'COPY', 'ORIGINAL'];

const COLOR_OPTIONS: { id: string; label: string; bg: string; border: string }[] = [
  { id: 'grey', label: 'Slate Grey', bg: '#6b7280', border: '#4b5563' },
  { id: 'red', label: 'Crimson', bg: '#ef4444', border: '#dc2626' },
  { id: 'blue', label: 'Royal Blue', bg: '#3b82f6', border: '#2563eb' },
  { id: 'green', label: 'Emerald', bg: '#10b981', border: '#059669' },
  { id: 'black', label: 'Pitch Black', bg: '#111827', border: '#000000' },
];

const ROTATION_PRESETS = [
  { label: '0° Flat', angle: 0 },
  { label: '45° Up', angle: 45 },
  { label: '-45° Down', angle: -45 },
  { label: '90° Vert', angle: 90 },
];

export const WatermarkTool: React.FC<WatermarkToolProps> = ({
  watermarkSettings,
  onWatermarkSettingsChange,
  isProcessing,
  onProcess,
}) => {
  const currentAngle = typeof watermarkSettings.rotation === 'number' ? watermarkSettings.rotation : 45;
  const currentFontSize = typeof watermarkSettings.fontSize === 'number' && watermarkSettings.fontSize > 0 ? watermarkSettings.fontSize : 48;
  const currentOpacity = typeof watermarkSettings.opacity === 'number' ? watermarkSettings.opacity : 0.25;
  const currentColor = watermarkSettings.color || 'grey';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {/* Header */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <h4 style={{ fontSize: '15px', fontWeight: 700, margin: 0, color: 'var(--text-primary)' }}>
            Watermark Settings
          </h4>
          <span
            className="badge badge-privacy"
            style={{ fontSize: '10px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
          >
            <Sparkles size={10} /> Live Preview
          </span>
        </div>
        <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: '4px 0 0 0' }}>
          Watermarks are mathematically centered and rendered locally.
        </p>
      </div>

      {/* Watermark Text Input */}
      <div>
        <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)' }}>
          Watermark Text
        </label>
        <input
          type="text"
          placeholder="e.g. CONFIDENTIAL"
          value={watermarkSettings.text}
          onChange={(e) => onWatermarkSettingsChange({ ...watermarkSettings, text: e.target.value })}
          style={{
            width: '100%',
            padding: '8px 12px',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border-medium)',
            background: 'var(--bg-tertiary)',
            color: 'var(--text-primary)',
            marginTop: '6px',
            fontSize: '13px',
            fontWeight: 600,
            letterSpacing: '0.02em',
          }}
        />

        {/* Quick Text Chips */}
        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginTop: '8px' }}>
          {PRESET_TEXTS.map((txt) => (
            <button
              key={txt}
              type="button"
              onClick={() => onWatermarkSettingsChange({ ...watermarkSettings, text: txt })}
              className="btn btn-secondary btn-sm"
              style={{
                fontSize: '10.5px',
                padding: '2px 8px',
                borderRadius: 'var(--radius-full)',
                background: watermarkSettings.text === txt ? 'var(--accent-subtle)' : undefined,
                color: watermarkSettings.text === txt ? 'var(--accent-primary)' : undefined,
                borderColor: watermarkSettings.text === txt ? 'var(--accent-primary)' : undefined,
              }}
            >
              {txt}
            </button>
          ))}
        </div>
      </div>

      {/* Font Size Slider */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)' }}>
            Font Size
          </label>
          <span style={{ fontSize: '12px', fontFamily: 'var(--font-mono)', fontWeight: 600, color: 'var(--text-primary)' }}>
            {currentFontSize} pt
          </span>
        </div>
        <input
          type="range"
          min="16"
          max="96"
          step="2"
          value={currentFontSize}
          onChange={(e) =>
            onWatermarkSettingsChange({ ...watermarkSettings, fontSize: parseInt(e.target.value, 10) })
          }
          style={{ width: '100%', marginTop: '6px' }}
        />
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: 'var(--text-muted)', marginTop: '2px' }}>
          <span>16 pt</span>
          <span>48 pt</span>
          <span>96 pt</span>
        </div>
      </div>

      {/* Opacity Slider */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)' }}>
            Opacity
          </label>
          <span style={{ fontSize: '12px', fontFamily: 'var(--font-mono)', fontWeight: 600, color: 'var(--text-primary)' }}>
            {Math.round(currentOpacity * 100)}%
          </span>
        </div>
        <input
          type="range"
          min="0.05"
          max="0.80"
          step="0.05"
          value={currentOpacity}
          onChange={(e) =>
            onWatermarkSettingsChange({ ...watermarkSettings, opacity: parseFloat(e.target.value) })
          }
          style={{ width: '100%', marginTop: '6px' }}
        />
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: 'var(--text-muted)', marginTop: '2px' }}>
          <span>5% Subdued</span>
          <span>25% Balanced</span>
          <span>80% Bold</span>
        </div>
      </div>

      {/* Rotation Presets & Slider */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)' }}>
            Angle & Orientation
          </label>
          <span style={{ fontSize: '12px', fontFamily: 'var(--font-mono)', fontWeight: 600, color: 'var(--text-primary)' }}>
            {currentAngle}°
          </span>
        </div>

        {/* Quick Angle Chips */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '6px', marginTop: '6px', marginBottom: '8px' }}>
          {ROTATION_PRESETS.map((p) => {
            const isActive = currentAngle === p.angle;
            return (
              <button
                key={p.angle}
                type="button"
                onClick={() => onWatermarkSettingsChange({ ...watermarkSettings, rotation: p.angle })}
                className="btn btn-secondary btn-sm"
                style={{
                  fontSize: '11px',
                  padding: '4px 6px',
                  justifyContent: 'center',
                  background: isActive ? 'var(--accent-subtle)' : undefined,
                  color: isActive ? 'var(--accent-primary)' : undefined,
                  borderColor: isActive ? 'var(--accent-primary)' : undefined,
                  fontWeight: isActive ? 700 : 500,
                }}
              >
                {p.label}
              </button>
            );
          })}
        </div>

        <input
          type="range"
          min="-90"
          max="90"
          step="5"
          value={currentAngle}
          onChange={(e) =>
            onWatermarkSettingsChange({ ...watermarkSettings, rotation: parseInt(e.target.value, 10) })
          }
          style={{ width: '100%' }}
        />
      </div>

      {/* Color Palette */}
      <div>
        <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: '8px' }}>
          Watermark Color
        </label>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '8px' }}>
          {COLOR_OPTIONS.map((c) => {
            const isSelected = currentColor === c.id;
            return (
              <button
                key={c.id}
                type="button"
                title={c.label}
                onClick={() => onWatermarkSettingsChange({ ...watermarkSettings, color: c.id })}
                style={{
                  height: '34px',
                  borderRadius: 'var(--radius-md)',
                  background: c.bg,
                  border: isSelected ? '2px solid var(--text-primary)' : `1px solid ${c.border}`,
                  outline: isSelected ? '2px solid var(--accent-primary)' : 'none',
                  outlineOffset: '2px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#ffffff',
                  transition: 'all 0.15s ease',
                }}
              >
                {isSelected && <Check size={14} strokeWidth={3} />}
              </button>
            );
          })}
        </div>
      </div>

      {/* Page Target Selection */}
      <div>
        <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>
          Target Pages
        </label>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
          <button
            type="button"
            onClick={() => onWatermarkSettingsChange({ ...watermarkSettings, pages: 'all' })}
            className="btn btn-secondary btn-sm"
            style={{
              justifyContent: 'center',
              background: watermarkSettings.pages === 'all' ? 'var(--accent-subtle)' : undefined,
              color: watermarkSettings.pages === 'all' ? 'var(--accent-primary)' : undefined,
              borderColor: watermarkSettings.pages === 'all' ? 'var(--accent-primary)' : undefined,
              fontWeight: watermarkSettings.pages === 'all' ? 700 : 500,
            }}
          >
            All Pages
          </button>
          <button
            type="button"
            onClick={() => onWatermarkSettingsChange({ ...watermarkSettings, pages: 'custom' })}
            className="btn btn-secondary btn-sm"
            style={{
              justifyContent: 'center',
              background: watermarkSettings.pages === 'custom' ? 'var(--accent-subtle)' : undefined,
              color: watermarkSettings.pages === 'custom' ? 'var(--accent-primary)' : undefined,
              borderColor: watermarkSettings.pages === 'custom' ? 'var(--accent-primary)' : undefined,
              fontWeight: watermarkSettings.pages === 'custom' ? 700 : 500,
            }}
          >
            Custom Range
          </button>
        </div>

        {watermarkSettings.pages === 'custom' && (
          <input
            type="text"
            placeholder="e.g. 1, 3, 5-10"
            value={watermarkSettings.customPages || ''}
            onChange={(e) => onWatermarkSettingsChange({ ...watermarkSettings, customPages: e.target.value })}
            style={{
              width: '100%',
              padding: '6px 10px',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-medium)',
              background: 'var(--bg-tertiary)',
              color: 'var(--text-primary)',
              marginTop: '6px',
              fontSize: '12px',
            }}
          />
        )}
      </div>

      {/* Primary Export Button */}
      <button
        type="button"
        onClick={onProcess}
        disabled={isProcessing || !watermarkSettings.text.trim()}
        className="btn btn-primary"
        style={{
          width: '100%',
          marginTop: '6px',
          padding: '10px 16px',
          fontWeight: 700,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '8px',
        }}
      >
        <Download size={16} />
        <span>{isProcessing ? 'Watermarking PDF…' : 'Apply Watermark & Export'}</span>
      </button>
    </div>
  );
};
