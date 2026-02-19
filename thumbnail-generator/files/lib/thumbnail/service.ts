/**
 * Thumbnail Service
 *
 * Unified service for generating thumbnails via Reve (default) or Flux.
 * Handles prompt enhancement, image generation, S3 storage, and DB persistence.
 */

import type { FluxModel, Backend, GenerateOptions } from './types';
import { MODEL_COSTS } from './types';
import { createFluxClient } from './clients/flux';
import { createReveClient } from './clients/reve';
import { createEnhancer } from './enhancer';
import { getPreset } from './presets';
import { uploadImage } from './storage';
import { createThumbnail, type CreateThumbnailData } from './db/queries';
import { generateThumbnailS3Key } from './types';

interface GenerationResult {
  imageBuffer: Buffer;
  seed: number;
  generationTimeMs: number;
}

async function generateViaFlux(params: {
  prompt: string;
  width: number;
  height: number;
  model: string;
  seed?: number;
}): Promise<GenerationResult> {
  const client = createFluxClient();
  const startTime = Date.now();

  const { result, imageBuffer } = await client.generateAndDownload(
    params.model as FluxModel,
    {
      prompt: params.prompt,
      width: params.width,
      height: params.height,
      seed: params.seed,
    },
  );

  return {
    imageBuffer,
    seed: result.result?.seed ?? 0,
    generationTimeMs: Date.now() - startTime,
  };
}

async function generateViaReve(params: {
  prompt: string;
  width: number;
  height: number;
}): Promise<GenerationResult> {
  const client = createReveClient();
  const startTime = Date.now();

  const aspectMap: Record<string, string> = {
    '16:9': '16:9',
    '9:16': '9:16',
    '1:1': '1:1',
    '4:3': '4:3',
    '3:4': '3:4',
    '3:2': '3:2',
    '2:3': '2:3',
  };

  const ratio = `${params.width}:${params.height}`;
  const gcd = (a: number, b: number): number => (b === 0 ? a : gcd(b, a % b));
  const g = gcd(params.width, params.height);
  const simplified = `${params.width / g}:${params.height / g}`;
  const aspectRatio = (aspectMap[ratio] || aspectMap[simplified] || '16:9') as Parameters<typeof client.create>[0]['aspectRatio'];

  const result = await client.create({
    prompt: params.prompt,
    aspectRatio,
  });

  const imageBuffer = Buffer.from(result.image, 'base64');

  return {
    imageBuffer,
    seed: 0,
    generationTimeMs: Date.now() - startTime,
  };
}

/**
 * Generate a thumbnail using the specified backend (default: Reve)
 */
export async function generateThumbnail(options: GenerateOptions): Promise<{
  thumbnail: CreateThumbnailData & { id?: string };
  imageBuffer: Buffer;
}> {
  const backend: Backend = options.backend ?? 'reve';
  const preset = options.preset ? getPreset(options.preset) : undefined;
  const width = options.width ?? preset?.width ?? 1200;
  const height = options.height ?? preset?.height ?? 630;
  const model = options.model ?? preset?.model ?? 'flux-2-pro';

  // Enhance prompt if requested
  let prompt = options.prompt;
  if (options.enhancePrompt !== false) {
    const enhancer = createEnhancer();
    prompt = enhancer.enhance(prompt, preset);
  }

  // Generate via selected backend
  let result: GenerationResult;
  if (backend === 'flux') {
    result = await generateViaFlux({ prompt, width, height, model, seed: options.seed });
  } else {
    result = await generateViaReve({ prompt, width, height });
  }

  // Store in S3 if requested
  const tempId = crypto.randomUUID();
  const s3Key = generateThumbnailS3Key(options.preset || 'custom', tempId, 1);

  let uploadResult = { bucket: '', key: s3Key, url: '' };
  if (options.storeResult !== false) {
    uploadResult = await uploadImage(s3Key, result.imageBuffer, 'image/png');
  }

  // Calculate cost
  const costCents = backend === 'flux' ? Math.round((MODEL_COSTS[model] ?? 0.05) * 100) : 0;

  const thumbnailData = {
    prompt: options.prompt,
    enhancedPrompt: prompt !== options.prompt ? prompt : undefined,
    preset: options.preset,
    width,
    height,
    model: backend === 'reve' ? 'reve-create' : model,
    seed: result.seed,
    s3Key: uploadResult.key,
    s3Bucket: uploadResult.bucket,
    fileSizeBytes: result.imageBuffer.length,
    generationTimeMs: result.generationTimeMs,
    costCents,
    generatedBy: 'user',
    generationParams: {
      backend,
      originalPrompt: options.prompt,
      preset: options.preset,
      model,
    },
  };

  return { thumbnail: thumbnailData, imageBuffer: result.imageBuffer };
}
