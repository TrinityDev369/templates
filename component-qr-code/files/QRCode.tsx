"use client";

/**
 * QRCode — A self-contained QR code generator component using the Canvas API.
 *
 * Implements a simplified but functional QR code encoder (byte mode, versions 1-6,
 * error correction levels L/M/Q/H). Sufficient for URLs, short text, and typical
 * payloads up to ~100 characters depending on EC level.
 *
 * For production use with longer data, complex Kanji, or higher versions,
 * consider swapping the built-in encoder with a library like `qrcode` or `qr.js`.
 */

import {
  useRef,
  useEffect,
  useCallback,
  useImperativeHandle,
  forwardRef,
  type CSSProperties,
} from "react";

/* ------------------------------------------------------------------ */
/*  Public types                                                       */
/* ------------------------------------------------------------------ */

export type ErrorCorrectionLevel = "L" | "M" | "Q" | "H";

export interface QRCodeProps {
  /** The string value to encode in the QR code. */
  value: string;
  /** Width and height of the canvas in CSS pixels. @default 256 */
  size?: number;
  /** Foreground (module) color. @default '#000000' */
  fgColor?: string;
  /** Background color. @default '#ffffff' */
  bgColor?: string;
  /** Error correction level. @default 'M' */
  errorCorrection?: ErrorCorrectionLevel;
  /** Additional CSS class on the canvas element. */
  className?: string;
  /** Additional inline styles on the canvas element. */
  style?: CSSProperties;
  /** Optional URL for a logo image rendered centered on the QR code. */
  logo?: string;
  /** Callback fired after the QR code renders, receiving the data URL. */
  onGenerated?: (dataUrl: string) => void;
}

export interface QRCodeHandle {
  /** Returns the current canvas content as a PNG data URL. */
  getDataURL: () => string | null;
}

/* ------------------------------------------------------------------ */
/*  QR Encoding — Galois Field GF(256) arithmetic                      */
/* ------------------------------------------------------------------ */

const GF_EXP = new Uint8Array(512);
const GF_LOG = new Uint8Array(256);

function initGaloisField(): void {
  let x = 1;
  for (let i = 0; i < 255; i++) {
    GF_EXP[i] = x;
    GF_LOG[x] = i;
    x = x << 1;
    if (x >= 256) x ^= 0x11d; // primitive polynomial for GF(256)
  }
  for (let i = 255; i < 512; i++) {
    GF_EXP[i] = GF_EXP[i - 255];
  }
}

initGaloisField();

function gfMul(a: number, b: number): number {
  if (a === 0 || b === 0) return 0;
  return GF_EXP[GF_LOG[a] + GF_LOG[b]];
}

function gfPolyMul(p: number[], q: number[]): number[] {
  const result = new Array<number>(p.length + q.length - 1).fill(0);
  for (let i = 0; i < p.length; i++) {
    for (let j = 0; j < q.length; j++) {
      result[i + j] ^= gfMul(p[i], q[j]);
    }
  }
  return result;
}

function gfPolyDiv(dividend: number[], divisor: number[]): number[] {
  const result = [...dividend];
  for (let i = 0; i < dividend.length - divisor.length + 1; i++) {
    const coeff = result[i];
    if (coeff !== 0) {
      for (let j = 1; j < divisor.length; j++) {
        result[i + j] ^= gfMul(divisor[j], coeff);
      }
    }
  }
  const remainderStart = dividend.length - divisor.length + 1;
  return result.slice(remainderStart);
}

function generateECPolynomial(ecCount: number): number[] {
  let poly: number[] = [1];
  for (let i = 0; i < ecCount; i++) {
    poly = gfPolyMul(poly, [1, GF_EXP[i]]);
  }
  return poly;
}

function computeECCodewords(data: Uint8Array, ecCount: number): number[] {
  const generator = generateECPolynomial(ecCount);
  const padded = new Array<number>(data.length + ecCount).fill(0);
  for (let i = 0; i < data.length; i++) {
    padded[i] = data[i];
  }
  return gfPolyDiv(padded, generator);
}

