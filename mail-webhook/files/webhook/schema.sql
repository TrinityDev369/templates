-- Trinity Mail — webhook receiver schema (delivery events + suppression).
--
-- Driven by the relay's signature-verified webhooks. Three tables:
--   email_logs       — one row per message; status reflects the lifecycle
--                      high-water mark (never regresses).
--   email_events     — append-only audit of every delivery fact received.
--   mail_suppression — the local mirror of recipients we must not send to.
--
-- DOCTRINE: subjects/bodies are CONTENT. Only delivery FACTS live here. A retained
-- rendered body ("view in browser") is stored ONLY as crypto-shreddable AES-256-GCM
-- ciphertext in the body_* columns — destroying the key (Tresor, Phase C) renders it
-- unreadable, which is how DSGVO erasure works (crypto-shred, not DELETE-and-hope).
--
-- Self-contained: no Trinity-specific functions or triggers. `updated_at` is set by
-- the store code, not a DB trigger, to stay portable across tenant databases.

CREATE TABLE IF NOT EXISTS email_logs (
  idempotency_key     text PRIMARY KEY,         -- the message's stable key (shared with mail-client's outbox)
  project             text NOT NULL,
  category            text,
  recipient           text NOT NULL,
  status              text NOT NULL DEFAULT 'queued', -- queued|sent|delivered|deferred|bounced|complained
  provider_message_id text,
  -- Retained rendered body, AES-256-GCM ciphertext (NULL unless a body is retained):
  body_ciphertext     bytea,
  body_iv             bytea,
  body_tag            bytea,
  created_at          timestamptz NOT NULL DEFAULT now(),
  updated_at          timestamptz NOT NULL DEFAULT now()
);

-- Correlate inbound events to a message by the relay/MTA id.
CREATE INDEX IF NOT EXISTS email_logs_provider_msg_idx
  ON email_logs (provider_message_id);

-- Recipient-centric lookups (history, suppression decisions).
CREATE INDEX IF NOT EXISTS email_logs_recipient_idx
  ON email_logs (recipient);

-- Append-only delivery facts. Dedup is the composite (idempotency_key, type): a
-- redelivered webhook of the same lifecycle type is a no-op, while the many distinct
-- events of one message (queued→sent→delivered…) all persist.
CREATE TABLE IF NOT EXISTS email_events (
  id              text PRIMARY KEY,
  idempotency_key text NOT NULL,               -- the message key (correlates to email_logs); many events per message
  type            text NOT NULL,               -- queued|sent|delivered|deferred|bounced|complained|opened|clicked
  recipient       text NOT NULL,
  reason          text,                        -- bounce diagnostic / defer reason (a fact, not content)
  occurred_at     timestamptz NOT NULL,
  raw             jsonb NOT NULL,              -- the verified payload, for audit
  UNIQUE (idempotency_key, type)
);

CREATE INDEX IF NOT EXISTS email_events_recipient_idx
  ON email_events (recipient);

CREATE INDEX IF NOT EXISTS email_events_type_idx
  ON email_events (type);

-- Local suppression mirror. The relay holds the global list; this is the tenant's
-- check-before-send copy, populated from hard bounces + complaints.
CREATE TABLE IF NOT EXISTS mail_suppression (
  recipient   text PRIMARY KEY,
  reason      text NOT NULL,                   -- hard_bounce | complaint | manual
  source      text NOT NULL,                   -- events_webhook | bounce_webhook | manual
  created_at  timestamptz NOT NULL DEFAULT now()
);
