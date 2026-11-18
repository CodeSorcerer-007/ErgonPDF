import type { RecentFile, CanvasPreferences } from '../types/pdf';

const RECENT_FILES_KEY = 'ergonpdf_recent_files';
const FAVORITES_KEY = 'ergonpdf_favorite_tools';
const THEME_KEY = 'ergonpdf_theme';
const DEFAULT_DPI_KEY = 'ergonpdf_default_dpi';
const CUSTOM_SHELF_TOOLS_KEY = 'ergonpdf_custom_shelf_tools';
const WORKSPACE_QUICK_TOOLS_KEY = 'ergonpdf_workspace_quick_tools';
const CANVAS_PREFERENCES_KEY = 'ergonpdf_canvas_preferences';
const DEFAULT_LANDING_TOOL_KEY = 'ergonpdf_default_landing_tool';

export const DEFAULT_SHELF_TOOLS = [
  'edit-pdf',
  'merge-pdf',
  'split-pdf',
  'compress-pdf',
  'sign-pdf',
  'organize',
  'ocr-pdf',
  'watermark-pdf'
];

export const DEFAULT_WORKSPACE_QUICK_TOOLS = [
  'edit-pdf',
  'organize',
  'sign-pdf',
  'compress-pdf',
  'watermark-pdf',
  'protect-pdf',
  'ocr-pdf',
  'redact-pdf'
];

export const DEFAULT_CANVAS_PREFERENCES: CanvasPreferences = {
  defaultFont: 'Helvetica',
  defaultFontSize: 16,
  defaultTextColor: '#111827',
  defaultShapeFill: 'rgba(59, 130, 246, 0.15)',
  defaultStrokeColor: '#2563eb',
  snapToGrid: false,
  gridSize: 2,
  autoSelectOnAdd: true,
};

/**
 * Manages browser localStorage persistence for recent documents, pinned tools, theme preferences, and default rendering DPI.
 */
export class StorageService {
  /**
   * Retrieves the user's preferred default DPI for compression and rasterization.
   *
   * @returns The saved DPI number, or 150 as default.
   */
  static getDefaultDpi(): number {
    try {
      const val = localStorage.getItem(DEFAULT_DPI_KEY);
      return val ? parseInt(val, 10) || 150 : 150;
    } catch {
      return 150;
    }
  }

