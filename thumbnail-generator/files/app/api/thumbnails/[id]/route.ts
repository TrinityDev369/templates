/**
 * Single Thumbnail API
 * GET /api/thumbnails/[id] - Get thumbnail by ID
 * DELETE /api/thumbnails/[id] - Soft delete thumbnail
 */

import { NextRequest, NextResponse } from 'next/server';
import { getThumbnailWithVersions, deleteThumbnail } from '@/lib/thumbnail/db/queries';

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    // TODO: Add your auth middleware
    const { id } = await params;

    if (!UUID_REGEX.test(id)) {
      return NextResponse.json({ error: 'Invalid thumbnail ID format' }, { status: 400 });
    }

    const thumbnail = await getThumbnailWithVersions(id);

    if (!thumbnail) {
      return NextResponse.json({ error: 'Thumbnail not found' }, { status: 404 });
    }

    return NextResponse.json({ thumbnail });
  } catch (error) {
    console.error('Error fetching thumbnail:', error);
    return NextResponse.json(
      { error: 'Failed to fetch thumbnail', details: String(error) },
      { status: 500 },
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    // TODO: Add your auth middleware
    const { id } = await params;

    if (!UUID_REGEX.test(id)) {
      return NextResponse.json({ error: 'Invalid thumbnail ID format' }, { status: 400 });
    }

    const deleted = await deleteThumbnail(id);

    if (!deleted) {
      return NextResponse.json({ error: 'Thumbnail not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting thumbnail:', error);
    return NextResponse.json(
      { error: 'Failed to delete thumbnail', details: String(error) },
      { status: 500 },
    );
  }
}
