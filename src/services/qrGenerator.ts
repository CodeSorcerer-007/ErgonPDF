import QRCode from 'qrcode';

/**
 * High-precision, client-side QR Code Generator.
 * Generates ISO/IEC 18004 compliant PNG data URLs without external network dependencies.
 */
export class QRGenerator {
  /**
   * Generates a standard scannable QR Code as an image/png data URL.
   *
   * @param text - The text payload, URL, or string to encode into the QR code.
   * @param size - Width and height of the generated image in pixels (default 256).
   * @returns Promise resolving to a PNG Data URL string (`data:image/png;base64,...`).
   */
  static async generateDataUrl(text: string, size = 256): Promise<string> {
    if (!text || typeof text !== 'string' || text.trim().length === 0) {
      throw new Error('QR text payload must be a non-empty string');
    }
    if (text.length > 2048) {
      throw new Error('QR text payload exceeds maximum supported length of 2048 characters');
    }
    const safeSize = Number.isFinite(size) && size > 0 ? Math.min(2048, Math.max(64, Math.floor(size))) : 256;

    return await QRCode.toDataURL(text, {
      width: safeSize,
      margin: 2,
      errorCorrectionLevel: 'M',
      color: {
        dark: '#000000',
        light: '#ffffff',
      },
    });
  }
}
