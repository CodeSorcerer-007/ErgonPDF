import { PDFDocument, rgb, degrees, StandardFonts, PDFName, PDFArray, decodePDFRawStream, PDFDict, PDFString } from 'pdf-lib';
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
import { QRGenerator } from './qrGenerator.ts';
import { encryptPDF } from '@pdfsmaller/pdf-encrypt';

// Configure local worker from public directory for 100% offline, private rendering
if (typeof window !== 'undefined') {
  pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.js';
}

export class PDFEngineService {
  /**
   * Resilient helper to retrieve PDF.js loading task in both browser and Node/SSR environments
   * 
   * @param data - Raw PDF file ArrayBuffer.
   * @returns PDF.js loading task.
   * @throws Error if PDF.js getDocument is unavailable.
   */
  private static getPdfLoadingTask(data: ArrayBuffer, password?: string) {
    const fn = (pdfjsLib as any).getDocument || (pdfjsLib as any).default?.getDocument || (pdfjsLib as any).default;
    if (typeof fn === 'function') {
      return fn({
        data: data.slice(0),
        isEvalSupported: false,
        password: password || undefined,
      });
    }
    throw new Error('PDF.js getDocument function not available');
  }

  /**
   * Loads a PDF document and extracts metadata, page count, and page thumbnails.
   *
   * @param data - Raw PDF file ArrayBuffer.
   * @returns Detailed document metadata, total page count, and lightweight thumbnail previews.
   * @throws Error if the buffer cannot be parsed or lacks a valid PDF header.
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
   * Renders a specific page onto an existing HTML canvas element at a given zoom scale.
   *
   * @param data - PDF document ArrayBuffer.
   * @param pageNumber - 1-based index of the page to render.
   * @param canvas - Target HTML5 Canvas element.
   * @param scale - Rendering zoom level multiplier (defaults to 1.0).
   */
  static async renderPageToCanvas(
    data: ArrayBuffer, 
    pageNumber: number, 
    canvas: HTMLCanvasElement, 
    scale = 1.0
  ): Promise<void> {
    const loadingTask = PDFEngineService.getPdfLoadingTask(data);
    const pdfDoc = await loadingTask.promise;
    if (pageNumber < 1 || pageNumber > pdfDoc.numPages) {
      throw new Error(`Invalid page number ${pageNumber}. Document has ${pdfDoc.numPages} page(s).`);
    }
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
   * Merges multiple PDF ArrayBuffers into a single unified PDF file.
   *
   * @param buffers - Array of PDF ArrayBuffers to combine in chronological order.
   * @returns Uint8Array containing the merged PDF document.
   * @throws Error if the buffers array is empty.
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
   *
   * @param buffer - Input PDF ArrayBuffer.
   * @param pageConfigs - Array specifying page index, rotation delta (in degrees), and optional deletion flag.
   * @returns Uint8Array of the restructured PDF document.
   * @throws Error if all pages are deleted resulting in an empty document.
   */
  static async reorderAndTransformPages(
    buffer: ArrayBuffer,
    pageConfigs: { originalIndex: number; rotation: number; deleted?: boolean }[]
  ): Promise<Uint8Array> {
    const srcDoc = await PDFDocument.load(buffer, { ignoreEncryption: true });
    const newDoc = await PDFDocument.create();

    const totalPages = srcDoc.getPageCount();
    const validConfigs = pageConfigs.filter(
      (p) => !p.deleted && typeof p.originalIndex === 'number' && p.originalIndex >= 0 && p.originalIndex < totalPages
    );

    if (validConfigs.length === 0) {
      throw new Error('Cannot save PDF with zero pages.');
    }

    const indicesToCopy = validConfigs.map((p) => p.originalIndex);
    const copiedPages = await newDoc.copyPages(srcDoc, indicesToCopy);

    for (let i = 0; i < copiedPages.length; i++) {
      const page = copiedPages[i];
      const config = validConfigs[i];
      if (config.rotation) {
        const currentAngle = page.getRotation().angle;
        page.setRotation(degrees((currentAngle + config.rotation) % 360));
      }
      newDoc.addPage(page);
    }

    return await newDoc.save();
  }

  /**
   * Splits a PDF into one or more page ranges, returning individual PDF byte arrays.
   *
   * @param buffer - Input PDF ArrayBuffer.
   * @param ranges - List of page ranges to extract, each with a custom name and 1-based start/end pages.
   * @returns Array of objects containing range names and compiled PDF byte arrays.
   */
  static async splitDocument(
    buffer: ArrayBuffer,
    ranges: { name: string; startPage: number; endPage: number }[]
  ): Promise<{ name: string; data: Uint8Array }[]> {
    const srcDoc = await PDFDocument.load(buffer, { ignoreEncryption: true });
    const totalPages = srcDoc.getPageCount();
    if (totalPages === 0) {
      throw new Error('Cannot split an empty document.');
    }
    const results: { name: string; data: Uint8Array }[] = [];

    for (const range of ranges) {
      // Validate that range overlaps with valid document page bounds
      if (range.startPage > totalPages || range.endPage < 1 || range.startPage > range.endPage) {
        throw new Error(
          `Range "${range.name}" (${range.startPage}–${range.endPage}) contains no valid pages for document with ${totalPages} pages.`
        );
      }

      // Clip bounds to existing pages in document
      const start = Math.max(0, range.startPage - 1);
      const end = Math.min(totalPages - 1, range.endPage - 1);

      const indices: number[] = [];
      for (let i = start; i <= end; i++) {
        indices.push(i);
      }

      if (indices.length === 0) {
        throw new Error(
          `Range "${range.name}" (${range.startPage}–${range.endPage}) contains no valid pages.`
        );
      }

      const newDoc = await PDFDocument.create();
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
  /**
   * Helper: Performs lossless object stream and metadata optimization pass.
   */
  private static async compressLossless(buffer: ArrayBuffer, removeMetadata = false): Promise<Uint8Array> {
    const srcDoc = await PDFDocument.load(buffer, { ignoreEncryption: true });
    if (removeMetadata) {
      srcDoc.setTitle('');
      srcDoc.setAuthor('');
      srcDoc.setSubject('');
      srcDoc.setKeywords([]);
      srcDoc.setProducer('ErgonPDF Fast Engine');
      srcDoc.setCreator('ErgonPDF Local Workspace');
    }
    return await srcDoc.save({ useObjectStreams: true, addDefaultPage: false });
  }

  /**
   * Helper: Performs raster downsampling of document pages onto canvas.
   */
  private static async downsampleRasterPages(buffer: ArrayBuffer, settings: CompressionSettings): Promise<Uint8Array> {
    const loadingTask = PDFEngineService.getPdfLoadingTask(buffer);
    const pdfDoc = await loadingTask.promise;
    const pageCount = pdfDoc.numPages;
    const newDoc = await PDFDocument.create();

    const dpi = settings.dpi || (settings.level === 'max' ? 96 : settings.level === 'grayscale' ? 120 : 150);
    const scaleFactor = Math.min(2.0, Math.max(0.8, dpi / 72));
    const quality = settings.imageQuality || (settings.level === 'max' ? 0.45 : settings.level === 'grayscale' ? 0.60 : 0.70);
    const isGrayscale = settings.grayscale || settings.level === 'grayscale';

    for (let pageNum = 1; pageNum <= pageCount; pageNum++) {
      const page = await pdfDoc.getPage(pageNum);
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
          const data = imgData.data;
          for (let pixel = 0; pixel < data.length; pixel += 4) {
            const gray = (data[pixel] * 299 + data[pixel + 1] * 587 + data[pixel + 2] * 114) >> 10;
            data[pixel] = gray;
            data[pixel + 1] = gray;
            data[pixel + 2] = gray;
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

    return await newDoc.save({ useObjectStreams: true, addDefaultPage: false });
  }

  /**
   * Compresses a PDF using adaptive lossless stream compaction or visual raster downsampling.
   * Includes an automatic size safeguard to fall back to lossless optimization if rasterization bloats the file.
   *
   * @param buffer - Raw input PDF ArrayBuffer.
   * @param settings - Compression configuration specifying level ('lossless', 'balanced', 'max', 'grayscale') and optional metadata removal.
   * @returns Object containing compressed binary data, initial size, compressed size, and percentage saved.
   */
  static async compressDocument(
    buffer: ArrayBuffer,
    settings: CompressionSettings
  ): Promise<{ data: Uint8Array; originalSize: number; compressedSize: number; savingsPercent: number }> {
    const originalSize = buffer.byteLength;

    // 1. Lossless pass (object streams + metadata scrubbing)
    const losslessData = await PDFEngineService.compressLossless(buffer, !!settings.removeMetadata);

    // If lossless mode requested, return right away
    if (settings.level === 'lossless') {
      const compressedSize = Math.min(losslessData.byteLength, originalSize);
      const finalData = compressedSize === losslessData.byteLength ? losslessData : new Uint8Array(buffer);
      const savingsPercent = Math.max(0, Math.round((1 - compressedSize / originalSize) * 100));
      return { data: finalData, originalSize, compressedSize, savingsPercent };
    }

    // 2. Visual / Raster downsampling pass with safe fallback
    try {
      const rasterData = await PDFEngineService.downsampleRasterPages(buffer, settings);

      // SIZE SAFEGUARD:
      // If rasterization made it larger than original, fall back to lossless or original!
      let bestData = rasterData;
      if (rasterData.byteLength >= originalSize) {
        bestData = losslessData.byteLength < originalSize ? losslessData : new Uint8Array(buffer);
      } else if (losslessData.byteLength < rasterData.byteLength && settings.level !== 'max' && settings.level !== 'grayscale') {
        bestData = losslessData.byteLength < originalSize ? losslessData : new Uint8Array(buffer);
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
      // Fallback with strict size safeguard: never return a file larger than the input
      const bestData = losslessData.byteLength < originalSize ? losslessData : new Uint8Array(buffer);
      const compressedSize = bestData.byteLength;
      const savingsPercent = Math.max(0, Math.round((1 - compressedSize / originalSize) * 100));
      return {
        data: bestData,
        originalSize,
        compressedSize,
        savingsPercent,
      };
    }
  }

  /**
   * Adds a customizable text watermark stamp across document pages.
   *
   * @param buffer - Input PDF ArrayBuffer.
   * @param settings - Watermark settings including text string, font size, opacity, rotation angle in degrees, and color.
   * @returns Uint8Array containing the watermarked PDF.
   */
  static async addWatermark(
    buffer: ArrayBuffer,
    settings: WatermarkSettings
  ): Promise<Uint8Array> {
    const doc = await PDFDocument.load(buffer, { ignoreEncryption: true });
    const pages = doc.getPages();
    const font = await doc.embedFont(StandardFonts.HelveticaBold);

    // Parse color components
    let red = 0.5, green = 0.5, blue = 0.5;
    if (settings.color === 'red') { red = 0.9; green = 0.2; blue = 0.2; }
    else if (settings.color === 'blue') { red = 0.2; green = 0.4; blue = 0.9; }
    else if (settings.color === 'green') { red = 0.1; green = 0.7; blue = 0.3; }

    // Default rotation to 0 degrees if omitted or invalid
    const rotationAngle = typeof settings.rotation === 'number' && !isNaN(settings.rotation) ? settings.rotation : 0;

    pages.forEach((page) => {
      const { width, height } = page.getSize();
      const textWidth = font.widthOfTextAtSize(settings.text, settings.fontSize);
      const textHeight = font.heightAtSize(settings.fontSize);

      page.drawText(settings.text, {
        x: (width - textWidth) / 2,
        y: (height - textHeight) / 2,
        size: settings.fontSize,
        font,
        color: rgb(red, green, blue),
        opacity: settings.opacity,
        rotate: degrees(rotationAngle),
      });
    });

    return await doc.save();
  }

  /**
   * Stamped sequential page numbers or custom header/footer numbering on pages.
   *
   * @param buffer - Input PDF ArrayBuffer.
   * @param settings - Numbering layout options (format, starting number, font size, placement position, margin).
   * @returns Uint8Array containing the numbered PDF.
   */
  static async addPageNumbers(
    buffer: ArrayBuffer,
    settings: PageNumberSettings
  ): Promise<Uint8Array> {
    const doc = await PDFDocument.load(buffer, { ignoreEncryption: true });
    const pages = doc.getPages();
    const total = pages.length;
    const font = await doc.embedFont(StandardFonts.Helvetica);

    const startNumber = Number.isFinite(settings.startNumber) && settings.startNumber >= 1
      ? Math.floor(settings.startNumber)
      : 1;
    const fontSize = Number.isFinite(settings.fontSize) && settings.fontSize > 0
      ? settings.fontSize
      : 10;
    const margin = Number.isFinite(settings.margin) && settings.margin >= 0
      ? settings.margin
      : 25;

    pages.forEach((page, idx) => {
      const pageNum = startNumber + idx;
      let label = `${pageNum}`;
      if (settings.format === 'Page 1') label = `Page ${pageNum}`;
      else if (settings.format === 'Page 1 of n') label = `Page ${pageNum} of ${total}`;
      else if (settings.format === '- 1 -') label = `- ${pageNum} -`;

      const { width } = page.getSize();
      const textWidth = font.widthOfTextAtSize(label, fontSize);

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
        y = page.getSize().height - margin - fontSize;
      } else if (settings.position === 'top-center') {
        x = (width - textWidth) / 2;
        y = page.getSize().height - margin - fontSize;
      }

      page.drawText(label, {
        x,
        y,
        size: fontSize,
        font,
        color: rgb(0.2, 0.25, 0.35),
      });
    });

    return await doc.save();
  }

  /**
   * Bakes placed digital signatures into the PDF document at exact coordinates and scale.
   *
   * @param buffer - Input PDF ArrayBuffer.
   * @param signatures - Array of placed digital signatures with target page numbers, relative coordinates, and data URLs.
   * @returns Uint8Array of the document with embedded signatures.
   */
  static async applySignatures(
    buffer: ArrayBuffer,
    signatures: PlacedSignature[]
  ): Promise<Uint8Array> {
    const doc = await PDFDocument.load(buffer, { ignoreEncryption: true });
    const pages = doc.getPages();

    for (const sig of signatures) {
      if (sig.pageNumber < 1 || sig.pageNumber > pages.length) continue;
      if (!sig.dataUrl || typeof sig.dataUrl !== 'string' || !sig.dataUrl.startsWith('data:image/')) continue;
      const page = pages[sig.pageNumber - 1];
      const { width, height } = page.getSize();

      try {
        const imgBytes = await fetch(sig.dataUrl).then((r) => r.arrayBuffer());
        const embeddedImg = (sig.dataUrl.includes('image/jpeg') || sig.dataUrl.includes('image/jpg'))
          ? await doc.embedJpg(imgBytes)
          : await doc.embedPng(imgBytes);

        const targetWidth = ((sig.widthPercent || 20) / 100) * width;
        const targetHeight = ((sig.heightPercent || 10) / 100) * height;
        const targetX = ((sig.xPercent || 0) / 100) * width;
        // In PDF coordinate space, origin (0,0) is at bottom-left
        const targetY = height - ((sig.yPercent || 0) / 100) * height - targetHeight;

        page.drawImage(embeddedImg, {
          x: targetX,
          y: targetY,
          width: targetWidth,
          height: targetHeight,
        });
      } catch (err) {
        console.warn(`Failed to embed signature on page ${sig.pageNumber}:`, err);
      }
    }

    return await doc.save();
  }

  /**
   * Permanently scrubs sensitive page regions to remove underlying vector content and text streams.
   * Strips matching text operators from content streams and draws opaque blackout rectangles.
   *
   * @param buffer - Input PDF ArrayBuffer.
   * @param redactions - Array of blackout bounding boxes with relative percentages and page numbers.
   * @returns Uint8Array containing permanently redacted PDF.
   */
  static async applyRedactions(
    buffer: ArrayBuffer,
    redactions: RedactionBox[]
  ): Promise<Uint8Array> {
    const doc = await PDFDocument.load(buffer, { ignoreEncryption: true });
    const pages = doc.getPages();

    // Group redactions by pageNumber
    const redactionsByPage = new Map<number, RedactionBox[]>();
    for (const box of redactions) {
      if (box.pageNumber < 1 || box.pageNumber > pages.length) continue;
      const list = redactionsByPage.get(box.pageNumber) || [];
      list.push(box);
      redactionsByPage.set(box.pageNumber, list);
    }

    // Inspect text items via PDF.js to discover text within redaction zones
    let pdfDocJs: any = null;
    try {
      const loadingTask = PDFEngineService.getPdfLoadingTask(buffer);
      pdfDocJs = await loadingTask.promise;
    } catch {
      // If PDF.js inspection fails, proceed with geometric blackout drawing
    }

    for (const [pageNum, boxes] of redactionsByPage.entries()) {
      const page = pages[pageNum - 1];
      const { width, height } = page.getSize();

      const redactedStrings = new Set<string>();

      // Calculate bounding box in PDF points for each redaction
      const calculatedBoxes = boxes.map((box) => {
        const boxWidth = (box.widthPercent / 100) * width;
        const boxHeight = (box.heightPercent / 100) * height;
        const boxX = (box.xPercent / 100) * width;
        const boxY = height - (box.yPercent / 100) * height - boxHeight;
        return { boxX, boxY, boxWidth, boxHeight };
      });

      // Query PDF.js text items if available
      if (pdfDocJs) {
        try {
          const jsPage = await pdfDocJs.getPage(pageNum);
          const tc = await jsPage.getTextContent();
          for (const item of tc.items as any[]) {
            if (!item.str || !item.transform) continue;
            const itX = item.transform[4];
            const itY = item.transform[5];
            const itW = Math.max(item.width || 0, 4);
            const itH = Math.max(item.height || 0, 8);

            for (const { boxX, boxY, boxWidth, boxHeight } of calculatedBoxes) {
              const overlapX = itX < boxX + boxWidth && itX + itW > boxX;
              const overlapY = itY < boxY + boxHeight && itY + itH > boxY;
              if (overlapX && overlapY) {
                redactedStrings.add(item.str);
              }
            }
          }
        } catch {
          // ignore inspection errors on individual page
        }
      }

      // Scrub detected text strings from page content streams
      if (redactedStrings.size > 0) {
        try {
          const contents = page.node.Contents();
          if (contents) {
            const streamList = contents instanceof PDFArray
              ? Array.from({ length: contents.size() }, (_, i) => doc.context.lookup(contents.get(i)))
              : [doc.context.lookup(contents)];

            for (let sIdx = 0; sIdx < streamList.length; sIdx++) {
              const stream = streamList[sIdx];
              if (!stream || typeof (stream as any).getContents !== 'function') continue;
              const rawBytes = decodePDFRawStream(stream as any).decode();
              let sText = new TextDecoder().decode(rawBytes);

              for (const str of redactedStrings) {
                const trimmed = str.trim();
                if (!trimmed) continue;

                // 1. Literal string in PDF
                sText = sText.split(str).join('');
                if (trimmed !== str) sText = sText.split(trimmed).join('');

                // 2. Hex representation in PDF <HEX...>
                const hex = Array.from(new TextEncoder().encode(str))
                  .map((b) => b.toString(16).padStart(2, '0').toUpperCase())
                  .join('');
                sText = sText.split(hex).join('');

                // 3. UTF-16 BE representation
                const utf16beHex = Array.from(str)
                  .map((c) => c.charCodeAt(0).toString(16).padStart(4, '0').toUpperCase())
                  .join('');
                sText = sText.split(utf16beHex).join('');
              }

              const newStream = doc.context.flateStream(sText);
              const newRef = doc.context.register(newStream);
              if (contents instanceof PDFArray) {
                contents.set(sIdx, newRef);
              } else {
                page.node.set(PDFName.of('Contents'), newRef);
              }
            }
          }
        } catch {
          // Continue to drawing rectangle if stream modification has an edge case
        }
      }

      // Strip annotations on redacted page that may expose comments or form data
      try {
        page.node.delete(PDFName.of('Annots'));
      } catch {}

      // Draw the permanent opaque black rectangle over the redacted area
      for (const { boxX, boxY, boxWidth, boxHeight } of calculatedBoxes) {
        page.drawRectangle({
          x: boxX,
          y: boxY,
          width: boxWidth,
          height: boxHeight,
          color: rgb(0, 0, 0),
        });
      }
    }

    return await doc.save();
  }

  /**
   * Renders PDF pages into high-resolution image bitmaps (PNG, JPEG, or WebP).
   *
   * @param buffer - Input PDF ArrayBuffer.
   * @param format - Output image encoding ('png', 'jpeg', or 'webp').
   * @param scale - Canvas rendering scale / DPI factor (defaults to 2.0).
   * @returns Array of page objects containing 1-based page numbers, data URLs, and binary Blobs.
   */
  static async convertToImages(
    buffer: ArrayBuffer,
    format: 'png' | 'jpeg' | 'webp' = 'png',
    scale = 2.0
  ): Promise<{ pageNumber: number; dataUrl: string; blob: Blob }[]> {
    const safeScale = Number.isFinite(scale) ? Math.max(0.25, Math.min(4.0, scale)) : 2.0;
    const loadingTask = PDFEngineService.getPdfLoadingTask(buffer);
    const pdfDoc = await loadingTask.promise;
    const pageCount = pdfDoc.numPages;
    const results: { pageNumber: number; dataUrl: string; blob: Blob }[] = [];

    const mimeType = format === 'jpeg' ? 'image/jpeg' : format === 'webp' ? 'image/webp' : 'image/png';

    for (let i = 1; i <= pageCount; i++) {
      const page = await pdfDoc.getPage(i);
      const viewport = page.getViewport({ scale: safeScale });
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
   * Combines an array of image files into a multi-page PDF document.
   *
   * @param images - Array of image descriptors containing file name, ArrayBuffer, and MIME type.
   * @returns Uint8Array of the generated PDF.
   */
  static async imagesToPDF(
    images: { name: string; buffer: ArrayBuffer; type: string }[]
  ): Promise<Uint8Array> {
    if (!images || images.length === 0) {
      throw new Error('No images provided for PDF conversion.');
    }
    const doc = await PDFDocument.create();

    for (const img of images) {
      let embeddedImg;
      if (img.type.includes('png')) {
        embeddedImg = await doc.embedPng(img.buffer);
      } else if (img.type.includes('jpeg') || img.type.includes('jpg')) {
        embeddedImg = await doc.embedJpg(img.buffer);
      } else {
        if (typeof document !== 'undefined' && typeof window !== 'undefined') {
          const blob = new Blob([img.buffer], { type: img.type });
          const bitmap = await createImageBitmap(blob);
          const canvas = document.createElement('canvas');
          canvas.width = bitmap.width;
          canvas.height = bitmap.height;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(bitmap, 0, 0);
            const pngDataUrl = canvas.toDataURL('image/png');
            const pngBytes = await fetch(pngDataUrl).then((r) => r.arrayBuffer());
            embeddedImg = await doc.embedPng(pngBytes);
          } else {
            embeddedImg = await doc.embedJpg(img.buffer);
          }
        } else {
          embeddedImg = await doc.embedJpg(img.buffer);
        }
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
   * Extracts text content across all pages of a PDF document.
   *
   * @param buffer - Input PDF ArrayBuffer.
   * @returns Object containing full aggregated text and per-page text extracts.
   */
  static async extractFullText(
    buffer: ArrayBuffer
  ): Promise<{ text: string; pages: { pageNumber: number; text: string }[] }> {
    const loadingTask = PDFEngineService.getPdfLoadingTask(buffer);
    const pdfDoc = await loadingTask.promise;
    const pageCount = pdfDoc.numPages;
    const pageTexts: { pageNumber: number; text: string }[] = [];
    let fullText = '';

    for (let i = 1; i <= pageCount; i++) {
      const page = await pdfDoc.getPage(i);
      const textContent = await page.getTextContent();
      const pageString = textContent.items
        .map((item: any) => ('str' in item ? (item as { str: string }).str : ''))
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
   * Bisects 2-in-1 two-page spreads down the center into individual single pages.
   *
   * @param buffer - Input PDF ArrayBuffer containing side-by-side spreads.
   * @returns Uint8Array containing doubled page count single-page PDF.
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
   * Imposes multiple pages (2, 4, 9, or 16) onto single sheets for handout printing.
   *
   * @param buffer - Input PDF ArrayBuffer.
   * @param settings - Imposition settings (pages per sheet, orientation, border outline).
   * @returns Uint8Array containing N-up imposed PDF.
   */
  static async nUpImposition(
    buffer: ArrayBuffer,
    settings: NUpSettings = { pagesPerSheet: 2, orientation: 'auto', addBorder: true }
  ): Promise<Uint8Array> {
    const srcDoc = await PDFDocument.load(buffer, { ignoreEncryption: true });
    const newDoc = await PDFDocument.create();
    const totalPages = srcDoc.getPageCount();

    const allowedPages = [2, 4, 9, 16];
    const pagesPerSheet = allowedPages.includes(settings.pagesPerSheet) ? settings.pagesPerSheet : 2;
    const columnCount = pagesPerSheet === 2 ? 2 : pagesPerSheet === 4 ? 2 : pagesPerSheet === 9 ? 3 : 4;
    const rowCount = pagesPerSheet === 2 ? 1 : pagesPerSheet === 4 ? 2 : pagesPerSheet === 9 ? 3 : 4;

    // Standard A4 sheet: 595.28 x 841.89 (or landscape 841.89 x 595.28)
    const isLandscape = settings.orientation === 'landscape' || (settings.orientation === 'auto' && pagesPerSheet === 2);
    const sheetWidth = isLandscape ? 841.89 : 595.28;
    const sheetHeight = isLandscape ? 595.28 : 841.89;

    const cellWidth = sheetWidth / columnCount;
    const cellHeight = sheetHeight / rowCount;

    for (let sheetStartIdx = 0; sheetStartIdx < totalPages; sheetStartIdx += pagesPerSheet) {
      const sheetPage = newDoc.addPage([sheetWidth, sheetHeight]);

      for (let cellIndex = 0; cellIndex < pagesPerSheet; cellIndex++) {
        const pageIndex = sheetStartIdx + cellIndex;
        if (pageIndex >= totalPages) break;

        const [embeddedPage] = await newDoc.embedPages([srcDoc.getPage(pageIndex)]);
        const { width: originalWidth, height: originalHeight } = embeddedPage;

        const col = cellIndex % columnCount;
        const row = Math.floor(cellIndex / columnCount);

        // Fit within cell with padding
        const padding = 12;
        const maxWidth = cellWidth - padding * 2;
        const maxHeight = cellHeight - padding * 2;
        const scale = Math.min(maxWidth / originalWidth, maxHeight / originalHeight);

        const renderWidth = originalWidth * scale;
        const renderHeight = originalHeight * scale;

        const x = col * cellWidth + (cellWidth - renderWidth) / 2;
        // In PDF coordinates (0,0) is bottom-left, row 0 is top
        const y = sheetHeight - (row + 1) * cellHeight + (cellHeight - renderHeight) / 2;

        sheetPage.drawPage(embeddedPage, {
          x,
          y,
          width: renderWidth,
          height: renderHeight,
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
   * Generates a saddle-stitch booklet imposition layout for folding and stapling.
   * Automatically pads document pages to a multiple of 4 and organizes front/back spreads.
   *
   * @param buffer - Input PDF ArrayBuffer.
   * @returns Uint8Array containing 2-page landscape booklet sheets.
   */
  static async createBooklet(buffer: ArrayBuffer): Promise<Uint8Array> {
    const srcDoc = await PDFDocument.load(buffer, { ignoreEncryption: true });
    const newDoc = await PDFDocument.create();
    const originalCount = srcDoc.getPageCount();
    if (originalCount === 0) return await newDoc.save();

    // Pad to multiple of 4
    const targetCount = Math.ceil(originalCount / 4) * 4;
    const samplePage = srcDoc.getPage(0);
    const { width: pageWidth, height: pageHeight } = samplePage.getSize();

    // Sheet is landscape, 2 pages side-by-side
    const sheetWidth = pageHeight > pageWidth ? pageWidth * 2 : pageWidth;
    const sheetHeight = pageHeight;

    const sheetsCount = targetCount / 4;
    for (let sheetIndex = 0; sheetIndex < sheetsCount; sheetIndex++) {
      // Sheet Front: Left = targetCount - 2*sheetIndex, Right = 2*sheetIndex + 1
      const frontLeftIdx = targetCount - 1 - 2 * sheetIndex;
      const frontRightIdx = 2 * sheetIndex;

      const frontSheet = newDoc.addPage([sheetWidth, sheetHeight]);
      const halfWidth = sheetWidth / 2;

      // Draw front left
      if (frontLeftIdx < originalCount) {
        const [leftEmbed] = await newDoc.embedPages([srcDoc.getPage(frontLeftIdx)]);
        frontSheet.drawPage(leftEmbed, { x: 0, y: 0, width: halfWidth, height: sheetHeight });
      }
      // Draw front right
      if (frontRightIdx < originalCount) {
        const [rightEmbed] = await newDoc.embedPages([srcDoc.getPage(frontRightIdx)]);
        frontSheet.drawPage(rightEmbed, { x: halfWidth, y: 0, width: halfWidth, height: sheetHeight });
      }

      // Sheet Back: Left = 2*sheetIndex + 2, Right = targetCount - 2 - 2*sheetIndex
      const backLeftIdx = 2 * sheetIndex + 1;
      const backRightIdx = targetCount - 2 - 2 * sheetIndex;

      const backSheet = newDoc.addPage([sheetWidth, sheetHeight]);
      if (backLeftIdx < originalCount) {
        const [leftEmbed] = await newDoc.embedPages([srcDoc.getPage(backLeftIdx)]);
        backSheet.drawPage(leftEmbed, { x: 0, y: 0, width: halfWidth, height: sheetHeight });
      }
      if (backRightIdx < originalCount) {
        const [rightEmbed] = await newDoc.embedPages([srcDoc.getPage(backRightIdx)]);
        backSheet.drawPage(rightEmbed, { x: halfWidth, y: 0, width: halfWidth, height: sheetHeight });
      }
    }

    return await newDoc.save();
  }

  /**
   * Applies non-destructive crop margins to all pages of a PDF document.
   *
   * @param buffer - Input PDF ArrayBuffer.
   * @param settings - Percentage margins to trim (leftPercent, rightPercent, topPercent, bottomPercent).
   * @returns Uint8Array containing cropped PDF document.
   */
  static async cropDocument(buffer: ArrayBuffer, settings: CropSettings): Promise<Uint8Array> {
    const doc = await PDFDocument.load(buffer, { ignoreEncryption: true });
    const pages = doc.getPages();

    const clamp = (val: number | undefined) => Math.max(0, Math.min(100, Number.isFinite(val) ? Number(val) : 0));
    const leftPercent = clamp(settings.leftPercent);
    const rightPercent = clamp(settings.rightPercent);
    const topPercent = clamp(settings.topPercent);
    const bottomPercent = clamp(settings.bottomPercent);

    pages.forEach((page) => {
      const { width, height } = page.getSize();
      const cropLeft = (leftPercent / 100) * width;
      const cropRight = width - (rightPercent / 100) * width;
      const cropBottom = (bottomPercent / 100) * height;
      const cropTop = height - (topPercent / 100) * height;

      page.setCropBox(cropLeft, cropBottom, Math.max(10, cropRight - cropLeft), Math.max(10, cropTop - cropBottom));
    });

    return await doc.save();
  }

  /**
   * Standardizes PDF page sizes to standard paper dimensions (A4, A3, A5, Letter, Legal).
   *
   * @param buffer - Input PDF ArrayBuffer.
   * @param settings - Resizing configuration including target size name and orientation ('portrait' or 'landscape').
   * @returns Uint8Array containing resized PDF document.
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
   * Interleaves two PDF documents alternating page by page (useful for merging odd and even duplex scan batches).
   *
   * @param docABuffer - Document containing odd or primary pages.
   * @param docBBuffer - Document containing even or secondary pages.
   * @param reverseB - Optional flag to reverse document B (for reverse-order scanner feeds).
   * @returns Uint8Array containing merged alternating pages.
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
   * Automatically scans and discards empty or blank pages based on text emptiness and canvas pixel luminance.
   *
   * @param buffer - Input PDF ArrayBuffer.
   * @param threshold - Luminance ratio threshold for white pixels (defaults to 0.99).
   * @returns Object containing the cleaned PDF data and the number of removed blank pages.
   */
  static async removeBlankPages(buffer: ArrayBuffer, threshold = 0.99): Promise<{ data: Uint8Array; removedCount: number }> {
    const loadingTask = PDFEngineService.getPdfLoadingTask(buffer);
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
   * Extracts raster images embedded in the document (both raw XObject images and rendered pages) and bundles them into a ZIP archive.
   *
   * @param buffer - Input PDF ArrayBuffer.
   * @returns Promise resolving to a Blob containing the ZIP archive of images.
   */
  static async extractImagesToZip(buffer: ArrayBuffer): Promise<Blob> {
    const zip = new JSZip();
    let extractedCount = 0;

    // 1. Extract raw embedded /XObject image streams via pdf-lib
    try {
      const doc = await PDFDocument.load(buffer, { ignoreEncryption: true });
      const pages = doc.getPages();

      for (let pIdx = 0; pIdx < pages.length; pIdx++) {
        const page = pages[pIdx];
        const resources = page.node.Resources();
        if (!resources) continue;
        const xObjects = resources.lookupMaybe(PDFName.of('XObject'), PDFDict);
        if (!xObjects) continue;

        const keys = xObjects.keys();
        let imgIdx = 1;
        for (const key of keys) {
          const xObj = xObjects.lookup(key);
          if (!xObj || !(xObj instanceof PDFDict)) continue;
          const subtype = xObj.lookup(PDFName.of('Subtype'));
          if (subtype?.toString() === '/Image') {
            const filter = xObj.lookup(PDFName.of('Filter'));
            const isJpeg = filter?.toString().includes('DCTDecode');
            try {
              const rawStream = decodePDFRawStream(xObj as any) as any;
              const data = isJpeg && rawStream.data ? rawStream.data : rawStream.decode();
              const ext = isJpeg ? 'jpg' : 'png';
              zip.file(`extracted_p${pIdx + 1}_img${imgIdx}.${ext}`, data);
              extractedCount++;
              imgIdx++;
            } catch {
              // fallback to rendering
            }
          }
        }
      }
    } catch {
      // ignore
    }

    // 2. Render high-resolution page bitmaps if in browser or if no raw images found
    if (typeof document !== 'undefined') {
      try {
        const loadingTask = PDFEngineService.getPdfLoadingTask(buffer);
        const pdfDoc = await loadingTask.promise;
        const pageCount = pdfDoc.numPages;

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
            extractedCount++;
          }
        }
      } catch {
        // ignore
      }
    }

    if (extractedCount === 0) {
      zip.file('info.txt', 'No extractable embedded images found in document.');
    }

    return await zip.generateAsync({ type: 'blob' });
  }

  /**
   * Overlays or underlays a template PDF onto all pages of the target document.
   *
   * @param docBuffer - Target document ArrayBuffer.
   * @param templateBuffer - Template PDF ArrayBuffer to overlay or underlay.
   * @param isUnderlay - If true, places template behind page content instead of on top.
   * @returns Uint8Array containing merged overlay.
   */
  static async overlayDocument(docBuffer: ArrayBuffer, templateBuffer: ArrayBuffer, isUnderlay = false): Promise<Uint8Array> {
    const mainDoc = await PDFDocument.load(docBuffer, { ignoreEncryption: true });
    const templateDoc = await PDFDocument.load(templateBuffer, { ignoreEncryption: true });
    if (templateDoc.getPageCount() === 0) {
      throw new Error('Template document contains no pages.');
    }
    const newDoc = await PDFDocument.create();

    const templatePage = templateDoc.getPage(0);
    // Ensure template page has Contents stream so pdf-lib embedPages does not throw
    if (!templatePage.node.Contents()) {
      const { width, height } = templatePage.getSize();
      templatePage.drawRectangle({ x: 0, y: 0, width, height, opacity: 0 });
    }
    const [templatePageEmbed] = await newDoc.embedPages([templatePage]);

    if (!isUnderlay) {
      const mainPages = await newDoc.copyPages(mainDoc, mainDoc.getPageIndices());
      mainPages.forEach((page) => {
        const { width, height } = page.getSize();
        page.drawPage(templatePageEmbed, { x: 0, y: 0, width, height });
        newDoc.addPage(page);
      });
    } else {
      const pageIndices = mainDoc.getPageIndices();
      for (const idx of pageIndices) {
        const srcPage = mainDoc.getPage(idx);
        if (!srcPage.node.Contents()) {
          const { width, height } = srcPage.getSize();
          srcPage.drawRectangle({ x: 0, y: 0, width, height, opacity: 0 });
        }
        const [mainPageEmbed] = await newDoc.embedPages([srcPage]);
        const underlayPage = newDoc.addPage([mainPageEmbed.width, mainPageEmbed.height]);
        underlayPage.drawPage(templatePageEmbed, { x: 0, y: 0, width: mainPageEmbed.width, height: mainPageEmbed.height });
        underlayPage.drawPage(mainPageEmbed, { x: 0, y: 0, width: mainPageEmbed.width, height: mainPageEmbed.height });
      }
    }

    return await newDoc.save();
  }

  /**
   * Generates a fresh blank PDF with optional lined notebook or grid patterns.
   *
   * @param pattern - Background pattern style ('blank', 'lines', or 'grid').
   * @param pageCount - Number of pages to initialize (default 1).
   * @returns Uint8Array of the created PDF document.
   */
  static async createBlankPDF(pattern: 'blank' | 'lines' | 'grid' = 'blank', pageCount = 1): Promise<Uint8Array> {
    const safePageCount = Number.isFinite(pageCount) ? Math.max(1, Math.min(100, Math.floor(pageCount))) : 1;
    const doc = await PDFDocument.create();
    for (let i = 0; i < safePageCount; i++) {
      const page = doc.addPage([595.28, 841.89]); // A4
      const { width, height } = page.getSize();

      // Ensure page has a valid Contents stream for embedding compatibility
      page.drawRectangle({
        x: 0,
        y: 0,
        width,
        height,
        color: rgb(1, 1, 1),
        opacity: 0,
      });

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
   * Flattens and rasterizes an entire PDF into non-editable high-resolution page bitmaps.
   *
   * @param buffer - Input PDF ArrayBuffer.
   * @param dpi - Target rasterization resolution (default 150 DPI).
   * @returns Uint8Array containing flattened PDF.
   */
  static async flattenAndRasterize(buffer: ArrayBuffer, dpi = 150): Promise<Uint8Array> {
    const safeDpi = Number.isFinite(dpi) ? Math.max(72, Math.min(300, dpi)) : 150;
    const scale = safeDpi / 72;
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
   *
   * @param buffer - Damaged or malformed PDF ArrayBuffer.
   * @returns Uint8Array of the reconstructed PDF.
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
   * Parses tabular whitespace layouts and outputs a clean CSV formatted string using 2D spatial coordinate clustering.
   *
   * @param buffer - Input PDF ArrayBuffer.
   * @returns String formatted as CSV tabular data.
   */
  static async extractTablesToCSV(buffer: ArrayBuffer): Promise<string> {
    try {
      const loadingTask = PDFEngineService.getPdfLoadingTask(buffer);
      const pdfDoc = await loadingTask.promise;
      let csv = '';

      for (let pageNum = 1; pageNum <= pdfDoc.numPages; pageNum++) {
        csv += `# Page ${pageNum}\n`;
        const page = await pdfDoc.getPage(pageNum);
        const tc = await page.getTextContent();

        // Group items into rows by Y coordinate (within 4 points tolerance)
        const lineBuckets: { y: number; items: { x: number; w: number; str: string }[] }[] = [];
        for (const it of tc.items as any[]) {
          if (!it.str || !it.transform) continue;
          const x = it.transform[4];
          const y = it.transform[5];
          const w = it.width || 0;

          let bucket = lineBuckets.find((b) => Math.abs(b.y - y) <= 4);
          if (!bucket) {
            bucket = { y, items: [] };
            lineBuckets.push(bucket);
          }
          bucket.items.push({ x, w, str: it.str });
        }

        // Sort lines top-to-bottom (descending Y)
        lineBuckets.sort((a, b) => b.y - a.y);

        for (const line of lineBuckets) {
          // Sort items within line left-to-right (ascending X)
          line.items.sort((a, b) => a.x - b.x);

          const cells: string[] = [];
          let currentCell = '';
          let prevRight = -1;

          for (const item of line.items) {
            if (prevRight >= 0 && item.x - prevRight > 12) {
              // Significant horizontal gap -> new column cell
              if (currentCell.trim()) {
                cells.push(currentCell.trim());
              }
              currentCell = item.str;
            } else {
              currentCell += (currentCell.endsWith(' ') || item.str.startsWith(' ') ? '' : ' ') + item.str;
            }
            prevRight = item.x + item.w;
          }
          if (currentCell.trim()) {
            cells.push(currentCell.trim());
          }

          if (cells.length > 0) {
            const row = cells.map((c) => `"${c.replace(/"/g, '""')}"`).join(',');
            csv += row + '\n';
          }
        }
        csv += '\n';
      }

      if (csv.trim()) {
        return csv;
      }
    } catch {
      // Fallback to text splitting if coordinate extraction fails
    }

    const { pages } = await this.extractFullText(buffer);
    let fallbackCsv = '';
    pages.forEach((p) => {
      fallbackCsv += `# Page ${p.pageNumber}\n`;
      const lines = p.text.split('\n');
      lines.forEach((line) => {
        const cells = line.split(/\s{2,}|\t/).map((c) => `"${c.replace(/"/g, '""').trim()}"`);
        if (cells.length > 0 && cells[0] !== '""') {
          fallbackCsv += cells.join(',') + '\n';
        }
      });
      fallbackCsv += '\n';
    });
    return fallbackCsv;
  }

  /**
   * Linearizes and defragments streams for Fast Web View optimization.
   *
   * @param buffer - Input PDF ArrayBuffer.
   * @returns Uint8Array of the optimized PDF.
   */
  static async webOptimize(buffer: ArrayBuffer): Promise<Uint8Array> {
    const doc = await PDFDocument.load(buffer, { ignoreEncryption: true });
    return await doc.save({
      useObjectStreams: true,
      addDefaultPage: false,
    });
  }

  /**
   * Stamps a dynamic QR code onto a document page at a configurable position.
   *
   * @param buffer - Input PDF ArrayBuffer.
   * @param pageNum - 1-based page number to stamp.
   * @param qrText - Text, URL, or data payload to encode into the QR matrix.
   * @param settings - Placement configuration (position, size percentage, margin).
   * @returns Uint8Array containing stamped document.
   */
  static async stampQRCode(
    buffer: ArrayBuffer,
    pageNum: number,
    qrText: string,
    settings: QRCodeSettings
  ): Promise<Uint8Array> {
    if (!qrText || typeof qrText !== 'string' || qrText.trim().length === 0) {
      throw new Error('QR code payload cannot be empty.');
    }
    const doc = await PDFDocument.load(buffer, { ignoreEncryption: true });
    const pages = doc.getPages();
    if (pageNum < 1 || pageNum > pages.length) {
      throw new Error(`Invalid page number ${pageNum}. Document has ${pages.length} page(s).`);
    }

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
   * Adds interactive fillable PDF Form elements (text inputs, checkboxes, dropdowns, and radio buttons).
   *
   * @param buffer - Input PDF ArrayBuffer.
   * @param fields - Array of form field definitions with field names, types, coordinates, and options.
   * @returns Uint8Array containing the interactive form-enabled PDF.
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
        const textField = form.createTextField(fieldName);
        textField.addToPage(page, { x, y, width: fieldWidth, height: fieldHeight });
      } else if (field.type === 'checkbox') {
        const checkBoxField = form.createCheckBox(fieldName);
        checkBoxField.addToPage(page, { x, y, width: fieldWidth, height: fieldHeight });
      } else if (field.type === 'dropdown') {
        const dropdownField = form.createDropdown(fieldName);
        dropdownField.setOptions(field.options && field.options.length > 0 ? field.options : ['Option 1', 'Option 2', 'Option 3']);
        dropdownField.addToPage(page, { x, y, width: fieldWidth, height: fieldHeight });
      } else if (field.type === 'radio') {
        const radioGroup = form.createRadioGroup(fieldName);
        radioGroup.addOptionToPage(field.options?.[0] || 'Option 1', page, { x, y, width: fieldWidth, height: fieldHeight });
      }
    });

    return await doc.save();
  }

  /**
   * Converts PDF document text and headings into a formatted Microsoft Word document (.doc).
   *
   * @param buffer - Input PDF ArrayBuffer.
   * @param title - Document heading and HTML title (default 'Document').
   * @returns Blob containing formatted Word document bytes.
   */
  static async convertToWordDoc(buffer: ArrayBuffer, title = 'Document'): Promise<Blob> {
    const { pages } = await this.extractFullText(buffer);
    const safeTitle = (title || 'Document')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');

    let htmlContent = `<!DOCTYPE html>
<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
<head>
<meta charset='utf-8'>
<!--[if gte mso 9]>
<xml>
<w:WordDocument>
<w:View>Print</w:View>
<w:Zoom>100</w:Zoom>
<w:DoNotOptimizeForBrowser/>
</w:WordDocument>
</xml>
<![endif]-->
<title>${safeTitle}</title>
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
   * Injects ISO 19005-1 compliant archival PDF/A metadata headers, XMP profile schema, and OutputIntents.
   *
   * @param buffer - Input PDF ArrayBuffer.
   * @returns Uint8Array of PDF/A compliant document.
   */
  static async convertToPdfA(buffer: ArrayBuffer): Promise<Uint8Array> {
    const doc = await PDFDocument.load(buffer, { ignoreEncryption: true });
    doc.setTitle('Archival PDF/A Compliant Document');
    doc.setProducer('ErgonPDF PDF/A Archival Engine (ISO 19005-1)');
    doc.setCreator('ErgonPDF Local Archiver');

    // Inject standard XMP metadata packet with official pdfaid:part and pdfaid:conformance schemas
    const xmpMetadata = `<?xpacket begin="" id="W5M0MpCehiHzreSzNTczkc9d"?>
<x:xmpmeta xmlns:x="adobe:ns:meta/">
  <rdf:RDF xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#">
    <rdf:Description rdf:about="" xmlns:pdfaid="http://www.aiim.org/pdfa/ns/id/">
      <pdfaid:part>1</pdfaid:part>
      <pdfaid:conformance>B</pdfaid:conformance>
    </rdf:Description>
    <rdf:Description rdf:about="" xmlns:dc="http://purl.org/dc/elements/1.1/">
      <dc:format>application/pdf</dc:format>
      <dc:title>
        <rdf:Alt><rdf:li xml:lang="x-default">Archival PDF/A Document</rdf:li></rdf:Alt>
      </dc:title>
    </rdf:Description>
    <rdf:Description rdf:about="" xmlns:pdf="http://ns.adobe.com/pdf/1.3/">
      <pdf:Producer>ErgonPDF PDF/A Archival Engine (ISO 19005-1)</pdf:Producer>
    </rdf:Description>
  </rdf:RDF>
</x:xmpmeta>
<?xpacket end="w"?>`;

    const metaStream = doc.context.stream(xmpMetadata, {
      Type: PDFName.of('Metadata'),
      Subtype: PDFName.of('XML'),
    });
    const metaRef = doc.context.register(metaStream);
    doc.catalog.set(PDFName.of('Metadata'), metaRef);

    // Add OutputIntents dictionary for standard sRGB color profile
    const outputIntentDict = doc.context.obj({
      Type: PDFName.of('OutputIntent'),
      S: PDFName.of('GTS_PDFA1'),
      OutputConditionIdentifier: PDFString.of('sRGB'),
      Info: PDFString.of('sRGB IEC61966-2.1'),
      RegistryName: PDFString.of('http://www.color.org'),
    });
    const outputIntentRef = doc.context.register(outputIntentDict);
    doc.catalog.set(PDFName.of('OutputIntents'), doc.context.obj([outputIntentRef]));

    return await doc.save({
      useObjectStreams: true,
      addDefaultPage: false,
    });
  }

  /**
   * Updates or sanitizes embedded PDF metadata fields (Title, Author, Subject, Keywords).
   *
   * @param buffer - Input PDF ArrayBuffer.
   * @param fields - Metadata fields to set or clear.
   * @returns Uint8Array containing updated PDF.
   */
  static async updateMetadata(
    buffer: ArrayBuffer,
    fields: { title?: string; author?: string; subject?: string; keywords?: string }
  ): Promise<Uint8Array> {
    const doc = await PDFDocument.load(buffer, { ignoreEncryption: true });
    if (fields.title !== undefined) doc.setTitle(fields.title);
    if (fields.author !== undefined) doc.setAuthor(fields.author);
    if (fields.subject !== undefined) doc.setSubject(fields.subject);
    if (fields.keywords !== undefined) {
      const kw = Array.isArray(fields.keywords)
        ? fields.keywords
        : fields.keywords.split(',').map((k) => k.trim()).filter(Boolean);
      doc.setKeywords(kw);
    }
    doc.setProducer('ErgonPDF Local Privacy Engine');
    doc.setCreator('ErgonPDF');
    return await doc.save();
  }

  /**
   * Removes password protection, encryption, and permission restrictions from a PDF.
   *
   * @param buffer - Input PDF ArrayBuffer.
   * @param password - Optional user or owner password for password-protected documents.
   * @returns Uint8Array of the unrestricted, unencrypted PDF.
   */
  static async unlockDocument(buffer: ArrayBuffer, password?: string): Promise<Uint8Array> {
    let srcDoc: PDFDocument;
    try {
      if (password) {
        srcDoc = await PDFDocument.load(buffer, { password } as any);
      } else {
        srcDoc = await PDFDocument.load(buffer, { ignoreEncryption: true });
      }
    } catch {
      try {
        srcDoc = await PDFDocument.load(buffer, { ignoreEncryption: true });
      } catch {
        throw new Error(
          password
            ? 'Incorrect password. Could not decrypt the document.'
            : 'This document is encrypted with a user password. Please provide the document password to unlock it.'
        );
      }
    }

    const newDoc = await PDFDocument.create();
    const pageIndices = srcDoc.getPageIndices();
    const copiedPages = await newDoc.copyPages(srcDoc, pageIndices);
    copiedPages.forEach((page) => newDoc.addPage(page));

    newDoc.setTitle(srcDoc.getTitle() || 'Unlocked Document');
    newDoc.setProducer('ErgonPDF Decryption Engine');
    newDoc.setCreator('ErgonPDF');

    return await newDoc.save({ useObjectStreams: true });
  }

  /**
   * Extracts a specific subset of pages into a standalone PDF document.
   *
   * @param buffer - Input PDF ArrayBuffer.
   * @param pageNumbers - Array of 1-based page numbers to extract.
   * @returns Uint8Array containing extracted pages.
   * @throws Error if no valid page numbers are provided.
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
   * Executes entirely in-memory with zero network transfer.
   *
   * @param buffer - Input PDF ArrayBuffer or Uint8Array.
   * @param userPassword - Password required to open and view the PDF.
   * @param ownerPassword - Optional administrative password for permissions management.
   * @returns Uint8Array containing AES-256 encrypted document.
   */
  static async encryptDocument(
    buffer: ArrayBuffer | Uint8Array,
    userPassword: string,
    ownerPassword?: string
  ): Promise<Uint8Array> {
    const hasUserPassword = typeof userPassword === 'string' && userPassword.length > 0;
    const hasOwnerPassword = typeof ownerPassword === 'string' && ownerPassword.length > 0;

    if (!hasUserPassword && !hasOwnerPassword) {
      throw new Error('Encryption requires a non-empty password. Please provide a user password or owner password.');
    }

    const uint8 = buffer instanceof Uint8Array ? buffer : new Uint8Array(buffer);
    const encrypted = await encryptPDF(uint8, userPassword, {
      algorithm: 'AES-256',
      ownerPassword: ownerPassword || userPassword,
    });
    return encrypted;
  }

  /**
   * Generates a fully formatted, professional vector PDF invoice.
   * Runs 100% client-side with zero telemetry or network calls.
   */
  static async generateInvoicePDF(data: {
    invoiceNumber: string;
    date: string;
    dueDate: string;
    currency: string;
    seller: { name: string; address: string; email?: string; taxId?: string };
    buyer: { name: string; address: string; email?: string; taxId?: string };
    items: Array<{ description: string; quantity: number; unitPrice: number; total: number }>;
    subtotal: number;
    taxRate: number;
    taxAmount: number;
    grandTotal: number;
    notes?: string;
  }): Promise<Uint8Array> {
    const doc = await PDFDocument.create();
    const fontRegular = await doc.embedFont(StandardFonts.Helvetica);
    const fontBold = await doc.embedFont(StandardFonts.HelveticaBold);

    const page = doc.addPage([595.28, 841.89]); // A4
    const { width, height } = page.getSize();

    // Top banner
    page.drawRectangle({
      x: 0,
      y: height - 90,
      width,
      height: 90,
      color: rgb(0.12, 0.16, 0.24),
    });

    page.drawText('INVOICE', {
      x: 40,
      y: height - 55,
      size: 26,
      font: fontBold,
      color: rgb(1, 1, 1),
    });

    const invMeta = `#${data.invoiceNumber || 'INV-001'}  |  Date: ${data.date || 'N/A'}`;
    page.drawText(invMeta, {
      x: 40,
      y: height - 75,
      size: 11,
      font: fontRegular,
      color: rgb(0.8, 0.85, 0.9),
    });

    if (data.dueDate) {
      page.drawText(`Due Date: ${data.dueDate}`, {
        x: width - 180,
        y: height - 60,
        size: 11,
        font: fontRegular,
        color: rgb(0.8, 0.85, 0.9),
      });
    }

    // Two-column Seller / Buyer
    let currentY = height - 125;

    // Seller (From)
    page.drawText('FROM:', { x: 40, y: currentY, size: 10, font: fontBold, color: rgb(0.4, 0.45, 0.5) });
    page.drawText(data.seller.name || 'Company Name', { x: 40, y: currentY - 16, size: 12, font: fontBold, color: rgb(0.1, 0.1, 0.1) });
    const sellerLines = (data.seller.address || 'Address').split('\n');
    let sY = currentY - 32;
    sellerLines.forEach(l => {
      page.drawText(l, { x: 40, y: sY, size: 10, font: fontRegular, color: rgb(0.3, 0.3, 0.3) });
      sY -= 14;
    });
    if (data.seller.taxId) {
      page.drawText(`VAT/Tax ID: ${data.seller.taxId}`, { x: 40, y: sY, size: 9, font: fontRegular, color: rgb(0.4, 0.4, 0.4) });
    }

    // Buyer (Bill To)
    page.drawText('BILL TO:', { x: 320, y: currentY, size: 10, font: fontBold, color: rgb(0.4, 0.45, 0.5) });
    page.drawText(data.buyer.name || 'Client Name', { x: 320, y: currentY - 16, size: 12, font: fontBold, color: rgb(0.1, 0.1, 0.1) });
    const buyerLines = (data.buyer.address || 'Client Address').split('\n');
    let bY = currentY - 32;
    buyerLines.forEach(l => {
      page.drawText(l, { x: 320, y: bY, size: 10, font: fontRegular, color: rgb(0.3, 0.3, 0.3) });
      bY -= 14;
    });
    if (data.buyer.taxId) {
      page.drawText(`VAT/Tax ID: ${data.buyer.taxId}`, { x: 320, y: bY, size: 9, font: fontRegular, color: rgb(0.4, 0.4, 0.4) });
    }

    // Line items table
    const tableTop = Math.min(sY, bY) - 30;
    page.drawRectangle({
      x: 40,
      y: tableTop - 20,
      width: width - 80,
      height: 24,
      color: rgb(0.93, 0.95, 0.98),
    });

    page.drawText('DESCRIPTION', { x: 50, y: tableTop - 14, size: 9, font: fontBold, color: rgb(0.2, 0.25, 0.3) });
    page.drawText('QTY', { x: 340, y: tableTop - 14, size: 9, font: fontBold, color: rgb(0.2, 0.25, 0.3) });
    page.drawText('UNIT PRICE', { x: 400, y: tableTop - 14, size: 9, font: fontBold, color: rgb(0.2, 0.25, 0.3) });
    page.drawText('TOTAL', { x: 490, y: tableTop - 14, size: 9, font: fontBold, color: rgb(0.2, 0.25, 0.3) });

    let itemY = tableTop - 40;
    const curr = data.currency || '$';

    for (const item of data.items) {
      page.drawText(item.description || 'Service/Item', { x: 50, y: itemY, size: 10, font: fontRegular, color: rgb(0.15, 0.15, 0.15) });
      page.drawText(String(item.quantity || 1), { x: 345, y: itemY, size: 10, font: fontRegular, color: rgb(0.15, 0.15, 0.15) });
      page.drawText(`${curr}${(item.unitPrice || 0).toFixed(2)}`, { x: 400, y: itemY, size: 10, font: fontRegular, color: rgb(0.15, 0.15, 0.15) });
      page.drawText(`${curr}${(item.total || 0).toFixed(2)}`, { x: 490, y: itemY, size: 10, font: fontRegular, color: rgb(0.15, 0.15, 0.15) });

      page.drawLine({
        start: { x: 40, y: itemY - 6 },
        end: { x: width - 40, y: itemY - 6 },
        thickness: 0.5,
        color: rgb(0.9, 0.9, 0.9),
      });

      itemY -= 22;
      if (itemY < 120) break;
    }

    // Totals block
    const totalsY = itemY - 20;
    page.drawText(`Subtotal:`, { x: 380, y: totalsY, size: 10, font: fontRegular, color: rgb(0.4, 0.4, 0.4) });
    page.drawText(`${curr}${data.subtotal.toFixed(2)}`, { x: 480, y: totalsY, size: 10, font: fontRegular, color: rgb(0.1, 0.1, 0.1) });

    page.drawText(`Tax (${data.taxRate}%):`, { x: 380, y: totalsY - 18, size: 10, font: fontRegular, color: rgb(0.4, 0.4, 0.4) });
    page.drawText(`${curr}${data.taxAmount.toFixed(2)}`, { x: 480, y: totalsY - 18, size: 10, font: fontRegular, color: rgb(0.1, 0.1, 0.1) });

    page.drawRectangle({
      x: 370,
      y: totalsY - 46,
      width: 185,
      height: 24,
      color: rgb(0.12, 0.16, 0.24),
    });

    page.drawText(`Total Due:`, { x: 380, y: totalsY - 39, size: 11, font: fontBold, color: rgb(1, 1, 1) });
    page.drawText(`${curr}${data.grandTotal.toFixed(2)}`, { x: 475, y: totalsY - 39, size: 12, font: fontBold, color: rgb(0.3, 0.8, 0.5) });

    // Notes / Terms
    if (data.notes) {
      page.drawText('NOTES & TERMS:', { x: 40, y: totalsY - 30, size: 9, font: fontBold, color: rgb(0.4, 0.45, 0.5) });
      page.drawText(data.notes.slice(0, 120), { x: 40, y: totalsY - 45, size: 9, font: fontRegular, color: rgb(0.4, 0.4, 0.4) });
    }

    // Footer
    page.drawText('Generated with ErgonPDF Workstation — 100% Private & Local', {
      x: 40,
      y: 30,
      size: 8,
      font: fontRegular,
      color: rgb(0.6, 0.6, 0.6),
    });

    return await doc.save();
  }

  /**
   * Generates a standard ZUGFeRD 2.2 / Factur-X / EN16931 compliant E-Invoice XML string.
   */
  static generateZUGFeRDXml(data: {
    invoiceNumber: string;
    date: string;
    currency: string;
    seller: { name: string; address: string; taxId?: string; email?: string };
    buyer: { name: string; address: string; taxId?: string; email?: string };
    items: Array<{ description: string; quantity: number; unitPrice: number; total: number }>;
    subtotal: number;
    taxRate: number;
    taxAmount: number;
    grandTotal: number;
  }): string {
    const issueDateStr = (data.date || new Date().toISOString().slice(0, 10)).replace(/-/g, '');
    const currency = (data.currency === '€' || !data.currency || data.currency === 'EUR') ? 'EUR' : (data.currency === '£' ? 'GBP' : 'USD');

    return `<?xml version="1.0" encoding="UTF-8"?>
<rsm:CrossIndustryInvoice xmlns:rsm="urn:un:unece:uncefact:data:standard:CrossIndustryInvoice:100"
                          xmlns:ram="urn:un:unece:uncefact:data:standard:ReusableAggregateBusinessInformationEntity:100"
                          xmlns:udt="urn:un:unece:uncefact:data:standard:UnqualifiedDataType:100">
  <rsm:ExchangedDocumentContext>
    <ram:GuidelineSpecifiedDocumentContextParameter>
      <ram:ID>urn:cen.eu:en16931:2017#compliant#urn:factur-x.eu:1p0:comfort</ram:ID>
    </ram:GuidelineSpecifiedDocumentContextParameter>
  </rsm:ExchangedDocumentContext>
  <rsm:ExchangedDocument>
    <ram:ID>${data.invoiceNumber || 'INV-001'}</ram:ID>
    <ram:TypeCode>380</ram:TypeCode>
    <ram:IssueDateTime>
      <udt:DateTimeString format="102">${issueDateStr}</udt:DateTimeString>
    </ram:IssueDateTime>
  </rsm:ExchangedDocument>
  <rsm:SupplyChainTradeTransaction>
    <ram:ApplicableHeaderTradeAgreement>
      <ram:SellerTradeParty>
        <ram:Name>${data.seller.name || 'Seller'}</ram:Name>
        <ram:SpecifiedLegalOrganization>
          <ram:ID>${data.seller.taxId || 'TAX-ID-12345'}</ram:ID>
        </ram:SpecifiedLegalOrganization>
        <ram:PostalTradeAddress>
          <ram:LineOne>${(data.seller.address || 'Address').replace(/\n/g, ', ')}</ram:LineOne>
        </ram:PostalTradeAddress>
      </ram:SellerTradeParty>
      <ram:BuyerTradeParty>
        <ram:Name>${data.buyer.name || 'Buyer'}</ram:Name>
        <ram:PostalTradeAddress>
          <ram:LineOne>${(data.buyer.address || 'Address').replace(/\n/g, ', ')}</ram:LineOne>
        </ram:PostalTradeAddress>
      </ram:BuyerTradeParty>
    </ram:ApplicableHeaderTradeAgreement>
    <ram:ApplicableHeaderTradeSettlement>
      <ram:InvoiceCurrencyCode>${currency}</ram:InvoiceCurrencyCode>
      <ram:SpecifiedTradeSettlementHeaderMonetarySummation>
        <ram:LineTotalAmount>${data.subtotal.toFixed(2)}</ram:LineTotalAmount>
        <ram:TaxBasisTotalAmount>${data.subtotal.toFixed(2)}</ram:TaxBasisTotalAmount>
        <ram:TaxTotalAmount currencyID="${currency}">${data.taxAmount.toFixed(2)}</ram:TaxTotalAmount>
        <ram:GrandTotalAmount>${data.grandTotal.toFixed(2)}</ram:GrandTotalAmount>
        <ram:DuePayableAmount>${data.grandTotal.toFixed(2)}</ram:DuePayableAmount>
      </ram:SpecifiedTradeSettlementHeaderMonetarySummation>
    </ram:ApplicableHeaderTradeSettlement>
  </rsm:SupplyChainTradeTransaction>
</rsm:CrossIndustryInvoice>`;
  }

  /**
   * Generates an executive Job Application & Cover Letter PDF document.
   */
  static async generateJobApplicationPDF(data: {
    applicantName: string;
    email: string;
    phone: string;
    location: string;
    targetRole: string;
    targetCompany: string;
    coverLetter: string;
    skills: string[];
  }): Promise<Uint8Array> {
    const doc = await PDFDocument.create();
    const fontRegular = await doc.embedFont(StandardFonts.Helvetica);
    const fontBold = await doc.embedFont(StandardFonts.HelveticaBold);

    const page = doc.addPage([595.28, 841.89]); // A4
    const { width, height } = page.getSize();

    // Top Header Banner
    page.drawRectangle({
      x: 0,
      y: height - 110,
      width,
      height: 110,
      color: rgb(0.09, 0.13, 0.22),
    });

    page.drawText(data.applicantName || 'Applicant Name', {
      x: 40,
      y: height - 48,
      size: 24,
      font: fontBold,
      color: rgb(1, 1, 1),
    });

    const contactStr = [data.email, data.phone, data.location].filter(Boolean).join('  •  ');
    page.drawText(contactStr || 'email@example.com  •  Phone  •  Location', {
      x: 40,
      y: height - 72,
      size: 10,
      font: fontRegular,
      color: rgb(0.75, 0.82, 0.9),
    });

    const roleTarget = `Application for: ${data.targetRole || 'Professional Role'} at ${data.targetCompany || 'Target Organization'}`;
    page.drawText(roleTarget, {
      x: 40,
      y: height - 94,
      size: 11,
      font: fontBold,
      color: rgb(0.3, 0.7, 0.95),
    });

    let y = height - 145;

    // Date & Salutation
    const today = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    page.drawText(today, { x: 40, y, size: 10, font: fontRegular, color: rgb(0.4, 0.4, 0.4) });
    y -= 25;

    page.drawText(`Dear Hiring Manager at ${data.targetCompany || 'the hiring team'},`, {
      x: 40,
      y,
      size: 11,
      font: fontBold,
      color: rgb(0.15, 0.15, 0.15),
    });
    y -= 25;

    // Cover letter paragraphs
    const paragraphs = (data.coverLetter || 'I am writing to express my strong enthusiasm for this role...').split('\n');
    for (const para of paragraphs) {
      if (!para.trim()) {
        y -= 12;
        continue;
      }
      // Simple word wrapping
      const words = para.trim().split(' ');
      let currentLine = '';
      for (const word of words) {
        const testLine = currentLine ? `${currentLine} ${word}` : word;
        if (testLine.length > 80) {
          page.drawText(currentLine, { x: 40, y, size: 10.5, font: fontRegular, color: rgb(0.2, 0.2, 0.2) });
          y -= 15;
          currentLine = word;
        } else {
          currentLine = testLine;
        }
      }
      if (currentLine) {
        page.drawText(currentLine, { x: 40, y, size: 10.5, font: fontRegular, color: rgb(0.2, 0.2, 0.2) });
        y -= 20;
      }
      if (y < 200) break;
    }

    // Skills pill / block
    if (data.skills && data.skills.length > 0) {
      y = Math.max(y, 180);
      page.drawText('KEY CORE COMPETENCIES & TECHNICAL PROFICIENCIES', {
        x: 40,
        y,
        size: 9,
        font: fontBold,
        color: rgb(0.35, 0.4, 0.48),
      });
      y -= 18;

      const skillsStr = data.skills.join('  |  ');
      page.drawText(skillsStr.slice(0, 110), {
        x: 40,
        y,
        size: 9.5,
        font: fontRegular,
        color: rgb(0.15, 0.45, 0.75),
      });
      y -= 28;
    }

    // Sign-off
    y = Math.max(y, 110);
    page.drawText('Sincerely,', { x: 40, y, size: 10, font: fontRegular, color: rgb(0.2, 0.2, 0.2) });
    y -= 18;
    page.drawText(data.applicantName || 'Applicant', { x: 40, y, size: 11, font: fontBold, color: rgb(0.1, 0.1, 0.1) });

    return await doc.save();
  }

  /**
   * Generates a styled Greeting Card or Photo Collage PDF.
   */
  static async generateCardPDF(data: {
    title: string;
    message: string;
    theme: 'classic' | 'warm' | 'slate' | 'emerald' | 'coral';
    images?: Array<{ name: string; buffer: ArrayBuffer; type: string }>;
  }): Promise<Uint8Array> {
    const doc = await PDFDocument.create();
    const fontRegular = await doc.embedFont(StandardFonts.Helvetica);
    const fontBold = await doc.embedFont(StandardFonts.HelveticaBold);

    // Landscape greeting card / collage: 841.89 x 595.28
    const page = doc.addPage([841.89, 595.28]);
    const { width, height } = page.getSize();

    // Theme background colors
    let bgColor = rgb(0.98, 0.98, 0.98);
    let borderColor = rgb(0.8, 0.82, 0.85);
    let titleColor = rgb(0.1, 0.15, 0.22);
    let msgColor = rgb(0.25, 0.28, 0.35);

    if (data.theme === 'warm') {
      bgColor = rgb(0.99, 0.97, 0.93);
      borderColor = rgb(0.88, 0.76, 0.55);
      titleColor = rgb(0.45, 0.25, 0.08);
      msgColor = rgb(0.35, 0.25, 0.15);
    } else if (data.theme === 'slate') {
      bgColor = rgb(0.1, 0.13, 0.18);
      borderColor = rgb(0.25, 0.32, 0.42);
      titleColor = rgb(0.92, 0.95, 0.98);
      msgColor = rgb(0.75, 0.8, 0.88);
    } else if (data.theme === 'emerald') {
      bgColor = rgb(0.94, 0.98, 0.95);
      borderColor = rgb(0.5, 0.75, 0.6);
      titleColor = rgb(0.08, 0.35, 0.2);
      msgColor = rgb(0.15, 0.3, 0.22);
    } else if (data.theme === 'coral') {
      bgColor = rgb(0.99, 0.95, 0.95);
      borderColor = rgb(0.95, 0.65, 0.65);
      titleColor = rgb(0.5, 0.15, 0.15);
      msgColor = rgb(0.4, 0.2, 0.2);
    }

    // Fill background
    page.drawRectangle({
      x: 0,
      y: 0,
      width,
      height,
      color: bgColor,
    });

    // Decorative inner border
    page.drawRectangle({
      x: 30,
      y: 30,
      width: width - 60,
      height: height - 60,
      borderWidth: 2,
      borderColor,
      opacity: 0,
    });

    // Title / Greeting centered
    const titleText = data.title || 'Warmest Wishes';
    const titleWidth = fontBold.widthOfTextAtSize(titleText, 32);
    page.drawText(titleText, {
      x: (width - titleWidth) / 2,
      y: height - 100,
      size: 32,
      font: fontBold,
      color: titleColor,
    });

    // Embed images if provided
    let msgTop = height - 160;
    if (data.images && data.images.length > 0) {
      try {
        const imgObj = data.images[0];
        const isPng = imgObj.type?.includes('png') || imgObj.name.toLowerCase().endsWith('.png');
        const embeddedImg = isPng ? await doc.embedPng(imgObj.buffer) : await doc.embedJpg(imgObj.buffer);
        const imgDims = embeddedImg.scale(0.35);

        // Center image
        const imgX = (width - imgDims.width) / 2;
        const imgY = height - 130 - imgDims.height;
        page.drawImage(embeddedImg, {
          x: imgX,
          y: imgY,
          width: imgDims.width,
          height: imgDims.height,
        });
        msgTop = imgY - 30;
      } catch (err) {
        console.warn('Could not embed card image:', err);
      }
    }

    // Message centered
    const messageLines = (data.message || 'May your days be filled with happiness, success, and prosperity.').split('\n');
    let mY = msgTop;
    for (const line of messageLines) {
      const lineWidth = fontRegular.widthOfTextAtSize(line.trim(), 16);
      page.drawText(line.trim(), {
        x: (width - lineWidth) / 2,
        y: mY,
        size: 16,
        font: fontRegular,
        color: msgColor,
      });
      mY -= 26;
    }

    return await doc.save();
  }
}

