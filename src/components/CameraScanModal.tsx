import React, { useState, useRef, useEffect } from 'react';
import { Camera, RefreshCw, Check, X, AlertCircle } from 'lucide-react';
import { PDFEngineService } from '../services/pdfEngine';

interface CameraScanModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCompleteScan: (file: File) => void;
}

export const CameraScanModal: React.FC<CameraScanModalProps> = ({
  isOpen,
  onClose,
  onCompleteScan,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [capturedImages, setCapturedImages] = useState<string[]>([]);
  const [hasCameraError, setHasCameraError] = useState<string | null>(null);
  const [highContrastMode, setHighContrastMode] = useState<boolean>(true);

  const stopCamera = React.useCallback(() => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }
  }, [stream]);

  const startCamera = React.useCallback(async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 1920 }, height: { ideal: 1080 } },
      });
      setHasCameraError(null);
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (err) {
      console.error(err);
      setHasCameraError('Unable to access camera. Please check browser permissions or connect a webcam.');
    }
  }, []);

  useEffect(() => {
    if (!isOpen) return;
    let isCancelled = false;
    let currentStream: MediaStream | null = null;
    const initCamera = async () => {
      try {
        const mediaStream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'environment', width: { ideal: 1920 }, height: { ideal: 1080 } },
        });
        if (isCancelled) {
          mediaStream.getTracks().forEach((track) => track.stop());
          return;
        }
        currentStream = mediaStream;
        setHasCameraError(null);
        setStream(mediaStream);
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
        }
      } catch (err) {
        if (!isCancelled) {
          console.error(err);
          setHasCameraError('Unable to access camera. Please check browser permissions or connect a webcam.');
        }
      }
    };
    void initCamera();
    return () => {
      isCancelled = true;
      if (currentStream) {
        currentStream.getTracks().forEach((track) => track.stop());
      }
      stopCamera();
    };
  }, [isOpen, stopCamera]);

  const handleCapture = () => {
    if (!videoRef.current) return;
    const video = videoRef.current;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth || 1280;
    canvas.height = video.videoHeight || 720;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Optional document enhancement filter
    if (highContrastMode) {
      ctx.filter = 'contrast(130%) brightness(105%) grayscale(20%)';
    }
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const dataUrl = canvas.toDataURL('image/jpeg', 0.92);
    setCapturedImages((prev) => [...prev, dataUrl]);
  };

  const handleFinalizePDF = async () => {
    if (capturedImages.length === 0) return;
    try {
      const imageBuffers = await Promise.all(
        capturedImages.map(async (url, idx) => {
          const res = await fetch(url);
          const buf = await res.arrayBuffer();
          return { name: `scan_page_${idx + 1}.jpg`, buffer: buf, type: 'image/jpeg' };
        })
      );

      const pdfBytes = await PDFEngineService.imagesToPDF(imageBuffers);
      const pdfFile = new File([new Uint8Array(pdfBytes)], `Camera_Scan_${Date.now()}.pdf`, {
        type: 'application/pdf',
      });
      onCompleteScan(pdfFile);
      onClose();
    } catch (err) {
      console.error(err);
      alert('Failed to generate PDF from captured photos.');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-backdrop animate-fade-in" onClick={onClose}>
      <div
        className="glass-panel animate-scale-up"
        style={{
          width: '90%',
          maxWidth: '780px',
          maxHeight: '90vh',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          boxShadow: 'var(--shadow-xl)',
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
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--accent-primary)',
            }}>
              <Camera size={18} />
            </div>
            <div>
              <h3 style={{ fontSize: '16px', fontWeight: 700 }}>Scan Document with Camera</h3>
              <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                Capture physical pages, receipts, or notes into a multi-page PDF locally.
              </p>
            </div>
          </div>
          <button onClick={onClose} className="btn btn-ghost btn-icon">
            <X size={18} />
          </button>
        </div>

        {/* Body Viewfinder */}
        <div style={{
          flex: 1,
          padding: '20px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#090d16',
          position: 'relative',
          minHeight: '360px',
        }}>
          {hasCameraError ? (
            <div style={{ textAlign: 'center', color: '#f87171', maxWidth: '360px', padding: '20px' }}>
              <AlertCircle size={40} style={{ margin: '0 auto 12px', opacity: 0.8 }} />
              <p style={{ fontSize: '14px', marginBottom: '14px' }}>{hasCameraError}</p>
              <button onClick={startCamera} className="btn btn-secondary btn-sm">
                <RefreshCw size={14} />
                <span>Retry Camera</span>
              </button>
            </div>
          ) : (
            <div style={{ position: 'relative', width: '100%', height: '100%', display: 'flex', justifyContent: 'center' }}>
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                style={{
                  maxHeight: '380px',
                  borderRadius: '8px',
                  border: '2px solid rgba(255, 255, 255, 0.1)',
                  boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
                }}
              />
              {/* Document Alignment Frame Guides */}
              <div style={{
                position: 'absolute',
                top: '15%',
                left: '20%',
                right: '20%',
                bottom: '15%',
                border: '2px dashed rgba(99, 102, 241, 0.6)',
                borderRadius: '8px',
                pointerEvents: 'none',
              }} />
            </div>
          )}
        </div>

        {/* Thumbnail Preview Rail if Pages Captured */}
        {capturedImages.length > 0 && (
          <div style={{
            padding: '10px 16px',
            background: 'var(--bg-tertiary)',
            borderTop: '1px solid var(--border-subtle)',
            display: 'flex',
            gap: '8px',
            overflowX: 'auto',
          }}>
            {capturedImages.map((img, i) => (
              <div key={i} style={{ position: 'relative', width: '60px', height: '80px', flexShrink: 0 }}>
                <img
                  src={img}
                  alt={`Scan ${i + 1}`}
                  style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '4px', border: '1px solid var(--border-medium)' }}
                />
                <button
                  onClick={() => setCapturedImages((prev) => prev.filter((_, idx) => idx !== i))}
                  style={{
                    position: 'absolute',
                    top: '-6px',
                    right: '-6px',
                    background: 'var(--error)',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '50%',
                    width: '18px',
                    height: '18px',
                    cursor: 'pointer',
                    fontSize: '11px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Bottom Actions */}
        <div style={{
          padding: '16px 20px',
          borderTop: '1px solid var(--border-subtle)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={highContrastMode}
              onChange={(e) => setHighContrastMode(e.target.checked)}
            />
            <span>Auto Enhance Document Contrast</span>
          </label>

          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              onClick={handleCapture}
              disabled={!!hasCameraError}
              className="btn btn-secondary"
              style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              <Camera size={16} />
              <span>Capture Page ({capturedImages.length})</span>
            </button>

            <button
              onClick={handleFinalizePDF}
              disabled={capturedImages.length === 0}
              className="btn btn-primary"
              style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              <Check size={16} />
              <span>Create PDF ({capturedImages.length} pages)</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
