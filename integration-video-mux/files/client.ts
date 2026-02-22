import type { MuxConfig, UploadResult, Asset } from "./types";

const MUX_BASE_URL = "https://api.mux.com/video/v1";

function authHeader(config: MuxConfig): string {
  const encoded = Buffer.from(`${config.tokenId}:${config.tokenSecret}`).toString("base64");
  return `Basic ${encoded}`;
}

async function muxFetch<T>(
  config: MuxConfig,
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const url = `${MUX_BASE_URL}${path}`;
  const response = await fetch(url, {
    ...options,
    headers: {
      Authorization: authHeader(config),
      "Content-Type": "application/json",
      ...options.headers,
    },
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Mux API error ${response.status}: ${body}`);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json() as Promise<T>;
}

function toAsset(raw: Record<string, unknown>): Asset {
  const playbackIds = raw.playback_ids as Array<{ id: string }> | undefined;
  return {
    id: raw.id as string,
    playbackId: playbackIds?.[0]?.id ?? "",
    status: raw.status as Asset["status"],
    duration: raw.duration as number | undefined,
    aspectRatio: raw.aspect_ratio as string | undefined,
    createdAt: raw.created_at as string,
  };
}

/**
 * Create a direct upload URL. Clients can PUT a video file to the returned
 * `uploadUrl` without needing server-side credentials.
 */
export async function createUploadUrl(config: MuxConfig): Promise<UploadResult> {
  const body = {
    new_asset_settings: {
      playback_policy: ["public"],
    },
    cors_origin: "*",
  };

  const data = await muxFetch<{ data: { id: string; url: string } }>(
    config,
    "/uploads",
    { method: "POST", body: JSON.stringify(body) },
  );

  return {
    uploadId: data.data.id,
    uploadUrl: data.data.url,
  };
}

/**
 * Retrieve the current status and metadata of an asset.
 */
export async function getAsset(config: MuxConfig, assetId: string): Promise<Asset> {
  const data = await muxFetch<{ data: Record<string, unknown> }>(
    config,
    `/assets/${encodeURIComponent(assetId)}`,
  );

  return toAsset(data.data);
}

/**
 * List recent assets. Defaults to the 20 most recent.
 */
export async function listAssets(config: MuxConfig, limit = 20): Promise<Asset[]> {
  const data = await muxFetch<{ data: Array<Record<string, unknown>> }>(
    config,
    `/assets?limit=${limit}`,
  );

  return data.data.map(toAsset);
}

/**
 * Permanently delete an asset and all its associated resources.
 */
export async function deleteAsset(config: MuxConfig, assetId: string): Promise<void> {
  await muxFetch<void>(
    config,
    `/assets/${encodeURIComponent(assetId)}`,
    { method: "DELETE" },
  );
}
