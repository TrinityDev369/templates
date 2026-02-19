# Thumbnail Generator

AI-powered thumbnail generation with Reve (default) + Flux backends, IVM geometric overlay system, and full dashboard UI.

## Commands

- `/thumbnail-generator adapt` — Scan project and adapt this skill to your codebase
- `/thumbnail-generator generate <prompt>` — Generate a thumbnail from a text prompt
- `/thumbnail-generator enhance <id>` — Enhance a thumbnail with Reve AI
- `/thumbnail-generator presets` — List available presets and their configurations
- `/thumbnail-generator status` — Health check (DB, S3, API keys)

## Project Context

<!-- ADAPT: This section is auto-populated by `/thumbnail-generator adapt` -->

- **Framework**: Next.js (detected from package.json)
- **Image directories**: (run adapt to detect)
- **Brand colors**: (run adapt to detect from tailwind config)
- **Storage**: S3-compatible (configured via .env)
- **Database**: PostgreSQL (configured via DATABASE_URL)

## Architecture

```
lib/thumbnail/
  clients/reve.ts       — Reve AI client (edit, create, remix)
  clients/flux.ts       — Flux client (generate, poll, download)
  types.ts              — All types, presets, helpers
  presets.ts            — 7 predefined thumbnail formats
  enhancer.ts           — Prompt enhancement with brand guidelines
  service.ts            — Unified generate service (Reve default)
  storage.ts            — Generic S3 adapter
  overlay/ivm-svg.ts    — IVM triangle tessellation SVG generator
  overlay/compose.ts    — Sharp-based image composition
  db/schema.sql         — PostgreSQL migration
  db/queries.ts         — Self-contained CRUD + versioning

app/dashboard/thumbnails/    — Dashboard UI (grid, detail, generate)
app/api/thumbnails/          — REST API (CRUD, generate, enhance, compose)
components/thumbnails/       — Reusable UI components
```

## Backends

### Reve (Default)
- Synchronous API — no polling needed
- Edit endpoint for AI enhancement of existing images
- Create endpoint for text-to-image generation
- ~30 credits per enhancement
- Env: `REVE_API_KEY`

### Flux (Black Forest Labs)
- Async generation with polling
- Models: flux-dev ($0.01), flux-2-pro ($0.05), flux-2-max ($0.08)
- Rate limit: 24 concurrent tasks
- Regional endpoints: global, EU, US
- Env: `BFL_API_KEY`

## IVM Overlay System

Isotropic Vector Matrix — procedural triangle tessellation for brand overlays:
- Corner-masked vectors with gradient opacity
- Configurable: triangle size, rotation, blur, opacity, line width
- Typography: title text with backdrop bar
- Badges: category labels with positioning
- Sharp composition for server-side rendering

## Brand Guidelines

<!-- ADAPT: Customize these for your brand -->

```typescript
const brand = {
  colorPalette: ['deep blue (#0066cc)', 'purple gradient', 'electric violet', 'dark backgrounds'],
  styleKeywords: ['modern', 'professional', 'tech-forward', 'minimalist'],
  avoidKeywords: ['cartoonish', 'clip art', 'stock photo style'],
};
```

## Presets

<!-- ADAPT: Mark which presets your project uses -->

| Preset | Dimensions | Use Case |
|--------|-----------|----------|
| youtube | 1280x720 | YouTube thumbnails |
| og-image | 1200x630 | Open Graph / social sharing |
| blog-hero | 1920x1080 | Blog post headers |
| square | 1080x1080 | Instagram posts |
| portrait | 1080x1920 | Stories (Instagram/TikTok) |
| twitter-header | 1500x500 | Twitter/X profile headers |
| dev | 1024x576 | Testing (non-commercial) |

## Adapt Command

When the user runs `/thumbnail-generator adapt`, perform these steps:

1. **Glob** `**/*.{png,jpg,svg,webp}` to detect image directories and patterns
2. **Read** `package.json` to confirm framework and dependencies
3. **Read** `tailwind.config.*` to extract brand colors from the theme
4. **Grep** for existing thumbnail/OG image patterns (`og:image`, `twitter:image`, `opengraph`)
5. **Check** `.env*` files for S3 and API key configuration
6. **Edit** this SKILL.md to replace `<!-- ADAPT -->` sections with discovered context:
   - Update "Project Context" with detected framework, dirs, colors
   - Update "Brand Guidelines" with colors from tailwind config
   - Update "Presets" to mark which are actively used

After adapting, summarize what was discovered and recommend next steps.

## Generate Command

When the user runs `/thumbnail-generator generate <prompt>`:

1. Parse the prompt text
2. Ask which preset to use (default: og-image) and backend (default: reve)
3. Call the generate API: `POST /api/thumbnails/generate`
4. Report: dimensions, generation time, cost, and the thumbnail ID
5. Suggest: "View at /dashboard/thumbnails/{id}" or "Enhance with /thumbnail-generator enhance {id}"

## Enhance Command

When the user runs `/thumbnail-generator enhance <id>`:

1. Ask for the edit instruction (what to change)
2. Ask for model version: Quality (latest) or Fast (latest-fast)
3. Call: `POST /api/thumbnails/{id}/enhance`
4. Report: credits used, new version number
5. Suggest viewing the result or applying IVM overlay

## Status Command

When the user runs `/thumbnail-generator status`:

Check and report:
- [ ] DATABASE_URL is set and connectable
- [ ] S3 credentials are configured (S3_ENDPOINT, S3_ACCESS_KEY_ID, S3_SECRET_ACCESS_KEY, S3_BUCKET)
- [ ] REVE_API_KEY is set (for Reve backend)
- [ ] BFL_API_KEY is set (for Flux backend)
- [ ] `generated_thumbnails` table exists
- [ ] `sharp` is installed (for IVM composition)
- [ ] shadcn/ui components are available

## Setup

```bash
# 1. Run the database migration
psql $DATABASE_URL -f lib/thumbnail/db/schema.sql

# 2. Set environment variables (see .env.example)

# 3. Install peer dependencies
npm install pg @aws-sdk/client-s3 @aws-sdk/s3-request-presigner sharp lucide-react

# 4. Add shadcn/ui components (if not already installed)
npx shadcn@latest add card badge button dialog input label select slider switch textarea alert-dialog
```
