"use client";

import { Heart, MoreHorizontal, ShoppingBag, ShoppingCart, Trash2 } from "lucide-react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { WishlistItem } from "./types";

interface WishlistCardProps {
  item: WishlistItem;
  onRemove: (id: string) => void;
  onAddToCart?: (item: WishlistItem) => void;
  onMoveToCart?: (item: WishlistItem) => void;
}

export function WishlistCard({ item, onRemove, onAddToCart, onMoveToCart }: WishlistCardProps) {
  const fmt = (v: number) =>
    new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(v);

  const addedDate = new Date(item.addedAt).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  function handleRemove() {
    if (window.confirm(`Remove "${item.name}" from your wishlist?`)) {
      onRemove(item.id);
    }
  }

  return (
    <Card className="group relative overflow-hidden transition-transform duration-200 hover:scale-[1.02]">
      {/* Image placeholder */}
      <div className="relative aspect-square bg-gradient-to-br from-muted/60 to-muted">
        <div className="flex h-full w-full items-center justify-center">
          {item.image ? (
            <img
              src={item.image}
              alt={item.name}
              className="h-full w-full object-cover"
            />
          ) : (
            <ShoppingBag className="h-12 w-12 text-muted-foreground/30" />
          )}
        </div>

        {/* Heart button (filled) */}
        <Button
          variant="ghost"
          size="icon"
          className="absolute right-2 top-2 h-8 w-8 rounded-full bg-background/80 backdrop-blur-sm hover:bg-background"
          onClick={handleRemove}
          aria-label={`Remove ${item.name} from wishlist`}
        >
          <Heart className="h-4 w-4 fill-red-500 text-red-500" />
        </Button>
      </div>

      <CardContent className="p-4">
        <h3 className="truncate text-sm font-medium">{item.name}</h3>
        <p className="mt-0.5 text-base font-bold">{fmt(item.price)}</p>
        <p className="mt-1 text-xs text-muted-foreground">Added on {addedDate}</p>
      </CardContent>

      <CardFooter className="flex items-center gap-2 px-4 pb-4 pt-0">
        <Button
          size="sm"
          className="flex-1"
          onClick={() => onAddToCart?.(item)}
        >
          <ShoppingCart className="mr-1.5 h-3.5 w-3.5" />
          Add to Cart
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="icon" className="h-8 w-8 shrink-0">
              <MoreHorizontal className="h-4 w-4" />
              <span className="sr-only">More options</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => onMoveToCart?.(item)}>
              <ShoppingCart className="mr-2 h-4 w-4" />
              Move to Cart
            </DropdownMenuItem>
            <DropdownMenuItem
              className="text-destructive focus:text-destructive"
              onClick={() => onRemove(item.id)}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Remove
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </CardFooter>
    </Card>
  );
}
