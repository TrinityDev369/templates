"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import Image from "next/image";
import { Star, ShoppingCart, Check, Package } from "lucide-react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import type { Product } from "./types";

/* -------------------------------------------------------------------------- */
/*  Props                                                                     */
/* -------------------------------------------------------------------------- */

interface ProductCardProps {
  product: Product;
  view?: "grid" | "list";
  onAddToCart?: (product: Product) => void;
}

/* -------------------------------------------------------------------------- */
/*  Star rating                                                               */
/* -------------------------------------------------------------------------- */

function StarRating({ rating, count }: { rating: number; count: number }) {
  return (
    <div className="flex items-center gap-1">
      <div className="flex" aria-label={`${rating} out of 5 stars`}>
        {Array.from({ length: 5 }).map((_, i) => (
          <Star
            key={i}
            className={cn(
              "h-3.5 w-3.5",
              i < Math.round(rating)
                ? "fill-yellow-400 text-yellow-400"
                : "fill-muted text-muted"
            )}
          />
        ))}
      </div>
      <span className="text-xs text-muted-foreground">({count})</span>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Price display                                                             */
/* -------------------------------------------------------------------------- */

function PriceDisplay({
  price,
  compareAtPrice,
  currency = "USD",
}: {
  price: number;
  compareAtPrice?: number;
  currency?: string;
}) {
  const fmt = (v: number) =>
    new Intl.NumberFormat("en-US", { style: "currency", currency }).format(v);

  return (
    <div className="flex items-center gap-2">
      <span className="text-lg font-bold">{fmt(price)}</span>
      {compareAtPrice && compareAtPrice > price && (
        <span className="text-sm text-muted-foreground line-through">
          {fmt(compareAtPrice)}
        </span>
      )}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Sale badge                                                                */
/* -------------------------------------------------------------------------- */

function SaleBadge({ price, compareAtPrice }: { price: number; compareAtPrice: number }) {
  const pct = Math.round(((compareAtPrice - price) / compareAtPrice) * 100);
  return (
    <Badge className="absolute right-2 top-2 z-10 bg-red-500 hover:bg-red-600">
      -{pct}%
    </Badge>
  );
}

/* -------------------------------------------------------------------------- */
/*  Product card                                                              */
/* -------------------------------------------------------------------------- */

export function ProductCard({ product, view = "grid", onAddToCart }: ProductCardProps) {
  const isList = view === "list";
  const hasSale =
    product.compareAtPrice !== undefined && product.compareAtPrice > product.price;
  const isOutOfStock = product.inStock === false;

  /* ---- optimistic "Added!" feedback ---- */
  const [added, setAdded] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  const handleAddToCart = useCallback(() => {
    if (isOutOfStock) return;
    onAddToCart?.(product);
    setAdded(true);
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => setAdded(false), 1500);
  }, [product, onAddToCart, isOutOfStock]);

  return (
    <Card
      className={cn(
        "group relative overflow-hidden transition-all duration-200 hover:shadow-lg",
        !isList && "hover:scale-[1.02]",
        isList && "flex flex-row"
      )}
    >
      {/* Sale badge */}
      {hasSale && (
        <SaleBadge price={product.price} compareAtPrice={product.compareAtPrice!} />
      )}

      {/* Image */}
      <div
        className={cn(
          "relative flex items-center justify-center overflow-hidden bg-gradient-to-br from-muted/60 to-muted",
          isList ? "aspect-square w-48 shrink-0" : "aspect-square w-full"
        )}
      >
        {product.image ? (
          <Image
            src={product.image}
            alt={product.name}
            fill
            sizes={isList ? "192px" : "(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"}
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <Package className="h-12 w-12 text-muted-foreground/40" />
        )}
      </div>

      {/* Content */}
      <div className="flex flex-1 flex-col">
        <CardContent className={cn("flex-1 space-y-1.5", isList ? "p-4" : "p-4 pb-2")}>
          {product.category && (
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              {product.category}
            </p>
          )}
          <h3 className="line-clamp-1 font-semibold leading-tight">{product.name}</h3>

          {product.rating !== undefined && product.reviewCount !== undefined && (
            <StarRating rating={product.rating} count={product.reviewCount} />
          )}

          <PriceDisplay
            price={product.price}
            compareAtPrice={product.compareAtPrice}
            currency={product.currency}
          />
        </CardContent>

        <CardFooter className="p-4 pt-0">
          <Button
            className={cn(
              "w-full transition-colors",
              added && "bg-green-600 hover:bg-green-700"
            )}
            size="sm"
            disabled={isOutOfStock}
            onClick={handleAddToCart}
          >
            {isOutOfStock ? (
              "Out of Stock"
            ) : added ? (
              <>
                <Check className="mr-2 h-4 w-4" />
                Added!
              </>
            ) : (
              <>
                <ShoppingCart className="mr-2 h-4 w-4" />
                Add to Cart
              </>
            )}
          </Button>
        </CardFooter>
      </div>
    </Card>
  );
}

/* -------------------------------------------------------------------------- */
/*  Skeleton                                                                  */
/* -------------------------------------------------------------------------- */

export function ProductCardSkeleton({ view = "grid" }: { view?: "grid" | "list" }) {
  const isList = view === "list";

  return (
    <Card className={cn("overflow-hidden", isList && "flex flex-row")}>
      <Skeleton
        className={cn(
          isList ? "aspect-square w-48 shrink-0" : "aspect-square w-full"
        )}
      />
      <div className="flex flex-1 flex-col p-4 space-y-3">
        <Skeleton className="h-3 w-16" />
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-3 w-20" />
        <Skeleton className="h-5 w-24" />
        <Skeleton className="mt-auto h-9 w-full" />
      </div>
    </Card>
  );
}
