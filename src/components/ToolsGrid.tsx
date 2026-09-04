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
  Search
} from 'lucide-react';
import { TOOLS_REGISTRY, CATEGORY_LABELS } from '../config/toolsRegistry';
import type { PDFTool } from '../types/pdf';

interface ToolsGridProps {
  onSelectTool: (toolId: string) => void;
  favorites: string[];
  onToggleFavorite: (toolId: string) => void;
}

// Icon mapper
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
};

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

  return (
    <section style={{
      maxWidth: '1200px',
      margin: '0 auto',
      padding: '24px 24px 64px',
    }}>
      {/* Section Header & Search */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '16px',
        marginBottom: '24px',
      }}>
        <div>
          <h2 style={{ fontSize: '24px', fontWeight: 800, letterSpacing: '-0.02em', marginBottom: '4px' }}>
            Explore All Document Tools
          </h2>
          <p style={{ fontSize: '14px', color: 'var(--text-muted)' }}>
            Choose a specialized tool or start directly by uploading in the workspace above.
          </p>
        </div>

        {/* Search Input Filter */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          background: 'var(--bg-glass)',
          border: '1px solid var(--border-medium)',
          borderRadius: 'var(--radius-md)',
          padding: '8px 14px',
          width: '100%',
          maxWidth: '300px',
        }}>
          <Search size={16} color="var(--text-muted)" />
          <input 
            type="text"
            placeholder="Filter tools by keyword…"
            value={searchFilter}
            onChange={(e) => setSearchFilter(e.target.value)}
            style={{
              border: 'none',
              background: 'transparent',
              outline: 'none',
              fontSize: '13px',
              color: 'var(--text-primary)',
              width: '100%',
            }}
          />
        </div>
      </div>

      {/* Category Tabs */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        overflowX: 'auto',
        paddingBottom: '12px',
        marginBottom: '28px',
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
                borderRadius: 'var(--radius-full)',
                padding: '6px 14px',
                background: isActive ? 'var(--accent-primary)' : 'var(--bg-tertiary)',
                color: isActive ? '#ffffff' : 'var(--text-secondary)',
                border: isActive ? '1px solid var(--accent-primary)' : '1px solid var(--border-subtle)',
                fontWeight: isActive ? 600 : 500,
                boxShadow: isActive ? '0 2px 8px rgba(99, 102, 241, 0.3)' : 'none',
              }}
            >
              {CATEGORY_LABELS[catKey]}
            </button>
          );
        })}
      </div>

      {/* Tools Card Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
        gap: '18px',
      }}>
        {filteredTools.map((tool: PDFTool) => {
          const Icon = ICON_MAP[tool.iconName] || FileText;
          const isFavorited = favorites.includes(tool.id);

          return (
            <div
              key={tool.id}
              onClick={() => onSelectTool(tool.id)}
              className="glass-card"
              style={{
                padding: '20px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                cursor: 'pointer',
                position: 'relative',
              }}
            >
              <div>
                <div style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  justifyContent: 'space-between',
                  marginBottom: '14px',
                }}>
                  <div style={{
                    width: '44px',
                    height: '44px',
                    borderRadius: '12px',
                    background: 'var(--accent-primary-light)',
                    color: 'var(--accent-primary)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}>
                    <Icon size={22} strokeWidth={2} />
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    {tool.badge && (
                      <span className="badge badge-accent" style={{ fontSize: '10px' }}>
                        {tool.badge}
                      </span>
                    )}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onToggleFavorite(tool.id);
                      }}
                      className="btn btn-ghost btn-icon"
                      style={{ padding: '4px' }}
                      title={isFavorited ? 'Remove from favorites' : 'Add to favorites'}
                    >
                      <Star 
                        size={15} 
                        fill={isFavorited ? '#f59e0b' : 'transparent'} 
                        color={isFavorited ? '#f59e0b' : 'var(--text-muted)'} 
                      />
                    </button>
                  </div>
                </div>

                <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '6px', color: 'var(--text-primary)' }}>
                  {tool.name}
                </h3>

                <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.45, marginBottom: '16px' }}>
                  {tool.description}
                </p>
              </div>

              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                paddingTop: '12px',
                borderTop: '1px solid var(--border-subtle)',
                fontSize: '11px',
                color: 'var(--text-muted)',
              }}>
                <span className="badge badge-privacy" style={{ fontSize: '10px', padding: '1px 6px' }}>
                  100% Local
                </span>
                <span style={{ fontWeight: 600, color: 'var(--accent-primary)' }}>
                  Use Tool →
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};
