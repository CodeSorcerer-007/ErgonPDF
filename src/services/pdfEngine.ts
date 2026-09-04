import { PDFDocument, rgb, degrees, StandardFonts } from 'pdf-lib';
import * as pdfjsLib from 'pdfjs-dist';
import type { 
  PDFMetadata, 
  PDFPageInfo, 
  CompressionSettings, 
  WatermarkSettings, 
  PageNumberSettings, 
  PlacedSignature, 
  RedactionBox 
} from '../types/pdf';

// Configure local worker from public directory for 100% offline, private rendering
if (typeof window !== 'undefined') {
  pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.js';
}

export class PDFEngineService {
  /**
   * Loads a PDF document and extracts metadata, page count, and page thumbnails.
   */
  static async inspectDocument(data: ArrayBuffer): Promise<{
    pageCount: number;
    pages: PDFPageInfo[];
    metadata: PDFMetadata;
  }> {
    const loadingTask = pdfjsLib.getDocument({ data: data.slice(0) });
    const pdfDoc = await loadingTask.promise;
    const pageCount = pdfDoc.numPages;

    let metadata: PDFMetadata = {};
    try {
      const meta = await pdfDoc.getMetadata();
      const info = (meta.info || {}) as Record<string, unknown>;
      metadata = {
        title: typeof info.Title === 'string' ? info.Title : undefined,
        author: typeof info.Author === 'string' ? info.Author : undefined,
        subject: typeof info.Subject === 'string' ? info.Subject : undefined,
        keywords: typeof info.Keywords === 'string' ? info.Keywords : undefined,
        creator: typeof info.Creator === 'string' ? info.Creator : undefined,
        producer: typeof info.Producer === 'string' ? info.Producer : undefined,
        creationDate: typeof info.CreationDate === 'string' ? info.CreationDate : undefined,
        modificationDate: typeof info.ModDate === 'string' ? info.ModDate : undefined,
      };
    } catch {
      // Metadata read error fallback
    }

    const pages: PDFPageInfo[] = [];

    // Extract page information and generate lightweight thumbnails
    for (let i = 1; i <= Math.min(pageCount, 100); i++) {
      try {
        const page = await pdfDoc.getPage(i);
        const viewport = page.getViewport({ scale: 0.3 });
        
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        canvas.width = viewport.width;
        canvas.height = viewport.height;

        if (context) {
          await page.render({
            canvasContext: context,
            viewport: viewport,
          }).promise;
          const thumbnailUrl = canvas.toDataURL('image/jpeg', 0.6);
          pages.push({
            pageNumber: i,
            originalIndex: i - 1,
            rotation: 0,
            width: viewport.width / 0.3,
            height: viewport.height / 0.3,
            thumbnailUrl,
            isSelected: false,
          });
        }
      } catch {
        pages.push({
          pageNumber: i,
          originalIndex: i - 1,
          rotation: 0,
          width: 595,
          height: 842,
          isSelected: false,
        });
      }
    }

    return { pageCount, pages, metadata };
  }

  /**
   * Renders a specific page onto an existing canvas element at given zoom scale.
   */
  static async renderPageToCanvas(
    data: ArrayBuffer, 
    pageNumber: number, 
    canvas: HTMLCanvasElement, 
    scale = 1.0
  ): Promise<void> {
    const loadingTask = pdfjsLib.getDocument({ data: data.slice(0) });
    const pdfDoc = await loadingTask.promise;
    const page = await pdfDoc.getPage(pageNumber);

    const pixelRatio = window.devicePixelRatio || 1;
    const viewport = page.getViewport({ scale: scale * pixelRatio });

    canvas.width = viewport.width;
    canvas.height = viewport.height;
    canvas.style.width = `${viewport.width / pixelRatio}px`;
    canvas.style.height = `${viewport.height / pixelRatio}px`;

    const context = canvas.getContext('2d');
    if (!context) return;

    context.clearRect(0, 0, canvas.width, canvas.height);

    await page.render({
      canvasContext: context,
      viewport: viewport,
    }).promise;
  }

