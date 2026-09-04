import React from 'react';
import { 
  FileText, 
  Search, 
  Moon, 
  Sun, 
  ShieldCheck, 
  Settings as SettingsIcon,
  Sparkles,
  Layers,
  GitCompare,
  BookOpen
} from 'lucide-react';

interface HeaderProps {
  currentTheme: 'dark' | 'light' | 'system';
  onToggleTheme: () => void;
  onOpenCommandPalette: () => void;
  onOpenSettings: () => void;
  onOpenBatch: () => void;
  onOpenCompare: () => void;
  onOpenAiStudio: () => void;
  onOpenDocs: () => void;
  onNavigateHome: () => void;
}

const GithubIcon: React.FC<{ size?: number }> = ({ size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
    <path d="M9 18c-4.51 2-5-2-7-2" />
  </svg>
);

export const Header: React.FC<HeaderProps> = ({
  currentTheme,
  onToggleTheme,
  onOpenCommandPalette,
  onOpenSettings,
  onOpenBatch,
  onOpenCompare,
  onOpenAiStudio,
  onOpenDocs,
  onNavigateHome,
}) => {
  return (
    <header className="glass-panel" style={{
      position: 'sticky',
      top: 0,
      zIndex: 50,
      borderRadius: 0,
      borderTop: 'none',
      borderLeft: 'none',
      borderRight: 'none',
      padding: '12px 24px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
    }}>
      {/* Brand & Logo */}
      <div 
        onClick={onNavigateHome}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          cursor: 'pointer',
          userSelect: 'none',
        }}
      >
        <div style={{
          width: '38px',
          height: '38px',
          borderRadius: '10px',
          background: 'var(--accent-gradient)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 4px 12px rgba(99, 102, 241, 0.4)',
        }}>
          <FileText size={22} color="#ffffff" strokeWidth={2.2} />
        </div>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{
              fontFamily: 'var(--font-heading)',
              fontWeight: 800,
              fontSize: '20px',
              letterSpacing: '-0.02em',
              background: 'var(--accent-gradient)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}>
              ErgonPDF
            </span>
            <span className="badge badge-accent" style={{ fontSize: '11px', padding: '1px 6px' }}>
              v1.0 OSS
            </span>
          </div>
          <p style={{ fontSize: '11px', color: 'var(--text-muted)', lineHeight: 1 }}>
            Privacy-First PDF Workspace
          </p>
        </div>
      </div>

      {/* Navigation Links */}
      <nav style={{ display: 'flex', alignItems: 'center', gap: '6px' }} className="desktop-nav">
        <button 
          onClick={onNavigateHome}
          className="btn btn-ghost btn-sm"
        >
          Tools
        </button>
        <button 
          onClick={onOpenAiStudio}
          className="btn btn-ghost btn-sm"
          style={{ display: 'flex', alignItems: 'center', gap: '5px' }}
        >
          <Sparkles size={14} color="#8b5cf6" />
          <span>AI Studio</span>
        </button>
        <button 
          onClick={onOpenBatch}
          className="btn btn-ghost btn-sm"
          style={{ display: 'flex', alignItems: 'center', gap: '5px' }}
        >
          <Layers size={14} />
          <span>Batch Queue</span>
        </button>
        <button 
          onClick={onOpenCompare}
          className="btn btn-ghost btn-sm"
          style={{ display: 'flex', alignItems: 'center', gap: '5px' }}
        >
          <GitCompare size={14} />
          <span>Compare</span>
        </button>
        <button 
          onClick={onOpenDocs}
          className="btn btn-ghost btn-sm"
          style={{ display: 'flex', alignItems: 'center', gap: '5px' }}
        >
          <BookOpen size={14} />
          <span>Docs & API</span>
        </button>
      </nav>

      {/* Action Controls & Badges */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        {/* Command Search Bar Trigger */}
        <button 
          onClick={onOpenCommandPalette}
          className="btn btn-secondary btn-sm"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '6px 12px',
            color: 'var(--text-secondary)',
          }}
          title="Search tools or intent (Ctrl + K)"
        >
          <Search size={14} />
          <span style={{ fontSize: '13px' }}>Quick Search…</span>
          <kbd style={{
            fontSize: '10px',
            fontFamily: 'var(--font-mono)',
            padding: '2px 5px',
            background: 'var(--bg-elevated)',
            border: '1px solid var(--border-medium)',
            borderRadius: '4px',
            color: 'var(--text-muted)',
          }}>
            ⌘K
          </kbd>
        </button>

        {/* Local Processing Badge */}
        <div 
          className="badge badge-privacy"
          title="Documents are processed completely inside your browser using WebAssembly & Web Workers. Zero server upload."
        >
          <ShieldCheck size={13} />
          <span>Local Only</span>
        </div>

        {/* Theme Switcher */}
        <button 
          onClick={onToggleTheme}
          className="btn btn-ghost btn-icon"
          title={`Switch to ${currentTheme === 'dark' ? 'Light' : 'Dark'} mode`}
          aria-label="Toggle theme"
        >
          {currentTheme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
        </button>

        {/* Settings Button */}
        <button 
          onClick={onOpenSettings}
          className="btn btn-ghost btn-icon"
          title="Workspace Settings"
          aria-label="Settings"
        >
          <SettingsIcon size={18} />
        </button>

        {/* GitHub Link */}
        <a 
          href="https://github.com/ergonpdf/ergonpdf" 
          target="_blank" 
          rel="noopener noreferrer"
          className="btn btn-ghost btn-icon"
          title="Open Source Repository on GitHub"
          aria-label="GitHub Repository"
        >
          <GithubIcon size={18} />
        </a>
      </div>
    </header>
  );
};
