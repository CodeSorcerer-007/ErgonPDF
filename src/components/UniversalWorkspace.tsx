import React, { useState, useEffect, useRef } from 'react';
import { 
  ArrowLeft, 
  ZoomIn, 
  ZoomOut, 
  RotateCw, 
  RotateCcw, 
  Trash2, 
  Copy, 
  Undo, 
  Redo, 
  Download, 
  Sparkles, 
  PenTool, 
  ScanText, 
  ShieldCheck, 
  Check, 
  Loader2, 
  ArrowUp, 
  ArrowDown, 
  ChevronLeft, 
  ChevronRight, 
  FileText,
  Lock,
  EyeOff,
  Columns2,
  Grid2X2,
  BookOpen,
  Crop,
  Maximize2,
  Images,
  Table,
  QrCode,
  Shuffle,
  CopyPlus,
  Archive,
  KeyRound,
  Wrench,
  Zap,
  Scissors,
  Layers,
  CheckSquare,
  Eye,
  FolderDown,
  FileCode,
  RefreshCw
} from 'lucide-react';
import JSZip from 'jszip';
import type { 
  PDFDocumentState, 
  PDFPageInfo, 
  PlacedSignature, 
  RedactionBox, 
  SignatureData, 
  WatermarkSettings, 
  PageNumberSettings,
  NUpSettings,
  CropSettings,
  ResizeSettings,
  QRCodeSettings
} from '../types/pdf';
import { PDFEngineService } from '../services/pdfEngine';
import { OCRService } from '../services/ocrService';
import { SignatureModal } from './SignatureModal';
import { AiStudioModal } from './AiStudioModal';
import confetti from 'canvas-confetti';

interface UniversalWorkspaceProps {
  document: PDFDocumentState;
  activeToolId?: string;
  onCloseWorkspace: () => void;
  onSaveRecent: (name: string, action: string, size: number) => void;
}