  /**
   * Merges multiple PDF ArrayBuffers into a single unified PDF.
   */
  static async mergeDocuments(buffers: ArrayBuffer[]): Promise<Uint8Array> {
    if (buffers.length === 0) throw new Error('No PDF documents provided for merge.');
    const mergedDoc = await PDFDocument.create();

    for (const buffer of buffers) {
      const doc = await PDFDocument.load(buffer, { ignoreEncryption: true });
      const copiedPages = await mergedDoc.copyPages(doc, doc.getPageIndices());
      copiedPages.forEach((page) => mergedDoc.addPage(page));
    }

    return await mergedDoc.save();
  }

  /**
   * Reorders, rotates, deletes, or duplicates pages based on a page configuration array.
   */
  static async reorderAndTransformPages(
    buffer: ArrayBuffer,
    pageConfigs: { originalIndex: number; rotation: number; deleted?: boolean }[]
  ): Promise<Uint8Array> {
    const srcDoc = await PDFDocument.load(buffer, { ignoreEncryption: true });
    const newDoc = await PDFDocument.create();

    const nonDeleted = pageConfigs.filter((p) => !p.deleted);
    const indicesToCopy = nonDeleted.map((p) => p.originalIndex);

    if (indicesToCopy.length === 0) {
      throw new Error('Cannot save PDF with zero pages.');
    }

    const copiedPages = await newDoc.copyPages(srcDoc, indicesToCopy);

    for (let i = 0; i < copiedPages.length; i++) {
      const page = copiedPages[i];
      const config = nonDeleted[i];
      if (config.rotation) {
        const currentAngle = page.getRotation().angle;
        page.setRotation(degrees((currentAngle + config.rotation) % 360));
      }
      newDoc.addPage(page);
    }

    return await newDoc.save();
  }

  /**
   * Splits a PDF into page ranges.
   */
  static async splitDocument(
    buffer: ArrayBuffer,
    ranges: { name: string; startPage: number; endPage: number }[]
  ): Promise<{ name: string; data: Uint8Array }[]> {
    const srcDoc = await PDFDocument.load(buffer, { ignoreEncryption: true });
    const totalPages = srcDoc.getPageCount();
    const results: { name: string; data: Uint8Array }[] = [];

    for (const range of ranges) {
      const newDoc = await PDFDocument.create();
      const start = Math.max(0, range.startPage - 1);
      const end = Math.min(totalPages - 1, range.endPage - 1);

      const indices: number[] = [];
      for (let i = start; i <= end; i++) {
        indices.push(i);
      }

      const pages = await newDoc.copyPages(srcDoc, indices);
      pages.forEach((p) => newDoc.addPage(p));
      const data = await newDoc.save();
      results.push({ name: range.name, data });
    }

    return results;
  }

  /**
   * High performance local compression.
   * Re-encodes embedded visual assets and optimizes page structures.
   */
  static async compressDocument(
    buffer: ArrayBuffer,
    settings: CompressionSettings
  ): Promise<{ data: Uint8Array; originalSize: number; compressedSize: number }> {
    const originalSize = buffer.byteLength;
    const loadingTask = pdfjsLib.getDocument({ data: buffer.slice(0) });
    const pdfDoc = await loadingTask.promise;
    const pageCount = pdfDoc.numPages;

    const newDoc = await PDFDocument.create();

    // Compression quality configuration
    const scaleFactor = settings.level === 'max' ? 1.0 : settings.level === 'balanced' ? 1.3 : 1.6;
    const quality = settings.level === 'max' ? 0.45 : settings.level === 'balanced' ? 0.70 : 0.88;

    for (let i = 1; i <= pageCount; i++) {
      const page = await pdfDoc.getPage(i);
      const originalViewport = page.getViewport({ scale: 1.0 });
      const renderViewport = page.getViewport({ scale: scaleFactor });

      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      canvas.width = renderViewport.width;
      canvas.height = renderViewport.height;

      if (ctx) {
        await page.render({
          canvasContext: ctx,
          viewport: renderViewport,
        }).promise;

        const jpegUrl = canvas.toDataURL('image/jpeg', quality);
        const imgBytes = await fetch(jpegUrl).then((res) => res.arrayBuffer());
        const embeddedImg = await newDoc.embedJpg(imgBytes);

        const newPage = newDoc.addPage([originalViewport.width, originalViewport.height]);
        newPage.drawImage(embeddedImg, {
          x: 0,
          y: 0,
          width: originalViewport.width,
          height: originalViewport.height,
        });
      }
    }

    if (settings.removeMetadata) {
      newDoc.setTitle('');
      newDoc.setAuthor('');
      newDoc.setSubject('');
      newDoc.setCreator('ErgonPDF Open Source Workspace');
      newDoc.setProducer('ErgonPDF Engine');
    }

    const compressedData = await newDoc.save();
    return {
      data: compressedData,
      originalSize,
      compressedSize: compressedData.byteLength,
    };
  }

