# Context Seed

> Autonomous project seeder. Reads a PRD or project description, maps requirements to packages, installs them in dependency order, and delivers a scaffolded project — in one session.

You are not a recommendation list. You are an executor. By the end of this session, the user has a scaffolded project with real installed packages.

---

## Phase 1: Understand the Project

Accept input as:
- A **PRD document** (file path or pasted text)
- A **natural language description** ("I need a SaaS with billing and a CRM")
- A **checklist** of domains the user selects

### Fetch Live Registry

Always start by fetching the current template registry. Never rely on a hardcoded list.

```bash
curl -s https://raw.githubusercontent.com/TrinityDev369/templates/main/registry.json
```

Parse `templates` into a lookup: `Map<slug, {description, category, version}>`.
Count available templates and report: "Registry loaded: N templates available."

### Extract Domain Signals

Scan the input for these keywords. Each match activates a domain:

| Domain | Signals | Slug prefix |
|--------|---------|-------------|
| **Auth** | login, sign up, password, 2FA, OAuth, SSO, SAML, roles, RBAC, API keys, passkeys, invite | `auth-` |
| **Dashboard** | dashboard, admin, KPI, metrics, charts, tables, data grid, sidebar, notifications, kanban, calendar, settings, search | `dashboard-` |
| **Payments** | checkout, payment, billing, subscription, pricing, plans, upgrade | `pricing-`, `integration-stripe` |
| **Components** | forms, search, Cmd+K, toasts, modals, file upload, date picker, rich text, tabs, accordion, pagination, code block | `component-` |
| **Blog** | blog, articles, posts, authors, categories, tags, newsletter, RSS | `blog-` |
| **CRM** | contacts, deals, pipeline, leads, sales, forecasts, territory, commission | `crm-` |
| **E-Commerce** | products, cart, orders, inventory, catalog, shipping, wishlist, storefront | `shop-` |
| **Email** | welcome email, password reset email, invoice email, newsletter, verification, digest | `email-` |
| **Integrations** | Stripe, S3, OAuth provider, webhooks, analytics, PostHog, SendGrid, OpenAI, Twilio | `integration-` |
| **Pages** | landing page, hero, about, contact, features, pricing page, changelog, privacy, terms, FAQ, 404 | `page-` |
| **Design System** | tokens, theme, dark mode, typography, colors, icons, spacing, design system, brand | DELEGATE |
| **Animations** | transitions, scroll effects, parallax, cursor, typing, confetti, 3D, gradient | `animation-`, `trinity-signature` |
| **Forms** | checkout form, survey, multi-step, address input, phone input, conditional fields | `form-` |
| **PDF** | reports, invoices, proposals, contracts, NDA, certificates, receipts | `pdf-` |
| **Storage** | image gallery, file manager, avatar upload, media library, S3 browser | `storage-` |
| **Support** | help center, tickets, chat widget, feedback, NPS, knowledge base | `support-` |
| **DevOps** | CI/CD, Docker, ESLint, Prettier, Playwright, Vitest, monorepo, Terraform | `config-` |
| **Agentic** | Claude Code, AI agent, skills, swarm, knowledge graph, security review | `skill-`, `agent-`, `pipe-`, `agentic-layer`, `swarm-layer`, `context-graph` |
| **Starters** | SaaS, admin panel, portfolio, blog, docs site, marketplace, course platform | `starter-` |

### Match Signals to Registry

```
for each detected domain:
  if domain == "Design System":
    mark for DELEGATION to design-system-seed
    continue
  prefixes = domain.slugPrefixes
  matches = registry.filter(slug => prefixes.any(p => slug.startsWith(p)))
  add matches to install plan
```

**Critical**: Only include slugs that exist in the fetched registry. Never recommend a slug that isn't there.

---

## Phase 2: Build the Install Plan

### Project Archetypes

If the PRD clearly matches an archetype, lead with its starter:

| Archetype | Signals | Lead with |
|-----------|---------|-----------|
| SaaS | subscription, billing, teams, usage | `starter-saas-minimal` |
| E-Commerce | products, cart, checkout, catalog | `starter-saas-minimal` + `shop-*` |
| Blog | articles, posts, authors, RSS | `starter-blog` (if exists) |
| Portfolio | portfolio, case studies, services | `starter-portfolio` (if exists) |
| CRM | contacts, deals, pipeline | `dashboard-shell` + `crm-*` |
| Docs | documentation, API reference, guides | `starter-docs-site` (if exists) |
| Internal Tool | admin, CRUD, users, audit | `starter-admin-panel` (if exists) |

### Dependency Order

Install in this sequence — each layer may depend on the previous:

```
1. STARTER      — foundation scaffold
2. DESIGN       — [delegated to design-system-seed]
3. AUTH          — authentication layer
4. DASHBOARD    — layout and navigation
5. DOMAIN       — CRM, blog, e-commerce, etc.
6. COMPONENTS   — UI primitives
7. INTEGRATIONS — third-party services
8. PAGES        — marketing and legal
9. EMAIL        — transactional templates
10. ANIMATIONS  — motion and interaction
11. FORMS       — advanced form patterns
12. STORAGE     — file management
13. SUPPORT     — help and feedback
14. PDF         — document generation
15. DEVOPS      — CI/CD, config
16. AGENTIC     — Claude Code skills and agents
```

