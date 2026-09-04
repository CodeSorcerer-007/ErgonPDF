import React, { useState, useRef } from 'react';
import { Upload, FileUp, Sparkles, ShieldCheck, Zap } from 'lucide-react';

interface HeroDropzoneProps {
  onFilesSelected: (files: File[]) => void;
  onQuickIntent: (intent: string) => void;
}

export const HeroDropzone: React.FC<HeroDropzoneProps> = ({
  onFilesSelected,
  onQuickIntent,
}) => {
  const [isDragOver, setIsDragOver] = useState(false);
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

  return (
    <div style={{
      maxWidth: '920px',
      margin: '0 auto',
      padding: '48px 24px 32px',
      textAlign: 'center',
    }}>
      {/* Privacy Guarantee Pill */}
      <div style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '8px',
        padding: '6px 14px',
        borderRadius: 'var(--radius-full)',
        background: 'var(--accent-gradient-subtle)',
        border: '1px solid rgba(99, 102, 241, 0.25)',
        marginBottom: '20px',
        fontSize: '13px',
        fontWeight: 500,
        color: 'var(--text-primary)',
        boxShadow: 'var(--shadow-xs)',
      }}>
        <ShieldCheck size={16} color="#10b981" />
        <span>100% Client-Side Privacy: Your documents never leave your browser</span>
      </div>

      {/* Main Hero Headline */}
      <h1 style={{
        fontSize: 'clamp(32px, 5vw, 54px)',
        fontWeight: 800,
        letterSpacing: '-0.03em',
        marginBottom: '16px',
        lineHeight: 1.15,
      }}>
        Everything you need to{' '}
        <span style={{
          background: 'var(--accent-gradient)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
        }}>
          work with PDFs.
        </span>
      </h1>

      {/* Subtitle */}
      <p style={{
        fontSize: 'clamp(16px, 2vw, 19px)',
        color: 'var(--text-secondary)',
        maxWidth: '680px',
        margin: '0 auto 36px',
        lineHeight: 1.5,
      }}>
        Organize, edit, compress, sign, convert, and understand your documents with 
        zero server upload and lightning-fast local performance.
      </p>

      {/* Interactive Drop Zone Area */}
      <div 
        onDragEnter={handleDragEnter}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className="glass-panel"
        style={{
          padding: '52px 32px',
          border: isDragOver ? '2px dashed var(--accent-primary)' : '2px dashed var(--border-strong)',
          borderRadius: 'var(--radius-xl)',
          background: isDragOver ? 'var(--accent-primary-light)' : 'var(--bg-glass)',
          cursor: 'pointer',
          transition: 'all var(--transition-normal)',
          transform: isDragOver ? 'scale(1.015)' : 'scale(1)',
          boxShadow: isDragOver ? 'var(--accent-glow)' : 'var(--shadow-lg)',
          position: 'relative',
          overflow: 'hidden',
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

        {/* Floating Upload Silhouette & Animation */}
        <div style={{
          width: '76px',
          height: '76px',
          margin: '0 auto 20px',
          borderRadius: 'var(--radius-lg)',
          background: isDragOver ? 'var(--accent-primary)' : 'var(--bg-tertiary)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: isDragOver ? '#ffffff' : 'var(--accent-primary)',
          boxShadow: 'var(--shadow-md)',
          transition: 'all var(--transition-normal)',
        }}>
          {isDragOver ? (
            <FileUp size={38} className="animate-bounce" />
          ) : (
            <Upload size={38} />
          )}
        </div>

        <h3 style={{ fontSize: '22px', fontWeight: 700, marginBottom: '8px' }}>
          {isDragOver ? 'Release to open in Workspace' : 'Drop your PDF here'}
        </h3>
        
        <p style={{ fontSize: '14px', color: 'var(--text-muted)', marginBottom: '24px' }}>
          or <span style={{ color: 'var(--accent-primary)', fontWeight: 600, textDecoration: 'underline' }}>browse from your computer</span>
        </p>

        {/* Supported formats & drag hint */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '12px',
          flexWrap: 'wrap',
          fontSize: '12px',
          color: 'var(--text-muted)',
        }}>
          <span className="badge badge-muted">PDF</span>
          <span className="badge badge-muted">PNG / JPG / WebP</span>
          <span className="badge badge-muted">Multiple Files</span>
          <span className="badge badge-muted">Paste via Ctrl + V</span>
        </div>
      </div>

      {/* Smart Quick Intent Suggestions */}
      <div style={{
        marginTop: '28px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '10px',
        flexWrap: 'wrap',
      }}>
        <span style={{ fontSize: '13px', color: 'var(--text-muted)', fontWeight: 500 }}>
          Popular Actions:
        </span>

        <button 
          onClick={() => onQuickIntent('compress-pdf')}
          className="btn btn-secondary btn-sm"
          style={{ borderRadius: 'var(--radius-full)' }}
        >
          <Zap size={13} color="#f59e0b" />
          <span>Make PDF Smaller</span>
        </button>

        <button 
          onClick={() => onQuickIntent('merge-pdf')}
          className="btn btn-secondary btn-sm"
          style={{ borderRadius: 'var(--radius-full)' }}
        >
          <span>Merge Multiple Files</span>
        </button>

        <button 
          onClick={() => onQuickIntent('sign-pdf')}
          className="btn btn-secondary btn-sm"
          style={{ borderRadius: 'var(--radius-full)' }}
        >
          <span>Fill & Sign</span>
        </button>

        <button 
          onClick={() => onQuickIntent('ai-chat')}
          className="btn btn-secondary btn-sm"
          style={{ borderRadius: 'var(--radius-full)' }}
        >
          <Sparkles size={13} color="#8b5cf6" />
          <span>AI Summarize & Chat</span>
        </button>
      </div>
    </div>
  );
};
