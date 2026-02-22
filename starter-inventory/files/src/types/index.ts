export interface Category {
  id: number;
  name: string;
  slug: string;
  created_at: string;
}

export interface Supplier {
  id: number;
  name: string;
  contact_email: string | null;
  contact_phone: string | null;
  address: string | null;
  created_at: string;
}

export interface Product {
  id: number;
  name: string;
  sku: string;
  description: string | null;
  category_id: number | null;
  supplier_id: number | null;
  unit_price: number;
  cost_price: number;
  stock_quantity: number;
  low_stock_threshold: number;
  unit: string;
  image_url: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface StockMovement {
  id: number;
  product_id: number;
  type: "in" | "out" | "adjustment";
  quantity: number;
  reference: string | null;
  notes: string | null;
  created_at: string;
}

export interface ProductWithCategory extends Product {
  category_name: string | null;
}

export interface StockMovementWithProduct extends StockMovement {
  product_name: string;
  product_sku: string;
}

export interface DashboardStats {
  total_products: number;
  low_stock_count: number;
  total_value: number;
  recent_movements: number;
}
