/**
 * Flux API Client
 *
 * Client for the Black Forest Labs Flux API with:
 * - API key authentication via x-key header
 * - Rate limiting (max 24 concurrent tasks)
 * - Support for all FluxModel types
 * - Regional endpoint selection
 */

import type {
  FluxConfig,
  FluxModel,
  GenerateParams,
  TaskResponse,
  TaskResult,
  TaskStatus,
} from '../types';

export class RateLimitError extends Error {
  constructor(maxConcurrent: number) {
    super(`Rate limit exceeded: max ${maxConcurrent} concurrent tasks allowed`);
    this.name = 'RateLimitError';
  }
}

export class FluxApiError extends Error {
  public readonly statusCode: number;
  public readonly statusText: string;
  public readonly responseBody?: string;

  constructor(statusCode: number, statusText: string, responseBody?: string) {
    super(`Flux API error: ${statusCode} ${statusText}${responseBody ? ` - ${responseBody}` : ''}`);
    this.name = 'FluxApiError';
    this.statusCode = statusCode;
    this.statusText = statusText;
    this.responseBody = responseBody;
  }
}

export class GenerationTimeoutError extends Error {
  public readonly taskId: string;
  public readonly attempts: number;

  constructor(taskId: string, attempts: number) {
    super(`Generation timed out after ${attempts} attempts for task ${taskId}`);
    this.name = 'GenerationTimeoutError';
    this.taskId = taskId;
    this.attempts = attempts;
  }
}

export class ContentModerationError extends Error {
  public readonly taskId: string;
  public readonly status: TaskStatus;

  constructor(taskId: string, status: TaskStatus) {
    super(`Content moderation: ${status} for task ${taskId}`);
    this.name = 'ContentModerationError';
    this.taskId = taskId;
    this.status = status;
  }
}

const DEFAULTS = {
  BASE_URL: 'https://api.bfl.ai/v1',
  MAX_CONCURRENT: 24,
  SAFETY_TOLERANCE: 2,
  POLL_INTERVAL_MS: 2000,
  MAX_POLL_ATTEMPTS: 60,
} as const;

const REGIONAL_ENDPOINTS: Record<string, string> = {
  global: 'https://api.bfl.ai/v1',
  eu: 'https://api.eu.bfl.ai/v1',
  us: 'https://api.us.bfl.ai/v1',
};

export class FluxClient {
  private readonly apiKey: string;
  private readonly baseUrl: string;
  private readonly maxConcurrent: number;
  private activeTasks: number = 0;

  constructor(config: FluxConfig) {
    if (!config.apiKey) {
      throw new Error('FluxClient requires an API key');
    }

    this.apiKey = config.apiKey;
    this.maxConcurrent = config.maxConcurrent ?? DEFAULTS.MAX_CONCURRENT;
    this.baseUrl = config.baseUrl ?? this.getBaseUrl(config.region);
  }

  private getBaseUrl(region?: 'global' | 'eu' | 'us'): string {
    const effectiveRegion = region ?? process.env.FLUX_API_REGION ?? 'global';
    return REGIONAL_ENDPOINTS[effectiveRegion] ?? DEFAULTS.BASE_URL;
  }

  private getHeaders(): Record<string, string> {
    return {
      'x-key': this.apiKey,
      'Content-Type': 'application/json',
    };
  }

  public getActiveTasks(): number {
    return this.activeTasks;
  }

  public getMaxConcurrent(): number {
    return this.maxConcurrent;
  }

  public canAcceptTask(): boolean {
    return this.activeTasks < this.maxConcurrent;
  }

