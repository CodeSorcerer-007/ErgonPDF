import React from 'react';
import { 
  FileText, 
  Layers, 
  Scissors, 
  Minimize2, 
  PenTool, 
  Lock, 
  ScanText, 
  FileOutput, 
  CheckSquare, 
  Star, 
  ArrowRight 
} from 'lucide-react';
import { TOOLS_REGISTRY } from '../config/toolsRegistry';
import type { PDFTool } from '../types/pdf';

interface FrequentlyUsedShelfProps {
  onSelectTool: (id: string) => void;
  favorites: string[];
  onToggleFavorite: (id: string) => void;
}

const ICON_MAP: Record<string, React.ElementType> = {
  Layers,
  Scissors,
  Minimize2,
  PenTool,
  Lock,
  ScanText,
  FileOutput,
  CheckSquare,
  FileText,
};

export const FrequentlyUsedShelf: React.FC<FrequentlyUsedShelfProps> = ({
  onSelectTool,
  favorites,
  onToggleFavorite,
}) => {
  const popularTools = TOOLS_REGISTRY.filter((tool) => tool.popular).slice(0, 8);

  if (popularTools.length === 0) return null;

  return (
    <section 
      aria-label="Frequently used tools"
      className="frequently-used-shelf"
    >
      <div style={{
        display: 'flex',
        alignItems: 'baseline',
        justifyContent: 'space-between',
        borderBottom: '1px solid var(--border-subtle)',
        paddingBottom: '12px',
        marginBottom: '20px',
      }}>
        <div>
          <h2 style={{
            fontSize: '22px',
            fontFamily: 'var(--font-heading)',
            fontWeight: 600,
            color: 'var(--text-primary)',
            letterSpacing: '-0.02em',
            margin: 0,
          }}>
            Frequently Used Tools
          </h2>
          <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '4px', margin: 0 }}>
            High-frequency operations for rapid, local document transformation.
          </p>
        </div>
        <span className="badge badge-accent" style={{ fontSize: '11px', display: 'flex', alignItems: 'center', gap: '4px' }}>
          <span>★</span>
          <span>Priority Shelf</span>
        </span>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
        gap: '16px',
      }}>
        {popularTools.map((tool: PDFTool) => {
          const Icon = ICON_MAP[tool.iconName] || FileText;
          const isFavorited = favorites.includes(tool.id);

          return (
            <div
              key={tool.id}
              role="button"
              tabIndex={0}
              aria-label={`${tool.name}: ${tool.description}`}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  onSelectTool(tool.id);
                }
              }}
              onClick={() => onSelectTool(tool.id)}
              className="tool-card tool-card-popular"
              style={{
                padding: '18px 20px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                cursor: 'pointer',
                position: 'relative',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-medium)',
                background: 'var(--bg-card)',
              }}
            >
              <div>
                {/* Header row: Icon + Badges + Favorite */}
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
                    color: 'var(--accent-primary)',
                    border: '1px solid var(--border-subtle)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}>
                    <Icon size={18} strokeWidth={1.75} />
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span className="badge badge-accent" style={{ fontSize: '10px', padding: '1px 6px' }}>
                      Popular
                    </span>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onToggleFavorite(tool.id);
                      }}
                      className="btn btn-ghost btn-icon"
                      style={{ padding: '3px' }}
                      title={isFavorited ? 'Remove from favorites' : 'Add to favorites'}
                      aria-label={isFavorited ? `Remove ${tool.name} from favorites` : `Add ${tool.name} to favorites`}
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
                  fontWeight: 600,
                  marginBottom: '6px',
                  color: 'var(--text-primary)',
                  letterSpacing: '-0.01em',
                }}>
                  {tool.name}
                </h3>

                <p className="tool-card-description">
                  {tool.description}
                </p>
              </div>

              {/* Card Footer */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                paddingTop: '10px',
                borderTop: '1px solid var(--border-subtle)',
                fontSize: '11px',
                color: 'var(--text-muted)',
              }}>
                <span style={{ fontFamily: 'var(--font-mono)' }}>100% Local</span>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '3px',
                  color: 'var(--accent-primary)',
                  fontWeight: 600,
                }}>
                  <span>Open</span>
                  <ArrowRight size={11} strokeWidth={2} />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};
