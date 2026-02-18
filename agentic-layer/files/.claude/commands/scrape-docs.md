---
description: Fetch URL content and save as markdown documentation
argument-hint: [url] [output-path]
---

# Scrape Docs

Fetch content from a URL and save it as a well-formatted markdown file for agent reference.

## Variables

URL: $1
OUTPUT_PATH: $2

## Instructions

- If no `URL` provided, STOP and ask.
- Default OUTPUT_PATH to `docs/ai-reference/<domain-slug>.md` if not specified.
- Use WebFetch or firecrawl to fetch the URL content.
- Clean and format the content as markdown.
- Save to OUTPUT_PATH.

## Workflow

1. Parse URL and OUTPUT_PATH
2. Fetch URL content via WebFetch
3. Clean HTML artifacts, format as readable markdown
4. Write to OUTPUT_PATH
5. Report file path and content summary

## Report

```
Scraped: [URL]
Saved: [OUTPUT_PATH]
Content: [brief summary of what was captured]
```
