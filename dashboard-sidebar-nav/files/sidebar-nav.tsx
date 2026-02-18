"use client";

import * as React from "react";
import { ChevronLeft, ChevronRight, ChevronDown, Menu, Settings } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import type { NavGroup, NavItem, SidebarUser } from "./types";

interface SidebarNavProps {
  navigation: NavGroup[];
  activeItem?: string;
  onNavigate?: (path: string) => void;
  collapsed?: boolean;
  onCollapsedChange?: (collapsed: boolean) => void;
  logo?: React.ReactNode;
  brandName?: string;
  user?: SidebarUser;
}

function NavItemRow({
  item,
  active,
  collapsed,
  onNavigate,
}: {
  item: NavItem;
  active: boolean;
  collapsed: boolean;
  onNavigate?: (path: string) => void;
}) {
  const [open, setOpen] = React.useState(false);
  const Icon = item.icon;
  const hasChildren = item.children && item.children.length > 0;

  const content = (
    <button
      onClick={() => {
        if (hasChildren && !collapsed) {
          setOpen((o) => !o);
        } else {
          onNavigate?.(item.path);
        }
      }}
      className={cn(
        "flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors",
        active ? "bg-accent font-medium" : "hover:bg-muted",
        collapsed && "justify-center px-2"
      )}
    >
      <Icon className="h-4 w-4 shrink-0" />
      {!collapsed && (
        <>
          <span className="flex-1 truncate text-left">{item.label}</span>
          {item.badge !== undefined && (
            <Badge variant="secondary" className="ml-auto h-5 px-1.5 text-xs">
              {item.badge}
            </Badge>
          )}
          {hasChildren && (
            <ChevronDown
              className={cn(
                "h-3.5 w-3.5 shrink-0 transition-transform",
                open && "rotate-180"
              )}
            />
          )}
        </>
      )}
    </button>
  );

  if (collapsed) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>{content}</TooltipTrigger>
        <TooltipContent side="right">{item.label}</TooltipContent>
      </Tooltip>
    );
  }

  if (!hasChildren) return content;

  return (
    <Collapsible open={open} onOpenChange={setOpen}>
      <CollapsibleTrigger asChild>{content}</CollapsibleTrigger>
      <CollapsibleContent className="ml-4 mt-0.5 space-y-0.5 border-l pl-3">
        {item.children!.map((child) => (
          <NavItemRow
            key={child.path}
            item={child}
            active={false}
            collapsed={false}
            onNavigate={onNavigate}
          />
        ))}
      </CollapsibleContent>
    </Collapsible>
  );
}

function SidebarContent({
  navigation,
  activeItem,
  onNavigate,
  collapsed,
  onCollapsedChange,
  logo,
  brandName,
  user,
}: SidebarNavProps) {
  return (
    <div className="flex h-full flex-col">
      {/* Brand */}
      <div className={cn("flex h-14 items-center border-b px-4", collapsed && "justify-center px-2")}>
        {logo ?? <div className="h-8 w-8 rounded-md bg-primary" />}
        {!collapsed && brandName && (
          <span className="ml-2 text-lg font-semibold tracking-tight">{brandName}</span>
        )}
      </div>

      {/* Navigation */}
      <ScrollArea className="flex-1 px-2 py-2">
        <TooltipProvider delayDuration={0}>
          {navigation.map((group, gi) => (
            <div key={group.label} className={cn(gi > 0 && "mt-4")}>
              {!collapsed && (
                <p className="mb-1 px-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  {group.label}
                </p>
              )}
              {collapsed && gi > 0 && <Separator className="my-2" />}
              <div className="space-y-0.5">
                {group.items.map((item) => (
                  <NavItemRow
                    key={item.path}
                    item={item}
                    active={activeItem === item.path}
                    collapsed={!!collapsed}
                    onNavigate={onNavigate}
                  />
                ))}
              </div>
            </div>
          ))}
        </TooltipProvider>
      </ScrollArea>

      {/* Bottom section */}
      <Separator />
      <div className={cn("flex items-center gap-3 p-3", collapsed && "flex-col gap-2 p-2")}>
        {user && (
          <div className={cn("flex flex-1 items-center gap-2 overflow-hidden", collapsed && "flex-col")}>
            <Avatar className="h-8 w-8 shrink-0">
              <AvatarImage src={user.avatar} alt={user.name} />
              <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
            </Avatar>
            {!collapsed && (
              <div className="flex-1 truncate">
                <p className="truncate text-sm font-medium">{user.name}</p>
                <p className="truncate text-xs text-muted-foreground">{user.email}</p>
              </div>
            )}
          </div>
        )}
        {collapsed ? (
          <TooltipProvider delayDuration={0}>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <Settings className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right">Settings</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        ) : (
          <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0" onClick={() => onNavigate?.("/settings")}>
            <Settings className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Collapse toggle */}
      {onCollapsedChange && (
        <>
          <Separator />
          <div className="flex justify-center p-2">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => onCollapsedChange(!collapsed)}
            >
              {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
            </Button>
          </div>
        </>
      )}
    </div>
  );
}

export function SidebarNav(props: SidebarNavProps) {
  const { collapsed } = props;

  return (
    <>
      {/* Desktop sidebar */}
      <aside
        className={cn(
          "hidden h-screen border-r bg-background transition-all duration-200 md:flex md:flex-col",
          collapsed ? "w-16" : "w-60"
        )}
      >
        <SidebarContent {...props} />
      </aside>

      {/* Mobile hamburger + sheet */}
      <div className="flex h-14 items-center border-b px-4 md:hidden">
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-60 p-0">
            <SidebarContent {...props} collapsed={false} onCollapsedChange={undefined} />
          </SheetContent>
        </Sheet>
        {props.brandName && (
          <span className="ml-2 text-lg font-semibold">{props.brandName}</span>
        )}
      </div>
    </>
  );
}
