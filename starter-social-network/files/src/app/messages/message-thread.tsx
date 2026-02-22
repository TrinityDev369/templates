import sql from "@/lib/db";

// TODO: replace with your auth provider
const userId = 1;

interface ThreadMessage {
  id: number;
  sender_id: number;
  content: string;
  created_at: Date;
}

async function getMessages(partnerId: number): Promise<ThreadMessage[]> {
  // Mark messages as read
  await sql`
    UPDATE messages
    SET read_at = NOW()
    WHERE sender_id = ${partnerId}
      AND receiver_id = ${userId}
      AND read_at IS NULL
  `;

  return sql<ThreadMessage[]>`
    SELECT id, sender_id, content, created_at
    FROM messages
    WHERE (sender_id = ${userId} AND receiver_id = ${partnerId})
       OR (sender_id = ${partnerId} AND receiver_id = ${userId})
    ORDER BY created_at ASC
    LIMIT 50
  `;
}

async function getPartner(partnerId: number) {
  const rows = await sql<{ display_name: string }[]>`
    SELECT display_name FROM users WHERE id = ${partnerId}
  `;
  return rows[0] ?? null;
}

export default async function MessageThread({
  partnerId,
}: {
  partnerId: number;
}) {
  const [messages, partner] = await Promise.all([
    getMessages(partnerId),
    getPartner(partnerId),
  ]);

  if (!partner) {
    return <p className="text-gray-500">User not found.</p>;
  }

  return (
    <div>
      <h2 className="mb-4 border-b border-gray-100 pb-2 font-semibold">
        {partner.display_name}
      </h2>
      <div className="space-y-3">
        {messages.length === 0 ? (
          <p className="text-sm text-gray-400">
            No messages yet. Start the conversation!
          </p>
        ) : (
          messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${
                msg.sender_id === userId ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`max-w-xs rounded-lg px-3 py-2 text-sm ${
                  msg.sender_id === userId
                    ? "bg-indigo-600 text-white"
                    : "bg-gray-100 text-gray-800"
                }`}
              >
                {msg.content}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
