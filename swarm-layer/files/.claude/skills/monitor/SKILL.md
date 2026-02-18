---
name: monitor
description: Monitor swarm agents working on tasks. Measure context efficiency, detect blockers, and fix issues. Run anytime for a health check of the swarm.
---

# Monitor — Swarm Health & Context Efficiency

Observe the field, audit context assembly, detect blockers, and improve the system.

## Workflow

### Step 1: Field Snapshot

```sql
-- Active agents
SELECT agent_id, agent_type, lifecycle_state,
       current_zone_id IS NOT NULL as working,
       turn_count, context_tokens_est,
       now() - last_heartbeat as heartbeat_age
FROM agent_presence
WHERE last_heartbeat > now() - interval '30 minutes'
ORDER BY last_heartbeat DESC;
```

```sql
-- Stuck agents: claimed but no heartbeat in 10+ minutes
SELECT ap.agent_id, ap.lifecycle_state, ap.turn_count,
       fn.title as task_title,
       now() - ap.last_heartbeat as silent_for
FROM agent_presence ap
JOIN field_nodes fn ON fn.id = ap.current_zone_id
WHERE ap.last_heartbeat < now() - interval '10 minutes'
  AND ap.lifecycle_state NOT IN ('terminated', 'winding_down');
```

| State | Action |
|-------|--------|
| Active agents working | Audit their context (Step 2) |
| Stuck agents detected | Diagnose blocker (Step 3) |
| No agents, tasks open | Audit context for open tasks |
| Field empty | Report "nothing to monitor" |

### Step 2: Context Efficiency Audit

Pick up to 3 tasks to audit. Rate each:

| Metric | Good | Warning | Bad |
|--------|------|---------|-----|
| Size | < 8k chars | 8k-14k | > 14k or truncated |
| Bundle precision | All >= 4.0 | 1 below 3.0 | 2+ below 3.0 or 0 matched |
| Assembly speed | < 2s | 2-5s | > 5s |

**Noise detection:**
```sql
SELECT cb.slug, cb.domain, count(fnb.node_id) as attach_count
FROM context_bundles cb
LEFT JOIN field_node_bundles fnb ON fnb.bundle_id = cb.id
JOIN field_nodes fn ON fn.id = fnb.node_id AND fn.state IN ('open','claimed')
GROUP BY cb.slug, cb.domain
HAVING count(fnb.node_id) > 0
ORDER BY attach_count DESC;
```

Red flag: Any bundle attached to > 60% of active tasks has overly generic keywords.

### Step 3: Blocker Detection

**Infrastructure:**
```bash
psql -c "SELECT 1 as db_ok;"
```

**Stuck tasks:**
```sql
SELECT fn.id::text, fn.title, fn.claimed_by, fn.state,
       now() - fn.updated_at as stuck_for
FROM field_nodes fn
WHERE fn.state = 'claimed'
  AND fn.updated_at < now() - interval '1 hour'
  AND NOT EXISTS (
    SELECT 1 FROM agent_presence ap
    WHERE ap.agent_id = fn.claimed_by
      AND ap.last_heartbeat > now() - interval '10 minutes'
  );
```

**Bundle coverage gaps:**
```sql
SELECT fn.id::text, fn.title, fn.affinity, fn.potential
FROM field_nodes fn
WHERE fn.state = 'open'
  AND NOT EXISTS (SELECT 1 FROM field_node_bundles fnb WHERE fnb.node_id = fn.id)
ORDER BY fn.potential DESC;
```

### Step 4: Act on Findings

**Direct fixes:**
- Release stuck claims: `UPDATE field_nodes SET state='open', claimed_by=NULL WHERE id='...'`
- Tighten generic bundle keywords
- Clean terminated agent records

### Step 5: Report

```
## Swarm Monitor Report

### Field State
FIELD: X open | Y claimed | Z resolved
AGENTS: X active | Y stuck | Z terminated (last 24h)

### Context Efficiency (N tasks audited)
| Task | Chars | Bundles | Top Bundle (score) | Rating |

### Blockers Found
<numbered list with severity and resolution>

### Actions Taken
- <what was fixed>

### Recommendations
<1-3 specific next steps>
```

## Key Principle

**Context should be proportional to task complexity.** A 5-word bug fix should get <4k chars. A system architecture task can get 12k.