/* ------------------------------------------------------------------ */
/*  QR Encoding — Version & capacity tables                            */
/* ------------------------------------------------------------------ */

/**
 * Data codeword capacities for byte mode, versions 1-6.
 * Indexed as EC_CAPACITIES[ecLevel][version-1].
 */
const EC_CAPACITIES: Record<ErrorCorrectionLevel, number[]> = {
  L: [17, 32, 53, 78, 106, 134],
  M: [14, 26, 42, 62, 84, 106],
  Q: [11, 20, 32, 46, 60, 74],
  H: [7, 14, 24, 34, 44, 58],
};

/**
 * Total codewords per version (1-6).
 */
const TOTAL_CODEWORDS = [26, 44, 70, 100, 134, 172];

/**
 * EC codewords per block for each version/EC level.
 * Indexed as EC_CODEWORDS_PER_BLOCK[ecLevel][version-1].
 */
const EC_CODEWORDS_PER_BLOCK: Record<ErrorCorrectionLevel, number[]> = {
  L: [7, 10, 15, 20, 26, 18],
  M: [10, 16, 26, 18, 24, 16],
  Q: [13, 22, 18, 26, 18, 24],
  H: [17, 28, 22, 16, 22, 28],
};

/**
 * Number of EC blocks for each version/EC level.
 * Indexed as EC_BLOCKS[ecLevel][version-1].
 */
const EC_BLOCKS: Record<ErrorCorrectionLevel, number[]> = {
  L: [1, 1, 1, 1, 1, 2],
  M: [1, 1, 1, 2, 2, 4],
  Q: [1, 1, 2, 2, 4, 4],
  H: [1, 1, 2, 4, 4, 4],
};

/**
 * Alignment pattern center coordinates per version. Version 1 has none.
 */
const ALIGNMENT_PATTERNS: number[][] = [
  [],        // v1
  [6, 18],   // v2
  [6, 22],   // v3
  [6, 26],   // v4
  [6, 30],   // v5
  [6, 34],   // v6
];

/* ------------------------------------------------------------------ */
/*  QR Encoding — Data encoding (byte mode)                            */
/* ------------------------------------------------------------------ */

function selectVersion(
  dataLength: number,
  ecLevel: ErrorCorrectionLevel
): number {
  const caps = EC_CAPACITIES[ecLevel];
  for (let v = 0; v < caps.length; v++) {
    if (dataLength <= caps[v]) return v + 1;
  }
  return -1; // data too long
}

function encodeData(
  value: string,
  version: number,
  ecLevel: ErrorCorrectionLevel
): Uint8Array {
  const totalCodewords = TOTAL_CODEWORDS[version - 1];
  const bytes = new TextEncoder().encode(value);

  // Character count indicator bit length for byte mode:
  // versions 1-9 = 8 bits
  const cciBits = 8;

  // Build the bit stream
  const bits: number[] = [];

  function pushBits(val: number, count: number): void {
    for (let i = count - 1; i >= 0; i--) {
      bits.push((val >> i) & 1);
    }
  }

  // Mode indicator: 0100 = byte mode
  pushBits(0b0100, 4);
  // Character count
  pushBits(bytes.length, cciBits);
  // Data bytes
  for (const b of bytes) {
    pushBits(b, 8);
  }
  // Terminator (up to 4 zero bits)
  const maxBits = totalCodewords * 8;
  const terminatorLen = Math.min(4, maxBits - bits.length);
  pushBits(0, terminatorLen);

  // Pad to byte boundary
  while (bits.length % 8 !== 0) {
    bits.push(0);
  }

  // Convert to bytes
  const dataBytes: number[] = [];
  for (let i = 0; i < bits.length; i += 8) {
    let byte = 0;
    for (let j = 0; j < 8; j++) {
      byte = (byte << 1) | (bits[i + j] ?? 0);
    }
    dataBytes.push(byte);
  }

  // Pad with alternating 0xEC / 0x11 to fill capacity
  const padPatterns = [0xec, 0x11];
  let padIdx = 0;
  while (dataBytes.length < totalCodewords - ecCodewordsTotal(version, ecLevel)) {
    dataBytes.push(padPatterns[padIdx % 2]);
    padIdx++;
  }

  return new Uint8Array(dataBytes);
}

