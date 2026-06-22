-- Trinity Mail — outbox (at-least-once delivery).
--
-- The outbox makes sends durable across a transient relay/network hiccup: a row is
-- persisted before delivery, retried with backoff, and dead-lettered on exhaustion.
-- It is OPERATIONAL, not an archive — `message` is cleared (NULL) the moment a send
-- succeeds, so no body/subject lingers here (doctrine: the outbox is not a retention
-- store). The idempotency_key survives so a retry never double-sends.
--
-- Self-contained: no Trinity-specific functions or triggers. `updated_at` is set by
-- the store code, not a DB trigger, to stay portable across tenant databases.

CREATE TABLE IF NOT EXISTS mail_outbox (
  id                  text PRIMARY KEY,
  idempotency_key     text NOT NULL UNIQUE,
  status              text NOT NULL DEFAULT 'queued',  -- queued | sending | sent | dead
  attempts            int  NOT NULL DEFAULT 0,
  next_attempt_at     bigint NOT NULL,                 -- epoch ms
  message             jsonb,                           -- NULL once sent (not an archive)
  provider_message_id text,
  last_error          text,
  created_at          timestamptz NOT NULL DEFAULT now(),
  updated_at          timestamptz NOT NULL DEFAULT now()
);

-- Hot path: the worker claims due, queued rows.
CREATE INDEX IF NOT EXISTS mail_outbox_due_idx
  ON mail_outbox (next_attempt_at)
  WHERE status = 'queued';
