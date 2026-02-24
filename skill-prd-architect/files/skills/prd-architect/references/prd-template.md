# PRD Template — Trinity Agency

Use this template as the structural backbone for every PRD. Adapt sections to the project type — skip sections that don't apply, but preserve the numbering for consistency.

---

## Frontmatter

```markdown
# PRD: <Project Name> — <One-Line Thesis>

**Client:** <Name> (<Company / Legal Entity>)
**Date:** <YYYY-MM-DD>
**Version:** v1.0
**Author:** Trinity Agency
**Status:** Draft — Pending Client Approval
```

**Version naming:** `v{MAJOR}.{MINOR}` — major bump = scope/architecture change, minor bump = feature add/remove/reprioritize.

**Status values:** `Draft`, `Pending Client Approval`, `Approved`, `In Progress`, `Delivered`

---

## 0. Change Log

Track every version. Most recent entry first. Required from v1.1 onward.

| Version | Date | Author | Change Summary | Downstream Impact |
|---------|------|--------|---------------|-------------------|
| v1.0 | YYYY-MM-DD | Trinity Agency | Initial PRD | — |

**Downstream Impact** values:
- **None** — cosmetic/clarification only, no task changes needed
- **Partial** — specific tasks need re-scope (list affected phase/feature)
- **Full regeneration** — run `/prd-intake` to rebuild the task tree

---

## 1. Executive Summary

One paragraph. Three sentences max:
1. **Who** is the client and what they do
2. **The core problem** — what's broken, manual, or missing
3. **Our thesis** — what Trinity will build and the outcome it delivers

Pattern:
> <Client> is a <description>. **The core problem:** <pain>. **Our thesis:** Trinity Agency will build <solution> — <measurable outcome>.

---

## 2. Current State Audit

### 2.1 Systems Inventory

| System | URL | Platform | Critical Issues |
|--------|-----|----------|----------------|
| ... | ... | ... | ... |

### 2.2 Observed Friction

| Issue | Impact |
|-------|--------|
| ... | ... |

Capture friction from: live site audit, client conversations, competitor comparison.

### 2.3 Brand & Content

| Aspect | Detail |
|--------|--------|
| Primary language | ... |
| Brand position | ... |
| Content types | ... |
| Social channels | ... |
| Visual identity | Colors, typography, imagery notes |

### 2.4 Legal Entity

- **Company:** ...
- **Address:** ...
- **Contact:** ...
- **Regulatory:** GDPR, consumer protection, industry-specific requirements

---

## 3. Business Model

### 3.1 Revenue Streams

Numbered list, primary first:
1. **<Stream>** (primary) — brief description
2. **<Stream>** — brief description

### 3.2 Pricing / Tier Structure

| Tier | Target | Positioning |
|------|--------|------------|
| ... | ... | ... |

Include mechanics: billing frequency, delivery cadence, upgrade/downgrade rules.

### 3.3 User Types

| User | Role | Key Actions |
|------|------|-------------|
| End customer | Buys products, manages account | Browse, purchase, refund, manage subscription |
| Admin/Founder | Manages operations | Approve refunds, view revenue, manage content |
| Partner/Affiliate | Refers customers | Share links, track commissions, receive payouts |

---

## 4. Core Concept

The architectural thesis — what makes this system different from a generic build.

### 4.1 Design Principles

| Principle | Meaning |
|-----------|---------|
| ... | ... |

### 4.2 Friction Resolution Examples

For each major automation, write a **Before/After** pair:

---

#### Example N: <Scenario Name>

**Today (broken):**
1. Step-by-step manual process
2. ...
3. **Total time: X minutes**

**With <System Name>:**
1. Trigger → system checks rules → action
2. ...
3. **Total time: 0 minutes (auto) or N seconds (approval tap)**

**Backend components involved:**
- `ServiceName` — what it does
- `AnotherService` — what it does

---

Aim for 3-5 friction resolution examples covering the most impactful workflows.

### 4.3 Admin Command Center

| Section | What it shows |
|---------|--------------|
| ... | ... |

---

## 5. Feature Requirements

Group by priority. Each feature includes: description, trigger→action→result, acceptance criteria.

### P0 — Must Have (Prototype)

#### 5.1 <Feature Group Name>
- Bullet list of concrete requirements
- Each bullet is testable: "Product listing with category filtering" not "good product page"
- Include edge cases: "14-day withdrawal right clearly communicated at checkout"

