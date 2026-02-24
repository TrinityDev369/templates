"use client"

import * as React from "react"
import { PanelLeftClose, PanelLeft } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { Separator } from "@/components/ui/separator"
import { SidebarNav } from "@/components/sidebar-nav"
import type { NavGroup } from "@/components/sidebar-nav"
import { SidebarUserMenu } from "@/components/sidebar-user-menu"
import type { SidebarUser } from "@/components/sidebar-user-menu"

/* -------------------------------------------------------------------------- */
/*  Types                                                                     */
/* -------------------------------------------------------------------------- */

export interface SidebarProps {
  /** Navigation groups displayed in the sidebar */
  navigation?: NavGroup[]
  /** Current user for the bottom user menu */
  user: SidebarUser
  /** Application name shown in the sidebar header */
  appName?: string
  /** Logo element rendered in the header */
  logo?: React.ReactNode
  /** Controlled collapsed state */
  collapsed?: boolean
  /** Callback when collapsed state changes */
  onCollapsedChange?: (collapsed: boolean) => void
  /** Callbacks forwarded to user menu */
  onProfile?: () => void
  onSettings?: () => void
  onSignOut?: () => void
}

/* -------------------------------------------------------------------------- */
/*  Sidebar                                                                   */
/* -------------------------------------------------------------------------- */

export function Sidebar({
  navigation,
  user,
  appName = "Dashboard",
  logo,
  collapsed: controlledCollapsed,
  onCollapsedChange,
  onProfile,
  onSettings,
  onSignOut,
}: SidebarProps) {
  const [internalCollapsed, setInternalCollapsed] = React.useState(false)
  const collapsed = controlledCollapsed ?? internalCollapsed
  const setCollapsed = onCollapsedChange ?? setInternalCollapsed

  return (
    <aside
      className={cn(
        "hidden h-screen flex-col border-r bg-card transition-all duration-200 md:flex",
        collapsed ? "w-[68px]" : "w-64"
      )}
    >
      <TooltipProvider delayDuration={0}>
        {/* ---- Header ---- */}
        <div
          className={cn(
            "flex h-14 shrink-0 items-center border-b px-4",
            collapsed && "justify-center px-2"
          )}
        >
          {logo ?? (
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-primary text-sm font-bold text-primary-foreground">
              {appName.charAt(0)}
            </div>
          )}
          {!collapsed && (
            <span className="ml-3 text-lg font-semibold tracking-tight">
              {appName}
            </span>
          )}
        </div>

        {/* ---- Navigation ---- */}
        <SidebarNav navigation={navigation} collapsed={collapsed} />

        {/* ---- User menu ---- */}
        <Separator />
        <div className="shrink-0 p-2">
          <SidebarUserMenu
            user={user}
            collapsed={collapsed}
            onProfile={onProfile}
            onSettings={onSettings}
            onSignOut={onSignOut}
          />
        </div>

        {/* ---- Collapse toggle ---- */}
        <Separator />
        <div
          className={cn(
            "flex shrink-0 p-2",
            collapsed ? "justify-center" : "justify-end"
          )}
        >
          {collapsed ? (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => setCollapsed(false)}
                  aria-label="Expand sidebar"
                >
                  <PanelLeft className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right">Expand sidebar</TooltipContent>
            </Tooltip>
          ) : (
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => setCollapsed(true)}
              aria-label="Collapse sidebar"
            >
              <PanelLeftClose className="h-4 w-4" />
            </Button>
          )}
        </div>
      </TooltipProvider>
    </aside>
  )
}
