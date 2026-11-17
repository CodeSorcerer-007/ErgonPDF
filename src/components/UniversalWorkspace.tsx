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
  ChevronRight,
  Maximize2,
  Minimize2,
  FileText,
  Zap,
  PenTool,
  Lock
} from 'lucide-react';
import { TOOLS_REGISTRY, CATEGORY_LABELS } from '../config/toolsRegistry';
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
  TranslatePdfTool,
  PdfSummarizeTool,
} from './workspace';
import {
  computePageClickSelection,
  computeToggleSelectPage,
  computeSelectAllPages,
  computeKeyboardNavigation,
} from './workspace/selectionUtils';
import confetti from 'canvas-confetti';

interface UniversalWorkspaceProps {
  document: PDFDocumentState;
  activeToolId?: string;
  onCloseWorkspace: () => void;
  onSaveRecent: (name: string, action: string, size: number) => void;
}

const formatFileSize = (bytes: number): string => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
};

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
  const [unlockPassword, setUnlockPassword] = useState<string>('');
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

  const mainContainerRef = useRef<HTMLElement>(null);
  const [isThumbnailCollapsed, setIsThumbnailCollapsed] = useState<boolean>(false);
  const [isToolPanelCollapsed, setIsToolPanelCollapsed] = useState<boolean>(false);
  const [selectedPageIndices, setSelectedPageIndices] = useState<Set<number>>(new Set([currentPageNum - 1]));
  const [selectionAnchorIndex, setSelectionAnchorIndex] = useState<number>(currentPageNum - 1);

  // Push state to history
  const pushHistory = React.useCallback((newPages: PDFPageInfo[]) => {
    setHistory((prevHistory) => {
      const updatedHistory = prevHistory.slice(0, historyIndex + 1);
      updatedHistory.push(newPages);
      return updatedHistory;
    });
    setHistoryIndex((prev) => prev + 1);
    setDocState((prev: PDFDocumentState) => ({ ...prev, pages: newPages }));
  }, [historyIndex]);

  const handleUndo = React.useCallback(() => {
    if (historyIndex > 0) {
      setHistoryIndex((prev: number) => prev - 1);
      const prevPages = history[historyIndex - 1];
      setDocState((prev: PDFDocumentState) => ({ ...prev, pages: prevPages }));
      setCurrentPageNum((p) => Math.min(p, prevPages.length));
      setSelectedPageIndices((prev) => {
        const filtered = new Set([...prev].filter((i) => i < prevPages.length));
        return filtered.size > 0 ? filtered : new Set([0]);
      });
      setSelectionAnchorIndex((prev) => Math.max(0, Math.min(prev, prevPages.length - 1)));
    }
  }, [historyIndex, history]);

  const handleRedo = React.useCallback(() => {
    if (historyIndex < history.length - 1) {
      setHistoryIndex((prev: number) => prev + 1);
      const nextPages = history[historyIndex + 1];
      setDocState((prev: PDFDocumentState) => ({ ...prev, pages: nextPages }));
      setCurrentPageNum((p) => Math.min(p, nextPages.length));
      setSelectedPageIndices((prev) => {
        const filtered = new Set([...prev].filter((i) => i < nextPages.length));
        return filtered.size > 0 ? filtered : new Set([0]);
      });
      setSelectionAnchorIndex((prev) => Math.max(0, Math.min(prev, nextPages.length - 1)));
    }
  }, [historyIndex, history]);

  // Page Operations
  const handleRotatePage = (delta: number) => {
    const targets = selectedPageIndices.size > 0 ? selectedPageIndices : new Set([currentPageNum - 1]);
    const newPages = docState.pages.map((p: PDFPageInfo, idx: number) => {
      if (targets.has(idx)) {
        return { ...p, rotation: (p.rotation + delta + 360) % 360 };
      }
      return p;
    });
    pushHistory(newPages);
  };

  const handleRotateSinglePage = (pageIdx: number, delta = 90) => {
    const newPages = docState.pages.map((p: PDFPageInfo, idx: number) => {
      if (idx === pageIdx) {
        return { ...p, rotation: (p.rotation + delta + 360) % 360 };
      }
      return p;
    });
    pushHistory(newPages);
  };

  const handleFitToWidth = () => {
    const targetPage = docState.pages[currentPageNum - 1];
    if (mainContainerRef.current && targetPage) {
      const containerWidth = mainContainerRef.current.clientWidth - 80;
      const isRotated90 = targetPage.rotation === 90 || targetPage.rotation === 270;
      const pWidth = isRotated90 ? targetPage.height : targetPage.width;
      if (pWidth > 0 && containerWidth > 0) {
        const calculated = Number((containerWidth / pWidth).toFixed(2));
        setZoomScale(Math.min(2.5, Math.max(0.4, calculated)));
        return;
      }
    }
    setZoomScale(1.25);
  };

  const handleFitToPage = () => {
    const targetPage = docState.pages[currentPageNum - 1];
    if (mainContainerRef.current && targetPage) {
      const containerWidth = mainContainerRef.current.clientWidth - 80;
      const containerHeight = mainContainerRef.current.clientHeight - 80;
      const isRotated90 = targetPage.rotation === 90 || targetPage.rotation === 270;
      const pWidth = isRotated90 ? targetPage.height : targetPage.width;
      const pHeight = isRotated90 ? targetPage.width : targetPage.height;
      if (pWidth > 0 && pHeight > 0 && containerWidth > 0 && containerHeight > 0) {
        const scaleW = containerWidth / pWidth;
        const scaleH = containerHeight / pHeight;
        const calculated = Number(Math.min(scaleW, scaleH).toFixed(2));
        setZoomScale(Math.min(2.5, Math.max(0.4, calculated)));
        return;
      }
    }
    setZoomScale(0.85);
  };

  // Safe Page Deletion
  const handleDeletePage = React.useCallback((pageIdx: number) => {
    if (docState.pages.length <= 1) {
      alert('A document must have at least one page.');
      return;
    }
    const newPages = docState.pages
      .filter((_, idx) => idx !== pageIdx)
      .map((p: PDFPageInfo, idx: number) => ({ ...p, pageNumber: idx + 1 }));
    pushHistory(newPages);
    const newPageNum = Math.min(newPages.length, Math.max(1, pageIdx >= newPages.length ? newPages.length : pageIdx + 1));
    setCurrentPageNum(newPageNum);
    setSelectedPageIndices(new Set([newPageNum - 1]));
    setSelectionAnchorIndex(newPageNum - 1);
  }, [docState.pages, pushHistory, setSelectedPageIndices, setSelectionAnchorIndex]);

  // Safe Page Duplication
  const handleDuplicatePage = (pageIdx: number) => {
    const target = docState.pages[pageIdx];
    const newPage: PDFPageInfo = {
      ...target,
      pageNumber: pageIdx + 2,
    };
    const newPages = [...docState.pages];
    newPages.splice(pageIdx + 1, 0, newPage);
    const renumbered = newPages.map((p, idx) => ({ ...p, pageNumber: idx + 1 }));
    pushHistory(renumbered);
    setCurrentPageNum(pageIdx + 2);
    setSelectedPageIndices(new Set([pageIdx + 1]));
    setSelectionAnchorIndex(pageIdx + 1);
  };

  // Safe Page Move
  const handleMovePage = (index: number, direction: 'up' | 'down') => {
    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= docState.pages.length) return;
    const newPages = [...docState.pages];
    const temp = newPages[index];
    newPages[index] = newPages[targetIdx];
    newPages[targetIdx] = temp;
    const renumbered = newPages.map((p, idx) => ({ ...p, pageNumber: idx + 1 }));
    pushHistory(renumbered);
    setCurrentPageNum(targetIdx + 1);
    setSelectedPageIndices(new Set([targetIdx]));
    setSelectionAnchorIndex(targetIdx);
  };

  // Safe Page Reorder
  const handleReorderPages = (fromIndex: number, toIndex: number) => {
    if (fromIndex === toIndex) return;
    const newPages = [...docState.pages];
    const [moved] = newPages.splice(fromIndex, 1);
    newPages.splice(toIndex, 0, moved);
    const renumbered = newPages.map((p, idx) => ({ ...p, pageNumber: idx + 1 }));
    pushHistory(renumbered);
    setCurrentPageNum(toIndex + 1);
    setSelectedPageIndices(new Set([toIndex]));
    setSelectionAnchorIndex(toIndex);
  };

  // Multi-Page Selection Handlers & Anchor Tracking
  const handlePageClick = (pageNum: number, e?: React.MouseEvent) => {
    const res = computePageClickSelection(
      pageNum,
      e,
      currentPageNum,
      selectedPageIndices,
      selectionAnchorIndex,
      docState.pages
    );
    setSelectedPageIndices(res.selectedIndices);
    setSelectionAnchorIndex(res.anchorIndex);
    setCurrentPageNum(res.activePageNum);
  };

  const handleToggleSelectPage = (
    index: number,
    options?: boolean | { shiftKey?: boolean; ctrlKey?: boolean; metaKey?: boolean }
  ) => {
    const res = computeToggleSelectPage(
      index,
      options,
      currentPageNum,
      selectedPageIndices,
      selectionAnchorIndex,
      docState.pages
    );
    setSelectedPageIndices(res.selectedIndices);
    setSelectionAnchorIndex(res.anchorIndex);
    setCurrentPageNum(res.activePageNum);
  };

  const handleSelectAllPages = React.useCallback(() => {
    const res = computeSelectAllPages(docState.pages, selectedPageIndices, currentPageNum);
    setSelectedPageIndices(res.selectedIndices);
    setSelectionAnchorIndex(res.anchorIndex);
    setCurrentPageNum(res.activePageNum);
  }, [docState.pages, selectedPageIndices, currentPageNum]);

  const handleRotateSelectedPages = (delta = 90) => {
    handleRotatePage(delta);
  };

  const handleDeleteSelectedPages = React.useCallback(() => {
    const remainingActivePages = docState.pages.filter(
      (p, idx) => !p.deleted && !selectedPageIndices.has(idx)
    );
    if (remainingActivePages.length === 0) {
      alert('Cannot delete all active pages. A document must have at least one page.');
      return;
    }
    const minDeletedIndex = Math.min(...selectedPageIndices);
    const newPages = docState.pages
      .filter((_, idx) => !selectedPageIndices.has(idx))
      .map((p, idx) => ({ ...p, pageNumber: idx + 1 }));
    pushHistory(newPages);
    const newPageNum = Math.min(newPages.length, Math.max(1, minDeletedIndex + 1));
    setSelectedPageIndices(new Set([newPageNum - 1]));
    setSelectionAnchorIndex(newPageNum - 1);
    setCurrentPageNum(newPageNum);
  }, [selectedPageIndices, docState.pages, pushHistory, setSelectedPageIndices, setSelectionAnchorIndex]);

  // Global Workspace Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isSigModalOpen || isAiModalOpen || isProcessing) return;

      const target = e.target as HTMLElement;
      const tag = target?.tagName?.toLowerCase();
      if (tag === 'input' || tag === 'textarea' || tag === 'select' || target?.isContentEditable) return;

      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'z') {
        e.preventDefault();
        if (e.shiftKey) {
          handleRedo();
        } else {
          handleUndo();
        }
      } else if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'y') {
        e.preventDefault();
        handleRedo();
      } else if ((e.metaKey || e.ctrlKey) && (e.key === '=' || e.key === '+')) {
        e.preventDefault();
        setZoomScale((z) => Math.min(2.5, Number((z + 0.15).toFixed(2))));
      } else if ((e.metaKey || e.ctrlKey) && e.key === '-') {
        e.preventDefault();
        setZoomScale((z) => Math.max(0.4, Number((z - 0.15).toFixed(2))));
      } else if ((e.metaKey || e.ctrlKey) && e.key === '0') {
        e.preventDefault();
        setZoomScale(1.0);
      } else if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'a') {
        e.preventDefault();
        handleSelectAllPages();
      } else if (
        e.key === 'ArrowUp' ||
        e.key === 'ArrowDown' ||
        e.key === 'ArrowLeft' ||
        e.key === 'ArrowRight' ||
        e.key === 'PageUp' ||
        e.key === 'PageDown' ||
        e.key === 'Home' ||
        e.key === 'End'
      ) {
        const nav = computeKeyboardNavigation(
          e.key,
          e.shiftKey,
          currentPageNum,
          selectedPageIndices,
          selectionAnchorIndex,
          docState.pages
        );
        if (nav) {
          e.preventDefault();
          setSelectedPageIndices(nav.selectedIndices);
          setSelectionAnchorIndex(nav.anchorIndex);
          setCurrentPageNum(nav.activePageNum);
        }
      } else if (e.key === 'Delete' || e.key === 'Backspace') {
        if (selectedPageIndices.size > 1) {
          e.preventDefault();
          handleDeleteSelectedPages();
        } else if (docState.pages.length > 1) {
          e.preventDefault();
          handleDeletePage(currentPageNum - 1);
        }
      } else if (e.key === 'Escape') {
        onCloseWorkspace();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleUndo, handleRedo, docState.pages, currentPageNum, isSigModalOpen, isAiModalOpen, isProcessing, onCloseWorkspace, handleDeletePage, handleDeleteSelectedPages, selectedPageIndices, selectionAnchorIndex, handleSelectAllPages]);

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
      if ((currentToolTab === 'watermark-pdf' || currentToolTab === 'add-watermark') && watermarkSettings.text) {
        setProcessingStatus('Applying watermark…');
        modifiedBytes = await PDFEngineService.addWatermark(currentBuffer, watermarkSettings);
        currentBuffer = modifiedBytes.buffer as ArrayBuffer;
      }

      // 5. Page numbers if configured
      if (currentToolTab === 'page-numbers' || currentToolTab === 'add-page-numbers') {
        setProcessingStatus('Stamping page numbers…');
        modifiedBytes = await PDFEngineService.addPageNumbers(currentBuffer, pageNumberSettings);
        currentBuffer = modifiedBytes.buffer as ArrayBuffer;
      }

      // 6. Compression or Special PDF24 Transformations
      let finalBytes = modifiedBytes;
      if (currentToolTab === 'compress-pdf' || currentToolTab === 'convert-pdf-to-grayscale' || currentToolTab === 'invert-pdf') {
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
      } else if (currentToolTab === 'halve-pdf' || currentToolTab === 'halve-pdf-pages') {
        setProcessingStatus('Splitting 2-in-1 spreads in half…');
        finalBytes = await PDFEngineService.halvePages(currentBuffer);
      } else if (currentToolTab === 'pages-per-sheet' || currentToolTab === 'print-pdf-as-poster') {
        setProcessingStatus(`Imposing ${nUpSettings.pagesPerSheet} pages per sheet…`);
        finalBytes = await PDFEngineService.nUpImposition(currentBuffer, nUpSettings);
      } else if (currentToolTab === 'booklet-pdf' || currentToolTab === 'create-pdf-booklet') {
        setProcessingStatus('Generating saddle-stitch booklet imposition…');
        finalBytes = await PDFEngineService.createBooklet(currentBuffer);
      } else if (currentToolTab === 'crop-pdf') {
        setProcessingStatus('Applying crop bounds…');
        finalBytes = await PDFEngineService.cropDocument(currentBuffer, cropSettings);
      } else if (currentToolTab === 'resize-pdf' || currentToolTab === 'change-pdf-page-size') {
        setProcessingStatus(`Resizing pages to ${resizeSettings.targetSize}…`);
        finalBytes = await PDFEngineService.resizeDocument(currentBuffer, resizeSettings);
      } else if (currentToolTab === 'remove-blank-pages') {
        setProcessingStatus('Scanning and pruning blank pages…');
        const res = await PDFEngineService.removeBlankPages(currentBuffer);
        finalBytes = res.data;
      } else if (currentToolTab === 'flatten-pdf' || currentToolTab === 'rasterize-pdf') {
        setProcessingStatus('Rasterizing and flattening all PDF layers…');
        finalBytes = await PDFEngineService.flattenAndRasterize(currentBuffer, flattenDpi);
      } else if (currentToolTab === 'repair-pdf') {
        setProcessingStatus('Reconstructing XREF tables and streams…');
        finalBytes = await PDFEngineService.repairDocument(currentBuffer);
      } else if (currentToolTab === 'web-optimize' || currentToolTab === 'web-optimize-pdf') {
        setProcessingStatus('Linearizing streams for fast web view…');
        finalBytes = await PDFEngineService.webOptimize(currentBuffer);
      } else if (currentToolTab === 'qr-code-pdf' || currentToolTab === 'generate-qr-code') {
        setProcessingStatus('Stamping dynamic QR code onto active page…');
        finalBytes = await PDFEngineService.stampQRCode(currentBuffer, currentPageNum, qrSettings.text, qrSettings);
      } else if (currentToolTab === 'pdf-to-pdfa' || currentToolTab === 'validate-pdfa') {
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
      } else if ((currentToolTab === 'protect-pdf' || currentToolTab === 'lock-pdf') && protectPassword) {
        setProcessingStatus('Encrypting document with AES-256…');
        finalBytes = await PDFEngineService.encryptDocument(currentBuffer, protectPassword);
      } else if (currentToolTab === 'metadata-scrubber' || currentToolTab === 'remove-pdf-metadata' || currentToolTab === 'change-pdf-doc-info') {
        setProcessingStatus('Updating and sanitizing document metadata…');
        finalBytes = await PDFEngineService.updateMetadata(currentBuffer, metadataFields);
      } else if (currentToolTab === 'unlock-pdf') {
        setProcessingStatus('Removing security wrappers and decrypting document…');
        finalBytes = await PDFEngineService.unlockDocument(currentBuffer, unlockPassword);
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

      // Update docState with compiled document so canvas and workspace reflect new content
      try {
        const inspected = await PDFEngineService.inspectDocument(finalBytes.buffer as ArrayBuffer);
        setDocState({
          id: docState.id,
          name: safeDownloadName,
          size: finalBytes.byteLength,
          arrayBuffer: finalBytes.buffer as ArrayBuffer,
          pageCount: inspected.pageCount,
          pages: inspected.pages,
          metadata: inspected.metadata || docState.metadata,
        });
        setPlacedSignatures([]);
        setRedactions([]);
        if (currentPageNum > inspected.pageCount) {
          setCurrentPageNum(1);
        }
      } catch (inspectErr) {
        console.warn('Could not re-inspect document post-compilation:', inspectErr);
      }

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
        padding: '8px 20px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '16px',
        overflowX: 'auto',
        scrollbarWidth: 'none',
        flexWrap: 'nowrap',
        zIndex: 20,
      }}>
        {/* Left: Back & Document Title */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: 0, flexShrink: 1 }}>
          <button 
            onClick={onCloseWorkspace}
            className="btn btn-secondary btn-sm"
            title="Return to Home"
            style={{ flexShrink: 0 }}
          >
            <ArrowLeft size={14} strokeWidth={1.75} />
            <span>Home</span>
          </button>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0, overflow: 'hidden' }}>
            <span style={{
              fontWeight: 600,
              fontSize: '14px',
              maxWidth: '220px',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              color: 'var(--text-primary)',
              letterSpacing: '-0.01em',
            }}>
              {docState.name}
            </span>
            <span className="badge badge-muted" style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', flexShrink: 0 }}>
              {(docState.size / (1024 * 1024)).toFixed(1)} MB
            </span>
            <span className="badge badge-privacy" style={{ fontSize: '11px', flexShrink: 0 }}>
              100% Local
            </span>
          </div>
        </div>

        {/* Center: Zoom, Page Navigation, Undo/Redo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
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
            onClick={() => {
              const activeIndices = docState.pages
                .map((p, i) => (!p.deleted ? i : -1))
                .filter((i) => i >= 0);
              const currentPos = activeIndices.indexOf(currentPageNum - 1);
              if (currentPos > 0) {
                const nextIdx = activeIndices[currentPos - 1];
                setCurrentPageNum(nextIdx + 1);
                setSelectedPageIndices(new Set([nextIdx]));
                setSelectionAnchorIndex(nextIdx);
              }
            }}
            disabled={(() => {
              const activeIndices = docState.pages.map((p, i) => (!p.deleted ? i : -1)).filter((i) => i >= 0);
              return activeIndices.indexOf(currentPageNum - 1) <= 0;
            })()}
            className="btn btn-ghost btn-icon"
            title="Previous Page"
          >
            <ChevronLeft size={16} strokeWidth={1.5} />
          </button>
          <span style={{ fontSize: '12px', fontFamily: 'var(--font-mono)', fontWeight: 600, minWidth: '70px', textAlign: 'center', color: 'var(--text-primary)' }}>
            {(() => {
              const activeIndices = docState.pages.map((p, i) => (!p.deleted ? i : -1)).filter((i) => i >= 0);
              const currentPos = activeIndices.indexOf(currentPageNum - 1);
              const displayNum = currentPos >= 0 ? currentPos + 1 : Math.min(currentPageNum, activeIndices.length);
              return `${String(displayNum).padStart(2, '0')} / ${String(activeIndices.length).padStart(2, '0')}`;
            })()}
          </span>
          <button
            onClick={() => {
              const activeIndices = docState.pages
                .map((p, i) => (!p.deleted ? i : -1))
                .filter((i) => i >= 0);
              const currentPos = activeIndices.indexOf(currentPageNum - 1);
              if (currentPos >= 0 && currentPos < activeIndices.length - 1) {
                const nextIdx = activeIndices[currentPos + 1];
                setCurrentPageNum(nextIdx + 1);
                setSelectedPageIndices(new Set([nextIdx]));
                setSelectionAnchorIndex(nextIdx);
              }
            }}
            disabled={(() => {
              const activeIndices = docState.pages.map((p, i) => (!p.deleted ? i : -1)).filter((i) => i >= 0);
              const currentPos = activeIndices.indexOf(currentPageNum - 1);
              return currentPos < 0 || currentPos >= activeIndices.length - 1;
            })()}
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
            title="Zoom Out (Ctrl -)"
            aria-label="Zoom Out"
          >
            <ZoomOut size={15} strokeWidth={1.5} />
          </button>
          <button
            type="button"
            onClick={() => setZoomScale(1.0)}
            className="btn btn-ghost btn-sm"
            style={{ 
              fontSize: '12px', 
              fontFamily: 'var(--font-mono)', 
              minWidth: '46px', 
              padding: '2px 6px',
              textAlign: 'center', 
              color: 'var(--text-secondary)' 
            }}
            title="Reset Zoom to 100% (Ctrl 0)"
            aria-label="Reset Zoom to 100%"
          >
            {Math.round(zoomScale * 100)}%
          </button>
          <button
            onClick={() => setZoomScale((z) => Math.min(2.5, Number((z + 0.15).toFixed(2))))}
            className="btn btn-ghost btn-icon"
            title="Zoom In (Ctrl +)"
            aria-label="Zoom In"
          >
            <ZoomIn size={15} strokeWidth={1.5} />
          </button>

          {/* Fit to Width & Fit to Page */}
          <button
            onClick={handleFitToWidth}
            className="btn btn-ghost btn-icon"
            title="Fit to Width"
            aria-label="Fit to Width"
          >
            <Maximize2 size={15} strokeWidth={1.5} />
          </button>
          <button
            onClick={handleFitToPage}
            className="btn btn-ghost btn-icon"
            title="Fit to Page"
            aria-label="Fit to Page"
          >
            <Minimize2 size={15} strokeWidth={1.5} />
          </button>

          <div style={{ width: '1px', height: '20px', background: 'var(--border-subtle)', margin: '0 4px' }} />

          {/* Rotate Current / Selected Pages */}
          <button
            onClick={() => handleRotatePage(-90)}
            className="btn btn-ghost btn-icon"
            title={selectedPageIndices.size > 1 ? `Rotate ${selectedPageIndices.size} selected pages left 90°` : "Rotate Left 90°"}
          >
            <RotateCcw size={15} strokeWidth={1.5} />
          </button>
          <button
            onClick={() => handleRotatePage(90)}
            className="btn btn-ghost btn-icon"
            title={selectedPageIndices.size > 1 ? `Rotate ${selectedPageIndices.size} selected pages right 90°` : "Rotate Right 90°"}
          >
            <RotateCw size={15} strokeWidth={1.5} />
          </button>
        </div>

        {/* Right: AI Studio & Export Trigger */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
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
          onPageClick={handlePageClick}
          onMovePage={handleMovePage}
          onDuplicatePage={handleDuplicatePage}
          onDeletePage={handleDeletePage}
          onReorderPages={handleReorderPages}
          onRotatePage={handleRotateSinglePage}
          selectedPageIndices={selectedPageIndices}
          onToggleSelectPage={handleToggleSelectPage}
          onSelectAllPages={handleSelectAllPages}
          onRotateSelectedPages={handleRotateSelectedPages}
          onDeleteSelectedPages={handleDeleteSelectedPages}
          isCollapsed={isThumbnailCollapsed}
          onToggleCollapse={() => setIsThumbnailCollapsed((prev) => !prev)}
        />

        {/* Center Canvas Workspace */}
        <main 
          ref={mainContainerRef}
          style={{
            flex: 1,
            background: 'var(--bg-primary)',
            overflow: 'auto',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '40px',
            position: 'relative',
          }}
        >
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
        {isToolPanelCollapsed ? (
          <aside
            aria-label="Tool panel collapsed"
            style={{
              width: '40px',
              background: 'var(--bg-card)',
              borderLeft: '1px solid var(--border-subtle)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              padding: '12px 4px',
              gap: '12px',
              flexShrink: 0,
            }}
          >
            <button
              type="button"
              onClick={() => setIsToolPanelCollapsed(false)}
              className="btn btn-ghost btn-icon"
              title="Expand tool settings"
              aria-label="Expand tool settings"
              style={{ padding: '6px' }}
            >
              <ChevronLeft size={16} />
            </button>
            <div style={{
              writingMode: 'vertical-rl',
              fontSize: '11px',
              fontWeight: 700,
              textTransform: 'uppercase',
              color: 'var(--text-muted)',
              letterSpacing: '0.08em',
              marginTop: '8px',
            }}>
              Tool Settings
            </div>
          </aside>
        ) : (
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
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span className="badge badge-muted" style={{ fontSize: '10px', fontFamily: 'var(--font-mono)' }}>
                    Precision Suite
                  </span>
                  <button
                    type="button"
                    onClick={() => setIsToolPanelCollapsed(true)}
                    className="btn btn-ghost btn-icon"
                    style={{ padding: '2px' }}
                    title="Collapse tool settings"
                    aria-label="Collapse tool settings"
                  >
                    <ChevronRight size={14} />
                  </button>
                </div>
              </div>

              {/* Smart Tool Selector Select Dropdown */}
              <select
                value={
                  currentToolTab === 'organize' || currentToolTab === 'reorder-pages'
                    ? 'rearrange-pdf-pages'
                    : currentToolTab === 'rotate-pdf'
                    ? 'rotate-pdf-pages'
                    : currentToolTab === 'remove-pages'
                    ? 'remove-pdf-pages'
                    : currentToolTab === 'extract-pages'
                    ? 'extract-pdf-pages'
                    : currentToolTab === 'protect-pdf'
                    ? 'lock-pdf'
                    : currentToolTab === 'halve-pdf'
                    ? 'halve-pdf-pages'
                    : currentToolTab === 'booklet-pdf'
                    ? 'create-pdf-booklet'
                    : currentToolTab === 'resize-pdf'
                    ? 'change-pdf-page-size'
                    : currentToolTab === 'create-form'
                    ? 'create-fillable-pdf-form'
                    : currentToolTab === 'metadata-scrubber'
                    ? 'remove-pdf-metadata'
                    : currentToolTab === 'password-generator'
                    ? 'generate-password'
                    : currentToolTab === 'web-optimize'
                    ? 'web-optimize-pdf'
                    : currentToolTab
                }
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
                <option value="convert-pdf-to-grayscale">Convert PDF to Grayscale</option>
                <option value="invert-pdf">Invert PDF Colors (Dark Mode)</option>
                <option value="flatten-pdf">Flatten / Rasterize PDF</option>
                <option value="repair-pdf">Repair Corrupted PDF</option>
                <option value="web-optimize-pdf">Web Optimize (Linearize)</option>
              </optgroup>

              <optgroup label="Organize & Layout">
                <option value="rearrange-pdf-pages">Rearrange & Reorder Pages</option>
                <option value="rotate-pdf-pages">Rotate Pages (CW / CCW / 180°)</option>
                <option value="remove-pdf-pages">Remove Pages (Unwanted / Blank)</option>
                <option value="extract-pdf-pages">Extract Page Ranges</option>
                <option value="split-pdf">Split PDF</option>
                <option value="halve-pdf-pages">Halve 2-in-1 Spreads</option>
                <option value="pages-per-sheet">Pages per Sheet (N-Up / Poster)</option>
                <option value="create-pdf-booklet">Booklet Creator (Saddle-Stitch)</option>
                <option value="alternate-mix">Alternate & Mix 2 PDFs</option>
                <option value="crop-pdf">Crop Page Margins</option>
                <option value="change-pdf-page-size">Change PDF Page Size</option>
                <option value="straighten-pdf">Straighten Crooked Scans</option>
              </optgroup>

              <optgroup label="Edit, Annotate & Sign">
                <option value="sign-pdf">Sign Document & Verify</option>
                <option value="edit-pdf">Edit & Write PDF</option>
                <option value="annotate-pdf">Annotate & Draw</option>
                <option value="add-watermark">Add Watermark</option>
                <option value="add-page-numbers">Add Page Numbers</option>
                <option value="overlay-pdf">Overlay Letterhead / Underlay</option>
                <option value="generate-qr-code">Add Dynamic QR Code</option>
                <option value="create-fillable-pdf-form">Add Interactive Form Fields</option>
              </optgroup>

              <optgroup label="Security & Privacy">
                <option value="lock-pdf">Protect with Password</option>
                <option value="unlock-pdf">Unlock & Remove Password</option>
                <option value="redact-pdf">Redact & Blackout Content</option>
                <option value="remove-pdf-metadata">Sanitize Metadata & Doc Info</option>
                <option value="generate-password">Password Generator</option>
              </optgroup>

              <optgroup label="Convert & Extract">
                <option value="pdf-to-txt">Extract Text (.txt / .md / .html)</option>
                <option value="pdf-to-word">PDF to Word / Office (.doc / .odt / .rtf)</option>
                <option value="pdf-to-excel">PDF to Excel / CSV (.xlsx / .csv)</option>
                <option value="pdf-to-powerpoint">PDF to PowerPoint (.pptx)</option>
                <option value="extract-images">Extract Images to ZIP</option>
                <option value="pdf-to-images">Convert Pages to Images (.jpg / .png / .svg)</option>
                <option value="pdf-to-pdfa">PDF to PDF/A Archival</option>
              </optgroup>

              <optgroup label="OCR, View & AI">
                <option value="ocr-pdf">Local OCR & Copy Text</option>
                <option value="view-pdf">Fullscreen PDF Reader & Print</option>
                <option value="ai-chat">AI Document Studio & Search</option>
              </optgroup>
            </select>
          </div>

          {/* Contextual Controls */}
          <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '20px', flex: 1 }}>
            {(currentToolTab === 'compress-pdf' || currentToolTab === 'convert-pdf-to-grayscale' || currentToolTab === 'invert-pdf') && (
              <CompressTool
                compressionPreset={compressionPreset}
                onPresetChange={(p) => setCompressionPreset(p)}
                compressionGrayscale={compressionGrayscale || currentToolTab === 'convert-pdf-to-grayscale'}
                onGrayscaleChange={(v) => setCompressionGrayscale(v)}
                compressionDpi={compressionDpi}
                onDpiChange={(dpi) => setCompressionDpi(dpi)}
                compressionQuality={compressionQuality}
                onQualityChange={(q) => setCompressionQuality(q)}
                isProcessing={isProcessing}
                onProcess={handleExportPDF}
              />
            )}

            {(currentToolTab === 'rotate-pdf' || currentToolTab === 'rotate-pdf-pages') && (
              <RotateTool
                pages={docState.pages}
                onUpdatePages={(newPages) => pushHistory(newPages)}
                isProcessing={isProcessing}
                onProcess={handleExportPDF}
              />
            )}

            {(currentToolTab === 'remove-pages' || currentToolTab === 'remove-pdf-pages' || currentToolTab === 'remove-blank-pages') && (
              <RemovePagesTool
                pages={docState.pages}
                onUpdatePages={(newPages) => pushHistory(newPages)}
                isProcessing={isProcessing}
                onProcess={handleExportPDF}
              />
            )}

            {(currentToolTab === 'extract-pages' || currentToolTab === 'extract-pdf-pages') && (
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

            {(currentToolTab === 'sign-pdf' || currentToolTab === 'fill-out-pdf' || currentToolTab === 'verify-pdf-signatures') && (
              <SignTool
                placedSignatures={placedSignatures}
                onOpenSignatureModal={() => setIsSigModalOpen(true)}
                isProcessing={isProcessing}
                onProcess={handleExportPDF}
              />
            )}

            {currentToolTab === 'redact-pdf' && (
              <RedactTool
                redactions={redactions}
                onAddRedactionBox={handleAddRedactionBox}
                isProcessing={isProcessing}
                onProcess={handleExportPDF}
              />
            )}

            {(currentToolTab === 'protect-pdf' || currentToolTab === 'lock-pdf') && (
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
                password={unlockPassword}
                onPasswordChange={(pw) => setUnlockPassword(pw)}
              />
            )}

            {(currentToolTab === 'watermark-pdf' || currentToolTab === 'add-watermark') && (
              <WatermarkTool
                watermarkSettings={watermarkSettings}
                onWatermarkSettingsChange={(s) => setWatermarkSettings(s)}
                isProcessing={isProcessing}
                onProcess={handleExportPDF}
              />
            )}

            {(currentToolTab === 'page-numbers' || currentToolTab === 'add-page-numbers') && (
              <PageNumbersTool
                pageNumberSettings={pageNumberSettings}
                onPageNumberSettingsChange={(s) => setPageNumberSettings(s)}
                isProcessing={isProcessing}
                onProcess={handleExportPDF}
              />
            )}

            {(currentToolTab === 'qr-code-pdf' || currentToolTab === 'generate-qr-code') && (
              <QRCodeTool
                qrSettings={qrSettings}
                onQrSettingsChange={(s) => setQrSettings(s)}
                isProcessing={isProcessing}
                onProcess={handleExportPDF}
              />
            )}

            {(currentToolTab === 'create-form' || currentToolTab === 'create-fillable-pdf-form' || currentToolTab === 'make-pdf-fillable' || currentToolTab === 'pdf-forms') && (
              <CreateFormTool
                docState={docState}
                currentPageNum={currentPageNum}
                formFieldState={formFieldState}
                onFormFieldStateChange={(s) => setFormFieldState(s)}
                onUpdateDocState={(newDoc) => setDocState(newDoc)}
                isProcessing={isProcessing}
                setIsProcessing={setIsProcessing}
                setProcessingStatus={setProcessingStatus}
                onProcess={handleExportPDF}
              />
            )}

            {(currentToolTab === 'extract-text' || currentToolTab === 'pdf-to-txt' || currentToolTab === 'copy-from-pdf' || currentToolTab === 'pdf-to-markdown' || currentToolTab === 'pdf-to-html' || currentToolTab === 'pdf-to-epub') && (
              <ExtractTextTool
                docState={docState}
                extractedDocText={extractedDocText || fullDocumentText}
                onExtractedDocTextChange={(txt) => setExtractedDocText(txt)}
                isProcessing={isProcessing}
                setIsProcessing={setIsProcessing}
                setProcessingStatus={setProcessingStatus}
              />
            )}

            {(currentToolTab === 'pdf-to-word' || currentToolTab === 'pdf-to-docx' || currentToolTab === 'pdf-to-rtf' || currentToolTab === 'pdf-to-odt' || currentToolTab === 'pdf-to-powerpoint' || currentToolTab === 'pdf-to-pptx' || currentToolTab === 'pdf-to-odp' || currentToolTab === 'convert-from-pdf') && (
              <PdfToWordTool
                docState={docState}
                isProcessing={isProcessing}
                setIsProcessing={setIsProcessing}
                setProcessingStatus={setProcessingStatus}
              />
            )}

            {(currentToolTab === 'pdf-to-images' || currentToolTab === 'pdf-to-jpg' || currentToolTab === 'pdf-to-png' || currentToolTab === 'pdf-to-svg' || currentToolTab === 'pdf-to-tiff') && (
              <PdfToImagesTool
                docState={docState}
                pdfImagesFormat={pdfImagesFormat}
                onPdfImagesFormatChange={(fmt) => setPdfImagesFormat(fmt)}
                isProcessing={isProcessing}
                setIsProcessing={setIsProcessing}
                setProcessingStatus={setProcessingStatus}
              />
            )}

            {(currentToolTab === 'pdf-to-pdfa' || currentToolTab === 'validate-pdfa') && (
              <PdfToPdfATool
                isProcessing={isProcessing}
                onProcess={handleExportPDF}
              />
            )}

            {(currentToolTab === 'flatten-pdf' || currentToolTab === 'rasterize-pdf') && (
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

            {(currentToolTab === 'web-optimize' || currentToolTab === 'web-optimize-pdf') && (
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

            {(currentToolTab === 'password-generator' || currentToolTab === 'generate-password') && (
              <PasswordGeneratorTool
                genPassVal={genPassVal}
                onGenPassValChange={(v) => setGenPassVal(v)}
                genPassLen={genPassLen}
                onGenPassLenChange={(l) => setGenPassLen(l)}
                genPassCopied={genPassCopied}
                onGenPassCopiedChange={(c) => setGenPassCopied(c)}
              />
            )}

            {(currentToolTab === 'view-pdf' || currentToolTab === 'pdf-reader' || currentToolTab === 'print-pdf' || currentToolTab === 'html-to-pdf') && (
              <ViewPdfTool
                docState={docState}
                zoomScale={zoomScale}
                onZoomChange={(z) => setZoomScale(z)}
                onProcess={handleExportPDF}
              />
            )}

            {currentToolTab === 'translate-pdf' && (
              <TranslatePdfTool
                docState={docState}
                isProcessing={isProcessing}
                onProcess={handleExportPDF}
              />
            )}

            {currentToolTab === 'pdf-summarize' && (
              <PdfSummarizeTool
                docState={docState}
                fullDocumentText={fullDocumentText}
              />
            )}

            {(currentToolTab === 'ai-chat' || currentToolTab === 'search-pdf') && (
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

            {(currentToolTab === 'metadata-scrubber' || currentToolTab === 'remove-pdf-metadata' || currentToolTab === 'change-pdf-doc-info' || currentToolTab === 'analyze-pdf' || currentToolTab === 'set-pdf-viewer-preferences' || currentToolTab === 'bookmark-pdf') && (
              <MetadataTool
                metadataFields={metadataFields}
                onMetadataFieldsChange={(fields) => setMetadataFields(fields)}
                isProcessing={isProcessing}
                onProcess={handleExportPDF}
              />
            )}

            {(currentToolTab === 'halve-pdf' || currentToolTab === 'halve-pdf-pages') && (
              <HalveTool
                pages={docState.pages}
                isProcessing={isProcessing}
                onProcess={handleExportPDF}
              />
            )}

            {(currentToolTab === 'pages-per-sheet' || currentToolTab === 'print-pdf-as-poster') && (
              <NUpTool
                nUpSettings={nUpSettings}
                onNUpSettingsChange={(s) => setNUpSettings(s)}
                isProcessing={isProcessing}
                onProcess={handleExportPDF}
              />
            )}

            {(currentToolTab === 'booklet-pdf' || currentToolTab === 'create-pdf-booklet') && (
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

            {(currentToolTab === 'resize-pdf' || currentToolTab === 'change-pdf-page-size') && (
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

            {(currentToolTab === 'pdf-to-excel' || currentToolTab === 'pdf-to-xlsx' || currentToolTab === 'pdf-to-ods') && (
              <PdfToExcelTool
                docState={docState}
                extractedCsvText={extractedCsvText}
                onExtractedCsvTextChange={(csv) => setExtractedCsvText(csv)}
                isProcessing={isProcessing}
                setIsProcessing={setIsProcessing}
                setProcessingStatus={setProcessingStatus}
              />
            )}

            {(currentToolTab === 'annotate-pdf' || currentToolTab === 'edit-pdf' || currentToolTab === 'write-pdf') && (
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

            {(currentToolTab === 'organize' || currentToolTab === 'organize-pdf' || currentToolTab === 'reorder-pages' || currentToolTab === 'rearrange-pdf-pages' || currentToolTab === 'straighten-pdf' || !currentToolTab) && (
              <OrganizeTool
                isProcessing={isProcessing}
                onProcess={handleExportPDF}
              />
            )}

            {/* Standardized Fallback Tool Panel for Unhandled Tool IDs */}
            {(() => {
              const handledTools = [
                'compress-pdf', 'convert-pdf-to-grayscale', 'invert-pdf',
                'rotate-pdf', 'rotate-pdf-pages',
                'remove-pages', 'remove-pdf-pages', 'remove-blank-pages',
                'extract-pages', 'extract-pdf-pages',
                'split-pdf',
                'sign-pdf', 'fill-out-pdf', 'verify-pdf-signatures',
                'redact-pdf',
                'protect-pdf', 'lock-pdf',
                'unlock-pdf',
                'watermark-pdf', 'add-watermark',
                'page-numbers', 'add-page-numbers',
                'qr-code-pdf', 'generate-qr-code',
                'create-form', 'create-fillable-pdf-form', 'make-pdf-fillable',
                'extract-text', 'pdf-to-txt', 'copy-from-pdf', 'pdf-to-markdown', 'pdf-to-html', 'pdf-to-epub',
                'pdf-to-word', 'pdf-to-docx', 'pdf-to-rtf', 'pdf-to-odt', 'pdf-to-powerpoint', 'pdf-to-pptx', 'pdf-to-odp', 'convert-from-pdf',
                'pdf-to-images', 'pdf-to-jpg', 'pdf-to-png', 'pdf-to-svg', 'pdf-to-tiff',
                'pdf-to-pdfa', 'validate-pdfa',
                'flatten-pdf', 'rasterize-pdf',
                'repair-pdf',
                'web-optimize', 'web-optimize-pdf',
                'overlay-pdf',
                'alternate-mix',
                'password-generator', 'generate-password',
                'view-pdf', 'pdf-reader', 'print-pdf',
                'ai-chat', 'search-pdf',
                'ocr-pdf',
                'metadata-scrubber', 'remove-pdf-metadata', 'change-pdf-doc-info', 'analyze-pdf', 'set-pdf-viewer-preferences', 'bookmark-pdf',
                'halve-pdf', 'halve-pdf-pages',
                'pages-per-sheet', 'print-pdf-as-poster',
                'booklet-pdf', 'create-pdf-booklet',
                'crop-pdf',
                'resize-pdf', 'change-pdf-page-size',
                'extract-images',
                'pdf-to-excel', 'pdf-to-xlsx', 'pdf-to-ods',
                'annotate-pdf', 'edit-pdf', 'write-pdf',
                'organize', 'reorder-pages', 'rearrange-pdf-pages', 'straighten-pdf'
              ];
              if (handledTools.includes(currentToolTab)) return null;

              const toolMeta = TOOLS_REGISTRY.find((t) => t.id === currentToolTab) || {
                id: currentToolTab,
                name: 'Precision PDF Utility',
                description: 'Process, transform, and export this document with local WebAssembly execution.',
                category: 'organize'
              };

              return (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: 'var(--radius-sm)',
                      background: 'var(--bg-tertiary)',
                      border: '1px solid var(--border-subtle)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'var(--accent-primary)',
                    }}>
                      <FileText size={16} />
                    </div>
                    <div>
                      <h4 style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>
                        {toolMeta.name}
                      </h4>
                      <span className="badge badge-muted" style={{ fontSize: '10px', marginTop: '2px' }}>
                        {CATEGORY_LABELS[toolMeta.category] || toolMeta.category}
                      </span>
                    </div>
                  </div>

                  <p style={{ fontSize: '12.5px', color: 'var(--text-secondary)', lineHeight: 1.5, margin: 0 }}>
                    {toolMeta.description}
                  </p>

                  <div className="glass-card" style={{ padding: '12px 14px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)', background: 'var(--bg-primary)' }}>
                    <div style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', letterSpacing: '0.04em', marginBottom: '8px' }}>
                      Document Parameters
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', fontSize: '12px' }}>
                      <div>
                        <span style={{ color: 'var(--text-muted)' }}>Pages:</span>{' '}
                        <strong style={{ color: 'var(--text-primary)' }}>{docState.pages.length}</strong>
                      </div>
                      <div>
                        <span style={{ color: 'var(--text-muted)' }}>Size:</span>{' '}
                        <strong style={{ color: 'var(--text-primary)' }}>{(docState.size / (1024 * 1024)).toFixed(2)} MB</strong>
                      </div>
                      <div>
                        <span style={{ color: 'var(--text-muted)' }}>Format:</span>{' '}
                        <strong style={{ color: 'var(--text-primary)' }}>PDF 1.7</strong>
                      </div>
                      <div>
                        <span style={{ color: 'var(--text-muted)' }}>Execution:</span>{' '}
                        <strong style={{ color: 'var(--success)' }}>100% In-Memory</strong>
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleExportPDF}
                    disabled={isProcessing}
                    className="btn btn-primary btn-sm"
                    style={{ width: '100%', marginTop: '6px' }}
                  >
                    <Download size={14} />
                    <span>Apply & Export PDF</span>
                  </button>
                </div>
              );
            })()}
          </div>
        </aside>
        )}
      </div>

      {/* 3. Bottom Action Bar & Result Download Prompt with Tool Chaining */}
      {completedBlobUrl && completedStats && (
        <div className="glass-panel animate-slide-up" style={{
          position: 'sticky',
          bottom: 0,
          borderRadius: 0,
          borderLeft: 'none',
          borderRight: 'none',
          borderBottom: 'none',
          padding: '14px 24px',
          background: 'var(--bg-glass-heavy)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '12px',
          zIndex: 30,
          boxShadow: '0 -4px 16px rgba(0,0,0,0.06)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div style={{
              width: '36px',
              height: '36px',
              borderRadius: '50%',
              background: 'var(--success-bg)',
              color: 'var(--success)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}>
              <Check size={20} strokeWidth={2.5} />
            </div>
            <div>
              <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)' }}>
                {completedStats.newSize < completedStats.original ? (
                  <>
                    <span>Reduced by {Math.round((1 - completedStats.newSize / completedStats.original) * 100)}%</span>
                    <span style={{ fontWeight: 400, color: 'var(--text-muted)', marginLeft: '6px' }}>
                      ({formatFileSize(completedStats.original)} → {formatFileSize(completedStats.newSize)})
                    </span>
                  </>
                ) : (
                  <>
                    <span>Document compiled successfully</span>
                    <span style={{ fontWeight: 400, color: 'var(--text-muted)', marginLeft: '6px' }}>
                      ({formatFileSize(completedStats.newSize)})
                    </span>
                  </>
                )}
              </div>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span className="badge badge-privacy" style={{ fontSize: '9.5px', padding: '1px 5px' }}>
                  100% In-Browser Memory
                </span>
                <span>•</span>
                <span>0 bytes uploaded</span>
              </div>
            </div>
          </div>

          {/* Quick Tool Chaining Shortcuts */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
              Chain Next:
            </span>
            <button
              type="button"
              onClick={() => {
                setCompletedBlobUrl(null);
                setCurrentToolTab('compress-pdf');
              }}
              className="btn btn-secondary btn-sm"
              style={{ fontSize: '11.5px', padding: '4px 10px' }}
            >
              <Zap size={12} color="var(--accent-primary)" />
              <span>Compress</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setCompletedBlobUrl(null);
                setCurrentToolTab('sign-pdf');
              }}
              className="btn btn-secondary btn-sm"
              style={{ fontSize: '11.5px', padding: '4px 10px' }}
            >
              <PenTool size={12} color="var(--accent-primary)" />
              <span>Fill & Sign</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setCompletedBlobUrl(null);
                setCurrentToolTab('protect-pdf');
              }}
              className="btn btn-secondary btn-sm"
              style={{ fontSize: '11.5px', padding: '4px 10px' }}
            >
              <Lock size={12} color="var(--accent-primary)" />
              <span>Protect</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setCompletedBlobUrl(null);
                setCurrentToolTab('pdf-to-word');
              }}
              className="btn btn-secondary btn-sm"
              style={{ fontSize: '11.5px', padding: '4px 10px' }}
            >
              <FileText size={12} color="var(--accent-primary)" />
              <span>To Word</span>
            </button>
          </div>

          {/* Actions: Keep Editing & Download */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <button
              type="button"
              onClick={() => setCompletedBlobUrl(null)}
              className="btn btn-ghost btn-sm"
            >
              Dismiss
            </button>
            <a
              href={completedBlobUrl}
              download={
                docState.name.toLowerCase().endsWith('.pdf')
                  ? `ergon_${docState.name}`
                  : `ergon_${docState.name}.pdf`
              }
              className="btn btn-primary btn-sm"
              style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 600, padding: '7px 16px' }}
            >
              <Download size={15} />
              <span>Download PDF</span>
            </a>
          </div>
        </div>
      )}

      {/* 4. Desktop Status Bar */}
      <footer className="workspace-status-bar" role="status" aria-label="Document status bar">
        {/* Left: Status & Dimensions */}
        <div className="status-item">
          <span className={`status-dot ${isProcessing ? 'busy' : ''}`} />
          <span style={{ fontWeight: 500, color: 'var(--text-primary)' }}>
            {isProcessing ? processingStatus || 'Processing…' : 'Ready'}
          </span>
          <span style={{ color: 'var(--border-strong)', margin: '0 4px' }}>|</span>
          {activePage && (
            <span>
              {Math.round(activePage.width)} × {Math.round(activePage.height)} pt ({(activePage.width / 72).toFixed(1)}" × {(activePage.height / 72).toFixed(1)}")
            </span>
          )}
        </div>

        {/* Center: Engine & Security Info */}
        <div className="status-item" style={{ fontFamily: 'var(--font-mono)', fontSize: '10.5px' }}>
          <span>WASM Engine • 0B Telemetry • In-Memory Client Execution</span>
        </div>

        {/* Right: Page Stepper & Zoom Indicator */}
        <div className="status-item" style={{ gap: '10px' }}>
          <span>
            Page {currentPageNum} of {docState.pages.length}
            {selectedPageIndices.size > 1 ? ` (${selectedPageIndices.size} selected)` : ''}
          </span>
          <span style={{ color: 'var(--border-strong)' }}>|</span>
          <span style={{ fontFamily: 'var(--font-mono)' }}>
            {Math.round(zoomScale * 100)}%
          </span>
          <span className="badge badge-privacy" style={{ fontSize: '10px', padding: '1px 5px' }}>
            100% Local
          </span>
        </div>
      </footer>

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
        onNavigateToPage={(num: number) => {
          setCurrentPageNum(num);
          setSelectedPageIndices(new Set([num - 1]));
          setSelectionAnchorIndex(num - 1);
        }}
      />
    </div>
  );
};
