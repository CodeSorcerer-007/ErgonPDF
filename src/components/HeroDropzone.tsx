import React, { useState, useRef, useEffect, useMemo } from 'react';
import { 
  FileUp, 
  Sparkles, 
  Lock, 
  Zap, 
  Scissors, 
  Layers, 
  PenTool, 
  FileText, 
  AlertTriangle, 
  AlertCircle, 
  ShieldCheck, 
  X, 
  ArrowRight,
  Search,
  ScanText,
  Table,
  Stamp,
  Image as ImageIcon,
  Shuffle,
  Hash,
  EyeOff
} from 'lucide-react';
import { TOOLS_REGISTRY } from '../config/toolsRegistry';

interface HeroDropzoneProps {
  onFilesSelected: (files: File[], targetToolId?: string) => void;
  onQuickIntent: (intent: string) => void;
  isIngesting?: boolean;
}

export const HeroDropzone: React.FC<HeroDropzoneProps> = ({
  onFilesSelected,
  onQuickIntent,
  isIngesting = false,
}) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const [stagedFiles, setStagedFiles] = useState<File[] | null>(null);
  const [stagedSearch, setStagedSearch] = useState('');
  const [warningMessage, setWarningMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const matchedTools = useMemo(() => {
    if (!stagedSearch.trim()) return [];
    const q = stagedSearch.toLowerCase().trim();
    return TOOLS_REGISTRY.filter((t) => 
      t.name.toLowerCase().includes(q) ||
      t.description.toLowerCase().includes(q) ||
      t.intents.some((i) => i.toLowerCase().includes(q))
    ).slice(0, 6);
  }, [stagedSearch]);

  // Keyboard navigation when a file is staged
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!stagedFiles) return;
      if (e.key === 'Enter') {
        e.preventDefault();
        if (matchedTools.length > 0) {
          onFilesSelected(stagedFiles, matchedTools[0].id);
        } else if (stagedFiles.length > 1) {
          onFilesSelected(stagedFiles, 'merge-pdf');
        } else if (stagedFiles[0].type.startsWith('image/')) {
          onFilesSelected(stagedFiles, 'organize');
        } else {
          onFilesSelected(stagedFiles, 'organize');
        }
        setStagedFiles(null);
        setStagedSearch('');
      } else if (e.key === 'Escape') {
        e.preventDefault();
        setStagedFiles(null);
        setStagedSearch('');
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [stagedFiles, matchedTools, onFilesSelected]);

  const processIncomingFiles = (filesArray: File[]) => {
    setErrorMessage(null);
    setWarningMessage(null);

    if (filesArray.length === 0) return;

    const validExtensions = ['.pdf', '.png', '.jpg', '.jpeg', '.webp', '.tiff', '.tif', '.svg', '.bmp'];
    const validFiles: File[] = [];
    const invalidFiles: File[] = [];

    for (const f of filesArray) {
      const lastDot = f.name.lastIndexOf('.');
      const ext = lastDot !== -1 ? f.name.slice(lastDot).toLowerCase() : '';
      const isPdfOrImage = f.type === 'application/pdf' || f.type.startsWith('image/') || validExtensions.includes(ext);
      if (isPdfOrImage) {
        validFiles.push(f);
      } else {
        invalidFiles.push(f);
      }
    }

    if (invalidFiles.length > 0) {
      setErrorMessage(
        `Unsupported file type (${invalidFiles.map(f => f.name).join(', ')}). ErgonPDF supports PDF documents and image formats locally.`
      );
      if (validFiles.length === 0) return;
    }

    const largeFile = validFiles.find((f) => f.size > 50 * 1024 * 1024);
    if (largeFile) {
      const sizeMb = (largeFile.size / (1024 * 1024)).toFixed(1);
      setWarningMessage(
        `Large file detected (${largeFile.name}, ${sizeMb} MB). Processing executes in local WebAssembly memory without server upload.`
      );
    }

    // Stage files for 1-click intent selection
    setStagedFiles(validFiles);
  };

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
      processIncomingFiles(filesArray);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const filesArray = Array.from(e.target.files);
      processIncomingFiles(filesArray);
    }
  };

  return (
    <div style={{
      maxWidth: '860px',
      margin: '0 auto',
      padding: '48px 24px 32px',
      textAlign: 'center',
    }}>
      {/* 1. THE EDITORIAL HERO */}
      <h1 style={{
        fontSize: 'clamp(32px, 5vw, 54px)',
        fontWeight: 600,
        fontFamily: 'var(--font-heading)',
        letterSpacing: '-0.025em',
        lineHeight: 1.15,
        color: 'var(--text-primary)',
        marginBottom: '16px',
      }}>
        Fast, lossless document tools for your workflow.
      </h1>

      <p style={{
        fontSize: 'clamp(15px, 1.8vw, 17px)',
        color: 'var(--text-secondary)',
        maxWidth: '580px',
        margin: '0 auto 36px',
        lineHeight: 1.6,
      }}>
        A private, browser-native suite for assembling, optimizing, and securing documents with zero server uploads.
      </p>

      {/* Error & Large File Banners */}
      {errorMessage && (
        <div className="file-error-banner" style={{ maxWidth: '720px', margin: '0 auto 16px' }} role="alert">
          <AlertCircle size={16} style={{ flexShrink: 0 }} />
          <span style={{ flex: 1 }}>{errorMessage}</span>
          <button 
            type="button" 
            onClick={() => setErrorMessage(null)} 
            className="btn btn-ghost btn-icon" 
            style={{ padding: '2px', color: 'inherit' }}
            aria-label="Dismiss error"
          >
            <X size={14} />
          </button>
        </div>
      )}

      {warningMessage && (
        <div className="file-warning-banner" style={{ maxWidth: '720px', margin: '0 auto 16px' }} role="status">
          <AlertTriangle size={16} style={{ flexShrink: 0 }} />
          <span style={{ flex: 1 }}>{warningMessage}</span>
          <button 
            type="button" 
            onClick={() => setWarningMessage(null)} 
            className="btn btn-ghost btn-icon" 
            style={{ padding: '2px', color: 'inherit' }}
            aria-label="Dismiss warning"
          >
            <X size={14} />
          </button>
        </div>
      )}

      {/* 2. DYNAMIC WORKSPACE DROPZONE / 1-CLICK ACTION STAGE */}
      {stagedFiles && stagedFiles.length > 0 ? (() => {
        const isMultiple = stagedFiles.length > 1;
        const isImage = !isMultiple && (stagedFiles[0].type.startsWith('image/') || /\.(png|jpe?g|webp|svg|tiff?|bmp)$/i.test(stagedFiles[0].name));
        const totalSizeBytes = stagedFiles.reduce((acc, f) => acc + f.size, 0);
        const totalSizeFormatted = totalSizeBytes < 1024 * 1024 
          ? `${(totalSizeBytes / 1024).toFixed(1)} KB` 
          : `${(totalSizeBytes / (1024 * 1024)).toFixed(2)} MB`;

        return (
          <div className="staged-file-card" style={{ maxWidth: '740px', margin: '0 auto' }}>
            {/* Header: File info & Change button */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              borderBottom: '1px solid var(--border-subtle)',
              paddingBottom: '14px',
              marginBottom: '16px',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: 0 }}>
                <div style={{
                  width: '42px',
                  height: '42px',
                  borderRadius: 'var(--radius-sm)',
                  background: 'var(--accent-primary-light)',
                  color: 'var(--accent-primary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}>
                  {isMultiple ? (
                    <Layers size={22} strokeWidth={1.8} />
                  ) : isImage ? (
                    <ImageIcon size={22} strokeWidth={1.8} />
                  ) : (
                    <FileText size={22} strokeWidth={1.8} />
                  )}
                </div>
                <div style={{ minWidth: 0 }}>
                  <div style={{
                    fontSize: '15px',
                    fontWeight: 600,
                    color: 'var(--text-primary)',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    maxWidth: '420px',
                  }}>
                    {isMultiple ? `${stagedFiles.length} Documents Selected` : stagedFiles[0].name}
                  </div>
                  <div style={{
                    fontSize: '12px',
                    color: 'var(--text-muted)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    marginTop: '2px',
                  }}>
                    <span style={{ fontFamily: 'var(--font-mono)' }}>
                      {totalSizeFormatted}
                    </span>
                    <span>•</span>
                    <span className="badge badge-privacy" style={{ fontSize: '10px' }}>
                      100% In-Memory
                    </span>
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  setStagedFiles(null);
                  setStagedSearch('');
                }}
                className="btn btn-ghost btn-sm"
                style={{ color: 'var(--text-muted)' }}
                title="Change selected file"
              >
                <X size={14} />
                <span>Change</span>
              </button>
            </div>

            {/* Instant In-Card Search for any of the 134 tools */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              background: 'var(--bg-secondary)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-md)',
              padding: '7px 12px',
              marginBottom: '14px',
            }}>
              <Search size={14} color="var(--text-muted)" style={{ flexShrink: 0 }} />
              <input
                type="text"
                value={stagedSearch}
                onChange={(e) => setStagedSearch(e.target.value)}
                placeholder="Search all 134 tools for this document… (or choose below)"
                aria-label="Filter tools for staged document"
                style={{
                  border: 'none',
                  background: 'transparent',
                  outline: 'none',
                  fontSize: '12.5px',
                  color: 'var(--text-primary)',
                  width: '100%',
                }}
              />
              {stagedSearch && (
                <button
                  type="button"
                  onClick={() => setStagedSearch('')}
                  className="btn btn-ghost btn-icon"
                  style={{ padding: '2px', color: 'var(--text-muted)' }}
                  aria-label="Clear search"
                >
                  <X size={13} />
                </button>
              )}
            </div>

            {/* Search Results if query exists */}
            {stagedSearch.trim() ? (
              <div>
                <div style={{
                  fontSize: '12px',
                  fontWeight: 600,
                  color: 'var(--text-secondary)',
                  marginBottom: '10px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}>
                  <span>Matching tools ({matchedTools.length}):</span>
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Click to launch immediately</span>
                </div>
                {matchedTools.length > 0 ? (
                  <div className="staged-action-grid">
                    {matchedTools.map((tool, idx) => (
                      <button
                        key={tool.id}
                        type="button"
                        onClick={() => {
                          onFilesSelected(stagedFiles, tool.id);
                          setStagedFiles(null);
                          setStagedSearch('');
                        }}
                        className={`staged-action-btn ${idx === 0 ? 'primary-action' : ''}`}
                      >
                        <div style={{ minWidth: 0, flex: 1 }}>
                          <div style={{ fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <span>{tool.name}</span>
                            {idx === 0 && <span style={{ fontSize: '10px', opacity: 0.8 }}>↵ Enter</span>}
                          </div>
                          <div style={{ fontSize: '11px', opacity: idx === 0 ? 0.9 : 0.7, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {tool.description}
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                ) : (
                  <div style={{ padding: '20px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '13px' }}>
                    No tools matching "{stagedSearch}". Press <kbd style={{ padding: '2px 6px', background: 'var(--bg-tertiary)', borderRadius: '4px' }}>Enter</kbd> to open in Full Studio.
                  </div>
                )}
              </div>
            ) : isMultiple ? (
              /* Multi-File Actions */
              <div>
                <div style={{
                  fontSize: '13px',
                  fontWeight: 500,
                  color: 'var(--text-secondary)',
                  marginBottom: '10px',
                }}>
                  Recommended multi-document actions:
                </div>
                <div className="staged-action-grid">
                  <button 
                    type="button" 
                    onClick={() => {
                      onFilesSelected(stagedFiles, 'merge-pdf');
                      setStagedFiles(null);
                    }}
                    className="staged-action-btn primary-action"
                  >
                    <Layers size={16} color="#ffffff" />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <span>Merge All PDFs</span>
                        <ArrowRight size={14} />
                      </div>
                      <div style={{ fontSize: '11px', opacity: 0.9 }}>Combine files in sequence (↵ Enter)</div>
                    </div>
                  </button>

                  <button 
                    type="button" 
                    onClick={() => {
                      onFilesSelected(stagedFiles, 'alternate-mix');
                      setStagedFiles(null);
                    }}
                    className="staged-action-btn"
                  >
                    <Shuffle size={16} color="var(--accent-primary)" />
                    <div>
                      <div style={{ fontWeight: 600 }}>Alternate & Mix</div>
                      <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Interleave spreads</div>
                    </div>
                  </button>

                  <button 
                    type="button" 
                    onClick={() => {
                      onQuickIntent('batch');
                      setStagedFiles(null);
                    }}
                    className="staged-action-btn"
                  >
                    <Zap size={16} color="var(--accent-primary)" />
                    <div>
                      <div style={{ fontWeight: 600 }}>Batch Optimize</div>
                      <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Compress in one pass</div>
                    </div>
                  </button>

                  <button 
                    type="button" 
                    onClick={() => {
                      onFilesSelected([stagedFiles[0]], 'organize');
                      setStagedFiles(null);
                    }}
                    className="staged-action-btn"
                  >
                    <Sparkles size={16} color="var(--accent-primary)" />
                    <div>
                      <div style={{ fontWeight: 600 }}>Open in Full Studio</div>
                      <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Precision workspace</div>
                    </div>
                  </button>
                </div>
              </div>
            ) : isImage ? (
              /* Image File Actions */
              <div>
                <div style={{
                  fontSize: '13px',
                  fontWeight: 500,
                  color: 'var(--text-secondary)',
                  marginBottom: '10px',
                }}>
                  Recommended image actions:
                </div>
                <div className="staged-action-grid">
                  <button 
                    type="button" 
                    onClick={() => {
                      onFilesSelected(stagedFiles, 'organize');
                      setStagedFiles(null);
                    }}
                    className="staged-action-btn primary-action"
                  >
                    <FileText size={16} color="#ffffff" />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <span>Convert to PDF</span>
                        <ArrowRight size={14} />
                      </div>
                      <div style={{ fontSize: '11px', opacity: 0.9 }}>Compile image into clean PDF (↵ Enter)</div>
                    </div>
                  </button>

                  <button 
                    type="button" 
                    onClick={() => {
                      onFilesSelected(stagedFiles, 'ocr-pdf');
                      setStagedFiles(null);
                    }}
                    className="staged-action-btn"
                  >
                    <ScanText size={16} color="var(--accent-primary)" />
                    <div>
                      <div style={{ fontWeight: 600 }}>Extract Text (OCR)</div>
                      <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Scan image text locally</div>
                    </div>
                  </button>

                  <button 
                    type="button" 
                    onClick={() => {
                      onQuickIntent('compress-images');
                      setStagedFiles(null);
                    }}
                    className="staged-action-btn"
                  >
                    <Zap size={16} color="var(--accent-primary)" />
                    <div>
                      <div style={{ fontWeight: 600 }}>Compress Image</div>
                      <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Lossless optimization</div>
                    </div>
                  </button>

                  <button 
                    type="button" 
                    onClick={() => {
                      onFilesSelected(stagedFiles, 'organize');
                      setStagedFiles(null);
                    }}
                    className="staged-action-btn"
                  >
                    <Sparkles size={16} color="var(--accent-primary)" />
                    <div>
                      <div style={{ fontWeight: 600 }}>Open in Studio</div>
                      <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>All 134 precision tools</div>
                    </div>
                  </button>
                </div>
              </div>
            ) : (
              /* Single PDF Actions */
              <div>
                <div style={{
                  fontSize: '13px',
                  fontWeight: 500,
                  color: 'var(--text-secondary)',
                  marginBottom: '10px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}>
                  <span>Select action for this PDF:</span>
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Instant 1-click launch</span>
                </div>

                <div className="staged-action-grid">
                  <button 
                    type="button" 
                    onClick={() => {
                      onFilesSelected(stagedFiles, 'compress-pdf');
                      setStagedFiles(null);
                    }}
                    className="staged-action-btn"
                  >
                    <Zap size={16} color="var(--accent-primary)" />
                    <div>
                      <div style={{ fontWeight: 600 }}>Compress Lossless</div>
                      <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Shrink file size locally</div>
                    </div>
                  </button>

                  <button 
                    type="button" 
                    onClick={() => {
                      onFilesSelected(stagedFiles, 'sign-pdf');
                      setStagedFiles(null);
                    }}
                    className="staged-action-btn"
                  >
                    <PenTool size={16} color="var(--accent-primary)" />
                    <div>
                      <div style={{ fontWeight: 600 }}>Fill & Sign</div>
                      <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Draw, type or photo signature</div>
                    </div>
                  </button>

                  <button 
                    type="button" 
                    onClick={() => {
                      onFilesSelected(stagedFiles, 'protect-pdf');
                      setStagedFiles(null);
                    }}
                    className="staged-action-btn"
                  >
                    <Lock size={16} color="var(--accent-primary)" />
                    <div>
                      <div style={{ fontWeight: 600 }}>Protect PDF</div>
                      <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>AES-256 password lock</div>
                    </div>
                  </button>

                  <button 
                    type="button" 
                    onClick={() => {
                      onFilesSelected(stagedFiles, 'pdf-to-word');
                      setStagedFiles(null);
                    }}
                    className="staged-action-btn"
                  >
                    <FileText size={16} color="var(--accent-primary)" />
                    <div>
                      <div style={{ fontWeight: 600 }}>Convert to Word</div>
                      <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Export genuine DOCX</div>
                    </div>
                  </button>

                  <button 
                    type="button" 
                    onClick={() => {
                      onFilesSelected(stagedFiles, 'split-pdf');
                      setStagedFiles(null);
                    }}
                    className="staged-action-btn"
                  >
                    <Scissors size={16} color="var(--accent-primary)" />
                    <div>
                      <div style={{ fontWeight: 600 }}>Split & Organize</div>
                      <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Rearrange or prune pages</div>
                    </div>
                  </button>

                  <button 
                    type="button" 
                    onClick={() => {
                      onFilesSelected(stagedFiles, 'organize');
                      setStagedFiles(null);
                    }}
                    className="staged-action-btn primary-action"
                  >
                    <Sparkles size={16} color="#ffffff" />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <span>Open in Full Studio</span>
                        <ArrowRight size={14} />
                      </div>
                      <div style={{ fontSize: '11px', opacity: 0.9 }}>All 134 precision tools (↵ Enter)</div>
                    </div>
                  </button>
                </div>

                {/* Quick 1-click utility pills */}
                <div style={{
                  marginTop: '14px',
                  paddingTop: '12px',
                  borderTop: '1px solid var(--border-subtle)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  flexWrap: 'wrap',
                }}>
                  <span style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                    More Utilities:
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      onFilesSelected(stagedFiles, 'ocr-pdf');
                      setStagedFiles(null);
                    }}
                    className="btn btn-secondary btn-sm"
                    style={{ fontSize: '11px', padding: '3px 8px' }}
                  >
                    <ScanText size={12} />
                    <span>OCR Text</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      onFilesSelected(stagedFiles, 'add-watermark');
                      setStagedFiles(null);
                    }}
                    className="btn btn-secondary btn-sm"
                    style={{ fontSize: '11px', padding: '3px 8px' }}
                  >
                    <Stamp size={12} />
                    <span>Watermark</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      onFilesSelected(stagedFiles, 'add-page-numbers');
                      setStagedFiles(null);
                    }}
                    className="btn btn-secondary btn-sm"
                    style={{ fontSize: '11px', padding: '3px 8px' }}
                  >
                    <Hash size={12} />
                    <span>Page Numbers</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      onFilesSelected(stagedFiles, 'redact-pdf');
                      setStagedFiles(null);
                    }}
                    className="btn btn-secondary btn-sm"
                    style={{ fontSize: '11px', padding: '3px 8px' }}
                  >
                    <EyeOff size={12} />
                    <span>Redact</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      onFilesSelected(stagedFiles, 'pdf-to-excel');
                      setStagedFiles(null);
                    }}
                    className="btn btn-secondary btn-sm"
                    style={{ fontSize: '11px', padding: '3px 8px' }}
                  >
                    <Table size={12} />
                    <span>Table to CSV</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      onFilesSelected(stagedFiles, 'pdf-to-images');
                      setStagedFiles(null);
                    }}
                    className="btn btn-secondary btn-sm"
                    style={{ fontSize: '11px', padding: '3px 8px' }}
                  >
                    <ImageIcon size={12} />
                    <span>To Images</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        );
      })() : (
        <div 
          role="region"
          aria-label="Document upload drop zone"
          aria-describedby="dropzone-instruction dropzone-guarantee"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              fileInputRef.current?.click();
            }
          }}
          onDragEnter={handleDragEnter}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`paper-sheet-container ${isDragOver ? 'drag-active' : ''}`}
          style={{
            padding: '44px 32px',
            cursor: 'pointer',
            maxWidth: '720px',
            margin: '0 auto',
          }}
        >
          <input 
            ref={fileInputRef}
            type="file"
            multiple
            accept=".pdf,image/png,image/jpeg,image/webp,image/gif,image/svg+xml,image/tiff,.bmp,.jpg"
            style={{ display: 'none' }}
            onChange={handleFileInputChange}
            aria-hidden="true"
          />

          {isIngesting ? (
            <div style={{ padding: '28px 0', textAlign: 'center' }}>
              <div className="progress-bar-track" style={{ maxWidth: '320px', margin: '0 auto 18px' }}>
                <div className="progress-bar-fill indeterminate" />
              </div>
              <h3 style={{
                fontSize: '17px',
                fontFamily: 'var(--font-heading)',
                fontWeight: 600,
                letterSpacing: '-0.015em',
                color: 'var(--text-primary)',
                marginBottom: '6px',
              }}>
                Ingesting document into local memory…
              </h3>
              <p style={{ fontSize: '12.5px', color: 'var(--text-muted)' }}>
                Inspecting PDF structure via WebAssembly • 100% offline
              </p>
            </div>
          ) : (
            <>
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

              <h3 id="dropzone-instruction" style={{
                fontSize: '18px',
                fontFamily: 'var(--font-heading)',
                fontWeight: 600,
                letterSpacing: '-0.015em',
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
                  aria-label="Choose PDF or image files from device"
                >
                  <FileUp size={14} strokeWidth={1.8} />
                  <span>Choose from Device</span>
                </button>
              </div>

              {/* Physical Security Guarantee */}
              <p id="dropzone-guarantee" style={{
                fontSize: '11px',
                fontFamily: 'var(--font-mono)',
                color: 'var(--text-muted)',
                letterSpacing: '0.02em',
              }}>
                Encrypted • Processed locally in WebAssembly • Max 100MB
              </p>
            </>
          )}
        </div>
      )}

      {/* 3. QUICK ACTIONS: 1-CLICK WORKFLOW SHORTCUTS */}
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
          style={{ fontSize: '12px', padding: '5px 12px' }}
          title="Combine multiple PDFs into one"
        >
          <Layers size={13} strokeWidth={1.6} />
          <span>Merge PDFs</span>
        </button>

        <button 
          onClick={() => onQuickIntent('compress-pdf')}
          className="btn btn-secondary btn-sm"
          style={{ fontSize: '12px', padding: '5px 12px' }}
          title="Shrink PDF file size with lossless optimization"
        >
          <Zap size={13} strokeWidth={1.6} />
          <span>Compress Lossless</span>
        </button>

        <button 
          onClick={() => onQuickIntent('split-pdf')}
          className="btn btn-secondary btn-sm"
          style={{ fontSize: '12px', padding: '5px 12px' }}
          title="Separate or extract pages"
        >
          <Scissors size={13} strokeWidth={1.6} />
          <span>Split Pages</span>
        </button>

        <button 
          onClick={() => onQuickIntent('sign-pdf')}
          className="btn btn-secondary btn-sm"
          style={{ fontSize: '12px', padding: '5px 12px' }}
          title="Sign document with draw, type, or photo"
        >
          <PenTool size={13} strokeWidth={1.6} />
          <span>Fill & Sign</span>
        </button>

        <button 
          onClick={() => onQuickIntent('protect-pdf')}
          className="btn btn-secondary btn-sm"
          style={{ fontSize: '12px', padding: '5px 12px' }}
          title="Lock PDF with AES-256 password"
        >
          <Lock size={13} strokeWidth={1.6} />
          <span>Protect</span>
        </button>

        <button 
          onClick={() => onQuickIntent('pdf-to-word')}
          className="btn btn-secondary btn-sm"
          style={{ fontSize: '12px', padding: '5px 12px' }}
          title="Convert PDF to editable Word document"
        >
          <FileText size={13} strokeWidth={1.6} />
          <span>To Word</span>
        </button>

        <button 
          onClick={() => onQuickIntent('ai-chat')}
          className="btn btn-secondary btn-sm"
          style={{ fontSize: '12px', padding: '5px 12px' }}
          title="Open AI Studio for local Q&A and summarization"
        >
          <Sparkles size={13} strokeWidth={1.6} />
          <span>AI Studio</span>
        </button>
      </div>

      {/* 4. ZERO-CLOUD TRUST & PRIVACY GUARANTEE (WHY ERGONPDF) */}
      <div className="trust-guarantee-bar">
        <div className="trust-item">
          <div className="trust-icon-box" style={{ background: 'var(--accent-secondary-light)', color: 'var(--accent-secondary)' }}>
            <ShieldCheck size={18} strokeWidth={2} />
          </div>
          <div>
            <h4>100% In-Browser Memory</h4>
            <p>Zero documents leave your machine. Processed locally in WebAssembly with zero telemetry.</p>
          </div>
        </div>

        <div className="trust-item">
          <div className="trust-icon-box" style={{ background: 'var(--accent-primary-light)', color: 'var(--accent-primary)' }}>
            <Zap size={18} strokeWidth={2} />
          </div>
          <div>
            <h4>Sub-20ms Engine Latency</h4>
            <p>Instant client execution. No server upload queues, artificial delays, or email walls.</p>
          </div>
        </div>

        <div className="trust-item">
          <div className="trust-icon-box" style={{ background: 'var(--bg-tertiary)', color: 'var(--text-primary)' }}>
            <Sparkles size={18} strokeWidth={2} />
          </div>
          <div>
            <h4>Zero Limits & No Ads</h4>
            <p>Unlimited file sizes, no daily conversion caps, and zero third-party tracking scripts.</p>
          </div>
        </div>
      </div>
    </div>
  );
};