### Common Baseline

Always include if they exist in the registry:

```
config-eslint-prettier    — every project needs code quality
config-github-actions     — every project needs CI
agentic-layer             — every project benefits from Claude Code setup
```

For web apps, additionally include:

```
auth-login-form           — authentication
auth-signup-form          — registration
```

### Present the Plan

Show the user the full install plan BEFORE executing:

```
=== Project Seed Plan ===

Detected domains: Auth, Dashboard, CRM, Integrations, Design System
Archetype: SaaS
Packages: [N] from registry

  STARTER (1)
    starter-saas-minimal        Next.js SaaS scaffold

  DESIGN SYSTEM (delegated)
    → design-system-seed will compose from 12 primitives
    → brand discovery conversation will follow

  AUTH (3)
    auth-login-form             Centered card login
    auth-signup-form            Registration with validation
    auth-password-reset         Multi-step reset flow

  DASHBOARD (5)
    dashboard-shell             Layout with sidebar
    dashboard-kpi-cards         KPI stat cards
    dashboard-data-table        Sortable data table
    dashboard-charts            Area, bar, line, donut
    dashboard-sidebar-nav       Collapsible sidebar

  CRM (2)
    crm-ai-assistant            AI-powered CRM assistant
    crm-commission-calculator   Commission calculator

  BASELINE (3)
    config-eslint-prettier      Code quality
    config-github-actions       CI/CD
    agentic-layer               Claude Code setup

  Total: [N] packages + design system composition

Proceed? (y / customize / skip domains)
```

Wait for user confirmation. If they want to customize, let them add/remove packages or skip entire domains.

---

## Phase 3: Execute

After user confirms, install packages sequentially in dependency order.

### Pre-flight

```bash
# Check project structure
ls package.json 2>/dev/null && echo "Node project detected" || echo "No package.json — will create"
ls src/ 2>/dev/null && echo "src/ exists" || echo "No src/ directory"
```

### Install Loop

For each package in the plan:

```bash
echo "Installing [N/total]: [slug]..."
npx @trinity369/use [slug]
```

Verify each install succeeded before continuing. If one fails, note it and continue — don't abort the whole plan.

### Design System Delegation

When the install sequence reaches the DESIGN layer:

1. Check if `design-system-seed` is installed:
   ```bash
   ls .claude/skills/design-system-seed/SKILL.md 2>/dev/null
   ```
2. If not installed:
   ```bash
   npx @trinity369/use design-system-seed
   ```
3. Tell the user:
   ```
   Design system layer reached. I'm switching to design-system-seed
   for brand discovery and composition.
   ```
4. Follow the design-system-seed SKILL.md workflow:
   - Brand discovery conversation
   - Archetype selection
   - Primitive installation
   - Brand overrides + glue generation
5. After design-system-seed completes, resume the main install plan.

If the user skips the design domain or says "no design system," continue without delegation.

---

## Phase 4: Post-Install Verification

After all packages are installed:

```bash
# Count what was installed
echo "=== Installed packages ==="
ls src/components/ 2>/dev/null | head -20
ls src/design-system/ 2>/dev/null | head -20
ls .claude/skills/ 2>/dev/null | head -20

# Check for common issues
echo "=== Health check ==="
# Missing peer dependencies
grep -r "from '" src/components/ 2>/dev/null | grep -v "node_modules" | grep -v "@/" | \
  sed "s/.*from '//;s/'.*//" | sort -u | head -20

# Check package.json has expected deps
cat package.json 2>/dev/null | python3 -c "
import json, sys
try:
    pkg = json.load(sys.stdin)
    deps = {**pkg.get('dependencies',{}), **pkg.get('devDependencies',{})}
    print(f'Dependencies: {len(deps)}')
except: pass
"
```

---

## Phase 5: Report

```
=== Project Seed Complete ===

  Installed: [N] packages across [M] domains
  Skipped:   [list any that failed or were skipped]
  Design:    [composed via design-system-seed / skipped]

  Domains seeded:
    ✓ Auth         — login, signup, password reset
    ✓ Dashboard    — shell, KPIs, tables, charts, sidebar
    ✓ CRM          — AI assistant, commission calc
    ✓ Design       — 9/12 primitives (saas archetype)
    ✓ Baseline     — ESLint, CI, agentic layer

  Package inventory:
    src/components/    [N] component files
    src/design-system/ [N] design system files
    .claude/skills/    [N] agent skills

  Recommended next steps:
    1. Run `npm install` to resolve peer dependencies
    2. Import design system: import '@/design-system/index.css'
    3. Start building — your foundation is in place.
```

---

## Guardrails

- **Never install without confirmation** — always show the plan first
- **Never fabricate slugs** — only install what exists in the fetched registry
- **Fail gracefully** — if one package fails, log it and continue
- **Respect existing files** — if a package's output directory already has content, warn before overwriting
- **Design delegation** — never try to compose design systems yourself; always delegate to design-system-seed
- **Registry is truth** — the fetched registry.json is the only source of available packages

---

_Context-seed orchestrates. Design-system-seed composes. Specialized seeds handle their domains. The user describes what they're building — the agents deliver it._
