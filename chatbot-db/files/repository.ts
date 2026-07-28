/**
 * @trinity369/use chatbot-db — Repository
 *
 * Database access layer for chatbot conversations and messages.
 * Two implementations:
 *   - ChatbotRepository   — uses Prisma (default, recommended)
 *   - ChatbotRepositorySQL — uses raw SQL via a query function (for non-Prisma projects)
 *
 * Usage (Prisma):
 *   import { PrismaClient } from '@prisma/client';
 *   import { ChatbotRepository } from './repository';
 *   const repo = new ChatbotRepository(new PrismaClient());
 *
 * Usage (Raw SQL):
 *   import { ChatbotRepositorySQL } from './repository';
 *   const repo = new ChatbotRepositorySQL(async (sql, params) => {
 *     const result = await pool.query(sql, params);
 *     return result.rows;
 *   });
 */

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type ConversationStatus = 'active' | 'archived' | 'closed';
export type MessageRole = 'user' | 'assistant' | 'system';

export interface Conversation {
  id: string;
  sessionId: string;
  userId: string | null;
  title: string | null;
  status: ConversationStatus;
  metadata: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}

export interface ConversationWithMessages extends Conversation {
  messages: Message[];
}

export interface Message {
  id: string;
  conversationId: string;
  role: MessageRole;
  content: string;
  tokensUsed: number | null;
  model: string | null;
  sequence: number;
  metadata: Record<string, unknown>;
  createdAt: Date;
}

export interface AddMessageOptions {
  tokensUsed?: number;
  model?: string;
  metadata?: Record<string, unknown>;
}

export interface ConversationStats {
  totalConversations: number;
  totalMessages: number;
  avgMessagesPerConversation: number;
  escalationRate: number;
  conversationsByStatus: Record<ConversationStatus, number>;
}

// ---------------------------------------------------------------------------
// Prisma row types — match the DB columns so Prisma returns are typed
// ---------------------------------------------------------------------------

/** Row shape returned by Prisma for chatbot_conversations. */
export interface ConversationRow {
  id: string;
  sessionId: string;
  userId: string | null;
  title: string | null;
  status: string;
  metadata: Record<string, unknown> | null;
  createdAt: Date;
  updatedAt: Date;
}

/** ConversationRow with its related messages included. */
export interface ConversationRowWithMessages extends ConversationRow {
  messages?: MessageRow[];
}

/** Row shape returned by Prisma for chatbot_messages. */
export interface MessageRow {
  id: string;
  conversationId: string;
  role: string;
  content: string;
  tokensUsed: number | null;
  model: string | null;
  sequence: number;
  metadata: Record<string, unknown> | null;
  createdAt: Date;
}

/** Input data for creating a conversation. */
export interface ConversationCreateInput {
  sessionId: string;
  userId?: string | null;
  title?: string | null;
  status?: string;
  metadata?: Record<string, unknown>;
}

/** Filter conditions for conversation queries. */
export interface ConversationWhere {
  id?: string;
  sessionId?: string;
  userId?: string | null;
  status?: string;
  createdAt?: { gte?: Date; lt?: Date };
}

/** Sort options for conversation queries. */
export interface ConversationOrderBy {
  createdAt?: 'asc' | 'desc';
  updatedAt?: 'asc' | 'desc';
}

/** Relation includes for conversation queries. */
export interface ConversationInclude {
  messages?: boolean | { orderBy?: MessageOrderBy };
}

/** Sort options for message queries. */
export interface MessageOrderBy {
  sequence?: 'asc' | 'desc';
  createdAt?: 'asc' | 'desc';
}

/** Filter conditions for message queries. */
export interface MessageWhere {
  conversationId?: string;
  role?: string;
  conversation?: ConversationWhere;
}

/** Input data for creating a message. */
export interface MessageCreateInput {
  conversationId: string;
  role: string;
  content: string;
  sequence: number;
  tokensUsed?: number | null;
  model?: string | null;
  metadata?: Record<string, unknown>;
}

