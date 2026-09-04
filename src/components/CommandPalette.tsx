import React, { useState, useEffect, useRef } from 'react';
import { Search, X, CornerDownLeft, Sparkles, Moon, Sun, Settings } from 'lucide-react';
import { TOOLS_REGISTRY } from '../config/toolsRegistry';
import type { PDFTool } from '../types/pdf';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectTool: (toolId: string) => void;
  onToggleTheme: () => void;
  onOpenSettings: () => void;
  currentTheme: 'dark' | 'light' | 'system';
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({
  isOpen,
  onClose,
  onSelectTool,
  onToggleTheme,
  onOpenSettings,
  currentTheme,
}) => {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
      setQuery('');
      setSelectedIndex(0);
    }
  }, [isOpen]);

  // Match items based on query
  const filteredTools = React.useMemo(() => {
    if (!query.trim()) {
      return TOOLS_REGISTRY.slice(0, 8);
    }
    const q = query.toLowerCase().trim();
    return TOOLS_REGISTRY.filter((t) => {
      const matchName = t.name.toLowerCase().includes(q);
      const matchDesc = t.description.toLowerCase().includes(q);
      const matchIntents = t.intents.some((i) => i.toLowerCase().includes(q));
      return matchName || matchDesc || matchIntents;
    });
  }, [query]);

  // System actions (toggle theme, settings)
  const systemActions = React.useMemo(() => {
    const q = query.toLowerCase().trim();
    const actions = [];
    if (!q || 'theme'.includes(q) || 'dark'.includes(q) || 'light'.includes(q)) {
      actions.push({
        id: 'action-theme',
        name: `Toggle Theme (Currently ${currentTheme === 'dark' ? 'Dark' : 'Light'})`,
        desc: 'Switch between dark and light color scheme',
        icon: currentTheme === 'dark' ? Sun : Moon,
        execute: () => {
          onToggleTheme();
          onClose();
        },
      });
    }
    if (!q || 'settings'.includes(q) || 'config'.includes(q) || 'dpi'.includes(q)) {
      actions.push({
        id: 'action-settings',
        name: 'Workspace Settings',
        desc: 'Configure DPI, compression presets, and local AI settings',
        icon: Settings,
        execute: () => {
          onOpenSettings();
          onClose();
        },
      });
    }
    return actions;
  }, [query, currentTheme, onToggleTheme, onOpenSettings, onClose]);

  const allItemsCount = filteredTools.length + systemActions.length;

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;

      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev + 1) % (allItemsCount || 1));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev - 1 + allItemsCount) % (allItemsCount || 1));
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (selectedIndex < filteredTools.length) {
          const tool = filteredTools[selectedIndex];
          if (tool) {
            onSelectTool(tool.id);
            onClose();
          }
        } else {
          const actIndex = selectedIndex - filteredTools.length;
          const action = systemActions[actIndex];
          if (action) {
            action.execute();
          }
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, selectedIndex, filteredTools, systemActions, allItemsCount, onSelectTool, onClose]);

  if (!isOpen) return null;

  return (
    <div 
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 100,
        background: 'rgba(0, 0, 0, 0.65)',
        backdropFilter: 'blur(8px)',
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'center',
        paddingTop: '12vh',
      }}
      onClick={onClose}
    >
      <div 
        className="glass-panel animate-scale-in"
        style={{
          width: '100%',
          maxWidth: '620px',
          maxHeight: '75vh',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: 'var(--shadow-xl)',
          overflow: 'hidden',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input Bar */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          padding: '16px 20px',
          borderBottom: '1px solid var(--border-medium)',
        }}>
          <Search size={20} color="var(--accent-primary)" />
          <input 
            ref={inputRef}
            type="text"
            placeholder="Type what you want to do (e.g. 'make smaller', 'sign', 'merge')…"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            style={{
              flex: 1,
              background: 'transparent',
              border: 'none',
              outline: 'none',
              fontSize: '16px',
              color: 'var(--text-primary)',
            }}
          />
          <button 
            onClick={onClose}
            className="btn btn-ghost btn-icon"
            style={{ padding: '4px' }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Results List */}
        <div style={{
          flex: 1,
          overflowY: 'auto',
          padding: '10px',
        }}>
          {allItemsCount === 0 ? (
            <div style={{ padding: '36px 20px', textAlign: 'center', color: 'var(--text-muted)' }}>
              <p style={{ fontSize: '15px', fontWeight: 500, marginBottom: '6px' }}>
                No matching tools or actions found
              </p>
              <p style={{ fontSize: '13px' }}>
                Try searching for common tasks like "compress", "combine", "watermark", or "convert"
              </p>
            </div>
          ) : (
            <>
              {filteredTools.length > 0 && (
                <div style={{ marginBottom: '8px' }}>
                  <span style={{ 
                    fontSize: '11px', 
                    fontWeight: 600, 
                    textTransform: 'uppercase', 
                    letterSpacing: '0.05em', 
                    color: 'var(--text-muted)',
                    padding: '4px 12px',
                    display: 'block'
                  }}>
                    PDF Tools & Actions
                  </span>
                  {filteredTools.map((tool: PDFTool, index: number) => {
                    const isSelected = index === selectedIndex;
                    return (
                      <div
                        key={tool.id}
                        onClick={() => {
                          onSelectTool(tool.id);
                          onClose();
                        }}
                        onMouseEnter={() => setSelectedIndex(index)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: '10px 14px',
                          borderRadius: 'var(--radius-md)',
                          cursor: 'pointer',
                          background: isSelected ? 'var(--accent-primary-light)' : 'transparent',
                          border: isSelected ? '1px solid var(--accent-primary)' : '1px solid transparent',
                          transition: 'all var(--transition-fast)',
                          marginBottom: '4px',
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <div style={{
                            width: '32px',
                            height: '32px',
                            borderRadius: '8px',
                            background: isSelected ? 'var(--accent-primary)' : 'var(--bg-tertiary)',
                            color: isSelected ? '#ffffff' : 'var(--text-primary)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}>
                            <Sparkles size={16} />
                          </div>
                          <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <span style={{ fontWeight: 600, fontSize: '14px', color: 'var(--text-primary)' }}>
                                {tool.name}
                              </span>
                              {tool.badge && (
                                <span className="badge badge-accent" style={{ fontSize: '10px', padding: '1px 5px' }}>
                                  {tool.badge}
                                </span>
                              )}
                            </div>
                            <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                              {tool.description}
                            </p>
                          </div>
                        </div>

                        {isSelected && (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--accent-primary)' }}>
                            <span style={{ fontSize: '11px', fontWeight: 600 }}>Open</span>
                            <CornerDownLeft size={14} />
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}

              {systemActions.length > 0 && (
                <div>
                  <span style={{ 
                    fontSize: '11px', 
                    fontWeight: 600, 
                    textTransform: 'uppercase', 
                    letterSpacing: '0.05em', 
                    color: 'var(--text-muted)',
                    padding: '4px 12px',
                    display: 'block'
                  }}>
                    System & Preferences
                  </span>
                  {systemActions.map((action, idx) => {
                    const globalIdx = filteredTools.length + idx;
                    const isSelected = globalIdx === selectedIndex;
                    const Icon = action.icon;
                    return (
                      <div
                        key={action.id}
                        onClick={action.execute}
                        onMouseEnter={() => setSelectedIndex(globalIdx)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: '10px 14px',
                          borderRadius: 'var(--radius-md)',
                          cursor: 'pointer',
                          background: isSelected ? 'var(--accent-primary-light)' : 'transparent',
                          border: isSelected ? '1px solid var(--accent-primary)' : '1px solid transparent',
                          transition: 'all var(--transition-fast)',
                          marginBottom: '4px',
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <div style={{
                            width: '32px',
                            height: '32px',
                            borderRadius: '8px',
                            background: 'var(--bg-tertiary)',
                            color: 'var(--text-primary)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}>
                            <Icon size={16} />
                          </div>
                          <div>
                            <span style={{ fontWeight: 600, fontSize: '14px', color: 'var(--text-primary)' }}>
                              {action.name}
                            </span>
                            <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                              {action.desc}
                            </p>
                          </div>
                        </div>

                        {isSelected && (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--accent-primary)' }}>
                            <CornerDownLeft size={14} />
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer Hint Bar */}
        <div style={{
          padding: '10px 20px',
          borderTop: '1px solid var(--border-subtle)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          fontSize: '12px',
          color: 'var(--text-muted)',
          background: 'var(--bg-tertiary)',
        }}>
          <div style={{ display: 'flex', gap: '14px' }}>
            <span><kbd>↑</kbd> <kbd>↓</kbd> to navigate</span>
            <span><kbd>↵</kbd> to select</span>
            <span><kbd>esc</kbd> to close</span>
          </div>
          <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            🔒 100% In-Browser Execution
          </span>
        </div>
      </div>
    </div>
  );
};
