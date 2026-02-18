---
name: content-pipeline
description: Run a four-stage content creation pipeline — research, draft, edit, publish. Use for blog posts, documentation, newsletters, social media threads, and landing page copy. Produces publication-ready content with SEO optimization and platform formatting.
---

# Content Pipeline Skill

Run the full content creation pipeline from research through publication. Each stage produces artifacts that feed the next, with quality gates ensuring nothing advances prematurely.

## When to Use

- Creating blog posts, documentation, newsletters, social media threads, or landing page copy
- Repurposing existing content for a new format or audience
- Improving an existing draft that needs structured editing and SEO work
- Generating a content brief from a topic

## Content Brief Template

Before starting the pipeline, establish a content brief. If the user provides only a topic, gather the remaining details interactively or use sensible defaults.

```yaml
topic: ""
content_type: "blog"          # blog | documentation | newsletter | social-thread | landing-page
target_audience: ""
primary_keyword: ""
secondary_keywords: []
tone: "professional"           # professional | conversational | technical | friendly | authoritative
goal: "educate"                # educate | convert | engage | inform | entertain
word_count_target: 1200
references: []
output_format: "markdown"      # markdown | html | cms | plaintext
deadline: ""
```

**Defaults by content type:**

| Type           | Word Count | Tone           | Goal     |
|----------------|------------|----------------|----------|
| blog           | 1200       | professional   | educate  |
| documentation  | 2000       | technical      | inform   |
| newsletter     | 500        | conversational | engage   |
| social-thread  | 280/post   | friendly       | engage   |
| landing-page   | 400        | authoritative  | convert  |

---

## Stage 1 — Research

**Goal:** Build a comprehensive understanding of the topic so the draft is grounded in evidence and strategically positioned.

### Steps

1. **Gather sources**
   - Search for authoritative references on the topic
   - Check `content/research/sources.md` for pre-configured source lists if it exists
   - Identify 3 to 5 high-quality sources (articles, docs, studies, data)
   - Note key statistics, quotes, and data points worth citing

2. **Keyword analysis**
   - Confirm or refine the primary keyword from the brief
   - Identify 3 to 5 secondary/related keywords
   - Note long-tail keyword variations
   - Check for question-based keywords (what, how, why) for FAQ sections

3. **Competitive analysis**
   - Review top-ranking content for the primary keyword
   - Identify content gaps — what existing articles miss or underexplain
   - Note structural patterns (length, heading count, media usage)
   - Find unique angles the new content can take

4. **Audience alignment**
   - Confirm the target audience's knowledge level (beginner, intermediate, expert)
   - Identify pain points the content should address
   - Note the desired reader outcome after consuming the content

5. **Produce research brief**
   - Write a structured summary to `content/research/YYYY-MM-DD-<slug>-brief.md`
   - Include: source list, keyword map, competitive gaps, audience notes, recommended angle

### Quality Gate: Research --> Draft

Before advancing, verify:
- [ ] Research brief file exists and is complete
- [ ] At least 3 credible sources identified
- [ ] Primary keyword confirmed
- [ ] At least 3 secondary keywords listed
- [ ] Target audience and knowledge level defined
- [ ] Unique angle or content gap identified

---

## Stage 2 — Draft

**Goal:** Produce a complete first draft with proper structure, SEO foundations, and all sections filled.

### Steps

1. **Build the outline**
   - Check `content/templates/` for a matching outline template for the content type
   - If no template exists, generate an outline from the research brief:
     - Title (H1) containing the primary keyword
     - Introduction: hook, problem statement, preview
     - 3 to 6 body sections (H2) covering the topic comprehensively
     - Subsections (H3) where detail is needed
     - Conclusion with summary and call to action
   - Present the outline to the user for approval before writing

2. **Write the first draft**
   - Follow the approved outline section by section
   - Place the primary keyword in the title and within the first 100 words
   - Use secondary keywords naturally in subheadings and body text
   - Write in the tone specified in the brief
   - Target the word count from the brief (within 20% tolerance)
   - Use short paragraphs (2 to 3 sentences)
   - Include concrete examples, analogies, or data points from research
   - Add placeholder notes for images or diagrams where relevant: `<!-- IMAGE: description -->`

3. **Add SEO metadata**
   - Write a meta title (under 60 characters, includes primary keyword)
   - Write a meta description (under 160 characters, compelling, includes primary keyword)
   - Suggest a URL slug (lowercase, hyphenated, concise)
   - Note recommended internal/external links

