import React, { useState } from 'react';
import { X, Plus, Trash2, ArrowUp, ArrowDown, Layers, Check, Download, Loader2 } from 'lucide-react';
import { PDFEngineService } from '../services/pdfEngine';
import confetti from 'canvas-confetti';

interface MergeModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialFiles?: File[];
}

interface MergeItem {
  id: string;
  file: File;
  name: string;
  size: number;
  pageCount?: number;
  arrayBuffer?: ArrayBuffer;
}

export const MergeModal: React.FC<MergeModalProps> = ({
  isOpen,
  onClose,
  initialFiles = [],
}) => {
  const [items, setItems] = useState<MergeItem[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progressMsg, setProgressMsg] = useState('');
  const [mergedBlobUrl, setMergedBlobUrl] = useState<string | null>(null);

  const addFiles = React.useCallback(async (files: File[]) => {
    const newItems: MergeItem[] = [];
    for (const f of files) {
      if (f.type === 'application/pdf' || f.name.endsWith('.pdf')) {
        const buffer = await f.arrayBuffer();
        try {
          const inspected = await PDFEngineService.inspectDocument(buffer);
          newItems.push({
            id: `item-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
            file: f,
            name: f.name,
            size: f.size,
            pageCount: inspected.pageCount,
            arrayBuffer: buffer,
          });
        } catch {
          newItems.push({
            id: `item-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
            file: f,
            name: f.name,
            size: f.size,
            arrayBuffer: buffer,
          });
        }
      }
    }
    setItems((prev) => [...prev, ...newItems]);
  }, []);

  React.useEffect(() => {
    if (!isOpen || initialFiles.length === 0) return;
    let isCancelled = false;
    const loadInitialFiles = async () => {
      const newItems: MergeItem[] = [];
      for (const f of initialFiles) {
        if (f.type === 'application/pdf' || f.name.endsWith('.pdf')) {
          const buffer = await f.arrayBuffer();
          try {
            const inspected = await PDFEngineService.inspectDocument(buffer);
            newItems.push({
              id: `item-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
              file: f,
              name: f.name,
              size: f.size,
              pageCount: inspected.pageCount,
              arrayBuffer: buffer,
            });
          } catch {
            newItems.push({
              id: `item-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
              file: f,
              name: f.name,
              size: f.size,
              arrayBuffer: buffer,
            });
          }
        }
      }
      if (!isCancelled) {
        setItems((prev) => [...prev, ...newItems]);
      }
    };
    void loadInitialFiles();
    return () => {
      isCancelled = true;
    };
  }, [isOpen, initialFiles]);

  if (!isOpen) return null;

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      addFiles(Array.from(e.target.files));
    }
  };

  const moveItem = (index: number, direction: 'up' | 'down') => {
    const newItems = [...items];
    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= newItems.length) return;
    const temp = newItems[index];
    newItems[index] = newItems[targetIdx];
    newItems[targetIdx] = temp;
    setItems(newItems);
  };

  const removeItem = (index: number) => {
    setItems((prev) => prev.filter((_, i) => i !== index));
  };

  const handleMerge = async () => {
    if (items.length < 2) return;
    setIsProcessing(true);
    setProgressMsg('Combining documents…');

    try {
      const buffers = items.map((i) => i.arrayBuffer!).filter(Boolean);
      const mergedBytes = await PDFEngineService.mergeDocuments(buffers);

      const blob = new Blob([new Uint8Array(mergedBytes)], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      setMergedBlobUrl(url);

      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.7 },
      });
    } catch (err) {
      console.error(err);
      alert('Error merging files. Please verify documents are valid PDFs.');
    } finally {
      setIsProcessing(false);
    }
  };

  const totalPages = items.reduce((acc, curr) => acc + (curr.pageCount || 1), 0);
  const totalSize = items.reduce((acc, curr) => acc + curr.size, 0);

  return (
    <div 
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 110,
        background: 'rgba(0, 0, 0, 0.65)',
        backdropFilter: 'blur(8px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
      }}
      onClick={onClose}
    >
      <div 
        className="glass-panel animate-scale-in"
        style={{
          width: '100%',
          maxWidth: '650px',
          maxHeight: '80vh',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: 'var(--shadow-xl)',
          background: 'var(--bg-secondary)',
          borderRadius: 'var(--radius-lg)',
          overflow: 'hidden',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{
          padding: '16px 20px',
          borderBottom: '1px solid var(--border-subtle)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              background: 'var(--accent-primary-light)',
              color: 'var(--accent-primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <Layers size={18} />
            </div>
            <div>
              <h3 style={{ fontSize: '17px', fontWeight: 700 }}>Merge PDF Documents</h3>
              <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                Reorder files into your desired sequence and merge them into one.
              </p>
            </div>
          </div>
          <button onClick={onClose} className="btn btn-ghost btn-icon">
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '20px' }}>
          {mergedBlobUrl ? (
            <div style={{ textAlign: 'center', padding: '32px 16px' }}>
              <div style={{
                width: '64px',
                height: '64px',
                borderRadius: '50%',
                background: 'var(--success-bg)',
                color: 'var(--success)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 16px',
              }}>
                <Check size={32} />
              </div>
              <h3 style={{ fontSize: '20px', fontWeight: 700, marginBottom: '8px' }}>
                PDFs Successfully Merged!
              </h3>
              <p style={{ fontSize: '14px', color: 'var(--text-muted)', marginBottom: '24px' }}>
                Combined {items.length} files into a single {totalPages}-page document.
              </p>
              <div style={{ display: 'flex', justifyContent: 'center', gap: '12px' }}>
                <a
                  href={mergedBlobUrl}
                  download="merged_document.pdf"
                  className="btn btn-primary btn-lg"
                >
                  <Download size={18} />
                  <span>Download Merged PDF</span>
                </a>
              </div>
            </div>
          ) : (
            <>
              {/* File List */}
              {items.length === 0 ? (
                <div style={{
                  padding: '36px 20px',
                  border: '2px dashed var(--border-medium)',
                  borderRadius: 'var(--radius-md)',
                  textAlign: 'center',
                }}>
                  <p style={{ fontSize: '14px', fontWeight: 600, marginBottom: '6px' }}>
                    No files added yet
                  </p>
                  <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '16px' }}>
                    Add at least 2 PDF documents to merge.
                  </p>
                  <label className="btn btn-secondary btn-sm" style={{ cursor: 'pointer' }}>
                    <Plus size={14} />
                    <span>Choose PDF Files</span>
                    <input 
                      type="file" 
                      multiple 
                      accept=".pdf" 
                      style={{ display: 'none' }} 
                      onChange={handleFileInput} 
                    />
                  </label>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {items.map((item, index) => (
                    <div
                      key={item.id}
                      className="glass-card"
                      style={{
                        padding: '12px 14px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: 0, flex: 1 }}>
                        <span style={{
                          fontFamily: 'var(--font-mono)',
                          fontSize: '12px',
                          color: 'var(--text-muted)',
                          width: '20px',
                        }}>
                          #{index + 1}
                        </span>
                        <div style={{ minWidth: 0 }}>
                          <p style={{
                            fontSize: '14px',
                            fontWeight: 600,
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                          }}>
                            {item.name}
                          </p>
                          <p style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                            {item.pageCount ? `${item.pageCount} pages` : 'PDF'} • {(item.size / 1024).toFixed(1)} KB
                          </p>
                        </div>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <button
                          onClick={() => moveItem(index, 'up')}
                          disabled={index === 0}
                          className="btn btn-ghost btn-icon"
                          title="Move up"
                        >
                          <ArrowUp size={14} />
                        </button>
                        <button
                          onClick={() => moveItem(index, 'down')}
                          disabled={index === items.length - 1}
                          className="btn btn-ghost btn-icon"
                          title="Move down"
                        >
                          <ArrowDown size={14} />
                        </button>
                        <button
                          onClick={() => removeItem(index)}
                          className="btn btn-ghost btn-icon"
                          style={{ color: 'var(--error)' }}
                          title="Remove file"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  ))}

                  <label 
                    className="btn btn-secondary btn-sm" 
                    style={{ alignSelf: 'center', marginTop: '12px', cursor: 'pointer' }}
                  >
                    <Plus size={14} />
                    <span>Add More Files</span>
                    <input 
                      type="file" 
                      multiple 
                      accept=".pdf" 
                      style={{ display: 'none' }} 
                      onChange={handleFileInput} 
                    />
                  </label>
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        {!mergedBlobUrl && (
          <div style={{
            padding: '14px 20px',
            borderTop: '1px solid var(--border-subtle)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: 'var(--bg-tertiary)',
          }}>
            <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
              {items.length} files • {totalPages} total pages • {(totalSize / (1024 * 1024)).toFixed(1)} MB
            </span>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button onClick={onClose} className="btn btn-secondary btn-sm">
                Cancel
              </button>
              <button
                onClick={handleMerge}
                disabled={items.length < 2 || isProcessing}
                className="btn btn-primary btn-sm"
              >
                {isProcessing ? (
                  <>
                    <Loader2 size={14} className="animate-spin" />
                    <span>{progressMsg}</span>
                  </>
                ) : (
                  <>
                    <Layers size={14} />
                    <span>Merge {items.length} PDFs</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
