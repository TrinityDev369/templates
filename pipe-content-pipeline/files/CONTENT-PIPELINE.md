# Content Pipeline

A four-stage content creation workflow that takes content from initial research through to final publication. Each stage has defined inputs, outputs, and quality gates to ensure consistent, high-quality results.

## Pipeline Overview

```
Research  -->  Draft  -->  Edit  -->  Publish
   |             |           |          |
   v             v           v          v
 Sources      Outline     Polished   Formatted
 Keywords     Raw draft   Verified   Distributed
 Brief        Structure   On-brand   SEO-ready
```

### Stage 1 — Research

Gather source material, identify keywords, analyze competitors, and produce a structured research brief that guides all subsequent stages.

**Inputs:** Topic, content type, target audience
**Outputs:** Research brief in `content/research/`

### Stage 2 — Draft

Build an outline from the research brief, then write a complete first draft with proper heading hierarchy, SEO structure, and placeholder meta descriptions.

**Inputs:** Research brief
**Outputs:** Draft file in `content/drafts/`

### Stage 3 — Edit

Review the draft for readability, factual accuracy, tone consistency, grammar, and SEO optimization. Apply style guide rules and perform a structured quality review.

**Inputs:** Draft file, style guide
**Outputs:** Edited draft (updated in place or new revision in `content/drafts/`)

### Stage 4 — Publish

Format the final content for the target platform, generate accompanying assets (meta tags, social media snippets, Open Graph data), and move the finished piece to `content/published/`.

**Inputs:** Edited draft, target platform/format
**Outputs:** Published content in `content/published/`, social media snippets

---

## Directory Structure

```
content/
  research/          # Research briefs, source lists, keyword maps
  drafts/            # Work-in-progress content (all revisions)
  published/         # Final formatted content ready for distribution
  style-guides/      # Brand voice docs, tone references, glossaries
  templates/         # Reusable content brief templates and outlines
```

Run the setup script to create this structure:

```bash
./scripts/content-pipeline.sh init
```

---

## Supported Content Types

| Content Type         | Typical Length    | Key Considerations                              |
|----------------------|-------------------|--------------------------------------------------|
| Blog post            | 800 -- 2000 words | SEO headings, meta description, featured image   |
| Documentation        | 500 -- 5000 words | Code examples, step-by-step structure, accuracy   |
| Newsletter           | 300 -- 800 words  | Scannable format, clear CTA, mobile-friendly      |
| Social media thread  | 5 -- 15 posts     | Platform character limits, hook-first, hashtags    |
| Landing page copy    | 200 -- 600 words  | Headline hierarchy, benefit-driven, single CTA     |

---

## Configuration

### Content Brief

Every piece of content starts with a brief. Generate one with:

```bash
./scripts/content-pipeline.sh brief --type blog --topic "Your Topic Here"
```

The brief template includes:

- **Topic**: What the content is about
- **Content type**: One of the supported types above
- **Target audience**: Who will read this
- **Primary keyword**: Main SEO target keyword
- **Secondary keywords**: Supporting keyword list
- **Tone**: e.g., professional, conversational, technical, friendly
- **Goal**: What the content should achieve (educate, convert, engage)
- **Word count target**: Approximate desired length
- **References**: URLs, documents, or prior content to draw from
- **Deadline**: Target completion date

### Style Guide

Place custom style guides in `content/style-guides/`. The pipeline will apply any `.md` file found there during the Edit stage. A style guide typically covers:

- **Voice and tone** -- personality, formality level, perspective (first/second/third person)
- **Vocabulary** -- preferred terms, words to avoid, industry jargon policy
- **Formatting** -- heading conventions, list usage, paragraph length targets
- **Grammar** -- Oxford comma, sentence length, passive voice policy
- **Brand-specific rules** -- any project-unique writing standards

If no style guide is present, the pipeline uses sensible defaults (active voice, short paragraphs, clear headings).

---

## SEO Integration

The pipeline weaves SEO into every stage rather than bolting it on at the end.

### During Research
- Identify primary and secondary keywords from the topic
- Analyze top-ranking competitor content for the target keyword
- Note content gaps and angle opportunities

### During Drafting
- Place the primary keyword in the title (H1) and first 100 words
- Use secondary keywords naturally in H2/H3 subheadings
- Write a meta title (under 60 characters) and meta description (under 160 characters)
- Structure content with a logical heading hierarchy (H1 > H2 > H3)
- Target appropriate content length for the keyword's competition level

### During Editing
- Verify keyword density is natural (not stuffed)
- Check that all images have descriptive alt text
- Ensure internal and external links are relevant and functional
- Validate heading hierarchy has no skipped levels
- Confirm meta title and description are compelling and within character limits

### During Publishing
- Generate Open Graph tags (og:title, og:description, og:image)
- Create Twitter Card meta tags
- Produce a JSON-LD structured data snippet if applicable
- Generate a URL slug from the title (lowercase, hyphenated, no stop words)

---

## Customizing Each Stage

### Custom Research Sources

Add a `content/research/sources.md` file listing go-to reference sites, competitor URLs, or internal knowledge bases. The Research stage will consult these first.

### Custom Draft Templates

Place outline templates in `content/templates/` as markdown files. For example, `content/templates/blog-outline.md` might contain:

```markdown
# [Title]

## Introduction
- Hook the reader
- State the problem
- Preview the solution

## [Main Section 1]
- Key point
- Supporting evidence
- Example or analogy

## [Main Section 2]
...

## Conclusion
- Summarize key takeaways
- Call to action
```

### Custom Edit Checklists

Create `content/style-guides/edit-checklist.md` with project-specific review items. These are checked in addition to the default quality gates.

### Custom Publish Formats

The Publish stage supports multiple output formats:

- **Markdown** -- clean `.md` file with YAML frontmatter
- **HTML** -- standalone HTML document with inline styles
- **CMS-ready** -- frontmatter-enriched markdown for static site generators (Hugo, Astro, Next.js)
- **Plain text** -- stripped formatting for email or plain-text channels

Specify the format in the content brief or pass it to the publish stage directly.

---

## Quality Gates

Each stage transition has a quality gate that must pass before the content advances.

| Gate                   | Checks                                                              |
|------------------------|----------------------------------------------------------------------|
| Research --> Draft     | Brief is complete, keywords identified, at least 3 sources listed   |
| Draft --> Edit         | All outline sections filled, word count within 20% of target, meta fields present |
| Edit --> Publish       | Readability score acceptable, no spelling/grammar errors flagged, style guide applied |
| Publish --> Done       | Output file exists, meta tags generated, social snippets created     |

If a gate fails, the content returns to the previous stage with specific feedback on what needs to be addressed.

---

## Example Workflow

```bash
# 1. Set up directories (first time only)
./scripts/content-pipeline.sh init

# 2. Create a content brief
./scripts/content-pipeline.sh brief --type blog --topic "Getting Started with CI/CD"

# 3. Use the Claude Code skill to run the full pipeline
#    (The skill walks through each stage interactively)

# 4. Find your published content in content/published/
ls content/published/
```

---

## File Naming Conventions

- **Research briefs**: `content/research/YYYY-MM-DD-<slug>-brief.md`
- **Drafts**: `content/drafts/YYYY-MM-DD-<slug>-v<N>.md`
- **Published**: `content/published/YYYY-MM-DD-<slug>.<format>`
- **Social snippets**: `content/published/YYYY-MM-DD-<slug>-social.md`

Slugs are generated from the topic: lowercase, hyphens for spaces, no special characters.
