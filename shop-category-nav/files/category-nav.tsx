"use client";

import * as React from "react";
import {
  ChevronRight,
  Menu,
  Home,
  Shirt,
  Laptop,
  Dumbbell,
  Sparkles,
  Sofa,
  BookOpen,
} from "lucide-react";
import { cn } from "@/lib/utils";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

import type { Category, BreadcrumbItem } from "./types";

// ---------------------------------------------------------------------------
// Placeholder data
// ---------------------------------------------------------------------------

export const PLACEHOLDER_CATEGORIES: Category[] = [
  {
    id: "cat-clothing",
    name: "Clothing",
    slug: "clothing",
    count: 45,
    icon: Shirt,
    children: [
      { id: "cat-men", name: "Men", slug: "men", count: 20 },
      { id: "cat-women", name: "Women", slug: "women", count: 18 },
      { id: "cat-kids", name: "Kids", slug: "kids", count: 7 },
    ],
  },
  {
    id: "cat-electronics",
    name: "Electronics",
    slug: "electronics",
    count: 32,
    icon: Laptop,
    children: [
      { id: "cat-phones", name: "Phones", slug: "phones", count: 12 },
      { id: "cat-laptops", name: "Laptops", slug: "laptops", count: 8 },
      { id: "cat-audio", name: "Audio", slug: "audio", count: 6 },
      {
        id: "cat-accessories",
        name: "Accessories",
        slug: "accessories",
        count: 6,
      },
    ],
  },
  {
    id: "cat-sports",
    name: "Sports",
    slug: "sports",
    count: 28,
    icon: Dumbbell,
    children: [
      { id: "cat-fitness", name: "Fitness", slug: "fitness", count: 10 },
      { id: "cat-outdoor", name: "Outdoor", slug: "outdoor", count: 9 },
      {
        id: "cat-team-sports",
        name: "Team Sports",
        slug: "team-sports",
        count: 9,
      },
    ],
  },
  {
    id: "cat-beauty",
    name: "Beauty",
    slug: "beauty",
    count: 15,
    icon: Sparkles,
  },
  {
    id: "cat-home-garden",
    name: "Home & Garden",
    slug: "home-garden",
    count: 22,
    icon: Sofa,
    children: [
      {
        id: "cat-furniture",
        name: "Furniture",
        slug: "furniture",
        count: 10,
      },
      { id: "cat-decor", name: "Decor", slug: "decor", count: 7 },
      { id: "cat-kitchen", name: "Kitchen", slug: "kitchen", count: 5 },
    ],
  },
  {
    id: "cat-books",
    name: "Books",
    slug: "books",
    count: 18,
    icon: BookOpen,
  },
];

// ---------------------------------------------------------------------------
// Breadcrumbs — lightweight custom implementation (no shadcn Breadcrumb dep)
// ---------------------------------------------------------------------------

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
  onNavigate?: (href: string) => void;
}