function ecCodewordsTotal(
  version: number,
  ecLevel: ErrorCorrectionLevel
): number {
  return (
    EC_CODEWORDS_PER_BLOCK[ecLevel][version - 1] *
    EC_BLOCKS[ecLevel][version - 1]
  );
}

function interleaveBlocks(
  data: Uint8Array,
  version: number,
  ecLevel: ErrorCorrectionLevel
): Uint8Array {
  const numBlocks = EC_BLOCKS[ecLevel][version - 1];
  const ecPerBlock = EC_CODEWORDS_PER_BLOCK[ecLevel][version - 1];
  const totalData = data.length;
  const baseBlockSize = Math.floor(totalData / numBlocks);
  const extraBlocks = totalData % numBlocks;

  // Split data into blocks
  const dataBlocks: Uint8Array[] = [];
  const ecBlocks: number[][] = [];
  let offset = 0;

  for (let b = 0; b < numBlocks; b++) {
    const blockSize = baseBlockSize + (b >= numBlocks - extraBlocks ? 1 : 0);
    const block = data.slice(offset, offset + blockSize);
    dataBlocks.push(block);
    ecBlocks.push(computeECCodewords(block, ecPerBlock));
    offset += blockSize;
  }

  // Interleave data codewords
  const result: number[] = [];
  const maxDataLen = Math.max(...dataBlocks.map((b) => b.length));
  for (let i = 0; i < maxDataLen; i++) {
    for (const block of dataBlocks) {
      if (i < block.length) result.push(block[i]);
    }
  }

  // Interleave EC codewords
  for (let i = 0; i < ecPerBlock; i++) {
    for (const block of ecBlocks) {
      if (i < block.length) result.push(block[i]);
    }
  }

  return new Uint8Array(result);
}

/* ------------------------------------------------------------------ */
/*  QR Encoding — Matrix construction                                  */
/* ------------------------------------------------------------------ */

type Matrix = (number | null)[][];

function matrixSize(version: number): number {
  return 17 + version * 4;
}

function createMatrix(size: number): Matrix {
  return Array.from({ length: size }, () => Array(size).fill(null) as (number | null)[]);
}

function setModule(
  matrix: Matrix,
  row: number,
  col: number,
  value: number
): void {
  if (
    row >= 0 &&
    row < matrix.length &&
    col >= 0 &&
    col < matrix[0].length
  ) {
    matrix[row][col] = value;
  }
}

function placeFinderPattern(
  matrix: Matrix,
  row: number,
  col: number
): void {
  for (let r = -1; r <= 7; r++) {
    for (let c = -1; c <= 7; c++) {
      const rr = row + r;
      const cc = col + c;
      if (rr < 0 || rr >= matrix.length || cc < 0 || cc >= matrix.length)
        continue;

      if (
        r === -1 || r === 7 || c === -1 || c === 7 // separator
      ) {
        setModule(matrix, rr, cc, 0);
      } else if (
        r === 0 || r === 6 || c === 0 || c === 6 // outer border
      ) {
        setModule(matrix, rr, cc, 1);
      } else if (r >= 2 && r <= 4 && c >= 2 && c <= 4) {
        // inner 3x3
        setModule(matrix, rr, cc, 1);
      } else {
        setModule(matrix, rr, cc, 0);
      }
    }
  }
}

