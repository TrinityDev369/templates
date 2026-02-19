'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import {
  ArrowLeft,
  Download,
  ExternalLink,
  RefreshCw,
  Trash2,
  Image,
  Clock,
  Hash,
  DollarSign,
  Loader2,
  History,
} from 'lucide-react';
import { IvmOverlayPreview } from '@/components/thumbnails/ivm-overlay-preview';
import { IvmOverlayControls } from '@/components/thumbnails/ivm-overlay-controls';
import { ReveEnhanceControls } from '@/components/thumbnails/reve-enhance-controls';
import {
  DEFAULT_IVM_CONFIG,
  type IvmOverlayConfig,
  type TypographyConfig,
  type BadgeConfig,
} from '@/lib/thumbnail/overlay/ivm-svg';
import {
  formatFileSize,
  formatDimensions,
  formatGenerationTime,
  formatCost,
  presetLabels,
  generatedByLabels,
  type PresetId,
} from '@/lib/thumbnail/types';

interface ThumbnailVersionItem {
  id: string;
  thumbnailId: string;
  version: number;
  s3Key: string | null;
  s3Bucket: string | null;
  fileSizeBytes: number | null;
  prompt: string | null;
  feedback: string | null;
  createdAt: string;
}

interface SerializedThumbnail {
  id: string;
  readableId?: string | null;
  prompt: string;
  enhancedPrompt: string | null;
  preset: string | null;
  width: number;
  height: number;
  model: string;
  seed: number | null;
  s3Key: string;
  s3Bucket: string;
  fileSizeBytes: number | null;
  generationTimeMs: number | null;
  costCents: number | null;
  version: number;
  parentId: string | null;
  feedback: string | null;
  metadata: Record<string, unknown>;
  generationParams: Record<string, unknown> | null;
  generatedBy: string | null;
  deletedAt: string | null;
  createdAt: string;
  updatedAt: string;
  versions: ThumbnailVersionItem[];
}

interface ThumbnailDetailProps {
  thumbnail: SerializedThumbnail;
}

