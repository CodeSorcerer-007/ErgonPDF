import { createWorker } from 'tesseract.js';

export interface OCRResult {
  text: string;
  confidence: number;
}

export class OCRService {
  /**
   * Performs optical character recognition on an image or rendered PDF canvas.
   * Completely local in the browser via Web Workers without network leakage.
   */
  static async recognizeImage(
    imageSource: string | Blob,
    language = 'eng',
    onProgress?: (status: string, progress: number) => void
  ): Promise<OCRResult> {
    const worker = await createWorker(language);

    if (onProgress) {
      onProgress('Initializing OCR engine…', 0.2);
    }

    try {
      const ret = await worker.recognize(imageSource);
      if (onProgress) {
        onProgress('Text recognition complete', 1.0);
      }
      return {
        text: ret.data.text,
        confidence: ret.data.confidence,
      };
    } finally {
      await worker.terminate();
    }
  }
}
