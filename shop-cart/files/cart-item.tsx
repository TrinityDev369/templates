"use client";

import { Minus, Plus, X, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { CartItem as CartItemType } from "./types";

interface CartItemProps {
  item: CartItemType;
  onUpdateQuantity: (id: string, qty: number) => void;
  onRemove: (id: string) => void;
}

export function CartItem({ item, onUpdateQuantity, onRemove }: CartItemProps) {
  const lineTotal = item.price * item.quantity;
  const fmt = (v: number) =>
    new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(v);

  return (
    <div className="flex gap-3 py-3">
      <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-md bg-gradient-to-br from-muted/60 to-muted">
        {item.image ? (
          <img src={item.image} alt={item.name} className="h-full w-full rounded-md object-cover" />
        ) : (
          <Package className="h-6 w-6 text-muted-foreground/40" />
        )}
      </div>

      <div className="flex flex-1 flex-col gap-1">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm font-medium leading-tight">{item.name}</p>
            {item.variant && (
              <p className="text-xs text-muted-foreground">{item.variant}</p>
            )}
            <p className="text-xs text-muted-foreground">{fmt(item.price)} each</p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 shrink-0"
            onClick={() => onRemove(item.id)}
            aria-label={`Remove ${item.name}`}
          >
            <X className="h-3.5 w-3.5" />
          </Button>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1 rounded-md border">
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}
              aria-label="Decrease quantity"
            >
              <Minus className="h-3 w-3" />
            </Button>
            <span className="w-8 text-center text-sm">{item.quantity}</span>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              disabled={item.maxQuantity ? item.quantity >= item.maxQuantity : false}
              onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
              aria-label="Increase quantity"
            >
              <Plus className="h-3 w-3" />
            </Button>
          </div>
          <p className="text-sm font-semibold">{fmt(lineTotal)}</p>
        </div>
      </div>
    </div>
  );
}
