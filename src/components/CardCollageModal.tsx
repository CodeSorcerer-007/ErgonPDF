import React, { useState } from 'react';
import { X, Download, Image as ImageIcon, Sparkles, ArrowRight } from 'lucide-react';
import { PDFEngineService } from '../services/pdfEngine';
import confetti from 'canvas-confetti';

interface CardCollageModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenPdfInWorkspace: (pdfBuffer: ArrayBuffer, fileName: string) => void;
  initialMode?: 'card' | 'collage';
}

export const CardCollageModal: React.FC<CardCollageModalProps> = ({
  isOpen,
  onClose,
  onOpenPdfInWorkspace,
  initialMode = 'card',
}) => {
  const [title, setTitle] = useState(
    initialMode === 'card' ? 'Warmest Holiday Wishes' : 'Memories & Celebrations'
  );
  const [message, setMessage] = useState(
    initialMode === 'card'
      ? 'Wishing you peace, joy, and prosperity throughout the coming year.\nMay your moments be bright and memorable.'
      : 'A collection of cherished moments and milestones.\nCaptured with love and gratitude.'
  );
  const [theme, setTheme] = useState<'classic' | 'warm' | 'slate' | 'emerald' | 'coral'>('warm');
  const [selectedImages, setSelectedImages] = useState<
    Array<{ name: string; buffer: ArrayBuffer; type: string }>
  >([]);
  const [isGenerating, setIsGenerating] = useState(false);

  if (!isOpen) return null;

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const arr: Array<{ name: string; buffer: ArrayBuffer; type: string }> = [];
      for (const f of Array.from(files)) {
        const buf = await f.arrayBuffer();
        arr.push({ name: f.name, buffer: buf, type: f.type });
      }
      setSelectedImages(arr);
    }
  };

  const handleDownload = async () => {
    setIsGenerating(true);
    try {
      const pdfBytes = await PDFEngineService.generateCardPDF({
        title,
        message,
        theme,
        images: selectedImages,
      });

      const blob = new Blob([pdfBytes as any], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${title.replace(/\s+/g, '_')}_Card.pdf`;
      a.click();
      URL.revokeObjectURL(url);

      confetti({ particleCount: 50, spread: 60, origin: { y: 0.7 } });
    } catch (err) {
      console.error(err);
      alert('Error generating card PDF.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleOpenWorkspace = async () => {
    setIsGenerating(true);
    try {
      const pdfBytes = await PDFEngineService.generateCardPDF({
        title,
        message,
        theme,
        images: selectedImages,
      });

      onOpenPdfInWorkspace(
        pdfBytes.buffer as ArrayBuffer,
        `${title.replace(/\s+/g, '_')}_Card.pdf`
      );
      onClose();
    } catch (err) {
      console.error(err);
      alert('Error opening card in workspace.');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 140,
        background: 'rgba(0, 0, 0, 0.75)',
        backdropFilter: 'blur(8px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
      }}
      onClick={onClose}
    >
      <div
        className="glass-panel animate-scale-in"
        style={{
          width: '100%',
          maxWidth: '680px',
          maxHeight: '92vh',
          background: 'var(--bg-secondary)',
          borderRadius: 'var(--radius-lg)',
          boxShadow: 'var(--shadow-xl)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
            padding: '16px 20px',
            borderBottom: '1px solid var(--border-subtle)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: 'var(--bg-tertiary)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Sparkles size={20} color="var(--accent-primary)" />
            <div>
              <h3 style={{ fontSize: '16px', fontWeight: 700, margin: 0 }}>
                Greeting Card & Photo Collage Creator
              </h3>
              <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: 0 }}>
                Design custom landscape cards and photo collages in high-resolution vector PDF.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="btn btn-ghost btn-sm"
            style={{ padding: '6px', borderRadius: '50%' }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Form Body */}
        <div style={{ padding: '20px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)' }}>Card Title / Headline</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              style={{
                width: '100%',
                padding: '7px 10px',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-medium)',
                background: 'var(--bg-primary)',
                color: 'var(--text-primary)',
                fontSize: '13px',
                marginTop: '4px',
              }}
            />
          </div>

          <div>
            <label style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)' }}>Personal Message / Caption</label>
            <textarea
              rows={4}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              style={{
                width: '100%',
                padding: '8px 12px',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-medium)',
                background: 'var(--bg-primary)',
                color: 'var(--text-primary)',
                fontSize: '13px',
                lineHeight: 1.5,
                marginTop: '4px',
                resize: 'none',
              }}
            />
          </div>

          {/* Theme Palette */}
          <div>
            <label style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '6px', display: 'block' }}>
              Color Theme & Mood
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '8px' }}>
              {[
                { id: 'warm', label: 'Warm Cream', color: '#fef3c7', text: '#92400e' },
                { id: 'classic', label: 'Clean White', color: '#ffffff', text: '#1f2937' },
                { id: 'slate', label: 'Midnight Slate', color: '#1e293b', text: '#f8fafc' },
                { id: 'emerald', label: 'Sage Emerald', color: '#dcfce7', text: '#166534' },
                { id: 'coral', label: 'Sunset Coral', color: '#ffe4e6', text: '#9f1239' },
              ].map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setTheme(t.id as any)}
                  style={{
                    padding: '8px 6px',
                    borderRadius: 'var(--radius-md)',
                    border: theme === t.id ? '2px solid var(--accent-primary)' : '1px solid var(--border-medium)',
                    background: t.color,
                    color: t.text,
                    fontSize: '11px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '4px',
                  }}
                >
                  <span style={{ width: '12px', height: '12px', borderRadius: '50%', background: t.text }} />
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          {/* Image Upload */}
          <div>
            <label style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '6px', display: 'block' }}>
              Optional Photo / Illustration Embed
            </label>
            <label
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '16px',
                border: '2px dashed var(--border-medium)',
                borderRadius: 'var(--radius-md)',
                cursor: 'pointer',
                background: 'var(--bg-tertiary)',
              }}
            >
              <ImageIcon size={20} color="var(--accent-primary)" style={{ marginBottom: '6px' }} />
              <span style={{ fontSize: '12px', fontWeight: 600 }}>
                {selectedImages.length > 0 ? `${selectedImages.length} image(s) selected` : 'Click to select photo (PNG or JPG)'}
              </span>
              <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Files remain 100% private in browser memory</span>
              <input
                type="file"
                accept="image/png,image/jpeg"
                onChange={handleImageUpload}
                style={{ display: 'none' }}
              />
            </label>
          </div>
        </div>

        {/* Footer Actions */}
        <div
          style={{
            padding: '14px 20px',
            borderTop: '1px solid var(--border-subtle)',
            background: 'var(--bg-tertiary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-end',
            gap: '8px',
          }}
        >
          <button
            type="button"
            onClick={handleOpenWorkspace}
            disabled={isGenerating}
            className="btn btn-secondary btn-sm"
            style={{ gap: '6px' }}
          >
            <ArrowRight size={14} />
            <span>Open in Workspace</span>
          </button>

          <button
            type="button"
            onClick={handleDownload}
            disabled={isGenerating}
            className="btn btn-primary btn-sm"
            style={{ gap: '6px' }}
          >
            <Download size={14} />
            <span>Generate & Download PDF Card</span>
          </button>
        </div>
      </div>
    </div>
  );
};