4. **Save the draft**
   - Write to `content/drafts/YYYY-MM-DD-<slug>-v1.md`
   - Include YAML frontmatter:
     ```yaml
     ---
     title: ""
     slug: ""
     meta_title: ""
     meta_description: ""
     primary_keyword: ""
     secondary_keywords: []
     content_type: ""
     word_count: 0
     status: "draft"
     version: 1
     created: "YYYY-MM-DD"
     ---
     ```

### Quality Gate: Draft --> Edit

Before advancing, verify:
- [ ] All outline sections have content (no empty placeholders)
- [ ] Word count is within 20% of the target
- [ ] Meta title is under 60 characters
- [ ] Meta description is under 160 characters
- [ ] Primary keyword appears in the title and first 100 words
- [ ] Heading hierarchy is correct (H1 > H2 > H3, no skipped levels)
- [ ] YAML frontmatter is complete

---

## Stage 3 — Edit

**Goal:** Polish the draft to publication quality through systematic review across multiple dimensions.

### Steps

1. **Readability review**
   - Check average sentence length (target: 15 to 20 words)
   - Identify overly complex sentences and simplify
   - Ensure paragraph length stays under 4 sentences
   - Verify the reading level matches the target audience
   - Check for jargon — define technical terms on first use or simplify

2. **Fact verification**
   - Cross-reference claims against the research sources
   - Verify all statistics, dates, and named references are accurate
   - Check that code examples (if any) are syntactically correct
   - Flag any unsupported claims for removal or sourcing

3. **Tone and style consistency**
   - Load style guide from `content/style-guides/` if available
   - Verify the tone matches the brief throughout (no jarring shifts)
   - Check voice consistency (first person, second person, or third person — do not mix)
   - Remove filler words: "very", "really", "basically", "actually", "just", "quite"
   - Convert passive voice to active voice where possible
   - Ensure consistent terminology (do not alternate between synonyms for key concepts)

4. **Grammar and mechanics**
   - Fix spelling errors
   - Check punctuation consistency (Oxford comma, em dashes, etc.)
   - Verify proper capitalization in headings
   - Check for repeated words or phrases in close proximity

5. **SEO optimization**
   - Verify keyword placement is natural (not forced or stuffed)
   - Confirm all headings contain relevant keywords where appropriate
   - Check that images have alt text descriptions
   - Validate internal and external links are present and relevant
   - Confirm meta title and description are compelling

6. **Apply custom checklist**
   - If `content/style-guides/edit-checklist.md` exists, run through each item
   - Note any project-specific rules and verify compliance

7. **Save the edited version**
   - Increment the version number in frontmatter
   - Save as `content/drafts/YYYY-MM-DD-<slug>-v<N>.md`
   - Update `status` to `"edited"`

### Quality Gate: Edit --> Publish

Before advancing, verify:
- [ ] No spelling or grammar errors remain
- [ ] Tone is consistent throughout
- [ ] No filler words present
- [ ] All facts are verified or sourced
- [ ] SEO metadata is optimized
- [ ] Style guide rules applied (if style guide exists)
- [ ] Custom edit checklist passed (if checklist exists)
- [ ] Reading level is appropriate for the target audience

---

## Stage 4 — Publish

**Goal:** Format the content for its target platform, generate all accompanying assets, and produce the final publication-ready output.

### Steps

1. **Format for target platform**

   Based on the `output_format` in the brief:

   - **Markdown**: Clean `.md` with YAML frontmatter (title, slug, date, tags, description, author)
   - **HTML**: Standalone HTML document with semantic tags, inline critical styles, and proper `<head>` metadata
   - **CMS-ready**: Frontmatter-enriched markdown compatible with static site generators (Hugo, Astro, Next.js, Jekyll). Include fields: `title`, `slug`, `date`, `description`, `tags`, `category`, `featured_image`, `draft: false`
   - **Plain text**: Stripped of all formatting, suitable for email or plain-text distribution

2. **Generate meta tags**
   - Open Graph tags: `og:title`, `og:description`, `og:type`, `og:url`, `og:image`
   - Twitter Card tags: `twitter:card`, `twitter:title`, `twitter:description`, `twitter:image`
   - Include as HTML comments or frontmatter depending on the output format
   - Generate a JSON-LD structured data snippet for blog posts:
     ```json
     {
       "@context": "https://schema.org",
       "@type": "Article",
       "headline": "",
       "description": "",
       "keywords": "",
       "datePublished": "",
       "author": { "@type": "Person", "name": "" }
     }
     ```

