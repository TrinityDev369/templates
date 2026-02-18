"use client";

import { useState } from "react";
import { Heart, Link2, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useWishlist } from "./wishlist-provider";
import { WishlistCard } from "./wishlist-card";
import type { WishlistItem } from "./types";

/* ---------- placeholder data ---------- */

const SAMPLE_ITEMS: WishlistItem[] = [
  { id: "w1", name: "Minimalist Desk Lamp", price: 89.99, addedAt: "2026-02-14T10:00:00Z", category: "Home" },
  { id: "w2", name: "Leather Messenger Bag", price: 249.00, addedAt: "2026-02-12T08:30:00Z", category: "Accessories" },
  { id: "w3", name: "Ceramic Pour-Over Set", price: 64.50, addedAt: "2026-02-10T14:15:00Z", category: "Kitchen" },
  { id: "w4", name: "Wireless Charging Pad", price: 39.99, addedAt: "2026-02-08T09:45:00Z", category: "Tech" },
  { id: "w5", name: "Linen Throw Blanket", price: 120.00, addedAt: "2026-02-05T16:20:00Z", category: "Home" },
  { id: "w6", name: "Noise-Cancelling Earbuds", price: 179.99, addedAt: "2026-01-30T11:00:00Z", category: "Tech" },
];

interface WishlistProps {
  /** Override items (defaults to sample data for preview) */
  items?: WishlistItem[];
  /** Called when user clicks "Add to Cart" */
  onAddToCart?: (item: WishlistItem) => void;
  /** Called when user clicks "Move to Cart" (removes from wishlist + adds to cart) */
  onMoveToCart?: (item: WishlistItem) => void;
  /** Called when the empty-state CTA is clicked */
  onDiscoverProducts?: () => void;
}

export function Wishlist({
  items: controlledItems,
  onAddToCart,
  onMoveToCart,
  onDiscoverProducts,
}: WishlistProps) {
  const wishlist = useWishlist();
  const [shareToast, setShareToast] = useState(false);

  // Use controlled items, or wishlist context, or sample data for preview
  const displayItems =
    controlledItems ?? (wishlist.items.length > 0 ? wishlist.items : SAMPLE_ITEMS);

  function handleRemove(id: string) {
    wishlist.removeItem(id);
  }

  function handleMoveToCart(item: WishlistItem) {
    onMoveToCart?.(item);
    wishlist.removeItem(item.id);
  }

  async function handleShare() {
    try {
      const url = typeof window !== "undefined" ? window.location.href : "";
      await navigator.clipboard.writeText(url);
      setShareToast(true);
      setTimeout(() => setShareToast(false), 2000);
    } catch {
      // Clipboard unavailable
    }
  }

  if (displayItems.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-20 text-center">
        <Heart className="h-16 w-16 text-muted-foreground/30" />
        <div>
          <p className="text-lg font-medium">Your wishlist is empty</p>
          <p className="text-sm text-muted-foreground">
            Save items you love to find them later.
          </p>
        </div>
        <Button onClick={onDiscoverProducts}>Discover Products</Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h2 className="text-2xl font-bold tracking-tight">My Wishlist</h2>
          <Badge variant="secondary">{displayItems.length}</Badge>
        </div>
        <div className="relative">
          <Button variant="outline" size="sm" onClick={handleShare}>
            <Share2 className="mr-1.5 h-3.5 w-3.5" />
            Share Wishlist
          </Button>
          {shareToast && (
            <div className="absolute right-0 top-full z-10 mt-2 flex items-center gap-1.5 rounded-md border bg-background px-3 py-1.5 text-xs shadow-sm animate-in fade-in slide-in-from-top-1">
              <Link2 className="h-3 w-3 text-green-600" />
              Link copied!
            </div>
          )}
        </div>
      </div>

      {/* Responsive grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {displayItems.map((item) => (
          <WishlistCard
            key={item.id}
            item={item}
            onRemove={handleRemove}
            onAddToCart={onAddToCart}
            onMoveToCart={handleMoveToCart}
          />
        ))}
      </div>
    </div>
  );
}