  /**
   * Adds custom text watermark with rotation and opacity.
   */
  static async addWatermark(
    buffer: ArrayBuffer,
    settings: WatermarkSettings
  ): Promise<Uint8Array> {
    const doc = await PDFDocument.load(buffer, { ignoreEncryption: true });
    const pages = doc.getPages();
    const font = await doc.embedFont(StandardFonts.HelveticaBold);

    // Parse color
    let r = 0.5, g = 0.5, b = 0.5;
    if (settings.color === 'red') { r = 0.9; g = 0.2; b = 0.2; }
    else if (settings.color === 'blue') { r = 0.2; g = 0.4; b = 0.9; }
    else if (settings.color === 'green') { r = 0.1; g = 0.7; b = 0.3; }

    pages.forEach((page) => {
      const { width, height } = page.getSize();
      const textWidth = font.widthOfTextAtSize(settings.text, settings.fontSize);
      const textHeight = font.heightAtSize(settings.fontSize);

      page.drawText(settings.text, {
        x: (width - textWidth) / 2,
        y: (height - textHeight) / 2,
        size: settings.fontSize,
        font,
        color: rgb(r, g, b),
        opacity: settings.opacity,
        rotate: degrees(settings.rotation),
      });
    });

    return await doc.save();
  }

  /**
   * Adds page numbers / headers / footers.
   */
  static async addPageNumbers(
    buffer: ArrayBuffer,
    settings: PageNumberSettings
  ): Promise<Uint8Array> {
    const doc = await PDFDocument.load(buffer, { ignoreEncryption: true });
    const pages = doc.getPages();
    const total = pages.length;
    const font = await doc.embedFont(StandardFonts.Helvetica);

    pages.forEach((page, idx) => {
      const pageNum = settings.startNumber + idx;
      let label = `${pageNum}`;
      if (settings.format === 'Page 1') label = `Page ${pageNum}`;
      else if (settings.format === 'Page 1 of n') label = `Page ${pageNum} of ${total}`;
      else if (settings.format === '- 1 -') label = `- ${pageNum} -`;

      const { width } = page.getSize();
      const textWidth = font.widthOfTextAtSize(label, settings.fontSize);
      const margin = settings.margin || 25;

      let x = width - textWidth - margin;
      let y = margin;

      if (settings.position === 'bottom-center') {
        x = (width - textWidth) / 2;
        y = margin;
      } else if (settings.position === 'bottom-left') {
        x = margin;
        y = margin;
      } else if (settings.position === 'top-right') {
        x = width - textWidth - margin;
        y = page.getSize().height - margin - settings.fontSize;
      } else if (settings.position === 'top-center') {
        x = (width - textWidth) / 2;
        y = page.getSize().height - margin - settings.fontSize;
      }

      page.drawText(label, {
        x,
        y,
        size: settings.fontSize,
        font,
        color: rgb(0.2, 0.25, 0.35),
      });
    });

    return await doc.save();
  }

  /**
   * Bakes placed digital signatures into the PDF document.
   */
  static async applySignatures(
    buffer: ArrayBuffer,
    signatures: PlacedSignature[]
  ): Promise<Uint8Array> {
    const doc = await PDFDocument.load(buffer, { ignoreEncryption: true });
    const pages = doc.getPages();

    for (const sig of signatures) {
      if (sig.pageNumber > pages.length) continue;
      const page = pages[sig.pageNumber - 1];
      const { width, height } = page.getSize();

      const imgBytes = await fetch(sig.dataUrl).then((r) => r.arrayBuffer());
      const embeddedImg = await doc.embedPng(imgBytes);

      const targetWidth = (sig.widthPercent / 100) * width;
      const targetHeight = (sig.heightPercent / 100) * height;
      const targetX = (sig.xPercent / 100) * width;
      // In PDF coordinate space, origin (0,0) is at bottom-left
      const targetY = height - (sig.yPercent / 100) * height - targetHeight;

      page.drawImage(embeddedImg, {
        x: targetX,
        y: targetY,
        width: targetWidth,
        height: targetHeight,
      });
    }

    return await doc.save();
  }

