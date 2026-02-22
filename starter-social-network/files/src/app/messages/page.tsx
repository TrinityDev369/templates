import Link from "next/link";
import sql from "@/lib/db";
import MessageThread from "./message-thread";

// TODO: replace with your auth provider
const userId = 1;

export const dynamic = "force-dynamic";

interface Conversation {
  partner_id: number;
  partner_username: string;
  partner_display_name: string;
  last_message: string;
  last_message_at: Date;
  unread_count: number;
}

async function getConversations(): Promise<Conversation[]> {
  return sql<Conversation[]>`
    WITH ranked_messages AS (
      SELECT
        m.*,
        CASE
          WHEN m.sender_id = ${userId} THEN m.receiver_id
          ELSE m.sender_id
        END AS partner_id,
        ROW_NUMBER() OVER (
          PARTITION BY LEAST(m.sender_id, m.receiver_id), GREATEST(m.sender_id, m.receiver_id)
          ORDER BY m.created_at DESC
        ) AS rn
      FROM messages m
      WHERE m.sender_id = ${userId} OR m.receiver_id = ${userId}
    )
    SELECT
      rm.partner_id,
      u.username AS partner_username,
      u.display_name AS partner_display_name,
      rm.content AS last_message,
      rm.created_at AS last_message_at,
      COALESCE(unread.cnt, 0)::int AS unread_count
    FROM ranked_messages rm
    JOIN users u ON u.id = rm.partner_id
    LEFT JOIN (
      SELECT sender_id, COUNT(*) AS cnt
      FROM messages
      WHERE receiver_id = ${userId} AND read_at IS NULL
      GROUP BY sender_id
    ) unread ON unread.sender_id = rm.partner_id
    WHERE rm.rn = 1
    ORDER BY rm.created_at DESC
  `;
}

export default async function MessagesPage({
  searchParams,
}: {
  searchParams: Promise<{ user?: string }>;
}) {
  const { user: selectedUserParam } = await searchParams;
  const conversations = await getConversations();
  const selectedUserId = selectedUserParam
    ? parseInt(selectedUserParam, 10)
    : null;

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Messages</h1>
      <div className="grid gap-4 md:grid-cols-3">
        <div className="space-y-2 md:col-span-1">
          {conversations.length === 0 ? (
            <p className="text-sm text-gray-500">No conversations yet.</p>
          ) : (
            conversations.map((convo) => (
              <Link
                key={convo.partner_id}
                href={`/messages?user=${convo.partner_id}`}
                className={`block rounded-lg border p-3 transition hover:bg-gray-50 ${
                  selectedUserId === convo.partner_id
                    ? "border-indigo-300 bg-indigo-50"
                    : "border-gray-200 bg-white"
                }`}
              >
                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-xs font-bold text-indigo-600">
                    {convo.partner_display_name.charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-semibold">
                        {convo.partner_display_name}
                      </span>
                      {convo.unread_count > 0 && (
                        <span className="rounded-full bg-indigo-600 px-2 py-0.5 text-xs text-white">
                          {convo.unread_count}
                        </span>
                      )}
                    </div>
                    <p className="truncate text-xs text-gray-500">
                      {convo.last_message}
                    </p>
                  </div>
                </div>
              </Link>
            ))
          )}
        </div>

        <div className="rounded-lg border border-gray-200 bg-white p-4 md:col-span-2">
          {selectedUserId ? (
            <MessageThread partnerId={selectedUserId} />
          ) : (
            <div className="flex h-64 items-center justify-center text-gray-400">
              Select a conversation to start messaging
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
