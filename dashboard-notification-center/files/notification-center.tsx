"use client";

import * as React from "react";
import { Bell, BellOff, Check, Info, AlertTriangle, AlertCircle, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import type { Notification } from "./types";

const typeIconMap = {
  info: Info,
  success: CheckCircle2,
  warning: AlertTriangle,
  error: AlertCircle,
} as const;

const typeColorMap = {
  info: "text-blue-500",
  success: "text-green-500",
  warning: "text-yellow-500",
  error: "text-red-500",
} as const;

export const PLACEHOLDER_NOTIFICATIONS: Notification[] = [
  { id: "1", title: "New team member", description: "Sarah joined the engineering team.", timestamp: "2 min ago", read: false, type: "info" },
  { id: "2", title: "Deployment succeeded", description: "v2.4.1 deployed to production successfully.", timestamp: "15 min ago", read: false, type: "success" },
  { id: "3", title: "High CPU usage", description: "Server cpu-02 is running at 92% utilization.", timestamp: "1 hour ago", read: false, type: "warning" },
  { id: "4", title: "Payment failed", description: "Invoice #1042 payment was declined.", timestamp: "3 hours ago", read: true, type: "error" },
  { id: "5", title: "New comment", description: "Alex commented on your pull request #87.", timestamp: "5 hours ago", read: true, type: "info" },
  { id: "6", title: "Task completed", description: "Migration to new database schema is complete.", timestamp: "1 day ago", read: true, type: "success" },
];

interface NotificationCenterProps {
  notifications: Notification[];
  onMarkRead?: (id: string) => void;
  onMarkAllRead?: () => void;
  onViewAll?: () => void;
}

function NotificationRow({
  notification,
  onMarkRead,
}: {
  notification: Notification;
  onMarkRead?: (id: string) => void;
}) {
  const TypeIcon = typeIconMap[notification.type];

  return (
    <button
      onClick={() => !notification.read && onMarkRead?.(notification.id)}
      className={cn(
        "flex w-full items-start gap-3 px-4 py-3 text-left transition-colors hover:bg-muted",
        !notification.read && "bg-muted/50"
      )}
    >
      {notification.avatar ? (
        <Avatar className="mt-0.5 h-8 w-8 shrink-0">
          <AvatarImage src={notification.avatar} alt={notification.title} />
          <AvatarFallback>{notification.title.charAt(0)}</AvatarFallback>
        </Avatar>
      ) : (
        <div className={cn("mt-0.5 shrink-0", typeColorMap[notification.type])}>
          <TypeIcon className="h-5 w-5" />
        </div>
      )}
      <div className="flex-1 overflow-hidden">
        <div className="flex items-center gap-2">
          <p className="truncate text-sm font-medium">{notification.title}</p>
          {!notification.read && (
            <span className="h-2 w-2 shrink-0 rounded-full bg-blue-500" />
          )}
        </div>
        <p className="truncate text-xs text-muted-foreground">{notification.description}</p>
        <p className="mt-0.5 text-xs text-muted-foreground/70">{notification.timestamp}</p>
      </div>
    </button>
  );
}

function NotificationList({
  items,
  onMarkRead,
}: {
  items: Notification[];
  onMarkRead?: (id: string) => void;
}) {
  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
        <BellOff className="mb-2 h-8 w-8" />
        <p className="text-sm font-medium">All caught up!</p>
      </div>
    );
  }

  return (
    <ScrollArea className="max-h-[400px]">
      <div className="divide-y">
        {items.map((n) => (
          <NotificationRow key={n.id} notification={n} onMarkRead={onMarkRead} />
        ))}
      </div>
    </ScrollArea>
  );
}

export function NotificationCenter({
  notifications,
  onMarkRead,
  onMarkAllRead,
  onViewAll,
}: NotificationCenterProps) {
  const unreadCount = notifications.filter((n) => !n.read).length;
  const unread = notifications.filter((n) => !n.read);

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative h-9 w-9">
          <Bell className="h-4 w-4" />
          {unreadCount > 0 && (
            <Badge
              variant="destructive"
              className="absolute -right-1 -top-1 flex h-5 min-w-[20px] items-center justify-center rounded-full px-1 text-[10px]"
            >
              {unreadCount > 99 ? "99+" : unreadCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-[380px] p-0" sideOffset={8}>
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3">
          <h4 className="text-sm font-semibold">Notifications</h4>
          {unreadCount > 0 && (
            <button
              onClick={onMarkAllRead}
              className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
            >
              <Check className="h-3 w-3" />
              Mark all read
            </button>
          )}
        </div>
        <Separator />

        {/* Tabs */}
        <Tabs defaultValue="all">
          <TabsList className="w-full justify-start rounded-none border-b bg-transparent px-4">
            <TabsTrigger value="all" className="text-xs">
              All
            </TabsTrigger>
            <TabsTrigger value="unread" className="text-xs">
              Unread {unreadCount > 0 && `(${unreadCount})`}
            </TabsTrigger>
          </TabsList>
          <TabsContent value="all" className="mt-0">
            <NotificationList items={notifications} onMarkRead={onMarkRead} />
          </TabsContent>
          <TabsContent value="unread" className="mt-0">
            <NotificationList items={unread} onMarkRead={onMarkRead} />
          </TabsContent>
        </Tabs>

        {/* Footer */}
        <Separator />
        <div className="px-4 py-2">
          <button
            onClick={onViewAll}
            className="w-full text-center text-xs text-muted-foreground hover:text-foreground"
          >
            View all notifications
          </button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
