export interface Product {
  id: string;
  name: string;
  slug: string;
  price: number;
  compareAtPrice?: number;
  currency?: string;
  image: string;
  images?: string[];
  category?: string;
  rating?: number;
  reviewCount?: number;
  inStock?: boolean;
  tags?: string[];
}
