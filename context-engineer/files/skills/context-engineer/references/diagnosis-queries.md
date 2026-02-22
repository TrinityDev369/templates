# Context Health Diagnostics

SQL diagnostic queries for auditing agent context health in the Trinity swarm.
Every query is copy-pasteable via `psql -c "..."`.

---

## Bundle Coverage

```sql
-- All active bundles by domain
SELECT domain, COUNT(*) as bundle_count,
       ARRAY_AGG(slug ORDER BY priority DESC) as slugs
FROM context_bundles
WHERE is_active = true
GROUP BY domain
ORDER BY bundle_count DESC;
```

```sql
-- Bundle detail view
SELECT slug, domain, title, priority, version,
       ARRAY_LENGTH(affinities, 1) as affinity_count,
       ARRAY_LENGTH(keywords, 1) as keyword_count,
       JSONB_ARRAY_LENGTH(file_refs) as file_ref_count,
       JSONB_ARRAY_LENGTH(kg_queries) as kg_query_count,
       LENGTH(conventions) as convention_chars
FROM context_bundles
WHERE is_active = true
ORDER BY domain, priority DESC;
```

---

## Bundle Attachment Analysis

```sql
-- Tasks with most bundles attached
SELECT fn.title, COUNT(fnb.id) as bundle_count,
       ARRAY_AGG(cb.slug ORDER BY fnb.match_score DESC) as bundles,
       ARRAY_AGG(ROUND(fnb.match_score::numeric, 1) ORDER BY fnb.match_score DESC) as scores
FROM field_node_bundles fnb
JOIN field_nodes fn ON fn.id = fnb.node_id
JOIN context_bundles cb ON cb.id = fnb.bundle_id
GROUP BY fn.id, fn.title
ORDER BY bundle_count DESC
LIMIT 20;
```

```sql
-- Tasks with NO bundles (context gaps)
SELECT fn.id, fn.title, fn.affinity, fn.state
FROM field_nodes fn
LEFT JOIN field_node_bundles fnb ON fn.id = fnb.node_id
WHERE fnb.id IS NULL
  AND fn.state IN ('open', 'claimed')
ORDER BY fn.created_at DESC;
```

```sql
-- Average match scores by bundle (quality indicator)
SELECT cb.slug, cb.domain,
       COUNT(fnb.id) as times_attached,
       ROUND(AVG(fnb.match_score)::numeric, 2) as avg_score,
       ROUND(MIN(fnb.match_score)::numeric, 2) as min_score,
       ROUND(MAX(fnb.match_score)::numeric, 2) as max_score
FROM context_bundles cb
LEFT JOIN field_node_bundles fnb ON cb.id = fnb.bundle_id
WHERE cb.is_active = true
GROUP BY cb.slug, cb.domain
ORDER BY times_attached DESC;
```

```sql
-- Bundles never attached (potentially dead)
SELECT cb.slug, cb.domain, cb.title, cb.priority, cb.keywords
FROM context_bundles cb
LEFT JOIN field_node_bundles fnb ON cb.id = fnb.bundle_id
WHERE fnb.id IS NULL
  AND cb.is_active = true;
```

---

## Context-Bloat Detection

```sql
-- Tasks with high total context (convention chars > 3000)
SELECT fn.title, COUNT(fnb.id) as bundles,
       SUM(LENGTH(cb.conventions)) as total_convention_chars,
       SUM(JSONB_ARRAY_LENGTH(cb.file_refs)) as total_file_refs
FROM field_node_bundles fnb
JOIN field_nodes fn ON fn.id = fnb.node_id
JOIN context_bundles cb ON cb.id = fnb.bundle_id
GROUP BY fn.id, fn.title
HAVING SUM(LENGTH(cb.conventions)) > 3000
ORDER BY total_convention_chars DESC;
```

```sql
-- Oversized bundles (conventions too long)
SELECT slug, domain,
       LENGTH(conventions) as chars,
       ROUND(LENGTH(conventions) / 4.0) as approx_tokens
FROM context_bundles
WHERE is_active = true
ORDER BY LENGTH(conventions) DESC;
```

```sql
-- Bundles with too many file refs (noise risk above 8)
SELECT slug, domain, JSONB_ARRAY_LENGTH(file_refs) as ref_count
FROM context_bundles
WHERE is_active = true
  AND JSONB_ARRAY_LENGTH(file_refs) > 8
ORDER BY ref_count DESC;
```

---

## Context-Rot Detection