/** Result shape from groupBy queries. */
export interface GroupByResult {
  status?: string;
  _count: Record<string, number>;
}

/** Aggregate result for message queries. */
export interface AggregateResult {
  _sum?: Record<string, number | null>;
  _avg?: Record<string, number | null>;
  _count?: number;
}

// ---------------------------------------------------------------------------
// Prisma delegate interfaces — typed replacements for Record<string, unknown>
// ---------------------------------------------------------------------------

interface PrismaConversationDelegate {
  create(args: { data: ConversationCreateInput }): Promise<ConversationRow>;
  findUnique(args: {
    where: { id: string };
    include?: ConversationInclude;
  }): Promise<ConversationRowWithMessages | null>;
  findFirst(args: {
    where: ConversationWhere;
    orderBy?: ConversationOrderBy;
    include?: ConversationInclude;
  }): Promise<ConversationRowWithMessages | null>;
  update(args: {
    where: { id: string };
    data: Partial<ConversationCreateInput>;
  }): Promise<ConversationRow>;
  deleteMany(args: { where: ConversationWhere }): Promise<{ count: number }>;
  count(args?: { where?: ConversationWhere }): Promise<number>;
  groupBy(args: {
    by: string[];
    where?: ConversationWhere;
    _count: Record<string, boolean>;
  }): Promise<GroupByResult[]>;
}

interface PrismaMessageDelegate {
  create(args: { data: MessageCreateInput }): Promise<MessageRow>;
  findMany(args: {
    where: MessageWhere;
    orderBy?: MessageOrderBy;
    take?: number;
    skip?: number;
  }): Promise<MessageRow[]>;
  count(args?: { where?: MessageWhere }): Promise<number>;
  aggregate(args: {
    where?: MessageWhere;
    _sum?: Record<string, boolean>;
    _avg?: Record<string, boolean>;
  }): Promise<AggregateResult>;
}

interface PrismaLike {
  chatbotConversation: PrismaConversationDelegate;
  chatbotMessage: PrismaMessageDelegate;
}

// ---------------------------------------------------------------------------
// Raw SQL query function type
// ---------------------------------------------------------------------------

/**
 * A function that executes a parameterized SQL query and returns rows.
 * Compatible with node-postgres `pool.query(sql, params).then(r => r.rows)`.
 */
export type QueryFn = (
  sql: string,
  params?: unknown[]
) => Promise<Array<Record<string, unknown>>>;

// ---------------------------------------------------------------------------
// ChatbotRepository — Prisma implementation
// ---------------------------------------------------------------------------

export class ChatbotRepository {
  private prisma: PrismaLike;

  constructor(prisma: PrismaLike) {
    this.prisma = prisma;
  }

  /**
   * Create a new conversation.
   */
  async createConversation(
    sessionId: string,
    userId?: string
  ): Promise<Conversation> {
    const record = await this.prisma.chatbotConversation.create({
      data: {
        sessionId,
        userId: userId ?? null,
        status: 'active',
        metadata: {},
      },
    });
    return this.mapConversation(record);
  }

  /**
   * Get a conversation by ID, including all messages ordered by sequence.
   */
  async getConversation(id: string): Promise<ConversationWithMessages | null> {
    const record = await this.prisma.chatbotConversation.findUnique({
      where: { id },
      include: { messages: { orderBy: { sequence: 'asc' } } },
    });
    if (!record) return null;
    return this.mapConversationWithMessages(record);
  }

  /**
   * Get the most recent active conversation for a session.
   */
  async getConversationBySession(
    sessionId: string
  ): Promise<ConversationWithMessages | null> {
    const record = await this.prisma.chatbotConversation.findFirst({
      where: { sessionId, status: 'active' },
      orderBy: { createdAt: 'desc' },
      include: { messages: { orderBy: { sequence: 'asc' } } },
    });
    if (!record) return null;
    return this.mapConversationWithMessages(record);
  }

