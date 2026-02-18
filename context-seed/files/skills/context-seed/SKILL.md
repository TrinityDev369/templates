# Context Seed

> PRD-to-packages seeding agent — dynamically maps project requirements to available `npx trinity369/use` commands by fetching the live template registry.

## How It Works

1. **Fetch** the live registry from GitHub (always current)
2. **Parse** the user's PRD or requirements
3. **Match** PRD signals to domain categories using the methodology below
4. **Filter** to only packages that exist in the registry
5. **Output** the install commands in dependency order

## Step 1: Fetch Live Registry

Always start by fetching the current registry. Never rely on a hardcoded list.

```bash
curl -s https://raw.githubusercontent.com/TrinityDev369/templates/main/registry.json
```

Parse the `templates` object. Each entry has:
```json
{
  "<slug>": {
    "description": "what the package provides",
    "category": "component|module|page|layout|skill|starter|pipe|design-system|agent|document|config|integration|animation|email|utility",
    "version": "1.0.0"
  }
}
```

Build a lookup: `Map<category, slug[]>` — you'll filter against this in every recommendation.

## Step 2: Parse Requirements

Accept input as either:
- A **PRD document** (scan for signal keywords)
- A **natural language description** ("I need a SaaS with billing and a CRM")
- A **checklist** of domains the user selects

Extract the **domain signals** — keywords that map to template categories.

## Step 3: Match Signals to Domains

### Signal → Domain Map

This is the stable methodology. Scan the PRD for these keywords, then pull matching packages from the registry by category prefix.

| Domain | PRD Signals | Registry Prefix |
|--------|------------|-----------------|
| **Auth** | login, sign in, sign up, registration, password, 2FA, MFA, OAuth, SSO, SAML, sessions, roles, permissions, RBAC, API keys, passkeys, WebAuthn, invite | `auth-` |
| **Dashboard** | dashboard, admin, KPI, metrics, stats, tables, data grid, charts, graphs, settings, sidebar, notifications, activity feed, search, calendar, kanban, logs, onboarding wizard, feature flags, audit, gantt, heatmap, map, real-time, scheduling | `dashboard-` |
| **Payments** | checkout, payment, billing, subscription, pricing, plans, monthly, annual, usage-based, enterprise, upgrade | `pricing-`, `integration-stripe` |
| **Components** | forms, validation, search, Cmd+K, toasts, modals, dialogs, breadcrumbs, file upload, date picker, rich text, avatar, tabs, accordion, pagination, select, combobox, stepper, timeline, tree view, code block, tag input, copy, rating, countdown, signature, image crop | `component-` |
| **Blog** | blog, articles, posts, authors, categories, tags, newsletter, comments, RSS, reading | `blog-` |
| **CRM** | contacts, deals, pipeline, leads, activities, sales, forecasts, territory, commission | `crm-` |
| **E-Commerce** | products, cart, checkout, orders, inventory, catalog, shipping, wishlist, storefront | `shop-` |
| **Email** | welcome email, password reset email, invoice email, newsletter email, verification email, invite email, payment failed, trial ending, feature announcement, digest | `email-` |
| **Integrations** | Stripe, S3, OAuth provider, webhooks, analytics, PostHog, SendGrid, Algolia, Mapbox, Mux, OpenAI, push notifications, calendar sync, Twilio, Lemon Squeezy | `integration-` |
| **Pages** | landing page, hero, about, contact, features, pricing page, changelog, privacy, terms, careers, case study, FAQ, status page, waitlist, coming soon, 404, error pages | `page-` |
| **Design System** | tokens, theme, dark mode, typography, colors, icons, spacing, shadows, motion, accessibility, breakpoints | `design-` |
| **Animations** | page transitions, scroll effects, text animation, number counter, loading, parallax, cursor, magnetic, typing, confetti, 3D tilt, gradient mesh | `animation-`, `trinity-signature` |
| **Forms** | checkout form, survey, multi-step wizard, address input, phone input, credit card, conditional fields, repeatable fields, autosave, inline edit | `form-` |
| **PDF** | reports, invoices, proposals, contracts, NDA, certificates, resumes, receipts, data export | `pdf-` |
| **Storage** | image gallery, file manager, avatar upload, bulk upload, media library, S3 browser, download manager | `storage-` |
| **Support** | help center, support tickets, chat widget, feedback, NPS, knowledge base, status page, CSAT | `support-` |
| **DevOps** | CI/CD, Docker, ESLint, Prettier, Docker Compose, Nginx, Playwright, Vitest, monorepo, PR template, Terraform, Kubernetes, monitoring, backup | `config-` |
| **Agentic** | Claude Code, AI agent, skills, swarm, multi-agent, knowledge graph, security review, copywriting, testing skill, database skill | `skill-`, `agent-`, `pipe-`, `agentic-layer`, `swarm-layer`, `context-graph` |
| **Starters** | SaaS, admin panel, portfolio, blog, docs site, landing page, marketplace, course platform, booking, project management, inventory | `starter-` |

