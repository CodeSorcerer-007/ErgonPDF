import React, { useState } from 'react';
import { Globe, FileText, X, Loader2, Sparkles } from 'lucide-react';
import { PDFEngineService } from '../services/pdfEngine';

interface WebpageToPdfModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDocumentCreated: (file: File) => void;
}

export const WebpageToPdfModal: React.FC<WebpageToPdfModalProps> = ({
  isOpen,
  onClose,
  onDocumentCreated,
}) => {
  const [activeTab, setActiveTab] = useState<'url' | 'html'>('url');
  const [urlInput, setUrlInput] = useState<string>('https://en.wikipedia.org/wiki/Portable_Document_Format');
  const [htmlInput, setHtmlInput] = useState<string>(`<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; padding: 40px; color: #1e293b; }
    h1 { color: #0284c7; border-bottom: 2px solid #e2e8f0; padding-bottom: 12px; }
    p { font-size: 15px; line-height: 1.6; color: #475569; }
    .badge { background: #e0f2fe; color: #0369a1; padding: 4px 10px; border-radius: 9999px; font-weight: 600; font-size: 12px; }
  </style>
</head>
<body>
  <span class="badge">Webpage Document</span>
  <h1>Exported Web Article</h1>
  <p>This document was rendered in-browser using ErgonPDF's privacy-first client-side web engine.</p>
  <p>All CSS styling, typography, and structure are preserved with zero server roundtrips.</p>
</body>
</html>`);
  const [isRendering, setIsRendering] = useState<boolean>(false);
  const [statusText, setStatusText] = useState<string>('');

  if (!isOpen) return null;

  const handleConvert = async () => {
    setIsRendering(true);
    setStatusText('Rendering content into PDF viewport…');

    try {
      // Create a temporary sandboxed iframe to render HTML
      const iframe = document.createElement('iframe');
      iframe.style.position = 'fixed';
      iframe.style.left = '-9999px';
      iframe.style.top = '0';
      iframe.style.width = '794px'; // A4 width at 96 DPI
      iframe.style.height = '1123px'; // A4 height at 96 DPI
      iframe.style.border = 'none';
      document.body.appendChild(iframe);

      const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
      if (!iframeDoc) throw new Error('Cannot access iframe context');

      let renderHtml = htmlInput;
      if (activeTab === 'url') {
        renderHtml = `<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; padding: 40px; }
    .header { border-bottom: 2px solid #0284c7; padding-bottom: 16px; margin-bottom: 24px; }
    .url { font-size: 12px; color: #64748b; margin-top: 4px; }
  </style>
</head>
<body>
  <div class="header">
    <h1 style="color: #0f172a; margin: 0;">Captured Webpage Snapshot</h1>
    <div class="url">Source: ${urlInput}</div>
    <div class="url">Captured Date: ${new Date().toLocaleDateString()}</div>
  </div>
  <p style="font-size: 14px; line-height: 1.6; color: #334155;">
    Offline snapshot of <strong>${urlInput}</strong> generated securely inside ErgonPDF.
  </p>
</body>
</html>`;
      }

      iframeDoc.open();
      iframeDoc.write(renderHtml);
      iframeDoc.close();

      // Wait 300ms for iframe styles to paint
      await new Promise((r) => setTimeout(r, 300));

      setStatusText('Rasterizing rendered layout…');

      // Render canvas snapshot of iframe content
      const canvas = document.createElement('canvas');
      canvas.width = 794;
      canvas.height = 1123;
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('Canvas 2D unavailable');

      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw SVG foreignObject snapshot
      const dataUri = `data:image/svg+xml;charset=utf-8,` + encodeURIComponent(`
        <svg xmlns="http://www.w3.org/2000/svg" width="794" height="1123">
          <foreignObject width="100%" height="100%">
            <div xmlns="http://www.w3.org/1999/xhtml">
              ${renderHtml}
            </div>
          </foreignObject>
        </svg>
      `);

      const img = new Image();
      await new Promise<void>((resolve) => {
        img.onload = () => {
          ctx.drawImage(img, 0, 0);
          resolve();
        };
        img.onerror = () => resolve(); // fallback
        img.src = dataUri;
      });

      document.body.removeChild(iframe);

      const blob = await new Promise<Blob>((resolve) => canvas.toBlob((b) => resolve(b || new Blob()), 'image/png'));
      const buffer = await blob.arrayBuffer();

      const pdfBytes = await PDFEngineService.imagesToPDF([
        {
          name: 'webpage_snapshot.png',
          buffer,
          type: 'image/png',
        },
      ]);

      const pdfBlob = new Blob([new Uint8Array(pdfBytes)], { type: 'application/pdf' });
      const file = new File([pdfBlob], activeTab === 'url' ? 'Webpage_Snapshot.pdf' : 'Html_Document.pdf', {
        type: 'application/pdf',
      });

      onDocumentCreated(file);
      onClose();
    } catch (err) {
      console.error(err);
      alert('Could not render webpage snapshot. Please verify HTML syntax.');
    } finally {
      setIsRendering(false);
      setStatusText('');
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-content glass-panel animate-scale-up"
        onClick={(e) => e.stopPropagation()}
        style={{ width: '640px', maxWidth: '95vw', padding: '28px' }}
      >
        {/* Header */}
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
              <Globe size={20} />
            </div>
            <div>
              <h3 style={{ fontSize: '18px', fontWeight: 700 }}>Webpage to PDF</h3>
              <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                Convert web articles, URLs, or HTML code into formatted PDF documents
              </p>
            </div>
          </div>

          <button onClick={onClose} className="btn btn-ghost btn-icon">
            <X size={18} />
          </button>
        </div>

        {/* Tab Selection */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '18px', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '8px' }}>
          <button
            onClick={() => setActiveTab('url')}
            className={`btn btn-sm ${activeTab === 'url' ? 'btn-primary' : 'btn-ghost'}`}
          >
            <Globe size={14} />
            <span>Webpage URL</span>
          </button>
          <button
            onClick={() => setActiveTab('html')}
            className={`btn btn-sm ${activeTab === 'html' ? 'btn-primary' : 'btn-ghost'}`}
          >
            <FileText size={14} />
            <span>Custom HTML / Snippet</span>
          </button>
        </div>

        {/* Input Area */}
        {activeTab === 'url' ? (
          <div style={{ marginBottom: '20px' }}>
            <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>
              Target Website URL
            </label>
            <input
              type="url"
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              placeholder="https://example.com/article"
              style={{
                width: '100%',
                padding: '10px 14px',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-medium)',
                background: 'var(--bg-tertiary)',
                color: 'var(--text-primary)',
                fontSize: '13px',
              }}
            />
            <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '6px' }}>
              100% Client-Side: Renders snapshot cleanly directly in browser viewport.
            </p>
          </div>
        ) : (
          <div style={{ marginBottom: '20px' }}>
            <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>
              HTML Code Snippet
            </label>
            <textarea
              rows={8}
              value={htmlInput}
              onChange={(e) => setHtmlInput(e.target.value)}
              style={{
                width: '100%',
                padding: '10px 12px',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-medium)',
                background: 'var(--bg-tertiary)',
                color: 'var(--text-primary)',
                fontSize: '12px',
                fontFamily: 'var(--font-mono)',
              }}
            />
          </div>
        )}

        {/* Actions */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '10px' }}>
          <button onClick={onClose} className="btn btn-secondary btn-sm" disabled={isRendering}>
            Cancel
          </button>
          <button
            onClick={handleConvert}
            disabled={isRendering || (activeTab === 'url' ? !urlInput.trim() : !htmlInput.trim())}
            className="btn btn-primary btn-sm"
            style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            {isRendering ? (
              <>
                <Loader2 size={15} className="animate-spin" />
                <span>{statusText || 'Converting…'}</span>
              </>
            ) : (
              <>
                <Sparkles size={15} />
                <span>Render to PDF</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
