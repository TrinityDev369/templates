/**
 * Thumbnail Database Queries
 *
 * Self-contained CRUD with pg Pool. No external DB dependencies.
 */

import { Pool } from 'pg';

// ============================================================================
// Pool Setup
// ============================================================================

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// ============================================================================
// Helpers
// ============================================================================

function toCamelCase<T>(row: Record<string, unknown>): T {
  const result: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(row)) {
    const camelKey = key.replace(/_([a-z])/g, (_, c) => c.toUpperCase());
    result[camelKey] = value;
  }
  return result as T;
}

function toSnakeCase(key: string): string {
  return key.replace(/[A-Z]/g, (c) => `_${c.toLowerCase()}`);
}

async function query<T>(sql: string, params: unknown[] = []): Promise<T[]> {
  const result = await pool.query(sql, params);
  return result.rows.map((row) => toCamelCase<T>(row));
}

async function queryOne<T>(sql: string, params: unknown[] = []): Promise<T | null> {
  const rows = await query<T>(sql, params);
  return rows[0] ?? null;
}

function generateReadableId(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let id = 'TH-';
  for (let i = 0; i < 6; i++) {
    id += chars[Math.floor(Math.random() * chars.length)];
  }
  return id;
}

// ============================================================================
// Types
// ============================================================================

export interface CreateThumbnailData {
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

// ============================================================================
// THUMBNAIL CRUD
// ============================================================================

export async function listThumbnails(filters: {
  preset?: string;
  model?: string;
  generatedBy?: string;
  search?: string;
  dateFrom?: string;
  dateTo?: string;
  page?: number;
  limit?: number;
} = {}): Promise<{
  thumbnails: Record<string, unknown>[];
  total: number;
  page: number;
  limit: number;
}> {
  const page = filters.page || 1;
  const limit = filters.limit || 20;
  const offset = (page - 1) * limit;

  let sql = `SELECT * FROM generated_thumbnails WHERE deleted_at IS NULL`;
  const params: unknown[] = [];
  let paramIndex = 1;

  if (filters.preset) {
    sql += ` AND preset = $${paramIndex}`;
    params.push(filters.preset);
    paramIndex++;
  }

  if (filters.model) {
    sql += ` AND model = $${paramIndex}`;
    params.push(filters.model);
    paramIndex++;
  }

  if (filters.generatedBy) {
    sql += ` AND generated_by = $${paramIndex}`;
    params.push(filters.generatedBy);
    paramIndex++;
  }

  if (filters.search) {
    sql += ` AND (prompt ILIKE $${paramIndex} OR enhanced_prompt ILIKE $${paramIndex})`;
    params.push(`%${filters.search}%`);
    paramIndex++;
  }

  if (filters.dateFrom) {
    sql += ` AND created_at >= $${paramIndex}`;
    params.push(filters.dateFrom);
    paramIndex++;
  }

  if (filters.dateTo) {
    sql += ` AND created_at <= $${paramIndex}`;
    params.push(filters.dateTo);
    paramIndex++;
  }

  const countSql = sql.replace(/SELECT[\s\S]+?FROM/, 'SELECT COUNT(*) as count FROM');
  const countResult = await queryOne<{ count: string }>(countSql, params);
  const total = parseInt(countResult?.count || '0', 10);

  sql += ` ORDER BY created_at DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
  params.push(limit, offset);

  const thumbnails = await query<Record<string, unknown>>(sql, params);

  return { thumbnails, total, page, limit };
}

export async function getThumbnailById(id: string): Promise<Record<string, unknown> | null> {
  return queryOne<Record<string, unknown>>(
    `SELECT * FROM generated_thumbnails WHERE id = $1 AND deleted_at IS NULL`,
    [id],
  );
}

export async function getThumbnailWithVersions(id: string): Promise<(Record<string, unknown> & { versions: Record<string, unknown>[] }) | null> {
  const thumbnail = await getThumbnailById(id);
  if (!thumbnail) return null;

  const versions = await getThumbnailVersions(id);

  return { ...thumbnail, versions };
}

export async function createThumbnail(data: CreateThumbnailData): Promise<Record<string, unknown>> {
  const readableId = generateReadableId();

  const result = await pool.query(
    `INSERT INTO generated_thumbnails
     (readable_id, prompt, enhanced_prompt, preset, width, height, model, seed,
      s3_key, s3_bucket, file_size_bytes, generation_time_ms, cost_cents,
      parent_id, feedback, metadata, generation_params, generated_by)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18)
     RETURNING *`,
    [
      readableId,
      data.prompt,
      data.enhancedPrompt || null,
      data.preset || null,
      data.width,
      data.height,
      data.model,
      data.seed || null,
      data.s3Key,
      data.s3Bucket,
      data.fileSizeBytes || null,
      data.generationTimeMs || null,
      data.costCents || null,
      data.parentId || null,
      data.feedback || null,
      JSON.stringify(data.metadata || {}),
      data.generationParams ? JSON.stringify(data.generationParams) : null,
      data.generatedBy || 'user',
    ],
  );

  return toCamelCase(result.rows[0]);
}

export async function updateThumbnail(
  id: string,
  data: { feedback?: string; metadata?: Record<string, unknown> },
): Promise<Record<string, unknown> | null> {
  const sets: string[] = [];
  const params: unknown[] = [];
  let paramIndex = 1;

  if (data.feedback !== undefined) {
    sets.push(`feedback = $${paramIndex}`);
    params.push(data.feedback);
    paramIndex++;
  }

  if (data.metadata !== undefined) {
    sets.push(`metadata = $${paramIndex}`);
    params.push(JSON.stringify(data.metadata));
    paramIndex++;
  }

  if (sets.length === 0) return getThumbnailById(id);

  params.push(id);
  const result = await pool.query(
    `UPDATE generated_thumbnails SET ${sets.join(', ')} WHERE id = $${paramIndex} AND deleted_at IS NULL RETURNING *`,
    params,
  );

  return result.rows[0] ? toCamelCase(result.rows[0]) : null;
}

export async function deleteThumbnail(id: string): Promise<boolean> {
  const result = await pool.query(
    `UPDATE generated_thumbnails SET deleted_at = NOW() WHERE id = $1 AND deleted_at IS NULL RETURNING id`,
    [id],
  );
  return result.rows.length > 0;
}

// ============================================================================
// VERSION MANAGEMENT
// ============================================================================

export async function getThumbnailVersions(thumbnailId: string): Promise<Record<string, unknown>[]> {
  return query<Record<string, unknown>>(
    `SELECT * FROM thumbnail_versions WHERE thumbnail_id = $1 ORDER BY version DESC`,
    [thumbnailId],
  );
}

export async function createThumbnailVersion(
  thumbnailId: string,
  data: {
    s3Key: string;
    s3Bucket: string;
    fileSizeBytes?: number;
    prompt?: string;
    feedback?: string;
    generationTimeMs?: number;
    costCents?: number;
    seed?: number;
  },
): Promise<{ thumbnail: Record<string, unknown>; version: Record<string, unknown> }> {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    const currentResult = await client.query(
      `SELECT * FROM generated_thumbnails WHERE id = $1 AND deleted_at IS NULL FOR UPDATE`,
      [thumbnailId],
    );
    if (currentResult.rows.length === 0) {
      throw new Error('Thumbnail not found');
    }
    const current = currentResult.rows[0];

    const versionResult = await client.query(
      `INSERT INTO thumbnail_versions
       (thumbnail_id, version, s3_key, s3_bucket, file_size_bytes, prompt, feedback)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [
        thumbnailId,
        current.version,
        current.s3_key,
        current.s3_bucket,
        current.file_size_bytes,
        current.prompt,
        data.feedback || null,
      ],
    );

    const updatedResult = await client.query(
      `UPDATE generated_thumbnails
       SET s3_key = $1, s3_bucket = $2, file_size_bytes = $3, version = version + 1,
           prompt = COALESCE($4, prompt), feedback = $5,
           generation_time_ms = COALESCE($6, generation_time_ms),
           cost_cents = COALESCE($7, cost_cents),
           seed = COALESCE($8, seed),
           updated_at = NOW()
       WHERE id = $9 RETURNING *`,
      [
        data.s3Key,
        data.s3Bucket,
        data.fileSizeBytes || null,
        data.prompt || null,
        data.feedback || null,
        data.generationTimeMs || null,
        data.costCents || null,
        data.seed || null,
        thumbnailId,
      ],
    );

    await client.query('COMMIT');

    return {
      thumbnail: toCamelCase(updatedResult.rows[0]),
      version: toCamelCase(versionResult.rows[0]),
    };
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}