export function ThumbnailDetail({ thumbnail }: ThumbnailDetailProps) {
  const router = useRouter();
  const [feedback, setFeedback] = useState('');
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [showOverlay, setShowOverlay] = useState(false);
  const [overlayConfig, setOverlayConfig] = useState<IvmOverlayConfig>({
    ...DEFAULT_IVM_CONFIG,
    width: thumbnail.width,
    height: thumbnail.height,
  });
  const [overlayTitle, setOverlayTitle] = useState('');
  const [overlayCategory, setOverlayCategory] = useState('');
  const [isComposing, setIsComposing] = useState(false);

  const typography: TypographyConfig | undefined = overlayTitle.trim()
    ? {
        title: overlayTitle.trim(),
        fontFamily: "'JetBrains Mono', monospace",
        fontSize: Math.round(thumbnail.width / 25),
      }
    : undefined;

  const badges: BadgeConfig[] | undefined = overlayCategory.trim()
    ? [{ text: overlayCategory.trim().toUpperCase(), position: 'top-left' as const }]
    : undefined;

  const handleCompose = async () => {
    setIsComposing(true);
    try {
      const response = await fetch(`/api/thumbnails/${thumbnail.id}/compose`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          config: overlayConfig,
          title: overlayTitle || undefined,
          categoryText: overlayCategory || undefined,
        }),
      });

      if (response.ok) {
        router.refresh();
        setShowOverlay(false);
      }
    } finally {
      setIsComposing(false);
    }
  };

  const handleDownload = () => {
    window.open(`/api/thumbnails/${thumbnail.id}/image`, '_blank');
  };

  const handleRegenerate = async () => {
    if (!feedback.trim()) return;

    setIsRegenerating(true);
    try {
      const response = await fetch(`/api/thumbnails/${thumbnail.id}/regenerate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ feedback }),
      });

      if (response.ok) {
        router.refresh();
        setFeedback('');
      }
    } finally {
      setIsRegenerating(false);
    }
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const response = await fetch(`/api/thumbnails/${thumbnail.id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        router.push('/dashboard/thumbnails');
        router.refresh();
      }
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/dashboard/thumbnails">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10 text-primary">
              <Image className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-semibold">Thumbnail</h1>
                {thumbnail.readableId && (
                  <Badge variant="outline" className="font-mono text-xs">
                    {thumbnail.readableId}
                  </Badge>
                )}
                <Badge variant="secondary">v{thumbnail.version}</Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                {formatDimensions(thumbnail.width, thumbnail.height)} •{' '}
                {thumbnail.preset && presetLabels[thumbnail.preset as PresetId]}
              </p>
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleDownload}>
            <Download className="h-4 w-4 mr-2" />
            Download
          </Button>
          <Button variant="outline" asChild>
            <a
              href={`/api/thumbnails/${thumbnail.id}/image`}
              target="_blank"
              rel="noopener noreferrer"
            >
              <ExternalLink className="h-4 w-4 mr-2" />
              Open Image
            </a>
          </Button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" size="icon">
                <Trash2 className="h-4 w-4" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete Thumbnail</AlertDialogTitle>
                <AlertDialogDescription>
                  Are you sure you want to delete this thumbnail? This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleDelete} disabled={isDeleting}>
                  {isDeleting ? 'Deleting...' : 'Delete'}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Preview</CardTitle>
            </CardHeader>
            <CardContent>
              <div
                className="relative bg-muted rounded-lg overflow-hidden"
                style={{ aspectRatio: `${thumbnail.width} / ${thumbnail.height}` }}
              >
                {!imageLoaded && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                  </div>
                )}
                <img
                  src={`/api/thumbnails/${thumbnail.id}/image`}
                  alt={thumbnail.prompt.substring(0, 50)}
                  className={`w-full h-full object-contain transition-opacity ${
                    imageLoaded ? 'opacity-100' : 'opacity-0'
                  }`}
                  onLoad={() => setImageLoaded(true)}
                />
                {showOverlay && (
                  <IvmOverlayPreview
                    config={overlayConfig}
                    typography={typography}
                    badges={badges}
                  />
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Prompt</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="text-muted-foreground text-xs">Original Prompt</Label>
                <p className="mt-1 text-sm">{thumbnail.prompt}</p>
              </div>
              {thumbnail.enhancedPrompt && thumbnail.enhancedPrompt !== thumbnail.prompt && (
                <div>
                  <Label className="text-muted-foreground text-xs">Enhanced Prompt</Label>
                  <p className="mt-1 text-sm text-muted-foreground">{thumbnail.enhancedPrompt}</p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Regenerate with Feedback</CardTitle>
              <CardDescription>
                Provide feedback to generate an improved version of this thumbnail
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="feedback">Feedback</Label>
                <Textarea
                  id="feedback"
                  placeholder="Describe what changes you'd like to see..."
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  rows={3}
                  className="mt-2"
                />
              </div>
              <Button onClick={handleRegenerate} disabled={!feedback.trim() || isRegenerating}>
                <RefreshCw
                  className={`h-4 w-4 mr-2 ${isRegenerating ? 'animate-spin' : ''}`}
                />
                {isRegenerating ? 'Regenerating...' : 'Regenerate'}
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Dimensions</span>
                <span>{formatDimensions(thumbnail.width, thumbnail.height)}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Model</span>
                <Badge variant="outline">{thumbnail.model}</Badge>
              </div>
              {thumbnail.preset && (
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Preset</span>
                  <span>{presetLabels[thumbnail.preset as PresetId]}</span>
                </div>
              )}
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">File Size</span>
                <span>{formatFileSize(thumbnail.fileSizeBytes)}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground flex items-center gap-1">
                  <Clock className="h-3 w-3" /> Generation Time
                </span>
                <span>{formatGenerationTime(thumbnail.generationTimeMs)}</span>
              </div>
              {thumbnail.seed && (
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground flex items-center gap-1">
                    <Hash className="h-3 w-3" /> Seed
                  </span>
                  <code className="text-xs bg-muted px-1.5 py-0.5 rounded">{thumbnail.seed}</code>
                </div>
              )}
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground flex items-center gap-1">
                  <DollarSign className="h-3 w-3" /> Cost
                </span>
                <span>{formatCost(thumbnail.costCents)}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Generated By</span>
                <span>{generatedByLabels[thumbnail.generatedBy || 'user']}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Created</span>
                <span suppressHydrationWarning>{new Date(thumbnail.createdAt).toLocaleString()}</span>
              </div>
            </CardContent>
          </Card>

          <IvmOverlayControls
            enabled={showOverlay}
            onToggle={setShowOverlay}
            config={overlayConfig}
            onConfigChange={setOverlayConfig}
            title={overlayTitle}
            onTitleChange={setOverlayTitle}
            categoryText={overlayCategory}
            onCategoryChange={setOverlayCategory}
            onApply={handleCompose}
            isApplying={isComposing}
          />

          <ReveEnhanceControls
            thumbnailId={thumbnail.id}
            onEnhanceComplete={() => router.refresh()}
          />

          {thumbnail.versions.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-sm flex items-center gap-2">
                  <History className="h-4 w-4" />
                  Version History
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {thumbnail.versions.map((version) => (
                  <div
                    key={version.id}
                    className="p-2 rounded border text-sm space-y-1"
                  >
                    <div className="flex items-center justify-between">
                      <Badge variant="outline">v{version.version}</Badge>
                      <span className="text-xs text-muted-foreground" suppressHydrationWarning>
                        {new Date(version.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    {version.feedback && (
                      <p className="text-xs text-muted-foreground line-clamp-2">
                        Feedback: {version.feedback}
                      </p>
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {thumbnail.metadata && Object.keys(thumbnail.metadata).length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Metadata</CardTitle>
              </CardHeader>
              <CardContent>
                <pre className="text-xs bg-muted p-3 rounded overflow-auto max-h-48">
                  {JSON.stringify(thumbnail.metadata, null, 2)}
                </pre>
              </CardContent>
            </Card>
          )}

          {thumbnail.generationParams && Object.keys(thumbnail.generationParams).length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Generation Parameters</CardTitle>
              </CardHeader>
              <CardContent>
                <pre className="text-xs bg-muted p-3 rounded overflow-auto max-h-48">
                  {JSON.stringify(thumbnail.generationParams, null, 2)}
                </pre>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
