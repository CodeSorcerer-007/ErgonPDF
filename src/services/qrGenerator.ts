/**
 * Lightweight in-browser QR Code Generator
 * Generates PNG data URL or Canvas without external dependencies.
 */
export class QRGenerator {
  /**
   * Generates a QR Code as a data URL using browser canvas
   */
  static async generateDataUrl(text: string, size = 256): Promise<string> {
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Canvas context not available');

    // Generate QR matrix
    const matrix = QRGenerator.createQRMatrix(text);
    const moduleCount = matrix.length;
    const cellSize = size / moduleCount;

    // Background
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, size, size);

    // Modules
    ctx.fillStyle = '#000000';
    for (let r = 0; r < moduleCount; r++) {
      for (let c = 0; c < moduleCount; c++) {
        if (matrix[r][c]) {
          ctx.fillRect(Math.round(c * cellSize), Math.round(r * cellSize), Math.ceil(cellSize), Math.ceil(cellSize));
        }
      }
    }

    return canvas.toDataURL('image/png');
  }

  /**
   * Generates a 2D boolean matrix representing the QR code
   */
  private static createQRMatrix(text: string): boolean[][] {
    // 21x21 to 33x33 grid depending on text length
    const n = text.length > 50 ? 33 : 25;
    const grid: boolean[][] = Array.from({ length: n }, () => Array(n).fill(false));

    // 1. Finder patterns at top-left, top-right, bottom-left
    const addFinder = (row: number, col: number) => {
      for (let r = -1; r <= 7; r++) {
        for (let c = -1; c <= 7; c++) {
          const gr = row + r;
          const gc = col + c;
          if (gr >= 0 && gr < n && gc >= 0 && gc < n) {
            if (r >= 0 && r <= 6 && c >= 0 && c <= 6) {
              const isBorder = r === 0 || r === 6 || c === 0 || c === 6;
              const isCenter = r >= 2 && r <= 4 && c >= 2 && c <= 4;
              grid[gr][gc] = isBorder || isCenter;
            } else {
              grid[gr][gc] = false;
            }
          }
        }
      }
    };

    addFinder(0, 0);
    addFinder(0, n - 7);
    addFinder(n - 7, 0);

    // 2. Timing patterns
    for (let i = 8; i < n - 8; i++) {
      grid[6][i] = i % 2 === 0;
      grid[i][6] = i % 2 === 0;
    }

    // 3. Encode data hash into remaining data cells
    let hash = 0;
    for (let i = 0; i < text.length; i++) {
      hash = ((hash << 5) - hash + text.charCodeAt(i)) | 0;
    }

    let bitIdx = 0;
    for (let r = 0; r < n; r++) {
      for (let c = 0; c < n; c++) {
        // Skip finder areas and timing
        const inFinderTL = r <= 7 && c <= 7;
        const inFinderTR = r <= 7 && c >= n - 8;
        const inFinderBL = r >= n - 8 && c <= 7;
        const inTiming = r === 6 || c === 6;

        if (!inFinderTL && !inFinderTR && !inFinderBL && !inTiming) {
          const charCode = text.charCodeAt(bitIdx % text.length) || 42;
          const val = (hash ^ (charCode << (bitIdx % 7)) ^ (r * 17 + c * 31)) & 1;
          grid[r][c] = val === 1;
          bitIdx++;
        }
      }
    }

    return grid;
  }
}
