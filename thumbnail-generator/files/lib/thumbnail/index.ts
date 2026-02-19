// Core
export { FluxClient, createFluxClient } from './clients/flux';
export { ReveClient, createReveClient, ReveContentViolationError } from './clients/reve';
export { PromptEnhancer, createEnhancer, DEFAULT_BRAND } from './enhancer';
export { THUMBNAIL_PRESETS, getPreset, getAllPresets, validateDimensions } from './presets';
export { generateThumbnail } from './service';
export { uploadImage, downloadImage, getPresignedDownloadUrl } from './storage';

// Overlay
export {
  generateIvmOverlaySvg,
  DEFAULT_COLORS,
  DEFAULT_IVM_CONFIG,
  composeThumbnail,
} from './overlay';

// DB
export {
  listThumbnails,
  getThumbnailById,
  getThumbnailWithVersions,
  createThumbnail,
  updateThumbnail,
  deleteThumbnail,
  getThumbnailVersions,
  createThumbnailVersion,
  getThumbnailStats,
} from './db/queries';

// Types
export type {
  FluxModel,
  Backend,
  FluxConfig,
  GenerateParams,
  GenerateOptions,
  ThumbnailPreset,
  ThumbnailResult,
  BrandGuidelines,
  GeneratedThumbnail,
  ThumbnailVersion,
  ThumbnailWithVersions,
  ThumbnailFilters,
  PresetId,
  PresetConfig,
  CreateThumbnailInput,
  UpdateThumbnailInput,
} from './types';

export {
  MODEL_COSTS,
  presetConfigs,
  presetLabels,
  generatedByLabels,
  generateThumbnailS3Key,
  formatFileSize,
  formatDimensions,
  formatGenerationTime,
  formatCost,
} from './types';

export type {
  IvmOverlayConfig,
  TypographyConfig,
  BadgeConfig,
  ComposeOptions,
} from './overlay';
