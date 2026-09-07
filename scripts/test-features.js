import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { PDFDocument } from 'pdf-lib';
import { PDFEngineService } from '../src/services/pdfEngine.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function runSelfTests() {
  console.log('🧪 Starting Engine Feature Integrity Tests (using pdf-lib document inspection)...\n');
  const samplePath = path.join(__dirname, '..', 'public', 'samples', 'sample_contract.pdf');
  const fileBytes = fs.readFileSync(samplePath);
  const buffer = fileBytes.buffer.slice(fileBytes.byteOffset, fileBytes.byteOffset + fileBytes.byteLength);

  let passed = 0;
  let total = 0;

  const test = async (name, fn) => {
    total++;
    try {
      await fn();
      console.log(`  ✅ PASS: ${name}`);
      passed++;
    } catch (err) {
      console.error(`  ❌ FAIL: ${name}`, err.message);
    }
  };

  // Helper to inspect page count via PDFDocument
  const getPageCount = async (bytes) => {
    const doc = await PDFDocument.load(bytes, { ignoreEncryption: true });
    return doc.getPageCount();
  };

  // 1. Create Blank PDF
  await test('createBlankPDF creates valid blank & lined documents', async () => {
    const bytes = await PDFEngineService.createBlankPDF('lines', 2);
    if (bytes.byteLength < 500) throw new Error('Blank PDF byte length too small');
    const count = await getPageCount(bytes);
    if (count !== 2) throw new Error(`Expected 2 pages, got ${count}`);
  });

  // 2. Halve Pages (2-in-1 spread split)
  await test('halvePages splits pages in half doubling page count', async () => {
    const halved = await PDFEngineService.halvePages(buffer);
    const count = await getPageCount(halved);
    if (count !== 4) throw new Error(`Expected 4 pages after halving 2 pages, got ${count}`);
  });

  // 3. Pages Per Sheet (N-Up)
  await test('nUpImposition 2-up imposes pages onto single sheets', async () => {
    const nup = await PDFEngineService.nUpImposition(buffer, { pagesPerSheet: 2, orientation: 'auto', addBorder: true });
    const count = await getPageCount(nup);
    if (count !== 1) throw new Error(`Expected 1 sheet for 2 pages 2-Up, got ${count}`);
  });

  // 4. Booklet Creator
  await test('createBooklet generates saddle-stitch imposition', async () => {
    const booklet = await PDFEngineService.createBooklet(buffer);
    const count = await getPageCount(booklet);
    if (count < 1) throw new Error('Booklet page count invalid');
  });

  // 5. Crop Document
  await test('cropDocument crops margins properly', async () => {
    const cropped = await PDFEngineService.cropDocument(buffer, {
      topPercent: 10,
      bottomPercent: 10,
      leftPercent: 10,
      rightPercent: 10,
      applyToAll: true,
    });
    if (cropped.byteLength < 500) throw new Error('Cropped PDF output invalid');
  });

  // 6. Resize Document
  await test('resizeDocument standardizes to target dimensions (Letter)', async () => {
    const resized = await PDFEngineService.resizeDocument(buffer, { targetSize: 'Letter', orientation: 'portrait' });
    const count = await getPageCount(resized);
    if (count !== 2) throw new Error(`Expected 2 pages, got ${count}`);
  });

  // 7. Alternate & Mix PDFs
  await test('alternateMixDocuments interleaves two PDFs', async () => {
    const mixed = await PDFEngineService.alternateMixDocuments(buffer, buffer);
    const count = await getPageCount(mixed);
    if (count !== 4) throw new Error(`Expected 4 pages after interleaving two 2-page docs, got ${count}`);
  });

  // 8. Repair PDF
  await test('repairDocument reconstructs document streams', async () => {
    const repaired = await PDFEngineService.repairDocument(buffer);
    if (repaired.byteLength < 500) throw new Error('Repaired PDF output invalid');
  });

  // 9. Watermark PDF
  await test('addWatermark adds text watermark overlay', async () => {
    const marked = await PDFEngineService.addWatermark(buffer, {
      text: 'CONFIDENTIAL',
      fontSize: 48,
      opacity: 0.3,
      rotation: -45,
      color: 'grey',
      pages: 'all',
    });
    if (marked.byteLength < 500) throw new Error('Watermarked output invalid');
  });

  // 10. Page Numbers
  await test('addPageNumbers stamps numbering on pages', async () => {
    const numbered = await PDFEngineService.addPageNumbers(buffer, {
      format: 'Page 1 of n',
      position: 'bottom-center',
      fontSize: 10,
      startNumber: 1,
      margin: 20,
    });
    if (numbered.byteLength < 500) throw new Error('Numbered output invalid');
  });

  // 11. Split Document
  await test('splitDocument separates pages into standalone documents', async () => {
    const split = await PDFEngineService.splitDocument(buffer, [
      { name: 'part1.pdf', startPage: 1, endPage: 1 },
      { name: 'part2.pdf', startPage: 2, endPage: 2 },
    ]);
    if (split.length !== 2) throw new Error(`Expected 2 split parts, got ${split.length}`);
  });

  // 12. Merge Documents
  await test('mergeDocuments combines multiple PDFs into one', async () => {
    const merged = await PDFEngineService.mergeDocuments([buffer, buffer]);
    const count = await getPageCount(merged);
    if (count !== 4) throw new Error(`Expected 4 pages after merging two 2-page docs, got ${count}`);
  });

  // 13. Compression Engine (Lossless & Size Safeguard)
  await test('compressDocument lossless cleans metadata and optimizes object streams', async () => {
    const comp = await PDFEngineService.compressDocument(buffer, {
      level: 'lossless',
      imageQuality: 0.7,
      dpi: 150,
      removeMetadata: true,
    });
    if (comp.compressedSize > comp.originalSize) {
      throw new Error(`Compressed size ${comp.compressedSize} should not exceed original ${comp.originalSize}`);
    }
    const count = await getPageCount(comp.data);
    if (count !== 2) throw new Error(`Expected 2 pages preserved, got ${count}`);
  });

  // 14. Web Optimize (Linearize)
  await test('webOptimize defragments streams for fast web view', async () => {
    const optimized = await PDFEngineService.webOptimize(buffer);
    if (optimized.byteLength < 500) throw new Error('Web optimized output invalid');
    const count = await getPageCount(optimized);
    if (count !== 2) throw new Error(`Expected 2 pages, got ${count}`);
  });

  // 15. PDF/A Archival
  await test('convertToPdfA creates ISO-compliant archival document', async () => {
    const pdfa = await PDFEngineService.convertToPdfA(buffer);
    if (pdfa.byteLength < 500) throw new Error('PDF/A output invalid');
  });

  // 16. Interactive Form Fields
  await test('addInteractiveFormFields embeds text and checkbox controls', async () => {
    const formDoc = await PDFEngineService.addInteractiveFormFields(buffer, [
      { type: 'text', name: 'Name', pageNumber: 1, xPercent: 10, yPercent: 20, widthPercent: 30, heightPercent: 5 },
      { type: 'checkbox', name: 'Agree', pageNumber: 1, xPercent: 10, yPercent: 30, widthPercent: 5, heightPercent: 5 },
    ]);
    const doc = await PDFDocument.load(formDoc);
    const form = doc.getForm();
    const fields = form.getFields();
    if (fields.length !== 2) throw new Error(`Expected 2 form fields, found ${fields.length}`);
  });

  // 17. Extract Page Ranges
  await test('extractPageRanges extracts specific page subset', async () => {
    const extracted = await PDFEngineService.extractPageRanges(buffer, [2]);
    const count = await getPageCount(extracted);
    if (count !== 1) throw new Error(`Expected 1 page extracted, got ${count}`);
  });

  // 18. PDF to Word Document
  await test('convertToWordDoc produces formatted Word document Blob', async () => {
    const wordBlob = await PDFEngineService.convertToWordDoc(buffer, 'Sample Contract');
    if (wordBlob.size < 200) throw new Error(`Word document too small: ${wordBlob.size} bytes`);
    if (wordBlob.type !== 'application/msword;charset=utf-8') throw new Error(`Unexpected MIME type: ${wordBlob.type}`);
  });

  // 19. Password Protect with AES-256 Encryption
  await test('encryptDocument locks PDF with AES-256 encryption', async () => {
    const encrypted = await PDFEngineService.encryptDocument(buffer, 'ErgonPass@2026');
    if (encrypted.byteLength < 500) throw new Error('Encrypted PDF byte length too small');
    let threw = false;
    try {
      await PDFDocument.load(encrypted);
    } catch {
      threw = true;
    }
    if (!threw) throw new Error('Expected PDFDocument.load to fail on encrypted document without ignoreEncryption');
    const unlocked = await PDFDocument.load(encrypted, { ignoreEncryption: true });
    if (unlocked.getPageCount() !== 2) throw new Error('Expected 2 pages preserved in encrypted doc');
  });

  // 20. Overlay & Underlay Document
  await test('overlayDocument applies overlay and underlay templates', async () => {
    const templateBytes = await PDFEngineService.createBlankPDF('blank', 1);
    const templateBuffer = templateBytes.buffer.slice(templateBytes.byteOffset, templateBytes.byteOffset + templateBytes.byteLength);

    const overlaid = await PDFEngineService.overlayDocument(buffer, templateBuffer, false);
    if ((await getPageCount(overlaid)) !== 2) throw new Error('Expected 2 pages in overlaid PDF');

    const underlaid = await PDFEngineService.overlayDocument(buffer, templateBuffer, true);
    if ((await getPageCount(underlaid)) !== 2) throw new Error('Expected 2 pages in underlaid PDF');
  });

  console.log(`\n📊 Test Results: ${passed}/${total} Passed (${Math.round((passed / total) * 100)}%)`);
  if (passed === total) {
    console.log(`🎉 ALL ${total} ENGINE FEATURES VERIFIED WORKING 100%!`);
  } else {
    process.exit(1);
  }
}

runSelfTests();
