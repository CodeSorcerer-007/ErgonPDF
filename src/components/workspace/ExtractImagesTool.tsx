import React from 'react';
import { Images, Download } from 'lucide-react';
import { PDFEngineService } from '../../services/pdfEngine';
import type { PDFDocumentState } from '../../types/pdf';

export interface ExtractImagesToolProps {
  docState: PDFDocumentState;
  isProcessing: boolean;
  setIsProcessing: (val: boolean) => void;
  setProcessingStatus: (status: string) => void;
}

export const ExtractImagesTool: React.FC<ExtractImagesToolProps> = ({
  docState,
  isProcessing,
  setIsProcessing,
  setProcessingStatus,
}) => {
  const handleExtractImages = async () => {
    setIsProcessing(true);
    setProcessingStatus('Isolating embedded images and packing ZIP…');
    try {
      const zipBlob = await PDFEngineService.extractImagesToZip(docState.arrayBuffer);
      const url = URL.createObjectURL(zipBlob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = `${docState.name.replace(/\.[^/.]+$/, '')}_images.zip`;
      document.body.appendChild(a);
      a.click();
      setTimeout(() => {
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }, 100);
    } catch (err) {
      console.error('Failed to extract images:', err);
      alert('Could not extract images from this document.');
    } finally {
      setIsProcessing(false);
      setProcessingStatus('');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <Images size={16} color="var(--accent-primary)" />
        <h4 style={{ fontSize: '15px', fontWeight: 700 }}>Extract Images</h4>
      </div>
      <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
        Dump all high-resolution pictures and photos from this PDF into a compressed ZIP archive.
      </p>
      <button
        type="button"
        onClick={handleExtractImages}
        disabled={isProcessing}
        className="btn btn-primary btn-sm"
        style={{ width: '100%' }}
      >
        <Download size={14} />
        <span>Download All Images (ZIP)</span>
      </button>
    </div>
  );
};
