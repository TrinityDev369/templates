/**
 * Thumbnail Generation API
 * POST /api/thumbnails/generate - Generate a new thumbnail
 */

import { NextRequest, NextResponse } from 'next/server';
import { createFluxClient } from '@/lib/thumbnail/clients/flux';
import { createReveClient } from '@/lib/thumbnail/clients/reve';
import { createThumbnail } from '@/lib/thumbnail/db/queries';
import { uploadImage } from '@/lib/thumbnail/storage';
import { createEnhancer } from '@/lib/thumbnail/enhancer';
import { getPreset } from '@/lib/thumbnail/presets';
import {
  generateThumbnailS3Key,
  presetConfigs,
  MODEL_COSTS,
  type PresetId,
  type FluxModel,
  type Backend,
} from '@/lib/thumbnail/types';

const MAX_PROMPT_LENGTH = 2000;

interface GenerateRequest {
  prompt: string;
  preset?: PresetId;
  width?: number;
  height?: number;
  backend?: Backend;
  model?: string;
  seed?: number;
  enhancePrompt?: boolean;
}

export async function POST(request: NextRequest) {
  try {
    // TODO: Add your auth middleware
    const body: GenerateRequest = await request.json();

    if (!body.prompt?.trim()) {
      return NextResponse.json({ error: 'Prompt is required' }, { status: 400 });
    }

    if (body.prompt.length > MAX_PROMPT_LENGTH) {
      return NextResponse.json(
        { error: `Prompt too long. Maximum ${MAX_PROMPT_LENGTH} characters allowed.` },
        { status: 400 },
      );
    }

    const backend: Backend = body.backend ?? 'reve';
    const presetConfig = body.preset && body.preset !== 'custom' ? presetConfigs[body.preset] : undefined;
    const width = body.width ?? presetConfig?.width ?? 1200;
    const height = body.height ?? presetConfig?.height ?? 630;
    const model = body.model ?? 'flux-dev';

    if (width < 256 || width > 2048 || height < 256 || height > 2048) {
      return NextResponse.json(
        { error: 'Invalid dimensions. Width and height must be between 256 and 2048.' },
        { status: 400 },
      );
    }

    // Enhance prompt
    let enhancedPrompt = body.prompt;
    if (body.enhancePrompt !== false) {
      const enhancer = createEnhancer();
      const preset = body.preset ? getPreset(body.preset) : undefined;
      enhancedPrompt = enhancer.enhance(body.prompt, preset);
    }

    let imageBuffer: Buffer;
    let seed = 0;
    let generationTimeMs = 0;
    const startTime = Date.now();

    if (backend === 'flux') {
      const client = createFluxClient();
      const { result, imageBuffer: buf } = await client.generateAndDownload(
        model as FluxModel,
        { prompt: enhancedPrompt, width, height, seed: body.seed },
      );
      imageBuffer = buf;
      seed = result.result?.seed ?? 0;
      generationTimeMs = Date.now() - startTime;
    } else {
      const client = createReveClient();
      const result = await client.create({
        prompt: enhancedPrompt,
        aspectRatio: '16:9',
      });
      imageBuffer = Buffer.from(result.image, 'base64');
      generationTimeMs = Date.now() - startTime;
    }

    const tempId = crypto.randomUUID();
    const s3Key = generateThumbnailS3Key(body.preset || 'custom', tempId, 1);
    const uploadResult = await uploadImage(s3Key, imageBuffer, 'image/png');

    const costCents = backend === 'flux'
      ? Math.round((MODEL_COSTS[model as FluxModel] ?? 0.05) * 100)
      : 0;

    const thumbnail = await createThumbnail({
      prompt: body.prompt,
      enhancedPrompt: enhancedPrompt !== body.prompt ? enhancedPrompt : undefined,
      preset: body.preset,
      width,
      height,
      model: backend === 'reve' ? 'reve-create' : model,
      seed,
      s3Key: uploadResult.key,
      s3Bucket: uploadResult.bucket,
      fileSizeBytes: imageBuffer.length,
      generationTimeMs,
      costCents,
      generatedBy: 'user',
      generationParams: {
        backend,
        originalPrompt: body.prompt,
        preset: body.preset,
        model,
      },
    });

    return NextResponse.json({
      success: true,
      thumbnail: {
        id: thumbnail.id,
        readableId: thumbnail.readableId,
        prompt: thumbnail.prompt,
        preset: thumbnail.preset,
        width: thumbnail.width,
        height: thumbnail.height,
        model: thumbnail.model,
        seed: thumbnail.seed,
        generationTimeMs: thumbnail.generationTimeMs,
        costCents: thumbnail.costCents,
        createdAt: thumbnail.createdAt,
      },
    });
  } catch (error) {
    console.error('Error generating thumbnail:', error);
    return NextResponse.json(
      { error: 'Failed to generate thumbnail', details: String(error) },
      { status: 500 },
    );
  }
}