  /**
   * Add a message to a conversation. Sequence is auto-incremented.
   */
  async addMessage(
    conversationId: string,
    role: MessageRole,
    content: string,
    opts?: AddMessageOptions
  ): Promise<Message> {
    // Get next sequence number
    const lastMessage = await this.prisma.chatbotMessage.findMany({
      where: { conversationId },
      orderBy: { sequence: 'desc' },
      take: 1,
    });
    const nextSequence =
      lastMessage.length > 0
        ? lastMessage[0].sequence + 1
        : 1;

    const record = await this.prisma.chatbotMessage.create({
      data: {
        conversationId,
        role,
        content,
        sequence: nextSequence,
        tokensUsed: opts?.tokensUsed ?? null,
        model: opts?.model ?? null,
        metadata: opts?.metadata ?? {},
      },
    });
    return this.mapMessage(record);
  }

  /**
   * Get messages for a conversation, ordered by sequence.
   */
  async getMessages(
    conversationId: string,
    limit?: number,
    offset?: number
  ): Promise<Message[]> {
    const query: Parameters<PrismaMessageDelegate['findMany']>[0] = {
      where: { conversationId },
      orderBy: { sequence: 'asc' },
    };
    if (limit !== undefined) query.take = limit;
    if (offset !== undefined) query.skip = offset;

    const records = await this.prisma.chatbotMessage.findMany(query);
    return records.map((r) => this.mapMessage(r));
  }

  /**
   * Archive a conversation (sets status to 'archived').
   */
  async archiveConversation(id: string): Promise<Conversation> {
    const record = await this.prisma.chatbotConversation.update({
      where: { id },
      data: { status: 'archived' },
    });
    return this.mapConversation(record);
  }

  /**
   * Get conversation statistics since a given date.
   */
  async getConversationStats(since?: Date): Promise<ConversationStats> {
    const where = since ? { createdAt: { gte: since } } : {};

    const [totalConversations, totalMessages, statusGroups] = await Promise.all([
      this.prisma.chatbotConversation.count({ where }),
      this.prisma.chatbotMessage.count({
        where: since
          ? { conversation: { createdAt: { gte: since } } }
          : {},
      }),
      this.prisma.chatbotConversation.groupBy({
        by: ['status'],
        where,
        _count: { id: true },
      }),
    ]);

    const conversationsByStatus: Record<ConversationStatus, number> = {
      active: 0,
      archived: 0,
      closed: 0,
    };

    for (const group of statusGroups) {
      const status = group.status as ConversationStatus;
      conversationsByStatus[status] = group._count.id;
    }

    // Escalation rate: conversations that were closed (escalated) vs total
    const escalationRate =
      totalConversations > 0
        ? conversationsByStatus.closed / totalConversations
        : 0;

    return {
      totalConversations,
      totalMessages,
      avgMessagesPerConversation:
        totalConversations > 0
          ? Math.round((totalMessages / totalConversations) * 10) / 10
          : 0,
      escalationRate: Math.round(escalationRate * 1000) / 1000,
      conversationsByStatus,
    };
  }

  /**
   * Delete conversations older than a given number of days.
   * Returns the count of deleted conversations.
   */
  async purgeOldConversations(olderThanDays: number): Promise<number> {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - olderThanDays);

    const result = await this.prisma.chatbotConversation.deleteMany({
      where: { createdAt: { lt: cutoff } },
    });
    return result.count;
  }

  // ── Mapping helpers ─────────────────────────────────────────

  private mapConversation(record: ConversationRow): Conversation {
    return {
      id: record.id,
      sessionId: record.sessionId,
      userId: record.userId ?? null,
      title: record.title ?? null,
      status: record.status as ConversationStatus,
      metadata: record.metadata ?? {},
      createdAt: record.createdAt,
      updatedAt: record.updatedAt,
    };
  }

  private mapMessage(record: MessageRow): Message {
    return {
      id: record.id,
      conversationId: record.conversationId,
      role: record.role as MessageRole,
      content: record.content,
      tokensUsed: record.tokensUsed ?? null,
      model: record.model ?? null,
      sequence: record.sequence,
      metadata: record.metadata ?? {},
      createdAt: record.createdAt,
    };
  }

  private mapConversationWithMessages(
    record: ConversationRowWithMessages
  ): ConversationWithMessages {
    const messages = record.messages ?? [];
    return {
      ...this.mapConversation(record),
      messages: messages.map((m) => this.mapMessage(m)),
    };
  }
}

