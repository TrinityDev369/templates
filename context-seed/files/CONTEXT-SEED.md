# Context Seed — trinity369/use Package Guide

> **What this is:** An expert reference for mapping a PRD (Product Requirements Document) to the correct `npx trinity369/use <package>` commands. Read your PRD, scan the signals below, copy the install commands.
>
> **How it works:** Each package drops production-ready files into your project — components, modules, pages, configs, skills, or full starters. No runtime dependency. You own the code.

---

## Quick Start

```bash
# Install a single package
npx trinity369/use <slug>

# Example: bootstrap a SaaS project
npx trinity369/use starter-saas-minimal
npx trinity369/use dashboard-shell
npx trinity369/use auth-login-form
npx trinity369/use integration-stripe-checkout
```

---

## 1. Project Archetypes

Pick the archetype closest to your PRD, then layer on domain-specific packages from Section 2.

### SaaS Application

PRD signals: _subscription, billing, teams, settings, usage limits, onboarding_

```bash
# Foundation
npx trinity369/use starter-saas-minimal        # Full Next.js + Auth + Dashboard + Billing shell
npx trinity369/use agentic-layer               # .claude/ folder with hooks, skills, agents

# Dashboard
npx trinity369/use dashboard-shell             # Sidebar + topbar + content area layout
npx trinity369/use dashboard-kpi-cards         # Stat cards with trends and sparklines
npx trinity369/use dashboard-data-table        # Sortable, filterable, paginated table
npx trinity369/use dashboard-charts            # Area, line, bar, donut chart set
npx trinity369/use dashboard-settings-page     # Profile, appearance, notifications settings
npx trinity369/use dashboard-sidebar-nav       # Collapsible sidebar with groups and badges
npx trinity369/use dashboard-notification-center # Bell dropdown with badge count

# Auth
npx trinity369/use auth-login-form             # Email + password + OAuth login
npx trinity369/use auth-signup-form            # Registration with password strength
npx trinity369/use auth-password-reset         # Multi-step password reset flow
npx trinity369/use auth-2fa-setup              # QR scan + recovery codes
npx trinity369/use auth-session-manager        # Active sessions with device info

# Billing
npx trinity369/use integration-stripe-checkout # Checkout session + webhook handler
npx trinity369/use integration-stripe-billing  # Subscription portal + plan switching
npx trinity369/use pricing-cards               # 2-4 tier pricing with recommended plan
npx trinity369/use pricing-billing-toggle      # Monthly/annual switch with savings

# DevOps
npx trinity369/use config-github-actions       # CI/CD: lint, type-check, test, deploy
npx trinity369/use config-docker-next          # Multi-stage Dockerfile for Next.js
npx trinity369/use config-eslint-prettier      # Opinionated lint + format config
```

### E-Commerce / Shop

PRD signals: _products, cart, checkout, orders, inventory, catalog, shipping_

```bash
# Foundation
npx trinity369/use starter-saas-minimal        # Base Next.js scaffold
npx trinity369/use dashboard-shell             # Admin panel layout

# Storefront
npx trinity369/use shop-product-grid           # Product listing grid
npx trinity369/use shop-product-detail         # Product detail page
npx trinity369/use shop-cart                   # Shopping cart
npx trinity369/use shop-checkout               # Checkout flow
npx trinity369/use shop-category-nav           # Category navigation
npx trinity369/use shop-search-filters         # Search & filter sidebar
npx trinity369/use shop-wishlist               # Wishlist functionality
npx trinity369/use shop-order-history          # Order history page

# Payments
npx trinity369/use integration-stripe-checkout # Stripe Checkout + webhooks
npx trinity369/use pricing-cards               # Pricing display

# Supporting
npx trinity369/use auth-login-form             # Customer auth
npx trinity369/use auth-signup-form            # Customer registration
npx trinity369/use email-welcome               # Welcome email
npx trinity369/use email-invoice               # Invoice email
npx trinity369/use support-chat-widget         # Live chat
```

