"use client";

import Link from "next/link";
import { ArrowRight, Star } from "lucide-react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useCart } from "@/lib/hooks/use-cart";
import { formatCurrency } from "@/lib/utils";
import type { Product } from "@/types";
import { toast } from "sonner";

const PLACEHOLDER_COLORS = [
  "bg-blue-200 dark:bg-blue-800",
  "bg-green-200 dark:bg-green-800",
  "bg-purple-200 dark:bg-purple-800",
  "bg-orange-200 dark:bg-orange-800",
  "bg-pink-200 dark:bg-pink-800",
  "bg-teal-200 dark:bg-teal-800",
  "bg-yellow-200 dark:bg-yellow-800",
  "bg-indigo-200 dark:bg-indigo-800",
];

const products: Product[] = [
  { id: "1", name: "Wireless Headphones", description: "Premium noise-cancelling headphones", price: 79.99, category: "Electronics", stock: 124, status: "active", rating: 4.5, reviewCount: 89, createdAt: "2024-01-01" },
  { id: "2", name: "Cotton T-Shirt", description: "Soft organic cotton tee", price: 24.99, category: "Clothing", stock: 350, status: "active", rating: 4.2, reviewCount: 156, createdAt: "2024-01-02" },
  { id: "3", name: "Running Shoes", description: "Lightweight performance runners", price: 129.99, category: "Sports", stock: 67, status: "active", rating: 4.8, reviewCount: 234, createdAt: "2024-01-03" },
  { id: "4", name: "Coffee Maker", description: "12-cup programmable brewer", price: 89.99, category: "Home", stock: 45, status: "active", rating: 4.3, reviewCount: 78, createdAt: "2024-01-04" },
  { id: "5", name: "Yoga Mat", description: "Extra thick non-slip mat", price: 34.99, category: "Sports", stock: 200, status: "active", rating: 4.6, reviewCount: 112, createdAt: "2024-01-05" },
  { id: "6", name: "Desk Lamp", description: "LED adjustable desk lamp", price: 49.99, category: "Home", stock: 90, status: "active", rating: 4.1, reviewCount: 45, createdAt: "2024-01-06" },
  { id: "7", name: "Bluetooth Speaker", description: "Portable waterproof speaker", price: 59.99, category: "Electronics", stock: 88, status: "active", rating: 4.4, reviewCount: 167, createdAt: "2024-01-07" },
  { id: "8", name: "Leather Wallet", description: "Genuine leather bifold wallet", price: 44.99, category: "Accessories", stock: 150, status: "active", rating: 4.7, reviewCount: 93, createdAt: "2024-01-08" },
];

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: 5 }, (_, i) => (
        <Star
          key={i}
          className={`h-3.5 w-3.5 ${
            i < Math.floor(rating)
              ? "fill-yellow-400 text-yellow-400"
              : i < rating
                ? "fill-yellow-400/50 text-yellow-400"
                : "text-muted-foreground/30"
          }`}
        />
      ))}
    </div>
  );
}

export default function ShopPage() {
  const { addItem } = useCart();

  const handleAddToCart = (product: Product) => {
    addItem({ id: product.id, name: product.name, price: product.price });
    toast.success(`${product.name} added to cart`);
  };

  return (
    <div>
      {/* Hero */}
      <section className="border-b bg-muted/30 px-4 py-16 text-center md:py-24">
        <div className="container mx-auto max-w-2xl">
          <Badge className="mb-4" variant="secondary">
            New Collection
          </Badge>
          <h1 className="mb-4 text-3xl font-bold tracking-tight md:text-5xl">
            Discover Quality Products
          </h1>
          <p className="mb-8 text-lg text-muted-foreground">
            Curated selection of premium products at great prices. Free shipping
            on orders over $50.
          </p>
          <div className="flex justify-center gap-4">
            <Button size="lg" className="gap-2">
              Shop Now <ArrowRight className="h-4 w-4" />
            </Button>
            <Button size="lg" variant="outline">
              View Categories
            </Button>
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="container py-12">
        <div className="mb-8 flex items-center justify-between">
          <h2 className="text-2xl font-bold">Featured Products</h2>
          <Button variant="ghost" className="gap-1">
            View All <ArrowRight className="h-4 w-4" />
          </Button>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {products.map((product, index) => (
            <Card key={product.id} className="group overflow-hidden">
              <Link href={`/shop/product/${product.id}`}>
                <div
                  className={`aspect-square ${PLACEHOLDER_COLORS[index % PLACEHOLDER_COLORS.length]} flex items-center justify-center transition-transform group-hover:scale-105`}
                >
                  <span className="text-4xl font-bold text-white/30">
                    {product.name.charAt(0)}
                  </span>
                </div>
              </Link>
              <CardContent className="p-4">
                <p className="mb-1 text-xs text-muted-foreground">
                  {product.category}
                </p>
                <Link href={`/shop/product/${product.id}`}>
                  <h3 className="font-semibold hover:underline">
                    {product.name}
                  </h3>
                </Link>
                <div className="mt-1 flex items-center gap-2">
                  <StarRating rating={product.rating} />
                  <span className="text-xs text-muted-foreground">
                    ({product.reviewCount})
                  </span>
                </div>
              </CardContent>
              <CardFooter className="flex items-center justify-between p-4 pt-0">
                <span className="text-lg font-bold">
                  {formatCurrency(product.price)}
                </span>
                <Button size="sm" onClick={() => handleAddToCart(product)}>
                  Add to Cart
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
}
