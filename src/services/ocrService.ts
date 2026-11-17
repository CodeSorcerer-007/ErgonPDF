import { createWorker, OEM } from 'tesseract.js';

export interface OCRResult {
  text: string;
  confidence: number;
}

export class OCRService {
  /**
   * Performs optical character recognition on an image or rendered PDF canvas.
   * Completely local in the browser via Web Workers without network leakage.
   * Configured with local worker scripts and offline trained models.
   */
  static async recognizeImage(
    imageSource: string | Blob,
    language = 'eng',
    onProgress?: (status: string, progress: number) => void
  ): Promise<OCRResult> {
    const isBrowser = typeof window !== 'undefined';
    const workerOptions = isBrowser
      ? {
          workerPath: '/tesseract/worker.min.js',
          corePath: '/tesseract/tesseract-core-simd-lstm.wasm',
          langPath: '/tesseract/tessdata',
          gzip: true,
          logger: (m: { status?: string; progress?: number }) => {
            if (onProgress && m.progress !== undefined) {
              onProgress(m.status || 'Processing OCR…', m.progress);
            }
          },
        }
      : {
          logger: (m: { status?: string; progress?: number }) => {
            if (onProgress && m.progress !== undefined) {
              onProgress(m.status || 'Processing OCR…', m.progress);
            }
          },
        };

    const worker = await createWorker(language, OEM.LSTM_ONLY, workerOptions);

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
