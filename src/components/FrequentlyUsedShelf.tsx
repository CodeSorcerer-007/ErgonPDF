import React, { useState, useEffect } from 'react';
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
  ArrowRight,
  Sliders,
  Plus,
  Trash2,
  Edit3
} from 'lucide-react';
import { TOOLS_REGISTRY } from '../config/toolsRegistry';
import { StorageService } from '../services/storageService';
import type { PDFTool } from '../types/pdf';

interface FrequentlyUsedShelfProps {
  onSelectTool: (id: string) => void;
  favorites: string[];
  onToggleFavorite: (id: string) => void;
  onOpenCustomizer?: () => void;
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
  Edit3,
};

export const FrequentlyUsedShelf: React.FC<FrequentlyUsedShelfProps> = ({
  onSelectTool,
  favorites,
  onToggleFavorite,
  onOpenCustomizer,
}) => {
  const [shelfToolIds, setShelfToolIds] = useState<string[]>(() => StorageService.getCustomShelfTools());
  const [isCustomizeMode, setIsCustomizeMode] = useState(false);

  // Sync with storage on mount and window focus
  useEffect(() => {
    const handleStorageUpdate = () => {
      setShelfToolIds(StorageService.getCustomShelfTools());
    };
    window.addEventListener('storage', handleStorageUpdate);
    return () => window.removeEventListener('storage', handleStorageUpdate);
  }, []);

  const handleRemoveTool = (e: React.MouseEvent, toolId: string) => {
    e.stopPropagation();
    const updated = shelfToolIds.filter((id) => id !== toolId);
    setShelfToolIds(updated);
    StorageService.setCustomShelfTools(updated);
  };

  const shelfTools: PDFTool[] = shelfToolIds
    .map((id) => TOOLS_REGISTRY.find((t) => t.id === id))
    .filter((t): t is PDFTool => Boolean(t));

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
        flexWrap: 'wrap',
        gap: '10px',
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
            Priority Tools Shelf
          </h2>
          <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '4px', margin: 0 }}>
            {isCustomizeMode 
              ? 'Click ✕ on any tool to delete it from your shelf, or add more tools.' 
              : 'Your customizable fast-access tool dock. High-frequency local operations.'}
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {/* Toggle Customize Mode Button */}
          <button
            type="button"
            onClick={() => setIsCustomizeMode((prev) => !prev)}
            className={`btn btn-sm ${isCustomizeMode ? 'btn-primary' : 'btn-secondary'}`}
            style={{ fontSize: '12px', display: 'flex', alignItems: 'center', gap: '5px' }}
          >
            <Sliders size={13} />
            <span>{isCustomizeMode ? 'Done Customizing' : 'Customize Shelf'}</span>
          </button>

          {onOpenCustomizer && (
            <button
              type="button"
              onClick={onOpenCustomizer}
              className="btn btn-ghost btn-sm"
              style={{ fontSize: '12px', display: 'flex', alignItems: 'center', gap: '4px' }}
              title="Open full workspace customizer modal"
            >
              <span>More Options…</span>
            </button>
          )}

          <span className="badge badge-accent" style={{ fontSize: '11px', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <span>★</span>
            <span>Priority Dock</span>
          </span>
        </div>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
        gap: '16px',
      }}>
        {shelfTools.map((tool: PDFTool) => {
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
                  if (!isCustomizeMode) onSelectTool(tool.id);
                }
              }}
              onClick={() => {
                if (!isCustomizeMode) onSelectTool(tool.id);
              }}
              className="tool-card tool-card-popular animate-fade-in"
              style={{
                padding: '18px 20px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                cursor: isCustomizeMode ? 'default' : 'pointer',
                position: 'relative',
                borderRadius: 'var(--radius-md)',
                border: isCustomizeMode ? '1px dashed var(--accent-primary)' : '1px solid var(--border-medium)',
                background: 'var(--bg-card)',
                transition: 'all 0.15s ease',
              }}
            >
              <div>
                {/* Header row: Icon + Badges + Favorite/Remove */}
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
                    {isCustomizeMode ? (
                      /* Delete / Remove tool from shelf */
                      <button
                        type="button"
                        onClick={(e) => handleRemoveTool(e, tool.id)}
                        className="btn btn-danger btn-sm"
                        style={{ padding: '2px 8px', fontSize: '11px', display: 'flex', alignItems: 'center', gap: '4px' }}
                        title="Delete from shelf"
                      >
                        <Trash2 size={12} />
                        <span>Remove</span>
                      </button>
                    ) : (
                      <>
                        <span className="badge badge-accent" style={{ fontSize: '10px', padding: '1px 6px' }}>
                          Priority
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
                      </>
                    )}
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
                  <span>{isCustomizeMode ? 'Customizable' : 'Open'}</span>
                  {!isCustomizeMode && <ArrowRight size={11} strokeWidth={2} />}
                </div>
              </div>
            </div>
          );
        })}

        {/* Add Tool Card (In Customize Mode or when shelf is short) */}
        {(isCustomizeMode || shelfTools.length < 4) && (
          <div
            role="button"
            tabIndex={0}
            onClick={() => onOpenCustomizer?.()}
            style={{
              padding: '24px 20px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '10px',
              cursor: 'pointer',
              borderRadius: 'var(--radius-md)',
              border: '2px dashed var(--accent-primary)',
              background: 'rgba(59, 130, 246, 0.04)',
              color: 'var(--accent-primary)',
              textAlign: 'center',
            }}
          >
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              background: 'var(--accent-primary-light, rgba(59, 130, 246, 0.15))',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <Plus size={20} />
            </div>
            <div>
              <span style={{ fontSize: '14px', fontWeight: 700, display: 'block' }}>
                + Add Feature to Shelf
              </span>
              <span style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px', display: 'block' }}>
                Choose from all 134 precision tools
              </span>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};
