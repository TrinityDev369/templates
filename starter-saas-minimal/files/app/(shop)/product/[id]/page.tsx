"use client";

import { useState } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
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

const products: Product[] = [
  {
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
  },
  {
    id: "2",
    name: "Cotton T-Shirt",
    description: "Soft organic cotton tee that feels great all day. Available in multiple sizes and colors. Machine washable and built to last.",
    price: 24.99,
    category: "Clothing",
    stock: 350,
    status: "active",
    rating: 4.2,
    reviewCount: 156,
    variants: [
      { id: "size", name: "Size", type: "size", options: ["S", "M", "L", "XL"] },
      { id: "color", name: "Color", type: "color", options: ["White", "Black", "Gray", "Navy"] },
    ],
    specifications: { Material: "100% Organic Cotton", Fit: "Regular", Care: "Machine wash cold" },
    createdAt: "2024-01-02",
  },
  {
    id: "3",
    name: "Running Shoes",
    description: "Lightweight performance runners designed for comfort and speed. Breathable mesh upper with responsive cushioning for your daily runs.",
    price: 129.99,
    category: "Sports",
    stock: 67,
    status: "active",
    rating: 4.8,
    reviewCount: 234,
    variants: [
      { id: "size", name: "Size", type: "size", options: ["8", "9", "10", "11", "12"] },
      { id: "color", name: "Color", type: "color", options: ["Black/White", "Blue/Gray", "Red/Black"] },
    ],
    specifications: { Upper: "Breathable mesh", Sole: "Rubber with EVA foam", Weight: "280g", Drop: "8mm" },
    createdAt: "2024-01-03",
  },
  {
    id: "4",
    name: "Coffee Maker",
    description: "12-cup programmable brewer with thermal carafe. Wake up to freshly brewed coffee with the programmable timer and enjoy hot coffee all morning.",
    price: 89.99,
    category: "Home",
    stock: 45,
    status: "active",
    rating: 4.3,
    reviewCount: 78,
    variants: [
      { id: "color", name: "Color", type: "color", options: ["Black", "Stainless Steel"] },
    ],
    specifications: { Capacity: "12 cups", Carafe: "Thermal stainless steel", Timer: "24-hour programmable", Power: "1000W" },
    createdAt: "2024-01-04",
  },
  {
    id: "5",
    name: "Yoga Mat",
    description: "Extra thick non-slip mat for all your yoga and fitness needs. 6mm thick with alignment lines to help perfect your poses.",
    price: 34.99,
    category: "Sports",
    stock: 200,
    status: "active",
    rating: 4.6,
    reviewCount: 112,
    variants: [
      { id: "color", name: "Color", type: "color", options: ["Purple", "Blue", "Green", "Black"] },
    ],
    specifications: { Thickness: "6mm", Material: "TPE eco-friendly", Length: "183cm", Width: "61cm" },
    createdAt: "2024-01-05",
  },
  {
    id: "6",
    name: "Desk Lamp",
    description: "LED adjustable desk lamp with multiple brightness levels and color temperatures. USB charging port included for convenience.",
    price: 49.99,
    category: "Home",
    stock: 90,
    status: "active",
    rating: 4.1,
    reviewCount: 45,
    variants: [
      { id: "color", name: "Color", type: "color", options: ["White", "Black", "Silver"] },
    ],
    specifications: { "Light Source": "LED", Brightness: "5 levels", "Color Temperature": "3000K-6000K", Power: "USB-C" },
    createdAt: "2024-01-06",
  },
  {
    id: "7",
    name: "Bluetooth Speaker",
    description: "Portable waterproof speaker with 360-degree sound. IPX7 rated for poolside and outdoor use with 12-hour battery life.",
    price: 59.99,
    category: "Electronics",
    stock: 88,
    status: "active",
    rating: 4.4,
    reviewCount: 167,
    variants: [
      { id: "color", name: "Color", type: "color", options: ["Black", "Blue", "Red", "Green"] },
    ],
    specifications: { Connectivity: "Bluetooth 5.0", "Battery Life": "12 hours", Waterproof: "IPX7", Weight: "540g" },
    createdAt: "2024-01-07",
  },
  {
    id: "8",
    name: "Leather Wallet",
    description: "Genuine leather bifold wallet with RFID blocking technology. Slim design with 8 card slots and a bill compartment.",
    price: 44.99,
    category: "Accessories",
    stock: 150,
    status: "active",
    rating: 4.7,
    reviewCount: 93,
    variants: [
      { id: "color", name: "Color", type: "color", options: ["Brown", "Black", "Tan"] },
    ],
    specifications: { Material: "Genuine leather", "Card Slots": "8", RFID: "Blocking", Dimensions: "11 x 9 x 1.5 cm" },
    createdAt: "2024-01-08",
  },
];

const PLACEHOLDER_COLORS = [
  "bg-blue-200 dark:bg-blue-800",
  "bg-blue-100 dark:bg-blue-900",
  "bg-blue-300 dark:bg-blue-700",
  "bg-blue-150 dark:bg-blue-850",
];

const reviews = [
  { id: 1, author: "Alex M.", rating: 5, date: "Jan 10, 2024", text: "Best product I have ever owned. The quality is incredible." },
  { id: 2, author: "Sarah K.", rating: 4, date: "Jan 8, 2024", text: "Great quality and very well made. Highly recommend." },
  { id: 3, author: "Mike T.", rating: 5, date: "Jan 5, 2024", text: "Worth every penny. Using this daily and loving it." },
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

export default function ProductDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const product = products.find((p) => p.id === params.id);

  if (!product) {
    notFound();
  }

  return <ProductDetail product={product} />;
}

function ProductDetail({ product }: { product: Product }) {
  const [quantity, setQuantity] = useState(1);
  const [selectedVariants, setSelectedVariants] = useState<Record<string, string>>(() => {
    const defaults: Record<string, string> = {};
    product.variants?.forEach((v) => {
      if (v.options.length > 0) {
        defaults[v.id] = v.options[0];
      }
    });
    return defaults;
  });
  const [selectedImage, setSelectedImage] = useState(0);
  const { addItem } = useCart();

  const variantString = Object.values(selectedVariants).join(" / ");

  const handleAddToCart = () => {
    addItem(
      { id: product.id, name: product.name, price: product.price },
      quantity,
      variantString || undefined
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

          {/* Variant Selectors */}
          {product.variants?.map((variant) => (
            <div key={variant.id} className="space-y-3">
              <label className="text-sm font-medium">
                {variant.name}{selectedVariants[variant.id] ? `: ${selectedVariants[variant.id]}` : ""}
              </label>
              <div className="flex gap-2">
                {variant.options.map((option) => (
                  <Button
                    key={option}
                    variant={selectedVariants[variant.id] === option ? "default" : "outline"}
                    size="sm"
                    onClick={() =>
                      setSelectedVariants((prev) => ({ ...prev, [variant.id]: option }))
                    }
                  >
                    {option}
                  </Button>
                ))}
              </div>
            </div>
          ))}

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
                  Designed for quality and built to last. A great addition to your
                  collection that combines form and function perfectly.
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