  /**
   * Persists the user's preferred default DPI.
   *
   * @param dpi - Target DPI resolution.
   */
  static setDefaultDpi(dpi: number): void {
    try {
      localStorage.setItem(DEFAULT_DPI_KEY, String(dpi));
    } catch {
      // ignore
    }
  }
  /**
   * Retrieves the list of recently opened PDF files from local storage.
   *
   * @returns Array of recent file metadata objects, or an empty array if none exist.
   */
  static getRecentFiles(): RecentFile[] {
    try {
      const data = localStorage.getItem(RECENT_FILES_KEY);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  /**
   * Adds or updates a document entry in the recent files list (capped at 10 items).
   *
   * @param file - Recent file descriptor omitting auto-generated ID and timestamp.
   */
  static addRecentFile(file: Omit<RecentFile, 'id' | 'timestamp'>): void {
    try {
      const current = this.getRecentFiles();
      const newEntry: RecentFile = {
        ...file,
        id: `file-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        timestamp: Date.now(),
      };
      // Keep most recent 10 files
      const updated = [newEntry, ...current.filter((f) => f.name !== file.name)].slice(0, 10);
      localStorage.setItem(RECENT_FILES_KEY, JSON.stringify(updated));
    } catch {
      // localStorage may fail if quota exceeded
    }
  }

  /**
   * Clears all stored recent files from local storage.
   */
  static clearRecentFiles(): void {
    localStorage.removeItem(RECENT_FILES_KEY);
  }

  /**
   * Retrieves favorite tool IDs pinned by the user.
   *
   * @returns Array of favorite tool identifier strings.
   */
  static getFavoriteTools(): string[] {
    try {
      const data = localStorage.getItem(FAVORITES_KEY);
      return data ? JSON.parse(data) : ['merge-pdf', 'compress-pdf', 'sign-pdf', 'ocr-pdf'];
    } catch {
      return ['merge-pdf', 'compress-pdf', 'sign-pdf', 'ocr-pdf'];
    }
  }

  /**
   * Toggles a tool's pinned status in the user's favorites list.
   *
   * @param toolId - The unique tool identifier to pin or unpin.
   * @returns The updated array of favorite tool IDs.
   */
  static toggleFavorite(toolId: string): string[] {
    const favorites = this.getFavoriteTools();
    const updated = favorites.includes(toolId)
      ? favorites.filter((id) => id !== toolId)
      : [...favorites, toolId];
    localStorage.setItem(FAVORITES_KEY, JSON.stringify(updated));
    return updated;
  }

  /**
   * Gets the active UI theme preference.
   *
   * @returns The saved theme ('dark', 'light', or 'system'), defaulting to 'dark'.
   */
  static getTheme(): 'dark' | 'light' | 'system' {
    return (localStorage.getItem(THEME_KEY) as 'dark' | 'light' | 'system') || 'dark';
  }

  /**
   * Saves the user's preferred UI theme.
   *
   * @param theme - The desired theme ('dark', 'light', or 'system').
   */
  static setTheme(theme: 'dark' | 'light' | 'system'): void {
    localStorage.setItem(THEME_KEY, theme);
  }

  /**
   * Retrieves user-customized tools for the home Priority Shelf.
   */
  static getCustomShelfTools(): string[] {
    try {
      const data = localStorage.getItem(CUSTOM_SHELF_TOOLS_KEY);
      if (!data) return [...DEFAULT_SHELF_TOOLS];
      const parsed = JSON.parse(data);
      return Array.isArray(parsed) && parsed.length > 0 ? parsed : [...DEFAULT_SHELF_TOOLS];
    } catch {
      return [...DEFAULT_SHELF_TOOLS];
    }
  }

  /**
   * Persists user-customized tools for the home Priority Shelf.
   */
  static setCustomShelfTools(toolIds: string[]): void {
    try {
      localStorage.setItem(CUSTOM_SHELF_TOOLS_KEY, JSON.stringify(toolIds));
    } catch {
      // ignore
    }
  }

  /**
   * Retrieves user-customized quick tools for the document workspace header.
   */
  static getWorkspaceQuickTools(): string[] {
    try {
      const data = localStorage.getItem(WORKSPACE_QUICK_TOOLS_KEY);
      if (!data) return [...DEFAULT_WORKSPACE_QUICK_TOOLS];
      const parsed = JSON.parse(data);
      return Array.isArray(parsed) && parsed.length > 0 ? parsed : [...DEFAULT_WORKSPACE_QUICK_TOOLS];
    } catch {
      return [...DEFAULT_WORKSPACE_QUICK_TOOLS];
    }
  }

  /**
   * Persists user-customized quick tools for the document workspace header.
   */
  static setWorkspaceQuickTools(toolIds: string[]): void {
    try {
      localStorage.setItem(WORKSPACE_QUICK_TOOLS_KEY, JSON.stringify(toolIds));
    } catch {
      // ignore
    }
  }

  /**
   * Retrieves user preferences for the design canvas.
   */
  static getCanvasPreferences(): CanvasPreferences {
    try {
      const data = localStorage.getItem(CANVAS_PREFERENCES_KEY);
      if (!data) return { ...DEFAULT_CANVAS_PREFERENCES };
      const parsed = JSON.parse(data);
      return { ...DEFAULT_CANVAS_PREFERENCES, ...parsed };
    } catch {
      return { ...DEFAULT_CANVAS_PREFERENCES };
    }
  }

  /**
   * Updates user preferences for the design canvas.
   */
  static setCanvasPreferences(prefs: Partial<CanvasPreferences>): void {
    try {
      const current = this.getCanvasPreferences();
      localStorage.setItem(CANVAS_PREFERENCES_KEY, JSON.stringify({ ...current, ...prefs }));
    } catch {
      // ignore
    }
  }

  /**
   * Retrieves the user's default landing tool when opening documents.
   */
  static getDefaultLandingTool(): string {
    try {
      return localStorage.getItem(DEFAULT_LANDING_TOOL_KEY) || 'edit-pdf';
    } catch {
      return 'edit-pdf';
    }
  }

  /**
   * Sets the user's default landing tool when opening documents.
   */
  static setDefaultLandingTool(toolId: string): void {
    try {
      localStorage.setItem(DEFAULT_LANDING_TOOL_KEY, toolId);
    } catch {
      // ignore
    }
  }

  /**
   * Resets all tool and workspace customizations back to system defaults.
   */
  static resetWorkspaceCustomization(): void {
    try {
      localStorage.removeItem(CUSTOM_SHELF_TOOLS_KEY);
      localStorage.removeItem(WORKSPACE_QUICK_TOOLS_KEY);
      localStorage.removeItem(CANVAS_PREFERENCES_KEY);
      localStorage.removeItem(DEFAULT_LANDING_TOOL_KEY);
    } catch {
      // ignore
    }
  }
}
