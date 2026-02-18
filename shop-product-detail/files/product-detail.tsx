"use client";

import { useState } from "react";
import { Heart, Minus, Plus, ShoppingCart, Star } from "lucide-react";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { cn } from "@/lib/utils";
import { ImageGallery } from "./image-gallery";
import { ReviewList } from "./review-list";
import type { ProductDetail as ProductDetailType } from "./types";

interface ProductDetailProps {
  product: ProductDetailType;
  onAddToCart?: (product: ProductDetailType, quantity: number, variants: Record<string, string>) => void;
  onWishlist?: (product: ProductDetailType) => void;
  onWriteReview?: () => void;
}

const COLOR_MAP: Record<string, string> = {
  black: "bg-black",
  white: "bg-white border border-gray-300",
  red: "bg-red-500",
  blue: "bg-blue-500",
  green: "bg-green-500",
  yellow: "bg-yellow-400",
  purple: "bg-purple-500",
  pink: "bg-pink-500",
  gray: "bg-gray-400",
  orange: "bg-orange-500",
  navy: "bg-blue-900",
  brown: "bg-amber-800",
};

export function ProductDetail({ product, onAddToCart, onWishlist, onWriteReview }: ProductDetailProps) {
  const [quantity, setQuantity] = useState(1);
  const [selectedVariants, setSelectedVariants] = useState<Record<string, string>>(() => {
    const defaults: Record<string, string> = {};
    product.variants?.forEach((v) => {
      if (v.options.length > 0) defaults[v.type] = v.options[0];
    });
    return defaults;
  });

  const hasSale = product.compareAtPrice && product.compareAtPrice > product.price;
  const fmt = (v: number) =>
    new Intl.NumberFormat("en-US", { style: "currency", currency: product.currency }).format(v);

  return (
    <div className="space-y-8">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/">Home</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink href="/shop">Shop</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink href={`/shop/${product.category.toLowerCase()}`}>
              {product.category}
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>{product.name}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div className="grid gap-8 md:grid-cols-2">
        {/* Left: Image Gallery */}
        <ImageGallery images={product.images} productName={product.name} />

        {/* Right: Product Info */}
        <div className="space-y-5">
          <div className="space-y-2">
            <h1 className="text-2xl font-bold md:text-3xl">{product.name}</h1>
            <div className="flex items-center gap-2">
              <div className="flex">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={cn(
                      "h-4 w-4",
                      i < Math.round(product.rating)
                        ? "fill-yellow-400 text-yellow-400"
                        : "fill-muted text-muted"
                    )}
                  />
                ))}
              </div>
              <span className="text-sm text-muted-foreground">
                ({product.reviewCount} reviews)
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-2xl font-bold">{fmt(product.price)}</span>
            {hasSale && (
              <>
                <span className="text-lg text-muted-foreground line-through">
                  {fmt(product.compareAtPrice!)}
                </span>
                <Badge variant="destructive">
                  {Math.round((1 - product.price / product.compareAtPrice!) * 100)}% OFF
                </Badge>
              </>
            )}
          </div>

          <p className="text-muted-foreground">{product.description}</p>

          <Separator />

          {/* Variant Selectors */}
          {product.variants?.map((variant) => (
            <div key={variant.type} className="space-y-2">
              <label className="text-sm font-medium">
                {variant.type}: <span className="text-muted-foreground">{selectedVariants[variant.type]}</span>
              </label>
              <RadioGroup
                value={selectedVariants[variant.type] || ""}
                onValueChange={(val) =>
                  setSelectedVariants((prev) => ({ ...prev, [variant.type]: val }))
                }
                className="flex flex-wrap gap-2"
              >
                {variant.options.map((option) =>
                  variant.type.toLowerCase() === "color" ? (
                    <label key={option} className="cursor-pointer">
                      <RadioGroupItem value={option} className="peer sr-only" />
                      <div
                        className={cn(
                          "h-8 w-8 rounded-full ring-offset-2 transition-all peer-data-[state=checked]:ring-2 peer-data-[state=checked]:ring-primary",
                          COLOR_MAP[option.toLowerCase()] || "bg-gray-300"
                        )}
                        title={option}
                      />
                    </label>
                  ) : (
                    <label key={option} className="cursor-pointer">
                      <RadioGroupItem value={option} className="peer sr-only" />
                      <div className="rounded-md border-2 px-3 py-1.5 text-sm transition-all peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/5">
                        {option}
                      </div>
                    </label>
                  )
                )}
              </RadioGroup>
            </div>
          ))}

          <Separator />

          {/* Quantity + Actions */}
          <div className="flex items-center gap-3">
            <div className="flex items-center rounded-md border">
              <Button
                variant="ghost"
                size="icon"
                className="h-10 w-10"
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                aria-label="Decrease quantity"
              >
                <Minus className="h-4 w-4" />
              </Button>
              <span className="w-12 text-center font-medium">{quantity}</span>
              <Button
                variant="ghost"
                size="icon"
                className="h-10 w-10"
                onClick={() => setQuantity((q) => q + 1)}
                aria-label="Increase quantity"
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="flex gap-3">
            <Button
              className="flex-1"
              size="lg"
              disabled={!product.inStock}
              onClick={() => onAddToCart?.(product, quantity, selectedVariants)}
            >
              <ShoppingCart className="mr-2 h-5 w-5" />
              {product.inStock ? "Add to Cart" : "Out of Stock"}
            </Button>
            <Button
              variant="outline"
              size="lg"
              onClick={() => onWishlist?.(product)}
              aria-label="Add to wishlist"
            >
              <Heart className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>

      {/* Tabs: Description, Reviews, Specifications */}
      <Tabs defaultValue="description" className="w-full">
        <TabsList className="w-full justify-start">
          <TabsTrigger value="description">Description</TabsTrigger>
          <TabsTrigger value="reviews">Reviews ({product.reviews.length})</TabsTrigger>
          <TabsTrigger value="specifications">Specifications</TabsTrigger>
        </TabsList>

        <TabsContent value="description" className="mt-4">
          <div
            className="prose prose-sm max-w-none dark:prose-invert"
            dangerouslySetInnerHTML={{ __html: product.longDescription }}
          />
        </TabsContent>

        <TabsContent value="reviews" className="mt-4">
          <ReviewList reviews={product.reviews} onWriteReview={onWriteReview} />
        </TabsContent>

        <TabsContent value="specifications" className="mt-4">
          <div className="rounded-md border">
            <table className="w-full text-sm">
              <tbody>
                {Object.entries(product.specifications).map(([key, value], i) => (
                  <tr
                    key={key}
                    className={cn(i % 2 === 0 ? "bg-muted/50" : "bg-background")}
                  >
                    <td className="px-4 py-2.5 font-medium">{key}</td>
                    <td className="px-4 py-2.5 text-muted-foreground">{value}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