3. **Generate social media snippets**
   - Create a companion file: `content/published/YYYY-MM-DD-<slug>-social.md`
   - Include:
     - **Twitter/X post** (under 280 characters): hook + link placeholder
     - **LinkedIn post** (under 700 characters): professional angle + key takeaway + link
     - **Short teaser** (under 100 characters): for use in email subject lines or push notifications
   - Use the content's hook or most compelling insight as the basis

4. **Generate URL slug**
   - Derive from the title: lowercase, replace spaces with hyphens, strip special characters
   - Remove common stop words (the, a, an, is, at, in, on, for, to, of, and, or, but)
   - Keep it under 60 characters

5. **Final assembly**
   - Write the formatted content to `content/published/YYYY-MM-DD-<slug>.<ext>`
     - `.md` for markdown and CMS formats
     - `.html` for HTML format
     - `.txt` for plain text
   - Write social snippets to `content/published/YYYY-MM-DD-<slug>-social.md`
   - Update frontmatter: `status: "published"`, add `published_date`

### Quality Gate: Publish --> Done

Before marking complete, verify:
- [ ] Published file exists in `content/published/`
- [ ] Output format matches the brief's specification
- [ ] Meta tags are present and complete
- [ ] Social media snippets are generated
- [ ] URL slug is clean and concise
- [ ] All frontmatter fields are populated
- [ ] File renders correctly in the target format

---

## Running the Pipeline

### Full pipeline (interactive)

Walk through all four stages with the user, presenting output and quality gate results at each transition.

```
1. Confirm or create the content brief
2. Run Research --> present brief --> gate check
3. Run Draft --> present outline for approval --> write draft --> gate check
4. Run Edit --> present changes --> gate check
5. Run Publish --> present final output --> gate check
6. Report: files created, word count, keywords used, links generated
```

### Single stage

If the user has an existing draft or brief, start from the appropriate stage:

- "Edit this draft" --> Start at Stage 3
- "Publish this content" --> Start at Stage 4
- "Research this topic" --> Run only Stage 1
- "Draft from this brief" --> Start at Stage 2

### Batch content

For multiple pieces of content:
1. Create briefs for each piece
2. Run the pipeline for each sequentially
3. Maintain a tracking list:
   ```
   | # | Topic                  | Type   | Status    | File                           |
   |---|------------------------|--------|-----------|--------------------------------|
   | 1 | Getting Started Guide  | blog   | published | 2025-01-15-getting-started.md  |
   | 2 | API Reference          | docs   | editing   | 2025-01-15-api-reference-v2.md |
   | 3 | January Newsletter     | news   | drafting  | 2025-01-15-january-news-v1.md  |
   ```

---

## Style Guide Integration

The pipeline checks `content/style-guides/` for `.md` files and applies their rules during editing. Multiple style guides are applied in alphabetical order. Common style guide structure:

```markdown
# Project Style Guide

## Voice
- Second person ("you") for tutorials and docs
- First person plural ("we") for company announcements

## Tone
- Professional but approachable
- Confident, not arrogant

## Formatting
- Use sentence case for headings
- Maximum 3 sentences per paragraph
- Use numbered lists for sequential steps, bullet lists for unordered items

## Vocabulary
- Preferred: "use" (not "utilize"), "help" (not "facilitate"), "start" (not "commence")
- Avoid: "leverage", "synergy", "paradigm", "disrupt"

## SEO Rules
- Primary keyword in first 100 words
- One H1 only (the title)
- H2s for main sections, H3s for subsections
```

If no style guide exists, the pipeline applies these defaults:
- Active voice preferred
- Short paragraphs (2 to 3 sentences)
- No filler words
- Sentence case for headings
- Second person for instructional content

---

## Tips

- **Start with a strong brief.** The better the brief, the less editing required later.
- **Do not skip the outline step.** Approving the outline before writing prevents major structural rewrites.
- **Use the quality gates.** They exist to catch problems early. Pushing content forward with gate failures leads to compounding issues.
- **Keep style guides up to date.** As your brand voice evolves, update the style guide so the pipeline adapts.
- **Review social snippets carefully.** Automated snippets are a starting point — always tailor them for each platform's audience.