### Blog / Content Platform

PRD signals: _articles, posts, authors, categories, tags, newsletter, comments, RSS_

```bash
# Foundation
npx trinity369/use starter-blog                # MDX blog with categories, RSS, code highlighting

# Blog Components
npx trinity369/use blog-card                   # Post card with image, title, excerpt
npx trinity369/use blog-index-page             # Listing with category filter + pagination
npx trinity369/use blog-post-page              # Post layout with TOC + progress bar
npx trinity369/use blog-author-page            # Author bio with post list
npx trinity369/use blog-newsletter-cta         # Newsletter signup component
npx trinity369/use blog-rss-sitemap            # RSS feed + sitemap generation
npx trinity369/use blog-share-buttons          # Social share with copy link
npx trinity369/use blog-comments-giscus        # GitHub Discussions comments

# Design
npx trinity369/use design-tokens               # Color, typography, spacing tokens
npx trinity369/use design-typography-scale      # Fluid type scale with prose styles
npx trinity369/use animation-scroll-reveal      # Scroll-triggered reveal animations
```

### Agency / Portfolio

PRD signals: _portfolio, case studies, team, services, testimonials, contact_

```bash
# Foundation
npx trinity369/use starter-portfolio           # Portfolio site with projects
npx trinity369/use starter-landing-page        # Marketing landing page

# Pages
npx trinity369/use page-landing-full           # Hero + features + pricing + testimonials
npx trinity369/use page-about                  # Team bios, values, company story
npx trinity369/use page-contact                # Contact form with map + info cards
npx trinity369/use page-case-study             # Problem, solution, results template
npx trinity369/use page-features               # Feature showcase with icons
npx trinity369/use page-legal-privacy          # Privacy policy
npx trinity369/use page-legal-terms            # Terms of service

# Animations
npx trinity369/use animation-page-transition   # Route transition animations
npx trinity369/use animation-scroll-reveal     # Scroll-triggered reveals
npx trinity369/use animation-text-reveal       # Staggered text reveal
npx trinity369/use trinity-signature           # Animated triangle easter egg
```

### CRM / Client Management

PRD signals: _contacts, deals, pipeline, leads, activities, sales, forecasts_

```bash
# Foundation
npx trinity369/use dashboard-shell             # Admin layout
npx trinity369/use dashboard-data-table        # Data tables for lists
npx trinity369/use dashboard-charts            # Charts for reporting

# CRM Core
npx trinity369/use crm-pipeline-kanban         # Drag-and-drop deal pipeline
npx trinity369/use crm-contact-list            # Searchable contact directory
npx trinity369/use crm-contact-detail          # Contact page with activity timeline
npx trinity369/use crm-deal-card               # Deal summary card
npx trinity369/use crm-activity-logger         # Log calls, emails, meetings
npx trinity369/use crm-lead-scoring            # Lead score with criteria breakdown
npx trinity369/use crm-dashboard-overview      # KPIs and pipeline summary
npx trinity369/use crm-reporting-charts        # Sales reporting charts

# Supporting
npx trinity369/use component-date-picker       # Date picker for scheduling
npx trinity369/use component-select-combobox   # Searchable select for assignments
npx trinity369/use component-rich-text-editor  # Rich text for notes
```

### Documentation Site

PRD signals: _docs, documentation, API reference, guides, versioning, search_

```bash
npx trinity369/use starter-docs-site           # Docs site with sidebar, search, versioning
npx trinity369/use component-command-palette   # Cmd+K search overlay
npx trinity369/use component-code-block        # Syntax-highlighted code blocks
npx trinity369/use component-tabs-system       # Tabs for code examples
npx trinity369/use component-breadcrumbs       # Navigation breadcrumbs
npx trinity369/use page-changelog              # Release changelog
```

### Internal Tool / Admin Panel

PRD signals: _admin, CRUD, users, permissions, audit log, internal_