// ============================================================================
// STATISTICS
// ============================================================================

export async function getThumbnailStats(): Promise<{
  total: number;
  byPreset: Record<string, number>;
  byModel: Record<string, number>;
  totalSizeBytes: number;
  totalCostCents: number;
}> {
  const totalResult = await queryOne<{ count: string; totalSize: string; totalCost: string }>(
    `SELECT COUNT(*) as count,
            COALESCE(SUM(file_size_bytes), 0) as total_size,
            COALESCE(SUM(cost_cents), 0) as total_cost
     FROM generated_thumbnails WHERE deleted_at IS NULL`,
  );

  const presetResult = await query<{ preset: string; count: string }>(
    `SELECT COALESCE(preset, 'custom') as preset, COUNT(*) as count
     FROM generated_thumbnails WHERE deleted_at IS NULL
     GROUP BY preset`,
  );

  const modelResult = await query<{ model: string; count: string }>(
    `SELECT model, COUNT(*) as count
     FROM generated_thumbnails WHERE deleted_at IS NULL
     GROUP BY model`,
  );

  return {
    total: parseInt(totalResult?.count || '0', 10),
    byPreset: Object.fromEntries(
      presetResult.map((r) => [r.preset || 'custom', parseInt(r.count, 10)]),
    ),
    byModel: Object.fromEntries(
      modelResult.map((r) => [r.model, parseInt(r.count, 10)]),
    ),
    totalSizeBytes: parseInt(totalResult?.totalSize || '0', 10),
    totalCostCents: parseInt(totalResult?.totalCost || '0', 10),
  };
}
