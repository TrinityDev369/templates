"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import type { LucideIcon } from "lucide-react"
import {
  LayoutDashboard,
  BarChart3,
  Users,
  Bell,
  FileText,
  Settings,
  Shield,
  CreditCard,
  HelpCircle,
} from "lucide-react"

import { cn } from "@/lib/utils"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { Separator } from "@/components/ui/separator"

/* -------------------------------------------------------------------------- */
/*  Types                                                                     */
/* -------------------------------------------------------------------------- */

export interface NavItem {
  label: string
  href: string
  icon: LucideIcon
  badge?: number
}

export interface NavGroup {
  title: string
  items: NavItem[]
}

/* -------------------------------------------------------------------------- */
/*  Default navigation — edit these for your app                              */
/* -------------------------------------------------------------------------- */

export const DEFAULT_NAVIGATION: NavGroup[] = [
  {
    title: "Main",
    items: [
      { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
      { label: "Analytics", href: "/analytics", icon: BarChart3 },
      { label: "Notifications", href: "/notifications", icon: Bell, badge: 5 },
    ],
  },
  {
    title: "Management",
    items: [
      { label: "Users", href: "/users", icon: Users, badge: 12 },
      { label: "Documents", href: "/documents", icon: FileText },
      { label: "Billing", href: "/billing", icon: CreditCard },
    ],
  },
  {
    title: "Settings",
    items: [
      { label: "General", href: "/settings", icon: Settings },
      { label: "Security", href: "/settings/security", icon: Shield },
      { label: "Help", href: "/help", icon: HelpCircle },
    ],
  },
]

/* -------------------------------------------------------------------------- */
/*  NavItemLink                                                               */
/* -------------------------------------------------------------------------- */

function NavItemLink({
  item,
  collapsed,
}: {
  item: NavItem
  collapsed: boolean
}) {
  const pathname = usePathname()
  const isActive = pathname === item.href || pathname.startsWith(item.href + "/")
  const Icon = item.icon

  const link = (
    <Link
      href={item.href}
      className={cn(
        "group relative flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
        "hover:bg-accent hover:text-accent-foreground",
        isActive
          ? "bg-accent text-accent-foreground"
          : "text-muted-foreground",
        collapsed && "justify-center px-2"
      )}
    >
      <Icon className="h-4 w-4 shrink-0" />
      {!collapsed && (
        <>
          <span className="flex-1 truncate">{item.label}</span>
          {item.badge !== undefined && item.badge > 0 && (
            <span
              className={cn(
                "ml-auto inline-flex h-5 min-w-[20px] items-center justify-center rounded-full px-1.5 text-xs font-semibold",
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground"
              )}
            >
              {item.badge > 99 ? "99+" : item.badge}
            </span>
          )}
        </>
      )}
      {/* Badge dot in collapsed mode */}
      {collapsed && item.badge !== undefined && item.badge > 0 && (
        <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-primary" />
      )}
    </Link>
  )

  if (collapsed) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>{link}</TooltipTrigger>
        <TooltipContent side="right" className="flex items-center gap-2">
          {item.label}
          {item.badge !== undefined && item.badge > 0 && (
            <span className="inline-flex h-5 min-w-[20px] items-center justify-center rounded-full bg-primary px-1.5 text-xs font-semibold text-primary-foreground">
              {item.badge > 99 ? "99+" : item.badge}
            </span>
          )}
        </TooltipContent>
      </Tooltip>
    )
  }

  return link
}

/* -------------------------------------------------------------------------- */
/*  SidebarNav                                                                */
/* -------------------------------------------------------------------------- */

export interface SidebarNavProps {
  navigation?: NavGroup[]
  collapsed: boolean
}

export function SidebarNav({
  navigation = DEFAULT_NAVIGATION,
  collapsed,
}: SidebarNavProps) {
  return (
    <nav className="flex-1 space-y-1 overflow-y-auto px-2 py-3">
      {navigation.map((group, index) => (
        <div key={group.title}>
          {index > 0 && <Separator className="my-3" />}
          {!collapsed && (
            <p className="mb-1.5 px-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground/70">
              {group.title}
            </p>
          )}
          <div className="space-y-0.5">
            {group.items.map((item) => (
              <NavItemLink key={item.href} item={item} collapsed={collapsed} />
            ))}
          </div>
        </div>
      ))}
    </nav>
  )
}
