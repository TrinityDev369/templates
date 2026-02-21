/**
 * IVM Grid — Isotropic Vector Matrix 2D Projection
 *
 * The IVM's 2D cross-section is an equilateral triangle tessellation:
 * alternating up/down triangles tile the plane with perfect 60-degree
 * coordination. This is the mathematical foundation — hexagonal and
 * other grids derive from grouping these triangles.
 *
 * Uses the tri-cube coordinate system (Boris the Brave):
 *   - Three axes (a, b, c) defined by parallel line families at 60-degree separation
 *   - Constraint: a + b + c = 2 (up triangle) or a + b + c = 1 (down triangle)
 *   - Full D3 symmetry group (3 rotations + 3 reflections)
 *
 * Zero dependencies. Pure math. ~4KB minified.
 *
 * @example
 * ```ts
 * import {
 *   createIvmGrid, coverIvm, resizeIvm,
 *   neighbors, triDistance, disc, ring,
 *   fromPixel, orientation,
 * } from './ivm-grid';
 *
 * // Fill 800x600 with side-length-40 triangles
 * const grid = createIvmGrid({ width: 800, height: 600, sideLength: 40 });
 *
 * // Auto-compute sideLength for ~200 triangles
 * const covered = coverIvm(800, 600, { targetCount: 200 });
 *
 * // Resize preserving density
 * const resized = resizeIvm(covered, 1024, 768);
 *
 * // Hit test: which triangle is at this pixel?
 * const coord = fromPixel(mouseX, mouseY, grid);
 *
 * // Neighborhood queries
 * const adj = neighbors(coord);            // 3 adjacent triangles
 * const area = disc(coord, 3);             // all triangles within radius 3
 * const border = ring(coord, 2);           // all triangles at distance 2
 * ```
 */

// ─── Types ────────────────────────────────────────────────────────────────────

export interface Point {
  x: number;
  y: number;
}

/**
 * Tri-cube coordinate.
 *
 * Three-axis system where:
 *   a + b + c = 2 → up triangle
 *   a + b + c = 1 → down triangle
 */
export interface TriCubeCoord {
  a: number;
  b: number;
  c: number;
}

export type TriOrientation = 'up' | 'down';

export interface TriCell {
  /** Canonical string key `"a,b,c"` */
  id: string;
  coord: TriCubeCoord;
  /** Center in pixel space (origin at grid center) */
  center: Point;
  /** 3 vertices in pixel space, ordered clockwise */
  vertices: [Point, Point, Point];
  orientation: TriOrientation;
  /** 0..1 normalized position within the grid */
  normalizedX: number;
  normalizedY: number;
}

export interface TriEdge {
  from: Point;
  to: Point;
}

export interface IvmGrid {
  cells: TriCell[];
  edges: TriEdge[];
  /** Lookup: coord key → cell index */
  coordIndex: Map<string, number>;
  width: number;
  height: number;
  sideLength: number;
  gap: number;
}

export interface IvmConfig {
  /** Width of the output area in pixels */
  width: number;
  /** Height of the output area in pixels */
  height: number;
  /** Triangle side length in pixels */
  sideLength: number;
  /** Gap between triangles in pixels (default: 0) */
  gap?: number;
  /** Include cells that overlap the boundary (default: true) */
  overflow?: boolean;
}

