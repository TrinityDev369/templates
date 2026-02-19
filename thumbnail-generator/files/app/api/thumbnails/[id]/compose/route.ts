/**
 * Thumbnail IVM Composition API
 * POST /api/thumbnails/[id]/compose - Apply IVM overlay
 */

import { NextRequest, NextResponse } from 'next/server';
import { getThumbnailById, createThumbnailVersion } from '@/lib/thumbnail/db/queries';
import { downloadImage, uploadImage } from '@/lib/thumbnail/storage';
import { generateThumbnailS3Key } from '@/lib/thumbnail/types';
import {
  generateIvmOverlaySvg,
  composeThumbnail,
  type IvmOverlayConfig,
  type TypographyConfig,
  type BadgeConfig,
} from '@/lib/thumbnail/overlay';

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

interface ComposeRequest {
  config: IvmOverlayConfig;
  title?: string;
  categoryText?: string;
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

    const body: ComposeRequest = await request.json();

    if (!body.config) {
      return NextResponse.json({ error: 'Overlay config is required' }, { status: 400 });
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

    let typography: TypographyConfig | undefined;
    if (body.title?.trim()) {
      typography = {
        title: body.title.trim(),
        fontFamily: "'JetBrains Mono', monospace",
        fontSize: Math.round((thumbnail.width as number) / 25),
        fontWeight: 700,
        color: '#FFFFFF',
      };
    }

    let badges: BadgeConfig[] | undefined;
    if (body.categoryText?.trim()) {
      badges = [
        {
          text: body.categoryText.trim().toUpperCase(),
          bgColor: '#3696E9',
          textColor: '#FFFFFF',
          position: 'top-left',
        },
      ];
    }

    const config: IvmOverlayConfig = {
      ...body.config,
      width: thumbnail.width as number,
      height: thumbnail.height as number,
    };

    const overlaySvg = generateIvmOverlaySvg(config, typography, badges);

    let composedBuffer: Buffer;
    try {
      composedBuffer = await composeThumbnail({
        baseImage,
        overlaySvg,
        width: thumbnail.width as number,
        height: thumbnail.height as number,
        format: 'png',
      });
    } catch (error) {
      console.error('Composition failed:', error);
      return NextResponse.json(
        { error: 'Image composition failed', details: String(error) },
        { status: 500 },
      );
    }

    const s3Key = generateThumbnailS3Key(
      (thumbnail.preset as string) || 'custom',
      id,
      (thumbnail.version as number) + 1,
    );

    const uploadResult = await uploadImage(s3Key, composedBuffer, 'image/png');

    const { thumbnail: updatedThumbnail, version } = await createThumbnailVersion(id, {
      s3Key: uploadResult.key,
      s3Bucket: uploadResult.bucket,
      fileSizeBytes: composedBuffer.length,
      feedback: 'IVM branding overlay applied',
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
    });
  } catch (error) {
    console.error('Error composing thumbnail:', error);
    return NextResponse.json(
      { error: 'Failed to compose thumbnail', details: String(error) },
      { status: 500 },
    );
  }
}