#### 5.2 <Feature Group Name>
- ...

### P1 — Should Have (v1.0)

#### 5.N <Feature Group Name>
- ...

### P2 — Nice to Have (v2.0+)

#### 5.N <Feature Group Name>
- ...

### Out of Scope

Explicitly list what this project does NOT include:
- ...
- ...

### 5.5 Rejected Alternatives

Document approaches that were **considered and deliberately not chosen**. This prevents future agents or team members from re-proposing dead-end solutions.

For each rejected alternative:

#### Alt: <Alternative Name>

- **What:** One-sentence description of the approach
- **Why considered:** What made it attractive initially
- **Why rejected:** The specific reason(s) it was ruled out
- **Conditions to reconsider:** Under what circumstances this might become viable again (or "None — fundamentally incompatible")

Example:
> **Alt: Server-Side Rendering with PHP**
> - **What:** Keep existing PHP backend and add a modern frontend layer
> - **Why considered:** Lower migration risk, reuses existing code
> - **Why rejected:** PHP codebase has no tests, no API layer, and session-based auth incompatible with mobile app requirement
> - **Conditions to reconsider:** None — mobile support is a hard requirement

Include at least 1-2 rejected alternatives per major architectural decision (auth approach, framework choice, hosting model, payment provider).

---

## 6. Technical Architecture

### 6.1 Stack

| Layer | Technology | Rationale |
|-------|-----------|-----------|
| Frontend | ... | ... |
| Backend | ... | ... |
| Database | ... | ... |
| Auth | ... | ... |
| Payments | ... | ... |
| Email | ... | ... |
| Storage | ... | ... |
| Hosting | ... | ... |
| Background Jobs | ... | ... |

### 6.2 Service Architecture

ASCII diagram showing service relationships:

```
┌─────────────────────────────────────────┐
│              API Layer                    │
├─────────────────────────────────────────┤
│  ┌──────────┐  ┌──────────┐  ┌────────┐│
│  │ Service1 │  │ Service2 │  │Service3││
│  └──────────┘  └──────────┘  └────────┘│
│         │            │            │      │
│  ┌──────┴────────────┴────────────┴────┐│
│  │          Event Bus / Queue          ││
│  └─────────────────────────────────────┘│
├─────────────────────────────────────────┤
│        Database + External Services      │
└─────────────────────────────────────────┘
```

### 6.3 Data Model

Tree notation showing entity relationships:

```
users
  ├── addresses
  ├── orders
  │     ├── order_items
  │     └── refunds
  ├── subscriptions
  │     └── subscription_items
  └── profiles
        └── preferences

products
  ├── product_images
  ├── product_categories
  └── product_variants

audit_timeline
  ├── entity_type
  ├── entity_id
  ├── action
  ├── actor (system/customer/admin)
  └── details (JSON)
```

### 6.4 Environment

- **Staging:** `<project>.staging.trinity.agency`
- **Production:** TBD (or client domain)
- **CI/CD:** GitHub Actions → Docker → blue-green deploy

---

## 7. Migration Considerations

### 7.1 Data to Migrate
- Bullet list: what data moves from old to new

### 7.2 Integrations to Preserve
- **<Service>** — keep / replace / evaluate

### 7.3 Systems to Retire
- `<old-system>` → absorbed into <new-component>

### 7.4 DNS & Domain
- Domain ownership, current registrar, cutover plan

---

## 8. Project Phases

### Phase 1: <Name> (<Duration>)
- [ ] Concrete deliverable with enough detail for an agent to implement
- [ ] ...

### Phase 2: <Name> (<Duration>)
- [ ] ...

### Phase 3: <Name>
- [ ] ...

Each phase should have 5-15 checkbox items. Items map 1:1 to tasks that agents can claim.

---

## 9. Success Criteria

| Metric | Target |
|--------|--------|
| ... | Specific, measurable number |
| ... | ... |

Every criterion must be machine-verifiable or have a clear measurement method.

---

## 10. Open Questions

Numbered list. Each includes impact classification.

1. **<Question>** — Impact: <High/Medium/Low>. Blocks: <Phase N / nothing>.
2. ...

Open questions are first-class items — they surface in swarm field as `error` nodes with `architect` affinity when deposited via prd-intake.

