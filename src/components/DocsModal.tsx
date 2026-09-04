import React, { useState } from 'react';
import { X, BookOpen, Code, Terminal, Server, Cpu } from 'lucide-react';

interface DocsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DocsModal: React.FC<DocsModalProps> = ({ isOpen, onClose }) => {
  const [activeSection, setActiveSection] = useState<'architecture' | 'api' | 'selfhosting' | 'toolplugins'>('architecture');

  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      zIndex: 110,
      background: 'rgba(0, 0, 0, 0.7)',
      backdropFilter: 'blur(8px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px',
    }} onClick={onClose}>
      <div className="glass-panel animate-scale-in" style={{
        width: '100%',
        maxWidth: '860px',
        height: '82vh',
        display: 'flex',
        flexDirection: 'column',
        background: 'var(--bg-secondary)',
        borderRadius: 'var(--radius-lg)',
        boxShadow: 'var(--shadow-xl)',
        overflow: 'hidden',
      }} onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div style={{
          padding: '16px 20px',
          borderBottom: '1px solid var(--border-subtle)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <BookOpen size={20} color="var(--accent-primary)" />
            <div>
              <h3 style={{ fontSize: '18px', fontWeight: 700 }}>ErgonPDF Documentation & Developer Guide</h3>
              <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                Open-source architecture, tool plugins, self-hosting, and API specifications.
              </p>
            </div>
          </div>
          <button onClick={onClose} className="btn btn-ghost btn-icon">
            <X size={18} />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div style={{
          display: 'flex',
          borderBottom: '1px solid var(--border-subtle)',
          background: 'var(--bg-tertiary)',
        }}>
          {[
            { id: 'architecture', label: 'Architecture', icon: Cpu },
            { id: 'api', label: 'Developer API', icon: Code },
            { id: 'selfhosting', label: 'Self-Hosting & Docker', icon: Server },
            { id: 'toolplugins', label: 'Creating New Tools', icon: Terminal },
          ].map((item) => {
            const Icon = item.icon;
            const isActive = activeSection === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveSection(item.id as any)}
                className="btn btn-ghost"
                style={{
                  flex: 1,
                  borderRadius: 0,
                  borderBottom: isActive ? '2px solid var(--accent-primary)' : 'none',
                  color: isActive ? 'var(--accent-primary)' : 'var(--text-secondary)',
                  fontWeight: isActive ? 600 : 500,
                  fontSize: '13px',
                }}
              >
                <Icon size={14} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>

        {/* Content Body */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '24px', lineHeight: 1.6, fontSize: '14px' }}>
          {activeSection === 'architecture' && (
            <div>
              <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '12px' }}>
                Local-First Processing Architecture
              </h3>
              <p style={{ marginBottom: '16px', color: 'var(--text-secondary)' }}>
                ErgonPDF executes heavy operations (rendering, rasterization, page mutation, OCR, encryption, and signatures) inside the browser client using pure WebAssembly and Web Worker threads.
              </p>
              <div style={{
                background: 'var(--bg-tertiary)',
                padding: '16px',
                borderRadius: 'var(--radius-md)',
                fontFamily: 'var(--font-mono)',
                fontSize: '12px',
                marginBottom: '16px',
                whiteSpace: 'pre',
                overflowX: 'auto',
              }}>
{`+-------------------------------------------------------+
|                   User Interface (React 19)           |
+-------------------------------------------------------+
          |                         |
          v                         v
+-----------------------+ +-----------------------------+
| Universal Workspace   | | Command Intent Router (⌘K)  |
+-----------------------+ +-----------------------------+
          |                         |
          +------------+------------+
                       |
                       v
+-------------------------------------------------------+
|               PDF Engine Service (Worker/WASM)        |
|  - pdf-lib: In-memory mutations, forms, cryptography  |
|  - pdfjs-dist: Hardware-accelerated canvas renderer   |
|  - tesseract.js: Private local Web Worker OCR         |
|  - jszip: Batch processing packaging & compression   |
+-------------------------------------------------------+`}
              </div>
            </div>
          )}

          {activeSection === 'api' && (
            <div>
              <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '12px' }}>
                Headless Engine & API Usage
              </h3>
              <p style={{ marginBottom: '16px', color: 'var(--text-secondary)' }}>
                Developers can import the standalone <code>PDFEngineService</code> in their own apps:
              </p>
              <pre style={{
                background: 'var(--bg-tertiary)',
                padding: '16px',
                borderRadius: 'var(--radius-md)',
                fontFamily: 'var(--font-mono)',
                fontSize: '12px',
                overflowX: 'auto',
                marginBottom: '16px',
              }}>
{`import { PDFEngineService } from '@ergonpdf/engine';

// Merge documents in memory
const mergedUint8 = await PDFEngineService.mergeDocuments([
  fileBufferA,
  fileBufferB
]);

// High-speed balanced compression
const { data, compressedSize } = await PDFEngineService.compressDocument(
  fileBuffer, 
  { level: 'balanced', imageQuality: 0.7, dpi: 150, removeMetadata: true }
);`}
              </pre>
            </div>
          )}

          {activeSection === 'selfhosting' && (
            <div>
              <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '12px' }}>
                One-Command Docker Deployment
              </h3>
              <p style={{ marginBottom: '16px', color: 'var(--text-secondary)' }}>
                Deploy your self-hosted private instance with Docker Compose:
              </p>
              <pre style={{
                background: 'var(--bg-tertiary)',
                padding: '16px',
                borderRadius: 'var(--radius-md)',
                fontFamily: 'var(--font-mono)',
                fontSize: '12px',
                overflowX: 'auto',
                marginBottom: '16px',
              }}>
{`# Clone the repository
git clone https://github.com/ergonpdf/ergonpdf.git
cd ergonpdf

# Run with Docker Compose
docker compose up -d

# ErgonPDF is now running locally at http://localhost:8080`}
              </pre>
            </div>
          )}

          {activeSection === 'toolplugins' && (
            <div>
              <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '12px' }}>
                Adding a New Tool Plugin
              </h3>
              <p style={{ marginBottom: '16px', color: 'var(--text-secondary)' }}>
                ErgonPDF uses a modular tool registry. To register a new tool, define its schema in <code>src/config/toolsRegistry.ts</code>:
              </p>
              <pre style={{
                background: 'var(--bg-tertiary)',
                padding: '16px',
                borderRadius: 'var(--radius-md)',
                fontFamily: 'var(--font-mono)',
                fontSize: '12px',
                overflowX: 'auto',
              }}>
{`{
  id: "grayscale-pdf",
  name: "Grayscale PDF",
  description: "Convert color documents into pure grayscale or black & white",
  category: "compress",
  iconName: "Palette",
  intents: ["grayscale", "black and white", "mono", "remove color"],
  processingMode: "local"
}`}
              </pre>
            </div>
          )}
        </div>

        {/* Footer */}
        <div style={{
          padding: '12px 20px',
          borderTop: '1px solid var(--border-subtle)',
          display: 'flex',
          justifyContent: 'flex-end',
          background: 'var(--bg-tertiary)',
        }}>
          <button onClick={onClose} className="btn btn-primary btn-sm">
            Close Docs
          </button>
        </div>
      </div>
    </div>
  );
};
