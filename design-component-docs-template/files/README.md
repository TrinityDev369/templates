# Design Component Docs Template

A standardized documentation template for design system components. Provides a fillable markdown template and a companion writing guide so every component in your design system gets consistent, thorough documentation.

## What's Included

| File | Purpose |
|------|---------|
| `component-doc.template.md` | Fillable markdown template -- copy once per component |
| `COMPONENT_DOC_GUIDE.md` | Writing guide with section-by-section instructions |
| `README.md` | This file |

## How to Use the Template

### 1. Copy the template

For each component you need to document, copy `component-doc.template.md` into your docs directory and rename it to match the component:

```bash
cp component-doc.template.md Button.md
```

### 2. Fill in the placeholders

Every `{placeholder}` in the template marks a spot that needs your content. Work through the file from top to bottom:

- Replace `{ComponentName}` with the actual component name (e.g., `Button`)
- Replace `{component-path}` with the real import path
- Fill in descriptions, props, variants, and examples
- Remove any sections that do not apply to your component

### 3. Consult the writing guide

Open `COMPONENT_DOC_GUIDE.md` for detailed advice on each section -- what to include, how to phrase it, and common pitfalls to avoid.

## Section Overview

The template covers the following sections:

- **Overview** -- Purpose and context within the design system
- **Import** -- Copy-pasteable import statement
- **Usage** -- Basic and advanced code examples
- **Props** -- Full props table with types, defaults, and descriptions
- **Variants** -- Visual style options with guidance on when to use each
- **Sizes** -- Dimension options mapped to use cases
- **Accessibility** -- ARIA roles, keyboard behavior, screen reader support
- **Design Tokens** -- CSS custom properties the component exposes
- **Composition** -- How the component combines with other components
- **Do / Don't** -- Usage patterns and anti-patterns
- **Related** -- Links to related components
- **Changelog** -- Version history

Not every section applies to every component. Remove sections that are irrelevant rather than leaving them with placeholder text.

## Tips for Maintaining Docs Alongside Components

**Keep docs next to code.** Store component docs in the same directory as the component source or in a parallel `docs/` folder. This makes it easy to update documentation when the component changes.

**Update docs in the same pull request.** When a component's API changes -- new props, renamed variants, deprecated features -- update the corresponding doc file in the same PR. Stale documentation is worse than no documentation.

**Review docs like code.** Include documentation files in code review. Check that props tables match the actual TypeScript interface, that examples compile, and that accessibility guidance is accurate.

**Automate what you can.** Consider generating the props table from TypeScript types or JSDoc comments. Manual documentation works well for usage guidance and accessibility notes, but prop definitions are better kept in sync automatically.

**Start minimal, expand later.** Not every component needs every section on day one. Begin with Overview, Import, Usage, and Props. Add Accessibility, Design Tokens, and Composition as the component matures.

## Requirements

- No runtime dependencies -- these are plain markdown files
- Any markdown renderer (GitHub, VS Code, Storybook Docs, Docusaurus) will display them correctly
