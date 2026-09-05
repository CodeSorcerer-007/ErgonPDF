import React, { useState, useRef } from 'react';
import { 
  FileUp, 
  Search, 
  Sparkles, 
  Lock, 
  Zap, 
  Scissors, 
  Layers, 
  PenTool, 
  FileText 
} from 'lucide-react';

interface HeroDropzoneProps {
  onFilesSelected: (files: File[]) => void;
  onQuickIntent: (intent: string) => void;
}

export const HeroDropzone: React.FC<HeroDropzoneProps> = ({
  onFilesSelected,
  onQuickIntent,
}) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const filesArray = Array.from(e.dataTransfer.files);
      onFilesSelected(filesArray);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const filesArray = Array.from(e.target.files);
      onFilesSelected(filesArray);
    }
  };

  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      if (q.includes('merge') || q.includes('combine')) onQuickIntent('merge-pdf');
      else if (q.includes('compress') || q.includes('shrink') || q.includes('size')) onQuickIntent('compress-pdf');
      else if (q.includes('split') || q.includes('extract')) onQuickIntent('split-pdf');
      else if (q.includes('sign')) onQuickIntent('sign-pdf');
      else if (q.includes('protect') || q.includes('encrypt') || q.includes('lock')) onQuickIntent('protect-pdf');
      else if (q.includes('word')) onQuickIntent('pdf-to-word');
      else if (q.includes('ocr')) onQuickIntent('ocr-pdf');
      else onQuickIntent(q);
    }
  };

  return (
    <div style={{
      maxWidth: '860px',
      margin: '0 auto',
      padding: '52px 24px 36px',
      textAlign: 'center',
    }}>
      {/* 1. THE EDITORIAL HERO */}
      <h1 style={{
        fontSize: 'clamp(38px, 6vw, 62px)',
        fontWeight: 400,
        fontFamily: 'var(--font-serif)',
        letterSpacing: '-0.015em',
        lineHeight: 1.12,
        color: 'var(--text-primary)',
        marginBottom: '14px',
      }}>
        Fast, lossless document tools for your workflow.
      </h1>

      <p style={{
        fontSize: 'clamp(15px, 2vw, 17px)',
        color: 'var(--text-secondary)',
        maxWidth: '580px',
        margin: '0 auto 28px',
        lineHeight: 1.5,
      }}>
        A private, browser-native suite for assembling, optimizing, and securing documents with zero server uploads.
      </p>

      {/* 2. DUAL INTENT SEARCH BAR */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        background: 'var(--bg-secondary)',
        border: '1px solid var(--border-subtle)',
        borderRadius: 'var(--radius-md)',
        padding: '8px 16px',
        maxWidth: '500px',
        margin: '0 auto 36px',
        boxShadow: 'var(--shadow-xs)',
      }}>
        <Search size={15} color="var(--text-muted)" style={{ marginRight: '10px', flexShrink: 0 }} />
        <input 
          type="text"
          placeholder="Type tool: 'merge', 'compress', 'split', 'sign'…"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyDown={handleSearchKeyDown}
          style={{
            border: 'none',
            background: 'transparent',
            outline: 'none',
            fontSize: '13.5px',
            color: 'var(--text-primary)',
            width: '100%',
          }}
        />
        <kbd style={{
          fontSize: '10.5px',
          fontFamily: 'var(--font-mono)',
          padding: '2px 6px',
          background: 'var(--bg-tertiary)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-sm)',
          color: 'var(--text-muted)',
          flexShrink: 0,
        }}>
          ↵ Enter
        </kbd>
      </div>

      {/* 3. FOCUSED WORKSPACE / PHYSICAL-SHEET DROPZONE */}
      <div 
        onDragEnter={handleDragEnter}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`paper-sheet-container ${isDragOver ? 'drag-active' : ''}`}
        style={{
          padding: '48px 32px',
          cursor: 'pointer',
          maxWidth: '720px',
          margin: '0 auto',
        }}
      >
        <input 
          ref={fileInputRef}
          type="file"
          multiple
          accept=".pdf,image/png,image/jpeg,image/webp"
          style={{ display: 'none' }}
          onChange={handleFileInputChange}
        />

        {/* Paper Sheet Icon Box */}
        <div style={{
          width: '54px',
          height: '68px',
          margin: '0 auto 18px',
          borderRadius: '4px',
          border: '1.5px solid var(--border-medium)',
          background: 'var(--bg-primary)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'var(--text-primary)',
          position: 'relative',
          boxShadow: 'var(--shadow-xs)',
          transition: 'transform var(--transition-fast)',
        }}>
          <FileText size={24} strokeWidth={1.5} />
        </div>

        <h3 style={{
          fontSize: '20px',
          fontFamily: 'var(--font-serif)',
          fontWeight: 400,
          marginBottom: '8px',
          color: 'var(--text-primary)',
        }}>
          {isDragOver ? 'Release to open in Workspace' : 'Drop your files here to start'}
        </h3>
        
        <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '18px' }}>
          or
        </p>

        {/* Button: Choose from Device */}
        <div style={{ marginBottom: '18px' }}>
          <button 
            type="button"
            className="btn btn-primary btn-sm"
            style={{
              padding: '8px 20px',
              borderRadius: 'var(--radius-sm)',
            }}
            onClick={(e) => {
              e.stopPropagation();
              fileInputRef.current?.click();
            }}
          >
            <FileUp size={14} strokeWidth={1.8} />
            <span>Choose from Device</span>
          </button>
        </div>

        {/* Physical Security Guarantee */}
        <p style={{
          fontSize: '11px',
          fontFamily: 'var(--font-mono)',
          color: 'var(--text-muted)',
          letterSpacing: '0.02em',
        }}>
          Encrypted • Processed locally in WebAssembly • Max 100MB
        </p>
      </div>

      {/* 4. QUICK ACTIONS BY INTENT */}
      <div style={{
        marginTop: '28px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '8px',
        flexWrap: 'wrap',
      }}>
        <span style={{
          fontSize: '11.5px',
          fontFamily: 'var(--font-mono)',
          color: 'var(--text-muted)',
          textTransform: 'uppercase',
          letterSpacing: '0.05em',
          marginRight: '4px',
        }}>
          Quick Actions:
        </span>

        <button 
          onClick={() => onQuickIntent('merge-pdf')}
          className="btn btn-secondary btn-sm"
          style={{ fontSize: '12px', padding: '4px 10px' }}
        >
          <Layers size={12} strokeWidth={1.5} />
          <span>Merge PDFs</span>
        </button>

        <button 
          onClick={() => onQuickIntent('split-pdf')}
          className="btn btn-secondary btn-sm"
          style={{ fontSize: '12px', padding: '4px 10px' }}
        >
          <Scissors size={12} strokeWidth={1.5} />
          <span>Split Pages</span>
        </button>

        <button 
          onClick={() => onQuickIntent('compress-pdf')}
          className="btn btn-secondary btn-sm"
          style={{ fontSize: '12px', padding: '4px 10px' }}
        >
          <Zap size={12} strokeWidth={1.5} />
          <span>Compress Lossless</span>
        </button>

        <button 
          onClick={() => onQuickIntent('sign-pdf')}
          className="btn btn-secondary btn-sm"
          style={{ fontSize: '12px', padding: '4px 10px' }}
        >
          <PenTool size={12} strokeWidth={1.5} />
          <span>Fill & Sign</span>
        </button>

        <button 
          onClick={() => onQuickIntent('protect-pdf')}
          className="btn btn-secondary btn-sm"
          style={{ fontSize: '12px', padding: '4px 10px' }}
        >
          <Lock size={12} strokeWidth={1.5} />
          <span>Protect</span>
        </button>

        <button 
          onClick={() => onQuickIntent('ai-chat')}
          className="btn btn-secondary btn-sm"
          style={{ fontSize: '12px', padding: '4px 10px' }}
        >
          <Sparkles size={12} strokeWidth={1.5} />
          <span>AI Studio</span>
        </button>
      </div>
    </div>
  );
};