```bash
npx trinity369/use starter-admin-panel         # Admin CRUD with data table, forms, auth
npx trinity369/use dashboard-shell             # Sidebar + topbar layout
npx trinity369/use dashboard-data-table        # Sortable, filterable table
npx trinity369/use dashboard-kpi-cards         # Stats overview
npx trinity369/use auth-rbac-permissions       # Role and permission matrix editor
npx trinity369/use auth-audit-log              # Auth event audit log viewer
npx trinity369/use dashboard-audit-trail       # User action audit trail
npx trinity369/use dashboard-logs-viewer       # Real-time log viewer
npx trinity369/use component-form-builder      # Multi-step forms with Zod validation
```

---

## 2. Domain Checklist

Scan your PRD for these signals. Check every box that applies, then install the listed packages.

### Authentication & Authorization

| PRD Signal | Package | What you get |
|---|---|---|
| Login, sign in | `auth-login-form` | Centered card with email, password, OAuth buttons |
| Registration, sign up | `auth-signup-form` | Form with validation + password strength meter |
| Forgot password, reset | `auth-password-reset` | Request → confirm → new password multi-step |
| Two-factor, 2FA, MFA | `auth-2fa-setup` | QR scan, recovery codes, verification flow |
| Sessions, devices | `auth-session-manager` | Active sessions list with revoke |
| OAuth, social login | `auth-oauth-buttons` | Branded Google/Apple/GitHub/Microsoft buttons |
| Magic link, passwordless | `auth-magic-link` | Passwordless email sign-in |
| Roles, permissions, RBAC | `auth-rbac-permissions` | Role/permission management with matrix editor |
| Email verification | `auth-email-verification` | Verification flow with resend + expiry |
| Account deletion, GDPR | `auth-account-deletion` | Confirmation dialog, GDPR-compliant |
| Connected accounts | `auth-connected-accounts` | OAuth provider management settings |
| API keys | `auth-api-key-manager` | API key creation, rotation, permissions |
| Audit log | `auth-audit-log` | Authentication event log viewer |
| SSO, SAML | `auth-sso-saml` | SAML SSO for enterprise |
| Passkeys, WebAuthn | `auth-passkey-webauthn` | Biometric/passkey registration + auth |
| Multi-tenant, orgs | `auth-org-switcher` | Organization/workspace switching |
| Team invites | `auth-invite-flow` | Email invitation with role assignment |
| 401, 403, error pages | `auth-error-pages` | Unauthorized, forbidden, expired, locked |
| Rate limiting | `auth-rate-limit-ui` | Rate limit feedback + retry UI |

### Dashboard & Admin

| PRD Signal | Package | What you get |
|---|---|---|
| Dashboard, admin panel | `dashboard-shell` | Sidebar + topbar + content area layout |
| KPIs, stats, metrics | `dashboard-kpi-cards` | Stat cards with trend arrows + sparklines |
| Tables, data grids | `dashboard-data-table` | TanStack Table with sort/filter/paginate |
| Charts, graphs | `dashboard-charts` | Area, line, bar, donut charts |
| Settings page | `dashboard-settings-page` | Profile, appearance, notifications sections |
| Sidebar, navigation | `dashboard-sidebar-nav` | Collapsible sidebar with groups + badges |
| Analytics, reporting | `dashboard-analytics-page` | Analytics overview with date range + charts |
| Activity feed | `dashboard-activity-feed` | Timestamped timeline with avatars |
| Notifications | `dashboard-notification-center` | Bell dropdown with badge + list |
| User menu, avatar | `dashboard-user-menu` | Avatar dropdown with settings + logout |
| Global search | `dashboard-search-global` | Search with recent/suggested + keyboard shortcut |
| Empty states | `dashboard-empty-states` | Illustrations with descriptions + CTAs |
| Skeleton loading | `dashboard-loading-skeletons` | Skeleton screens for dashboard components |
| Calendar, events | `dashboard-calendar` | Month/week/day calendar with event management |
| Kanban board | `dashboard-kanban` | Drag-and-drop kanban with swimlanes |
| File browser | `dashboard-file-browser` | File/folder browser with previews |
| Logs | `dashboard-logs-viewer` | Real-time log viewer with filtering |
| Onboarding wizard | `dashboard-onboarding-wizard` | Step-by-step onboarding with progress |
| Feature flags | `dashboard-feature-flags` | Feature flag management with targeting |
| Audit trail | `dashboard-audit-trail` | User action audit trail with export |
| Gantt, timeline | `dashboard-gantt-chart` | Project timeline with dependencies |
| Heatmap | `dashboard-heatmap` | Data heatmap visualization |
| Map, geographic | `dashboard-map-visualization` | Geographic data visualization |
| Real-time, WebSocket | `dashboard-realtime-websocket` | Real-time dashboard updates |
| Scheduling | `dashboard-resource-scheduler` | Resource scheduling with drag-and-drop |

