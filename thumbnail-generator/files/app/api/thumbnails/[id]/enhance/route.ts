/**
 * Thumbnail Reve Enhancement API
 * POST /api/thumbnails/[id]/enhance - Enhance with Reve AI
 */

import { NextRequest, NextResponse } from 'next/server';
import { getThumbnailById, createThumbnailVersion } from '@/lib/thumbnail/db/queries';
import { downloadImage, uploadImage } from '@/lib/thumbnail/storage';
import { generateThumbnailS3Key } from '@/lib/thumbnail/types';
import { createReveClient, ReveContentViolationError } from '@/lib/thumbnail/clients/reve';

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

interface EnhanceRequest {
  editInstruction: string;
  version?: string;
  testTimeScaling?: number;
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    // TODO: Add your auth middleware
    const { id } = await params;

    if (!UUID_REGEX.test(id)) {
      return NextResponse.json({ error: 'Invalid thumbnail ID format' }, { status: 400 });
    }

    const body: EnhanceRequest = await request.json();

    if (!body.editInstruction?.trim()) {
      return NextResponse.json(
        { error: 'Edit instruction is required' },
        { status: 400 },
      );
    }

    if (body.editInstruction.length > 2560) {
      return NextResponse.json(
        { error: 'Edit instruction must be 2560 characters or less' },
        { status: 400 },
      );
    }

    const thumbnail = await getThumbnailById(id);
    if (!thumbnail) {
      return NextResponse.json({ error: 'Thumbnail not found' }, { status: 404 });
    }

    let baseImage: Buffer;
    try {
      baseImage = await downloadImage(thumbnail.s3Key as string);
    } catch (error) {
      console.error('Failed to download base image:', error);
      return NextResponse.json(
        { error: 'Failed to download base image from storage' },
        { status: 500 },
      );
    }

    let enhanceResult;
    try {
      const client = createReveClient();
      const referenceImage = baseImage.toString('base64');

      const result = await client.edit({
        editInstruction: body.editInstruction.trim(),
        referenceImage,
        version: body.version as 'latest' | 'latest-fast' | undefined,
        testTimeScaling: body.testTimeScaling,
      });

      enhanceResult = {
        imageBuffer: Buffer.from(result.image, 'base64'),
        creditsUsed: result.creditsUsed,
        creditsRemaining: result.creditsRemaining,
        requestId: result.requestId,
      };
    } catch (error) {
      if (error instanceof ReveContentViolationError) {
        return NextResponse.json(
          { error: 'Content violation', message: 'The edit instruction or image was flagged by content moderation' },
          { status: 422 },
        );
      }
      throw error;
    }

    const s3Key = generateThumbnailS3Key(
      (thumbnail.preset as string) || 'custom',
      id,
      (thumbnail.version as number) + 1,
    );

    const uploadResult = await uploadImage(s3Key, enhanceResult.imageBuffer, 'image/png');

    const { thumbnail: updatedThumbnail, version } = await createThumbnailVersion(id, {
      s3Key: uploadResult.key,
      s3Bucket: uploadResult.bucket,
      fileSizeBytes: enhanceResult.imageBuffer.length,
      feedback: `Reve AI enhancement: ${body.editInstruction.trim()} (credits: ${enhanceResult.creditsUsed}, request: ${enhanceResult.requestId})`,
    });

    return NextResponse.json({
      success: true,
      thumbnail: {
        id: updatedThumbnail.id,
        readableId: updatedThumbnail.readableId,
        version: updatedThumbnail.version,
        updatedAt: updatedThumbnail.updatedAt,
      },
      previousVersion: version,
      reve: {
        creditsUsed: enhanceResult.creditsUsed,
        creditsRemaining: enhanceResult.creditsRemaining,
        requestId: enhanceResult.requestId,
      },
    });
  } catch (error) {
    console.error('Error enhancing thumbnail:', error);
    return NextResponse.json(
      { error: 'Failed to enhance thumbnail', details: String(error) },
      { status: 500 },
    );
  }
}
