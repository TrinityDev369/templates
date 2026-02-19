/**
 * Thumbnail Image API
 * GET /api/thumbnails/[id]/image - Get presigned URL for thumbnail image
 */

import { NextRequest, NextResponse } from 'next/server';
import { getThumbnailById } from '@/lib/thumbnail/db/queries';
import { getPresignedDownloadUrl } from '@/lib/thumbnail/storage';

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    // TODO: Add your auth middleware
    const { id } = await params;
    const searchParams = request.nextUrl.searchParams;
    const redirect = searchParams.get('redirect') !== 'false';

    if (!UUID_REGEX.test(id)) {
      return NextResponse.json({ error: 'Invalid thumbnail ID format' }, { status: 400 });
    }

    const thumbnail = await getThumbnailById(id);

    if (!thumbnail) {
      return NextResponse.json({ error: 'Thumbnail not found' }, { status: 404 });
    }

    const presignedUrl = await getPresignedDownloadUrl(thumbnail.s3Key as string, 3600);

    if (redirect) {
      return NextResponse.redirect(presignedUrl);
    }

    return NextResponse.json({
      url: presignedUrl,
      expiresIn: 3600,
      width: thumbnail.width,
      height: thumbnail.height,
      contentType: 'image/png',
    });
  } catch (error) {
    console.error('Error getting thumbnail image URL:', error);
    return NextResponse.json(
      { error: 'Failed to get thumbnail image', details: String(error) },
      { status: 500 },
    );
  }
}