function placeAlignmentPattern(
  matrix: Matrix,
  row: number,
  col: number
): void {
  for (let r = -2; r <= 2; r++) {
    for (let c = -2; c <= 2; c++) {
      const rr = row + r;
      const cc = col + c;
      if (matrix[rr]?.[cc] !== null) continue; // don't overwrite existing patterns

      if (
        r === -2 || r === 2 || c === -2 || c === 2 // outer
      ) {
        setModule(matrix, rr, cc, 1);
      } else if (r === 0 && c === 0) {
        setModule(matrix, rr, cc, 1);
      } else {
        setModule(matrix, rr, cc, 0);
      }
    }
  }
}

function placeTimingPatterns(matrix: Matrix): void {
  const size = matrix.length;
  for (let i = 8; i < size - 8; i++) {
    if (matrix[6][i] === null) {
      matrix[6][i] = i % 2 === 0 ? 1 : 0;
    }
    if (matrix[i][6] === null) {
      matrix[i][6] = i % 2 === 0 ? 1 : 0;
    }
  }
}

function reserveFormatArea(matrix: Matrix): void {
  const size = matrix.length;

  // Around top-left finder
  for (let i = 0; i < 9; i++) {
    if (matrix[8][i] === null) matrix[8][i] = 0;
    if (matrix[i][8] === null) matrix[i][8] = 0;
  }

  // Around top-right finder
  for (let i = 0; i < 8; i++) {
    if (matrix[8][size - 1 - i] === null) matrix[8][size - 1 - i] = 0;
  }

  // Around bottom-left finder
  for (let i = 0; i < 7; i++) {
    if (matrix[size - 1 - i][8] === null) matrix[size - 1 - i][8] = 0;
  }

}

function placeDarkModule(matrix: Matrix, version: number): void {
  matrix[4 * version + 9][8] = 1;
}

function placeDataBits(matrix: Matrix, data: Uint8Array): void {
  const size = matrix.length;
  const bits: number[] = [];

  for (const byte of data) {
    for (let i = 7; i >= 0; i--) {
      bits.push((byte >> i) & 1);
    }
  }

  // Add remainder bits (padding) for the matrix
  const totalModules = countDataModules(matrix);
  while (bits.length < totalModules) {
    bits.push(0);
  }

  let bitIndex = 0;
  let upward = true;

  // Traverse columns right to left in pairs, skipping column 6
  for (let right = size - 1; right >= 1; right -= 2) {
    // Skip the vertical timing pattern column
    if (right === 6) right = 5;

    for (let row = 0; row < size; row++) {
      const actualRow = upward ? size - 1 - row : row;

      // Right column of the pair
      if (matrix[actualRow][right] === null) {
        matrix[actualRow][right] = bitIndex < bits.length ? bits[bitIndex] : 0;
        bitIndex++;
      }

      // Left column of the pair
      if (right - 1 >= 0 && matrix[actualRow][right - 1] === null) {
        matrix[actualRow][right - 1] =
          bitIndex < bits.length ? bits[bitIndex] : 0;
        bitIndex++;
      }
    }

    upward = !upward;
  }
}

function countDataModules(matrix: Matrix): number {
  let count = 0;
  const size = matrix.length;
  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      if (matrix[r][c] === null) count++;
    }
  }
  return count;
}

/* ------------------------------------------------------------------ */
/*  QR Encoding — Masking                                              */
/* ------------------------------------------------------------------ */

type MaskFn = (row: number, col: number) => boolean;

const MASK_FUNCTIONS: MaskFn[] = [
  (r, c) => (r + c) % 2 === 0,
  (r) => r % 2 === 0,
  (_r, c) => c % 3 === 0,
  (r, c) => (r + c) % 3 === 0,
  (r, c) => (Math.floor(r / 2) + Math.floor(c / 3)) % 2 === 0,
  (r, c) => ((r * c) % 2) + ((r * c) % 3) === 0,
  (r, c) => (((r * c) % 2) + ((r * c) % 3)) % 2 === 0,
  (r, c) => (((r + c) % 2) + ((r * c) % 3)) % 2 === 0,
];