### Matching Algorithm

```
for each detected domain:
  prefixes = Signal→Domain map[domain].registryPrefix
  matches = registry.templates.filter(slug => prefixes.any(p => slug.startsWith(p)))
  recommend(matches)
```

Only output packages that exist in the fetched registry. Never recommend a slug that isn't in `registry.json`.

## Step 4: Apply Priority Order

Present recommendations in this order — this is the natural dependency chain:

1. **Starter** — Foundation scaffold (if the project matches an archetype)
2. **Auth** — Almost every app needs authentication
3. **Dashboard** — If any admin, reporting, or data management exists
4. **Domain packages** — CRM, blog, e-commerce, etc.
5. **Components** — UI primitives needed by the above
6. **Integrations** — Third-party services (Stripe, S3, etc.)
7. **Pages** — Marketing and legal pages
8. **Email** — Transactional email templates
9. **Design System** — Tokens, typography, theming
10. **Animations** — Motion and interaction
11. **Forms** — Advanced form patterns
12. **Storage** — File management
13. **Support** — Help and feedback
14. **PDF** — Document generation
15. **DevOps** — CI/CD, Docker, testing config
16. **Agentic** — Claude Code skills and agent layer

## Step 5: Output Install Commands

### Format

Group by domain, include the description from the registry, output as copy-pasteable blocks:

```bash
# === Auth ===
npx trinity369/use auth-login-form             # <description from registry>
npx trinity369/use auth-signup-form            # <description from registry>

# === Dashboard ===
npx trinity369/use dashboard-shell             # <description from registry>
npx trinity369/use dashboard-kpi-cards         # <description from registry>
```

### Common Baseline

For every project, always recommend these if they exist in the registry:

```
config-eslint-prettier    — Code quality
config-github-actions     — CI/CD
agentic-layer             — Claude Code dev setup
```

For every web app, additionally recommend:

```
auth-login-form           — Authentication
auth-signup-form          — Registration
page-404-error            — Error pages (if available)
component-toast-notifications — User feedback (if available)
email-welcome             — Welcome email (if available)
```

## Project Archetypes

When a PRD clearly matches an archetype, lead with its starter and core packages before applying per-domain matching.

### SaaS Application
**Signals**: subscription, billing, teams, settings, usage limits, onboarding
**Core**: `starter-saas-minimal` → `dashboard-shell` → `auth-*` → `integration-stripe-*` → `pricing-*`

### E-Commerce / Shop
**Signals**: products, cart, checkout, orders, inventory, catalog, shipping
**Core**: `starter-saas-minimal` → `shop-*` → `auth-*` → `integration-stripe-checkout`

### Blog / Content Platform
**Signals**: articles, posts, authors, categories, tags, newsletter, RSS
**Core**: `starter-blog` → `blog-*` → `design-typography-scale`

### Agency / Portfolio
**Signals**: portfolio, case studies, team, services, testimonials, contact
**Core**: `starter-portfolio` or `starter-landing-page` → `page-*` → `animation-*`

### CRM / Client Management
**Signals**: contacts, deals, pipeline, leads, activities, sales
**Core**: `dashboard-shell` → `dashboard-data-table` → `crm-*`

### Documentation Site
**Signals**: docs, documentation, API reference, guides, versioning
**Core**: `starter-docs-site` → `component-command-palette` → `component-code-block`

### Internal Tool / Admin Panel
**Signals**: admin, CRUD, users, permissions, audit log, internal
**Core**: `starter-admin-panel` → `dashboard-*` → `auth-rbac-permissions`

---

_This skill fetches the live registry on every run. No manual updates needed when new templates are published._