### Payments & Pricing

| PRD Signal | Package | What you get |
|---|---|---|
| Checkout, payment | `integration-stripe-checkout` | Stripe Checkout session + webhook handler |
| Subscriptions, billing | `integration-stripe-billing` | Subscription portal + plan switching |
| Pricing page, plans | `pricing-cards` | 2-4 tier cards with highlighted recommendation |
| Monthly/annual toggle | `pricing-billing-toggle` | Switch with savings percentage |
| Feature comparison | `pricing-comparison-table` | Full feature matrix across plans |
| Usage-based pricing | `pricing-calculator` | Calculator with slider |
| Pricing FAQ | `pricing-faq` | Accordion FAQ section |
| Usage meter, quota | `pricing-usage-meter` | Usage meter with quota bar |
| Enterprise CTA | `pricing-enterprise-cta` | Contact sales section |
| Upgrade flow | `pricing-upgrade-modal` | Upgrade modal with feature comparison |
| Lemon Squeezy | `integration-payments-lemon-squeezy` | Alternative payment integration |

### Components (UI Primitives)

| PRD Signal | Package | What you get |
|---|---|---|
| Forms, validation | `component-form-builder` | Multi-step form with Zod validation |
| Search, Cmd+K | `component-command-palette` | Command palette with keyboard nav |
| Toasts, alerts | `component-toast-notifications` | Stacked toast system with variants |
| Modals, dialogs | `component-modal-system` | Dialog, drawer, sheet, alert |
| Breadcrumbs | `component-breadcrumbs` | Dynamic breadcrumb with overflow |
| File upload | `component-file-upload` | Drag-and-drop with progress bars |
| Date picker | `component-date-picker` | Single + range with calendar popup |
| Rich text editor | `component-rich-text-editor` | Tiptap WYSIWYG with toolbar |
| Avatar group | `component-avatar-group` | Stacked avatars with overflow count |
| Tabs | `component-tabs-system` | URL sync, lazy loading, keyboard nav |
| Accordion | `component-accordion` | Collapsible sections with animations |
| Pagination | `component-pagination` | Page-based and cursor-based |
| Select, combobox | `component-select-combobox` | Searchable multi-select with async |
| Stepper | `component-stepper` | Step progress indicator |
| Timeline | `component-timeline` | Vertical timeline with icons |
| Tree view | `component-tree-view` | Expandable tree with checkboxes |
| Code block | `component-code-block` | Syntax highlight with copy + line numbers |
| Tag input | `component-tag-input` | Tag input with autocomplete |
| Copy button | `component-copy-button` | Click-to-copy with confirmation |
| Star rating | `component-star-rating` | Interactive rating with half-stars |
| Countdown | `component-countdown-timer` | Countdown with days/hours/min/sec |
| Signature pad | `component-signature-pad` | Digital signature drawing pad |
| Image cropper | `component-image-cropper` | Crop + resize with aspect ratio presets |