function applyMask(
  matrix: Matrix,
  reserved: Matrix,
  maskIndex: number
): Matrix {
  const size = matrix.length;
  const masked = matrix.map((row) => [...row]);
  const fn = MASK_FUNCTIONS[maskIndex];

  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      if (reserved[r][c] !== null) continue; // skip reserved modules
      if (fn(r, c)) {
        masked[r][c] = masked[r][c] === 1 ? 0 : 1;
      }
    }
  }

  return masked;
}

function penaltyScore(matrix: Matrix): number {
  const size = matrix.length;
  let penalty = 0;

  // Rule 1: Runs of same color in rows and columns
  for (let r = 0; r < size; r++) {
    let rowRun = 1;
    let colRun = 1;
    for (let c = 1; c < size; c++) {
      if (matrix[r][c] === matrix[r][c - 1]) {
        rowRun++;
      } else {
        if (rowRun >= 5) penalty += rowRun - 2;
        rowRun = 1;
      }
      if (matrix[c][r] === matrix[c - 1][r]) {
        colRun++;
      } else {
        if (colRun >= 5) penalty += colRun - 2;
        colRun = 1;
      }
    }
    if (rowRun >= 5) penalty += rowRun - 2;
    if (colRun >= 5) penalty += colRun - 2;
  }

  // Rule 2: 2x2 blocks of same color
  for (let r = 0; r < size - 1; r++) {
    for (let c = 0; c < size - 1; c++) {
      const val = matrix[r][c];
      if (
        val === matrix[r][c + 1] &&
        val === matrix[r + 1][c] &&
        val === matrix[r + 1][c + 1]
      ) {
        penalty += 3;
      }
    }
  }

  // Rule 3: Finder-like patterns (simplified)
  const pattern1 = [1, 0, 1, 1, 1, 0, 1, 0, 0, 0, 0];
  const pattern2 = [0, 0, 0, 0, 1, 0, 1, 1, 1, 0, 1];
  for (let r = 0; r < size; r++) {
    for (let c = 0; c <= size - 11; c++) {
      let match1 = true;
      let match2 = true;
      let match3 = true;
      let match4 = true;
      for (let k = 0; k < 11; k++) {
        if (matrix[r][c + k] !== pattern1[k]) match1 = false;
        if (matrix[r][c + k] !== pattern2[k]) match2 = false;
        if (matrix[c + k]?.[r] !== pattern1[k]) match3 = false;
        if (matrix[c + k]?.[r] !== pattern2[k]) match4 = false;
      }
      if (match1) penalty += 40;
      if (match2) penalty += 40;
      if (match3) penalty += 40;
      if (match4) penalty += 40;
    }
  }

  // Rule 4: Proportion of dark modules
  let darkCount = 0;
  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      if (matrix[r][c] === 1) darkCount++;
    }
  }
  const total = size * size;
  const percentage = (darkCount / total) * 100;
  const prev5 = Math.floor(percentage / 5) * 5;
  const next5 = prev5 + 5;
  penalty +=
    Math.min(Math.abs(prev5 - 50) / 5, Math.abs(next5 - 50) / 5) * 10;

  return penalty;
}

/* ------------------------------------------------------------------ */
/*  QR Encoding — Format information                                   */
/* ------------------------------------------------------------------ */

const FORMAT_EC_INDICATORS: Record<ErrorCorrectionLevel, number> = {
  L: 0b01,
  M: 0b00,
  Q: 0b11,
  H: 0b10,
};

function computeFormatBits(
  ecLevel: ErrorCorrectionLevel,
  maskIndex: number
): number {
  const data = (FORMAT_EC_INDICATORS[ecLevel] << 3) | maskIndex;

  // BCH(15,5) error correction for format info
  let bits = data << 10;
  const generator = 0b10100110111;
  for (let i = 14; i >= 10; i--) {
    if (bits & (1 << i)) {
      bits ^= generator << (i - 10);
    }
  }
  const formatted = ((data << 10) | bits) ^ 0b101010000010010;
  return formatted;
}

