"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Minus, Plus, Star } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { useCart } from "@/lib/hooks/use-cart";
import { formatCurrency } from "@/lib/utils";
import { toast } from "sonner";
import type { Product } from "@/types";

const product: Product = {
  id: "1",
  name: "Wireless Headphones Pro",
  description:
    "Experience premium sound quality with our flagship wireless headphones. Featuring active noise cancellation, 30-hour battery life, and ultra-comfortable memory foam ear cushions. Perfect for music lovers and professionals alike.",
  price: 79.99,
  category: "Electronics",
  stock: 124,
  status: "active",
  rating: 4.5,
  reviewCount: 89,
  variants: [
    { id: "size", name: "Size", type: "size", options: ["Standard", "Compact"] },
    { id: "color", name: "Color", type: "color", options: ["Black", "White", "Navy", "Rose Gold"] },
  ],
  specifications: {
    "Driver Size": "40mm",
    "Frequency Response": "20Hz - 20kHz",
    "Battery Life": "30 hours",
    "Charging": "USB-C, 10min = 3hr playback",
    Weight: "250g",
    Connectivity: "Bluetooth 5.3",
    "Noise Cancellation": "Active (ANC)",
  },
  createdAt: "2024-01-01",
};

const PLACEHOLDER_COLORS = [
  "bg-blue-200 dark:bg-blue-800",
  "bg-blue-100 dark:bg-blue-900",
  "bg-blue-300 dark:bg-blue-700",
  "bg-blue-150 dark:bg-blue-850",
];

const reviews = [
  { id: 1, author: "Alex M.", rating: 5, date: "Jan 10, 2024", text: "Best headphones I have ever owned. The noise cancellation is incredible." },
  { id: 2, author: "Sarah K.", rating: 4, date: "Jan 8, 2024", text: "Great sound quality and very comfortable. Battery life is impressive." },
  { id: 3, author: "Mike T.", rating: 5, date: "Jan 5, 2024", text: "Worth every penny. Using these daily for work calls and music." },
];

function StarRating({ rating, size = "sm" }: { rating: number; size?: "sm" | "md" }) {
  const sizeClass = size === "md" ? "h-5 w-5" : "h-3.5 w-3.5";
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: 5 }, (_, i) => (
        <Star
          key={i}
          className={`${sizeClass} ${
            i < Math.floor(rating)
              ? "fill-yellow-400 text-yellow-400"
              : "text-muted-foreground/30"
          }`}
        />
      ))}
    </div>
  );
}

