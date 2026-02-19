'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Image,
  ExternalLink,
  Clock,
  Hash,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import {
  formatGenerationTime,
  formatDimensions,
  presetLabels,
  type PresetId,
} from '@/lib/thumbnail/types';

interface ThumbnailItem {
  id: string;
  readableId?: string;
  prompt: string;
  preset: string | null;
  width: number;
  height: number;
  model: string;
  seed: number | null;
  version: number;
  generationTimeMs: number | null;
  costCents: number | null;
  createdAt: string;
}

interface Pagination {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

interface ThumbnailGridProps {
  thumbnails: ThumbnailItem[];
  pagination: Pagination;
}

export function ThumbnailGrid({ thumbnails, pagination }: ThumbnailGridProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loadedImages, setLoadedImages] = useState<Record<string, boolean>>({});
  const [failedImages, setFailedImages] = useState<Record<string, boolean>>({});

  const handlePageChange = (newPage: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('page', String(newPage));
    router.push(`/dashboard/thumbnails?${params.toString()}`);
  };

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {thumbnails.map((thumbnail) => (
          <Link key={thumbnail.id} href={`/dashboard/thumbnails/${thumbnail.id}`}>
            <Card className="overflow-hidden hover:ring-2 hover:ring-primary/50 transition-all cursor-pointer group">
              <div
                className="relative bg-muted"
                style={{ aspectRatio: `${thumbnail.width} / ${thumbnail.height}` }}
              >
                {!loadedImages[thumbnail.id] && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Image className="h-12 w-12 text-muted-foreground/30" />
                  </div>
                )}
                <img
                  src={`/api/thumbnails/${thumbnail.id}/image?redirect=false`}
                  alt={thumbnail.prompt.substring(0, 50)}
                  className={`w-full h-full object-cover transition-opacity ${
                    loadedImages[thumbnail.id] ? 'opacity-100' : 'opacity-0'
                  }`}
                  loading="lazy"
                  onLoad={() => setLoadedImages((prev) => ({ ...prev, [thumbnail.id]: true }))}
                  onError={(e) => {
                    const img = e.target as HTMLImageElement;
                    if (!failedImages[thumbnail.id]) {
                      setFailedImages((prev) => ({ ...prev, [thumbnail.id]: true }));
                      img.src = `/api/thumbnails/${thumbnail.id}/image`;
                    }
                  }}
                />
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <ExternalLink className="h-8 w-8 text-white" />
                </div>
              </div>

              <CardContent className="p-3 space-y-2">
                <div className="flex items-center justify-between gap-2">
                  {thumbnail.readableId && (
                    <Badge variant="outline" className="font-mono text-xs">
                      {thumbnail.readableId}
                    </Badge>
                  )}
                  <Badge variant="secondary" className="text-xs">
                    v{thumbnail.version}
                  </Badge>
                </div>

                <p className="text-sm line-clamp-2 text-muted-foreground">
                  {thumbnail.prompt.substring(0, 80)}
                  {thumbnail.prompt.length > 80 && '...'}
                </p>

                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                  {thumbnail.preset && (
                    <Badge variant="outline" className="text-xs">
                      {presetLabels[thumbnail.preset as PresetId] || thumbnail.preset}
                    </Badge>
                  )}
                  <span>{formatDimensions(thumbnail.width, thumbnail.height)}</span>
                </div>

                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {formatGenerationTime(thumbnail.generationTimeMs)}
                  </span>
                  {thumbnail.seed && (
                    <span className="flex items-center gap-1">
                      <Hash className="h-3 w-3" />
                      {thumbnail.seed}
                    </span>
                  )}
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Showing {(pagination.page - 1) * pagination.limit + 1} to{' '}
            {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total}{' '}
            thumbnails
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(pagination.page - 1)}
              disabled={pagination.page <= 1}
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              Previous
            </Button>
            <span className="text-sm text-muted-foreground px-2">
              Page {pagination.page} of {pagination.totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(pagination.page + 1)}
              disabled={pagination.page >= pagination.totalPages}
            >
              Next
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
