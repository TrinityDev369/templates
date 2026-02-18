export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  compareAtPrice?: number;
  currency: string;
  image?: string;
  rating: number;
  reviewCount: number;
  category: string;
  inStock: boolean;
  variants?: { type: string; options: string[] }[];
}

export interface Review {
  id: string;
  author: string;
  rating: number;
  date: string;
  text: string;
}

export interface ProductDetail extends Product {
  images: string[];
  longDescription: string;
  specifications: Record<string, string>;
  reviews: Review[];
}