// ---------------------------------------------------------------------------
// ChatbotRepositorySQL — Raw SQL implementation
// ---------------------------------------------------------------------------

export class ChatbotRepositorySQL {
  private query: QueryFn;

  constructor(queryFn: QueryFn) {
    this.query = queryFn;
  }

  /**
   * Create a new conversation.
   */
  async createConversation(
    sessionId: string,
    userId?: string
  ): Promise<Conversation> {
    const rows = await this.query(
      `INSERT INTO chatbot_conversations (session_id, user_id, status, metadata)
       VALUES ($1, $2, 'active', '{}')
       RETURNING *`,
      [sessionId, userId ?? null]
    );
    return this.mapRow(rows[0]);
  }

  /**
   * Get a conversation by ID, including all messages ordered by sequence.
   */
  async getConversation(id: string): Promise<ConversationWithMessages | null> {
    const convRows = await this.query(
      `SELECT * FROM chatbot_conversations WHERE id = $1`,
      [id]
    );
    if (convRows.length === 0) return null;

    const msgRows = await this.query(
      `SELECT * FROM chatbot_messages
       WHERE conversation_id = $1
       ORDER BY sequence ASC`,
      [id]
    );

    return {
      ...this.mapRow(convRows[0]),
      messages: msgRows.map((r) => this.mapMsgRow(r)),
    };
  }

  /**
   * Get the most recent active conversation for a session.
   */
  async getConversationBySession(
    sessionId: string
  ): Promise<ConversationWithMessages | null> {
    const convRows = await this.query(
      `SELECT * FROM chatbot_conversations
       WHERE session_id = $1 AND status = 'active'
       ORDER BY created_at DESC
       LIMIT 1`,
      [sessionId]
    );
    if (convRows.length === 0) return null;

    const conv = convRows[0];
    const msgRows = await this.query(
      `SELECT * FROM chatbot_messages
       WHERE conversation_id = $1
       ORDER BY sequence ASC`,
      [conv.id as string]
    );

    return {
      ...this.mapRow(conv),
      messages: msgRows.map((r) => this.mapMsgRow(r)),
    };
  }

