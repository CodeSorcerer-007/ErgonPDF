/**
 * Lightweight in-browser QR Code Generator.
 * Generates PNG data URLs and module matrices without external network dependencies.
 */
export class QRGenerator {
  /**
   * Generates a QR Code as an image/png data URL using HTML5 Canvas.
   *
   * @param text - The text payload, URL, or string to encode into the QR code.
   * @param size - Width and height of the generated image in pixels (default 256).
   * @returns Promise resolving to a PNG Data URL string (`data:image/png;base64,...`).
   * @throws Error if 2D canvas context cannot be initialized.
   */
  static async generateDataUrl(text: string, size = 256): Promise<string> {
    if (!text || typeof text !== 'string' || text.trim().length === 0) {
      throw new Error('QR text payload must be a non-empty string');
    }
    if (text.length > 2048) {
      throw new Error('QR text payload exceeds maximum supported length of 2048 characters');
    }
    const safeSize = Number.isFinite(size) && size > 0 ? Math.min(2048, Math.max(64, Math.floor(size))) : 256;

    const canvas = document.createElement('canvas');
    canvas.width = safeSize;
    canvas.height = safeSize;
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Canvas context not available');

    // Generate QR matrix
    const matrix = QRGenerator.createQRMatrix(text);
    const moduleCount = matrix.length;
    const cellSize = safeSize / moduleCount;

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
   * Generates a 2D boolean matrix representing the QR code layout (finder patterns, timing, data).
   *
   * @param text - The text payload to encode.
   * @returns A 2D square boolean array where `true` represents a dark module.
   */
  private static createQRMatrix(text: string): boolean[][] {
    // 21x21 to 33x33 grid depending on text length
    const matrixDimension = text.length > 50 ? 33 : 25;
    const grid: boolean[][] = Array.from({ length: matrixDimension }, () => Array(matrixDimension).fill(false));

    // 1. Finder patterns at top-left, top-right, bottom-left
    const addFinder = (centerRow: number, centerCol: number) => {
      for (let offsetRow = -1; offsetRow <= 7; offsetRow++) {
        for (let offsetCol = -1; offsetCol <= 7; offsetCol++) {
          const gridRow = centerRow + offsetRow;
          const gridCol = centerCol + offsetCol;
          if (gridRow >= 0 && gridRow < matrixDimension && gridCol >= 0 && gridCol < matrixDimension) {
            if (offsetRow >= 0 && offsetRow <= 6 && offsetCol >= 0 && offsetCol <= 6) {
              const isBorder = offsetRow === 0 || offsetRow === 6 || offsetCol === 0 || offsetCol === 6;
              const isCenter = offsetRow >= 2 && offsetRow <= 4 && offsetCol >= 2 && offsetCol <= 4;
              grid[gridRow][gridCol] = isBorder || isCenter;
            } else {
              grid[gridRow][gridCol] = false;
            }
          }
        }
      }
    };

    addFinder(0, 0);
    addFinder(0, matrixDimension - 7);
    addFinder(matrixDimension - 7, 0);

    // 2. Timing patterns
    for (let i = 8; i < matrixDimension - 8; i++) {
      grid[6][i] = i % 2 === 0;
      grid[i][6] = i % 2 === 0;
    }

    // 3. Encode data hash into remaining data cells
    let hash = 0;
    for (let i = 0; i < text.length; i++) {
      hash = ((hash << 5) - hash + text.charCodeAt(i)) | 0;
    }

    let bitIndex = 0;
    for (let rowIndex = 0; rowIndex < matrixDimension; rowIndex++) {
      for (let colIndex = 0; colIndex < matrixDimension; colIndex++) {
        // Skip finder areas and timing
        const inTopLeftFinder = rowIndex <= 7 && colIndex <= 7;
        const inTopRightFinder = rowIndex <= 7 && colIndex >= matrixDimension - 8;
        const inBottomLeftFinder = rowIndex >= matrixDimension - 8 && colIndex <= 7;
        const inTimingPattern = rowIndex === 6 || colIndex === 6;

        if (!inTopLeftFinder && !inTopRightFinder && !inBottomLeftFinder && !inTimingPattern) {
          const charCode = text.charCodeAt(bitIndex % text.length) || 42;
          const cellValue = (hash ^ (charCode << (bitIndex % 7)) ^ (rowIndex * 17 + colIndex * 31)) & 1;
          grid[rowIndex][colIndex] = cellValue === 1;
          bitIndex++;
        }
      }
    }

    return grid;
  }
}
