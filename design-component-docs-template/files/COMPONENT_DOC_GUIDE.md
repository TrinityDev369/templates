# Component Documentation Guide

This guide explains how to write effective component documentation using the provided template.

## Getting Started

1. Copy `component-doc.template.md` into your docs directory
2. Rename it to match your component (e.g., `Button.md`, `Card.md`)
3. Replace all `{placeholder}` values with actual content
4. Remove sections that don't apply to your component

## Section Guidelines

### Overview
Write 2-3 sentences. Answer: What does it do? When should I use it? What does it replace?

### Usage Examples
- Start with the simplest possible example (zero or minimal props)
- Add progressively complex examples
- Show real-world composition patterns
- Include TypeScript types in examples

### Props Table
- List required props first, then optional
- Always include the default value
- Write descriptions as imperative sentences ("Sets the variant" not "This sets the variant")
- For union types, list all options

### Accessibility
This section is mandatory for interactive components. Document:
- ARIA roles and attributes
- Keyboard interaction patterns
- Screen reader announcements
- Focus management behavior
- Color contrast requirements

### Design Tokens
List every CSS custom property the component uses. This helps designers and developers customize the component without modifying source code.

### Do / Don't
Include at least 2 pairs. Focus on the most common mistakes:
- Wrong variant for the context
- Missing accessibility attributes
- Overriding internal styles instead of using tokens
- Nesting incompatible components

## Naming Conventions

- File name: PascalCase matching the component (`Button.md`)
- Anchors: kebab-case (`#with-props`, `#design-tokens`)
- Code examples: Use the actual import path from your project

## Writing Style

- Use present tense ("Renders a button" not "Will render a button")
- Be concise -- developers scan documentation
- Include the "why" not just the "what"
- Link to related components when mentioning them
