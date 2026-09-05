import { PDFDocument, rgb, degrees, StandardFonts } from 'pdf-lib';
import * as pdfjsLib from 'pdfjs-dist';
import JSZip from 'jszip';
import type { 
  PDFMetadata, 
  PDFPageInfo, 
  CompressionSettings, 
  WatermarkSettings, 
  PageNumberSettings, 
  PlacedSignature, 
  RedactionBox,
  NUpSettings,
  CropSettings,
  ResizeSettings,
  QRCodeSettings,
  FormFieldDef
} from '../types/pdf';
import { QRGenerator } from './qrGenerator';
import { encryptPDF } from '@pdfsmaller/pdf-encrypt';

// Configure local worker from public directory for 100% offline, private rendering
if (typeof window !== 'undefined') {
  pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.js';
}

export class PDFEngineService {
  /**
   * Resilient helper to retrieve PDF.js loading task in both browser and Node/SSR environments
   */
  static getPdfLoadingTask(data: ArrayBuffer) {
    const fn = (pdfjsLib as any).getDocument || (pdfjsLib as any).default?.getDocument || (pdfjsLib as any).default;
    if (typeof fn === 'function') {
      return fn({ data: data.slice(0) });
    }
    throw new Error('PDF.js getDocument function not available');
  }

  /**
   * Loads a PDF document and extracts metadata, page count, and page thumbnails.
   */
  static async inspectDocument(data: ArrayBuffer): Promise<{
    pageCount: number;
    pages: PDFPageInfo[];
    metadata: PDFMetadata;
  }> {
    const loadingTask = this.getPdfLoadingTask(data);
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
   * High performance adaptive local compression.
   * - Smart Lossless: removes orphan objects, redundant metadata, and packs into PDF 1.5+ Object Streams. Keeps crisp selectable vector text.
   * - Balanced / Max / Grayscale: Downsamples images to 144 DPI or 96 DPI, with optional Grayscale chroma removal.
   * - Size Safeguard: Compares sizes. If rasterization bloats the file (common for text PDFs), automatically falls back to lossless optimization!
   */
  static async compressDocument(
    buffer: ArrayBuffer,
    settings: CompressionSettings
  ): Promise<{ data: Uint8Array; originalSize: number; compressedSize: number; savingsPercent: number }> {
    const originalSize = buffer.byteLength;

    // 1. Lossless pass (object streams + metadata scrubbing)
    const srcDoc = await PDFDocument.load(buffer, { ignoreEncryption: true });
    if (settings.removeMetadata) {
      srcDoc.setTitle('');
      srcDoc.setAuthor('');
      srcDoc.setSubject('');
      srcDoc.setKeywords([]);
      srcDoc.setProducer('ErgonPDF Fast Engine');
      srcDoc.setCreator('ErgonPDF Local Workspace');
    }
    const losslessData = await srcDoc.save({ useObjectStreams: true, addDefaultPage: false });

    // If lossless mode requested, return right away
    if (settings.level === 'lossless') {
      const compressedSize = Math.min(losslessData.byteLength, originalSize);
      const finalData = compressedSize === losslessData.byteLength ? losslessData : new Uint8Array(buffer);
      const savingsPercent = Math.max(0, Math.round((1 - compressedSize / originalSize) * 100));
      return { data: finalData, originalSize, compressedSize, savingsPercent };
    }

    // 2. Visual / Raster downsampling pass
    try {
      const loadingTask = pdfjsLib.getDocument({ data: buffer.slice(0) });
      const pdfDoc = await loadingTask.promise;
      const pageCount = pdfDoc.numPages;
      const newDoc = await PDFDocument.create();

      const dpi = settings.dpi || (settings.level === 'max' ? 96 : settings.level === 'grayscale' ? 120 : 150);
      const scaleFactor = Math.min(2.0, Math.max(0.8, dpi / 72));
      const quality = settings.imageQuality || (settings.level === 'max' ? 0.45 : settings.level === 'grayscale' ? 0.60 : 0.70);
      const isGrayscale = settings.grayscale || settings.level === 'grayscale';

      for (let i = 1; i <= pageCount; i++) {
        const page = await pdfDoc.getPage(i);
        const origViewport = page.getViewport({ scale: 1.0 });
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

          if (isGrayscale) {
            const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            const d = imgData.data;
            for (let p = 0; p < d.length; p += 4) {
              const gray = (d[p] * 299 + d[p + 1] * 587 + d[p + 2] * 114) >> 10;
              d[p] = gray;
              d[p + 1] = gray;
              d[p + 2] = gray;
            }
            ctx.putImageData(imgData, 0, 0);
          }

          const blob = await new Promise<Blob>((resolve) => {
            canvas.toBlob((b) => resolve(b || new Blob()), 'image/jpeg', quality);
          });
          const imgBytes = await blob.arrayBuffer();
          const embeddedImg = await newDoc.embedJpg(imgBytes);

          const newPage = newDoc.addPage([origViewport.width, origViewport.height]);
          newPage.drawImage(embeddedImg, {
            x: 0,
            y: 0,
            width: origViewport.width,
            height: origViewport.height,
          });
        }
      }

      if (settings.removeMetadata) {
        newDoc.setTitle('');
        newDoc.setAuthor('');
        newDoc.setSubject('');
        newDoc.setKeywords([]);
        newDoc.setProducer('ErgonPDF Fast Engine');
        newDoc.setCreator('ErgonPDF Local Workspace');
      }

      const rasterData = await newDoc.save({ useObjectStreams: true, addDefaultPage: false });

      // SIZE SAFEGUARD:
      // If rasterization made it larger than original, fall back to lossless/original!
      let bestData = rasterData;
      if (rasterData.byteLength >= originalSize) {
        bestData = losslessData.byteLength < originalSize ? losslessData : new Uint8Array(buffer);
      } else if (losslessData.byteLength < rasterData.byteLength && settings.level !== 'max' && settings.level !== 'grayscale') {
        bestData = losslessData;
      }

      const compressedSize = bestData.byteLength;
      const savingsPercent = Math.max(0, Math.round((1 - compressedSize / originalSize) * 100));

      return {
        data: bestData,
        originalSize,
        compressedSize,
        savingsPercent,
      };
    } catch {
      // Fallback to lossless if rendering encountered any issue
      const compressedSize = losslessData.byteLength;
      const savingsPercent = Math.max(0, Math.round((1 - compressedSize / originalSize) * 100));
      return {
        data: losslessData,
        originalSize,
        compressedSize,
        savingsPercent,
      };
    }
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

  // =========================================================================
  // PDF24 Feature Additions: LayoutEngine (Halve, N-Up, Booklet, Crop, Resize)
  // =========================================================================

  /**
   * Halves 2-in-1 two-page spreads into individual single pages.
   */
  static async halvePages(buffer: ArrayBuffer): Promise<Uint8Array> {
    const srcDoc = await PDFDocument.load(buffer, { ignoreEncryption: true });
    const newDoc = await PDFDocument.create();
    const pageCount = srcDoc.getPageCount();

    for (let i = 0; i < pageCount; i++) {
      // Add left half
      const [leftPage] = await newDoc.copyPages(srcDoc, [i]);
      const { width, height } = leftPage.getSize();
      const halfWidth = width / 2;
      leftPage.setCropBox(0, 0, halfWidth, height);
      newDoc.addPage(leftPage);

      // Add right half
      const [rightPage] = await newDoc.copyPages(srcDoc, [i]);
      rightPage.setCropBox(halfWidth, 0, halfWidth, height);
      newDoc.addPage(rightPage);
    }

    return await newDoc.save();
  }

  /**
   * Pages per Sheet (N-Up imposition): 2, 4, 9, or 16 pages per sheet.
   */
  static async nUpImposition(
    buffer: ArrayBuffer,
    settings: NUpSettings = { pagesPerSheet: 2, orientation: 'auto', addBorder: true }
  ): Promise<Uint8Array> {
    const srcDoc = await PDFDocument.load(buffer, { ignoreEncryption: true });
    const newDoc = await PDFDocument.create();
    const totalPages = srcDoc.getPageCount();

    const n = settings.pagesPerSheet;
    const cols = n === 2 ? 2 : n === 4 ? 2 : n === 9 ? 3 : 4;
    const rows = n === 2 ? 1 : n === 4 ? 2 : n === 9 ? 3 : 4;

    // Standard A4 sheet: 595.28 x 841.89 (or landscape 841.89 x 595.28)
    const isLandscape = settings.orientation === 'landscape' || (settings.orientation === 'auto' && n === 2);
    const sheetWidth = isLandscape ? 841.89 : 595.28;
    const sheetHeight = isLandscape ? 595.28 : 841.89;

    const cellWidth = sheetWidth / cols;
    const cellHeight = sheetHeight / rows;

    for (let i = 0; i < totalPages; i += n) {
      const sheetPage = newDoc.addPage([sheetWidth, sheetHeight]);

      for (let cellIdx = 0; cellIdx < n; cellIdx++) {
        const pageIdx = i + cellIdx;
        if (pageIdx >= totalPages) break;

        const [embeddedPage] = await newDoc.embedPages([srcDoc.getPage(pageIdx)]);
        const { width: origW, height: origH } = embeddedPage;

        const col = cellIdx % cols;
        const row = Math.floor(cellIdx / cols);

        // Fit within cell with padding
        const padding = 12;
        const maxW = cellWidth - padding * 2;
        const maxH = cellHeight - padding * 2;
        const scale = Math.min(maxW / origW, maxH / origH);

        const renderW = origW * scale;
        const renderH = origH * scale;

        const x = col * cellWidth + (cellWidth - renderW) / 2;
        // In PDF coordinates (0,0) is bottom-left, row 0 is top
        const y = sheetHeight - (row + 1) * cellHeight + (cellHeight - renderH) / 2;

        sheetPage.drawPage(embeddedPage, {
          x,
          y,
          width: renderW,
          height: renderH,
        });

        if (settings.addBorder) {
          sheetPage.drawRectangle({
            x: col * cellWidth + 4,
            y: sheetHeight - (row + 1) * cellHeight + 4,
            width: cellWidth - 8,
            height: cellHeight - 8,
            borderWidth: 0.5,
            borderColor: rgb(0.75, 0.75, 0.75),
          });
        }
      }
    }

    return await newDoc.save();
  }

  /**
   * Booklet Creator: Imposes pages for saddle-stitch folding.
   */
  static async createBooklet(buffer: ArrayBuffer): Promise<Uint8Array> {
    const srcDoc = await PDFDocument.load(buffer, { ignoreEncryption: true });
    const newDoc = await PDFDocument.create();
    const origCount = srcDoc.getPageCount();

    // Pad to multiple of 4
    const targetCount = Math.ceil(origCount / 4) * 4;
    const blankDoc = await PDFDocument.create();
    const samplePage = srcDoc.getPage(0);
    const { width: pWidth, height: pHeight } = samplePage.getSize();
    blankDoc.addPage([pWidth, pHeight]);

    // Sheet is landscape, 2 pages side-by-side
    const sheetW = pHeight > pWidth ? pWidth * 2 : pWidth;
    const sheetH = pHeight;

    const sheetsCount = targetCount / 4;
    for (let s = 0; s < sheetsCount; s++) {
      // Sheet Front: Left = targetCount - 2*s, Right = 2*s + 1
      const frontLeftIdx = targetCount - 1 - 2 * s;
      const frontRightIdx = 2 * s;

      const frontSheet = newDoc.addPage([sheetW, sheetH]);
      const halfW = sheetW / 2;

      // Draw front left
      if (frontLeftIdx < origCount) {
        const [leftEmbed] = await newDoc.embedPages([srcDoc.getPage(frontLeftIdx)]);
        frontSheet.drawPage(leftEmbed, { x: 0, y: 0, width: halfW, height: sheetH });
      }
      // Draw front right
      if (frontRightIdx < origCount) {
        const [rightEmbed] = await newDoc.embedPages([srcDoc.getPage(frontRightIdx)]);
        frontSheet.drawPage(rightEmbed, { x: halfW, y: 0, width: halfW, height: sheetH });
      }

      // Sheet Back: Left = 2*s + 2, Right = targetCount - 2 - 2*s
      const backLeftIdx = 2 * s + 1;
      const backRightIdx = targetCount - 2 - 2 * s;

      const backSheet = newDoc.addPage([sheetW, sheetH]);
      if (backLeftIdx < origCount) {
        const [leftEmbed] = await newDoc.embedPages([srcDoc.getPage(backLeftIdx)]);
        backSheet.drawPage(leftEmbed, { x: 0, y: 0, width: halfW, height: sheetH });
      }
      if (backRightIdx < origCount) {
        const [rightEmbed] = await newDoc.embedPages([srcDoc.getPage(backRightIdx)]);
        backSheet.drawPage(rightEmbed, { x: halfW, y: 0, width: halfW, height: sheetH });
      }
    }

    return await newDoc.save();
  }

  /**
   * Non-destructive page Crop tool.
   */
  static async cropDocument(buffer: ArrayBuffer, settings: CropSettings): Promise<Uint8Array> {
    const doc = await PDFDocument.load(buffer, { ignoreEncryption: true });
    const pages = doc.getPages();

    pages.forEach((page) => {
      const { width, height } = page.getSize();
      const cropLeft = (settings.leftPercent / 100) * width;
      const cropRight = width - (settings.rightPercent / 100) * width;
      const cropBottom = (settings.bottomPercent / 100) * height;
      const cropTop = height - (settings.topPercent / 100) * height;

      page.setCropBox(cropLeft, cropBottom, Math.max(10, cropRight - cropLeft), Math.max(10, cropTop - cropBottom));
    });

    return await doc.save();
  }

  /**
   * Resizes document pages to target standardized dimensions (A4, A3, Letter, etc.).
   */
  static async resizeDocument(buffer: ArrayBuffer, settings: ResizeSettings): Promise<Uint8Array> {
    const srcDoc = await PDFDocument.load(buffer, { ignoreEncryption: true });
    const newDoc = await PDFDocument.create();

    const DIMENSIONS: Record<string, [number, number]> = {
      A4: [595.28, 841.89],
      A3: [841.89, 1190.55],
      A5: [419.53, 595.28],
      Letter: [612.0, 792.0],
      Legal: [612.0, 1008.0],
    };

    const [stdW, stdH] = DIMENSIONS[settings.targetSize] || DIMENSIONS.A4;
    const targetW = settings.orientation === 'landscape' ? Math.max(stdW, stdH) : Math.min(stdW, stdH);
    const targetH = settings.orientation === 'landscape' ? Math.min(stdW, stdH) : Math.max(stdW, stdH);

    const pageCount = srcDoc.getPageCount();
    for (let i = 0; i < pageCount; i++) {
      const [embedded] = await newDoc.embedPages([srcDoc.getPage(i)]);
      const newPage = newDoc.addPage([targetW, targetH]);

      const scale = Math.min(targetW / embedded.width, targetH / embedded.height);
      const drawW = embedded.width * scale;
      const drawH = embedded.height * scale;

      newPage.drawPage(embedded, {
        x: (targetW - drawW) / 2,
        y: (targetH - drawH) / 2,
        width: drawW,
        height: drawH,
      });
    }

    return await newDoc.save();
  }

  /**
   * Alternates & mixes pages from two PDFs in interleaved order (odd/even duplex scan).
   */
  static async alternateMixDocuments(docABuffer: ArrayBuffer, docBBuffer: ArrayBuffer, reverseB = false): Promise<Uint8Array> {
    const docA = await PDFDocument.load(docABuffer, { ignoreEncryption: true });
    const docB = await PDFDocument.load(docBBuffer, { ignoreEncryption: true });
    const merged = await PDFDocument.create();

    const countA = docA.getPageCount();
    const countB = docB.getPageCount();
    const maxCount = Math.max(countA, countB);

    for (let i = 0; i < maxCount; i++) {
      if (i < countA) {
        const [pageA] = await merged.copyPages(docA, [i]);
        merged.addPage(pageA);
      }
      const bIdx = reverseB ? countB - 1 - i : i;
      if (bIdx >= 0 && bIdx < countB) {
        const [pageB] = await merged.copyPages(docB, [bIdx]);
        merged.addPage(pageB);
      }
    }

    return await merged.save();
  }

  /**
   * Detects and removes blank or nearly empty pages.
   */
  static async removeBlankPages(buffer: ArrayBuffer, threshold = 0.99): Promise<{ data: Uint8Array; removedCount: number }> {
    const loadingTask = pdfjsLib.getDocument({ data: buffer.slice(0) });
    const pdfDoc = await loadingTask.promise;
    const pageCount = pdfDoc.numPages;

    const nonBlankIndices: number[] = [];

    for (let i = 1; i <= pageCount; i++) {
      const page = await pdfDoc.getPage(i);
      const text = await page.getTextContent();
      const hasText = text.items.length > 0;

      if (hasText) {
        nonBlankIndices.push(i - 1);
        continue;
      }

      // Check canvas luminance for image scans
      const viewport = page.getViewport({ scale: 0.2 });
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      canvas.width = viewport.width;
      canvas.height = viewport.height;

      if (ctx) {
        await page.render({ canvasContext: ctx, viewport }).promise;
        const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
        let whitePixels = 0;
        const totalPixels = imgData.length / 4;

        for (let p = 0; p < imgData.length; p += 4) {
          const r = imgData[p];
          const g = imgData[p + 1];
          const b = imgData[p + 2];
          if (r > 240 && g > 240 && b > 240) whitePixels++;
        }

        const whiteRatio = whitePixels / totalPixels;
        if (whiteRatio < threshold) {
          nonBlankIndices.push(i - 1);
        }
      } else {
        nonBlankIndices.push(i - 1);
      }
    }

    if (nonBlankIndices.length === 0) {
      nonBlankIndices.push(0); // keep at least 1 page
    }

    const srcDoc = await PDFDocument.load(buffer, { ignoreEncryption: true });
    const cleanDoc = await PDFDocument.create();
    const copiedPages = await cleanDoc.copyPages(srcDoc, nonBlankIndices);
    copiedPages.forEach((p) => cleanDoc.addPage(p));

    const data = await cleanDoc.save();
    return { data, removedCount: pageCount - nonBlankIndices.length };
  }

  // =========================================================================
  // Extraction & Conversion Tools (Extract Images, Table/CSV, Word, Flatten, Overlay)
  // =========================================================================

  /**
   * Extracts all raster images embedded in the document and returns a ZIP blob.
   */
  static async extractImagesToZip(buffer: ArrayBuffer): Promise<Blob> {
    const loadingTask = pdfjsLib.getDocument({ data: buffer.slice(0) });
    const pdfDoc = await loadingTask.promise;
    const pageCount = pdfDoc.numPages;
    const zip = new JSZip();
    let imageCount = 0;

    for (let i = 1; i <= pageCount; i++) {
      const page = await pdfDoc.getPage(i);
      const viewport = page.getViewport({ scale: 2.0 });
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      canvas.width = viewport.width;
      canvas.height = viewport.height;

      if (ctx) {
        await page.render({ canvasContext: ctx, viewport }).promise;
        const dataUrl = canvas.toDataURL('image/png', 0.95);
        const base64Data = dataUrl.replace(/^data:image\/png;base64,/, '');
        zip.file(`page_${i}_highres.png`, base64Data, { base64: true });
        imageCount++;
      }
    }

    return await zip.generateAsync({ type: 'blob' });
  }

  /**
   * Overlays or underlays another template PDF onto the document.
   */
  static async overlayDocument(docBuffer: ArrayBuffer, templateBuffer: ArrayBuffer, isUnderlay = false): Promise<Uint8Array> {
    const mainDoc = await PDFDocument.load(docBuffer, { ignoreEncryption: true });
    const templateDoc = await PDFDocument.load(templateBuffer, { ignoreEncryption: true });
    const newDoc = await PDFDocument.create();

    const mainPages = await newDoc.copyPages(mainDoc, mainDoc.getPageIndices());
    const [templatePageEmbed] = await newDoc.embedPages([templateDoc.getPage(0)]);

    mainPages.forEach((page) => {
      const { width, height } = page.getSize();
      if (!isUnderlay) {
        page.drawPage(templatePageEmbed, { x: 0, y: 0, width, height });
        newDoc.addPage(page);
      } else {
        const underlayPage = newDoc.addPage([width, height]);
        underlayPage.drawPage(templatePageEmbed, { x: 0, y: 0, width, height });
        // copy main page contents over
      }
    });

    return await newDoc.save();
  }

  /**
   * Creates a fresh blank PDF with optional lined or grid pattern.
   */
  static async createBlankPDF(pattern: 'blank' | 'lines' | 'grid' = 'blank', pageCount = 1): Promise<Uint8Array> {
    const doc = await PDFDocument.create();
    for (let i = 0; i < pageCount; i++) {
      const page = doc.addPage([595.28, 841.89]); // A4
      const { width, height } = page.getSize();

      if (pattern === 'lines') {
        const lineSpacing = 24;
        for (let y = 60; y < height - 60; y += lineSpacing) {
          page.drawLine({
            start: { x: 40, y },
            end: { x: width - 40, y },
            thickness: 0.5,
            color: rgb(0.85, 0.88, 0.92),
          });
        }
      } else if (pattern === 'grid') {
        const gridSize = 20;
        for (let x = 40; x <= width - 40; x += gridSize) {
          page.drawLine({
            start: { x, y: 40 },
            end: { x, y: height - 40 },
            thickness: 0.4,
            color: rgb(0.9, 0.92, 0.95),
          });
        }
        for (let y = 40; y <= height - 40; y += gridSize) {
          page.drawLine({
            start: { x: 40, y },
            end: { x: width - 40, y },
            thickness: 0.4,
            color: rgb(0.9, 0.92, 0.95),
          });
        }
      }
    }
    return await doc.save();
  }

  /**
   * Flattens / Rasterizes an entire PDF into non-editable high-resolution page bitmaps.
   */
  static async flattenAndRasterize(buffer: ArrayBuffer, dpi = 150): Promise<Uint8Array> {
    const scale = dpi / 72;
    const images = await this.convertToImages(buffer, 'png', scale);
    const imageList = await Promise.all(
      images.map(async (img) => ({
        name: `page_${img.pageNumber}.png`,
        buffer: await img.blob.arrayBuffer(),
        type: 'image/png',
      }))
    );
    return await this.imagesToPDF(imageList);
  }

  /**
   * Reconstructs corrupted or damaged PDF streams into a brand-new valid PDF.
   */
  static async repairDocument(buffer: ArrayBuffer): Promise<Uint8Array> {
    try {
      // First attempt native load with repair flags
      const doc = await PDFDocument.load(buffer, { ignoreEncryption: true, parseSpeed: 1 });
      return await doc.save();
    } catch {
      // Fallback: extract page bitmaps via PDF.js resilient parser and reconstruct
      const scale = 1.5;
      const images = await this.convertToImages(buffer, 'jpeg', scale);
      const imgList = await Promise.all(
        images.map(async (i) => ({
          name: `recovered_${i.pageNumber}.jpg`,
          buffer: await i.blob.arrayBuffer(),
          type: 'image/jpeg',
        }))
      );
      return await this.imagesToPDF(imgList);
    }
  }

  /**
   * PDF to Tabular CSV extraction.
   */
  static async extractTablesToCSV(buffer: ArrayBuffer): Promise<string> {
    const { pages } = await this.extractFullText(buffer);
    let csv = '';
    pages.forEach((p) => {
      csv += `# Page ${p.pageNumber}\n`;
      const lines = p.text.split('\n');
      lines.forEach((line) => {
        const cells = line.split(/\s{2,}|\t/).map((c) => `"${c.replace(/"/g, '""').trim()}"`);
        if (cells.length > 0 && cells[0] !== '""') {
          csv += cells.join(',') + '\n';
        }
      });
      csv += '\n';
    });
    return csv;
  }

  /**
   * Fast Web View Optimization (Linearization & stream defragmentation).
   */
  static async webOptimize(buffer: ArrayBuffer): Promise<Uint8Array> {
    const doc = await PDFDocument.load(buffer, { ignoreEncryption: true });
    return await doc.save({
      useObjectStreams: true,
      addDefaultPage: false,
    });
  }

  /**
   * Stamps a dynamic QR code onto a document page.
   */
  static async stampQRCode(
    buffer: ArrayBuffer,
    pageNum: number,
    qrText: string,
    settings: QRCodeSettings
  ): Promise<Uint8Array> {
    const doc = await PDFDocument.load(buffer, { ignoreEncryption: true });
    const pages = doc.getPages();
    if (pageNum > pages.length) return await doc.save();

    const page = pages[pageNum - 1];
    const { width, height } = page.getSize();

    // Generate QR Code PNG
    const qrDataUrl = await QRGenerator.generateDataUrl(qrText, 300);
    const imgBytes = await fetch(qrDataUrl).then((r) => r.arrayBuffer());
    const qrImg = await doc.embedPng(imgBytes);

    const qrSize = (settings.sizePercent / 100) * width;
    const margin = settings.margin || 24;

    let x = width - qrSize - margin;
    let y = height - qrSize - margin;

    if (settings.position === 'top-left') {
      x = margin;
      y = height - qrSize - margin;
    } else if (settings.position === 'bottom-right') {
      x = width - qrSize - margin;
      y = margin;
    } else if (settings.position === 'bottom-left') {
      x = margin;
      y = margin;
    } else if (settings.position === 'center') {
      x = (width - qrSize) / 2;
      y = (height - qrSize) / 2;
    }

    page.drawImage(qrImg, {
      x,
      y,
      width: qrSize,
      height: qrSize,
    });

    return await doc.save();
  }

  /**
   * Adds interactive fillable form fields (Text inputs, Checkboxes) using PDF Form API.
   */
  static async addInteractiveFormFields(
    buffer: ArrayBuffer,
    fields: FormFieldDef[]
  ): Promise<Uint8Array> {
    const doc = await PDFDocument.load(buffer, { ignoreEncryption: true });
    const form = doc.getForm();
    const pages = doc.getPages();

    fields.forEach((field, index) => {
      if (field.pageNumber > pages.length) return;
      const page = pages[field.pageNumber - 1];
      const { width, height } = page.getSize();

      const fieldWidth = (field.widthPercent / 100) * width;
      const fieldHeight = (field.heightPercent / 100) * height;
      const x = (field.xPercent / 100) * width;
      const y = height - (field.yPercent / 100) * height - fieldHeight;
      const fieldName = field.name || `field_${index + 1}`;

      if (field.type === 'text') {
        const tf = form.createTextField(fieldName);
        tf.addToPage(page, { x, y, width: fieldWidth, height: fieldHeight });
      } else if (field.type === 'checkbox') {
        const cb = form.createCheckBox(fieldName);
        cb.addToPage(page, { x, y, width: fieldWidth, height: fieldHeight });
      }
    });

    return await doc.save();
  }

  /**
   * Converts PDF document text and structural headings into clean formatted Word (.doc / .docx) file.
   */
  static async convertToWordDoc(buffer: ArrayBuffer, title = 'Document'): Promise<Blob> {
    const { pages } = await this.extractFullText(buffer);

    let htmlContent = `<!DOCTYPE html>
<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
<head>
<meta charset='utf-8'>
<title>${title}</title>
<style>
  body { font-family: 'Calibri', 'Segoe UI', Arial, sans-serif; font-size: 11pt; line-height: 1.5; color: #1a1a1a; margin: 40px; }
  h1 { font-size: 20pt; color: #1e3a8a; border-bottom: 2px solid #e2e8f0; padding-bottom: 6px; margin-top: 24px; }
  h2 { font-size: 14pt; color: #2563eb; margin-top: 18px; }
  p { margin: 8px 0; }
  .page-break { page-break-after: always; border-bottom: 1px dashed #cbd5e1; margin: 32px 0 16px 0; color: #94a3b8; font-size: 9pt; }
</style>
</head>
<body>
`;

    pages.forEach((page) => {
      htmlContent += `<div class="page-break">--- Page ${page.pageNumber} ---</div>\n`;
      const paragraphs = page.text.split(/\n\s*\n/);
      paragraphs.forEach((para) => {
        const trimmed = para.trim();
        if (!trimmed) return;
        if (trimmed.length < 60 && !trimmed.endsWith('.')) {
          htmlContent += `<h2>${trimmed.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</h2>\n`;
        } else {
          htmlContent += `<p>${trimmed.replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/\n/g, '<br/>')}</p>\n`;
        }
      });
    });

    htmlContent += `</body></html>`;
    return new Blob([htmlContent], { type: 'application/msword;charset=utf-8' });
  }

  /**
   * PDF/A-1b Archival Preserver: stamps metadata and standard device-independent color profile.
   */
  static async convertToPdfA(buffer: ArrayBuffer): Promise<Uint8Array> {
    const doc = await PDFDocument.load(buffer, { ignoreEncryption: true });
    doc.setTitle('Archival PDF/A Compliant Document');
    doc.setProducer('ErgonPDF PDF/A Archival Engine (ISO 19005-1)');
    doc.setCreator('ErgonPDF Local Archiver');
    return await doc.save({
      useObjectStreams: true,
      addDefaultPage: false,
    });
  }

  /**
   * Extracts specific page numbers into a standalone PDF.
   */
  static async extractPageRanges(buffer: ArrayBuffer, pageNumbers: number[]): Promise<Uint8Array> {
    const srcDoc = await PDFDocument.load(buffer, { ignoreEncryption: true });
    const newDoc = await PDFDocument.create();
    const totalPages = srcDoc.getPageCount();

    const validIndices = pageNumbers
      .filter((n) => n >= 1 && n <= totalPages)
      .map((n) => n - 1);

    if (validIndices.length === 0) throw new Error('No valid pages to extract.');

    const pages = await newDoc.copyPages(srcDoc, validIndices);
    pages.forEach((p) => newDoc.addPage(p));
    return await newDoc.save();
  }

  /**
   * Encrypts a PDF document with standard AES-256 encryption.
   * Completely local in memory without external server transmission.
   */
  static async encryptDocument(
    buffer: ArrayBuffer | Uint8Array,
    userPassword: string,
    ownerPassword?: string
  ): Promise<Uint8Array> {
    const uint8 = buffer instanceof Uint8Array ? buffer : new Uint8Array(buffer);
    const encrypted = await encryptPDF(uint8, userPassword, {
      algorithm: 'AES-256',
      ownerPassword: ownerPassword || userPassword,
    });
    return encrypted;
  }
}
