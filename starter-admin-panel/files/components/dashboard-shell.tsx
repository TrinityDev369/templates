"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  Settings,
  ScrollText,
  Menu,
  X,
  LogOut,
  ChevronRight,
  Search,
  Plus,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { can } from "@/lib/rbac";
import { CommandPalette } from "@/components/command-palette";
import type { NavItem, Permission } from "@/types";

const navItems: NavItem[] = [
  { title: "Dashboard", href: "/dashboard", icon: LayoutDashboard, permission: "dashboard:view" },
  { title: "Users", href: "/dashboard/users", icon: Users, permission: "users:read" },
  { title: "Audit Log", href: "/dashboard/audit", icon: ScrollText, permission: "audit:view" },
  { title: "Settings", href: "/dashboard/settings", icon: Settings, permission: "settings:view" },
];

export function DashboardShell({
  session,
  children,
}: {
  session: { sub: string; email: string; role: string };
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [commandOpen, setCommandOpen] = useState(false);

  const visibleNav = navItems.filter(
    (item) => !item.permission || can(session.role, item.permission)
  );

  const commandItems = [
    ...visibleNav.map((item) => ({
      id: `nav-${item.href}`,
      label: item.title,
      href: item.href,
      section: "Navigation",
      permission: item.permission,
      icon: item.icon,
    })),
    {
      id: "action-create-user",
      label: "Create User",
      href: "/dashboard/users/new",
      section: "Actions",
      permission: "users:create" as Permission,
      icon: Plus,
    },
    {
      id: "action-audit-log",
      label: "View Audit Log",
      href: "/dashboard/audit",
      section: "Actions",
      permission: "audit:view" as Permission,
      icon: ScrollText,
    },
  ];

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  }

  return (
    <div className="flex min-h-screen">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r bg-card transition-transform lg:static lg:translate-x-0",
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex h-14 items-center justify-between border-b px-4">
          <Link href="/dashboard" className="text-lg font-semibold">
            Admin Panel
          </Link>
          <button
            onClick={() => setSidebarOpen(false)}
            aria-label="Close sidebar"
            className="inline-flex h-8 w-8 items-center justify-center rounded-md hover:bg-accent lg:hidden"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <nav className="flex-1 space-y-1 p-3">
          {visibleNav.map((item) => {
            const isActive =
              item.href === "/dashboard"
                ? pathname === "/dashboard"
                : pathname.startsWith(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setSidebarOpen(false)}
                className={cn(
                  "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-accent hover:text-foreground"
                )}
              >
                <item.icon className="h-4 w-4" />
                {item.title}
                {isActive && <ChevronRight className="ml-auto h-4 w-4" />}
              </Link>
            );
          })}
        </nav>

        <div className="border-t p-3">
          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-accent hover:text-foreground"
          >
            <LogOut className="h-4 w-4" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex flex-1 flex-col">
        <header className="flex h-14 items-center gap-4 border-b bg-card px-6">
          <button
            onClick={() => setSidebarOpen(true)}
            aria-label="Open sidebar"
            className="inline-flex h-8 w-8 items-center justify-center rounded-md border hover:bg-accent lg:hidden"
          >
            <Menu className="h-4 w-4" />
          </button>
          <button
            onClick={() => setCommandOpen(true)}
            className="hidden h-9 w-64 items-center gap-2 rounded-md border bg-background px-3 text-sm text-muted-foreground hover:bg-accent sm:flex"
          >
            <Search className="h-4 w-4" />
            <span className="flex-1 text-left">Search...</span>
            <kbd className="pointer-events-none hidden h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground sm:flex">
              {"\u2318"}K
            </kbd>
          </button>
          <div className="flex-1" />
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-full bg-primary text-center text-sm font-medium leading-8 text-primary-foreground">
              {session.email[0].toUpperCase()}
            </div>
          </div>
        </header>

        <main className="flex-1 p-6">{children}</main>
      </div>

      <CommandPalette
        open={commandOpen}
        onOpenChange={setCommandOpen}
        items={commandItems}
      />
    </div>
  );
}
