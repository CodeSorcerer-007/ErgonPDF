import React, { useState, useRef } from 'react';
import { X, GitCompare, ArrowLeft, ArrowRight, Upload, Layers } from 'lucide-react';
import { PDFEngineService } from '../services/pdfEngine';

interface CompareModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CompareModal: React.FC<CompareModalProps> = ({ isOpen, onClose }) => {
  const [docA, setDocA] = useState<{ name: string; buffer: ArrayBuffer; pageCount: number } | null>(null);
  const [docB, setDocB] = useState<{ name: string; buffer: ArrayBuffer; pageCount: number } | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const zoom = 1.0;

  const canvasARef = useRef<HTMLCanvasElement>(null);
  const canvasBRef = useRef<HTMLCanvasElement>(null);

  React.useEffect(() => {
    if (docA && canvasARef.current) {
      PDFEngineService.renderPageToCanvas(docA.buffer, currentPage, canvasARef.current, zoom);
    }
  }, [docA, currentPage, zoom]);

  React.useEffect(() => {
    if (docB && canvasBRef.current) {
      const pageToRender = Math.min(currentPage, docB.pageCount);
      PDFEngineService.renderPageToCanvas(docB.buffer, pageToRender, canvasBRef.current, zoom);
    }
  }, [docB, currentPage, zoom]);

  if (!isOpen) return null;

  const handleUploadA = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const buffer = await file.arrayBuffer();
    const info = await PDFEngineService.inspectDocument(buffer);
    setDocA({ name: file.name, buffer, pageCount: info.pageCount });
  };

  const handleUploadB = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const buffer = await file.arrayBuffer();
    const info = await PDFEngineService.inspectDocument(buffer);
    setDocB({ name: file.name, buffer, pageCount: info.pageCount });
  };

  const maxPages = Math.max(docA?.pageCount || 1, docB?.pageCount || 1);

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      zIndex: 110,
      background: 'rgba(0, 0, 0, 0.75)',
      backdropFilter: 'blur(8px)',
      display: 'flex',
      flexDirection: 'column',
    }}>
      {/* Top Header */}
      <div className="glass-panel" style={{
        borderRadius: 0,
        padding: '12px 24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderLeft: 'none',
        borderRight: 'none',
        borderTop: 'none',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <GitCompare size={20} color="var(--accent-primary)" />
          <span style={{ fontWeight: 700, fontSize: '16px' }}>Compare PDF Documents Side-by-Side</span>
        </div>

        {/* Page Nav */}
        {docA && docB && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="btn btn-secondary btn-sm"
            >
              <ArrowLeft size={14} />
            </button>
            <span style={{ fontSize: '13px', fontWeight: 600 }}>
              Page {currentPage} of {maxPages}
            </span>
            <button
              onClick={() => setCurrentPage((p) => Math.min(maxPages, p + 1))}
              disabled={currentPage === maxPages}
              className="btn btn-secondary btn-sm"
            >
              <ArrowRight size={14} />
            </button>
          </div>
        )}

        <button onClick={onClose} className="btn btn-ghost btn-icon">
          <X size={18} />
        </button>
      </div>

      {/* Comparison Workspace Body */}
      <div style={{
        flex: 1,
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '1px',
        background: 'var(--border-medium)',
        overflow: 'hidden',
      }}>
        {/* Document A Column */}
        <div style={{
          background: 'var(--bg-primary)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        }}>
          <div style={{
            padding: '10px 16px',
            borderBottom: '1px solid var(--border-subtle)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: 'var(--bg-tertiary)',
          }}>
            <span style={{ fontWeight: 600, fontSize: '13px' }}>
              Document A: {docA ? docA.name : '(Not loaded)'}
            </span>
            {!docA && (
              <label className="btn btn-primary btn-sm" style={{ cursor: 'pointer' }}>
                <Upload size={13} />
                <span>Upload Original</span>
                <input type="file" accept=".pdf" style={{ display: 'none' }} onChange={handleUploadA} />
              </label>
            )}
          </div>

          <div style={{
            flex: 1,
            overflow: 'auto',
            padding: '20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            {docA ? (
              <div style={{ boxShadow: 'var(--shadow-lg)', borderRadius: '4px', overflow: 'hidden', background: '#fff' }}>
                <canvas ref={canvasARef} style={{ display: 'block' }} />
              </div>
            ) : (
              <div style={{ textAlign: 'center', color: 'var(--text-muted)' }}>
                <Layers size={36} style={{ margin: '0 auto 10px', opacity: 0.5 }} />
                <p>Upload the baseline / original document</p>
              </div>
            )}
          </div>
        </div>

        {/* Document B Column */}
        <div style={{
          background: 'var(--bg-primary)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        }}>
          <div style={{
            padding: '10px 16px',
            borderBottom: '1px solid var(--border-subtle)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: 'var(--bg-tertiary)',
          }}>
            <span style={{ fontWeight: 600, fontSize: '13px' }}>
              Document B: {docB ? docB.name : '(Not loaded)'}
            </span>
            {!docB && (
              <label className="btn btn-primary btn-sm" style={{ cursor: 'pointer' }}>
                <Upload size={13} />
                <span>Upload Modified Version</span>
                <input type="file" accept=".pdf" style={{ display: 'none' }} onChange={handleUploadB} />
              </label>
            )}
          </div>

          <div style={{
            flex: 1,
            overflow: 'auto',
            padding: '20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            {docB ? (
              <div style={{ boxShadow: 'var(--shadow-lg)', borderRadius: '4px', overflow: 'hidden', background: '#fff' }}>
                <canvas ref={canvasBRef} style={{ display: 'block' }} />
              </div>
            ) : (
              <div style={{ textAlign: 'center', color: 'var(--text-muted)' }}>
                <Layers size={36} style={{ margin: '0 auto 10px', opacity: 0.5 }} />
                <p>Upload the modified / newer document</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
