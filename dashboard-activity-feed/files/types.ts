export type ActivityType = "created" | "updated" | "deleted" | "commented" | "assigned" | "completed";

export interface Activity {
  id: string;
  user: {
    name: string;
    avatar?: string;
  };
  action: ActivityType;
  target: string;
  description?: string;
  timestamp: string;
}
