"use client";

import Link from "next/link";
import { Minus, Plus, ShoppingBag, Trash2 } from "lucide-react";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useCart } from "@/lib/hooks/use-cart";
import { formatCurrency } from "@/lib/utils";

const PLACEHOLDER_COLORS = [
  "bg-blue-200 dark:bg-blue-800",
  "bg-green-200 dark:bg-green-800",
  "bg-purple-200 dark:bg-purple-800",
  "bg-orange-200 dark:bg-orange-800",
  "bg-pink-200 dark:bg-pink-800",
];

export default function CartPage() {
  const { items, removeItem, updateQuantity, total, clearCart } = useCart();

  const shipping = total >= 50 ? 0 : 5.99;
  const tax = total * 0.08;
  const orderTotal = total + shipping + tax;

  if (items.length === 0) {
    return (
      <div className="container flex flex-col items-center justify-center py-24 text-center">
        <ShoppingBag className="mb-4 h-16 w-16 text-muted-foreground/50" />
        <h1 className="mb-2 text-2xl font-bold">Your cart is empty</h1>
        <p className="mb-6 text-muted-foreground">
          Looks like you have not added anything to your cart yet.
        </p>
        <Link href="/shop">
          <Button size="lg">Continue Shopping</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="container py-8">
      <h1 className="mb-8 text-2xl font-bold">Shopping Cart</h1>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Cart Items */}
        <div className="space-y-4 lg:col-span-2">
          {items.map((item, index) => (
            <Card key={item.id}>
              <CardContent className="flex gap-4 p-4">
                {/* Image placeholder */}
                <div
                  className={`h-20 w-20 shrink-0 rounded-md ${
                    PLACEHOLDER_COLORS[index % PLACEHOLDER_COLORS.length]
                  } flex items-center justify-center`}
                >
                  <span className="text-lg font-bold text-white/30">
                    {item.name.charAt(0)}
                  </span>
                </div>

                {/* Details */}
                <div className="flex flex-1 flex-col justify-between">
                  <div>
                    <h3 className="font-semibold">{item.name}</h3>
                    {item.variant && (
                      <p className="text-sm text-muted-foreground">
                        {item.variant}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center justify-between">
                    {/* Quantity controls */}
                    <div className="flex items-center rounded-md border">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 rounded-r-none"
                        onClick={() =>
                          updateQuantity(item.id, item.quantity - 1)
                        }
                      >
                        <Minus className="h-3 w-3" />
                      </Button>
                      <span className="flex h-8 w-10 items-center justify-center text-sm">
                        {item.quantity}
                      </span>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 rounded-l-none"
                        onClick={() =>
                          updateQuantity(item.id, item.quantity + 1)
                        }
                      >
                        <Plus className="h-3 w-3" />
                      </Button>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="font-semibold">
                        {formatCurrency(item.price * item.quantity)}
                      </span>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive"
                        onClick={() => removeItem(item.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}

          <div className="flex justify-between">
            <Link href="/shop">
              <Button variant="outline">Continue Shopping</Button>
            </Link>
            <Button variant="ghost" onClick={clearCart}>
              Clear Cart
            </Button>
          </div>
        </div>

        {/* Order Summary */}
        <div>
          <Card className="sticky top-24">
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Subtotal</span>
                <span>{formatCurrency(total)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Shipping</span>
                <span>
                  {shipping === 0 ? (
                    <span className="text-green-600">Free</span>
                  ) : (
                    formatCurrency(shipping)
                  )}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Tax</span>
                <span>{formatCurrency(tax)}</span>
              </div>
              <Separator />
              <div className="flex justify-between font-semibold">
                <span>Total</span>
                <span>{formatCurrency(orderTotal)}</span>
              </div>
            </CardContent>
            <CardFooter>
              <Link href="/shop/checkout" className="w-full">
                <Button className="w-full" size="lg">
                  Proceed to Checkout
                </Button>
              </Link>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
}
