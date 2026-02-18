import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { OrderStatus } from "./types";

const statusConfig: Record<OrderStatus, { label: string; className: string; variant: "outline" | "default" | "secondary" | "destructive" }> = {
  pending: { label: "Pending", className: "border-yellow-500/40 bg-yellow-50 text-yellow-700 dark:bg-yellow-950 dark:text-yellow-400", variant: "outline" },
  processing: { label: "Processing", className: "bg-blue-600 text-white hover:bg-blue-600", variant: "default" },
  shipped: { label: "Shipped", className: "bg-purple-100 text-purple-700 hover:bg-purple-100 dark:bg-purple-950 dark:text-purple-400", variant: "secondary" },
  delivered: { label: "Delivered", className: "bg-green-600 text-white hover:bg-green-600", variant: "default" },
  cancelled: { label: "Cancelled", className: "", variant: "destructive" },
};

interface OrderStatusBadgeProps {
  status: OrderStatus;
  className?: string;
}

export function OrderStatusBadge({ status, className }: OrderStatusBadgeProps) {
  const config = statusConfig[status];

  return (
    <Badge variant={config.variant} className={cn(config.className, className)}>
      {config.label}
    </Badge>
  );
}
