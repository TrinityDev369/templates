/**
 * Thumbnail Presets
 *
 * Predefined thumbnail configurations for common use cases.
 */

import type { FluxModel, ThumbnailPreset } from './types';

export const THUMBNAIL_PRESETS: ThumbnailPreset[] = [
  {
    id: 'youtube',
    name: 'YouTube Thumbnail',
    width: 1280,
    height: 720,
    aspectRatio: '16:9',
    model: 'flux-2-pro',
    promptSuffix: 'professional thumbnail, bold text-friendly composition, high contrast',
    useCase: 'YouTube videos, video previews',
  },
  {
    id: 'og-image',
    name: 'Open Graph Image',
    width: 1200,
    height: 630,
    aspectRatio: '1.91:1',
    model: 'flux-2-pro',
    promptSuffix: 'social media preview, clean composition with space for text overlay',
    useCase: 'Social sharing, link previews',
  },
  {
    id: 'blog-hero',
    name: 'Blog Hero Image',
    width: 1920,
    height: 1080,
    aspectRatio: '16:9',
    model: 'flux-2-pro',
    promptSuffix: 'editorial style, professional photography quality, subtle branding',
    useCase: 'Blog post headers, landing pages',
  },
  {
    id: 'square',
    name: 'Square (Instagram)',
    width: 1080,
    height: 1080,
    aspectRatio: '1:1',
    model: 'flux-2-pro',
    promptSuffix: 'instagram aesthetic, centered composition, vibrant colors',
    useCase: 'Instagram posts, profile images',
  },
  {
    id: 'portrait',
    name: 'Portrait (Stories)',
    width: 1080,
    height: 1920,
    aspectRatio: '9:16',
    model: 'flux-2-flex',
    promptSuffix: 'vertical composition, mobile-optimized, engaging',
    useCase: 'Instagram/TikTok stories, vertical video thumbnails',
  },
  {
    id: 'twitter-header',
    name: 'Twitter Header',
    width: 1500,
    height: 500,
    aspectRatio: '3:1',
    model: 'flux-2-flex',
    promptSuffix: 'banner style, panoramic, professional',
    useCase: 'Twitter/X profile headers',
  },
  {
    id: 'dev',
    name: 'Development (Low Cost)',
    width: 1024,
    height: 576,
    aspectRatio: '16:9',
    model: 'flux-dev',
    promptSuffix: '',
    useCase: 'Testing, prototyping (non-commercial only)',
  },
];

export function getPreset(id: string): ThumbnailPreset | undefined {
  return THUMBNAIL_PRESETS.find(p => p.id === id);
}

export function getAllPresets(): ThumbnailPreset[] {
  return [...THUMBNAIL_PRESETS];
}

export function validateDimensions(
  preset: ThumbnailPreset,
  width?: number,
  height?: number
): { width: number; height: number } {
  return {
    width: width ?? preset.width,
    height: height ?? preset.height,
  };
}
