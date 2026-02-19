/**
 * IVM (Isotropic Vector Matrix) SVG Overlay Generator
 *
 * Generates SVG with triangle tessellation corner vectors.
 * Only segments touching corner regions are rendered.
 * Color cycling, gaussian blur on subset, gradient opacity toward center.
 */

const SQRT3 = Math.sqrt(3);

export interface IvmOverlayConfig {
  width: number;
  height: number;
  sideLength: number;
  rotationDeg: number;
  cornerMargin: number;
  colors: string[];
  blurAmount: number;
  blurProbability: number;
  lineWidth: number;
  opacity: number;
  seed: number;
}

export interface TypographyConfig {
  title: string;
  fontFamily?: string;
  fontSize?: number;
  fontWeight?: number;
  color?: string;
  bottomOffset?: number;
  maxWidthFraction?: number;
}

export interface BadgeConfig {
  text: string;
  bgColor?: string;
  textColor?: string;
  position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
}

export const DEFAULT_COLORS = ['#3696E9', '#3369B6', '#163996', '#336699', '#2B5A9E'];

export const DEFAULT_IVM_CONFIG: IvmOverlayConfig = {
  width: 1200,
  height: 630,
  sideLength: 60,
  rotationDeg: 15,
  cornerMargin: 0.25,
  colors: DEFAULT_COLORS,
  blurAmount: 3,
  blurProbability: 0.3,
  lineWidth: 2.5,
  opacity: 0.7,
  seed: 42,
};

interface Point {
  x: number;
  y: number;
}

interface Segment {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  family: number;
}

