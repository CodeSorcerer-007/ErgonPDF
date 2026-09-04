import React from 'react';
import { ShieldCheck, FileText } from 'lucide-react';

interface FooterProps {
  onOpenDocs: () => void;
  onOpenSettings: () => void;
}

const GithubIcon: React.FC<{ size?: number }> = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
    <path d="M9 18c-4.51 2-5-2-7-2" />
  </svg>
);

export const Footer: React.FC<FooterProps> = ({ onOpenDocs, onOpenSettings }) => {
  return (
    <footer style={{
      borderTop: '1px solid var(--border-subtle)',
      background: 'var(--bg-secondary)',
      padding: '40px 24px 32px',
      marginTop: 'auto',
    }}>
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        display: 'flex',
        flexDirection: 'column',
        gap: '24px',
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '16px',
        }}>
          {/* Brand */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '28px',
              height: '28px',
              borderRadius: '8px',
              background: 'var(--accent-gradient)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <FileText size={16} color="#ffffff" />
            </div>
            <div>
              <span style={{ fontWeight: 800, fontSize: '16px', letterSpacing: '-0.02em' }}>
                ErgonPDF
              </span>
              <span style={{ fontSize: '12px', color: 'var(--text-muted)', marginLeft: '8px' }}>
                Open-Source PDF Workspace
              </span>
            </div>
          </div>

          {/* Quick links */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '18px', fontSize: '13px', color: 'var(--text-secondary)' }}>
            <button onClick={onOpenDocs} className="btn btn-ghost btn-sm" style={{ padding: '4px 8px' }}>
              Architecture & API
            </button>
            <button onClick={onOpenSettings} className="btn btn-ghost btn-sm" style={{ padding: '4px 8px' }}>
              Settings & Privacy
            </button>
            <a 
              href="https://github.com/ergonpdf/ergonpdf" 
              target="_blank" 
              rel="noopener noreferrer"
              style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              <GithubIcon size={14} />
              <span>GitHub</span>
            </a>
          </div>
        </div>

        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '12px',
          paddingTop: '20px',
          borderTop: '1px solid var(--border-subtle)',
          fontSize: '12px',
          color: 'var(--text-muted)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <ShieldCheck size={14} color="#10b981" />
            <span>Zero Document Uploads • 100% In-Browser Local Execution • MIT Licensed</span>
          </div>

          <div>
            Built with meticulous attention to detail for users everywhere.
          </div>
        </div>
      </div>
    </footer>
  );
};
