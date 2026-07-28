/**
 * @trinity369/use chatbot-db — Seed Script
 *
 * Creates a sample conversation with 4 messages for testing.
 * Run standalone: npx tsx seed.ts
 *
 * Requires DATABASE_URL environment variable pointing to a
 * PostgreSQL database with the chatbot tables already created
 * (via migration.sql or Prisma migrate).
 *
 * Supports both Prisma and raw SQL modes:
 *   - If @prisma/client is available, uses ChatbotRepository (Prisma)
 *   - Otherwise, falls back to ChatbotRepositorySQL with pg
 *
 * For simple testing, set DATABASE_URL and run:
 *   DATABASE_URL=postgres://user:pass@localhost:5432/mydb npx tsx seed.ts
 */

import {
  ChatbotRepositorySQL,
  type QueryFn,
  type ConversationWithMessages,
} from './repository';

// ---------------------------------------------------------------------------
// Configuration
// ---------------------------------------------------------------------------

const SAMPLE_SESSION_ID = 'seed-session-001';
const SAMPLE_USER_ID = 'seed-user-001';
const SAMPLE_MODEL = 'claude-sonnet-4-6';

const SAMPLE_MESSAGES: Array<{
  role: 'user' | 'assistant' | 'system';
  content: string;
  tokensUsed?: number;
}> = [
  {
    role: 'user',
    content: 'Hi there! I have a question about your services.',
    tokensUsed: 12,
  },
  {
    role: 'assistant',
    content:
      'Hello! Welcome — I\'d be happy to help you with any questions about our services. What would you like to know?',
    tokensUsed: 28,
  },
  {
    role: 'user',
    content: 'What pricing plans do you offer for small businesses?',
    tokensUsed: 10,
  },
  {
    role: 'assistant',
    content:
      'We offer three plans for small businesses:\n\n' +
      '1. **Starter** — Free for up to 100 conversations/month\n' +
      '2. **Growth** — $49/month for up to 1,000 conversations with analytics\n' +
      '3. **Pro** — $149/month for unlimited conversations, priority support, and custom branding\n\n' +
      'All plans include our core chatbot features. Would you like more details on any specific plan?',
    tokensUsed: 87,
  },
];

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main(): Promise<void> {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    console.error(
      'ERROR: DATABASE_URL environment variable is required.\n' +
        'Example: DATABASE_URL=postgres://user:pass@localhost:5432/mydb npx tsx seed.ts'
    );
    process.exit(1);
  }

  console.log('Chatbot DB Seed');
  console.log('================');
  console.log(`Database: ${maskConnectionString(databaseUrl)}`);
  console.log('');

  // Use dynamic import for pg to avoid hard dependency
  let queryFn: QueryFn;
  let cleanup: () => Promise<void>;

  try {
    const pg = await import('pg');
    const Pool = pg.default?.Pool ?? pg.Pool;
    const pool = new Pool({ connectionString: databaseUrl });

    queryFn = async (sql: string, params?: unknown[]) => {
      const result = await pool.query(sql, params);
      return result.rows as Array<Record<string, unknown>>;
    };

    cleanup = async () => {
      await pool.end();
    };

    // Verify connection
    await queryFn('SELECT 1');
    console.log('Connected to PostgreSQL.');
  } catch (err) {
    console.error(
      'Failed to connect to PostgreSQL. Ensure:\n' +
        '  1. DATABASE_URL is correct\n' +
        '  2. pg package is installed: npm install pg\n' +
        '  3. The database is running and accessible\n'
    );
    console.error(err instanceof Error ? err.message : String(err));
    process.exit(1);
  }

  const repo = new ChatbotRepositorySQL(queryFn);

  try {
    // Check if seed data already exists
    const existing = await repo.getConversationBySession(SAMPLE_SESSION_ID);
    if (existing) {
      console.log(
        `Seed conversation already exists (id: ${existing.id}). Skipping.`
      );
      printConversation(existing);
      await cleanup();
      return;
    }

    // Create conversation
    console.log('Creating sample conversation...');
    const conversation = await repo.createConversation(
      SAMPLE_SESSION_ID,
      SAMPLE_USER_ID
    );
    console.log(`  Conversation ID: ${conversation.id}`);

    // Add messages
    for (const msg of SAMPLE_MESSAGES) {
      const message = await repo.addMessage(
        conversation.id,
        msg.role,
        msg.content,
        {
          tokensUsed: msg.tokensUsed,
          model: msg.role === 'assistant' ? SAMPLE_MODEL : undefined,
        }
      );
      console.log(
        `  Message #${message.sequence} (${message.role}): ${message.content.slice(0, 50)}...`
      );
    }

    // Verify by reading back
    console.log('');
    console.log('Verifying seed data...');
    const seeded = await repo.getConversation(conversation.id);
    if (!seeded) {
      console.error('ERROR: Failed to read back seeded conversation.');
      process.exit(1);
    }

    printConversation(seeded);

    // Show stats
    const stats = await repo.getConversationStats();
    console.log('');
    console.log('Database stats:');
    console.log(`  Total conversations: ${stats.totalConversations}`);
    console.log(`  Total messages: ${stats.totalMessages}`);
    console.log(
      `  Avg messages/conversation: ${stats.avgMessagesPerConversation}`
    );

    console.log('');
    console.log('Seed complete.');
  } catch (err) {
    console.error('Seed failed:', err instanceof Error ? err.message : String(err));
    process.exit(1);
  } finally {
    await cleanup();
  }
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function printConversation(conv: ConversationWithMessages): void {
  console.log('');
  console.log(`Conversation: ${conv.id}`);
  console.log(`  Session:  ${conv.sessionId}`);
  console.log(`  User:     ${conv.userId ?? '(anonymous)'}`);
  console.log(`  Status:   ${conv.status}`);
  console.log(`  Messages: ${conv.messages.length}`);
  console.log('');
  for (const msg of conv.messages) {
    const preview =
      msg.content.length > 80
        ? msg.content.slice(0, 77) + '...'
        : msg.content;
    console.log(`  [${msg.sequence}] ${msg.role}: ${preview}`);
  }
}

function maskConnectionString(url: string): string {
  try {
    const parsed = new URL(url);
    if (parsed.password) {
      parsed.password = '****';
    }
    return parsed.toString();
  } catch {
    return '(invalid URL)';
  }
}

// ---------------------------------------------------------------------------
// Run
// ---------------------------------------------------------------------------

main();
