export type ToolCategory = 
  | 'organize' 
  | 'edit' 
  | 'convert' 
  | 'compress' 
  | 'security' 
  | 'ocr' 
  | 'ai';

export interface PDFTool {
  id: string;
  name: string;
  shortName?: string;
  description: string;
  category: ToolCategory;
  iconName: string;
  intents: string[];
  processingMode: 'local' | 'hybrid' | 'server';
  badge?: string;
  popular?: boolean;
}

export interface PDFPageInfo {
  pageNumber: number;
  originalIndex: number;
  rotation: number; // 0, 90, 180, 270
  thumbnailUrl?: string;
  width: number;
  height: number;
  isSelected?: boolean;
  deleted?: boolean;
}

export interface PDFMetadata {
  title?: string;
  author?: string;
  subject?: string;
  keywords?: string;
  creator?: string;
  producer?: string;
  creationDate?: string;
  modificationDate?: string;
}

export interface PDFDocumentState {
  id: string;
  name: string;
  size: number;
  arrayBuffer: ArrayBuffer;
  pageCount: number;
  pages: PDFPageInfo[];
  metadata?: PDFMetadata;
}

export interface SignatureData {
  type: 'draw' | 'type' | 'upload';
  dataUrl: string;
  aspectRatio: number;
}

export interface PlacedSignature {
  id: string;
  pageNumber: number;
  xPercent: number;
  yPercent: number;
  widthPercent: number;
  heightPercent: number;
  dataUrl: string;
}

export interface CompressionSettings {
  level: 'max' | 'balanced' | 'quality' | 'custom';
  imageQuality: number; // 0.1 to 1.0
  dpi: number; // 72, 150, 300
  removeMetadata: boolean;
}

export interface WatermarkSettings {
  text: string;
  fontSize: number;
  opacity: number;
  rotation: number;
  color: string;
  pages: 'all' | 'custom';
  customPages?: string;
}

export interface PageNumberSettings {
  format: '1' | 'Page 1' | 'Page 1 of n' | '- 1 -';
  position: 'bottom-right' | 'bottom-center' | 'bottom-left' | 'top-right' | 'top-center';
  fontSize: number;
  startNumber: number;
  margin: number;
}

export interface RecentFile {
  id: string;
  name: string;
  size: number;
  pageCount: number;
  lastAction: string;
  timestamp: number;
  thumbnailUrl?: string;
}

export interface RedactionBox {
  id: string;
  pageNumber: number;
  xPercent: number;
  yPercent: number;
  widthPercent: number;
  heightPercent: number;
}
