/**
 * Prompt Enhancer
 *
 * Enhances user prompts with brand guidelines and preset-specific suffixes.
 */

import type { BrandGuidelines, ThumbnailPreset } from './types';

/**
 * Default brand guidelines for prompt enhancement.
 * Customize these to match your project's brand identity.
 */
export const DEFAULT_BRAND: BrandGuidelines = {
  colorPalette: [
    'deep blue (#0066cc)',
    'purple gradient',
    'electric violet',
    'dark backgrounds',
  ],
  styleKeywords: [
    'modern',
    'professional',
    'tech-forward',
    'minimalist',
    'geometric patterns',
    'gradient lighting',
  ],
  avoidKeywords: [
    'cartoonish',
    'clip art',
    'stock photo style',
    'generic corporate',
  ],
};

export class PromptEnhancer {
  private brand: BrandGuidelines;

  constructor(brand: BrandGuidelines = DEFAULT_BRAND) {
    this.brand = brand;
  }

  enhance(basePrompt: string, preset?: ThumbnailPreset): string {
    const parts: string[] = [basePrompt];

    if (preset?.promptSuffix) {
      parts.push(preset.promptSuffix);
    }

    parts.push(`Style: ${this.brand.styleKeywords.slice(0, 3).join(', ')}`);
    parts.push(`Color palette: ${this.brand.colorPalette.slice(0, 2).join(' and ')}`);

    if (this.brand.avoidKeywords.length > 0) {
      parts.push(`Avoid: ${this.brand.avoidKeywords.slice(0, 2).join(', ')}`);
    }

    return parts.join('. ');
  }

  getBrand(): BrandGuidelines {
    return { ...this.brand };
  }

  setBrand(brand: BrandGuidelines): void {
    this.brand = brand;
  }
}

export function createEnhancer(brand?: BrandGuidelines): PromptEnhancer {
  return new PromptEnhancer(brand);
}
