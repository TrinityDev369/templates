/**
 * Reve API Client
 *
 * Client for the Reve AI image editing/creation API with:
 * - Bearer token authentication
 * - Synchronous responses (no polling needed)
 * - Edit, Create, and Remix endpoints
 * - Content violation detection
 */

// ============================================================================
// Types
// ============================================================================

export type ReveAspectRatio =
  | '16:9' | '9:16'
  | '3:2' | '2:3'
  | '4:3' | '3:4'
  | '1:1';

export type RevePostprocessing =
  | { process: 'upscale'; upscale_factor: 2 | 3 | 4 }
  | { process: 'remove_background' }
  | { process: 'fit_image'; max_dim?: number; max_width?: number; max_height?: number };

export interface ReveEditParams {
  editInstruction: string;
  referenceImage: string;
  aspectRatio?: ReveAspectRatio;
  version?: 'latest' | 'latest-fast' | 'reve-edit@20250915' | 'reve-edit-fast@20251030';
  testTimeScaling?: number;
  postprocessing?: RevePostprocessing[];
}

export interface ReveCreateParams {
  prompt: string;
  aspectRatio?: ReveAspectRatio;
  version?: 'latest' | 'reve-create@20250915';
  testTimeScaling?: number;
  postprocessing?: RevePostprocessing[];
}

export interface ReveRemixParams {
  prompt: string;
  referenceImage: string;
  aspectRatio?: ReveAspectRatio;
  version?: string;
  testTimeScaling?: number;
  postprocessing?: RevePostprocessing[];
}

export interface ReveResult {
  image: string;
  version: string;
  contentViolation: boolean;
  requestId: string;
  creditsUsed: number;
  creditsRemaining: number;
}

export interface ReveConfig {
  apiKey: string;
  baseUrl?: string;
}

// ============================================================================
// Errors
// ============================================================================

export class ReveApiError extends Error {
  public readonly statusCode: number;
  public readonly statusText: string;
  public readonly responseBody?: string;

  constructor(statusCode: number, statusText: string, responseBody?: string) {
    super(`Reve API error: ${statusCode} ${statusText}${responseBody ? ` - ${responseBody}` : ''}`);
    this.name = 'ReveApiError';
    this.statusCode = statusCode;
    this.statusText = statusText;
    this.responseBody = responseBody;
  }
}

export class ReveContentViolationError extends Error {
  public readonly requestId: string;

  constructor(requestId: string) {
    super(`Reve content violation detected (request: ${requestId})`);
    this.name = 'ReveContentViolationError';
    this.requestId = requestId;
  }
}

// ============================================================================
// Client
// ============================================================================

const DEFAULT_BASE_URL = 'https://api.reve.com';

export class ReveClient {
  private readonly apiKey: string;
  private readonly baseUrl: string;

  constructor(config: ReveConfig) {
    if (!config.apiKey) {
      throw new Error('ReveClient requires an API key');
    }

    this.apiKey = config.apiKey;
    this.baseUrl = config.baseUrl ?? DEFAULT_BASE_URL;
  }

  private getHeaders(): Record<string, string> {
    return {
      'Authorization': `Bearer ${this.apiKey}`,
      'Content-Type': 'application/json',
    };
  }

  async edit(params: ReveEditParams): Promise<ReveResult> {
    const body: Record<string, unknown> = {
      edit_instruction: params.editInstruction,
      reference_image: params.referenceImage,
    };

    if (params.aspectRatio) body.aspect_ratio = params.aspectRatio;
    if (params.version) body.version = params.version;
    if (params.testTimeScaling !== undefined) body.test_time_scaling = params.testTimeScaling;
    if (params.postprocessing) body.postprocessing = params.postprocessing;

    return this.request('/v1/image/edit', body);
  }

  async create(params: ReveCreateParams): Promise<ReveResult> {
    const body: Record<string, unknown> = {
      prompt: params.prompt,
    };

    if (params.aspectRatio) body.aspect_ratio = params.aspectRatio;
    if (params.version) body.version = params.version;
    if (params.testTimeScaling !== undefined) body.test_time_scaling = params.testTimeScaling;
    if (params.postprocessing) body.postprocessing = params.postprocessing;

    return this.request('/v1/image/create', body);
  }

  async remix(params: ReveRemixParams): Promise<ReveResult> {
    const body: Record<string, unknown> = {
      prompt: params.prompt,
      reference_image: params.referenceImage,
    };

    if (params.aspectRatio) body.aspect_ratio = params.aspectRatio;
    if (params.version) body.version = params.version;
    if (params.testTimeScaling !== undefined) body.test_time_scaling = params.testTimeScaling;
    if (params.postprocessing) body.postprocessing = params.postprocessing;

    return this.request('/v1/image/remix', body);
  }

  private async request(path: string, body: Record<string, unknown>): Promise<ReveResult> {
    const response = await fetch(`${this.baseUrl}${path}`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorBody = await response.text().catch(() => undefined);
      throw new ReveApiError(response.status, response.statusText, errorBody);
    }

    const raw = await response.json() as Record<string, unknown>;

    const result: ReveResult = {
      image: raw.image as string,
      version: raw.version as string,
      contentViolation: raw.content_violation as boolean,
      requestId: raw.request_id as string,
      creditsUsed: raw.credits_used as number,
      creditsRemaining: raw.credits_remaining as number,
    };

    if (result.contentViolation) {
      throw new ReveContentViolationError(result.requestId);
    }

    return result;
  }
}

export function createReveClient(overrides?: Partial<ReveConfig>): ReveClient {
  const apiKey = overrides?.apiKey ?? process.env.REVE_API_KEY;

  if (!apiKey) {
    throw new Error('REVE_API_KEY environment variable is required');
  }

  return new ReveClient({
    apiKey,
    baseUrl: overrides?.baseUrl,
  });
}