function Breadcrumbs({ items, onNavigate }: BreadcrumbsProps) {
  if (items.length === 0) return null;

  return (
    <nav aria-label="Breadcrumb" className="mb-3 px-2">
      <ol className="flex flex-wrap items-center gap-1 text-sm text-muted-foreground">
        {/* Home is always the first crumb */}
        <li className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => onNavigate?.("/")}
            className="inline-flex items-center gap-1 rounded-sm px-1 py-0.5 transition-colors hover:text-foreground"
          >
            <Home className="h-3.5 w-3.5" />
            <span className="sr-only">Home</span>
          </button>
        </li>

        {items.map((item, idx) => {
          const isLast = idx === items.length - 1;

          return (
            <li key={item.label} className="flex items-center gap-1">
              <ChevronRight className="h-3 w-3 shrink-0" />
              {isLast || !item.href ? (
                <span className="truncate font-medium text-foreground">
                  {item.label}
                </span>
              ) : (
                <button
                  type="button"
                  onClick={() => onNavigate?.(item.href!)}
                  className="truncate rounded-sm px-1 py-0.5 transition-colors hover:text-foreground"
                >
                  {item.label}
                </button>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

// ---------------------------------------------------------------------------
// CategoryTree — recursive accordion rendering
// ---------------------------------------------------------------------------

interface CategoryTreeProps {
  categories: Category[];
  activeSlug?: string;
  onCategorySelect?: (slug: string) => void;
  level?: number;
}

function CategoryTree({
  categories,
  activeSlug,
  onCategorySelect,
  level = 0,
}: CategoryTreeProps) {
  const hasAnyChildren = categories.some(
    (cat) => cat.children && cat.children.length > 0,
  );

  // Determine which accordion items should default-open (those containing the active slug)
  const defaultOpen = categories
    .filter((cat) => {
      if (cat.slug === activeSlug) return true;
      if (cat.children) {
        return containsSlug(cat.children, activeSlug);
      }
      return false;
    })
    .map((cat) => cat.slug);

  // If none have children at this level, render a flat list
  if (!hasAnyChildren) {
    return (
      <div className="space-y-0.5" style={{ paddingLeft: level > 0 ? 8 : 0 }}>
        {categories.map((cat) => (
          <LeafCategory
            key={cat.id}
            category={cat}
            isActive={cat.slug === activeSlug}
            onSelect={() => onCategorySelect?.(cat.slug)}
            level={level}
          />
        ))}
      </div>
    );
  }

  return (
    <Accordion
      type="multiple"
      defaultValue={defaultOpen}
      className="w-full"
    >
      {categories.map((cat) => {
        const hasChildren = cat.children && cat.children.length > 0;
        const isActive = cat.slug === activeSlug;

        if (!hasChildren) {
          return (
            <LeafCategory
              key={cat.id}
              category={cat}
              isActive={isActive}
              onSelect={() => onCategorySelect?.(cat.slug)}
              level={level}
            />
          );
        }

        const isChildActive = containsSlug(cat.children!, activeSlug);
        const Icon = cat.icon;

        return (
          <AccordionItem
            key={cat.id}
            value={cat.slug}
            className="border-b-0"
          >
            <AccordionTrigger
              className={cn(
                "rounded-md px-3 py-2 text-sm hover:bg-accent hover:no-underline [&[data-state=open]]:bg-transparent",
                (isActive || isChildActive) && "font-medium",
                isActive && "bg-accent",
              )}
              onClick={() => {
                onCategorySelect?.(cat.slug);
              }}
            >
              <span className="flex items-center gap-2">
                {Icon && <Icon className="h-4 w-4 shrink-0" />}
                <span className="truncate">{cat.name}</span>
                <Badge
                  variant="secondary"
                  className="ml-1 text-xs tabular-nums"
                >
                  {cat.count}
                </Badge>
              </span>
            </AccordionTrigger>

            <AccordionContent className="pb-1 pt-0">
              <div className="pl-4">
                <CategoryTree
                  categories={cat.children!}
                  activeSlug={activeSlug}
                  onCategorySelect={onCategorySelect}
                  level={level + 1}
                />
              </div>
            </AccordionContent>
          </AccordionItem>
        );
      })}
    </Accordion>
  );
}

// ---------------------------------------------------------------------------
// LeafCategory — a category with no children, rendered as a button
// ---------------------------------------------------------------------------

interface LeafCategoryProps {
  category: Category;
  isActive: boolean;
  onSelect: () => void;
  level: number;
}

function LeafCategory({ category, isActive, onSelect, level }: LeafCategoryProps) {
  const Icon = category.icon;

  return (
    <button
      type="button"
      onClick={onSelect}
      className={cn(
        "flex w-full items-center justify-between rounded-md px-3 py-1.5 text-sm transition-colors hover:bg-accent",
        isActive && "bg-accent font-medium",
      )}
    >
      <span className="flex items-center gap-2 truncate">
        {Icon && <Icon className="h-4 w-4 shrink-0" />}
        <span className="truncate">{category.name}</span>
      </span>
      <Badge variant="secondary" className="ml-2 shrink-0 text-xs tabular-nums">
        {category.count}
      </Badge>
    </button>
  );
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Recursively check whether a category tree contains a given slug. */
function containsSlug(
  categories: Category[],
  slug: string | undefined,
): boolean {
  if (!slug) return false;
  for (const cat of categories) {
    if (cat.slug === slug) return true;
    if (cat.children && containsSlug(cat.children, slug)) return true;
  }
  return false;
}

// ---------------------------------------------------------------------------
// Desktop layout
// ---------------------------------------------------------------------------

interface CategoryNavDesktopProps {
  categories: Category[];
  activeSlug?: string;
  breadcrumbs?: BreadcrumbItem[];
  onCategorySelect?: (slug: string) => void;
  onBreadcrumbNavigate?: (href: string) => void;
  className?: string;
}

function CategoryNavDesktop({
  categories,
  activeSlug,
  breadcrumbs,
  onCategorySelect,
  onBreadcrumbNavigate,
  className,
}: CategoryNavDesktopProps) {
  return (
    <aside className={cn("w-64 shrink-0 border-r", className)}>
      <ScrollArea className="h-full">
        <div className="p-3">
          {breadcrumbs && breadcrumbs.length > 0 && (
            <Breadcrumbs items={breadcrumbs} onNavigate={onBreadcrumbNavigate} />
          )}

          <h2 className="mb-2 px-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Categories
          </h2>

          <CategoryTree
            categories={categories}
            activeSlug={activeSlug}
            onCategorySelect={onCategorySelect}
          />
        </div>
      </ScrollArea>
    </aside>
  );
}

// ---------------------------------------------------------------------------
// Mobile layout
// ---------------------------------------------------------------------------

interface CategoryNavMobileProps {
  categories: Category[];
  activeSlug?: string;
  breadcrumbs?: BreadcrumbItem[];
  onCategorySelect?: (slug: string) => void;
  onBreadcrumbNavigate?: (href: string) => void;
  className?: string;
}

function CategoryNavMobile({
  categories,
  activeSlug,
  breadcrumbs,
  onCategorySelect,
  onBreadcrumbNavigate,
  className,
}: CategoryNavMobileProps) {
  const [open, setOpen] = React.useState(false);

  return (
    <div className={className}>
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <Button variant="outline" size="sm" className="gap-2">
            <Menu className="h-4 w-4" />
            Categories
          </Button>
        </SheetTrigger>

        <SheetContent side="left" className="w-72 p-0">
          <SheetHeader className="border-b px-4 py-3">
            <SheetTitle>Categories</SheetTitle>
          </SheetHeader>

          <ScrollArea className="h-[calc(100vh-4rem)]">
            <div className="p-3">
              {breadcrumbs && breadcrumbs.length > 0 && (
                <Breadcrumbs
                  items={breadcrumbs}
                  onNavigate={(href) => {
                    onBreadcrumbNavigate?.(href);
                    setOpen(false);
                  }}
                />
              )}

              <CategoryTree
                categories={categories}
                activeSlug={activeSlug}
                onCategorySelect={(slug) => {
                  onCategorySelect?.(slug);
                  setOpen(false);
                }}
              />
            </div>
          </ScrollArea>
        </SheetContent>
      </Sheet>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main exported component
// ---------------------------------------------------------------------------

interface CategoryNavProps {
  categories: Category[];
  activeSlug?: string;
  breadcrumbs?: BreadcrumbItem[];
  onCategorySelect?: (slug: string) => void;
  onBreadcrumbNavigate?: (href: string) => void;
  className?: string;
}

export function CategoryNav({
  categories,
  activeSlug,
  breadcrumbs,
  onCategorySelect,
  onBreadcrumbNavigate,
  className,
}: CategoryNavProps) {
  return (
    <>
      {/* Desktop: visible at md breakpoint and above */}
      <CategoryNavDesktop
        categories={categories}
        activeSlug={activeSlug}
        breadcrumbs={breadcrumbs}
        onCategorySelect={onCategorySelect}
        onBreadcrumbNavigate={onBreadcrumbNavigate}
        className={cn("hidden md:block", className)}
      />

      {/* Mobile: visible below md breakpoint */}
      <CategoryNavMobile
        categories={categories}
        activeSlug={activeSlug}
        breadcrumbs={breadcrumbs}
        onCategorySelect={onCategorySelect}
        onBreadcrumbNavigate={onBreadcrumbNavigate}
        className="md:hidden"
      />
    </>
  );
}
