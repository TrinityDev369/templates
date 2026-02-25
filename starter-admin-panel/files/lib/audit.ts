import getDb from "@/lib/db";
import type { AuditLog } from "@/types";
import { mockAuditLogs } from "@/lib/mock-audit-data";

interface LogActionParams {
  userId: string | null;
  action: string;
  entityType?: string;
  entityId?: string;
  metadata?: Record<string, unknown>;
  ipAddress?: string;
}

const memoryLog: LogActionParams[] = [];

export async function logAction(params: LogActionParams) {
  try {
    const sql = getDb();
    await sql`
      INSERT INTO audit_logs (user_id, action, entity_type, entity_id, metadata, ip_address)
      VALUES (
        ${params.userId},
        ${params.action},
        ${params.entityType ?? null},
        ${params.entityId ?? null},
        ${JSON.stringify(params.metadata ?? {})}::jsonb,
        ${params.ipAddress ?? null}
      )
    `;
  } catch {
    memoryLog.push(params);
  }
}

export async function getAuditLogs(filters?: {
  action?: string;
  entityType?: string;
  limit?: number;
  offset?: number;
}): Promise<AuditLog[]> {
  const limit = filters?.limit ?? 50;
  const offset = filters?.offset ?? 0;

  try {
    const sql = getDb();
    const rows = await sql`
      SELECT
        a.id, a.user_id, u.email AS user_email, u.name AS user_name,
        a.action, a.entity_type, a.entity_id, a.metadata, a.ip_address, a.created_at
      FROM audit_logs a
      LEFT JOIN users u ON u.id = a.user_id
      WHERE (${filters?.action ?? null}::text IS NULL OR a.action = ${filters?.action ?? null})
        AND (${filters?.entityType ?? null}::text IS NULL OR a.entity_type = ${filters?.entityType ?? null})
      ORDER BY a.created_at DESC
      LIMIT ${limit} OFFSET ${offset}
    `;
    return rows as unknown as AuditLog[];
  } catch {
    return mockAuditLogs
      .filter((l) => !filters?.action || l.action === filters.action)
      .filter((l) => !filters?.entityType || l.entity_type === filters.entityType)
      .slice(offset, offset + limit);
  }
}
