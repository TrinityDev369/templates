"use client";

import { useState } from "react";
import { LayoutGrid, List, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ProductCard, ProductCardSkeleton } from "./product-card";
import type { Product } from "./types";

/* -------------------------------------------------------------------------- */
/*  Props                                                                     */
/* -------------------------------------------------------------------------- */

interface ProductGridProps {
  products: Product[];
  loading?: boolean;
  view?: "grid" | "list";
  onViewChange?: (view: "grid" | "list") => void;
  onAddToCart?: (product: Product) => void;
  columns?: 3 | 4;
}

/* -------------------------------------------------------------------------- */
/*  Component                                                                 */
/* -------------------------------------------------------------------------- */

export function ProductGrid({
  products,
  loading = false,
  view: controlledView,
  onViewChange,
  onAddToCart,
  columns = 4,
}: ProductGridProps) {
  const [internalView, setInternalView] = useState<"grid" | "list">("grid");
  const view = controlledView ?? internalView;

  const handleViewChange = (mode: "grid" | "list") => {
    if (onViewChange) {
      onViewChange(mode);
    } else {
      setInternalView(mode);
    }
  };

  const gridCols =
    columns === 3
      ? "grid-cols-1 sm:grid-cols-2 md:grid-cols-3"
      : "grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4";

  return (
    <div className="space-y-4">
      {/* Header: count + view toggle */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {loading ? "Loading products\u2026" : `${products.length} product${products.length !== 1 ? "s" : ""}`}
        </p>

        <div className="flex items-center gap-1 rounded-md border p-0.5">
          <Button
            variant={view === "grid" ? "secondary" : "ghost"}
            size="icon"
            className="h-8 w-8"
            onClick={() => handleViewChange("grid")}
            aria-label="Grid view"
          >
            <LayoutGrid className="h-4 w-4" />
          </Button>
          <Button
            variant={view === "list" ? "secondary" : "ghost"}
            size="icon"
            className="h-8 w-8"
            onClick={() => handleViewChange("list")}
            aria-label="List view"
          >
            <List className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Grid / List / Loading / Empty */}
      {loading ? (
        <div
          className={cn(
            view === "grid"
              ? `grid gap-4 ${gridCols}`
              : "flex flex-col gap-4"
          )}
        >
          {Array.from({ length: 8 }).map((_, i) => (
            <ProductCardSkeleton key={i} view={view} />
          ))}
        </div>
      ) : products.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
          <ShoppingBag className="h-16 w-16 text-muted-foreground/30" />
          <div>
            <p className="text-lg font-medium">No products found</p>
            <p className="text-sm text-muted-foreground">
              Try adjusting your filters or search criteria.
            </p>
          </div>
        </div>
      ) : (
        <div
          className={cn(
            view === "grid"
              ? `grid gap-4 ${gridCols}`
              : "flex flex-col gap-4"
          )}
        >
          {products.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              view={view}
              onAddToCart={onAddToCart}
            />
          ))}
        </div>
      )}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Placeholder products                                                      */
/* -------------------------------------------------------------------------- */

export const PLACEHOLDER_PRODUCTS: Product[] = [
  {
    id: "prod_001",
    name: "Wireless Noise-Cancelling Headphones",
    slug: "wireless-noise-cancelling-headphones",
    price: 149.99,
    compareAtPrice: 199.99,
    currency: "USD",
    image: "/placeholder.svg?height=400&width=400",
    category: "Electronics",
    rating: 4.7,
    reviewCount: 324,
    inStock: true,
    tags: ["electronics", "audio", "wireless"],
  },
  {
    id: "prod_002",
    name: "Classic Leather Sneakers",
    slug: "classic-leather-sneakers",
    price: 89.99,
    currency: "USD",
    image: "/placeholder.svg?height=400&width=400",
    category: "Footwear",
    rating: 4.3,
    reviewCount: 186,
    inStock: true,
    tags: ["footwear", "sneakers", "leather"],
  },
  {
    id: "prod_003",
    name: "Minimalist Titanium Watch",
    slug: "minimalist-titanium-watch",
    price: 249.99,
    compareAtPrice: 329.99,
    currency: "USD",
    image: "/placeholder.svg?height=400&width=400",
    category: "Accessories",
    rating: 4.8,
    reviewCount: 92,
    inStock: true,
    tags: ["accessories", "watch", "titanium"],
  },
  {
    id: "prod_004",
    name: "Waterproof Hiking Backpack",
    slug: "waterproof-hiking-backpack",
    price: 119.99,
    currency: "USD",
    image: "/placeholder.svg?height=400&width=400",
    category: "Outdoor",
    rating: 4.5,
    reviewCount: 210,
    inStock: true,
    tags: ["outdoor", "hiking", "waterproof"],
  },
  {
    id: "prod_005",
    name: "Polarized Sport Sunglasses",
    slug: "polarized-sport-sunglasses",
    price: 64.99,
    compareAtPrice: 84.99,
    currency: "USD",
    image: "/placeholder.svg?height=400&width=400",
    category: "Accessories",
    rating: 4.1,
    reviewCount: 147,
    inStock: true,
    tags: ["accessories", "sunglasses", "sport"],
  },
  {
    id: "prod_006",
    name: "Insulated Stainless Water Bottle",
    slug: "insulated-stainless-water-bottle",
    price: 34.99,
    currency: "USD",
    image: "/placeholder.svg?height=400&width=400",
    category: "Outdoor",
    rating: 4.6,
    reviewCount: 538,
    inStock: true,
    tags: ["outdoor", "water-bottle", "stainless-steel"],
  },
  {
    id: "prod_007",
    name: "Adjustable Laptop Stand",
    slug: "adjustable-laptop-stand",
    price: 59.99,
    compareAtPrice: 79.99,
    currency: "USD",
    image: "/placeholder.svg?height=400&width=400",
    category: "Electronics",
    rating: 4.4,
    reviewCount: 263,
    inStock: false,
    tags: ["electronics", "desk", "ergonomic"],
  },
  {
    id: "prod_008",
    name: "Ergonomic Wireless Mouse",
    slug: "ergonomic-wireless-mouse",
    price: 44.99,
    currency: "USD",
    image: "/placeholder.svg?height=400&width=400",
    category: "Electronics",
    rating: 3.9,
    reviewCount: 412,
    inStock: true,
    tags: ["electronics", "mouse", "ergonomic"],
  },
];
