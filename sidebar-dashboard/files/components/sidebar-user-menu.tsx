"use client"

import * as React from "react"
import { ChevronsUpDown, LogOut, Settings, User } from "lucide-react"

import { cn } from "@/lib/utils"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"

/* -------------------------------------------------------------------------- */
/*  Types                                                                     */
/* -------------------------------------------------------------------------- */

export interface SidebarUser {
  name: string
  email: string
  avatar?: string
}

export interface SidebarUserMenuProps {
  user: SidebarUser
  collapsed: boolean
  onProfile?: () => void
  onSettings?: () => void
  onSignOut?: () => void
}

/* -------------------------------------------------------------------------- */
/*  Helpers                                                                   */
/* -------------------------------------------------------------------------- */

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .toUpperCase()
    .slice(0, 2)
}

/* -------------------------------------------------------------------------- */
/*  SidebarUserMenu                                                           */
/* -------------------------------------------------------------------------- */

export function SidebarUserMenu({
  user,
  collapsed,
  onProfile,
  onSettings,
  onSignOut,
}: SidebarUserMenuProps) {
  const initials = getInitials(user.name)

  const trigger = (
    <DropdownMenuTrigger asChild>
      <Button
        variant="ghost"
        className={cn(
          "h-auto w-full justify-start gap-3 px-3 py-2",
          collapsed && "justify-center px-2"
        )}
      >
        <Avatar className="h-8 w-8 shrink-0">
          <AvatarImage src={user.avatar} alt={user.name} />
          <AvatarFallback className="text-xs">{initials}</AvatarFallback>
        </Avatar>
        {!collapsed && (
          <>
            <div className="flex flex-1 flex-col items-start overflow-hidden text-left">
              <span className="truncate text-sm font-medium">{user.name}</span>
              <span className="truncate text-xs text-muted-foreground">
                {user.email}
              </span>
            </div>
            <ChevronsUpDown className="ml-auto h-4 w-4 shrink-0 text-muted-foreground" />
          </>
        )}
      </Button>
    </DropdownMenuTrigger>
  )

  const menuContent = (
    <DropdownMenuContent
      side={collapsed ? "right" : "top"}
      align={collapsed ? "start" : "center"}
      className="w-56"
    >
      <DropdownMenuLabel className="font-normal">
        <div className="flex flex-col gap-1">
          <p className="text-sm font-medium leading-none">{user.name}</p>
          <p className="text-xs leading-none text-muted-foreground">
            {user.email}
          </p>
        </div>
      </DropdownMenuLabel>
      <DropdownMenuSeparator />
      <DropdownMenuItem onClick={onProfile}>
        <User className="mr-2 h-4 w-4" />
        Profile
      </DropdownMenuItem>
      <DropdownMenuItem onClick={onSettings}>
        <Settings className="mr-2 h-4 w-4" />
        Settings
      </DropdownMenuItem>
      <DropdownMenuSeparator />
      <DropdownMenuItem onClick={onSignOut}>
        <LogOut className="mr-2 h-4 w-4" />
        Sign out
      </DropdownMenuItem>
    </DropdownMenuContent>
  )

  if (collapsed) {
    return (
      <DropdownMenu>
        <Tooltip>
          <TooltipTrigger asChild>{trigger}</TooltipTrigger>
          <TooltipContent side="right">{user.name}</TooltipContent>
        </Tooltip>
        {menuContent}
      </DropdownMenu>
    )
  }

  return (
    <DropdownMenu>
      {trigger}
      {menuContent}
    </DropdownMenu>
  )
}