function placeFormatBits(matrix: Matrix, formatBits: number): void {
  const size = matrix.length;

  // Bits 0-7 along the left edge and top edge
  const positions: Array<[number, number]> = [];

  // Horizontal: row 8, columns 0-5, 7, 8
  const hCols = [0, 1, 2, 3, 4, 5, 7, 8];
  for (const c of hCols) {
    positions.push([8, c]);
  }

  // Vertical: column 8, rows 7, 5-0
  const vRows = [7, 5, 4, 3, 2, 1, 0];
  for (const r of vRows) {
    positions.push([r, 8]);
  }

  // Place bits 0-14
  for (let i = 0; i < positions.length && i < 15; i++) {
    const [r, c] = positions[i];
    matrix[r][c] = (formatBits >> i) & 1;
  }

  // Second copy: horizontal along bottom-left and vertical along top-right
  const hPositions2: Array<[number, number]> = [];
  for (let i = 0; i < 7; i++) {
    hPositions2.push([size - 1 - i, 8]);
  }

  const vPositions2: Array<[number, number]> = [];
  for (let i = 0; i < 8; i++) {
    vPositions2.push([8, size - 8 + i]);
  }

  for (let i = 0; i < hPositions2.length; i++) {
    const [r, c] = hPositions2[i];
    matrix[r][c] = (formatBits >> i) & 1;
  }

  for (let i = 0; i < vPositions2.length; i++) {
    const [r, c] = vPositions2[i];
    matrix[r][c] = (formatBits >> (i + 7)) & 1;
  }
}

/* ------------------------------------------------------------------ */
/*  QR Encoding — Full pipeline                                        */
/* ------------------------------------------------------------------ */

