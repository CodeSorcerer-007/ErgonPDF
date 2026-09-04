import React, { useState } from 'react';
import { X, ShieldCheck, Sun, Moon, Check, Trash2 } from 'lucide-react';
import { StorageService } from '../services/storageService';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentTheme: 'dark' | 'light' | 'system';
  onThemeChange: (theme: 'dark' | 'light' | 'system') => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  currentTheme,
  onThemeChange,
}) => {
  const [defaultDpi, setDefaultDpi] = useState('150');
  const [cacheCleared, setCacheCleared] = useState(false);

  if (!isOpen) return null;

  const handleClearCache = () => {
    StorageService.clearRecentFiles();
    setCacheCleared(true);
    setTimeout(() => setCacheCleared(false), 2000);
  };

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      zIndex: 110,
      background: 'rgba(0, 0, 0, 0.65)',
      backdropFilter: 'blur(8px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px',
    }} onClick={onClose}>
      <div className="glass-panel animate-scale-in" style={{
        width: '100%',
        maxWidth: '560px',
        background: 'var(--bg-secondary)',
        borderRadius: 'var(--radius-lg)',
        boxShadow: 'var(--shadow-xl)',
        overflow: 'hidden',
      }} onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div style={{
          padding: '16px 20px',
          borderBottom: '1px solid var(--border-subtle)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          <div>
            <h3 style={{ fontSize: '18px', fontWeight: 700 }}>Workspace Settings</h3>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
              Configure preferences, processing quality, and privacy controls.
            </p>
          </div>
          <button onClick={onClose} className="btn btn-ghost btn-icon">
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Theme Selector */}
          <div>
            <label style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)', display: 'block', marginBottom: '8px' }}>
              Color Theme
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <button
                onClick={() => onThemeChange('dark')}
                className="btn btn-secondary"
                style={{
                  border: currentTheme === 'dark' ? '2px solid var(--accent-primary)' : '1px solid var(--border-medium)',
                  background: currentTheme === 'dark' ? 'var(--accent-primary-light)' : 'var(--bg-tertiary)',
                  padding: '12px',
                  justifyContent: 'flex-start',
                }}
              >
                <Moon size={16} />
                <span>Dark Obsidian</span>
              </button>

              <button
                onClick={() => onThemeChange('light')}
                className="btn btn-secondary"
                style={{
                  border: currentTheme === 'light' ? '2px solid var(--accent-primary)' : '1px solid var(--border-medium)',
                  background: currentTheme === 'light' ? 'var(--accent-primary-light)' : 'var(--bg-tertiary)',
                  padding: '12px',
                  justifyContent: 'flex-start',
                }}
              >
                <Sun size={16} />
                <span>Light Slate</span>
              </button>
            </div>
          </div>

          {/* Quality Defaults */}
          <div>
            <label style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)', display: 'block', marginBottom: '8px' }}>
              Default Rendering & Export DPI
            </label>
            <select
              value={defaultDpi}
              onChange={(e) => setDefaultDpi(e.target.value)}
              style={{
                width: '100%',
                padding: '10px 14px',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-medium)',
                background: 'var(--bg-tertiary)',
                color: 'var(--text-primary)',
                outline: 'none',
              }}
            >
              <option value="72">72 DPI — Screen Viewing (Smallest Size)</option>
              <option value="150">150 DPI — Balanced / Standard Digital (Recommended)</option>
              <option value="300">300 DPI — High-Resolution Print Quality</option>
            </select>
          </div>

          {/* Privacy Audit Card */}
          <div className="glass-card" style={{ padding: '14px 16px', background: 'var(--bg-tertiary)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
              <ShieldCheck size={16} color="#10b981" />
              <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)' }}>
                Privacy & Data Security Status
              </span>
            </div>
            <p style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
              All PDF mutations, conversions, signature placements, OCR, and heuristic analyses run directly in your browser's WebAssembly sandbox. No document content is uploaded to any server.
            </p>
          </div>

          {/* Data Cleanup */}
          <div>
            <label style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)', display: 'block', marginBottom: '6px' }}>
              Local History & Storage
            </label>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                Recent file names and thumbnails stored in localStorage
              </span>
              <button
                onClick={handleClearCache}
                className="btn btn-secondary btn-sm"
              >
                {cacheCleared ? (
                  <>
                    <Check size={14} color="var(--success)" />
                    <span>Cleared!</span>
                  </>
                ) : (
                  <>
                    <Trash2 size={14} />
                    <span>Clear Recents</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div style={{
          padding: '12px 20px',
          borderTop: '1px solid var(--border-subtle)',
          display: 'flex',
          justifyContent: 'flex-end',
          background: 'var(--bg-tertiary)',
        }}>
          <button onClick={onClose} className="btn btn-primary btn-sm">
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
