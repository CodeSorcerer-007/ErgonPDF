import React from 'react';
import { Clock, FileText, Trash2 } from 'lucide-react';
import type { RecentFile } from '../types/pdf';

interface RecentFilesBarProps {
  recentFiles: RecentFile[];
  onSelectRecent: (file: RecentFile) => void;
  onClearRecents: () => void;
}

const formatTimeAgo = (timestamp: number) => {
  const diffSec = Math.floor((Date.now() - timestamp) / 1000);
  if (diffSec < 60) return 'Just now';
  if (diffSec < 3600) return `${Math.floor(diffSec / 60)}m ago`;
  if (diffSec < 86400) return `${Math.floor(diffSec / 3600)}h ago`;
  return `${Math.floor(diffSec / 86400)}d ago`;
};

const formatFileSize = (bytes: number) => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

export const RecentFilesBar: React.FC<RecentFilesBarProps> = ({
  recentFiles,
  onSelectRecent,
  onClearRecents,
}) => {
  if (recentFiles.length === 0) return null;

  return (
    <div style={{
      maxWidth: '1200px',
      margin: '0 auto 36px',
      padding: '0 24px',
    }}>
      <div style={{
        background: 'var(--bg-card)',
        border: '1px solid var(--border-subtle)',
        borderRadius: 'var(--radius-lg)',
        padding: '16px 20px',
        display: 'flex',
        flexDirection: 'column',
        gap: '14px',
        boxShadow: 'var(--shadow-xs)',
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '24px',
              height: '24px',
              borderRadius: 'var(--radius-sm)',
              background: 'var(--bg-tertiary)',
              border: '1px solid var(--border-subtle)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--accent-primary)',
            }}>
              <Clock size={14} strokeWidth={1.75} />
            </div>
            <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)', letterSpacing: '-0.01em' }}>
              Recent Workspace Documents
            </span>
            <span className="badge badge-muted" style={{ fontSize: '11px', fontFamily: 'var(--font-mono)' }}>
              stored locally
            </span>
          </div>

          <button
            onClick={onClearRecents}
            className="btn btn-ghost btn-sm"
            style={{ fontSize: '12px', color: 'var(--text-muted)' }}
            title="Clear local file history"
          >
            <Trash2 size={13} strokeWidth={1.5} />
            <span>Clear History</span>
          </button>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
          gap: '10px',
        }}>
          {recentFiles.map((file) => (
            <div
              key={file.id}
              onClick={() => onSelectRecent(file)}
              className="interactive-card"
              style={{
                padding: '10px 14px',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                cursor: 'pointer',
                background: 'var(--bg-card)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-md)',
                transition: 'var(--transition-fast)',
              }}
            >
              <div style={{
                width: '36px',
                height: '46px',
                borderRadius: 'var(--radius-sm)',
                background: 'var(--bg-tertiary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                overflow: 'hidden',
                flexShrink: 0,
                border: '1px solid var(--border-subtle)',
              }}>
                {file.thumbnailUrl ? (
                  <img 
                    src={file.thumbnailUrl} 
                    alt={file.name} 
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                  />
                ) : (
                  <FileText size={18} strokeWidth={1.5} color="var(--text-secondary)" />
                )}
              </div>

              <div style={{ minWidth: 0, flex: 1 }}>
                <div style={{
                  fontSize: '13px',
                  fontWeight: 600,
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  color: 'var(--text-primary)',
                  letterSpacing: '-0.01em',
                }}>
                  {file.name}
                </div>
                <div style={{
                  fontSize: '11px',
                  color: 'var(--text-muted)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  marginTop: '3px',
                }}>
                  <span style={{ color: 'var(--accent-primary)', fontWeight: 500 }}>{file.lastAction}</span>
                  <span>•</span>
                  <span style={{ fontFamily: 'var(--font-mono)' }}>{formatFileSize(file.size)}</span>
                  <span>•</span>
                  <span>{formatTimeAgo(file.timestamp)}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