### Blog & Content

| PRD Signal | Package | What you get |
|---|---|---|
| Blog, articles | `blog-card` | Post card with image, title, excerpt, author |
| Blog listing | `blog-index-page` | Category filter + pagination |
| Blog post | `blog-post-page` | TOC, progress bar, related posts |
| Author pages | `blog-author-page` | Author bio + post list |
| Newsletter | `blog-newsletter-cta` | Inline + sticky newsletter signup |
| RSS, sitemap | `blog-rss-sitemap` | RSS feed + sitemap generation |
| Categories | `blog-category-page` | Category-filtered post list |
| Tags | `blog-tag-cloud` | Interactive weighted tag cloud |
| Comments | `blog-comments-giscus` | GitHub Discussions comments |
| Share buttons | `blog-share-buttons` | Social share + copy link |
| Reading mode | `blog-reading-mode` | Distraction-free toggle |
| Blog search | `blog-search-results` | Search results with highlighting |

### CRM & Sales

| PRD Signal | Package | What you get |
|---|---|---|
| Pipeline, deals | `crm-pipeline-kanban` | Drag-and-drop deal pipeline |
| Contacts, directory | `crm-contact-list` | Searchable contact directory |
| Contact detail | `crm-contact-detail` | Activity timeline + notes |
| Deal cards | `crm-deal-card` | Deal summary with stage indicator |
| Activity logging | `crm-activity-logger` | Log calls, emails, meetings |
| Lead scoring | `crm-lead-scoring` | Score display with criteria breakdown |
| CRM dashboard | `crm-dashboard-overview` | KPIs + pipeline summary |
| Sales reporting | `crm-reporting-charts` | Revenue, pipeline, activity charts |
| Company pages | `crm-company-page` | Company detail with contacts + deals |
| Email integration | `crm-email-integration` | Send/receive with threading |
| CRM tasks | `crm-task-manager` | Tasks with due dates + assignments |
| Import/export | `crm-import-export` | CSV/Excel for contacts and deals |
| Custom fields | `crm-custom-fields` | Custom field builder |
| Forecasting | `crm-sales-forecast` | Probability-weighted forecasting |

### E-Commerce

| PRD Signal | Package | What you get |
|---|---|---|
| Product listing | `shop-product-grid` | Product grid with cards |
| Product detail | `shop-product-detail` | Product page layout |
| Shopping cart | `shop-cart` | Cart with quantities + totals |
| Checkout | `shop-checkout` | Multi-step checkout flow |
| Categories | `shop-category-nav` | Category navigation |
| Search, filters | `shop-search-filters` | Search + filter sidebar |
| Wishlist | `shop-wishlist` | Save for later |
| Order history | `shop-order-history` | Past orders page |
| Checkout form | `form-checkout` | Shipping + payment + review |

### Email Templates

| PRD Signal | Package | What you get |
|---|---|---|
| Welcome email | `email-welcome` | Welcome + onboarding template |
| Password reset email | `email-password-reset` | Reset link transactional email |
| Invoice email | `email-invoice` | Invoice with line items |
| Newsletter | `email-newsletter` | Newsletter with sections + footer |
| Verification email | `email-verification` | Email confirmation template |
| Team invite email | `email-team-invite` | Team invitation with accept button |
| Payment failed | `email-payment-failed` | Failed payment + retry link |
| Trial ending | `email-trial-ending` | Expiration warning + upgrade CTA |
| Feature announcement | `email-feature-announcement` | New feature with screenshots |
| Weekly digest | `email-weekly-digest` | Activity summary |

### Integrations

