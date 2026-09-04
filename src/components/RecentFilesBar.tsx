import React from 'react';
import { Clock, FileText, Trash2 } from 'lucide-react';
import type { RecentFile } from '../types/pdf';

interface RecentFilesBarProps {
  recentFiles: RecentFile[];
  onSelectRecent: (file: RecentFile) => void;
  onClearRecents: () => void;
}

export const RecentFilesBar: React.FC<RecentFilesBarProps> = ({
  recentFiles,
  onSelectRecent,
  onClearRecents,
}) => {
  if (recentFiles.length === 0) return null;

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

  return (
    <div style={{
      maxWidth: '1200px',
      margin: '0 auto 28px',
      padding: '0 24px',
    }}>
      <div className="glass-panel" style={{
        padding: '16px 20px',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Clock size={16} color="var(--accent-primary)" />
            <span style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)' }}>
              Recent Workspace Documents
            </span>
            <span className="badge badge-muted" style={{ fontSize: '11px' }}>
              Stored locally on your device
            </span>
          </div>

          <button
            onClick={onClearRecents}
            className="btn btn-ghost btn-sm"
            style={{ fontSize: '12px', color: 'var(--text-muted)' }}
            title="Clear local file history"
          >
            <Trash2 size={13} />
            <span>Clear History</span>
          </button>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
          gap: '12px',
        }}>
          {recentFiles.map((file) => (
            <div
              key={file.id}
              onClick={() => onSelectRecent(file)}
              className="glass-card"
              style={{
                padding: '10px 12px',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                cursor: 'pointer',
              }}
            >
              <div style={{
                width: '38px',
                height: '46px',
                borderRadius: '6px',
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
                  <FileText size={20} color="var(--accent-primary)" />
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
                }}>
                  {file.name}
                </div>
                <div style={{
                  fontSize: '11px',
                  color: 'var(--text-muted)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  marginTop: '2px',
                }}>
                  <span>{file.lastAction}</span>
                  <span>•</span>
                  <span>{formatFileSize(file.size)}</span>
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
