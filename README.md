# Trinity Templates

Installable templates from [Trinity Agency](https://trinity.agency). Drop components, configs, and starters into any project.

## Quick Start

```bash
npx @trinity/use <template>
```

## Available Templates

| Template | Description |
|----------|-------------|
| `trinity-signature` | Animated triangle signature easter-egg for client sites |

## How It Works

1. `npx @trinity/use <template>` fetches the template manifest from this repo
2. Downloads each file via GitHub raw URLs
3. Writes them to your project — self-contained, zero monorepo dependencies

## Commands

```bash
npx @trinity/use --list               # List all templates
npx @trinity/use <template>           # Install template
npx @trinity/use <template> --dir .   # Custom output directory
```

## Adding Templates

Each template lives in its own directory with:

```
<template-name>/
├── manifest.json    # Files list, output dir, peer deps, post-install message
├── README.md        # Documentation
└── files/           # Template source files
```

Register new templates in `registry.json`.

---

Built by [Trinity Agency](https://trinity.agency)
