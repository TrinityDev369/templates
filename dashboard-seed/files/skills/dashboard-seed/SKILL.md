---
name: dashboard-seed
description: Autonomous dashboard composer — discovers the user's data model and roles, selects an archetype, installs dashboard components via `npx @trinity369/use`, and generates the glue layer (navigation config, barrel exports, layout wiring). Use when the user wants to scaffold a dashboard, compose a dashboard from widgets, set up an admin panel, create a project management UI, build an analytics view, or wire dashboard navigation. Triggers on "dashboard", "admin panel", "compose dashboard", "scaffold dashboard", "dashboard layout".
---

# Dashboard Seed

Autonomous executor that composes a complete dashboard from 18 published widget templates. Discovers the domain, selects an archetype, installs components in dependency order, and generates the glue layer that wires everything together.

## Available Components (18)

| Layer | Slug | Purpose |
|-------|------|---------|
| 0 Shell | `dashboard-shell` | Responsive layout, collapsible sidebar, topbar, breadcrumbs |
| 1 Nav | `dashboard-sidebar-nav` | Grouped sidebar navigation with badges and sub-items |
| 1 Nav | `dashboard-user-menu` | Avatar dropdown with profile, settings, theme switcher |
| 2 Data | `dashboard-kpi-cards` | KPI stat cards with trend indicators, sparklines |
| 2 Data | `dashboard-charts` | Area, bar, line, donut charts (recharts) |
| 2 Data | `dashboard-data-table` | Sortable table with filtering, pagination (TanStack Table) |
| 2 Data | `dashboard-search-global` | Cmd+K global search dialog |
| 3 Domain | `dashboard-kanban` | Drag-and-drop kanban board |
| 3 Domain | `dashboard-calendar` | Month/week/day calendar views |
| 3 Domain | `dashboard-gantt-chart` | Gantt chart timeline |
| 3 Domain | `dashboard-resource-scheduler` | Resource scheduling grid |
| 3 Domain | `dashboard-heatmap` | Heatmap visualization |
| 3 Domain | `dashboard-map-visualization` | Interactive map visualization |
| 3 Domain | `dashboard-realtime-websocket` | Real-time WebSocket integration |
| 4 Util | `dashboard-notification-center` | Bell icon popover with unread badge |
| 4 Util | `dashboard-activity-feed` | Timestamped activity timeline |
| 4 Util | `dashboard-settings-page` | Settings with profile, appearance, notifications tabs |
| Bonus | `shop-order-history` | Order history with status badges (shop domain) |

## Archetypes

| Archetype | Personality | Component Count |
|-----------|-------------|-----------------|
| `analytics` | Dense, data-forward, charts and numbers | 10 |
| `admin` | CRUD-focused, user management, audit trails | 11 |
| `project` | Workflow-heavy, timeline-oriented, collaboration | 12 |
| `crm` | Pipeline-focused, deal tracking, contacts | 10 |
| `monitoring` | Real-time, alerts, system health | 10 |
| `minimal` | Clean, focused, essential only | 6 |

### Archetype Component Map

```
analytics:  shell, sidebar-nav, user-menu, kpi-cards, charts, data-table, search-global, heatmap, settings-page, notification-center
admin:      shell, sidebar-nav, user-menu, kpi-cards, data-table, search-global, notification-center, activity-feed, settings-page, calendar, realtime-websocket
project:    shell, sidebar-nav, user-menu, kpi-cards, charts, data-table, kanban, calendar, gantt-chart, resource-scheduler, notification-center, activity-feed
crm:        shell, sidebar-nav, user-menu, kpi-cards, charts, data-table, kanban, activity-feed, notification-center, search-global
monitoring: shell, sidebar-nav, user-menu, kpi-cards, charts, heatmap, map-visualization, realtime-websocket, notification-center, settings-page
minimal:    shell, sidebar-nav, user-menu, kpi-cards, data-table, settings-page
```

## Execution — 5 Phases

Execute phases sequentially. Never skip the confirmation step in Phase 2.

---

### Phase 1: Discovery

Have a brief conversation to understand the domain. Ask naturally — not as a form.

**Extract these signals** (2-3 questions max):
1. **Domain** — What does the application do? What entities/data exist?
2. **Users** — Who uses the dashboard? What are their roles?
3. **Priority views** — What should a user see first when they log in?

From the answers, determine:
- Which archetype fits best
- Whether any components should be added or removed from the archetype default
- What the sidebar navigation sections should be

Do NOT dump all archetypes on the user. Recommend one based on what they described, explain why, and ask for confirmation.

---

### Phase 2: Plan & Confirm

Present the installation plan. Format exactly like this:

```
Archetype: [name] — [one-line personality]

Components to install (in order):

  Layer 0 — Shell
    [x] dashboard-shell

  Layer 1 — Navigation
    [x] dashboard-sidebar-nav
    [x] dashboard-user-menu

  Layer 2 — Core Widgets
    [x] dashboard-kpi-cards
    [x] dashboard-charts          (if selected)
    [x] dashboard-data-table      (if selected)
    [x] dashboard-search-global   (if selected)

  Layer 3 — Domain Widgets
    [x] dashboard-kanban          (if selected)
    ...

  Layer 4 — Utilities
    [x] dashboard-notification-center  (if selected)
    ...

Total: N components

Glue layer (generated after install):
  - src/components/dashboard/nav-config.ts
  - src/components/dashboard/index.ts
  - src/app/dashboard/layout.tsx
```

Wait for explicit user confirmation before proceeding. If the user wants to add or remove components, adjust the plan and re-confirm.

---

