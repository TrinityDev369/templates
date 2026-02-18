# Swarm

Sense the field, identify high-potential zones, and recommend agent spawns. Use at session start to oversee the swarm.

## Context

The swarm operates on thermodynamic field coordination:
- **Field nodes**: goals, specs, tasks with potential energy (0.0-1.0)
- **High potential**: attracts agent attention
- **Temperature**: rises on failures (self-healing)
- **Affinities**: match nodes to specialized agents

## Run

```bash
# Field zones with high potential
psql -c "
SELECT node_type, title,
       ROUND(potential::numeric, 2) as potential,
       ROUND(temperature::numeric, 2) as temp,
       affinity[1] as primary_affinity,
       state
FROM field_nodes
WHERE state NOT IN ('resolved', 'approved')
ORDER BY potential DESC, temperature DESC
LIMIT 15;
"
```

```bash
# Stuck/stale claims
psql -c "
SELECT node_type, title, claimed_by,
       ROUND(EXTRACT(EPOCH FROM (NOW() - updated_at))/60) as mins_stuck
FROM field_nodes
WHERE state = 'claimed'
  AND updated_at < NOW() - INTERVAL '30 minutes';
"
```

```bash
# Field summary by type and state
psql -c "
SELECT node_type, state, COUNT(*) as count
FROM field_nodes
GROUP BY node_type, state
ORDER BY node_type, state;
"
```

## Report

Present a field status report:

```
## Field Status

**Entropy**: [value] (low = healthy, high = needs attention)

### High-Potential Zones (Ready for Work)
| Type | Title | Potential | Affinity | Status |

### Stuck Zones (Need Intervention)
| Type | Title | Claimed By | Stuck (mins) |

### Summary
- [N] goals awaiting architect
- [N] specs awaiting task-writer
- [N] tasks awaiting workers
```

Then recommend actions:

```
## Recommended Actions

1. **[Action]** - [Reason]

Options:
1. Spawn agents for tasks
2. Release stuck claims
3. Investigate specific zone
4. Skip for now
```

## Important

- **Human oversight**: Always get approval before spawning
- **Cost awareness**: Each spawn costs tokens