| PRD Signal | Package | What you get |
|---|---|---|
| Stripe, payments | `integration-stripe-checkout` | Checkout + webhooks |
| Subscriptions | `integration-stripe-billing` | Subscription management |
| S3, file upload | `integration-s3-upload` | Pre-signed URL upload |
| OAuth provider | `integration-oauth-provider` | Google, GitHub, Apple login |
| Webhooks | `integration-webhook-handler` | Receiver + signature verification |
| Analytics, tracking | `integration-analytics-posthog` | PostHog events + feature flags |
| Email sending | `integration-email-sendgrid` | SendGrid with templates |
| Search | `integration-search-algolia` | Algolia instant search |
| Maps | `integration-maps-mapbox` | Mapbox interactive map |
| Video | `integration-video-mux` | Mux upload, processing, player |
| AI, chat | `integration-ai-openai` | OpenAI API with streaming chat |
| Push notifications | `integration-push-notifications` | Web push + service worker |
| Calendar sync | `integration-calendar-google` | Google Calendar API |
| SMS | `integration-sms-twilio` | Twilio SMS send/receive |

### Web Pages

| PRD Signal | Package | What you get |
|---|---|---|
| Landing page, hero | `page-landing-hero` | Hero + headline + features + CTA |
| Full landing | `page-landing-full` | Hero + features + pricing + testimonials |
| 404, error pages | `page-404-error` | 404 + 500 with illustration |
| About page | `page-about` | Team bios, values, story |
| Contact page | `page-contact` | Form + map + info cards |
| Features page | `page-features` | Feature showcase with icons |
| Pricing page | `page-pricing` | Toggle + comparison + FAQ |
| Changelog | `page-changelog` | Releases with version badges |
| Privacy policy | `page-legal-privacy` | Privacy with TOC + TL;DR |
| Terms of service | `page-legal-terms` | ToS with collapsible sections |
| Careers | `page-careers` | Job listings with apply flow |
| Case study | `page-case-study` | Problem, solution, results |
| FAQ | `page-faq` | FAQ with categories + search |
| Status page | `page-status` | Service uptime + incidents |
| Waitlist | `page-waitlist` | Pre-launch with position counter |
| Coming soon | `page-coming-soon` | Countdown + email capture |

### Design System Foundations

| PRD Signal | Package | What you get |
|---|---|---|
| Design tokens | `design-tokens` | Color, typography, spacing CSS vars |
| Theme, dark mode | `design-theme-switcher` | Light/dark/system toggle |
| Typography | `design-typography-scale` | Fluid type scale + prose styles |
| Color palette | `design-color-system` | Semantic colors + contrast checks |
| Icons | `design-icon-set` | SVG icon system with tree-shaking |
| Spacing grid | `design-spacing-grid` | 4px/8px grid system |
| Shadows | `design-shadow-system` | Elevation shadow tokens |
| Motion | `design-motion-tokens` | Duration, easing, spring presets |
| Accessibility | `design-accessibility-primitives` | Focus rings, skip links, SR utils |

### Animations & Interactions

| PRD Signal | Package | What you get |
|---|---|---|
| Page transitions | `animation-page-transition` | Route animations with Framer Motion |
| Scroll effects | `animation-scroll-reveal` | Scroll-triggered element reveals |
| Text animation | `animation-text-reveal` | Character/word staggered reveal |
| Number animation | `animation-number-counter` | Animated counting with easing |
| Loading animation | `animation-skeleton-loading` | Skeleton shimmer animations |
| Parallax | `animation-parallax-scroll` | Multi-layer parallax scrolling |
| Cursor effects | `animation-cursor-follow` | Cursor follow with spring physics |
| Magnetic button | `animation-magnetic-button` | Magnetic cursor attraction |
| Typing effect | `animation-typing-effect` | Typewriter with cursor |
| Confetti | `animation-confetti` | Celebration particle animation |
| 3D card tilt | `animation-3d-card-tilt` | 3D tilt on mouse hover |
| Gradient mesh | `animation-gradient-mesh` | Animated mesh gradient background |
| Easter egg | `trinity-signature` | Animated triangle signature |

### Forms (Advanced)

