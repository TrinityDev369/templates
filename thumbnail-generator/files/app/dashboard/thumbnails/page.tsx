import { listThumbnails, getThumbnailStats } from '@/lib/thumbnail/db/queries';
import { ThumbnailGrid } from './thumbnail-grid';
import { GenerateDialog } from './generate-dialog';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import {
  formatFileSize,
  formatCost,
  presetLabels,
  type PresetId,
} from '@/lib/thumbnail/types';

export const dynamic = 'force-dynamic';

export default async function ThumbnailsPage({
  searchParams,
}: {
  searchParams: Promise<{ preset?: string; model?: string; page?: string }>;
}) {
  const params = await searchParams;
  const page = params.page ? parseInt(params.page, 10) : 1;

  const [result, stats] = await Promise.all([
    listThumbnails({
      preset: params.preset,
      model: params.model,
      page,
      limit: 24,
    }),
    getThumbnailStats(),
  ]);

  const presets = Object.keys(presetLabels) as PresetId[];

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Thumbnails</h1>
          <p className="text-muted-foreground">AI-generated thumbnail images for social sharing</p>
        </div>
        <GenerateDialog />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total Thumbnails</CardDescription>
            <CardTitle className="text-3xl">{stats.total}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Storage Used</CardDescription>
            <CardTitle className="text-3xl">{formatFileSize(stats.totalSizeBytes)}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total Cost</CardDescription>
            <CardTitle className="text-3xl">{formatCost(stats.totalCostCents)}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Models Used</CardDescription>
            <CardTitle className="text-3xl">{Object.keys(stats.byModel).length}</CardTitle>
          </CardHeader>
        </Card>
      </div>

      <div className="flex gap-2 flex-wrap">
        <Badge variant={!params.preset ? 'default' : 'outline'}>
          <Link href="/dashboard/thumbnails">All</Link>
        </Badge>
        {presets.map((preset) => (
          <Badge key={preset} variant={params.preset === preset ? 'default' : 'outline'}>
            <Link href={`/dashboard/thumbnails?preset=${preset}`}>
              {presetLabels[preset]}
            </Link>
          </Badge>
        ))}
      </div>

      {result.thumbnails.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            No thumbnails yet. Click &quot;Generate Thumbnail&quot; to create your first one.
          </CardContent>
        </Card>
      ) : (
        <ThumbnailGrid
          thumbnails={result.thumbnails.map((t: Record<string, unknown>) => ({
            id: t.id as string,
            readableId: (t.readableId as string) || undefined,
            prompt: t.prompt as string,
            preset: t.preset as string | null,
            width: t.width as number,
            height: t.height as number,
            model: t.model as string,
            seed: t.seed as number | null,
            version: t.version as number,
            generationTimeMs: t.generationTimeMs as number | null,
            costCents: t.costCents as number | null,
            createdAt: t.createdAt instanceof Date ? t.createdAt.toISOString() : String(t.createdAt),
          }))}
          pagination={{
            total: result.total,
            page: result.page,
            limit: result.limit,
            totalPages: Math.ceil(result.total / result.limit),
          }}
        />
      )}
    </div>
  );
}
