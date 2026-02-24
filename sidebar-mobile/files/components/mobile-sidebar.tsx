"use client";

import {
  Home,
  Settings,
  User,
  FileText,
  HelpCircle,
  LogOut,
  X,
  type LucideIcon,
} from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
  /** Mark an item as the currently active route. */
  active?: boolean;
}

export interface MobileSidebarProps {
  /** Controls whether the sidebar is open. */
  open: boolean;
  /** Callback fired when the open state should change. */
  onOpenChange: (open: boolean) => void;
  /** Navigation items rendered in the main section. */
  navItems?: NavItem[];
  /** Optional user information displayed at the bottom. */
  user?: {
    name: string;
    email: string;
    avatarUrl?: string;
  };
  /** Optional sign-out handler. Shows a sign-out button when provided. */
  onSignOut?: () => void;
  /** Additional CSS classes applied to the sheet content. */
  className?: string;
}

// ---------------------------------------------------------------------------
// Default navigation items (customise per project)
// ---------------------------------------------------------------------------

const defaultNavItems: NavItem[] = [
  { label: "Home", href: "/", icon: Home },
  { label: "Documents", href: "/documents", icon: FileText },
  { label: "Settings", href: "/settings", icon: Settings },
  { label: "Help", href: "/help", icon: HelpCircle },
];

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function MobileSidebar({
  open,
  onOpenChange,
  navItems = defaultNavItems,
  user,
  onSignOut,
  className,
}: MobileSidebarProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="left"
        className={cn("flex w-72 flex-col p-0 sm:max-w-xs", className)}
      >
        {/* ---- Header ---- */}
        <SheetHeader className="flex flex-row items-center justify-between border-b px-4 py-3">
          <SheetTitle className="text-base font-semibold">Menu</SheetTitle>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => onOpenChange(false)}
            aria-label="Close menu"
          >
            <X className="h-4 w-4" />
          </Button>
        </SheetHeader>

        {/* ---- Navigation ---- */}
        <nav className="flex-1 overflow-y-auto px-3 py-4" aria-label="Mobile navigation">
          <ul className="flex flex-col gap-1" role="list">
            {navItems.map((item) => (
              <li key={item.href}>
                <a
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                    "hover:bg-accent hover:text-accent-foreground",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                    item.active
                      ? "bg-accent text-accent-foreground"
                      : "text-muted-foreground"
                  )}
                  aria-current={item.active ? "page" : undefined}
                >
                  <item.icon className="h-4 w-4 shrink-0" aria-hidden="true" />
                  {item.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        {/* ---- Footer / User section ---- */}
        {user && (
          <>
            <Separator />
            <div className="px-4 py-4">
              <div className="flex items-center gap-3">
                {user.avatarUrl ? (
                  <img
                    src={user.avatarUrl}
                    alt=""
                    className="h-8 w-8 rounded-full object-cover"
                  />
                ) : (
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted">
                    <User className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium leading-tight">
                    {user.name}
                  </p>
                  <p className="truncate text-xs text-muted-foreground">
                    {user.email}
                  </p>
                </div>
              </div>

              {onSignOut && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="mt-3 w-full justify-start gap-2 text-muted-foreground hover:text-foreground"
                  onClick={onSignOut}
                >
                  <LogOut className="h-4 w-4" aria-hidden="true" />
                  Sign out
                </Button>
              )}
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
