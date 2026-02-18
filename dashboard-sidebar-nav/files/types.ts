import type { LucideIcon } from "lucide-react";
import {
  LayoutDashboard,
  BarChart3,
  ShoppingCart,
  Package,
  Users,
  CreditCard,
  Warehouse,
  Settings,
  UserCog,
  Receipt,
} from "lucide-react";

export interface NavItem {
  label: string;
  path: string;
  icon: LucideIcon;
  badge?: string | number;
  children?: NavItem[];
}

export interface NavGroup {
  label: string;
  items: NavItem[];
}

export interface SidebarUser {
  name: string;
  email: string;
  avatar?: string;
}

export const PLACEHOLDER_NAVIGATION: NavGroup[] = [
  {
    label: "Main",
    items: [
      { label: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
      { label: "Analytics", path: "/analytics", icon: BarChart3, badge: "New" },
      { label: "Orders", path: "/orders", icon: ShoppingCart, badge: 12 },
      { label: "Products", path: "/products", icon: Package },
    ],
  },
  {
    label: "Commerce",
    items: [
      { label: "Customers", path: "/customers", icon: Users },
      { label: "Payments", path: "/payments", icon: CreditCard },
      { label: "Inventory", path: "/inventory", icon: Warehouse, badge: 3 },
    ],
  },
  {
    label: "Settings",
    items: [
      { label: "General", path: "/settings/general", icon: Settings },
      { label: "Team", path: "/settings/team", icon: UserCog },
      { label: "Billing", path: "/settings/billing", icon: Receipt },
    ],
  },
];
