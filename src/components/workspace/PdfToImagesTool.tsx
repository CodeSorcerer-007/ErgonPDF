import React from 'react';
import { Images, Download } from 'lucide-react';
import JSZip from 'jszip';
import { PDFEngineService } from '../../services/pdfEngine';
import type { PDFDocumentState } from '../../types/pdf';

export interface PdfToImagesToolProps {
  docState: PDFDocumentState;
  pdfImagesFormat: 'png' | 'jpeg' | 'webp';
  onPdfImagesFormatChange: (fmt: 'png' | 'jpeg' | 'webp') => void;
  isProcessing: boolean;
  setIsProcessing: (val: boolean) => void;
  setProcessingStatus: (status: string) => void;
}

export const PdfToImagesTool: React.FC<PdfToImagesToolProps> = ({
  docState,
  pdfImagesFormat,
  onPdfImagesFormatChange,
  isProcessing,
  setIsProcessing,
  setProcessingStatus,
}) => {
  const handleConvertImages = async () => {
    setIsProcessing(true);
    setProcessingStatus('Rendering pages to images and compressing ZIP…');
    try {
      const images = await PDFEngineService.convertToImages(docState.arrayBuffer, pdfImagesFormat, 2.0);
      const zip = new JSZip();
      images.forEach((img) => {
        zip.file(`page_${img.pageNumber}.${pdfImagesFormat}`, img.blob);
      });
      const zipBlob = await zip.generateAsync({ type: 'blob' });
      const url = URL.createObjectURL(zipBlob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = `${docState.name.replace('.pdf', '')}_images.zip`;
      document.body.appendChild(a);
      a.click();
      setTimeout(() => {
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }, 100);
    } catch (err) {
      console.error('Failed to convert pages to images:', err);
      alert('Could not convert pages to images.');
    } finally {
      setIsProcessing(false);
      setProcessingStatus('');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <Images size={16} color="var(--accent-primary)" />
        <h4 style={{ fontSize: '15px', fontWeight: 700 }}>PDF to Images (ZIP)</h4>
      </div>
      <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
        Renders every page into high-resolution standalone images packed in a ZIP.
      </p>

      <div>
        <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)' }}>Image Format</label>
        <select
          value={pdfImagesFormat}
          onChange={(e) => onPdfImagesFormatChange(e.target.value as any)}
          style={{
            width: '100%',
            padding: '8px 12px',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border-medium)',
            background: 'var(--bg-tertiary)',
            color: 'var(--text-primary)',
            marginTop: '4px',
            fontSize: '13px',
          }}
        >
          <option value="png">PNG (Lossless & Crisp)</option>
          <option value="jpeg">JPEG (Compressed Photo)</option>
          <option value="webp">WebP (Modern Compact)</option>
        </select>
      </div>

      <button
        type="button"
        onClick={handleConvertImages}
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
