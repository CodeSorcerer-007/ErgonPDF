import React, { useState, useRef, useEffect } from 'react';
import { X, Check, RotateCcw, Pen, Type, Upload } from 'lucide-react';
import type { SignatureData } from '../types/pdf';

interface SignatureModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveSignature: (sig: SignatureData) => void;
}

export const SignatureModal: React.FC<SignatureModalProps> = ({
  isOpen,
  onClose,
  onSaveSignature,
}) => {
  const [tab, setTab] = useState<'draw' | 'type' | 'upload'>('draw');
  const [penColor, setPenColor] = useState<string>('#0f172a');
  const [typedName, setTypedName] = useState('');
  const [fontFamily, setFontFamily] = useState('cursive');

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasDrawn, setHasDrawn] = useState(false);

  useEffect(() => {
    if (isOpen && tab === 'draw') {
      const canvas = canvasRef.current;
      if (canvas) {
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.lineCap = 'round';
          ctx.lineJoin = 'round';
          ctx.lineWidth = 2.5;
          ctx.strokeStyle = penColor;
        }
      }
    }
  }, [isOpen, tab, penColor]);

  if (!isOpen) return null;

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    setIsDrawing(true);
    setHasDrawn(true);
    const rect = canvas.getBoundingClientRect();
    const x = ('clientX' in e ? e.clientX : e.touches[0].clientX) - rect.left;
    const y = ('clientY' in e ? e.clientY : e.touches[0].clientY) - rect.top;

    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = ('clientX' in e ? e.clientX : e.touches[0].clientX) - rect.left;
    const y = ('clientY' in e ? e.clientY : e.touches[0].clientY) - rect.top;

    ctx.strokeStyle = penColor;
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      setHasDrawn(false);
    }
  };

  const handleSave = () => {
    if (tab === 'draw') {
      const canvas = canvasRef.current;
      if (!canvas || !hasDrawn) return;
      const dataUrl = canvas.toDataURL('image/png');
      onSaveSignature({
        type: 'draw',
        dataUrl,
        aspectRatio: canvas.width / canvas.height,
      });
      onClose();
    } else if (tab === 'type') {
      if (!typedName.trim()) return;
      const tempCanvas = document.createElement('canvas');
      tempCanvas.width = 500;
      tempCanvas.height = 150;
      const ctx = tempCanvas.getContext('2d');
      if (ctx) {
        ctx.font = `italic 54px ${fontFamily}`;
        ctx.fillStyle = penColor;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(typedName, tempCanvas.width / 2, tempCanvas.height / 2);
        const dataUrl = tempCanvas.toDataURL('image/png');
        onSaveSignature({
          type: 'type',
          dataUrl,
          aspectRatio: tempCanvas.width / tempCanvas.height,
        });
        onClose();
      }
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (ev) => {
      const dataUrl = ev.target?.result as string;
      const img = new Image();
      img.onload = () => {
        onSaveSignature({
          type: 'upload',
          dataUrl,
          aspectRatio: img.width / img.height,
        });
        onClose();
      };
      img.src = dataUrl;
    };
    reader.readAsDataURL(file);
  };

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
          maxWidth: '560px',
          background: 'var(--bg-secondary)',
          borderRadius: 'var(--radius-lg)',
          overflow: 'hidden',
          boxShadow: 'var(--shadow-xl)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div style={{
          padding: '16px 20px',
          borderBottom: '1px solid var(--border-subtle)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          <div>
            <h3 style={{ fontSize: '18px', fontWeight: 700 }}>Create Your Signature</h3>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
              Draw, type, or upload an image to stamp onto your document.
            </p>
          </div>
          <button onClick={onClose} className="btn btn-ghost btn-icon">
            <X size={18} />
          </button>
        </div>

        {/* Tab Buttons */}
        <div style={{
          display: 'flex',
          borderBottom: '1px solid var(--border-subtle)',
          background: 'var(--bg-tertiary)',
        }}>
          <button
            onClick={() => setTab('draw')}
            className="btn btn-ghost"
            style={{
              flex: 1,
              borderRadius: 0,
              borderBottom: tab === 'draw' ? '2px solid var(--accent-primary)' : 'none',
              color: tab === 'draw' ? 'var(--accent-primary)' : 'var(--text-secondary)',
              fontWeight: tab === 'draw' ? 600 : 500,
            }}
          >
            <Pen size={15} />
            <span>Draw</span>
          </button>

          <button
            onClick={() => setTab('type')}
            className="btn btn-ghost"
            style={{
              flex: 1,
              borderRadius: 0,
              borderBottom: tab === 'type' ? '2px solid var(--accent-primary)' : 'none',
              color: tab === 'type' ? 'var(--accent-primary)' : 'var(--text-secondary)',
              fontWeight: tab === 'type' ? 600 : 500,
            }}
          >
            <Type size={15} />
            <span>Type</span>
          </button>

          <button
            onClick={() => setTab('upload')}
            className="btn btn-ghost"
            style={{
              flex: 1,
              borderRadius: 0,
              borderBottom: tab === 'upload' ? '2px solid var(--accent-primary)' : 'none',
              color: tab === 'upload' ? 'var(--accent-primary)' : 'var(--text-secondary)',
              fontWeight: tab === 'upload' ? 600 : 500,
            }}
          >
            <Upload size={15} />
            <span>Upload</span>
          </button>
        </div>

        {/* Tab Content */}
        <div style={{ padding: '20px' }}>
          {tab === 'draw' && (
            <div>
              <div style={{
                border: '1px solid var(--border-medium)',
                borderRadius: 'var(--radius-md)',
                background: '#ffffff',
                touchAction: 'none',
                position: 'relative',
                overflow: 'hidden',
              }}>
                <canvas
                  ref={canvasRef}
                  width={500}
                  height={180}
                  onMouseDown={startDrawing}
                  onMouseMove={draw}
                  onMouseUp={stopDrawing}
                  onMouseLeave={stopDrawing}
                  onTouchStart={startDrawing}
                  onTouchMove={draw}
                  onTouchEnd={stopDrawing}
                  style={{ width: '100%', height: '180px', display: 'block', cursor: 'crosshair' }}
                />

                {!hasDrawn && (
                  <div style={{
                    position: 'absolute',
                    inset: 0,
                    pointerEvents: 'none',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#94a3b8',
                    fontSize: '14px',
                    fontStyle: 'italic',
                  }}>
                    Sign here with mouse or stylus
                  </div>
                )}
              </div>

              {/* Controls */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginTop: '12px',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Ink:</span>
                  {['#0f172a', '#1e40af', '#15803d'].map((color) => (
                    <button
                      key={color}
                      onClick={() => setPenColor(color)}
                      style={{
                        width: '20px',
                        height: '20px',
                        borderRadius: '50%',
                        background: color,
                        border: penColor === color ? '2px solid var(--accent-primary)' : '1px solid #ffffff',
                        cursor: 'pointer',
                      }}
                    />
                  ))}
                </div>

                <button 
                  onClick={clearCanvas}
                  className="btn btn-ghost btn-sm"
                  style={{ fontSize: '12px' }}
                >
                  <RotateCcw size={13} />
                  <span>Clear</span>
                </button>
              </div>
            </div>
          )}

          {tab === 'type' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>
                  Your Full Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. Eleanor Vance"
                  value={typedName}
                  onChange={(e) => setTypedName(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border-medium)',
                    background: 'var(--bg-tertiary)',
                    color: 'var(--text-primary)',
                    outline: 'none',
                    fontSize: '15px',
                  }}
                />
              </div>

              {typedName && (
                <div style={{
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-md)',
                  padding: '24px',
                  textAlign: 'center',
                  background: '#ffffff',
                  color: penColor,
                  fontSize: '38px',
                  fontStyle: 'italic',
                  fontFamily: fontFamily,
                  userSelect: 'none',
                }}>
                  {typedName}
                </div>
              )}

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Style:</span>
                {['cursive', 'Brush Script MT, cursive', 'Georgia, serif'].map((f, i) => (
                  <button
                    key={f}
                    onClick={() => setFontFamily(f)}
                    className="btn btn-secondary btn-sm"
                    style={{ fontSize: '12px' }}
                  >
                    Style {i + 1}
                  </button>
                ))}
              </div>
            </div>
          )}

          {tab === 'upload' && (
            <div style={{
              border: '2px dashed var(--border-medium)',
              borderRadius: 'var(--radius-md)',
              padding: '36px 20px',
              textAlign: 'center',
            }}>
              <Upload size={32} color="var(--accent-primary)" style={{ margin: '0 auto 12px' }} />
              <p style={{ fontSize: '14px', fontWeight: 600, marginBottom: '4px' }}>
                Upload signature image
              </p>
              <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '16px' }}>
                PNG with transparent background recommended
              </p>
              <label className="btn btn-secondary btn-sm" style={{ cursor: 'pointer' }}>
                <span>Select PNG / JPG file</span>
                <input 
                  type="file" 
                  accept="image/png,image/jpeg" 
                  style={{ display: 'none' }} 
                  onChange={handleImageUpload} 
                />
              </label>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div style={{
          padding: '14px 20px',
          borderTop: '1px solid var(--border-subtle)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'flex-end',
          gap: '10px',
          background: 'var(--bg-tertiary)',
        }}>
          <button onClick={onClose} className="btn btn-secondary btn-sm">
            Cancel
          </button>
          <button 
            onClick={handleSave} 
            disabled={(tab === 'draw' && !hasDrawn) || (tab === 'type' && !typedName.trim())}
            className="btn btn-primary btn-sm"
          >
            <Check size={14} />
            <span>Use Signature</span>
          </button>
        </div>
      </div>
    </div>
  );
};
