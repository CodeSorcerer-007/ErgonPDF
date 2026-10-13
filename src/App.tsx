import { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { HeroDropzone } from './components/HeroDropzone';
import { ToolsGrid } from './components/ToolsGrid';
import { RecentFilesBar } from './components/RecentFilesBar';
import { UniversalWorkspace } from './components/UniversalWorkspace';
import { CommandPalette } from './components/CommandPalette';
import { MergeModal } from './components/MergeModal';
import { CompareModal } from './components/CompareModal';
import { BatchModal } from './components/BatchModal';
import { SettingsModal } from './components/SettingsModal';
import { DocsModal } from './components/DocsModal';
import { CameraScanModal } from './components/CameraScanModal';
import { WebpageToPdfModal } from './components/WebpageToPdfModal';
import { PasswordGenModal } from './components/PasswordGenModal';
import { AlternateMixModal } from './components/AlternateMixModal';
import { Footer } from './components/Footer';

import type { PDFDocumentState, RecentFile } from './types/pdf';
import { PDFEngineService } from './services/pdfEngine';
import { StorageService } from './services/storageService';

const generateDocId = () => `doc-${Date.now()}`;

export function App() {
  // Theme State
  const [theme, setTheme] = useState<'dark' | 'light' | 'system'>(StorageService.getTheme());

  // Workspace Document State
  const [activeDocument, setActiveDocument] = useState<PDFDocumentState | null>(null);
  const [activeToolId, setActiveToolId] = useState<string>('organize');

  // Favorites & Recents
  const [favorites, setFavorites] = useState<string[]>(StorageService.getFavoriteTools());
  const [recentFiles, setRecentFiles] = useState<RecentFile[]>(StorageService.getRecentFiles());

  // Modals
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [isMergeModalOpen, setIsMergeModalOpen] = useState(false);
  const [isCompareModalOpen, setIsCompareModalOpen] = useState(false);
  const [isBatchModalOpen, setIsBatchModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [isDocsModalOpen, setIsDocsModalOpen] = useState(false);
  const [isCameraModalOpen, setIsCameraModalOpen] = useState(false);
  const [isWebpageModalOpen, setIsWebpageModalOpen] = useState(false);
  const [isPasswordGenModalOpen, setIsPasswordGenModalOpen] = useState(false);
  const [isAlternateMixModalOpen, setIsAlternateMixModalOpen] = useState(false);
  const [isCreatePdfOpen, setIsCreatePdfOpen] = useState(false);
  const [mergeInitialFiles, setMergeInitialFiles] = useState<File[]>([]);

  // Apply Theme attribute to documentElement
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme === 'system' ? 'dark' : theme);
    StorageService.setTheme(theme);
  }, [theme]);

  // Global Keyboard Shortcut for Command Palette
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsCommandPaletteOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleToggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  const handleToggleFavorite = (toolId: string) => {
    const updated = StorageService.toggleFavorite(toolId);
    setFavorites(updated);
  };

  // Process Files Uploaded via Hero Dropzone
  const handleFilesSelected = async (files: File[]) => {
    if (files.length === 0) return;

    // Multiple PDFs: Open Merge Modal
    if (files.length > 1 && files.every((f) => f.type === 'application/pdf' || f.name.endsWith('.pdf'))) {
      setMergeInitialFiles(files);
      setIsMergeModalOpen(true);
      return;
    }

    const firstFile = files[0];

    // Images: Convert to PDF automatically
    if (firstFile.type.startsWith('image/')) {
      const imageBuffers: { name: string; buffer: ArrayBuffer; type: string }[] = [];
      for (const imgFile of files) {
        const buf = await imgFile.arrayBuffer();
        imageBuffers.push({ name: imgFile.name, buffer: buf, type: imgFile.type });
      }

      const pdfBytes = await PDFEngineService.imagesToPDF(imageBuffers);
      const pdfBuffer = pdfBytes.buffer as ArrayBuffer;
      const inspected = await PDFEngineService.inspectDocument(pdfBuffer);

      setActiveDocument({
        id: generateDocId(),
        name: `${firstFile.name.replace(/\.[^/.]+$/, '')}_converted.pdf`,
        size: pdfBuffer.byteLength,
        arrayBuffer: pdfBuffer,
        pageCount: inspected.pageCount,
        pages: inspected.pages,
      });
      setActiveToolId('organize');
      return;
    }

    // Single PDF
    try {
      const buffer = await firstFile.arrayBuffer();
      const inspected = await PDFEngineService.inspectDocument(buffer);

      setActiveDocument({
        id: generateDocId(),
        name: firstFile.name,
        size: firstFile.size,
        arrayBuffer: buffer,
        pageCount: inspected.pageCount,
        pages: inspected.pages,
        metadata: inspected.metadata,
      });
      setActiveToolId('organize');
    } catch (err) {
      console.error(err);
      alert('Unable to read this PDF file. It may be corrupted or password-protected.');
    }
  };

  const handleCreateBlankPDF = async (pattern: 'blank' | 'lines' | 'grid') => {
    try {
      const blankBytes = await PDFEngineService.createBlankPDF(pattern, 1);
      const pdfBuffer = blankBytes.buffer as ArrayBuffer;
      const inspected = await PDFEngineService.inspectDocument(pdfBuffer);
      setActiveDocument({
        id: generateDocId(),
        name: `New_${pattern === 'blank' ? 'Blank' : pattern === 'lines' ? 'Lined' : 'Grid'}_Document.pdf`,
        size: pdfBuffer.byteLength,
        arrayBuffer: pdfBuffer,
        pageCount: inspected.pageCount,
        pages: inspected.pages,
        metadata: { title: 'New Document' },
      });
      setActiveToolId('organize');
    } catch (err) {
      console.error('Failed to create PDF:', err);
    } finally {
      setIsCreatePdfOpen(false);
    }
  };

  // Quick Action or Tool Selection
  const handleSelectTool = async (toolId: string) => {
    if (toolId === 'merge-pdf') {
      setIsMergeModalOpen(true);
    } else if (toolId === 'compare-pdf') {
      setIsCompareModalOpen(true);
    } else if (toolId === 'batch') {
      setIsBatchModalOpen(true);
    } else if (toolId === 'camera-scan') {
      setIsCameraModalOpen(true);
    } else if (toolId === 'webpage-to-pdf') {
      setIsWebpageModalOpen(true);
    } else if (toolId === 'password-generator') {
      setIsPasswordGenModalOpen(true);
    } else if (toolId === 'alternate-mix') {
      setIsAlternateMixModalOpen(true);
    } else if (toolId === 'create-pdf') {
      setIsCreatePdfOpen(true);
    } else if (toolId === 'images-to-pdf') {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = 'image/png,image/jpeg,image/webp,image/gif';
      input.multiple = true;
      input.onchange = async (e) => {
        const files = (e.target as HTMLInputElement).files;
        if (files && files.length > 0) {
          const imageBuffers: { name: string; buffer: ArrayBuffer; type: string }[] = [];
          for (const imgFile of Array.from(files)) {
            const buf = await imgFile.arrayBuffer();
            imageBuffers.push({ name: imgFile.name, buffer: buf, type: imgFile.type });
          }
          const pdfBytes = await PDFEngineService.imagesToPDF(imageBuffers);
          const pdfBuffer = pdfBytes.buffer as ArrayBuffer;
          const inspected = await PDFEngineService.inspectDocument(pdfBuffer);
          setActiveDocument({
            id: generateDocId(),
            name: `${files[0].name.replace(/\.[^/.]+$/, '')}_converted.pdf`,
            size: pdfBuffer.byteLength,
            arrayBuffer: pdfBuffer,
            pageCount: inspected.pageCount,
            pages: inspected.pages,
          });
          setActiveToolId('organize');
        }
      };
      input.click();
    } else if (toolId === 'view-pdf') {
      if (activeDocument) {
        setActiveToolId('view-pdf');
      } else {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.pdf';
        input.onchange = async (e) => {
          const files = (e.target as HTMLInputElement).files;
          if (files && files.length > 0) {
            await handleFilesSelected(Array.from(files));
            setActiveToolId('view-pdf');
          }
        };
        input.click();
      }
    } else {
      setActiveToolId(toolId);
      // If a document is already open, change active tool tab
      if (!activeDocument) {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.pdf';
        input.onchange = async (e) => {
          const files = (e.target as HTMLInputElement).files;
          if (files && files.length > 0) {
            await handleFilesSelected(Array.from(files));
            setActiveToolId(toolId);
          }
        };
        input.click();
      }
    }
  };

  const handleSaveRecent = (name: string, action: string, size: number) => {
    StorageService.addRecentFile({
      name,
      size,
      pageCount: activeDocument?.pageCount || 1,
      lastAction: action.replace('-', ' '),
    });
    setRecentFiles(StorageService.getRecentFiles());
  };

  return (
    <div className="app-container">
      {/* If universal workspace document is active, display the workspace */}
      {activeDocument ? (
        <UniversalWorkspace
          document={activeDocument}
          activeToolId={activeToolId}
          onCloseWorkspace={() => setActiveDocument(null)}
          onSaveRecent={handleSaveRecent}
        />
      ) : (
        <>
          {/* Header */}
          <Header
            currentTheme={theme}
            onToggleTheme={handleToggleTheme}
            onOpenCommandPalette={() => setIsCommandPaletteOpen(true)}
            onOpenSettings={() => setIsSettingsModalOpen(true)}
            onOpenBatch={() => setIsBatchModalOpen(true)}
            onOpenCompare={() => setIsCompareModalOpen(true)}
            onOpenAiStudio={() => {
              if (activeDocument) {
                // Already open
              } else {
                handleSelectTool('ai-chat');
              }
            }}
            onOpenDocs={() => setIsDocsModalOpen(true)}
            onNavigateHome={() => setActiveDocument(null)}
          />

          {/* Main Body */}
          <main className="main-content">
            <HeroDropzone
              onFilesSelected={handleFilesSelected}
              onQuickIntent={handleSelectTool}
            />

            <RecentFilesBar
              recentFiles={recentFiles}
              onSelectRecent={() => {
                handleSelectTool('organize');
              }}
              onClearRecents={() => {
                StorageService.clearRecentFiles();
                setRecentFiles([]);
              }}
            />

            <ToolsGrid
              onSelectTool={handleSelectTool}
              favorites={favorites}
              onToggleFavorite={handleToggleFavorite}
            />
          </main>

          {/* Footer */}
          <Footer
            onOpenDocs={() => setIsDocsModalOpen(true)}
            onOpenSettings={() => setIsSettingsModalOpen(true)}
          />
        </>
      )}

      {/* Global Command Palette */}
      <CommandPalette
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
        onSelectTool={handleSelectTool}
        onToggleTheme={handleToggleTheme}
        onOpenSettings={() => setIsSettingsModalOpen(true)}
        currentTheme={theme}
      />

      {/* Standalone Merge Modal */}
      <MergeModal
        isOpen={isMergeModalOpen}
        onClose={() => {
          setIsMergeModalOpen(false);
          setMergeInitialFiles([]);
        }}
        initialFiles={mergeInitialFiles}
      />

      {/* Compare Modal */}
      <CompareModal
        isOpen={isCompareModalOpen}
        onClose={() => setIsCompareModalOpen(false)}
      />

      {/* Batch Processing Modal */}
      <BatchModal
        isOpen={isBatchModalOpen}
        onClose={() => setIsBatchModalOpen(false)}
      />

      {/* Settings Modal */}
      <SettingsModal
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
        currentTheme={theme}
        onThemeChange={(t) => setTheme(t)}
      />

      {/* Docs Modal */}
      <DocsModal
        isOpen={isDocsModalOpen}
        onClose={() => setIsDocsModalOpen(false)}
      />

      {/* Camera Scanner Modal */}
      <CameraScanModal
        isOpen={isCameraModalOpen}
        onClose={() => setIsCameraModalOpen(false)}
        onCompleteScan={(file) => handleFilesSelected([file])}
      />

      {/* Webpage to PDF Modal */}
      <WebpageToPdfModal
        isOpen={isWebpageModalOpen}
        onClose={() => setIsWebpageModalOpen(false)}
        onDocumentCreated={(file) => handleFilesSelected([file])}
      />

      {/* Password Generator Modal */}
      <PasswordGenModal
        isOpen={isPasswordGenModalOpen}
        onClose={() => setIsPasswordGenModalOpen(false)}
      />

      {/* Alternate Mix Modal */}
      <AlternateMixModal
        isOpen={isAlternateMixModalOpen}
        onClose={() => setIsAlternateMixModalOpen(false)}
        onComplete={(file) => handleFilesSelected([file])}
      />

      {/* Create New PDF Pattern Picker */}
      {isCreatePdfOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="create-pdf-title"
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 120,
            background: 'rgba(0, 0, 0, 0.65)',
            backdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px',
          }}
          onClick={() => setIsCreatePdfOpen(false)}
        >
          <div
            className="glass-panel animate-scale-in"
            style={{
              width: '100%',
              maxWidth: '460px',
              background: 'var(--bg-secondary)',
              borderRadius: 'var(--radius-lg)',
              boxShadow: 'var(--shadow-xl)',
              padding: '24px',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 id="create-pdf-title" style={{ fontSize: '18px', fontWeight: 700, marginBottom: '6px' }}>
              Create New PDF
            </h3>
            <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '20px' }}>
              Select a page template to generate a blank canvas document.
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', marginBottom: '20px' }}>
              {[
                { id: 'blank', label: 'Blank', desc: 'Clean white sheet' },
                { id: 'lines', label: 'Lined', desc: 'Notebook ruling' },
                { id: 'grid', label: 'Grid', desc: 'Graph paper grid' },
              ].map((tmpl) => (
                <button
                  key={tmpl.id}
                  type="button"
                  onClick={() => handleCreateBlankPDF(tmpl.id as 'blank' | 'lines' | 'grid')}
                  className="glass-card"
                  style={{
                    padding: '16px 12px',
                    textAlign: 'center',
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '6px',
                    background: 'var(--bg-tertiary)',
                    border: '1px solid var(--border-medium)',
                    borderRadius: 'var(--radius-md)',
                  }}
                >
                  <span style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-primary)' }}>
                    {tmpl.label}
                  </span>
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                    {tmpl.desc}
                  </span>
                </button>
              ))}
            </div>

            <button
              type="button"
              onClick={() => setIsCreatePdfOpen(false)}
              className="btn btn-secondary btn-sm"
              style={{ width: '100%' }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