  /**
   * Add a message to a conversation. Sequence is auto-incremented.
   */
  async addMessage(
    conversationId: string,
    role: MessageRole,
    content: string,
    opts?: AddMessageOptions
  ): Promise<Message> {
    // Get next sequence atomically
    const seqRows = await this.query(
      `SELECT COALESCE(MAX(sequence), 0) + 1 AS next_seq
       FROM chatbot_messages
       WHERE conversation_id = $1`,
      [conversationId]
    );
    const nextSequence = Number(seqRows[0].next_seq);

    const rows = await this.query(
      `INSERT INTO chatbot_messages
         (conversation_id, role, content, sequence, tokens_used, model, metadata)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [
        conversationId,
        role,
        content,
        nextSequence,
        opts?.tokensUsed ?? null,
        opts?.model ?? null,
        JSON.stringify(opts?.metadata ?? {}),
      ]
    );
    return this.mapMsgRow(rows[0]);
  }

  /**
   * Get messages for a conversation, ordered by sequence.
   */
  async getMessages(
    conversationId: string,
    limit?: number,
    offset?: number
  ): Promise<Message[]> {
    let sql = `SELECT * FROM chatbot_messages
               WHERE conversation_id = $1
               ORDER BY sequence ASC`;
    const params: unknown[] = [conversationId];

    if (limit !== undefined) {
      sql += ` LIMIT $${params.length + 1}`;
      params.push(limit);
    }
    if (offset !== undefined) {
      sql += ` OFFSET $${params.length + 1}`;
      params.push(offset);
    }

    const rows = await this.query(sql, params);
    return rows.map((r) => this.mapMsgRow(r));
  }

  /**
   * Archive a conversation (sets status to 'archived').
   */
  async archiveConversation(id: string): Promise<Conversation> {
    const rows = await this.query(
      `UPDATE chatbot_conversations
       SET status = 'archived', updated_at = NOW()
       WHERE id = $1
       RETURNING *`,
      [id]
    );
    if (rows.length === 0) {
      throw new Error(`Conversation not found: ${id}`);
    }
    return this.mapRow(rows[0]);
  }

  /**
   * Get conversation statistics since a given date.
   */
  async getConversationStats(since?: Date): Promise<ConversationStats> {
    const dateFilter = since ? `WHERE c.created_at >= $1` : '';
    const params: unknown[] = since ? [since.toISOString()] : [];

    const statsRows = await this.query(
      `SELECT
         COUNT(DISTINCT c.id)::int AS total_conversations,
         COUNT(m.id)::int AS total_messages,
         CASE
           WHEN COUNT(DISTINCT c.id) > 0
           THEN ROUND(COUNT(m.id)::numeric / COUNT(DISTINCT c.id), 1)
           ELSE 0
         END AS avg_messages
       FROM chatbot_conversations c
       LEFT JOIN chatbot_messages m ON m.conversation_id = c.id
       ${dateFilter}`,
      params
    );

    const statusRows = await this.query(
      `SELECT status, COUNT(*)::int AS count
       FROM chatbot_conversations
       ${since ? 'WHERE created_at >= $1' : ''}
       GROUP BY status`,
      params
    );

    const conversationsByStatus: Record<ConversationStatus, number> = {
      active: 0,
      archived: 0,
      closed: 0,
    };

    for (const row of statusRows) {
      const status = row.status as ConversationStatus;
      conversationsByStatus[status] = Number(row.count);
    }

    const totalConversations = Number(statsRows[0].total_conversations);
    const escalationRate =
      totalConversations > 0
        ? Math.round((conversationsByStatus.closed / totalConversations) * 1000) / 1000
        : 0;

    return {
      totalConversations,
      totalMessages: Number(statsRows[0].total_messages),
      avgMessagesPerConversation: Number(statsRows[0].avg_messages),
      escalationRate,
      conversationsByStatus,
    };
  }

  /**
   * Delete conversations older than a given number of days.
   * Returns the count of deleted conversations.
   */
  async purgeOldConversations(olderThanDays: number): Promise<number> {
    const rows = await this.query(
      `WITH deleted AS (
         DELETE FROM chatbot_conversations
         WHERE created_at < NOW() - INTERVAL '1 day' * $1
         RETURNING id
       )
       SELECT COUNT(*)::int AS count FROM deleted`,
      [olderThanDays]
    );
    return Number(rows[0].count);
  }

  // ── Row mapping helpers ───────────────────────────────────

  private mapRow(row: Record<string, unknown>): Conversation {
    return {
      id: row.id as string,
      sessionId: row.session_id as string,
      userId: (row.user_id as string | null) ?? null,
      title: (row.title as string | null) ?? null,
      status: row.status as ConversationStatus,
      metadata: (typeof row.metadata === 'string'
        ? JSON.parse(row.metadata as string)
        : row.metadata) as Record<string, unknown>,
      createdAt: new Date(row.created_at as string),
      updatedAt: new Date(row.updated_at as string),
    };
  }

  private mapMsgRow(row: Record<string, unknown>): Message {
    return {
      id: row.id as string,
      conversationId: row.conversation_id as string,
      role: row.role as MessageRole,
      content: row.content as string,
      tokensUsed: row.tokens_used !== null ? Number(row.tokens_used) : null,
      model: (row.model as string | null) ?? null,
      sequence: Number(row.sequence),
      metadata: (typeof row.metadata === 'string'
        ? JSON.parse(row.metadata as string)
        : row.metadata) as Record<string, unknown>,
      createdAt: new Date(row.created_at as string),
    };
  }
}
