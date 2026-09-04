import type { RecentFile } from '../types/pdf';

const RECENT_FILES_KEY = 'ergonpdf_recent_files';
const FAVORITES_KEY = 'ergonpdf_favorite_tools';
const THEME_KEY = 'ergonpdf_theme';

export class StorageService {
  static getRecentFiles(): RecentFile[] {
    try {
      const data = localStorage.getItem(RECENT_FILES_KEY);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

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

  static clearRecentFiles(): void {
    localStorage.removeItem(RECENT_FILES_KEY);
  }

  static getFavoriteTools(): string[] {
    try {
      const data = localStorage.getItem(FAVORITES_KEY);
      return data ? JSON.parse(data) : ['merge-pdf', 'compress-pdf', 'sign-pdf', 'ocr-pdf'];
    } catch {
      return ['merge-pdf', 'compress-pdf', 'sign-pdf', 'ocr-pdf'];
    }
  }

  static toggleFavorite(toolId: string): string[] {
    const favorites = this.getFavoriteTools();
    const updated = favorites.includes(toolId)
      ? favorites.filter((id) => id !== toolId)
      : [...favorites, toolId];
    localStorage.setItem(FAVORITES_KEY, JSON.stringify(updated));
    return updated;
  }

  static getTheme(): 'dark' | 'light' | 'system' {
    return (localStorage.getItem(THEME_KEY) as 'dark' | 'light' | 'system') || 'dark';
  }

  static setTheme(theme: 'dark' | 'light' | 'system'): void {
    localStorage.setItem(THEME_KEY, theme);
  }
}
