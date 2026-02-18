"use client";

import { useState } from "react";
import {
  User,
  Settings,
  CreditCard,
  LogOut,
  Sun,
  Moon,
  Monitor,
  LifeBuoy,
  Keyboard,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { UserMenuUser, UserMenuItem } from "./types";

/* -------------------------------------------------------------------------- */
/*  Placeholder user                                                          */
/* -------------------------------------------------------------------------- */

const PLACEHOLDER_USER: UserMenuUser = {
  name: "Alex Johnson",
  email: "alex.johnson@example.com",
  role: "Admin",
};

/* -------------------------------------------------------------------------- */
/*  Default navigation items                                                  */
/* -------------------------------------------------------------------------- */

const DEFAULT_ITEMS: UserMenuItem[] = [
  { label: "Profile", icon: User, href: "/profile", shortcut: "\u21E7\u2318P" },
  { label: "Settings", icon: Settings, href: "/settings" },
  { label: "Billing", icon: CreditCard, href: "/billing" },
  { label: "Keyboard shortcuts", icon: Keyboard, href: "/shortcuts" },
];

/* -------------------------------------------------------------------------- */
/*  Helpers                                                                   */
/* -------------------------------------------------------------------------- */

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 0) return "";
  if (parts.length === 1) return parts[0][0].toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

/* -------------------------------------------------------------------------- */
/*  Props                                                                     */
/* -------------------------------------------------------------------------- */

interface UserMenuProps {
  user?: UserMenuUser;
  items?: UserMenuItem[];
  onLogout?: () => void;
  onThemeChange?: (theme: "light" | "dark" | "system") => void;
}

/* -------------------------------------------------------------------------- */
/*  Component                                                                 */
/* -------------------------------------------------------------------------- */

export function UserMenu({
  user = PLACEHOLDER_USER,
  items,
  onLogout,
  onThemeChange,
}: UserMenuProps) {
  const [theme, setTheme] = useState<"light" | "dark" | "system">("system");

  const initials = getInitials(user.name);
  const menuItems = items ?? DEFAULT_ITEMS;

  const handleThemeChange = (value: string) => {
    const next = value as "light" | "dark" | "system";
    setTheme(next);
    onThemeChange?.(next);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-9 w-9 rounded-full">
          <Avatar className="h-9 w-9">
            <AvatarImage src={user.avatar} alt={user.name} />
            <AvatarFallback className="text-xs">{initials}</AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent className="w-64" align="end" forceMount>
        {/* ---- User info header ---- */}
        <DropdownMenuLabel className="font-normal">
          <div className="flex items-center gap-3 py-1">
            <Avatar className="h-10 w-10">
              <AvatarImage src={user.avatar} alt={user.name} />
              <AvatarFallback>{initials}</AvatarFallback>
            </Avatar>
            <div className="flex flex-col space-y-0.5">
              <div className="flex items-center gap-2">
                <p className="text-sm font-semibold leading-none">
                  {user.name}
                </p>
                {user.role && (
                  <Badge
                    variant="secondary"
                    className="text-[10px] px-1.5 py-0"
                  >
                    {user.role}
                  </Badge>
                )}
              </div>
              <p className="text-xs text-muted-foreground leading-none">
                {user.email}
              </p>
            </div>
          </div>
        </DropdownMenuLabel>

        <DropdownMenuSeparator />

        {/* ---- Navigation items ---- */}
        <DropdownMenuGroup>
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <DropdownMenuItem
                key={item.label}
                onClick={item.onClick ?? undefined}
                className={cn(
                  item.destructive &&
                    "text-red-600 focus:text-red-600 dark:text-red-400 dark:focus:text-red-400"
                )}
              >
                {Icon && <Icon className="mr-2 h-4 w-4" />}
                {item.label}
                {item.shortcut && (
                  <DropdownMenuShortcut>{item.shortcut}</DropdownMenuShortcut>
                )}
              </DropdownMenuItem>
            );
          })}
        </DropdownMenuGroup>

        <DropdownMenuSeparator />

        {/* ---- Theme section ---- */}
        <DropdownMenuGroup>
          <DropdownMenuLabel className="text-xs text-muted-foreground font-normal px-2 py-1.5">
            Theme
          </DropdownMenuLabel>
          <DropdownMenuRadioGroup
            value={theme}
            onValueChange={handleThemeChange}
          >
            <DropdownMenuRadioItem value="light">
              <Sun className="mr-2 h-4 w-4" />
              Light
            </DropdownMenuRadioItem>
            <DropdownMenuRadioItem value="dark">
              <Moon className="mr-2 h-4 w-4" />
              Dark
            </DropdownMenuRadioItem>
            <DropdownMenuRadioItem value="system">
              <Monitor className="mr-2 h-4 w-4" />
              System
            </DropdownMenuRadioItem>
          </DropdownMenuRadioGroup>
        </DropdownMenuGroup>

        <DropdownMenuSeparator />

        {/* ---- Bottom section ---- */}
        <DropdownMenuGroup>
          <DropdownMenuItem>
            <LifeBuoy className="mr-2 h-4 w-4" />
            Support
          </DropdownMenuItem>
        </DropdownMenuGroup>

        <DropdownMenuSeparator />

        {/* ---- Logout ---- */}
        <DropdownMenuItem
          onClick={onLogout}
          className="text-red-600 focus:text-red-600 dark:text-red-400 dark:focus:text-red-400"
        >
          <LogOut className="mr-2 h-4 w-4" />
          Log out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
