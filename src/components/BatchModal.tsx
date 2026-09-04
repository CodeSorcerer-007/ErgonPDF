import React, { useState } from 'react';
import { X, Layers, Plus, Trash2, CheckCircle2, Download, Loader2, Play } from 'lucide-react';
import JSZip from 'jszip';
import { PDFEngineService } from '../services/pdfEngine';
import confetti from 'canvas-confetti';

interface BatchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface BatchFileItem {
  id: string;
  file: File;
  name: string;
  size: number;
  status: 'idle' | 'processing' | 'completed' | 'error';
  resultBytes?: Uint8Array;
}

export const BatchModal: React.FC<BatchModalProps> = ({ isOpen, onClose }) => {
  const [operation, setOperation] = useState<'compress' | 'images' | 'watermark'>('compress');
  const [items, setItems] = useState<BatchFileItem[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progressPercent, setProgressPercent] = useState(0);
  const [zipUrl, setZipUrl] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newItems: BatchFileItem[] = Array.from(e.target.files).map((f) => ({
        id: `batch-${Math.random().toString(36).substring(2, 9)}`,
        file: f,
        name: f.name,
        size: f.size,
        status: 'idle',
      }));
      setItems((prev) => [...prev, ...newItems]);
      setZipUrl(null);
    }
  };

  const handleStartBatch = async () => {
    if (items.length === 0) return;
    setIsProcessing(true);
    setProgressPercent(0);
    const zip = new JSZip();

    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      setItems((prev) =>
        prev.map((it, idx) => (idx === i ? { ...it, status: 'processing' } : it))
      );

      try {
        const buffer = await item.file.arrayBuffer();

        if (operation === 'compress') {
          const res = await PDFEngineService.compressDocument(buffer, {
            level: 'balanced',
            imageQuality: 0.7,
            dpi: 150,
            removeMetadata: true,
          });
          zip.file(`compressed_${item.name}`, res.data);
        } else if (operation === 'watermark') {
          const res = await PDFEngineService.addWatermark(buffer, {
            text: 'CONFIDENTIAL',
            fontSize: 48,
            opacity: 0.25,
            rotation: -45,
            color: 'grey',
            pages: 'all',
          });
          zip.file(`watermarked_${item.name}`, res);
        } else if (operation === 'images') {
          const images = await PDFEngineService.convertToImages(buffer, 'png', 1.5);
          const baseName = item.name.replace('.pdf', '');
          images.forEach((img) => {
            zip.file(`${baseName}_page_${img.pageNumber}.png`, img.blob);
          });
        }

        setItems((prev) =>
          prev.map((it, idx) => (idx === i ? { ...it, status: 'completed' } : it))
        );
      } catch (err) {
        console.error(err);
        setItems((prev) =>
          prev.map((it, idx) => (idx === i ? { ...it, status: 'error' } : it))
        );
      }

      setProgressPercent(Math.round(((i + 1) / items.length) * 100));
    }

    // Generate ZIP package
    const zipBlob = await zip.generateAsync({ type: 'blob' });
    const url = URL.createObjectURL(zipBlob);
    setZipUrl(url);
    setIsProcessing(false);

    confetti({
      particleCount: 50,
      spread: 60,
      origin: { y: 0.7 },
    });
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
        maxWidth: '680px',
        maxHeight: '85vh',
        display: 'flex',
        flexDirection: 'column',
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
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Layers size={20} color="var(--accent-primary)" />
            <div>
              <h3 style={{ fontSize: '17px', fontWeight: 700 }}>Batch Processing Queue</h3>
              <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                Process multiple documents simultaneously and download as a ZIP package.
              </p>
            </div>
          </div>
          <button onClick={onClose} className="btn btn-ghost btn-icon">
            <X size={18} />
          </button>
        </div>

        {/* Operation Selection */}
        <div style={{
          padding: '14px 20px',
          background: 'var(--bg-tertiary)',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
        }}>
          <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)' }}>
            Batch Operation:
          </span>
          <div style={{ display: 'flex', gap: '8px' }}>
            {[
              { id: 'compress', label: 'Batch Compress' },
              { id: 'watermark', label: 'Batch Watermark' },
              { id: 'images', label: 'Batch to PNGs' },
            ].map((op) => (
              <button
                key={op.id}
                onClick={() => setOperation(op.id as any)}
                className="btn btn-sm"
                style={{
                  background: operation === op.id ? 'var(--accent-primary)' : 'var(--bg-elevated)',
                  color: operation === op.id ? '#fff' : 'var(--text-primary)',
                  border: '1px solid var(--border-subtle)',
                }}
              >
                {op.label}
              </button>
            ))}
          </div>
        </div>

        {/* Content File List */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '20px' }}>
          {items.length === 0 ? (
            <div style={{
              padding: '40px 20px',
              border: '2px dashed var(--border-medium)',
              borderRadius: 'var(--radius-md)',
              textAlign: 'center',
            }}>
              <p style={{ fontSize: '14px', fontWeight: 600, marginBottom: '6px' }}>
                No files in queue
              </p>
              <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '16px' }}>
                Upload multiple PDFs to batch process locally.
              </p>
              <label className="btn btn-secondary btn-sm" style={{ cursor: 'pointer' }}>
                <Plus size={14} />
                <span>Select Multiple Files</span>
                <input type="file" multiple accept=".pdf" style={{ display: 'none' }} onChange={handleFiles} />
              </label>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {items.map((it, idx) => (
                <div
                  key={it.id}
                  className="glass-card"
                  style={{
                    padding: '10px 14px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <p style={{ fontSize: '13px', fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {it.name}
                    </p>
                    <p style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                      {(it.size / 1024).toFixed(1)} KB
                    </p>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    {it.status === 'idle' && (
                      <span className="badge badge-muted">Queued</span>
                    )}
                    {it.status === 'processing' && (
                      <span className="badge badge-accent">
                        <Loader2 size={12} className="animate-spin" /> Processing…
                      </span>
                    )}
                    {it.status === 'completed' && (
                      <span className="badge badge-privacy">
                        <CheckCircle2 size={12} /> Done
                      </span>
                    )}
                    {it.status === 'error' && (
                      <span className="badge" style={{ background: 'var(--error-bg)', color: 'var(--error)' }}>
                        Error
                      </span>
                    )}
                    <button
                      onClick={() => setItems((prev) => prev.filter((_, i) => i !== idx))}
                      disabled={isProcessing}
                      className="btn btn-ghost btn-icon"
                      style={{ padding: '4px', color: 'var(--text-muted)' }}
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              ))}

              <label className="btn btn-secondary btn-sm" style={{ alignSelf: 'center', marginTop: '10px', cursor: 'pointer' }}>
                <Plus size={14} />
                <span>Add More Files</span>
                <input type="file" multiple accept=".pdf" style={{ display: 'none' }} onChange={handleFiles} />
              </label>
            </div>
          )}
        </div>

        {/* Footer */}
        <div style={{
          padding: '14px 20px',
          borderTop: '1px solid var(--border-subtle)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: 'var(--bg-tertiary)',
        }}>
          <div>
            {isProcessing && (
              <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--accent-primary)' }}>
                Processing: {progressPercent}%
              </span>
            )}
            {zipUrl && (
              <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--success)' }}>
                ✓ Batch Complete!
              </span>
            )}
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            {zipUrl ? (
              <a href={zipUrl} download="ergon_batch_processed.zip" className="btn btn-primary btn-sm">
                <Download size={14} />
                <span>Download Batch ZIP</span>
              </a>
            ) : (
              <button
                onClick={handleStartBatch}
                disabled={items.length === 0 || isProcessing}
                className="btn btn-primary btn-sm"
              >
                {isProcessing ? (
                  <>
                    <Loader2 size={14} className="animate-spin" />
                    <span>Processing {progressPercent}%</span>
                  </>
                ) : (
                  <>
                    <Play size={14} />
                    <span>Process {items.length} Files</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
