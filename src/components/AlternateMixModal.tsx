import React, { useState } from 'react';
import { Shuffle, Upload, X, Loader2 } from 'lucide-react';
import { PDFEngineService } from '../services/pdfEngine';

interface AlternateMixModalProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: (mixedFile: File) => void;
}

export const AlternateMixModal: React.FC<AlternateMixModalProps> = ({
  isOpen,
  onClose,
  onComplete,
}) => {
  const [fileA, setFileA] = useState<File | null>(null);
  const [fileB, setFileB] = useState<File | null>(null);
  const [reverseB, setReverseB] = useState<boolean>(true);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleMix = async () => {
    if (!fileA || !fileB) return;
    setIsProcessing(true);

    try {
      const bufA = await fileA.arrayBuffer();
      const bufB = await fileB.arrayBuffer();
      const mixedBytes = await PDFEngineService.alternateMixDocuments(bufA, bufB, reverseB);

      const mixedBlob = new Blob([new Uint8Array(mixedBytes)], { type: 'application/pdf' });
      const mixedFile = new File([mixedBlob], `${fileA.name.replace('.pdf', '')}_mixed.pdf`, {
        type: 'application/pdf',
      });

      onComplete(mixedFile);
      onClose();
    } catch (err) {
      console.error(err);
      alert('Error mixing documents. Please ensure both files are valid PDFs.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-content glass-panel animate-scale-up"
        onClick={(e) => e.stopPropagation()}
        style={{ width: '560px', maxWidth: '95vw', padding: '28px' }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: 'var(--radius-md)',
                background: 'var(--accent-primary-light)',
                color: 'var(--accent-primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Shuffle size={20} />
            </div>
            <div>
              <h3 style={{ fontSize: '18px', fontWeight: 700 }}>Alternate & Mix PDFs</h3>
              <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                Interleave odd and even page scans from two files into one document
              </p>
            </div>
          </div>

          <button onClick={onClose} className="btn btn-ghost btn-icon">
            <X size={18} />
          </button>
        </div>

        {/* 2 Upload Slots */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '20px' }}>
          {/* File A: Front / Odd Pages */}
          <div
            className="glass-card"
            style={{
              padding: '16px',
              border: fileA ? '2px solid var(--accent-primary)' : '1px dashed var(--border-medium)',
              textAlign: 'center',
              cursor: 'pointer',
              background: fileA ? 'var(--accent-primary-light)' : 'var(--bg-tertiary)',
            }}
            onClick={() => {
              const input = document.createElement('input');
              input.type = 'file';
              input.accept = '.pdf';
              input.onchange = (e) => {
                const f = (e.target as HTMLInputElement).files?.[0];
                if (f) setFileA(f);
              };
              input.click();
            }}
          >
            <Upload size={22} style={{ margin: '0 auto 8px', color: 'var(--accent-primary)' }} />
            <h5 style={{ fontSize: '13px', fontWeight: 700 }}>Document 1 (Fronts)</h5>
            <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>
              {fileA ? fileA.name : 'Click to select odd / front scans'}
            </p>
          </div>

          {/* File B: Back / Even Pages */}
          <div
            className="glass-card"
            style={{
              padding: '16px',
              border: fileB ? '2px solid var(--accent-primary)' : '1px dashed var(--border-medium)',
              textAlign: 'center',
              cursor: 'pointer',
              background: fileB ? 'var(--accent-primary-light)' : 'var(--bg-tertiary)',
            }}
            onClick={() => {
              const input = document.createElement('input');
              input.type = 'file';
              input.accept = '.pdf';
              input.onchange = (e) => {
                const f = (e.target as HTMLInputElement).files?.[0];
                if (f) setFileB(f);
              };
              input.click();
            }}
          >
            <Upload size={22} style={{ margin: '0 auto 8px', color: 'var(--accent-primary)' }} />
            <h5 style={{ fontSize: '13px', fontWeight: 700 }}>Document 2 (Backs)</h5>
            <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>
              {fileB ? fileB.name : 'Click to select even / back scans'}
            </p>
          </div>
        </div>

        {/* Options */}
        <label
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            fontSize: '13px',
            marginBottom: '24px',
            cursor: 'pointer',
            padding: '10px 14px',
            borderRadius: 'var(--radius-md)',
            background: 'var(--bg-tertiary)',
          }}
        >
          <input
            type="checkbox"
            checked={reverseB}
            onChange={(e) => setReverseB(e.target.checked)}
          />
          <div>
            <span style={{ fontWeight: 600 }}>Reverse Document 2 page order</span>
            <p style={{ fontSize: '11px', color: 'var(--text-muted)', margin: 0 }}>
              Recommended for sheetfed scanners that scan the back stack in reverse sequence
            </p>
          </div>
        </label>

        {/* Actions */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
          <button onClick={onClose} className="btn btn-secondary btn-sm" disabled={isProcessing}>
            Cancel
          </button>
          <button
            onClick={handleMix}
            disabled={!fileA || !fileB || isProcessing}
            className="btn btn-primary btn-sm"
            style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            {isProcessing ? (
              <>
                <Loader2 size={15} className="animate-spin" />
                <span>Interleaving…</span>
              </>
            ) : (
              <>
                <Shuffle size={15} />
                <span>Mix & Open Workspace</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