export interface CoverOptions {
  /** Approximate number of triangles to generate */
  targetCount?: number;
  /** Explicit number of columns */
  columns?: number;
  /** Gap between triangles in pixels (default: 0) */
  gap?: number;
  /** Include overflow cells (default: true) */
  overflow?: boolean;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const SQRT3 = Math.sqrt(3);

// ─── Coordinate System ────────────────────────────────────────────────────────

/** Get the orientation of a tri-cube coordinate. */
export function orientation(coord: TriCubeCoord): TriOrientation {
  return coord.a + coord.b + coord.c === 2 ? 'up' : 'down';
}

/** Validate a tri-cube coordinate (integer axes, sum is 1 or 2). */
export function isValid(coord: TriCubeCoord): boolean {
  const sum = coord.a + coord.b + coord.c;
  return (
    Number.isInteger(coord.a) &&
    Number.isInteger(coord.b) &&
    Number.isInteger(coord.c) &&
    (sum === 1 || sum === 2)
  );
}

/** Canonical string key for a coordinate. */
export function coordKey(coord: TriCubeCoord): string {
  return `${coord.a},${coord.b},${coord.c}`;
}

// ─── Axial ↔ Tri-Cube Conversions ─────────────────────────────────────────────

/** Convert axial (row, col) to tri-cube. Row+col parity determines orientation. */
export function fromAxial(row: number, col: number): TriCubeCoord {
  const isUp = (row + col) % 2 === 0;
  const a = row + 1;
  const b = isUp ? (col - row) / 2 + 1 : (col - row + 1) / 2;
  const c = (isUp ? 2 : 1) - a - b;
  return { a, b, c };
}

/** Convert tri-cube to axial (row, col). */
export function toAxial(coord: TriCubeCoord): { row: number; col: number } {
  const { a, b } = coord;
  const sum = a + b + coord.c;
  const isDown = sum === 1;
  const row = a - 1;
  const col = isDown ? 2 * b - 1 + row : 2 * (b - 1) + row;
  return { row, col };
}

// ─── Pixel Conversions (Boris the Brave) ──────────────────────────────────────

/**
 * Tri-cube coordinate to pixel center.
 *
 * Uses Boris the Brave's direct formula:
 *   x = (0.5*a - 0.5*c) * sideLength
 *   y = (-√3/6*a + √3/3*b - √3/6*c) * sideLength  (math y-up)
 *
 * Y is negated for screen coordinates (y-down).
 */
export function toPixel(coord: TriCubeCoord, sideLength: number): Point {
  const { a, b, c } = coord;
  return {
    x: (0.5 * a - 0.5 * c) * sideLength,
    y: (SQRT3 / 6 * a - SQRT3 / 3 * b + SQRT3 / 6 * c) * sideLength,
  };
}

/**
 * Pick the triangle containing a pixel point.
 *
 * Boris the Brave's inverse formula (adjusted for screen y-down):
 *   a = ceil(( x + √3/3 * y) / sideLength)
 *   b = floor(-√3*2/3 * y / sideLength) + 1
 *   c = ceil((-x + √3/3 * y) / sideLength)
 */
export function fromPixel(
  x: number,
  y: number,
  sideLength: number,
): TriCubeCoord {
  return {
    a: Math.ceil((x + SQRT3 / 3 * y) / sideLength),
    b: Math.floor(-SQRT3 * 2 / 3 * y / sideLength) + 1,
    c: Math.ceil((-x + SQRT3 / 3 * y) / sideLength),
  };
}

/**
 * Pick the triangle at a pixel position within a grid.
 *
 * Adjusts for the grid's center-origin offset.
 */
export function pickTriangle(
  px: number,
  py: number,
  grid: IvmGrid,
): TriCubeCoord {
  const x = px - grid.width / 2;
  const y = py - grid.height / 2;
  return fromPixel(x, y, grid.sideLength + grid.gap);
}

// ─── Triangle Vertices ────────────────────────────────────────────────────────

/**
 * Compute the 3 vertices of a triangle at the given center.
 *
 * Up triangles: apex at top, base at bottom.
 * Down triangles: apex at bottom, base at top.
 */
export function triangleVertices(
  center: Point,
  sideLength: number,
  orient: TriOrientation,
): [Point, Point, Point] {
  const h = (sideLength * SQRT3) / 2;
  const halfSide = sideLength / 2;

  if (orient === 'up') {
    return [
      { x: center.x, y: center.y - h * 2 / 3 },         // top apex
      { x: center.x - halfSide, y: center.y + h / 3 },   // bottom-left
      { x: center.x + halfSide, y: center.y + h / 3 },   // bottom-right
    ];
  } else {
    return [
      { x: center.x, y: center.y + h * 2 / 3 },         // bottom apex
      { x: center.x + halfSide, y: center.y - h / 3 },   // top-right
      { x: center.x - halfSide, y: center.y - h / 3 },   // top-left
    ];
  }
}

// ─── Neighbors ────────────────────────────────────────────────────────────────

/**
 * Get the 3 neighboring triangle coordinates.
 *
 * Up triangles (sum=2): subtract 1 from each axis.
 * Down triangles (sum=1): add 1 to each axis.
 */
export function neighbors(coord: TriCubeCoord): TriCubeCoord[] {
  const sum = coord.a + coord.b + coord.c;
  if (sum === 2) {
    return [
      { a: coord.a - 1, b: coord.b, c: coord.c },
      { a: coord.a, b: coord.b - 1, c: coord.c },
      { a: coord.a, b: coord.b, c: coord.c - 1 },
    ];
  } else {
    return [
      { a: coord.a + 1, b: coord.b, c: coord.c },
      { a: coord.a, b: coord.b + 1, c: coord.c },
      { a: coord.a, b: coord.b, c: coord.c + 1 },
    ];
  }
}

/** Manhattan-style distance between two tri-cube coordinates. */
export function triDistance(a: TriCubeCoord, b: TriCubeCoord): number {
  return Math.abs(a.a - b.a) + Math.abs(a.b - b.b) + Math.abs(a.c - b.c);
}

/** All triangles within `radius` steps of `center`. */
export function disc(center: TriCubeCoord, radius: number): TriCubeCoord[] {
  const results: TriCubeCoord[] = [];
  for (let da = -radius; da <= radius; da++) {
    for (let db = -radius; db <= radius; db++) {
      for (const sum of [1, 2]) {
        const candidate: TriCubeCoord = {
          a: center.a + da,
          b: center.b + db,
          c: sum - (center.a + da) - (center.b + db),
        };
        if (candidate.a + candidate.b + candidate.c !== sum) continue;
        if (triDistance(center, candidate) <= radius) {
          results.push(candidate);
        }
      }
    }
  }
  return results;
}

/** All triangles at exactly `radius` steps from `center`. */
export function ring(center: TriCubeCoord, radius: number): TriCubeCoord[] {
  if (radius === 0) return [center];
  return disc(center, radius).filter(c => triDistance(center, c) === radius);
}

// ─── D₃ Symmetry Group ───────────────────────────────────────────────────────

/** Rotate 120° counterclockwise: (a,b,c) → (c,a,b) */
export function rotate120(coord: TriCubeCoord): TriCubeCoord {
  return { a: coord.c, b: coord.a, c: coord.b };
}

/** Rotate 240° counterclockwise: (a,b,c) → (b,c,a) */
export function rotate240(coord: TriCubeCoord): TriCubeCoord {
  return { a: coord.b, b: coord.c, c: coord.a };
}

/** Reflect across the a-axis: swap b ↔ c */
export function reflectA(coord: TriCubeCoord): TriCubeCoord {
  return { a: coord.a, b: coord.c, c: coord.b };
}

/** Reflect across the b-axis: swap a ↔ c */
export function reflectB(coord: TriCubeCoord): TriCubeCoord {
  return { a: coord.c, b: coord.b, c: coord.a };
}

/** Reflect across the c-axis: swap a ↔ b */
export function reflectC(coord: TriCubeCoord): TriCubeCoord {
  return { a: coord.b, b: coord.a, c: coord.c };
}

/** All 6 elements of the D₃ symmetry group. */
export const SYMMETRIES: ((coord: TriCubeCoord) => TriCubeCoord)[] = [
  c => c, // identity
  rotate120,
  rotate240,
  reflectA,
  reflectB,
  reflectC,
];

// ─── Grid Generation ──────────────────────────────────────────────────────────

/**
 * Generate an IVM grid filling the given pixel area.
 *
 * Origin is at the center of the output area. Iterates axial (row, col)
 * to cover the viewport, converts each to tri-cube via fromAxial(),
 * and computes pixel positions with the center offset.
 */
export function createIvmGrid(config: IvmConfig): IvmGrid {
  const { width, height, sideLength, gap = 0, overflow = true } = config;

  const effectiveSide = sideLength + gap;
  const h = effectiveSide * SQRT3 / 2;
  const halfCol = effectiveSide / 2;
  const halfW = width / 2;
  const halfH = height / 2;

  // Axial ranges to cover viewport with padding
  const pad = overflow ? 1 : 0;
  const rowMin = Math.floor(-halfH / h) - pad;
  const rowMax = Math.ceil(halfH / h) + pad;
  const colMin = Math.floor(-halfW / halfCol) - pad;
  const colMax = Math.ceil(halfW / halfCol) + pad;

  // Safety cap: ~2.5x the theoretical triangle count
  const triArea = effectiveSide * effectiveSide * SQRT3 / 4;
  const cap = Math.ceil(width * height / triArea * 2.5);

  const cells: TriCell[] = [];
  const coordIndex = new Map<string, number>();
  const edgeSet = new Set<string>();
  const edges: TriEdge[] = [];

  let index = 0;

  for (let row = rowMin; row <= rowMax && index < cap; row++) {
    for (let col = colMin; col <= colMax && index < cap; col++) {
      const coord = fromAxial(row, col);
      const isUp = (row + col) % 2 === 0;
      const orient: TriOrientation = isUp ? 'up' : 'down';

      // Pixel position: center-origin
      const cx = halfW + col * halfCol;
      const cy = halfH + row * h + (isUp ? h * 2 / 3 : h / 3);

      // Skip cells too far outside viewport
      if (!overflow) {
        if (cx < -sideLength || cx > width + sideLength) continue;
        if (cy < -sideLength || cy > height + sideLength) continue;
      }

      const center: Point = { x: cx, y: cy };
      const verts = triangleVertices(center, sideLength, orient);
      const key = coordKey(coord);

      coordIndex.set(key, index);
      cells.push({
        id: key,
        coord,
        center,
        vertices: verts,
        orientation: orient,
        normalizedX: cx / width,
        normalizedY: cy / height,
      });

      // Collect unique edges
      for (let i = 0; i < 3; i++) {
        const from = verts[i];
        const to = verts[(i + 1) % 3];
        const ek = canonicalEdgeKey(from, to);
        if (!edgeSet.has(ek)) {
          edgeSet.add(ek);
          edges.push({ from, to });
        }
      }

      index++;
    }
  }

  return { cells, edges, coordIndex, width, height, sideLength, gap };
}

// ─── Cover & Resize ───────────────────────────────────────────────────────────

/**
 * Auto-compute sideLength to fill width × height with triangles.
 *
 * - `targetCount`: approximate number of triangles (default: 200)
 * - `columns`: explicit column count (overrides targetCount)
 */
export function coverIvm(
  width: number,
  height: number,
  opts: CoverOptions = {},
): IvmGrid {
  const { targetCount = 200, columns, gap = 0, overflow = true } = opts;

  let sideLength: number;

  if (columns != null && columns > 0) {
    // Each column is halfSide wide → total width ≈ columns * halfSide
    sideLength = (width * 2) / columns - gap;
  } else {
    // Area of one equilateral triangle = (√3/4) * side²
    // Total area ≈ targetCount * triArea → solve for side
    const totalArea = width * height;
    const triArea = totalArea / targetCount;
    sideLength = Math.sqrt((4 * triArea) / SQRT3) - gap;
  }

  // Clamp to reasonable range
  sideLength = Math.max(4, Math.min(sideLength, Math.min(width, height)));

  return createIvmGrid({ width, height, sideLength, gap, overflow });
}

/**
 * Resize an existing grid to new dimensions, preserving sideLength and gap.
 */
export function resizeIvm(grid: IvmGrid, width: number, height: number): IvmGrid {
  return createIvmGrid({
    width,
    height,
    sideLength: grid.sideLength,
    gap: grid.gap,
  });
}

// ─── Internal Helpers ─────────────────────────────────────────────────────────

function canonicalEdgeKey(a: Point, b: Point): string {
  const ax = Math.round(a.x * 100);
  const ay = Math.round(a.y * 100);
  const bx = Math.round(b.x * 100);
  const by = Math.round(b.y * 100);
  return ax < bx || (ax === bx && ay < by)
    ? `${ax},${ay}-${bx},${by}`
    : `${bx},${by}-${ax},${ay}`;
}
