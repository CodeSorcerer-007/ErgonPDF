export type ToolCategory = 
  | 'organize' 
  | 'edit' 
  | 'create'
  | 'convert' 
  | 'compress' 
  | 'security' 
  | 'ocr' 
  | 'view'
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
  level: 'lossless' | 'balanced' | 'max' | 'grayscale' | 'custom';
  imageQuality: number; // 0.1 to 1.0
  dpi: number; // 72, 96, 150, 300
  removeMetadata: boolean;
  grayscale?: boolean;
}

export interface QRCodeSettings {
  text: string;
  sizePercent: number; // size relative to page width
  position: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' | 'center';
  margin: number;
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

export interface NUpSettings {
  pagesPerSheet: 2 | 4 | 9 | 16;
  orientation: 'auto' | 'portrait' | 'landscape';
  addBorder: boolean;
}

export interface CropSettings {
  topPercent: number;
  bottomPercent: number;
  leftPercent: number;
  rightPercent: number;
  applyToAll: boolean;
}

export interface ResizeSettings {
  targetSize: 'A4' | 'A3' | 'A5' | 'Letter' | 'Legal';
  orientation: 'portrait' | 'landscape';
}

export interface FormFieldDef {
  type: 'text' | 'checkbox' | 'dropdown';
  name: string;
  pageNumber: number;
  xPercent: number;
  yPercent: number;
  widthPercent: number;
  heightPercent: number;
  options?: string[];
}
