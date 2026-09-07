import type { RecentFile } from '../types/pdf';

const RECENT_FILES_KEY = 'ergonpdf_recent_files';
const FAVORITES_KEY = 'ergonpdf_favorite_tools';
const THEME_KEY = 'ergonpdf_theme';

/**
 * Manages browser localStorage persistence for recent documents, pinned tools, and theme preferences.
 */
export class StorageService {
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
}