export default function ProductDetailPage() {
  const [quantity, setQuantity] = useState(1);
  const [selectedSize, setSelectedSize] = useState("Standard");
  const [selectedColor, setSelectedColor] = useState("Black");
  const [selectedImage, setSelectedImage] = useState(0);
  const { addItem } = useCart();

  const handleAddToCart = () => {
    addItem(
      { id: product.id, name: product.name, price: product.price },
      quantity,
      `${selectedSize} / ${selectedColor}`
    );
    toast.success(`${product.name} added to cart`);
  };

  return (
    <div className="container py-8">
      {/* Back link */}
      <Link
        href="/shop"
        className="mb-6 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" /> Back to Shop
      </Link>

      <div className="grid gap-8 lg:grid-cols-2">
        {/* Image Gallery */}
        <div className="space-y-4">
          <div
            className={`aspect-square rounded-lg ${PLACEHOLDER_COLORS[selectedImage]} flex items-center justify-center`}
          >
            <span className="text-6xl font-bold text-white/20">
              {product.name.charAt(0)}
            </span>
          </div>
          <div className="grid grid-cols-4 gap-2">
            {PLACEHOLDER_COLORS.map((color, i) => (
              <button
                key={i}
                onClick={() => setSelectedImage(i)}
                className={`aspect-square rounded-md ${color} border-2 transition-colors ${
                  selectedImage === i ? "border-primary" : "border-transparent"
                }`}
              />
            ))}
          </div>
        </div>

        {/* Product Info */}
        <div className="space-y-6">
          <div>
            <Badge variant="secondary" className="mb-2">
              {product.category}
            </Badge>
            <h1 className="text-3xl font-bold">{product.name}</h1>
            <div className="mt-2 flex items-center gap-2">
              <StarRating rating={product.rating} size="md" />
              <span className="text-sm text-muted-foreground">
                {product.rating} ({product.reviewCount} reviews)
              </span>
            </div>
          </div>

          <p className="text-2xl font-bold">{formatCurrency(product.price)}</p>

          <p className="text-muted-foreground">{product.description}</p>

          <Separator />

          {/* Size Selector */}
          <div className="space-y-3">
            <label className="text-sm font-medium">Size</label>
            <div className="flex gap-2">
              {product.variants?.[0]?.options.map((size) => (
                <Button
                  key={size}
                  variant={selectedSize === size ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedSize(size)}
                >
                  {size}
                </Button>
              ))}
            </div>
          </div>

          {/* Color Selector */}
          <div className="space-y-3">
            <label className="text-sm font-medium">Color: {selectedColor}</label>
            <div className="flex gap-2">
              {product.variants?.[1]?.options.map((color) => (
                <Button
                  key={color}
                  variant={selectedColor === color ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedColor(color)}
                >
                  {color}
                </Button>
              ))}
            </div>
          </div>

          <Separator />

          {/* Quantity + Add to Cart */}
          <div className="flex items-center gap-4">
            <div className="flex items-center rounded-md border">
              <Button
                variant="ghost"
                size="icon"
                className="h-10 w-10 rounded-r-none"
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
              >
                <Minus className="h-4 w-4" />
              </Button>
              <span className="flex h-10 w-12 items-center justify-center text-sm font-medium">
                {quantity}
              </span>
              <Button
                variant="ghost"
                size="icon"
                className="h-10 w-10 rounded-l-none"
                onClick={() => setQuantity(quantity + 1)}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            <Button className="flex-1" size="lg" onClick={handleAddToCart}>
              Add to Cart - {formatCurrency(product.price * quantity)}
            </Button>
          </div>

          <p className="text-sm text-muted-foreground">
            {product.stock > 0 ? `${product.stock} in stock` : "Out of stock"} - Free shipping on orders over $50
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="mt-12">
        <Tabs defaultValue="description">
          <TabsList>
            <TabsTrigger value="description">Description</TabsTrigger>
            <TabsTrigger value="reviews">Reviews ({reviews.length})</TabsTrigger>
            <TabsTrigger value="specs">Specifications</TabsTrigger>
          </TabsList>

          <TabsContent value="description" className="mt-6">
            <Card>
              <CardContent className="prose max-w-none p-6 dark:prose-invert">
                <p>{product.description}</p>
                <p className="text-muted-foreground">
                  Designed for all-day comfort and exceptional audio performance.
                  Whether you are commuting, working, or relaxing, these headphones
                  deliver crystal-clear sound with deep bass and detailed highs.
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="reviews" className="mt-6 space-y-4">
            {reviews.map((review) => (
              <Card key={review.id}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{review.author}</span>
                      <StarRating rating={review.rating} />
                    </div>
                    <span className="text-sm text-muted-foreground">{review.date}</span>
                  </div>
                  <p className="mt-2 text-sm text-muted-foreground">{review.text}</p>
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          <TabsContent value="specs" className="mt-6">
            <Card>
              <CardContent className="p-6">
                <dl className="grid gap-3 sm:grid-cols-2">
                  {Object.entries(product.specifications ?? {}).map(([key, value]) => (
                    <div key={key} className="flex justify-between border-b pb-2">
                      <dt className="text-sm font-medium">{key}</dt>
                      <dd className="text-sm text-muted-foreground">{value}</dd>
                    </div>
                  ))}
                </dl>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
