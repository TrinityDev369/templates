/**
 * Thumbnails List API
 * GET /api/thumbnails - List all thumbnails
 */

import { NextRequest, NextResponse } from 'next/server';
import { listThumbnails, getThumbnailStats } from '@/lib/thumbnail/db/queries';

export async function GET(request: NextRequest) {
  try {
    // TODO: Add your auth middleware
    const searchParams = request.nextUrl.searchParams;

    const filters = {
      preset: searchParams.get('preset') || undefined,
      model: searchParams.get('model') || undefined,
      generatedBy: searchParams.get('generatedBy') || undefined,
      search: searchParams.get('search') || undefined,
      dateFrom: searchParams.get('dateFrom') || undefined,
      dateTo: searchParams.get('dateTo') || undefined,
      page: searchParams.get('page') ? parseInt(searchParams.get('page')!, 10) : 1,
      limit: searchParams.get('limit') ? parseInt(searchParams.get('limit')!, 10) : 20,
    };

    const [result, stats] = await Promise.all([
      listThumbnails(filters),
      searchParams.get('includeStats') === 'true' ? getThumbnailStats() : null,
    ]);

    return NextResponse.json({
      thumbnails: result.thumbnails,
      pagination: {
        total: result.total,
        page: result.page,
        limit: result.limit,
        totalPages: Math.ceil(result.total / result.limit),
      },
      ...(stats && { stats }),
    });
  } catch (error) {
    console.error('Error listing thumbnails:', error);
    return NextResponse.json(
      { error: 'Failed to list thumbnails', details: String(error) },
      { status: 500 },
    );
  }
}