### Phase 3: Install Components

Install each component using `npx @trinity369/use`. Follow layer order strictly — shell first, utilities last.

**Pre-flight check:**
```bash
# Verify the install tool works
npx @trinity369/use --list 2>/dev/null | head -5
```

**Installation loop:**

For each component in the plan, run:
```bash
npx @trinity369/use dashboard-<widget>
```

Report progress as you go:
```
[1/N] dashboard-shell .............. OK
[2/N] dashboard-sidebar-nav ........ OK
[3/N] dashboard-user-menu .......... OK
...
```

**Error handling:**
- If a component fails, log the error and continue with the rest
- After the loop, report any failures and ask if the user wants to retry
- Never abort the entire install because one widget failed

---

### Phase 4: Generate Glue Layer

After all components are installed, generate three files that wire them together.

#### 4a. Navigation Config

Write `src/components/dashboard/nav-config.ts`:

```typescript
// Navigation configuration for [archetype] dashboard
// Generated by dashboard-seed

import {
  LayoutDashboard,
  // ... icons matching archetype sections
} from "lucide-react";

export const navConfig = {
  main: [
    {
      title: "Dashboard",
      href: "/dashboard",
      icon: LayoutDashboard,
    },
    // ... archetype-specific sections derived from Phase 1 discovery
  ],
  secondary: [
    {
      title: "Settings",
      href: "/dashboard/settings",
      icon: Settings,
    },
  ],
};
```

Populate navigation sections based on what was discovered in Phase 1. Map the user's domain entities to sidebar items with appropriate lucide-react icons.

**Icon selection per archetype:**

| Archetype | Typical icons |
|-----------|--------------|
| analytics | BarChart3, TrendingUp, PieChart, Table2, Search |
| admin | Users, Shield, FileText, Calendar, Activity |
| project | Kanban, Calendar, GanttChart, Users, Clock |
| crm | Handshake, Target, Users, Mail, TrendingUp |
| monitoring | Activity, AlertTriangle, Globe, Wifi, Server |
| minimal | LayoutDashboard, Table2, Settings |

#### 4b. Barrel Exports

Write `src/components/dashboard/index.ts`:

```typescript
// Dashboard component exports — [archetype] archetype
// Generated by dashboard-seed

// Re-export installed dashboard components for unified imports
// Adjust paths if your project uses a different component directory

export { DashboardShell } from "@/components/dashboard-shell";
export { SidebarNav } from "@/components/dashboard-sidebar-nav";
// ... one export per installed component
```

Only export components that were actually installed in Phase 3. Use the component names from each template's exports.

#### 4c. Dashboard Layout

Write `src/app/dashboard/layout.tsx` (Next.js App Router):

```tsx
// Dashboard layout — wires shell + sidebar + user menu
// Generated by dashboard-seed

import { DashboardShell } from "@/components/dashboard-shell";
import { SidebarNav } from "@/components/dashboard-sidebar-nav";
import { UserMenu } from "@/components/dashboard-user-menu";
import { navConfig } from "@/components/dashboard/nav-config";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <DashboardShell
      sidebar={<SidebarNav items={navConfig.main} />}
      userMenu={<UserMenu />}
    >
      {children}
    </DashboardShell>
  );
}
```

**Framework detection:**
- If `next.config.*` exists at project root, generate Next.js App Router layout
- If `vite.config.*` exists, generate a React Router wrapper instead
- If neither, generate a plain React component and note to the user

**After writing glue files**, verify imports resolve:
```bash
# Quick check that referenced component dirs exist
for dir in dashboard-shell dashboard-sidebar-nav dashboard-user-menu; do
  ls src/components/$dir 2>/dev/null || ls components/$dir 2>/dev/null || echo "WARN: $dir not found"
done
```

---

### Phase 5: Verify & Report

Run verification checks, then present the final report.

**Checks:**
1. All planned components have output directories
2. Glue files exist and have no obvious import errors
3. TypeScript compilation (if `tsconfig.json` exists): `npx tsc --noEmit 2>&1 | head -20`

**Final report format:**

```
Dashboard Seed Complete
=======================

Archetype:  [name]
Components: [installed]/[planned] installed
Glue files: 3 generated

Installed:
  [check] dashboard-shell
  [check] dashboard-sidebar-nav
  ...

Generated:
  [check] src/components/dashboard/nav-config.ts
  [check] src/components/dashboard/index.ts
  [check] src/app/dashboard/layout.tsx

Next steps:
  1. Review nav-config.ts — adjust section titles and icons
  2. Create page files for each nav route (e.g., src/app/dashboard/page.tsx)
  3. Connect real data sources to KPI cards and tables
  4. Customize the sidebar branding in the shell component
```

If any components failed, list them under a "Needs attention" section with the error.

---

## Edge Cases

**Existing dashboard files** — Before installing, check if `src/components/dashboard-shell` or similar directories already exist. If so, warn the user and ask whether to overwrite or skip.

**Non-Next.js projects** — If no `next.config.*` is found, adjust the layout generation:
- Vite/React Router: generate a `DashboardLayout` wrapper component with `<Outlet />`
- Plain React: generate a layout component with `{children}` prop
- Note the framework in the final report

**Monorepo** — If a `packages/` or `apps/` directory exists, ask which package/app should receive the dashboard components before installing.

**Partial re-runs** — If the user runs dashboard-seed again, detect already-installed components (check for existing directories) and offer to install only the missing ones.

**Custom component additions** — The user may request components outside the archetype default. Allow adding any of the 18 components to any archetype. Also allow `shop-order-history` for e-commerce dashboards.