| PRD Signal | Package | What you get |
|---|---|---|
| Checkout form | `form-checkout` | Multi-step: shipping, payment, review |
| Survey builder | `form-survey-builder` | Dynamic survey with question types |
| Multi-step wizard | `form-wizard-multistep` | Wizard with per-step validation |
| Address input | `form-address-autocomplete` | Autocomplete + map preview |
| Phone input | `form-phone-input` | International with country codes |
| Credit card | `form-credit-card` | Formatting + card type detection |
| Conditional fields | `form-conditional-logic` | Show/hide based on rules |
| Repeatable fields | `form-array-fields` | Dynamic add/remove field groups |
| Autosave | `form-autosave-draft` | Draft recovery + conflict detection |
| Inline edit | `form-inline-edit` | Click-to-edit fields |

### PDF Documents

| PRD Signal | Package | What you get |
|---|---|---|
| Reports | `pdf-report-branded` | Branded PDF with header, footer, charts |
| Invoices | `pdf-invoice-template` | Invoice with line items + totals |
| Proposals | `pdf-proposal` | Business proposal with pricing |
| Contracts | `pdf-contract` | Service contract with signature fields |
| NDA | `pdf-nda` | Non-disclosure agreement |
| Certificates | `pdf-certificate` | Certificate of completion |
| Resumes | `pdf-resume` | Professional resume/CV |
| Receipts | `pdf-receipt` | Payment receipt |
| Data export | `pdf-data-export` | Tabular data to formatted PDF |

### Storage & Files

| PRD Signal | Package | What you get |
|---|---|---|
| Image gallery | `storage-image-gallery` | Gallery with lightbox + lazy loading |
| File manager | `storage-file-manager` | Grid/list views + context menu |
| Avatar upload | `storage-avatar-upload` | Upload + crop + resize + preview |
| Bulk upload | `storage-bulk-upload` | Multi-file with queue management |
| Media library | `storage-media-library` | Categories, search, metadata |
| S3 browser | `storage-s3-browser` | S3 bucket browser with upload |
| Download manager | `storage-download-manager` | Progress + resume downloads |

### Support & Feedback

| PRD Signal | Package | What you get |
|---|---|---|
| Help center | `support-help-center` | Categories + search + articles |
| Support tickets | `support-ticket-form` | Ticket submission with priority |
| Chat widget | `support-chat-widget` | Floating chat with message history |
| Feedback widget | `support-feedback-widget` | In-app feedback with screenshot |
| NPS survey | `support-nps-survey` | Net Promoter Score with follow-up |
| Knowledge base | `support-knowledge-base` | Articles + search + categories |
| Status page | `support-status-page` | Service status + incident history |
| CSAT survey | `support-csat-survey` | Satisfaction survey with emoji |

### DevOps & Config

| PRD Signal | Package | What you get |
|---|---|---|
| CI/CD | `config-github-actions` | Lint, type-check, test, deploy workflow |
| Docker | `config-docker-next` | Multi-stage Dockerfile for Next.js |
| ESLint, Prettier | `config-eslint-prettier` | Opinionated lint + format config |
| Docker Compose | `config-docker-compose-fullstack` | App + DB + cache + proxy |
| Nginx | `config-nginx-reverse-proxy` | SSL, rate limiting, caching |
| E2E testing | `config-playwright-e2e` | Playwright setup with page objects |
| Unit testing | `config-vitest-setup` | Vitest config with mocks + coverage |
| Monorepo | `config-turbo-monorepo` | Turborepo config with pipeline |
| PR template | `config-github-pr-template` | Checklist + review guidelines |
| Terraform | `config-terraform-hetzner` | Hetzner Cloud infrastructure |
| Kubernetes | `config-k8s-deployment` | K8s deployment + service + ingress |
| Monitoring | `config-monitoring-grafana` | Grafana + Prometheus dashboards |
| Backup | `config-backup-script` | DB + file backup with rotation |

### Agentic (Claude Code Extensions)

