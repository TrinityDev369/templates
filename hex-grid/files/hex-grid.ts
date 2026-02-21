/**
 * Hex Grid — Hexagonal grid derived from IVM principles
 *
 * Hexagons emerge naturally from the IVM's triangle tessellation:
 * group 6 triangles around each vertex and the hex lattice appears.
 * This module provides the hexagonal layer with proper cube coordinate
 * math (q + r + s = 0), both orientations, hit testing, and smart
 * cover/resize functions.
 *
 * Coordinate system follows Red Blob Games' conventions:
 *   - Axial: (q, r) — compact 2-axis form
 *   - Cube:  (q, r, s) where q + r + s = 0 — enables clean distance/neighbor math
 *
 * Zero dependencies. Pure math. ~4KB minified.
 *
 * @example
 * ```ts
 * import {
 *   createHexGrid, coverHex, resizeHex,
 *   pixelToHex, hexNeighbors, hexDistance, hexRing, hexSpiral,
 * } from './hex-grid';
 *
 * // Fill 800x600 with cellSize-30 hexagons
 * const grid = createHexGrid({ width: 800, height: 600, cellSize: 30 });
 *
 * // Auto-compute cellSize to cover container
 * const covered = coverHex(800, 600, { targetCount: 80 });
 *
 * // Which hex did the user click?
 * const coord = pixelToHex(mouseX, mouseY, grid);
 *
 * // Resize on window change
 * const resized = resizeHex(grid, newWidth, newHeight);
 *
 * // Spatial queries
 * const adj = hexNeighbors({ q: 0, r: 0 });     // 6 adjacent hexes
 * const area = hexSpiral({ q: 0, r: 0 }, 3);     // all hexes within radius 3
 * const border = hexRing({ q: 0, r: 0 }, 2);     // all hexes at distance 2
 * const path = hexLine({ q: 0, r: 0 }, { q: 3, r: -2 });  // hex line
 * ```
 */

// ─── Types ────────────────────────────────────────────────────────────────────

export interface Point {
  x: number;
  y: number;
}

/** Axial hex coordinate (compact 2-axis form). */
export interface Axial {
  q: number;
  r: number;
}

/** Cube hex coordinate. Constraint: q + r + s = 0. */
export interface Cube {
  q: number;
  r: number;
  s: number;
}

export type HexOrientation = 'flat-top' | 'pointy-top';

export interface HexCell {
  /** Canonical string key `"q,r"` */
  id: string;
  coord: Axial;
  /** Center in pixel space */
  center: Point;
  /** 6 vertices in pixel space, ordered clockwise */
  vertices: Point[];
  /** 0..1 normalized position within the grid */
  normalizedX: number;
  normalizedY: number;
}

export interface HexEdge {
  from: Point;
  to: Point;
}

export interface HexGrid {
  cells: HexCell[];
  edges: HexEdge[];
  /** Lookup: coord key → cell index */
  coordIndex: Map<string, number>;
  width: number;
  height: number;
  cellSize: number;
  orientation: HexOrientation;
}

export interface HexConfig {
  /** Width of the output area in pixels */
  width: number;
  /** Height of the output area in pixels */
  height: number;
  /** Hex cell size (center to vertex distance) */
  cellSize: number;
  /** Flat-top or pointy-top orientation (default: 'flat-top') */
  orientation?: HexOrientation;
  /** Include cells that overlap the boundary (default: true) */
  overflow?: boolean;
}

