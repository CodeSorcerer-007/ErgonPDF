import React, { useState } from 'react';
import { 
  Layers, 
  Scissors, 
  LayoutGrid, 
  RotateCw, 
  Minimize2, 
  PenTool, 
  Edit3, 
  Stamp, 
  Hash, 
  Image, 
  FileImage, 
  FileText, 
  Lock, 
  Unlock, 
  EyeOff, 
  ShieldCheck, 
  ScanText, 
  GitCompare, 
  Sparkles,
  Star,
  Search,
  Trash2,
  FolderDown,
  Columns2,
  Grid2X2,
  BookOpen,
  Shuffle,
  Crop,
  Maximize2,
  Wrench,
  Zap,
  CopyPlus,
  FilePlus,
  Camera,
  Globe,
  CheckSquare,
  QrCode,
  Images,
  FileCode,
  Table,
  Archive,
  KeyRound,
  Eye,
  ArrowRight
} from 'lucide-react';
import { TOOLS_REGISTRY, CATEGORY_LABELS } from '../config/toolsRegistry';
import type { PDFTool } from '../types/pdf';

interface ToolsGridProps {
  onSelectTool: (toolId: string) => void;
  favorites: string[];
  onToggleFavorite: (toolId: string) => void;
}

// Icon mapper with unified 1.5px stroke
const ICON_MAP: Record<string, React.ElementType> = {
  Layers,
  Scissors,
  LayoutGrid,
  RotateCw,
  Minimize2,
  PenTool,
  Edit3,
  Stamp,
  Hash,
  Image,
  FileImage,
  FileText,
  Lock,
  Unlock,
  EyeOff,
  ShieldCheck,
  ScanText,
  GitCompare,
  Sparkles,
  Trash2,
  FolderDown,
  Columns2,
  Grid2X2,
  BookOpen,
  Shuffle,
  Crop,
  Maximize2,
  Wrench,
  Zap,
  CopyPlus,
  FilePlus,
  Camera,
  Globe,
  CheckSquare,
  QrCode,
  Images,
  FileCode,
  Table,
  Archive,
  KeyRound,
  Eye,
};

// Intent Section Grouping definitions
const INTENT_GROUPS = [
  {
    key: 'organize',
    title: 'Assemble & Arrange',
    subtitle: 'Merge, split, reorder, rotate, and impose document page structures.',
    categoryIds: ['organize'],
  },
  {
    key: 'compress',
    title: 'Compress & Optimize',
    subtitle: 'Lossless size reduction, stream defragmentation, and document repair.',
    categoryIds: ['compress'],
  },
  {
    key: 'security',
    title: 'Security & Privacy',
    subtitle: 'AES-256 encryption, password restrictions, visual redactions, and metadata sanitization.',
    categoryIds: ['security'],
  },
  {
    key: 'convert',
    title: 'Convert & Extract',
    subtitle: 'Transform between PDFs, high-res images, Word documents, and tabular spreadsheets.',
    categoryIds: ['convert'],
  },
  {
    key: 'edit',
    title: 'Sign, Annotate & Watermark',
    subtitle: 'Digital signatures, drawing markup, dynamic pagination, and letterheads.',
    categoryIds: ['edit'],
  },
  {
    key: 'intelligence',
    title: 'Capture & Intelligence',
    subtitle: 'Camera scanning, web extraction, OCR text recognition, and AI document studio.',
    categoryIds: ['create', 'ocr', 'ai', 'view'],
  },
];

