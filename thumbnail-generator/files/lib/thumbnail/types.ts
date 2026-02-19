/**
 * Thumbnail Generator - Type Definitions
 */

export type FluxModel =
  | 'flux-2-max'
  | 'flux-2-pro'
  | 'flux-2-flex'
  | 'flux-kontext-pro'
  | 'flux-dev'
  | 'flux-pro-1.1'
  | 'flux-pro-1.1-ultra';

export type Backend = 'reve' | 'flux';

export interface FluxConfig {
  apiKey: string;
  baseUrl?: string;
  maxConcurrent?: number;
  region?: 'global' | 'eu' | 'us';
}

export interface GenerateParams {
  prompt: string;
  width: number;
  height: number;
  model?: FluxModel;
  seed?: number;
  safety_tolerance?: number;
  guidance?: number;
}

export interface TaskResponse {
  id: string;
  polling_url?: string;
}

export type TaskStatus = 'Ready' | 'Pending' | 'Error' | 'Request Moderated' | 'Content Moderated';

export interface TaskResult {
  status: TaskStatus;
  result?: {
    sample: string;
    prompt: string;
    seed: number;
    start_time: number;
    end_time: number;
  };
  error?: string;
}

export interface ThumbnailPreset {
  id: string;
  name: string;
  width: number;
  height: number;
  aspectRatio: string;
  model: FluxModel;
  promptSuffix?: string;
  useCase: string;
}

export interface BrandGuidelines {
  colorPalette: string[];
  styleKeywords: string[];
  avoidKeywords: string[];
}

export interface GenerateOptions {
  prompt: string;
  preset?: string;
  width?: number;
  height?: number;
  model?: FluxModel;
  backend?: Backend;
  enhancePrompt?: boolean;
  storeResult?: boolean;
  metadata?: Record<string, string>;
  seed?: number;
  safetyTolerance?: number;
}

export interface ThumbnailResult {
  id: string;
  prompt: string;
  enhancedPrompt?: string;
  width: number;
  height: number;
  model: FluxModel;
  imageUrl: string;
  originalFluxUrl: string;
  storageKey?: string;
  generationTime: number;
  seed: number;
  cost?: number;
}

export const MODEL_COSTS: Record<FluxModel, number> = {
  'flux-2-max': 0.08,
  'flux-2-pro': 0.05,
  'flux-2-flex': 0.05,
  'flux-kontext-pro': 0.04,
  'flux-dev': 0.01,
  'flux-pro-1.1': 0.05,
  'flux-pro-1.1-ultra': 0.06,
};

export interface UsageLogEntry {
  timestamp: Date;
  taskId: string;
  model: FluxModel;
  prompt: string;
  width: number;
  height: number;
  cost: number;
  generationTime: number;
  success: boolean;
  error?: string;
}

// ============================================================================
// DB Entity Types
// ============================================================================

export interface GeneratedThumbnail {
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
  deletedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface ThumbnailVersion {
  id: string;
  thumbnailId: string;
  version: number;
  s3Key: string | null;
  s3Bucket: string | null;
  fileSizeBytes: number | null;
  prompt: string | null;
  feedback: string | null;
  createdAt: Date;
}

export interface CreateThumbnailInput {
  prompt: string;
  enhancedPrompt?: string;
  preset?: string;
  width: number;
  height: number;
  model: string;
  seed?: number;
  s3Key: string;
  s3Bucket: string;
  fileSizeBytes?: number;
  generationTimeMs?: number;
  costCents?: number;
  parentId?: string;
  feedback?: string;
  metadata?: Record<string, unknown>;
  generationParams?: Record<string, unknown>;
  generatedBy?: string;
}

export interface UpdateThumbnailInput {
  feedback?: string;
  metadata?: Record<string, unknown>;
}

export interface ThumbnailWithVersions extends GeneratedThumbnail {
  versions: ThumbnailVersion[];
}

export interface ThumbnailFilters {
  preset?: string;
  model?: string;
  generatedBy?: string;
  search?: string;
  dateFrom?: string;
  dateTo?: string;
  page?: number;
  limit?: number;
}

// ============================================================================
// Preset Configurations (UI)
// ============================================================================

export type PresetId = 'og-image' | 'blog-hero' | 'twitter' | 'twitter-header' | 'instagram' | 'square' | 'portrait' | 'youtube' | 'linkedin' | 'dev' | 'custom';

export interface PresetConfig {
  name: string;
  width: number;
  height: number;
  description: string;
}

export const presetConfigs: Record<PresetId, PresetConfig> = {
  'og-image': { name: 'OG Image', width: 1200, height: 630, description: 'Open Graph image for social sharing' },
  'blog-hero': { name: 'Blog Hero', width: 1920, height: 1080, description: 'Blog post headers, landing pages' },
  twitter: { name: 'Twitter Card', width: 1200, height: 675, description: 'Twitter card image (16:9)' },
  'twitter-header': { name: 'Twitter Header', width: 1500, height: 500, description: 'Twitter/X profile header banner' },
  instagram: { name: 'Instagram Post', width: 1080, height: 1080, description: 'Square Instagram post' },
  square: { name: 'Square', width: 1080, height: 1080, description: 'Square format for Instagram/profile images' },
  portrait: { name: 'Portrait (Stories)', width: 1080, height: 1920, description: 'Vertical for Instagram/TikTok stories' },
  youtube: { name: 'YouTube Thumbnail', width: 1280, height: 720, description: 'YouTube video thumbnail (16:9)' },
  linkedin: { name: 'LinkedIn Post', width: 1200, height: 627, description: 'LinkedIn post image' },
  dev: { name: 'Dev (Small)', width: 512, height: 512, description: 'Small square for testing' },
  custom: { name: 'Custom', width: 1024, height: 1024, description: 'Custom dimensions' },
};

export const presetLabels: Record<PresetId, string> = {
  'og-image': 'OG Image',
  'blog-hero': 'Blog Hero',
  twitter: 'Twitter',
  'twitter-header': 'Twitter Header',
  instagram: 'Instagram',
  square: 'Square',
  portrait: 'Portrait',
  youtube: 'YouTube',
  linkedin: 'LinkedIn',
  dev: 'Dev',
  custom: 'Custom',
};

export const generatedByLabels: Record<string, string> = {
  user: 'User',
  agent: 'AI Agent',
  system: 'System',
};

// ============================================================================
// S3 Key Helpers
// ============================================================================

export function generateThumbnailS3Key(preset: string, thumbnailId: string, version: number): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  return `thumbnails/${preset || 'custom'}/${year}/${month}/${thumbnailId}-v${version}.png`;
}

// ============================================================================
// Formatting Helpers
// ============================================================================

export function formatFileSize(bytes: number | null): string {
  if (!bytes) return 'Unknown';
  const units = ['B', 'KB', 'MB', 'GB'];
  let size = bytes;
  let unitIndex = 0;
  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex++;
  }
  return `${size.toFixed(1)} ${units[unitIndex]}`;
}

export function formatDimensions(width: number, height: number): string {
  return `${width} \u00d7 ${height}`;
}

export function formatGenerationTime(ms: number | null): string {
  if (!ms) return 'Unknown';
  if (ms < 1000) return `${ms}ms`;
  return `${(ms / 1000).toFixed(1)}s`;
}

export function formatCost(cents: number | null): string {
  if (cents === null || cents === undefined) return 'Unknown';
  return `$${(cents / 100).toFixed(2)}`;
}