| PRD Signal | Package | What you get |
|---|---|---|
| Claude Code setup | `agentic-layer` | Full .claude/ folder: hooks, skills, agents |
| Swarm, multi-agent | `swarm-layer` | Swarm orchestration layer |
| Knowledge graph | `context-graph` | Persistent semantic memory across graphs |
| Security review | `skill-security` | OWASP checklist, auth patterns, validation |
| Copywriting | `skill-copywriter` | SEO-aware content creation workflow |
| Accessibility | `skill-accessibility` | WCAG compliance audit |
| Legal review | `skill-legal-review` | Contract and legal document review |
| Data analysis | `skill-data-analysis` | Data analysis and visualization |
| Translation | `agent-translator` | Multi-language translation agent |
| Content pipeline | `pipe-content-pipeline` | Research → draft → edit → publish |
| Onboarding pipeline | `pipe-onboarding-automation` | Automated user/employee onboarding |
| Testing skill | `skill-testing` | Vitest, Jest, Playwright patterns |
| Database skill | `skill-database` | Migration, query safety, schema design |
| Code review | `skill-review` | Automated review with risk tiers |
| Planning skill | `skill-plan` | Spec generation + implementation planning |

### Starters (Full Project Scaffolds)

| PRD Signal | Package | What you get |
|---|---|---|
| SaaS | `starter-saas-minimal` | Next.js + Auth + Dashboard + Billing |
| Admin panel | `starter-admin-panel` | Admin CRUD with data table + forms |
| Portfolio | `starter-portfolio` | Developer/agency portfolio site |
| Blog | `starter-blog` | MDX blog with RSS + code highlighting |
| Docs site | `starter-docs-site` | Documentation with sidebar + search |
| Landing page | `starter-landing-page` | Marketing landing with sections |
| Marketplace | `starter-marketplace` | Two-sided with listings + profiles |
| Course platform | `starter-course-platform` | Lessons + progress tracking |
| Booking system | `starter-booking-system` | Calendar + availability scheduling |
| Project mgmt | `starter-project-management` | Tasks, boards, timelines |
| Inventory | `starter-inventory` | Products + stock tracking |

---

## 3. PRD Scanning Rules

When analyzing a PRD, follow this priority order:

1. **Pick a Starter** — Does the project match an archetype? Start there.
2. **Add Auth** — Almost every project needs auth. Pick the auth packages that match your PRD's security requirements.
3. **Add Dashboard** — If there's any admin, reporting, or data management, add dashboard packages.
4. **Add Domain Packages** — Scan for domain-specific features (CRM, blog, e-commerce, etc.).
5. **Add Integrations** — Check for third-party service mentions (Stripe, S3, SendGrid, etc.).
6. **Add Pages** — Check for marketing/legal page requirements.
7. **Add DevOps** — Always add CI/CD and linting at minimum.
8. **Add Agentic** — If the project will use Claude Code for development, add the agentic layer.

### Common Combinations

**Every project should have:**
```bash
npx trinity369/use config-eslint-prettier      # Code quality
npx trinity369/use config-github-actions       # CI/CD
npx trinity369/use agentic-layer               # Claude Code development setup
```

**Every web app should add:**
```bash
npx trinity369/use auth-login-form             # Authentication
npx trinity369/use auth-signup-form            # Registration
npx trinity369/use page-404-error              # Error pages
npx trinity369/use component-toast-notifications # User feedback
npx trinity369/use email-welcome               # Welcome email
```

**Every dashboard app should add:**
```bash
npx trinity369/use dashboard-shell             # Layout
npx trinity369/use dashboard-kpi-cards         # Stats
npx trinity369/use dashboard-data-table        # Data display
npx trinity369/use dashboard-charts            # Visualizations
npx trinity369/use dashboard-sidebar-nav       # Navigation
```

---

_Generated from the trinity369/use template catalog (311 packages, 19 categories). Run `npx trinity369/use context-seed` to get the latest version of this guide._