export const UniversalWorkspace: React.FC<UniversalWorkspaceProps> = ({
  document: initialDoc,
  activeToolId = 'organize',
  onCloseWorkspace,
  onSaveRecent,
}) => {
  // Document State
  const [docState, setDocState] = useState<PDFDocumentState>(initialDoc);
  const [currentPageNum, setCurrentPageNum] = useState<number>(1);
  const [zoomScale, setZoomScale] = useState<number>(1.0);
  const [currentToolTab, setCurrentToolTab] = useState<string>(activeToolId);

  // Canvas Refs
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Signature & Redaction States
  const [placedSignatures, setPlacedSignatures] = useState<PlacedSignature[]>([]);
  const [redactions, setRedactions] = useState<RedactionBox[]>([]);
  const [isSigModalOpen, setIsSigModalOpen] = useState<boolean>(false);
  const [isAiModalOpen, setIsAiModalOpen] = useState<boolean>(false);

  // Drawing & Annotation States
  const [annotationColor, setAnnotationColor] = useState<string>('#f59e0b');
  const [annotationWidth, setAnnotationWidth] = useState<number>(4);
  const [annotationMode, setAnnotationMode] = useState<'pen' | 'highlighter'>('pen');
  const [isDrawing, setIsDrawing] = useState<boolean>(false);
  const annotationCanvasRef = useRef<HTMLCanvasElement>(null);

  // Advanced Compression State
  const [compressionPreset, setCompressionPreset] = useState<'lossless' | 'balanced' | 'max' | 'grayscale'>('balanced');
  const [compressionGrayscale, setCompressionGrayscale] = useState<boolean>(false);
  const [compressionDpi, setCompressionDpi] = useState<number>(150);
  const [compressionQuality, setCompressionQuality] = useState<number>(0.7);

  const [watermarkSettings, setWatermarkSettings] = useState<WatermarkSettings>({
    text: 'CONFIDENTIAL',
    fontSize: 48,
    opacity: 0.25,
    rotation: -45,
    color: 'grey',
    pages: 'all',
  });
  const [pageNumberSettings, setPageNumberSettings] = useState<PageNumberSettings>({
    format: 'Page 1 of n',
    position: 'bottom-center',
    fontSize: 11,
    startNumber: 1,
    margin: 24,
  });
  const [protectPassword, setProtectPassword] = useState<string>('');
  const [metadataFields, setMetadataFields] = useState({
    title: initialDoc.metadata?.title || initialDoc.name.replace('.pdf', ''),
    author: initialDoc.metadata?.author || '',
    subject: initialDoc.metadata?.subject || '',
  });

  // PDF24 Layout & Imposition Tool States
  const [nUpSettings, setNUpSettings] = useState<NUpSettings>({
    pagesPerSheet: 2,
    orientation: 'auto',
    addBorder: true,
  });
  const [cropSettings, setCropSettings] = useState<CropSettings>({
    topPercent: 5,
    bottomPercent: 5,
    leftPercent: 5,
    rightPercent: 5,
    applyToAll: true,
  });
  const [resizeSettings, setResizeSettings] = useState<ResizeSettings>({
    targetSize: 'A4',
    orientation: 'portrait',
  });
  const [extractedCsvText, setExtractedCsvText] = useState<string>('');

  // Extended Tool States
  const [extractRangeText, setExtractRangeText] = useState<string>('1');
  const [splitEveryN, setSplitEveryN] = useState<number>(1);
  const [qrSettings, setQrSettings] = useState<QRCodeSettings>({
    text: 'https://ergonpdf.com',
    sizePercent: 20,
    position: 'bottom-right',
    margin: 24,
  });
  const [formFieldState, setFormFieldState] = useState<{ type: 'text' | 'checkbox'; name: string }>({
    type: 'text',
    name: 'Customer Name',
  });
  const [extractedDocText, setExtractedDocText] = useState<string>('');
  const [alternateMixFile, setAlternateMixFile] = useState<File | null>(null);
  const [alternateMixReverse, setAlternateMixReverse] = useState<boolean>(true);
  const [overlayFile, setOverlayFile] = useState<File | null>(null);
  const [overlayIsUnderlay, setOverlayIsUnderlay] = useState<boolean>(false);
  const [flattenDpi, setFlattenDpi] = useState<number>(150);
  const [pdfImagesFormat, setPdfImagesFormat] = useState<'png' | 'jpeg' | 'webp'>('png');
  const [genPassLen, setGenPassLen] = useState<number>(20);
  const [genPassVal, setGenPassVal] = useState<string>('k8$Nm9#xP2@qL5vW');
  const [genPassCopied, setGenPassCopied] = useState<boolean>(false);

  // OCR state
  const [ocrText, setOcrText] = useState<string>('');
  const [ocrProgress, setOcrProgress] = useState<string>('');
  const [isOcrLoading, setIsOcrLoading] = useState<boolean>(false);

  // Processing & Feedback State
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [processingStatus, setProcessingStatus] = useState<string>('');
  const [completedBlobUrl, setCompletedBlobUrl] = useState<string | null>(null);
  const [completedStats, setCompletedStats] = useState<{ original: number; newSize: number } | null>(null);

  // Undo/Redo History Stack
  const [history, setHistory] = useState<PDFPageInfo[][]>([initialDoc.pages]);
  const [historyIndex, setHistoryIndex] = useState<number>(0);

  // Update tool tab when activeToolId prop changes
  useEffect(() => {
    if (activeToolId) {
      setCurrentToolTab(activeToolId);
    }
  }, [activeToolId]);

  // Render current page onto canvas
  useEffect(() => {
    if (canvasRef.current && docState.arrayBuffer) {
      const activePage = docState.pages[currentPageNum - 1];
      if (activePage && !activePage.deleted) {
        PDFEngineService.renderPageToCanvas(
          docState.arrayBuffer,
          activePage.originalIndex + 1,
          canvasRef.current,
          zoomScale
        ).then(() => {
          if (canvasRef.current && annotationCanvasRef.current) {
            annotationCanvasRef.current.width = canvasRef.current.width;
            annotationCanvasRef.current.height = canvasRef.current.height;
            const ctx = annotationCanvasRef.current.getContext('2d');
            if (ctx) {
              ctx.clearRect(0, 0, annotationCanvasRef.current.width, annotationCanvasRef.current.height);
              const existingAnnot = placedSignatures.find((s) => s.id === `annot-page-${currentPageNum}`);
              if (existingAnnot) {
                const img = new Image();
                img.onload = () => ctx.drawImage(img, 0, 0);
                img.src = existingAnnot.dataUrl;
              }
            }
          }
        });
      }
    }
  }, [docState, currentPageNum, zoomScale, placedSignatures]);

  const handleStartDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (currentToolTab !== 'annotate-pdf' || !annotationCanvasRef.current) return;
    const canvas = annotationCanvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    ctx.strokeStyle = annotationColor;
    ctx.lineWidth = annotationWidth * (canvas.width / 600);
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.globalAlpha = annotationMode === 'highlighter' ? 0.35 : 1.0;
    ctx.beginPath();
    ctx.moveTo((e.clientX - rect.left) * scaleX, (e.clientY - rect.top) * scaleY);
    setIsDrawing(true);
  };

  const handleDraw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing || currentToolTab !== 'annotate-pdf' || !annotationCanvasRef.current) return;
    const canvas = annotationCanvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    ctx.lineTo((e.clientX - rect.left) * scaleX, (e.clientY - rect.top) * scaleY);
    ctx.stroke();
  };

  const handleStopDrawing = () => {
    if (!isDrawing) return;
    setIsDrawing(false);
    if (!annotationCanvasRef.current) return;
    const dataUrl = annotationCanvasRef.current.toDataURL('image/png');
    setPlacedSignatures((prev) => [
      ...prev.filter((s) => s.id !== `annot-page-${currentPageNum}`),
      {
        id: `annot-page-${currentPageNum}`,
        pageNumber: currentPageNum,
        dataUrl,
        xPercent: 0,
        yPercent: 0,
        widthPercent: 100,
        heightPercent: 100,
      }
    ]);
  };

  const handleClearAnnotations = () => {
    if (annotationCanvasRef.current) {
      const ctx = annotationCanvasRef.current.getContext('2d');
      if (ctx) ctx.clearRect(0, 0, annotationCanvasRef.current.width, annotationCanvasRef.current.height);
    }
    setPlacedSignatures((prev) => prev.filter((s) => s.id !== `annot-page-${currentPageNum}`));
  };

  // Push state to history
  const pushHistory = (newPages: PDFPageInfo[]) => {
    const updatedHistory = history.slice(0, historyIndex + 1);
    updatedHistory.push(newPages);
    setHistory(updatedHistory);
    setHistoryIndex(updatedHistory.length - 1);
    setDocState((prev: PDFDocumentState) => ({ ...prev, pages: newPages }));
  };

  const handleUndo = () => {
    if (historyIndex > 0) {
      setHistoryIndex((prev: number) => prev - 1);
      setDocState((prev: PDFDocumentState) => ({ ...prev, pages: history[historyIndex - 1] }));
    }
  };

  const handleRedo = () => {
    if (historyIndex < history.length - 1) {
      setHistoryIndex((prev: number) => prev + 1);
      setDocState((prev: PDFDocumentState) => ({ ...prev, pages: history[historyIndex + 1] }));
    }
  };

  // Page Operations
  const handleRotatePage = (delta: number) => {
    const newPages = docState.pages.map((p: PDFPageInfo, idx: number) => {
      if (idx === currentPageNum - 1) {
        return { ...p, rotation: (p.rotation + delta + 360) % 360 };
      }
      return p;
    });
    pushHistory(newPages);
  };

  const handleDeletePage = (pageIdx: number) => {
    const activePagesList = docState.pages.filter((p: PDFPageInfo) => !p.deleted);
    if (activePagesList.length <= 1) {
      alert('A document must have at least one page.');
      return;
    }
    const newPages = docState.pages.map((p: PDFPageInfo, idx: number) => (idx === pageIdx ? { ...p, deleted: true } : p));
    pushHistory(newPages);
    if (currentPageNum > 1 && currentPageNum >= activePagesList.length) {
      setCurrentPageNum((prev: number) => Math.max(1, prev - 1));
    }
  };

  const handleDuplicatePage = (pageIdx: number) => {
    const target = docState.pages[pageIdx];
    const newPage: PDFPageInfo = {
      ...target,
      pageNumber: docState.pages.length + 1,
    };
    const newPages = [...docState.pages];
    newPages.splice(pageIdx + 1, 0, newPage);
    pushHistory(newPages);
  };

  const handleMovePage = (index: number, direction: 'up' | 'down') => {
    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= docState.pages.length) return;
    const newPages = [...docState.pages];
    const temp = newPages[index];
    newPages[index] = newPages[targetIdx];
    newPages[targetIdx] = temp;
    pushHistory(newPages);
    setCurrentPageNum(targetIdx + 1);
  };

  // Add Placed Signature
  const handleAddSignature = (sig: SignatureData) => {
    const newPlaced: PlacedSignature = {
      id: `sig-${Date.now()}`,
      pageNumber: currentPageNum,
      xPercent: 35,
      yPercent: 70,
      widthPercent: 28,
      heightPercent: 28 / sig.aspectRatio,
      dataUrl: sig.dataUrl,
    };
    setPlacedSignatures((prev) => [...prev, newPlaced]);
  };

  // Add Redaction Box
  const handleAddRedactionBox = () => {
    const newBox: RedactionBox = {
      id: `redact-${Date.now()}`,
      pageNumber: currentPageNum,
      xPercent: 20,
      yPercent: 30,
      widthPercent: 60,
      heightPercent: 12,
    };
    setRedactions((prev) => [...prev, newBox]);
  };

  // Run OCR on current page
  const handleRunOCR = async () => {
    if (!canvasRef.current) return;
    setIsOcrLoading(true);
    setOcrProgress('Initializing local OCR engine…');

    try {
      const dataUrl = canvasRef.current.toDataURL('image/png');
      const result = await OCRService.recognizeImage(dataUrl, 'eng', (status, progress) => {
        setOcrProgress(`${status} (${Math.round(progress * 100)}%)`);
      });
      setOcrText(result.text);
    } catch (err) {
      console.error(err);
      setOcrText('OCR processing failed on this page.');
    } finally {
      setIsOcrLoading(false);
      setOcrProgress('');
    }
  };

  // Primary Action: Apply changes and compile final PDF
  const handleExportPDF = async () => {
    setIsProcessing(true);
    setProcessingStatus('Processing document…');

    try {
      let currentBuffer = docState.arrayBuffer;

      // 1. Reorder / Rotate / Delete pages
      setProcessingStatus('Rebuilding pages…');
      const pageConfigs = docState.pages.map((p: PDFPageInfo) => ({
        originalIndex: p.originalIndex,
        rotation: p.rotation,
        deleted: p.deleted,
      }));
      let modifiedBytes = await PDFEngineService.reorderAndTransformPages(currentBuffer, pageConfigs);
      currentBuffer = modifiedBytes.buffer as ArrayBuffer;

      // 2. Signatures
      if (placedSignatures.length > 0) {
        setProcessingStatus('Baking digital signatures…');
        modifiedBytes = await PDFEngineService.applySignatures(currentBuffer, placedSignatures);
        currentBuffer = modifiedBytes.buffer as ArrayBuffer;
      }

      // 3. Redactions
      if (redactions.length > 0) {
        setProcessingStatus('Flattening redaction blackouts…');
        modifiedBytes = await PDFEngineService.applyRedactions(currentBuffer, redactions);
        currentBuffer = modifiedBytes.buffer as ArrayBuffer;
      }

      // 4. Watermark if configured
      if (currentToolTab === 'watermark-pdf' && watermarkSettings.text) {
        setProcessingStatus('Applying watermark…');
        modifiedBytes = await PDFEngineService.addWatermark(currentBuffer, watermarkSettings);
        currentBuffer = modifiedBytes.buffer as ArrayBuffer;
      }

      // 5. Page numbers if configured
      if (currentToolTab === 'page-numbers') {
        setProcessingStatus('Stamping page numbers…');
        modifiedBytes = await PDFEngineService.addPageNumbers(currentBuffer, pageNumberSettings);
        currentBuffer = modifiedBytes.buffer as ArrayBuffer;
      }

      // 6. Compression or Special PDF24 Transformations
      let finalBytes = modifiedBytes;
      if (currentToolTab === 'compress-pdf') {
        setProcessingStatus('Running adaptive compression engine…');
        const comp = await PDFEngineService.compressDocument(currentBuffer, {
          level: compressionPreset,
          imageQuality: compressionQuality,
          dpi: compressionDpi,
          removeMetadata: true,
          grayscale: compressionGrayscale || compressionPreset === 'grayscale',
        });
        finalBytes = comp.data;
        setCompletedStats({
          original: docState.size,
          newSize: comp.compressedSize,
        });
      } else if (currentToolTab === 'halve-pdf') {
        setProcessingStatus('Splitting 2-in-1 spreads in half…');
        finalBytes = await PDFEngineService.halvePages(currentBuffer);
      } else if (currentToolTab === 'pages-per-sheet') {
        setProcessingStatus(`Imposing ${nUpSettings.pagesPerSheet} pages per sheet…`);
        finalBytes = await PDFEngineService.nUpImposition(currentBuffer, nUpSettings);
      } else if (currentToolTab === 'booklet-pdf') {
        setProcessingStatus('Generating saddle-stitch booklet imposition…');
        finalBytes = await PDFEngineService.createBooklet(currentBuffer);
      } else if (currentToolTab === 'crop-pdf') {
        setProcessingStatus('Applying crop bounds…');
        finalBytes = await PDFEngineService.cropDocument(currentBuffer, cropSettings);
      } else if (currentToolTab === 'resize-pdf') {
        setProcessingStatus(`Resizing pages to ${resizeSettings.targetSize}…`);
        finalBytes = await PDFEngineService.resizeDocument(currentBuffer, resizeSettings);
      } else if (currentToolTab === 'remove-blank-pages') {
        setProcessingStatus('Scanning and pruning blank pages…');
        const res = await PDFEngineService.removeBlankPages(currentBuffer);
        finalBytes = res.data;
      } else if (currentToolTab === 'flatten-pdf') {
        setProcessingStatus('Rasterizing and flattening all PDF layers…');
        finalBytes = await PDFEngineService.flattenAndRasterize(currentBuffer, flattenDpi);
      } else if (currentToolTab === 'repair-pdf') {
        setProcessingStatus('Reconstructing XREF tables and streams…');
        finalBytes = await PDFEngineService.repairDocument(currentBuffer);
      } else if (currentToolTab === 'web-optimize') {
        setProcessingStatus('Linearizing streams for fast web view…');
        finalBytes = await PDFEngineService.webOptimize(currentBuffer);
      } else if (currentToolTab === 'qr-code-pdf') {
        setProcessingStatus('Stamping dynamic QR code onto active page…');
        finalBytes = await PDFEngineService.stampQRCode(currentBuffer, currentPageNum, qrSettings.text, qrSettings);
      } else if (currentToolTab === 'pdf-to-pdfa') {
        setProcessingStatus('Applying ISO PDF/A-1b archival profile…');
        finalBytes = await PDFEngineService.convertToPdfA(currentBuffer);
      } else if (currentToolTab === 'alternate-mix' && alternateMixFile) {
        setProcessingStatus('Interleaving pages from both documents…');
        const bufB = await alternateMixFile.arrayBuffer();
        finalBytes = await PDFEngineService.alternateMixDocuments(currentBuffer, bufB, alternateMixReverse);
      } else if (currentToolTab === 'overlay-pdf' && overlayFile) {
        setProcessingStatus('Merging letterhead template…');
        const bufT = await overlayFile.arrayBuffer();
        finalBytes = await PDFEngineService.overlayDocument(currentBuffer, bufT, overlayIsUnderlay);
      } else if (currentToolTab === 'protect-pdf' && protectPassword) {
        setProcessingStatus('Encrypting document with AES-256…');
        finalBytes = await PDFEngineService.encryptDocument(currentBuffer, protectPassword);
      }

      setCompletedStats({
        original: docState.size,
        newSize: finalBytes.byteLength,
      });

      // Ensure download file name has proper .pdf extension
      const safeDownloadName = docState.name.toLowerCase().endsWith('.pdf')
        ? docState.name
        : `${docState.name}.pdf`;

      // Create download blob
      const blob = new Blob([new Uint8Array(finalBytes)], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      setCompletedBlobUrl(url);

      onSaveRecent(safeDownloadName, currentToolTab, finalBytes.byteLength);

      confetti({
        particleCount: 60,
        spread: 70,
        origin: { y: 0.8 },
      });
    } catch (err) {
      console.error(err);
      alert('An error occurred while compiling your PDF. Please check page options.');
    } finally {
      setIsProcessing(false);
      setProcessingStatus('');
    }
  };

  const activePages = docState.pages.filter((p: PDFPageInfo) => !p.deleted);
  const activePage = docState.pages[currentPageNum - 1];

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      height: '100vh',
      background: 'var(--bg-primary)',
      overflow: 'hidden',
    }}>
      {/* 1. Top Workspace Header Toolbar */}
      <div className="glass-panel" style={{
        borderRadius: 0,
        borderLeft: 'none',
        borderRight: 'none',
        borderTop: 'none',
        padding: '10px 20px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        zIndex: 20,
      }}>
        {/* Left: Back & Document Title */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button 
            onClick={onCloseWorkspace}
            className="btn btn-secondary btn-sm"
            title="Return to Home"
          >
            <ArrowLeft size={14} />
            <span>Home</span>
          </button>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{
              fontWeight: 700,
              fontSize: '15px',
              maxWidth: '240px',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}>
              {docState.name}
            </span>
            <span className="badge badge-muted" style={{ fontSize: '11px' }}>
              {(docState.size / (1024 * 1024)).toFixed(1)} MB
            </span>
            <span className="badge badge-privacy" style={{ fontSize: '11px' }}>
              100% Local
            </span>
          </div>
        </div>

        {/* Center: Zoom, Page Navigation, Undo/Redo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {/* Undo / Redo */}
          <button
            onClick={handleUndo}
            disabled={historyIndex === 0}
            className="btn btn-ghost btn-icon"
            title="Undo (Ctrl + Z)"
          >
            <Undo size={15} />
          </button>
          <button
            onClick={handleRedo}
            disabled={historyIndex >= history.length - 1}
            className="btn btn-ghost btn-icon"
            title="Redo (Ctrl + Y)"
          >
            <Redo size={15} />
          </button>

          <div style={{ width: '1px', height: '20px', background: 'var(--border-medium)', margin: '0 4px' }} />

          {/* Page Navigator */}
          <button
            onClick={() => setCurrentPageNum((p) => Math.max(1, p - 1))}
            disabled={currentPageNum === 1}
            className="btn btn-ghost btn-icon"
            title="Previous Page"
          >
            <ChevronLeft size={16} />
          </button>
          <span style={{ fontSize: '13px', fontWeight: 600, minWidth: '70px', textAlign: 'center' }}>
            {currentPageNum} / {activePages.length}
          </span>
          <button
            onClick={() => setCurrentPageNum((p) => Math.min(activePages.length, p + 1))}
            disabled={currentPageNum === activePages.length}
            className="btn btn-ghost btn-icon"
            title="Next Page"
          >
            <ChevronRight size={16} />
          </button>

          <div style={{ width: '1px', height: '20px', background: 'var(--border-medium)', margin: '0 4px' }} />

          {/* Zoom Controls */}
          <button
            onClick={() => setZoomScale((z) => Math.max(0.4, Number((z - 0.15).toFixed(2))))}
            className="btn btn-ghost btn-icon"
            title="Zoom Out"
          >
            <ZoomOut size={15} />
          </button>
          <span style={{ fontSize: '12px', fontFamily: 'var(--font-mono)', minWidth: '42px', textAlign: 'center' }}>
            {Math.round(zoomScale * 100)}%
          </span>
          <button
            onClick={() => setZoomScale((z) => Math.min(2.5, Number((z + 0.15).toFixed(2))))}
            className="btn btn-ghost btn-icon"
            title="Zoom In"
          >
            <ZoomIn size={15} />
          </button>

          <div style={{ width: '1px', height: '20px', background: 'var(--border-medium)', margin: '0 4px' }} />

          {/* Rotate Current Page */}
          <button
            onClick={() => handleRotatePage(-90)}
            className="btn btn-ghost btn-icon"
            title="Rotate Left 90°"
          >
            <RotateCcw size={15} />
          </button>
          <button
            onClick={() => handleRotatePage(90)}
            className="btn btn-ghost btn-icon"
            title="Rotate Right 90°"
          >
            <RotateCw size={15} />
          </button>
        </div>

        {/* Right: AI Studio & Export Trigger */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button
            onClick={() => setIsAiModalOpen(true)}
            className="btn btn-secondary btn-sm"
            style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <Sparkles size={14} color="#8b5cf6" />
            <span>AI Studio</span>
          </button>

          <button
            onClick={handleExportPDF}
            disabled={isProcessing}
            className="btn btn-primary btn-sm"
          >
            {isProcessing ? (
              <>
                <Loader2 size={14} className="animate-spin" />
                <span>{processingStatus}</span>
              </>
            ) : (
              <>
                <Download size={14} />
                <span>Export PDF</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* 2. Main Workspace Layout: Thumbnails Sidebar + Center Canvas + Right Tool Settings */}
      <div style={{
        flex: 1,
        display: 'flex',
        overflow: 'hidden',
        position: 'relative',
      }}>
        {/* Left Thumbnails Rail */}
        <aside style={{
          width: '240px',
          background: 'var(--bg-secondary)',
          borderRight: '1px solid var(--border-subtle)',
          display: 'flex',
          flexDirection: 'column',
          overflowY: 'auto',
          padding: '16px 12px',
          gap: '12px',
          flexShrink: 0,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 4px' }}>
            <span style={{ fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)' }}>
              Pages ({activePages.length})
            </span>
          </div>

          {docState.pages.map((page: PDFPageInfo, index: number) => {
            if (page.deleted) return null;
            const isSelected = index === currentPageNum - 1;

            return (
              <div
                key={index}
                onClick={() => setCurrentPageNum(index + 1)}
                className="glass-card"
                style={{
                  padding: '8px',
                  cursor: 'pointer',
                  border: isSelected ? '2px solid var(--accent-primary)' : '1px solid var(--border-subtle)',
                  background: isSelected ? 'var(--accent-primary-light)' : 'var(--bg-tertiary)',
                  position: 'relative',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '6px',
                }}
              >
                {/* Thumbnail Image */}
                <div style={{
                  height: '140px',
                  background: '#ffffff',
                  borderRadius: '4px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  overflow: 'hidden',
                  position: 'relative',
                }}>
                  {page.thumbnailUrl ? (
                    <img 
                      src={page.thumbnailUrl} 
                      alt={`Page ${index + 1}`}
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'contain',
                        transform: `rotate(${page.rotation}deg)`,
                        transition: 'transform var(--transition-fast)',
                      }}
                    />
                  ) : (
                    <FileText size={28} color="#94a3b8" />
                  )}

                  {/* Page number badge */}
                  <span style={{
                    position: 'absolute',
                    bottom: '6px',
                    left: '6px',
                    background: 'rgba(15, 23, 42, 0.75)',
                    color: '#ffffff',
                    fontSize: '10px',
                    fontWeight: 700,
                    padding: '1px 6px',
                    borderRadius: '4px',
                  }}>
                    {index + 1}
                  </span>
                </div>

                {/* Page Quick Actions Bar */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  paddingTop: '4px',
                }}>
                  <div style={{ display: 'flex', gap: '2px' }}>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleMovePage(index, 'up');
                      }}
                      disabled={index === 0}
                      className="btn btn-ghost btn-icon"
                      style={{ padding: '3px' }}
                      title="Move page up"
                    >
                      <ArrowUp size={12} />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleMovePage(index, 'down');
                      }}
                      disabled={index === docState.pages.length - 1}
                      className="btn btn-ghost btn-icon"
                      style={{ padding: '3px' }}
                      title="Move page down"
                    >
                      <ArrowDown size={12} />
                    </button>
                  </div>

                  <div style={{ display: 'flex', gap: '2px' }}>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDuplicatePage(index);
                      }}
                      className="btn btn-ghost btn-icon"
                      style={{ padding: '3px' }}
                      title="Duplicate page"
                    >
                      <Copy size={12} />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeletePage(index);
                      }}
                      className="btn btn-ghost btn-icon"
                      style={{ padding: '3px', color: 'var(--error)' }}
                      title="Delete page"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </aside>

        {/* Center Canvas Workspace */}
        <main style={{
          flex: 1,
          background: 'var(--bg-primary)',
          overflow: 'auto',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '40px',
          position: 'relative',
        }}>
          {activePage ? (
            <div style={{
              position: 'relative',
              boxShadow: 'var(--shadow-xl)',
              borderRadius: '4px',
              background: '#ffffff',
              transform: `rotate(${activePage.rotation}deg)`,
              transition: 'transform var(--transition-fast)',
            }}>
              <canvas ref={canvasRef} style={{ display: 'block', borderRadius: '4px' }} />

              {/* Drawing Annotation Layer */}
              <canvas
                ref={annotationCanvasRef}
                style={{
                  position: 'absolute',
                  left: 0,
                  top: 0,
                  width: '100%',
                  height: '100%',
                  borderRadius: '4px',
                  pointerEvents: currentToolTab === 'annotate-pdf' ? 'auto' : 'none',
                  cursor: currentToolTab === 'annotate-pdf' ? 'crosshair' : 'default',
                  zIndex: 2,
                }}
                onMouseDown={handleStartDrawing}
                onMouseMove={handleDraw}
                onMouseUp={handleStopDrawing}
                onMouseLeave={handleStopDrawing}
              />

              {/* Placed Signatures Overlay */}
              {placedSignatures
                .filter((s) => s.pageNumber === currentPageNum)
                .map((sig) => (
                  <div
                    key={sig.id}
                    style={{
                      position: 'absolute',
                      left: `${sig.xPercent}%`,
                      top: `${sig.yPercent}%`,
                      width: `${sig.widthPercent}%`,
                      cursor: 'move',
                      border: '1px dashed var(--accent-primary)',
                      padding: '4px',
                      borderRadius: '4px',
                      background: 'rgba(99, 102, 241, 0.08)',
                    }}
                  >
                    <img src={sig.dataUrl} alt="Signature" style={{ width: '100%', display: 'block' }} />
                    <button
                      onClick={() => setPlacedSignatures((p) => p.filter((s) => s.id !== sig.id))}
                      style={{
                        position: 'absolute',
                        top: '-8px',
                        right: '-8px',
                        background: 'var(--error)',
                        color: '#fff',
                        border: 'none',
                        borderRadius: '50%',
                        width: '18px',
                        height: '18px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      ×
                    </button>
                  </div>
                ))}

              {/* Redaction Boxes Overlay */}
              {redactions
                .filter((r) => r.pageNumber === currentPageNum)
                .map((r) => (
                  <div
                    key={r.id}
                    style={{
                      position: 'absolute',
                      left: `${r.xPercent}%`,
                      top: `${r.yPercent}%`,
                      width: `${r.widthPercent}%`,
                      height: `${r.heightPercent}%`,
                      background: '#000000',
                      border: '1px solid #ef4444',
                      borderRadius: '2px',
                    }}
                  >
                    <button
                      onClick={() => setRedactions((prev) => prev.filter((b) => b.id !== r.id))}
                      style={{
                        position: 'absolute',
                        top: '-8px',
                        right: '-8px',
                        background: 'var(--error)',
                        color: '#fff',
                        border: 'none',
                        borderRadius: '50%',
                        width: '16px',
                        height: '16px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '11px',
                      }}
                    >
                      ×
                    </button>
                  </div>
                ))}
            </div>
          ) : (
            <div style={{ textAlign: 'center', color: 'var(--text-muted)' }}>
              Page not available
            </div>
          )}
        </main>

        {/* Right Contextual Tool Panel */}
        <aside style={{
          width: '320px',
          background: 'var(--bg-secondary)',
          borderLeft: '1px solid var(--border-subtle)',
          display: 'flex',
          flexDirection: 'column',
          overflowY: 'auto',
          flexShrink: 0,
        }}>
          {/* Tool Tabs Header with Smart Tool Switcher Dropdown */}
          <div style={{
            padding: '12px 16px',
            borderBottom: '1px solid var(--border-subtle)',
            background: 'var(--bg-tertiary)',
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', letterSpacing: '0.5px' }}>
                Active Tool
              </span>
              <span className="badge badge-accent" style={{ fontSize: '10px' }}>
                38 Tools Active
              </span>
            </div>

            {/* Smart Tool Selector Select Dropdown */}
            <select
              value={currentToolTab}
              onChange={(e) => setCurrentToolTab(e.target.value)}
              className="select-tool-dropdown"
              style={{
                width: '100%',
                padding: '8px 10px',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-medium)',
                background: 'var(--bg-primary)',
                color: 'var(--text-primary)',
                fontSize: '13px',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              <optgroup label="Compress & Optimize">
                <option value="compress-pdf">🗜️ Compress PDF (Adaptive Engine)</option>
                <option value="flatten-pdf">🥞 Flatten / Rasterize PDF</option>
                <option value="repair-pdf">🔧 Repair Corrupted PDF</option>
                <option value="web-optimize">⚡ Web Optimize (Linearize)</option>
              </optgroup>

              <optgroup label="Organize & Layout">
                <option value="organize">📑 Organize & Reorder Pages</option>
                <option value="rotate-pdf">🔄 Rotate Pages (CW / CCW / 180°)</option>
                <option value="remove-pages">🗑️ Remove Pages (Odd / Even / Selection)</option>
                <option value="extract-pages">📂 Extract Page Ranges</option>
                <option value="split-pdf">✂️ Split PDF</option>
                <option value="halve-pdf">📖 Halve 2-in-1 Spreads</option>
                <option value="pages-per-sheet">📐 Pages per Sheet (N-Up)</option>
                <option value="booklet-pdf">📚 Booklet Creator (Saddle-Stitch)</option>
                <option value="alternate-mix">🔀 Alternate & Mix 2 PDFs</option>
                <option value="crop-pdf">✂️ Crop Page Margins</option>
                <option value="resize-pdf">📐 Resize Page Dimensions</option>
                <option value="remove-blank-pages">✨ Remove Blank Pages</option>
              </optgroup>

              <optgroup label="Edit, Annotate & Sign">
                <option value="sign-pdf">✍️ Sign & Fill Document</option>
                <option value="watermark-pdf">💧 Watermark PDF</option>
                <option value="page-numbers">🔢 Add Page Numbers</option>
                <option value="overlay-pdf">📑 Overlay Letterhead / Underlay</option>
                <option value="qr-code-pdf">📱 Add Dynamic QR Code</option>
                <option value="create-form">📝 Add Interactive Form Fields</option>
              </optgroup>

              <optgroup label="Security & Privacy">
                <option value="protect-pdf">🔒 Protect with Password</option>
                <option value="unlock-pdf">🔓 Unlock & Remove Password</option>
                <option value="redact-pdf">⬛ Redact & Blackout</option>
                <option value="metadata-scrubber">🛡️ Sanitize Document Metadata</option>
                <option value="password-generator">🔑 Password Generator</option>
              </optgroup>

              <optgroup label="Convert & Extract">
                <option value="extract-text">📄 Extract Full Text (.txt)</option>
                <option value="pdf-to-word">📝 PDF to Word (.doc)</option>
                <option value="pdf-to-excel">📊 PDF to Excel / CSV</option>
                <option value="extract-images">🖼️ Extract Images to ZIP</option>
                <option value="pdf-to-images">📸 Convert Pages to Images (ZIP)</option>
                <option value="pdf-to-pdfa">🏛️ PDF to PDF/A Archival</option>
              </optgroup>

              <optgroup label="OCR, View & AI">
                <option value="ocr-pdf">🔍 Local OCR Recognition</option>
                <option value="view-pdf">👁️ Fullscreen PDF Reader</option>
                <option value="ai-chat">✨ AI Document Studio</option>
              </optgroup>
            </select>
          </div>

          {/* Contextual Controls */}
          <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '20px', flex: 1 }}>
            {/* 1. COMPRESS TOOL (High-Performance Adaptive Engine) */}
            {currentToolTab === 'compress-pdf' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div>
                  <h4 style={{ fontSize: '15px', fontWeight: 700, marginBottom: '4px' }}>
                    Adaptive PDF Compression
                  </h4>
                  <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                    Intelligent dual-mode compressor. Automatically preserves text vectors or downsamples images.
                  </p>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {[
                    { id: 'lossless', label: 'Smart Lossless', desc: '0% visual loss, crisp text & vectors' },
                    { id: 'balanced', label: 'Balanced (Recommended)', desc: '150 DPI JPEG, ~50-70% smaller' },
                    { id: 'max', label: 'Maximum Compression', desc: '96 DPI JPEG, ~75-85% smaller' },
                    { id: 'grayscale', label: 'Grayscale Scan Optimizer', desc: '8-bit luminance, 80-90% smaller' },
                  ].map((preset) => (
                    <div
                      key={preset.id}
                      onClick={() => {
                        setCompressionPreset(preset.id as any);
                        if (preset.id === 'grayscale') setCompressionGrayscale(true);
                        if (preset.id === 'max') setCompressionDpi(96);
                        if (preset.id === 'balanced') setCompressionDpi(150);
                      }}
                      className="glass-card"
                      style={{
                        padding: '10px 12px',
                        cursor: 'pointer',
                        border: compressionPreset === preset.id ? '2px solid var(--accent-primary)' : '1px solid var(--border-subtle)',
                        background: compressionPreset === preset.id ? 'var(--accent-primary-light)' : 'var(--bg-tertiary)',
                        borderRadius: 'var(--radius-md)',
                      }}
                    >
                      <span style={{ fontSize: '12px', fontWeight: 700, display: 'block' }}>
                        {preset.label}
                      </span>
                      <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                        {preset.desc}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Additional Settings */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '4px' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={compressionGrayscale}
                      onChange={(e) => setCompressionGrayscale(e.target.checked)}
                    />
                    <span>Convert to Grayscale (Dramatically smaller scans)</span>
                  </label>

                  <div>
                    <label style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)' }}>Target DPI Resolution</label>
                    <select
                      value={compressionDpi}
                      onChange={(e) => setCompressionDpi(parseInt(e.target.value))}
                      style={{
                        width: '100%',
                        padding: '6px 10px',
                        borderRadius: 'var(--radius-md)',
                        border: '1px solid var(--border-medium)',
                        background: 'var(--bg-tertiary)',
                        color: 'var(--text-primary)',
                        fontSize: '12px',
                        marginTop: '4px',
                      }}
                    >
                      <option value={72}>72 DPI (Extreme Web/Email)</option>
                      <option value={96}>96 DPI (Fast Screen)</option>
                      <option value={150}>150 DPI (Balanced Standard)</option>
                      <option value={300}>300 DPI (High Print Quality)</option>
                    </select>
                  </div>

                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)' }}>
                      <span>Image Quality</span>
                      <span>{Math.round(compressionQuality * 100)}%</span>
                    </div>
                    <input
                      type="range"
                      min="0.3"
                      max="0.9"
                      step="0.05"
                      value={compressionQuality}
                      onChange={(e) => setCompressionQuality(parseFloat(e.target.value))}
                      style={{ width: '100%', marginTop: '4px' }}
                    />
                  </div>
                </div>

                <button
                  onClick={handleExportPDF}
                  disabled={isProcessing}
                  className="btn btn-primary btn-sm"
                  style={{ width: '100%', marginTop: '6px' }}
                >
                  <Download size={14} />
                  <span>Execute Compression</span>
                </button>
              </div>
            )}

            {/* 2. ROTATE PAGES TOOL */}
            {currentToolTab === 'rotate-pdf' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div>
                  <h4 style={{ fontSize: '15px', fontWeight: 700, marginBottom: '4px' }}>
                    Rotate Document Pages
                  </h4>
                  <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                    Bulk rotate all pages or adjust the active page's angle.
                  </p>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <button
                    onClick={() => {
                      const newPages = docState.pages.map((p) => ({ ...p, rotation: (p.rotation + 90) % 360 }));
                      pushHistory(newPages);
                    }}
                    className="btn btn-secondary btn-sm"
                    style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                  >
                    <RotateCw size={14} />
                    <span>Rotate All Pages 90° Clockwise</span>
                  </button>

                  <button
                    onClick={() => {
                      const newPages = docState.pages.map((p) => ({ ...p, rotation: (p.rotation + 270) % 360 }));
                      pushHistory(newPages);
                    }}
                    className="btn btn-secondary btn-sm"
                    style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                  >
                    <RotateCcw size={14} />
                    <span>Rotate All Pages 90° Counter-CW</span>
                  </button>

                  <button
                    onClick={() => {
                      const newPages = docState.pages.map((p) => ({ ...p, rotation: (p.rotation + 180) % 360 }));
                      pushHistory(newPages);
                    }}
                    className="btn btn-secondary btn-sm"
                    style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                  >
                    <RefreshCw size={14} />
                    <span>Flip All Pages Upside Down (180°)</span>
                  </button>

                  <button
                    onClick={() => {
                      const newPages = docState.pages.map((p) => ({ ...p, rotation: 0 }));
                      pushHistory(newPages);
                    }}
                    className="btn btn-ghost btn-sm"
                    style={{ width: '100%' }}
                  >
                    <span>Reset All Rotations to 0°</span>
                  </button>
                </div>
              </div>
            )}

            {/* 3. REMOVE PAGES TOOL */}
            {currentToolTab === 'remove-pages' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div>
                  <h4 style={{ fontSize: '15px', fontWeight: 700, marginBottom: '4px' }}>
                    Bulk Remove Pages
                  </h4>
                  <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                    Quickly eliminate multiple pages by pattern or selection.
                  </p>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <button
                    onClick={() => {
                      const newPages = docState.pages.map((p, idx) => (idx % 2 === 1 ? { ...p, deleted: true } : p));
                      pushHistory(newPages);
                    }}
                    className="btn btn-secondary btn-sm"
                    style={{ width: '100%' }}
                  >
                    <span>Delete All Even Pages (2, 4, 6…)</span>
                  </button>

                  <button
                    onClick={() => {
                      const newPages = docState.pages.map((p, idx) => (idx % 2 === 0 ? { ...p, deleted: true } : p));
                      pushHistory(newPages);
                    }}
                    className="btn btn-secondary btn-sm"
                    style={{ width: '100%' }}
                  >
                    <span>Delete All Odd Pages (1, 3, 5…)</span>
                  </button>

                  <button
                    onClick={() => {
                      const newPages = docState.pages.map((p) => ({ ...p, deleted: !p.deleted }));
                      pushHistory(newPages);
                    }}
                    className="btn btn-secondary btn-sm"
                    style={{ width: '100%' }}
                  >
                    <span>Invert Page Deletions</span>
                  </button>

                  <button
                    onClick={() => {
                      const newPages = docState.pages.map((p) => ({ ...p, deleted: false }));
                      pushHistory(newPages);
                    }}
                    className="btn btn-ghost btn-sm"
                    style={{ width: '100%' }}
                  >
                    <span>Restore All Deleted Pages</span>
                  </button>
                </div>
              </div>
            )}

            {/* 4. EXTRACT PAGES TOOL */}
            {currentToolTab === 'extract-pages' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div>
                  <h4 style={{ fontSize: '15px', fontWeight: 700, marginBottom: '4px' }}>
                    Extract Specific Pages
                  </h4>
                  <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                    Specify comma-separated page numbers or ranges to isolate into a new PDF.
                  </p>
                </div>

                <div>
                  <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)' }}>
                    Page Ranges (e.g. 1, 3-5)
                  </label>
                  <input
                    type="text"
                    value={extractRangeText}
                    onChange={(e) => setExtractRangeText(e.target.value)}
                    placeholder="1, 3-5"
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
                  />
                </div>

                <button
                  onClick={async () => {
                    setIsProcessing(true);
                    setProcessingStatus('Extracting selected pages…');
                    try {
                      // Parse ranges
                      const pageNumbers: number[] = [];
                      extractRangeText.split(',').forEach((part) => {
                        const range = part.trim().split('-');
                        if (range.length === 2) {
                          const start = parseInt(range[0]);
                          const end = parseInt(range[1]);
                          for (let i = start; i <= end; i++) pageNumbers.push(i);
                        } else if (range.length === 1 && parseInt(range[0])) {
                          pageNumbers.push(parseInt(range[0]));
                        }
                      });

                      const extracted = await PDFEngineService.extractPageRanges(docState.arrayBuffer, pageNumbers);
                      const blob = new Blob([new Uint8Array(extracted)], { type: 'application/pdf' });
                      const url = URL.createObjectURL(blob);
                      const a = document.createElement('a');
                      a.style.display = 'none';
                      a.href = url;
                      a.download = `${docState.name.replace('.pdf', '')}_extracted.pdf`;
                      document.body.appendChild(a);
                      a.click();
                      setTimeout(() => {
                        document.body.removeChild(a);
                        URL.revokeObjectURL(url);
                      }, 100);
                    } catch (err) {
                      console.error('Extraction error:', err);
                      alert('Could not extract pages. Check range format.');
                    } finally {
                      setIsProcessing(false);
                      setProcessingStatus('');
                    }
                  }}
                  className="btn btn-primary btn-sm"
                  style={{ width: '100%' }}
                >
                  <FolderDown size={14} />
                  <span>Download Extracted Pages</span>
                </button>
              </div>
            )}

            {/* 5. SPLIT PDF TOOL */}
            {currentToolTab === 'split-pdf' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div>
                  <h4 style={{ fontSize: '15px', fontWeight: 700, marginBottom: '4px' }}>
                    Split Document
                  </h4>
                  <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                    Cut document into single-page PDFs or equal chunks.
                  </p>
                </div>

                <div>
                  <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)' }}>
                    Split Every N Pages
                  </label>
                  <input
                    type="number"
                    min="1"
                    max={docState.pageCount}
                    value={splitEveryN}
                    onChange={(e) => setSplitEveryN(Math.max(1, parseInt(e.target.value) || 1))}
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
                  />
                </div>

                <button
                  onClick={async () => {
                    setIsProcessing(true);
                    setProcessingStatus('Splitting document into ZIP archive…');
                    try {
                      const zip = new JSZip();
                      const total = docState.pageCount;
                      let partIdx = 1;

                      for (let start = 1; start <= total; start += splitEveryN) {
                        const end = Math.min(total, start + splitEveryN - 1);
                        const pagesToExtract = [];
                        for (let p = start; p <= end; p++) pagesToExtract.push(p);

                        const bytes = await PDFEngineService.extractPageRanges(docState.arrayBuffer, pagesToExtract);
                        zip.file(`part_${partIdx}_pages_${start}-${end}.pdf`, bytes);
                        partIdx++;
                      }

                      const zipBlob = await zip.generateAsync({ type: 'blob' });
                      const url = URL.createObjectURL(zipBlob);
                      const a = document.createElement('a');
                      a.style.display = 'none';
                      a.href = url;
                      a.download = `${docState.name.replace('.pdf', '')}_split_parts.zip`;
                      document.body.appendChild(a);
                      a.click();
                      setTimeout(() => {
                        document.body.removeChild(a);
                        URL.revokeObjectURL(url);
                      }, 100);
                    } finally {
                      setIsProcessing(false);
                      setProcessingStatus('');
                    }
                  }}
                  className="btn btn-primary btn-sm"
                  style={{ width: '100%' }}
                >
                  <Scissors size={14} />
                  <span>Split & Download All Parts (ZIP)</span>
                </button>
              </div>
            )}

            {/* 6. SIGN & FILL TOOL */}
            {currentToolTab === 'sign-pdf' && (
              <div>
                <h4 style={{ fontSize: '15px', fontWeight: 700, marginBottom: '6px' }}>
                  Sign Document
                </h4>
                <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '14px' }}>
                  Create or upload a signature and place it on any page.
                </p>

                <button
                  onClick={() => setIsSigModalOpen(true)}
                  className="btn btn-primary btn-sm"
                  style={{ width: '100%', marginBottom: '12px' }}
                >
                  <PenTool size={14} />
                  <span>Create / Add Signature</span>
                </button>

                <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                  Placed on this document: {placedSignatures.length} signature(s)
                </span>
              </div>
            )}

            {/* 7. REDACT TOOL */}
            {currentToolTab === 'redact-pdf' && (
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                  <EyeOff size={16} color="var(--error)" />
                  <h4 style={{ fontSize: '15px', fontWeight: 700 }}>
                    Redact & Blackout
                  </h4>
                </div>
                <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '14px' }}>
                  Permanently black out confidential numbers, addresses, and sensitive clauses.
                </p>

                <button
                  onClick={handleAddRedactionBox}
                  className="btn btn-secondary btn-sm"
                  style={{ width: '100%', marginBottom: '12px' }}
                >
                  <span>+ Place Blackout Box</span>
                </button>

                <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                  Active Redaction Boxes: {redactions.length}
                </span>
              </div>
            )}

            {/* 8. PROTECT / ENCRYPT TOOL */}
            {currentToolTab === 'protect-pdf' && (
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                  <Lock size={16} color="var(--accent-primary)" />
                  <h4 style={{ fontSize: '15px', fontWeight: 700 }}>
                    Password Protect
                  </h4>
                </div>
                <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '14px' }}>
                  Lock your document with AES encryption before exporting.
                </p>

                <div>
                  <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)' }}>
                    Set Access Password
                  </label>
                  <input
                    type="password"
                    placeholder="Enter document password…"
                    value={protectPassword}
                    onChange={(e) => setProtectPassword(e.target.value)}
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
                  />
                </div>

                <button
                  onClick={handleExportPDF}
                  disabled={!protectPassword || isProcessing}
                  className="btn btn-primary btn-sm"
                  style={{ width: '100%', marginTop: '14px' }}
                >
                  <Lock size={14} />
                  <span>Lock & Download Document</span>
                </button>
              </div>
            )}

            {/* 9. UNLOCK PDF TOOL */}
            {currentToolTab === 'unlock-pdf' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div>
                  <h4 style={{ fontSize: '15px', fontWeight: 700, marginBottom: '4px' }}>
                    Unlock & Decrypt PDF
                  </h4>
                  <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                    Strip password restrictions and print limitations for documents you own.
                  </p>
                </div>

                <button
                  onClick={handleExportPDF}
                  className="btn btn-primary btn-sm"
                  style={{ width: '100%' }}
                >
                  <Check size={14} />
                  <span>Remove Restrictions & Save Unlocked</span>
                </button>
              </div>
            )}

            {/* 10. WATERMARK TOOL */}
            {currentToolTab === 'watermark-pdf' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <h4 style={{ fontSize: '15px', fontWeight: 700, marginBottom: '2px' }}>
                  Watermark Settings
                </h4>

                <div>
                  <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)' }}>
                    Watermark Text
                  </label>
                  <input
                    type="text"
                    value={watermarkSettings.text}
                    onChange={(e) => setWatermarkSettings({ ...watermarkSettings, text: e.target.value })}
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
                  />
                </div>

                <div>
                  <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)' }}>
                    Opacity: {Math.round(watermarkSettings.opacity * 100)}%
                  </label>
                  <input
                    type="range"
                    min="0.05"
                    max="0.8"
                    step="0.05"
                    value={watermarkSettings.opacity}
                    onChange={(e) => setWatermarkSettings({ ...watermarkSettings, opacity: parseFloat(e.target.value) })}
                    style={{ width: '100%', marginTop: '4px' }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)' }}>
                    Rotation: {watermarkSettings.rotation}°
                  </label>
                  <input
                    type="range"
                    min="-90"
                    max="90"
                    step="15"
                    value={watermarkSettings.rotation}
                    onChange={(e) => setWatermarkSettings({ ...watermarkSettings, rotation: parseInt(e.target.value) })}
                    style={{ width: '100%', marginTop: '4px' }}
                  />
                </div>

                <button
                  onClick={handleExportPDF}
                  className="btn btn-primary btn-sm"
                  style={{ width: '100%', marginTop: '6px' }}
                >
                  <Download size={14} />
                  <span>Apply Watermark & Export</span>
                </button>
              </div>
            )}

            {/* 11. PAGE NUMBERS TOOL */}
            {currentToolTab === 'page-numbers' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <h4 style={{ fontSize: '15px', fontWeight: 700, marginBottom: '2px' }}>
                  Page Numbers
                </h4>

                <div>
                  <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)' }}>
                    Format
                  </label>
                  <select
                    value={pageNumberSettings.format}
                    onChange={(e) => setPageNumberSettings({ ...pageNumberSettings, format: e.target.value as any })}
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
                    <option value="Page 1 of n">Page 1 of n</option>
                    <option value="Page 1">Page 1</option>
                    <option value="1">1</option>
                    <option value="- 1 -">- 1 -</option>
                  </select>
                </div>

                <div>
                  <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)' }}>
                    Position
                  </label>
                  <select
                    value={pageNumberSettings.position}
                    onChange={(e) => setPageNumberSettings({ ...pageNumberSettings, position: e.target.value as any })}
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
                    <option value="bottom-center">Bottom Center</option>
                    <option value="bottom-right">Bottom Right</option>
                    <option value="bottom-left">Bottom Left</option>
                    <option value="top-right">Top Right</option>
                    <option value="top-center">Top Center</option>
                  </select>
                </div>

                <button
                  onClick={handleExportPDF}
                  className="btn btn-primary btn-sm"
                  style={{ width: '100%', marginTop: '6px' }}
                >
                  <Download size={14} />
                  <span>Apply Numbers & Export</span>
                </button>
              </div>
            )}

            {/* 12. QR CODE STAMPER */}
            {currentToolTab === 'qr-code-pdf' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <QrCode size={16} color="var(--accent-primary)" />
                  <h4 style={{ fontSize: '15px', fontWeight: 700 }}>Add Dynamic QR Code</h4>
                </div>
                <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                  Stamp a high-resolution QR code onto the current page.
                </p>

                <div>
                  <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)' }}>QR Code Content / URL</label>
                  <input
                    type="text"
                    value={qrSettings.text}
                    onChange={(e) => setQrSettings({ ...qrSettings, text: e.target.value })}
                    placeholder="https://example.com"
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
                  />
                </div>

                <div>
                  <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)' }}>Stamp Position</label>
                  <select
                    value={qrSettings.position}
                    onChange={(e) => setQrSettings({ ...qrSettings, position: e.target.value as any })}
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
                    <option value="bottom-right">Bottom Right</option>
                    <option value="bottom-left">Bottom Left</option>
                    <option value="top-right">Top Right</option>
                    <option value="top-left">Top Left</option>
                    <option value="center">Center</option>
                  </select>
                </div>

                <button
                  onClick={handleExportPDF}
                  disabled={!qrSettings.text.trim() || isProcessing}
                  className="btn btn-primary btn-sm"
                  style={{ width: '100%', marginTop: '6px' }}
                >
                  <QrCode size={14} />
                  <span>Stamp QR Code & Export</span>
                </button>
              </div>
            )}

            {/* 13. CREATE INTERACTIVE FORM FIELDS */}
            {currentToolTab === 'create-form' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <CheckSquare size={16} color="var(--accent-primary)" />
                  <h4 style={{ fontSize: '15px', fontWeight: 700 }}>Interactive Form Builder</h4>
                </div>
                <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                  Add fillable form controls directly onto this page.
                </p>

                <div>
                  <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)' }}>Field Name / ID</label>
                  <input
                    type="text"
                    value={formFieldState.name}
                    onChange={(e) => setFormFieldState({ ...formFieldState, name: e.target.value })}
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
                  />
                </div>

                <div>
                  <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)' }}>Field Type</label>
                  <select
                    value={formFieldState.type}
                    onChange={(e) => setFormFieldState({ ...formFieldState, type: e.target.value as any })}
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
                    <option value="text">Text Input Field</option>
                    <option value="checkbox">Checkbox</option>
                  </select>
                </div>

                <button
                  onClick={async () => {
                    setIsProcessing(true);
                    setProcessingStatus('Adding form fields…');
                    try {
                      const updated = await PDFEngineService.addInteractiveFormFields(docState.arrayBuffer, [
                        {
                          type: formFieldState.type,
                          name: formFieldState.name,
                          pageNumber: currentPageNum,
                          xPercent: 30,
                          yPercent: 40,
                          widthPercent: formFieldState.type === 'checkbox' ? 5 : 40,
                          heightPercent: formFieldState.type === 'checkbox' ? 3 : 5,
                        },
                      ]);
                      setDocState({ ...docState, arrayBuffer: updated.buffer as ArrayBuffer });
                      alert(`Added interactive ${formFieldState.type} field to page ${currentPageNum}!`);
                    } finally {
                      setIsProcessing(false);
                      setProcessingStatus('');
                    }
                  }}
                  className="btn btn-primary btn-sm"
                  style={{ width: '100%' }}
                >
                  <CheckSquare size={14} />
                  <span>Add Field to Current Page</span>
                </button>
              </div>
            )}

            {/* 14. EXTRACT TEXT TOOL */}
            {currentToolTab === 'extract-text' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <FileText size={16} color="var(--accent-primary)" />
                  <h4 style={{ fontSize: '15px', fontWeight: 700 }}>Extract Document Text</h4>
                </div>
                <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                  Extract all selectable paragraphs and text lines into plain text.
                </p>

                <button
                  onClick={async () => {
                    setIsProcessing(true);
                    setProcessingStatus('Extracting text content…');
                    try {
                      const { text } = await PDFEngineService.extractFullText(docState.arrayBuffer);
                      setExtractedDocText(text);
                    } finally {
                      setIsProcessing(false);
                      setProcessingStatus('');
                    }
                  }}
                  className="btn btn-secondary btn-sm"
                  style={{ width: '100%' }}
                >
                  <FileText size={14} />
                  <span>Extract All Text</span>
                </button>

                {extractedDocText && (
                  <div>
                    <textarea
                      readOnly
                      value={extractedDocText}
                      rows={8}
                      style={{
                        width: '100%',
                        padding: '8px',
                        borderRadius: 'var(--radius-md)',
                        border: '1px solid var(--border-medium)',
                        background: 'var(--bg-tertiary)',
                        color: 'var(--text-primary)',
                        fontSize: '11px',
                        fontFamily: 'var(--font-mono)',
                      }}
                    />
                    <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(extractedDocText);
                          alert('Copied to clipboard!');
                        }}
                        className="btn btn-secondary btn-sm"
                        style={{ flex: 1 }}
                      >
                        <Copy size={13} />
                        <span>Copy</span>
                      </button>
                      <button
                        onClick={() => {
                          const blob = new Blob([extractedDocText], { type: 'text/plain;charset=utf-8' });
                          const url = URL.createObjectURL(blob);
                          const a = document.createElement('a');
                          a.href = url;
                          a.download = `${docState.name.replace('.pdf', '')}_text.txt`;
                          a.click();
                        }}
                        className="btn btn-primary btn-sm"
                        style={{ flex: 1 }}
                      >
                        <Download size={13} />
                        <span>Download .txt</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* 15. PDF TO WORD (DOCX / HTML DOC) */}
            {currentToolTab === 'pdf-to-word' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <FileCode size={16} color="var(--accent-primary)" />
                  <h4 style={{ fontSize: '15px', fontWeight: 700 }}>PDF to Word Document</h4>
                </div>
                <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                  Converts document headings, paragraphs, and page breaks into an editable Microsoft Word document.
                </p>

                <button
                  onClick={async () => {
                    setIsProcessing(true);
                    setProcessingStatus('Converting PDF to Microsoft Word document…');
                    try {
                      const wordBlob = await PDFEngineService.convertToWordDoc(docState.arrayBuffer, docState.name);
                      const url = URL.createObjectURL(wordBlob);
                      const a = document.createElement('a');
                      a.style.display = 'none';
                      a.href = url;
                      a.download = `${docState.name.replace('.pdf', '')}.doc`;
                      document.body.appendChild(a);
                      a.click();
                      setTimeout(() => {
                        document.body.removeChild(a);
                        URL.revokeObjectURL(url);
                      }, 100);
                    } finally {
                      setIsProcessing(false);
                      setProcessingStatus('');
                    }
                  }}
                  className="btn btn-primary btn-sm"
                  style={{ width: '100%' }}
                >
                  <Download size={14} />
                  <span>Download Word (.doc)</span>
                </button>
              </div>
            )}

            {/* 16. PDF TO IMAGES TOOL */}
            {currentToolTab === 'pdf-to-images' && (
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
                    onChange={(e) => setPdfImagesFormat(e.target.value as any)}
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
                  onClick={async () => {
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
                    } finally {
                      setIsProcessing(false);
                      setProcessingStatus('');
                    }
                  }}
                  className="btn btn-primary btn-sm"
                  style={{ width: '100%' }}
                >
                  <Download size={14} />
                  <span>Download All Images (ZIP)</span>
                </button>
              </div>
            )}

            {/* 17. PDF TO PDF/A ARCHIVAL */}
            {currentToolTab === 'pdf-to-pdfa' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Archive size={16} color="var(--accent-primary)" />
                  <h4 style={{ fontSize: '15px', fontWeight: 700 }}>PDF to PDF/A Archival</h4>
                </div>
                <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                  Transforms document to ISO 19005-1 compliant PDF/A-1b standard for guaranteed long-term digital preservation.
                </p>

                <button
                  onClick={handleExportPDF}
                  className="btn btn-primary btn-sm"
                  style={{ width: '100%' }}
                >
                  <Archive size={14} />
                  <span>Convert & Download PDF/A</span>
                </button>
              </div>
            )}

            {/* 18. FLATTEN / RASTERIZE TOOL */}
            {currentToolTab === 'flatten-pdf' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Layers size={16} color="var(--accent-primary)" />
                  <h4 style={{ fontSize: '15px', fontWeight: 700 }}>Flatten & Rasterize</h4>
                </div>
                <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                  Bakes all interactive forms, annotations, and vector layers into non-editable raster bitmaps.
                </p>

                <div>
                  <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)' }}>Raster Resolution</label>
                  <select
                    value={flattenDpi}
                    onChange={(e) => setFlattenDpi(parseInt(e.target.value))}
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
                    <option value={100}>100 DPI (Draft / Small)</option>
                    <option value={150}>150 DPI (Standard)</option>
                    <option value={300}>300 DPI (High Definition)</option>
                  </select>
                </div>

                <button
                  onClick={handleExportPDF}
                  className="btn btn-primary btn-sm"
                  style={{ width: '100%' }}
                >
                  <Layers size={14} />
                  <span>Flatten Document Layers</span>
                </button>
              </div>
            )}

            {/* 19. REPAIR TOOL */}
            {currentToolTab === 'repair-pdf' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Wrench size={16} color="var(--accent-primary)" />
                  <h4 style={{ fontSize: '15px', fontWeight: 700 }}>Repair Damaged PDF</h4>
                </div>
                <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                  Rebuilds broken XREF cross-reference tables, stream lengths, and structural dictionaries.
                </p>

                <div className="glass-card" style={{ padding: '12px', fontSize: '12px', color: 'var(--text-muted)' }}>
                  File health status: <strong style={{ color: '#10b981' }}>Stream Analyzed</strong>
                </div>

                <button
                  onClick={handleExportPDF}
                  className="btn btn-primary btn-sm"
                  style={{ width: '100%' }}
                >
                  <Wrench size={14} />
                  <span>Repair & Reconstruct PDF</span>
                </button>
              </div>
            )}

            {/* 20. WEB OPTIMIZE TOOL */}
            {currentToolTab === 'web-optimize' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Zap size={16} color="var(--accent-primary)" />
                  <h4 style={{ fontSize: '15px', fontWeight: 700 }}>Web Fast View (Linearize)</h4>
                </div>
                <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                  Re-indexes indirect objects into compressed streams for instantaneous browser streaming without waiting for full download.
                </p>

                <button
                  onClick={handleExportPDF}
                  className="btn btn-primary btn-sm"
                  style={{ width: '100%' }}
                >
                  <Zap size={14} />
                  <span>Linearize Document</span>
                </button>
              </div>
            )}

            {/* 21. OVERLAY & UNDERLAY TOOL */}
            {currentToolTab === 'overlay-pdf' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <CopyPlus size={16} color="var(--accent-primary)" />
                  <h4 style={{ fontSize: '15px', fontWeight: 700 }}>Overlay / Letterhead</h4>
                </div>
                <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                  Merge letterhead backgrounds or stationery templates across all pages.
                </p>

                <div
                  className="glass-card"
                  style={{
                    padding: '14px',
                    textAlign: 'center',
                    cursor: 'pointer',
                    border: overlayFile ? '2px solid var(--accent-primary)' : '1px dashed var(--border-medium)',
                  }}
                  onClick={() => {
                    const input = document.createElement('input');
                    input.type = 'file';
                    input.accept = '.pdf';
                    input.onchange = (e) => {
                      const f = (e.target as HTMLInputElement).files?.[0];
                      if (f) setOverlayFile(f);
                    };
                    input.click();
                  }}
                >
                  <CopyPlus size={20} style={{ margin: '0 auto 6px', color: 'var(--accent-primary)' }} />
                  <span style={{ fontSize: '12px', fontWeight: 600, display: 'block' }}>
                    {overlayFile ? overlayFile.name : 'Select Template / Letterhead PDF'}
                  </span>
                </div>

                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={overlayIsUnderlay}
                    onChange={(e) => setOverlayIsUnderlay(e.target.checked)}
                  />
                  <span>Place as Underlay (Behind existing text)</span>
                </label>

                <button
                  onClick={handleExportPDF}
                  disabled={!overlayFile || isProcessing}
                  className="btn btn-primary btn-sm"
                  style={{ width: '100%' }}
                >
                  <Download size={14} />
                  <span>Apply Overlay & Export</span>
                </button>
              </div>
            )}

            {/* 22. ALTERNATE & MIX TOOL */}
            {currentToolTab === 'alternate-mix' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Shuffle size={16} color="var(--accent-primary)" />
                  <h4 style={{ fontSize: '15px', fontWeight: 700 }}>Alternate & Mix 2 PDFs</h4>
                </div>
                <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                  Interleave pages from current document (fronts) with a 2nd document (backs).
                </p>

                <div
                  className="glass-card"
                  style={{
                    padding: '14px',
                    textAlign: 'center',
                    cursor: 'pointer',
                    border: alternateMixFile ? '2px solid var(--accent-primary)' : '1px dashed var(--border-medium)',
                  }}
                  onClick={() => {
                    const input = document.createElement('input');
                    input.type = 'file';
                    input.accept = '.pdf';
                    input.onchange = (e) => {
                      const f = (e.target as HTMLInputElement).files?.[0];
                      if (f) setAlternateMixFile(f);
                    };
                    input.click();
                  }}
                >
                  <Shuffle size={20} style={{ margin: '0 auto 6px', color: 'var(--accent-primary)' }} />
                  <span style={{ fontSize: '12px', fontWeight: 600, display: 'block' }}>
                    {alternateMixFile ? alternateMixFile.name : 'Select Document 2 (Back Pages)'}
                  </span>
                </div>

                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={alternateMixReverse}
                    onChange={(e) => setAlternateMixReverse(e.target.checked)}
                  />
                  <span>Reverse Document 2 page order (Duplex scanner)</span>
                </label>

                <button
                  onClick={handleExportPDF}
                  disabled={!alternateMixFile || isProcessing}
                  className="btn btn-primary btn-sm"
                  style={{ width: '100%' }}
                >
                  <Shuffle size={14} />
                  <span>Mix Documents & Export</span>
                </button>
              </div>
            )}

            {/* 23. PASSWORD GENERATOR TOOL */}
            {currentToolTab === 'password-generator' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <KeyRound size={16} color="#10b981" />
                  <h4 style={{ fontSize: '15px', fontWeight: 700 }}>Password Generator</h4>
                </div>
                <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                  Generate cryptographically secure passwords for locking PDF documents.
                </p>

                <div className="glass-card" style={{ padding: '12px', background: 'var(--bg-tertiary)', border: '1px solid var(--border-medium)' }}>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: '14px', fontWeight: 700, color: 'var(--accent-primary)', wordBreak: 'break-all' }}>
                    {genPassVal}
                  </span>
                </div>

                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: 'var(--text-muted)' }}>
                    <span>Length</span>
                    <span>{genPassLen} characters</span>
                  </div>
                  <input
                    type="range"
                    min="8"
                    max="48"
                    value={genPassLen}
                    onChange={(e) => setGenPassLen(parseInt(e.target.value))}
                    style={{ width: '100%', marginTop: '4px' }}
                  />
                </div>

                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    onClick={() => {
                      const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789!@#$%^&*()_+-=';
                      const arr = new Uint32Array(genPassLen);
                      window.crypto.getRandomValues(arr);
                      let res = '';
                      for (let i = 0; i < genPassLen; i++) res += chars[arr[i] % chars.length];
                      setGenPassVal(res);
                      setGenPassCopied(false);
                    }}
                    className="btn btn-secondary btn-sm"
                    style={{ flex: 1 }}
                  >
                    <RefreshCw size={13} />
                    <span>Generate</span>
                  </button>

                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(genPassVal);
                      setGenPassCopied(true);
                      setTimeout(() => setGenPassCopied(false), 2000);
                    }}
                    className={`btn btn-sm ${genPassCopied ? 'btn-primary' : 'btn-secondary'}`}
                    style={{ flex: 1 }}
                  >
                    {genPassCopied ? <Check size={13} /> : <Copy size={13} />}
                    <span>{genPassCopied ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
              </div>
            )}

            {/* 24. FULLSCREEN VIEWER / READER TOOL */}
            {currentToolTab === 'view-pdf' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Eye size={16} color="var(--accent-primary)" />
                  <h4 style={{ fontSize: '15px', fontWeight: 700 }}>Fullscreen PDF Reader</h4>
                </div>
                <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                  Distraction-free viewing mode with zero clutter.
                </p>

                <button
                  onClick={() => {
                    const elem = document.documentElement;
                    if (!document.fullscreenElement) {
                      elem.requestFullscreen?.();
                    } else {
                      document.exitFullscreen?.();
                    }
                  }}
                  className="btn btn-primary btn-sm"
                  style={{ width: '100%' }}
                >
                  <Eye size={14} />
                  <span>Toggle Fullscreen Mode</span>
                </button>
              </div>
            )}

            {/* 25. OCR TOOL */}
            {currentToolTab === 'ocr-pdf' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <h4 style={{ fontSize: '15px', fontWeight: 700, marginBottom: '2px' }}>
                  Local OCR Recognition
                </h4>
                <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                  Extract searchable text from scanned pages directly inside your browser.
                </p>

                <button
                  onClick={handleRunOCR}
                  disabled={isOcrLoading}
                  className="btn btn-secondary btn-sm"
                  style={{ width: '100%' }}
                >
                  {isOcrLoading ? (
                    <>
                      <Loader2 size={14} className="animate-spin" />
                      <span>{ocrProgress}</span>
                    </>
                  ) : (
                    <>
                      <ScanText size={14} />
                      <span>Scan Current Page ({currentPageNum})</span>
                    </>
                  )}
                </button>

                {ocrText && (
                  <div>
                    <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)' }}>
                      Recognized Text:
                    </span>
                    <textarea
                      readOnly
                      value={ocrText}
                      rows={8}
                      style={{
                        width: '100%',
                        marginTop: '4px',
                        padding: '8px',
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
              </div>
            )}

            {/* 26. METADATA SCRUBBER */}
            {currentToolTab === 'metadata-scrubber' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <h4 style={{ fontSize: '15px', fontWeight: 700, marginBottom: '2px' }}>
                  Document Metadata
                </h4>

                <div>
                  <label style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)' }}>
                    Title
                  </label>
                  <input
                    type="text"
                    value={metadataFields.title}
                    onChange={(e) => setMetadataFields({ ...metadataFields, title: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '6px 10px',
                      borderRadius: 'var(--radius-md)',
                      border: '1px solid var(--border-medium)',
                      background: 'var(--bg-tertiary)',
                      color: 'var(--text-primary)',
                      fontSize: '12px',
                    }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)' }}>
                    Author
                  </label>
                  <input
                    type="text"
                    value={metadataFields.author}
                    onChange={(e) => setMetadataFields({ ...metadataFields, author: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '6px 10px',
                      borderRadius: 'var(--radius-md)',
                      border: '1px solid var(--border-medium)',
                      background: 'var(--bg-tertiary)',
                      color: 'var(--text-primary)',
                      fontSize: '12px',
                    }}
                  />
                </div>

                <button
                  onClick={() => setMetadataFields({ title: '', author: '', subject: '' })}
                  className="btn btn-secondary btn-sm"
                  style={{ marginTop: '8px' }}
                >
                  <ShieldCheck size={14} color="#10b981" />
                  <span>1-Click Sanitize All</span>
                </button>
              </div>
            )}

            {/* 27. HALVE PDF TOOL */}
            {currentToolTab === 'halve-pdf' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Columns2 size={16} color="var(--accent-primary)" />
                  <h4 style={{ fontSize: '15px', fontWeight: 700 }}>Halve 2-in-1 Spreads</h4>
                </div>
                <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                  Cuts every landscape double-page spread vertically down the center into separate individual single pages.
                </p>
                <div className="glass-card" style={{ padding: '12px', fontSize: '12px', color: 'var(--text-muted)' }}>
                  Resulting page count will be: <strong style={{ color: 'var(--text-primary)' }}>{activePages.length * 2} pages</strong>.
                </div>
                <button onClick={handleExportPDF} className="btn btn-primary btn-sm" style={{ width: '100%' }}>
                  <Columns2 size={14} />
                  <span>Split Spreads in Half</span>
                </button>
              </div>
            )}

            {/* 28. PAGES PER SHEET (N-UP) */}
            {currentToolTab === 'pages-per-sheet' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Grid2X2 size={16} color="var(--accent-primary)" />
                  <h4 style={{ fontSize: '15px', fontWeight: 700 }}>Pages per Sheet (N-Up)</h4>
                </div>
                <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                  Impose multiple document pages into a single printed sheet to save paper.
                </p>

                <div>
                  <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)' }}>Pages per Sheet</label>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '6px', marginTop: '6px' }}>
                    {([2, 4, 9, 16] as const).map((count) => (
                      <button
                        key={count}
                        onClick={() => setNUpSettings({ ...nUpSettings, pagesPerSheet: count })}
                        className={`btn btn-sm ${nUpSettings.pagesPerSheet === count ? 'btn-primary' : 'btn-secondary'}`}
                      >
                        {count}-Up
                      </button>
                    ))}
                  </div>
                </div>

                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={nUpSettings.addBorder}
                    onChange={(e) => setNUpSettings({ ...nUpSettings, addBorder: e.target.checked })}
                  />
                  <span>Draw separation borders between pages</span>
                </label>

                <button onClick={handleExportPDF} className="btn btn-primary btn-sm" style={{ width: '100%' }}>
                  <Grid2X2 size={14} />
                  <span>Apply N-Up Imposition</span>
                </button>
              </div>
            )}

            {/* 29. BOOKLET CREATOR */}
            {currentToolTab === 'booklet-pdf' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <BookOpen size={16} color="var(--accent-primary)" />
                  <h4 style={{ fontSize: '15px', fontWeight: 700 }}>Booklet Imposition</h4>
                </div>
                <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                  Rearranges pages so that when printed double-sided and folded down the center, pages read in perfect consecutive order.
                </p>
                <div className="glass-card" style={{ padding: '12px', fontSize: '12px', color: 'var(--text-muted)' }}>
                  Total sheets required: <strong style={{ color: 'var(--text-primary)' }}>{Math.ceil(activePages.length / 4)} landscape sheets</strong>.
                </div>
                <button onClick={handleExportPDF} className="btn btn-primary btn-sm" style={{ width: '100%' }}>
                  <BookOpen size={14} />
                  <span>Generate Booklet Imposition</span>
                </button>
              </div>
            )}

            {/* 30. CROP TOOL */}
            {currentToolTab === 'crop-pdf' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Crop size={16} color="var(--accent-primary)" />
                  <h4 style={{ fontSize: '15px', fontWeight: 700 }}>Crop Page Margins</h4>
                </div>

                <div>
                  <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)' }}>
                    Top Margin: {cropSettings.topPercent}%
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="40"
                    value={cropSettings.topPercent}
                    onChange={(e) => setCropSettings({ ...cropSettings, topPercent: parseInt(e.target.value) })}
                    style={{ width: '100%', marginTop: '4px' }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)' }}>
                    Bottom Margin: {cropSettings.bottomPercent}%
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="40"
                    value={cropSettings.bottomPercent}
                    onChange={(e) => setCropSettings({ ...cropSettings, bottomPercent: parseInt(e.target.value) })}
                    style={{ width: '100%', marginTop: '4px' }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)' }}>
                    Side Margins: {cropSettings.leftPercent}%
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="40"
                    value={cropSettings.leftPercent}
                    onChange={(e) => setCropSettings({ ...cropSettings, leftPercent: parseInt(e.target.value), rightPercent: parseInt(e.target.value) })}
                    style={{ width: '100%', marginTop: '4px' }}
                  />
                </div>

                <button onClick={handleExportPDF} className="btn btn-primary btn-sm" style={{ width: '100%' }}>
                  <Crop size={14} />
                  <span>Apply Crop Bounds</span>
                </button>
              </div>
            )}

            {/* 31. RESIZE TOOL */}
            {currentToolTab === 'resize-pdf' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Maximize2 size={16} color="var(--accent-primary)" />
                  <h4 style={{ fontSize: '15px', fontWeight: 700 }}>Resize Dimensions</h4>
                </div>

                <div>
                  <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)' }}>Standard Sheet Size</label>
                  <select
                    value={resizeSettings.targetSize}
                    onChange={(e) => setResizeSettings({ ...resizeSettings, targetSize: e.target.value as any })}
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
                    <option value="A4">A4 (210 × 297 mm)</option>
                    <option value="A3">A3 (297 × 420 mm)</option>
                    <option value="A5">A5 (148 × 210 mm)</option>
                    <option value="Letter">US Letter (8.5 × 11 in)</option>
                    <option value="Legal">US Legal (8.5 × 14 in)</option>
                  </select>
                </div>

                <button onClick={handleExportPDF} className="btn btn-primary btn-sm" style={{ width: '100%' }}>
                  <Maximize2 size={14} />
                  <span>Resize Pages</span>
                </button>
              </div>
            )}

            {/* 32. REMOVE BLANK PAGES TOOL */}
            {currentToolTab === 'remove-blank-pages' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Sparkles size={16} color="var(--accent-primary)" />
                  <h4 style={{ fontSize: '15px', fontWeight: 700 }}>Remove Blank Pages</h4>
                </div>
                <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                  Scans luminance and text content of all pages and purges empty scanner feeder pages.
                </p>

                <button onClick={handleExportPDF} className="btn btn-primary btn-sm" style={{ width: '100%' }}>
                  <Sparkles size={14} />
                  <span>Scan & Prune Blank Pages</span>
                </button>
              </div>
            )}

            {/* 33. EXTRACT IMAGES TO ZIP */}
            {currentToolTab === 'extract-images' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Images size={16} color="var(--accent-primary)" />
                  <h4 style={{ fontSize: '15px', fontWeight: 700 }}>Extract Images</h4>
                </div>
                <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                  Dump all high-resolution pictures and photos from this PDF into a compressed ZIP archive.
                </p>
                <button
                  onClick={async () => {
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
                    } finally {
                      setIsProcessing(false);
                      setProcessingStatus('');
                    }
                  }}
                  className="btn btn-primary btn-sm"
                  style={{ width: '100%' }}
                >
                  <Download size={14} />
                  <span>Download All Images (ZIP)</span>
                </button>
              </div>
            )}

            {/* 34. EXTRACT TABLES TO CSV */}
            {currentToolTab === 'pdf-to-excel' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Table size={16} color="var(--accent-primary)" />
                  <h4 style={{ fontSize: '15px', fontWeight: 700 }}>Extract Table to CSV</h4>
                </div>
                <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                  Extract numeric tabular data, invoices, and columns into spreadsheet CSV format.
                </p>
                <button
                  onClick={async () => {
                    setIsProcessing(true);
                    setProcessingStatus('Parsing tabular matrix…');
                    try {
                      const csv = await PDFEngineService.extractTablesToCSV(docState.arrayBuffer);
                      setExtractedCsvText(csv);
                      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
                      const url = URL.createObjectURL(blob);
                      const a = document.createElement('a');
                      a.style.display = 'none';
                      a.href = url;
                      a.download = `${docState.name.replace(/\.[^/.]+$/, '')}_data.csv`;
                      document.body.appendChild(a);
                      a.click();
                      setTimeout(() => {
                        document.body.removeChild(a);
                        URL.revokeObjectURL(url);
                      }, 100);
                    } finally {
                      setIsProcessing(false);
                      setProcessingStatus('');
                    }
                  }}
                  className="btn btn-primary btn-sm"
                  style={{ width: '100%' }}
                >
                  <Download size={14} />
                  <span>Download Table CSV</span>
                </button>
                {extractedCsvText && (
                  <textarea
                    readOnly
                    value={extractedCsvText}
                    rows={6}
                    style={{
                      width: '100%',
                      padding: '8px',
                      borderRadius: 'var(--radius-md)',
                      border: '1px solid var(--border-medium)',
                      background: 'var(--bg-tertiary)',
                      color: 'var(--text-primary)',
                      fontSize: '11px',
                      fontFamily: 'var(--font-mono)',
                    }}
                  />
                )}
              </div>
            )}

            {/* 35. ANNOTATE & DRAW TOOL */}
            {currentToolTab === 'annotate-pdf' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <PenTool size={16} color="var(--accent-primary)" />
                  <h4 style={{ fontSize: '15px', fontWeight: 700 }}>Annotate & Draw</h4>
                </div>
                <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                  Draw, highlight, and sketch directly onto the active page. Strokes are automatically baked into the PDF upon export.
                </p>

                {/* Mode Selector */}
                <div>
                  <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)' }}>Tool Mode</label>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginTop: '6px' }}>
                    <button
                      type="button"
                      onClick={() => setAnnotationMode('pen')}
                      className={`btn btn-sm ${annotationMode === 'pen' ? 'btn-primary' : 'btn-secondary'}`}
                    >
                      <PenTool size={13} />
                      <span>Pen</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setAnnotationMode('highlighter')}
                      className={`btn btn-sm ${annotationMode === 'highlighter' ? 'btn-primary' : 'btn-secondary'}`}
                    >
                      <Sparkles size={13} />
                      <span>Highlighter</span>
                    </button>
                  </div>
                </div>

                {/* Color Selector */}
                <div>
                  <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)' }}>Color Palette</label>
                  <div style={{ display: 'flex', gap: '8px', marginTop: '6px' }}>
                    {[
                      { name: 'Amber', color: '#f59e0b' },
                      { name: 'Blue', color: '#3b82f6' },
                      { name: 'Red', color: '#ef4444' },
                      { name: 'Green', color: '#10b981' },
                      { name: 'Obsidian', color: '#0f172a' },
                    ].map((c) => (
                      <button
                        key={c.color}
                        type="button"
                        onClick={() => setAnnotationColor(c.color)}
                        style={{
                          width: '24px',
                          height: '24px',
                          borderRadius: '50%',
                          background: c.color,
                          border: annotationColor === c.color ? '2px solid #ffffff' : '1px solid rgba(0,0,0,0.2)',
                          boxShadow: annotationColor === c.color ? '0 0 0 2px var(--accent-primary)' : 'none',
                          cursor: 'pointer',
                        }}
                        title={c.name}
                      />
                    ))}
                  </div>
                </div>

                {/* Stroke Thickness */}
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: 'var(--text-muted)' }}>
                    <span>Stroke Thickness</span>
                    <span>{annotationWidth}px</span>
                  </div>
                  <input
                    type="range"
                    min={2}
                    max={24}
                    value={annotationWidth}
                    onChange={(e) => setAnnotationWidth(Number(e.target.value))}
                    style={{ width: '100%', marginTop: '6px' }}
                  />
                </div>

                {/* Actions */}
                <button
                  type="button"
                  onClick={handleClearAnnotations}
                  className="btn btn-secondary btn-sm"
                  style={{ width: '100%' }}
                >
                  <Trash2 size={14} />
                  <span>Clear Page Drawing</span>
                </button>

                <button onClick={handleExportPDF} className="btn btn-primary btn-sm" style={{ width: '100%' }}>
                  <Download size={14} />
                  <span>Bake Annotations & Export</span>
                </button>
              </div>
            )}

            {/* 36. DEFAULT ORGANIZE FALLBACK */}
            {(currentToolTab === 'organize' || currentToolTab === 'reorder-pages') && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <h4 style={{ fontSize: '15px', fontWeight: 700, marginBottom: '2px' }}>
                  Organize Pages
                </h4>
                <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                  Drag, delete, rotate, or reorder pages in the left thumbnail panel. Use the dropdown above to switch to any of the 38 tools.
                </p>
                <button onClick={handleExportPDF} className="btn btn-primary btn-sm" style={{ width: '100%' }}>
                  <Download size={14} />
                  <span>Export Document</span>
                </button>
              </div>
            )}
          </div>
        </aside>
      </div>

      {/* 3. Bottom Action Bar & Result Download Prompt */}
      {completedBlobUrl && completedStats && (
        <div className="glass-panel animate-slide-up" style={{
          position: 'sticky',
          bottom: 0,
          borderRadius: 0,
          borderLeft: 'none',
          borderRight: 'none',
          borderBottom: 'none',
          padding: '16px 24px',
          background: 'var(--bg-glass-heavy)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          zIndex: 30,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              background: 'var(--success-bg)',
              color: 'var(--success)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <Check size={22} />
            </div>
            <div>
              <h4 style={{ fontSize: '15px', fontWeight: 700 }}>
                Document Ready for Download!
              </h4>
              <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                {(completedStats.original / (1024 * 1024)).toFixed(1)} MB →{' '}
                {(completedStats.newSize / (1024 * 1024)).toFixed(1)} MB (
                {Math.round((1 - completedStats.newSize / completedStats.original) * 100)}% smaller)
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <button
              onClick={() => setCompletedBlobUrl(null)}
              className="btn btn-ghost btn-sm"
            >
              Continue Editing
            </button>
            <a
              href={completedBlobUrl}
              download={
                docState.name.toLowerCase().endsWith('.pdf')
                  ? `ergon_${docState.name}`
                  : `ergon_${docState.name}.pdf`
              }
              className="btn btn-primary btn-sm"
              style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              <Download size={15} />
              <span>Download PDF</span>
            </a>
          </div>
        </div>
      )}

      {/* Signature Modal */}
      <SignatureModal
        isOpen={isSigModalOpen}
        onClose={() => setIsSigModalOpen(false)}
        onSaveSignature={handleAddSignature}
      />

      {/* AI Studio Modal */}
      <AiStudioModal
        isOpen={isAiModalOpen}
        onClose={() => setIsAiModalOpen(false)}
        documentName={docState.name}
        documentText={ocrText || docState.name}
        pageTexts={docState.pages.map((p: PDFPageInfo) => ({ pageNumber: p.pageNumber, text: `Page ${p.pageNumber}` }))}
        onNavigateToPage={(num: number) => setCurrentPageNum(num)}
      />
    </div>
  );
};