function createRng(seed: number): () => number {
  let s = seed | 0;
  return () => {
    s = (s + 0x6d2b79f5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function rotatePoint(p: Point, center: Point, degrees: number): Point {
  const rad = (degrees * Math.PI) / 180;
  const cos = Math.cos(rad);
  const sin = Math.sin(rad);
  const dx = p.x - center.x;
  const dy = p.y - center.y;
  return {
    x: center.x + dx * cos - dy * sin,
    y: center.y + dx * sin + dy * cos,
  };
}

function distance(a: Point, b: Point): number {
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  return Math.sqrt(dx * dx + dy * dy);
}

function generateAllSegments(w: number, h: number, sideLength: number): Segment[] {
  const segments: Segment[] = [];
  const hh = (sideLength * SQRT3) / 2;
  const halfSide = sideLength / 2;

  const expand = Math.max(w, h) * 0.5;
  const minX = -expand;
  const maxX = w + expand;
  const minY = -expand;
  const maxY = h + expand;

  const rowCount = Math.ceil((maxY - minY) / hh) + 2;
  const colCount = Math.ceil((maxX - minX) / sideLength) + 2;

  for (let row = 0; row <= rowCount; row++) {
    const y = minY + row * hh;
    for (let col = 0; col < colCount; col++) {
      const x0 = minX + col * sideLength;
      segments.push({ x1: x0, y1: y, x2: x0 + sideLength, y2: y, family: 0 });
    }
  }

  for (let col = 0; col <= colCount; col++) {
    const baseX = minX + col * sideLength;
    for (let row = 0; row < rowCount; row++) {
      const x0 = row % 2 === 0 ? baseX : baseX + halfSide;
      segments.push({
        x1: x0,
        y1: minY + row * hh,
        x2: x0 - halfSide,
        y2: minY + (row + 1) * hh,
        family: 1,
      });
    }
  }

  for (let col = 0; col <= colCount; col++) {
    const baseX = minX + col * sideLength;
    for (let row = 0; row < rowCount; row++) {
      const x0 = row % 2 === 0 ? baseX : baseX - halfSide;
      segments.push({
        x1: x0,
        y1: minY + row * hh,
        x2: x0 + halfSide,
        y2: minY + (row + 1) * hh,
        family: 2,
      });
    }
  }

  return segments;
}

function filterCornerSegments(
  segments: Segment[],
  w: number,
  h: number,
  center: Point,
  rotationDeg: number,
  cornerMargin: number,
): Array<Segment & { cornerOpacity: number }> {
  const diagonal = Math.sqrt(w * w + h * h);
  const threshold = cornerMargin * diagonal;

  const corners: Point[] = [
    { x: 0, y: 0 },
    { x: w, y: 0 },
    { x: 0, y: h },
    { x: w, y: h },
  ];

  const result: Array<Segment & { cornerOpacity: number }> = [];

  for (const seg of segments) {
    const p1 = rotatePoint({ x: seg.x1, y: seg.y1 }, center, rotationDeg);
    const p2 = rotatePoint({ x: seg.x2, y: seg.y2 }, center, rotationDeg);

    let closestDist = Infinity;
    for (const corner of corners) {
      closestDist = Math.min(closestDist, distance(p1, corner), distance(p2, corner));
    }
    if (closestDist < threshold) {
      const opacity = 1 - closestDist / threshold;
      result.push({
        x1: p1.x,
        y1: p1.y,
        x2: p2.x,
        y2: p2.y,
        family: seg.family,
        cornerOpacity: opacity,
      });
    }
  }

  return result;
}

function escapeXml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function getBadgePosition(
  position: BadgeConfig['position'],
  w: number,
  h: number,
): { x: number; y: number; anchor: string } {
  const margin = 24;
  switch (position) {
    case 'top-left':
      return { x: margin, y: margin + 28, anchor: 'start' };
    case 'top-right':
      return { x: w - margin, y: margin + 28, anchor: 'end' };
    case 'bottom-left':
      return { x: margin, y: h - margin, anchor: 'start' };
    case 'bottom-right':
    default:
      return { x: w - margin, y: h - margin, anchor: 'end' };
  }
}

export function generateIvmOverlaySvg(
  config: IvmOverlayConfig,
  typo?: TypographyConfig,
  badges?: BadgeConfig[],
  fontFaceCSS?: string,
): string {
  const { width: w, height: h, sideLength, rotationDeg, cornerMargin, colors, blurAmount, blurProbability, lineWidth, opacity, seed } = config;

  const rng = createRng(seed);
  const center: Point = { x: w / 2, y: h / 2 };

  const allSegments = generateAllSegments(w, h, sideLength);
  const cornerSegments = filterCornerSegments(allSegments, w, h, center, rotationDeg, cornerMargin);

  const lines: string[] = [];
  for (const seg of cornerSegments) {
    const color = colors[seg.family % colors.length];
    const segOpacity = (opacity * seg.cornerOpacity).toFixed(3);
    const filter = rng() < blurProbability ? ' filter="url(#ivm-blur)"' : '';

    lines.push(
      `<line x1="${seg.x1.toFixed(1)}" y1="${seg.y1.toFixed(1)}" x2="${seg.x2.toFixed(1)}" y2="${seg.y2.toFixed(1)}" stroke="${color}" stroke-width="${lineWidth}" stroke-opacity="${segOpacity}" stroke-linecap="round"${filter}/>`,
    );
  }

  let typoSvg = '';
  if (typo?.title) {
    const fontSize = typo.fontSize ?? 48;
    const fontWeight = typo.fontWeight ?? 700;
    const fontFamily = typo.fontFamily ?? "'JetBrains Mono', monospace";
    const color = typo.color ?? '#FFFFFF';
    const bottomOffset = typo.bottomOffset ?? 0.12;
    const maxWidth = typo.maxWidthFraction ?? 0.85;

    const textY = h * (1 - bottomOffset);
    const textX = w / 2;

    const barH = fontSize * 1.8;
    const barY = textY - fontSize * 0.9;

    typoSvg = `
  <rect x="0" y="${barY.toFixed(0)}" width="${w}" height="${barH.toFixed(0)}" fill="rgba(0,0,0,0.55)"/>
  <text x="${textX}" y="${textY.toFixed(0)}" text-anchor="middle" dominant-baseline="central"
    font-family="${escapeXml(fontFamily)}" font-size="${fontSize}" font-weight="${fontWeight}"
    fill="${color}" textLength="${(w * maxWidth).toFixed(0)}" lengthAdjust="spacing">
    ${escapeXml(typo.title)}
  </text>`;
  }

  let badgesSvg = '';
  if (badges?.length) {
    const badgeParts: string[] = [];
    for (const badge of badges) {
      const bg = badge.bgColor ?? '#3696E9';
      const textColor = badge.textColor ?? '#FFFFFF';
      const pos = getBadgePosition(badge.position ?? 'top-left', w, h);

      const textLen = badge.text.length * 10 + 24;
      const rectX = pos.anchor === 'end' ? pos.x - textLen : pos.x;
      const textX = pos.anchor === 'end' ? pos.x - textLen / 2 : pos.x + textLen / 2;

      badgeParts.push(`
  <rect x="${rectX}" y="${pos.y - 20}" width="${textLen}" height="28" rx="4" fill="${bg}" fill-opacity="0.9"/>
  <text x="${textX}" y="${pos.y - 4}" text-anchor="middle" font-family="'IBM Plex Sans', sans-serif" font-size="13" font-weight="500" fill="${textColor}">${escapeXml(badge.text)}</text>`);
    }
    badgesSvg = badgeParts.join('');
  }

  const styleDef = fontFaceCSS
    ? `<style>${fontFaceCSS}</style>`
    : '';

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">
<defs>
  ${styleDef}
  <filter id="ivm-blur">
    <feGaussianBlur stdDeviation="${blurAmount}"/>
  </filter>
</defs>
<g>
  ${lines.join('\n  ')}
</g>
${typoSvg}
${badgesSvg}
</svg>`;
}