  /**
   * Visual Redaction: Permanently draws opaque blackout rectangles over sensitive data.
   */
  static async applyRedactions(
    buffer: ArrayBuffer,
    redactions: RedactionBox[]
  ): Promise<Uint8Array> {
    const doc = await PDFDocument.load(buffer, { ignoreEncryption: true });
    const pages = doc.getPages();

    redactions.forEach((box) => {
      if (box.pageNumber > pages.length) return;
      const page = pages[box.pageNumber - 1];
      const { width, height } = page.getSize();

      const boxWidth = (box.widthPercent / 100) * width;
      const boxHeight = (box.heightPercent / 100) * height;
      const boxX = (box.xPercent / 100) * width;
      const boxY = height - (box.yPercent / 100) * height - boxHeight;

      page.drawRectangle({
        x: boxX,
        y: boxY,
        width: boxWidth,
        height: boxHeight,
        color: rgb(0, 0, 0),
      });
    });

    return await doc.save();
  }

  /**
   * Converts all or selected PDF pages into high resolution image data URLs.
   */
  static async convertToImages(
    buffer: ArrayBuffer,
    format: 'png' | 'jpeg' | 'webp' = 'png',
    scale = 2.0
  ): Promise<{ pageNumber: number; dataUrl: string; blob: Blob }[]> {
    const loadingTask = pdfjsLib.getDocument({ data: buffer.slice(0) });
    const pdfDoc = await loadingTask.promise;
    const pageCount = pdfDoc.numPages;
    const results: { pageNumber: number; dataUrl: string; blob: Blob }[] = [];

    const mimeType = format === 'jpeg' ? 'image/jpeg' : format === 'webp' ? 'image/webp' : 'image/png';

    for (let i = 1; i <= pageCount; i++) {
      const page = await pdfDoc.getPage(i);
      const viewport = page.getViewport({ scale });
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      canvas.width = viewport.width;
      canvas.height = viewport.height;

      if (ctx) {
        await page.render({
          canvasContext: ctx,
          viewport,
        }).promise;

        const dataUrl = canvas.toDataURL(mimeType, 0.92);
        const blob = await new Promise<Blob>((resolve) => {
          canvas.toBlob((b) => resolve(b || new Blob()), mimeType, 0.92);
        });

        results.push({ pageNumber: i, dataUrl, blob });
      }
    }

    return results;
  }

  /**
   * Converts a list of image files into a single unified PDF.
   */
  static async imagesToPDF(
    images: { name: string; buffer: ArrayBuffer; type: string }[]
  ): Promise<Uint8Array> {
    const doc = await PDFDocument.create();

    for (const img of images) {
      let embeddedImg;
      if (img.type.includes('png')) {
        embeddedImg = await doc.embedPng(img.buffer);
      } else {
        embeddedImg = await doc.embedJpg(img.buffer);
      }

      const { width, height } = embeddedImg;
      const page = doc.addPage([width, height]);
      page.drawImage(embeddedImg, {
        x: 0,
        y: 0,
        width,
        height,
      });
    }

    return await doc.save();
  }

  /**
   * Extracts raw text from all pages of a PDF document.
   */
  static async extractFullText(
    buffer: ArrayBuffer
  ): Promise<{ text: string; pages: { pageNumber: number; text: string }[] }> {
    const loadingTask = pdfjsLib.getDocument({ data: buffer.slice(0) });
    const pdfDoc = await loadingTask.promise;
    const pageCount = pdfDoc.numPages;
    const pageTexts: { pageNumber: number; text: string }[] = [];
    let fullText = '';

    for (let i = 1; i <= pageCount; i++) {
      const page = await pdfDoc.getPage(i);
      const textContent = await page.getTextContent();
      const pageString = textContent.items
        .map((item) => ('str' in item ? (item as { str: string }).str : ''))
        .join(' ');
      
      pageTexts.push({ pageNumber: i, text: pageString });
      fullText += `--- Page ${i} ---\n${pageString}\n\n`;
    }

    return { text: fullText.trim(), pages: pageTexts };
  }
}