function generateQRMatrix(
  value: string,
  ecLevel: ErrorCorrectionLevel
): number[][] {
  if (value.length === 0) {
    // Return a minimal empty matrix for empty input
    return [[0]];
  }

  const version = selectVersion(value.length, ecLevel);
  if (version < 1) {
    // Data too long: return a simple error-indicator pattern (X)
    const size = 21;
    const m = Array.from({ length: size }, () => Array(size).fill(0) as number[]);
    for (let i = 0; i < size; i++) {
      m[i][i] = 1;
      m[i][size - 1 - i] = 1;
    }
    return m;
  }

  const size = matrixSize(version);

  // Encode data
  const data = encodeData(value, version, ecLevel);
  const interleaved = interleaveBlocks(data, version, ecLevel);

  // Build matrix with function patterns
  const matrix = createMatrix(size);

  // Finder patterns (top-left, top-right, bottom-left)
  placeFinderPattern(matrix, 0, 0);
  placeFinderPattern(matrix, 0, size - 7);
  placeFinderPattern(matrix, size - 7, 0);

  // Alignment patterns
  const alignCoords = ALIGNMENT_PATTERNS[version - 1];
  if (alignCoords.length >= 2) {
    for (const r of alignCoords) {
      for (const c of alignCoords) {
        // Skip positions that overlap with finder patterns
        if (r <= 8 && c <= 8) continue;
        if (r <= 8 && c >= size - 8) continue;
        if (r >= size - 8 && c <= 8) continue;
        placeAlignmentPattern(matrix, r, c);
      }
    }
  }

  // Timing patterns
  placeTimingPatterns(matrix);

  // Dark module
  placeDarkModule(matrix, version);

  // Reserve format info areas
  reserveFormatArea(matrix);

  // Snapshot reserved modules (non-null = reserved)
  const reserved = matrix.map((row) =>
    row.map((cell) => (cell !== null ? cell : null))
  );

  // Place data bits
  placeDataBits(matrix, interleaved);

  // Try all 8 masks, pick the one with lowest penalty
  let bestMask = 0;
  let bestPenalty = Infinity;

  for (let m = 0; m < 8; m++) {
    const masked = applyMask(matrix, reserved, m);
    const formatBits = computeFormatBits(ecLevel, m);
    placeFormatBits(masked, formatBits);
    const score = penaltyScore(masked);
    if (score < bestPenalty) {
      bestPenalty = score;
      bestMask = m;
    }
  }

  // Apply winning mask and format info
  const finalMatrix = applyMask(matrix, reserved, bestMask);
  const formatBits = computeFormatBits(ecLevel, bestMask);
  placeFormatBits(finalMatrix, formatBits);

  // Convert null to 0 (should not remain, but safety)
  return finalMatrix.map((row) => row.map((cell) => (cell === null ? 0 : cell)));
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export const QRCode = forwardRef<QRCodeHandle, QRCodeProps>(
  function QRCode(
    {
      value,
      size = 256,
      fgColor = "#000000",
      bgColor = "#ffffff",
      errorCorrection = "M",
      className,
      style,
      logo,
      onGenerated,
    },
    ref
  ) {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    const draw = useCallback(() => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      const dpr = typeof window !== "undefined" ? window.devicePixelRatio || 1 : 1;
      canvas.width = size * dpr;
      canvas.height = size * dpr;
      canvas.style.width = `${size}px`;
      canvas.style.height = `${size}px`;
      ctx.scale(dpr, dpr);

      // Generate the QR matrix
      const matrix = generateQRMatrix(value, errorCorrection);
      const moduleCount = matrix.length;
      const quietZone = 4; // standard 4-module quiet zone
      const totalModules = moduleCount + quietZone * 2;
      const moduleSize = size / totalModules;

      // Fill background
      ctx.fillStyle = bgColor;
      ctx.fillRect(0, 0, size, size);

      // Draw modules
      ctx.fillStyle = fgColor;
      for (let row = 0; row < moduleCount; row++) {
        for (let col = 0; col < moduleCount; col++) {
          if (matrix[row][col] === 1) {
            ctx.fillRect(
              (col + quietZone) * moduleSize,
              (row + quietZone) * moduleSize,
              moduleSize,
              moduleSize
            );
          }
        }
      }

      // Draw logo if provided
      if (logo) {
        const img = new Image();
        img.crossOrigin = "anonymous";
        img.onload = () => {
          const logoSize = size * 0.2; // logo covers ~20% of QR
          const logoX = (size - logoSize) / 2;
          const logoY = (size - logoSize) / 2;

          // White background behind logo for readability
          const padding = logoSize * 0.1;
          ctx.fillStyle = bgColor;
          ctx.fillRect(
            logoX - padding,
            logoY - padding,
            logoSize + padding * 2,
            logoSize + padding * 2
          );

          ctx.drawImage(img, logoX, logoY, logoSize, logoSize);

          // Fire callback after logo is drawn
          onGenerated?.(canvas.toDataURL("image/png"));
        };
        img.onerror = () => {
          // Still fire callback even if logo fails to load
          onGenerated?.(canvas.toDataURL("image/png"));
        };
        img.src = logo;
      } else {
        onGenerated?.(canvas.toDataURL("image/png"));
      }
    }, [value, size, fgColor, bgColor, errorCorrection, logo, onGenerated]);

    useEffect(() => {
      draw();
    }, [draw]);

    useImperativeHandle(
      ref,
      () => ({
        getDataURL(): string | null {
          return canvasRef.current?.toDataURL("image/png") ?? null;
        },
      }),
      []
    );

    return (
      <canvas
        ref={canvasRef}
        className={className}
        style={{
          imageRendering: "pixelated",
          ...style,
        }}
        role="img"
        aria-label={`QR code encoding: ${value}`}
      />
    );
  }
);

QRCode.displayName = "QRCode";

export default QRCode;
