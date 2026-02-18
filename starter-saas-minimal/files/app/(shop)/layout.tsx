"use client";

import Link from "next/link";
import { ShoppingBag, ShoppingCart, Search, User, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useCart } from "@/lib/hooks/use-cart";

const categories = [
  "Electronics",
  "Clothing",
  "Home & Garden",
  "Sports",
  "Accessories",
  "Books",
];

const footerLinks = {
  Shop: ["All Products", "New Arrivals", "Best Sellers", "Sale"],
  Company: ["About", "Careers", "Press", "Blog"],
  Support: ["Help Center", "Returns", "Shipping", "Contact"],
  Legal: ["Privacy", "Terms", "Cookies"],
};

export default function ShopLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { itemCount } = useCart();

  return (
    <div className="flex min-h-screen flex-col">
      {/* Top Navigation */}
      <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center gap-4">
          {/* Logo */}
          <Link href="/shop" className="flex items-center gap-2">
            <ShoppingBag className="h-6 w-6 text-primary" />
            <span className="text-lg font-bold">Store</span>
          </Link>

          {/* Categories */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="hidden gap-1 sm:flex">
                Categories <ChevronDown className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              {categories.map((cat) => (
                <DropdownMenuItem key={cat}>{cat}</DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Search */}
          <div className="relative ml-auto hidden flex-1 max-w-sm md:block">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search products..." className="pl-8" />
          </div>

          {/* Right actions */}
          <div className="ml-auto flex items-center gap-2 md:ml-0">
            <Link href="/shop/cart">
              <Button variant="ghost" size="icon" className="relative">
                <ShoppingCart className="h-5 w-5" />
                {itemCount > 0 && (
                  <Badge className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full p-0 text-[10px]">
                    {itemCount}
                  </Badge>
                )}
              </Button>
            </Link>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <User className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>Sign In</DropdownMenuItem>
                <DropdownMenuItem>Create Account</DropdownMenuItem>
                <DropdownMenuItem>
                  <Link href="/dashboard">Dashboard</Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="flex-1">{children}</main>

      {/* Footer */}
      <footer className="border-t bg-muted/50">
        <div className="container py-12">
          <div className="grid gap-8 sm:grid-cols-2 md:grid-cols-4">
            {Object.entries(footerLinks).map(([title, links]) => (
              <div key={title}>
                <h4 className="mb-3 text-sm font-semibold">{title}</h4>
                <ul className="space-y-2">
                  {links.map((link) => (
                    <li key={link}>
                      <span className="cursor-pointer text-sm text-muted-foreground hover:text-foreground">
                        {link}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div className="mt-8 border-t pt-8 text-center text-sm text-muted-foreground">
            Built with Next.js, shadcn/ui, and Tailwind CSS.
          </div>
        </div>
      </footer>
    </div>
  );
}
