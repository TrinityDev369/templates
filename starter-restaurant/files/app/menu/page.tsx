"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { menuItems } from "@/lib/data";
import { DishCard } from "@/components/dish-card";

const categories = ["all", "starters", "mains", "desserts", "drinks"] as const;

export default function MenuPage() {
  const [activeCategory, setActiveCategory] = useState<string>("all");

  const filteredItems =
    activeCategory === "all"
      ? menuItems
      : menuItems.filter((item) => item.category === activeCategory);

  return (
    <section className="py-24 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Page header */}
        <div className="text-center">
          <span className="uppercase text-primary tracking-wider text-sm font-medium">
            Our Menu
          </span>
          <h1 className="font-serif text-3xl md:text-4xl mt-2">
            Explore Our Dishes
          </h1>
        </div>

        {/* Category filter tabs */}
        <div className="flex flex-wrap justify-center gap-2 mt-8 mb-12">
          {categories.map((category) => (
            <button
              key={category}
              type="button"
              onClick={() => setActiveCategory(category)}
              className={cn(
                "px-4 py-2 rounded-full text-sm font-medium transition-colors capitalize",
                activeCategory === category
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              )}
            >
              {category}
            </button>
          ))}
        </div>

        {/* Filtered count */}
        <p className="text-muted-foreground text-sm mb-4">
          Showing {filteredItems.length} dishes
        </p>

        {/* Dish grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredItems.map((item) => (
            <DishCard key={item.id} item={item} />
          ))}
        </div>
      </div>
    </section>
  );
}
