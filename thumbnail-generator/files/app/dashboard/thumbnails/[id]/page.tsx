import { getThumbnailWithVersions } from '@/lib/thumbnail/db/queries';
import { ThumbnailDetail } from './thumbnail-detail';
import { notFound } from 'next/navigation';

export const dynamic = 'force-dynamic';

interface ThumbnailPageProps {
  params: Promise<{ id: string }>;
}

export default async function ThumbnailPage({ params }: ThumbnailPageProps) {
  const { id } = await params;

  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (!uuidRegex.test(id)) {
    notFound();
  }

  const thumbnail = await getThumbnailWithVersions(id);

  if (!thumbnail) {
    notFound();
  }

  const serializedThumbnail = {
    ...thumbnail,
    createdAt: thumbnail.createdAt instanceof Date ? thumbnail.createdAt.toISOString() : String(thumbnail.createdAt),
    updatedAt: thumbnail.updatedAt instanceof Date ? thumbnail.updatedAt.toISOString() : String(thumbnail.updatedAt),
    deletedAt: thumbnail.deletedAt ? (thumbnail.deletedAt instanceof Date ? thumbnail.deletedAt.toISOString() : String(thumbnail.deletedAt)) : null,
    versions: (thumbnail.versions || []).map((v: Record<string, unknown>) => ({
      ...v,
      createdAt: v.createdAt instanceof Date ? v.createdAt.toISOString() : String(v.createdAt),
    })),
  };

  return <ThumbnailDetail thumbnail={serializedThumbnail} />;
}
