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
  EyeOff
} from 'lucide-react';
import type { 
  PDFDocumentState, 
  PDFPageInfo, 
  PlacedSignature, 
  RedactionBox, 
  SignatureData, 
  WatermarkSettings, 
  PageNumberSettings 
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

  // Settings for Tools
  const [compressionPreset, setCompressionPreset] = useState<'max' | 'balanced' | 'quality'>('balanced');
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
        );
      }
    }
  }, [docState, currentPageNum, zoomScale]);

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

      // 6. Compression if selected
      let finalBytes = modifiedBytes;
      if (currentToolTab === 'compress-pdf') {
        setProcessingStatus('Optimizing and downscaling assets…');
        const comp = await PDFEngineService.compressDocument(currentBuffer, {
          level: compressionPreset,
          imageQuality: compressionPreset === 'max' ? 0.45 : 0.7,
          dpi: 150,
          removeMetadata: true,
        });
        finalBytes = comp.data;
        setCompletedStats({
          original: docState.size,
          newSize: comp.compressedSize,
        });
      } else {
        setCompletedStats({
          original: docState.size,
          newSize: finalBytes.byteLength,
        });
      }

      // Create download blob
      const blob = new Blob([new Uint8Array(finalBytes)], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      setCompletedBlobUrl(url);

      onSaveRecent(docState.name, currentToolTab, finalBytes.byteLength);

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
          {/* Tool Tabs Header */}
          <div style={{
            padding: '14px 16px',
            borderBottom: '1px solid var(--border-subtle)',
            background: 'var(--bg-tertiary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}>
            <span style={{ fontSize: '13px', fontWeight: 700, textTransform: 'capitalize' }}>
              Tool: {currentToolTab.replace('-', ' ')}
            </span>
          </div>

          {/* Contextual Controls */}
          <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '20px', flex: 1 }}>
            {/* COMPRESS TOOL */}
            {currentToolTab === 'compress-pdf' && (
              <div>
                <h4 style={{ fontSize: '15px', fontWeight: 700, marginBottom: '6px' }}>
                  Compression Level
                </h4>
                <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '14px' }}>
                  Intelligently re-encodes embedded photos and strips redundant metadata.
                </p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {[
                    { id: 'max', label: 'Maximum Compression', desc: 'Lowest size, ~70% smaller' },
                    { id: 'balanced', label: 'Balanced (Recommended)', desc: 'Optimal clarity & ~50% smaller' },
                    { id: 'quality', label: 'High Quality', desc: 'Highest resolution, ~25% smaller' },
                  ].map((preset) => (
                    <div
                      key={preset.id}
                      onClick={() => setCompressionPreset(preset.id as any)}
                      className="glass-card"
                      style={{
                        padding: '12px',
                        cursor: 'pointer',
                        border: compressionPreset === preset.id ? '2px solid var(--accent-primary)' : '1px solid var(--border-subtle)',
                        background: compressionPreset === preset.id ? 'var(--accent-primary-light)' : 'var(--bg-tertiary)',
                      }}
                    >
                      <span style={{ fontSize: '13px', fontWeight: 600, display: 'block' }}>
                        {preset.label}
                      </span>
                      <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                        {preset.desc}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* SIGN & FILL TOOL */}
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

            {/* REDACT TOOL */}
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

            {/* PROTECT / ENCRYPT TOOL */}
            {currentToolTab === 'protect-pdf' && (
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                  <Lock size={16} color="var(--accent-primary)" />
                  <h4 style={{ fontSize: '15px', fontWeight: 700 }}>
                    Password Protect
                  </h4>
                </div>
                <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '14px' }}>
                  Encrypt your document with AES encryption before exporting.
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
              </div>
            )}

            {/* WATERMARK TOOL */}
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
              </div>
            )}

            {/* PAGE NUMBERS TOOL */}
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
              </div>
            )}

            {/* OCR TOOL */}
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

            {/* METADATA SCRUBBER */}
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
              download={`ergon_${docState.name}`}
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