  async createTask(model: FluxModel, params: GenerateParams): Promise<TaskResponse> {
    if (this.activeTasks >= this.maxConcurrent) {
      throw new RateLimitError(this.maxConcurrent);
    }

    this.activeTasks++;

    try {
      const endpoint = `${this.baseUrl}/${model}`;

      const body = {
        prompt: params.prompt,
        width: params.width,
        height: params.height,
        ...(params.seed !== undefined && { seed: params.seed }),
        safety_tolerance: params.safety_tolerance ?? DEFAULTS.SAFETY_TOLERANCE,
        ...(params.guidance !== undefined && { guidance: params.guidance }),
      };

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        const errorBody = await response.text().catch(() => undefined);
        throw new FluxApiError(response.status, response.statusText, errorBody);
      }

      const result = await response.json() as TaskResponse;
      return result;
    } catch (error) {
      this.activeTasks--;
      throw error;
    }
  }

  async pollResult(
    taskId: string,
    options?: { maxAttempts?: number; intervalMs?: number }
  ): Promise<TaskResult> {
    const maxAttempts = options?.maxAttempts ?? DEFAULTS.MAX_POLL_ATTEMPTS;
    const intervalMs = options?.intervalMs ?? DEFAULTS.POLL_INTERVAL_MS;
    const pollingUrl = `${this.baseUrl}/get_result?id=${taskId}`;

    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      const response = await fetch(pollingUrl, {
        method: 'GET',
        headers: { 'x-key': this.apiKey },
      });

      if (!response.ok) {
        const errorBody = await response.text().catch(() => undefined);
        throw new FluxApiError(response.status, response.statusText, errorBody);
      }

      const result = await response.json() as TaskResult;

      if (result.status === 'Ready') {
        this.activeTasks = Math.max(0, this.activeTasks - 1);
        return result;
      }

      if (result.status === 'Error') {
        this.activeTasks = Math.max(0, this.activeTasks - 1);
        throw new FluxApiError(500, 'Generation failed', result.error);
      }

      if (result.status === 'Request Moderated' || result.status === 'Content Moderated') {
        this.activeTasks = Math.max(0, this.activeTasks - 1);
        throw new ContentModerationError(taskId, result.status);
      }

      await this.sleep(intervalMs);
    }

    this.activeTasks = Math.max(0, this.activeTasks - 1);
    throw new GenerationTimeoutError(taskId, maxAttempts);
  }

  async downloadImage(url: string): Promise<Buffer> {
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`Failed to download image: ${response.status} ${response.statusText}`);
    }

    const arrayBuffer = await response.arrayBuffer();
    return Buffer.from(arrayBuffer);
  }

  async generate(
    model: FluxModel,
    params: GenerateParams,
    pollOptions?: { maxAttempts?: number; intervalMs?: number }
  ): Promise<TaskResult & { taskId: string }> {
    const task = await this.createTask(model, params);
    const result = await this.pollResult(task.id, pollOptions);
    return { ...result, taskId: task.id };
  }

  async generateAndDownload(
    model: FluxModel,
    params: GenerateParams,
    pollOptions?: { maxAttempts?: number; intervalMs?: number }
  ): Promise<{ taskId: string; result: TaskResult; imageBuffer: Buffer }> {
    const task = await this.createTask(model, params);
    const result = await this.pollResult(task.id, pollOptions);

    if (!result.result?.sample) {
      throw new Error('Generation completed but no image URL returned');
    }

    const imageBuffer = await this.downloadImage(result.result.sample);

    return { taskId: task.id, result, imageBuffer };
  }

  async getTaskStatus(taskId: string): Promise<TaskResult> {
    const pollingUrl = `${this.baseUrl}/get_result?id=${taskId}`;

    const response = await fetch(pollingUrl, {
      method: 'GET',
      headers: { 'x-key': this.apiKey },
    });

    if (!response.ok) {
      const errorBody = await response.text().catch(() => undefined);
      throw new FluxApiError(response.status, response.statusText, errorBody);
    }

    return response.json() as Promise<TaskResult>;
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  public resetActiveTasks(): void {
    this.activeTasks = 0;
  }
}

export function createFluxClient(overrides?: Partial<FluxConfig>): FluxClient {
  const apiKey = overrides?.apiKey ?? process.env.BFL_API_KEY;

  if (!apiKey) {
    throw new Error('BFL_API_KEY environment variable is required');
  }

  return new FluxClient({
    apiKey,
    region: (overrides?.region ?? process.env.FLUX_API_REGION) as 'global' | 'eu' | 'us' | undefined,
    maxConcurrent: overrides?.maxConcurrent,
    baseUrl: overrides?.baseUrl,
  });
}
