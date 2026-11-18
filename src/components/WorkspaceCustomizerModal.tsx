import React, { useState } from 'react';
import { 
  X, 
  Sparkles, 
  Layers, 
  Plus, 
  Trash2, 
  ArrowLeft, 
  ArrowRight, 
  RotateCcw, 
  Search, 
  Check, 
  Sliders,
  Grid
} from 'lucide-react';
import { TOOLS_REGISTRY, CATEGORY_LABELS } from '../config/toolsRegistry';
import { StorageService, DEFAULT_SHELF_TOOLS, DEFAULT_WORKSPACE_QUICK_TOOLS, DEFAULT_CANVAS_PREFERENCES } from '../services/storageService';
import type { ToolCategory, CanvasPreferences } from '../types/pdf';

interface WorkspaceCustomizerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveShelfTools?: (toolIds: string[]) => void;
  onSaveWorkspaceTools?: (toolIds: string[]) => void;
}

export const WorkspaceCustomizerModal: React.FC<WorkspaceCustomizerModalProps> = ({
  isOpen,
  onClose,
  onSaveShelfTools,
  onSaveWorkspaceTools,
}) => {
  const [activeTab, setActiveTab] = useState<'shelf' | 'workspace' | 'canvas'>('shelf');
  
  // Custom Shelf state
  const [shelfTools, setShelfTools] = useState<string[]>(() => StorageService.getCustomShelfTools());
  // Workspace quick tools state
  const [workspaceQuickTools, setWorkspaceQuickTools] = useState<string[]>(() => StorageService.getWorkspaceQuickTools());
  // Canvas preferences state
  const [canvasPrefs, setCanvasPrefs] = useState<CanvasPreferences>(() => StorageService.getCanvasPreferences());
  // Default landing tool
  const [defaultTool, setDefaultTool] = useState<string>(() => StorageService.getDefaultLandingTool());

  // Search & filter
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<ToolCategory | 'all'>('all');
  const [feedbackMsg, setFeedbackMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const showFeedback = (msg: string) => {
    setFeedbackMsg(msg);
    setTimeout(() => setFeedbackMsg(null), 2200);
  };

  // Shelf modifications
  const handleRemoveFromShelf = (toolId: string) => {
    const updated = shelfTools.filter((id) => id !== toolId);
    setShelfTools(updated);
    StorageService.setCustomShelfTools(updated);
    onSaveShelfTools?.(updated);
    showFeedback('Tool removed from shelf');
  };

  const handleAddToShelf = (toolId: string) => {
    if (shelfTools.includes(toolId)) return;
    const updated = [...shelfTools, toolId];
    setShelfTools(updated);
    StorageService.setCustomShelfTools(updated);
    onSaveShelfTools?.(updated);
    showFeedback('Tool added to priority shelf');
  };

  const handleMoveShelfItem = (index: number, direction: 'left' | 'right') => {
    const targetIdx = direction === 'left' ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= shelfTools.length) return;
    const copy = [...shelfTools];
    const [moved] = copy.splice(index, 1);
    copy.splice(targetIdx, 0, moved);
    setShelfTools(copy);
    StorageService.setCustomShelfTools(copy);
    onSaveShelfTools?.(copy);
  };

  // Workspace ribbon modifications
  const handleToggleWorkspaceQuickTool = (toolId: string) => {
    const updated = workspaceQuickTools.includes(toolId)
      ? workspaceQuickTools.filter((id) => id !== toolId)
      : [...workspaceQuickTools, toolId];
    setWorkspaceQuickTools(updated);
    StorageService.setWorkspaceQuickTools(updated);
    onSaveWorkspaceTools?.(updated);
    showFeedback(workspaceQuickTools.includes(toolId) ? 'Removed from workspace ribbon' : 'Added to workspace ribbon');
  };

  // Canvas preferences update
  const handleUpdateCanvasPref = (updates: Partial<CanvasPreferences>) => {
    const updated = { ...canvasPrefs, ...updates };
    setCanvasPrefs(updated);
    StorageService.setCanvasPreferences(updated);
    showFeedback('Canvas preferences saved');
  };

  // Presets
  const applyPreset = (preset: 'designer' | 'admin' | 'security' | 'default') => {
    let newShelf: string[];
    let newQuick: string[];

    if (preset === 'designer') {
      newShelf = ['edit-pdf', 'sign-pdf', 'create-pdf', 'watermark-pdf', 'create-form', 'compress-pdf', 'ocr-pdf', 'pdf-to-images'];
      newQuick = ['edit-pdf', 'sign-pdf', 'watermark-pdf', 'create-form', 'crop-pdf', 'compress-pdf'];
    } else if (preset === 'security') {
      newShelf = ['redact-pdf', 'protect-pdf', 'unlock-pdf', 'remove-pdf-metadata', 'sign-pdf', 'compare-pdf', 'pdf-to-pdfa', 'watermark-pdf'];
      newQuick = ['redact-pdf', 'protect-pdf', 'unlock-pdf', 'remove-pdf-metadata', 'sign-pdf'];
    } else if (preset === 'admin') {
      newShelf = ['merge-pdf', 'split-pdf', 'organize', 'compress-pdf', 'extract-pages', 'rotate-pdf', 'halve-pdf', 'booklet-pdf'];
      newQuick = ['organize', 'compress-pdf', 'extract-pages', 'split-pdf', 'rotate-pdf'];
    } else {
      newShelf = [...DEFAULT_SHELF_TOOLS];
      newQuick = [...DEFAULT_WORKSPACE_QUICK_TOOLS];
    }

    setShelfTools(newShelf);
    setWorkspaceQuickTools(newQuick);
    StorageService.setCustomShelfTools(newShelf);
    StorageService.setWorkspaceQuickTools(newQuick);
    onSaveShelfTools?.(newShelf);
    onSaveWorkspaceTools?.(newQuick);
    showFeedback(`Applied "${preset}" workflow preset!`);
  };

  // Filter tools for catalog
  const filteredTools = TOOLS_REGISTRY.filter((tool) => {
    const matchesSearch = !searchQuery || 
      tool.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      tool.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tool.intents.some((i) => i.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesCat = selectedCategory === 'all' || tool.category === selectedCategory;
    return matchesSearch && matchesCat;
  });

  return (
    <div
      role="dialog"
      aria-modal="true"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 150,
        background: 'rgba(0, 0, 0, 0.7)',
        backdropFilter: 'blur(8px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
      }}
      onClick={onClose}
    >
      <div
        className="glass-panel animate-scale-in"
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '100%',
          maxWidth: '780px',
          maxHeight: '90vh',
          background: 'var(--bg-secondary, #141822)',
          borderRadius: 'var(--radius-lg, 16px)',
          border: '1px solid var(--border-medium)',
          boxShadow: '0 24px 48px rgba(0,0,0,0.4)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        }}
      >
        {/* Header */}
        <div style={{
          padding: '16px 20px',
          borderBottom: '1px solid var(--border-subtle)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: 'var(--bg-primary)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              background: 'var(--accent-primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff',
            }}>
              <Sliders size={18} />
            </div>
            <div>
              <h3 style={{ fontSize: '17px', fontWeight: 700, margin: 0, color: 'var(--text-primary)' }}>
                Customize Features & Workspace
              </h3>
              <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: 0 }}>
                Tailor your tools, priority shelf, quick ribbon, and design canvas to your exact workflow.
              </p>
            </div>
          </div>

          <button type="button" onClick={onClose} className="btn btn-ghost btn-icon">
            <X size={18} />
          </button>
        </div>

        {/* Tab Navigation */}
        <div style={{
          display: 'flex',
          borderBottom: '1px solid var(--border-subtle)',
          padding: '0 20px',
          background: 'var(--bg-primary)',
          gap: '12px',
        }}>
          {[
            { id: 'shelf', label: 'Priority Shelf Tools', icon: Layers },
            { id: 'workspace', label: 'Workspace Tool Ribbon', icon: Sparkles },
            { id: 'canvas', label: 'Design Canvas Settings', icon: Grid },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id as any)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '12px 6px',
                  background: 'none',
                  border: 'none',
                  borderBottom: isActive ? '2px solid var(--accent-primary)' : '2px solid transparent',
                  color: isActive ? 'var(--text-primary)' : 'var(--text-muted)',
                  fontSize: '13px',
                  fontWeight: isActive ? 700 : 500,
                  cursor: 'pointer',
                }}
              >
                <Icon size={14} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Feedback Alert Pill */}
        {feedbackMsg && (
          <div style={{
            background: 'var(--accent-primary)',
            color: '#ffffff',
            padding: '6px 16px',
            fontSize: '12px',
            fontWeight: 600,
            textAlign: 'center',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px',
          }}>
            <Check size={14} />
            <span>{feedbackMsg}</span>
          </div>
        )}

        {/* Tab 1: Priority Shelf Tools */}
        {activeTab === 'shelf' && (
          <div style={{ padding: '20px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '20px', flex: 1 }}>
            {/* Quick Presets */}
            <div>
              <span style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', letterSpacing: '0.04em' }}>
                Workflow Presets
              </span>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '8px' }}>
                <button type="button" onClick={() => applyPreset('designer')} className="btn btn-secondary btn-sm" style={{ fontSize: '11px' }}>
                  🎨 Creative Designer
                </button>
                <button type="button" onClick={() => applyPreset('admin')} className="btn btn-secondary btn-sm" style={{ fontSize: '11px' }}>
                  📂 Document Admin
                </button>
                <button type="button" onClick={() => applyPreset('security')} className="btn btn-secondary btn-sm" style={{ fontSize: '11px' }}>
                  🛡️ Privacy & Legal
                </button>
                <button type="button" onClick={() => applyPreset('default')} className="btn btn-ghost btn-sm" style={{ fontSize: '11px' }}>
                  <RotateCcw size={12} />
                  <span>Reset Default</span>
                </button>
              </div>
            </div>

            {/* Currently Active Shelf */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)' }}>
                  Active Shelf Tools ({shelfTools.length})
                </span>
                <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                  Click ✕ to delete from shelf, or arrows to reorder
                </span>
              </div>

              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(170px, 1fr))',
                gap: '8px',
                background: 'var(--bg-primary)',
                padding: '12px',
                borderRadius: '8px',
                border: '1px solid var(--border-subtle)',
              }}>
                {shelfTools.map((id, idx) => {
                  const tool = TOOLS_REGISTRY.find((t) => t.id === id);
                  return (
                    <div
                      key={id}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '6px 8px',
                        background: 'var(--bg-card)',
                        borderRadius: '6px',
                        border: '1px solid var(--border-subtle)',
                        fontSize: '12px',
                      }}
                    >
                      <span style={{ fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {tool?.name || id}
                      </span>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
                        <button
                          type="button"
                          disabled={idx === 0}
                          onClick={() => handleMoveShelfItem(idx, 'left')}
                          className="btn btn-ghost btn-icon"
                          style={{ padding: '2px', width: '18px', height: '18px' }}
                          title="Move left"
                        >
                          <ArrowLeft size={11} />
                        </button>
                        <button
                          type="button"
                          disabled={idx === shelfTools.length - 1}
                          onClick={() => handleMoveShelfItem(idx, 'right')}
                          className="btn btn-ghost btn-icon"
                          style={{ padding: '2px', width: '18px', height: '18px' }}
                          title="Move right"
                        >
                          <ArrowRight size={11} />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleRemoveFromShelf(id)}
                          className="btn btn-ghost btn-icon"
                          style={{ padding: '2px', width: '18px', height: '18px', color: '#ef4444' }}
                          title="Remove from shelf"
                        >
                          <Trash2 size={11} />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Catalog: Add Tools */}
            <div>
              <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)', display: 'block', marginBottom: '8px' }}>
                Add Tools from Directory (134 Available)
              </span>

              {/* Search & Category Filter */}
              <div style={{ display: 'flex', gap: '8px', marginBottom: '10px' }}>
                <div style={{ position: 'relative', flex: 1 }}>
                  <Search size={14} style={{ position: 'absolute', left: '10px', top: '10px', color: 'var(--text-muted)' }} />
                  <input
                    type="text"
                    placeholder="Search tools by name or purpose…"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '7px 10px 7px 32px',
                      borderRadius: '6px',
                      border: '1px solid var(--border-subtle)',
                      background: 'var(--bg-primary)',
                      color: 'var(--text-primary)',
                      fontSize: '12px',
                    }}
                  />
                </div>

                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value as any)}
                  style={{
                    padding: '7px 10px',
                    borderRadius: '6px',
                    border: '1px solid var(--border-subtle)',
                    background: 'var(--bg-primary)',
                    color: 'var(--text-primary)',
                    fontSize: '12px',
                  }}
                >
                  <option value="all">All Categories</option>
                  {Object.entries(CATEGORY_LABELS).map(([catKey, label]) => (
                    <option key={catKey} value={catKey}>{label}</option>
                  ))}
                </select>
              </div>

              {/* Tools List */}
              <div style={{
                maxHeight: '220px',
                overflowY: 'auto',
                border: '1px solid var(--border-subtle)',
                borderRadius: '8px',
                background: 'var(--bg-primary)',
              }}>
                {filteredTools.map((tool) => {
                  const isAdded = shelfTools.includes(tool.id);
                  return (
                    <div
                      key={tool.id}
                      style={{
                        padding: '8px 12px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        borderBottom: '1px solid var(--border-subtle)',
                        fontSize: '12px',
                      }}
                    >
                      <div>
                        <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{tool.name}</span>
                        <p style={{ margin: 0, fontSize: '11px', color: 'var(--text-muted)' }}>
                          {tool.description}
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={() => isAdded ? handleRemoveFromShelf(tool.id) : handleAddToShelf(tool.id)}
                        className={`btn btn-sm ${isAdded ? 'btn-secondary' : 'btn-primary'}`}
                        style={{ fontSize: '11px', padding: '4px 8px', flexShrink: 0 }}
                      >
                        {isAdded ? (
                          <>
                            <Check size={12} color="#10b981" />
                            <span>Added</span>
                          </>
                        ) : (
                          <>
                            <Plus size={12} />
                            <span>Add</span>
                          </>
                        )}
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Workspace Tool Ribbon */}
        {activeTab === 'workspace' && (
          <div style={{ padding: '20px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '20px', flex: 1 }}>
            <div>
              <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)' }}>
                Document Workspace Quick Switcher Ribbon
              </span>
              <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>
                Toggle which tools appear directly at the top of your document workspace for instant switching without menus.
              </p>
            </div>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
              gap: '10px',
            }}>
              {TOOLS_REGISTRY.slice(0, 40).map((tool) => {
                const isChecked = workspaceQuickTools.includes(tool.id);
                return (
                  <label
                    key={tool.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '8px 10px',
                      borderRadius: '6px',
                      background: isChecked ? 'rgba(59, 130, 246, 0.12)' : 'var(--bg-primary)',
                      border: isChecked ? '1px solid var(--accent-primary)' : '1px solid var(--border-subtle)',
                      cursor: 'pointer',
                      fontSize: '12px',
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => handleToggleWorkspaceQuickTool(tool.id)}
                    />
                    <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{tool.name}</span>
                  </label>
                );
              })}
            </div>

            {/* Default Landing Tool */}
            <div>
              <label style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)', display: 'block', marginBottom: '6px' }}>
                Default Tool On Document Open
              </label>
              <select
                value={defaultTool}
                onChange={(e) => {
                  setDefaultTool(e.target.value);
                  StorageService.setDefaultLandingTool(e.target.value);
                  showFeedback(`Default landing tool set to ${e.target.value}`);
                }}
                style={{
                  width: '100%',
                  maxWidth: '320px',
                  padding: '8px 10px',
                  borderRadius: '6px',
                  border: '1px solid var(--border-subtle)',
                  background: 'var(--bg-primary)',
                  color: 'var(--text-primary)',
                  fontSize: '12px',
                  fontWeight: 600,
                }}
              >
                <option value="edit-pdf">✨ Design & Edit PDF (Interactive Canvas)</option>
                <option value="organize">📋 Rearrange & Organize Pages</option>
                <option value="sign-pdf">✍️ Sign Document</option>
                <option value="compress-pdf">⚡ Compress PDF</option>
                <option value="view-pdf">📖 Fullscreen Reader</option>
              </select>
            </div>
          </div>
        )}

        {/* Tab 3: Design Canvas Settings */}
        {activeTab === 'canvas' && (
          <div style={{ padding: '20px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '20px', flex: 1 }}>
            <div>
              <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)' }}>
                Design Canvas Behavior & Defaults
              </span>
              <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>
                Customize default fonts, alignments, colors, and snapping behavior for adding elements like a design suite.
              </p>
            </div>

            {/* Snap to Grid */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '12px',
              borderRadius: '8px',
              background: 'var(--bg-primary)',
              border: '1px solid var(--border-subtle)',
            }}>
              <div>
                <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>Snap to Grid</span>
                <p style={{ margin: 0, fontSize: '11px', color: 'var(--text-muted)' }}>
                  Automatically aligns dragged and resized elements to page grid increments.
                </p>
              </div>
              <input
                type="checkbox"
                checked={canvasPrefs.snapToGrid}
                onChange={(e) => handleUpdateCanvasPref({ snapToGrid: e.target.checked })}
                style={{ width: '18px', height: '18px' }}
              />
            </div>

            {/* Default Font Settings */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
              <div>
                <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-primary)', display: 'block', marginBottom: '4px' }}>
                  Default Typography Font
                </label>
                <select
                  value={canvasPrefs.defaultFont}
                  onChange={(e) => handleUpdateCanvasPref({ defaultFont: e.target.value as any })}
                  style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid var(--border-subtle)', background: 'var(--bg-primary)', color: 'var(--text-primary)', fontSize: '12px' }}
                >
                  <option value="Helvetica">Inter / Helvetica (Sans-Serif)</option>
                  <option value="TimesRoman">Times Roman (Serif Editorial)</option>
                  <option value="Courier">Courier (Monospace Code)</option>
                </select>
              </div>

              <div>
                <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-primary)', display: 'block', marginBottom: '4px' }}>
                  Default Font Size ({canvasPrefs.defaultFontSize}pt)
                </label>
                <input
                  type="range"
                  min={10}
                  max={36}
                  value={canvasPrefs.defaultFontSize}
                  onChange={(e) => handleUpdateCanvasPref({ defaultFontSize: Number(e.target.value) })}
                  style={{ width: '100%', marginTop: '8px' }}
                />
              </div>
            </div>

            {/* Default Shape Fill & Stroke */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
              <div>
                <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-primary)', display: 'block', marginBottom: '4px' }}>
                  Default Text Color
                </label>
                <div style={{ display: 'flex', gap: '8px', marginTop: '6px' }}>
                  {['#111827', '#ffffff', '#ef4444', '#3b82f6', '#10b981'].map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => handleUpdateCanvasPref({ defaultTextColor: c })}
                      style={{
                        width: '24px',
                        height: '24px',
                        borderRadius: '50%',
                        background: c,
                        border: canvasPrefs.defaultTextColor === c ? '2px solid var(--accent-primary)' : '1px solid rgba(255,255,255,0.2)',
                        cursor: 'pointer',
                      }}
                    />
                  ))}
                </div>
              </div>

              <div>
                <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-primary)', display: 'block', marginBottom: '4px' }}>
                  Auto-Select Element on Add
                </label>
                <div style={{ marginTop: '8px' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={canvasPrefs.autoSelectOnAdd}
                      onChange={(e) => handleUpdateCanvasPref({ autoSelectOnAdd: e.target.checked })}
                    />
                    <span>Immediately focus new text and shapes</span>
                  </label>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <div style={{
          padding: '12px 20px',
          borderTop: '1px solid var(--border-subtle)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: 'var(--bg-primary)',
        }}>
          <button
            type="button"
            onClick={() => {
              StorageService.resetWorkspaceCustomization();
              setShelfTools([...DEFAULT_SHELF_TOOLS]);
              setWorkspaceQuickTools([...DEFAULT_WORKSPACE_QUICK_TOOLS]);
              setCanvasPrefs({ ...DEFAULT_CANVAS_PREFERENCES });
              showFeedback('Reset all customizations to defaults');
            }}
            className="btn btn-ghost btn-sm"
            style={{ fontSize: '12px', color: 'var(--text-muted)' }}
          >
            <RotateCcw size={13} />
            <span>Reset All Defaults</span>
          </button>

          <button
            type="button"
            onClick={onClose}
            className="btn btn-primary btn-sm"
          >
            Done Customizing
          </button>
        </div>
      </div>
    </div>
  );
};
