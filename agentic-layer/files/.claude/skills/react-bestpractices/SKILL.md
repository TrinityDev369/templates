---
name: react-best-practices
description: React and Next.js performance optimization guidelines from Vercel Engineering. This skill should be used when writing, reviewing, or refactoring React/Next.js code to ensure optimal performance patterns. Triggers on tasks involving React components, Next.js pages, data fetching, bundle optimization, or performance improvements.
---

# React Best Practices

## Overview

Performance optimization guide for React and Next.js applications, ordered by impact. Apply these patterns when writing or reviewing code to maximize performance gains.

## When to Apply

Reference these guidelines when:
- Writing new React components or Next.js pages
- Implementing data fetching (client or server-side)
- Reviewing code for performance issues
- Refactoring existing React/Next.js code
- Optimizing bundle size or load times

## Priority-Ordered Guidelines

| Priority | Category | Impact |
|----------|----------|--------|
| 1 | Eliminating Waterfalls | CRITICAL |
| 2 | Bundle Size Optimization | CRITICAL |
| 3 | Server-Side Performance | HIGH |
| 4 | Client-Side Data Fetching | MEDIUM-HIGH |
| 5 | Re-render Optimization | MEDIUM |
| 6 | Rendering Performance | MEDIUM |
| 7 | JavaScript Performance | LOW-MEDIUM |
| 8 | Advanced Patterns | LOW |

## Quick Reference

### Critical Patterns (Apply First)

**Eliminate Waterfalls:**
- Use `Promise.all()` for independent async operations
- Start promises early, await late
- Use Suspense boundaries to stream content

**Reduce Bundle Size:**
- Avoid barrel file imports (import directly from source)
- Use `next/dynamic` for heavy components
- Defer non-critical third-party libraries
- Preload based on user intent

### High-Impact Server Patterns

- Use `React.cache()` for per-request deduplication
- Use LRU cache for cross-request caching
- Minimize serialization at RSC boundaries
- Parallelize data fetching with component composition

### Medium-Impact Client Patterns

- Use SWR for automatic request deduplication
- Defer state reads to usage point
- Use derived state subscriptions
- Apply `startTransition` for non-urgent updates

## Extended References

For detailed code examples, create reference files:
- `references/rules/async-*.md` - Waterfall elimination patterns
- `references/rules/bundle-*.md` - Bundle size optimization
- `references/rules/server-*.md` - Server-side performance
- `references/rules/client-*.md` - Client-side data fetching
- `references/rules/rerender-*.md` - Re-render optimization