export const ToolsGrid: React.FC<ToolsGridProps> = ({
  onSelectTool,
  favorites,
  onToggleFavorite,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchFilter, setSearchFilter] = useState('');

  const categories = Object.keys(CATEGORY_LABELS);

  const filteredTools = TOOLS_REGISTRY.filter((tool) => {
    const matchesCategory = selectedCategory === 'all' || tool.category === selectedCategory;
    const matchesSearch = 
      !searchFilter.trim() ||
      tool.name.toLowerCase().includes(searchFilter.toLowerCase()) ||
      tool.description.toLowerCase().includes(searchFilter.toLowerCase()) ||
      tool.intents.some((i) => i.toLowerCase().includes(searchFilter.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  // Render a single tool card with Warm Swiss Monochromatic aesthetics
  const renderToolCard = (tool: PDFTool) => {
    const Icon = ICON_MAP[tool.iconName] || FileText;
    const isFavorited = favorites.includes(tool.id);

    return (
      <div
        key={tool.id}
        onClick={() => onSelectTool(tool.id)}
        className="glass-card"
        style={{
          padding: '18px 20px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          cursor: 'pointer',
          position: 'relative',
          borderRadius: 'var(--radius-md)',
          border: '1px solid var(--border-subtle)',
          background: 'var(--bg-secondary)',
        }}
      >
        <div>
          {/* Card Top: Monochromatic Icon + Badge + Favorite */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '12px',
          }}>
            <div style={{
              width: '36px',
              height: '36px',
              borderRadius: 'var(--radius-sm)',
              background: 'var(--bg-tertiary)',
              color: 'var(--text-primary)',
              border: '1px solid var(--border-subtle)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <Icon size={18} strokeWidth={1.6} />
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              {tool.badge && (
                <span className="badge" style={{ fontSize: '10px', padding: '1px 6px' }}>
                  {tool.badge}
                </span>
              )}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleFavorite(tool.id);
                }}
                className="btn btn-ghost btn-icon"
                style={{ padding: '3px' }}
                title={isFavorited ? 'Remove from favorites' : 'Add to favorites'}
              >
                <Star 
                  size={13} 
                  fill={isFavorited ? 'var(--accent-primary)' : 'transparent'} 
                  color={isFavorited ? 'var(--accent-primary)' : 'var(--text-muted)'} 
                />
              </button>
            </div>
          </div>

          <h3 style={{
            fontSize: '15px',
            fontFamily: 'var(--font-body)',
            fontWeight: 600,
            marginBottom: '5px',
            color: 'var(--text-primary)',
            letterSpacing: '-0.01em',
          }}>
            {tool.name}
          </h3>

          <p style={{
            fontSize: '12.5px',
            color: 'var(--text-secondary)',
            lineHeight: 1.48,
            marginBottom: '16px',
          }}>
            {tool.description}
          </p>
        </div>

        {/* Card Footer: Metadata + Action Link */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingTop: '10px',
          borderTop: '1px solid var(--border-subtle)',
          fontSize: '11px',
          fontFamily: 'var(--font-mono)',
          color: 'var(--text-muted)',
        }}>
          <span>100% Local</span>
          <span style={{
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            fontWeight: 600,
            color: 'var(--text-primary)',
          }}>
            <span>Open</span>
            <ArrowRight size={11} strokeWidth={2} />
          </span>
        </div>
      </div>
    );
  };

  return (
    <section style={{
      maxWidth: '1160px',
      margin: '0 auto',
      padding: '24px 24px 72px',
    }}>
      {/* Directory Section Header & Filter */}
      <div style={{
        display: 'flex',
        alignItems: 'baseline',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '16px',
        borderBottom: '1px solid var(--border-subtle)',
        paddingBottom: '18px',
        marginBottom: '24px',
      }}>
        <div>
          <h2 style={{
            fontSize: '32px',
            fontFamily: 'var(--font-serif)',
            fontWeight: 400,
            letterSpacing: '-0.01em',
            marginBottom: '4px',
            color: 'var(--text-primary)',
          }}>
            Document Tools Directory
          </h2>
          <p style={{ fontSize: '13.5px', color: 'var(--text-secondary)' }}>
            43 precision utilities organized by operational workflow.
          </p>
        </div>

        {/* Search Input Filter */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          background: 'var(--bg-secondary)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-md)',
          padding: '6px 12px',
          width: '100%',
          maxWidth: '260px',
        }}>
          <Search size={14} color="var(--text-muted)" />
          <input 
            type="text"
            placeholder="Search all 43 tools…"
            value={searchFilter}
            onChange={(e) => setSearchFilter(e.target.value)}
            style={{
              border: 'none',
              background: 'transparent',
              outline: 'none',
              fontSize: '12.5px',
              color: 'var(--text-primary)',
              width: '100%',
            }}
          />
        </div>
      </div>

      {/* Architectural Category Pills */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
        overflowX: 'auto',
        paddingBottom: '12px',
        marginBottom: '32px',
        scrollbarWidth: 'none',
      }}>
        {categories.map((catKey) => {
          const isActive = selectedCategory === catKey;
          return (
            <button
              key={catKey}
              onClick={() => setSelectedCategory(catKey)}
              className="btn btn-sm"
              style={{
                borderRadius: 'var(--radius-sm)',
                padding: '4px 12px',
                background: isActive ? 'var(--text-primary)' : 'var(--bg-secondary)',
                color: isActive ? 'var(--bg-primary)' : 'var(--text-secondary)',
                border: '1px solid ' + (isActive ? 'var(--text-primary)' : 'var(--border-subtle)'),
                fontSize: '12px',
                fontWeight: isActive ? 600 : 500,
              }}
            >
              {CATEGORY_LABELS[catKey]}
            </button>
          );
        })}
      </div>

      {/* If filtering by search or specific category: flat grid */}
      {(selectedCategory !== 'all' || searchFilter.trim()) ? (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
          gap: '16px',
        }}>
          {filteredTools.map(renderToolCard)}
        </div>
      ) : (
        /* Semantic Groups by Intent (Default View) */
        <div style={{ display: 'flex', flexDirection: 'column', gap: '48px' }}>
          {INTENT_GROUPS.map((group) => {
            const groupTools = filteredTools.filter((t) => group.categoryIds.includes(t.category));
            if (groupTools.length === 0) return null;

            return (
              <div key={group.key}>
                {/* Group Heading */}
                <div style={{
                  display: 'flex',
                  alignItems: 'baseline',
                  justifyContent: 'space-between',
                  borderBottom: '1px solid var(--border-subtle)',
                  paddingBottom: '10px',
                  marginBottom: '18px',
                }}>
                  <div>
                    <h3 style={{
                      fontSize: '22px',
                      fontFamily: 'var(--font-serif)',
                      fontWeight: 400,
                      color: 'var(--text-primary)',
                      letterSpacing: '-0.01em',
                    }}>
                      {group.title}
                    </h3>
                    <p style={{ fontSize: '12.5px', color: 'var(--text-muted)' }}>
                      {group.subtitle}
                    </p>
                  </div>
                  <span style={{
                    fontSize: '11px',
                    fontFamily: 'var(--font-mono)',
                    color: 'var(--text-muted)',
                  }}>
                    {groupTools.length} {groupTools.length === 1 ? 'tool' : 'tools'}
                  </span>
                </div>

                {/* Group Tools Grid */}
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
                  gap: '16px',
                }}>
                  {groupTools.map(renderToolCard)}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
};
