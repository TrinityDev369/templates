/**
 * Sharp-based thumbnail composition
 *
 * Takes a base image buffer + SVG overlay string, rasterizes the SVG,
 * and composites them into a final output buffer.
 *
 * Sharp is a peer dependency.
 */

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let _sharp: any = null;

async function getSharp() {
  if (!_sharp) {
    try {
      // @ts-expect-error — sharp is an optional peer dependency
      const mod = await import('sharp');
      _sharp = mod.default ?? mod;
    } catch {
      throw new Error(
        'sharp is required for server-side thumbnail composition. Install it with: npm install sharp',
      );
    }
  }
  return _sharp;
}

export interface ComposeOptions {
  baseImage: Buffer;
  overlaySvg: string;
  width: number;
  height: number;
  format?: 'png' | 'webp';
}

export async function composeThumbnail(options: ComposeOptions): Promise<Buffer> {
  const sharp = await getSharp();
  const { baseImage, overlaySvg, width, height, format = 'png' } = options;

  const svgBuffer = Buffer.from(overlaySvg);
  const overlayPng = await sharp(svgBuffer)
    .resize(width, height)
    .png()
    .toBuffer();

  const pipeline = sharp(baseImage)
    .resize(width, height, { fit: 'cover' })
    .composite([{ input: overlayPng, top: 0, left: 0 }]);

  return format === 'webp'
    ? pipeline.webp({ quality: 90 }).toBuffer()
    : pipeline.png().toBuffer();
}