---

## 11. Agent Boundaries & Protected Interfaces

This section is **critical for AI agent execution**. Without explicit boundaries, agents will "improve" stable interfaces, add unrequested features, and deviate from architecture. Per GitHub Spec Kit research (2,500+ agent configs), this is the #1 defense against agent-induced regressions.

### 11.1 Agent Boundaries

Three tiers. Every item must be concrete and actionable — no vague guidance.

| Tier | Rules |
|------|-------|
| **ALWAYS** | Run `<test command>` after every change. Follow existing file naming: `<pattern>`. Use `<framework>` for new components. Commit with conventional commits. Update change log on version bumps. |
| **ASK FIRST** | Database schema changes (migration required). Adding new npm/pip dependencies. Modifying API endpoint signatures. Changing auth token format or session handling. Adding new environment variables. Deviating from the stack table in Section 6.1. |
| **NEVER** | Commit `.env`, credentials, or API keys. Modify files listed in Protected below. Create new database tables without migration scripts. Skip writing tests for new endpoints. Bypass auth middleware. Use `any` type in TypeScript. Import from `node_modules` internals. Refactor code unrelated to the current task. |

Customize these rules per project. The examples above are starting points — replace `<test command>`, `<pattern>`, `<framework>` with project-specific values.

### 11.2 Protected Interfaces (DO NOT MODIFY)

List every file, schema, and API contract that must remain unchanged. Be specific — path + reason.

| Protected Item | Reason |
|---------------|--------|
| `<path/to/schema.sql>` | Production data depends on this schema; changes require migration |
| `<path/to/auth.ts>` | Auth flow shared across multiple services; change requires coordinated release |
| `<path/to/api/v1/*>` | Public API contract; breaking changes require versioned endpoint |
| `<external-service> webhook format` | Third-party integration; format is not under our control |

**Rule:** If an agent needs to modify a protected item to complete a task, it must stop and surface this as a blocker — not silently modify.

---

## 12. Reflection Log

*Added after implementation, not during initial PRD authoring. One entry per phase or significant milestone.*

### Phase N Reflection — <Date>

**What shipped:** Brief summary of what was actually built.

**Spec accuracy:**
| Aspect | Rating | Notes |
|--------|--------|-------|
| Feature completeness | Full / Partial / Missed | What was built vs. specified |
| Effort estimation | Over / Accurate / Under | Phase was X tasks, took Y sessions |
| Architecture decisions | Held / Adapted / Abandoned | Which decisions survived contact with reality |

**What worked well:**
- Spec element that agents executed without confusion
- ...

**What drifted from spec:**
- Deviation and the reason it happened
- ...

**What was missing from the PRD:**
- Requirement that should have been specified but wasn't
- ...

**Surprises:**
- Unexpected discovery during implementation
- ...

**Recommendations for next version:**
- Concrete change to make in the next PRD version
- ...

**KG entities to create/update:**
- `<entity name>` — `<type>` — `<what was learned>`

---

## Footer

```markdown
---

*Trinity Agency — Built by agents, approved by humans.*
```

---

## Writing Checklist

Before saving the PRD, verify:

**Structure:**
- [ ] Change log exists (Section 0) with at least the v1.0 entry
- [ ] Executive summary is exactly 3 sentences
- [ ] Every system in Current State has a URL and platform
- [ ] Every feature has P0/P1/P2 classification
- [ ] Out-of-scope section exists and is non-empty
- [ ] Rejected alternatives documented for major architecture decisions (Section 5.5)
- [ ] Phase checklists have 5-15 items each
- [ ] Data model uses tree notation

**AI-Optimization:**
- [ ] Agent Boundaries section has concrete ALWAYS/ASK/NEVER rules (not generic placeholders)
- [ ] Protected Interfaces lists specific file paths and reasons
- [ ] Success criteria are measurable (numbers, not adjectives)
- [ ] Open questions are numbered with impact classification
- [ ] No "TBD" or "TODO" in the body (use Open Questions instead)

**Versioning (for v1.1+):**
- [ ] Version bumped in frontmatter
- [ ] Change log entry added with downstream impact assessment
- [ ] Removed features/approaches moved to Rejected Alternatives (not silently deleted)

**File:**
- [ ] File saved to `specs/intake/<slug>-prd.md`
