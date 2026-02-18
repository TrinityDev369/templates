import Link from "next/link";
import { ArrowRight, BarChart3, ShoppingBag, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b">
        <div className="container flex h-16 items-center justify-between">
          <span className="text-xl font-bold">SaaS Starter</span>
          <div className="flex items-center gap-4">
            <Link href="/shop">
              <Button variant="ghost">Shop</Button>
            </Link>
            <Link href="/dashboard">
              <Button>Dashboard</Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="flex flex-1 flex-col items-center justify-center px-4">
        <div className="mx-auto max-w-3xl text-center">
          <h1 className="mb-6 text-4xl font-bold tracking-tight sm:text-6xl">
            Build your SaaS
            <span className="text-primary"> faster</span>
          </h1>
          <p className="mb-8 text-lg text-muted-foreground">
            A complete Next.js starter with dashboard, storefront, cart, and
            checkout. Built with shadcn/ui, Tailwind CSS, and TypeScript.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link href="/dashboard">
              <Button size="lg" className="gap-2">
                Open Dashboard <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link href="/shop">
              <Button size="lg" variant="outline" className="gap-2">
                Visit Shop <ShoppingBag className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>

        <div className="mt-20 grid max-w-4xl gap-8 sm:grid-cols-3">
          <div className="rounded-lg border p-6 text-center">
            <BarChart3 className="mx-auto mb-4 h-10 w-10 text-primary" />
            <h3 className="mb-2 font-semibold">Analytics Dashboard</h3>
            <p className="text-sm text-muted-foreground">
              KPI cards, charts, and data tables for complete business
              visibility.
            </p>
          </div>
          <div className="rounded-lg border p-6 text-center">
            <ShoppingBag className="mx-auto mb-4 h-10 w-10 text-primary" />
            <h3 className="mb-2 font-semibold">Storefront</h3>
            <p className="text-sm text-muted-foreground">
              Product catalog, cart, and multi-step checkout out of the box.
            </p>
          </div>
          <div className="rounded-lg border p-6 text-center">
            <Zap className="mx-auto mb-4 h-10 w-10 text-primary" />
            <h3 className="mb-2 font-semibold">Ready to Extend</h3>
            <p className="text-sm text-muted-foreground">
              shadcn/ui components, Tailwind, TypeScript. Add auth, payments,
              and more.
            </p>
          </div>
        </div>
      </main>

      <footer className="border-t py-8 text-center text-sm text-muted-foreground">
        Built with Next.js, shadcn/ui, and Tailwind CSS.
      </footer>
    </div>
  );
}
