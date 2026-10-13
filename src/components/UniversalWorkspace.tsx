import React, { useState, useEffect, useRef } from 'react';
import { 
  ArrowLeft, 
  ZoomIn, 
  ZoomOut, 
  RotateCw, 
  RotateCcw, 
  Undo, 
  Redo, 
  Download, 
  Sparkles, 
  Check, 
  Loader2, 
  ChevronLeft, 
  ChevronRight
} from 'lucide-react';
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
import { StorageService } from '../services/storageService';
import { SignatureModal } from './SignatureModal';
import { AiStudioModal } from './AiStudioModal';
import {
  ThumbnailSidebar,
  CompressTool,
  OrganizeTool,
  RotateTool,
  RemovePagesTool,
  ExtractPagesTool,
  SplitTool,
  FlattenTool,
  RepairTool,
  WebOptimizeTool,
  ProtectTool,
  UnlockTool,
  RedactTool,
  MetadataTool,
  PasswordGeneratorTool,
  SignTool,
  WatermarkTool,
  PageNumbersTool,
  OverlayTool,
  QRCodeTool,
  CreateFormTool,
  HalveTool,
  NUpTool,
  BookletTool,
  AlternateMixTool,
  CropTool,
  ResizeTool,
  RemoveBlankPagesTool,
  ExtractImagesTool,
  PdfToExcelTool,
  PdfToImagesTool,
  PdfToWordTool,
  PdfToPdfATool,
  ExtractTextTool,
  OcrTool,
  AnnotateTool,
  ViewPdfTool,
  AiChatTool,
} from './workspace';
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
  const [isAiModalOpen, setIsAiModalOpen] = useState<boolean>(activeToolId === 'ai-chat');

  // Drawing & Annotation States
  const [annotationColor, setAnnotationColor] = useState<string>('#f59e0b');
  const [annotationWidth, setAnnotationWidth] = useState<number>(4);
  const [annotationMode, setAnnotationMode] = useState<'pen' | 'highlighter'>('pen');
  const [isDrawing, setIsDrawing] = useState<boolean>(false);
  const annotationCanvasRef = useRef<HTMLCanvasElement>(null);

  // Advanced Compression State
  const [compressionPreset, setCompressionPreset] = useState<'lossless' | 'balanced' | 'max' | 'grayscale'>('balanced');
  const [compressionGrayscale, setCompressionGrayscale] = useState<boolean>(false);
  const [compressionDpi, setCompressionDpi] = useState<number>(() => StorageService.getDefaultDpi());
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

  // Background full text extraction for AI Studio & Text tools
  const [fullDocumentText, setFullDocumentText] = useState<string>('');
  const [fullPageTexts, setFullPageTexts] = useState<{ pageNumber: number; text: string }[]>([]);
  const [extractedBuffer, setExtractedBuffer] = useState<ArrayBuffer | null>(null);
  const isExtractingText = Boolean(docState.arrayBuffer) && docState.arrayBuffer !== extractedBuffer;

  useEffect(() => {
    if (!docState.arrayBuffer) return;
    let isCancelled = false;
    PDFEngineService.extractFullText(docState.arrayBuffer)
      .then((res) => {
        if (!isCancelled) {
          setFullDocumentText(res.text || '');
          setFullPageTexts(res.pages || []);
          setExtractedBuffer(docState.arrayBuffer);
        }
      })
      .catch(() => {
        if (!isCancelled) {
          setFullDocumentText('');
          setFullPageTexts([]);
          setExtractedBuffer(docState.arrayBuffer);
        }
      });
    return () => {
      isCancelled = true;
    };
  }, [docState.arrayBuffer]);

  // Processing & Feedback State
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [processingStatus, setProcessingStatus] = useState<string>('');
  const [completedBlobUrl, setCompletedBlobUrl] = useState<string | null>(null);
  const [completedStats, setCompletedStats] = useState<{ original: number; newSize: number } | null>(null);

  // Undo/Redo History Stack
  const [history, setHistory] = useState<PDFPageInfo[][]>([initialDoc.pages]);
  const [historyIndex, setHistoryIndex] = useState<number>(0);

  // Update tool tab when activeToolId prop changes
  const [prevActiveToolId, setPrevActiveToolId] = useState<string>(activeToolId);
  if (activeToolId && activeToolId !== prevActiveToolId) {
    setPrevActiveToolId(activeToolId);
    setCurrentToolTab(activeToolId);
    if (activeToolId === 'ai-chat') {
      setIsAiModalOpen(true);
    }
  }

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

  const handleReorderPages = (fromIndex: number, toIndex: number) => {
    if (fromIndex === toIndex) return;
    const newPages = [...docState.pages];
    const [moved] = newPages.splice(fromIndex, 1);
    newPages.splice(toIndex, 0, moved);
    pushHistory(newPages);
    setCurrentPageNum(toIndex + 1);
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
      <div style={{
        background: 'var(--bg-card)',
        borderBottom: '1px solid var(--border-subtle)',
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
            <ArrowLeft size={14} strokeWidth={1.75} />
            <span>Home</span>
          </button>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{
              fontWeight: 600,
              fontSize: '14px',
              maxWidth: '240px',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              color: 'var(--text-primary)',
              letterSpacing: '-0.01em',
            }}>
              {docState.name}
            </span>
            <span className="badge badge-muted" style={{ fontSize: '11px', fontFamily: 'var(--font-mono)' }}>
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
            <Undo size={15} strokeWidth={1.5} />
          </button>
          <button
            onClick={handleRedo}
            disabled={historyIndex >= history.length - 1}
            className="btn btn-ghost btn-icon"
            title="Redo (Ctrl + Y)"
          >
            <Redo size={15} strokeWidth={1.5} />
          </button>

          <div style={{ width: '1px', height: '20px', background: 'var(--border-subtle)', margin: '0 4px' }} />

          {/* Page Navigator */}
          <button
            onClick={() => setCurrentPageNum((p) => Math.max(1, p - 1))}
            disabled={currentPageNum === 1}
            className="btn btn-ghost btn-icon"
            title="Previous Page"
          >
            <ChevronLeft size={16} strokeWidth={1.5} />
          </button>
          <span style={{ fontSize: '12px', fontFamily: 'var(--font-mono)', fontWeight: 600, minWidth: '70px', textAlign: 'center', color: 'var(--text-primary)' }}>
            {String(currentPageNum).padStart(2, '0')} / {String(activePages.length).padStart(2, '0')}
          </span>
          <button
            onClick={() => setCurrentPageNum((p) => Math.min(activePages.length, p + 1))}
            disabled={currentPageNum === activePages.length}
            className="btn btn-ghost btn-icon"
            title="Next Page"
          >
            <ChevronRight size={16} strokeWidth={1.5} />
          </button>

          <div style={{ width: '1px', height: '20px', background: 'var(--border-subtle)', margin: '0 4px' }} />

          {/* Zoom Controls */}
          <button
            onClick={() => setZoomScale((z) => Math.max(0.4, Number((z - 0.15).toFixed(2))))}
            className="btn btn-ghost btn-icon"
            title="Zoom Out"
          >
            <ZoomOut size={15} strokeWidth={1.5} />
          </button>
          <span style={{ fontSize: '12px', fontFamily: 'var(--font-mono)', minWidth: '42px', textAlign: 'center', color: 'var(--text-secondary)' }}>
            {Math.round(zoomScale * 100)}%
          </span>
          <button
            onClick={() => setZoomScale((z) => Math.min(2.5, Number((z + 0.15).toFixed(2))))}
            className="btn btn-ghost btn-icon"
            title="Zoom In"
          >
            <ZoomIn size={15} strokeWidth={1.5} />
          </button>

          <div style={{ width: '1px', height: '20px', background: 'var(--border-subtle)', margin: '0 4px' }} />

          {/* Rotate Current Page */}
          <button
            onClick={() => handleRotatePage(-90)}
            className="btn btn-ghost btn-icon"
            title="Rotate Left 90°"
          >
            <RotateCcw size={15} strokeWidth={1.5} />
          </button>
          <button
            onClick={() => handleRotatePage(90)}
            className="btn btn-ghost btn-icon"
            title="Rotate Right 90°"
          >
            <RotateCw size={15} strokeWidth={1.5} />
          </button>
        </div>

        {/* Right: AI Studio & Export Trigger */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button
            onClick={() => setIsAiModalOpen(true)}
            className="btn btn-secondary btn-sm"
            style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <Sparkles size={14} strokeWidth={1.75} color="var(--accent-primary)" />
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
                <Download size={14} strokeWidth={1.75} />
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
        <ThumbnailSidebar
          pages={docState.pages}
          currentPageNum={currentPageNum}
          onPageClick={(num) => setCurrentPageNum(num)}
          onMovePage={handleMovePage}
          onDuplicatePage={handleDuplicatePage}
          onDeletePage={handleDeletePage}
          onReorderPages={handleReorderPages}
        />

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
              boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08), 0 1px 3px rgba(0, 0, 0, 0.04)',
              borderRadius: 'var(--radius-sm)',
              background: '#ffffff',
              border: '1px solid var(--border-subtle)',
              transform: `rotate(${activePage.rotation}deg)`,
              transition: 'transform var(--transition-fast)',
            }}>
              <canvas ref={canvasRef} style={{ display: 'block', borderRadius: 'var(--radius-sm)' }} />

              {/* Drawing Annotation Layer */}
              <canvas
                ref={annotationCanvasRef}
                style={{
                  position: 'absolute',
                  left: 0,
                  top: 0,
                  width: '100%',
                  height: '100%',
                  borderRadius: 'var(--radius-sm)',
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
                      borderRadius: 'var(--radius-sm)',
                      background: 'rgba(200, 76, 50, 0.08)',
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
          background: 'var(--bg-card)',
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
            background: 'var(--bg-primary)',
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', letterSpacing: '0.04em' }}>
                Active Tool
              </span>
              <span className="badge badge-muted" style={{ fontSize: '10px', fontFamily: 'var(--font-mono)' }}>
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
                border: '1px solid var(--border-subtle)',
                background: 'var(--bg-card)',
                color: 'var(--text-primary)',
                fontSize: '13px',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              <optgroup label="Compress & Optimize">
                <option value="compress-pdf">Compress PDF (Adaptive Engine)</option>
                <option value="flatten-pdf">Flatten / Rasterize PDF</option>
                <option value="repair-pdf">Repair Corrupted PDF</option>
                <option value="web-optimize">Web Optimize (Linearize)</option>
              </optgroup>

              <optgroup label="Organize & Layout">
                <option value="organize">Organize & Reorder Pages</option>
                <option value="rotate-pdf">Rotate Pages (CW / CCW / 180°)</option>
                <option value="remove-pages">Remove Pages (Odd / Even / Selection)</option>
                <option value="extract-pages">Extract Page Ranges</option>
                <option value="split-pdf">Split PDF</option>
                <option value="halve-pdf">Halve 2-in-1 Spreads</option>
                <option value="pages-per-sheet">Pages per Sheet (N-Up)</option>
                <option value="booklet-pdf">Booklet Creator (Saddle-Stitch)</option>
                <option value="alternate-mix">Alternate & Mix 2 PDFs</option>
                <option value="crop-pdf">Crop Page Margins</option>
                <option value="resize-pdf">Resize Page Dimensions</option>
                <option value="remove-blank-pages">Remove Blank Pages</option>
              </optgroup>

              <optgroup label="Edit, Annotate & Sign">
                <option value="sign-pdf">Sign & Fill Document</option>
                <option value="watermark-pdf">Watermark PDF</option>
                <option value="page-numbers">Add Page Numbers</option>
                <option value="overlay-pdf">Overlay Letterhead / Underlay</option>
                <option value="qr-code-pdf">Add Dynamic QR Code</option>
                <option value="create-form">Add Interactive Form Fields</option>
              </optgroup>

              <optgroup label="Security & Privacy">
                <option value="protect-pdf">Protect with Password</option>
                <option value="unlock-pdf">Unlock & Remove Password</option>
                <option value="redact-pdf">Redact & Blackout</option>
                <option value="metadata-scrubber">Sanitize Document Metadata</option>
                <option value="password-generator">Password Generator</option>
              </optgroup>

              <optgroup label="Convert & Extract">
                <option value="extract-text">Extract Full Text (.txt)</option>
                <option value="pdf-to-word">PDF to Word (.doc)</option>
                <option value="pdf-to-excel">PDF to Excel / CSV</option>
                <option value="extract-images">Extract Images to ZIP</option>
                <option value="pdf-to-images">Convert Pages to Images (ZIP)</option>
                <option value="pdf-to-pdfa">PDF to PDF/A Archival</option>
              </optgroup>

              <optgroup label="OCR, View & AI">
                <option value="ocr-pdf">Local OCR Recognition</option>
                <option value="view-pdf">Fullscreen PDF Reader</option>
                <option value="ai-chat">AI Document Studio</option>
              </optgroup>
            </select>
          </div>

          {/* Contextual Controls */}
          <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '20px', flex: 1 }}>
            {currentToolTab === 'compress-pdf' && (
              <CompressTool
                compressionPreset={compressionPreset}
                onPresetChange={(p) => setCompressionPreset(p)}
                compressionGrayscale={compressionGrayscale}
                onGrayscaleChange={(v) => setCompressionGrayscale(v)}
                compressionDpi={compressionDpi}
                onDpiChange={(dpi) => setCompressionDpi(dpi)}
                compressionQuality={compressionQuality}
                onQualityChange={(q) => setCompressionQuality(q)}
                isProcessing={isProcessing}
                onProcess={handleExportPDF}
              />
            )}

            {currentToolTab === 'rotate-pdf' && (
              <RotateTool
                pages={docState.pages}
                onUpdatePages={(newPages) => pushHistory(newPages)}
              />
            )}

            {currentToolTab === 'remove-pages' && (
              <RemovePagesTool
                pages={docState.pages}
                onUpdatePages={(newPages) => pushHistory(newPages)}
              />
            )}

            {currentToolTab === 'extract-pages' && (
              <ExtractPagesTool
                docState={docState}
                extractRangeText={extractRangeText}
                onRangeTextChange={(val) => setExtractRangeText(val)}
                isProcessing={isProcessing}
                setIsProcessing={setIsProcessing}
                setProcessingStatus={setProcessingStatus}
              />
            )}

            {currentToolTab === 'split-pdf' && (
              <SplitTool
                docState={docState}
                splitEveryN={splitEveryN}
                onSplitEveryNChange={(n) => setSplitEveryN(n)}
                isProcessing={isProcessing}
                setIsProcessing={setIsProcessing}
                setProcessingStatus={setProcessingStatus}
              />
            )}

            {currentToolTab === 'sign-pdf' && (
              <SignTool
                placedSignatures={placedSignatures}
                onOpenSignatureModal={() => setIsSigModalOpen(true)}
              />
            )}

            {currentToolTab === 'redact-pdf' && (
              <RedactTool
                redactions={redactions}
                onAddRedactionBox={handleAddRedactionBox}
              />
            )}

            {currentToolTab === 'protect-pdf' && (
              <ProtectTool
                protectPassword={protectPassword}
                onPasswordChange={(pw) => setProtectPassword(pw)}
                isProcessing={isProcessing}
                onProcess={handleExportPDF}
              />
            )}

            {currentToolTab === 'unlock-pdf' && (
              <UnlockTool
                isProcessing={isProcessing}
                onProcess={handleExportPDF}
              />
            )}

            {currentToolTab === 'watermark-pdf' && (
              <WatermarkTool
                watermarkSettings={watermarkSettings}
                onWatermarkSettingsChange={(s) => setWatermarkSettings(s)}
                isProcessing={isProcessing}
                onProcess={handleExportPDF}
              />
            )}

            {currentToolTab === 'page-numbers' && (
              <PageNumbersTool
                pageNumberSettings={pageNumberSettings}
                onPageNumberSettingsChange={(s) => setPageNumberSettings(s)}
                isProcessing={isProcessing}
                onProcess={handleExportPDF}
              />
            )}

            {currentToolTab === 'qr-code-pdf' && (
              <QRCodeTool
                qrSettings={qrSettings}
                onQrSettingsChange={(s) => setQrSettings(s)}
                isProcessing={isProcessing}
                onProcess={handleExportPDF}
              />
            )}

            {currentToolTab === 'create-form' && (
              <CreateFormTool
                docState={docState}
                currentPageNum={currentPageNum}
                formFieldState={formFieldState}
                onFormFieldStateChange={(s) => setFormFieldState(s)}
                onUpdateDocState={(newDoc) => setDocState(newDoc)}
                isProcessing={isProcessing}
                setIsProcessing={setIsProcessing}
                setProcessingStatus={setProcessingStatus}
              />
            )}

            {currentToolTab === 'extract-text' && (
              <ExtractTextTool
                docState={docState}
                extractedDocText={extractedDocText || fullDocumentText}
                onExtractedDocTextChange={(txt) => setExtractedDocText(txt)}
                isProcessing={isProcessing}
                setIsProcessing={setIsProcessing}
                setProcessingStatus={setProcessingStatus}
              />
            )}

            {currentToolTab === 'pdf-to-word' && (
              <PdfToWordTool
                docState={docState}
                isProcessing={isProcessing}
                setIsProcessing={setIsProcessing}
                setProcessingStatus={setProcessingStatus}
              />
            )}

            {currentToolTab === 'pdf-to-images' && (
              <PdfToImagesTool
                docState={docState}
                pdfImagesFormat={pdfImagesFormat}
                onPdfImagesFormatChange={(fmt) => setPdfImagesFormat(fmt)}
                isProcessing={isProcessing}
                setIsProcessing={setIsProcessing}
                setProcessingStatus={setProcessingStatus}
              />
            )}

            {currentToolTab === 'pdf-to-pdfa' && (
              <PdfToPdfATool
                isProcessing={isProcessing}
                onProcess={handleExportPDF}
              />
            )}

            {currentToolTab === 'flatten-pdf' && (
              <FlattenTool
                flattenDpi={flattenDpi}
                onFlattenDpiChange={(dpi) => setFlattenDpi(dpi)}
                isProcessing={isProcessing}
                onProcess={handleExportPDF}
              />
            )}

            {currentToolTab === 'repair-pdf' && (
              <RepairTool
                isProcessing={isProcessing}
                onProcess={handleExportPDF}
              />
            )}

            {currentToolTab === 'web-optimize' && (
              <WebOptimizeTool
                isProcessing={isProcessing}
                onProcess={handleExportPDF}
              />
            )}

            {currentToolTab === 'overlay-pdf' && (
              <OverlayTool
                overlayFile={overlayFile}
                onOverlayFileChange={(f) => setOverlayFile(f)}
                overlayIsUnderlay={overlayIsUnderlay}
                onOverlayIsUnderlayChange={(u) => setOverlayIsUnderlay(u)}
                isProcessing={isProcessing}
                onProcess={handleExportPDF}
              />
            )}

            {currentToolTab === 'alternate-mix' && (
              <AlternateMixTool
                alternateMixFile={alternateMixFile}
                onAlternateMixFileChange={(f) => setAlternateMixFile(f)}
                alternateMixReverse={alternateMixReverse}
                onAlternateMixReverseChange={(r) => setAlternateMixReverse(r)}
                isProcessing={isProcessing}
                onProcess={handleExportPDF}
              />
            )}

            {currentToolTab === 'password-generator' && (
              <PasswordGeneratorTool
                genPassVal={genPassVal}
                onGenPassValChange={(v) => setGenPassVal(v)}
                genPassLen={genPassLen}
                onGenPassLenChange={(l) => setGenPassLen(l)}
                genPassCopied={genPassCopied}
                onGenPassCopiedChange={(c) => setGenPassCopied(c)}
              />
            )}

            {currentToolTab === 'view-pdf' && (
              <ViewPdfTool
                docState={docState}
                zoomScale={zoomScale}
                onZoomChange={(z) => setZoomScale(z)}
              />
            )}

            {currentToolTab === 'ai-chat' && (
              <AiChatTool
                docState={docState}
                fullDocumentText={fullDocumentText}
                fullPageTexts={fullPageTexts}
                isExtractingText={isExtractingText}
                onOpenAiStudio={() => setIsAiModalOpen(true)}
              />
            )}

            {currentToolTab === 'ocr-pdf' && (
              <OcrTool
                currentPageNum={currentPageNum}
                isOcrLoading={isOcrLoading}
                ocrProgress={ocrProgress}
                ocrText={ocrText}
                onRunOCR={handleRunOCR}
              />
            )}

            {currentToolTab === 'metadata-scrubber' && (
              <MetadataTool
                metadataFields={metadataFields}
                onMetadataFieldsChange={(fields) => setMetadataFields(fields)}
              />
            )}

            {currentToolTab === 'halve-pdf' && (
              <HalveTool
                pages={docState.pages}
                isProcessing={isProcessing}
                onProcess={handleExportPDF}
              />
            )}

            {currentToolTab === 'pages-per-sheet' && (
              <NUpTool
                nUpSettings={nUpSettings}
                onNUpSettingsChange={(s) => setNUpSettings(s)}
                isProcessing={isProcessing}
                onProcess={handleExportPDF}
              />
            )}

            {currentToolTab === 'booklet-pdf' && (
              <BookletTool
                pages={docState.pages}
                isProcessing={isProcessing}
                onProcess={handleExportPDF}
              />
            )}

            {currentToolTab === 'crop-pdf' && (
              <CropTool
                cropSettings={cropSettings}
                onCropSettingsChange={(s) => setCropSettings(s)}
                isProcessing={isProcessing}
                onProcess={handleExportPDF}
              />
            )}

            {currentToolTab === 'resize-pdf' && (
              <ResizeTool
                resizeSettings={resizeSettings}
                onResizeSettingsChange={(s) => setResizeSettings(s)}
                isProcessing={isProcessing}
                onProcess={handleExportPDF}
              />
            )}

            {currentToolTab === 'remove-blank-pages' && (
              <RemoveBlankPagesTool
                isProcessing={isProcessing}
                onProcess={handleExportPDF}
              />
            )}

            {currentToolTab === 'extract-images' && (
              <ExtractImagesTool
                docState={docState}
                isProcessing={isProcessing}
                setIsProcessing={setIsProcessing}
                setProcessingStatus={setProcessingStatus}
              />
            )}

            {currentToolTab === 'pdf-to-excel' && (
              <PdfToExcelTool
                docState={docState}
                extractedCsvText={extractedCsvText}
                onExtractedCsvTextChange={(csv) => setExtractedCsvText(csv)}
                isProcessing={isProcessing}
                setIsProcessing={setIsProcessing}
                setProcessingStatus={setProcessingStatus}
              />
            )}

            {currentToolTab === 'annotate-pdf' && (
              <AnnotateTool
                annotationMode={annotationMode}
                onAnnotationModeChange={(m) => setAnnotationMode(m)}
                annotationColor={annotationColor}
                onAnnotationColorChange={(c) => setAnnotationColor(c)}
                annotationWidth={annotationWidth}
                onAnnotationWidthChange={(w) => setAnnotationWidth(w)}
                onClearAnnotations={handleClearAnnotations}
                isProcessing={isProcessing}
                onProcess={handleExportPDF}
              />
            )}

            {(currentToolTab === 'organize' || currentToolTab === 'reorder-pages' || !currentToolTab) && (
              <OrganizeTool
                isProcessing={isProcessing}
                onProcess={handleExportPDF}
              />
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
        documentText={fullDocumentText || ocrText || ''}
        pageTexts={
          fullPageTexts.length > 0
            ? fullPageTexts
            : ocrText
            ? [{ pageNumber: currentPageNum, text: ocrText }]
            : docState.pages.map((p: PDFPageInfo) => ({ pageNumber: p.pageNumber, text: `Page ${p.pageNumber}` }))
        }
        isTextLoading={isExtractingText}
        onNavigateToPage={(num: number) => setCurrentPageNum(num)}
      />
    </div>
  );
};
