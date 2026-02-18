export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  image?: string;
  category: string;
  stock: number;
  status: "active" | "draft" | "archived";
  rating: number;
  reviewCount: number;
  variants?: ProductVariant[];
  specifications?: Record<string, string>;
  createdAt: string;
}

export interface ProductVariant {
  id: string;
  name: string;
  type: "size" | "color" | "material";
  options: string[];
}

export interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image?: string;
  variant?: string;
}

export type OrderStatus =
  | "pending"
  | "processing"
  | "shipped"
  | "delivered"
  | "cancelled"
  | "refunded";

export interface Order {
  id: string;
  customer: string;
  email: string;
  status: OrderStatus;
  total: number;
  items: CartItem[];
  shippingAddress?: ShippingAddress;
  createdAt: string;
}

export interface ShippingAddress {
  name: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  country: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role: "admin" | "customer";
  createdAt: string;
}

export interface DashboardStats {
  revenue: number;
  revenueTrend: number;
  orders: number;
  ordersTrend: number;
  customers: number;
  customersTrend: number;
  conversionRate: number;
  conversionTrend: number;
}