```sql
-- Bundles not updated recently (potential rot)
SELECT slug, domain, version, updated_at,
       NOW() - updated_at as age
FROM context_bundles
WHERE is_active = true
ORDER BY updated_at ASC
LIMIT 20;
```

```sql
-- File refs pointing to potentially moved/deleted files
-- (Run file existence check separately via the bash script below)
SELECT slug, ref->>'path' as file_path, ref->>'purpose' as purpose
FROM context_bundles, JSONB_ARRAY_ELEMENTS(file_refs) as ref
WHERE is_active = true
ORDER BY slug;
```

---

## Context-Overfit Detection

```sql
-- Bundles with too many keywords (overfit risk -- matches everything)
SELECT slug, domain, keywords,
       ARRAY_LENGTH(keywords, 1) as kw_count
FROM context_bundles
WHERE is_active = true
  AND ARRAY_LENGTH(keywords, 1) > 12
ORDER BY ARRAY_LENGTH(keywords, 1) DESC;
```

```sql
-- Bundles with overlapping keywords in same domain (potential duplication)
SELECT a.slug as bundle_a, b.slug as bundle_b, a.domain,
       (SELECT COUNT(*)
        FROM UNNEST(a.keywords) k
        WHERE k = ANY(b.keywords)) as shared_keywords
FROM context_bundles a
JOIN context_bundles b ON a.domain = b.domain AND a.id < b.id
WHERE a.is_active AND b.is_active
ORDER BY shared_keywords DESC;
```

---

## Domain Coverage Map

```sql
-- Domains with vs without bundles
SELECT d.domain,
       COALESCE(bc.bundle_count, 0) as bundles,
       COALESCE(bc.avg_priority, 0) as avg_priority
FROM (
  SELECT UNNEST(ARRAY[
    'auth', 'swarm', 'frontend', 'devops', 'crm',
    'content', 'knowledge', 'database', 'design'
  ]) as domain
) d
LEFT JOIN (
  SELECT domain,
         COUNT(*) as bundle_count,
         ROUND(AVG(priority)) as avg_priority
  FROM context_bundles
  WHERE is_active = true
  GROUP BY domain
) bc ON d.domain = bc.domain
ORDER BY bundles DESC;
```

---

## File Ref Validation Script

```bash
# Check all bundle file_refs against actual filesystem
psql -t -A -c "
  SELECT ref->>'path'
  FROM context_bundles, JSONB_ARRAY_ELEMENTS(file_refs) as ref
  WHERE is_active = true
" | while read -r filepath; do
  if [ ! -e "/opt/trinity-hub/$filepath" ]; then
    echo "MISSING: $filepath"
  fi
done
```

---

## KG Query Health

```sql
-- Bundles with KG queries (verify they return results)
SELECT slug, domain,
       q->>'query' as kg_query,
       q->>'project' as kg_project,
       COALESCE(q->>'limit', '3') as kg_limit
FROM context_bundles, JSONB_ARRAY_ELEMENTS(kg_queries) as q
WHERE is_active = true
  AND JSONB_ARRAY_LENGTH(kg_queries) > 0;
```

---

## Agent Context at Claim Time

```sql
-- What context an agent actually receives for a given node
-- Replace $NODE_ID with the target field_node UUID
SELECT fn.title as task_title,
       fn.affinity as task_affinities,
       cb.slug, cb.domain, cb.title as bundle_title,
       fnb.match_score,
       JSONB_ARRAY_LENGTH(cb.file_refs) as file_refs,
       LENGTH(cb.conventions) as convention_chars
FROM field_nodes fn
JOIN field_node_bundles fnb ON fn.id = fnb.node_id
JOIN context_bundles cb ON cb.id = fnb.bundle_id
WHERE fn.id = $NODE_ID
ORDER BY fnb.match_score DESC;
```

---

## Scoring Sanity Check

```sql
-- Simulate match scoring: bundles vs a specific domain + affinity combo
-- Useful for debugging why a bundle was or was not attached
SELECT slug, domain, priority,
       CASE WHEN domain = 'swarm' THEN 3.0 ELSE 0 END as domain_score,
       ARRAY_LENGTH(keywords, 1) as total_keywords,
       ARRAY_LENGTH(affinities, 1) as total_affinities
FROM context_bundles
WHERE is_active = true
ORDER BY domain, priority DESC;
```

Scoring formula reference:
- `domain_match * 3.0` (max 3.0)
- `min(keyword_hits, 3) * 2.0` (max 6.0)
- `min(affinity_overlap, 2) * 1.5` (max 3.0)
- **Threshold**: 3.0 | **Max score**: 12.0 | **Max bundles per node**: 4
