"use client";

import * as React from "react";
import {
  Plus,
  Pencil,
  Trash2,
  MessageSquare,
  UserPlus,
  CheckCircle2,
  Activity,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { Activity as ActivityItem, ActivityType } from "./types";

/* -------------------------------------------------------------------------- */
/*  Icon + color maps                                                         */
/* -------------------------------------------------------------------------- */

const typeIconMap: Record<ActivityType, React.ElementType> = {
  created: Plus,
  updated: Pencil,
  deleted: Trash2,
  commented: MessageSquare,
  assigned: UserPlus,
  completed: CheckCircle2,
};

const typeColorMap: Record<ActivityType, string> = {
  created: "text-blue-500 bg-blue-500/10",
  updated: "text-yellow-500 bg-yellow-500/10",
  deleted: "text-red-500 bg-red-500/10",
  commented: "text-purple-500 bg-purple-500/10",
  assigned: "text-indigo-500 bg-indigo-500/10",
  completed: "text-green-500 bg-green-500/10",
};

const typeLabelMap: Record<ActivityType, string> = {
  created: "Created",
  updated: "Updated",
  deleted: "Deleted",
  commented: "Commented",
  assigned: "Assigned",
  completed: "Completed",
};

/* -------------------------------------------------------------------------- */
/*  Placeholder data                                                          */
/* -------------------------------------------------------------------------- */

export const PLACEHOLDER_ACTIVITIES: ActivityItem[] = [
  {
    id: "1",
    user: { name: "Alice Chen" },
    action: "created",
    target: "Project Aurora",
    description: "Initialized the repository and set up the monorepo structure.",
    timestamp: "2 minutes ago",
  },
  {
    id: "2",
    user: { name: "Bob Martinez" },
    action: "commented",
    target: "Pull Request #142",
    description: "Looks good! Just one minor suggestion on the error handling.",
    timestamp: "15 minutes ago",
  },
  {
    id: "3",
    user: { name: "Carol Nguyen" },
    action: "assigned",
    target: "Bug #891",
    timestamp: "1 hour ago",
  },
  {
    id: "4",
    user: { name: "David Kim" },
    action: "completed",
    target: "API Migration",
    description: "All endpoints migrated to v2 schema successfully.",
    timestamp: "2 hours ago",
  },
  {
    id: "5",
    user: { name: "Eve Johnson" },
    action: "updated",
    target: "Dashboard Layout",
    description: "Revised the grid spacing and added responsive breakpoints.",
    timestamp: "3 hours ago",
  },
  {
    id: "6",
    user: { name: "Frank Li" },
    action: "deleted",
    target: "Deprecated Endpoint /v1/users",
    timestamp: "5 hours ago",
  },
  {
    id: "7",
    user: { name: "Grace Park" },
    action: "created",
    target: "Design System RFC",
    description: "Proposed a token-based theming approach for the component library.",
    timestamp: "8 hours ago",
  },
  {
    id: "8",
    user: { name: "Henry Zhao" },
    action: "commented",
    target: "Issue #204",
    description: "Can we prioritize this for the next sprint?",
    timestamp: "1 day ago",
  },
];

/* -------------------------------------------------------------------------- */
/*  ActivityEntry                                                             */
/* -------------------------------------------------------------------------- */

function ActivityEntry({ activity }: { activity: ActivityItem }) {
  const Icon = typeIconMap[activity.action];

  return (
    <div className="relative flex gap-4 pb-8 last:pb-0">
      {/* Vertical timeline connector */}
      <div className="absolute left-[19px] top-10 -bottom-2 w-px bg-border last:hidden" />

      {/* Avatar with type indicator */}
      <div className="relative shrink-0">
        <Avatar className="h-10 w-10 border-2 border-background">
          <AvatarImage src={activity.user.avatar} alt={activity.user.name} />
          <AvatarFallback className="text-xs">
            {activity.user.name
              .split(" ")
              .map((w) => w[0])
              .join("")}
          </AvatarFallback>
        </Avatar>
        <span
          className={cn(
            "absolute -bottom-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full border-2 border-background",
            typeColorMap[activity.action]
          )}
        >
          <Icon className="h-2.5 w-2.5" />
        </span>
      </div>

      {/* Content */}
      <div className="flex-1 pt-0.5">
        <p className="text-sm">
          <span className="font-semibold">{activity.user.name}</span>{" "}
          <span className="text-muted-foreground">
            {typeLabelMap[activity.action].toLowerCase()}
          </span>{" "}
          <span className="font-medium">{activity.target}</span>
        </p>

        <div className="mt-1 flex items-center gap-2">
          <Badge
            variant="outline"
            className={cn("text-[10px] px-1.5 py-0", typeColorMap[activity.action])}
          >
            {typeLabelMap[activity.action]}
          </Badge>
          <span className="text-xs text-muted-foreground">{activity.timestamp}</span>
        </div>

        {activity.description && (
          <p className="mt-2 text-xs text-muted-foreground leading-relaxed rounded-md bg-muted/50 px-3 py-2">
            {activity.description}
          </p>
        )}
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  ActivityFeed                                                              */
/* -------------------------------------------------------------------------- */

interface ActivityFeedProps {
  activities: ActivityItem[];
  maxItems?: number;
  onLoadMore?: () => void;
  showLoadMore?: boolean;
}

export function ActivityFeed({
  activities,
  maxItems,
  onLoadMore,
  showLoadMore = false,
}: ActivityFeedProps) {
  if (activities.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
        <Activity className="mb-2 h-8 w-8" />
        <p className="text-sm font-medium">No activity yet</p>
      </div>
    );
  }

  const visible = maxItems ? activities.slice(0, maxItems) : activities;

  return (
    <div>
      <ScrollArea className="max-h-[600px]">
        <div className="space-y-0 p-1">
          {visible.map((activity) => (
            <ActivityEntry key={activity.id} activity={activity} />
          ))}
        </div>
      </ScrollArea>

      {showLoadMore && onLoadMore && (
        <div className="mt-4 flex justify-center">
          <Button variant="outline" size="sm" onClick={onLoadMore}>
            Load more
          </Button>
        </div>
      )}
    </div>
  );
}