export interface CoverOptions {
  /** Approximate number of hexagons to generate */
  targetCount?: number;
  /** Explicit number of columns */
  columns?: number;
  /** Hex orientation (default: 'flat-top') */
  orientation?: HexOrientation;
  /** Include overflow cells (default: true) */
  overflow?: boolean;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const SQRT3 = Math.sqrt(3);

// ─── Orientation Matrices ─────────────────────────────────────────────────────
// Encode hex→pixel and pixel→hex transforms for both orientations.
// See https://www.redblobgames.com/grids/hexagons/ for derivation.

interface OrientationMatrix {
  f0: number; f1: number; f2: number; f3: number; // forward (hex→pixel)
  b0: number; b1: number; b2: number; b3: number; // backward (pixel→hex)
  startAngle: number; // angle of first vertex
}

const FLAT_TOP: OrientationMatrix = {
  f0: 3 / 2,        f1: 0,
  f2: SQRT3 / 2,    f3: SQRT3,
  b0: 2 / 3,        b1: 0,
  b2: -1 / 3,       b3: SQRT3 / 3,
  startAngle: 0,
};

const POINTY_TOP: OrientationMatrix = {
  f0: SQRT3,        f1: SQRT3 / 2,
  f2: 0,            f3: 3 / 2,
  b0: SQRT3 / 3,    b1: -1 / 3,
  b2: 0,            b3: 2 / 3,
  startAngle: 0.5,  // offset by 30°
};

function getMatrix(orient: HexOrientation): OrientationMatrix {
  return orient === 'flat-top' ? FLAT_TOP : POINTY_TOP;
}

// ─── Coordinate Conversions ───────────────────────────────────────────────────

/** Axial → Cube. Computes s = -q - r. */
export function axialToCube(coord: Axial): Cube {
  return { q: coord.q, r: coord.r, s: -coord.q - coord.r };
}

/** Cube → Axial. Drops the s component. */
export function cubeToAxial(coord: Cube): Axial {
  return { q: coord.q, r: coord.r };
}

/** Round fractional cube coordinates to the nearest integer hex. */
export function cubeRound(frac: Cube): Cube {
  let q = Math.round(frac.q);
  let r = Math.round(frac.r);
  let s = Math.round(frac.s);

  const dq = Math.abs(q - frac.q);
  const dr = Math.abs(r - frac.r);
  const ds = Math.abs(s - frac.s);

  if (dq > dr && dq > ds) {
    q = -r - s;
  } else if (dr > ds) {
    r = -q - s;
  } else {
    s = -q - r;
  }

  return { q, r, s };
}

/** Canonical string key for a hex coordinate. */
export function hexKey(coord: Axial): string {
  return `${coord.q},${coord.r}`;
}

// ─── Hex ↔ Pixel Conversions ──────────────────────────────────────────────────

/** Convert axial coordinate to pixel center. */
export function hexToPixel(
  coord: Axial,
  size: number,
  orient: HexOrientation = 'flat-top',
): Point {
  const m = getMatrix(orient);
  return {
    x: size * (m.f0 * coord.q + m.f1 * coord.r),
    y: size * (m.f2 * coord.q + m.f3 * coord.r),
  };
}

/** Convert pixel position to the nearest axial hex coordinate. */
export function pixelToAxial(
  point: Point,
  size: number,
  orient: HexOrientation = 'flat-top',
): Axial {
  const m = getMatrix(orient);
  const q = (m.b0 * point.x + m.b1 * point.y) / size;
  const r = (m.b2 * point.x + m.b3 * point.y) / size;
  return cubeToAxial(cubeRound({ q, r, s: -q - r }));
}

/**
 * Pick the hex at a pixel position within a grid.
 * Adjusts for the grid's center-origin offset.
 */
export function pixelToHex(px: number, py: number, grid: HexGrid): Axial {
  return pixelToAxial(
    { x: px - grid.width / 2, y: py - grid.height / 2 },
    grid.cellSize,
    grid.orientation,
  );
}

// ─── Hex Vertices ─────────────────────────────────────────────────────────────

/** Get the 6 vertices of a hex cell, ordered clockwise. */
export function hexVertices(
  center: Point,
  size: number,
  orient: HexOrientation = 'flat-top',
): Point[] {
  const m = getMatrix(orient);
  const vertices: Point[] = [];
  for (let i = 0; i < 6; i++) {
    const angle = (2 * Math.PI * (i + m.startAngle)) / 6;
    vertices.push({
      x: center.x + size * Math.cos(angle),
      y: center.y + size * Math.sin(angle),
    });
  }
  return vertices;
}

// ─── Neighbors ────────────────────────────────────────────────────────────────

const AXIAL_DIRECTIONS: Axial[] = [
  { q: 1, r: 0 },  { q: 1, r: -1 }, { q: 0, r: -1 },
  { q: -1, r: 0 }, { q: -1, r: 1 }, { q: 0, r: 1 },
];

/** Get the 6 neighboring hex coordinates. */
export function hexNeighbors(coord: Axial): Axial[] {
  return AXIAL_DIRECTIONS.map(d => ({
    q: coord.q + d.q,
    r: coord.r + d.r,
  }));
}

// ─── Distance ─────────────────────────────────────────────────────────────────

/** Hex grid distance between two axial coordinates. */
export function hexDistance(a: Axial, b: Axial): number {
  return (
    Math.abs(a.q - b.q) +
    Math.abs(a.q + a.r - b.q - b.r) +
    Math.abs(a.r - b.r)
  ) / 2;
}

// ─── Ring & Spiral ────────────────────────────────────────────────────────────

/**
 * All hexes at exactly `radius` steps from `center`.
 * Returns them in order, walking the ring clockwise.
 */
export function hexRing(center: Axial, radius: number): Axial[] {
  if (radius === 0) return [center];

  const results: Axial[] = [];
  // Start at the hex `radius` steps in direction 4 (bottom-left)
  let hex: Axial = {
    q: center.q + AXIAL_DIRECTIONS[4].q * radius,
    r: center.r + AXIAL_DIRECTIONS[4].r * radius,
  };

  for (let side = 0; side < 6; side++) {
    for (let step = 0; step < radius; step++) {
      results.push(hex);
      hex = {
        q: hex.q + AXIAL_DIRECTIONS[side].q,
        r: hex.r + AXIAL_DIRECTIONS[side].r,
      };
    }
  }

  return results;
}

/**
 * All hexes within `radius` steps of `center` (inclusive).
 * Returns center first, then ring 1, ring 2, etc.
 */
export function hexSpiral(center: Axial, radius: number): Axial[] {
  const results: Axial[] = [center];
  for (let r = 1; r <= radius; r++) {
    results.push(...hexRing(center, r));
  }
  return results;
}

// ─── Hex Line ─────────────────────────────────────────────────────────────────

/** All hexes along a line from `a` to `b`, inclusive. */
export function hexLine(a: Axial, b: Axial): Axial[] {
  const dist = hexDistance(a, b);
  if (dist === 0) return [a];

  const results: Axial[] = [];
  const aCube = axialToCube(a);
  const bCube = axialToCube(b);

  for (let i = 0; i <= dist; i++) {
    const t = i / dist;
    const frac: Cube = {
      q: aCube.q + (bCube.q - aCube.q) * t,
      r: aCube.r + (bCube.r - aCube.r) * t,
      s: aCube.s + (bCube.s - aCube.s) * t,
    };
    results.push(cubeToAxial(cubeRound(frac)));
  }

  return results;
}

// ─── Grid Generation ──────────────────────────────────────────────────────────

/**
 * Generate a hexagonal grid filling the given pixel area.
 *
 * Origin is at the center of the output area. Produces complete geometry
 * (cells with vertices, unique edges) ready for rendering.
 */
export function createHexGrid(config: HexConfig): HexGrid {
  const {
    width,
    height,
    cellSize,
    orientation = 'flat-top',
    overflow = true,
  } = config;

  const cells: HexCell[] = [];
  const coordIndex = new Map<string, number>();
  const edgeSet = new Set<string>();
  const edges: HexEdge[] = [];

  const margin = overflow ? 1 : 0;
  const { qMin, qMax, rMin, rMax } = computeBounds(
    width, height, cellSize, orientation, margin,
  );

  let index = 0;
  for (let q = qMin; q <= qMax; q++) {
    for (let r = rMin; r <= rMax; r++) {
      const center = hexToPixel({ q, r }, cellSize, orientation);

      // Shift so grid origin is at center of output area
      const shifted: Point = {
        x: center.x + width / 2,
        y: center.y + height / 2,
      };

      // Skip cells outside visible area (with cellSize margin)
      if (
        shifted.x < -cellSize || shifted.x > width + cellSize ||
        shifted.y < -cellSize || shifted.y > height + cellSize
      ) continue;

      const verts = hexVertices(shifted, cellSize, orientation);
      const key = hexKey({ q, r });

      coordIndex.set(key, index);
      cells.push({
        id: key,
        coord: { q, r },
        center: shifted,
        vertices: verts,
        normalizedX: shifted.x / width,
        normalizedY: shifted.y / height,
      });

      // Collect unique edges
      for (let i = 0; i < 6; i++) {
        const from = verts[i];
        const to = verts[(i + 1) % 6];
        const ek = canonicalEdgeKey(from, to);
        if (!edgeSet.has(ek)) {
          edgeSet.add(ek);
          edges.push({ from, to });
        }
      }

      index++;
    }
  }

  return { cells, edges, coordIndex, width, height, cellSize, orientation };
}

// ─── Cover & Resize ───────────────────────────────────────────────────────────

/**
 * Auto-compute cellSize to fill width × height with hexagons.
 *
 * - `targetCount`: approximate number of hexagons (default: 80)
 * - `columns`: explicit column count (overrides targetCount)
 */
export function coverHex(
  width: number,
  height: number,
  opts: CoverOptions = {},
): HexGrid {
  const {
    targetCount = 80,
    columns,
    orientation = 'flat-top',
    overflow = true,
  } = opts;

  let cellSize: number;

  if (columns != null && columns > 0) {
    // Compute cellSize from desired column count
    if (orientation === 'flat-top') {
      // Horizontal spacing = 3/2 * size → size = width / (3/2 * columns)
      cellSize = width / (1.5 * columns);
    } else {
      // Horizontal spacing = √3 * size → size = width / (√3 * columns)
      cellSize = width / (SQRT3 * columns);
    }
  } else {
    // Area of one hex = (3√3/2) * size²
    // Total area ≈ targetCount * hexArea → solve for size
    const totalArea = width * height;
    const hexArea = totalArea / targetCount;
    cellSize = Math.sqrt((2 * hexArea) / (3 * SQRT3));
  }

  // Clamp to reasonable range
  cellSize = Math.max(4, Math.min(cellSize, Math.min(width, height) / 2));

  return createHexGrid({ width, height, cellSize, orientation, overflow });
}

/**
 * Resize an existing grid to new dimensions, preserving cellSize and orientation.
 */
export function resizeHex(grid: HexGrid, width: number, height: number): HexGrid {
  return createHexGrid({
    width,
    height,
    cellSize: grid.cellSize,
    orientation: grid.orientation,
  });
}

// ─── Internal Helpers ─────────────────────────────────────────────────────────

function computeBounds(
  width: number,
  height: number,
  size: number,
  orient: HexOrientation,
  margin: number,
): { qMin: number; qMax: number; rMin: number; rMax: number } {
  const halfW = width / 2;
  const halfH = height / 2;

  let qRange: number;
  let rRange: number;

  if (orient === 'flat-top') {
    qRange = Math.ceil(halfW / (1.5 * size)) + margin;
    rRange = Math.ceil(halfH / (SQRT3 * size)) + margin;
  } else {
    qRange = Math.ceil(halfW / (SQRT3 * size)) + margin;
    rRange = Math.ceil(halfH / (1.5 * size)) + margin;
  }

  return { qMin: -qRange, qMax: qRange, rMin: -rRange, rMax: rRange };
}

function canonicalEdgeKey(a: Point, b: Point): string {
  const ax = Math.round(a.x * 100);
  const ay = Math.round(a.y * 100);
  const bx = Math.round(b.x * 100);
  const by = Math.round(b.y * 100);
  return ax < bx || (ax === bx && ay < by)
    ? `${ax},${ay}-${bx},${by}`
    : `${bx},${by}-${ax},${ay}`;
}
